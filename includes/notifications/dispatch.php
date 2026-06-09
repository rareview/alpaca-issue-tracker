<?php
/**
 * Notification dispatch helpers for Alpaca Issue Tracker issue activity emails.
 *
 * @package AlpacaIssueTracker
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Synchronize comment attachment metadata by removing empty values.
 *
 * @param int $comment_id Comment ID.
 * @return string[] Attachment URLs.
 */
function alpaistr_sync_comment_attachments_meta( $comment_id ) {
	$comment_id  = (int) $comment_id;
	$attachments = get_comment_meta( $comment_id, 'alpacaCommentAttachments', true );

	if ( ! is_array( $attachments ) ) {
		delete_comment_meta( $comment_id, 'alpacaCommentAttachments' );
		return [];
	}

	$attachments = array_map( 'esc_url_raw', $attachments );
	$attachments = array_values( array_filter( $attachments ) );

	if ( empty( $attachments ) ) {
		delete_comment_meta( $comment_id, 'alpacaCommentAttachments' );
		return [];
	}

	update_comment_meta( $comment_id, 'alpacaCommentAttachments', $attachments );

	return $attachments;
}

/**
 * Resolve enabled delivery routes for a recipient.
 *
 * @param array<string, mixed> $recipient Notification recipient.
 * @param array<string, mixed> $event     Notification event.
 * @return array<int, array<string, mixed>> Recipient routes.
 */
function alpaistr_get_notification_recipient_routes( $recipient, $event ) {
	$user_id = isset( $recipient['user_id'] ) ? (int) $recipient['user_id'] : 0;
	if ( $user_id <= 0 ) {
		return [];
	}

	$preferences    = isset( $recipient['preferences'] ) && is_array( $recipient['preferences'] ) ? $recipient['preferences'] : alpaistr_get_notification_preferences_for_user( $user_id );
	$channels       = alpaistr_get_notification_channel_registry();
	$channel_status = alpaistr_get_notification_channel_status_for_user( $user_id, $preferences );
	$routes         = [];

	foreach ( $channels as $channel_key => $channel ) {
		if ( empty( $channel['is_available'] ) || ! alpaistr_notification_channel_is_enabled( $preferences, $channel_key ) ) {
			continue;
		}

		if ( 'email' === $channel_key ) {
			$email = isset( $channel_status[ $channel_key ]['effective_address'] ) ? (string) $channel_status[ $channel_key ]['effective_address'] : '';
			if ( '' === $email || ! is_email( $email ) ) {
				continue;
			}

			$routes[] = [
				'channel'   => $channel_key,
				'transport' => isset( $channel['transport'] ) ? (string) $channel['transport'] : $channel_key,
				'address'   => $email,
			];
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
 * Determine whether a notification transport requires a rendered message body.
 *
 * @param string $transport Transport key.
 * @return bool True when the transport requires a rendered message.
 */
function alpaistr_notification_transport_requires_message( $transport ) {
	$transport = sanitize_key( (string) $transport );
	$required  = in_array( $transport, [ 'email' ], true );

	/**
	 * Filter whether a notification transport requires a rendered message payload.
	 *
	 * @param bool   $required  Whether the transport requires a message payload.
	 * @param string $transport Transport key.
	 */
	return (bool) apply_filters( 'alpaistr_notification_transport_requires_message', $required, $transport );
}

/**
 * Send a notification through the email transport.
 *
 * @param array<string, mixed> $route   Delivery route.
 * @param array<string, mixed> $message Notification message.
 * @return bool True on success.
 */
function alpaistr_send_notification_email_route( $route, $message ) {
	$address = isset( $route['address'] ) ? (string) $route['address'] : '';

	return alpaistr_send_notification_html_email( $address, $message );
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
function alpaistr_get_notification_message_for_route( $message, $route, $recipient, $event ) {
	$route_message = apply_filters( 'alpaca_notification_route_message', $message, $route, $recipient, $event );

	return is_array( $route_message ) ? $route_message : [];
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
function alpaistr_dispatch_notification_route( $route, $recipient, $event, $message ) {
	$transport = isset( $route['transport'] ) ? (string) $route['transport'] : '';
	$handled   = apply_filters( 'alpaca_notification_route_dispatch', null, $route, $recipient, $event, $message );
	if ( is_bool( $handled ) ) {
		return $handled;
	}

	if ( 'email' === $transport ) {
		return alpaistr_send_notification_email_route( $route, $message );
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
function alpaistr_send_notifications_for_event( $event, $template = null ) {
	$event = apply_filters( 'alpaca_notifications_event', $event );
	if ( ! is_array( $event ) || empty( $event['comment_id'] ) ) {
		return;
	}

	$recipients = alpaistr_resolve_notification_recipients( $event );
	$recipients = apply_filters( 'alpaca_notifications_recipients', $recipients, $event );
	if ( empty( $recipients ) || ! is_array( $recipients ) ) {
		return;
	}

	$message    = null;
	$transports = apply_filters( 'alpaca_notifications_transports', [ 'email' ], $event, $recipients, [] );
	if ( ! is_array( $transports ) ) {
		return;
	}

	foreach ( $recipients as $recipient ) {
		if ( alpaistr_notification_builtin_inbox_is_enabled() ) {
			alpaistr_capture_notification_item_for_recipient( $recipient, $event );
		}

		$routes = alpaistr_get_notification_recipient_routes( $recipient, $event );
		if ( empty( $routes ) ) {
			continue;
		}

		foreach ( $routes as $route ) {
			$transport = isset( $route['transport'] ) ? (string) $route['transport'] : '';
			if ( '' === $transport || ! in_array( $transport, $transports, true ) ) {
				continue;
			}

			$route_message = [];
			if ( alpaistr_notification_transport_requires_message( $transport ) ) {
				if ( ! is_array( $message ) ) {
					$message = alpaistr_render_notification_message( $event, $template );
					$message = apply_filters( 'alpaca_notifications_message', $message, $event, $recipients );
				}

				if ( ! is_array( $message ) || empty( $message['subject'] ) || empty( $message['html'] ) ) {
					continue;
				}

				$route_message = alpaistr_get_notification_message_for_route( $message, $route, $recipient, $event );
				if ( empty( $route_message['subject'] ) || empty( $route_message['html'] ) ) {
					continue;
				}
			}

			$sent = alpaistr_dispatch_notification_route( $route, $recipient, $event, $route_message );

			if ( $sent ) {
				do_action( 'alpaca_notifications_sent', $recipient, $event, $route_message );
			} else {
				do_action( 'alpaca_notifications_failed', $recipient, $event, $route_message );
			}
		}
	}
}

/**
 * Sync attachment meta, mentions, and dispatch notifications after a comment
 * is fully processed by the REST controller (meta already saved at this point).
 *
 * @param WP_Comment $comment  Inserted or updated comment object.
 * @param mixed      $request  REST request (unused, required by hook signature).
 * @param bool       $creating True on insert, false on update.
 * @return void
 */
function alpaistr_handle_rest_insert_comment_notifications( $comment, $request, $creating ) {
	if ( ! ( $comment instanceof WP_Comment ) ) {
		return;
	}

	alpaistr_sync_comment_attachments_meta( $comment->comment_ID );

	if ( ! $creating ) {
		return;
	}

	if ( 'issuecomment' !== $comment->comment_type ) {
		return;
	}

	alpaistr_sync_comment_mentions( $comment->comment_ID );

	if ( '1' !== (string) $comment->comment_approved && 1 !== (int) $comment->comment_approved ) {
		return;
	}

	$event = alpaistr_get_notification_event_from_comment( $comment );
	if ( ! is_array( $event ) ) {
		return;
	}

	alpaistr_send_notifications_for_event( $event );
}
add_action( 'rest_after_insert_comment', 'alpaistr_handle_rest_insert_comment_notifications', 20, 3 );

/**
 * Sync mentions and dispatch notifications for issuecomments inserted outside
 * the REST API (Abilities API, WP-CLI, direct PHP, etc.).
 *
 * REST-created comments are handled by alpaistr_handle_rest_insert_comment_notifications
 * via rest_after_insert_comment, which fires after comment meta is fully saved.
 * wp_insert_comment fires before that meta is written, so we skip REST requests
 * here to avoid sending notifications with incomplete data.
 *
 * @param int        $comment_id Comment ID.
 * @param WP_Comment $comment    Comment object.
 * @return void
 */
function alpaistr_handle_new_comment_notifications( $comment_id, $comment ) {
	if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
		return;
	}

	if ( 'issuecomment' !== $comment->comment_type ) {
		return;
	}

	alpaistr_sync_comment_mentions( $comment_id );

	if ( '1' !== (string) $comment->comment_approved && 1 !== (int) $comment->comment_approved ) {
		return;
	}

	$event = alpaistr_get_notification_event_from_comment( $comment );
	if ( ! is_array( $event ) ) {
		return;
	}

	alpaistr_send_notifications_for_event( $event );
}
add_action( 'wp_insert_comment', 'alpaistr_handle_new_comment_notifications', 20, 2 );
