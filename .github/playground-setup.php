<?php
/**
 * Seed demo content for WordPress Playground.
 *
 * @package Alpaca
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Create a starter issue for Playground demos when the board is empty.
 *
 * @return void
 */
function alpaca_seed_playground_issue() {
	$existing_issues = get_posts(
		array(
			'post_type'      => 'alpaca_issue',
			'post_status'    => 'any',
			'posts_per_page' => 1,
			'fields'         => 'ids',
		)
	);

	if ( ! empty( $existing_issues ) ) {
		return;
	}

	$status = get_term_by( 'slug', 'next', 'alpaca_status' );

	$issue_id = wp_insert_post(
		array(
			'post_type'    => 'alpaca_issue',
			'post_status'  => 'publish',
			'post_title'   => __( 'Welcome to Alpaca', 'alpaca' ),
			'post_content' => __( 'This sample issue was created by the WordPress Playground blueprint so testers can inspect the board immediately.', 'alpaca' ),
			'post_author'  => 1,
		),
		true
	);

	if ( is_wp_error( $issue_id ) || ! ( $status instanceof WP_Term ) ) {
		return;
	}

	wp_set_object_terms( $issue_id, array( (int) $status->term_id ), 'alpaca_status' );
	update_post_meta( $issue_id, 'alpaca_high_priority', 1 );
	update_post_meta( $issue_id, 'alpaca_lastActivity', current_time( 'mysql' ) );
}

alpaca_seed_playground_issue();
