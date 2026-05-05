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
 * Prepare dashboard widget issue list data.
 *
 * @param WP_Post[] $posts Issue post objects.
 * @return array<int, array<string, mixed>>
 */
function alpaca_prepare_dashboard_widget_issue_list( $posts ) {
	$prepared_posts = array();

	foreach ( $posts as $post ) {
		$prepared_post = alpaca_prepare_issue_data( $post );
		if ( ! empty( $prepared_post ) ) {
			$prepared_posts[] = $prepared_post;
		}
	}

	return $prepared_posts;
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

	return alpaca_prepare_dashboard_widget_issue_list( $posts );
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
			'post_parent'    => 0, // Exclude checklist items.
			'date_query'     => array(
				array(
					'after' => '1 week ago',
				),
			),
		)
	);

	return alpaca_prepare_dashboard_widget_issue_list( $posts );
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

	return alpaca_prepare_dashboard_widget_issue_list( $posts );
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

	$watchlist = alpaca_get_watched_issue_ids_for_user( $user_id );

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

	return alpaca_prepare_dashboard_widget_issue_list( $posts );
}
/**
 * Prepare issue data for the widget.
 *
 * @param WP_Post $post Post object.
 * @return array
 */
function alpaca_prepare_issue_data( $post ) {
	if ( ! ( $post instanceof WP_Post ) ) {
		return array();
	}

	$post_parent_id = (int) $post->post_parent;
	if ( $post_parent_id > 0 && 'trash' === get_post_status( $post_parent_id ) ) {
		return array();
	}

	$deadline         = get_post_meta( $post->ID, 'alpaca_deadline', true );
	$assignees        = get_the_terms( $post->ID, 'alpaca_assignee' );
	$status           = get_the_terms( $post->ID, 'alpaca_status' );
	$post_parent      = $post_parent_id > 0 ? get_post( $post_parent_id ) : null;
	$post_parent_slug = $post_parent ? $post_parent->post_name : '';

	return array(
		'id'               => $post->ID,
		'title'            => $post->post_title,
		'slug'             => $post->post_name,
		'post_parent'      => $post_parent_id,
		'post_parent_slug' => $post_parent_slug,
		'postDateGmt'      => $post->post_date_gmt,
		'postDate'         => $post->post_date,
		'deadline'         => $deadline,
		'assignees'        => $assignees,
		'status'           => $status,
		'high_priority'    => get_post_meta(
			$post->ID,
			'alpaca_high_priority',
			true
		),
	);
}
