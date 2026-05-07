<?php
/**
 * Alpaca REST API: Options and Status Endpoints.
 *
 * @package Alpaca
 */

use Alpaca\Helpers;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/*
 * Restore default statuses endpoint.
 */
add_action( 'rest_api_init', 'alpaca_restore_default_statuses_endpoint' );
/**
 * Register restore default statuses endpoint.
 */
function alpaca_restore_default_statuses_endpoint() {
	register_rest_route(
		'alpaca/v1',
		'/statuses/restore-defaults',
		[
			'methods'             => 'POST',
			'callback'            => 'alpaca_restore_default_statuses_callback',
			'permission_callback' => function ( WP_REST_Request $request ) {
				return Helpers::validate_rest_nonce_permission( $request, 'restore_statuses' );
			},
		]
	);
}

/**
 * Callback for restoring default statuses.
 *
 * @return WP_REST_Response REST response with result.
 */
function alpaca_restore_default_statuses_callback() {
	$result = alpaca_setup_default_statuses( true );

	return alpaca_rest_response(
		'statuses_restore',
		$result,
		$result['success'] ? 200 : 400
	);
}

/*
 * Statuses: list + update endpoints.
 */
add_action( 'rest_api_init', 'alpaca_get_statuses_endpoint' );
/**
 * Register statuses GET endpoint.
 */
function alpaca_get_statuses_endpoint() {
	register_rest_route(
		'alpaca/v1',
		'/statuses',
		[
			'methods'             => 'GET',
			'callback'            => 'alpaca_get_statuses_callback',
			'permission_callback' => function () {
				return Helpers::user_can( 'get_statuses' );
			},
		]
	);
}

/**
 * Callback for GET statuses endpoint.
 *
 * @return WP_REST_Response|WP_Error REST response with statuses or error.
 */
function alpaca_get_statuses_callback() {
	$statuses = alpaca_get_statuses();
	if ( is_wp_error( $statuses ) ) {
		return $statuses;
	}
	return alpaca_rest_response( '', $statuses, 200 );
}

add_action( 'rest_api_init', 'alpaca_update_status_endpoint' );
/**
 * Register status UPDATE endpoint.
 */
function alpaca_update_status_endpoint() {
	register_rest_route(
		'alpaca/v1',
		'/status/(?P<id>\d+)',
		[
			'methods'             => 'POST',
			'callback'            => 'alpaca_update_status_callback',
			'permission_callback' => function ( WP_REST_Request $request ) {
				return Helpers::validate_rest_nonce_permission( $request, 'update_status' );
			},
			'args'                => [
				'id' => [
					'validate_callback' => function ( $param ) {
						return is_numeric( $param ) && $param > 0;
					},
				],
			],
		]
	);
}

/**
 * Callback for status UPDATE endpoint.
 *
 * @param WP_REST_Request $request REST request object.
 * @return WP_REST_Response REST response.
 */
function alpaca_update_status_callback( WP_REST_Request $request ) {
	$term_id = (int) $request['id'];
	$data    = (array) $request->get_json_params();

	$term = get_term( $term_id, 'alpaca_status' );
	if ( ! $term || is_wp_error( $term ) ) {
		return alpaca_rest_response(
			'',
			[
				'success' => false,
				'message' => esc_html__( 'Status not found.', 'alpaca' ),
			],
			404
		);
	}

	if ( isset( $data['name'] ) ) {
		$new_name = trim( sanitize_text_field( (string) $data['name'] ) );
		if ( '' === $new_name ) {
			return alpaca_rest_response(
				'',
				[
					'success' => false,
					'message' => esc_html__( 'Status name cannot be empty.', 'alpaca' ),
				],
				400
			);
		}

		$new_slug = sanitize_title( $new_name );

		$update_result = wp_update_term(
			$term_id,
			'alpaca_status',
			[
				'name' => $new_name,
				'slug' => $new_slug,
			]
		);

		if ( is_wp_error( $update_result ) ) {
			return alpaca_rest_response(
				'',
				[
					'success' => false,
					'message' => esc_html__( 'Failed to update status name and slug.', 'alpaca' ),
				],
				500
			);
		}
	}

	if ( array_key_exists( 'term_score', $data ) ) {
		if ( ! is_numeric( $data['term_score'] ) ) {
			return alpaca_rest_response(
				'',
				[
					'success' => false,
					'message' => esc_html__( 'Status order must be a number.', 'alpaca' ),
				],
				400
			);
		}

		$term_score     = (int) $data['term_score'];
		$min_term_score = alpaca_get_min_term_score();
		$max_term_score = alpaca_get_max_term_score();

		if ( $term_score < $min_term_score || $term_score > $max_term_score ) {
			return alpaca_rest_response(
				'',
				[
					'success' => false,
					'message' => esc_html__( 'Status order is outside the allowed range.', 'alpaca' ),
				],
				400
			);
		}

		update_term_meta( $term_id, 'term_score', $term_score );
	}

	return alpaca_rest_response(
		'status_update',
		[
			'success' => true,
			'message' => esc_html__( 'Status updated successfully.', 'alpaca' ),
		],
		200
	);
}
