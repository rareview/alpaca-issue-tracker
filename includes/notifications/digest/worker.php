<?php
/**
 * Daily digest worker helpers.
 *
 * @package Alpaca
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Determine whether a daily digest payload should be sent.
 *
 * @param array<string, mixed> $payload     Structured digest payload.
 * @param int                  $user_id     User ID.
 * @param array<string, mixed> $preferences Notification preferences.
 * @return bool True when the digest should be sent.
 */
function alpaca_should_send_notification_daily_digest_payload( $payload, $user_id, $preferences ) {
	$counts         = isset( $payload['counts'] ) && is_array( $payload['counts'] ) ? $payload['counts'] : array();
	$activity_count = isset( $counts['activity'] ) ? absint( $counts['activity'] ) : 0;
	$new_item_count = isset( $counts['new_items'] ) ? absint( $counts['new_items'] ) : 0;
	$deadline_count = isset( $counts['deadlines'] ) ? absint( $counts['deadlines'] ) : 0;
	$should_send    = ( $activity_count + $new_item_count + $deadline_count ) > 0;

	/**
	 * Filter whether a daily digest payload should be sent.
	 *
	 * @param bool                 $should_send Default send decision.
	 * @param array<string, mixed> $payload     Structured digest payload.
	 * @param int                  $user_id     User ID.
	 * @param array<string, mixed> $preferences Notification preferences.
	 */
	return (bool) apply_filters( 'alpaca_should_send_daily_digest_payload', $should_send, $payload, $user_id, $preferences );
}

/**
 * Process a single due daily digest schedule row.
 *
 * @param array<string, mixed> $row Schedule row.
 * @return void
 */
function alpaca_process_notification_daily_digest_schedule_row( $row ) {
	$user_id        = isset( $row['user_id'] ) ? absint( $row['user_id'] ) : 0;
	$digest_key     = isset( $row['digest_key'] ) ? sanitize_key( (string) $row['digest_key'] ) : '';
	$window_end_gmt = isset( $row['next_run_gmt'] ) ? (string) $row['next_run_gmt'] : '';

	if ( $user_id <= 0 || '' === $digest_key || '' === $window_end_gmt ) {
		return;
	}

	$preferences = alpaca_get_notification_preferences_for_user( $user_id );
	if ( ! alpaca_notification_preferences_have_enabled_digest_channels( $preferences ) ) {
		alpaca_delete_notification_daily_digest_schedule( $user_id );
		return;
	}

	$daily = isset( $preferences['digests']['daily'] ) && is_array( $preferences['digests']['daily'] ) ? $preferences['digests']['daily'] : alpaca_get_notification_daily_digest_defaults();
	if ( empty( $daily['enabled'] ) ) {
		alpaca_delete_notification_daily_digest_schedule( $user_id );
		return;
	}

	$window_start_gmt = gmdate( 'Y-m-d H:i:s', strtotime( $window_end_gmt ) - DAY_IN_SECONDS );
	$payload          = alpaca_build_notification_daily_digest_payload( $user_id, $preferences, $window_start_gmt, $window_end_gmt );
	$template         = alpaca_get_notification_daily_digest_template();
	$should_send      = alpaca_should_send_notification_daily_digest_payload( $payload, $user_id, $preferences );

	if ( $should_send ) {
		foreach ( alpaca_get_notification_digest_supported_channel_keys() as $channel ) {
			if ( ! alpaca_notification_digest_channel_is_enabled( $preferences, $channel ) ) {
				continue;
			}

			if ( ! alpaca_reserve_notification_digest_delivery( $user_id, $digest_key, $channel, $window_start_gmt, $window_end_gmt ) ) {
				continue;
			}

			$sent = alpaca_dispatch_notification_daily_digest_channel( $user_id, $channel, $preferences, $payload, $template );
			if ( $sent ) {
				alpaca_mark_notification_digest_delivery_sent( $user_id, $digest_key, $channel, $window_start_gmt, $window_end_gmt );
			} else {
				alpaca_release_notification_digest_delivery( $user_id, $digest_key, $channel, $window_start_gmt, $window_end_gmt );
			}
		}
	}

	alpaca_sync_notification_daily_digest_schedule( $user_id, $preferences );
}
/**
 * Process all due daily digests.
 *
 * @return void
 */
function alpaca_process_due_notification_daily_digests() {
	if ( ! alpaca_acquire_notification_digest_lock() ) {
		return;
	}

	$rows = alpaca_get_due_notification_digest_schedules();
	foreach ( $rows as $row ) {
		alpaca_process_notification_daily_digest_schedule_row( $row );
	}

	alpaca_release_notification_digest_lock();
}
add_action( 'alpaca_process_notification_daily_digests', 'alpaca_process_due_notification_daily_digests' );
