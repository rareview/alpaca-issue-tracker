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
		require_once ALPACA_PLUGIN_DIR . 'includes/notifications/notifications.php';

		// Load frontend functionality.
		require_once ALPACA_PLUGIN_DIR . 'includes/frontend/data-dump.php';
	}

	/**
	 * Initialize WordPress hooks.
	 */
	private function init_hooks() {
		// Initialization.
		\add_action( 'init', array( $this, 'load_textdomain' ), 1 );
		\add_action( 'init', array( $this, 'init' ), 0 );

		// REST API.
		\add_action( 'rest_api_init', array( $this, 'register_settings' ) );

		// Update last activity on new comment.
		\add_action( 'rest_insert_comment', array( $this, 'update_last_activity_on_rest_comment' ), 10, 3 );
	}

	/**
	 * Load plugin translations.
	 *
	 * Supports locale-specific subfolders inside the plugin languages directory,
	 * for example languages/ar/alpaca-ar.mo.
	 *
	 * @return void
	 */
	public function load_textdomain() {
		$locale = \determine_locale();

		/**
		 * Filters the locale used to load Alpaca translations.
		 *
		 * @param string $locale The locale to load.
		 */
		$locale = \apply_filters( 'plugin_locale', $locale, 'alpaca' );

		$locale_short = strtolower( substr( $locale, 0, 2 ) );
		$candidates   = array(
			ALPACA_PLUGIN_DIR . 'languages/' . $locale . '/alpaca-' . $locale . '.mo',
			ALPACA_PLUGIN_DIR . 'languages/' . $locale_short . '/alpaca-' . $locale_short . '.mo',
			ALPACA_PLUGIN_DIR . 'languages/alpaca-' . $locale . '.mo',
			ALPACA_PLUGIN_DIR . 'languages/alpaca-' . $locale_short . '.mo',
		);

		foreach ( $candidates as $mofile ) {
			if ( file_exists( $mofile ) ) {
				\load_textdomain( 'alpaca', $mofile );
				return;
			}
		}

		\load_plugin_textdomain(
			'alpaca',
			false,
			dirname( ALPACA_PLUGIN_BASENAME ) . '/languages'
		);
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

		$post_id   = $comment->comment_post_ID;
		$post_type = \get_post_type( $post_id );

		alpaca_update_last_activity( $post_id );
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
			'alpaca_idle_indicator_days',
			array(
				'type'              => 'integer',
				'description'       => esc_html__( 'Number of idle days before the board shows the idle indicator.', 'alpaca' ),
				'show_in_rest'      => true,
				'default'           => 1,
				'sanitize_callback' => function ( $value ) {
					$days = absint( $value );

					if ( $days < 1 ) {
						return 1;
					}

					return $days;
				},
			)
		);
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
