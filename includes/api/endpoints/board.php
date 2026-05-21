<?php
/**
 * Alpaca Issue Tracker REST API: Board Endpoints.
 *
 * @package AlpacaIssueTracker
 */

use AlpacaIssueTracker\Helpers;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/*
 * Board: get + update endpoints.
 */
add_action( 'rest_api_init', 'alpaistr_get_board' );
/**
 * Register the board GET endpoint.
 */
function alpaistr_get_board() {
	register_rest_route(
		'alpaca/v1',
		'/board',
		[
			'methods'             => 'GET',
			'callback'            => 'alpaistr_get_board_data_callback',
			'permission_callback' => function () {
				return Helpers::user_can( 'get_statuses' );
			},
		]
	);
}

/**
 * Callback for board GET endpoint.
 *
 * @return WP_REST_Response REST response with board data.
 */
function alpaistr_get_board_data_callback() {
	$board_data = alpaistr_get_board_data();
	return alpaistr_rest_response( '', $board_data, 200 );
}

add_action( 'rest_api_init', 'alpaistr_update_board' );
/**
 * Register the board UPDATE endpoint.
 */
function alpaistr_update_board() {
	register_rest_route(
		'alpaca/v1',
		'/board',
		[
			'methods'             => 'POST',
			'callback'            => 'alpaistr_update_board_data_callback',
			'permission_callback' => function ( WP_REST_Request $request ) {
				return Helpers::validate_rest_nonce_permission( $request, 'update_board' );
			},
		]
	);
}

/**
 * Callback for board UPDATE endpoint.
 *
 * @param WP_REST_Request $request REST request object.
 * @return WP_REST_Response REST response.
 */
function alpaistr_update_board_data_callback( WP_REST_Request $request ) {
	$columns = $request->get_json_params();

	if ( ! is_array( $columns ) ) {
		return alpaistr_rest_response(
			'',
			[
				'success' => false,
				'message' => esc_html__( 'Invalid data format. Expected an array of columns.', 'alpaca-issue-tracker' ),
			],
			400
		);
	}

	foreach ( $columns as $column ) {
		if ( ! is_array( $column ) ) {
			continue;
		}
		$term_id   = (int) ( $column['id'] ?? 0 );
		$issue_ids = alpaistr_to_int_ids( $column['issues'] ?? [] );

		if ( $term_id > 0 ) {
			update_term_meta( $term_id, 'issue_order', $issue_ids );
		}
	}

	return alpaistr_rest_response(
		'board_update',
		[
			'success' => true,
			'message' => esc_html__( 'Board order saved successfully.', 'alpaca-issue-tracker' ),
		],
		200
	);
}
