<?php
/**
 * Alpaca Issue Tracker REST API: User, Label, and Watchlist Endpoints.
 *
 * @package AlpacaIssueTracker
 */

use AlpacaIssueTracker\Helpers;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/*
 * Users list endpoint.
 */
add_action( 'rest_api_init', 'alpaistr_register_user_list_endpoint' );
/**
 * Register users list endpoint.
 */
function alpaistr_register_user_list_endpoint() {
	register_rest_route(
		'alpaca/v1',
		'/users',
		[
			'methods'             => 'GET',
			'callback'            => 'alpaistr_get_all_users_callback',
			'permission_callback' => function () {
				return Helpers::user_can( 'watchlist' );
			},
		]
	);
}

/**
 * Callback for users list endpoint.
 *
 * @return WP_REST_Response REST response with users list.
 */
function alpaistr_get_all_users_callback() {
	$users = get_users( [ 'fields' => [ 'ID', 'display_name', 'user_nicename' ] ] );
	if ( empty( $users ) ) {
		return alpaistr_rest_response( '', [], 200 );
	}

	$response_data = [];
	foreach ( $users as $user ) {
		if ( ! user_can( $user->ID, 'edit_posts' ) ) {
			continue;
		}

		$response_data[] = [
			'id'          => (int) $user->ID,
			'name'        => $user->display_name,
			'slug'        => $user->user_nicename,
			'avatar_urls' => [
				'24' => alpaistr_avatar( $user->ID, 24 ),
				'48' => alpaistr_avatar( $user->ID, 48 ),
				'96' => alpaistr_avatar( $user->ID, 96 ),
			],
		];
	}

	return alpaistr_rest_response( '', $response_data, 200 );
}

/*
 * Labels endpoints.
 */
add_action( 'rest_api_init', 'alpaistr_labels_endpoint' );
/**
 * Register labels endpoints.
 */
function alpaistr_labels_endpoint() {
	register_rest_route(
		'alpaca/v1',
		'/labels',
		[
			[
				'methods'             => 'GET',
				'callback'            => 'alpaistr_get_labels_callback',
				'permission_callback' => function () {
					return Helpers::user_can( 'watchlist' );
				},
			],
			[
				'methods'             => 'POST',
				'callback'            => 'alpaistr_create_label_callback',
				'permission_callback' => function ( WP_REST_Request $request ) {
					return Helpers::validate_rest_nonce_permission( $request, 'manage_options' );
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
				'callback'            => 'alpaistr_update_label_callback',
				'permission_callback' => function ( WP_REST_Request $request ) {
					return Helpers::validate_rest_nonce_permission( $request, 'manage_options' );
				},
			],
			[
				'methods'             => 'DELETE',
				'callback'            => 'alpaistr_delete_label_callback',
				'permission_callback' => function ( WP_REST_Request $request ) {
					return Helpers::validate_rest_nonce_permission( $request, 'manage_options' );
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
function alpaistr_normalize_label_color( $color ) {
	$sanitized = sanitize_hex_color( (string) $color );

	if ( ! is_string( $sanitized ) || '' === $sanitized ) {
		return Helpers::DEFAULT_LABEL_COLOR;
	}

	return $sanitized;
}

/**
 * Read request params from JSON payload, with fallback to generic params.
 *
 * @param WP_REST_Request $request REST request object.
 * @return array<string, mixed> Request parameters.
 */
function alpaistr_get_request_params( WP_REST_Request $request ) {
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
function alpaistr_label_not_found_response() {
	return alpaistr_rest_response(
		'',
		[
			'success' => false,
			'message' => esc_html__( 'Label not found.', 'alpaca-issue-tracker' ),
		],
		404
	);
}

/**
 * Build a standard response for missing label names.
 *
 * @return WP_REST_Response REST response.
 */
function alpaistr_label_name_required_response() {
	return alpaistr_rest_response(
		'',
		[
			'success' => false,
			'message' => esc_html__( 'Label name is required.', 'alpaca-issue-tracker' ),
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
function alpaistr_label_response_data( $term ) {
	$color = get_term_meta( $term->term_id, 'alpaca_label_color', true );

	return [
		'term_id' => (int) $term->term_id,
		'name'    => (string) $term->name,
		'slug'    => (string) $term->slug,
		'color'   => alpaistr_normalize_label_color( $color ),
	];
}

/**
 * Callback for labels GET endpoint.
 *
 * @return WP_REST_Response REST response.
 */
function alpaistr_get_labels_callback() {
	$terms = get_terms(
		[
			'taxonomy'   => 'alpaca_label',
			'hide_empty' => false,
			'orderby'    => 'name',
			'order'      => 'ASC',
		]
	);

	if ( is_wp_error( $terms ) || ! is_array( $terms ) ) {
		return alpaistr_rest_response( '', [], 200 );
	}

	$response_data = [];
	foreach ( $terms as $term ) {
		$response_data[] = alpaistr_label_response_data( $term );
	}

	return alpaistr_rest_response( '', $response_data, 200 );
}

/**
 * Callback for labels CREATE endpoint.
 *
 * @param WP_REST_Request $request REST request object.
 * @return WP_REST_Response REST response.
 */
function alpaistr_create_label_callback( WP_REST_Request $request ) {
	$params = alpaistr_get_request_params( $request );

	$name = isset( $params['name'] ) ? sanitize_text_field( (string) $params['name'] ) : '';
	if ( '' === trim( $name ) ) {
		return alpaistr_label_name_required_response();
	}

	if ( isset( $params['color'] ) ) {
		$color = alpaistr_normalize_label_color( (string) $params['color'] );
	} else {
		$color = Helpers::DEFAULT_LABEL_COLOR;
	}

	$created = wp_insert_term( $name, 'alpaca_label' );
	if ( is_wp_error( $created ) || ! isset( $created['term_id'] ) ) {
		return alpaistr_rest_response(
			'',
			[
				'success' => false,
				'message' => esc_html__( 'Failed to create label.', 'alpaca-issue-tracker' ),
			],
			500
		);
	}

	$term_id = (int) $created['term_id'];
	update_term_meta( $term_id, 'alpaca_label_color', $color );
	if ( function_exists( 'alpaistr_clear_board_cache' ) ) {
		alpaistr_clear_board_cache();
	}

	$term = get_term( $term_id, 'alpaca_label' );
	if ( ! $term || is_wp_error( $term ) ) {
		return alpaistr_rest_response(
			'',
			[
				'success' => false,
				'message' => esc_html__( 'Label created, but could not be loaded.', 'alpaca-issue-tracker' ),
			],
			500
		);
	}

	return alpaistr_rest_response(
		'label_create',
		[
			'success' => true,
			'label'   => alpaistr_label_response_data( $term ),
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
function alpaistr_update_label_callback( WP_REST_Request $request ) {
	$term_id = (int) $request['id'];
	$term    = get_term( $term_id, 'alpaca_label' );

	if ( ! $term || is_wp_error( $term ) ) {
		return alpaistr_label_not_found_response();
	}

	$params = alpaistr_get_request_params( $request );

	if ( isset( $params['name'] ) ) {
		$name = sanitize_text_field( (string) $params['name'] );
		if ( '' === trim( $name ) ) {
			return alpaistr_label_name_required_response();
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
			return alpaistr_rest_response(
				'',
				[
					'success' => false,
					'message' => esc_html__( 'Failed to update label.', 'alpaca-issue-tracker' ),
				],
				500
			);
		}
	}

	if ( isset( $params['color'] ) ) {
		$color = alpaistr_normalize_label_color( (string) $params['color'] );
		update_term_meta( $term_id, 'alpaca_label_color', $color );
	}

	if ( function_exists( 'alpaistr_clear_board_cache' ) ) {
		alpaistr_clear_board_cache();
	}

	$updated_term = get_term( $term_id, 'alpaca_label' );
	if ( ! $updated_term || is_wp_error( $updated_term ) ) {
		return alpaistr_rest_response(
			'',
			[
				'success' => false,
				'message' => esc_html__( 'Failed to load updated label.', 'alpaca-issue-tracker' ),
			],
			500
		);
	}

	return alpaistr_rest_response(
		'label_update',
		[
			'success' => true,
			'label'   => alpaistr_label_response_data( $updated_term ),
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
function alpaistr_delete_label_callback( WP_REST_Request $request ) {
	$term_id = (int) $request['id'];
	$term    = get_term( $term_id, 'alpaca_label' );

	if ( ! $term || is_wp_error( $term ) ) {
		return alpaistr_label_not_found_response();
	}

	$deleted = wp_delete_term( $term_id, 'alpaca_label' );
	if ( is_wp_error( $deleted ) || ! $deleted ) {
		return alpaistr_rest_response(
			'',
			[
				'success' => false,
				'message' => esc_html__( 'Failed to delete label.', 'alpaca-issue-tracker' ),
			],
			500
		);
	}

	if ( function_exists( 'alpaistr_clear_board_cache' ) ) {
		alpaistr_clear_board_cache();
	}

	return alpaistr_rest_response(
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
add_action( 'rest_api_init', 'alpaistr_watchlist_endpoint' );
/**
 * Register watchlist endpoints.
 */
function alpaistr_watchlist_endpoint() {
	register_rest_route(
		'alpaca/v1',
		'/watchlist',
		[
			'methods'             => 'POST',
			'callback'            => 'alpaistr_update_watchlist_callback',
			'permission_callback' => function ( WP_REST_Request $request ) {
				return Helpers::validate_rest_nonce_permission( $request, 'watchlist_toggle' );
			},
		]
	);

	register_rest_route(
		'alpaca/v1',
		'/watchlist',
		[
			'methods'             => 'GET',
			'callback'            => 'alpaistr_get_watchlist_callback',
			'permission_callback' => function () {
				return Helpers::user_can( 'watchlist' );
			},
		]
	);
}

/**
 * Callback for GET watchlist endpoint.
 *
 * @return WP_REST_Response REST response with watchlist.
 */
function alpaistr_get_watchlist_callback() {
	$user_id   = get_current_user_id();
	$watchlist = alpaistr_get_watched_issue_ids_for_user( $user_id );

	return alpaistr_rest_response(
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
function alpaistr_update_watchlist_callback( WP_REST_Request $request ) {
	$params = $request->get_json_params();
	if ( ! is_array( $params ) ) {
		$params = $request->get_params();
	}

	$issue_id = isset( $params['issue_id'] ) ? (int) $params['issue_id'] : 0;
	$user_id  = get_current_user_id();
	$user     = get_user_by( 'id', $user_id );
	if ( ! ( $user instanceof WP_User ) ) {
		return alpaistr_rest_response(
			'',
			[
				'success' => false,
				'message' => esc_html__( 'User not found.', 'alpaca-issue-tracker' ),
			],
			404
		);
	}

	$current_watchlist = alpaistr_get_watched_issue_ids_for_user( $user_id );
	$watchlist         = $current_watchlist;

	// Preferred input: set the complete array for this user.
	if ( isset( $params['watchlist'] ) && is_array( $params['watchlist'] ) ) {
		$desired_watchlist = alpaistr_to_int_ids( $params['watchlist'] );
		$valid_watchlist   = [];
		foreach ( $desired_watchlist as $post_id ) {
			if ( 'alpaca_issue' === get_post_type( $post_id ) ) {
				$valid_watchlist[] = $post_id;
			}
		}
		$watchlist = array_values( array_unique( $valid_watchlist ) );

		$term_id = alpaistr_get_or_create_user_taxonomy_term( $user, 'alpaca_watching' );
		if ( $term_id <= 0 ) {
			return alpaistr_rest_response(
				'',
				[
					'success' => false,
					'message' => esc_html__( 'Could not update watchlist.', 'alpaca-issue-tracker' ),
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
			return alpaistr_rest_response(
				'',
				[
					'success' => false,
					'message' => esc_html__( 'Issue not found.', 'alpaca-issue-tracker' ),
				],
				404
			);
		}

		$term_id = alpaistr_get_or_create_user_taxonomy_term( $user, 'alpaca_watching' );
		if ( $term_id <= 0 ) {
			return alpaistr_rest_response(
				'',
				[
					'success' => false,
					'message' => esc_html__( 'Could not update watchlist.', 'alpaca-issue-tracker' ),
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

	$watchlist = alpaistr_get_watched_issue_ids_for_user( $user_id );

	return alpaistr_rest_response(
		'watchlist_update',
		[
			'success'   => true,
			'watchlist' => $watchlist,
		],
		200
	);
}
