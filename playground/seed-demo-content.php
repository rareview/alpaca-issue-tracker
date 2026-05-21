<?php

/**
 * Seed demo content for the Alpaca Issue Tracker WordPress Playground instance.
 *
 * @package AlpacaIssueTracker
 */

if ( ! function_exists( 'alpaistr_setup_default_statuses' ) ) {
	return;
}

alpaistr_setup_default_statuses();

$existing_issues = get_posts(
	[
		'post_type'      => 'alpaca_issue',
		'post_status'    => 'any',
		'posts_per_page' => 1,
		'fields'         => 'ids',
	]
);

if ( ! empty( $existing_issues ) ) {
	return;
}

$statuses     = [];
$status_terms = get_terms(
	[
		'taxonomy'   => 'alpaca_status',
		'hide_empty' => false,
	]
);

if ( is_wp_error( $status_terms ) ) {
	return;
}

foreach ( $status_terms as $term ) {
	$statuses[ $term->slug ] = $term;
}

$required_statuses = [ 'backlog', 'next', 'in-progress', 'done' ];

foreach ( $required_statuses as $required_status ) {
	if ( empty( $statuses[ $required_status ] ) ) {
		return;
	}
}

$admin_user = get_user_by( 'id', 1 );

if ( ! ( $admin_user instanceof WP_User ) ) {
	$current_user = wp_get_current_user();

	if ( $current_user instanceof WP_User && $current_user->exists() ) {
		$admin_user = $current_user;
	}
}

$assignee_term_id = 0;
$watching_term_id = 0;

if (
	$admin_user instanceof WP_User &&
	function_exists( 'alpaistr_get_or_create_user_taxonomy_term' )
) {
	$assignee_term_id = (int) alpaistr_get_or_create_user_taxonomy_term(
		$admin_user,
		'alpaca_assignee'
	);
	$watching_term_id = (int) alpaistr_get_or_create_user_taxonomy_term(
		$admin_user,
		'alpaca_watching'
	);
}

$label = get_term_by( 'slug', 'design', 'alpaca_label' );

if ( ! ( $label instanceof WP_Term ) ) {
	$created_label = wp_insert_term(
		'Design',
		'alpaca_label',
		[
			'slug' => 'design',
		]
	);

	if ( ! is_wp_error( $created_label ) && isset( $created_label['term_id'] ) ) {
		$label = get_term( (int) $created_label['term_id'], 'alpaca_label' );
		update_term_meta(
			(int) $created_label['term_id'],
			'alpaca_label_color',
			'#ff7a00'
		);
	}
} else {
	update_term_meta( (int) $label->term_id, 'alpaca_label_color', '#ff7a00' );
}

$label_term_id = $label instanceof WP_Term ? (int) $label->term_id : 0;
$today         = new DateTimeImmutable( 'now', wp_timezone() );
$issues        = [
	[
		'title'    => 'Triage homepage form validation',
		'content'  => 'Review the latest homepage form reports and confirm the next fix to ship.',
		'status'   => 'backlog',
		'deadline' => $today->modify( '-1 day' )->format( 'Y-m-d' ),
		'priority' => false,
		'label'    => 0,
		'comments' => [],
	],
	[
		'title'    => 'Review onboarding flow copy',
		'content'  => 'Check the latest onboarding screen copy and prepare the final edits.',
		'status'   => 'next',
		'deadline' => $today->modify( '+2 days' )->format( 'Y-m-d' ),
		'priority' => false,
		'label'    => $label_term_id,
		'comments' => [
			'Updated the welcome step to match the latest product positioning.',
		],
	],
	[
		'title'    => 'Fix checkout error on Safari',
		'content'  => 'Customers are hitting an intermittent checkout error in Safari and this needs attention today.',
		'status'   => 'in-progress',
		'deadline' => $today->format( 'Y-m-d' ),
		'priority' => true,
		'label'    => $label_term_id,
		'comments' => [
			'Confirmed the bug on Safari 18 and narrowed it down to the payment step.',
			'Patch is in progress and ready for another QA pass.',
		],
	],
	[
		'title'    => 'Ship daily summary settings',
		'content'  => 'The daily summary controls are now live and ready for follow-up polish.',
		'status'   => 'done',
		'deadline' => $today->modify( '+5 days' )->format( 'Y-m-d' ),
		'priority' => false,
		'label'    => 0,
		'comments' => [
			'Settings layout has been shipped and verified on the notifications screen.',
		],
	],
];

foreach ( $issues as $issue ) {
	$issue_id = wp_insert_post(
		[
			'post_type'    => 'alpaca_issue',
			'post_status'  => 'publish',
			'post_title'   => $issue['title'],
			'post_content' => $issue['content'],
			'post_author'  => $admin_user instanceof WP_User ? (int) $admin_user->ID : 1,
		],
		true
	);

	if ( is_wp_error( $issue_id ) || $issue_id <= 0 ) {
		continue;
	}

	wp_set_object_terms(
		$issue_id,
		[ (int) $statuses[ $issue['status'] ]->term_id ],
		'alpaca_status'
	);
	update_post_meta( $issue_id, 'alpaca_deadline', $issue['deadline'] );

	if ( ! empty( $issue['priority'] ) ) {
		update_post_meta( $issue_id, 'alpaca_high_priority', 1 );
	}

	if ( $issue['label'] > 0 ) {
		wp_set_object_terms(
			$issue_id,
			[ (int) $issue['label'] ],
			'alpaca_label',
			false
		);
	}

	if (
		$assignee_term_id > 0 &&
		in_array( $issue['status'], [ 'next', 'in-progress' ], true )
	) {
		wp_set_object_terms(
			$issue_id,
			[ $assignee_term_id ],
			'alpaca_assignee',
			true
		);
	}

	if (
		$watching_term_id > 0 &&
		in_array( $issue['status'], [ 'backlog', 'next', 'in-progress' ], true )
	) {
		wp_set_object_terms(
			$issue_id,
			[ $watching_term_id ],
			'alpaca_watching',
			true
		);
	}

	foreach ( $issue['comments'] as $index => $comment_content ) {
		$comment_timestamp = current_time( 'timestamp', true ) - ( ( count( $issue['comments'] ) - $index ) * HOUR_IN_SECONDS );

		wp_insert_comment(
			[
				'comment_post_ID'      => $issue_id,
				'comment_content'      => $comment_content,
				'comment_type'         => 'issuecomment',
				'comment_approved'     => 1,
				'user_id'              => $admin_user instanceof WP_User ? (int) $admin_user->ID : 1,
				'comment_author'       => $admin_user instanceof WP_User ? $admin_user->display_name : 'Admin',
				'comment_author_email' => $admin_user instanceof WP_User ? $admin_user->user_email : 'admin@example.com',
				'comment_date'         => wp_date( 'Y-m-d H:i:s', $comment_timestamp, wp_timezone() ),
				'comment_date_gmt'     => gmdate( 'Y-m-d H:i:s', $comment_timestamp ),
			]
		);
	}

	if ( function_exists( 'alpaistr_update_last_activity_from_issuecomments' ) ) {
		alpaistr_update_last_activity_from_issuecomments( $issue_id );
	} elseif ( function_exists( 'alpaistr_update_last_activity' ) ) {
		alpaistr_update_last_activity( $issue_id );
	}
}
