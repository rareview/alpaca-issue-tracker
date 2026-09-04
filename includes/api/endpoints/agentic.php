<?php
/**
 * REST API endpoints for the Agentic (Fix with AI) feature.
 *
 * @package AlpacaIssueTracker
 */

use AlpacaIssueTracker\Agentic\Agentic;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Post meta key for chronological Fix with AI activity history.
 *
 * Each activity record has a `type` (`sent`, `change_requested`, or
 * `reverted`), type-specific fields, and an `occurred_at` GMT ISO-8601
 * timestamp. Sent records also store `pr_url`, `pr_number`, and `pr_state`
 * once the linked GitHub pull request is discovered. Change-requested
 * records store a GitHub comment URL and a short AI title for the change
 * (full notes still go to GitHub and follow-up reconstruction).
 */
/* Constants needed for "fixing attempts/request change/start over approach-workflow */
const ALPAISTR_AGENTIC_HISTORY_META      = 'alpaca_agentic_history';
const ALPAISTR_AGENTIC_START_SHA_META    = 'alpaca_agentic_start_sha';
const ALPAISTR_AGENTIC_START_BRANCH_META = 'alpaca_agentic_start_branch';

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

	// Load branches from the GitHub repository, so the user can select the AI target branch.
	register_rest_route(
		'alpaca/v1',
		'/agentic/branches',
		[
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'alpaistr_agentic_list_branches_callback',
			'permission_callback' => 'alpaistr_agentic_can_use_permission_check',
		]
	);

	register_rest_route(
		'alpaca/v1',
		'/agentic/request-change',
		[
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'alpaistr_agentic_request_change_callback',
			'permission_callback' => 'alpaistr_agentic_can_use_permission_check',
			'args'                => [
				'issue_id' => [
					'required'          => true,
					'type'              => 'integer',
					'minimum'           => 1,
					'sanitize_callback' => 'absint',
				],
				'notes'    => [
					'required'          => true,
					'type'              => 'string',
					'sanitize_callback' => 'sanitize_textarea_field',
				],
				'force'    => [
					'required' => false,
					'type'     => 'boolean',
					'default'  => false,
				],
			],
		]
	);

	// Helps when opening an issue, to decide what to show: whether Start over / Request a change are allowed, PR state, waiting on an issue, branch reset info, etc. 
	register_rest_route(
		'alpaca/v1',
		'/agentic/start-over-status',
		[
			'methods'             => WP_REST_Server::READABLE,
			'callback'            => 'alpaistr_agentic_start_over_status_callback',
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

	// Closes open GitHub issues/PRs and may reset the branch.
	register_rest_route(
		'alpaca/v1',
		'/agentic/start-over',
		[
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'alpaistr_agentic_start_over_callback',
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

	// Removes a fix attempt from the Alpaca issue. Does not do anything on GitHub.
	register_rest_route(
		'alpaca/v1',
		'/agentic/delete-fix',
		[
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'alpaistr_agentic_delete_fix_callback',
			'permission_callback' => 'alpaistr_agentic_can_use_permission_check',
			'args'                => [
				'issue_id'      => [
					'required'          => true,
					'type'              => 'integer',
					'minimum'           => 1,
					'sanitize_callback' => 'absint',
				],
				'github_number' => [
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
 * Fix with AI (draft/create a GitHub issue, view setup status).
 */
function alpaistr_agentic_can_use_permission_check(): bool|WP_Error {
	if ( ! is_user_logged_in() ) {
		return new WP_Error( 'rest_forbidden', esc_html__( 'Authentication required.', 'alpaca-issue-tracker' ), [ 'status' => 401 ] );
	}
	if ( ! Agentic::current_user_can_use() ) {
		return new WP_Error( 'rest_forbidden', esc_html__( 'Fix with AI is only available to administrators and users granted engineer access.', 'alpaca-issue-tracker' ), [ 'status' => 403 ] );
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

	// Send the selected AI target branch to the GitHub.
	$token            = (string) ( $clean['github_token'] ?? '' );
	$repo             = (string) ( $clean['github_repo'] ?? '' );
	$ai_target_branch = (string) ( $clean['ai_target_branch'] ?? '' );
	if ( '' !== $token && '' !== $repo && '' !== $ai_target_branch ) {
		$repo_parts = alpaistr_agentic_parse_github_repo( $repo );
		if ( ! is_wp_error( $repo_parts ) ) {
			alpaistr_agentic_sync_ai_target_branch_variable( $token, $repo_parts, $ai_target_branch );
		}
	}

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
		return new WP_Error( 'not_configured', esc_html__( 'AI API key is not configured. Visit Project Board → Fix with AI to set it up.', 'alpaca-issue-tracker' ), [ 'status' => 400 ] );
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

	$subissues = array_map( fn( $s ) => $s->post_title, $subissues_raw );

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
 * If is_wp_ai_configured() is true, use WP Connectors API; otherwise, use the AI provider from the plugin settings.
 *
 * @param array $issue_data Structured Alpaca issue data.
 * @param array $settings   Plugin settings.
 * @return array|WP_Error Draft array or error.
 */
function alpaistr_agentic_call_ai( array $issue_data, array $settings ): array|WP_Error {
	$system_prompt = alpaistr_agentic_build_system_prompt( $settings['project_context'] ?? '' );
	$user_message  = alpaistr_agentic_build_user_message( $issue_data );

	if ( Agentic::is_wp_ai_configured() ) {
		$draft = alpaistr_agentic_call_wp_ai( $system_prompt, $user_message );
	} elseif ( ! empty( $settings['ai_api_key'] ) ) {
		if ( 'openai' === $settings['ai_provider'] ) {
			$draft = alpaistr_agentic_call_openai( $system_prompt, $user_message, $settings['ai_api_key'] );
		} else {
			$draft = alpaistr_agentic_call_claude( $system_prompt, $user_message, $settings['ai_api_key'] );
		}
	} else {
		return new WP_Error(
			'ai_not_configured',
			esc_html__( 'No AI provider is configured. Set up an AI provider in Settings → Connectors, or add a custom API key in the Fix with AI settings.', 'alpaca-issue-tracker' ),
			[ 'status' => 400 ]
		);
	}

	if ( is_wp_error( $draft ) ) {
		return $draft;
	}

	return alpaistr_agentic_append_project_context( $draft, $settings['project_context'] ?? '' );
}

/**
 * Append the current project context to a draft body so every GitHub issue
 * carries the latest site-wide notes (re-read from settings on each draft).
 *
 * @param array  $draft           Parsed AI draft.
 * @param string $project_context Site-wide project context from settings.
 * @return array Draft with project context appended when non-empty.
 */
function alpaistr_agentic_append_project_context( array $draft, string $project_context ): array {
	$project_context = trim( sanitize_textarea_field( $project_context ) );
	if ( '' === $project_context ) {
		return $draft;
	}

	$body = rtrim( (string) ( $draft['body'] ?? '' ) );

	// Avoid duplicating if the AI already included an identical section.
	if ( str_contains( $body, "## Project Context\n\n" . $project_context ) ) {
		return $draft;
	}

	$draft['body'] = $body . "\n\n## Project Context\n\n" . $project_context;

	return $draft;
}

/**
 * Build the system prompt that instructs the AI how to format the output.
 *
 * @param string $extra_context Optional project-specific context from settings.
 * @return string System prompt text.
 */
function alpaistr_agentic_build_system_prompt( string $extra_context = '' ): string {
	$path = ALPAISTR_PLUGIN_DIR . 'includes/agentic/draft-agent-ready-issue.md';
	// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- Local plugin file.
	$prompt = is_readable( $path ) ? (string) file_get_contents( $path ) : '';

	$draft_review = Agentic::load_security_file( 'draft-review.md' );
	if ( '' !== $draft_review ) {
		$prompt .= "\n\n" . $draft_review;
	}

	$draft_suitability = Agentic::load_security_file( 'draft-suitability.md' );
	if ( '' !== $draft_suitability ) {
		$prompt .= "\n\n" . $draft_suitability;
	}

	if ( ! empty( $extra_context ) ) {
		$prompt .= "\n\nAdditional project context (use to inform Context and Technical Notes; do not paste this block verbatim — it is appended to the issue automatically):\n" . $extra_context;
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
 * Call the WordPress AI Client (Connectors-backed provider) and return a structured draft.
 *
 * WP picks the configured provider from Settings → Connectors; the system
 * prompt instructs the model to return JSON so no structured-output API is
 * required, keeping this compatible with all registered providers.
 *
 * @param string $system_prompt System instructions for the AI.
 * @param string $user_message  User message containing issue data.
 * @return array|WP_Error Parsed draft or error.
 */
function alpaistr_agentic_call_wp_ai( string $system_prompt, string $user_message ): array|WP_Error {
	$text = wp_ai_client_prompt( $user_message )
		->using_system_instruction( $system_prompt )
		->generate_text();

	if ( is_wp_error( $text ) ) {
		return new WP_Error(
			'ai_request_failed',
			/* translators: %s: error message */
			sprintf( esc_html__( 'AI request failed: %s', 'alpaca-issue-tracker' ), $text->get_error_message() ),
			[ 'status' => 502 ]
		);
	}

	return alpaistr_agentic_parse_draft_text( (string) $text );
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
 * Parse a raw AI text response (expected JSON) into a structured draft array.
 *
 * Strips markdown code fences in case the AI wrapped its output, then
 * decodes JSON and validates the required fields.
 *
 * @param string $text Raw AI text output.
 * @return array|WP_Error Parsed draft or error.
 */
function alpaistr_agentic_parse_draft_text( string $text ): array|WP_Error {
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

	$suspicious        = ! empty( $draft['suspicious'] );
	$suspicious_reason = $suspicious
		? sanitize_text_field( (string) ( $draft['suspicious_reason'] ?? '' ) )
		: '';

	// Missing key defaults to suitable so older model replies still create drafts.
	$suitable_for_agent = ! array_key_exists( 'suitable_for_agent', $draft )
		|| filter_var( $draft['suitable_for_agent'], FILTER_VALIDATE_BOOLEAN );
	$unsuitable_reason  = $suitable_for_agent
		? ''
		: sanitize_text_field( (string) ( $draft['unsuitable_reason'] ?? '' ) );

	return [
		'title'              => sanitize_text_field( $draft['title'] ),
		'body'               => wp_kses_post( $draft['body'] ),
		'complexity'         => in_array( $draft['complexity'] ?? '', [ 'low', 'medium', 'high' ], true )
			? $draft['complexity']
			: 'medium',
		'labels'             => array_map( 'sanitize_text_field', (array) ( $draft['labels'] ?? [] ) ),
		'suspicious'         => $suspicious,
		'suspicious_reason'  => $suspicious_reason,
		'suitable_for_agent' => $suitable_for_agent,
		'unsuitable_reason'  => $unsuitable_reason,
	];
}

/**
 * Parse the raw HTTP response from an AI provider into a draft array.
 *
 * @param array|WP_Error $response The wp_remote_post response.
 * @param string         $provider 'claude' or 'openai'.
 * @return array|WP_Error Parsed draft or error.
 */
function alpaistr_agentic_parse_ai_response( array|WP_Error $response, string $provider ): array|WP_Error {
	$text = alpaistr_agentic_extract_ai_response_text( $response, $provider );
	if ( is_wp_error( $text ) ) {
		return $text;
	}

	return alpaistr_agentic_parse_draft_text( $text );
}

/**
 * Extract plain text from a Claude or OpenAI HTTP response.
 *
 * @param array|WP_Error $response The wp_remote_post response.
 * @param string         $provider 'claude' or 'openai'.
 * @return string|WP_Error Model text or error.
 */
function alpaistr_agentic_extract_ai_response_text( array|WP_Error $response, string $provider ): string|WP_Error {
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

	return (string) $text;
}

/**
 * Parse AI suitability JSON into array.
 *
 * @param string $text Raw AI text output.
 * @return array{suitable_for_agent: bool, unsuitable_reason: string, title: string}|WP_Error
 */
function alpaistr_agentic_parse_suitability_verdict( string $text ): array|WP_Error {
	$text = preg_replace( '/^```(?:json)?\s*/m', '', $text );
	$text = preg_replace( '/\s*```$/m', '', $text );
	$text = trim( (string) $text );

	$verdict = json_decode( $text, true );
	if ( ! is_array( $verdict ) || ! array_key_exists( 'suitable_for_agent', $verdict ) ) {
		return new WP_Error(
			'ai_parse_error',
			esc_html__( 'AI returned an unexpected format. Please try again.', 'alpaca-issue-tracker' ),
			[ 'status' => 502 ]
		);
	}

	$suitable = filter_var( $verdict['suitable_for_agent'], FILTER_VALIDATE_BOOLEAN );
	$reason   = $suitable
		? ''
		: sanitize_text_field( (string) ( $verdict['unsuitable_reason'] ?? '' ) );
	$title    = sanitize_text_field( (string) ( $verdict['title'] ?? '' ) );
	if ( strlen( $title ) > 60 ) {
		$title = rtrim( substr( $title, 0, 57 ) ) . '…';
	}

	return [
		'suitable_for_agent' => $suitable,
		'unsuitable_reason'  => $reason,
		'title'              => $title,
	];
}

/**
 * Ask the configured AI whether Request a change notes are agent-suitable,
 * and generate a short log title for the change.
 *
 * @param string  $notes User-requested change notes.
 * @param WP_Post $post  Alpaca issue post.
 * @return array{suitable_for_agent: bool, unsuitable_reason: string, title: string}|WP_Error
 */
function alpaistr_agentic_evaluate_request_change_notes( string $notes, WP_Post $post ): array|WP_Error {
	$settings = alpaistr_agentic_get_settings();
	$prompt   = Agentic::load_security_file( 'request-change-suitability.md' );
	if ( '' === $prompt ) {
		return [
			'suitable_for_agent' => true,
			'unsuitable_reason'  => '',
			'title'              => alpaistr_agentic_fallback_change_request_title( $notes ),
		];
	}

	$user_message = "Alpaca issue title:\n" . $post->post_title . "\n\nRequested changes:\n" . $notes;
	$text         = alpaistr_agentic_generate_ai_text( $prompt, $user_message, $settings, 400 );
	if ( is_wp_error( $text ) ) {
		return $text;
	}

	return alpaistr_agentic_parse_suitability_verdict( $text );
}

/**
 * Fallback short title when the AI does not return one.
 *
 * @param string $notes User-requested change notes.
 * @return string
 */
function alpaistr_agentic_fallback_change_request_title( string $notes ): string {
	$notes = trim( preg_replace( '/\s+/', ' ', $notes ) ?? '' );
	if ( '' === $notes ) {
		return __( 'Requested changes', 'alpaca-issue-tracker' );
	}

	if ( strlen( $notes ) <= 60 ) {
		return $notes;
	}

	return rtrim( substr( $notes, 0, 57 ) ) . '…';
}

/**
 * Generate raw model text via Connectors or the configured fallback provider.
 *
 * @param string               $system_prompt System instructions.
 * @param string               $user_message  User message.
 * @param array<string, mixed> $settings      Plugin settings.
 * @param int                  $max_tokens    Max completion tokens.
 * @return string|WP_Error
 */
function alpaistr_agentic_generate_ai_text( string $system_prompt, string $user_message, array $settings, int $max_tokens = 3000 ): string|WP_Error {
	if ( Agentic::is_wp_ai_configured() ) {
		$text = wp_ai_client_prompt( $user_message )
			->using_system_instruction( $system_prompt )
			->generate_text();

		if ( is_wp_error( $text ) ) {
			return new WP_Error(
				'ai_request_failed',
				/* translators: %s: error message */
				sprintf( esc_html__( 'AI request failed: %s', 'alpaca-issue-tracker' ), $text->get_error_message() ),
				[ 'status' => 502 ]
			);
		}

		return (string) $text;
	}

	if ( empty( $settings['ai_api_key'] ) ) {
		return new WP_Error(
			'ai_not_configured',
			esc_html__( 'No AI provider is configured. Set up an AI provider in Settings → Connectors, or add a custom API key in the Fix with AI settings.', 'alpaca-issue-tracker' ),
			[ 'status' => 400 ]
		);
	}

	$max_tokens = max( 64, $max_tokens );

	if ( 'openai' === ( $settings['ai_provider'] ?? '' ) ) {
		$response = wp_remote_post(
			'https://api.openai.com/v1/chat/completions',
			[
				'timeout' => 60,
				'headers' => [
					'Authorization' => 'Bearer ' . $settings['ai_api_key'],
					'content-type'  => 'application/json',
				],
				'body'    => wp_json_encode(
					[
						'model'           => 'gpt-4o',
						'max_tokens'      => $max_tokens,
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

		return alpaistr_agentic_extract_ai_response_text( $response, 'openai' );
	}

	$response = wp_remote_post(
		'https://api.anthropic.com/v1/messages',
		[
			'timeout' => 60,
			'headers' => [
				'x-api-key'         => $settings['ai_api_key'],
				'anthropic-version' => '2023-06-01',
				'content-type'      => 'application/json',
			],
			'body'    => wp_json_encode(
				[
					'model'      => 'claude-opus-4-5',
					'max_tokens' => $max_tokens,
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

	return alpaistr_agentic_extract_ai_response_text( $response, 'claude' );
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
			'default_branch'  => $default_branch,
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
	$settings         = alpaistr_agentic_get_settings();
	$token            = $settings['github_token'];
	$repo             = $settings['github_repo'];
	$ai_target_branch = sanitize_text_field( (string) ( $settings['ai_target_branch'] ?? '' ) );

	if ( empty( $token ) ) {
		return new WP_Error( 'not_configured', __( 'GitHub Personal Access Token is not configured.', 'alpaca-issue-tracker' ), [ 'status' => 400 ] );
	}
	if ( empty( $repo ) ) {
		return new WP_Error( 'not_configured', __( 'GitHub repository is not configured.', 'alpaca-issue-tracker' ), [ 'status' => 400 ] );
	}
	if ( '' === $ai_target_branch ) {
		return new WP_Error( 'not_configured', __( 'AI target branch is not configured.', 'alpaca-issue-tracker' ), [ 'status' => 400 ] );
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

	if ( '' !== $ai_target_branch ) {
		alpaistr_agentic_sync_ai_target_branch_variable( $token, $repo_parts, $ai_target_branch );
	}

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

		$content = str_replace( '__ALPACA_AI_TARGET_BRANCH__', $ai_target_branch, $content );

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

	foreach (
		[
			'.github/workflows/apply-staging-fix-to-production.yml',
			'.github/workflows/cherry-pick-fix.yml',
		] as $stale_path
	) {
		$deleted_old = alpaistr_agentic_delete_github_file(
			$token,
			$repo_parts,
			$stale_path,
			$branch_name,
			'Remove ' . basename( $stale_path ) . ' [alpaca-ai-development]'
		);
		if ( ! is_wp_error( $deleted_old ) && true === $deleted_old ) {
			++$committed;
		}
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
				'This pull request was opened by the **Fix with AI** feature in Alpaca Issue Tracker.',
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
				'- `.github/alpaca/security/agent.json` — Claude agent deny-list and untrusted-content policy',
				'',
				'### Next steps after merging',
				'',
				'1. Add `CLAUDE_CODE_OAUTH_TOKEN` to **Settings → Secrets and variables → Secrets**',
				'2. Optionally add `ANTHROPIC_API_KEY` for automated code review',
				'3. Run **Actions → Setup Labels → Run workflow** to create all labels',
				'4. Enable branch protection on the AI target branch and production branch (require review, disable force-push)',
				'',
				'---',
				'_Opened by Alpaca Issue Tracker (Fix with AI) v' . ALPAISTR_VERSION . '_',
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

	// security/ stays plugin-local except agent.json, which is installed explicitly.
	$skip = [ '.', '..', 'index.php', '.DS_Store', 'draft-agent-ready-issue.md', 'security' ];

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

	// Only on the root templates pass: ship CI agent security policy to customer repos.
	if ( '' === $base_path ) {
		$agent_security = Agentic::agent_security_json_path();
		if ( '' !== $agent_security ) {
			$files['alpaca/security/agent.json'] = $agent_security;
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

	$ai_target_branch = sanitize_text_field( (string) ( $settings['ai_target_branch'] ?? '' ) );
	if ( '' === $ai_target_branch ) {
		return new WP_Error( 'not_configured', esc_html__( 'AI target branch is not configured.', 'alpaca-issue-tracker' ), [ 'status' => 400 ] );
	}

	$labels = array_values(
		array_filter(
			$labels,
			static function ( $label_name ): bool {
				return is_string( $label_name ) && ! str_starts_with( $label_name, 'target-branch:' );
			}
		)
	);
	$labels[] = 'target-branch:' . $ai_target_branch;

	// agent-ready must be applied in a separate API call so GitHub fires the
	// issues.labeled webhook and Agent-Ready Auto-Trigger runs immediately.
	$apply_agent_ready = in_array( 'agent-ready', $labels, true );
	$create_labels     = array_values( array_diff( $labels, [ 'agent-ready' ] ) );

	$repo_parts = alpaistr_agentic_parse_github_repo( $repo );
	if ( is_wp_error( $repo_parts ) ) {
		return $repo_parts;
	}

	$current_attempt_has_sent = false;
	foreach ( alpaistr_agentic_current_attempt_entries( $issue_id ) as $entry ) {
		if ( 'sent' === ( $entry['type'] ?? '' ) ) {
			$current_attempt_has_sent = true;
			break;
		}
	}

	if ( $current_attempt_has_sent ) {
		$open_work_branch = (string) get_post_meta( $issue_id, ALPAISTR_AGENTIC_START_BRANCH_META, true );
		if ( '' === $open_work_branch ) {
			$open_work_branch = $ai_target_branch;
		}

		$work = alpaistr_agentic_task_github_work_status( $token, $repo_parts, $issue_id, $open_work_branch );
		if ( ! empty( $work['has_open_work'] ) ) {
			$message = ! empty( $work['has_open_pr'] )
				? esc_html__( 'Wait for the in-progress AI pull request to merge or be closed, or use Start over.', 'alpaca-issue-tracker' )
				: esc_html__( 'The AI is still working on a GitHub issue. Wait for a pull request, or use Start over.', 'alpaca-issue-tracker' );

			return new WP_Error(
				'request_change_blocked',
				$message,
				[ 'status' => 409 ]
			);
		}

		alpaistr_agentic_close_abandoned_github_issues( $token, $repo_parts, $issue_id, $open_work_branch );
	}

	foreach ( $create_labels as $label_name ) {
		if ( is_string( $label_name ) && str_starts_with( $label_name, 'target-branch:' ) ) {
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

	$github_url    = esc_url_raw( $gh_data['html_url'] ?? '' );
	$github_number = (int) ( $gh_data['number'] ?? 0 );

	alpaistr_agentic_remember_start_sha( $issue_id, $token, $repo_parts, $ai_target_branch );

	$history = alpaistr_agentic_record_sent_activity(
		$issue_id,
		$github_url,
		$github_number,
		$ai_target_branch,
		alpaistr_agentic_build_draft_snapshot( $title, $body, $labels )
	);
	alpaistr_agentic_insert_sent_activity_comment( $issue_id, $github_url, $ai_target_branch );
	alpaistr_agentic_assign_sent_to_ai_label( $issue_id );

	return rest_ensure_response(
		[
			'url'           => $github_url,
			'github_number' => $github_number,
			'status'        => 'sent',
			'target_branch' => $ai_target_branch,
			'history'       => $history,
		]
	);
}

/**
 * Request a change: comment on in-flight GitHub work, or open a new issue/PR.
 *
 * Open pull request → comment on that PR so the agent updates it.
 * Open GitHub issue with no PR yet → comment on that issue.
 * Merged PR → new GitHub issue asking for a follow-up PR on top of the merge.
 * Closed without merging → new GitHub issue that retries the original work
 * plus the requested changes.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response|WP_Error
 */
function alpaistr_agentic_request_change_callback( WP_REST_Request $request ): WP_REST_Response|WP_Error {
	$issue_id = (int) $request->get_param( 'issue_id' );
	$post     = alpaistr_agentic_require_issue_post( $issue_id );
	if ( is_wp_error( $post ) ) {
		return $post;
	}

	$notes = trim( (string) $request->get_param( 'notes' ) );
	if ( '' === $notes ) {
		return new WP_Error(
			'invalid_notes',
			esc_html__( 'Describe the changes you want.', 'alpaca-issue-tracker' ),
			[ 'status' => 400 ]
		);
	}

	$force       = (bool) $request->get_param( 'force' );
	$verdict     = alpaistr_agentic_evaluate_request_change_notes( $notes, $post );
	$notes_title = '';

	if ( ! is_wp_error( $verdict ) ) {
		$notes_title = trim( (string) ( $verdict['title'] ?? '' ) );
		// Fail open when the classifier itself errors so Request a change is not bricked.
		if ( ! $force && empty( $verdict['suitable_for_agent'] ) ) {
			$reason = (string) ( $verdict['unsuitable_reason'] ?? '' );
			if ( '' === $reason ) {
				$reason = __(
					'These notes are not suitable for the GitHub agentic workflow. Request a change only sends follow-up instructions for bounded code changes in the connected repository.',
					'alpaca-issue-tracker'
				);
			}

			return new WP_Error(
				'unsuitable_for_agent',
				$reason,
				[
					'status'             => 422,
					'unsuitable_reason'  => $reason,
					'suitable_for_agent' => false,
				]
			);
		}
	}

	if ( '' === $notes_title ) {
		$notes_title = alpaistr_agentic_fallback_change_request_title( $notes );
	}

	$work = alpaistr_agentic_evaluate_start_over( $issue_id );
	if ( is_wp_error( $work ) ) {
		return $work;
	}

	if ( empty( $work['allowed'] ) ) {
		return new WP_Error(
			'request_change_blocked',
			esc_html__( 'Send this issue with Fix with AI before requesting a change.', 'alpaca-issue-tracker' ),
			[ 'status' => 409 ]
		);
	}

	$open_pr              = is_array( $work['pull_request'] ?? null ) ? $work['pull_request'] : null;
	$has_open_pr          = ! empty( $work['has_open_pr'] )
		&& is_array( $open_pr )
		&& (int) ( $open_pr['number'] ?? 0 ) > 0
		&& empty( $open_pr['merged'] )
		&& 'closed' !== ( $open_pr['state'] ?? '' );
	$waiting_issue_number = (int) ( $work['waiting_issue_number'] ?? 0 );
	$has_merged_pr        = ! empty( $work['has_merged_pr'] );

	if ( $has_open_pr ) {
		return alpaistr_agentic_request_change_comment(
			$issue_id,
			$work,
			(int) $open_pr['number'],
			$notes,
			$notes_title,
			'pr',
			(string) ( $open_pr['url'] ?? '' )
		);
	}

	if ( ! empty( $work['has_open_work'] ) && $waiting_issue_number > 0 ) {
		return alpaistr_agentic_request_change_comment(
			$issue_id,
			$work,
			$waiting_issue_number,
			$notes,
			$notes_title,
			'issue',
			''
		);
	}

	return alpaistr_agentic_request_change_create_issue(
		$issue_id,
		$notes,
		$notes_title,
		$has_merged_pr ? 'create_pr' : 'retry_pr'
	);
}

/**
 * Post requested changes as a GitHub comment on an open PR or issue.
 *
 * @param int                  $issue_id      Alpaca issue post ID.
 * @param array<string, mixed> $work          Live GitHub work status.
 * @param int                  $github_number GitHub issue or pull request number.
 * @param string               $notes         User-requested changes.
 * @param string               $notes_title   Short AI title for the AI Log.
 * @param string               $target        'pr' or 'issue'.
 * @param string               $fallback_url  Known HTML URL when available.
 * @return WP_REST_Response|WP_Error
 */
function alpaistr_agentic_request_change_comment(
	int $issue_id,
	array $work,
	int $github_number,
	string $notes,
	string $notes_title,
	string $target,
	string $fallback_url
): WP_REST_Response|WP_Error {
	$token      = (string) ( $work['token'] ?? '' );
	$repo_parts = is_array( $work['repo_parts'] ?? null ) ? $work['repo_parts'] : [];
	if ( '' === $token || empty( $repo_parts['owner'] ) || empty( $repo_parts['name'] ) ) {
		return new WP_Error( 'not_configured', esc_html__( 'GitHub token or repository is not configured.', 'alpaca-issue-tracker' ), [ 'status' => 400 ] );
	}

	$comment = alpaistr_agentic_post_github_issue_comment(
		$token,
		$repo_parts,
		$github_number,
		alpaistr_agentic_build_request_change_comment_body( $notes, $target )
	);
	if ( is_wp_error( $comment ) ) {
		return $comment;
	}

	$comment_url = esc_url_raw( (string) ( $comment['html_url'] ?? '' ) );
	if ( '' === $comment_url ) {
		$comment_url = esc_url_raw( $fallback_url );
	}
	if ( '' === $comment_url ) {
		$comment_url = esc_url_raw(
			sprintf(
				'https://github.com/%s/%s/issues/%d',
				$repo_parts['owner'],
				$repo_parts['name'],
				$github_number
			)
		);
	}

	alpaistr_agentic_save_current_attempt_follow_up_notes(
		$issue_id,
		array_merge( alpaistr_agentic_current_attempt_follow_up_notes( $issue_id ), [ $notes ] )
	);

	$pr_url    = 'pr' === $target ? $fallback_url : '';
	$pr_number = 'pr' === $target ? $github_number : 0;
	if ( 'pr' === $target && is_array( $work['pull_request'] ?? null ) ) {
		if ( '' === $pr_url ) {
			$pr_url = (string) ( $work['pull_request']['url'] ?? '' );
		}
		if ( $pr_number <= 0 ) {
			$pr_number = (int) ( $work['pull_request']['number'] ?? 0 );
		}
	}

	if ( '' === trim( $notes_title ) ) {
		$notes_title = alpaistr_agentic_fallback_change_request_title( $notes );
	}

	alpaistr_agentic_append_history_entry(
		$issue_id,
		[
			'type'          => 'change_requested',
			'url'           => $comment_url,
			'notes'         => $notes_title,
			'notes_full'    => $notes,
			'target'        => $target,
			'pr_url'        => esc_url_raw( $pr_url ),
			'pr_number'     => $pr_number,
			'github_number' => 'issue' === $target
				? $github_number
				: (int) ( $work['pull_request']['github_issue_number'] ?? 0 ),
			'occurred_at'   => gmdate( 'c' ),
		]
	);

	if ( 'pr' === $target ) {
		$content = sprintf(
			/* translators: %s: GitHub pull request or comment URL. */
			__( 'Fix with AI: requested changes posted on the open pull request — [%1$s](%1$s).', 'alpaca-issue-tracker' ), // phpcs:ignore WordPress.WP.I18n.UnorderedPlaceholdersText -- URL repeated for markdown link.
			$comment_url
		);
	} else {
		$content = sprintf(
			/* translators: %s: GitHub issue or comment URL. */
			__( 'Fix with AI: requested changes posted on the GitHub issue — [%1$s](%1$s).', 'alpaca-issue-tracker' ), // phpcs:ignore WordPress.WP.I18n.UnorderedPlaceholdersText -- URL repeated for markdown link.
			$comment_url
		);
	}
	alpaistr_agentic_insert_activity_comment( $issue_id, $content, 'agentic-sent' );

	return rest_ensure_response(
		[
			'url'    => $comment_url,
			'action' => 'commented',
			'mode'   => 'pr' === $target ? 'comment_pr' : 'comment_issue',
		]
	);
}

/**
 * Open a new GitHub issue for a follow-up or retry pull request.
 *
 * @param int    $issue_id    Alpaca issue post ID.
 * @param string $notes       User-requested changes.
 * @param string $notes_title Short AI title for the follow-up issue / AI Log.
 * @param string $mode        'create_pr' or 'retry_pr'.
 * @return WP_REST_Response|WP_Error
 */
function alpaistr_agentic_request_change_create_issue( int $issue_id, string $notes, string $notes_title, string $mode ): WP_REST_Response|WP_Error {
	$drafts   = alpaistr_agentic_current_attempt_sent_drafts( $issue_id );
	$template = alpaistr_agentic_original_agent_ready_draft( $drafts );
	if ( ! is_array( $template ) ) {
		return new WP_Error(
			'missing_draft',
			esc_html__( 'The original GitHub issue draft is missing.', 'alpaca-issue-tracker' ),
			[ 'status' => 409 ]
		);
	}

	$all_notes = array_merge( alpaistr_agentic_current_attempt_follow_up_notes( $issue_id ), [ $notes ] );
	$original  = alpaistr_agentic_strip_follow_up_sections( (string) ( $template['body'] ?? '' ) );
	$body      = 'retry_pr' === $mode
		? alpaistr_agentic_build_retry_issue_body( $original, $all_notes )
		: alpaistr_agentic_build_follow_up_issue_body( $original, $all_notes );

	$complexity      = (string) ( $template['complexity'] ?? 'medium' );
	$previous_labels = is_array( $template['labels'] ?? null ) ? $template['labels'] : [];
	$allowed_labels  = [ 'bug', 'enhancement', 'agent-candidate', 'agent-ready' ];
	$labels          = array_values(
		array_unique(
			array_merge(
				array_values(
					array_filter(
						$previous_labels,
						static function ( $label_name ) use ( $allowed_labels ): bool {
							return is_string( $label_name ) && in_array( $label_name, $allowed_labels, true );
						}
					)
				),
				[ 'complexity:' . $complexity, 'agent-ready' ]
			)
		)
	);

	if ( '' === trim( $notes_title ) ) {
		$notes_title = alpaistr_agentic_fallback_change_request_title( $notes );
	}

	$create_request = new WP_REST_Request( 'POST', '/alpaca/v1/agentic/create' );
	$create_request->set_param( 'issue_id', $issue_id );
	$create_request->set_param( 'title', $notes_title );
	$create_request->set_param( 'body', $body );
	$create_request->set_param( 'labels', $labels );

	$response = alpaistr_agentic_create_callback( $create_request );
	if ( is_wp_error( $response ) ) {
		return $response;
	}

	alpaistr_agentic_save_current_attempt_follow_up_notes( $issue_id, $all_notes );

	$data           = $response->get_data();
	$data           = is_array( $data ) ? $data : [];
	$data['action'] = 'created';
	$data['mode']   = $mode;

	return rest_ensure_response( $data );
}

/**
 * Post a comment on a GitHub issue or pull request conversation.
 *
 * @param string                             $token      GitHub token.
 * @param array{owner: string, name: string} $repo_parts Parsed repository.
 * @param int                                $number     Issue or pull request number.
 * @param string                             $body       Comment markdown.
 * @return array<string, mixed>|WP_Error
 */
function alpaistr_agentic_post_github_issue_comment( string $token, array $repo_parts, int $number, string $body ): array|WP_Error {
	if ( $number <= 0 || '' === $body ) {
		return new WP_Error( 'invalid_comment', esc_html__( 'Could not post the requested changes to GitHub.', 'alpaca-issue-tracker' ), [ 'status' => 400 ] );
	}

	$response = wp_remote_post(
		sprintf(
			'https://api.github.com/repos/%s/%s/issues/%d/comments',
			rawurlencode( $repo_parts['owner'] ),
			rawurlencode( $repo_parts['name'] ),
			$number
		),
		[
			'timeout' => 30,
			'headers' => alpaistr_agentic_github_api_headers( $token ),
			'body'    => wp_json_encode(
				[
					'body' => $body,
				]
			),
		]
	);

	if ( is_wp_error( $response ) ) {
		return new WP_Error(
			'github_request_failed',
			sprintf(
				/* translators: %s: error message */
				esc_html__( 'GitHub request failed: %s', 'alpaca-issue-tracker' ),
				$response->get_error_message()
			),
			[ 'status' => 502 ]
		);
	}

	$code = (int) wp_remote_retrieve_response_code( $response );
	$data = json_decode( wp_remote_retrieve_body( $response ), true );

	if ( $code >= 400 || ! is_array( $data ) ) {
		return new WP_Error(
			'github_api_error',
			alpaistr_agentic_format_github_error_message( $code, is_array( $data ) ? $data : [], $repo_parts ),
			[ 'status' => 502 ]
		);
	}

	return $data;
}

/**
 * Comment body that asks the AI agent to apply requested changes in place.
 *
 * @param string $notes  User-requested changes.
 * @param string $target 'pr' or 'issue'.
 * @return string GitHub markdown.
 */
function alpaistr_agentic_build_request_change_comment_body( string $notes, string $target ): string {
	if ( 'pr' === $target ) {
		$instructions = 'These notes are follow-up changes for this open pull request. Update this PR: commit to this PR\'s existing branch and push. Do not open a new pull request. Do not create a new GitHub issue.';
	} else {
		$instructions = 'The GitHub issue is still in progress and no pull request is open yet. Incorporate these changes into the current implementation before you open a pull request. Do not open a second GitHub issue.';
	}

	return implode(
		"\n",
		[
			'@claude',
			'',
			'## Requested changes (from Alpaca)',
			'',
			$notes,
			'',
			$instructions,
		]
	);
}

/**
 * Draft snapshots from the current attempt's sent GitHub issues, oldest first.
 *
 * @param int $issue_id Alpaca issue post ID.
 * @return array<int, array<string, mixed>>
 */
function alpaistr_agentic_current_attempt_sent_drafts( int $issue_id ): array {
	$drafts = [];
	foreach ( alpaistr_agentic_current_attempt_entries( $issue_id ) as $entry ) {
		if ( 'sent' !== ( $entry['type'] ?? '' ) || ! is_array( $entry['draft'] ?? null ) ) {
			continue;
		}
		$drafts[] = $entry['draft'];
	}
	return $drafts;
}

/**
 * Original agent-ready draft (full GitHub issue template).
 *
 * @param array<int, array<string, mixed>> $drafts Sent drafts, oldest first.
 * @return array<string, mixed>|null
 */
function alpaistr_agentic_original_agent_ready_draft( array $drafts ): array|null {
	foreach ( $drafts as $draft ) {
		if ( preg_match( '/(^|\n)## Summary(\s|$)/', (string) ( $draft['body'] ?? '' ) ) ) {
			return $draft;
		}
	}
	return $drafts[0] ?? null;
}

/**
 * Remove follow-up sections so the original template can be reused.
 *
 * @param string $body GitHub issue body.
 * @return string Body without follow-up sections.
 */
function alpaistr_agentic_strip_follow_up_sections( string $body ): string {
	$text = $body;
	if ( preg_match( '/^## Follow-up requests\s*$/m', $text, $matches, PREG_OFFSET_CAPTURE ) ) {
		$text = substr( $text, 0, (int) $matches[0][1] );
	}
	if ( ! preg_match( '/(^|\n)## Summary(\s|$)/', $text ) && preg_match( '/^## Requested changes\s*$/m', $text, $matches, PREG_OFFSET_CAPTURE ) ) {
		$text = substr( $text, 0, (int) $matches[0][1] );
	}
	return rtrim( $text );
}

/**
 * Pull follow-up request notes out of a previously sent GitHub issue body.
 *
 * @param string $body GitHub issue body.
 * @return array<int, string>
 */
function alpaistr_agentic_extract_follow_up_notes( string $body ): array {
	if ( preg_match( '/^## Follow-up requests\s*\n([\s\S]*)$/m', $body, $follow_up_match ) ) {
		$parts = preg_split( '/^### Request \d+\s*$/m', $follow_up_match[1] );
		$notes = [];
		foreach ( is_array( $parts ) ? $parts : [] as $part ) {
			$part = trim( (string) $part );
			if ( '' === $part || str_starts_with( $part, 'The original issue above was already implemented' ) || str_starts_with( $part, 'The previous AI pull request was closed without merging' ) ) {
				continue;
			}
			$notes[] = $part;
		}
		return $notes;
	}

	if ( ! preg_match( '/(^|\n)## Summary(\s|$)/', $body ) && preg_match( '/^## Requested changes\s*\n+([\s\S]*?)(?:\n+Implement these changes[\s\S]*)?$/', $body, $legacy_match ) ) {
		$note = trim( (string) ( $legacy_match[1] ?? '' ) );
		return '' !== $note ? [ $note ] : [];
	}

	return [];
}

/**
 * Follow-up notes stored on this attempt, oldest first.
 *
 * @param int $issue_id Alpaca issue post ID.
 * @return array<int, string>
 */
function alpaistr_agentic_current_attempt_follow_up_notes( int $issue_id ): array {
	$history = alpaistr_agentic_get_activity_history( $issue_id );
	$index   = alpaistr_agentic_current_attempt_original_sent_index( $history );
	if ( $index >= 0 && isset( $history[ $index ]['follow_up_notes'] ) && is_array( $history[ $index ]['follow_up_notes'] ) ) {
		$notes = [];
		foreach ( $history[ $index ]['follow_up_notes'] as $note ) {
			$note = trim( (string) $note );
			if ( '' !== $note ) {
				$notes[] = $note;
			}
		}
		return $notes;
	}

	$drafts = alpaistr_agentic_current_attempt_sent_drafts( $issue_id );
	if ( count( $drafts ) < 2 ) {
		return [];
	}

	$last_draft = $drafts[ count( $drafts ) - 1 ];
	$last_body  = (string) ( $last_draft['body'] ?? '' );
	if ( preg_match( '/^## Follow-up requests\s*$/m', $last_body ) ) {
		return alpaistr_agentic_extract_follow_up_notes( $last_body );
	}

	$notes = [];
	for ( $i = 1, $count = count( $drafts ); $i < $count; $i++ ) {
		$notes = array_merge( $notes, alpaistr_agentic_extract_follow_up_notes( (string) ( $drafts[ $i ]['body'] ?? '' ) ) );
	}
	return $notes;
}

/**
 * Persist follow-up notes on the original sent entry for this attempt.
 *
 * @param int                $issue_id Alpaca issue post ID.
 * @param array<int, string> $notes    Notes, oldest first.
 */
function alpaistr_agentic_save_current_attempt_follow_up_notes( int $issue_id, array $notes ): void {
	$history = alpaistr_agentic_get_activity_history( $issue_id );
	$index   = alpaistr_agentic_current_attempt_original_sent_index( $history );
	if ( $index < 0 ) {
		return;
	}

	$clean = [];
	foreach ( $notes as $note ) {
		$note = trim( (string) $note );
		if ( '' !== $note ) {
			$clean[] = $note;
		}
	}

	$history[ $index ]['follow_up_notes'] = $clean;
	update_post_meta( $issue_id, ALPAISTR_AGENTIC_HISTORY_META, $history );
}

/**
 * Index of the original sent entry after the latest start-over.
 *
 * @param array<int, array<string, mixed>> $history Full activity history.
 * @return int Index, or -1 when missing.
 */
function alpaistr_agentic_current_attempt_original_sent_index( array $history ): int {
	$last_revert = -1;
	foreach ( $history as $index => $entry ) {
		if ( 'reverted' === ( $entry['type'] ?? '' ) ) {
			$last_revert = (int) $index;
		}
	}

	$first_sent = -1;
	for ( $index = $last_revert + 1, $count = count( $history ); $index < $count; $index++ ) {
		if ( 'sent' !== ( $history[ $index ]['type'] ?? '' ) ) {
			continue;
		}
		if ( -1 === $first_sent ) {
			$first_sent = $index;
		}
		$body = (string) ( $history[ $index ]['draft']['body'] ?? '' );
		if ( preg_match( '/(^|\n)## Summary(\s|$)/', $body ) ) {
			return $index;
		}
	}

	return $first_sent;
}

/**
 * Original agent-ready template plus every follow-up request.
 *
 * @param string             $original_body Original GitHub issue body.
 * @param array<int, string> $notes         Follow-up notes, oldest first.
 * @return string GitHub issue body.
 */
function alpaistr_agentic_build_follow_up_issue_body( string $original_body, array $notes ): string {
	$requests = [];
	foreach ( $notes as $index => $note ) {
		$requests[] = '### Request ' . ( $index + 1 ) . "\n\n" . $note;
	}

	return implode(
		"\n",
		[
			rtrim( $original_body ),
			'',
			'## Follow-up requests',
			'',
			'The original issue above was already implemented. Apply the follow-up requests below on the current AI target branch and open a pull request into that branch.',
			'',
			implode( "\n\n", $requests ),
		]
	);
}

/**
 * Original template plus requested changes after a PR was closed without merging.
 *
 * @param string             $original_body Original GitHub issue body.
 * @param array<int, string> $notes         Follow-up notes, oldest first.
 * @return string GitHub issue body.
 */
function alpaistr_agentic_build_retry_issue_body( string $original_body, array $notes ): string {
	$requests = [];
	foreach ( $notes as $index => $note ) {
		$requests[] = '### Request ' . ( $index + 1 ) . "\n\n" . $note;
	}

	return implode(
		"\n",
		[
			rtrim( $original_body ),
			'',
			'## Follow-up requests',
			'',
			'The previous AI pull request was closed without merging. Implement the original issue above, including the follow-up requests below, and open a pull request into the current AI target branch.',
			'',
			implode( "\n\n", $requests ),
		]
	);
}

/**
 * Load an Alpaca issue post or return a not-found error.
 *
 * @param int $issue_id Alpaca issue post ID.
 * @return WP_Post|WP_Error
 */
function alpaistr_agentic_require_issue_post( int $issue_id ): WP_Post|WP_Error {
	$post = get_post( $issue_id );
	if ( ! $post || 'alpaca_issue' !== $post->post_type ) {
		return new WP_Error( 'not_found', esc_html__( 'Alpaca issue not found.', 'alpaca-issue-tracker' ), [ 'status' => 404 ] );
	}

	return $post;
}

/**
 * List GitHub branches for the configured repository.
 *
 * @return WP_REST_Response|WP_Error
 */
function alpaistr_agentic_list_branches_callback(): WP_REST_Response|WP_Error {
	$settings = alpaistr_agentic_get_settings();
	$token    = $settings['github_token'];
	$repo     = $settings['github_repo'];

	if ( empty( $token ) || empty( $repo ) ) {
		return new WP_Error( 'not_configured', esc_html__( 'GitHub token or repository is not configured.', 'alpaca-issue-tracker' ), [ 'status' => 400 ] );
	}

	$repo_parts = alpaistr_agentic_parse_github_repo( $repo );
	if ( is_wp_error( $repo_parts ) ) {
		return $repo_parts;
	}

	$branches = alpaistr_agentic_fetch_github_branches( $token, $repo_parts );
	if ( is_wp_error( $branches ) ) {
		return $branches;
	}

	return rest_ensure_response(
		[
			'branches' => $branches,
		]
	);
}

/**
 * Return whether Start over and Request a change are allowed for this issue,
 * plus the live GitHub pull request linked to this Alpaca task.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response|WP_Error
 */
function alpaistr_agentic_start_over_status_callback( WP_REST_Request $request ): WP_REST_Response|WP_Error {
	$issue_id = (int) $request->get_param( 'issue_id' );
	$post     = alpaistr_agentic_require_issue_post( $issue_id );
	if ( is_wp_error( $post ) ) {
		return $post;
	}

	$result = alpaistr_agentic_evaluate_start_over( $issue_id );
	if ( is_wp_error( $result ) ) {
		return $result;
	}

	$has_open_work        = ! empty( $result['has_open_work'] );
	$has_merged_pr        = ! empty( $result['has_merged_pr'] );
	$has_open_pr          = ! empty( $result['has_open_pr'] );
	$has_sent             = ! empty( $result['allowed'] );
	$waiting_on_issue     = ! empty( $result['waiting_on_issue'] );
	$waiting_issue_number = (int) ( $result['waiting_issue_number'] ?? 0 );

	$request_change_mode   = '';
	$request_change_reason = '';
	if ( $has_sent ) {
		if ( $has_open_pr ) {
			$request_change_mode = 'comment_pr';
		} elseif ( $has_open_work ) {
			$request_change_mode = 'comment_issue';
		} elseif ( $has_merged_pr ) {
			$request_change_mode = 'create_pr';
		} else {
			$request_change_mode = 'retry_pr';
		}
	}

	$pull_requests = array_values(
		array_filter(
			(array) ( $result['pull_requests'] ?? [] ),
			static function ( $pull_request ): bool {
				return is_array( $pull_request );
			}
		)
	);
	$pull_request  = is_array( $result['pull_request'] ?? null ) ? $result['pull_request'] : null;
	if ( null === $pull_request && ! empty( $pull_requests[0] ) ) {
		$pull_request = $pull_requests[0];
	}

	return rest_ensure_response(
		[
			'allowed'                => (bool) $result['allowed'],
			'reason'                 => (string) $result['reason'],
			'request_change_allowed' => $has_sent,
			'request_change_reason'  => $request_change_reason,
			'request_change_mode'    => $request_change_mode,
			'primary_action'         => $has_sent ? 'request_change' : 'fix',
			'has_open_work'          => $has_open_work,
			'has_merged_pr'          => $has_merged_pr,
			'has_open_pr'            => $has_open_pr,
			'waiting_on_issue'       => $waiting_on_issue,
			'waiting_issue_number'   => $waiting_issue_number,
			'pull_request'           => $pull_request,
			'pull_requests'          => $pull_requests,
			'can_reset_branch'       => ! empty( $result['can_reset_branch'] ),
			'will_reset_branch'      => ! empty( $result['will_reset_branch'] ),
			'has_outside_commits'    => ! empty( $result['has_outside_commits'] ),
			'reset_blocked_reason'   => (string) ( $result['reset_blocked_reason'] ?? '' ),
			'branch'                 => (string) ( $result['branch'] ?? '' ),
		]
	);
}

/**
 * End the current fixing session: close in-flight GitHub work and start fresh.
 *
 * Always closes every still-open GitHub issue and pull request from this task.
 * If the target branch only gained this session's AI commits, its head is moved
 * back to the snapshot from before the session. Other commits leave the branch
 * as it is. Re-checks GitHub at click time in case work landed after the button
 * was shown.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response|WP_Error
 */
function alpaistr_agentic_start_over_callback( WP_REST_Request $request ): WP_REST_Response|WP_Error {
	$issue_id = (int) $request->get_param( 'issue_id' );
	$post     = alpaistr_agentic_require_issue_post( $issue_id );
	if ( is_wp_error( $post ) ) {
		return $post;
	}

	$result = alpaistr_agentic_evaluate_start_over( $issue_id );
	if ( is_wp_error( $result ) ) {
		return $result;
	}

	if ( empty( $result['allowed'] ) ) {
		return new WP_Error(
			'start_over_blocked',
			$result['reason'],
			[ 'status' => 409 ]
		);
	}

	$token      = $result['token'];
	$repo_parts = $result['repo_parts'];
	$branch     = $result['branch'];

	alpaistr_agentic_close_open_github_work( $token, $repo_parts, $issue_id, $branch );
	alpaistr_agentic_mark_unmerged_sent_pull_requests_closed( $issue_id );

	$plan                 = alpaistr_agentic_target_branch_reset_plan( $token, $repo_parts, $issue_id, $branch );
	$branch_reset         = false;
	$branch_reset_error   = '';
	$will_reset           = ! empty( $plan['will_reset_branch'] );
	$has_outside_commits  = ! empty( $plan['has_outside_commits'] );
	$reset_blocked_reason = (string) ( $plan['reset_blocked_reason'] ?? '' );

	if ( $will_reset ) {
		$moved = alpaistr_agentic_force_update_branch_sha(
			$token,
			$repo_parts,
			$branch,
			(string) $plan['start_sha']
		);
		if ( is_wp_error( $moved ) ) {
			$branch_reset_error = $moved->get_error_message();
		} else {
			$branch_reset = true;
		}
	}

	delete_post_meta( $issue_id, ALPAISTR_AGENTIC_START_SHA_META );
	delete_post_meta( $issue_id, ALPAISTR_AGENTIC_START_BRANCH_META );

	$branch_reset_note = alpaistr_agentic_branch_reset_outcome_note(
		$branch_reset,
		$branch_reset_error,
		$has_outside_commits,
		(string) ( $plan['start_sha'] ?? '' ),
		$reset_blocked_reason
	);

	$history = alpaistr_agentic_append_history_entry(
		$issue_id,
		[
			'type'              => 'reverted',
			'pr_url'            => '',
			'branch_reset'      => $branch_reset,
			'branch_reset_note' => $branch_reset_note,
			'occurred_at'       => gmdate( 'c' ),
		]
	);

	alpaistr_agentic_insert_reverted_activity_comment( $issue_id, $branch_reset_note );

	return rest_ensure_response(
		[
			'success'              => true,
			'pr_url'               => '',
			'history'              => $history,
			'branch_reset'         => $branch_reset,
			'branch_reset_error'   => $branch_reset_error,
			'reset_blocked_reason' => $reset_blocked_reason,
			'has_outside_commits'  => $has_outside_commits,
			'will_reset_branch'    => $will_reset,
		]
	);
}

/**
 * Remove one sent AI fix (and its stored draft) from Alpaca history. Never touches GitHub.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response|WP_Error
 */
function alpaistr_agentic_delete_fix_callback( WP_REST_Request $request ): WP_REST_Response|WP_Error {
	$issue_id      = (int) $request->get_param( 'issue_id' );
	$github_number = (int) $request->get_param( 'github_number' );

	$post = alpaistr_agentic_require_issue_post( $issue_id );
	if ( is_wp_error( $post ) ) {
		return $post;
	}

	$history = alpaistr_agentic_get_activity_history( $issue_id );
	$kept    = [];
	$removed = false;

	foreach ( $history as $entry ) {
		if ( 'sent' === ( $entry['type'] ?? '' ) && (int) ( $entry['github_number'] ?? 0 ) === $github_number ) {
			$removed = true;
			continue;
		}
		$kept[] = $entry;
	}

	if ( ! $removed ) {
		return new WP_Error( 'not_found', esc_html__( 'That AI fix was not found on this issue.', 'alpaca-issue-tracker' ), [ 'status' => 404 ] );
	}

	update_post_meta( $issue_id, ALPAISTR_AGENTIC_HISTORY_META, $kept );

	return rest_ensure_response(
		[
			'success' => true,
			'history' => $kept,
		]
	);
}

/**
 * Working branch the agent creates for a GitHub issue.
 *
 * @param int $issue_number GitHub issue number.
 * @return string Branch name, e.g. agent/fix-142.
 */
function alpaistr_agentic_working_branch_name( int $issue_number ): string {
	return 'agent/fix-' . $issue_number;
}

/**
 * Find the pull request opened by the AI agent for a given issue, preferring a merged one.
 *
 * The agent workflows create branches named `agent/fix-<number>` targeting the chosen
 * branch directly (see agent-ready-trigger.yml). Older PRs used `agent/issue-<number>`.
 * Filtering GitHub's pull list by those head branches and the base branch is precise --
 * unlike scanning PR bodies for a "Closes #N" keyword, which any unrelated PR mentioning
 * the issue number could also match.
 *
 * @param string                             $token        GitHub personal access token.
 * @param array{owner: string, name: string} $repo_parts   Parsed repository.
 * @param int                                $issue_number GitHub issue number the PR should close.
 * @param string                             $base_branch  Branch the PR should target.
 * @return array<string, mixed>|null Pull request data, or null when no match is found.
 */
function alpaistr_agentic_find_pr_for_issue( string $token, array $repo_parts, int $issue_number, string $base_branch ): ?array {
	$head_branches = [
		alpaistr_agentic_working_branch_name( $issue_number ),
		'agent/issue-' . $issue_number,
	];

	foreach ( $head_branches as $head_branch ) {
		$pr = alpaistr_agentic_find_pr_by_head_and_base( $token, $repo_parts, $head_branch, $base_branch );
		if ( $pr ) {
			return $pr;
		}
	}

	return null;
}

/**
 * Every pull request opened from a GitHub issue's AI working branches.
 *
 * Request a change creates a new GitHub issue and a new PR; a task may have
 * several. Start over closes every still-open one.
 *
 * @param string                             $token        GitHub personal access token.
 * @param array{owner: string, name: string} $repo_parts   Parsed repository.
 * @param int                                $issue_number GitHub issue number the PR should close.
 * @param string                             $base_branch  Branch the PR should target.
 * @return array<int, array<string, mixed>> Pull request payloads.
 */
function alpaistr_agentic_find_all_prs_for_issue( string $token, array $repo_parts, int $issue_number, string $base_branch ): array {
	$head_branches = [
		alpaistr_agentic_working_branch_name( $issue_number ),
		'agent/issue-' . $issue_number,
	];
	$found         = [];

	foreach ( $head_branches as $head_branch ) {
		foreach ( alpaistr_agentic_list_prs_by_head_and_base( $token, $repo_parts, $head_branch, $base_branch ) as $pull ) {
			$number = (int) ( $pull['number'] ?? 0 );
			if ( $number <= 0 ) {
				continue;
			}
			$found[ $number ] = $pull;
		}
	}

	return array_values( $found );
}

/**
 * List pull requests for an exact head and base branch.
 *
 * @param string                             $token       GitHub personal access token.
 * @param array{owner: string, name: string} $repo_parts  Parsed repository.
 * @param string                             $head_branch Head branch name (without owner prefix).
 * @param string                             $base_branch Base branch name.
 * @return array<int, array<string, mixed>> Pull request payloads.
 */
function alpaistr_agentic_list_prs_by_head_and_base( string $token, array $repo_parts, string $head_branch, string $base_branch ): array {
	$response = wp_remote_get(
		sprintf(
			'https://api.github.com/repos/%s/%s/pulls?head=%s&base=%s&state=all&sort=updated&direction=desc',
			rawurlencode( $repo_parts['owner'] ),
			rawurlencode( $repo_parts['name'] ),
			rawurlencode( $repo_parts['owner'] . ':' . $head_branch ),
			rawurlencode( $base_branch )
		),
		[
			'timeout' => 20,
			'headers' => alpaistr_agentic_github_api_headers( $token ),
		]
	);

	if ( is_wp_error( $response ) || 200 !== wp_remote_retrieve_response_code( $response ) ) {
		return [];
	}

	$pulls = json_decode( wp_remote_retrieve_body( $response ), true );
	if ( ! is_array( $pulls ) ) {
		return [];
	}

	$found = [];
	foreach ( $pulls as $pull ) {
		if ( ! is_array( $pull ) || empty( $pull['number'] ) ) {
			continue;
		}
		$found[ (int) $pull['number'] ] = $pull;
	}

	return array_values( $found );
}

/**
 * Find a pull request by exact head and base branch, preferring a merged one.
 *
 * @param string                             $token       GitHub personal access token.
 * @param array{owner: string, name: string} $repo_parts  Parsed repository.
 * @param string                             $head_branch Head branch name (without owner prefix).
 * @param string                             $base_branch Base branch name.
 * @return array<string, mixed>|null Pull request data, or null when no match is found.
 */
function alpaistr_agentic_find_pr_by_head_and_base( string $token, array $repo_parts, string $head_branch, string $base_branch ): ?array {
	$pulls = alpaistr_agentic_list_prs_by_head_and_base( $token, $repo_parts, $head_branch, $base_branch );
	if ( empty( $pulls ) ) {
		return null;
	}

	foreach ( $pulls as $pull ) {
		if ( ! empty( $pull['merged_at'] ) ) {
			return $pull;
		}
	}

	return $pulls[0];
}

/**
 * Save the AI branch SHA on first send so Start over can restore it later.
 *
 * @param int                                $issue_id   Alpaca issue post ID.
 * @param string                             $token      GitHub token.
 * @param array{owner: string, name: string} $repo_parts Parsed repository.
 * @param string                             $branch     AI target branch.
 */
function alpaistr_agentic_remember_start_sha( int $issue_id, string $token, array $repo_parts, string $branch ): void {
	if ( $issue_id <= 0 || '' === $branch ) {
		return;
	}

	$existing = (string) get_post_meta( $issue_id, ALPAISTR_AGENTIC_START_SHA_META, true );
	if ( '' !== $existing ) {
		return;
	}

	$sha = alpaistr_agentic_get_default_branch_sha( $token, $repo_parts, $branch );
	if ( is_wp_error( $sha ) || '' === $sha ) {
		return;
	}

	update_post_meta( $issue_id, ALPAISTR_AGENTIC_START_SHA_META, $sha );
	update_post_meta( $issue_id, ALPAISTR_AGENTIC_START_BRANCH_META, $branch );
}

/**
 * Decide whether Start over is allowed.
 *
 * Start over ends the current fixing session: in-flight GitHub issues and
 * pull requests are closed, then the next Fix with AI starts a new session.
 * The target branch is moved back only when it has no commits besides this
 * session's AI work.
 *
 * @param int $issue_id Alpaca issue post ID.
 * @return array<string, mixed>|WP_Error
 */
function alpaistr_agentic_evaluate_start_over( int $issue_id ): array|WP_Error {
	$settings = alpaistr_agentic_get_settings();
	$token    = $settings['github_token'];
	$repo     = $settings['github_repo'];
	$branch   = (string) get_post_meta( $issue_id, ALPAISTR_AGENTIC_START_BRANCH_META, true );
	if ( '' === $branch ) {
		$branch = (string) ( $settings['ai_target_branch'] ?? '' );
	}

	if ( empty( $token ) || empty( $repo ) ) {
		return new WP_Error( 'not_configured', esc_html__( 'GitHub token or repository is not configured.', 'alpaca-issue-tracker' ), [ 'status' => 400 ] );
	}

	$repo_parts = alpaistr_agentic_parse_github_repo( $repo );
	if ( is_wp_error( $repo_parts ) ) {
		return $repo_parts;
	}

	$work     = alpaistr_agentic_task_github_work_status( $token, $repo_parts, $issue_id, $branch );
	$has_sent = false;
	foreach ( alpaistr_agentic_current_attempt_entries( $issue_id ) as $entry ) {
		if ( 'sent' === ( $entry['type'] ?? '' ) ) {
			$has_sent = true;
			break;
		}
	}

	$reset = alpaistr_agentic_target_branch_reset_plan( $token, $repo_parts, $issue_id, $branch, $work );

	return array_merge(
		[
			'allowed'              => $has_sent,
			'should_restore'       => false,
			'reason'               => $has_sent
				? ''
				: __( 'There is no active fix attempt to start over.', 'alpaca-issue-tracker' ),
			'token'                => $token,
			'repo_parts'           => $repo_parts,
			'branch'               => $branch,
			'start_sha'            => (string) ( $reset['start_sha'] ?? '' ),
			'head_sha'             => (string) ( $reset['head_sha'] ?? '' ),
			'can_reset_branch'     => ! empty( $reset['can_reset_branch'] ),
			'will_reset_branch'    => ! empty( $reset['will_reset_branch'] ),
			'has_outside_commits'  => ! empty( $reset['has_outside_commits'] ),
			'reset_blocked_reason' => (string) ( $reset['reset_blocked_reason'] ?? '' ),
			'tree_matches_start'   => true,
		],
		alpaistr_agentic_github_work_fields( $work )
	);
}

/**
 * Whether the AI target branch can be moved back to the session start snapshot.
 *
 * Safe only when every first-parent commit after the start SHA is a merge from
 * this fixing session. Any other commit leaves the branch untouched.
 *
 * @param string                             $token      GitHub token.
 * @param array{owner: string, name: string} $repo_parts Parsed repository.
 * @param int                                $issue_id   Alpaca issue post ID.
 * @param string                             $branch     AI target branch.
 * @param array<string, mixed>               $work       Optional live GitHub work status.
 * @return array<string, mixed>
 */
function alpaistr_agentic_target_branch_reset_plan( string $token, array $repo_parts, int $issue_id, string $branch, array $work = [] ): array {
	$other_commits_message = __( 'Since outside changes were pushed to the AI target branch during this session, Start over cannot revert it to the state it had before the session.', 'alpaca-issue-tracker' );

	$missing_snapshot_message = __( 'Alpaca does not have the starting commit for this session, so the AI target branch will be left as it is.', 'alpaca-issue-tracker' );

	$plan = [
		'can_reset_branch'     => false,
		'will_reset_branch'    => false,
		'has_outside_commits'  => false,
		'reset_blocked_reason' => $missing_snapshot_message,
		'start_sha'            => (string) get_post_meta( $issue_id, ALPAISTR_AGENTIC_START_SHA_META, true ),
		'head_sha'             => '',
	];

	if ( '' === $plan['start_sha'] || '' === $branch ) {
		return $plan;
	}

	$head_sha = alpaistr_agentic_get_default_branch_sha( $token, $repo_parts, $branch );
	if ( is_wp_error( $head_sha ) || '' === $head_sha ) {
		$plan['reset_blocked_reason'] = is_wp_error( $head_sha )
			? $head_sha->get_error_message()
			: $other_commits_message;
		return $plan;
	}

	$plan['head_sha'] = $head_sha;

	if ( strtolower( $head_sha ) === strtolower( $plan['start_sha'] ) ) {
		$plan['can_reset_branch']     = true;
		$plan['will_reset_branch']    = false;
		$plan['reset_blocked_reason'] = '';
		return $plan;
	}

	$walk_shas = alpaistr_agentic_list_first_parent_shas_after_start( $token, $repo_parts, $head_sha, $plan['start_sha'] );
	if ( is_wp_error( $walk_shas ) || empty( $walk_shas ) ) {
		$plan['has_outside_commits']  = true;
		$plan['reset_blocked_reason'] = $other_commits_message;
		return $plan;
	}

	$ai_shas = [];
	foreach ( alpaistr_agentic_current_session_merge_commit_shas( $token, $repo_parts, $issue_id, $branch, $work ) as $sha ) {
		$ai_shas[ strtolower( $sha ) ] = true;
	}

	foreach ( $walk_shas as $sha ) {
		if ( ! isset( $ai_shas[ strtolower( (string) $sha ) ] ) ) {
			$plan['has_outside_commits']  = true;
			$plan['reset_blocked_reason'] = $other_commits_message;
			return $plan;
		}
	}

	$plan['can_reset_branch']     = true;
	$plan['will_reset_branch']    = true;
	$plan['reset_blocked_reason'] = '';

	return $plan;
}

/**
 * Merge commit SHAs for this fixing session's merged AI pull requests.
 *
 * @param string                             $token      GitHub token.
 * @param array{owner: string, name: string} $repo_parts Parsed repository.
 * @param int                                $issue_id   Alpaca issue post ID.
 * @param string                             $branch     AI target branch.
 * @param array<string, mixed>               $work       Optional live GitHub work status.
 * @return string[]
 */
function alpaistr_agentic_current_session_merge_commit_shas( string $token, array $repo_parts, int $issue_id, string $branch, array $work = [] ): array {
	$current_numbers = [];
	foreach ( alpaistr_agentic_current_attempt_entries( $issue_id ) as $entry ) {
		if ( 'sent' !== ( $entry['type'] ?? '' ) ) {
			continue;
		}

		$github_number = (int) ( $entry['github_number'] ?? 0 );
		if ( $github_number > 0 ) {
			$current_numbers[ $github_number ] = true;
		}
	}

	$shas = [];
	foreach ( (array) ( $work['pull_requests'] ?? [] ) as $pr ) {
		if ( ! is_array( $pr ) || empty( $pr['merged'] ) ) {
			continue;
		}

		$github_number = (int) ( $pr['github_issue_number'] ?? 0 );
		if ( ! isset( $current_numbers[ $github_number ] ) ) {
			continue;
		}

		$merge_sha = strtolower( (string) ( $pr['merge_commit_sha'] ?? '' ) );
		if ( '' !== $merge_sha ) {
			$shas[ $merge_sha ] = true;
		}
	}

	if ( ! empty( $work['pull_requests'] ) || '' === $branch || empty( $current_numbers ) ) {
		return array_keys( $shas );
	}

	foreach ( array_keys( $current_numbers ) as $github_number ) {
		foreach ( alpaistr_agentic_find_all_prs_for_issue( $token, $repo_parts, (int) $github_number, $branch ) as $pr ) {
			if ( empty( $pr['merged_at'] ) ) {
				continue;
			}

			$merge_sha = strtolower( (string) ( $pr['merge_commit_sha'] ?? '' ) );
			if ( '' !== $merge_sha ) {
				$shas[ $merge_sha ] = true;
			}
		}
	}

	return array_keys( $shas );
}

/**
 * First-parent commit SHAs after a start snapshot, newest first.
 *
 * @param string                             $token      GitHub token.
 * @param array{owner: string, name: string} $repo_parts Parsed repository.
 * @param string                             $head_sha   Current branch tip.
 * @param string                             $start_sha  Saved starting commit.
 * @return string[]|WP_Error
 */
function alpaistr_agentic_list_first_parent_shas_after_start( string $token, array $repo_parts, string $head_sha, string $start_sha ): array|WP_Error {
	$response = wp_remote_get(
		sprintf(
			'https://api.github.com/repos/%s/%s/commits?sha=%s&per_page=100',
			rawurlencode( $repo_parts['owner'] ),
			rawurlencode( $repo_parts['name'] ),
			rawurlencode( $head_sha )
		),
		[
			'timeout' => 20,
			'headers' => alpaistr_agentic_github_api_headers( $token ),
		]
	);

	if ( is_wp_error( $response ) ) {
		return new WP_Error( 'github_request_failed', $response->get_error_message(), [ 'status' => 502 ] );
	}

	if ( 200 !== wp_remote_retrieve_response_code( $response ) ) {
		return new WP_Error(
			'github_api_error',
			__( 'Could not read commits from GitHub.', 'alpaca-issue-tracker' ),
			[ 'status' => 502 ]
		);
	}

	$commits = json_decode( wp_remote_retrieve_body( $response ), true );
	if ( ! is_array( $commits ) ) {
		return new WP_Error(
			'github_api_error',
			__( 'Could not read commits from GitHub.', 'alpaca-issue-tracker' ),
			[ 'status' => 502 ]
		);
	}

	$start  = strtolower( $start_sha );
	$head   = strtolower( $head_sha );
	$by_sha = [];

	foreach ( $commits as $commit ) {
		if ( ! is_array( $commit ) ) {
			continue;
		}

		$sha = strtolower( (string) ( $commit['sha'] ?? '' ) );
		if ( '' !== $sha ) {
			$by_sha[ $sha ] = $commit;
		}
	}

	$shas    = [];
	$current = $head;

	for ( $i = 0; $i < 100 && '' !== $current && $current !== $start; $i++ ) {
		if ( ! isset( $by_sha[ $current ] ) ) {
			return new WP_Error(
				'start_over_foreign_commits',
				__( 'Could not find the session start commit on the target branch.', 'alpaca-issue-tracker' )
			);
		}

		$shas[]  = $current;
		$parents = $by_sha[ $current ]['parents'] ?? [];
		$current = strtolower( (string) ( is_array( $parents[0] ?? null ) ? ( $parents[0]['sha'] ?? '' ) : '' ) );
	}

	if ( $current !== $start ) {
		return new WP_Error(
			'start_over_foreign_commits',
			__( 'Could not find the session start commit on the target branch.', 'alpaca-issue-tracker' )
		);
	}

	return $shas;
}

/**
 * Walk first-parent commits from HEAD back to a start SHA.
 *
 * @param string                             $token      GitHub token.
 * @param array{owner: string, name: string} $repo_parts Parsed repository.
 * @param string                             $head_sha   Current branch tip.
 * @param string                             $start_sha  Saved starting commit.
 * @return array{shas: string[], head_tree: string, start_tree: string}|WP_Error
 */
function alpaistr_agentic_first_parent_shas_until( string $token, array $repo_parts, string $head_sha, string $start_sha ): array|WP_Error {
	$shas       = [];
	$current    = $head_sha;
	$head_tree  = '';
	$start_tree = '';

	for ( $i = 0; $i < 80 && '' !== $current; $i++ ) {
		$commit = alpaistr_agentic_github_get_commit( $token, $repo_parts, $current );
		if ( is_wp_error( $commit ) ) {
			return $commit;
		}

		$tree = (string) ( $commit['commit']['tree']['sha'] ?? '' );
		if ( $current === $head_sha ) {
			$head_tree = $tree;
		}

		if ( $current === $start_sha ) {
			$start_tree = $tree;
			break;
		}

		$shas[]   = $current;
		$parents  = is_array( $commit['parents'] ?? null ) ? $commit['parents'] : [];
		$current  = (string) ( $parents[0]['sha'] ?? '' );
	}

	if ( $current !== $start_sha && $head_sha !== $start_sha ) {
		return new WP_Error(
			'start_over_blocked',
			__( 'Start over is unavailable because the AI branch has commits that are not from this issue.', 'alpaca-issue-tracker' )
		);
	}

	if ( '' === $start_tree ) {
		$start_commit = alpaistr_agentic_github_get_commit( $token, $repo_parts, $start_sha );
		if ( is_wp_error( $start_commit ) ) {
			return $start_commit;
		}
		$start_tree = (string) ( $start_commit['commit']['tree']['sha'] ?? '' );
	}

	if ( '' === $head_tree ) {
		$head_tree = $start_tree;
	}

	return [
		'shas'       => $shas,
		'head_tree'  => $head_tree,
		'start_tree' => $start_tree,
	];
}

/**
 * Merge commit SHAs for this issue's AI fix PRs and start-over PRs.
 *
 * @param string                             $token      GitHub token.
 * @param array{owner: string, name: string} $repo_parts Parsed repository.
 * @param int                                $issue_id   Alpaca issue post ID.
 * @param string                             $branch     AI target branch.
 * @return string[]
 */
function alpaistr_agentic_issue_merge_commit_shas( string $token, array $repo_parts, int $issue_id, string $branch ): array {
	$shas = [];

	foreach ( alpaistr_agentic_get_activity_history( $issue_id ) as $entry ) {
		if ( 'sent' !== ( $entry['type'] ?? '' ) ) {
			continue;
		}

		$github_number = (int) ( $entry['github_number'] ?? 0 );
		if ( $github_number <= 0 ) {
			continue;
		}

		$pr = alpaistr_agentic_find_pr_for_issue( $token, $repo_parts, $github_number, $branch );
		if ( ! $pr || empty( $pr['merged_at'] ) ) {
			continue;
		}

		$merge_sha = (string) ( $pr['merge_commit_sha'] ?? '' );
		if ( '' !== $merge_sha ) {
			$shas[] = $merge_sha;
		}
	}

	$restore_pr = alpaistr_agentic_find_pr_by_head_and_base(
		$token,
		$repo_parts,
		alpaistr_agentic_restore_branch_name( $issue_id ),
		$branch
	);
	if ( $restore_pr && ! empty( $restore_pr['merged_at'] ) ) {
		$merge_sha = (string) ( $restore_pr['merge_commit_sha'] ?? '' );
		if ( '' !== $merge_sha ) {
			$shas[] = $merge_sha;
		}
	}

	return array_values( array_unique( $shas ) );
}

/**
 * Empty GitHub work status for an Alpaca issue.
 *
 * @return array<string, mixed>
 */
function alpaistr_agentic_empty_github_work_status(): array {
	return [
		'has_open_work'        => false,
		'has_merged_pr'        => false,
		'has_open_pr'          => false,
		'waiting_on_issue'     => false,
		'waiting_issue_number' => 0,
		'pull_request'         => null,
		'pull_requests'        => [],
	];
}

/**
 * Flatten GitHub work flags onto a start-over result.
 *
 * @param array<string, mixed> $work Work status.
 * @return array<string, mixed>
 */
function alpaistr_agentic_github_work_fields( array $work ): array {
	return [
		'has_open_work'        => ! empty( $work['has_open_work'] ),
		'has_merged_pr'        => ! empty( $work['has_merged_pr'] ),
		'has_open_pr'          => ! empty( $work['has_open_pr'] ),
		'waiting_on_issue'     => ! empty( $work['waiting_on_issue'] ),
		'waiting_issue_number' => (int) ( $work['waiting_issue_number'] ?? 0 ),
		'pull_request'         => is_array( $work['pull_request'] ?? null ) ? $work['pull_request'] : null,
		'pull_requests'        => array_values(
			array_filter(
				(array) ( $work['pull_requests'] ?? [] ),
				static function ( $pull_request ): bool {
					return is_array( $pull_request );
				}
			)
		),
	];
}

/**
 * Public fields for a GitHub pull request linked to an Alpaca task.
 *
 * @param array<string, mixed> $pr            GitHub pull request payload.
 * @param int                  $github_number GitHub issue number that opened this PR.
 * @return array<string, mixed>
 */
function alpaistr_agentic_summarize_pull_request( array $pr, int $github_number = 0 ): array {
	$merged = ! empty( $pr['merged_at'] );
	$state  = $merged ? 'merged' : (string) ( $pr['state'] ?? 'closed' );

	return [
		'number'              => (int) ( $pr['number'] ?? 0 ),
		'url'                 => esc_url_raw( (string) ( $pr['html_url'] ?? '' ) ),
		'state'               => $state,
		'merged'              => $merged,
		'merge_commit_sha'    => strtolower( (string) ( $pr['merge_commit_sha'] ?? '' ) ),
		'github_issue_number' => $github_number,
	];
}

/**
 * Save discovered pull request details onto matching sent history entries.
 *
 * @param int                              $issue_id             Alpaca issue post ID.
 * @param array<int, array<string, mixed>> $prs_by_github_number Map of GitHub issue number to summarized PR.
 */
function alpaistr_agentic_remember_sent_pull_requests( int $issue_id, array $prs_by_github_number ): void {
	if ( empty( $prs_by_github_number ) ) {
		return;
	}

	$history = alpaistr_agentic_get_activity_history( $issue_id );
	$changed = false;

	foreach ( $history as $index => $entry ) {
		$github_number = (int) ( $entry['github_number'] ?? 0 );
		if ( 'sent' !== ( $entry['type'] ?? '' ) || ! isset( $prs_by_github_number[ $github_number ] ) ) {
			continue;
		}

		$pr        = $prs_by_github_number[ $github_number ];
		$pr_url    = (string) ( $pr['url'] ?? '' );
		$pr_number = (int) ( $pr['number'] ?? 0 );
		$pr_state  = (string) ( $pr['state'] ?? '' );

		if (
			(string) ( $entry['pr_url'] ?? '' ) === $pr_url
			&& (int) ( $entry['pr_number'] ?? 0 ) === $pr_number
			&& (string) ( $entry['pr_state'] ?? '' ) === $pr_state
		) {
			continue;
		}

		$history[ $index ]['pr_url']    = $pr_url;
		$history[ $index ]['pr_number'] = $pr_number;
		$history[ $index ]['pr_state']  = $pr_state;
		$changed                        = true;
	}

	if ( $changed ) {
		update_post_meta( $issue_id, ALPAISTR_AGENTIC_HISTORY_META, $history );
	}
}

/**
 * Mark stored pull requests as closed after Start over closes them on GitHub.
 *
 * Merged pull requests are left unchanged. Entries with no pull request yet
 * stay as they are so the AI Log can still show "waiting".
 *
 * @param int $issue_id Alpaca issue post ID.
 */
function alpaistr_agentic_mark_unmerged_sent_pull_requests_closed( int $issue_id ): void {
	$history = alpaistr_agentic_get_activity_history( $issue_id );
	$changed = false;

	foreach ( $history as $index => $entry ) {
		if ( 'sent' !== ( $entry['type'] ?? '' ) ) {
			continue;
		}

		$pr_state  = (string) ( $entry['pr_state'] ?? '' );
		$pr_number = (int) ( $entry['pr_number'] ?? 0 );
		$pr_url    = (string) ( $entry['pr_url'] ?? '' );

		if ( 'merged' === $pr_state || 'closed' === $pr_state ) {
			continue;
		}

		if ( $pr_number <= 0 && '' === $pr_url ) {
			continue;
		}

		$history[ $index ]['pr_state'] = 'closed';
		$changed                       = true;
	}

	if ( $changed ) {
		update_post_meta( $issue_id, ALPAISTR_AGENTIC_HISTORY_META, $history );
	}
}

/**
 * Live GitHub PR/issue status for this Alpaca task.
 *
 * Button flags (open work, merged, waiting) use the current fixing session
 * only. The pull request list includes every sent GitHub issue on the task
 * so the AI Log can show past sessions too.
 *
 * A closed (unmerged) PR is treated as abandoned for that send so the next
 * action can run. Request a change comments on in-flight work, or opens a
 * new GitHub issue after a merge or a closed-without-merging PR. Start over
 * closes every still-open GitHub issue and pull request from this task.
 *
 * @param string                             $token      GitHub token.
 * @param array{owner: string, name: string} $repo_parts Parsed repository.
 * @param int                                $issue_id   Alpaca issue post ID.
 * @param string                             $branch     AI target branch.
 * @return array<string, mixed>
 */
function alpaistr_agentic_task_github_work_status( string $token, array $repo_parts, int $issue_id, string $branch ): array {
	$status           = alpaistr_agentic_empty_github_work_status();
	$open_pr          = null;
	$merged_pr        = null;
	$closed_pr        = null;
	$prs_by_issue     = [];
	$pull_requests    = [];
	$waiting_on_issue     = false;
	$waiting_issue_number = 0;
	$seen_issues          = [];

	$current_issue_numbers = [];
	foreach ( alpaistr_agentic_current_attempt_entries( $issue_id ) as $entry ) {
		if ( 'sent' !== ( $entry['type'] ?? '' ) ) {
			continue;
		}

		$github_number = (int) ( $entry['github_number'] ?? 0 );
		if ( $github_number > 0 ) {
			$current_issue_numbers[ $github_number ] = true;
		}
	}

	foreach ( alpaistr_agentic_get_activity_history( $issue_id ) as $entry ) {
		if ( 'sent' !== ( $entry['type'] ?? '' ) ) {
			continue;
		}

		$github_number = (int) ( $entry['github_number'] ?? 0 );
		if ( $github_number <= 0 || isset( $seen_issues[ $github_number ] ) ) {
			continue;
		}

		$seen_issues[ $github_number ] = true;
		$is_current                    = isset( $current_issue_numbers[ $github_number ] );

		$prs = '' !== $branch
			? alpaistr_agentic_find_all_prs_for_issue( $token, $repo_parts, $github_number, $branch )
			: [];

		if ( ! empty( $prs ) ) {
			foreach ( $prs as $pr ) {
				$summary                        = alpaistr_agentic_summarize_pull_request( $pr, $github_number );
				$pull_requests[]                = $summary;
				$prs_by_issue[ $github_number ] = $summary;

				if ( ! $is_current ) {
					continue;
				}

				if ( ! empty( $summary['merged'] ) ) {
					$status['has_merged_pr'] = true;
					$merged_pr               = $summary;
				} elseif ( 'open' === ( $summary['state'] ?? '' ) ) {
					$status['has_open_pr'] = true;
					$open_pr               = $summary;
				} else {
					$closed_pr = $summary;
				}
			}
			continue;
		}

		if ( $is_current && alpaistr_agentic_github_issue_is_open( $token, $repo_parts, $github_number ) ) {
			$waiting_on_issue     = true;
			$waiting_issue_number = $github_number;
		}
	}

	alpaistr_agentic_remember_sent_pull_requests( $issue_id, $prs_by_issue );

	usort(
		$pull_requests,
		static function ( array $left, array $right ): int {
			$rank = static function ( array $pull_request ): int {
				if ( 'open' === ( $pull_request['state'] ?? '' ) ) {
					return 0;
				}
				if ( ! empty( $pull_request['merged'] ) ) {
					return 1;
				}
				return 2;
			};

			$order = $rank( $left ) <=> $rank( $right );
			if ( 0 !== $order ) {
				return $order;
			}

			return (int) ( $right['number'] ?? 0 ) <=> (int) ( $left['number'] ?? 0 );
		}
	);

	$status['waiting_on_issue']     = $waiting_on_issue;
	$status['waiting_issue_number'] = $waiting_issue_number;
	$status['has_open_work']        = ! empty( $status['has_open_pr'] ) || $waiting_on_issue;
	$status['pull_requests']    = $pull_requests;
	if ( $open_pr ) {
		$status['pull_request'] = $open_pr;
	} elseif ( $merged_pr ) {
		$status['pull_request'] = $merged_pr;
	} else {
		$status['pull_request'] = $closed_pr;
	}

	return $status;
}

/**
 * Close leftover GitHub issues whose AI pull request is no longer open.
 *
 * @param string                             $token      GitHub token.
 * @param array{owner: string, name: string} $repo_parts Parsed repository.
 * @param int                                $issue_id   Alpaca issue post ID.
 * @param string                             $branch     AI target branch.
 */
function alpaistr_agentic_close_abandoned_github_issues( string $token, array $repo_parts, int $issue_id, string $branch ): void {
	foreach ( alpaistr_agentic_current_attempt_entries( $issue_id ) as $entry ) {
		if ( 'sent' !== ( $entry['type'] ?? '' ) ) {
			continue;
		}

		$github_number = (int) ( $entry['github_number'] ?? 0 );
		if ( $github_number <= 0 ) {
			continue;
		}

		$prs = '' !== $branch
			? alpaistr_agentic_find_all_prs_for_issue( $token, $repo_parts, $github_number, $branch )
			: [];

		$has_open_pr = false;
		foreach ( $prs as $pr ) {
			if ( 'open' === ( $pr['state'] ?? '' ) ) {
				$has_open_pr = true;
				break;
			}
		}

		if ( empty( $prs ) || $has_open_pr ) {
			continue;
		}

		alpaistr_agentic_close_github_issue( $token, $repo_parts, $github_number );
	}
}

/**
 * Close a GitHub pull request if it is still open.
 *
 * @param string                             $token      GitHub token.
 * @param array{owner: string, name: string} $repo_parts Parsed repository.
 * @param int                                $pr_number  Pull request number.
 */
function alpaistr_agentic_close_github_pull_request( string $token, array $repo_parts, int $pr_number ): void {
	if ( $pr_number <= 0 ) {
		return;
	}

	wp_remote_request(
		sprintf(
			'https://api.github.com/repos/%s/%s/pulls/%d',
			rawurlencode( $repo_parts['owner'] ),
			rawurlencode( $repo_parts['name'] ),
			$pr_number
		),
		[
			'method'  => 'PATCH',
			'timeout' => 20,
			'headers' => alpaistr_agentic_github_api_headers( $token ),
			'body'    => wp_json_encode(
				[
					'state' => 'closed',
				]
			),
		]
	);
}

/**
 * Close every still-open GitHub issue and AI pull request for this Alpaca task.
 *
 * Covers every Fix with AI / Request a change send in history, plus a leftover
 * start-over restore pull request from earlier versions. Merged pull requests
 * stay on GitHub and are not reverted.
 *
 * @param string                             $token      GitHub token.
 * @param array{owner: string, name: string} $repo_parts Parsed repository.
 * @param int                                $issue_id   Alpaca issue post ID.
 * @param string                             $branch     AI target branch.
 */
function alpaistr_agentic_close_open_github_work( string $token, array $repo_parts, int $issue_id, string $branch ): void {
	$closed_pr_numbers = [];

	foreach ( alpaistr_agentic_get_activity_history( $issue_id ) as $entry ) {
		if ( 'sent' !== ( $entry['type'] ?? '' ) ) {
			continue;
		}

		$github_number = (int) ( $entry['github_number'] ?? 0 );
		$stored_pr     = (int) ( $entry['pr_number'] ?? 0 );

		if ( $stored_pr > 0 && ! isset( $closed_pr_numbers[ $stored_pr ] ) ) {
			alpaistr_agentic_close_github_pull_request( $token, $repo_parts, $stored_pr );
			$closed_pr_numbers[ $stored_pr ] = true;
		}

		if ( $github_number > 0 && '' !== $branch ) {
			foreach ( alpaistr_agentic_find_all_prs_for_issue( $token, $repo_parts, $github_number, $branch ) as $pr ) {
				$pr_number = (int) ( $pr['number'] ?? 0 );
				if ( $pr_number <= 0 || isset( $closed_pr_numbers[ $pr_number ] ) ) {
					continue;
				}
				if ( 'open' === ( $pr['state'] ?? '' ) ) {
					alpaistr_agentic_close_github_pull_request( $token, $repo_parts, $pr_number );
				}
				$closed_pr_numbers[ $pr_number ] = true;
			}
		}

		if ( $github_number > 0 ) {
			alpaistr_agentic_close_github_issue( $token, $repo_parts, $github_number );
		}
	}

	if ( '' !== $branch ) {
		$restore_pr     = alpaistr_agentic_find_pr_by_head_and_base(
			$token,
			$repo_parts,
			alpaistr_agentic_restore_branch_name( $issue_id ),
			$branch
		);
		$restore_number = is_array( $restore_pr ) ? (int) ( $restore_pr['number'] ?? 0 ) : 0;
		if ( $restore_number > 0 && 'open' === ( $restore_pr['state'] ?? '' ) && ! isset( $closed_pr_numbers[ $restore_number ] ) ) {
			alpaistr_agentic_close_github_pull_request( $token, $repo_parts, $restore_number );
		}
	}
}

/**
 * Whether a GitHub issue is currently open.
 *
 * @param string                             $token        GitHub token.
 * @param array{owner: string, name: string} $repo_parts   Parsed repository.
 * @param int                                $issue_number GitHub issue number.
 * @return bool
 */
function alpaistr_agentic_github_issue_is_open( string $token, array $repo_parts, int $issue_number ): bool {
	if ( $issue_number <= 0 ) {
		return false;
	}

	$response = wp_remote_get(
		sprintf(
			'https://api.github.com/repos/%s/%s/issues/%d',
			rawurlencode( $repo_parts['owner'] ),
			rawurlencode( $repo_parts['name'] ),
			$issue_number
		),
		[
			'timeout' => 15,
			'headers' => alpaistr_agentic_github_api_headers( $token ),
		]
	);

	if ( is_wp_error( $response ) || 200 !== wp_remote_retrieve_response_code( $response ) ) {
		return false;
	}

	$data = json_decode( wp_remote_retrieve_body( $response ), true );

	return is_array( $data ) && 'open' === ( $data['state'] ?? '' );
}

/**
 * Close a GitHub issue.
 *
 * @param string                             $token        GitHub token.
 * @param array{owner: string, name: string} $repo_parts   Parsed repository.
 * @param int                                $issue_number GitHub issue number.
 */
function alpaistr_agentic_close_github_issue( string $token, array $repo_parts, int $issue_number ): void {
	if ( $issue_number <= 0 ) {
		return;
	}

	wp_remote_request(
		sprintf(
			'https://api.github.com/repos/%s/%s/issues/%d',
			rawurlencode( $repo_parts['owner'] ),
			rawurlencode( $repo_parts['name'] ),
			$issue_number
		),
		[
			'method'  => 'PATCH',
			'timeout' => 20,
			'headers' => alpaistr_agentic_github_api_headers( $token ),
			'body'    => wp_json_encode(
				[
					'state' => 'closed',
				]
			),
		]
	);
}

/**
 * Create a restore branch whose tree matches the start SHA and open a PR.
 *
 * @param string                             $token      GitHub token.
 * @param array{owner: string, name: string} $repo_parts Parsed repository.
 * @param int                                $issue_id   Alpaca issue post ID.
 * @param string                             $branch     AI target branch.
 * @param string                             $start_sha  Original commit SHA.
 * @param string                             $head_sha   Current branch tip.
 * @return string|WP_Error Pull request URL.
 */
function alpaistr_agentic_open_restore_pull_request( string $token, array $repo_parts, int $issue_id, string $branch, string $start_sha, string $head_sha ): string|WP_Error {
	$start_commit = alpaistr_agentic_github_get_commit( $token, $repo_parts, $start_sha );
	if ( is_wp_error( $start_commit ) ) {
		return $start_commit;
	}

	$tree_sha = (string) ( $start_commit['commit']['tree']['sha'] ?? '' );
	if ( '' === $tree_sha ) {
		return new WP_Error( 'github_api_error', __( 'Could not read the original branch snapshot.', 'alpaca-issue-tracker' ), [ 'status' => 502 ] );
	}

	$commit_response = wp_remote_post(
		sprintf(
			'https://api.github.com/repos/%s/%s/git/commits',
			rawurlencode( $repo_parts['owner'] ),
			rawurlencode( $repo_parts['name'] )
		),
		[
			'timeout' => 20,
			'headers' => alpaistr_agentic_github_api_headers( $token ),
			'body'    => wp_json_encode(
				[
					'message' => sprintf(
						'Restore %s to the state before Alpaca issue %d [alpaca-ai-development]',
						$branch,
						$issue_id
					),
					'tree'    => $tree_sha,
					'parents' => [ $head_sha ],
				]
			),
		]
	);

	if ( is_wp_error( $commit_response ) ) {
		return new WP_Error( 'github_request_failed', $commit_response->get_error_message(), [ 'status' => 502 ] );
	}

	$commit_code = wp_remote_retrieve_response_code( $commit_response );
	$commit_data = json_decode( wp_remote_retrieve_body( $commit_response ), true );
	$new_sha     = is_array( $commit_data ) ? (string) ( $commit_data['sha'] ?? '' ) : '';

	if ( 201 !== $commit_code || '' === $new_sha ) {
		$message = is_array( $commit_data ) ? (string) ( $commit_data['message'] ?? '' ) : '';
		return new WP_Error(
			'github_api_error',
			'' !== $message ? $message : __( 'Could not create the restore commit.', 'alpaca-issue-tracker' ),
			[ 'status' => 502 ]
		);
	}

	$restore_branch = alpaistr_agentic_restore_branch_name( $issue_id );
	$ref_url        = sprintf(
		'https://api.github.com/repos/%s/%s/git/refs/heads/%s',
		rawurlencode( $repo_parts['owner'] ),
		rawurlencode( $repo_parts['name'] ),
		rawurlencode( $restore_branch )
	);

	$existing_ref = wp_remote_get(
		$ref_url,
		[
			'timeout' => 20,
			'headers' => alpaistr_agentic_github_api_headers( $token ),
		]
	);

	if ( ! is_wp_error( $existing_ref ) && 200 === wp_remote_retrieve_response_code( $existing_ref ) ) {
		wp_remote_request(
			$ref_url,
			[
				'method'  => 'PATCH',
				'timeout' => 20,
				'headers' => alpaistr_agentic_github_api_headers( $token ),
				'body'    => wp_json_encode(
					[
						'sha'   => $new_sha,
						'force' => true,
					]
				),
			]
		);
	} else {
		wp_remote_post(
			sprintf(
				'https://api.github.com/repos/%s/%s/git/refs',
				rawurlencode( $repo_parts['owner'] ),
				rawurlencode( $repo_parts['name'] )
			),
			[
				'timeout' => 20,
				'headers' => alpaistr_agentic_github_api_headers( $token ),
				'body'    => wp_json_encode(
					[
						'ref' => 'refs/heads/' . $restore_branch,
						'sha' => $new_sha,
					]
				),
			]
		);
	}

	$existing_pr = alpaistr_agentic_find_open_pull_request( $token, $repo_parts, $restore_branch );
	if ( '' !== $existing_pr ) {
		return $existing_pr;
	}

	$pr_response = wp_remote_post(
		sprintf(
			'https://api.github.com/repos/%s/%s/pulls',
			rawurlencode( $repo_parts['owner'] ),
			rawurlencode( $repo_parts['name'] )
		),
		[
			'timeout' => 30,
			'headers' => alpaistr_agentic_github_api_headers( $token ),
			'body'    => wp_json_encode(
				[
					'title' => sprintf( 'Start over: restore %s (Alpaca issue %d)', $branch, $issue_id ),
					'body'  => sprintf(
						"Restores `%s` to the snapshot saved when this Alpaca issue was first sent to AI.\n\nMerge this pull request to undo the AI changes for this issue.",
						$branch
					),
					'head'  => $restore_branch,
					'base'  => $branch,
				]
			),
		]
	);

	if ( is_wp_error( $pr_response ) ) {
		return new WP_Error( 'github_request_failed', $pr_response->get_error_message(), [ 'status' => 502 ] );
	}

	$pr_code = wp_remote_retrieve_response_code( $pr_response );
	$pr_data = json_decode( wp_remote_retrieve_body( $pr_response ), true );
	$pr_url  = is_array( $pr_data ) ? esc_url_raw( (string) ( $pr_data['html_url'] ?? '' ) ) : '';

	if ( 201 === $pr_code && '' !== $pr_url ) {
		return $pr_url;
	}

	$existing_pr = alpaistr_agentic_find_open_pull_request( $token, $repo_parts, $restore_branch );
	if ( '' !== $existing_pr ) {
		return $existing_pr;
	}

	$message = is_array( $pr_data ) ? (string) ( $pr_data['message'] ?? '' ) : '';
	return new WP_Error(
		'github_api_error',
		'' !== $message ? $message : __( 'Could not open the start-over pull request.', 'alpaca-issue-tracker' ),
		[ 'status' => 502 ]
	);
}

/**
 * Working branch used to restore the AI target branch.
 *
 * @param int $issue_id Alpaca issue post ID.
 * @return string
 */
function alpaistr_agentic_restore_branch_name( int $issue_id ): string {
	return 'alpaca/start-over-' . $issue_id;
}

/**
 * Fetch a commit from GitHub.
 *
 * @param string                             $token      GitHub token.
 * @param array{owner: string, name: string} $repo_parts Parsed repository.
 * @param string                             $sha        Commit SHA.
 * @return array<string, mixed>|WP_Error
 */
function alpaistr_agentic_github_get_commit( string $token, array $repo_parts, string $sha ): array|WP_Error {
	$response = wp_remote_get(
		sprintf(
			'https://api.github.com/repos/%s/%s/commits/%s',
			rawurlencode( $repo_parts['owner'] ),
			rawurlencode( $repo_parts['name'] ),
			rawurlencode( $sha )
		),
		[
			'timeout' => 20,
			'headers' => alpaistr_agentic_github_api_headers( $token ),
		]
	);

	if ( is_wp_error( $response ) ) {
		return new WP_Error( 'github_request_failed', $response->get_error_message(), [ 'status' => 502 ] );
	}

	$code = wp_remote_retrieve_response_code( $response );
	$data = json_decode( wp_remote_retrieve_body( $response ), true );

	if ( 200 !== $code || ! is_array( $data ) ) {
		return new WP_Error(
			'github_api_error',
			__( 'Could not read commits from GitHub.', 'alpaca-issue-tracker' ),
			[ 'status' => 502 ]
		);
	}

	return $data;
}

/**
 * Move a GitHub branch head to a specific commit.
 *
 * Uses a force update so the branch can rewind to the session start snapshot.
 *
 * @param string                             $token      GitHub token.
 * @param array{owner: string, name: string} $repo_parts Parsed repository.
 * @param string                             $branch     Branch name.
 * @param string                             $sha        Target commit SHA.
 * @return bool|WP_Error
 */
function alpaistr_agentic_force_update_branch_sha( string $token, array $repo_parts, string $branch, string $sha ): bool|WP_Error {
	if ( '' === $branch || '' === $sha ) {
		return new WP_Error(
			'github_api_error',
			__( 'Could not reset the AI target branch because the snapshot is missing.', 'alpaca-issue-tracker' ),
			[ 'status' => 400 ]
		);
	}

	$response = wp_remote_request(
		sprintf(
			'https://api.github.com/repos/%s/%s/git/refs/heads/%s',
			rawurlencode( $repo_parts['owner'] ),
			rawurlencode( $repo_parts['name'] ),
			rawurlencode( $branch )
		),
		[
			'method'  => 'PATCH',
			'timeout' => 20,
			'headers' => alpaistr_agentic_github_api_headers( $token ),
			'body'    => wp_json_encode(
				[
					'sha'   => $sha,
					'force' => true,
				]
			),
		]
	);

	if ( is_wp_error( $response ) ) {
		return new WP_Error( 'github_request_failed', $response->get_error_message(), [ 'status' => 502 ] );
	}

	$code = wp_remote_retrieve_response_code( $response );
	$data = json_decode( wp_remote_retrieve_body( $response ), true );

	if ( $code < 200 || $code >= 300 ) {
		$message = is_array( $data ) ? (string) ( $data['message'] ?? '' ) : '';
		return new WP_Error(
			'github_api_error',
			'' !== $message ? $message : __( 'Could not move the AI target branch back to the session start.', 'alpaca-issue-tracker' ),
			[ 'status' => 502 ]
		);
	}

	return true;
}

/**
 * Record a sent activity in the chronological Fix with AI history.
 *
 * @param int                  $issue_id      Alpaca issue post ID.
 * @param string               $github_url    GitHub issue HTML URL.
 * @param int                  $github_number GitHub issue number.
 * @param string               $target_branch PR target branch name.
 * @param array<string, mixed> $draft         Snapshot of the sent GitHub issue text.
 * @return array<int, array<string, mixed>> Full activity history after append (oldest first).
 */
function alpaistr_agentic_record_sent_activity( int $issue_id, string $github_url, int $github_number, string $target_branch, array $draft ): array {
	$log_title = sanitize_text_field( (string) ( $draft['title'] ?? '' ) );
	if ( '' === $log_title ) {
		$log_title = __( 'Fix with AI', 'alpaca-issue-tracker' );
	}

	$history = alpaistr_agentic_append_history_entry(
		$issue_id,
		[
			'type'          => 'sent',
			'url'           => $github_url,
			'github_number' => $github_number,
			'target_branch' => $target_branch,
			'notes'         => $log_title,
			'draft'         => $draft,
			'occurred_at'   => gmdate( 'c' ),
		]
	);

	return $history;
}

/**
 * Append one entry to the chronological Fix with AI history and save it.
 *
 * Shared by the sent and reverted mutating actions so every step stays visible
 * in the AI Log tab.
 *
 * @param int   $issue_id Alpaca issue post ID.
 * @param array $entry    History entry (must include a `type`).
 * @return array<int, array<string, mixed>> Full history after append (oldest first).
 */
function alpaistr_agentic_append_history_entry( int $issue_id, array $entry ): array {
	$history   = alpaistr_agentic_get_activity_history( $issue_id );
	$history[] = $entry;

	update_post_meta( $issue_id, ALPAISTR_AGENTIC_HISTORY_META, $history );

	return $history;
}

/**
 * Load the chronological Fix with AI history for an issue.
 *
 * @param int $issue_id Alpaca issue post ID.
 * @return array<int, array<string, mixed>> Oldest-first list of history entries.
 */
function alpaistr_agentic_get_activity_history( int $issue_id ): array {
	$records = get_post_meta( $issue_id, ALPAISTR_AGENTIC_HISTORY_META, true );
	if ( ! is_array( $records ) || empty( $records ) ) {
		return [];
	}

	return array_values(
		array_filter(
			$records,
			static function ( $entry ): bool {
				return is_array( $entry ) && in_array( $entry['type'] ?? '', [ 'sent', 'change_requested', 'reverted' ], true );
			}
		)
	);
}

/**
 * History entries after the latest start-over, oldest first.
 *
 * @param int $issue_id Alpaca issue post ID.
 * @return array<int, array<string, mixed>> Current attempt entries.
 */
function alpaistr_agentic_current_attempt_entries( int $issue_id ): array {
	$history     = alpaistr_agentic_get_activity_history( $issue_id );
	$last_revert = -1;

	foreach ( $history as $index => $entry ) {
		if ( 'reverted' === ( $entry['type'] ?? '' ) ) {
			$last_revert = (int) $index;
		}
	}

	return array_values( array_slice( $history, $last_revert + 1 ) );
}

/**
 * Ensure the "Sent to AI" Alpaca label exists and append it to the issue.
 *
 * @param int $issue_id Alpaca issue post ID.
 * @return void
 */
function alpaistr_agentic_assign_sent_to_ai_label( int $issue_id ): void {
	if ( $issue_id <= 0 || ! taxonomy_exists( 'alpaca_label' ) ) {
		return;
	}

	$label_name = 'Sent to AI';
	$existing   = term_exists( $label_name, 'alpaca_label' );

	if ( $existing ) {
		$term_id = (int) ( is_array( $existing ) ? ( $existing['term_id'] ?? 0 ) : $existing );
	} else {
		$created = wp_insert_term( $label_name, 'alpaca_label' );
		if ( is_wp_error( $created ) || empty( $created['term_id'] ) ) {
			return;
		}
		$term_id = (int) $created['term_id'];
		// Violet accent aligned with the Fix with AI UI.
		update_term_meta( $term_id, 'alpaca_label_color', '#7c3aed' );
	}

	if ( $term_id <= 0 ) {
		return;
	}

	wp_set_object_terms( $issue_id, [ $term_id ], 'alpaca_label', true );

	if ( function_exists( 'alpaistr_clear_board_cache' ) ) {
		alpaistr_clear_board_cache();
	}
}

/**
 * Extract the complexity value ('low'|'medium'|'high') from a flattened labels array.
 *
 * @param array $labels Labels array as sent to /agentic/create (includes complexity:*).
 * @return string Complexity value, defaulting to 'medium' when absent or invalid.
 */
function alpaistr_agentic_extract_complexity_from_labels( array $labels ): string {
	foreach ( $labels as $label_name ) {
		if ( is_string( $label_name ) && str_starts_with( $label_name, 'complexity:' ) ) {
			$value = substr( $label_name, strlen( 'complexity:' ) );
			return in_array( $value, [ 'low', 'medium', 'high' ], true ) ? $value : 'medium';
		}
	}

	return 'medium';
}

/**
 * Build a draft snapshot of the GitHub issue text that was sent.
 *
 * @param string $title  Issue title.
 * @param string $body   Issue body.
 * @param array  $labels Flattened labels array (includes complexity:*).
 * @return array{title: string, body: string, complexity: string, labels: array<int, string>}
 */
function alpaistr_agentic_build_draft_snapshot( string $title, string $body, array $labels ): array {
	$plain_labels = array_values(
		array_filter(
			$labels,
			static function ( $label_name ): bool {
				return is_string( $label_name )
					&& ! str_starts_with( $label_name, 'complexity:' )
					&& ! str_starts_with( $label_name, 'target-branch:' );
			}
		)
	);

	return [
		'title'      => $title,
		'body'       => $body,
		'complexity' => alpaistr_agentic_extract_complexity_from_labels( $labels ),
		'labels'     => $plain_labels,
	];
}

/**
 * Insert a system activity comment on an Alpaca issue.
 *
 * Shared low-level helper for every Fix with AI mutating action (sent,
 * reverted) so each one leaves the same kind of audit trail.
 * Skips notification dispatch so watchers are not spammed for automated activity notes.
 *
 * @param int    $issue_id Alpaca issue post ID.
 * @param string $content  Comment body (markdown).
 * @param string $tag      Comment tag stored on `alpacaCommentTags` (e.g. agentic-sent).
 * @return int Inserted comment ID, or 0 on failure.
 */
function alpaistr_agentic_insert_activity_comment( int $issue_id, string $content, string $tag ): int {
	if ( $issue_id <= 0 || '' === $content ) {
		return 0;
	}

	if ( function_exists( 'alpaistr_ability_get_current_comment_author_data' ) ) {
		$author = alpaistr_ability_get_current_comment_author_data();
	} else {
		$user   = wp_get_current_user();
		$author = [
			'user_id'              => (int) $user->ID,
			'comment_author'       => (string) $user->display_name,
			'comment_author_email' => (string) $user->user_email,
		];
	}

	$commentdata = array_merge(
		$author,
		[
			'comment_post_ID'  => $issue_id,
			'comment_content'  => $content,
			'comment_type'     => 'issuecomment',
			'comment_agent'    => 'audit',
			'comment_approved' => 1,
		]
	);

	$comment_id = wp_insert_comment( wp_filter_comment( wp_slash( $commentdata ) ) );
	if ( ! $comment_id ) {
		return 0;
	}

	update_comment_meta( (int) $comment_id, 'alpacaCommentTags', [ $tag ] );

	if ( function_exists( 'alpaistr_update_last_activity_from_issuecomments' ) ) {
		alpaistr_update_last_activity_from_issuecomments( $issue_id );
	}

	if ( function_exists( 'alpaistr_clear_board_cache' ) ) {
		alpaistr_clear_board_cache();
	}

	return (int) $comment_id;
}

/**
 * Insert a system activity comment recording that the issue was sent to GitHub.
 *
 * @param int    $issue_id      Alpaca issue post ID.
 * @param string $github_url    GitHub issue HTML URL.
 * @param string $target_branch PR target branch name.
 * @return int Inserted comment ID, or 0 on failure.
 */
function alpaistr_agentic_insert_sent_activity_comment( int $issue_id, string $github_url, string $target_branch ): int {
	if ( '' === $github_url ) {
		return 0;
	}

	$content = '' !== $target_branch
		? sprintf(
			/* translators: 1: GitHub issue URL, 2: target branch name. */
			__( 'Fix with AI: GitHub issue created — [%1$s](%1$s). Target branch: **%2$s**.', 'alpaca-issue-tracker' ),
			$github_url,
			$target_branch
		)
		: sprintf(
			/* translators: %s: GitHub issue URL. */
			__( 'Fix with AI: GitHub issue created — [%1$s](%1$s).', 'alpaca-issue-tracker' ), // phpcs:ignore WordPress.WP.I18n.UnorderedPlaceholdersText -- URL repeated for markdown link.
			$github_url
		);

	return alpaistr_agentic_insert_activity_comment( $issue_id, $content, 'agentic-sent' );
}

/**
 * Short AI log note explaining whether the target branch was reset on start over.
 *
 * @param bool   $branch_reset         Whether the branch head was moved back.
 * @param string $branch_reset_error   GitHub error when a reset was attempted.
 * @param bool   $has_outside_commits  Whether non-AI commits block a reset.
 * @param string $start_sha            Snapshot SHA from before this session.
 * @param string $reset_blocked_reason Longer reason when reset is skipped.
 * @return string Outcome note for history and activity comments.
 */
function alpaistr_agentic_branch_reset_outcome_note(
	bool $branch_reset,
	string $branch_reset_error,
	bool $has_outside_commits,
	string $start_sha,
	string $reset_blocked_reason
): string {
	if ( $branch_reset ) {
		return __( 'Target branch was reset to before this attempt.', 'alpaca-issue-tracker' );
	}

	if ( '' !== $branch_reset_error ) {
		return sprintf(
			/* translators: %s: error message from GitHub. */
			__( 'Target branch was not reset: %s', 'alpaca-issue-tracker' ),
			$branch_reset_error
		);
	}

	if ( $has_outside_commits ) {
		return __( 'Target branch was not reset because outside changes were pushed during this attempt.', 'alpaca-issue-tracker' );
	}

	if ( '' === $start_sha ) {
		return __( 'Target branch was not reset because Alpaca does not have the starting commit for this session.', 'alpaca-issue-tracker' );
	}

	if ( '' !== $reset_blocked_reason ) {
		return sprintf(
			/* translators: %s: error message from GitHub. */
			__( 'Target branch was not reset: %s', 'alpaca-issue-tracker' ),
			$reset_blocked_reason
		);
	}

	return __( 'Target branch was not reset because it was already at the commit from before this attempt.', 'alpaca-issue-tracker' );
}

/**
 * Insert a system activity comment recording that a fixing session ended.
 *
 * @param int    $issue_id          Alpaca issue post ID.
 * @param string $branch_reset_note Outcome note for the AI target branch.
 * @return int Inserted comment ID, or 0 on failure.
 */
function alpaistr_agentic_insert_reverted_activity_comment( int $issue_id, string $branch_reset_note ): int {
	$content = sprintf(
		/* translators: %s: branch reset outcome note. */
		__( 'Fix with AI: start over — this fix attempt ended. Open GitHub issues and pull requests were closed. %s', 'alpaca-issue-tracker' ),
		$branch_reset_note
	);

	return alpaistr_agentic_insert_activity_comment( $issue_id, $content, 'agentic-reverted' );
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
 * Used for target-branch:* labels that the installed Actions workflows read
 * to decide the pull request base. Failures are ignored — the subsequent
 * issue create will surface a clear error.
 *
 * @param string                             $token      GitHub personal access token.
 * @param array{owner: string, name: string} $repo_parts Parsed repository.
 * @param string                             $name       Label name.
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
 * It creates or updates the GitHub Actions repo variable ALPACA_AI_TARGET_BRANCH with the branch name from Alpaca settings.
 *
 * Newer workflow files prefer this variable. Failures are ignored so a token
 * without Variables permission does not block saving settings.
 *
 * @param string                             $token  GitHub personal access token.
 * @param array{owner: string, name: string} $repo_parts Parsed repository.
 * @param string                             $branch AI target branch.
 */
function alpaistr_agentic_sync_ai_target_branch_variable( string $token, array $repo_parts, string $branch ): void {
	if ( '' === $branch ) {
		return;
	}

	$headers = alpaistr_agentic_github_api_headers( $token );
	$patch   = wp_remote_request(
		sprintf(
			'https://api.github.com/repos/%s/%s/actions/variables/ALPACA_AI_TARGET_BRANCH',
			rawurlencode( $repo_parts['owner'] ),
			rawurlencode( $repo_parts['name'] )
		),
		[
			'method'  => 'PATCH',
			'timeout' => 15,
			'headers' => $headers,
			'body'    => wp_json_encode(
				[
					'name'  => 'ALPACA_AI_TARGET_BRANCH',
					'value' => $branch,
				]
			),
		]
	);

	if ( ! is_wp_error( $patch ) && in_array( (int) wp_remote_retrieve_response_code( $patch ), [ 201, 204 ], true ) ) {
		return;
	}

	wp_remote_post(
		sprintf(
			'https://api.github.com/repos/%s/%s/actions/variables',
			rawurlencode( $repo_parts['owner'] ),
			rawurlencode( $repo_parts['name'] )
		),
		[
			'timeout' => 15,
			'headers' => $headers,
			'body'    => wp_json_encode(
				[
					'name'  => 'ALPACA_AI_TARGET_BRANCH',
					'value' => $branch,
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
	return alpaistr_agentic_github_file_exists( $token, $repo_parts, '.github/workflows/agent-ready-trigger.yml', $branch );
}

/**
 * Whether a file exists in the configured GitHub repository.
 *
 * @param string                             $token      GitHub personal access token.
 * @param array{owner: string, name: string} $repo_parts Parsed repository.
 * @param string                             $path       Path relative to the repo root.
 * @param string                             $branch     Branch name. Empty uses the default branch.
 * @return bool
 */
function alpaistr_agentic_github_file_exists( string $token, array $repo_parts, string $path, string $branch = '' ): bool {
	$api_url = sprintf(
		'https://api.github.com/repos/%s/%s/contents/%s',
		rawurlencode( $repo_parts['owner'] ),
		rawurlencode( $repo_parts['name'] ),
		$path
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
 * Delete a file from a GitHub branch if it exists.
 *
 * @param string                             $token      GitHub personal access token.
 * @param array{owner: string, name: string} $repo_parts Parsed repository.
 * @param string                             $path       Path relative to the repo root.
 * @param string                             $branch     Branch name.
 * @param string                             $message    Commit message.
 * @return true|false|WP_Error True when deleted, false when the file was absent.
 */
function alpaistr_agentic_delete_github_file( string $token, array $repo_parts, string $path, string $branch, string $message ): bool|WP_Error {
	$api_url = sprintf(
		'https://api.github.com/repos/%s/%s/contents/%s',
		rawurlencode( $repo_parts['owner'] ),
		rawurlencode( $repo_parts['name'] ),
		$path
	);

	$get_response = wp_remote_get(
		add_query_arg( 'ref', $branch, $api_url ),
		[
			'timeout' => 15,
			'headers' => alpaistr_agentic_github_api_headers( $token ),
		]
	);

	if ( is_wp_error( $get_response ) ) {
		return $get_response;
	}

	if ( 200 !== wp_remote_retrieve_response_code( $get_response ) ) {
		return false;
	}

	$file = json_decode( wp_remote_retrieve_body( $get_response ), true );
	$sha  = is_array( $file ) ? (string) ( $file['sha'] ?? '' ) : '';
	if ( '' === $sha ) {
		return false;
	}

	$delete_response = wp_remote_request(
		$api_url,
		[
			'method'  => 'DELETE',
			'timeout' => 30,
			'headers' => alpaistr_agentic_github_api_headers( $token ),
			'body'    => wp_json_encode(
				[
					'message' => $message,
					'sha'     => $sha,
					'branch'  => $branch,
				]
			),
		]
	);

	if ( is_wp_error( $delete_response ) ) {
		return $delete_response;
	}

	$code = wp_remote_retrieve_response_code( $delete_response );
	if ( $code < 200 || $code >= 300 ) {
		$data           = json_decode( wp_remote_retrieve_body( $delete_response ), true );
		$error_message  = is_array( $data ) && isset( $data['message'] ) ? (string) $data['message'] : __( 'Could not delete the old workflow file.', 'alpaca-issue-tracker' );
		return new WP_Error( 'github_api_error', $error_message, [ 'status' => 502 ] );
	}

	return true;
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
		'github_token'     => defined( 'ALPAISTR_AGENTIC_GITHUB_TOKEN' ) ? ALPAISTR_AGENTIC_GITHUB_TOKEN : ( $options['github_token'] ?? '' ),
		'github_repo'      => $options['github_repo'] ?? '',
		'ai_target_branch' => $options['ai_target_branch'] ?? '',
		'ai_provider'      => $options['ai_provider'] ?? 'claude',
		'ai_api_key'       => defined( 'ALPAISTR_AGENTIC_AI_API_KEY' ) ? ALPAISTR_AGENTIC_AI_API_KEY : ( $options['ai_api_key'] ?? '' ),
		'project_context'  => $options['project_context'] ?? '',
	];
}
