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
 * Return the registered notification channels.
 *
 * @return array<string, array<string, mixed>> Channel registry keyed by channel ID.
 */
function alpaca_get_notification_channel_registry() {
	$channels = array(
		'inbox' => array(
			'key'                => 'inbox',
			'transport'          => 'inbox',
			'label'              => esc_html__( 'In-App Notifications', 'alpaca' ),
			'description'        => esc_html__( 'Shows updates inside Project Board.', 'alpaca' ),
			'enabled_by_default' => true,
			'is_available'       => true,
			'summary_fields'     => array(),
			'settings_fields'    => array(),
		),
		'email' => array(
			'key'                => 'email',
			'transport'          => 'email',
			'label'              => esc_html__( 'Email', 'alpaca' ),
			'description'        => esc_html__( 'Sends updates to your email address.', 'alpaca' ),
			'enabled_by_default' => false,
			'is_available'       => true,
			'summary_fields'     => array(),
			'settings_fields'    => array(
				array(
					'key'   => 'address_override',
					'type'  => 'email',
					'label' => esc_html__( 'Email address', 'alpaca' ),
					'help'  => esc_html__( 'Uses your WordPress profile email unless you enter a different address here.', 'alpaca' ),
				),
			),
		),
	);

	$channels = apply_filters( 'alpaca_notification_channels', $channels );
	if ( ! is_array( $channels ) ) {
		return array();
	}

	$normalized = array();
	foreach ( $channels as $channel_key => $channel ) {
		if ( ! is_array( $channel ) ) {
			continue;
		}

		$channel['key']             = isset( $channel['key'] ) ? sanitize_key( (string) $channel['key'] ) : sanitize_key( (string) $channel_key );
		$channel['label']           = isset( $channel['label'] ) ? (string) $channel['label'] : ucfirst( (string) $channel['key'] );
		$channel['description']     = isset( $channel['description'] ) ? (string) $channel['description'] : '';
		$channel['transport']       = isset( $channel['transport'] ) ? sanitize_key( (string) $channel['transport'] ) : sanitize_key( (string) $channel['key'] );
		$channel['is_available']    = isset( $channel['is_available'] ) ? (bool) $channel['is_available'] : true;
		$channel['summary_fields']  = isset( $channel['summary_fields'] ) && is_array( $channel['summary_fields'] ) ? $channel['summary_fields'] : array();
		$channel['settings_fields'] = isset( $channel['settings_fields'] ) && is_array( $channel['settings_fields'] ) ? $channel['settings_fields'] : array();

		if ( empty( $channel['key'] ) ) {
			continue;
		}

		$normalized[ $channel['key'] ] = $channel;
	}

	return $normalized;
}

/**
 * Return the default channel settings for notification preferences.
 *
 * @return array<string, array<string, mixed>> Default channel settings.
 */
function alpaca_get_notification_channel_defaults() {
	$channels = alpaca_get_notification_channel_registry();
	$defaults = array();

	foreach ( $channels as $channel_key => $channel ) {
		$defaults[ $channel_key ] = array(
			'enabled' => ! empty( $channel['enabled_by_default'] ),
		);

		if ( 'email' === $channel_key ) {
			$defaults[ $channel_key ]['address_override'] = '';
		}
	}

	return $defaults;
}

/**
 * Return the default notification preferences for a user.
 *
 * @return array<string, mixed> Default preferences.
 */
function alpaca_get_notification_preference_defaults() {
	return array(
		'channels'  => alpaca_get_notification_channel_defaults(),
		'label_ids' => array(),
		'subjects'  => array(
			'created'       => true,
			'assigned'      => true,
			'starred'       => true,
			'mentioned'     => true,
			'labeled'       => false,
			'high_priority' => false,
			'all_new_tasks' => false,
		),
		'events'    => array(
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
 * Get the email channel settings from a notification preferences payload.
 *
 * @param array<string, mixed>|null $preferences Notification preferences.
 * @return array<string, mixed> Email channel settings.
 */
function alpaca_get_notification_email_channel_preferences( $preferences ) {
	$defaults      = alpaca_get_notification_channel_defaults();
	$email_default = isset( $defaults['email'] ) && is_array( $defaults['email'] ) ? $defaults['email'] : array(
		'enabled'          => false,
		'address_override' => '',
	);

	if ( ! is_array( $preferences ) ) {
		return $email_default;
	}

	$email_preferences = array();
	if ( isset( $preferences['channels'] ) && is_array( $preferences['channels'] ) && isset( $preferences['channels']['email'] ) && is_array( $preferences['channels']['email'] ) ) {
		$email_preferences = $preferences['channels']['email'];
	}

	if ( isset( $preferences['enabled'] ) ) {
		$email_preferences['enabled'] = ! empty( $preferences['enabled'] );
	}

	if ( isset( $preferences['delivery_email_override'] ) && ! isset( $email_preferences['address_override'] ) ) {
		$email_preferences['address_override'] = sanitize_email( trim( (string) $preferences['delivery_email_override'] ) );
	}

	return array(
		'enabled'          => isset( $email_preferences['enabled'] ) ? ! empty( $email_preferences['enabled'] ) : ! empty( $email_default['enabled'] ),
		'address_override' => isset( $email_preferences['address_override'] ) ? sanitize_email( trim( (string) $email_preferences['address_override'] ) ) : ( isset( $email_default['address_override'] ) ? (string) $email_default['address_override'] : '' ),
	);
}

/**
 * Return valid Alpaca label term IDs from a raw list.
 *
 * @param mixed $label_ids Raw label IDs.
 * @return int[] Valid Alpaca label term IDs.
 */
function alpaca_get_valid_notification_label_ids( $label_ids ) {
	if ( ! is_array( $label_ids ) ) {
		return array();
	}

	$label_ids = array_values( array_unique( array_filter( array_map( 'absint', $label_ids ) ) ) );
	if ( empty( $label_ids ) ) {
		return array();
	}

	$terms = get_terms(
		array(
			'taxonomy'   => 'alpaca_label',
			'hide_empty' => false,
			'include'    => $label_ids,
			'fields'     => 'ids',
		)
	);

	if ( is_wp_error( $terms ) || ! is_array( $terms ) ) {
		return array();
	}

	return array_values( array_unique( array_filter( array_map( 'absint', $terms ) ) ) );
}

/**
 * Get the WordPress profile email used for notifications.
 *
 * @param int $user_id User ID.
 * @return string Valid profile email or an empty string.
 */
function alpaca_get_notification_profile_email( $user_id ) {
	$user = get_user_by( 'id', (int) $user_id );
	if ( ! ( $user instanceof WP_User ) ) {
		return '';
	}

	$email = (string) $user->user_email;
	if ( '' === $email || ! is_email( $email ) ) {
		return '';
	}

	return $email;
}

/**
 * Determine whether a preferences payload uses an email override.
 *
 * @param array<string, mixed> $preferences Notification preferences.
 * @return bool True when a non-empty override is present.
 */
function alpaca_notification_preferences_use_email_override( $preferences ) {
	$email_preferences = alpaca_get_notification_email_channel_preferences( $preferences );
	$override          = isset( $email_preferences['address_override'] ) ? trim( (string) $email_preferences['address_override'] ) : '';

	return '' !== $override;
}

/**
 * Get the effective notification email for a user.
 *
 * @param int                       $user_id      User ID.
 * @param array<string, mixed>|null $preferences Optional preferences payload.
 * @return string Valid delivery email or an empty string.
 */
function alpaca_get_notification_effective_email( $user_id, $preferences = null ) {
	$email_preferences = alpaca_get_notification_email_channel_preferences( $preferences );
	$override          = isset( $email_preferences['address_override'] ) ? trim( (string) $email_preferences['address_override'] ) : '';
	if ( '' !== $override && is_email( $override ) ) {
		return $override;
	}

	return alpaca_get_notification_profile_email( $user_id );
}

/**
 * Determine whether a notification channel is enabled.
 *
 * @param array<string, mixed> $preferences Notification preferences.
 * @param string               $channel_key Channel key.
 * @return bool True when the channel is enabled.
 */
function alpaca_notification_channel_is_enabled( $preferences, $channel_key ) {
	$channel_key = sanitize_key( (string) $channel_key );
	if ( 'email' === $channel_key ) {
		$email_preferences = alpaca_get_notification_email_channel_preferences( $preferences );

		return ! empty( $email_preferences['enabled'] );
	}

	if ( ! is_array( $preferences ) || empty( $preferences['channels'][ $channel_key ] ) || ! is_array( $preferences['channels'][ $channel_key ] ) ) {
		return false;
	}

	return ! empty( $preferences['channels'][ $channel_key ]['enabled'] );
}

/**
 * Determine whether any notification channel is enabled.
 *
 * @param array<string, mixed> $preferences Notification preferences.
 * @return bool True when at least one channel is enabled.
 */
function alpaca_notification_preferences_have_enabled_channels( $preferences ) {
	$channels = alpaca_get_notification_channel_registry();
	foreach ( array_keys( $channels ) as $channel_key ) {
		if ( alpaca_notification_channel_is_enabled( $preferences, $channel_key ) ) {
			return true;
		}
	}

	return false;
}

/**
 * Build channel status data for a user's notification preferences payload.
 *
 * @param int                  $user_id      User ID.
 * @param array<string, mixed> $preferences Notification preferences.
 * @return array<string, array<string, mixed>> Channel status keyed by channel ID.
 */
function alpaca_get_notification_channel_status_for_user( $user_id, $preferences ) {
	$statuses            = array();
	$channels            = alpaca_get_notification_channel_registry();
	$profile_address     = alpaca_get_notification_profile_email( $user_id );
	$effective_address   = alpaca_get_notification_effective_email( $user_id, $preferences );
	$uses_email_override = false;

	if ( '' !== $effective_address ) {
		if ( '' === $profile_address ) {
			$uses_email_override = alpaca_notification_preferences_use_email_override( $preferences );
		} elseif ( 0 !== strcasecmp( $effective_address, $profile_address ) ) {
			$uses_email_override = true;
		}
	}

	foreach ( $channels as $channel_key => $channel ) {
		if ( 'inbox' === $channel_key ) {
			$statuses[ $channel_key ] = array(
				'unread_count' => alpaca_get_notification_inbox_unread_count( $user_id ),
				'can_enable'   => ! empty( $channel['is_available'] ),
			);
			continue;
		}

		if ( 'email' === $channel_key ) {
			$statuses[ $channel_key ] = array(
				'profile_address'   => $profile_address,
				'effective_address' => $effective_address,
				'uses_override'     => $uses_email_override,
				'can_enable'        => '' !== $effective_address && is_email( $effective_address ),
			);
			continue;
		}

		$statuses[ $channel_key ] = array(
			'can_enable' => ! empty( $channel['is_available'] ),
		);
	}

	return $statuses;
}

/**
 * Return user IDs with saved Alpaca notification preferences.
 *
 * @return int[] User IDs.
 */
function alpaca_get_notification_preference_user_ids() {
	global $wpdb;

	$cache_key       = 'notification_preference_user_ids';
	$cached_user_ids = wp_cache_get( $cache_key, 'alpaca_notifications' );
	if ( is_array( $cached_user_ids ) ) {
		return array_values( array_unique( array_filter( array_map( 'absint', $cached_user_ids ) ) ) );
	}

	// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- This query is cached and avoids a slower user meta lookup across all users.
	$user_ids = $wpdb->get_col(
		$wpdb->prepare(
			"SELECT DISTINCT user_id FROM {$wpdb->usermeta} WHERE meta_key = %s",
			'alpaca_notification_preferences'
		)
	);

	if ( ! is_array( $user_ids ) ) {
		return array();
	}

	wp_cache_set( $cache_key, $user_ids, 'alpaca_notifications', MINUTE_IN_SECONDS );

	return array_values( array_unique( array_filter( array_map( 'absint', $user_ids ) ) ) );
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
		'channels'  => array_merge( $defaults['channels'], isset( $stored['channels'] ) && is_array( $stored['channels'] ) ? $stored['channels'] : array() ),
		'label_ids' => isset( $stored['label_ids'] ) && is_array( $stored['label_ids'] ) ? array_values( array_unique( array_filter( array_map( 'absint', $stored['label_ids'] ) ) ) ) : array(),
		'subjects'  => array_merge( $defaults['subjects'], isset( $stored['subjects'] ) && is_array( $stored['subjects'] ) ? $stored['subjects'] : array() ),
		'events'    => array_merge( $defaults['events'], isset( $stored['events'] ) && is_array( $stored['events'] ) ? $stored['events'] : array() ),
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
		'channels'  => $defaults['channels'],
		'label_ids' => array(),
		'subjects'  => array(),
		'events'    => array(),
	);

	if ( is_array( $preferences ) ) {
		foreach ( $defaults['channels'] as $channel_key => $channel_defaults ) {
			if ( 'email' === $channel_key ) {
				$sanitized['channels']['email'] = alpaca_get_notification_email_channel_preferences( $preferences );
				continue;
			}

			$raw_channel = array();
			if ( isset( $preferences['channels'] ) && is_array( $preferences['channels'] ) && isset( $preferences['channels'][ $channel_key ] ) && is_array( $preferences['channels'][ $channel_key ] ) ) {
				$raw_channel = $preferences['channels'][ $channel_key ];
			}

			$sanitized['channels'][ $channel_key ] = array(
				'enabled' => isset( $raw_channel['enabled'] ) ? ! empty( $raw_channel['enabled'] ) : ! empty( $channel_defaults['enabled'] ),
			);
		}
	}

	if ( is_array( $preferences ) && isset( $preferences['label_ids'] ) ) {
		$sanitized['label_ids'] = alpaca_get_valid_notification_label_ids( $preferences['label_ids'] );
	}

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
 * Return available notification channels for REST payloads.
 *
 * @return array<int, array<string, mixed>> Available channel definitions.
 */
function alpaca_get_available_notification_channels() {
	$channels  = alpaca_get_notification_channel_registry();
	$available = array();

	foreach ( $channels as $channel ) {
		if ( empty( $channel['is_available'] ) ) {
			continue;
		}

		$available[] = $channel;
	}

	return array_values( $available );
}

/**
 * Save notification preferences for a user.
 *
 * @param int                 $user_id      User ID.
 * @param array<string,mixed> $preferences Preferences to save.
 * @return array<string, mixed>|WP_Error Saved preferences.
 */
function alpaca_update_notification_preferences_for_user( $user_id, $preferences ) {
	$email_preferences = alpaca_get_notification_email_channel_preferences( is_array( $preferences ) ? $preferences : array() );
	$override          = isset( $email_preferences['address_override'] ) ? trim( (string) $email_preferences['address_override'] ) : '';

	if ( '' !== $override && ! is_email( $override ) ) {
		return new WP_Error(
			'alpaca_invalid_notification_email_override',
			esc_html__( 'Enter a valid notification email address or leave the override blank.', 'alpaca' )
		);
	}

	$sanitized = alpaca_sanitize_notification_preferences( $preferences );
	if ( isset( $sanitized['channels']['email']['address_override'] ) ) {
		$profile_email = alpaca_get_notification_profile_email( $user_id );
		$override      = trim( (string) $sanitized['channels']['email']['address_override'] );

		if ( '' !== $override && '' !== $profile_email && 0 === strcasecmp( $override, $profile_email ) ) {
			$sanitized['channels']['email']['address_override'] = '';
		}
	}

	update_user_meta( (int) $user_id, 'alpaca_notification_preferences', $sanitized );
	wp_cache_delete( 'notification_preference_user_ids', 'alpaca_notifications' );

	return alpaca_get_notification_preferences_for_user( $user_id );
}
