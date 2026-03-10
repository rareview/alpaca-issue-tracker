<?php
/**
 * Notification dispatch helpers for Alpaca issue activity emails.
 *
 * @package Alpaca
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Send notification messages to resolved recipients.
 *
 * @param array<string, mixed>       $event Notification event.
 * @param array<string, string>|null $template Optional template override.
 * @return void
 */
function alpaca_send_notifications_for_event( $event, $template = null ) {
	$event = apply_filters( 'alpaca_notifications_event', $event );
	if ( ! is_array( $event ) || empty( $event['comment_id'] ) ) {
		return;
	}

	$recipients = alpaca_resolve_notification_recipients( $event );
	$recipients = apply_filters( 'alpaca_notifications_recipients', $recipients, $event );
	if ( empty( $recipients ) || ! is_array( $recipients ) ) {
		return;
	}

	$message = alpaca_render_notification_message( $event, $template );
	$message = apply_filters( 'alpaca_notifications_message', $message, $event, $recipients );
	if ( ! is_array( $message ) || empty( $message['subject'] ) || empty( $message['html'] ) ) {
		return;
	}

	$transports = apply_filters( 'alpaca_notifications_transports', array( 'email' ), $event, $recipients, $message );
	if ( ! is_array( $transports ) || ! in_array( 'email', $transports, true ) ) {
		return;
	}

	$headers = array( 'Content-Type: text/html; charset=UTF-8' );
	foreach ( $recipients as $recipient ) {
		if ( empty( $recipient['email'] ) ) {
			continue;
		}

		$sent = wp_mail( $recipient['email'], $message['subject'], $message['html'], $headers );
		if ( $sent ) {
			do_action( 'alpaca_notifications_sent', $recipient, $event, $message );
		} else {
			do_action( 'alpaca_notifications_failed', $recipient, $event, $message );
		}
	}
}

/**
 * Handle a newly inserted REST comment for notification processing.
 *
 * @param WP_Comment      $comment  Inserted comment object.
 * @param WP_REST_Request $request  REST request.
 * @param bool            $creating Whether this is a create request.
 * @return void
 */
function alpaca_handle_rest_insert_comment_notifications( $comment, $request, $creating ) {
	if ( ! $creating ) {
		alpaca_sync_comment_mentions( $comment->comment_ID );
		return;
	}

	if ( ! ( $comment instanceof WP_Comment ) ) {
		return;
	}

	if ( 'issuecomment' !== $comment->comment_type ) {
		return;
	}

	if ( '1' !== (string) $comment->comment_approved && 1 !== (int) $comment->comment_approved ) {
		return;
	}

	alpaca_sync_comment_mentions( $comment->comment_ID );
	$event = alpaca_get_notification_event_from_comment( $comment );
	if ( ! is_array( $event ) ) {
		return;
	}

	alpaca_send_notifications_for_event( $event );
}
add_action( 'rest_after_insert_comment', 'alpaca_handle_rest_insert_comment_notifications', 20, 3 );
