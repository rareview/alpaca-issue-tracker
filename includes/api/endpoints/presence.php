<?php
/**
 * Alpaca REST API: Presence Endpoint.
 *
 * @package Alpaca
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/*
 * Presence endpoint (used by Heartbeat pings).
 */
add_action( 'rest_api_init', 'alpaca_register_presence_endpoint' );
/**
 * Register presence endpoint.
 */
function alpaca_register_presence_endpoint() {
	register_rest_route(
		'alpaca/v1',
		'/presence',
		[
			'methods'             => 'POST',
			'callback'            => 'alpaca_update_presence_callback',
			'permission_callback' => function ( WP_REST_Request $request ) {
				return \Alpaca\Inc\Helpers::validate_rest_nonce_permission( $request, 'presence' );
			},
		]
	);
}

/**
 * Handle presence ping: update transient of active users and return other present user IDs.
 *
 * @return WP_REST_Response
 */
function alpaca_update_presence_callback() {
	$current_user = get_current_user_id();
	if ( $current_user <= 0 ) {
		return alpaca_rest_response( '', [ 'success' => false ], 403 );
	}

	$now     = time();
	$timeout = 15; // Consider user gone after n seconds without a ping.

	$present = get_transient( 'alpaca_presence_users' );
	if ( ! is_array( $present ) ) {
		$present = [];
	}

	// Purge stale entries based on timeout.
	foreach ( $present as $uid => $ts ) {
		if ( (int) $ts < ( $now - $timeout ) ) {
			unset( $present[ $uid ] );
		}
	}

	// Always refresh current user's timestamp so others see us as present.
	$present[ $current_user ] = $now;

	// Always persist so other users' requests see the latest state (avoids users disappearing).
	wp_cache_set( 'alpaca_presence_users', $present, 'alpaca' );
	set_transient( 'alpaca_presence_users', $present, $timeout );

	// Build list of other user IDs.
	$other_ids = array_values( array_diff( array_keys( $present ), [ $current_user ] ) );
	$other_ids = array_map( 'intval', $other_ids );

	// Return richer user objects for the client to render (avoid client fetching all users).
	$present_users = [];
	if ( ! empty( $other_ids ) ) {
		$users = get_users(
			[
				'include' => $other_ids,
				'fields'  => [ 'ID', 'display_name', 'user_nicename' ],
			]
		);

		foreach ( $users as $u ) {
			$present_users[] = [
				'id'            => (int) $u->ID,
				'display_name'  => $u->display_name,
				'user_nicename' => $u->user_nicename,
				'avatar'        => alpaca_avatar( $u->ID, 48 ),
			];
		}
	}

	return alpaca_rest_response(
		'presence_update',
		[
			'success'       => true,
			'present_users' => $present_users,
		],
		200
	);
}
