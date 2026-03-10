<?php
/**
 * Notification preference helpers for Alpaca issue activity emails.
 *
 * @package Alpaca
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Return the default notification preferences for a user.
 *
 * @return array<string, mixed> Default preferences.
 */
function alpaca_get_notification_preference_defaults() {
	return array(
		'enabled'  => false,
		'subjects' => array(
			'created'   => true,
			'assigned'  => true,
			'starred'   => true,
			'mentioned' => true,
		),
		'events'   => array(
			'human_comments'               => true,
			'status_changes'               => true,
			'issue_assignment_changes'     => true,
			'due_date_changes'             => true,
			'checklist_created_deleted'    => true,
			'checklist_assignment_changes' => true,
			'checklist_completion_changes' => true,
			'checklist_promotions'         => true,
			'priority_changes'             => true,
		),
	);
}

/**
 * Get saved notification preferences for a user.
 *
 * @param int $user_id User ID.
 * @return array<string, mixed> Preferences merged with defaults.
 */
function alpaca_get_notification_preferences_for_user( $user_id ) {
	$defaults = alpaca_get_notification_preference_defaults();
	$stored   = get_user_meta( (int) $user_id, 'alpaca_notification_preferences', true );

	if ( ! is_array( $stored ) ) {
		return $defaults;
	}

	$stored = alpaca_sanitize_notification_preferences( $stored );

	return array(
		'enabled'  => ! empty( $stored['enabled'] ),
		'subjects' => array_merge( $defaults['subjects'], isset( $stored['subjects'] ) && is_array( $stored['subjects'] ) ? $stored['subjects'] : array() ),
		'events'   => array_merge( $defaults['events'], isset( $stored['events'] ) && is_array( $stored['events'] ) ? $stored['events'] : array() ),
	);
}

/**
 * Sanitize a notification preferences payload.
 *
 * @param mixed $preferences Raw preferences.
 * @return array<string, mixed> Sanitized preferences.
 */
function alpaca_sanitize_notification_preferences( $preferences ) {
	$defaults  = alpaca_get_notification_preference_defaults();
	$sanitized = array(
		'enabled'  => ! empty( is_array( $preferences ) ? $preferences['enabled'] ?? false : false ),
		'subjects' => array(),
		'events'   => array(),
	);

	$subjects = is_array( $preferences ) && isset( $preferences['subjects'] ) && is_array( $preferences['subjects'] ) ? $preferences['subjects'] : array();
	foreach ( $defaults['subjects'] as $key => $value ) {
		$sanitized['subjects'][ $key ] = ! empty( $subjects[ $key ] );
	}

	$events = is_array( $preferences ) && isset( $preferences['events'] ) && is_array( $preferences['events'] ) ? $preferences['events'] : array();
	foreach ( $defaults['events'] as $key => $value ) {
		$sanitized['events'][ $key ] = ! empty( $events[ $key ] );
	}

	return $sanitized;
}

/**
 * Save notification preferences for a user.
 *
 * @param int                 $user_id      User ID.
 * @param array<string,mixed> $preferences Preferences to save.
 * @return array<string, mixed> Saved preferences.
 */
function alpaca_update_notification_preferences_for_user( $user_id, $preferences ) {
	$sanitized = alpaca_sanitize_notification_preferences( $preferences );
	update_user_meta( (int) $user_id, 'alpaca_notification_preferences', $sanitized );

	return alpaca_get_notification_preferences_for_user( $user_id );
}
