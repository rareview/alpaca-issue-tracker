<?php
/**
 * Dashboard widget data for Alpaca.
 *
 * @package Alpaca
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Get data for the dashboard widget.
 *
 * @return array
 */
function alpaca_get_dashboard_widget_data() {

	$data = array(
		'assignedToMe' => alpaca_get_assigned_to_me_issues(),
		'newlyCreated' => alpaca_get_newly_created_issues(),
		'overdue'      => alpaca_get_overdue_issues(),
		'watchlist'    => alpaca_get_watchlist_issues(),
	);

	return $data;
}
/**
 * Get issues assigned to the current user.
 *
 * @return array
 */
function alpaca_get_assigned_to_me_issues() {
	$current_user = wp_get_current_user();
	if ( ! $current_user || ! $current_user->ID ) {
		return array();
	}

	// phpcs:disable WordPress.DB.SlowDBQuery
	$posts = get_posts(
		array(
			'post_type'      => 'alpaca_issue',
			'posts_per_page' => -1,
			'tax_query'      => array(
				array(
					'taxonomy' => 'alpaca_assignee',
					'field'    => 'slug',
					'terms'    => $current_user->user_nicename,
				),
			),
		)
	);
	// phpcs:enable WordPress.DB.SlowDBQuery

	$prepared_posts = array();
	foreach ( $posts as $post ) {
		$prepared_posts[] = alpaca_prepare_issue_data( $post );
	}

	return $prepared_posts;
}

/**
 * Get newly created issues.
 *
 * @return array
 */
function alpaca_get_newly_created_issues() {
	$posts = get_posts(
		array(
			'post_type'      => 'alpaca_issue',
			'posts_per_page' => 5,
			'date_query'     => array(
				array(
					'after' => '1 week ago',
				),
			),
		)
	);

	return array_map( 'alpaca_prepare_issue_data', $posts );
}

/**
 * Get overdue issues.
 *
 * @return array
 */
function alpaca_get_overdue_issues() {

	$done_status    = alpaca_get_statuses( 'DESC' );
	$done_status_id = ! empty( $done_status ) ? $done_status[0]->term_id : 0;

	// phpcs:disable WordPress.DB.SlowDBQuery
	$posts = get_posts(
		array(
			'post_type'      => 'alpaca_issue',
			'posts_per_page' => -1,
			'meta_query'     => array(
				array(
					'key'     => 'alpaca_deadline',
					'value'   => current_time( 'Y-m-d' ),
					'compare' => '<',
					'type'    => 'DATE',
				),
			),
			'tax_query'      => array(
				array(
					'taxonomy' => 'alpaca_status',
					'field'    => 'term_id',
					'terms'    => $done_status_id,
					'operator' => 'NOT IN',
				),
			),
		)
	);
	// phpcs:enable WordPress.DB.SlowDBQuery

	return array_map( 'alpaca_prepare_issue_data', $posts );
}

/**
 * Get issues in the current user's watchlist.
 *
 * @return array
 */
function alpaca_get_watchlist_issues() {

	$user_id = get_current_user_id();
	if ( ! $user_id ) {
		return array();
	}

	$watchlist = get_user_meta( $user_id, 'alpaca_watchlist', true );
	if ( ! is_array( $watchlist ) || empty( $watchlist ) ) {
		return array();
	}

	$watchlist = array_map( 'intval', $watchlist );
	$watchlist = array_filter(
		$watchlist,
		static function ( $post_id ) {

			return $post_id > 0;
		}
	);
	$watchlist = array_values( array_unique( $watchlist ) );

	if ( empty( $watchlist ) ) {
		return array();
	}

	$posts = get_posts(
		array(
			'post_type'      => 'alpaca_issue',
			'post__in'       => $watchlist,
			'orderby'        => 'post__in',
			'posts_per_page' => -1,
		)
	);

	return array_map( 'alpaca_prepare_issue_data', $posts );
}
/**
 * Prepare issue data for the widget.
 *
 * @param WP_Post $post Post object.
 * @return array
 */
function alpaca_prepare_issue_data( $post ) {

	$deadline  = get_post_meta( $post->ID, 'alpaca_deadline', true );
	$assignees = get_the_terms( $post->ID, 'alpaca_assignee' );
	$status    = get_the_terms( $post->ID, 'alpaca_status' );

	return array(
		'id'            => $post->ID,
		'title'         => $post->post_title,
		'slug'          => $post->post_name,
		'postDate'      => $post->post_date,
		'deadline'      => $deadline,
		'assignees'     => $assignees,
		'status'        => $status,
		'high_priority' => get_post_meta(
			$post->ID,
			'alpaca_high_priority',
			true
		),
	);
}
