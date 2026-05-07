<?php
/**
 * Notification inbox storage helpers for Alpaca issue activity.
 *
 * @package Alpaca
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Return the inbox schema version.
 *
 * @return string Schema version.
 */
function alpaca_get_notification_inbox_schema_version() {
	return '2';
}

/**
 * Return the inbox table name.
 *
 * @return string Table name.
 */
function alpaca_get_notification_inbox_table_name() {
	global $wpdb;

	return $wpdb->prefix . 'alpaca_inbox';
}

/**
 * Create or update the notification inbox table.
 *
 * @return void
 */
function alpaca_install_notification_inbox_table() {
	global $wpdb;

	$table_name      = alpaca_get_notification_inbox_table_name();
	$charset_collate = $wpdb->get_charset_collate();

	require_once ABSPATH . 'wp-admin/includes/upgrade.php';

	$sql = "CREATE TABLE {$table_name} (
		id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
		user_id bigint(20) unsigned NOT NULL,
		comment_id bigint(20) unsigned NOT NULL,
		issue_id bigint(20) unsigned NOT NULL,
		event_family varchar(64) NOT NULL,
		created_gmt datetime NOT NULL,
		snapshot_payload longtext NULL,
		read_at_gmt datetime NULL DEFAULT NULL,
		PRIMARY KEY  (id),
		UNIQUE KEY user_comment (user_id, comment_id),
		KEY user_read_created (user_id, read_at_gmt, created_gmt),
		KEY issue_created (issue_id, created_gmt)
	) {$charset_collate};";

	dbDelta( $sql );
	update_option( 'alpaca_notification_inbox_schema_version', alpaca_get_notification_inbox_schema_version() );
}

/**
 * Ensure the inbox table exists on upgraded installs.
 *
 * @return void
 */
function alpaca_maybe_install_notification_inbox_table() {
	$installed_version = (string) get_option( 'alpaca_notification_inbox_schema_version', '' );
	if ( alpaca_get_notification_inbox_schema_version() === $installed_version ) {
		return;
	}

	alpaca_install_notification_inbox_table();
}
add_action( 'init', 'alpaca_maybe_install_notification_inbox_table', 5 );

/**
 * Build a durable notification item snapshot.
 *
 * @param array<string, mixed> $event    Notification event payload.
 * @param string[]             $subjects Matched recipient subjects.
 * @return array<string, mixed> Snapshot payload.
 */
function alpaca_get_notification_item_snapshot_payload( $event, $subjects = [] ) {
	$snapshot = is_array( $event ) ? $event : [];

	$snapshot['recipient_subjects'] = array_values(
		array_unique(
			array_filter(
				array_map(
					'sanitize_key',
					is_array( $subjects ) ? $subjects : []
				)
			)
		)
	);

	return $snapshot;
}

/**
 * Encode a durable notification item snapshot as JSON.
 *
 * @param array<string, mixed> $event    Notification event payload.
 * @param string[]             $subjects Matched recipient subjects.
 * @return string Encoded snapshot JSON string.
 */
function alpaca_encode_notification_item_snapshot_payload( $event, $subjects = [] ) {
	$snapshot = alpaca_get_notification_item_snapshot_payload( $event, $subjects );
	$json     = wp_json_encode( $snapshot );

	return is_string( $json ) ? $json : '';
}

/**
 * Insert or update an inbox row for a recipient and event.
 *
 * @param int                  $user_id  User ID.
 * @param array<string, mixed> $event    Notification event payload.
 * @param string[]             $subjects Matched recipient subjects.
 * @return bool True when the write succeeded.
 */
function alpaca_create_notification_inbox_item( $user_id, $event, $subjects = [] ) {
	global $wpdb;

	$user_id      = absint( $user_id );
	$comment_id   = isset( $event['comment_id'] ) ? absint( $event['comment_id'] ) : 0;
	$issue_id     = isset( $event['issue']['id'] ) ? absint( $event['issue']['id'] ) : 0;
	$event_family = isset( $event['event_family'] ) ? sanitize_key( (string) $event['event_family'] ) : '';
	$created_gmt  = current_time( 'mysql', true );

	if ( isset( $event['timestamp'] ) && is_string( $event['timestamp'] ) ) {
		$timestamp = strtotime( $event['timestamp'] );
		if ( false !== $timestamp ) {
			$created_gmt = gmdate( 'Y-m-d H:i:s', $timestamp );
		}
	}

	if ( $user_id <= 0 || $comment_id <= 0 || $issue_id <= 0 || '' === $event_family ) {
		return false;
	}

	$table_name       = alpaca_get_notification_inbox_table_name();
	$snapshot_payload = alpaca_encode_notification_item_snapshot_payload( $event, $subjects );

	// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- This insert intentionally writes one inbox row per recipient event.
	$result = $wpdb->query(
		$wpdb->prepare(
			'INSERT INTO %i ( user_id, comment_id, issue_id, event_family, created_gmt, snapshot_payload ) VALUES ( %d, %d, %d, %s, %s, %s ) ON DUPLICATE KEY UPDATE issue_id = VALUES(issue_id), event_family = VALUES(event_family), created_gmt = VALUES(created_gmt), snapshot_payload = VALUES(snapshot_payload)',
			$table_name,
			$user_id,
			$comment_id,
			$issue_id,
			$event_family,
			$created_gmt,
			$snapshot_payload
		)
	);

	return false !== $result;
}

/**
 * Persist a notification item for a resolved recipient.
 *
 * @param array<string, mixed> $recipient Notification recipient.
 * @param array<string, mixed> $event     Notification event payload.
 * @return bool True when the item was written successfully.
 */
function alpaca_capture_notification_item_for_recipient( $recipient, $event ) {
	$user_id  = isset( $recipient['user_id'] ) ? absint( $recipient['user_id'] ) : 0;
	$subjects = isset( $recipient['subjects'] ) && is_array( $recipient['subjects'] ) ? $recipient['subjects'] : [];

	if ( $user_id <= 0 ) {
		return false;
	}

	return alpaca_create_notification_inbox_item( $user_id, $event, $subjects );
}

/**
 * Decode a stored notification item snapshot.
 *
 * @param array<string, mixed> $row Inbox row.
 * @return array<string, mixed> Snapshot payload.
 */
function alpaca_get_notification_item_snapshot_from_row( $row ) {
	$snapshot_payload = isset( $row['snapshot_payload'] ) ? (string) $row['snapshot_payload'] : '';
	if ( '' === $snapshot_payload ) {
		return [];
	}

	$snapshot = json_decode( $snapshot_payload, true );

	return is_array( $snapshot ) ? $snapshot : [];
}

/**
 * Return the unread inbox count for a user.
 *
 * @param int $user_id User ID.
 * @return int Unread count.
 */
function alpaca_get_notification_inbox_unread_count( $user_id ) {
	global $wpdb;

	$user_id = absint( $user_id );
	if ( $user_id <= 0 ) {
		return 0;
	}

	$table_name = alpaca_get_notification_inbox_table_name();

	// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- This count query is intentionally uncached because it tracks per-user unread state.
	$count = $wpdb->get_var(
		$wpdb->prepare(
			'SELECT COUNT(*) FROM %i WHERE user_id = %d AND read_at_gmt IS NULL',
			$table_name,
			$user_id
		)
	);

	return absint( $count );
}

/**
 * Fetch raw inbox rows for a user.
 *
 * @param int                  $user_id User ID.
 * @param array<string, mixed> $args    Query args.
 * @return array<string, mixed> Rows and pagination data.
 */
function alpaca_get_notification_inbox_rows_for_user( $user_id, $args = [] ) {
	global $wpdb;

	$user_id = absint( $user_id );
	if ( $user_id <= 0 ) {
		return [
			'rows'        => [],
			'total_items' => 0,
			'total_pages' => 0,
			'page'        => 1,
			'per_page'    => 20,
		];
	}

	$page     = isset( $args['page'] ) ? max( 1, absint( $args['page'] ) ) : 1;
	$per_page = isset( $args['per_page'] ) ? max( 1, min( 50, absint( $args['per_page'] ) ) ) : 20;
	$filter   = isset( $args['filter'] ) ? sanitize_key( (string) $args['filter'] ) : 'unread';
	$offset   = ( $page - 1 ) * $per_page;

	$table_name = alpaca_get_notification_inbox_table_name();

	if ( 'unread' === $filter ) {
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- This count query is intentionally uncached because it tracks per-user unread state.
		$total_items = (int) $wpdb->get_var(
			$wpdb->prepare(
				'SELECT COUNT(*) FROM %i WHERE user_id = %d AND read_at_gmt IS NULL',
				$table_name,
				$user_id
			)
		);

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- This list query is intentionally uncached because inbox state is user-specific and mutable.
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				'SELECT id, user_id, comment_id, issue_id, event_family, created_gmt, snapshot_payload, read_at_gmt FROM %i WHERE user_id = %d AND read_at_gmt IS NULL ORDER BY created_gmt DESC, id DESC LIMIT %d OFFSET %d',
				$table_name,
				$user_id,
				$per_page,
				$offset
			),
			ARRAY_A
		);
	} else {
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- This count query is intentionally uncached because it tracks per-user inbox totals.
		$total_items = (int) $wpdb->get_var(
			$wpdb->prepare(
				'SELECT COUNT(*) FROM %i WHERE user_id = %d',
				$table_name,
				$user_id
			)
		);

		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- This list query is intentionally uncached because inbox state is user-specific and mutable.
		$rows = $wpdb->get_results(
			$wpdb->prepare(
				'SELECT id, user_id, comment_id, issue_id, event_family, created_gmt, snapshot_payload, read_at_gmt FROM %i WHERE user_id = %d ORDER BY created_gmt DESC, id DESC LIMIT %d OFFSET %d',
				$table_name,
				$user_id,
				$per_page,
				$offset
			),
			ARRAY_A
		);
	}

	$total_pages = 0;
	if ( $per_page > 0 ) {
		$total_pages = (int) ceil( $total_items / $per_page );
	}

	return [
		'rows'        => is_array( $rows ) ? $rows : [],
		'total_items' => $total_items,
		'total_pages' => $total_pages,
		'page'        => $page,
		'per_page'    => $per_page,
	];
}

/**
 * Build a short inbox preview for a notification event.
 *
 * @param array<string, mixed> $event Notification event.
 * @return string Preview text.
 */
function alpaca_get_notification_inbox_preview_text( $event ) {
	$raw = isset( $event['comment']['raw'] ) ? (string) $event['comment']['raw'] : '';
	if ( '' === trim( $raw ) ) {
		$raw = isset( $event['event_label'] ) ? (string) $event['event_label'] : '';
	}

	$preview = wp_strip_all_tags( $raw );
	$preview = trim( preg_replace( '/\s+/', ' ', $preview ) );

	return wp_html_excerpt( $preview, 180, '&hellip;' );
}

/**
 * Build an inbox payload row directly from a comment object.
 *
 * @param array<string, mixed> $row     Inbox row.
 * @param WP_Comment           $comment Comment object.
 * @return array<string, mixed>|null Item payload or null when the source data is invalid.
 */
function alpaca_prepare_notification_inbox_item_payload_from_comment( $row, $comment ) {
	if ( ! ( $comment instanceof WP_Comment ) ) {
		return null;
	}

	$issue = get_post( (int) $comment->comment_post_ID );
	if ( ! ( $issue instanceof WP_Post ) || 'alpaca_issue' !== $issue->post_type ) {
		return null;
	}

	$event_family = isset( $row['event_family'] ) ? sanitize_key( (string) $row['event_family'] ) : '';
	if ( '' === $event_family ) {
		$event_family = alpaca_get_notification_event_family_for_comment( $comment );
	}

	$tags        = get_comment_meta( $comment->comment_ID, 'alpacaCommentTags', true );
	$attachments = get_comment_meta( $comment->comment_ID, 'alpacaCommentAttachments', true );
	$mentions    = get_comment_meta( $comment->comment_ID, 'alpacaMentionedUsers', true );
	$context     = alpaca_get_comment_notification_context( $comment->comment_ID );
	$actor_id    = (int) $comment->user_id;
	$actor       = $actor_id > 0 ? get_user_by( 'id', $actor_id ) : null;
	$read_at_gmt = isset( $row['read_at_gmt'] ) ? (string) $row['read_at_gmt'] : '';

	$attachments = is_array( $attachments ) ? $attachments : [];
	$attachments = array_values( array_filter( array_map( 'esc_url_raw', $attachments ) ) );
	$mentions    = is_array( $mentions ) ? $mentions : [];

	$event = [
		'comment'      => [
			'raw'      => (string) $comment->comment_content,
			'tags'     => is_array( $tags ) ? $tags : [],
			'context'  => $context,
			'mentions' => $mentions,
		],
		'event_family' => $event_family,
		'event_label'  => alpaca_get_notification_event_label(
			$event_family,
			[
				'tags'    => is_array( $tags ) ? $tags : [],
				'context' => $context,
			]
		),
		'issue'        => [
			'id'    => (int) $issue->ID,
			'slug'  => (string) $issue->post_name,
			'title' => (string) $issue->post_title,
			'url'   => alpaca_get_notification_issue_url( $issue ),
		],
		'actor'        => [
			'id'           => $actor instanceof WP_User ? (int) $actor->ID : 0,
			'display_name' => $actor instanceof WP_User ? (string) $actor->display_name : esc_html__( 'Unknown user', 'alpaca' ),
		],
	];

	return [
		'id'                  => isset( $row['id'] ) ? absint( $row['id'] ) : 0,
		'comment_id'          => (int) $comment->comment_ID,
		'issue_id'            => (int) $issue->ID,
		'event_family'        => $event_family,
		'event_label'         => (string) $event['event_label'],
		'preview'             => alpaca_get_notification_inbox_preview_text( $event ),
		'comment_raw'         => (string) $comment->comment_content,
		'comment_mentions'    => $mentions,
		'comment_attachments' => $attachments,
		'created_gmt'         => isset( $row['created_gmt'] ) ? (string) $row['created_gmt'] : '',
		'read_at_gmt'         => $read_at_gmt,
		'is_unread'           => '' === $read_at_gmt,
		'issue'               => [
			'id'    => (int) $issue->ID,
			'slug'  => (string) $issue->post_name,
			'title' => (string) $issue->post_title,
			'url'   => alpaca_get_notification_issue_url( $issue ),
		],
		'actor'               => [
			'id'           => $actor instanceof WP_User ? (int) $actor->ID : 0,
			'display_name' => $actor instanceof WP_User ? (string) $actor->display_name : esc_html__( 'Unknown user', 'alpaca' ),
			'avatar_url'   => $actor instanceof WP_User ? get_avatar_url( $actor->ID, [ 'size' => 48 ] ) : '',
		],
	];
}

/**
 * Fetch inbox items for a user.
 *
 * @param int                  $user_id User ID.
 * @param array<string, mixed> $args    Query args.
 * @return array<string, mixed> Inbox payload.
 */
function alpaca_get_notification_inbox_items_for_user( $user_id, $args = [] ) {
	$results = alpaca_get_notification_inbox_rows_for_user( $user_id, $args );
	$rows    = isset( $results['rows'] ) && is_array( $results['rows'] ) ? $results['rows'] : [];
	$items   = [];

	if ( ! empty( $rows ) ) {
		$comment_map = [];

		foreach ( $rows as $row ) {
			$comment_id = isset( $row['comment_id'] ) ? absint( $row['comment_id'] ) : 0;
			if ( $comment_id <= 0 || isset( $comment_map[ $comment_id ] ) ) {
				continue;
			}

			$comment = get_comment( $comment_id );
			if ( $comment instanceof WP_Comment && 'issuecomment' === $comment->comment_type ) {
				$comment_map[ $comment_id ] = $comment;
			}
		}

		foreach ( $rows as $row ) {
			$comment_id = isset( $row['comment_id'] ) ? absint( $row['comment_id'] ) : 0;
			if ( $comment_id <= 0 || empty( $comment_map[ $comment_id ] ) ) {
				continue;
			}

			try {
				$item = alpaca_prepare_notification_inbox_item_payload_from_comment( $row, $comment_map[ $comment_id ] );
			} catch ( Throwable $throwable ) {
				continue;
			}

			if ( is_array( $item ) ) {
				$items[] = $item;
			}
		}
	}

	return [
		'items'        => $items,
		'page'         => isset( $results['page'] ) ? absint( $results['page'] ) : 1,
		'per_page'     => isset( $results['per_page'] ) ? absint( $results['per_page'] ) : 20,
		'total_items'  => isset( $results['total_items'] ) ? absint( $results['total_items'] ) : count( $items ),
		'total_pages'  => isset( $results['total_pages'] ) ? absint( $results['total_pages'] ) : 1,
		'unread_count' => alpaca_get_notification_inbox_unread_count( $user_id ),
	];
}

/**
 * Normalize inbox item IDs.
 *
 * @param mixed $item_ids Raw item IDs.
 * @return int[] Item IDs.
 */
function alpaca_get_valid_notification_inbox_item_ids( $item_ids ) {
	if ( ! is_array( $item_ids ) ) {
		return [];
	}

	return array_values( array_unique( array_filter( array_map( 'absint', $item_ids ) ) ) );
}

/**
 * Mark inbox items as read for a user.
 *
 * @param int   $user_id  User ID.
 * @param int[] $item_ids Inbox item IDs.
 * @return int Number of rows changed.
 */
function alpaca_mark_notification_inbox_items_read( $user_id, $item_ids ) {
	global $wpdb;

	$user_id  = absint( $user_id );
	$item_ids = alpaca_get_valid_notification_inbox_item_ids( $item_ids );
	if ( $user_id <= 0 || empty( $item_ids ) ) {
		return 0;
	}

	$table_name  = alpaca_get_notification_inbox_table_name();
	$read_at_gmt = current_time( 'mysql', true );
	$updated     = 0;

	foreach ( $item_ids as $item_id ) {
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- This mutation intentionally updates one inbox row for the current user.
		$result = $wpdb->update(
			$table_name,
			[
				'read_at_gmt' => $read_at_gmt,
			],
			[
				'id'      => $item_id,
				'user_id' => $user_id,
			],
			[
				'%s',
			],
			[
				'%d',
				'%d',
			]
		);

		if ( false !== $result ) {
			$updated += (int) $result;
		}
	}

	return $updated;
}

/**
 * Mark inbox items as unread for a user.
 *
 * @param int   $user_id  User ID.
 * @param int[] $item_ids Inbox item IDs.
 * @return int Number of rows changed.
 */
function alpaca_mark_notification_inbox_items_unread( $user_id, $item_ids ) {
	global $wpdb;

	$user_id  = absint( $user_id );
	$item_ids = alpaca_get_valid_notification_inbox_item_ids( $item_ids );
	if ( $user_id <= 0 || empty( $item_ids ) ) {
		return 0;
	}

	$table_name = alpaca_get_notification_inbox_table_name();
	$updated    = 0;

	foreach ( $item_ids as $item_id ) {
		// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- This mutation intentionally updates one inbox row for the current user.
		$result = $wpdb->update(
			$table_name,
			[
				'read_at_gmt' => null,
			],
			[
				'id'      => $item_id,
				'user_id' => $user_id,
			],
			[
				'%s',
			],
			[
				'%d',
				'%d',
			]
		);

		if ( false !== $result ) {
			$updated += (int) $result;
		}
	}

	return $updated;
}

/**
 * Mark all unread inbox items as read for a user.
 *
 * @param int $user_id User ID.
 * @return int Number of rows changed.
 */
function alpaca_mark_all_notification_inbox_items_read( $user_id ) {
	global $wpdb;

	$user_id = absint( $user_id );
	if ( $user_id <= 0 ) {
		return 0;
	}

	$table_name = alpaca_get_notification_inbox_table_name();

	// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- This mutation intentionally updates all unread inbox rows for the current user.
	$result = $wpdb->query(
		$wpdb->prepare(
			'UPDATE %i SET read_at_gmt = %s WHERE user_id = %d AND read_at_gmt IS NULL',
			$table_name,
			current_time( 'mysql', true ),
			$user_id
		)
	);

	return false !== $result ? (int) $result : 0;
}
