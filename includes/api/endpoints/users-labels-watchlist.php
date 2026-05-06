<?php
/**
 * Alpaca REST API: User, Label, and Watchlist Endpoints.
 *
 * @package Alpaca
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/*
 * Users list endpoint.
 */
add_action( 'rest_api_init', 'alpaca_register_user_list_endpoint' );
/**
 * Register users list endpoint.
 */
function alpaca_register_user_list_endpoint() {
	register_rest_route(
		'alpaca/v1',
		'/users',
		[
			'methods'             => 'GET',
			'callback'            => 'alpaca_get_all_users_callback',
			'permission_callback' => function () {
				return \Alpaca\Inc\Helpers::user_can( 'watchlist' );
			},
		]
	);
}

/**
 * Callback for users list endpoint.
 *
 * @return WP_REST_Response REST response with users list.
 */
function alpaca_get_all_users_callback() {
	$users = get_users( [ 'fields' => [ 'ID', 'display_name', 'user_nicename' ] ] );
	if ( empty( $users ) ) {
		return alpaca_rest_response( '', [], 200 );
	}

	$response_data = [];
	foreach ( $users as $user ) {
		$response_data[] = [
			'id'          => (int) $user->ID,
			'name'        => $user->display_name,
			'slug'        => $user->user_nicename,
			'avatar_urls' => [
				'24' => alpaca_avatar( $user->ID, 24 ),
				'48' => alpaca_avatar( $user->ID, 48 ),
				'96' => alpaca_avatar( $user->ID, 96 ),
			],
		];
	}

	return alpaca_rest_response( '', $response_data, 200 );
}

/*
 * Labels endpoints.
 */
add_action( 'rest_api_init', 'alpaca_labels_endpoint' );
/**
 * Register labels endpoints.
 */
function alpaca_labels_endpoint() {
	register_rest_route(
		'alpaca/v1',
		'/labels',
		[
			[
				'methods'             => 'GET',
				'callback'            => 'alpaca_get_labels_callback',
				'permission_callback' => function () {
					return \Alpaca\Inc\Helpers::user_can( 'watchlist' );
				},
			],
			[
				'methods'             => 'POST',
				'callback'            => 'alpaca_create_label_callback',
				'permission_callback' => function ( WP_REST_Request $request ) {
					return \Alpaca\Inc\Helpers::validate_rest_nonce_permission( $request, 'manage_options' );
				},
			],
		]
	);

	register_rest_route(
		'alpaca/v1',
		'/label/(?P<id>\d+)',
		[
			[
				'methods'             => 'POST',
				'callback'            => 'alpaca_update_label_callback',
				'permission_callback' => function ( WP_REST_Request $request ) {
					return \Alpaca\Inc\Helpers::validate_rest_nonce_permission( $request, 'manage_options' );
				},
			],
			[
				'methods'             => 'DELETE',
				'callback'            => 'alpaca_delete_label_callback',
				'permission_callback' => function ( WP_REST_Request $request ) {
					return \Alpaca\Inc\Helpers::validate_rest_nonce_permission( $request, 'manage_options' );
				},
			],
		]
	);
}

/**
 * Normalize a label color value.
 *
 * @param string $color Color value.
 * @return string Normalized hex color.
 */
function alpaca_normalize_label_color( $color ) {
	$sanitized = sanitize_hex_color( (string) $color );

	if ( ! is_string( $sanitized ) || '' === $sanitized ) {
		return '#172b4d';
	}

	return $sanitized;
}

/**
 * Read request params from JSON payload, with fallback to generic params.
 *
 * @param WP_REST_Request $request REST request object.
 * @return array<string, mixed> Request parameters.
 */
function alpaca_get_request_params( WP_REST_Request $request ) {
	$params = $request->get_json_params();
	if ( ! is_array( $params ) ) {
		$params = $request->get_params();
	}

	if ( ! is_array( $params ) ) {
		return [];
	}

	return $params;
}

/**
 * Build a standard response for missing label terms.
 *
 * @return WP_REST_Response REST response.
 */
function alpaca_label_not_found_response() {
	return alpaca_rest_response(
		'',
		[
			'success' => false,
			'message' => esc_html__( 'Label not found.', 'alpaca' ),
		],
		404
	);
}

/**
 * Build a standard response for missing label names.
 *
 * @return WP_REST_Response REST response.
 */
function alpaca_label_name_required_response() {
	return alpaca_rest_response(
		'',
		[
			'success' => false,
			'message' => esc_html__( 'Label name is required.', 'alpaca' ),
		],
		400
	);
}

/**
 * Build a consistent REST response payload for a label term.
 *
 * @param WP_Term $term Label term.
 * @return array Label response data.
 */
function alpaca_label_response_data( $term ) {
	$color = get_term_meta( $term->term_id, 'alpaca_label_color', true );

	return [
		'term_id' => (int) $term->term_id,
		'name'    => (string) $term->name,
		'slug'    => (string) $term->slug,
		'color'   => alpaca_normalize_label_color( $color ),
	];
}

/**
 * Callback for labels GET endpoint.
 *
 * @return WP_REST_Response REST response.
 */
function alpaca_get_labels_callback() {
	$terms = get_terms(
		[
			'taxonomy'   => 'alpaca_label',
			'hide_empty' => false,
			'orderby'    => 'name',
			'order'      => 'ASC',
		]
	);

	if ( is_wp_error( $terms ) || ! is_array( $terms ) ) {
		return alpaca_rest_response( '', [], 200 );
	}

	$response_data = [];
	foreach ( $terms as $term ) {
		$response_data[] = alpaca_label_response_data( $term );
	}

	return alpaca_rest_response( '', $response_data, 200 );
}

/**
 * Callback for labels CREATE endpoint.
 *
 * @param WP_REST_Request $request REST request object.
 * @return WP_REST_Response REST response.
 */
function alpaca_create_label_callback( WP_REST_Request $request ) {
	$params = alpaca_get_request_params( $request );

	$name = isset( $params['name'] ) ? sanitize_text_field( (string) $params['name'] ) : '';
	if ( '' === trim( $name ) ) {
		return alpaca_label_name_required_response();
	}

	$color = isset( $params['color'] ) ? alpaca_normalize_label_color( (string) $params['color'] ) : '#172b4d';

	$created = wp_insert_term( $name, 'alpaca_label' );
	if ( is_wp_error( $created ) || ! isset( $created['term_id'] ) ) {
		return alpaca_rest_response(
			'',
			[
				'success' => false,
				'message' => esc_html__( 'Failed to create label.', 'alpaca' ),
			],
			500
		);
	}

	$term_id = (int) $created['term_id'];
	update_term_meta( $term_id, 'alpaca_label_color', $color );
	if ( function_exists( 'alpaca_clear_board_cache' ) ) {
		alpaca_clear_board_cache();
	}

	$term = get_term( $term_id, 'alpaca_label' );
	if ( ! $term || is_wp_error( $term ) ) {
		return alpaca_rest_response(
			'',
			[
				'success' => false,
				'message' => esc_html__( 'Label created, but could not be loaded.', 'alpaca' ),
			],
			500
		);
	}

	return alpaca_rest_response(
		'label_create',
		[
			'success' => true,
			'label'   => alpaca_label_response_data( $term ),
		],
		200
	);
}

/**
 * Callback for labels UPDATE endpoint.
 *
 * @param WP_REST_Request $request REST request object.
 * @return WP_REST_Response REST response.
 */
function alpaca_update_label_callback( WP_REST_Request $request ) {
	$term_id = (int) $request['id'];
	$term    = get_term( $term_id, 'alpaca_label' );

	if ( ! $term || is_wp_error( $term ) ) {
		return alpaca_label_not_found_response();
	}

	$params = alpaca_get_request_params( $request );

	if ( isset( $params['name'] ) ) {
		$name = sanitize_text_field( (string) $params['name'] );
		if ( '' === trim( $name ) ) {
			return alpaca_label_name_required_response();
		}

		$updated = wp_update_term(
			$term_id,
			'alpaca_label',
			[
				'name' => $name,
				'slug' => sanitize_title( $name ),
			]
		);

		if ( is_wp_error( $updated ) ) {
			return alpaca_rest_response(
				'',
				[
					'success' => false,
					'message' => esc_html__( 'Failed to update label.', 'alpaca' ),
				],
				500
			);
		}
	}

	if ( isset( $params['color'] ) ) {
		$color = alpaca_normalize_label_color( (string) $params['color'] );
		update_term_meta( $term_id, 'alpaca_label_color', $color );
	}

	if ( function_exists( 'alpaca_clear_board_cache' ) ) {
		alpaca_clear_board_cache();
	}

	$updated_term = get_term( $term_id, 'alpaca_label' );
	if ( ! $updated_term || is_wp_error( $updated_term ) ) {
		return alpaca_rest_response(
			'',
			[
				'success' => false,
				'message' => esc_html__( 'Failed to load updated label.', 'alpaca' ),
			],
			500
		);
	}

	return alpaca_rest_response(
		'label_update',
		[
			'success' => true,
			'label'   => alpaca_label_response_data( $updated_term ),
		],
		200
	);
}

/**
 * Callback for labels DELETE endpoint.
 *
 * @param WP_REST_Request $request REST request object.
 * @return WP_REST_Response REST response.
 */
function alpaca_delete_label_callback( WP_REST_Request $request ) {
	$term_id = (int) $request['id'];
	$term    = get_term( $term_id, 'alpaca_label' );

	if ( ! $term || is_wp_error( $term ) ) {
		return alpaca_label_not_found_response();
	}

	$deleted = wp_delete_term( $term_id, 'alpaca_label' );
	if ( is_wp_error( $deleted ) || ! $deleted ) {
		return alpaca_rest_response(
			'',
			[
				'success' => false,
				'message' => esc_html__( 'Failed to delete label.', 'alpaca' ),
			],
			500
		);
	}

	if ( function_exists( 'alpaca_clear_board_cache' ) ) {
		alpaca_clear_board_cache();
	}

	return alpaca_rest_response(
		'label_delete',
		[
			'success' => true,
			'term_id' => $term_id,
		],
		200
	);
}

/*
 * Watchlist endpoints (GET/POST toggle).
 */
add_action( 'rest_api_init', 'alpaca_watchlist_endpoint' );
/**
 * Register watchlist endpoints.
 */
function alpaca_watchlist_endpoint() {
	register_rest_route(
		'alpaca/v1',
		'/watchlist',
		[
			'methods'             => 'POST',
			'callback'            => 'alpaca_update_watchlist_callback',
			'permission_callback' => function ( WP_REST_Request $request ) {
				return \Alpaca\Inc\Helpers::validate_rest_nonce_permission( $request, 'watchlist_toggle' );
			},
		]
	);

	register_rest_route(
		'alpaca/v1',
		'/watchlist',
		[
			'methods'             => 'GET',
			'callback'            => 'alpaca_get_watchlist_callback',
			'permission_callback' => function () {
				return \Alpaca\Inc\Helpers::user_can( 'watchlist' );
			},
		]
	);
}

/**
 * Callback for GET watchlist endpoint.
 *
 * @return WP_REST_Response REST response with watchlist.
 */
function alpaca_get_watchlist_callback() {
	$user_id   = get_current_user_id();
	$watchlist = alpaca_get_watched_issue_ids_for_user( $user_id );

	return alpaca_rest_response(
		'',
		[
			'success'   => true,
			'watchlist' => $watchlist,
		],
		200
	);
}

/**
 * Callback for POST watchlist endpoint.
 *
 * @param WP_REST_Request $request REST request object.
 * @return WP_REST_Response REST response with updated watchlist.
 */
function alpaca_update_watchlist_callback( WP_REST_Request $request ) {
	$params = $request->get_json_params();
	if ( ! is_array( $params ) ) {
		$params = $request->get_params();
	}

	$issue_id = isset( $params['issue_id'] ) ? (int) $params['issue_id'] : 0;
	$user_id  = get_current_user_id();
	$user     = get_user_by( 'id', $user_id );
	if ( ! ( $user instanceof WP_User ) ) {
		return alpaca_rest_response(
			'',
			[
				'success' => false,
				'message' => esc_html__( 'User not found.', 'alpaca' ),
			],
			404
		);
	}

	$current_watchlist = alpaca_get_watched_issue_ids_for_user( $user_id );
	$watchlist         = $current_watchlist;

	// Preferred input: set the complete array for this user.
	if ( isset( $params['watchlist'] ) && is_array( $params['watchlist'] ) ) {
		$desired_watchlist = alpaca_to_int_ids( $params['watchlist'] );
		$valid_watchlist   = [];
		foreach ( $desired_watchlist as $post_id ) {
			if ( 'alpaca_issue' === get_post_type( $post_id ) ) {
				$valid_watchlist[] = $post_id;
			}
		}
		$watchlist = array_values( array_unique( $valid_watchlist ) );

		$term_id = alpaca_get_or_create_user_taxonomy_term( $user, 'alpaca_watching' );
		if ( $term_id <= 0 ) {
			return alpaca_rest_response(
				'',
				[
					'success' => false,
					'message' => esc_html__( 'Could not update watchlist.', 'alpaca' ),
				],
				500
			);
		}

		$to_add    = array_diff( $watchlist, $current_watchlist );
		$to_remove = array_diff( $current_watchlist, $watchlist );

		foreach ( $to_add as $post_id ) {
			wp_set_post_terms( $post_id, [ $term_id ], 'alpaca_watching', true );
		}
		foreach ( $to_remove as $post_id ) {
			wp_remove_object_terms( $post_id, [ $term_id ], 'alpaca_watching' );
		}
	} elseif ( $issue_id > 0 ) {
		// Backward compatible input: toggle one issue ID.
		if ( 'alpaca_issue' !== get_post_type( $issue_id ) ) {
			return alpaca_rest_response(
				'',
				[
					'success' => false,
					'message' => esc_html__( 'Issue not found.', 'alpaca' ),
				],
				404
			);
		}

		$term_id = alpaca_get_or_create_user_taxonomy_term( $user, 'alpaca_watching' );
		if ( $term_id <= 0 ) {
			return alpaca_rest_response(
				'',
				[
					'success' => false,
					'message' => esc_html__( 'Could not update watchlist.', 'alpaca' ),
				],
				500
			);
		}

		$is_watching = has_term( $term_id, 'alpaca_watching', $issue_id );
		if ( $is_watching ) {
			wp_remove_object_terms( $issue_id, [ $term_id ], 'alpaca_watching' );
		} else {
			wp_set_post_terms( $issue_id, [ $term_id ], 'alpaca_watching', true );
		}
	}

	$watchlist = alpaca_get_watched_issue_ids_for_user( $user_id );

	return alpaca_rest_response(
		'watchlist_update',
		[
			'success'   => true,
			'watchlist' => $watchlist,
		],
		200
	);
}
