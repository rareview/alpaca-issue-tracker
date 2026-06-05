<?php
/**
 * Daily digest schedule and storage helpers.
 *
 * @package AlpacaIssueTracker
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Return the daily digest schema version.
 *
 * @return string Schema version.
 */
function alpaistr_get_notification_digest_schema_version() {
	return '1';
}

/**
 * Return the digest schedule table name.
 *
 * @return string Table name.
 */
function alpaistr_get_notification_digest_schedule_table_name() {
	global $wpdb;

	return $wpdb->prefix . 'alpaca_notification_digest_schedule';
}

/**
 * Return the digest delivery log table name.
 *
 * @return string Table name.
 */
function alpaistr_get_notification_digest_delivery_log_table_name() {
	global $wpdb;

	return $wpdb->prefix . 'alpaca_notification_digest_delivery';
}

/**
 * Create or update the digest storage tables.
 *
 * @return void
 */
function alpaistr_install_notification_digest_tables() {
	global $wpdb;

	$schedule_table  = alpaistr_get_notification_digest_schedule_table_name();
	$delivery_table  = alpaistr_get_notification_digest_delivery_log_table_name();
	$charset_collate = $wpdb->get_charset_collate();

	require_once ABSPATH . 'wp-admin/includes/upgrade.php';

	$schedule_sql = "CREATE TABLE {$schedule_table} (
		id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
		user_id bigint(20) unsigned NOT NULL,
		digest_key varchar(64) NOT NULL,
		next_run_gmt datetime NOT NULL,
		updated_gmt datetime NOT NULL,
		PRIMARY KEY  (id),
		UNIQUE KEY user_digest (user_id, digest_key),
		KEY next_run (next_run_gmt)
	) {$charset_collate};";

	$delivery_sql = "CREATE TABLE {$delivery_table} (
		id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
		user_id bigint(20) unsigned NOT NULL,
		digest_key varchar(64) NOT NULL,
		channel varchar(64) NOT NULL,
		window_start_gmt datetime NOT NULL,
		window_end_gmt datetime NOT NULL,
		status varchar(20) NOT NULL,
		created_gmt datetime NOT NULL,
		sent_at_gmt datetime NULL DEFAULT NULL,
		PRIMARY KEY  (id),
		UNIQUE KEY digest_window_channel (user_id, digest_key, channel, window_start_gmt, window_end_gmt),
		KEY status_created (status, created_gmt)
	) {$charset_collate};";

	dbDelta( $schedule_sql );
	dbDelta( $delivery_sql );

	update_option( 'alpaistr_notification_digest_schema_version', alpaistr_get_notification_digest_schema_version() );
}

/**
 * Ensure the digest tables exist on upgraded installs.
 *
 * @return void
 */
function alpaistr_maybe_install_notification_digest_tables() {
	$installed_version = (string) get_option( 'alpaistr_notification_digest_schema_version', '' );
	if ( alpaistr_get_notification_digest_schema_version() === $installed_version ) {
		return;
	}

	alpaistr_install_notification_digest_tables();
}
add_action( 'init', 'alpaistr_maybe_install_notification_digest_tables', 5 );

/**
 * Return the daily digest key.
 *
 * @return string Digest key.
 */
function alpaistr_get_notification_daily_digest_key() {
	return 'daily';
}

/**
 * Build a local datetime for a specific digest send time.
 *
 * @param DateTimeImmutable $datetime  Base datetime in the site timezone.
 * @param string            $send_time Normalized send time.
 * @return DateTimeImmutable Datetime at the target send time.
 */
function alpaistr_get_notification_daily_digest_datetime_with_time( DateTimeImmutable $datetime, $send_time ) {
	$parts = explode( ':', (string) $send_time );
	$hour  = isset( $parts[0] ) ? absint( $parts[0] ) : 17;
	$min   = isset( $parts[1] ) ? absint( $parts[1] ) : 0;

	return $datetime->setTime( $hour, $min, 0 );
}

/**
 * Calculate the next daily digest run time in GMT.
 *
 * @param array<string, mixed> $daily_preferences Daily digest preferences.
 * @param string|null          $base_gmt          Optional GMT base datetime.
 * @return string GMT datetime string.
 */
function alpaistr_get_notification_daily_digest_next_run_gmt( $daily_preferences, $base_gmt = null ) {
	$daily_preferences = alpaistr_sanitize_notification_daily_digest_preferences( $daily_preferences );
	$timezone          = wp_timezone();
	$base_datetime     = null;

	if ( is_string( $base_gmt ) && '' !== $base_gmt ) {
		try {
			$base_datetime = new DateTimeImmutable( $base_gmt, new DateTimeZone( 'UTC' ) );
			$base_datetime = $base_datetime->setTimezone( $timezone );
		} catch ( Exception $exception ) {
			$base_datetime = null;
		}
	}

	if ( ! ( $base_datetime instanceof DateTimeImmutable ) ) {
		$base_datetime = new DateTimeImmutable( 'now', $timezone );
	}

	$send_time          = isset( $daily_preferences['send_time'] ) ? (string) $daily_preferences['send_time'] : '17:00';
	$candidate_datetime = alpaistr_get_notification_daily_digest_datetime_with_time( $base_datetime, $send_time );

	if ( $candidate_datetime <= $base_datetime ) {
		$next_day = $base_datetime->modify( '+1 day' );
		if ( $next_day instanceof DateTimeImmutable ) {
			$candidate_datetime = alpaistr_get_notification_daily_digest_datetime_with_time( $next_day, $send_time );
		}
	}

	return $candidate_datetime->setTimezone( new DateTimeZone( 'UTC' ) )->format( 'Y-m-d H:i:s' );
}

/**
 * Delete a user's daily digest schedule row.
 *
 * @param int $user_id User ID.
 * @return void
 */
function alpaistr_delete_notification_daily_digest_schedule( $user_id ) {
	global $wpdb;

	$user_id    = absint( $user_id );
	$digest_key = alpaistr_get_notification_daily_digest_key();
	$table_name = alpaistr_get_notification_digest_schedule_table_name();

	if ( $user_id <= 0 ) {
		return;
	}

	// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- Schedule rows are small, user-specific, and updated on preference save.
	$wpdb->delete(
		$table_name,
		[
			'user_id'    => $user_id,
			'digest_key' => $digest_key,
		],
		[ '%d', '%s' ]
	);
}

/**
 * Sync the current user's daily digest schedule row.
 *
 * @param int                  $user_id      User ID.
 * @param array<string, mixed> $preferences Notification preferences.
 * @return void
 */
function alpaistr_sync_notification_daily_digest_schedule( $user_id, $preferences ) {
	global $wpdb;

	$user_id = absint( $user_id );
	if ( $user_id <= 0 ) {
		return;
	}

	$table_name = alpaistr_get_notification_digest_schedule_table_name();
	$digest_key = alpaistr_get_notification_daily_digest_key();
	$daily      = isset( $preferences['digests']['daily'] ) && is_array( $preferences['digests']['daily'] ) ? $preferences['digests']['daily'] : alpaistr_get_notification_daily_digest_defaults();

	if ( ! alpaistr_notification_preferences_have_enabled_digest_channels( $preferences ) || empty( $daily['enabled'] ) ) {
		alpaistr_delete_notification_daily_digest_schedule( $user_id );
		return;
	}

	$next_run_gmt = alpaistr_get_notification_daily_digest_next_run_gmt( $daily );
	$updated_gmt  = current_time( 'mysql', true );

	// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- Schedule rows are small, user-specific, and updated on preference save.
	$wpdb->query(
		$wpdb->prepare(
			'INSERT INTO %i ( user_id, digest_key, next_run_gmt, updated_gmt ) VALUES ( %d, %s, %s, %s ) ON DUPLICATE KEY UPDATE next_run_gmt = VALUES(next_run_gmt), updated_gmt = VALUES(updated_gmt)',
			$table_name,
			$user_id,
			$digest_key,
			$next_run_gmt,
			$updated_gmt
		)
	);
}

/**
 * Register the cron schedule used by daily digests.
 *
 * @param array<string, array<string, mixed>> $schedules Cron schedules.
 * @return array<string, array<string, mixed>> Cron schedules.
 */
function alpaistr_register_notification_digest_cron_schedule( $schedules ) {
	if ( ! isset( $schedules['alpaca_every_fifteen_minutes'] ) ) {
		$schedules['alpaca_every_fifteen_minutes'] = [
			'interval' => 15 * MINUTE_IN_SECONDS,
			'display'  => esc_html__( 'Every fifteen minutes', 'alpaca-issue-tracker' ),
		];
	}

	return $schedules;
}
add_filter( 'cron_schedules', 'alpaistr_register_notification_digest_cron_schedule' );

/**
 * Ensure the daily digest cron event is scheduled.
 *
 * @return void
 */
function alpaistr_ensure_notification_digest_cron() {
	$scheduled_event = wp_get_scheduled_event( 'alpaca_process_notification_daily_digests' );

	if ( is_object( $scheduled_event ) && 'alpaca_every_fifteen_minutes' !== $scheduled_event->schedule ) {
		wp_clear_scheduled_hook( 'alpaca_process_notification_daily_digests' );
		$scheduled_event = false;
	}

	if ( ! $scheduled_event ) {
		wp_schedule_event( time() + MINUTE_IN_SECONDS, 'alpaca_every_fifteen_minutes', 'alpaca_process_notification_daily_digests' );
	}
}
add_action( 'init', 'alpaistr_ensure_notification_digest_cron', 20 );

/**
 * Attempt to acquire the digest worker lock.
 *
 * @return bool True when the lock was acquired.
 */
function alpaistr_acquire_notification_digest_lock() {
	if ( get_transient( 'alpaca_notification_digest_lock' ) ) {
		return false;
	}

	set_transient( 'alpaca_notification_digest_lock', '1', 10 * MINUTE_IN_SECONDS );

	return true;
}

/**
 * Release the digest worker lock.
 *
 * @return void
 */
function alpaistr_release_notification_digest_lock() {
	delete_transient( 'alpaca_notification_digest_lock' );
}

/**
 * Fetch due daily digest schedule rows.
 *
 * @param string|null $now_gmt Optional GMT datetime.
 * @return array<int, array<string, mixed>> Due rows.
 */
function alpaistr_get_due_notification_digest_schedules( $now_gmt = null ) {
	global $wpdb;

	$table_name = alpaistr_get_notification_digest_schedule_table_name();
	$now_gmt    = is_string( $now_gmt ) && '' !== $now_gmt ? $now_gmt : current_time( 'mysql', true );

	// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- Due schedule resolution must query the current table state on each cron tick.
	$rows = $wpdb->get_results(
		$wpdb->prepare(
			'SELECT id, user_id, digest_key, next_run_gmt, updated_gmt FROM %i WHERE next_run_gmt <= %s ORDER BY next_run_gmt ASC LIMIT 50',
			$table_name,
			$now_gmt
		),
		ARRAY_A
	);

	return is_array( $rows ) ? $rows : [];
}

/**
 * Reserve a digest delivery window before sending.
 *
 * @param int    $user_id          User ID.
 * @param string $digest_key       Digest key.
 * @param string $channel          Channel key.
 * @param string $window_start_gmt Window start in GMT.
 * @param string $window_end_gmt   Window end in GMT.
 * @return bool True when the reservation succeeded.
 */
function alpaistr_reserve_notification_digest_delivery( $user_id, $digest_key, $channel, $window_start_gmt, $window_end_gmt ) {
	global $wpdb;

	$table_name = alpaistr_get_notification_digest_delivery_log_table_name();

	// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- Delivery reservations must be atomic to prevent duplicate sends.
	$result = $wpdb->query(
		$wpdb->prepare(
			'INSERT INTO %i ( user_id, digest_key, channel, window_start_gmt, window_end_gmt, status, created_gmt ) VALUES ( %d, %s, %s, %s, %s, %s, %s )',
			$table_name,
			absint( $user_id ),
			sanitize_key( $digest_key ),
			sanitize_key( $channel ),
			$window_start_gmt,
			$window_end_gmt,
			'pending',
			current_time( 'mysql', true )
		)
	);

	return false !== $result;
}

/**
 * Mark a reserved digest delivery as sent.
 *
 * @param int    $user_id          User ID.
 * @param string $digest_key       Digest key.
 * @param string $channel          Channel key.
 * @param string $window_start_gmt Window start in GMT.
 * @param string $window_end_gmt   Window end in GMT.
 * @return void
 */
function alpaistr_mark_notification_digest_delivery_sent( $user_id, $digest_key, $channel, $window_start_gmt, $window_end_gmt ) {
	global $wpdb;

	$table_name = alpaistr_get_notification_digest_delivery_log_table_name();

	// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- Delivery log rows are updated once after the send succeeds.
	$wpdb->update(
		$table_name,
		[
			'status'      => 'sent',
			'sent_at_gmt' => current_time( 'mysql', true ),
		],
		[
			'user_id'          => absint( $user_id ),
			'digest_key'       => sanitize_key( $digest_key ),
			'channel'          => sanitize_key( $channel ),
			'window_start_gmt' => $window_start_gmt,
			'window_end_gmt'   => $window_end_gmt,
		],
		[ '%s', '%s' ],
		[ '%d', '%s', '%s', '%s', '%s' ]
	);
}

/**
 * Release a reserved digest delivery after a failed send.
 *
 * @param int    $user_id          User ID.
 * @param string $digest_key       Digest key.
 * @param string $channel          Channel key.
 * @param string $window_start_gmt Window start in GMT.
 * @param string $window_end_gmt   Window end in GMT.
 * @return void
 */
function alpaistr_release_notification_digest_delivery( $user_id, $digest_key, $channel, $window_start_gmt, $window_end_gmt ) {
	global $wpdb;

	$table_name = alpaistr_get_notification_digest_delivery_log_table_name();

	// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- Failed delivery reservations are removed so the next cron tick can retry.
	$wpdb->delete(
		$table_name,
		[
			'user_id'          => absint( $user_id ),
			'digest_key'       => sanitize_key( $digest_key ),
			'channel'          => sanitize_key( $channel ),
			'window_start_gmt' => $window_start_gmt,
			'window_end_gmt'   => $window_end_gmt,
		],
		[ '%d', '%s', '%s', '%s', '%s' ]
	);
}
