<?php
/**
 * Alpaca REST API: Options and Status Endpoints.
 *
 * @package Alpaca
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/*
 * Options: default status endpoints.
 */
add_action( 'rest_api_init', 'alpaca_register_options_endpoints' );
/**
 * Register options-related REST endpoints.
 */
function alpaca_register_options_endpoints() {
	register_rest_route(
		'alpaca/v1',
		'/options/default_status',
		array(
			array(
				'methods'             => 'GET',
				'callback'            => 'alpaca_get_default_status_option',
				'permission_callback' => function () {
					return \Alpaca\Inc\Helpers::user_can( 'manage_options' );
				},
			),
			array(
				'methods'             => 'POST',
				'callback'            => 'alpaca_update_default_status_option',
				'permission_callback' => function () {
					return \Alpaca\Inc\Helpers::user_can( 'manage_options' );
				},
				'args'                => array(
					'value' => array(
						'required'          => true,
						'validate_callback' => function ( $param ) {
							return is_numeric( $param ) || '' === $param;
						},
					),
				),
			),
		)
	);
}

/**
 * Get default status option.
 *
 * @return WP_REST_Response REST response with default status ID.
 */
function alpaca_get_default_status_option() {
	$default_status_id = get_option( 'alpaca_default_status_id', '' );
	return alpaca_rest_response( '', array( 'value' => $default_status_id ), 200 );
}

/**
 * Update default status option.
 *
 * @param WP_REST_Request $request REST request object.
 * @return WP_REST_Response REST response.
 */
function alpaca_update_default_status_option( WP_REST_Request $request ) {
	$value   = $request->get_param( 'value' );
	$new_val = (int) $value;
	$old_val = (int) get_option( 'alpaca_default_status_id', 0 );

	if ( $new_val !== $old_val ) {
		update_option( 'alpaca_default_status_id', $new_val );
	}

	return alpaca_rest_response(
		'options_update',
		array(
			'success' => true,
			'value'   => $new_val,
		),
		200
	);
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
		array(
			'methods'             => 'POST',
			'callback'            => 'alpaca_restore_default_statuses_callback',
			'permission_callback' => function () {
				return \Alpaca\Inc\Helpers::user_can( 'restore_statuses' );
			},
		)
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
		array(
			'methods'             => 'GET',
			'callback'            => 'alpaca_get_statuses_callback',
			'permission_callback' => function () {
				return \Alpaca\Inc\Helpers::user_can( 'get_statuses' );
			},
		)
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
		array(
			'methods'             => 'POST',
			'callback'            => 'alpaca_update_status_callback',
			'permission_callback' => function () {
				return \Alpaca\Inc\Helpers::user_can( 'update_status' );
			},
			'args'                => array(
				'id' => array(
					'validate_callback' => function ( $param ) {
						return is_numeric( $param ) && $param > 0;
					},
				),
			),
		)
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
	$data    = $request->get_json_params();

	$term = get_term( $term_id, 'alpaca_status' );
	if ( ! $term || is_wp_error( $term ) ) {
		return alpaca_rest_response(
			'',
			array(
				'success' => false,
				'message' => esc_html__( 'Status not found.', 'alpaca' ),
			),
			404
		);
	}

	if ( isset( $data['name'] ) ) {
		$new_name = (string) $data['name'];
		$new_slug = sanitize_title( $new_name );

		$update_result = wp_update_term(
			$term_id,
			'alpaca_status',
			array(
				'name' => $new_name,
				'slug' => $new_slug,
			)
		);

		if ( is_wp_error( $update_result ) ) {
			return alpaca_rest_response(
				'',
				array(
					'success' => false,
					'message' => esc_html__( 'Failed to update status name and slug.', 'alpaca' ),
				),
				500
			);
		}
	}

	if ( array_key_exists( 'term_score', (array) $data ) ) {
		update_term_meta( $term_id, 'term_score', $data['term_score'] );
	}

	return alpaca_rest_response(
		'status_update',
		array(
			'success' => true,
			'message' => esc_html__( 'Status updated successfully.', 'alpaca' ),
		),
		200
	);
}
