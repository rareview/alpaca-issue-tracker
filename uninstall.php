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

// Remove Fix With AI files from GitHub before the token is deleted.
// WordPress only loads this file, so that work lives in uninstall/.
require_once __DIR__ . '/uninstall/github-cleanup.php';

try {
	alpaistr_uninstall_remove_github_agentic_config();
} catch ( \Throwable $throwable ) {
	error_log( '[Alpaca] GitHub cleanup on uninstall failed: ' . $throwable->getMessage() ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
}

// Delete options.
delete_option( 'alpaistr_needs_term_setup' );
delete_option( 'alpaistr_default_status_id' );
delete_option( 'alpaistr_enable_test_logs' );
delete_option( 'alpaistr_agentic_settings' );
delete_option( 'alpaistr_agentic_workflow_pr_url' );
delete_transient( 'alpaistr_agentic_workflow_installed' );

// Delete term meta.
// Keep label color metadata because label terms are intentionally retained.
$wpdb->query( "DELETE FROM {$wpdb->termmeta} WHERE meta_key LIKE 'alpaca_%' AND meta_key != 'alpaca_label_color'" ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

// Delete user meta (watchlists).
$wpdb->query( "DELETE FROM {$wpdb->usermeta} WHERE meta_key = 'alpaca_watchlist'" ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

// Clear caches.
wp_cache_flush();
