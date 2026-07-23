<?php
/**
 * Settings for the Agentic (AI Issue Resolver) feature.
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
	const PAGE_SLUG = 'alpaca-ai-issue-resolver';

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

		return [
			'enabled'         => ! empty( $raw['enabled'] ),
			'github_token'    => $github_token,
			'github_repo'     => sanitize_text_field( $raw['github_repo'] ?? ( $current_settings['github_repo'] ?? '' ) ),
			'ai_provider'     => in_array( $raw['ai_provider'] ?? '', $providers, true )
				? $raw['ai_provider']
				: ( $current_settings['ai_provider'] ?? 'claude' ),
			'ai_api_key'      => $ai_api_key,
			// Incomplete: optional per-site notes for the drafting AI. Stored/sanitized here but no wizard field yet.
			'project_context' => sanitize_textarea_field( $raw['project_context'] ?? ( $current_settings['project_context'] ?? '' ) ),
			'setup_checklist' => array_values(
				array_unique(
					array_map( 'absint', (array) ( $raw['setup_checklist'] ?? [] ) )
				)
			),
			// User IDs allowed to use the AI Issue Fixer besides administrators (who always have access).
			'engineers'       => array_key_exists( 'engineers', $raw )
				? array_values( array_unique( array_map( 'absint', (array) $raw['engineers'] ) ) )
				: array_values( array_unique( array_map( 'absint', (array) ( $current_settings['engineers'] ?? [] ) ) ) ),
		];
	}

	/**
	 * Get the IDs of users explicitly granted AI Issue Fixer access (besides administrators).
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
	 * Whether the current user may use the AI Issue Fixer: 
     * 1. administrators always can,
	 * 2. plus anyone explicitly added to the engineers allowlist.
	 */
	public static function current_user_can_use(): bool {
		return current_user_can( 'manage_options' ) || self::is_current_user_engineer();
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
			'ai_provider'                => $options['ai_provider'] ?? 'claude',
			// Incomplete: exposed for future wizard UI; usually empty until an admin field is added.
			'project_context'            => $options['project_context'] ?? '',
			'setup_checklist'            => array_map( 'absint', (array) ( $options['setup_checklist'] ?? [] ) ),
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
		wp_localize_script(
			'alpaca-script',
			'agenticConfig',
			[
				'restBase'       => esc_url_raw( rest_url( 'alpaca/v1/agentic' ) ),
				'nonce'          => wp_create_nonce( 'wp_rest' ),
				'setupCompleted' => $this->is_setup_completed(),
				// Only administrators and users on the engineers allowlist may send issues to the AI agent.
				'isAuthorized'   => self::current_user_can_use(),
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

		if ( empty( $github_token ) || empty( $github_repo ) || empty( $ai_key ) ) {
			return false;
		}

		$workflow_installed = get_transient( 'alpaistr_agentic_workflow_installed' ) || get_option( 'alpaistr_agentic_workflow_pr_url', '' );
		return (bool) $workflow_installed;
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
