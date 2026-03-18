<?php
/**
 * Main plugin class.
 *
 * @package Alpaca
 */

namespace Alpaca;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Main Alpaca class.
 */
final class Alpaca {

	/**
	 * Plugin version.
	 *
	 * @var string
	 */
	const VERSION = '1.0.0-beta';

	/**
	 * Minimum PHP version.
	 *
	 * @var string
	 */
	const MIN_PHP_VERSION = '7.4';

	/**
	 * Minimum WordPress version.
	 *
	 * @var string
	 */
	const MIN_WP_VERSION = '5.8';

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
	 * @var Alpaca
	 */
	private static $instance = null;

	/**
	 * Get plugin instance.
	 *
	 * @return Alpaca
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
		if ( ! defined( 'ALPACA_VERSION' ) ) {
			define( 'ALPACA_VERSION', self::VERSION );
		}
		if ( ! defined( 'ALPACA_PLUGIN_FILE' ) ) {
			define( 'ALPACA_PLUGIN_FILE', ALPACA_PLUGIN_DIR . 'alpaca.php' );
		}
		if ( ! defined( 'ALPACA_PLUGIN_BASENAME' ) ) {
			define( 'ALPACA_PLUGIN_BASENAME', \plugin_basename( ALPACA_PLUGIN_FILE ) );
		}
		if ( ! defined( 'ALPACA_PLUGIN_URL' ) ) {
			define( 'ALPACA_PLUGIN_URL', \plugin_dir_url( ALPACA_PLUGIN_FILE ) );
		}
	}

	/**
	 * Load plugin dependencies.
	 */
	private function load_dependencies() {
		// Load utility functions first.
		require_once ALPACA_PLUGIN_DIR . 'includes/utilities/functions.php';

		// Load third-party libraries.
		require_once ALPACA_PLUGIN_DIR . 'lib/private-comments.php';

		// Initialize private comments for issue comments.
		\add_action(
			'init',
			function () {
				alpaca_hide_comment_type( 'issuecomment', true );
			}
		);

		// Load core functionality.
		require_once ALPACA_PLUGIN_DIR . 'includes/core/posttypes-and-taxonomies.php';
		require_once ALPACA_PLUGIN_DIR . 'includes/core/board.php';

		// Load admin bar (available both frontend and backend).
		require_once ALPACA_PLUGIN_DIR . 'includes/admin/admin-bar.php';

		// Load admin-only functionality.
		if ( \is_admin() ) {
			require_once ALPACA_PLUGIN_DIR . 'includes/admin/admin-screens.php';
			require_once ALPACA_PLUGIN_DIR . 'includes/admin/dashboard-widget.php';
			require_once ALPACA_PLUGIN_DIR . 'includes/admin/dashboard-widget-data.php';
		}

		// Load REST API.
		require_once ALPACA_PLUGIN_DIR . 'includes/api/rest-api.php';

		// Load frontend functionality.
		require_once ALPACA_PLUGIN_DIR . 'includes/frontend/data-dump.php';
	}

	/**
	 * Initialize WordPress hooks.
	 */
	private function init_hooks() {
		// Initialization.
		\add_action( 'init', array( $this, 'init' ), 0 );

		// REST API.
		\add_action( 'rest_api_init', array( $this, 'register_settings' ) );

		// Update last activity on new comment.
		\add_action( 'rest_insert_comment', array( $this, 'update_last_activity_on_rest_comment' ), 10, 3 );

		// Update last activity on deleted issue comments.
		\add_action( 'deleted_comment', array( $this, 'update_last_activity_on_deleted_comment' ), 20, 2 );
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

		alpaca_update_last_activity( $post_id );
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
			$comment = \get_comment( (int) $comment_id );
		}

		if ( ! ( $comment instanceof \WP_Comment ) ) {
			return;
		}

		if ( 'issuecomment' !== (string) $comment->comment_type ) {
			return;
		}

		$issue_id = (int) $comment->comment_post_ID;
		if ( $issue_id <= 0 || 'alpaca_issue' !== \get_post_type( $issue_id ) ) {
			return;
		}

		if ( function_exists( 'alpaca_update_last_activity_from_issuecomments' ) ) {
			alpaca_update_last_activity_from_issuecomments( $issue_id );
		}
	}

	/**
	 * Initialize plugin.
	 */
	public function init() {
		// Allow other components to hook in.
		\do_action( 'alpaca_init' );
	}

	/**
	 * Register Alpaca settings for REST API.
	 */
	public function register_settings() {
		\register_setting(
			'alpaca_options',
			'alpaca_enable_test_logs',
			array(
				'type'         => 'string',
				'description'  => esc_html__( 'Enable console messages for testing purposes.', 'alpaca' ),
				'show_in_rest' => true,
				'default'      => '0',
			)
		);

		\register_setting(
			'alpaca_options',
			'alpaca_item_datapoint_visibility',
			array(
				'type'              => 'object',
				'description'       => esc_html__( 'Visibility map for item datapoints on issue cards.', 'alpaca' ),
				'sanitize_callback' => array( $this, 'sanitize_item_datapoint_visibility' ),
				'show_in_rest'      => array(
					'schema' => array(
						'type'                 => 'object',
						'additionalProperties' => array(
							'type' => 'boolean',
						),
					),
				),
				'default'           => array(),
			)
		);
	}

	/**
	 * Sanitize datapoint visibility option values.
	 *
	 * @param mixed $value Raw option value.
	 * @return array<string, bool>
	 */
	public function sanitize_item_datapoint_visibility( $value ) {
		if ( ! is_array( $value ) ) {
			return array();
		}

		$sanitized = array();

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

	/**
	 * Get plugin version.
	 *
	 * @return string
	 */
	public function get_version() {
		return self::VERSION;
	}
}
