<?php
/**
 * Alpaca REST API: Notification Preferences and Template Endpoints.
 *
 * @package Alpaca
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register notification-related REST endpoints.
 *
 * @return void
 */
function alpaca_register_notification_endpoints() {
	register_rest_route(
		'alpaca/v1',
		'/notification-preferences',
		array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => 'alpaca_get_notification_preferences_callback',
				'permission_callback' => function () {
					return \Alpaca\Inc\Helpers::user_can( 'notification_preferences' );
				},
			),
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => 'alpaca_update_notification_preferences_callback',
				'permission_callback' => function ( WP_REST_Request $request ) {
					return \Alpaca\Inc\Helpers::validate_rest_nonce_permission( $request, 'notification_preferences' );
				},
			),
		)
	);

	register_rest_route(
		'alpaca/v1',
		'/notification-inbox',
		array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => 'alpaca_get_notification_inbox_callback',
				'permission_callback' => function () {
					return \Alpaca\Inc\Helpers::user_can( 'notification_inbox' );
				},
			),
		)
	);

	register_rest_route(
		'alpaca/v1',
		'/notification-inbox/count',
		array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => 'alpaca_get_notification_inbox_count_callback',
				'permission_callback' => function () {
					return \Alpaca\Inc\Helpers::user_can( 'notification_inbox' );
				},
			),
		)
	);

	register_rest_route(
		'alpaca/v1',
		'/notification-inbox/mark-read',
		array(
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => 'alpaca_mark_notification_inbox_read_callback',
				'permission_callback' => function ( WP_REST_Request $request ) {
					return \Alpaca\Inc\Helpers::validate_rest_nonce_permission( $request, 'notification_inbox' );
				},
			),
		)
	);

	register_rest_route(
		'alpaca/v1',
		'/notification-inbox/mark-unread',
		array(
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => 'alpaca_mark_notification_inbox_unread_callback',
				'permission_callback' => function ( WP_REST_Request $request ) {
					return \Alpaca\Inc\Helpers::validate_rest_nonce_permission( $request, 'notification_inbox' );
				},
			),
		)
	);

	register_rest_route(
		'alpaca/v1',
		'/notification-inbox/mark-all-read',
		array(
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => 'alpaca_mark_all_notification_inbox_read_callback',
				'permission_callback' => function ( WP_REST_Request $request ) {
					return \Alpaca\Inc\Helpers::validate_rest_nonce_permission( $request, 'notification_inbox' );
				},
			),
		)
	);

	register_rest_route(
		'alpaca/v1',
		'/notification-template',
		array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => 'alpaca_get_notification_template_callback',
				'permission_callback' => function () {
					return \Alpaca\Inc\Helpers::user_can( 'notification_template_manage' );
				},
			),
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => 'alpaca_update_notification_template_callback',
				'permission_callback' => function ( WP_REST_Request $request ) {
					return \Alpaca\Inc\Helpers::validate_rest_nonce_permission( $request, 'notification_template_manage' );
				},
			),
		)
	);

	register_rest_route(
		'alpaca/v1',
		'/notification-template/preview',
		array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'alpaca_preview_notification_template_callback',
			'permission_callback' => function ( WP_REST_Request $request ) {
				return \Alpaca\Inc\Helpers::validate_rest_nonce_permission( $request, 'notification_template_manage' );
			},
		)
	);

	register_rest_route(
		'alpaca/v1',
		'/notification-template/test',
		array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'alpaca_test_notification_template_callback',
			'permission_callback' => function ( WP_REST_Request $request ) {
				return \Alpaca\Inc\Helpers::validate_rest_nonce_permission( $request, 'notification_template_manage' );
			},
		)
	);

	register_rest_route(
		'alpaca/v1',
		'/notification-template/reset',
		array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'alpaca_reset_notification_template_callback',
			'permission_callback' => function ( WP_REST_Request $request ) {
				return \Alpaca\Inc\Helpers::validate_rest_nonce_permission( $request, 'notification_template_manage' );
			},
		)
	);
}
add_action( 'rest_api_init', 'alpaca_register_notification_endpoints' );

/**
 * Read JSON params from a REST request with fallback to generic params.
 *
 * @param WP_REST_Request $request Request object.
 * @return array<string, mixed> Request params.
 */
function alpaca_get_notification_request_params( WP_REST_Request $request ) {
	$params = $request->get_json_params();
	if ( ! is_array( $params ) ) {
		$params = $request->get_params();
	}

	return is_array( $params ) ? $params : array();
}

/**
 * Build the REST response payload for notification preferences.
 *
 * @param int $user_id User ID.
 * @return array<string, mixed> REST payload.
 */
function alpaca_get_notification_preferences_payload( $user_id ) {
	$preferences    = alpaca_get_notification_preferences_for_user( $user_id );
	$channel_status = alpaca_get_notification_channel_status_for_user( $user_id, $preferences );

	return array(
		'preferences'        => $preferences,
		'available_channels' => alpaca_get_available_notification_channels(),
		'channel_status'     => $channel_status,
	);
}

/**
 * Handle GET notification preferences.
 *
 * @return WP_REST_Response REST response.
 */
function alpaca_get_notification_preferences_callback() {
	return alpaca_rest_response( '', alpaca_get_notification_preferences_payload( get_current_user_id() ), 200 );
}

/**
 * Build query args for inbox REST requests.
 *
 * @param WP_REST_Request $request REST request.
 * @return array<string, mixed> Inbox query args.
 */
function alpaca_get_notification_inbox_query_args( WP_REST_Request $request ) {
	$page     = absint( $request->get_param( 'page' ) );
	$per_page = absint( $request->get_param( 'per_page' ) );
	$filter   = sanitize_key( (string) $request->get_param( 'filter' ) );

	if ( $page < 1 ) {
		$page = 1;
	}

	if ( $per_page < 1 ) {
		$per_page = 20;
	}

	if ( $per_page > 50 ) {
		$per_page = 50;
	}

	if ( ! in_array( $filter, array( 'all', 'unread' ), true ) ) {
		$filter = 'unread';
	}

	return array(
		'page'     => $page,
		'per_page' => $per_page,
		'filter'   => $filter,
	);
}

/**
 * Handle GET inbox requests.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response REST response.
 */
function alpaca_get_notification_inbox_callback( WP_REST_Request $request ) {
	$args = alpaca_get_notification_inbox_query_args( $request );

	return alpaca_rest_response( '', alpaca_get_notification_inbox_items_for_user( get_current_user_id(), $args ), 200 );
}

/**
 * Handle GET inbox unread count requests.
 *
 * @return WP_REST_Response REST response.
 */
function alpaca_get_notification_inbox_count_callback() {
	return alpaca_rest_response(
		'',
		array(
			'unread_count' => alpaca_get_notification_inbox_unread_count( get_current_user_id() ),
		),
		200
	);
}

/**
 * Handle POST mark-read requests for inbox items.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response REST response.
 */
function alpaca_mark_notification_inbox_read_callback( WP_REST_Request $request ) {
	$params   = alpaca_get_notification_request_params( $request );
	$item_ids = isset( $params['item_ids'] ) ? alpaca_get_valid_notification_inbox_item_ids( $params['item_ids'] ) : array();

	alpaca_mark_notification_inbox_items_read( get_current_user_id(), $item_ids );

	return alpaca_rest_response(
		'',
		array(
			'unread_count' => alpaca_get_notification_inbox_unread_count( get_current_user_id() ),
		),
		200
	);
}

/**
 * Handle POST mark-unread requests for inbox items.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response REST response.
 */
function alpaca_mark_notification_inbox_unread_callback( WP_REST_Request $request ) {
	$params   = alpaca_get_notification_request_params( $request );
	$item_ids = isset( $params['item_ids'] ) ? alpaca_get_valid_notification_inbox_item_ids( $params['item_ids'] ) : array();

	alpaca_mark_notification_inbox_items_unread( get_current_user_id(), $item_ids );

	return alpaca_rest_response(
		'',
		array(
			'unread_count' => alpaca_get_notification_inbox_unread_count( get_current_user_id() ),
		),
		200
	);
}

/**
 * Handle POST mark-all-read requests for inbox items.
 *
 * @return WP_REST_Response REST response.
 */
function alpaca_mark_all_notification_inbox_read_callback() {
	alpaca_mark_all_notification_inbox_items_read( get_current_user_id() );

	return alpaca_rest_response(
		'',
		array(
			'unread_count' => alpaca_get_notification_inbox_unread_count( get_current_user_id() ),
		),
		200
	);
}

/**
 * Handle POST notification preferences.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response REST response.
 */
function alpaca_update_notification_preferences_callback( WP_REST_Request $request ) {
	$params      = alpaca_get_notification_request_params( $request );
	$preferences = isset( $params['preferences'] ) && is_array( $params['preferences'] ) ? $params['preferences'] : array();
	$user_id     = get_current_user_id();

	$updated = alpaca_update_notification_preferences_for_user( $user_id, $preferences );
	if ( is_wp_error( $updated ) ) {
		return alpaca_rest_response(
			'',
			array(
				'success' => false,
				'message' => $updated->get_error_message(),
			),
			400
		);
	}

	return alpaca_rest_response( '', alpaca_get_notification_preferences_payload( $user_id ), 200 );
}

/**
 * Build the REST payload for the notification email template.
 *
 * @return array<string, mixed> Template payload.
 */
function alpaca_get_notification_template_payload() {
	$template = alpaca_get_notification_email_template();

	return array(
		'subject'          => $template['subject'],
		'body'             => $template['body'],
		'template_context' => isset( $template['context'] ) ? $template['context'] : array(),
	);
}

/**
 * Handle GET notification template.
 *
 * @return WP_REST_Response REST response.
 */
function alpaca_get_notification_template_callback() {
	return alpaca_rest_response( '', alpaca_get_notification_template_payload(), 200 );
}

/**
 * Handle POST notification template updates.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response REST response.
 */
function alpaca_update_notification_template_callback( WP_REST_Request $request ) {
	$params  = alpaca_get_notification_request_params( $request );
	$subject = isset( $params['subject'] ) ? (string) $params['subject'] : '';
	$body    = isset( $params['body'] ) ? (string) $params['body'] : '';
	$context = isset( $params['templateContext'] ) && is_array( $params['templateContext'] ) ? $params['templateContext'] : array();
	$saved   = alpaca_update_notification_email_template( $subject, $body, $context );

	if ( is_wp_error( $saved ) ) {
		return alpaca_rest_response(
			'',
			array(
				'success' => false,
				'message' => $saved->get_error_message(),
			),
			400
		);
	}

	return alpaca_rest_response( '', alpaca_get_notification_template_payload(), 200 );
}

/**
 * Reset the notification template to its default values.
 *
 * @return WP_REST_Response REST response.
 */
function alpaca_reset_notification_template_callback() {
	$reset = alpaca_reset_notification_email_template();

	if ( is_wp_error( $reset ) ) {
		return alpaca_rest_response(
			'',
			array(
				'success' => false,
				'message' => $reset->get_error_message(),
			),
			400
		);
	}

	return alpaca_rest_response( '', alpaca_get_notification_template_payload(), 200 );
}

/**
 * Handle notification template preview requests.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response REST response.
 */
function alpaca_preview_notification_template_callback( WP_REST_Request $request ) {
	$params  = alpaca_get_notification_request_params( $request );
	$subject = isset( $params['subject'] ) ? (string) $params['subject'] : alpaca_get_notification_email_subject_template_default();
	$body    = isset( $params['body'] ) ? (string) $params['body'] : alpaca_get_notification_email_body_template_default();
	$context = isset( $params['templateContext'] ) && is_array( $params['templateContext'] ) ? $params['templateContext'] : array();
	$body    = alpaca_sanitize_notification_email_body_template( $body );

	if ( is_wp_error( $body ) ) {
		return alpaca_rest_response(
			'',
			array(
				'success' => false,
				'message' => $body->get_error_message(),
			),
			400
		);
	}

	$message = alpaca_render_notification_message(
		alpaca_get_notification_sample_event(),
		array(
			'subject' => alpaca_sanitize_notification_email_subject_template( $subject ),
			'body'    => $body,
			'context' => $context,
		)
	);

	return alpaca_rest_response( '', $message, 200 );
}

/**
 * Handle notification template test sends.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response REST response.
 */
function alpaca_test_notification_template_callback( WP_REST_Request $request ) {
	$current_user = wp_get_current_user();
	if ( ! ( $current_user instanceof WP_User ) || ! $current_user->exists() ) {
		return alpaca_rest_response(
			'',
			array(
				'success' => false,
				'message' => esc_html__( 'Could not determine the current user.', 'alpaca' ),
			),
			400
		);
	}

	$email = (string) $current_user->user_email;
	if ( '' === $email || ! is_email( $email ) ) {
		return alpaca_rest_response(
			'',
			array(
				'success' => false,
				'message' => esc_html__( 'Your WordPress profile does not have a valid email address.', 'alpaca' ),
			),
			400
		);
	}

	$params  = alpaca_get_notification_request_params( $request );
	$subject = isset( $params['subject'] ) ? (string) $params['subject'] : alpaca_get_notification_email_subject_template_default();
	$body    = isset( $params['body'] ) ? (string) $params['body'] : alpaca_get_notification_email_body_template_default();
	$context = isset( $params['templateContext'] ) && is_array( $params['templateContext'] ) ? $params['templateContext'] : array();
	$body    = alpaca_sanitize_notification_email_body_template( $body );

	if ( is_wp_error( $body ) ) {
		return alpaca_rest_response(
			'',
			array(
				'success' => false,
				'message' => $body->get_error_message(),
			),
			400
		);
	}

	$message = alpaca_render_notification_message(
		alpaca_get_notification_sample_event(),
		array(
			'subject' => alpaca_sanitize_notification_email_subject_template( $subject ),
			'body'    => $body,
			'context' => $context,
		)
	);

	$sent = wp_mail(
		$email,
		$message['subject'],
		$message['html'],
		array( 'Content-Type: text/html; charset=UTF-8' )
	);

	if ( ! $sent ) {
		return alpaca_rest_response(
			'',
			array(
				'success' => false,
				'message' => esc_html__( 'Test email could not be sent.', 'alpaca' ),
			),
			500
		);
	}

	return alpaca_rest_response(
		'',
		array(
			'success' => true,
			'message' => sprintf(
				/* translators: %s: test email address. */
				esc_html__( 'Test email sent to %s.', 'alpaca' ),
				esc_html( $email )
			),
		),
		200
	);
}
