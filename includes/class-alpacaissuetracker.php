<?php
/**
 * Main plugin class.
 *
 * @package AlpacaIssueTracker
 */

namespace AlpacaIssueTracker;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Main Alpaca Issue Tracker class.
 */
final class AlpacaIssueTracker {

	/**
	 * Plugin version.
	 *
	 * @var string
	 */
	const VERSION = '1.1.0';

	/**
	 * Minimum PHP version.
	 *
	 * @var string
	 */
	const MIN_PHP_VERSION = '8.0';

	/**
	 * Minimum WordPress version.
	 *
	 * @var string
	 */
	const MIN_WP_VERSION = '6.9';

	/**
	 * Maximum term score for board visibility.
	 *
	 * @var int
	 */
	const MAX_TERM_SCORE = 100;

	/**
	 * Minimum term score for board visibility.
	 *
	 * @var int
	 */
	const MIN_TERM_SCORE = -100;

	/**
	 * Plugin instance.
	 *
	 * @var AlpacaIssueTracker
	 */
	private static $instance = null;

	/**
	 * Get plugin instance.
	 *
	 * @return AlpacaIssueTracker
	 */
	public static function instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Constructor.
	 */
	private function __construct() {
		$this->define_constants();
		$this->load_dependencies();
		$this->init_hooks();
	}

	/**
	 * Define plugin constants.
	 */
	private function define_constants() {
		if ( ! defined( 'ALPAISTR_VERSION' ) ) {
			define( 'ALPAISTR_VERSION', self::VERSION );
		}
		if ( ! defined( 'ALPAISTR_PLUGIN_FILE' ) ) {
			define( 'ALPAISTR_PLUGIN_FILE', ALPAISTR_PLUGIN_DIR . 'alpacaissuetracker.php' );
		}
		if ( ! defined( 'ALPAISTR_PLUGIN_BASENAME' ) ) {
			define( 'ALPAISTR_PLUGIN_BASENAME', plugin_basename( ALPAISTR_PLUGIN_FILE ) );
		}
		if ( ! defined( 'ALPAISTR_PLUGIN_URL' ) ) {
			define( 'ALPAISTR_PLUGIN_URL', plugin_dir_url( ALPAISTR_PLUGIN_FILE ) );
		}
	}

	/**
	 * Load plugin dependencies.
	 */
	private function load_dependencies() {
		// Load utility functions first.
		require_once ALPAISTR_PLUGIN_DIR . 'includes/utilities/functions.php';

		// Load third-party libraries.
		require_once ALPAISTR_PLUGIN_DIR . 'lib/private-comments.php';

		// Load core functionality.
		require_once ALPAISTR_PLUGIN_DIR . 'includes/core/posttypes-and-taxonomies.php';
		require_once ALPAISTR_PLUGIN_DIR . 'includes/core/board.php';
		require_once ALPAISTR_PLUGIN_DIR . 'includes/blocks/class-project-board-block.php';
		require_once ALPAISTR_PLUGIN_DIR . 'includes/blocks/class-project-activity-block.php';
		new Project_Board_Block();
		new Project_Activity_Block();

		// Load admin bar (available both frontend and backend).
		require_once ALPAISTR_PLUGIN_DIR . 'includes/admin/admin-bar.php';

		// Load admin-only functionality.
		if ( is_admin() ) {
			require_once ALPAISTR_PLUGIN_DIR . 'includes/admin/admin-screens.php';
			require_once ALPAISTR_PLUGIN_DIR . 'includes/admin/dashboard-widget.php';
			require_once ALPAISTR_PLUGIN_DIR . 'includes/admin/dashboard-widget-data.php';
		}

		// Load REST API.
		require_once ALPAISTR_PLUGIN_DIR . 'includes/api/rest-api.php';
		require_once ALPAISTR_PLUGIN_DIR . 'includes/notifications/notifications.php';

		// Load frontend functionality.
		require_once ALPAISTR_PLUGIN_DIR . 'includes/frontend/data-dump.php';
	}

	/**
	 * Initialize WordPress hooks.
	 */
	private function init_hooks() {
		// Initialization.
		add_action( 'init', [ $this, 'load_textdomain' ], 1 );
		add_action( 'init', [ $this, 'init' ], 0 );

		// REST API.
		add_action( 'rest_api_init', [ $this, 'register_settings' ] );

		// Update last activity on new comment.
		add_action( 'rest_insert_comment', [ $this, 'update_last_activity_on_rest_comment' ], 10, 3 );

		// Update last activity on deleted issue comments.
		add_action( 'deleted_comment', [ $this, 'update_last_activity_on_deleted_comment' ], 20, 2 );

		// Keep child issues in sync when parent issues are trashed or restored.
		add_action( 'transition_post_status', [ $this, 'sync_child_issues_on_status_transition' ], 10, 3 );

		// Restore issue comment approval statuses when an issue leaves trash.
		add_action( 'transition_post_status', [ $this, 'restore_issue_comments_on_untrash' ], 20, 3 );
	}

	/**
	 * Load plugin translations.
	 *
	 * Supports locale-specific subfolders inside the plugin languages directory,
	 * for example languages/ar/alpaca-issue-tracker-ar.mo.
	 *
	 * @return void
	 */
	public function load_textdomain() {
		$locale = determine_locale();

		/**
		 * Filters the locale used to load Alpaca Issue Tracker translations.
		 *
		 * @param string $locale The locale to load.
		 */
		// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- This uses the core WordPress plugin locale filter.
		$locale = apply_filters( 'plugin_locale', $locale, 'alpaca-issue-tracker' );

		$locale_short = strtolower( substr( $locale, 0, 2 ) );
		$candidates   = [
			ALPAISTR_PLUGIN_DIR . 'languages/' . $locale . '/alpaca-issue-tracker-' . $locale . '.mo',
			ALPAISTR_PLUGIN_DIR . 'languages/' . $locale_short . '/alpaca-issue-tracker-' . $locale_short . '.mo',
			ALPAISTR_PLUGIN_DIR . 'languages/alpaca-issue-tracker-' . $locale . '.mo',
			ALPAISTR_PLUGIN_DIR . 'languages/alpaca-issue-tracker-' . $locale_short . '.mo',
		];

		foreach ( $candidates as $mofile ) {
			if ( file_exists( $mofile ) ) {
				load_textdomain( 'alpaca-issue-tracker', $mofile );
				return;
			}
		}
	}

	/**
	 * Update the last activity timestamp when a new comment is posted via the REST API.
	 *
	 * @param \WP_Comment      $comment  The comment object.
	 * @param \WP_REST_Request $request  The request object.
	 * @param bool             $creating True when creating a comment, false when updating.
	 */
	public function update_last_activity_on_rest_comment( $comment, $request, $creating ) {
		if ( ! $creating ) {
			return;
		}

		if ( ! isset( $comment->comment_type ) || 'issuecomment' !== $comment->comment_type ) {
			return;
		}

		$post_id = $comment->comment_post_ID;

		alpaistr_update_last_activity( $post_id );
	}

	/**
	 * Update the last activity timestamp when an issue comment is deleted.
	 *
	 * On deletion we recompute the lastActivity meta based on the most recent
	 * remaining approved `issuecomment` on the issue.
	 *
	 * @param int         $comment_id Deleted comment ID.
	 * @param \WP_Comment $comment    Deleted comment object.
	 * @return void
	 */
	public function update_last_activity_on_deleted_comment( $comment_id, $comment ) {
		if ( ! ( $comment instanceof \WP_Comment ) ) {
			$comment = get_comment( (int) $comment_id );
		}

		if ( ! ( $comment instanceof \WP_Comment ) ) {
			return;
		}

		if ( 'issuecomment' !== (string) $comment->comment_type ) {
			return;
		}

		$issue_id = (int) $comment->comment_post_ID;
		if ( $issue_id <= 0 || 'alpaca_issue' !== get_post_type( $issue_id ) ) {
			return;
		}

		if ( function_exists( 'alpaistr_update_last_activity_from_issuecomments' ) ) {
			alpaistr_update_last_activity_from_issuecomments( $issue_id );
		}
	}

	/**
	 * Restore issue comment approval statuses when an issue is restored.
	 *
	 * @param string   $new_status New post status.
	 * @param string   $old_status Previous post status.
	 * @param \WP_Post $post      Post object.
	 * @return void
	 */
	public function restore_issue_comments_on_untrash( $new_status, $old_status, $post ) {
		if ( ! ( $post instanceof \WP_Post ) ) {
			return;
		}

		if ( 'alpaca_issue' !== (string) $post->post_type ) {
			return;
		}

		if ( 'trash' !== (string) $old_status || 'trash' === (string) $new_status ) {
			return;
		}

		if ( function_exists( 'alpaistr_restore_issuecomment_approval_statuses' ) ) {
			alpaistr_restore_issuecomment_approval_statuses( (int) $post->ID );
		}
	}

	/**
	 * Sync direct child issues when a parent issue is trashed or restored.
	 *
	 * @param string   $new_status New post status.
	 * @param string   $old_status Previous post status.
	 * @param \WP_Post $post      Post object.
	 * @return void
	 */
	public function sync_child_issues_on_status_transition( $new_status, $old_status, $post ) {
		if ( ! ( $post instanceof \WP_Post ) ) {
			return;
		}

		if ( 'alpaca_issue' !== (string) $post->post_type ) {
			return;
		}

		$post_id = (int) $post->ID;
		if ( $post_id <= 0 ) {
			return;
		}

		if ( 'trash' !== (string) $old_status && 'trash' === (string) $new_status ) {
			if ( function_exists( 'alpaistr_trash_child_issues_with_parent' ) ) {
				alpaistr_trash_child_issues_with_parent( $post_id );
			}
		}

		if ( 'trash' === (string) $old_status && 'trash' !== (string) $new_status ) {
			if ( function_exists( 'alpaistr_restore_child_issues_trashed_with_parent' ) ) {
				alpaistr_restore_child_issues_trashed_with_parent( $post_id, (string) $new_status );
			}
		}

		if ( ( 'trash' === (string) $old_status || 'trash' === (string) $new_status ) && function_exists( 'alpaistr_clear_board_cache' ) ) {
			alpaistr_clear_board_cache();
		}
	}

	/**
	 * Initialize plugin.
	 */
	public function init() {
		// Allow other components to hook in.
		do_action( 'alpaistr_init' );
	}

	/**
	 * Register Alpaca Issue Tracker settings for REST API.
	 */
	public function register_settings() {
		register_setting(
			'alpaistr_options',
			'alpaistr_enable_test_logs',
			[
				'type'              => 'string',
				'description'       => esc_html__( 'Enable console messages for testing purposes.', 'alpaca-issue-tracker' ),
				'sanitize_callback' => [ $this, 'sanitize_binary_setting' ],
				'show_in_rest'      => true,
				'default'           => '0',
			]
		);

		register_setting(
			'alpaistr_options',
			'alpaistr_enable_context_capture',
			[
				'type'              => 'string',
				'description'       => esc_html__( 'Enable context capture, including the toolbar and data dump.', 'alpaca-issue-tracker' ),
				'sanitize_callback' => [ $this, 'sanitize_binary_setting' ],
				'show_in_rest'      => true,
				'default'           => '1',
			]
		);

		register_setting(
			'alpaistr_options',
			'alpaistr_item_datapoint_visibility',
			[
				'type'              => 'object',
				'description'       => esc_html__( 'Visibility map for item datapoints on issue cards.', 'alpaca-issue-tracker' ),
				'sanitize_callback' => [ $this, 'sanitize_item_datapoint_visibility' ],
				'show_in_rest'      => [
					'schema' => [
						'type'                 => 'object',
						'additionalProperties' => [
							'type' => 'boolean',
						],
					],
				],
				'default'           => [],
			]
		);
	}

	/**
	 * Sanitize a setting that stores a binary enabled/disabled value.
	 *
	 * @param mixed $value Raw setting value.
	 * @return string
	 */
	public function sanitize_binary_setting( $value ) {
		if ( is_bool( $value ) ) {
			return $value ? '1' : '0';
		}

		if ( is_numeric( $value ) ) {
			return 1 === (int) $value ? '1' : '0';
		}

		if ( ! is_scalar( $value ) ) {
			return '0';
		}

		$normalized_value = strtolower( trim( (string) $value ) );

		return in_array( $normalized_value, [ '1', 'true', 'yes', 'on' ], true ) ? '1' : '0';
	}

	/**
	 * Sanitize datapoint visibility option values.
	 *
	 * @param mixed $value Raw option value.
	 * @return array<string, bool>
	 */
	public function sanitize_item_datapoint_visibility( $value ) {
		if ( ! is_array( $value ) ) {
			return [];
		}

		$sanitized = [];

		foreach ( $value as $slug => $is_enabled ) {
			if ( ! is_string( $slug ) ) {
				continue;
			}

			$clean_slug = sanitize_key( $slug );

			if ( '' === $clean_slug ) {
				continue;
			}

			$sanitized[ $clean_slug ] = (bool) $is_enabled;
		}

		return $sanitized;
	}
}
