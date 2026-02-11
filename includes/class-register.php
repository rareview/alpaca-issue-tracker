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
	 * Enqueue frontend assets.
	 *
	 * @return void
	 */
	public function enqueue_assets() {
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
			array( 'wp-element', 'wp-api-fetch', 'wp-i18n', 'wp-components', 'wp-dom-ready', 'wp-data', 'bowser' ),
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
	}

	/**
	 * Enqueue admin assets.
	 *
	 * @param string $hook_suffix Current admin page hook suffix.
	 */
	public function enqueue_admin_assets( $hook_suffix ) {
		$this->enqueue_assets();

		// Expose admin URL for use in JS (e.g., linking to admin pages).
		wp_localize_script(
			self::PREFIX . '-script',
			'alpacaSettings',
			array(
				'adminUrl' => admin_url( 'admin.php' ),
			)
		);

		// On the project board page.
		if ( 'toplevel_page_alpaca-board' === $hook_suffix ) {

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
