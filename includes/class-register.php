<?php
/**
 * Register class.
 *
 * @package Alpaca
 */

namespace Alpaca\Inc;

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

		// Main script.
		wp_enqueue_script(
			self::PREFIX . '-script',
			Helpers::asset_url( 'dist/index.js' ),
			array( 'wp-element', 'wp-api-fetch', 'wp-i18n', 'wp-components', 'wp-dom-ready', 'wp-data', 'bowser' ),
			Helpers::version(),
			true
		);

		wp_enqueue_style(
			self::PREFIX . '-style',
			Helpers::asset_url( 'dist/index.css' ),
			array( 'wp-components' ),
			Helpers::version()
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
