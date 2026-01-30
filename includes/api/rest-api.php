<?php
// phpcs:ignoreFile WordPress.WP.AlternativeFunctions.file_operations_file_put_contents
/**
 * Alpaca Issues – REST Endpoints.
 *
 * @package Alpaca
 */

/*
 * Bootstrapping: expose wpApiSettings (unchanged behavior).
 */
add_action(
	'init',
	function () {
		wp_localize_script(
			'wp-api',
			'wpApiSettings',
			[
				'root'  => esc_url_raw( rest_url() ),
				'nonce' => wp_create_nonce( 'wp_rest' ),
			]
		);
		wp_enqueue_script( 'wp-api' );
	}
);

/*
 * Small utilities (pure helpers; no side effects).
 */

/**
 * Uniform REST response wrapper.
 *
 * @param string $action_type Optional. Action identifier used to build the dynamic hook name.
 * @param mixed  $data        Response data.
 * @param int    $status      HTTP status code. Default 200.
 *
 * @return WP_REST_Response REST response object.
 */
function alpaca_rest_response( $action_type, $data, $status = 200 ) {
	$status = (int) $status;
	$action_type = is_string( $action_type ) ? trim( $action_type ) : '';

	do_action( 'alpaca_rest_response', $action_type, $data, $status );

	if ( $action_type !== '' ) {
		if ( $status >= 200 && $status < 300 ) {
			do_action( 'alpaca_rest_' . $action_type, $data, $status );
		} else {
			do_action( 'alpaca_rest_error_' . $action_type, $data, $status );
		}
	}

	$response = new WP_REST_Response( $data, $status );

	return apply_filters(
		'alpaca_rest_response_object',
		$response,
		$action_type,
		$data,
		$status
	);
}

/**
 * Get safe array value with default fallback.
 *
 * @param array $arr     Array to search.
 * @param array $path    Path to traverse (array of keys).
 * @param mixed $def     Default value if path not found.
 * @return mixed Value at path or default.
 */
function alpaca_arr_get( $arr, $path, $def = null ) { // phpcs:disable-line WordPress.NamingConventions.ValidParameterName.VariableNotSnakeCase
	$ref = $arr;
	foreach ( (array) $path as $key ) {
		if ( is_array( $ref ) && array_key_exists( $key, $ref ) ) {
			$ref = $ref[ $key ];
		} else {
			return $def;
		}
	}
	return $ref;
}

/**
 * Cast to integer array and deduplicate.
 *
 * @param mixed $vals Values to convert.
 * @return array Array of unique integers.
 */
function alpaca_to_int_ids( $vals ) {
	$vals = array_map( 'intval', (array) $vals );
	return array_values(
		array_unique(
			array_filter(
				$vals,
				static function ( $v ) {
					return $v > 0;
				}
			)
		)
	);
}

/**
 * Get avatar URL for a user.
 *
 * @param int $user_id User ID.
 * @param int $size    Avatar size in pixels.
 * @return string Avatar URL.
 */
function alpaca_avatar( $user_id, $size = 24 ) {
	return get_avatar_url( (int) $user_id, [ 'size' => (int) $size ] );
}

/**
 * Verify a post is an issue and return it.
 *
 * @param int $post_id Post ID to check.
 * @return WP_Post|null Post object if valid issue, null otherwise.
 */
function alpaca_assert_issue_exists( $post_id ) {
	$post = get_post( (int) $post_id );
	return ( $post && 'alpaca_issue' === $post->post_type ) ? $post : null;
}

/**
 * Generates a consistent issue object for REST responses.
 *
 * @param int|WP_Post $issue      Issue post ID or object.
 * @param array       $override_data Optional data to override fetched values.
 *
 * @return array The issue data structure for API responses.
 */
function alpaca_get_issue_response_data( $issue, $override_data = [] ) {
	$post = get_post( $issue );
	if ( ! $post ) {
		return [];
	}

	$post_id   = $post->ID;
	$author_id = (int) $post->post_author;

	// Get high priority status.
	$is_high_priority = ! empty( get_post_meta( $post_id, 'alpaca_high_priority', true ) );
	if ( isset( $override_data['is_high_priority'] ) ) {
		$is_high_priority = (bool) $override_data['is_high_priority'];
	}

	// Get status term ID.
	$status_term_id = null;
	if ( isset( $override_data['statusId'] ) ) {
		$status_term_id = (int) $override_data['statusId'];
	} else {
		$terms = wp_get_post_terms( $post_id, 'alpaca_status', [ 'fields' => 'ids' ] );
		if ( ! is_wp_error( $terms ) && ! empty( $terms ) ) {
			$status_term_id = (int) $terms[0];
		}
	}

	$title = isset( $override_data['title'] ) ? $override_data['title'] : $post->post_title;

	return [
		'post_id'  => $post_id,
		'issue'    => [
			'id'          => $post_id,
			'title'       => $title,
			'author_id'   => $author_id,
			'author_name' => get_the_author_meta( 'display_name', $author_id ),
			'author_img'  => alpaca_avatar( $author_id, 24 ),
			'meta'        => [
				'alpaca_high_priority' => $is_high_priority,
			],
		],
		'statusId' => $status_term_id,
	];
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
			'permission_callback' => function () {
				return \Alpaca\Inc\Helpers::user_can( 'create_issue' );
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
	$user_id         = (int) alpaca_arr_get( $payload, [ 'user', 'id' ], get_current_user_id() );
	$feedback_raw    = (string) alpaca_arr_get( $payload, [ 'userinput', 'feedback' ], '' );
	$include_ctx     = (bool) alpaca_arr_get( $payload, [ 'userinput', 'includeContext' ], false );
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
				'message' => esc_html__( 'Failed to create the issue post.', 'alpaca' ),
			],
			500
		);
	}

	$status_term_id = 0;
	$statuses       = alpaca_get_statuses();
	if ( ! empty( $statuses ) && ! is_wp_error( $statuses ) ) {
		$status_term = null;
		$min_score   = PHP_INT_MAX;

		// Find the status with the lowest score
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

		update_post_meta( $post_id, 'alpaca_screenshot', (string) alpaca_arr_get( $payload, [ 'screenshot' ], '' ) );
		update_post_meta( $post_id, 'alpaca_screenwidth', (int) alpaca_arr_get( $payload, [ 'client', 'browser', 'width' ], 0 ) );
		update_post_meta( $post_id, 'alpaca_screenheight', (int) alpaca_arr_get( $payload, [ 'client', 'browser', 'height' ], 0 ) );
		update_post_meta( $post_id, 'alpaca_url', (string) alpaca_arr_get( $payload, [ 'server', 'REQUEST_URI' ], '' ) );

		$qo = alpaca_arr_get( $payload, [ 'wp', 'queriedObject' ], null );
		if ( is_array( $qo ) ) {
			// Avoid storing post_content.
			if ( array_key_exists( 'post_content', $qo ) ) {
				unset( $qo['post_content'] );
			}

			update_post_meta( $post_id, 'alpaca_queried_object', $qo );
		}

		$headers = alpaca_arr_get( $payload, [ 'headers' ], null );
		if ( is_array( $headers ) ) {
			update_post_meta( $post_id, 'alpaca_headers', $headers );
		}

		// Parent link when singular.
		if ( in_array( 'singular', $wp_types, true ) ) {
			$parent_id = (int) alpaca_arr_get( $payload, [ 'wp', 'queriedObject', 'ID' ], 0 );
			if ( $parent_id > 0 ) {
				wp_update_post(
					[
						'ID'          => $post_id,
						'post_parent' => $parent_id,
					]
				);
			}
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
 * Board: get + update endpoints.
 */
add_action( 'rest_api_init', 'alpaca_get_board' );
/**
 * Register the board GET endpoint.
 */
function alpaca_get_board() {
	register_rest_route(
		'alpaca/v1',
		'/board',
		[
			'methods'             => 'GET',
			'callback'            => 'alpaca_get_board_data_callback',
			'permission_callback' => function () {
				return \Alpaca\Inc\Helpers::user_can( 'get_statuses' );
			},
		]
	);
}

/**
 * Callback for board GET endpoint.
 *
 * @return WP_REST_Response REST response with board data.
 */
function alpaca_get_board_data_callback() {
	$board_data = alpaca_get_board_data();
	return alpaca_rest_response( '', $board_data, 200 );
}

add_action( 'rest_api_init', 'alpaca_update_board' );
/**
 * Register the board UPDATE endpoint.
 */
function alpaca_update_board() {
	register_rest_route(
		'alpaca/v1',
		'/board',
		[
			'methods'             => 'POST',
			'callback'            => 'alpaca_update_board_data_callback',
			'permission_callback' => function () {
				return \Alpaca\Inc\Helpers::user_can( 'update_status' );
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
function alpaca_update_board_data_callback( WP_REST_Request $request ) {
	$columns = $request->get_json_params();

	if ( ! is_array( $columns ) ) {
		return alpaca_rest_response(
			'',
			[
				'success' => false,
				'message' => esc_html__( 'Invalid data format. Expected an array of columns.', 'alpaca' ),
			],
			400
		);
	}

	foreach ( $columns as $column ) {
		if ( ! is_array( $column ) ) {
			continue;
		}
		$term_id   = (int) ( $column['id'] ?? 0 );
		$issue_ids = alpaca_to_int_ids( $column['issues'] ?? [] );

		if ( $term_id > 0 ) {
			update_term_meta( $term_id, 'issue_order', $issue_ids );
		}
	}

	return alpaca_rest_response(
		'board_update',
		[
			'success' => true,
			'message' => esc_html__( 'Board order saved successfully.', 'alpaca' ),
		],
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
			'permission_callback' => function () {
				return \Alpaca\Inc\Helpers::user_can( 'get_issue' );
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

			// Map old taxonomy names to new ones if necessary (for backward compat in JS payload)
			if ( 'status' === $taxonomy ) $taxonomy = 'alpaca_status';
			if ( 'assignee' === $taxonomy ) $taxonomy = 'alpaca_assignee';

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

					$existing = get_term_by( 'slug', $user->user_nicename, 'alpaca_assignee' );
					if ( ! $existing ) {
						$inserted = wp_insert_term(
							$user->display_name,
							'alpaca_assignee',
							[
								'slug'        => $user->user_nicename,
								'description' => $user->user_login,
							]
						);
						$term_id  = is_wp_error( $inserted ) ? 0 : (int) ( is_array( $inserted ) ? $inserted['term_id'] : $inserted );
					} else {
						$term_id = (int) $existing->term_id;
					}
					if ( $term_id > 0 ) {
						$term_ids[] = $term_id;
					}
				}
				wp_set_post_terms( $issue_id, alpaca_to_int_ids( $term_ids ), 'alpaca_assignee', false );
			} else {
				$term_ids = alpaca_to_int_ids( $terms );
				wp_set_post_terms( $issue_id, $term_ids, $taxonomy, false );
			}
		}
	}

	// Meta.
	if ( isset( $data['meta'] ) && is_array( $data['meta'] ) ) {
		foreach ( $data['meta'] as $meta_key => $meta_value ) {
			$key = sanitize_key( (string) $meta_key );
			// Prefix meta keys
			if ( ! str_starts_with( $key, 'alpaca_' ) ) {
				$key = 'alpaca_' . $key;
			}
			update_post_meta( $issue_id, $key, maybe_serialize( $meta_value ) );
		}
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
		$status_terms = $tax_data['status'] ?? $tax_data['alpaca_status'] ?? null;
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
		[
			[
				'methods'             => 'GET',
				'callback'            => 'alpaca_get_default_status_option',
				'permission_callback' => function () {
					return \Alpaca\Inc\Helpers::user_can( 'manage_options' );
				},
			],
			[
				'methods'             => 'POST',
				'callback'            => 'alpaca_update_default_status_option',
				'permission_callback' => function () {
					return \Alpaca\Inc\Helpers::user_can( 'manage_options' );
				},
				'args'                => [
					'value' => [
						'required'          => true,
						'validate_callback' => function ( $param ) {
							return is_numeric( $param ) || '' === $param;
						},
					],
				],
			],
		]
	);
}

/**
 * Get default status option.
 *
 * @return WP_REST_Response REST response with default status ID.
 */
function alpaca_get_default_status_option() {
	$default_status_id = get_option( 'alpaca_default_status_id', '' );
	return alpaca_rest_response( '', [ 'value' => $default_status_id ], 200 );
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
		[
			'success' => true,
			'value'   => $new_val,
		],
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
		[
			'methods'             => 'POST',
			'callback'            => 'alpaca_restore_default_statuses_callback',
			'permission_callback' => function () {
				return \Alpaca\Inc\Helpers::user_can( 'restore_statuses' );
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

	$meta           = get_post_meta( $issue_id );
	$formatted_meta = [];
	foreach ( $meta as $key => $value ) {
		// PHP 7 compat: avoid str_starts_with.
		if ( 0 === strpos( $key, '_' ) ) {
			continue;
		}

		$formatted_meta[ $key ] = maybe_unserialize( $value[0] );
	}

	$all_taxonomies = get_object_taxonomies( 'alpaca_issue', 'objects' );
	$terms_data     = [];
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

		$terms_data[ $taxonomy_obj->name ] = $terms;
	}

	if ( isset( $terms_data['alpaca_status'] ) ) $terms_data['status'] = $terms_data['alpaca_status'];
	if ( isset( $terms_data['alpaca_assignee'] ) ) $terms_data['assignee'] = $terms_data['alpaca_assignee'];

	$issue_comment_count = get_comments(
		[
			'post_id' => $issue_id,
			'type'    => 'issuecomment',
			'count'   => true,
		]
	);

	return alpaca_rest_response(
		'',
		[
			'success'       => true,
			'message'       => esc_html__( 'Issue data retrieved successfully.', 'alpaca' ),
			'post_id'       => $issue_id,
			'post_data'     => $post_data,
			'meta'          => $formatted_meta,
			'taxonomies'    => $terms_data,
			'comment_count' => (int) $issue_comment_count,
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
	$issue_id = (int) $request['id'];

	global $wpdb;
	// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
	$issue_comment_count = $wpdb->get_var(
		$wpdb->prepare(
			"SELECT COUNT(*) FROM {$wpdb->comments} 
		WHERE comment_post_ID = %d AND comment_type = %s AND comment_approved = 1",
			$issue_id,
			'issuecomment'
		)
	);

	return alpaca_rest_response(
		'',
		[
			'success'       => true,
			'post_id'       => $issue_id,
			'comment_count' => (int) $issue_comment_count,
		],
		200
	);
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
			'permission_callback' => function () {
				return \Alpaca\Inc\Helpers::user_can( 'watchlist' );
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
	$watchlist = get_user_meta( $user_id, 'alpaca_watchlist', true );
	$watchlist = alpaca_to_int_ids( is_array( $watchlist ) ? $watchlist : [] );

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
	$params             = $request->get_json_params();
	$issue_id           = isset( $params['issue_id'] ) ? (int) $params['issue_id'] : 0;
	$user_id            = get_current_user_id();
	$original_watchlist = get_user_meta( $user_id, 'alpaca_watchlist', true );
	$original_watchlist = is_array( $original_watchlist ) ? $original_watchlist : [];
	$watchlist          = alpaca_to_int_ids( $original_watchlist );

	if ( $issue_id > 0 ) {
		if ( in_array( $issue_id, $watchlist, true ) ) {
			$watchlist = array_values( array_diff( $watchlist, [ $issue_id ] ) );
		} else {
			$watchlist[] = $issue_id;
		}
		update_user_meta( $user_id, 'alpaca_watchlist', $watchlist, $original_watchlist );
	}

	return alpaca_rest_response(
		'watchlist_update',
		[
			'success'   => true,
			'watchlist' => $watchlist,
		],
		200
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
				return \Alpaca\Inc\Helpers::user_can( 'get_statuses' );
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
			'permission_callback' => function () {
				return \Alpaca\Inc\Helpers::user_can( 'update_status' );
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
	$data    = $request->get_json_params();

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
		$new_name = (string) $data['name'];
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

	if ( array_key_exists( 'term_score', (array) $data ) ) {
		update_term_meta( $term_id, 'term_score', $data['term_score'] );
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
				return \Alpaca\Inc\Helpers::user_can( 'delete_post', array( 'post_id' => $post_id ) );
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

/**
 * Register comment meta fields for REST API.
 */
function alpaca_register_comment_meta_fields() {
	register_meta(
		'comment',
		'alpacaCommentTags',
		[
			'type'          => 'array',
			'description'   => 'Comment tags for Alpaca issues.',
			'single'        => true,
			'show_in_rest'  => [
				'schema' => [
					'type'  => 'array',
					'items' => [
						'type' => 'string',
					],
				],
			],
			'auth_callback' => function () {
				return \Alpaca\Inc\Helpers::user_can( 'register_comment_meta' );
			},
		]
	);
}
add_action( 'rest_api_init', 'alpaca_register_comment_meta_fields' );

/**
 * Allow Contributors to interact with Alpaca issue comments via core REST endpoints.
 *
 * - Adjust permission callbacks for the core `/wp/v2/comments` route when
 *   `comment_type=issuecomment` so Contributors can list/create issue comments.
 * - Force-approve issue comments server-side to avoid REST field-level capability
 *   rejections when the client requests `status=approve`.
 */
add_filter(
	'rest_endpoints',
	function ( $endpoints ) {
		if ( empty( $endpoints['/wp/v2/comments'] ) ) {
			return $endpoints;
		}

		foreach ( $endpoints['/wp/v2/comments'] as $idx => $route ) {
			$methods = isset( $route['methods'] ) ? $route['methods'] : '';
			$methods_normalized = is_array( $methods ) ? $methods : explode( ',', (string) $methods );

			// Only patch collection-level routes (POST for create, GET for list).
			if ( in_array( 'POST', $methods_normalized, true ) || in_array( 'GET', $methods_normalized, true ) ) {
				$original = $route['permission_callback'] ?? null;

				$endpoints['/wp/v2/comments'][ $idx ]['permission_callback'] = function ( $request ) use ( $original ) {
					$comment_type = (string) $request->get_param( 'comment_type' );
					$post_id      = (int) $request->get_param( 'post' );

					// If this is an Alpaca issue comment, allow based on our helper.
					if ( 'issuecomment' === $comment_type ) {
						// Allow listing/creating issue comments for Contributors by default.
						if ( \Alpaca\Inc\Helpers::user_can( 'watchlist' ) || \Alpaca\Inc\Helpers::user_can( 'create_issue' ) ) {
							return true;
						}
					}

					// Fall back to original permission callback if present.
					if ( is_callable( $original ) ) {
						return call_user_func( $original, $request );
					}

					return false;
				};
			}
		}

		return $endpoints;
	},
	10,
	1
);

/**
 * Ensure Alpaca issue comments can be created as approved by Contributors.
 * Modify the prepared comment before insertion via the REST API.
 */
add_filter( 'rest_pre_insert_comment', function ( $prepared_comment, $request, $creating ) {
	$comment_type = (string) $request->get_param( 'comment_type' );
	if ( 'issuecomment' === $comment_type && \Alpaca\Inc\Helpers::user_can( 'create_issue' ) ) {
		// Remove 'status' if provided to avoid the REST field-level permission
		// check that would block Contributors from setting `status` on comments.
		if ( isset( $prepared_comment['status'] ) ) {
			unset( $prepared_comment['status'] );
		}
	}
	return $prepared_comment;
}, 10, 3 );

/**
 * Intercept POST requests to the core comments endpoint for Alpaca issue comments
 * so we can create them server-side (approved) without triggering field-level
 * permission checks for the `status` property.
 */
add_filter( 'rest_pre_dispatch', function ( $maybe_a = null, $maybe_b = null, $maybe_c = null ) {
	// Robustly detect WP_REST_Request and WP_REST_Server regardless of
	// argument ordering to avoid calling methods on the wrong object.
	$pre_dispatch = null;
	$request = null;
	$server = null;

	foreach ( array( $maybe_a, $maybe_b, $maybe_c ) as $arg ) {
		if ( is_null( $arg ) ) {
			continue;
		}
		if ( $arg instanceof WP_REST_Request ) {
			$request = $arg;
			continue;
		}
		if ( $arg instanceof WP_REST_Server ) {
			$server = $arg;
			continue;
		}
		$pre_dispatch = $arg;
	}

	if ( ! $request instanceof WP_REST_Request ) {
		return $pre_dispatch;
	}

	// Only intercept POSTs to the collection route for comments.
	$method = strtoupper( $request->get_method() );
	if ( 'POST' !== $method ) {
		return $pre_dispatch;
	}

	$route = $request->get_route();
	if ( '/wp/v2/comments' !== $route ) {
		return $pre_dispatch;
	}

	$comment_type = (string) $request->get_param( 'comment_type' );
	if ( 'issuecomment' !== $comment_type ) {
		return $pre_dispatch;
	}

	if ( ! \Alpaca\Inc\Helpers::user_can( 'create_issue' ) ) {
		return new WP_Error( 'rest_forbidden', esc_html__( 'Sorry, you are not allowed to create comments.', 'alpaca' ), array( 'status' => 403 ) );
	}

	$post_id = (int) $request->get_param( 'post' );
	if ( $post_id <= 0 ) {
		return new WP_Error( 'rest_invalid', esc_html__( 'Invalid post ID.', 'alpaca' ), array( 'status' => 400 ) );
	}

	$content = $request->get_param( 'content' );
	$content_raw = '';
	if ( is_array( $content ) ) {
		$content_raw = isset( $content['raw'] ) ? (string) $content['raw'] : '';
	} else {
		$content_raw = (string) $content;
	}

	if ( '' === trim( $content_raw ) ) {
		return new WP_Error( 'rest_invalid', esc_html__( 'Comment content is required.', 'alpaca' ), array( 'status' => 400 ) );
	}

	$commentdata = array(
		'comment_post_ID' => $post_id,
		'comment_content' => wp_kses_post( $content_raw ),
		'comment_type'    => 'issuecomment',
		'user_id'         => get_current_user_id(),
		'comment_approved'=> 1,
	);

	$meta = $request->get_param( 'meta' );

	$new_id = wp_insert_comment( $commentdata );
	if ( ! $new_id || is_wp_error( $new_id ) ) {
		return new WP_Error( 'rest_insert_failed', esc_html__( 'Failed to create comment.', 'alpaca' ), array( 'status' => 500 ) );
	}

	if ( is_array( $meta ) && isset( $meta['alpacaCommentTags'] ) ) {
		update_comment_meta( $new_id, 'alpacaCommentTags', maybe_serialize( $meta['alpacaCommentTags'] ) );
	}

	if ( ! class_exists( 'WP_REST_Comments_Controller' ) ) {
		require_once ABSPATH . WPINC . '/rest-api/endpoints/class-wp-rest-comments-controller.php';
	}

	$controller = new WP_REST_Comments_Controller();
	$comment_obj = get_comment( $new_id );
	$response = $controller->prepare_item_for_response( $comment_obj, $request );

	return rest_ensure_response( $response );
}, 10, 3 );

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
			'permission_callback' => function () {
				return \Alpaca\Inc\Helpers::user_can( 'update_issue' );
			},
        ]
    );
}

/**
 * Handle presence ping: update transient of active users and return other present user IDs.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response
 */
function alpaca_update_presence_callback( WP_REST_Request $request ) {
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

    // Build list of other user IDs
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
                'id'           => (int) $u->ID,
                'display_name' => $u->display_name,
                'user_nicename'=> $u->user_nicename,
                'avatar'       => alpaca_avatar( $u->ID, 48 ),
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
