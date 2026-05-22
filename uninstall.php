<?php
/**
 * Uninstall handler - cleans up plugin data.
 *
 * @package AlpacaIssueTracker
 */

// Exit if accessed directly or not during uninstall.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

global $wpdb;

/**
 * Remove plugin data on uninstall.
 *
 * WARNING: This deletes ALL plugin data.
 * Uncomment sections as needed based on user preferences.
 */

// Delete options.
delete_option( 'alpaistr_needs_term_setup' );
delete_option( 'alpaistr_default_status_id' );
delete_option( 'alpaistr_enable_test_logs' );

// Delete term meta.
// Keep label color metadata because label terms are intentionally retained.
$wpdb->query( "DELETE FROM {$wpdb->termmeta} WHERE meta_key LIKE 'alpaca_%' AND meta_key != 'alpaca_label_color'" ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

// Delete user meta (watchlists).
$wpdb->query( "DELETE FROM {$wpdb->usermeta} WHERE meta_key = 'alpaca_watchlist'" ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

// Clear caches.
wp_cache_flush();
