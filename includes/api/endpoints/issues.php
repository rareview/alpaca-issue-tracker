<?php
/**
 * Alpaca REST API: Issue Endpoints.
 *
 * @package Alpaca
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/*
 * Issue submit endpoint.
 */
add_action( 'rest_api_init', 'alpaca_issue_submit' );
/**
 * Register the issue submit REST endpoint.
 */
function alpaca_issue_submit() {
	register_rest_route(
		'alpaca/v1',
		'submit',
		[
			'methods'             => 'POST',
			'callback'            => 'alpaca_issue_callback',
			'permission_callback' => function ( WP_REST_Request $request ) {
				return \Alpaca\Inc\Helpers::validate_rest_nonce_permission( $request, 'create_issue' );
			},
		]
	);
}

/**
 * Handle issue submission via REST API.
 *
 * @param WP_REST_Request $req REST request object.
 * @return WP_REST_Response REST response.
 */
function alpaca_issue_callback( WP_REST_Request $req ) {
	$payload = $req->get_json_params();

	if ( ! is_array( $payload ) ) {
		return alpaca_rest_response(
			'',
			[
				'success' => false,
				'message' => esc_html__( 'Invalid request body.', 'alpaca' ),
			],
			400
		);
	}

	// Extract user + input safely.
	$user_id          = get_current_user_id();
	$feedback_raw     = (string) alpaca_arr_get( $payload, [ 'userinput', 'feedback' ], '' );
	$include_ctx      = (bool) alpaca_arr_get( $payload, [ 'userinput', 'includeContext' ], false );
	$is_high_priority = (bool) alpaca_arr_get( $payload, [ 'userinput', 'isHighPriority' ], false );

	if ( '' === trim( $feedback_raw ) ) {
		return alpaca_rest_response(
			'',
			[
				'success' => false,
				'message' => esc_html__( 'Feedback is required.', 'alpaca' ),
			],
			400
		);
	}

	// Prepare post args (keep original behavior).
	$getbody   = $req->get_body();
	$post_args = [
		'post_type'      => 'alpaca_issue',
		'post_status'    => 'publish',
		'post_author'    => $user_id,
		'post_title'     => wp_kses_post( wp_trim_words( $feedback_raw, 10 ) ),
		'post_name'      => hash( 'adler32', (string) $getbody ),
		'post_content'   => wp_kses_post( $feedback_raw ),
		'comment_status' => 'open',
	];

	$post_id = wp_insert_post( $post_args, true );
	if ( is_wp_error( $post_id ) || 0 === (int) $post_id ) {
		return alpaca_rest_response(
			'',
			[
				'success' => false,
				'message' => esc_html__( 'Failed to create issue.', 'alpaca' ),
			],
			500
		);
	}

	$status_term_id = 0;
	$statuses       = alpaca_get_statuses();
	if ( ! empty( $statuses ) && ! is_wp_error( $statuses ) ) {
		$status_term = null;
		$min_score   = PHP_INT_MAX;

			// Find the status with the lowest score.
		foreach ( $statuses as $s ) {
			$score = (int) alpaca_arr_get( (array) $s, [ 'term_score' ], 0 );
			if ( $score < $min_score ) {
				$min_score   = $score;
				$status_term = $s;
			}
		}

		if ( ! $status_term ) {
			$status_term = reset( $statuses );
		}

		/**
		 * Filter the default status for new issues.
		 *
		 * @param object $status_term The default status term object.
		 * @param array  $statuses    All available status terms.
		 * @since 1.0.0
		 */
		$status_term = apply_filters( 'alpaca_default_status', $status_term, $statuses );

		if ( $status_term ) {
			wp_set_post_terms( $post_id, [ (int) $status_term->term_id ], 'alpaca_status' );
			$status_term_id = (int) $status_term->term_id;

			// Add new issue to the top of the issue_order for this status.
			$current_order = get_term_meta( $status_term_id, 'issue_order', true );
			$current_order = is_array( $current_order ) ? $current_order : [];
			// Remove the new issue ID if it already exists.
			$current_order = array_values( array_diff( $current_order, [ $post_id ] ) );
			// Add new issue to the beginning of the array.
			array_unshift( $current_order, $post_id );
			// Update the term meta with the new order.
			update_term_meta( $status_term_id, 'issue_order', $current_order );
			// Clear board cache so the new order is reflected immediately.
			alpaca_clear_board_cache();
		}
	}

	if ( $is_high_priority ) {
		update_post_meta( $post_id, 'alpaca_high_priority', 1 );
	} else {
		delete_post_meta( $post_id, 'alpaca_high_priority' );
	}

	// Optional context.
	if ( $include_ctx ) {
		$browser_name = (string) alpaca_arr_get( $payload, [ 'client', 'browser', 'name' ], '' );
		$os_name      = (string) alpaca_arr_get( $payload, [ 'client', 'os' ], '' );
		$template     = (string) alpaca_arr_get( $payload, [ 'wp', 'template' ], '' );
		$wp_types     = (array) alpaca_arr_get( $payload, [ 'wp', 'type' ], [] );

		if ( '' !== $browser_name ) {
			wp_set_post_terms( $post_id, $browser_name, 'alpaca_browser', true );
		}
		if ( '' !== $os_name ) {
			wp_set_post_terms( $post_id, $os_name, 'alpaca_browser', true );
		}
		if ( '' !== $template ) {
			wp_set_post_terms( $post_id, $template, 'alpaca_phptemplate' );
		}
		foreach ( $wp_types as $t ) {
			if ( is_scalar( $t ) && '' !== $t ) {
				wp_set_post_terms( $post_id, (string) $t, 'alpaca_type' );
			}
		}

		update_post_meta( $post_id, 'alpaca_screenwidth', (int) alpaca_arr_get( $payload, [ 'client', 'browser', 'width' ], 0 ) );
		update_post_meta( $post_id, 'alpaca_screenheight', (int) alpaca_arr_get( $payload, [ 'client', 'browser', 'height' ], 0 ) );
		update_post_meta( $post_id, 'alpaca_url', esc_url_raw( (string) alpaca_arr_get( $payload, [ 'server', 'REQUEST_URI' ], '' ) ) );

		$qo = alpaca_arr_get( $payload, [ 'wp', 'queriedObject' ], null );
		if ( is_array( $qo ) ) {
			// Avoid storing post_content.
			if ( array_key_exists( 'post_content', $qo ) ) {
				unset( $qo['post_content'] );
			}

			array_walk_recursive(
				$qo,
				function ( &$value ) {
					if ( is_string( $value ) ) {
						$value = sanitize_text_field( $value );
					}
				}
			);
			update_post_meta( $post_id, 'alpaca_queried_object', $qo );
		}

		$headers = alpaca_arr_get( $payload, [ 'headers' ], null );
		if ( is_array( $headers ) ) {
			array_walk_recursive(
				$headers,
				function ( &$value ) {
					if ( is_string( $value ) ) {
						$value = sanitize_text_field( $value );
					}
				}
			);
			update_post_meta( $post_id, 'alpaca_headers', $headers );
		}
	}

	// Save JavaScript errors if present.
	$errors = alpaca_arr_get( $payload, [ 'errors' ], null );
	if ( ! empty( $errors ) && is_array( $errors ) ) {
		// Basic sanitization of error fields.
		$sanitized_errors = [];
		foreach ( $errors as $error ) {
			if ( is_array( $error ) ) {
				$sanitized_error = [
					'message'  => isset( $error['message'] ) ? sanitize_text_field( $error['message'] ) : '',
					'filename' => isset( $error['filename'] ) ? sanitize_text_field( $error['filename'] ) : '',
					'lineno'   => isset( $error['lineno'] ) ? (int) $error['lineno'] : 0,
					'colno'    => isset( $error['colno'] ) ? (int) $error['colno'] : 0,
					'stack'    => isset( $error['stack'] ) ? esc_textarea( $error['stack'] ) : '',
				];
				if ( ! empty( $error['reason'] ) ) {
					$sanitized_error['reason'] = esc_textarea( is_string( $error['reason'] ) ? $error['reason'] : wp_json_encode( $error['reason'] ) );
				}
				$sanitized_errors[] = $sanitized_error;
			}
		}
		if ( ! empty( $sanitized_errors ) ) {
			update_post_meta( $post_id, 'alpaca_errors', wp_json_encode( $sanitized_errors, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) );
		}
	}

	$response_data = alpaca_get_issue_response_data(
		$post_id,
		[
			'title'            => $post_args['post_title'],
			'is_high_priority' => $is_high_priority,
			'statusId'         => $status_term_id,
		]
	);

	return alpaca_rest_response(
		'issue_submit',
		array_merge(
			[
				'success' => true,
				'message' => esc_html__( 'Issue submitted successfully.', 'alpaca' ),
			],
			$response_data
		),
		200
	);
}

/*
 * Issue: update endpoint.
 */
add_action( 'rest_api_init', 'alpaca_update_issue' );
/**
 * Register the issue UPDATE endpoint.
 */
function alpaca_update_issue() {
	register_rest_route(
		'alpaca/v1',
		'/update/(?P<id>\d+)',
		[
			'methods'             => 'POST',
			'callback'            => 'alpaca_update_issue_callback',
			'permission_callback' => function ( WP_REST_Request $request ) {
				return \Alpaca\Inc\Helpers::validate_rest_nonce_permission( $request, 'update_issue' );
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
 * Callback for issue UPDATE endpoint.
 *
 * @param WP_REST_Request $request REST request object.
 * @return WP_REST_Response REST response.
 */
function alpaca_update_issue_callback( WP_REST_Request $request ) {
	$issue_id = (int) $request['id'];
	$data     = $request->get_json_params();

	$post = alpaca_assert_issue_exists( $issue_id );
	if ( ! $post ) {
		return alpaca_rest_response(
			'',
			[
				'success' => false,
				'message' => esc_html__( 'Issue not found.', 'alpaca' ),
			],
			404
		);
	}

	$post_args = [
		'ID'                => $issue_id,
		'post_title'        => isset( $data['title'] ) ? wp_kses_post( (string) $data['title'] ) : $post->post_title,
		'post_content'      => isset( $data['content'] ) ? wp_kses_post( (string) $data['content'] ) : $post->post_content,
		'post_modified'     => current_time( 'mysql' ),
		'post_modified_gmt' => current_time( 'mysql', 1 ),
	];
	if ( array_key_exists( 'post_parent', (array) $data ) ) {
		$post_parent = (int) $data['post_parent'];

		if ( $post_parent < 0 ) {
			return alpaca_rest_response(
				'',
				[
					'success' => false,
					'message' => esc_html__( 'Invalid parent issue.', 'alpaca' ),
				],
				400
			);
		}

		if ( $post_parent === $issue_id ) {
			return alpaca_rest_response(
				'',
				[
					'success' => false,
					'message' => esc_html__( 'An issue cannot be its own parent.', 'alpaca' ),
				],
				400
			);
		}

		if ( $post_parent > 0 ) {
			$parent_post = alpaca_assert_issue_exists( $post_parent );
			if ( ! $parent_post ) {
				return alpaca_rest_response(
					'',
					[
						'success' => false,
						'message' => esc_html__( 'Parent issue not found.', 'alpaca' ),
					],
					404
				);
			}

			$parent_ancestors = array_map( 'intval', (array) get_post_ancestors( $parent_post ) );
			if ( in_array( $issue_id, $parent_ancestors, true ) ) {
				return alpaca_rest_response(
					'',
					[
						'success' => false,
						'message' => esc_html__( 'Invalid parent hierarchy.', 'alpaca' ),
					],
					400
				);
			}
		}

		$post_args['post_parent'] = $post_parent;
	}

	$update_result = wp_update_post( $post_args, true );
	if ( is_wp_error( $update_result ) ) {
		return alpaca_rest_response(
			'',
			[
				'success' => false,
				'message' => esc_html__( 'Failed to update the issue.', 'alpaca' ),
			],
			500
		);
	}

	// Taxonomies.
	if ( isset( $data['taxonomies'] ) && is_array( $data['taxonomies'] ) ) {
		foreach ( $data['taxonomies'] as $taxonomy => $terms ) {
			// Sanitize taxonomy name.
			$taxonomy = sanitize_key( $taxonomy );

			if ( ! taxonomy_exists( $taxonomy ) ) {
				continue;
			}

			if ( 'alpaca_assignee' === $taxonomy ) {
				$term_ids = [];
				foreach ( (array) $terms as $user_slug ) {
					// Sanitize user slug to prevent XSS/injection.
					$user_slug = sanitize_user( (string) $user_slug );
					if ( '' === $user_slug ) {
						continue;
					}
					$user = get_user_by( 'slug', $user_slug );
					if ( ! $user ) {
						continue;
					}

					$term_id = alpaca_get_or_create_user_taxonomy_term( $user, 'alpaca_assignee' );
					if ( $term_id > 0 ) {
						$term_ids[] = $term_id;
					}
				}
				$set_terms_result = wp_set_post_terms( $issue_id, alpaca_to_int_ids( $term_ids ), 'alpaca_assignee', false );
			} else {
				$term_ids         = alpaca_to_int_ids( $terms );
				$set_terms_result = wp_set_post_terms( $issue_id, $term_ids, $taxonomy, false );
			}

			if ( is_wp_error( $set_terms_result ) ) {
				return alpaca_rest_response(
					'',
					[
						'success' => false,
						'message' => esc_html__( 'Failed to update issue taxonomy terms.', 'alpaca' ),
					],
					500
				);
			}
		}
	}

	// Meta.
	if ( isset( $data['meta'] ) && is_array( $data['meta'] ) ) {
		foreach ( $data['meta'] as $meta_key => $meta_value ) {
			$key = sanitize_key( (string) $meta_key );
			// Prefix meta keys.
			if ( ! str_starts_with( $key, 'alpaca_' ) ) {
				$key = 'alpaca_' . $key;
			}
			update_post_meta( $issue_id, $key, maybe_serialize( $meta_value ) );
		}
	}

	// Update last activity since the issue was modified.
	if ( function_exists( 'alpaca_update_last_activity' ) ) {
		alpaca_update_last_activity( $issue_id );
	}

	// Clear board cache so refreshed board data reflects the latest issue state.
	if ( function_exists( 'alpaca_clear_board_cache' ) ) {
		alpaca_clear_board_cache();
	}

	// Extract overrides for response data.
	$override_data = [
		'title' => $post_args['post_title'],
	];
	if ( isset( $data['meta']['high_priority'] ) ) {
		$override_data['is_high_priority'] = (bool) $data['meta']['high_priority'];
	}
	if ( isset( $data['taxonomies'] ) ) {
		$tax_data     = $data['taxonomies'];
		$status_terms = $tax_data['alpaca_status'] ?? null;
		if ( $status_terms ) {
			$term_ids = alpaca_to_int_ids( $status_terms );
			if ( ! empty( $term_ids ) ) {
				$override_data['statusId'] = (int) $term_ids[0];
			}
		}
	}

	$response_data = alpaca_get_issue_response_data( $issue_id, $override_data );

	return alpaca_rest_response(
		'issue_update',
		array_merge(
			[
				'success' => true,
				'message' => esc_html__( 'Issue updated successfully.', 'alpaca' ),
			],
			$response_data
		),
		200
	);
}

/**
 * Format a subissue issue for API responses.
 *
 * @param WP_Post $post Subissue post object.
 * @return array Formatted subissue data.
 */
function alpaca_get_subissue_response_data( WP_Post $post ) {
	$subissue_id = (int) $post->ID;
	$assignees   = [];
	$terms       = wp_get_object_terms( $subissue_id, 'alpaca_assignee', [ 'fields' => 'all' ] );

	if ( ! is_wp_error( $terms ) && ! empty( $terms ) ) {
		foreach ( $terms as $term ) {
			$assignees[] = [
				'term_id'      => (int) $term->term_id,
				'name'         => $term->name,
				'slug'         => $term->slug,
				'username'     => $term->name,
				'display_name' => $term->description,
			];
		}
	}

	$status_terms = wp_get_object_terms( $subissue_id, 'alpaca_status', [ 'fields' => 'all' ] );
	$status_data  = [];

	if ( ! is_wp_error( $status_terms ) && ! empty( $status_terms ) ) {
		$status_data = array_map(
			static function ( $term ) {
				return [
					'term_id' => (int) $term->term_id,
					'name'    => $term->name,
					'slug'    => $term->slug,
				];
			},
			$status_terms
		);
	}

	return [
		'id'           => $subissue_id,
		'slug'         => (string) $post->post_name,
		'title'        => (string) $post->post_title,
		'content'      => (string) $post->post_content,
		'post_parent'  => (int) $post->post_parent,
		'is_completed' => ! empty( get_post_meta( $subissue_id, 'alpaca_subissue_completed', true ) ),
		'assignees'    => $assignees,
		'status'       => $status_data,
	];
}

/**
 * Get all subissues belonging to an issue.
 *
 * @param int $issue_id Parent issue post ID.
 * @return array Formatted subissues data.
 */
function alpaca_get_subissues_for_issue( $issue_id ) {
	$subissues = get_children(
		[
			'post_parent'    => (int) $issue_id,
			'post_type'      => 'alpaca_issue',
			'post_status'    => [ 'publish', 'private' ],
			'posts_per_page' => -1,
			'orderby'        => 'date',
			'order'          => 'ASC',
		]
	);

	if ( empty( $subissues ) ) {
		return [];
	}

	$formatted_subissues = [];
	foreach ( $subissues as $subissue ) {
		$formatted_subissues[] = alpaca_get_subissue_response_data( $subissue );
	}

	return $formatted_subissues;
}

/**
 * Register subissue create endpoint.
 */
function alpaca_register_subissue_endpoint() {
	register_rest_route(
		'alpaca/v1',
		'/subissues',
		[
			'methods'             => 'POST',
			'callback'            => 'alpaca_create_subissue_callback',
			// Require authentication and a valid nonce for browser-originated calls.
			'permission_callback' => function ( WP_REST_Request $request ) {
				return \Alpaca\Inc\Helpers::validate_rest_nonce_permission( $request, 'create_issue' );
			},
			'args'                => [
				'parent_id' => [
					'required'          => true,
					'validate_callback' => function ( $param ) {
						return is_numeric( $param ) && (int) $param > 0;
					},
				],
				'content'   => [
					'required'          => true,
					'validate_callback' => function ( $param ) {
						return is_string( $param ) && '' !== trim( $param );
					},
				],
			],
		]
	);
}
add_action( 'rest_api_init', 'alpaca_register_subissue_endpoint' );

/**
 * Create a subissue issue under a parent issue.
 *
 * @param WP_REST_Request $request REST request object.
 * @return WP_REST_Response REST response with created subissue data.
 */
function alpaca_create_subissue_callback( WP_REST_Request $request ) {
	$payload = $request->get_json_params();
	$payload = is_array( $payload ) ? $payload : [];

	$parent_id = isset( $payload['parent_id'] ) ? (int) $payload['parent_id'] : 0;
	$content   = isset( $payload['content'] ) ? trim( (string) $payload['content'] ) : '';

	$parent_issue = alpaca_assert_issue_exists( $parent_id );
	if ( ! $parent_issue ) {
		return alpaca_rest_response(
			'',
			[
				'success' => false,
				'message' => esc_html__( 'Parent issue not found.', 'alpaca' ),
			],
			404
		);
	}

	if ( '' === $content ) {
		return alpaca_rest_response(
			'',
			[
				'success' => false,
				'message' => esc_html__( 'Subissue title is required.', 'alpaca' ),
			],
			400
		);
	}

	$post_args = [
		'post_type'      => 'alpaca_issue',
		'post_status'    => 'publish',
		'post_author'    => get_current_user_id(),
		'post_title'     => wp_kses_post( $content ),
		'post_name'      => hash( 'adler32', (string) $request->get_body() ),
		'post_content'   => wp_kses_post( $content ),
		'post_parent'    => $parent_id,
		'comment_status' => 'open',
	];

	$subissue_id = wp_insert_post( $post_args, true );
	if ( is_wp_error( $subissue_id ) || 0 === (int) $subissue_id ) {
		return alpaca_rest_response(
			'',
			[
				'success' => false,
				'message' => esc_html__( 'Failed to create subissue.', 'alpaca' ),
			],
			500
		);
	}

	$parent_status_ids = wp_get_post_terms( $parent_id, 'alpaca_status', [ 'fields' => 'ids' ] );
	if ( ! is_wp_error( $parent_status_ids ) && ! empty( $parent_status_ids ) ) {
		wp_set_post_terms( $subissue_id, alpaca_to_int_ids( $parent_status_ids ), 'alpaca_status', false );
	}

	$subissue_post = get_post( $subissue_id );

	return alpaca_rest_response(
		'subissue_create',
		[
			'success'  => true,
			'message'  => esc_html__( 'Subissue created successfully.', 'alpaca' ),
			'subissue' => alpaca_get_subissue_response_data( $subissue_post ),
		],
		200
	);
}

/*
 * Issue: get details endpoints.
 */
add_action( 'rest_api_init', 'alpaca_get_issue_data' );
/**
 * Register issue GET endpoint.
 */
function alpaca_get_issue_data() {
	register_rest_route(
		'alpaca/v1',
		'/get/(?P<id>\d+)',
		[
			'methods'             => 'GET',
			'callback'            => 'alpaca_get_issue_data_callback',
			'permission_callback' => function () {
				return \Alpaca\Inc\Helpers::user_can( 'comment_count' );
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
 * Callback for issue GET endpoint.
 *
 * @param WP_REST_Request $request REST request object.
 * @return WP_REST_Response REST response with issue details.
 */
function alpaca_get_issue_data_callback( WP_REST_Request $request ) {
	$issue_id = (int) $request['id'];
	$post     = alpaca_assert_issue_exists( $issue_id );

	if ( ! $post ) {
		return alpaca_rest_response(
			'',
			[
				'success' => false,
				'message' => esc_html__( 'Issue not found.', 'alpaca' ),
			],
			404
		);
	}

	$post_data                             = $post->to_array();
	$post_data['post_author_display_name'] = get_the_author_meta( 'display_name', $post_data['post_author'] );
	$post_data['post_author_img']          = alpaca_avatar( $post_data['post_author'], 32 );
	$parent_issue_data                     = null;
	$parent_issue_id                       = isset( $post_data['post_parent'] ) ? (int) $post_data['post_parent'] : 0;

	if ( $parent_issue_id > 0 ) {
		$parent_issue = alpaca_assert_issue_exists( $parent_issue_id );

		if ( $parent_issue ) {
			$parent_issue_data = [
				'id'     => (int) $parent_issue->ID,
				'title'  => (string) $parent_issue->post_title,
				'status' => (string) $parent_issue->post_status,
			];
		}
	}

	$meta           = get_post_meta( $issue_id );
	$formatted_meta = [];
	foreach ( $meta as $key => $value ) {
		// PHP 7 compat: avoid str_starts_with.
		if ( 0 === strpos( $key, '_' ) ) {
			continue;
		}

		$formatted_meta[ $key ] = maybe_unserialize( $value[0] );
	}

	$all_taxonomies  = get_object_taxonomies( 'alpaca_issue', 'objects' );
	$terms_data      = [];
	$taxonomy_labels = [];
	foreach ( $all_taxonomies as $taxonomy_obj ) {
		$terms = wp_get_object_terms( $issue_id, $taxonomy_obj->name, [ 'fields' => 'all' ] );
		if ( is_wp_error( $terms ) || empty( $terms ) ) {
			continue;
		}
		if ( 'alpaca_assignee' === $taxonomy_obj->name ) {
			foreach ( $terms as $idx => $term ) {
				// Keep original structure but enrich.
				$terms[ $idx ]->username     = $term->name;
				$terms[ $idx ]->display_name = $term->description;
			}
		}
		if ( 'alpaca_label' === $taxonomy_obj->name ) {
			foreach ( $terms as $idx => $term ) {
				$color = get_term_meta( $term->term_id, 'alpaca_label_color', true );
				if ( ! is_string( $color ) || '' === $color ) {
					$color = '#172b4d';
				}
				$terms[ $idx ]->color = $color;
			}
		}

		$terms_data[ $taxonomy_obj->name ]      = $terms;
		$taxonomy_labels[ $taxonomy_obj->name ] = $taxonomy_obj->label;
	}

	$issue_comment_count = get_comments(
		[
			'post_id' => $issue_id,
			'type'    => 'issuecomment',
			'count'   => true,
		]
	);
	$subissues           = alpaca_get_subissues_for_issue( $issue_id );

	return alpaca_rest_response(
		'',
		[
			'success'         => true,
			'message'         => esc_html__( 'Issue data retrieved successfully.', 'alpaca' ),
			'post_id'         => $issue_id,
			'post_data'       => $post_data,
			'parent_issue'    => $parent_issue_data,
			'meta'            => $formatted_meta,
			'taxonomies'      => $terms_data,
			'taxonomy_labels' => $taxonomy_labels,
			'subissues'       => $subissues,
			'comment_count'   => (int) $issue_comment_count,
		],
		200
	);
}

/*
 * Issue: comment count endpoint.
 */
add_action( 'rest_api_init', 'alpaca_get_issue_comment_count_endpoint' );
/**
 * Register issue comment count endpoint.
 */
function alpaca_get_issue_comment_count_endpoint() {
	register_rest_route(
		'alpaca/v1',
		'/comment-count/(?P<id>\d+)',
		[
			'methods'             => 'GET',
			'callback'            => 'alpaca_get_issue_comment_count_callback',
			'permission_callback' => function () {
				return \Alpaca\Inc\Helpers::user_can( 'list_users' );
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
 * Callback for comment count endpoint.
 *
 * @param WP_REST_Request $request REST request object.
 * @return WP_REST_Response REST response with comment count.
 */
function alpaca_get_issue_comment_count_callback( WP_REST_Request $request ) {
	$issue_id                     = (int) $request['id'];
	$last_activity                = '';
	$comment_count_data           = function_exists( 'alpaca_get_issue_comment_counts' )
	? alpaca_get_issue_comment_counts( [ $issue_id ] )
		: [
			'totals'   => [],
			'by_agent' => [],
		];
	$comment_counts               = isset( $comment_count_data['totals'] ) ? $comment_count_data['totals'] : [];
	$comment_counts_by_agent      = isset( $comment_count_data['by_agent'] ) ? $comment_count_data['by_agent'] : [];
	$issue_comment_count          = isset( $comment_counts[ $issue_id ] ) ? (int) $comment_counts[ $issue_id ] : 0;
	$issue_comment_count_by_agent = isset( $comment_counts_by_agent[ $issue_id ] ) && is_array( $comment_counts_by_agent[ $issue_id ] )
		? $comment_counts_by_agent[ $issue_id ]
		: [];

	if ( function_exists( 'alpaca_update_last_activity_from_issuecomments' ) ) {
		$last_activity = (string) alpaca_update_last_activity_from_issuecomments( $issue_id );
	}

	return alpaca_rest_response(
		'',
		[
			'success'                => true,
			'post_id'                => $issue_id,
			'comment_count'          => $issue_comment_count,
			'comment_count_by_agent' => $issue_comment_count_by_agent,
			'last_activity'          => $last_activity,
		],
		200
	);
}

/*
 * Issue: deleted items endpoint.
 */
add_action( 'rest_api_init', 'alpaca_register_deleted_items_endpoint' );
/**
 * Register deleted items endpoint.
 */
function alpaca_register_deleted_items_endpoint() {
	register_rest_route(
		'alpaca/v1',
		'/deleted-items',
		[
			'methods'             => 'GET',
			'callback'            => 'alpaca_get_deleted_items_callback',
			'permission_callback' => function () {
				return \Alpaca\Inc\Helpers::user_can( 'comment_count' );
			},
			'args'                => [
				'search'   => [
					'validate_callback' => function ( $param ) {
						return is_string( $param ) || null === $param;
					},
				],
				'page'     => [
					'default'           => 1,
					'validate_callback' => function ( $param ) {
						return is_numeric( $param ) && (int) $param > 0;
					},
				],
				'per_page' => [
					'default'           => 20,
					'validate_callback' => function ( $param ) {
						return is_numeric( $param ) && (int) $param > 0;
					},
				],
			],
		]
	);
}

/**
 * Build a display title for a deleted issue.
 *
 * @param WP_Post $post Issue post object.
 * @return string
 */
function alpaca_get_deleted_issue_display_title( $post ) {
	if ( ! ( $post instanceof WP_Post ) ) {
		return '';
	}

	$title = trim( (string) $post->post_title );
	if ( '' !== $title ) {
		return $title;
	}

	$content = trim( wp_strip_all_tags( (string) $post->post_content ) );
	if ( '' !== $content ) {
		return $content;
	}

	return esc_html__( '(Untitled issue)', 'alpaca' );
}

/**
 * Get label response data for a deleted issue.
 *
 * @param int $issue_id Issue post ID.
 * @return array<int, array<string, string>>
 */
function alpaca_get_deleted_issue_labels( $issue_id ) {
	$issue_id = (int) $issue_id;
	if ( $issue_id <= 0 ) {
		return [];
	}

	$labels = wp_get_object_terms( $issue_id, 'alpaca_label', [ 'fields' => 'all' ] );
	if ( is_wp_error( $labels ) || empty( $labels ) ) {
		return [];
	}

	return array_map(
		static function ( $label ) {
			$color = get_term_meta( $label->term_id, 'alpaca_label_color', true );

			if ( ! is_string( $color ) || '' === $color ) {
				$color = '#172b4d';
			}

			return [
				'name'  => (string) $label->name,
				'color' => $color,
			];
		},
		$labels
	);
}

/**
 * Get the last action timestamp for a deleted issue.
 *
 * @param int $issue_id Issue post ID.
 * @return array<string, mixed>
 */
function alpaca_get_deleted_issue_last_action_data( $issue_id ) {
	$issue_id = (int) $issue_id;
	if ( $issue_id <= 0 ) {
		return [
			'value'  => '',
			'is_gmt' => false,
		];
	}

	$last_activity = get_post_meta( $issue_id, 'alpaca_lastActivity', true );
	if ( is_string( $last_activity ) && '' !== trim( $last_activity ) ) {
		return [
			'value'  => $last_activity,
			'is_gmt' => true,
		];
	}

	if ( function_exists( 'alpaca_update_last_activity_from_issuecomments' ) ) {
		$last_activity = (string) alpaca_update_last_activity_from_issuecomments( $issue_id );
		if ( '' !== trim( $last_activity ) ) {
			return [
				'value'  => $last_activity,
				'is_gmt' => true,
			];
		}
	}

	$comments = get_comments(
		[
			'post_id' => $issue_id,
			'type'    => 'issuecomment',
			'status'  => 'all',
			'number'  => 1,
			'orderby' => 'comment_date_gmt',
			'order'   => 'DESC',
		]
	);

	if ( ! empty( $comments ) && isset( $comments[0] ) && $comments[0] instanceof WP_Comment ) {
		$comment = $comments[0];
		if ( is_string( $comment->comment_date_gmt ) && '0000-00-00 00:00:00' !== $comment->comment_date_gmt ) {
			return [
				'value'  => $comment->comment_date_gmt,
				'is_gmt' => true,
			];
		}

		return [
			'value'  => (string) $comment->comment_date,
			'is_gmt' => false,
		];
	}

	return [
		'value'  => '',
		'is_gmt' => false,
	];
}

/**
 * Build deleted issue response data.
 *
 * @param WP_Post $post Issue post object.
 * @return array<string, mixed>
 */
function alpaca_get_deleted_issue_response_data( $post ) {
	if ( ! ( $post instanceof WP_Post ) ) {
		return [];
	}

	$issue_id            = (int) $post->ID;
	$parent_id           = (int) $post->post_parent;
	$parent_issue        = $parent_id > 0 ? alpaca_assert_issue_exists( $parent_id ) : null;
	$parent_issue_title  = '';
	$parent_issue_status = '';

	if ( $parent_issue ) {
		$parent_issue_title  = alpaca_get_deleted_issue_display_title( $parent_issue );
		$parent_issue_status = (string) $parent_issue->post_status;
	}

	$created_at = '';
	if ( is_string( $post->post_date_gmt ) && '0000-00-00 00:00:00' !== $post->post_date_gmt ) {
		$created_at = $post->post_date_gmt;
	} elseif ( is_string( $post->post_date ) ) {
		$created_at = $post->post_date;
	}

	$last_action = alpaca_get_deleted_issue_last_action_data( $issue_id );

	return [
		'id'                => $issue_id,
		'title'             => alpaca_get_deleted_issue_display_title( $post ),
		'parentId'          => $parent_id,
		'parentTitle'       => 'trash' !== $parent_issue_status ? $parent_issue_title : '',
		'isCompleted'       => ! empty( get_post_meta( $issue_id, 'alpaca_subissue_completed', true ) ),
		'labels'            => alpaca_get_deleted_issue_labels( $issue_id ),
		'createdAt'         => $created_at,
		'createdAtIsGmt'    => is_string( $post->post_date_gmt ) && '0000-00-00 00:00:00' !== $post->post_date_gmt,
		'lastActionAt'      => isset( $last_action['value'] ) ? (string) $last_action['value'] : '',
		'lastActionAtIsGmt' => ! empty( $last_action['is_gmt'] ),
		'hideFromList'      => $parent_id > 0 && 'trash' === $parent_issue_status,
	];
}

/**
 * Get a sortable timestamp for a deleted issue list item.
 *
 * @param array<string, mixed> $item_data Deleted issue response item.
 * @return int Unix timestamp.
 */
function alpaca_get_deleted_issue_sort_timestamp( $item_data ) {
	$timestamp_value = '';
	$is_gmt          = false;

	if ( isset( $item_data['lastActionAt'] ) && is_string( $item_data['lastActionAt'] ) && '' !== trim( $item_data['lastActionAt'] ) ) {
		$timestamp_value = trim( $item_data['lastActionAt'] );
		$is_gmt          = ! empty( $item_data['lastActionAtIsGmt'] );
	} elseif ( isset( $item_data['createdAt'] ) && is_string( $item_data['createdAt'] ) && '' !== trim( $item_data['createdAt'] ) ) {
		$timestamp_value = trim( $item_data['createdAt'] );
		$is_gmt          = ! empty( $item_data['createdAtIsGmt'] );
	}

	if ( '' === $timestamp_value ) {
		return 0;
	}

	$timestamp = $is_gmt
		? strtotime( $timestamp_value . ' UTC' )
		: strtotime( $timestamp_value );

	return false === $timestamp ? 0 : (int) $timestamp;
}

/**
 * Return deleted items with exact totals and pagination.
 *
 * @param WP_REST_Request $request REST request object.
 * @return WP_REST_Response
 */
function alpaca_get_deleted_items_callback( WP_REST_Request $request ) {
	$search_term = trim( (string) $request->get_param( 'search' ) );
	$page        = max( 1, (int) $request->get_param( 'page' ) );
	$per_page    = max( 1, min( 100, (int) $request->get_param( 'per_page' ) ) );

	$query_args = [
		'post_type'           => 'alpaca_issue',
		'post_status'         => 'trash',
		'posts_per_page'      => -1,
		'orderby'             => 'date',
		'order'               => 'DESC',
		'fields'              => 'ids',
		'no_found_rows'       => true,
		'ignore_sticky_posts' => true,
	];

	if ( '' !== $search_term ) {
		$query_args['s'] = $search_term;
	}

	$query         = new WP_Query( $query_args );
	$visible_items = [];

	foreach ( (array) $query->posts as $issue_id ) {
		$post = get_post( (int) $issue_id );
		if ( ! ( $post instanceof WP_Post ) ) {
			continue;
		}

		$item_data = alpaca_get_deleted_issue_response_data( $post );
		if ( empty( $item_data ) || ! empty( $item_data['hideFromList'] ) ) {
			continue;
		}

		unset( $item_data['hideFromList'] );
		$visible_items[] = $item_data;
	}

	usort(
		$visible_items,
		static function ( $left, $right ) {
			$left_timestamp  = alpaca_get_deleted_issue_sort_timestamp( $left );
			$right_timestamp = alpaca_get_deleted_issue_sort_timestamp( $right );

			if ( $left_timestamp === $right_timestamp ) {
				$left_id  = isset( $left['id'] ) ? (int) $left['id'] : 0;
				$right_id = isset( $right['id'] ) ? (int) $right['id'] : 0;

				return $right_id <=> $left_id;
			}

			return $right_timestamp <=> $left_timestamp;
		}
	);

	$total_items = count( $visible_items );
	$total_pages = max( 1, (int) ceil( $total_items / $per_page ) );
	$page        = min( $page, $total_pages );
	$offset      = ( $page - 1 ) * $per_page;
	$paged_items = array_slice( $visible_items, $offset, $per_page );

	return alpaca_rest_response(
		'',
		[
			'success'    => true,
			'items'      => array_values( $paged_items ),
			'pagination' => [
				'page'       => $page,
				'perPage'    => $per_page,
				'totalItems' => $total_items,
				'totalPages' => $total_pages,
			],
		],
		200
	);
}

/*
 * Issue: restore endpoint.
 */
add_action( 'rest_api_init', 'alpaca_register_restore_issue_endpoint' );
/**
 * Register issue restore endpoint.
 */
function alpaca_register_restore_issue_endpoint() {
	register_rest_route(
		'alpaca/v1',
		'/restore/(?P<id>\d+)',
		[
			'methods'             => 'POST',
			'callback'            => 'alpaca_restore_issue_callback',
			'permission_callback' => function ( WP_REST_Request $request ) {
				return \Alpaca\Inc\Helpers::validate_rest_nonce_permission(
					$request,
					'manage_options'
				);
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
 * Restore a trashed issue and report any checklist items auto-restored with it.
 *
 * @param WP_REST_Request $request REST request object.
 * @return WP_REST_Response
 */
function alpaca_restore_issue_callback( WP_REST_Request $request ) {
	$issue_id = (int) $request['id'];
	$post     = alpaca_assert_issue_exists( $issue_id );

	if ( ! $post ) {
		return alpaca_rest_response(
			'',
			[
				'success' => false,
				'message' => esc_html__( 'Issue not found.', 'alpaca' ),
			],
			404
		);
	}

	if ( 'trash' !== (string) $post->post_status ) {
		return alpaca_rest_response(
			'',
			[
				'success' => false,
				'message' => esc_html__( 'Issue is not in trash.', 'alpaca' ),
			],
			400
		);
	}

	$parent_issue       = null;
	$parent_issue_id    = (int) $post->post_parent;
	$parent_issue_title = '';

	if ( $parent_issue_id > 0 ) {
		$parent_issue = alpaca_assert_issue_exists( $parent_issue_id );

		if ( $parent_issue ) {
			$parent_issue_title = alpaca_get_deleted_issue_display_title( $parent_issue );

			if ( 'trash' === (string) $parent_issue->post_status ) {
				return alpaca_rest_response(
					'',
					[
						'success' => false,
						'message' => esc_html__( 'Checklist items cannot be restored while their parent issue is still deleted.', 'alpaca' ),
					],
					400
				);
			}
		}
	}

	$untrash_result = wp_untrash_post( $issue_id );
	if ( ! $untrash_result ) {
		return alpaca_rest_response(
			'',
			[
				'success' => false,
				'message' => esc_html__( 'Failed to restore the issue.', 'alpaca' ),
			],
			500
		);
	}

	$update_result = wp_update_post(
		[
			'ID'          => $issue_id,
			'post_status' => 'publish',
		],
		true
	);

	if ( is_wp_error( $update_result ) ) {
		return alpaca_rest_response(
			'',
			[
				'success' => false,
				'message' => esc_html__( 'Failed to restore the issue.', 'alpaca' ),
			],
			500
		);
	}

	return alpaca_rest_response(
		'',
		[
			'success'        => true,
			'message'        => esc_html__( 'Issue restored successfully.', 'alpaca' ),
			'restored_issue' => [
				'id'           => $issue_id,
				'title'        => alpaca_get_deleted_issue_display_title( get_post( $issue_id ) ),
				'parent_id'    => $parent_issue_id,
				'parent_title' => $parent_issue_title,
			],
		],
		200
	);
}

/*
 * Issue: delete endpoint.
 */
add_action( 'rest_api_init', 'alpaca_delete_issue' );
/**
 * Register issue DELETE endpoint.
 */
function alpaca_delete_issue() {
	register_rest_route(
		'alpaca/v1',
		'/delete/(?P<id>\d+)',
		[
			'methods'             => 'DELETE',
			'callback'            => 'alpaca_delete_issue_callback',
			'permission_callback' => function ( WP_REST_Request $request ) {
				$post_id = (int) $request['id'];
				return \Alpaca\Inc\Helpers::validate_rest_nonce_permission(
					$request,
					'delete_issue',
					[
						'post_id' => $post_id,
					]
				);
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
 * Callback for issue DELETE endpoint.
 *
 * @param WP_REST_Request $request REST request object.
 * @return WP_REST_Response REST response.
 */
function alpaca_delete_issue_callback( WP_REST_Request $request ) {
	$issue_id = (int) $request['id'];
	$post     = alpaca_assert_issue_exists( $issue_id );

	if ( ! $post ) {
		return alpaca_rest_response(
			'',
			[
				'success' => false,
				'message' => esc_html__( 'Issue not found.', 'alpaca' ),
			],
			404
		);
	}

	$result = wp_trash_post( $issue_id );
	// Note: restoring from Trash puts the issue in Draft.
	if ( ! $result ) {
		return alpaca_rest_response(
			'',
			[
				'success' => false,
				'message' => esc_html__( 'Failed to trash the issue.', 'alpaca' ),
			],
			500
		);
	}

	return alpaca_rest_response(
		'issue_trash',
		[
			'success' => true,
			'message' => esc_html__( 'Issue trashed successfully.', 'alpaca' ),
		],
		200
	);
}
