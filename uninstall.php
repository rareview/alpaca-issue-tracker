<?php
/**
 * Uninstall handler - cleans up plugin data.
 *
 * @package Alpaca
 */

// Exit if accessed directly or not during uninstall.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

/**
 * Remove plugin data on uninstall.
 *
 * WARNING: This deletes ALL plugin data.
 * Uncomment sections as needed based on user preferences.
 */

// Delete options.
delete_option( 'alpaca_needs_term_setup' );
delete_option( 'alpaca_default_status_id' );
delete_option( 'alpaca_enable_test_logs' );

// Delete webhook secrets.
global $wpdb;
$wpdb->query( "DELETE FROM {$wpdb->options} WHERE option_name LIKE 'alpaca_webhook_secret_%'" ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

// Delete term meta.
$wpdb->query( "DELETE FROM {$wpdb->termmeta} WHERE meta_key LIKE 'alpaca_%'" ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

// Delete user meta (watchlists).
$wpdb->query( "DELETE FROM {$wpdb->usermeta} WHERE meta_key = 'alpaca_watchlist'" ); // phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching

// Optional: Delete all issues and their meta/comments.
// Uncomment if you want to delete all data on uninstall.

/*
// phpcs:disable Squiz.PHP.CommentedOutCode.Found
$issues = get_posts(
	array(
		'post_type'      => 'issue',
		'posts_per_page' => -1,
		'post_status'    => 'any',
		'fields'         => 'ids',
	)
);

foreach ( $issues as $issue_id ) {
	// Delete comments.
	$comments = get_comments( array( 'post_id' => $issue_id ) );
	foreach ( $comments as $comment ) {
		wp_delete_comment( $comment->comment_ID, true );
	}

	// Delete post.
	wp_delete_post( $issue_id, true );
}
*/
// phpcs:enable Squiz.PHP.CommentedOutCode.Found

// Optional: Delete custom taxonomies and their terms.
// Uncomment if you want to delete taxonomies on uninstall.

/*
// phpcs:disable Squiz.PHP.CommentedOutCode.Found
$taxonomies = array( 'status', 'assignee', 'browser', 'phptemplate', 'type' );
foreach ( $taxonomies as $taxonomy ) {
	$terms = get_terms(
		array(
			'taxonomy'   => $taxonomy,
			'hide_empty' => false,
			'fields'     => 'ids',
		)
	);
	if ( ! is_wp_error( $terms ) ) {
		foreach ( $terms as $term_id ) {
			wp_delete_term( $term_id, $taxonomy );
		}
	}
}
*/
// phpcs:enable Squiz.PHP.CommentedOutCode.Found

// Clear caches.
wp_cache_flush();

// Note: Log files in wp-content/uploads/alpaca-logs/ are left in place.
// Admin can manually delete if needed.
