<?php

/**
 * Alpaca Issue Tracker REST API: Notification Preferences and Template Endpoints.
 *
 * @package AlpacaIssueTracker
 */

use AlpacaIssueTracker\Helpers;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register notification-related REST endpoints.
 *
 * @return void
 */
function alpaistr_register_notification_endpoints() {
	register_rest_route(
		'alpaca/v1',
		'/notification-preferences',
		[
			[
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => 'alpaistr_get_notification_preferences_callback',
				'permission_callback' => function () {
					return Helpers::user_can( 'notification_preferences' );
				},
			],
			[
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => 'alpaistr_update_notification_preferences_callback',
				'permission_callback' => function ( WP_REST_Request $request ) {
					return Helpers::validate_rest_nonce_permission( $request, 'notification_preferences' );
				},
			],
		]
	);

	register_rest_route(
		'alpaca/v1',
		'/notification-inbox',
		[
			[
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => 'alpaistr_get_notification_inbox_callback',
				'permission_callback' => function () {
					return Helpers::user_can( 'notification_inbox' );
				},
			],
		]
	);

	register_rest_route(
		'alpaca/v1',
		'/notification-inbox/count',
		[
			[
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => 'alpaistr_get_notification_inbox_count_callback',
				'permission_callback' => function () {
					return Helpers::user_can( 'notification_inbox' );
				},
			],
		]
	);

	register_rest_route(
		'alpaca/v1',
		'/notification-inbox/mark-read',
		[
			[
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => 'alpaistr_mark_notification_inbox_read_callback',
				'permission_callback' => function ( WP_REST_Request $request ) {
					return Helpers::validate_rest_nonce_permission( $request, 'notification_inbox' );
				},
			],
		]
	);

	register_rest_route(
		'alpaca/v1',
		'/notification-inbox/mark-unread',
		[
			[
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => 'alpaistr_mark_notification_inbox_unread_callback',
				'permission_callback' => function ( WP_REST_Request $request ) {
					return Helpers::validate_rest_nonce_permission( $request, 'notification_inbox' );
				},
			],
		]
	);

	register_rest_route(
		'alpaca/v1',
		'/notification-inbox/mark-all-read',
		[
			[
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => 'alpaistr_mark_all_notification_inbox_read_callback',
				'permission_callback' => function ( WP_REST_Request $request ) {
					return Helpers::validate_rest_nonce_permission( $request, 'notification_inbox' );
				},
			],
		]
	);

	register_rest_route(
		'alpaca/v1',
		'/notification-template',
		[
			[
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => 'alpaistr_get_notification_template_callback',
				'permission_callback' => function () {
					return Helpers::user_can( 'notification_template_manage' );
				},
			],
			[
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => 'alpaistr_update_notification_template_callback',
				'permission_callback' => function ( WP_REST_Request $request ) {
					return Helpers::validate_rest_nonce_permission( $request, 'notification_template_manage' );
				},
			],
		]
	);

	register_rest_route(
		'alpaca/v1',
		'/notification-template/preview',
		[
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'alpaistr_preview_notification_template_callback',
			'permission_callback' => function ( WP_REST_Request $request ) {
				return Helpers::validate_rest_nonce_permission( $request, 'notification_template_manage' );
			},
		]
	);

	register_rest_route(
		'alpaca/v1',
		'/notification-template/test',
		[
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'alpaistr_test_notification_template_callback',
			'permission_callback' => function ( WP_REST_Request $request ) {
				return Helpers::validate_rest_nonce_permission( $request, 'notification_template_manage' );
			},
		]
	);

	register_rest_route(
		'alpaca/v1',
		'/notification-template/reset',
		[
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'alpaistr_reset_notification_template_callback',
			'permission_callback' => function ( WP_REST_Request $request ) {
				return Helpers::validate_rest_nonce_permission( $request, 'notification_template_manage' );
			},
		]
	);

	register_rest_route(
		'alpaca/v1',
		'/notification-digest-template',
		[
			[
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => 'alpaistr_get_notification_digest_template_callback',
				'permission_callback' => function () {
					return Helpers::user_can( 'notification_template_manage' );
				},
			],
			[
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => 'alpaistr_update_notification_digest_template_callback',
				'permission_callback' => function ( WP_REST_Request $request ) {
					return Helpers::validate_rest_nonce_permission( $request, 'notification_template_manage' );
				},
			],
		]
	);

	register_rest_route(
		'alpaca/v1',
		'/notification-digest-template/preview',
		[
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'alpaistr_preview_notification_digest_template_callback',
			'permission_callback' => function ( WP_REST_Request $request ) {
				return Helpers::validate_rest_nonce_permission( $request, 'notification_template_manage' );
			},
		]
	);

	register_rest_route(
		'alpaca/v1',
		'/notification-digest-template/test',
		[
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'alpaistr_test_notification_digest_template_callback',
			'permission_callback' => function ( WP_REST_Request $request ) {
				return Helpers::validate_rest_nonce_permission( $request, 'notification_template_manage' );
			},
		]
	);

	register_rest_route(
		'alpaca/v1',
		'/notification-digest-template/reset',
		[
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'alpaistr_reset_notification_digest_template_callback',
			'permission_callback' => function ( WP_REST_Request $request ) {
				return Helpers::validate_rest_nonce_permission( $request, 'notification_template_manage' );
			},
		]
	);
}
add_action( 'rest_api_init', 'alpaistr_register_notification_endpoints' );

/**
 * Read JSON params from a REST request with fallback to generic params.
 *
 * @param WP_REST_Request $request Request object.
 * @return array<string, mixed> Request params.
 */
function alpaistr_get_notification_request_params( WP_REST_Request $request ) {
	$params = $request->get_json_params();
	if ( ! is_array( $params ) ) {
		$params = $request->get_params();
	}

	return is_array( $params ) ? $params : [];
}

/**
 * Build the REST response payload for notification preferences.
 *
 * @param int $user_id User ID.
 * @return array<string, mixed> REST payload.
 */
function alpaistr_get_notification_preferences_payload( $user_id ) {
	$preferences    = alpaistr_get_notification_preferences_for_user( $user_id );
	$channel_status = alpaistr_get_notification_channel_status_for_user( $user_id, $preferences );

	return [
		'preferences'         => $preferences,
		'available_channels'  => alpaistr_get_available_notification_channels(),
		'channel_status'      => $channel_status,
		'site_timezone_label' => alpaistr_get_notification_site_timezone_label(),
	];
}

/**
 * Handle GET notification preferences.
 *
 * @return WP_REST_Response REST response.
 */
function alpaistr_get_notification_preferences_callback() {
	return alpaistr_rest_response( '', alpaistr_get_notification_preferences_payload( get_current_user_id() ), 200 );
}

/**
 * Build query args for inbox REST requests.
 *
 * @param WP_REST_Request $request REST request.
 * @return array<string, mixed> Inbox query args.
 */
function alpaistr_get_notification_inbox_query_args( WP_REST_Request $request ) {
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

	if ( ! in_array( $filter, [ 'all', 'unread' ], true ) ) {
		$filter = 'unread';
	}

	return [
		'page'     => $page,
		'per_page' => $per_page,
		'filter'   => $filter,
	];
}

/**
 * Handle GET inbox requests.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response REST response.
 */
function alpaistr_get_notification_inbox_callback( WP_REST_Request $request ) {
	$args = alpaistr_get_notification_inbox_query_args( $request );

	return alpaistr_rest_response( '', alpaistr_get_notification_inbox_items_for_user( get_current_user_id(), $args ), 200 );
}

/**
 * Handle GET inbox unread count requests.
 *
 * @return WP_REST_Response REST response.
 */
function alpaistr_get_notification_inbox_count_callback() {
	return alpaistr_rest_response(
		'',
		[
			'unread_count' => alpaistr_get_notification_inbox_unread_count( get_current_user_id() ),
		],
		200
	);
}

/**
 * Handle POST mark-read requests for inbox items.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response REST response.
 */
function alpaistr_mark_notification_inbox_read_callback( WP_REST_Request $request ) {
	$params   = alpaistr_get_notification_request_params( $request );
	$item_ids = isset( $params['item_ids'] ) ? alpaistr_get_valid_notification_inbox_item_ids( $params['item_ids'] ) : [];

	alpaistr_mark_notification_inbox_items_read( get_current_user_id(), $item_ids );

	return alpaistr_rest_response(
		'',
		[
			'unread_count' => alpaistr_get_notification_inbox_unread_count( get_current_user_id() ),
		],
		200
	);
}

/**
 * Handle POST mark-unread requests for inbox items.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response REST response.
 */
function alpaistr_mark_notification_inbox_unread_callback( WP_REST_Request $request ) {
	$params   = alpaistr_get_notification_request_params( $request );
	$item_ids = isset( $params['item_ids'] ) ? alpaistr_get_valid_notification_inbox_item_ids( $params['item_ids'] ) : [];

	alpaistr_mark_notification_inbox_items_unread( get_current_user_id(), $item_ids );

	return alpaistr_rest_response(
		'',
		[
			'unread_count' => alpaistr_get_notification_inbox_unread_count( get_current_user_id() ),
		],
		200
	);
}

/**
 * Handle POST mark-all-read requests for inbox items.
 *
 * @return WP_REST_Response REST response.
 */
function alpaistr_mark_all_notification_inbox_read_callback() {
	alpaistr_mark_all_notification_inbox_items_read( get_current_user_id() );

	return alpaistr_rest_response(
		'',
		[
			'unread_count' => alpaistr_get_notification_inbox_unread_count( get_current_user_id() ),
		],
		200
	);
}

/**
 * Handle POST notification preferences.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response REST response.
 */
function alpaistr_update_notification_preferences_callback( WP_REST_Request $request ) {
	$params      = alpaistr_get_notification_request_params( $request );
	$preferences = isset( $params['preferences'] ) && is_array( $params['preferences'] ) ? $params['preferences'] : [];
	$user_id     = get_current_user_id();

	$updated = alpaistr_update_notification_preferences_for_user( $user_id, $preferences );
	if ( is_wp_error( $updated ) ) {
		return alpaistr_rest_response(
			'',
			[
				'success' => false,
				'message' => $updated->get_error_message(),
			],
			400
		);
	}

	return alpaistr_rest_response( '', alpaistr_get_notification_preferences_payload( $user_id ), 200 );
}

/**
 * Build the REST payload for the notification email template.
 *
 * @return array<string, mixed> Template payload.
 */
function alpaistr_get_notification_template_payload() {
	$template = alpaistr_get_notification_email_template();

	return [
		'subject'             => $template['subject'],
		'body'                => $template['body'],
		'allowed_block_types' => alpaistr_get_notification_template_allowed_block_types(),
	];
}

/**
 * Return a standardized REST error response for template endpoints.
 *
 * @param string $message Error message.
 * @param int    $status  HTTP status code.
 * @return WP_REST_Response REST response.
 */
function alpaistr_get_notification_template_error_response( $message, $status = 400 ) {
	return alpaistr_rest_response(
		'',
		[
			'success' => false,
			'message' => $message,
		],
		$status
	);
}

/**
 * Return the REST configuration for a notification template type.
 *
 * @param string $template_type Template type.
 * @return array<string, mixed> Template configuration.
 */
function alpaistr_get_notification_template_rest_config( $template_type ) {
	if ( 'digest' === $template_type ) {
		return [
			'payload_callback'          => 'alpaistr_get_notification_digest_template_payload',
			'update_callback'           => 'alpaistr_update_notification_daily_digest_template',
			'reset_callback'            => 'alpaistr_reset_notification_daily_digest_template',
			'default_subject_callback'  => 'alpaistr_get_notification_daily_digest_subject_template_default',
			'default_body_callback'     => 'alpaistr_get_notification_daily_digest_body_template_default',
			'sanitize_subject_callback' => 'alpaistr_sanitize_notification_daily_digest_subject_template',
			'sanitize_body_callback'    => 'alpaistr_sanitize_notification_daily_digest_body_template',
			'render_message_callback'   => 'alpaistr_render_notification_daily_digest_message',
			'sample_data_callback'      => 'alpaistr_get_notification_daily_digest_sample_payload',
			'test_failure_message'      => esc_html__( 'Test digest email could not be sent.', 'alpaca-issue-tracker' ),
			/* translators: %s: test email address. */
			'test_success_message'      => esc_html__( 'Test digest email sent to %s.', 'alpaca-issue-tracker' ),
		];
	}

	return [
		'payload_callback'          => 'alpaistr_get_notification_template_payload',
		'update_callback'           => 'alpaistr_update_notification_email_template',
		'reset_callback'            => 'alpaistr_reset_notification_email_template',
		'default_subject_callback'  => 'alpaistr_get_notification_email_subject_template_default',
		'default_body_callback'     => 'alpaistr_get_notification_email_body_template_default',
		'sanitize_subject_callback' => 'alpaistr_sanitize_notification_email_subject_template',
		'sanitize_body_callback'    => 'alpaistr_sanitize_notification_email_body_template',
		'render_message_callback'   => 'alpaistr_render_notification_message',
		'sample_data_callback'      => 'alpaistr_get_notification_sample_event',
		'test_failure_message'      => esc_html__( 'Test email could not be sent.', 'alpaca-issue-tracker' ),
		/* translators: %s: test email address. */
		'test_success_message'      => esc_html__( 'Test email sent to %s.', 'alpaca-issue-tracker' ),
	];
}

/**
 * Build a template endpoint payload from its configuration.
 *
 * @param array<string, mixed> $config Template configuration.
 * @return array<string, mixed> Template payload.
 */
function alpaistr_get_notification_template_payload_from_config( $config ) {
	return call_user_func( $config['payload_callback'] );
}

/**
 * Build a preview/test message from a template endpoint request.
 *
 * @param WP_REST_Request      $request REST request.
 * @param array<string, mixed> $config  Template configuration.
 * @return array<string, mixed>|WP_Error Message payload or WP_Error.
 */
function alpaistr_build_notification_template_message_from_request( WP_REST_Request $request, $config ) {
	$params                   = alpaistr_get_notification_request_params( $request );
	$default_subject_callback = $config['default_subject_callback'];
	$default_body_callback    = $config['default_body_callback'];
	$sanitize_subject         = $config['sanitize_subject_callback'];
	$sanitize_body            = $config['sanitize_body_callback'];
	$render_message           = $config['render_message_callback'];
	$get_sample_data          = $config['sample_data_callback'];
	$subject                  = isset( $params['subject'] ) ? (string) $params['subject'] : call_user_func( $default_subject_callback );
	$body                     = isset( $params['body'] ) ? (string) $params['body'] : call_user_func( $default_body_callback );
	$body                     = call_user_func( $sanitize_body, $body );

	if ( is_wp_error( $body ) ) {
		return $body;
	}

	$template = [
		'subject' => call_user_func( $sanitize_subject, $subject ),
		'body'    => $body,
	];

	return call_user_func( $render_message, call_user_func( $get_sample_data ), $template );
}

/**
 * Return the current user's email address for template test sends.
 *
 * @return string|WP_Error Email address or WP_Error.
 */
function alpaistr_get_notification_template_test_email_address() {
	$current_user = wp_get_current_user();
	if ( ! ( $current_user instanceof WP_User ) || ! $current_user->exists() ) {
		return new WP_Error(
			'alpaca_notification_template_no_user',
			esc_html__( 'Could not determine the current user.', 'alpaca-issue-tracker' )
		);
	}

	$email = (string) $current_user->user_email;
	if ( '' === $email || ! is_email( $email ) ) {
		return new WP_Error(
			'alpaca_notification_template_invalid_email',
			esc_html__( 'Your WordPress profile does not have a valid email address.', 'alpaca-issue-tracker' )
		);
	}

	return $email;
}

/**
 * Handle a generic template payload GET request.
 *
 * @param string $template_type Template type.
 * @return WP_REST_Response REST response.
 */
function alpaistr_get_notification_template_response( $template_type ) {
	return alpaistr_rest_response(
		'',
		alpaistr_get_notification_template_payload_from_config(
			alpaistr_get_notification_template_rest_config( $template_type )
		),
		200
	);
}

/**
 * Handle a generic template update request.
 *
 * @param WP_REST_Request $request       REST request.
 * @param string          $template_type Template type.
 * @return WP_REST_Response REST response.
 */
function alpaistr_update_notification_template_response( WP_REST_Request $request, $template_type ) {
	$config   = alpaistr_get_notification_template_rest_config( $template_type );
	$params   = alpaistr_get_notification_request_params( $request );
	$subject  = isset( $params['subject'] ) ? (string) $params['subject'] : '';
	$body     = isset( $params['body'] ) ? (string) $params['body'] : '';
	$callback = $config['update_callback'];
	$saved    = call_user_func( $callback, $subject, $body );

	if ( is_wp_error( $saved ) ) {
		return alpaistr_get_notification_template_error_response( $saved->get_error_message(), 400 );
	}

	return alpaistr_rest_response(
		'',
		alpaistr_get_notification_template_payload_from_config( $config ),
		200
	);
}

/**
 * Handle a generic template reset request.
 *
 * @param string $template_type Template type.
 * @return WP_REST_Response REST response.
 */
function alpaistr_reset_notification_template_response( $template_type ) {
	$config = alpaistr_get_notification_template_rest_config( $template_type );
	$reset  = call_user_func( $config['reset_callback'] );

	if ( is_wp_error( $reset ) ) {
		return alpaistr_get_notification_template_error_response( $reset->get_error_message(), 400 );
	}

	return alpaistr_rest_response(
		'',
		alpaistr_get_notification_template_payload_from_config( $config ),
		200
	);
}

/**
 * Handle a generic template preview request.
 *
 * @param WP_REST_Request $request       REST request.
 * @param string          $template_type Template type.
 * @return WP_REST_Response REST response.
 */
function alpaistr_preview_notification_template_response( WP_REST_Request $request, $template_type ) {
	$message = alpaistr_build_notification_template_message_from_request(
		$request,
		alpaistr_get_notification_template_rest_config( $template_type )
	);

	if ( is_wp_error( $message ) ) {
		return alpaistr_get_notification_template_error_response( $message->get_error_message(), 400 );
	}

	return alpaistr_rest_response( '', $message, 200 );
}

/**
 * Handle a generic template test-send request.
 *
 * @param WP_REST_Request $request       REST request.
 * @param string          $template_type Template type.
 * @return WP_REST_Response REST response.
 */
function alpaistr_test_notification_template_response( WP_REST_Request $request, $template_type ) {
	$email = alpaistr_get_notification_template_test_email_address();
	if ( is_wp_error( $email ) ) {
		return alpaistr_get_notification_template_error_response( $email->get_error_message(), 400 );
	}

	$config  = alpaistr_get_notification_template_rest_config( $template_type );
	$message = alpaistr_build_notification_template_message_from_request( $request, $config );

	if ( is_wp_error( $message ) ) {
		return alpaistr_get_notification_template_error_response( $message->get_error_message(), 400 );
	}

	$sent = alpaistr_send_notification_html_email( $email, $message );

	if ( ! $sent ) {
		return alpaistr_get_notification_template_error_response(
			$config['test_failure_message'],
			500
		);
	}

	return alpaistr_rest_response(
		'',
		[
			'success' => true,
			'message' => sprintf(
				/* translators: %s: test email address. */
				$config['test_success_message'],
				esc_html( $email )
			),
		],
		200
	);
}

/**
 * Handle GET notification template.
 *
 * @return WP_REST_Response REST response.
 */
function alpaistr_get_notification_template_callback() {
	return alpaistr_get_notification_template_response( 'email' );
}

/**
 * Handle POST notification template updates.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response REST response.
 */
function alpaistr_update_notification_template_callback( WP_REST_Request $request ) {
	return alpaistr_update_notification_template_response( $request, 'email' );
}

/**
 * Reset the notification template to its default values.
 *
 * @return WP_REST_Response REST response.
 */
function alpaistr_reset_notification_template_callback() {
	return alpaistr_reset_notification_template_response( 'email' );
}

/**
 * Handle notification template preview requests.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response REST response.
 */
function alpaistr_preview_notification_template_callback( WP_REST_Request $request ) {
	return alpaistr_preview_notification_template_response( $request, 'email' );
}

/**
 * Handle notification template test sends.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response REST response.
 */
function alpaistr_test_notification_template_callback( WP_REST_Request $request ) {
	return alpaistr_test_notification_template_response( $request, 'email' );
}

/**
 * Build the REST payload for the daily digest template.
 *
 * @return array<string, string> Daily digest template payload.
 */
function alpaistr_get_notification_digest_template_payload() {
	$template                        = alpaistr_get_notification_daily_digest_template();
	$template['allowed_block_types'] = alpaistr_get_notification_daily_digest_template_allowed_block_types();

	return $template;
}

/**
 * Handle GET daily digest template requests.
 *
 * @return WP_REST_Response REST response.
 */
function alpaistr_get_notification_digest_template_callback() {
	return alpaistr_get_notification_template_response( 'digest' );
}

/**
 * Handle POST daily digest template updates.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response REST response.
 */
function alpaistr_update_notification_digest_template_callback( WP_REST_Request $request ) {
	return alpaistr_update_notification_template_response( $request, 'digest' );
}

/**
 * Reset the daily digest template to defaults.
 *
 * @return WP_REST_Response REST response.
 */
function alpaistr_reset_notification_digest_template_callback() {
	return alpaistr_reset_notification_template_response( 'digest' );
}

/**
 * Handle daily digest template preview requests.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response REST response.
 */
function alpaistr_preview_notification_digest_template_callback( WP_REST_Request $request ) {
	return alpaistr_preview_notification_template_response( $request, 'digest' );
}

/**
 * Handle daily digest template test sends.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response REST response.
 */
function alpaistr_test_notification_digest_template_callback( WP_REST_Request $request ) {
	return alpaistr_test_notification_template_response( $request, 'digest' );
}
