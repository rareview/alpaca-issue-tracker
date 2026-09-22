<?php
/**
 * Notification recipient helpers for Alpaca Issue Tracker issue activity emails.
 *
 * @package AlpacaIssueTracker
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Get user IDs directly affected by an assignment change event.
 *
 * @param array<string, mixed> $event Notification event.
 * @return int[] Affected user IDs.
 */
function alpaistr_get_notification_assignment_target_ids( $event ) {
	$context = isset( $event['comment']['context'] ) && is_array( $event['comment']['context'] ) ? $event['comment']['context'] : [];
	$ids     = isset( $context['affected_user_ids'] ) && is_array( $context['affected_user_ids'] ) ? $context['affected_user_ids'] : [];

	return array_values( array_unique( array_filter( array_map( 'absint', $ids ) ) ) );
}

/**
 * Get user IDs subscribed to one or more issue labels.
 *
 * @param array<string, mixed> $event Notification event.
 * @return int[] Matching user IDs.
 */
function alpaistr_get_notification_label_subscriber_ids( $event ) {
	$issue_label_ids = isset( $event['issue']['label_ids'] ) && is_array( $event['issue']['label_ids'] ) ? array_values( array_unique( array_filter( array_map( 'absint', $event['issue']['label_ids'] ) ) ) ) : [];
	if ( empty( $issue_label_ids ) ) {
		return [];
	}

	$user_ids = alpaistr_get_notification_preference_user_ids();
	if ( empty( $user_ids ) ) {
		return [];
	}

	$matched_user_ids = [];
	foreach ( $user_ids as $user_id ) {
		$preferences = alpaistr_get_notification_preferences_for_user( $user_id );
		if ( ! alpaistr_notification_preferences_have_enabled_delivery_targets( $preferences ) || empty( $preferences['subjects']['labeled'] ) ) {
			continue;
		}

		$user_label_ids = isset( $preferences['label_ids'] ) && is_array( $preferences['label_ids'] ) ? array_values( array_unique( array_filter( array_map( 'absint', $preferences['label_ids'] ) ) ) ) : [];
		if ( empty( $user_label_ids ) ) {
			continue;
		}

		if ( array_intersect( $user_label_ids, $issue_label_ids ) ) {
			$matched_user_ids[] = (int) $user_id;
		}
	}

	return array_values( array_unique( array_filter( $matched_user_ids ) ) );
}

/**
 * Get user IDs subscribed to activity on high priority issues.
 *
 * @param array<string, mixed> $event Notification event.
 * @return int[] Matching user IDs.
 */
function alpaistr_get_notification_high_priority_subscriber_ids( $event ) {
	$is_high_priority = ! empty( $event['issue']['is_high_priority'] );
	$context          = isset( $event['comment']['context'] ) && is_array( $event['comment']['context'] ) ? $event['comment']['context'] : [];
	$action           = isset( $context['action'] ) ? sanitize_key( (string) $context['action'] ) : '';

	if ( ! $is_high_priority && ! ( 'priority_changes' === (string) $event['event_family'] && 'disable' === $action ) ) {
		return [];
	}

	$user_ids = alpaistr_get_notification_preference_user_ids();
	if ( empty( $user_ids ) ) {
		return [];
	}

	$matched_user_ids = [];
	foreach ( $user_ids as $user_id ) {
		$preferences = alpaistr_get_notification_preferences_for_user( $user_id );
		if ( ! alpaistr_notification_preferences_have_enabled_delivery_targets( $preferences ) || empty( $preferences['subjects']['high_priority'] ) ) {
			continue;
		}

		$matched_user_ids[] = (int) $user_id;
	}

	return array_values( array_unique( array_filter( $matched_user_ids ) ) );
}

/**
 * Get user IDs subscribed to all new task notifications.
 *
 * @param array<string, mixed> $event Notification event.
 * @return int[] Matching user IDs.
 */
function alpaistr_get_notification_all_new_task_subscriber_ids( $event ) {
	if ( ! alpaistr_is_notification_new_task_event( $event ) ) {
		return [];
	}

	$user_ids = alpaistr_get_notification_preference_user_ids();
	if ( empty( $user_ids ) ) {
		return [];
	}

	$matched_user_ids = [];
	foreach ( $user_ids as $user_id ) {
		$preferences = alpaistr_get_notification_preferences_for_user( $user_id );
		if ( ! alpaistr_notification_preferences_have_enabled_delivery_targets( $preferences ) || empty( $preferences['subjects']['all_new_tasks'] ) ) {
			continue;
		}

		$matched_user_ids[] = (int) $user_id;
	}

	return array_values( array_unique( array_filter( $matched_user_ids ) ) );
}

/**
 * Determine candidate user IDs for each subject type.
 *
 * @param array<string, mixed> $event Notification event.
 * @return array<string, int[]> Subject keyed candidate user IDs.
 */
function alpaistr_get_notification_subject_candidates( $event ) {
	$mentioned_users = isset( $event['comment']['mentions'] ) && is_array( $event['comment']['mentions'] ) ? $event['comment']['mentions'] : [];
	$mentioned_ids   = [];
	foreach ( $mentioned_users as $mention ) {
		if ( isset( $mention['id'] ) ) {
			$mentioned_ids[] = (int) $mention['id'];
		}
	}

	$assigned_ids = isset( $event['issue']['assignee_ids'] ) && is_array( $event['issue']['assignee_ids'] ) ? $event['issue']['assignee_ids'] : [];
	if ( 'issue_assignment_changes' === $event['event_family'] || 'checklist_assignment_changes' === $event['event_family'] ) {
		$assigned_ids = array_merge( $assigned_ids, alpaistr_get_notification_assignment_target_ids( $event ) );
	}

	return [
		'created'       => [ (int) $event['issue']['creator_id'] ],
		'assigned'      => array_values( array_unique( array_filter( array_map( 'absint', $assigned_ids ) ) ) ),
		'starred'       => isset( $event['issue']['watcher_ids'] ) && is_array( $event['issue']['watcher_ids'] ) ? array_values( array_unique( array_filter( array_map( 'absint', $event['issue']['watcher_ids'] ) ) ) ) : [],
		'mentioned'     => array_values( array_unique( array_filter( array_map( 'absint', $mentioned_ids ) ) ) ),
		'labeled'       => alpaistr_get_notification_label_subscriber_ids( $event ),
		'high_priority' => alpaistr_get_notification_high_priority_subscriber_ids( $event ),
		'all_new_tasks' => alpaistr_get_notification_all_new_task_subscriber_ids( $event ),
	];
}

/**
 * Determine whether a user's preferences permit a notification.
 *
 * @param array<string, mixed> $preferences User preferences.
 * @param string               $subject_key Subject key.
 * @param string               $event_key   Event family key.
 * @return bool True when the notification should be sent.
 */
function alpaistr_user_preferences_allow_notification( $preferences, $subject_key, $event_key ) {
	if ( ! alpaistr_notification_preferences_have_enabled_delivery_targets( $preferences ) ) {
		return false;
	}

	if ( empty( $preferences['subjects'][ $subject_key ] ) ) {
		return false;
	}

	if ( empty( $preferences['events'][ $event_key ] ) ) {
		return false;
	}

	return true;
}

/**
 * Determine whether a user's preferences permit a standalone new-task notification.
 *
 * @param array<string, mixed> $preferences User preferences.
 * @param array<string, mixed> $event       Notification event.
 * @return bool True when the notification should be sent.
 */
function alpaistr_user_preferences_allow_new_task_notification( $preferences, $event ) {
	if ( ! alpaistr_notification_preferences_have_enabled_delivery_targets( $preferences ) ) {
		return false;
	}

	if ( empty( $preferences['subjects']['all_new_tasks'] ) ) {
		return false;
	}

	if ( ! alpaistr_is_notification_new_task_event( $event ) ) {
		return false;
	}

	return true;
}

/**
 * Resolve notification recipients for an event.
 *
 * @param array<string, mixed> $event Notification event.
 * @return array<int, array<string, mixed>> Recipient data rows.
 */
function alpaistr_resolve_notification_recipients( $event ) {
	$actor_id   = isset( $event['actor']['id'] ) ? (int) $event['actor']['id'] : 0;
	$candidates = alpaistr_get_notification_subject_candidates( $event );
	$resolved   = [];

	foreach ( $candidates as $subject_key => $user_ids ) {
		foreach ( $user_ids as $user_id ) {
			$user_id = (int) $user_id;
			if ( $user_id <= 0 || $user_id === $actor_id ) {
				continue;
			}

			$user = get_user_by( 'id', $user_id );
			if ( ! ( $user instanceof WP_User ) ) {
				continue;
			}

			$preferences = alpaistr_get_notification_preferences_for_user( $user_id );
			if ( 'all_new_tasks' === $subject_key ) {
				$allowed = alpaistr_user_preferences_allow_new_task_notification( $preferences, $event );
			} else {
				$allowed = alpaistr_user_preferences_allow_notification( $preferences, $subject_key, (string) $event['event_family'] );
			}

			if ( ! $allowed ) {
				continue;
			}

			if ( ! isset( $resolved[ $user_id ] ) ) {
				$resolved[ $user_id ] = [
					'user_id'      => $user_id,
					'display_name' => (string) $user->display_name,
					'preferences'  => $preferences,
					'subjects'     => [],
				];
			}

			$resolved[ $user_id ]['subjects'][] = $subject_key;
		}
	}

	return array_values( $resolved );
}
