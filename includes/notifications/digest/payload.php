<?php
/**
 * Daily digest payload builders.
 *
 * @package Alpaca
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Fetch raw stored notification item rows for a user and time window.
 *
 * @param int    $user_id          User ID.
 * @param string $window_start_gmt Window start in GMT.
 * @param string $window_end_gmt   Window end in GMT.
 * @return array<int, array<string, mixed>> Raw item rows.
 */
function alpaca_get_notification_item_rows_for_user_window( $user_id, $window_start_gmt, $window_end_gmt ) {
	global $wpdb;

	$table_name = alpaca_get_notification_inbox_table_name();

	// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- Digest generation needs direct access to per-recipient notification items for the current time window.
	$rows = $wpdb->get_results(
		$wpdb->prepare(
			'SELECT id, user_id, comment_id, issue_id, event_family, created_gmt, snapshot_payload, read_at_gmt FROM %i WHERE user_id = %d AND created_gmt > %s AND created_gmt <= %s ORDER BY created_gmt DESC, id DESC',
			$table_name,
			absint( $user_id ),
			$window_start_gmt,
			$window_end_gmt
		),
		ARRAY_A
	);

	return is_array( $rows ) ? $rows : array();
}

/**
 * Build a fallback event snapshot from a stored item row.
 *
 * @param array<string, mixed> $row Stored item row.
 * @return array<string, mixed> Event snapshot.
 */
function alpaca_get_notification_item_event_from_row_fallback( $row ) {
	$comment_id = isset( $row['comment_id'] ) ? absint( $row['comment_id'] ) : 0;
	if ( $comment_id <= 0 ) {
		return array();
	}

	$comment = get_comment( $comment_id );
	if ( ! ( $comment instanceof WP_Comment ) || 'issuecomment' !== $comment->comment_type ) {
		return array();
	}

	$event = alpaca_get_notification_event_from_comment( $comment );

	return is_array( $event ) ? $event : array();
}

/**
 * Resolve event snapshots for a user's digest window.
 *
 * @param int    $user_id          User ID.
 * @param string $window_start_gmt Window start in GMT.
 * @param string $window_end_gmt   Window end in GMT.
 * @return array<int, array<string, mixed>> Event snapshots.
 */
function alpaca_get_notification_item_events_for_user_window( $user_id, $window_start_gmt, $window_end_gmt ) {
	$rows   = alpaca_get_notification_item_rows_for_user_window( $user_id, $window_start_gmt, $window_end_gmt );
	$events = array();

	foreach ( $rows as $row ) {
		$snapshot = alpaca_get_notification_item_snapshot_from_row( $row );
		if ( empty( $snapshot ) ) {
			$snapshot = alpaca_get_notification_item_event_from_row_fallback( $row );
		}

		if ( empty( $snapshot ) || empty( $snapshot['issue']['id'] ) ) {
			continue;
		}

		$snapshot['stored_item'] = array(
			'id'          => isset( $row['id'] ) ? absint( $row['id'] ) : 0,
			'created_gmt' => isset( $row['created_gmt'] ) ? (string) $row['created_gmt'] : '',
			'read_at_gmt' => isset( $row['read_at_gmt'] ) ? (string) $row['read_at_gmt'] : '',
		);
		$events[]                = $snapshot;
	}

	return $events;
}

/**
 * Return the digest activity priority order.
 *
 * @return string[] Event families in priority order.
 */
function alpaca_get_notification_digest_activity_priority_order() {
	return array(
		'human_comments',
		'status_changes',
		'issue_assignment_changes',
		'due_date_changes',
		'priority_changes',
		'checklist_completion_changes',
		'checklist_assignment_changes',
		'checklist_created_deleted',
		'checklist_promotions',
	);
}

/**
 * Return a sortable priority index for a digest event family.
 *
 * @param string $event_family Event family.
 * @return int Priority index.
 */
function alpaca_get_notification_digest_activity_priority( $event_family ) {
	$order = alpaca_get_notification_digest_activity_priority_order();
	$index = array_search( (string) $event_family, $order, true );

	return false === $index ? count( $order ) : (int) $index;
}

/**
 * Replace @mention slugs with display names in plain text.
 *
 * @param string                           $text     Raw text.
 * @param array<int, array<string, mixed>> $mentions Mention metadata.
 * @return string Plain text with display names.
 */
function alpaca_get_notification_digest_plain_mentions( $text, $mentions ) {
	$text     = is_string( $text ) ? $text : '';
	$mentions = is_array( $mentions ) ? $mentions : array();

	foreach ( $mentions as $mention ) {
		$slug         = isset( $mention['slug'] ) ? sanitize_user( (string) $mention['slug'], true ) : '';
		$display_name = isset( $mention['display_name'] ) ? trim( (string) $mention['display_name'] ) : '';
		if ( '' === $slug || '' === $display_name ) {
			continue;
		}

		$text = preg_replace( '/(^|[\s>\(\[\{])@' . preg_quote( $slug, '/' ) . '(?=$|[^a-zA-Z0-9._-])/', '$1@' . $display_name, $text );
	}

	return $text;
}

/**
 * Build a digest-safe plain-text excerpt for a comment.
 *
 * @param string                           $text     Raw comment content.
 * @param array<int, array<string, mixed>> $mentions Mention metadata.
 * @param int                              $limit    Character limit.
 * @return string Excerpt text.
 */
function alpaca_get_notification_digest_comment_excerpt( $text, $mentions = array(), $limit = 180 ) {
	$text = alpaca_get_notification_digest_plain_mentions( $text, $mentions );
	$text = wp_strip_all_tags( $text );
	$text = trim( preg_replace( '/\s+/', ' ', $text ) );

	if ( '' === $text ) {
		return '';
	}

	return wp_html_excerpt( $text, absint( $limit ), '&hellip;' );
}

/**
 * Return the current status term label for an issue.
 *
 * @param int $issue_id Issue ID.
 * @return string Status label.
 */
function alpaca_get_notification_digest_issue_status_label( $issue_id ) {
	$terms = get_the_terms( (int) $issue_id, 'alpaca_status' );
	if ( is_wp_error( $terms ) || empty( $terms ) ) {
		return '';
	}

	$term = reset( $terms );

	return $term instanceof WP_Term ? (string) $term->name : '';
}

/**
 * Return the current assignees for an issue.
 *
 * @param int $issue_id Issue ID.
 * @return array<int, array<string, mixed>> Assignee data.
 */
function alpaca_get_notification_digest_issue_assignees( $issue_id ) {
	$terms = get_the_terms( (int) $issue_id, 'alpaca_assignee' );
	if ( is_wp_error( $terms ) || empty( $terms ) ) {
		return array();
	}

	$assignees = array();
	foreach ( $terms as $term ) {
		if ( ! ( $term instanceof WP_Term ) ) {
			continue;
		}

		$user = get_user_by( 'slug', $term->slug );
		if ( $user instanceof WP_User ) {
			$assignees[] = array(
				'id'     => (int) $user->ID,
				'name'   => (string) $user->display_name,
				'slug'   => (string) $user->user_nicename,
				'avatar' => alpaca_avatar( $user->ID, 24 ),
			);
			continue;
		}

		$assignees[] = array(
			'id'     => 0,
			'name'   => (string) $term->name,
			'slug'   => (string) $term->slug,
			'avatar' => '',
		);
	}

	return array_values( $assignees );
}

/**
 * Return the current labels for an issue.
 *
 * @param int $issue_id Issue ID.
 * @return array<int, array<string, mixed>> Labels.
 */
function alpaca_get_notification_digest_issue_labels( $issue_id ) {
	$terms = get_the_terms( (int) $issue_id, 'alpaca_label' );
	if ( is_wp_error( $terms ) || empty( $terms ) ) {
		return array();
	}

	$labels = array();
	foreach ( $terms as $term ) {
		if ( $term instanceof WP_Term ) {
			$labels[] = array(
				'id'    => (int) $term->term_id,
				'name'  => (string) $term->name,
				'slug'  => (string) $term->slug,
				'color' => (string) get_term_meta( $term->term_id, 'alpaca_label_color', true ),
			);
		}
	}

	return array_values( $labels );
}

/**
 * Return normalized deadline metadata using the same states as board items.
 *
 * @param int $issue_id Issue ID.
 * @return array<string, string> Deadline metadata.
 */
function alpaca_get_notification_digest_issue_deadline_meta( $issue_id ) {
	$deadline = get_post_meta( (int) $issue_id, 'alpaca_deadline', true );
	if ( empty( $deadline ) ) {
		return array(
			'label' => '',
			'state' => '',
			'date'  => '',
		);
	}

	$timestamp = strtotime( (string) $deadline . ' 00:00:00' );
	if ( false === $timestamp ) {
		return array(
			'label' => '',
			'state' => '',
			'date'  => '',
		);
	}

	$timezone  = wp_timezone();
	$today     = new DateTimeImmutable( 'now', $timezone );
	$today     = $today->setTime( 0, 0, 0 );
	$due_date  = ( new DateTimeImmutable( '@' . $timestamp ) )->setTimezone( $timezone )->setTime( 0, 0, 0 );
	$diff_days = (int) $today->diff( $due_date )->format( '%r%a' );
	$label     = wp_date( 'M j', $timestamp );
	$state     = 'future';

	if ( $diff_days < 0 ) {
		$state = 'late';
	} elseif ( 0 === $diff_days ) {
		$state = 'today';
	} elseif ( $diff_days < 8 ) {
		$state = 'soon';
	}

	if ( 1 === $diff_days ) {
		$label = esc_html__( 'Tomorrow', 'alpaca' );
	} elseif ( 0 === $diff_days ) {
		$label = esc_html__( 'Today', 'alpaca' );
	} elseif ( -1 === $diff_days ) {
		$label = esc_html__( 'Yesterday', 'alpaca' );
	}

	return array(
		'label' => $label,
		'state' => $state,
		'date'  => wp_date( get_option( 'date_format' ), $timestamp ),
	);
}

/**
 * Return structured issue metadata for digest rendering.
 *
 * @param int $issue_id Issue ID.
 * @return array<string, mixed> Structured issue metadata.
 */
function alpaca_get_notification_digest_issue_meta( $issue_id ) {
	$issue_id      = absint( $issue_id );
	$status_label  = alpaca_get_notification_digest_issue_status_label( $issue_id );
	$assignees     = alpaca_get_notification_digest_issue_assignees( $issue_id );
	$labels        = alpaca_get_notification_digest_issue_labels( $issue_id );
	$label_names   = wp_list_pluck( $labels, 'name' );
	$deadline_meta = alpaca_get_notification_digest_issue_deadline_meta( $issue_id );

	$assignee_names = array();
	foreach ( $assignees as $assignee ) {
		$assignee_name = isset( $assignee['name'] ) ? trim( (string) $assignee['name'] ) : '';
		if ( '' !== $assignee_name ) {
			$assignee_names[] = $assignee_name;
		}
	}

	$assignee_names = array_values( array_unique( $assignee_names ) );

	return array(
		'status_label'     => $status_label,
		'assignees'        => $assignees,
		'assignee_names'   => $assignee_names,
		'labels'           => $labels,
		'label_names'      => $label_names,
		'deadline_label'   => isset( $deadline_meta['date'] ) ? (string) $deadline_meta['date'] : '',
		'deadline_text'    => isset( $deadline_meta['label'] ) ? (string) $deadline_meta['label'] : '',
		'deadline_state'   => isset( $deadline_meta['state'] ) ? (string) $deadline_meta['state'] : '',
		'is_high_priority' => alpaca_is_issue_high_priority( $issue_id ),
	);
}

/**
 * Return a digest-ready event entry.
 *
 * @param array<string, mixed> $event Event snapshot.
 * @return array<string, mixed> Digest entry.
 */
function alpaca_get_notification_digest_event_entry( $event ) {
	$comment_raw  = isset( $event['comment']['raw'] ) ? (string) $event['comment']['raw'] : '';
	$mentions     = isset( $event['comment']['mentions'] ) && is_array( $event['comment']['mentions'] ) ? $event['comment']['mentions'] : array();
	$event_family = isset( $event['event_family'] ) ? (string) $event['event_family'] : '';
	$event_label  = isset( $event['event_label'] ) ? (string) $event['event_label'] : '';
	$actor_name   = isset( $event['actor']['display_name'] ) ? trim( (string) $event['actor']['display_name'] ) : '';
	$excerpt      = 'human_comments' === $event_family ? alpaca_get_notification_digest_comment_excerpt( $comment_raw, $mentions ) : '';
	$timestamp    = isset( $event['stored_item']['created_gmt'] ) ? (string) $event['stored_item']['created_gmt'] : '';
	$display_time = '';

	if ( '' !== $timestamp ) {
		$display_time = wp_date( get_option( 'time_format' ), strtotime( $timestamp ) );
	}

	return array(
		'event_family' => $event_family,
		'event_label'  => $event_label,
		'actor_name'   => $actor_name,
		'excerpt'      => $excerpt,
		'timestamp'    => $timestamp,
		'display_time' => $display_time,
		'priority'     => alpaca_get_notification_digest_activity_priority( $event_family ),
	);
}

/**
 * Determine whether a stored event belongs in the main issue-activity section.
 *
 * @param array<string, mixed> $event Event snapshot.
 * @return bool True when the event belongs in the issue-activity section.
 */
function alpaca_is_notification_digest_issue_activity_event( $event ) {
	$subjects = isset( $event['recipient_subjects'] ) && is_array( $event['recipient_subjects'] ) ? $event['recipient_subjects'] : array();
	$subjects = array_values( array_unique( array_filter( array_map( 'sanitize_key', $subjects ) ) ) );
	$allowed  = array( 'created', 'assigned', 'starred', 'labeled' );

	return ! empty( array_intersect( $subjects, $allowed ) );
}

/**
 * Determine whether a stored event belongs in the new-items section.
 *
 * @param array<string, mixed> $event Event snapshot.
 * @return bool True when the event belongs in the new-items section.
 */
function alpaca_is_notification_digest_new_item_event( $event ) {
	$subjects = isset( $event['recipient_subjects'] ) && is_array( $event['recipient_subjects'] ) ? $event['recipient_subjects'] : array();
	$subjects = array_values( array_unique( array_filter( array_map( 'sanitize_key', $subjects ) ) ) );

	return in_array( 'all_new_tasks', $subjects, true ) && alpaca_is_notification_new_task_event( $event );
}

/**
 * Group digest activity rows by issue.
 *
 * @param array<int, array<string, mixed>> $events Event snapshots.
 * @return array<int, array<string, mixed>> Grouped issue activity.
 */
function alpaca_get_notification_digest_issue_activity_groups( $events ) {
	$groups = array();

	foreach ( $events as $event ) {
		if ( ! alpaca_is_notification_digest_issue_activity_event( $event ) ) {
			continue;
		}

		$issue_id = isset( $event['issue']['id'] ) ? absint( $event['issue']['id'] ) : 0;
		if ( $issue_id <= 0 ) {
			continue;
		}

		if ( ! isset( $groups[ $issue_id ] ) ) {
			$groups[ $issue_id ] = array(
				'issue'   => array(
					'id'    => $issue_id,
					'title' => isset( $event['issue']['title'] ) ? (string) $event['issue']['title'] : '',
					'slug'  => isset( $event['issue']['slug'] ) ? (string) $event['issue']['slug'] : '',
					'url'   => isset( $event['issue']['url'] ) ? (string) $event['issue']['url'] : '',
					'meta'  => alpaca_get_notification_digest_issue_meta( $issue_id ),
				),
				'entries' => array(),
				'total'   => 0,
				'latest'  => '',
			);
		}

		$entry                            = alpaca_get_notification_digest_event_entry( $event );
		$groups[ $issue_id ]['entries'][] = $entry;
		++$groups[ $issue_id ]['total'];

		if ( '' === $groups[ $issue_id ]['latest'] || $entry['timestamp'] > $groups[ $issue_id ]['latest'] ) {
			$groups[ $issue_id ]['latest'] = $entry['timestamp'];
		}
	}

	foreach ( $groups as $issue_id => $group ) {
		usort(
			$group['entries'],
			static function ( $left, $right ) {
				$left_priority  = isset( $left['priority'] ) ? (int) $left['priority'] : 999;
				$right_priority = isset( $right['priority'] ) ? (int) $right['priority'] : 999;
				if ( $left_priority !== $right_priority ) {
					return $left_priority <=> $right_priority;
				}

				$left_time  = isset( $left['timestamp'] ) ? (string) $left['timestamp'] : '';
				$right_time = isset( $right['timestamp'] ) ? (string) $right['timestamp'] : '';

				return strcmp( $right_time, $left_time );
			}
		);

		$group['entries']    = array_slice( $group['entries'], 0, 3 );
		$group['more']       = max( 0, (int) $group['total'] - count( $group['entries'] ) );
		$groups[ $issue_id ] = $group;
	}

	usort(
		$groups,
		static function ( $left, $right ) {
			$left_latest  = isset( $left['latest'] ) ? (string) $left['latest'] : '';
			$right_latest = isset( $right['latest'] ) ? (string) $right['latest'] : '';

			return strcmp( $right_latest, $left_latest );
		}
	);

	return array_values( $groups );
}

/**
 * Return the top-level done status term ID.
 *
 * @return int Done status term ID.
 */
function alpaca_get_notification_digest_done_status_id() {
	$statuses = alpaca_get_statuses( 'DESC' );
	if ( empty( $statuses ) ) {
		return 0;
	}

	$term = reset( $statuses );

	return $term instanceof WP_Term ? (int) $term->term_id : 0;
}

/**
 * Resolve issue IDs relevant to the digest due-items section.
 *
 * @param int                  $user_id      User ID.
 * @param array<string, mixed> $preferences Notification preferences.
 * @return int[] Relevant issue IDs.
 */
function alpaca_get_notification_digest_due_issue_ids( $user_id, $preferences ) {
	$user_id      = absint( $user_id );
	$current_user = get_user_by( 'id', $user_id );

	if ( $user_id <= 0 || ! ( $current_user instanceof WP_User ) ) {
		return array();
	}

	/**
	 * Allow site owners (or plugins) to disable preference-based filtering
	 * for the "Issues Falling Due" section by hooking
	 * `alpaca_filter_deadlines_by_user_preferences`. When the filter
	 * returns false, the digest will consider all issues (date filtering
	 * still applies when building the deadline rows).
	 *
	 * @param bool   $filter_by_preferences Whether to filter by user preferences (default true).
	 * @param int    $user_id              User ID being evaluated.
	 * @param array  $preferences          Notification preferences for the user.
	 */
	$filter_by_preferences = (bool) apply_filters(
		'alpaca_filter_deadlines_by_user_preferences',
		true,
		$user_id,
		$preferences
	);

	// If filtering by preferences is disabled, return all issue IDs so the
	// deadline query can decide which ones fall due for the window.
	if ( ! $filter_by_preferences ) {
		// phpcs:disable WordPress.DB.SlowDBQuery.slow_db_query_get_posts -- Owner-controlled; expected for site-wide view.
		$all_issue_ids = get_posts(
			array(
				'post_type'              => 'alpaca_issue',
				'post_status'            => 'any',
				'posts_per_page'         => -1,
				'fields'                 => 'ids',
				'no_found_rows'          => true,
				'update_post_meta_cache' => false,
				'update_post_term_cache' => false,
			)
		);
		// phpcs:enable WordPress.DB.SlowDBQuery.slow_db_query_get_posts

		return array_values( array_unique( array_filter( array_map( 'absint', $all_issue_ids ) ) ) );
	}

	$issue_ids = array();

	if ( ! empty( $preferences['subjects']['created'] ) ) {
		$created_issue_ids = get_posts(
			array(
				'post_type'              => 'alpaca_issue',
				'post_status'            => 'any',
				'posts_per_page'         => -1,
				'fields'                 => 'ids',
				'author'                 => $user_id,
				'no_found_rows'          => true,
				'update_post_meta_cache' => false,
				'update_post_term_cache' => false,
			)
		);
		$issue_ids         = array_merge( $issue_ids, alpaca_to_int_ids( $created_issue_ids ) );
	}

	if ( ! empty( $preferences['subjects']['assigned'] ) ) {
		// phpcs:disable WordPress.DB.SlowDBQuery.slow_db_query_tax_query -- Digest due items must include issues currently assigned to the user.
		$assigned_issue_ids = get_posts(
			array(
				'post_type'              => 'alpaca_issue',
				'post_status'            => 'any',
				'posts_per_page'         => -1,
				'fields'                 => 'ids',
				'no_found_rows'          => true,
				'update_post_meta_cache' => false,
				'update_post_term_cache' => false,
				'tax_query'              => array(
					array(
						'taxonomy' => 'alpaca_assignee',
						'field'    => 'slug',
						'terms'    => $current_user->user_nicename,
					),
				),
			)
		);
		// phpcs:enable WordPress.DB.SlowDBQuery.slow_db_query_tax_query
		$issue_ids = array_merge( $issue_ids, alpaca_to_int_ids( $assigned_issue_ids ) );
	}

	if ( ! empty( $preferences['subjects']['starred'] ) ) {
		$issue_ids = array_merge( $issue_ids, alpaca_get_watched_issue_ids_for_user( $user_id ) );
	}

	return array_values( array_unique( array_filter( array_map( 'absint', $issue_ids ) ) ) );
}

/**
 * Build the deadline-watch section for a digest window.
 *
 * @param int                  $user_id        User ID.
 * @param array<string, mixed> $preferences    Notification preferences.
 * @param string               $window_end_gmt Window end in GMT.
 * @return array<int, array<string, mixed>> Deadline watch rows.
 */
function alpaca_get_notification_deadline_watch_items( $user_id, $preferences, $window_end_gmt ) {
	$done_status_id = alpaca_get_notification_digest_done_status_id();
	$timezone       = wp_timezone();
	$window_end     = new DateTimeImmutable( $window_end_gmt, new DateTimeZone( 'UTC' ) );
	$window_end     = $window_end->setTimezone( $timezone );
	$today_local    = $window_end->setTime( 0, 0, 0 );
	$today_string   = $today_local->format( 'Y-m-d' );
	$future_string  = $today_local->modify( '+2 days' )->format( 'Y-m-d' );
	$issue_ids      = alpaca_get_notification_digest_due_issue_ids( $user_id, $preferences );

	if ( empty( $issue_ids ) ) {
		return array();
	}

	$args = array(
		'post_type'      => 'alpaca_issue',
		'posts_per_page' => -1,
		'post__in'       => $issue_ids,
		// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query -- Deadline-watch rows must filter issues by due date across the full board.
		'meta_query'     => array(
			'relation' => 'OR',
			array(
				'key'     => 'alpaca_deadline',
				'value'   => $today_string,
				'compare' => '<',
				'type'    => 'DATE',
			),
			array(
				'key'     => 'alpaca_deadline',
				'value'   => array( $today_string, $future_string ),
				'compare' => 'BETWEEN',
				'type'    => 'DATE',
			),
		),
		'orderby'        => 'meta_value',
		'order'          => 'ASC',
	);

	if ( $done_status_id > 0 ) {
		// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query -- Deadline-watch rows exclude completed issues by status taxonomy.
		$args['tax_query'] = array(
			array(
				'taxonomy' => 'alpaca_status',
				'field'    => 'term_id',
				'terms'    => $done_status_id,
				'operator' => 'NOT IN',
			),
		);
	}

	$posts = get_posts( $args );
	$items = array();

	foreach ( $posts as $post ) {
		if ( ! ( $post instanceof WP_Post ) ) {
			continue;
		}

		$deadline = get_post_meta( $post->ID, 'alpaca_deadline', true );
		if ( empty( $deadline ) ) {
			continue;
		}

		$deadline_timestamp = strtotime( (string) $deadline . ' 00:00:00' );
		if ( false === $deadline_timestamp ) {
			continue;
		}

		$deadline_local = ( new DateTimeImmutable( '@' . $deadline_timestamp ) )->setTimezone( $timezone );
		$diff_days      = (int) $today_local->diff( $deadline_local )->format( '%r%a' );
		$state          = 'soon';
		$label          = esc_html__( 'Due soon', 'alpaca' );

		if ( $diff_days < 0 ) {
			$state = 'late';
			$label = esc_html__( 'Overdue', 'alpaca' );
		} elseif ( 0 === $diff_days ) {
			$state = 'today';
			$label = esc_html__( 'Due today', 'alpaca' );
		}

		$meta = alpaca_get_notification_digest_issue_meta( $post->ID );

		$items[] = array(
			'id'             => (int) $post->ID,
			'title'          => (string) $post->post_title,
			'slug'           => (string) $post->post_name,
			'url'            => alpaca_get_notification_issue_url( $post ),
			'deadline'       => wp_date( get_option( 'date_format' ), $deadline_timestamp ),
			'deadline_state' => $state,
			'headline'       => $label,
			'meta'           => array_merge(
				$meta,
				array(
					'deadline_state' => $state,
				)
			),
		);
	}

	return $items;
}

/**
 * Build the simplified new-items section for a digest payload.
 *
 * @param array<int, array<string, mixed>> $events              Event snapshots.
 * @param int[]                            $issue_ids_in_groups Issue IDs already shown in main activity.
 * @return array<int, array<string, mixed>> New-item rows.
 */
function alpaca_get_notification_digest_new_items( $events, $issue_ids_in_groups ) {
	$issue_ids_in_groups = array_values( array_unique( array_filter( array_map( 'absint', $issue_ids_in_groups ) ) ) );
	$new_items           = array();

	foreach ( $events as $event ) {
		if ( ! alpaca_is_notification_digest_new_item_event( $event ) ) {
			continue;
		}

		$issue_id = isset( $event['issue']['id'] ) ? absint( $event['issue']['id'] ) : 0;
		if ( $issue_id <= 0 || in_array( $issue_id, $issue_ids_in_groups, true ) || isset( $new_items[ $issue_id ] ) ) {
			continue;
		}

		$new_items[ $issue_id ] = array(
			'id'       => $issue_id,
			'title'    => isset( $event['issue']['title'] ) ? (string) $event['issue']['title'] : '',
			'slug'     => isset( $event['issue']['slug'] ) ? (string) $event['issue']['slug'] : '',
			'url'      => isset( $event['issue']['url'] ) ? (string) $event['issue']['url'] : '',
			'headline' => isset( $event['event_label'] ) ? (string) $event['event_label'] : '',
			'meta'     => alpaca_get_notification_digest_issue_meta( $issue_id ),
		);
	}

	return array_values( $new_items );
}

/**
 * Build the daily digest day label for a window end timestamp.
 *
 * @param string $window_end_gmt Window end in GMT.
 * @return string Digest day label.
 */
function alpaca_get_notification_daily_digest_day_label( $window_end_gmt ) {
	$window_end = new DateTimeImmutable( $window_end_gmt, new DateTimeZone( 'UTC' ) );

	return $window_end->setTimezone( wp_timezone() )->format( 'l' );
}

/**
 * Build the structured daily digest payload for a user.
 *
 * @param int                  $user_id          User ID.
 * @param array<string, mixed> $preferences      Notification preferences.
 * @param string               $window_start_gmt Window start in GMT.
 * @param string               $window_end_gmt   Window end in GMT.
 * @return array<string, mixed> Digest payload.
 */
function alpaca_build_notification_daily_digest_payload( $user_id, $preferences, $window_start_gmt, $window_end_gmt ) {
	$events            = alpaca_get_notification_item_events_for_user_window( $user_id, $window_start_gmt, $window_end_gmt );
	$issue_activity    = alpaca_get_notification_digest_issue_activity_groups( $events );
	$issue_ids         = array();
	$daily_preferences = isset( $preferences['digests']['daily'] ) && is_array( $preferences['digests']['daily'] ) ? $preferences['digests']['daily'] : alpaca_get_notification_daily_digest_defaults();

	foreach ( $issue_activity as $group ) {
		if ( ! empty( $group['issue']['id'] ) ) {
			$issue_ids[] = (int) $group['issue']['id'];
		}
	}

	$payload = array(
		'user_id'          => absint( $user_id ),
		'window_start_gmt' => $window_start_gmt,
		'window_end_gmt'   => $window_end_gmt,
		'digest_day'       => alpaca_get_notification_daily_digest_day_label( $window_end_gmt ),
		'deadline_watch'   => alpaca_get_notification_deadline_watch_items( $user_id, $preferences, $window_end_gmt ),
		'issue_activity'   => $issue_activity,
		'new_items'        => array(),
		'footer'           => array(),
		'counts'           => array(
			'issues'    => count( $issue_activity ),
			'activity'  => count( $events ),
			'new_items' => 0,
			'deadlines' => 0,
		),
		'preferences'      => array(
			'days'      => isset( $daily_preferences['days'] ) && is_array( $daily_preferences['days'] ) ? $daily_preferences['days'] : array(),
			'send_time' => isset( $daily_preferences['send_time'] ) ? (string) $daily_preferences['send_time'] : '17:00',
		),
	);

	$payload['counts']['deadlines'] = count( $payload['deadline_watch'] );

	if ( ! empty( $preferences['subjects']['all_new_tasks'] ) ) {
		$payload['new_items']           = alpaca_get_notification_digest_new_items( $events, $issue_ids );
		$payload['counts']['new_items'] = count( $payload['new_items'] );
	}

	/**
	 * Filter the structured daily digest payload before rendering.
	 *
	 * @param array<string, mixed> $payload          Structured digest payload.
	 * @param int                  $user_id          User ID.
	 * @param array<string, mixed> $preferences      Notification preferences.
	 * @param string               $window_start_gmt Window start in GMT.
	 * @param string               $window_end_gmt   Window end in GMT.
	 */
	return apply_filters( 'alpaca_daily_digest_payload', $payload, $user_id, $preferences, $window_start_gmt, $window_end_gmt );
}
