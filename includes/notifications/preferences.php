<?php

/**
 * Notification preference helpers for Alpaca Issue Tracker issue activity emails.
 *
 * @package AlpacaIssueTracker
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
function alpaistr_get_notification_channel_registry() {
	$channels = [
		'email' => [
			'key'                => 'email',
			'transport'          => 'email',
			'label'              => esc_html__( 'Email', 'alpaca-issue-tracker' ),
			'description'        => esc_html__( 'Sends updates to your email address.', 'alpaca-issue-tracker' ),
			'enabled_by_default' => false,
			'is_available'       => true,
			'supports_digest'    => true,
			'summary_fields'     => [],
			'settings_fields'    => [
				[
					'key'   => 'address_override',
					'type'  => 'email',
					'label' => esc_html__( 'Email address', 'alpaca-issue-tracker' ),
					'help'  => esc_html__( 'Uses your WordPress profile email unless you enter a different address here.', 'alpaca-issue-tracker' ),
				],
			],
		],
	];

	$channels = apply_filters( 'alpaca_notification_channels', $channels );
	if ( ! is_array( $channels ) ) {
		return [];
	}

	$normalized = [];
	foreach ( $channels as $channel_key => $channel ) {
		if ( ! is_array( $channel ) ) {
			continue;
		}

		$channel['key']             = isset( $channel['key'] ) ? sanitize_key( (string) $channel['key'] ) : sanitize_key( (string) $channel_key );
		$channel['label']           = isset( $channel['label'] ) ? (string) $channel['label'] : ucfirst( (string) $channel['key'] );
		$channel['description']     = isset( $channel['description'] ) ? (string) $channel['description'] : '';
		$channel['transport']       = isset( $channel['transport'] ) ? sanitize_key( (string) $channel['transport'] ) : sanitize_key( (string) $channel['key'] );
		$channel['is_available']    = isset( $channel['is_available'] ) ? (bool) $channel['is_available'] : true;
		$channel['supports_digest'] = isset( $channel['supports_digest'] ) ? (bool) $channel['supports_digest'] : false;
		$channel['summary_fields']  = isset( $channel['summary_fields'] ) && is_array( $channel['summary_fields'] ) ? $channel['summary_fields'] : [];
		$channel['settings_fields'] = isset( $channel['settings_fields'] ) && is_array( $channel['settings_fields'] ) ? $channel['settings_fields'] : [];

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
function alpaistr_get_notification_channel_defaults() {
	$channels = alpaistr_get_notification_channel_registry();
	$defaults = [];

	foreach ( $channels as $channel_key => $channel ) {
		$defaults[ $channel_key ] = [
			'enabled' => ! empty( $channel['enabled_by_default'] ),
		];

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
function alpaistr_get_notification_preference_defaults() {
	return [
		'channels'  => alpaistr_get_notification_channel_defaults(),
		'digests'   => [
			'daily' => alpaistr_get_notification_daily_digest_defaults(),
		],
		'label_ids' => [],
		'subjects'  => [
			'created'       => true,
			'assigned'      => true,
			'starred'       => true,
			'mentioned'     => true,
			'labeled'       => false,
			'high_priority' => false,
			'all_new_tasks' => false,
		],
		'events'    => [
			'human_comments'               => true,
			'status_changes'               => true,
			'issue_assignment_changes'     => true,
			'due_date_changes'             => true,
			'checklist_created_deleted'    => true,
			'checklist_assignment_changes' => true,
			'checklist_completion_changes' => true,
			'checklist_promotions'         => true,
			'priority_changes'             => true,
		],
	];
}

/**
 * Return the supported digest channel keys.
 *
 * @return string[] Digest-capable channel keys.
 */
function alpaistr_get_notification_digest_supported_channel_keys() {
	$channels     = alpaistr_get_notification_channel_registry();
	$channel_keys = [];

	foreach ( $channels as $channel_key => $channel ) {
		if ( empty( $channel['supports_digest'] ) || empty( $channel['is_available'] ) ) {
			continue;
		}

		$channel_keys[] = sanitize_key( (string) $channel_key );
	}

	return array_values( array_unique( array_filter( $channel_keys ) ) );
}

/**
 * Return the default daily digest preferences.
 *
 * @return array<string, mixed> Daily digest defaults.
 */
function alpaistr_get_notification_daily_digest_defaults() {
	$channels = [];

	foreach ( alpaistr_get_notification_digest_supported_channel_keys() as $channel_key ) {
		$channels[ $channel_key ] = 'email' === $channel_key;
	}

	return [
		'enabled'   => false,
		'channels'  => $channels,
		'send_time' => '17:00',
	];
}

/**
 * Normalize a daily digest time string.
 *
 * @param mixed $send_time Raw send time.
 * @return string Normalized time string.
 */
function alpaistr_normalize_notification_daily_digest_time( $send_time ) {
	$send_time = is_string( $send_time ) ? trim( $send_time ) : '';
	if ( preg_match( '/^(?:[01]\d|2[0-3]):[0-5]\d$/', $send_time ) ) {
		return $send_time;
	}

	return '17:00';
}

/**
 * Sanitize daily digest preferences.
 *
 * @param mixed $daily_preferences Raw daily digest preferences.
 * @return array<string, mixed> Sanitized daily digest preferences.
 */
function alpaistr_sanitize_notification_daily_digest_preferences( $daily_preferences ) {
	$defaults           = alpaistr_get_notification_daily_digest_defaults();
	$supported_channels = alpaistr_get_notification_digest_supported_channel_keys();

	if ( ! is_array( $daily_preferences ) ) {
		return $defaults;
	}

	$channels = $defaults['channels'];
	if ( isset( $daily_preferences['channels'] ) && is_array( $daily_preferences['channels'] ) ) {
		foreach ( $supported_channels as $channel_key ) {
			$channels[ $channel_key ] = ! empty( $daily_preferences['channels'][ $channel_key ] );
		}
	}

	return [
		'enabled'   => ! empty( $daily_preferences['enabled'] ),
		'channels'  => $channels,
		'send_time' => alpaistr_normalize_notification_daily_digest_time( isset( $daily_preferences['send_time'] ) ? $daily_preferences['send_time'] : $defaults['send_time'] ),
	];
}

/**
 * Return the site timezone label for notification settings.
 *
 * @return string Timezone label.
 */
function alpaistr_get_notification_site_timezone_label() {
	$timezone_string = wp_timezone_string();

	if ( is_string( $timezone_string ) && '' !== trim( $timezone_string ) ) {
		return trim( $timezone_string );
	}

	return esc_html__( 'Site timezone', 'alpaca-issue-tracker' );
}

/**
 * Get the email channel settings from a notification preferences payload.
 *
 * @param array<string, mixed>|null $preferences Notification preferences.
 * @return array<string, mixed> Email channel settings.
 */
function alpaistr_get_notification_email_channel_preferences( $preferences ) {
	$defaults      = alpaistr_get_notification_channel_defaults();
	$email_default = isset( $defaults['email'] ) && is_array( $defaults['email'] ) ? $defaults['email'] : [
		'enabled'          => false,
		'address_override' => '',
	];

	if ( ! is_array( $preferences ) ) {
		return $email_default;
	}

	$email_preferences = [];
	if ( isset( $preferences['channels'] ) && is_array( $preferences['channels'] ) && isset( $preferences['channels']['email'] ) && is_array( $preferences['channels']['email'] ) ) {
		$email_preferences = $preferences['channels']['email'];
	}

	if ( isset( $preferences['enabled'] ) ) {
		$email_preferences['enabled'] = ! empty( $preferences['enabled'] );
	}

	if ( isset( $preferences['delivery_email_override'] ) && ! isset( $email_preferences['address_override'] ) ) {
		$email_preferences['address_override'] = sanitize_email( trim( (string) $preferences['delivery_email_override'] ) );
	}

	return [
		'enabled'          => isset( $email_preferences['enabled'] ) ? ! empty( $email_preferences['enabled'] ) : ! empty( $email_default['enabled'] ),
		'address_override' => isset( $email_preferences['address_override'] ) ? sanitize_email( trim( (string) $email_preferences['address_override'] ) ) : ( isset( $email_default['address_override'] ) ? (string) $email_default['address_override'] : '' ),
	];
}

/**
 * Return valid Alpaca Issue Tracker label term IDs from a raw list.
 *
 * @param mixed $label_ids Raw label IDs.
 * @return int[] Valid Alpaca Issue Tracker label term IDs.
 */
function alpaistr_get_valid_notification_label_ids( $label_ids ) {
	if ( ! is_array( $label_ids ) ) {
		return [];
	}

	$label_ids = array_values( array_unique( array_filter( array_map( 'absint', $label_ids ) ) ) );
	if ( empty( $label_ids ) ) {
		return [];
	}

	$terms = get_terms(
		[
			'taxonomy'   => 'alpaca_label',
			'hide_empty' => false,
			'include'    => $label_ids,
			'fields'     => 'ids',
		]
	);

	if ( is_wp_error( $terms ) || ! is_array( $terms ) ) {
		return [];
	}

	return array_values( array_unique( array_filter( array_map( 'absint', $terms ) ) ) );
}

/**
 * Get the WordPress profile email used for notifications.
 *
 * @param int $user_id User ID.
 * @return string Valid profile email or an empty string.
 */
function alpaistr_get_notification_profile_email( $user_id ) {
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
function alpaistr_notification_preferences_use_email_override( $preferences ) {
	$email_preferences = alpaistr_get_notification_email_channel_preferences( $preferences );
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
function alpaistr_get_notification_effective_email( $user_id, $preferences = null ) {
	$email_preferences = alpaistr_get_notification_email_channel_preferences( $preferences );
	$override          = isset( $email_preferences['address_override'] ) ? trim( (string) $email_preferences['address_override'] ) : '';
	if ( '' !== $override && is_email( $override ) ) {
		return $override;
	}

	return alpaistr_get_notification_profile_email( $user_id );
}

/**
 * Determine whether the built-in inbox should capture notifications.
 *
 * @return bool True when the built-in inbox is enabled.
 */
function alpaistr_notification_builtin_inbox_is_enabled() {
	/**
	 * Filter whether the built-in inbox should capture Alpaca Issue Tracker notifications.
	 *
	 * @param bool $enabled Whether the built-in inbox is enabled.
	 */
	return (bool) apply_filters( 'alpaistr_notification_builtin_inbox_is_enabled', true );
}

/**
 * Determine whether a notification channel is enabled.
 *
 * @param array<string, mixed> $preferences Notification preferences.
 * @param string               $channel_key Channel key.
 * @return bool True when the channel is enabled.
 */
function alpaistr_notification_channel_is_enabled( $preferences, $channel_key ) {
	$channel_key = sanitize_key( (string) $channel_key );
	if ( 'email' === $channel_key ) {
		$email_preferences = alpaistr_get_notification_email_channel_preferences( $preferences );

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
function alpaistr_notification_preferences_have_enabled_channels( $preferences ) {
	$channels = alpaistr_get_notification_channel_registry();
	foreach ( array_keys( $channels ) as $channel_key ) {
		if ( alpaistr_notification_channel_is_enabled( $preferences, $channel_key ) ) {
			return true;
		}
	}

	return false;
}

/**
 * Determine whether a digest channel is enabled.
 *
 * @param array<string, mixed> $preferences Notification preferences.
 * @param string               $channel_key Channel key.
 * @return bool True when the digest channel is enabled.
 */
function alpaistr_notification_digest_channel_is_enabled( $preferences, $channel_key ) {
	$channel_key = sanitize_key( (string) $channel_key );
	if ( '' === $channel_key || ! is_array( $preferences ) ) {
		return false;
	}

	if (
		empty( $preferences['digests']['daily']['enabled'] ) ||
		empty( $preferences['digests']['daily']['channels'] ) ||
		! is_array( $preferences['digests']['daily']['channels'] )
	) {
		return false;
	}

	return ! empty( $preferences['digests']['daily']['channels'][ $channel_key ] );
}

/**
 * Determine whether any daily digest channel is enabled.
 *
 * @param array<string, mixed> $preferences Notification preferences.
 * @return bool True when at least one digest channel is enabled.
 */
function alpaistr_notification_preferences_have_enabled_digest_channels( $preferences ) {
	if (
		! is_array( $preferences ) ||
		empty( $preferences['digests']['daily'] ) ||
		! is_array( $preferences['digests']['daily'] ) ||
		empty( $preferences['digests']['daily']['enabled'] )
	) {
		return false;
	}

	foreach ( alpaistr_get_notification_digest_supported_channel_keys() as $channel_key ) {
		if ( alpaistr_notification_digest_channel_is_enabled( $preferences, $channel_key ) ) {
			return true;
		}
	}

	return false;
}

/**
 * Determine whether any delivery target is enabled.
 *
 * @param array<string, mixed> $preferences Notification preferences.
 * @return bool True when any instant or digest delivery target is enabled.
 */
function alpaistr_notification_preferences_have_enabled_delivery_targets( $preferences ) {
	if ( alpaistr_notification_builtin_inbox_is_enabled() ) {
		return true;
	}

	if ( alpaistr_notification_preferences_have_enabled_channels( $preferences ) ) {
		return true;
	}

	return alpaistr_notification_preferences_have_enabled_digest_channels( $preferences );
}

/**
 * Build channel status data for a user's notification preferences payload.
 *
 * @param int                  $user_id      User ID.
 * @param array<string, mixed> $preferences Notification preferences.
 * @return array<string, array<string, mixed>> Channel status keyed by channel ID.
 */
function alpaistr_get_notification_channel_status_for_user( $user_id, $preferences ) {
	$statuses            = [];
	$channels            = alpaistr_get_notification_channel_registry();
	$profile_address     = alpaistr_get_notification_profile_email( $user_id );
	$effective_address   = alpaistr_get_notification_effective_email( $user_id, $preferences );
	$uses_email_override = false;

	if ( '' !== $effective_address ) {
		if ( '' === $profile_address ) {
			$uses_email_override = alpaistr_notification_preferences_use_email_override( $preferences );
		} elseif ( 0 !== strcasecmp( $effective_address, $profile_address ) ) {
			$uses_email_override = true;
		}
	}

	foreach ( $channels as $channel_key => $channel ) {
		if ( 'email' === $channel_key ) {
			$statuses[ $channel_key ] = [
				'profile_address'   => $profile_address,
				'effective_address' => $effective_address,
				'uses_override'     => $uses_email_override,
				'can_enable'        => '' !== $effective_address && is_email( $effective_address ),
			];
			continue;
		}

		$statuses[ $channel_key ] = [
			'can_enable' => ! empty( $channel['is_available'] ),
		];
	}

	return $statuses;
}

/**
 * Return user IDs with saved Alpaca Issue Tracker notification preferences.
 *
 * @return int[] User IDs.
 */
function alpaistr_get_notification_preference_user_ids() {
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
		return [];
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
function alpaistr_get_notification_preferences_for_user( $user_id ) {
	$defaults = alpaistr_get_notification_preference_defaults();
	$stored   = get_user_meta( (int) $user_id, 'alpaca_notification_preferences', true );

	if ( ! is_array( $stored ) ) {
		return $defaults;
	}

	$stored = alpaistr_sanitize_notification_preferences( $stored );

	return [
		'channels'  => array_merge( $defaults['channels'], isset( $stored['channels'] ) && is_array( $stored['channels'] ) ? $stored['channels'] : [] ),
		'digests'   => [
			'daily' => array_merge(
				$defaults['digests']['daily'],
				isset( $stored['digests']['daily'] ) && is_array( $stored['digests']['daily'] ) ? $stored['digests']['daily'] : []
			),
		],
		'label_ids' => isset( $stored['label_ids'] ) && is_array( $stored['label_ids'] ) ? array_values( array_unique( array_filter( array_map( 'absint', $stored['label_ids'] ) ) ) ) : [],
		'subjects'  => array_merge( $defaults['subjects'], isset( $stored['subjects'] ) && is_array( $stored['subjects'] ) ? $stored['subjects'] : [] ),
		'events'    => array_merge( $defaults['events'], isset( $stored['events'] ) && is_array( $stored['events'] ) ? $stored['events'] : [] ),
	];
}

/**
 * Sanitize a notification preferences payload.
 *
 * @param mixed $preferences Raw preferences.
 * @return array<string, mixed> Sanitized preferences.
 */
function alpaistr_sanitize_notification_preferences( $preferences ) {
	$defaults  = alpaistr_get_notification_preference_defaults();
	$sanitized = [
		'channels'  => $defaults['channels'],
		'digests'   => $defaults['digests'],
		'label_ids' => [],
		'subjects'  => [],
		'events'    => [],
	];

	if ( is_array( $preferences ) ) {
		foreach ( $defaults['channels'] as $channel_key => $channel_defaults ) {
			if ( 'email' === $channel_key ) {
				$sanitized['channels']['email'] = alpaistr_get_notification_email_channel_preferences( $preferences );
				continue;
			}

			$raw_channel = [];
			if ( isset( $preferences['channels'] ) && is_array( $preferences['channels'] ) && isset( $preferences['channels'][ $channel_key ] ) && is_array( $preferences['channels'][ $channel_key ] ) ) {
				$raw_channel = $preferences['channels'][ $channel_key ];
			}

			$sanitized['channels'][ $channel_key ] = [
				'enabled' => isset( $raw_channel['enabled'] ) ? ! empty( $raw_channel['enabled'] ) : ! empty( $channel_defaults['enabled'] ),
			];
		}
	}

	if ( is_array( $preferences ) && isset( $preferences['label_ids'] ) ) {
		$sanitized['label_ids'] = alpaistr_get_valid_notification_label_ids( $preferences['label_ids'] );
	}

	if ( is_array( $preferences ) && isset( $preferences['digests'] ) && is_array( $preferences['digests'] ) ) {
		$sanitized['digests']['daily'] = alpaistr_sanitize_notification_daily_digest_preferences(
			isset( $preferences['digests']['daily'] ) ? $preferences['digests']['daily'] : []
		);
	}

	$subjects = is_array( $preferences ) && isset( $preferences['subjects'] ) && is_array( $preferences['subjects'] ) ? $preferences['subjects'] : [];
	foreach ( $defaults['subjects'] as $key => $value ) {
		$sanitized['subjects'][ $key ] = ! empty( $subjects[ $key ] );
	}

	$events = is_array( $preferences ) && isset( $preferences['events'] ) && is_array( $preferences['events'] ) ? $preferences['events'] : [];
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
function alpaistr_get_available_notification_channels() {
	$channels  = alpaistr_get_notification_channel_registry();
	$available = [];

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
function alpaistr_update_notification_preferences_for_user( $user_id, $preferences ) {
	$email_preferences = alpaistr_get_notification_email_channel_preferences( is_array( $preferences ) ? $preferences : [] );
	$override          = isset( $email_preferences['address_override'] ) ? trim( (string) $email_preferences['address_override'] ) : '';

	if ( '' !== $override && ! is_email( $override ) ) {
		return new WP_Error(
			'alpaca_invalid_notification_email_override',
			esc_html__( 'Enter a valid notification email address or leave the override blank.', 'alpaca-issue-tracker' )
		);
	}

	$sanitized = alpaistr_sanitize_notification_preferences( $preferences );
	if ( isset( $sanitized['channels']['email']['address_override'] ) ) {
		$profile_email = alpaistr_get_notification_profile_email( $user_id );
		$override      = trim( (string) $sanitized['channels']['email']['address_override'] );

		if ( '' !== $override && '' !== $profile_email && 0 === strcasecmp( $override, $profile_email ) ) {
			$sanitized['channels']['email']['address_override'] = '';
		}
	}

	$effective_email = alpaistr_get_notification_effective_email( $user_id, $sanitized );
	if (
		(
			alpaistr_notification_channel_is_enabled( $sanitized, 'email' ) ||
			alpaistr_notification_digest_channel_is_enabled( $sanitized, 'email' )
		) &&
		( '' === $effective_email || ! is_email( $effective_email ) )
	) {
		return new WP_Error(
			'alpaca_invalid_notification_delivery_email',
			esc_html__( 'Add a valid email address before enabling email notifications or the daily digest.', 'alpaca-issue-tracker' )
		);
	}

	update_user_meta( (int) $user_id, 'alpaca_notification_preferences', $sanitized );
	wp_cache_delete( 'notification_preference_user_ids', 'alpaca_notifications' );

	if ( function_exists( 'alpaistr_sync_notification_daily_digest_schedule' ) ) {
		alpaistr_sync_notification_daily_digest_schedule( (int) $user_id, $sanitized );
	}

	return alpaistr_get_notification_preferences_for_user( $user_id );
}
