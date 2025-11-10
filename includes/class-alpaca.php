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
	const VERSION = '2.0.0';

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
		require_once ALPACA_PLUGIN_DIR . 'lib/expose-admin-colors.php';
		require_once ALPACA_PLUGIN_DIR . 'lib/private-comments.php';

		// Initialize private comments for issue comments.
		\add_action(
			'init',
			function () {
				hide_comment_type( 'issuecomment', true );
			}
		);

		// Load core functionality.
		require_once ALPACA_PLUGIN_DIR . 'includes/core/posttypes-and-taxonomies.php';
		require_once ALPACA_PLUGIN_DIR . 'includes/core/board.php';
		require_once ALPACA_PLUGIN_DIR . 'includes/core/commenting.php';

		// Load admin bar (available both frontend and backend).
		require_once ALPACA_PLUGIN_DIR . 'includes/admin/admin-bar.php';

		// Load admin-only functionality.
		if ( \is_admin() ) {
			require_once ALPACA_PLUGIN_DIR . 'includes/admin/admin-screens.php';
			require_once ALPACA_PLUGIN_DIR . 'includes/admin/admin-helpers.php';
		}

		// Load REST API.
		require_once ALPACA_PLUGIN_DIR . 'includes/api/rest-api.php';

		// Load integrations.
		require_once ALPACA_PLUGIN_DIR . 'includes/integrations/github.php';

		// Load frontend functionality.
		require_once ALPACA_PLUGIN_DIR . 'includes/frontend/data-dump.php';
	}

	/**
	 * Initialize WordPress hooks.
	 */
	private function init_hooks() {
		// Initialization.
		\add_action( 'init', array( $this, 'init' ), 0 );

		// Enqueue scripts.
		\add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_alpaca_scripts' ), 500 );
		\add_action( 'admin_enqueue_scripts', array( $this, 'admin_enqueue_scripts' ), 500 );
		\add_action( 'admin_enqueue_scripts', array( $this, 'admin_inline_styles' ), 501 );

		// REST API.
		\add_action( 'rest_api_init', array( $this, 'register_settings' ) );
	}

	/**
	 * Initialize plugin.
	 */
	public function init() {
		// Load text domain.
		\load_plugin_textdomain( 'alpaca', false, dirname( ALPACA_PLUGIN_BASENAME ) . '/languages' );

		// Allow other components to hook in.
		\do_action( 'alpaca_init' );
	}

	/**
	 * Enqueue Alpaca scripts and styles.
	 */
	public function enqueue_alpaca_scripts() {
		$plugin_url = \plugins_url( '/', ALPACA_PLUGIN_FILE );

		// Enqueue vendor scripts first.
		\wp_enqueue_script(
			'bowser',
			$plugin_url . 'vendor/bowser.es5.min.js',
			array(),
			ALPACA_VERSION,
			true
		);

		\wp_enqueue_script(
			'snapdom',
			$plugin_url . 'vendor/snapdom.min.js',
			array(),
			ALPACA_VERSION,
			true
		);

		// Enqueue data dump script (depends on bowser).
		\wp_enqueue_script(
			'alpaca-data-dump',
			$plugin_url . 'src/utils/dataDump.js',
			array( 'bowser' ),
			ALPACA_VERSION,
			true
		);

		// Pass data to JavaScript.
		if ( function_exists( 'alpaca_prepare_datadump' ) ) {
			\wp_localize_script( 'alpaca-data-dump', 'alpacaDataDump', \alpaca_prepare_datadump() );
		}

		// Enqueue main Alpaca script.
		\wp_enqueue_script(
			'alpaca',
			$plugin_url . 'dist/index.js',
			array(
				'wp-element',
				'wp-api-fetch',
				'wp-i18n',
				'wp-components',
				'wp-dom-ready',
				'wp-data',
				'alpaca-data-dump',
			),
			ALPACA_VERSION,
			true
		);

		// Enqueue main Alpaca styles.
		\wp_enqueue_style(
			'alpaca',
			$plugin_url . 'dist/index.css',
			array( 'wp-components' ),
			ALPACA_VERSION
		);
	}

	/**
	 * Enqueue admin scripts and styles.
	 *
	 * @param string $hook_suffix Current admin page hook suffix.
	 */
	public function admin_enqueue_scripts( $hook_suffix ) {
		$this->enqueue_alpaca_scripts();

		// On the project board page, enqueue board helpers and pass data.
		if ( 'toplevel_page_alpaca-board' === $hook_suffix ) {
			$plugin_url = \plugins_url( '/', ALPACA_PLUGIN_FILE );

			// Enqueue board helpers script.
			\wp_enqueue_script(
				'alpaca-board-helpers',
				$plugin_url . 'src/utils/boardHelpers.js',
				array( 'wp-hooks' ),
				ALPACA_VERSION,
				true
			);

			// Pass board data to JavaScript.
			\wp_localize_script(
				'alpaca',
				'alpacaBoardData',
				\alpaca_get_board_data()
			);
			\wp_localize_script(
				'alpaca',
				'alpacaUserData',
				array(
					'currentUserId' => \get_current_user_id(),
				)
			);
		}
	}

	/**
	 * Add inline styles for admin.
	 */
	public function admin_inline_styles() {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		if ( ! isset( $_GET['page'] ) || 'alpaca-board' !== $_GET['page'] ) {
			return;
		}

		$me = \get_current_user_id();

		$handle = 'alpaca-admin-inline';
		\wp_register_style( $handle, false, array(), ALPACA_VERSION );
		\wp_enqueue_style( $handle );

		$custom_css = "
			.wp-admin #alpaca-board .alpaca-item[data-assignee-$me],
			.wp-admin #alpaca-board .alpaca-item-dragging[data-assignee-$me] {
				background-color: #eee;
			}
		";

		if ( function_exists( 'expose_admin_colors' ) ) {
			$custom_css .= '
				.wp-admin #alpaca-board .alpaca-item-dragging {
					box-shadow: 0 0 8px var(--admin-color-1);
				}
				.wp-admin .alpaca-board-filter::before {
					background-color: var(--admin-color-1);
				}
				.alpaca-item .alpaca-item-controls .dashicons {
					color: var(--admin-color-1);
				}
			';
		}

		\wp_add_inline_style( $handle, $custom_css );
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
				'description'  => 'Enable console messages for testing purposes.',
				'show_in_rest' => true,
				'default'      => '0',
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
