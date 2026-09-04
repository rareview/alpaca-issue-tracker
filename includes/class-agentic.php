<?php
/**
 * Settings for the Agentic (Fix with AI) feature.
 *
 * Option registration, board config localization, and client settings payload.
 * Admin UI mounts via React (src/AgenticSettings.jsx).
 * GitHub workflow templates: includes/agentic/
 *
 * @package AlpacaIssueTracker
 */

namespace AlpacaIssueTracker\Agentic;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Handles Agentic option registration and related helpers.
 */
class Agentic {

	/**
	 * WordPress option key that stores all Agentic settings as a single array.
	 *
	 * @var string
	 */
	const OPTION_KEY = 'alpaistr_agentic_settings';

	/**
	 * Admin page slug.
	 *
	 * @var string
	 */
	const PAGE_SLUG = 'alpaca-fix-with-ai';

	/**
	 * Register WordPress hooks.
	 */
	public function register(): void {
		add_action( 'admin_init', [ $this, 'register_settings' ] );
		add_action( 'admin_enqueue_scripts', [ $this, 'localize_board_config' ], 20 );
	}

	/**
	 * Register the Agentic option.
	 */
	public function register_settings(): void {
		register_setting(
			self::OPTION_KEY,
			self::OPTION_KEY,
			[
				'sanitize_callback' => [ $this, 'sanitize_settings' ],
			]
		);
	}

	/**
	 * Sanitize all settings values before save.
	 *
	 * @param mixed $raw Raw data.
	 * @return array Sanitized settings array.
	 */
	public function sanitize_settings( mixed $raw ): array {
		if ( ! is_array( $raw ) ) {
			return [];
		}

		$providers        = [ 'claude', 'openai' ];
		$current_settings = get_option( self::OPTION_KEY, [] );
		if ( ! is_array( $current_settings ) ) {
			$current_settings = [];
		}

		$github_token = array_key_exists( 'github_token', $raw )
			? sanitize_text_field( (string) $raw['github_token'] )
			: ( $current_settings['github_token'] ?? '' );
		if ( '' === $github_token && array_key_exists( 'github_token', $raw ) ) {
			$github_token = $current_settings['github_token'] ?? '';
		}

		$ai_api_key = array_key_exists( 'ai_api_key', $raw )
			? sanitize_text_field( (string) $raw['ai_api_key'] )
			: ( $current_settings['ai_api_key'] ?? '' );
		if ( '' === $ai_api_key && array_key_exists( 'ai_api_key', $raw ) ) {
			$ai_api_key = $current_settings['ai_api_key'] ?? '';
		}

		// Constants always win for storage — do not overwrite DB from client when defined.
		// This won't cause "unexpected" behaviour where user wants to save data, but data doesn't get saved,
		// because input fields are disabled if these constants are defined,
		// so this is just another layer of protection, for edge-cases, api calls, another plugin calling update_option etc.
		if ( defined( 'ALPAISTR_AGENTIC_GITHUB_TOKEN' ) ) {
			$github_token = $current_settings['github_token'] ?? '';
		}
		if ( defined( 'ALPAISTR_AGENTIC_AI_API_KEY' ) ) {
			$ai_api_key = $current_settings['ai_api_key'] ?? '';
		}

		$github_repo = sanitize_text_field( $raw['github_repo'] ?? ( $current_settings['github_repo'] ?? '' ) );

		// Confirmation that this WP site matches the chosen GitHub repo (warn-only gate in the wizard).
		$repo_changed = (string) ( $current_settings['github_repo'] ?? '' ) !== $github_repo;
		if ( $repo_changed ) {
			// Changing the repo clears the confirmation so the admin must re-check.
			$repo_match_confirmed   = false;
			$ai_target_branch      = sanitize_text_field( (string) ( $raw['ai_target_branch'] ?? '' ) );
			$github_default_branch = sanitize_text_field( (string) ( $raw['github_default_branch'] ?? '' ) );
		} elseif ( array_key_exists( 'repo_match_confirmed', $raw ) ) {
			$repo_match_confirmed = ! empty( $raw['repo_match_confirmed'] );
			$ai_target_branch     = sanitize_text_field(
				(string) ( $raw['ai_target_branch'] ?? ( $current_settings['ai_target_branch'] ?? '' ) )
			);
			$github_default_branch = sanitize_text_field(
				(string) ( $raw['github_default_branch'] ?? ( $current_settings['github_default_branch'] ?? '' ) )
			);
		} else {
			$repo_match_confirmed  = ! empty( $current_settings['repo_match_confirmed'] );
			$ai_target_branch      = sanitize_text_field( (string) ( $current_settings['ai_target_branch'] ?? '' ) );
			$github_default_branch = sanitize_text_field( (string) ( $current_settings['github_default_branch'] ?? '' ) );
		}

		if ( array_key_exists( 'ai_target_branch', $raw ) && ! $repo_changed ) {
			$ai_target_branch = sanitize_text_field( (string) $raw['ai_target_branch'] );
		}
		if ( array_key_exists( 'github_default_branch', $raw ) && ! $repo_changed ) {
			$github_default_branch = sanitize_text_field( (string) $raw['github_default_branch'] );
		}

		return [
			'enabled'                => ! empty( $raw['enabled'] ),
			'github_token'           => $github_token,
			'github_repo'            => $github_repo,
			'ai_target_branch'       => $ai_target_branch,
			'github_default_branch'  => $github_default_branch,
			'ai_provider'            => in_array( $raw['ai_provider'] ?? '', $providers, true )
				? $raw['ai_provider']
				: ( $current_settings['ai_provider'] ?? 'claude' ),
			'ai_api_key'             => $ai_api_key,
			// Optional per-site notes appended to every AI-drafted GitHub issue.
			'project_context'        => sanitize_textarea_field( $raw['project_context'] ?? ( $current_settings['project_context'] ?? '' ) ),
			'setup_checklist'        => array_values(
				array_unique(
					array_map( 'absint', (array) ( $raw['setup_checklist'] ?? [] ) )
				)
			),
			'repo_match_confirmed'   => $repo_match_confirmed,
			// User IDs allowed to use the Fix with AI feature besides administrators (who always have access).
			'engineers'              => array_key_exists( 'engineers', $raw )
				? array_values( array_unique( array_map( 'absint', (array) $raw['engineers'] ) ) )
				: array_values( array_unique( array_map( 'absint', (array) ( $current_settings['engineers'] ?? [] ) ) ) ),
		];
	}

	/**
	 * Get the IDs of users explicitly granted Fix with AI access (besides administrators).
	 *
	 * @return int[] User IDs.
	 */
	public static function get_engineer_ids(): array {
		$options = get_option( self::OPTION_KEY, [] );
		if ( ! is_array( $options ) ) {
			return [];
		}
		return array_map( 'absint', (array) ( $options['engineers'] ?? [] ) );
	}

	/**
	 * Whether the current user is on the engineers allowlist (regardless of role).
	 */
	public static function is_current_user_engineer(): bool {
		return in_array( get_current_user_id(), self::get_engineer_ids(), true );
	}

	/**
	 * Whether the current user may use the Fix with AI feature:
	 * 1. administrators always can,
	 * 2. plus anyone explicitly added to the engineers allowlist.
	 */
	public static function current_user_can_use(): bool {
		return current_user_can( 'manage_options' ) || self::is_current_user_engineer();
	}

	/**
	 * Whether the WordPress AI Client infrastructure is present and AI support is on.
	 */
	public static function is_wp_ai_available(): bool {
		return function_exists( 'wp_ai_client_prompt' )
			&& wp_supports_ai()
			&& class_exists( 'WordPress\\AiClient\\AiClient' );
	}

	/**
	 * Whether at least one WP Connectors AI provider is registered and configured.
	 *
	 * Checks anthropic and openai first (the fallback direct-HTTP providers), then
	 * any other registered provider so any Connectors setup is accepted.
	 */
	public static function is_wp_ai_configured(): bool {
		if ( ! self::is_wp_ai_available() ) {
			return false;
		}

		try {
			$registry = \WordPress\AiClient\AiClient::defaultRegistry();

			foreach ( [ 'anthropic', 'openai' ] as $provider_id ) {
				if ( $registry->hasProvider( $provider_id ) && $registry->isProviderConfigured( $provider_id ) ) {
					return true;
				}
			}

			foreach ( $registry->getRegisteredProviderIds() as $provider_id ) {
				if ( $registry->isProviderConfigured( $provider_id ) ) {
					return true;
				}
			}
		} catch ( \Throwable $e ) {
			return false;
		}

		return false;
	}

	/**
	 * Build a client-safe settings payload for the React wizard.
	 *
	 * Secrets are never sent. Empty token fields on save keep existing values.
	 *
	 * @return array<string, mixed>
	 */
	public static function get_wizard_settings(): array {
		$options = get_option( self::OPTION_KEY, [] );
		if ( ! is_array( $options ) ) {
			$options = [];
		}

		$github_token_from_constant = defined( 'ALPAISTR_AGENTIC_GITHUB_TOKEN' );
		$ai_api_key_from_constant   = defined( 'ALPAISTR_AGENTIC_AI_API_KEY' );
		$github_token               = $github_token_from_constant
			? ALPAISTR_AGENTIC_GITHUB_TOKEN
			: ( $options['github_token'] ?? '' );
		$ai_api_key                 = $ai_api_key_from_constant
			? ALPAISTR_AGENTIC_AI_API_KEY
			: ( $options['ai_api_key'] ?? '' );
		$github_repo                = $options['github_repo'] ?? '';
		$pr_url                     = (string) get_option( 'alpaistr_agentic_workflow_pr_url', '' );
		$workflow_installed         = ! empty( $pr_url ) || (bool) get_transient( 'alpaistr_agentic_workflow_installed' );
		$is_admin                   = current_user_can( 'manage_options' );

		return [
			'enabled'                    => ! empty( $options['enabled'] ),
			'github_repo'                => $github_repo,
			'ai_target_branch'           => $options['ai_target_branch'] ?? '',
			'github_default_branch'      => $options['github_default_branch'] ?? '',
			'ai_provider'                => $options['ai_provider'] ?? 'claude',
			'project_context'            => $options['project_context'] ?? '',
			'setup_checklist'            => array_map( 'absint', (array) ( $options['setup_checklist'] ?? [] ) ),
			'repo_match_confirmed'       => ! empty( $options['repo_match_confirmed'] ),
			'github_token_set'           => '' !== (string) $github_token,
			'github_token_from_constant' => $github_token_from_constant,
			'ai_api_key_set'             => '' !== (string) $ai_api_key,
			'ai_api_key_from_constant'   => $ai_api_key_from_constant,
			'workflow_pr_url'            => $pr_url,
			'workflow_installed'         => (bool) $workflow_installed,
			'repo_actions_url'           => $github_repo ? 'https://github.com/' . $github_repo . '/actions' : '',
			'repo_secrets_url'           => $github_repo ? 'https://github.com/' . $github_repo . '/settings/secrets/actions' : '',
			// Access control: administrators can always edit; engineers get a read-only view.
			'engineers'                  => self::get_engineer_ids(),
			'is_admin'                   => $is_admin,
			'is_engineer'                => self::is_current_user_engineer(),
			'can_edit'                   => $is_admin, // only admins can edit settings.
			// WP Connectors / AI Client status.
			'wp_ai_available'            => self::is_wp_ai_available(),
			'wp_ai_configured'           => self::is_wp_ai_configured(),
			'connectors_admin_url'       => admin_url( 'options-connectors.php' ),
			// AI is ready: on WP 7.0+ only Connectors counts; on older WP a custom key is required.
			'ai_ready'                   => self::is_wp_ai_available()
				? self::is_wp_ai_configured()
				: '' !== (string) $ai_api_key,
			// Security setup checklist + PAT guidance from includes/agentic/security/setup.json.
			'setup_security'             => self::get_setup_security_payload(),
		];
	}

	/**
	 * Client-safe setup security checklist and PAT guidance.
	 *
	 * @return array{branch_protection: array<int, array{key: int, label: string}>, pat_guidance: string}
	 */
	public static function get_setup_security_payload(): array {
		$raw = self::load_security_json( 'setup.json' );
		$branch_protection = [];

		foreach ( (array) ( $raw['branch_protection'] ?? [] ) as $item ) {
			if ( ! is_array( $item ) ) {
				continue;
			}
			$key   = absint( $item['key'] ?? 0 );
			$label = sanitize_text_field( (string) ( $item['label'] ?? '' ) );
			if ( $key <= 0 || '' === $label ) {
				continue;
			}
			$branch_protection[] = [
				'key'   => $key,
				'label' => $label,
			];
		}

		return [
			'branch_protection' => $branch_protection,
			'pat_guidance'      => sanitize_textarea_field( (string) ( $raw['pat_guidance'] ?? '' ) ),
		];
	}

	/**
	 * Localize board/activity config onto the main Alpaca script bundle.
	 *
	 * @param string $hook Current admin page hook suffix.
	 */
	public function localize_board_config( string $hook ): void {
		// If not a board page, cancel.
		$board_hooks = [ 'toplevel_page_project-board', 'project-board_page_project-activity' ];
		if ( ! in_array( $hook, $board_hooks, true ) ) {
			return;
		}

		// If there is no main Alpaca script, cancel.
		if ( ! wp_script_is( 'alpaca-script', 'enqueued' ) ) {
			return;
		}

		// Localize.
		$options = get_option( self::OPTION_KEY, [] );
		if ( ! is_array( $options ) ) {
			$options = [];
		}

		wp_localize_script(
			'alpaca-script',
			'agenticConfig',
			[
				'restBase'        => esc_url_raw( rest_url( 'alpaca/v1/agentic' ) ),
				'nonce'           => wp_create_nonce( 'wp_rest' ),
				'setupCompleted'  => $this->is_setup_completed(),
				'isAuthorized'    => self::current_user_can_use(), // Only administrators and users on the engineers allowlist may send issues to the AI agent.
				'aiTargetBranch'  => (string) ( $options['ai_target_branch'] ?? '' ),
			]
		);
	}

	/**
	 * Check that the feature is enabled, credentials are set, and workflow is installed.
	 */
	public function is_setup_completed(): bool {
		$options = get_option( self::OPTION_KEY, [] );
		if ( ! is_array( $options ) || empty( $options['enabled'] ) ) {
			return false;
		}

		$github_token = defined( 'ALPAISTR_AGENTIC_GITHUB_TOKEN' ) ? ALPAISTR_AGENTIC_GITHUB_TOKEN : ( $options['github_token'] ?? '' );
		$github_repo  = $options['github_repo'] ?? '';
		$ai_key       = defined( 'ALPAISTR_AGENTIC_AI_API_KEY' ) ? ALPAISTR_AGENTIC_AI_API_KEY : ( $options['ai_api_key'] ?? '' );

		$ai_ready = self::is_wp_ai_available()
			? self::is_wp_ai_configured()
			: ! empty( $ai_key );
		$ai_target_branch = $options['ai_target_branch'] ?? '';
		if ( empty( $github_token ) || empty( $github_repo ) || empty( $ai_target_branch ) || ! $ai_ready ) {
			return false;
		}

		$workflow_installed = get_transient( 'alpaistr_agentic_workflow_installed' ) || get_option( 'alpaistr_agentic_workflow_pr_url', '' );
		return (bool) $workflow_installed;
	}

	/**
	 * Absolute path to the bundled Fix with AI security policy directory.
	 *
	 * @return string Trailing-slash directory path.
	 */
	public static function security_dir(): string {
		return ALPAISTR_PLUGIN_DIR . 'includes/agentic/security/';
	}

	/**
	 * Read a file from the security policy directory.
	 *
	 * @param string $filename File name relative to the security directory (e.g. agent.json).
	 * @return string File contents, or empty string when missing/unreadable.
	 */
	public static function load_security_file( string $filename ): string {
		$filename = ltrim( str_replace( [ '..', '\\' ], '', $filename ), '/' );
		if ( '' === $filename || str_contains( $filename, '/' ) ) {
			return '';
		}

		$path = self::security_dir() . $filename;
		if ( ! is_readable( $path ) ) {
			return '';
		}

		// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- Local plugin file.
		$contents = file_get_contents( $path );

		return false === $contents ? '' : (string) $contents;
	}

	/**
	 * Decode a JSON file from the security policy directory.
	 *
	 * @param string $filename JSON file name (e.g. setup.json).
	 * @return array<string, mixed> Decoded object, or empty array on failure.
	 */
	public static function load_security_json( string $filename ): array {
		$raw = self::load_security_file( $filename );
		if ( '' === $raw ) {
			return [];
		}

		$decoded = json_decode( $raw, true );

		return is_array( $decoded ) ? $decoded : [];
	}

	/**
	 * Absolute path to the CI agent security policy file (installed to customer repos).
	 *
	 * @return string Absolute filesystem path, or empty when missing.
	 */
	public static function agent_security_json_path(): string {
		$path = self::security_dir() . 'agent.json';

		return is_readable( $path ) ? $path : '';
	}

	/**
	 * Get a single option value with an optional default.
	 *
	 * @param string $key           Option key.
	 * @param string $default_value Default value.
	 * @return string Option value or default.
	 */
	public function get_option( string $key, string $default_value = '' ): string {
		$options = get_option( self::OPTION_KEY, [] );
		if ( ! is_array( $options ) ) {
			return $default_value;
		}
		return isset( $options[ $key ] ) ? (string) $options[ $key ] : $default_value;
	}
}
