<?php
/**
 * Helpers class.
 *
 * @package Alpaca
 */

namespace Alpaca\Inc;

/**
 * Class Helpers
 */
class Helpers {

	/**
	 * Plugin version.
	 *
	 * @return string
	 */
	public static function version() {
		return '2.0.0';
	}

	/**
	 * Get asset URL.
	 *
	 * @param string $file Relative path to file.
	 * @return string Full URL.
	 */
	public static function asset_url( $file ) {
		return \plugins_url( $file, \dirname( __DIR__ ) . '/alpaca.php' );
	}
}
