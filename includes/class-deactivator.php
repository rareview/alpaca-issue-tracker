<?php
/**
 * Plugin deactivation handler.
 *
 * @package Alpaca
 */

namespace Alpaca;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Deactivator class.
 */
class Deactivator {

	/**
	 * Run on plugin deactivation.
	 */
	public static function deactivate() {
		// Flush rewrite rules.
		flush_rewrite_rules();

		// Clear caches.
		wp_cache_flush();

		// Note: We don't delete data on deactivation.
		// Data is only removed on uninstall (see uninstall.php).
	}
}
