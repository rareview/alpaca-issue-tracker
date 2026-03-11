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
 * Resolve enabled delivery routes for a recipient.
 *
 * @param array<string, mixed> $recipient Notification recipient.
 * @param array<string, mixed> $event     Notification event.
 * @return array<int, array<string, mixed>> Recipient routes.
 */
function alpaca_get_notification_recipient_routes( $recipient, $event ) {
	$user_id = isset( $recipient['user_id'] ) ? (int) $recipient['user_id'] : 0;
	if ( $user_id <= 0 ) {
		return array();
	}

	$preferences    = isset( $recipient['preferences'] ) && is_array( $recipient['preferences'] ) ? $recipient['preferences'] : alpaca_get_notification_preferences_for_user( $user_id );
	$channels       = alpaca_get_notification_channel_registry();
	$channel_status = alpaca_get_notification_channel_status_for_user( $user_id, $preferences );
	$routes         = array();

	foreach ( $channels as $channel_key => $channel ) {
		if ( empty( $channel['is_available'] ) || ! alpaca_notification_channel_is_enabled( $preferences, $channel_key ) ) {
			continue;
		}

		if ( 'email' === $channel_key ) {
			$email = isset( $channel_status[ $channel_key ]['effective_address'] ) ? (string) $channel_status[ $channel_key ]['effective_address'] : '';
			if ( '' === $email || ! is_email( $email ) ) {
				continue;
			}

			$routes[] = array(
				'channel'   => $channel_key,
				'transport' => isset( $channel['transport'] ) ? (string) $channel['transport'] : $channel_key,
				'address'   => $email,
			);
		}
	}

	/**
	 * Filter resolved delivery routes for a notification recipient.
	 *
	 * @param array<int, array<string, mixed>> $routes     Recipient routes.
	 * @param array<string, mixed>             $recipient  Notification recipient.
	 * @param array<string, mixed>             $event      Notification event.
	 * @param array<string, array<string, mixed>> $channels Registered channels.
	 */
	return apply_filters( 'alpaca_notification_recipient_routes', $routes, $recipient, $event, $channels );
}

/**
 * Send a notification through the email transport.
 *
 * @param array<string, mixed> $route   Delivery route.
 * @param array<string, mixed> $message Notification message.
 * @return bool True on success.
 */
function alpaca_send_notification_email_route( $route, $message ) {
	$address = isset( $route['address'] ) ? (string) $route['address'] : '';
	if ( '' === $address || ! is_email( $address ) ) {
		return false;
	}

	$headers = array( 'Content-Type: text/html; charset=UTF-8' );

	return wp_mail( $address, $message['subject'], $message['html'], $headers );
}

/**
 * Get the notification message payload for a specific delivery route.
 *
 * @param array<string, mixed> $message   Notification message.
 * @param array<string, mixed> $route     Delivery route.
 * @param array<string, mixed> $recipient Notification recipient.
 * @param array<string, mixed> $event     Notification event.
 * @return array<string, mixed> Route-specific message payload.
 */
function alpaca_get_notification_message_for_route( $message, $route, $recipient, $event ) {
	$route_message = apply_filters( 'alpaca_notification_route_message', $message, $route, $recipient, $event );

	return is_array( $route_message ) ? $route_message : array();
}

/**
 * Dispatch a notification to a specific delivery route.
 *
 * @param array<string, mixed> $route     Delivery route.
 * @param array<string, mixed> $recipient Notification recipient.
 * @param array<string, mixed> $event     Notification event.
 * @param array<string, mixed> $message   Notification message.
 * @return bool True on success.
 */
function alpaca_dispatch_notification_route( $route, $recipient, $event, $message ) {
	$transport = isset( $route['transport'] ) ? (string) $route['transport'] : '';
	$handled   = apply_filters( 'alpaca_notification_route_dispatch', null, $route, $recipient, $event, $message );
	if ( is_bool( $handled ) ) {
		return $handled;
	}

	if ( 'email' === $transport ) {
		return alpaca_send_notification_email_route( $route, $message );
	}

	return false;
}

/**
 * Send notification messages to resolved recipients.
 *
 * @param array<string, mixed>       $event    Notification event.
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
	if ( ! is_array( $transports ) ) {
		return;
	}

	foreach ( $recipients as $recipient ) {
		$routes = alpaca_get_notification_recipient_routes( $recipient, $event );
		if ( empty( $routes ) ) {
			continue;
		}

		foreach ( $routes as $route ) {
			$transport = isset( $route['transport'] ) ? (string) $route['transport'] : '';
			if ( '' === $transport || ! in_array( $transport, $transports, true ) ) {
				continue;
			}

			$route_message = alpaca_get_notification_message_for_route( $message, $route, $recipient, $event );
			if ( empty( $route_message['subject'] ) || empty( $route_message['html'] ) ) {
				continue;
			}

			$sent = alpaca_dispatch_notification_route( $route, $recipient, $event, $route_message );

			if ( $sent ) {
				do_action( 'alpaca_notifications_sent', $recipient, $event, $route_message );
			} else {
				do_action( 'alpaca_notifications_failed', $recipient, $event, $route_message );
			}
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
