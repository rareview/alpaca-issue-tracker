<?php
/**
 * Register class.
 *
 * @package Alpaca
 */

namespace Alpaca\Inc;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Register
 */
class Register {

	const PREFIX = 'alpaca';

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->register_assets();
	}

	/**
	 * Register assets.
	 *
	 * @return void
	 */
	public function register_assets() {

		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_assets' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_assets' ) );
	}

	/**
	 * Get the base script dependencies shared across Alpaca screens.
	 *
	 * @return string[] Script dependency handles.
	 */
	private function get_base_script_dependencies() {

		return array(
			'wp-element',
			'wp-api-fetch',
			'wp-i18n',
			'wp-components',
			'wp-dom-ready',
			'wp-data',
			'bowser',
		);
	}

	/**
	 * Get the additional block editor dependencies for the email template screen.
	 *
	 * @return string[] Script dependency handles.
	 */
	private function get_notification_template_dependencies() {

		return array(
			'wp-blocks',
			'wp-block-library',
			'wp-block-editor',
			'wp-core-data',
			'wp-editor',
			'wp-media-utils',
			'wp-rich-text',
			'wp-compose',
			'wp-format-library',
		);
	}
	/**
	 * Get the SnapDOM proxy URL prefix for image capture requests.
	 *
	 * @return string Proxy URL prefix.
	 */
	private function get_snapdom_proxy_setting() {
		return esc_url_raw(
			rest_url(
				'alpaca/v1/proxy?proxy_token=' .
				rawurlencode( function_exists( 'alpaca_get_proxy_auth_token' ) ? alpaca_get_proxy_auth_token() : '' ) .
				'&url='
			)
		);
	}

	/**
	 * Enqueue shared Alpaca assets.
	 *
	 * @param string[] $script_dependencies Script dependencies for the main bundle.
	 * @return void
	 */
	private function enqueue_shared_assets( $script_dependencies ) {

		// Only load Alpaca for logged-in users.
		if ( ! is_user_logged_in() ) {
			return;
		}
		$script_version = Helpers::version();
		$style_version  = Helpers::version();
		$plugin_root    = dirname( __DIR__ );
		$script_path    = $plugin_root . '/dist/index.js';
		$style_path     = $plugin_root . '/dist/index.css';

		if ( file_exists( $script_path ) ) {
			$script_version = (string) filemtime( $script_path );
		}

		if ( file_exists( $style_path ) ) {
			$style_version = (string) filemtime( $style_path );
		}

		wp_enqueue_style(
			'atkinson-hyperlegible-mono',
			'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Mono&display=swap',
			array(),
			Helpers::version()
		);

		// Enqueue vendor scripts.
		wp_enqueue_script(
			'bowser',
			Helpers::asset_url( 'vendor/bowser.es5.min.js' ),
			array(),
			Helpers::version(),
			true
		);

		wp_enqueue_script(
			'snapdom',
			Helpers::asset_url( 'vendor/snapdom.min.js' ),
			array(),
			Helpers::version(),
			true
		);

		// Main script (includes Prism.js via npm import).
		wp_enqueue_script(
			self::PREFIX . '-script',
			Helpers::asset_url( 'dist/index.js' ),
			$script_dependencies,
			$script_version,
			true
		);
		wp_enqueue_style(
			self::PREFIX . '-style',
			Helpers::asset_url( 'dist/index.css' ),
			array( 'wp-components', 'atkinson-hyperlegible-mono' ),
			$style_version
		);

		// Localize script.
		if ( function_exists( 'alpaca_prepare_datadump' ) ) {
			wp_localize_script( self::PREFIX . '-script', 'alpacaDataDump', \alpaca_prepare_datadump() );
		}

		$idle_indicator_days = absint( get_option( 'alpaca_idle_indicator_days', 1 ) );
		if ( $idle_indicator_days < 1 ) {
			$idle_indicator_days = 1;
		}

		wp_localize_script(
			self::PREFIX . '-script',
			'alpacaSettings',
			array(
				'idleIndicatorDays' => $idle_indicator_days,
				// SnapDOM expects the proxy string to be a prefix the library will append the target URL to.
				// Provide the proxy endpoint with the query param prefix so SnapDOM can append the encoded target URL.
				// Provide a signed proxy token that does not rely on browser cookies.
				// This keeps proxy requests working when SnapDOM fetches across origins.
			'snapdomProxy'          => $this->get_snapdom_proxy_setting(),
			)
		);
	}

	/**
	 * Enqueue frontend assets.
	 *
	 * @return void
	 */
	public function enqueue_assets() {

		$this->enqueue_shared_assets( $this->get_base_script_dependencies() );
	}
	/**
	 * Enqueue admin assets.
	 *
	 * @param string $hook_suffix Current admin page hook suffix.
	 */
	public function enqueue_admin_assets( $hook_suffix ) {

		$script_dependencies = $this->get_base_script_dependencies();
		if ( 'project-board_page_alpaca-notification-template' === $hook_suffix ) {
			$script_dependencies = array_merge(
				$script_dependencies,
				$this->get_notification_template_dependencies()
			);
		}

		$this->enqueue_shared_assets( array_values( array_unique( $script_dependencies ) ) );

		$idle_indicator_days = absint( get_option( 'alpaca_idle_indicator_days', 1 ) );
		if ( $idle_indicator_days < 1 ) {
			$idle_indicator_days = 1;
		}

		// Expose admin URL for use in JS (e.g., linking to admin pages).
		wp_localize_script(
			self::PREFIX . '-script',
			'alpacaSettings',
			array(
				'adminUrl'          => admin_url( 'admin.php' ),
				'idleIndicatorDays' => $idle_indicator_days,
				'snapdomProxy'      => $this->get_snapdom_proxy_setting(),
			)
		);

		if ( 'project-board_page_alpaca-notification-template' === $hook_suffix ) {
			wp_enqueue_media();
			wp_enqueue_style( 'wp-editor' );
			wp_enqueue_style( 'wp-edit-blocks' );
			wp_enqueue_style( 'wp-block-library' );
			wp_enqueue_style( 'wp-block-library-theme' );
		}

		// On the project board page.
		if ( 'toplevel_page_project-board' === $hook_suffix ) {
			// Ensure WP Heartbeat is available on the board page.
			wp_enqueue_script( 'heartbeat' );

			// Pass board data.
			wp_localize_script(
				self::PREFIX . '-script',
				'alpacaBoardData',
				\alpaca_get_board_data()
			);
				wp_localize_script(
					self::PREFIX . '-script',
					'alpacaUserData',
					array(
						'currentUserId' => get_current_user_id(),
					)
				);
		}
	}
}
