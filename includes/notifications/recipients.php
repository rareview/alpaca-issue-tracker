<?php
/**
 * Notification recipient helpers for Alpaca issue activity emails.
 *
 * @package Alpaca
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
function alpaca_get_notification_assignment_target_ids( $event ) {
	$context = isset( $event['comment']['context'] ) && is_array( $event['comment']['context'] ) ? $event['comment']['context'] : array();
	$ids     = isset( $context['affected_user_ids'] ) && is_array( $context['affected_user_ids'] ) ? $context['affected_user_ids'] : array();

	return array_values( array_unique( array_filter( array_map( 'absint', $ids ) ) ) );
}

/**
 * Determine candidate user IDs for each subject type.
 *
 * @param array<string, mixed> $event Notification event.
 * @return array<string, int[]> Subject keyed candidate user IDs.
 */
function alpaca_get_notification_subject_candidates( $event ) {
	$mentioned_users = isset( $event['comment']['mentions'] ) && is_array( $event['comment']['mentions'] ) ? $event['comment']['mentions'] : array();
	$mentioned_ids   = array();
	foreach ( $mentioned_users as $mention ) {
		if ( isset( $mention['id'] ) ) {
			$mentioned_ids[] = (int) $mention['id'];
		}
	}

	$assigned_ids = isset( $event['issue']['assignee_ids'] ) && is_array( $event['issue']['assignee_ids'] ) ? $event['issue']['assignee_ids'] : array();
	if ( 'issue_assignment_changes' === $event['event_family'] || 'checklist_assignment_changes' === $event['event_family'] ) {
		$assigned_ids = array_merge( $assigned_ids, alpaca_get_notification_assignment_target_ids( $event ) );
	}

	return array(
		'created'   => array( (int) $event['issue']['creator_id'] ),
		'assigned'  => array_values( array_unique( array_filter( array_map( 'absint', $assigned_ids ) ) ) ),
		'starred'   => isset( $event['issue']['watcher_ids'] ) && is_array( $event['issue']['watcher_ids'] ) ? array_values( array_unique( array_filter( array_map( 'absint', $event['issue']['watcher_ids'] ) ) ) ) : array(),
		'mentioned' => array_values( array_unique( array_filter( array_map( 'absint', $mentioned_ids ) ) ) ),
	);
}

/**
 * Determine whether a user's preferences permit a notification.
 *
 * @param array<string, mixed> $preferences User preferences.
 * @param string               $subject_key Subject key.
 * @param string               $event_key   Event family key.
 * @return bool True when the notification should be sent.
 */
function alpaca_user_preferences_allow_notification( $preferences, $subject_key, $event_key ) {
	if ( empty( $preferences['enabled'] ) ) {
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
 * Resolve notification recipients for an event.
 *
 * @param array<string, mixed> $event Notification event.
 * @return array<int, array<string, mixed>> Recipient data rows.
 */
function alpaca_resolve_notification_recipients( $event ) {
	$actor_id   = isset( $event['actor']['id'] ) ? (int) $event['actor']['id'] : 0;
	$candidates = alpaca_get_notification_subject_candidates( $event );
	$resolved   = array();

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

			$email = (string) $user->user_email;
			if ( '' === $email || ! is_email( $email ) ) {
				continue;
			}

			$preferences = alpaca_get_notification_preferences_for_user( $user_id );
			if ( ! alpaca_user_preferences_allow_notification( $preferences, $subject_key, (string) $event['event_family'] ) ) {
				continue;
			}

			if ( ! isset( $resolved[ $user_id ] ) ) {
				$resolved[ $user_id ] = array(
					'user_id'      => $user_id,
					'email'        => $email,
					'display_name' => (string) $user->display_name,
					'subjects'     => array(),
				);
			}

			$resolved[ $user_id ]['subjects'][] = $subject_key;
		}
	}

	return array_values( $resolved );
}
