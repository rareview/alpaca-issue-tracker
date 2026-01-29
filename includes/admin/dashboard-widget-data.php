<?php
/**
 * Dashboard widget data for Alpaca.
 *
 * @package Alpaca
 */

/**
 * Get data for the dashboard widget.
 *
 * @return array
 */
function alpaca_get_dashboard_widget_data() {
	$data = array(
		'assignedToMe' => _get_assigned_to_me_issues(),
		'newlyCreated' => _get_newly_created_issues(),
		'overdue'      => _get_overdue_issues(),
	);

	return $data;
}

/**
 * Get issues assigned to the current user.
 *
 * @return array
 */
function _get_assigned_to_me_issues() {
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
		$prepared_posts[] = _alpaca_prepare_issue_data( $post );
	}

	return $prepared_posts;
}

/**
 * Get newly created issues.
 *
 * @return array
 */
function _get_newly_created_issues() {
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

	return array_map( '_alpaca_prepare_issue_data', $posts );
}

/**
 * Get overdue issues.
 *
 * @return array
 */
function _get_overdue_issues() {
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

	return array_map( '_alpaca_prepare_issue_data', $posts );
}

/**
 * Prepare issue data for the widget.
 *
 * @param WP_Post $post Post object.
 * @return array
 */
function _alpaca_prepare_issue_data( $post ) {

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
