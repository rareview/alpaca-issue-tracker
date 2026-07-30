<?php
/**
 * REST API endpoints for the Agentic (AI Issue Resolver) feature.
 *
 * @package AlpacaIssueTracker
 */

use AlpacaIssueTracker\Agentic\Agentic;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Post meta key that stores the linked GitHub issue URL.
 */
const ALPAISTR_AGENTIC_GITHUB_ISSUE_URL_META = 'alpaca_github_issue_url';

add_action( 'rest_api_init', 'alpaistr_register_agentic_endpoints' );

/**
 * Register the Agentic REST routes.
 */
function alpaistr_register_agentic_endpoints(): void {
	register_rest_route(
		'alpaca/v1',
		'/agentic/draft',
		[
			'methods'             => WP_REST_Server::CREATABLE, // Method: post.
			'callback'            => 'alpaistr_agentic_draft_callback',
			'permission_callback' => 'alpaistr_agentic_can_use_permission_check',
			'args'                => [
				'issue_id' => [
					'required'          => true,
					'type'              => 'integer',
					'minimum'           => 1,
					'sanitize_callback' => 'absint',
				],
			],
		]
	);

	register_rest_route(
		'alpaca/v1',
		'/agentic/create',
		[
			'methods'             => WP_REST_Server::CREATABLE, // Method: post.
			'callback'            => 'alpaistr_agentic_create_callback',
			'permission_callback' => 'alpaistr_agentic_can_use_permission_check',
			'args'                => [
				'issue_id' => [
					'required'          => true,
					'type'              => 'integer',
					'minimum'           => 1,
					'sanitize_callback' => 'absint',
				],
				'title'    => [
					'required'          => true,
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_text_field',
				],
				'body'     => [
					'required'          => true,
					'type'              => 'string',
					'sanitize_callback' => 'wp_kses_post',
				],
				'labels'   => [
					'required' => false,
					'type'     => 'array',
					'default'  => [],
					'items'    => [ 'type' => 'string' ],
				],
			],
		]
	);

	register_rest_route(
		'alpaca/v1',
		'/agentic/test-github',
		[
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'alpaistr_agentic_touch_github_callback',
			'permission_callback' => 'alpaistr_agentic_manage_options_permission_check',
		]
	);

	register_rest_route(
		'alpaca/v1',
		'/agentic/workflow-status',
		[
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'alpaistr_agentic_workflow_status_callback',
			'permission_callback' => 'alpaistr_agentic_manage_options_permission_check',
		]
	);

	register_rest_route(
		'alpaca/v1',
		'/agentic/install-workflow',
		[
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'alpaistr_agentic_install_workflow_callback',
			'permission_callback' => 'alpaistr_agentic_manage_options_permission_check',
		]
	);

	register_rest_route(
		'alpaca/v1',
		'/agentic/settings',
		[
			[
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => [ Agentic::class, 'get_wizard_settings' ],
				// Engineers can view settings status (read-only); only admins can save (see below).
				'permission_callback' => 'alpaistr_agentic_can_use_permission_check',
			],
			[
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => 'alpaistr_agentic_save_settings_callback',
				'permission_callback' => 'alpaistr_agentic_manage_options_permission_check',
			],
		]
	);
}

/**
 * Only allow logged-in administrators. Used for anything that changes settings
 * or exposes/rotates credentials (save settings, test connection, install workflow).
 */
function alpaistr_agentic_manage_options_permission_check(): bool|WP_Error {
	if ( ! is_user_logged_in() ) {
		return new WP_Error( 'rest_forbidden', esc_html__( 'Authentication required.', 'alpaca-issue-tracker' ), [ 'status' => 401 ] );
	}
	if ( ! current_user_can( 'manage_options' ) ) {
		return new WP_Error( 'rest_forbidden', esc_html__( 'Insufficient permissions.', 'alpaca-issue-tracker' ), [ 'status' => 403 ] );
	}
	return true;
}

/**
 * Allow logged-in administrators and users on the engineers allowlist to use the
 * AI Issue Fixer (draft/create a GitHub issue, view setup status).
 */
function alpaistr_agentic_can_use_permission_check(): bool|WP_Error {
	if ( ! is_user_logged_in() ) {
		return new WP_Error( 'rest_forbidden', esc_html__( 'Authentication required.', 'alpaca-issue-tracker' ), [ 'status' => 401 ] );
	}
	if ( ! Agentic::current_user_can_use() ) {
		return new WP_Error( 'rest_forbidden', esc_html__( 'The AI Issue Fixer is only available to administrators and users granted engineer access.', 'alpaca-issue-tracker' ), [ 'status' => 403 ] );
	}
	return true;
}

/**
 * Save Agentic settings from the React wizard.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response|WP_Error
 */
function alpaistr_agentic_save_settings_callback( WP_REST_Request $request ): WP_REST_Response|WP_Error {
	$raw = $request->get_json_params(); // Switch to array, to be readable by php.
	if ( ! is_array( $raw ) ) {
		$raw = $request->get_params(); // Fallback to array, also to be readable by php.
	}
	if ( ! is_array( $raw ) ) {
		return new WP_Error( 'invalid_payload', esc_html__( 'Invalid settings payload.', 'alpaca-issue-tracker' ), [ 'status' => 400 ] );
	}

	$settings = new Agentic();
	$clean    = $settings->sanitize_settings( $raw ); // Security.
	update_option( Agentic::OPTION_KEY, $clean ); // Save the settings.

	return rest_ensure_response( Agentic::get_wizard_settings() ); // Return the settings to the client.
}

/**
 * Use AI to rewrite an Alpaca issue so it meets the GitHub agent-ready issue template requirements.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response|WP_Error
 */
function alpaistr_agentic_draft_callback( WP_REST_Request $request ): WP_REST_Response|WP_Error {
	$issue_id = (int) $request->get_param( 'issue_id' );
	$post     = get_post( $issue_id );

	if ( ! $post || 'alpaca_issue' !== $post->post_type ) {
		return new WP_Error( 'not_found', esc_html__( 'Alpaca issue not found.', 'alpaca-issue-tracker' ), [ 'status' => 404 ] );
	}

	$issue_data = alpaistr_agentic_collect_issue_data( $post );
	$settings   = alpaistr_agentic_get_settings();

	// Although AI "magic" button is hidden if the settings are not fully completed, the REST endpoint is still callable (browser console, Postman, another script) by anyone with manage_options.
	if ( empty( $settings['ai_api_key'] ) ) {
		return new WP_Error( 'not_configured', esc_html__( 'AI API key is not configured. Visit Project Board → AI Issue Resolver to set it up.', 'alpaca-issue-tracker' ), [ 'status' => 400 ] );
	}
	if ( empty( $settings['github_repo'] ) ) {
		return new WP_Error( 'not_configured', esc_html__( 'GitHub repository is not configured.', 'alpaca-issue-tracker' ), [ 'status' => 400 ] );
	}

	$draft = alpaistr_agentic_call_ai( $issue_data, $settings );

	if ( is_wp_error( $draft ) ) {
		return $draft; // Return the error to the client.
	}

	return rest_ensure_response( $draft );
}

/**
 * Collect all useful fields from an Alpaca issue post.
 *
 * @param WP_Post $post The Alpaca issue post.
 * @return array Structured issue data for the AI prompt.
 */
function alpaistr_agentic_collect_issue_data( WP_Post $post ): array {
	$meta      = get_post_meta( $post->ID );
	$flat_meta = [];
	foreach ( $meta as $key => $values ) {
		if ( str_starts_with( $key, '_' ) ) {
			continue;
		}
		// Next line format data as associative array.
		// Also, maybe_unserialize checks if the value is a PHP-serialized string (how WP stores arrays/objects in the DB), and turns it back into a real array/object.
		// Otherwise, if it's a normal string/number, it leaves it alone.
		$flat_meta[ $key ] = maybe_unserialize( $values[0] );
	}

	// Labels.
	$label_terms = wp_get_post_terms( $post->ID, 'alpaca_label', [ 'fields' => 'names' ] );
	$labels      = is_wp_error( $label_terms ) ? [] : $label_terms;

	// Browser / OS.
	$browser_terms = wp_get_post_terms( $post->ID, 'alpaca_browser', [ 'fields' => 'names' ] );
	$browser       = is_wp_error( $browser_terms ) ? [] : $browser_terms;

	// PHP template used when the issue was reported (e.g. single.php).
	$template_terms = wp_get_post_terms( $post->ID, 'alpaca_phptemplate', [ 'fields' => 'names' ] );
	$templates      = is_wp_error( $template_terms ) ? [] : $template_terms;

	// Page/request type tags (front_page, singular, archive, etc.).
	$type_terms = wp_get_post_terms( $post->ID, 'alpaca_type', [ 'fields' => 'names' ] );
	$page_types = is_wp_error( $type_terms ) ? [] : $type_terms;

	// Subissues (checklist items).
	$subissues_raw = get_posts(
		[
			'post_type'      => 'alpaca_issue',
			'post_parent'    => $post->ID,
			'post_status'    => 'publish',
			'posts_per_page' => 50,
			'orderby'        => 'menu_order',
			'order'          => 'ASC',
		]
	);
	$subissues     = array_map( fn( $s ) => $s->post_title, $subissues_raw );

	// Recent comments (activity thread).
	$comments = get_comments(
		[
			'post_id' => $post->ID,
			'type'    => 'issuecomment',
			'number'  => 10,
			'order'   => 'ASC',
			'status'  => 'approve',
		]
	);
	$comment_texts = array_map(
		fn( $c ) => wp_strip_all_tags( $c->comment_content ),
		$comments
	);

	// Screenshot URLs live on comment meta (uploaded after submit), not on the issue itself.
	$screenshot_urls = [];
	foreach ( $comments as $comment ) {
		$attachments = get_comment_meta( (int) $comment->comment_ID, 'alpacaCommentAttachments', true );
		if ( ! is_array( $attachments ) ) {
			continue;
		}
		foreach ( $attachments as $url ) {
			if ( is_string( $url ) && '' !== $url ) {
				$screenshot_urls[] = esc_url_raw( $url );
			}
		}
	}
	$screenshot_urls = array_values( array_unique( $screenshot_urls ) );

	// JS errors (stored as a JSON string).
	$errors_raw = isset( $flat_meta['alpaca_errors'] ) ? json_decode( $flat_meta['alpaca_errors'], true ) : [];
	$errors     = is_array( $errors_raw ) ? array_slice( $errors_raw, 0, 10 ) : [];

	// Headers / queried object — keep small so the AI prompt stays readable.
	$headers = is_array( $flat_meta['alpaca_headers'] ?? null ) ? $flat_meta['alpaca_headers'] : [];
	$headers = array_slice( $headers, 0, 15, true );

	$queried_object = is_array( $flat_meta['alpaca_queried_object'] ?? null ) ? $flat_meta['alpaca_queried_object'] : [];
	// Drop heavy keys that are rarely useful for drafting a fix.
	unset( $queried_object['post_content'], $queried_object['guid'] );

	// Site environment is gathered live at draft time (AI feature only — not stored on every report).
	$wp_version  = (string) get_bloginfo( 'version' );
	$php_version = (string) PHP_VERSION;
	$theme       = function_exists( 'alpaistr_get_environment_theme_snapshot' ) ? alpaistr_get_environment_theme_snapshot() : [];
	$plugins     = function_exists( 'alpaistr_get_environment_plugins_snapshot' ) ? alpaistr_get_environment_plugins_snapshot() : [];
	$mu_plugins  = function_exists( 'alpaistr_get_environment_mu_plugins_snapshot' ) ? alpaistr_get_environment_mu_plugins_snapshot() : [];

	return [
		'id'              => $post->ID,
		'title'           => $post->post_title,
		'content'         => wp_strip_all_tags( $post->post_content ),
		'url'             => $flat_meta['alpaca_url'] ?? '',
		'labels'          => $labels,
		'browser'         => implode( ', ', $browser ),
		'screen'          => ( $flat_meta['alpaca_screenwidth'] ?? '' ) . 'x' . ( $flat_meta['alpaca_screenheight'] ?? '' ),
		'template'        => implode( ', ', $templates ),
		'page_types'      => $page_types,
		'subissues'       => $subissues,
		'comments'        => $comment_texts,
		'errors'          => $errors,
		'headers'         => $headers,
		'queried_object'  => $queried_object,
		'screenshot_urls' => $screenshot_urls,
		'wp_version'      => $wp_version,
		'php_version'     => $php_version,
		'theme'           => $theme,
		'plugins'         => $plugins,
		'mu_plugins'      => $mu_plugins,
	];
}

/**
 * Call the configured AI provider and return a structured draft.
 *
 * @param array $issue_data Structured Alpaca issue data.
 * @param array $settings   Plugin settings.
 * @return array|WP_Error Draft array or error.
 */
function alpaistr_agentic_call_ai( array $issue_data, array $settings ): array|WP_Error {
	// Incomplete: project_context is appended to the system prompt when set; no admin UI to edit it yet.
	$system_prompt = alpaistr_agentic_build_system_prompt( $settings['project_context'] ?? '' );
	$user_message  = alpaistr_agentic_build_user_message( $issue_data );

	if ( 'openai' === $settings['ai_provider'] ) {
		return alpaistr_agentic_call_openai( $system_prompt, $user_message, $settings['ai_api_key'] );
	}

	return alpaistr_agentic_call_claude( $system_prompt, $user_message, $settings['ai_api_key'] );
}

/**
 * Build the system prompt that instructs the AI how to format the output.
 *
 * @param string $extra_context Optional project-specific context (from settings; incomplete — no admin UI yet).
 * @return string System prompt text.
 */
function alpaistr_agentic_build_system_prompt( string $extra_context = '' ): string {
	$path = ALPAISTR_PLUGIN_DIR . 'includes/agentic/draft-agent-ready-issue.md';
	// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- Local plugin file.
	$prompt = is_readable( $path ) ? (string) file_get_contents( $path ) : '';

	if ( ! empty( $extra_context ) ) {
		$prompt .= "\n\nAdditional project context:\n" . $extra_context;
	}

	return $prompt;
}

/**
 * Format a plugin/mu-plugin snapshot row as "Name version".
 *
 * @param mixed $item Plugin snapshot row.
 * @return string
 */
function alpaistr_agentic_format_plugin_line( $item ): string {
	if ( ! is_array( $item ) ) {
		return '';
	}

	$name    = (string) ( $item['name'] ?? '' );
	$version = (string) ( $item['version'] ?? '' );

	if ( '' === $name ) {
		return '';
	}

	return '' !== $version ? $name . ' ' . $version : $name;
}

/**
 * Build the user message containing the Alpaca issue data.
 *
 * @param array $issue_data Structured issue data from collect_issue_data().
 * @return string Formatted user message.
 */
function alpaistr_agentic_build_user_message( array $issue_data ): string {
	$lines = [
		'Alpaca Issue #' . $issue_data['id'],
		'Title: ' . $issue_data['title'],
	];

	if ( ! empty( $issue_data['labels'] ) ) {
		$lines[] = 'Alpaca labels: ' . implode( ', ', $issue_data['labels'] );
	}

	$lines[] = '';
	$lines[] = 'Description:';
	$lines[] = ! empty( $issue_data['content'] ) ? $issue_data['content'] : '(no description provided)';

	if ( ! empty( $issue_data['subissues'] ) ) {
		$lines[] = '';
		$lines[] = 'Checklist items:';
		foreach ( $issue_data['subissues'] as $item ) {
			$lines[] = '- ' . $item;
		}
	}

	if ( ! empty( $issue_data['comments'] ) ) {
		$lines[] = '';
		$lines[] = 'Discussion thread:';
		foreach ( $issue_data['comments'] as $comment ) {
			$lines[] = '> ' . $comment;
		}
	}

	// --- Captured Context -------------------------------------------------
	// Everything below is meant to be copied into the GitHub issue Technical Notes
	// so the coding agent has reproduction / environment details.
	$lines[] = '';
	$lines[] = '## Captured Context';
	$lines[] = '(Use this block in Technical Notes of the GitHub issue draft.)';
	$lines[] = '(URL / browser / errors / headers come from the Alpaca report; WP/PHP/theme/plugins are the current site state at draft time.)';

	if ( ! empty( $issue_data['url'] ) ) {
		$lines[] = 'Reported on URL: ' . $issue_data['url'];
	}
	if ( ! empty( $issue_data['browser'] ) ) {
		$lines[] = 'Browser / OS: ' . $issue_data['browser'];
	}
	if ( ! empty( $issue_data['screen'] ) && 'x' !== $issue_data['screen'] ) {
		$lines[] = 'Screen: ' . $issue_data['screen'];
	}
	if ( ! empty( $issue_data['template'] ) ) {
		$lines[] = 'PHP template: ' . $issue_data['template'];
	}
	if ( ! empty( $issue_data['page_types'] ) ) {
		$lines[] = 'Page types: ' . implode( ', ', $issue_data['page_types'] );
	}
	if ( ! empty( $issue_data['wp_version'] ) ) {
		$lines[] = 'WordPress version: ' . $issue_data['wp_version'];
	}
	if ( ! empty( $issue_data['php_version'] ) ) {
		$lines[] = 'PHP version: ' . $issue_data['php_version'];
	}

	// Active theme (+ parent theme when this is a child theme).
	$theme = is_array( $issue_data['theme'] ?? null ) ? $issue_data['theme'] : [];
	if ( ! empty( $theme['name'] ) ) {
		$theme_line = $theme['name'];
		if ( ! empty( $theme['version'] ) ) {
			$theme_line .= ' ' . $theme['version'];
		}
		if ( ! empty( $theme['stylesheet'] ) ) {
			$theme_line .= ' (' . $theme['stylesheet'] . ')';
		}
		$lines[] = 'Active theme: ' . $theme_line;
		if ( ! empty( $theme['parent'] ) ) {
			$lines[] = 'Parent theme: ' . $theme['parent'];
		}
	}

	// Third-party / site plugins — important for the agent to know what else is running.
	if ( ! empty( $issue_data['plugins'] ) && is_array( $issue_data['plugins'] ) ) {
		$lines[] = '';
		$lines[] = 'Active plugins:';
		foreach ( $issue_data['plugins'] as $plugin ) {
			$line = alpaistr_agentic_format_plugin_line( $plugin );
			if ( '' !== $line ) {
				$lines[] = '- ' . $line;
			}
		}
	}

	if ( ! empty( $issue_data['mu_plugins'] ) && is_array( $issue_data['mu_plugins'] ) ) {
		$lines[] = '';
		$lines[] = 'Must-use plugins:';
		foreach ( $issue_data['mu_plugins'] as $plugin ) {
			$line = alpaistr_agentic_format_plugin_line( $plugin );
			if ( '' !== $line ) {
				$lines[] = '- ' . $line;
			}
		}
	}

	if ( ! empty( $issue_data['errors'] ) ) {
		$lines[] = '';
		$lines[] = 'JavaScript errors captured:';
		foreach ( $issue_data['errors'] as $err ) {
			if ( is_array( $err ) ) {
				$lines[] = '- ' . ( $err['message'] ?? '' ) . ' (' . ( $err['filename'] ?? '' ) . ':' . ( $err['lineno'] ?? '' ) . ')';
				if ( ! empty( $err['stack'] ) ) {
					// Keep stacks short so the prompt does not explode.
					$stack   = (string) $err['stack'];
					$lines[] = '  Stack: ' . ( strlen( $stack ) > 500 ? substr( $stack, 0, 500 ) . '…' : $stack );
				}
			}
		}
	}

	if ( ! empty( $issue_data['headers'] ) && is_array( $issue_data['headers'] ) ) {
		$lines[] = '';
		$lines[] = 'Request headers (subset):';
		foreach ( $issue_data['headers'] as $header_name => $header_value ) {
			if ( is_scalar( $header_value ) ) {
				$lines[] = '- ' . $header_name . ': ' . $header_value;
			}
		}
	}

	if ( ! empty( $issue_data['queried_object'] ) && is_array( $issue_data['queried_object'] ) ) {
		$lines[] = '';
		$lines[] = 'Queried object (summary):';
		// Only show a few high-signal fields instead of dumping the whole object.
		foreach ( [ 'ID', 'post_type', 'post_title', 'post_name', 'taxonomy', 'slug', 'name' ] as $key ) {
			if ( isset( $issue_data['queried_object'][ $key ] ) && is_scalar( $issue_data['queried_object'][ $key ] ) ) {
				$lines[] = '- ' . $key . ': ' . $issue_data['queried_object'][ $key ];
			}
		}
	}

	if ( ! empty( $issue_data['screenshot_urls'] ) ) {
		$lines[] = '';
		$lines[] = 'Screenshot(s) available on the Alpaca issue:';
		foreach ( $issue_data['screenshot_urls'] as $url ) {
			$lines[] = '- ' . $url;
		}
	} else {
		$lines[] = '';
		$lines[] = 'Screenshot: none attached';
	}

	return implode( "\n", $lines );
}

/**
 * Call the Anthropic Claude API.
 *
 * @param string $system_prompt System instructions for the AI.
 * @param string $user_message  User message containing issue data.
 * @param string $api_key       Anthropic API key.
 * @return array|WP_Error Parsed draft or error.
 */
function alpaistr_agentic_call_claude( string $system_prompt, string $user_message, string $api_key ): array|WP_Error {
	$response = wp_remote_post(
		'https://api.anthropic.com/v1/messages',
		[
			'timeout' => 60,
			'headers' => [
				'x-api-key'         => $api_key,
				'anthropic-version' => '2023-06-01',
				'content-type'      => 'application/json',
			],
			'body'    => wp_json_encode(
				[
					'model'      => 'claude-opus-4-5',
					'max_tokens' => 3000,
					'system'     => $system_prompt,
					'messages'   => [
						[
							'role'    => 'user',
							'content' => $user_message,
						],
					],
				]
			),
		]
	);

	return alpaistr_agentic_parse_ai_response( $response, 'claude' );
}

/**
 * Call the OpenAI Chat Completions API.
 *
 * @param string $system_prompt System instructions for the AI.
 * @param string $user_message  User message containing issue data.
 * @param string $api_key       OpenAI API key.
 * @return array|WP_Error Parsed draft or error.
 */
function alpaistr_agentic_call_openai( string $system_prompt, string $user_message, string $api_key ): array|WP_Error {
	$response = wp_remote_post(
		'https://api.openai.com/v1/chat/completions',
		[
			'timeout' => 60,
			'headers' => [
				'Authorization' => 'Bearer ' . $api_key,
				'content-type'  => 'application/json',
			],
			'body'    => wp_json_encode(
				[
					'model'           => 'gpt-4o',
					'max_tokens'      => 3000,
					'response_format' => [ 'type' => 'json_object' ],
					'messages'        => [
						[
							'role'    => 'system',
							'content' => $system_prompt,
						],
						[
							'role'    => 'user',
							'content' => $user_message,
						],
					],
				]
			),
		]
	);

	return alpaistr_agentic_parse_ai_response( $response, 'openai' );
}

/**
 * Parse the raw HTTP response from an AI provider into a draft array.
 *
 * @param array|WP_Error $response The wp_remote_post response.
 * @param string         $provider 'claude' or 'openai'.
 * @return array|WP_Error Parsed draft or error.
 */
function alpaistr_agentic_parse_ai_response( array|WP_Error $response, string $provider ): array|WP_Error {
	if ( is_wp_error( $response ) ) {
		return new WP_Error(
			'ai_request_failed',
			/* translators: %s: error message */
			sprintf( esc_html__( 'AI request failed: %s', 'alpaca-issue-tracker' ), $response->get_error_message() ),
			[ 'status' => 502 ]
		);
	}

	$code = wp_remote_retrieve_response_code( $response );
	$raw  = wp_remote_retrieve_body( $response );

	if ( $code >= 400 ) {
		$error_body = json_decode( $raw, true );
		$message    = $error_body['error']['message'] ?? $error_body['error'] ?? esc_html__( 'Unknown AI error.', 'alpaca-issue-tracker' );
		return new WP_Error( 'ai_api_error', (string) $message, [ 'status' => 502 ] );
	}

	$data = json_decode( $raw, true );

	if ( 'claude' === $provider ) {
		$text = $data['content'][0]['text'] ?? '';
	} else {
		$text = $data['choices'][0]['message']['content'] ?? '';
	}

	// Strip markdown code fences if the AI ignored instructions.
	$text = preg_replace( '/^```(?:json)?\s*/m', '', $text );
	$text = preg_replace( '/\s*```$/m', '', $text );
	$text = trim( $text );

	$draft = json_decode( $text, true );

	if ( ! is_array( $draft ) || empty( $draft['title'] ) || empty( $draft['body'] ) ) {
		return new WP_Error(
			'ai_parse_error',
			esc_html__( 'AI returned an unexpected format. Please try again.', 'alpaca-issue-tracker' ),
			[ 'status' => 502 ]
		);
	}

	return [
		'title'      => sanitize_text_field( $draft['title'] ),
		'body'       => wp_kses_post( $draft['body'] ),
		'complexity' => in_array( $draft['complexity'] ?? '', [ 'low', 'medium', 'high' ], true )
			? $draft['complexity']
			: 'medium',
		'labels'     => array_map( 'sanitize_text_field', (array) ( $draft['labels'] ?? [] ) ),
	];
}

/**
 * This function does two things:
 * 1. Tests the connection with saved GitHub credentials,
 * 2. Returns the list of branches.
 *
 * It verifies the access token can reach the repo, checks its permissions,
 * and returns up to 100 branch names for the Staging / Production selectors.
 *
 * @return WP_REST_Response|WP_Error
 */
function alpaistr_agentic_touch_github_callback(): WP_REST_Response|WP_Error {
	$settings = alpaistr_agentic_get_settings();
	$token    = $settings['github_token'];
	$repo     = $settings['github_repo'];

	if ( empty( $token ) ) {
		return new WP_Error( 'not_configured', __( 'GitHub Personal Access Token is not configured.', 'alpaca-issue-tracker' ), [ 'status' => 400 ] );
	}

	if ( empty( $repo ) ) {
		return new WP_Error( 'not_configured', __( 'GitHub repository is not configured.', 'alpaca-issue-tracker' ), [ 'status' => 400 ] );
	}

	$repo_parts = alpaistr_agentic_parse_github_repo( $repo );
	if ( is_wp_error( $repo_parts ) ) {
		return $repo_parts;
	}

	$api_url = sprintf(
		'https://api.github.com/repos/%s/%s',
		rawurlencode( $repo_parts['owner'] ),
		rawurlencode( $repo_parts['name'] )
	);

	$response = wp_remote_get(
		$api_url,
		[
			'timeout' => 20,
			'headers' => alpaistr_agentic_github_api_headers( $token ),
		]
	);

	if ( is_wp_error( $response ) ) {
		return new WP_Error(
			'github_request_failed',
			sprintf(
				/* translators: %s: error message */
				__( 'GitHub request failed: %s', 'alpaca-issue-tracker' ),
				$response->get_error_message()
			),
			[ 'status' => 502 ]
		);
	}

	$code    = wp_remote_retrieve_response_code( $response );
	$raw     = wp_remote_retrieve_body( $response );
	$gh_data = json_decode( $raw, true );

	if ( $code >= 400 || ! is_array( $gh_data ) ) {
		return new WP_Error(
			'github_api_error',
			alpaistr_agentic_format_github_error_message( $code, is_array( $gh_data ) ? $gh_data : [], $repo_parts ),
			[ 'status' => 502 ]
		);
	}

	$default_branch  = (string) ( $gh_data['default_branch'] ?? 'main' );
	$branch_sha      = alpaistr_agentic_get_default_branch_sha( $token, $repo_parts, $default_branch );
	$contents_ready  = ! is_wp_error( $branch_sha );
	$oauth_scopes    = wp_remote_retrieve_header( $response, 'x-oauth-scopes' );
	$workflows_ready = alpaistr_agentic_can_access_github_workflows( $token, is_string( $oauth_scopes ) ? $oauth_scopes : '' );
	$pulls_ready     = alpaistr_agentic_can_access_github_pull_requests( $token, $repo_parts );
	$install_ready   = $contents_ready && $workflows_ready && $pulls_ready;

	$message = sprintf(
		/* translators: %s: repository full name */
		__( 'Connected to %s.', 'alpaca-issue-tracker' ),
		$gh_data['full_name'] ?? ( $repo_parts['owner'] . '/' . $repo_parts['name'] )
	);

	if ( $install_ready ) {
		$message .= ' ' . __(
			'All permissions look good.',
			'alpaca-issue-tracker'
		);
	} else {
		if ( ! $contents_ready ) {
			$message .= ' ' . __(
				'Workflow installation needs Contents read/write (fine-grained PAT) or repo scope (classic PAT).',
				'alpaca-issue-tracker'
			);
		}
		if ( ! $workflows_ready ) {
			$message .= ' ' . __(
				'Workflow installation also needs the classic workflow scope (or fine-grained Workflows read/write) to commit files under .github/workflows/.',
				'alpaca-issue-tracker'
			);
		}
		if ( ! $pulls_ready ) {
			$message .= ' ' . __(
				'Workflow installation also needs Pull requests read/write to open the install pull request.',
				'alpaca-issue-tracker'
			);
		}
	}

	$branches = alpaistr_agentic_fetch_github_branches( $token, $repo_parts );
	if ( is_wp_error( $branches ) ) {
		// Connection succeeded; branch list is optional for the test message.
		$branches = [];
	}

	return rest_ensure_response(
		[
			'success'         => true,
			'workflow_ready'  => $install_ready,
			'contents_ready'  => $contents_ready,
			'workflows_ready' => $workflows_ready,
			'pulls_ready'     => $pulls_ready,
			'message'         => $message,
			'private'         => (bool) ( $gh_data['private'] ?? false ),
			'html_url'        => esc_url_raw( $gh_data['html_url'] ?? '' ),
			'branches'        => $branches,
		]
	);
}

/**
 * Fetch up to 100 branch names from a GitHub repository.
 *
 * @param string                             $token      GitHub personal access token.
 * @param array{owner: string, name: string} $repo_parts Parsed repository.
 * @return string[]|WP_Error Branch names, or error on failure.
 */
function alpaistr_agentic_fetch_github_branches( string $token, array $repo_parts ): array|WP_Error {
	$api_url = sprintf(
		'https://api.github.com/repos/%s/%s/branches?per_page=100',
		rawurlencode( $repo_parts['owner'] ),
		rawurlencode( $repo_parts['name'] )
	);

	$response = wp_remote_get(
		$api_url,
		[
			'timeout' => 20,
			'headers' => alpaistr_agentic_github_api_headers( $token ),
		]
	);

	if ( is_wp_error( $response ) ) {
		return $response;
	}

	$code = wp_remote_retrieve_response_code( $response );
	$data = json_decode( wp_remote_retrieve_body( $response ), true );

	if ( $code >= 400 || ! is_array( $data ) ) {
		return new WP_Error(
			'github_api_error',
			alpaistr_agentic_format_github_error_message( $code, is_array( $data ) ? $data : [], $repo_parts ),
			[ 'status' => 502 ]
		);
	}

	$names = [];
	foreach ( $data as $branch ) {
		if ( is_array( $branch ) && ! empty( $branch['name'] ) ) {
			$names[] = (string) $branch['name'];
		}
	}

	return $names;
}

/**
 * Check whether the agentic workflow is already installed in the configured repo.
 *
 * Uses a 1-hour transient to avoid an API call on every page load. The transient
 * is cleared when install-workflow succeeds.
 *
 * @return WP_REST_Response|WP_Error
 */
function alpaistr_agentic_workflow_status_callback(): WP_REST_Response|WP_Error {
	$settings = alpaistr_agentic_get_settings();
	$token    = $settings['github_token'];
	$repo     = $settings['github_repo'];

	if ( empty( $token ) || empty( $repo ) ) {
		return rest_ensure_response( [ 'installed' => false ] );
	}

	$cached = get_transient( 'alpaistr_agentic_workflow_installed' );
	if ( false !== $cached ) {
		return rest_ensure_response( [ 'installed' => (bool) $cached ] );
	}

	$repo_parts = alpaistr_agentic_parse_github_repo( $repo );
	if ( is_wp_error( $repo_parts ) ) {
		return rest_ensure_response( [ 'installed' => false ] );
	}

	$installed = alpaistr_agentic_workflow_marker_exists( $token, $repo_parts );
	set_transient( 'alpaistr_agentic_workflow_installed', $installed, HOUR_IN_SECONDS );

	return rest_ensure_response( [ 'installed' => $installed ] );
}

/**
 * Install agentic workflow files to the configured GitHub repository via PR.
 *
 * Flow:
 *   1. Get default branch + latest commit SHA
 *   2. Create branch alpaca/ai-development
 *   3. Commit each bundled template file (skip files that already exist)
 *   4. Open a pull request
 *   5. Save the PR URL to options for use in the setup checklist
 *
 * @return WP_REST_Response|WP_Error
 */
function alpaistr_agentic_install_workflow_callback(): WP_REST_Response|WP_Error {
	$settings = alpaistr_agentic_get_settings();
	$token    = $settings['github_token'];
	$repo     = $settings['github_repo'];

	if ( empty( $token ) ) {
		return new WP_Error( 'not_configured', __( 'GitHub Personal Access Token is not configured.', 'alpaca-issue-tracker' ), [ 'status' => 400 ] );
	}
	if ( empty( $repo ) ) {
		return new WP_Error( 'not_configured', __( 'GitHub repository is not configured.', 'alpaca-issue-tracker' ), [ 'status' => 400 ] );
	}

	$repo_parts = alpaistr_agentic_parse_github_repo( $repo );
	if ( is_wp_error( $repo_parts ) ) {
		return $repo_parts;
	}

	$repo_info = wp_remote_get(
		sprintf( 'https://api.github.com/repos/%s/%s', rawurlencode( $repo_parts['owner'] ), rawurlencode( $repo_parts['name'] ) ),
		[
			'timeout' => 20,
			'headers' => alpaistr_agentic_github_api_headers( $token ),
		]
	);

	if ( is_wp_error( $repo_info ) ) {
		return new WP_Error(
			'github_api_error',
			sprintf(
				/* translators: %s: error message */
				__( 'Could not fetch repository information: %s', 'alpaca-issue-tracker' ),
				$repo_info->get_error_message()
			),
			[ 'status' => 502 ]
		);
	}

	$repo_code = wp_remote_retrieve_response_code( $repo_info );
	$repo_data = json_decode( wp_remote_retrieve_body( $repo_info ), true );

	if ( 200 !== $repo_code || ! is_array( $repo_data ) ) {
		return new WP_Error(
			'github_api_error',
			alpaistr_agentic_format_github_error_message( $repo_code, is_array( $repo_data ) ? $repo_data : [], $repo_parts ),
			[ 'status' => 502 ]
		);
	}

	$default_branch = (string) ( $repo_data['default_branch'] ?? 'main' );

	if ( alpaistr_agentic_workflow_marker_exists( $token, $repo_parts, $default_branch ) ) {
		return alpaistr_agentic_mark_workflow_already_installed();
	}

	$latest_sha = alpaistr_agentic_get_default_branch_sha( $token, $repo_parts, $default_branch );

	if ( is_wp_error( $latest_sha ) ) {
		return $latest_sha;
	}

	$branch_name     = 'alpaca/ai-development';
	$branch_response = wp_remote_post(
		sprintf( 'https://api.github.com/repos/%s/%s/git/refs', rawurlencode( $repo_parts['owner'] ), rawurlencode( $repo_parts['name'] ) ),
		[
			'timeout' => 20,
			'headers' => alpaistr_agentic_github_api_headers( $token ),
			'body'    => wp_json_encode(
				[
					'ref' => 'refs/heads/' . $branch_name,
					'sha' => $latest_sha,
				]
			),
		]
	);

	$branch_code = wp_remote_retrieve_response_code( $branch_response );

	// 422 = branch already exists — that's fine, continue.
	if ( is_wp_error( $branch_response ) || ( 201 !== $branch_code && 422 !== $branch_code ) ) {
		$body = json_decode( wp_remote_retrieve_body( $branch_response ), true );
		$msg  = $body['message'] ?? __( 'Could not create workflow branch.', 'alpaca-issue-tracker' );
		return new WP_Error( 'github_api_error', $msg, [ 'status' => 502 ] );
	}

	$templates_dir = ALPAISTR_PLUGIN_DIR . 'includes/agentic/';
	$files         = alpaistr_agentic_get_template_files( $templates_dir );
	$committed     = 0;
	$skipped       = 0;

	foreach ( $files as $relative_path => $full_path ) {
		$github_path = '.github/' . $relative_path;
		$content     = file_get_contents( $full_path ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents

		if ( false === $content ) {
			continue;
		}

		$file_response = wp_remote_request(
			sprintf(
				'https://api.github.com/repos/%s/%s/contents/%s',
				rawurlencode( $repo_parts['owner'] ),
				rawurlencode( $repo_parts['name'] ),
				$github_path
			),
			[
				'method'  => 'PUT',
				'timeout' => 30,
				'headers' => alpaistr_agentic_github_api_headers( $token ),
				'body'    => wp_json_encode(
					[
						'message' => 'Add ' . basename( $relative_path ) . ' [alpaca-ai-development]',
						'content' => base64_encode( $content ), // phpcs:ignore WordPress.PHP.DiscouragedPHPFunctions.obfuscation_base64_encode
						'branch'  => $branch_name,
					]
				),
			]
		);

		$file_code = wp_remote_retrieve_response_code( $file_response );

		if ( 201 === $file_code ) {
			++$committed;
			continue;
		}

		if ( 422 === $file_code ) {
			// File already exists — skip.
			++$skipped;
			continue;
		}

		$body       = json_decode( wp_remote_retrieve_body( $file_response ), true );
		$gh_message = is_array( $body ) ? (string) ( $body['message'] ?? '' ) : '';

		if ( is_wp_error( $file_response ) ) {
			$gh_message = $file_response->get_error_message();
		}

		return new WP_Error(
			'github_api_error',
			alpaistr_agentic_format_github_file_commit_error( (int) $file_code, $gh_message, $github_path ),
			[ 'status' => 502 ]
		);
	}

	if ( 0 === $committed && 0 === $skipped ) {
		return new WP_Error(
			'github_api_error',
			__( 'No workflow files could be committed to the repository.', 'alpaca-issue-tracker' ),
			[ 'status' => 502 ]
		);
	}

	$ahead_by = alpaistr_agentic_get_branch_ahead_by( $token, $repo_parts, $default_branch, $branch_name );

	if ( 0 === $ahead_by ) {
		if ( alpaistr_agentic_workflow_marker_exists( $token, $repo_parts, $default_branch ) ) {
			return alpaistr_agentic_mark_workflow_already_installed();
		}

		return new WP_Error(
			'github_api_error',
			sprintf(
				/* translators: 1: head branch, 2: base branch */
				__(
					'Branch "%1$s" has no commits ahead of "%2$s", so GitHub cannot open a pull request. The workflow files already appear to be on the default branch, or no new changes were committed.',
					'alpaca-issue-tracker'
				),
				$branch_name,
				$default_branch
			),
			[ 'status' => 502 ]
		);
	}

	$pr_url = alpaistr_agentic_find_open_pull_request( $token, $repo_parts, $branch_name );

	if ( empty( $pr_url ) ) {
		$pr_body = implode(
			"\n",
			[
				'## Add Alpaca AI Development workflow',
				'',
				'This pull request was opened by the **Alpaca AI Issue Resolver** feature.',
				'It adds the GitHub Actions workflows, labels, and issue templates needed to connect Alpaca with your AI agent.',
				'',
				'### What\'s included',
				'',
				'- `agent-ready-trigger.yml` — fires when `agent-ready` label is applied; routes to Claude or another provider',
				'- `plan-approval-gate.yml` — handles `/approve-plan` and `/run-agent` commands',
				'- `issue-screener.yml` — weekly structural screener for backlog issues',
				'- `auto-label-agent-ready.yml` — auto-labels structurally complete issues',
				'- `setup-labels.yml` — one-time label import',
				'- `claude.yml` — `@claude` mention trigger',
				'- `claude-code-review.yml` — automated PR code review',
				'- Issue and PR templates',
				'- Label definitions',
				'',
				'### Next steps after merging',
				'',
				'1. Add `CLAUDE_CODE_OAUTH_TOKEN` to **Settings → Secrets and variables → Secrets**',
				'2. Optionally add `ANTHROPIC_API_KEY` for automated code review',
				'3. Run **Actions → Setup Labels → Run workflow** to create all labels',
				'',
				'---',
				'_Opened by Alpaca Issue Tracker (AI Issue Resolver) v' . ALPAISTR_VERSION . '_',
			]
		);

		$pr_response = wp_remote_post(
			sprintf( 'https://api.github.com/repos/%s/%s/pulls', rawurlencode( $repo_parts['owner'] ), rawurlencode( $repo_parts['name'] ) ),
			[
				'timeout' => 30,
				'headers' => alpaistr_agentic_github_api_headers( $token ),
				'body'    => wp_json_encode(
					[
						'title' => 'Add Alpaca AI Development workflow',
						'body'  => $pr_body,
						'head'  => $branch_name,
						'base'  => $default_branch,
					]
				),
			]
		);

		$pr_code = wp_remote_retrieve_response_code( $pr_response );
		$pr_data = json_decode( wp_remote_retrieve_body( $pr_response ), true );

		if ( is_wp_error( $pr_response ) ) {
			return new WP_Error(
				'github_api_error',
				sprintf(
					/* translators: %s: error message */
					__( 'Could not open pull request: %s', 'alpaca-issue-tracker' ),
					$pr_response->get_error_message()
				),
				[ 'status' => 502 ]
			);
		}

		if ( 201 === $pr_code ) {
			$pr_url = esc_url_raw( $pr_data['html_url'] ?? '' );
		} elseif ( 422 === $pr_code ) {
			$pr_url = alpaistr_agentic_find_open_pull_request( $token, $repo_parts, $branch_name );

			if ( empty( $pr_url ) ) {
				$msg       = is_array( $pr_data ) ? (string) ( $pr_data['message'] ?? '' ) : '';
				$msg_lower = strtolower( $msg );

				if ( str_contains( $msg_lower, 'no commits' ) || str_contains( $msg_lower, 'identical' ) ) {
					if ( alpaistr_agentic_workflow_marker_exists( $token, $repo_parts, $default_branch ) ) {
						return alpaistr_agentic_mark_workflow_already_installed();
					}
				}

				if ( '' !== $msg && ! str_contains( $msg_lower, 'pull request already exists' ) ) {
					return new WP_Error( 'github_api_error', $msg, [ 'status' => 502 ] );
				}
			}
		} else {
			$pr_error_message = alpaistr_agentic_format_github_error_message( $pr_code, is_array( $pr_data ) ? $pr_data : [], $repo_parts );
			if ( '' === $pr_error_message ) {
				$pr_error_message = is_array( $pr_data )
					? ( $pr_data['message'] ?? __( 'Could not open pull request.', 'alpaca-issue-tracker' ) )
					: __( 'Could not open pull request.', 'alpaca-issue-tracker' );
			}
			return new WP_Error(
				'github_api_error',
				$pr_error_message,
				[ 'status' => 502 ]
			);
		}
	}

	if ( empty( $pr_url ) ) {
		$compare_url = sprintf(
			'https://github.com/%s/%s/compare/%s...%s?expand=1',
			$repo_parts['owner'],
			$repo_parts['name'],
			rawurlencode( $default_branch ),
			rawurlencode( $branch_name )
		);

		return new WP_Error(
			'github_api_error',
			sprintf(
				/* translators: 1: branch name, 2: compare URL */
				__(
					'GitHub Actions files are on branch "%1$s" but no pull request could be opened. Your token may need Pull requests read/write. Open one manually: %2$s',
					'alpaca-issue-tracker'
				),
				$branch_name,
				$compare_url
			),
			[ 'status' => 502 ]
		);
	}

	// Save PR URL for the checklist and clear workflow status transient.
	if ( ! empty( $pr_url ) ) {
		update_option( 'alpaistr_agentic_workflow_pr_url', $pr_url );
	}
	delete_transient( 'alpaistr_agentic_workflow_installed' );

	return rest_ensure_response(
		[
			'pr_url'    => $pr_url,
			'committed' => $committed,
			'skipped'   => $skipped,
		]
	);
}

/**
 * Recursively collect template files relative to the templates root.
 *
 * @param string $dir       Absolute path to the includes/agentic/ templates directory.
 * @param string $base_path Internal prefix used for recursion (empty on first call).
 * @return array<string, string> Map of relative_path => absolute_path.
 */
function alpaistr_agentic_get_template_files( string $dir, string $base_path = '' ): array {
	$files = [];

	if ( ! is_dir( $dir ) ) {
		return $files;
	}

	$entries = scandir( $dir );
	if ( false === $entries ) {
		return $files;
	}

	$skip = [ '.', '..', 'index.php', '.DS_Store', 'draft-agent-ready-issue.md' ];

	foreach ( $entries as $entry ) {
		if ( in_array( $entry, $skip, true ) ) {
			continue;
		}

		$full = $dir . $entry;
		$rel  = $base_path . $entry;

		if ( is_dir( $full ) ) {
			$files = array_merge( $files, alpaistr_agentic_get_template_files( $full . '/', $rel . '/' ) );
		} elseif ( is_file( $full ) ) {
			$files[ $rel ] = $full;
		}
	}

	return $files;
}

/**
 * Create a GitHub issue and store its URL on the Alpaca post.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response|WP_Error
 */
function alpaistr_agentic_create_callback( WP_REST_Request $request ): WP_REST_Response|WP_Error {
	$issue_id = (int) $request->get_param( 'issue_id' );
	$post     = get_post( $issue_id );

	if ( ! $post || 'alpaca_issue' !== $post->post_type ) {
		return new WP_Error( 'not_found', esc_html__( 'Alpaca issue not found.', 'alpaca-issue-tracker' ), [ 'status' => 404 ] );
	}

	$settings = alpaistr_agentic_get_settings();
	$token    = $settings['github_token'];
	$repo     = $settings['github_repo'];

	if ( empty( $token ) || empty( $repo ) ) {
		return new WP_Error( 'not_configured', esc_html__( 'GitHub token or repository is not configured.', 'alpaca-issue-tracker' ), [ 'status' => 400 ] );
	}

	$title  = $request->get_param( 'title' );
	$body   = $request->get_param( 'body' );
	$labels = array_values( array_filter( array_map( 'sanitize_text_field', (array) $request->get_param( 'labels' ) ) ) );

	// agent-ready must be applied in a separate API call so GitHub fires the
	// issues.labeled webhook and Agent-Ready Auto-Trigger runs immediately.
	$apply_agent_ready = in_array( 'agent-ready', $labels, true );
	$create_labels     = array_values( array_diff( $labels, [ 'agent-ready' ] ) );

	$repo_parts = alpaistr_agentic_parse_github_repo( $repo );
	if ( is_wp_error( $repo_parts ) ) {
		return $repo_parts;
	}

	// target-branch:* labels are per-repo and not in LABELS.yml — create if missing.
	foreach ( $create_labels as $label_name ) {
		if ( str_starts_with( $label_name, 'target-branch:' ) ) {
			alpaistr_agentic_ensure_github_label( $token, $repo_parts, $label_name );
		}
	}

	$api_url = sprintf(
		'https://api.github.com/repos/%s/%s/issues',
		rawurlencode( $repo_parts['owner'] ),
		rawurlencode( $repo_parts['name'] )
	);

	$github_response = wp_remote_post(
		$api_url,
		[
			'timeout' => 30,
			'headers' => alpaistr_agentic_github_api_headers( $token ),
			'body'    => wp_json_encode(
				[
					'title'  => $title,
					'body'   => $body,
					'labels' => $create_labels,
				]
			),
		]
	);

	if ( is_wp_error( $github_response ) ) {
		return new WP_Error(
			'github_request_failed',
			/* translators: %s: error message */
			sprintf( esc_html__( 'GitHub request failed: %s', 'alpaca-issue-tracker' ), $github_response->get_error_message() ),
			[ 'status' => 502 ]
		);
	}

	$code    = wp_remote_retrieve_response_code( $github_response );
	$raw     = wp_remote_retrieve_body( $github_response );
	$gh_data = json_decode( $raw, true );

	if ( $code >= 400 || empty( $gh_data['html_url'] ) ) {
		$message = alpaistr_agentic_format_github_error_message( $code, is_array( $gh_data ) ? $gh_data : [], $repo_parts );
		return new WP_Error( 'github_api_error', $message, [ 'status' => 502 ] );
	}

	if ( $apply_agent_ready ) {
		$label_result = alpaistr_agentic_github_add_issue_labels(
			$token,
			$repo_parts,
			(int) ( $gh_data['number'] ?? 0 ),
			[ 'agent-ready' ]
		);

		if ( is_wp_error( $label_result ) ) {
			return new WP_Error(
				'github_label_error',
				sprintf(
					/* translators: 1: issue URL, 2: error message */
					__( 'Issue was created at %1$s but agent-ready could not be applied: %2$s', 'alpaca-issue-tracker' ),
					$gh_data['html_url'],
					$label_result->get_error_message()
				),
				[ 'status' => 502 ]
			);
		}
	}

	$github_url = esc_url_raw( $gh_data['html_url'] );

	// Save the GitHub issue URL back to the Alpaca post so it's visible in the admin.
	update_post_meta( $issue_id, ALPAISTR_AGENTIC_GITHUB_ISSUE_URL_META, $github_url );

	return rest_ensure_response(
		[
			'url'           => $github_url,
			'github_number' => (int) ( $gh_data['number'] ?? 0 ),
		]
	);
}

/**
 * Standard headers for GitHub REST API requests.
 *
 * @param string $token GitHub personal access token.
 * @return array<string, string>
 */
function alpaistr_agentic_github_api_headers( string $token ): array {
	return [
		'Authorization'        => 'Bearer ' . $token,
		'Accept'               => 'application/vnd.github+json',
		'Content-Type'         => 'application/json',
		'X-GitHub-Api-Version' => '2022-11-28',
		'User-Agent'           => 'AlpacaIssueTracker-Agentic/' . ALPAISTR_VERSION,
	];
}

/**
 * Create a GitHub label if it does not already exist.
 *
 * Used for dynamic labels like target-branch:develop that are not in LABELS.yml.
 * Failures are ignored — the subsequent issue create will surface a clear error.
 *
 * @param string                             $token      GitHub personal access token.
 * @param array{owner: string, name: string} $repo_parts Parsed repository.
 * @param string                             $name       Label name.
 * @return void
 */
function alpaistr_agentic_ensure_github_label( string $token, array $repo_parts, string $name ): void {
	wp_remote_post(
		sprintf(
			'https://api.github.com/repos/%s/%s/labels',
			rawurlencode( $repo_parts['owner'] ),
			rawurlencode( $repo_parts['name'] )
		),
		[
			'timeout' => 15,
			'headers' => alpaistr_agentic_github_api_headers( $token ),
			'body'    => wp_json_encode(
				[
					'name'        => $name,
					'color'       => '0E8A16',
					'description' => 'PR base branch for the AI agent',
				]
			),
		]
	);
}

/**
 * Add labels to an existing GitHub issue (fires the issues.labeled webhook).
 *
 * @param string                             $token      GitHub personal access token.
 * @param array{owner: string, name: string} $repo_parts Parsed repository.
 * @param int                                $issue_number GitHub issue number.
 * @param array<int, string>                 $labels     Label names to add.
 * @return true|WP_Error
 */
function alpaistr_agentic_github_add_issue_labels( string $token, array $repo_parts, int $issue_number, array $labels ): bool|WP_Error {
	if ( $issue_number <= 0 || empty( $labels ) ) {
		return new WP_Error( 'invalid_issue', __( 'Cannot apply labels to the GitHub issue.', 'alpaca-issue-tracker' ) );
	}

	$api_url = sprintf(
		'https://api.github.com/repos/%s/%s/issues/%d/labels',
		rawurlencode( $repo_parts['owner'] ),
		rawurlencode( $repo_parts['name'] ),
		$issue_number
	);

	$response = wp_remote_post(
		$api_url,
		[
			'timeout' => 30,
			'headers' => alpaistr_agentic_github_api_headers( $token ),
			'body'    => wp_json_encode( array_values( $labels ) ),
		]
	);

	if ( is_wp_error( $response ) ) {
		return new WP_Error(
			'github_request_failed',
			$response->get_error_message()
		);
	}

	$code    = wp_remote_retrieve_response_code( $response );
	$gh_data = json_decode( wp_remote_retrieve_body( $response ), true );

	if ( $code >= 400 ) {
		$message = is_array( $gh_data ) && isset( $gh_data['message'] )
			? (string) $gh_data['message']
			: __( 'GitHub rejected the label update.', 'alpaca-issue-tracker' );

		return new WP_Error( 'github_api_error', $message );
	}

	return true;
}

/**
 * Parse an owner/repo string (or GitHub URL) into owner and repository name.
 *
 * @param string $repo Raw repository setting value.
 * @return array{owner: string, name: string}|WP_Error
 */
function alpaistr_agentic_parse_github_repo( string $repo ): array|WP_Error {
	$repo = trim( $repo );

	// Allow pasting a full GitHub URL.
	if ( str_contains( $repo, 'github.com' ) ) {
		$path = (string) wp_parse_url( $repo, PHP_URL_PATH );
		$repo = trim( $path, '/' );
	}

	// Strip optional .git suffix.
	$repo = preg_replace( '/\.git$/', '', $repo );

	if ( ! preg_match( '#^([A-Za-z0-9_.-]+)/([A-Za-z0-9_.-]+)$#', $repo, $matches ) ) {
		return new WP_Error(
			'invalid_github_repo',
			esc_html__( 'GitHub repository must be in owner/repo format (e.g. rareview/agentic-development-lab).', 'alpaca-issue-tracker' ),
			[ 'status' => 400 ]
		);
	}

	return [
		'owner' => $matches[1],
		'name'  => $matches[2],
	];
}

/**
 * Check whether the Alpaca workflow marker file exists on a branch.
 *
 * @param string                             $token      GitHub personal access token.
 * @param array{owner: string, name: string} $repo_parts Parsed repository.
 * @param string                             $branch     Branch name. Empty uses the default branch.
 * @return bool
 */
function alpaistr_agentic_workflow_marker_exists( string $token, array $repo_parts, string $branch = '' ): bool {
	$api_url = sprintf(
		'https://api.github.com/repos/%s/%s/contents/.github/workflows/agent-ready-trigger.yml',
		rawurlencode( $repo_parts['owner'] ),
		rawurlencode( $repo_parts['name'] )
	);

	if ( '' !== $branch ) {
		$api_url = add_query_arg( 'ref', $branch, $api_url );
	}

	$response = wp_remote_get(
		$api_url,
		[
			'timeout' => 15,
			'headers' => alpaistr_agentic_github_api_headers( $token ),
		]
	);

	return ! is_wp_error( $response ) && 200 === wp_remote_retrieve_response_code( $response );
}

/**
 * Mark the workflow as installed when files are already on the default branch.
 *
 * @return WP_REST_Response
 */
function alpaistr_agentic_mark_workflow_already_installed(): WP_REST_Response {
	set_transient( 'alpaistr_agentic_workflow_installed', true, HOUR_IN_SECONDS );

	return rest_ensure_response(
		[
			'already_installed' => true,
			'pr_url'            => '',
			'message'           => __(
				'GitHub Actions files are already on the default branch. No pull request is needed.',
				'alpaca-issue-tracker'
			),
		]
	);
}

/**
 * Return how many commits a head branch is ahead of the base branch.
 *
 * @param string                             $token      GitHub personal access token.
 * @param array{owner: string, name: string} $repo_parts Parsed repository.
 * @param string                             $base       Base branch name.
 * @param string                             $head       Head branch name.
 * @return int
 */
function alpaistr_agentic_get_branch_ahead_by( string $token, array $repo_parts, string $base, string $head ): int {
	$response = wp_remote_get(
		sprintf(
			'https://api.github.com/repos/%s/%s/compare/%s...%s',
			rawurlencode( $repo_parts['owner'] ),
			rawurlencode( $repo_parts['name'] ),
			rawurlencode( $base ),
			rawurlencode( $head )
		),
		[
			'timeout' => 20,
			'headers' => alpaistr_agentic_github_api_headers( $token ),
		]
	);

	if ( is_wp_error( $response ) || 200 !== wp_remote_retrieve_response_code( $response ) ) {
		$base_sha = alpaistr_agentic_get_default_branch_sha( $token, $repo_parts, $base );
		$head_sha = alpaistr_agentic_get_default_branch_sha( $token, $repo_parts, $head );

		if ( is_wp_error( $base_sha ) || is_wp_error( $head_sha ) ) {
			return 0;
		}

		return $base_sha === $head_sha ? 0 : 1;
	}

	$data = json_decode( wp_remote_retrieve_body( $response ), true );

	return is_array( $data ) ? (int) ( $data['ahead_by'] ?? 0 ) : 0;
}

/**
 * Check if the GitHub token is allowed to commit workflow files (.github/workflows/).
 *
 * Why this matters: installing our agent needs to add YAML files under
 * .github/workflows/. That requires a special permission, not just "repo access".
 *
 * Classic PATs: GitHub returns an X-OAuth-Scopes header listing scopes. We look
 * for the `workflow` scope. If it is missing, return false.
 *
 * Fine-grained PATs: we cannot check this permission ahead of time, so we
 * assume it is OK (return true). If the token is missing Workflows access,
 * the install-workflow step will fail later with a clear error.
 *
 * @param string $token         GitHub personal access token.
 * @param string $scopes_header Value of the X-OAuth-Scopes response header, if any.
 * @return bool
 */
function alpaistr_agentic_can_access_github_workflows( string $token, string $scopes_header = '' ): bool {
	// For fine-grained PATs return true anyway.
	if ( str_starts_with( $token, 'github_pat_' ) || '' === $scopes_header ) {
		return true;
	}

	$scopes = array_map( 'trim', explode( ',', strtolower( $scopes_header ) ) );

	// Check if there is a "workflow" permission in the scopes, and yes, return true.
	return in_array( 'workflow', $scopes, true );
}

/**
 * Check whether the token can list pull requests for a repository.
 *
 * @param string                             $token      GitHub personal access token.
 * @param array{owner: string, name: string} $repo_parts Parsed repository.
 * @return bool
 */
function alpaistr_agentic_can_access_github_pull_requests( string $token, array $repo_parts ): bool {
	$response = wp_remote_get(
		sprintf(
			'https://api.github.com/repos/%s/%s/pulls?state=open&per_page=1',
			rawurlencode( $repo_parts['owner'] ),
			rawurlencode( $repo_parts['name'] )
		),
		[
			'timeout' => 20,
			'headers' => alpaistr_agentic_github_api_headers( $token ),
		]
	);

	return ! is_wp_error( $response ) && 200 === wp_remote_retrieve_response_code( $response );
}

/**
 * Find an open pull request for a head branch, if one exists.
 *
 * @param string                             $token       GitHub personal access token.
 * @param array{owner: string, name: string} $repo_parts  Parsed repository.
 * @param string                             $branch_name Head branch name.
 * @return string Pull request URL, or empty string.
 */
function alpaistr_agentic_find_open_pull_request( string $token, array $repo_parts, string $branch_name ): string {
	$response = wp_remote_get(
		sprintf(
			'https://api.github.com/repos/%s/%s/pulls?head=%s:%s&state=open&per_page=1',
			rawurlencode( $repo_parts['owner'] ),
			rawurlencode( $repo_parts['name'] ),
			rawurlencode( $repo_parts['owner'] ),
			rawurlencode( $branch_name )
		),
		[
			'timeout' => 20,
			'headers' => alpaistr_agentic_github_api_headers( $token ),
		]
	);

	if ( is_wp_error( $response ) || 200 !== wp_remote_retrieve_response_code( $response ) ) {
		return '';
	}

	$data = json_decode( wp_remote_retrieve_body( $response ), true );

	return is_array( $data ) ? esc_url_raw( $data[0]['html_url'] ?? '' ) : '';
}

/**
 * Build a user-friendly error when committing a file to GitHub fails.
 *
 * @param int    $code        HTTP status code from GitHub.
 * @param string $gh_message  GitHub error message.
 * @param string $github_path Repository path being committed.
 * @return string Error message for display.
 */
function alpaistr_agentic_format_github_file_commit_error( int $code, string $gh_message, string $github_path ): string {
	$is_workflow_file = str_starts_with( $github_path, '.github/workflows/' );
	$blocked_by_pat   = str_contains( strtolower( $gh_message ), 'resource not accessible by personal access token' );

	if ( $is_workflow_file && ( 403 === $code || $blocked_by_pat ) ) {
		return sprintf(
			/* translators: 1: file path, 2: GitHub error message */
			__(
				'Could not commit "%1$s". GitHub requires Workflows read/write on fine-grained PATs (or workflow scope on classic PATs) to modify files under .github/workflows/. Update the token permissions and try again. GitHub says: %2$s',
				'alpaca-issue-tracker'
			),
			$github_path,
			'' !== $gh_message ? $gh_message : __( 'Resource not accessible by personal access token', 'alpaca-issue-tracker' )
		);
	}

	if ( 403 === $code && str_starts_with( $github_path, '.github/' ) ) {
		return sprintf(
			/* translators: 1: file path, 2: GitHub error message */
			__(
				'Could not commit "%1$s". Check that your token has Contents read/write on this repository. GitHub says: %2$s',
				'alpaca-issue-tracker'
			),
			$github_path,
			'' !== $gh_message ? $gh_message : __( 'Forbidden', 'alpaca-issue-tracker' )
		);
	}

	return sprintf(
		/* translators: 1: file path, 2: GitHub error message */
		__( 'Could not commit "%1$s". GitHub says: %2$s', 'alpaca-issue-tracker' ),
		$github_path,
		'' !== $gh_message ? $gh_message : __( 'GitHub returned an unexpected response.', 'alpaca-issue-tracker' )
	);
}

/**
 * Resolve the latest commit SHA for a repository branch.
 *
 * Tries the Git data API first, then falls back to the branches endpoint.
 *
 * @param string                             $token          GitHub personal access token.
 * @param array{owner: string, name: string} $repo_parts     Parsed repository.
 * @param string                             $default_branch Default branch name.
 * @return string|WP_Error Commit SHA, or error with actionable guidance.
 */
function alpaistr_agentic_get_default_branch_sha( string $token, array $repo_parts, string $default_branch ): string|WP_Error {
	$headers = [
		'timeout' => 20,
		'headers' => alpaistr_agentic_github_api_headers( $token ),
	];

	$ref_response = wp_remote_get(
		sprintf(
			'https://api.github.com/repos/%s/%s/git/ref/heads/%s',
			rawurlencode( $repo_parts['owner'] ),
			rawurlencode( $repo_parts['name'] ),
			rawurlencode( $default_branch )
		),
		$headers
	);

	if ( ! is_wp_error( $ref_response ) && 200 === wp_remote_retrieve_response_code( $ref_response ) ) {
		$ref_data = json_decode( wp_remote_retrieve_body( $ref_response ), true );
		$sha      = is_array( $ref_data ) ? (string) ( $ref_data['object']['sha'] ?? '' ) : '';

		if ( '' !== $sha ) {
			return $sha;
		}
	}

	$branch_response = wp_remote_get(
		sprintf(
			'https://api.github.com/repos/%s/%s/branches/%s',
			rawurlencode( $repo_parts['owner'] ),
			rawurlencode( $repo_parts['name'] ),
			rawurlencode( $default_branch )
		),
		$headers
	);

	if ( ! is_wp_error( $branch_response ) && 200 === wp_remote_retrieve_response_code( $branch_response ) ) {
		$branch_data = json_decode( wp_remote_retrieve_body( $branch_response ), true );
		$sha         = is_array( $branch_data ) ? (string) ( $branch_data['commit']['sha'] ?? '' ) : '';

		if ( '' !== $sha ) {
			return $sha;
		}
	}

	$failed_response = is_wp_error( $ref_response ) ? $ref_response : $branch_response;
	if ( is_wp_error( $failed_response ) ) {
		return new WP_Error(
			'github_api_error',
			sprintf(
				/* translators: %s: error message */
				__( 'Could not get the latest commit SHA: %s', 'alpaca-issue-tracker' ),
				$failed_response->get_error_message()
			),
			[ 'status' => 502 ]
		);
	}

	$code    = wp_remote_retrieve_response_code( $ref_response );
	$gh_data = json_decode( wp_remote_retrieve_body( $ref_response ), true );

	if ( 200 !== $code ) {
		$branch_code = wp_remote_retrieve_response_code( $branch_response );
		if ( 200 !== $branch_code ) {
			$branch_data = json_decode( wp_remote_retrieve_body( $branch_response ), true );
			if ( is_array( $branch_data ) && isset( $branch_data['message'] ) ) {
				$gh_data = $branch_data;
				$code    = $branch_code;
			}
		}
	}

	return new WP_Error(
		'github_api_error',
		alpaistr_agentic_format_github_git_error_message( $code, is_array( $gh_data ) ? $gh_data : [], $repo_parts, $default_branch ),
		[ 'status' => 502 ]
	);
}

/**
 * Build a user-friendly error when branch or git ref access fails.
 *
 * @param int                                $code           HTTP status code from GitHub.
 * @param array<string, mixed>               $gh_data        Decoded GitHub response body.
 * @param array{owner: string, name: string} $repo_parts   Parsed repository.
 * @param string                             $default_branch Default branch name.
 * @return string Error message for display.
 */
function alpaistr_agentic_format_github_git_error_message( int $code, array $gh_data, array $repo_parts, string $default_branch ): string {
	$base_message = isset( $gh_data['message'] ) ? (string) $gh_data['message'] : __( 'GitHub returned an unexpected response.', 'alpaca-issue-tracker' );

	if ( 404 === $code ) {
		return sprintf(
			/* translators: 1: branch name, 2: repository slug, 3: GitHub error message */
			__(
				'Could not find branch "%1$s" on %2$s. The repository may have no commits yet (push an initial commit first), the default branch may have been renamed, or your token may lack Contents read access. GitHub says: %3$s',
				'alpaca-issue-tracker'
			),
			$default_branch,
			$repo_parts['owner'] . '/' . $repo_parts['name'],
			$base_message
		);
	}

	if ( 401 === $code || 403 === $code ) {
		return sprintf(
			/* translators: 1: GitHub error message */
			__(
				'Could not read the default branch. Workflow installation needs Contents read/write (fine-grained PAT) or repo + workflow scopes (classic PAT). If the org uses SSO, authorize the token for the org. GitHub says: %1$s',
				'alpaca-issue-tracker'
			),
			$base_message
		);
	}

	return sprintf(
		/* translators: 1: branch name, 2: GitHub error message */
		__( 'Could not get the latest commit SHA for branch "%1$s". GitHub says: %2$s', 'alpaca-issue-tracker' ),
		$default_branch,
		$base_message
	);
}

/**
 * Build a user-friendly GitHub API error message.
 *
 * @param int                                $code       HTTP status code from GitHub.
 * @param array<string, mixed>               $gh_data    Decoded GitHub response body.
 * @param array{owner: string, name: string} $repo_parts Parsed repository.
 * @return string Error message for display.
 */
function alpaistr_agentic_format_github_error_message( int $code, array $gh_data, array $repo_parts ): string {
	$base_message = isset( $gh_data['message'] ) ? (string) $gh_data['message'] : __( 'GitHub returned an unexpected response.', 'alpaca-issue-tracker' );
	$repo_label   = $repo_parts['owner'] . '/' . $repo_parts['name'];

	if ( 404 === $code ) {
		return sprintf(
			/* translators: 1: repository slug, 2: GitHub error message */
			__(
				'Cannot access GitHub repository "%1$s". The repo slug may be wrong, or (most often for org repos) your token does not have access. Private org repositories return "Not Found" even when the repo exists. Fix: use a classic PAT with the repo scope (or a fine-grained PAT with Issues read/write on this repo), ensure your GitHub user is a member of the org, and authorize the token for SSO if the org requires it. GitHub says: %2$s',
				'alpaca-issue-tracker'
			),
			$repo_label,
			$base_message
		);
	}

	if ( 401 === $code || 403 === $code ) {
		return sprintf(
			/* translators: 1: GitHub error message */
			__(
				'GitHub rejected the request. Check your Personal Access Token has repo scope (classic) or Issues read/write on this repository (fine-grained), and authorize SSO for the org if required. GitHub says: %1$s',
				'alpaca-issue-tracker'
			),
			$base_message
		);
	}

	if ( 422 === $code && ! empty( $gh_data['errors'] ) && is_array( $gh_data['errors'] ) ) {
		$details = array_map(
			static function ( $error ) {
				if ( ! is_array( $error ) ) {
					return '';
				}
				$field   = isset( $error['field'] ) ? (string) $error['field'] : '';
				$message = isset( $error['message'] ) ? (string) $error['message'] : '';
				$code    = isset( $error['code'] ) ? (string) $error['code'] : '';

				if ( 'labels' === $field || 'invalid' === $code ) {
					return __( 'One or more labels do not exist on the repository. Run the Setup Labels workflow or uncheck missing labels.', 'alpaca-issue-tracker' );
				}

				return trim( $field . ': ' . $message );
			},
			$gh_data['errors']
		);

		$details = array_filter( $details );
		if ( ! empty( $details ) ) {
			return $base_message . ' ' . implode( ' ', array_unique( $details ) );
		}
	}

	return $base_message;
}

/**
 * Return the plugin settings with constants taking precedence over DB values.
 *
 * @return array Settings array.
 */
function alpaistr_agentic_get_settings(): array {
	$options = get_option( Agentic::OPTION_KEY, [] );
	if ( ! is_array( $options ) ) {
		$options = [];
	}

	return [
		'github_token'    => defined( 'ALPAISTR_AGENTIC_GITHUB_TOKEN' ) ? ALPAISTR_AGENTIC_GITHUB_TOKEN : ( $options['github_token'] ?? '' ),
		'github_repo'     => $options['github_repo'] ?? '',
		'ai_provider'     => $options['ai_provider'] ?? 'claude',
		'ai_api_key'      => defined( 'ALPAISTR_AGENTIC_AI_API_KEY' ) ? ALPAISTR_AGENTIC_AI_API_KEY : ( $options['ai_api_key'] ?? '' ),
		// Incomplete: per-site drafting notes; usually empty until wizard exposes project_context.
		'project_context' => $options['project_context'] ?? '',
	];
}
