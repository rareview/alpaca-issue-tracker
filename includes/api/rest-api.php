<?php
// phpcs:ignoreFile WordPress.WP.AlternativeFunctions.file_operations_file_put_contents
/**
 * Alpaca Issues – REST Endpoints.
 *
 * @package Alpaca
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Build request origin details from the current HTTP request.
 *
 * @return array{scheme:string,host:string,port:int|null,origin:string}
 */
function alpaca_get_request_origin_parts() {
	$scheme = is_ssl() ? 'https' : 'http';
	$host_header = isset( $_SERVER['HTTP_HOST'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_HOST'] ) ) : '';

	if ( '' === $host_header ) {
		return [
			'scheme' => $scheme,
			'host'   => '',
			'port'   => null,
			'origin' => '',
		];
	}

	$parsed_host = wp_parse_url( $scheme . '://' . $host_header );
	if ( ! is_array( $parsed_host ) || empty( $parsed_host['host'] ) ) {
		return [
			'scheme' => $scheme,
			'host'   => '',
			'port'   => null,
			'origin' => '',
		];
	}

	$request_host = (string) $parsed_host['host'];
	$request_port = isset( $parsed_host['port'] ) ? (int) $parsed_host['port'] : null;

	return [
		'scheme' => $scheme,
		'host'   => $request_host,
		'port'   => $request_port,
		'origin' => $scheme . '://' . $host_header,
	];
}

/**
 * When REST root host matches current request host, align scheme/port to request origin.
 *
 * @param string $rest_root REST root URL.
 * @return string
 */
function alpaca_align_rest_root_to_request_origin( $rest_root ) {
	$rest_root = is_string( $rest_root ) ? trim( $rest_root ) : '';
	if ( '' === $rest_root ) {
		return esc_url_raw( rest_url() );
	}

	$request_parts = alpaca_get_request_origin_parts();
	if ( '' === $request_parts['origin'] ) {
		return $rest_root;
	}

	$rest_parts = wp_parse_url( $rest_root );
	if ( ! is_array( $rest_parts ) || empty( $rest_parts['host'] ) ) {
		return $rest_root;
	}

	$rest_host = strtolower( (string) $rest_parts['host'] );
	$request_host = strtolower( (string) $request_parts['host'] );
	if ( '' === $request_host || $rest_host !== $request_host ) {
		return $rest_root;
	}

	$path = isset( $rest_parts['path'] ) ? (string) $rest_parts['path'] : '/wp-json/';
	if ( '' === $path ) {
		$path = '/wp-json/';
	}

	$aligned = $request_parts['origin'] . $path;
	if ( isset( $rest_parts['query'] ) && '' !== $rest_parts['query'] ) {
		$aligned .= '?' . $rest_parts['query'];
	}
	if ( isset( $rest_parts['fragment'] ) && '' !== $rest_parts['fragment'] ) {
		$aligned .= '#' . $rest_parts['fragment'];
	}

	return $aligned;
}

/**
 * Resolve localized wpApiSettings root and custom-root flag.
 *
 * @return array{root:string,has_custom_root:bool}
 */
function alpaca_get_wp_api_settings_root_data() {
	$default_root = esc_url_raw( rest_url() );
	$filtered_root = apply_filters(
		'alpaca_rest_api_root',
		$default_root,
		[
			'default_root' => $default_root,
			'request'      => alpaca_get_request_origin_parts(),
		]
	);

	$filtered_root = is_string( $filtered_root ) ? trim( $filtered_root ) : '';
	if ( '' === $filtered_root ) {
		$filtered_root = $default_root;
	}

	$has_custom_root = untrailingslashit( $filtered_root ) !== untrailingslashit( $default_root );
	$resolved_root = $has_custom_root ? $filtered_root : alpaca_align_rest_root_to_request_origin( $filtered_root );

	return [
		'root'            => esc_url_raw( trailingslashit( $resolved_root ) ),
		'has_custom_root' => $has_custom_root,
	];
}

/*
 * Bootstrapping: expose wpApiSettings for frontend REST requests.
 */
add_action(
	'init',
	function () {
		$root_data = alpaca_get_wp_api_settings_root_data();

		wp_localize_script(
			'wp-api',
			'wpApiSettings',
			[
				'root'                => $root_data['root'],
				'nonce'               => wp_create_nonce( 'wp_rest' ),
				'alpacaHasCustomRoot' => (bool) $root_data['has_custom_root'],
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
			'slug'        => (string) $post->post_name,
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

			// Map old taxonomy names to new ones if necessary (for backward compat in JS payload)
			if ( 'status' === $taxonomy ) {
				$taxonomy = 'alpaca_status';
			}
			if ( 'assignee' === $taxonomy ) {
				$taxonomy = 'alpaca_assignee';
			}
			
			if ( 'label' === $taxonomy ) {
				$taxonomy = 'alpaca_label';
			}

			if ( ! taxonomy_exists( $taxonomy ) ) {
				continue;
			}

			if ( 'alpaca_assignee' === $taxonomy ) {
				$term_ids = array();
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

	// Update last activity since the issue was modified.
	if ( function_exists( 'alpaca_update_last_activity' ) ) {
		alpaca_update_last_activity( $issue_id );
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

/**
 * Format a subissue issue for API responses.
 *
 * @param WP_Post $post Subissue post object.
 * @return array Formatted subissue data.
 */
function alpaca_get_subissue_response_data( WP_Post $post ) {
	$subissue_id = (int) $post->ID;
	$assignees  = [];
	$terms      = wp_get_object_terms( $subissue_id, 'alpaca_assignee', [ 'fields' => 'all' ] );

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
			'success' => true,
			'message' => esc_html__( 'Subissue created successfully.', 'alpaca' ),
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
		if ( 'alpaca_label' === $taxonomy_obj->name ) {
			foreach ( $terms as $idx => $term ) {
				$color = get_term_meta( $term->term_id, 'alpaca_label_color', true );
				if ( ! is_string( $color ) || '' === $color ) {
					$color = '#172b4d';
				}
				$terms[ $idx ]->color = $color;
			}
		}

		$terms_data[ $taxonomy_obj->name ] = $terms;
	}

	if ( isset( $terms_data['alpaca_status'] ) ) {
		$terms_data['status'] = $terms_data['alpaca_status'];
	}
	if ( isset( $terms_data['alpaca_assignee'] ) ) {
		$terms_data['assignee'] = $terms_data['alpaca_assignee'];
	}
	if ( isset( $terms_data['alpaca_label'] ) ) {
		$terms_data['label'] = $terms_data['alpaca_label'];
	}
	if ( isset( $terms_data['alpaca_watching'] ) ) {
		$terms_data['watching'] = $terms_data['alpaca_watching'];
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
			'success'       => true,
			'message'       => esc_html__( 'Issue data retrieved successfully.', 'alpaca' ),
			'post_id'       => $issue_id,
			'post_data'     => $post_data,
			'meta'          => $formatted_meta,
			'taxonomies'    => $terms_data,
			'subissues'      => $subissues,
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
		array(
			array(
				'methods'             => 'GET',
				'callback'            => 'alpaca_get_labels_callback',
				'permission_callback' => function () {
					return \Alpaca\Inc\Helpers::user_can( 'watchlist' );
				},
			),
			array(
				'methods'             => 'POST',
				'callback'            => 'alpaca_create_label_callback',
				'permission_callback' => function () {
					return \Alpaca\Inc\Helpers::user_can( 'manage_options' );
				},
			),
		)
	);

	register_rest_route(
		'alpaca/v1',
		'/label/(?P<id>\d+)',
		array(
			array(
				'methods'             => 'POST',
				'callback'            => 'alpaca_update_label_callback',
				'permission_callback' => function () {
					return \Alpaca\Inc\Helpers::user_can( 'manage_options' );
				},
			),
			array(
				'methods'             => 'DELETE',
				'callback'            => 'alpaca_delete_label_callback',
				'permission_callback' => function () {
					return \Alpaca\Inc\Helpers::user_can( 'manage_options' );
				},
			),
		)
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
		return array();
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
		array(
			'success' => false,
			'message' => esc_html__( 'Label not found.', 'alpaca' ),
		),
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
		array(
			'success' => false,
			'message' => esc_html__( 'Label name is required.', 'alpaca' ),
		),
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

	return array(
		'term_id' => (int) $term->term_id,
		'name'    => (string) $term->name,
		'slug'    => (string) $term->slug,
		'color'   => alpaca_normalize_label_color( $color ),
	);
}

/**
 * Callback for labels GET endpoint.
 *
 * @return WP_REST_Response REST response.
 */
function alpaca_get_labels_callback() {
	$terms = get_terms(
		array(
			'taxonomy'   => 'alpaca_label',
			'hide_empty' => false,
			'orderby'    => 'name',
			'order'      => 'ASC',
		)
	);

	if ( is_wp_error( $terms ) || ! is_array( $terms ) ) {
		return alpaca_rest_response( '', array(), 200 );
	}

	$response_data = array();
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
			array(
				'success' => false,
				'message' => esc_html__( 'Failed to create label.', 'alpaca' ),
			),
			500
		);
	}

	$term_id = (int) $created['term_id'];
	update_term_meta( $term_id, 'alpaca_label_color', $color );

	$term = get_term( $term_id, 'alpaca_label' );
	if ( ! $term || is_wp_error( $term ) ) {
		return alpaca_rest_response(
			'',
			array(
				'success' => false,
				'message' => esc_html__( 'Label created, but could not be loaded.', 'alpaca' ),
			),
			500
		);
	}

	return alpaca_rest_response(
		'label_create',
		array(
			'success' => true,
			'label'   => alpaca_label_response_data( $term ),
		),
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
			array(
				'name' => $name,
				'slug' => sanitize_title( $name ),
			)
		);

		if ( is_wp_error( $updated ) ) {
			return alpaca_rest_response(
				'',
				array(
					'success' => false,
					'message' => esc_html__( 'Failed to update label.', 'alpaca' ),
				),
				500
			);
		}
	}

	if ( isset( $params['color'] ) ) {
		$color = alpaca_normalize_label_color( (string) $params['color'] );
		update_term_meta( $term_id, 'alpaca_label_color', $color );
	}

	$updated_term = get_term( $term_id, 'alpaca_label' );
	if ( ! $updated_term || is_wp_error( $updated_term ) ) {
		return alpaca_rest_response(
			'',
			array(
				'success' => false,
				'message' => esc_html__( 'Failed to load updated label.', 'alpaca' ),
			),
			500
		);
	}

	return alpaca_rest_response(
		'label_update',
		array(
			'success' => true,
			'label'   => alpaca_label_response_data( $updated_term ),
		),
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
			array(
				'success' => false,
				'message' => esc_html__( 'Failed to delete label.', 'alpaca' ),
			),
			500
		);
	}

	return alpaca_rest_response(
		'label_delete',
		array(
			'success' => true,
			'term_id' => $term_id,
		),
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
			array(
				'success' => false,
				'message' => esc_html__( 'User not found.', 'alpaca' ),
			),
			404
		);
	}

	$current_watchlist = alpaca_get_watched_issue_ids_for_user( $user_id );
	$watchlist         = $current_watchlist;

	// Preferred input: set the complete array for this user.
	if ( isset( $params['watchlist'] ) && is_array( $params['watchlist'] ) ) {
		$desired_watchlist = alpaca_to_int_ids( $params['watchlist'] );
		$valid_watchlist   = array();
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
				array(
					'success' => false,
					'message' => esc_html__( 'Could not update watchlist.', 'alpaca' ),
				),
				500
			);
		}

		$to_add    = array_diff( $watchlist, $current_watchlist );
		$to_remove = array_diff( $current_watchlist, $watchlist );

		foreach ( $to_add as $post_id ) {
			wp_set_post_terms( $post_id, array( $term_id ), 'alpaca_watching', true );
		}
		foreach ( $to_remove as $post_id ) {
			wp_remove_object_terms( $post_id, array( $term_id ), 'alpaca_watching' );
		}
	} elseif ( $issue_id > 0 ) {
		// Backward compatible input: toggle one issue ID.
		if ( 'alpaca_issue' !== get_post_type( $issue_id ) ) {
			return alpaca_rest_response(
				'',
				array(
					'success' => false,
					'message' => esc_html__( 'Issue not found.', 'alpaca' ),
				),
				404
			);
		}

		$term_id = alpaca_get_or_create_user_taxonomy_term( $user, 'alpaca_watching' );
		if ( $term_id <= 0 ) {
			return alpaca_rest_response(
				'',
				array(
					'success' => false,
					'message' => esc_html__( 'Could not update watchlist.', 'alpaca' ),
				),
				500
			);
		}

		$is_watching = has_term( $term_id, 'alpaca_watching', $issue_id );
		if ( $is_watching ) {
			wp_remove_object_terms( $issue_id, array( $term_id ), 'alpaca_watching' );
		} else {
			wp_set_post_terms( $issue_id, array( $term_id ), 'alpaca_watching', true );
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

	register_meta(
		'comment',
		'alpacaCommentAttachments',
		[
			'type'          => 'array',
			'description'   => 'Attachment URLs for Alpaca issue comments.',
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
 * Build a standard error response for comment attachment actions.
 *
 * @param string $action_type Action identifier for the response.
 * @param string $message     Error message.
 * @param int    $status      HTTP status code.
 * @return WP_REST_Response REST response object.
 */
function alpaca_comment_attachment_error_response( $action_type, $message, $status ) {
	return alpaca_rest_response(
		$action_type,
		[
			'success' => false,
			'message' => esc_html( $message ),
		],
		$status
	);
}

/**
 * Validate and load the issue for attachment operations.
 *
 * @param int    $issue_id    Issue ID.
 * @param string $action_type Action identifier for the response.
 * @return array{issue: WP_Post|null, response: WP_REST_Response|null} Result array.
 */
function alpaca_get_issue_for_attachment( $issue_id, $action_type ) {
	$issue = alpaca_assert_issue_exists( $issue_id );

	if ( ! $issue ) {
		return [
			'issue'    => null,
			'response' => alpaca_comment_attachment_error_response(
				$action_type,
				__( 'Invalid issue.', 'alpaca' ),
				404
			),
		];
	}

	return [
		'issue'    => $issue,
		'response' => null,
	];
}

/**
 * Get the issue attachment subdirectory (relative to uploads base).
 *
 * @param WP_Post $issue    Issue post object.
 * @param int     $issue_id Issue ID.
 * @return string Relative subdirectory (no leading or trailing slash).
 */
function alpaca_get_issue_attachment_subdir( $issue, $issue_id ) {
	$issue_slug = $issue->post_name ? $issue->post_name : 'issue-' . $issue_id;
	$issue_slug = sanitize_title( $issue_slug );

	return 'alpaca/' . $issue_slug;
}

/**
 * Get upload base paths for attachment handling.
 *
 * @return array{base_url: string, base_dir: string} Base URL and directory.
 */
function alpaca_get_attachment_base_paths() {
	$upload_dir = wp_upload_dir();

	return [
		'base_url' => trailingslashit( $upload_dir['baseurl'] ),
		'base_dir' => trailingslashit( $upload_dir['basedir'] ),
	];
}

/**
 * Ensure file handling functions are available.
 *
 * @return void
 */
function alpaca_require_file_functions() {
	if ( ! function_exists( 'wp_handle_sideload' ) || ! function_exists( 'wp_delete_file' ) ) {
		require_once ABSPATH . 'wp-admin/includes/file.php';
	}
}

/**
 * Register REST endpoint for issue comment attachments.
 */
function alpaca_register_comment_attachment_endpoint() {
	register_rest_route(
		'alpaca/v1',
		'/comment-attachments',
		[
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'alpaca_upload_comment_attachment',
			'permission_callback' => function () {
				return \Alpaca\Inc\Helpers::user_can( 'register_comment_meta' );
			},
			'args'                => [
				'issue_id' => [
					'type'              => 'integer',
					'required'          => true,
					'sanitize_callback' => 'absint',
				],
			],
		]
	);

	register_rest_route(
		'alpaca/v1',
		'/comment-attachments/delete',
		[
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'alpaca_delete_comment_attachment',
			'permission_callback' => function () {
				return \Alpaca\Inc\Helpers::user_can( 'register_comment_meta' );
			},
			'args'                => [
				'issue_id' => [
					'type'              => 'integer',
					'required'          => true,
					'sanitize_callback' => 'absint',
				],
				'url'      => [
					'type'              => 'string',
					'required'          => true,
					'sanitize_callback' => 'esc_url_raw',
				],
			],
		]
	);
}
add_action( 'rest_api_init', 'alpaca_register_comment_attachment_endpoint' );


/**
 * Build a time-based auth token for the image proxy endpoint.
 *
 * @param int|null $tick Optional tick value. Defaults to the current tick.
 * @return string Signed token.
 */
function alpaca_get_proxy_auth_token( $tick = null ) {
	if ( null === $tick ) {
		$tick = (int) ceil( time() / ( 12 * HOUR_IN_SECONDS ) );
	}

	$payload = 'alpaca_proxy|' . (int) $tick;

	return hash_hmac( 'sha256', $payload, wp_salt( 'nonce' ) );
}

/**
 * Validate a proxy auth token against current and previous time ticks.
 *
 * @param string $token Token to validate.
 * @return bool True when valid.
 */
function alpaca_verify_proxy_auth_token( $token ) {
	$token = is_string( $token ) ? trim( $token ) : '';
	if ( '' === $token ) {
		return false;
	}

	$current_tick  = (int) ceil( time() / ( 12 * HOUR_IN_SECONDS ) );
	$current_token = alpaca_get_proxy_auth_token( $current_tick );
	$previous_token = alpaca_get_proxy_auth_token( $current_tick - 1 );

	return hash_equals( $current_token, $token ) || hash_equals( $previous_token, $token );
}

/**
 * Validate authentication for the image proxy endpoint.
 *
 * Accepts either a valid `wp_rest` nonce (same-origin authenticated requests)
 * or a signed `proxy_token` (cross-origin requests where cookies are omitted).
 *
 * @param WP_REST_Request $request REST request object.
 * @return true|WP_Error True when valid, WP_Error otherwise.
 */
function alpaca_validate_image_proxy_permission( WP_REST_Request $request ) {
	$nonce_validation = \Alpaca\Inc\Helpers::validate_rest_nonce_permission( $request );
	if ( true === $nonce_validation ) {
		return true;
	}

	$proxy_token = (string) $request->get_param( 'proxy_token' );
	if ( alpaca_verify_proxy_auth_token( $proxy_token ) ) {
		return true;
	}

	return new WP_Error(
		'rest_forbidden',
		esc_html__( 'Invalid proxy authentication token.', 'alpaca' ),
		array( 'status' => 401 )
	);
}

/**
 * Image proxy endpoint for SnapDOM useProxy option.
 *
 * Fetches an external image server-side and returns it with CORS headers so
 * the browser can load it without cross-origin tainting. Only allows safe
 * public URLs and requires proxy authentication.
 */
function alpaca_register_image_proxy_endpoint() {
	register_rest_route(
		'alpaca/v1',
		'/proxy',
		array(
			'methods' => 'GET',
			'callback' => 'alpaca_image_proxy_callback',
			'permission_callback' => function ( WP_REST_Request $request ) {
				return alpaca_validate_image_proxy_permission( $request );
			},
			'args' => array(
				'nonce' => array(
					'sanitize_callback' => 'sanitize_text_field',
				),
				'proxy_token' => array(
					'sanitize_callback' => 'sanitize_text_field',
				),
				'url' => array(
					'required' => true,
					'sanitize_callback' => 'esc_url_raw',
				),
			),
		)
	);
}
add_action( 'rest_api_init', 'alpaca_register_image_proxy_endpoint' );


/**
 * Callback for the image proxy.
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response
 */
function alpaca_image_proxy_callback( WP_REST_Request $request ) {
	$url = (string) $request->get_param( 'url' );
	if ( '' === $url || ! wp_http_validate_url( $url ) ) {
		return alpaca_rest_response( 'image_proxy', array( 'success' => false, 'message' => esc_html__( 'Invalid URL.', 'alpaca' ) ), 400 );
	}

	// Basic host resolution and private IP protection.
	$host = parse_url( $url, PHP_URL_HOST );
	if ( empty( $host ) ) {
		return alpaca_rest_response( 'image_proxy', array( 'success' => false, 'message' => esc_html__( 'Invalid host.', 'alpaca' ) ), 400 );
	}

	$ip = gethostbyname( $host );
	if ( empty( $ip ) ) {
		return alpaca_rest_response( 'image_proxy', array( 'success' => false, 'message' => esc_html__( 'Unable to resolve host.', 'alpaca' ) ), 400 );
	}

	// Disallow common private ranges and localhost to avoid SSRF to internal networks.
	if ( 0 === strpos( $ip, '10.' ) || 0 === strpos( $ip, '192.168.' ) || 0 === strpos( $ip, '127.' ) || 0 === strpos( $ip, '169.254.' ) || '::1' === $ip ) {
		return alpaca_rest_response( 'image_proxy', array( 'success' => false, 'message' => esc_html__( 'URL not allowed.', 'alpaca' ) ), 400 );
	}

	$args = array(
		'timeout'     => 10,
		'redirection' => 5,
		'headers'     => array(
			'User-Agent' => 'AlpacaImageProxy/1.0',
		),
	);

	$resp = wp_remote_get( $url, $args );
	if ( is_wp_error( $resp ) ) {
		return alpaca_rest_response( 'image_proxy', array( 'success' => false, 'message' => $resp->get_error_message() ), 502 );
	}

	$code = wp_remote_retrieve_response_code( $resp );
	if ( 200 !== (int) $code ) {
		return alpaca_rest_response( 'image_proxy', array( 'success' => false, 'message' => esc_html__( 'Failed to fetch image.', 'alpaca' ) ), 502 );
	}

	$body = wp_remote_retrieve_body( $resp );
	$content_type = wp_remote_retrieve_header( $resp, 'content-type' );
	if ( ! $content_type || strpos( $content_type, 'image/' ) !== 0 ) {
		return alpaca_rest_response( 'image_proxy', array( 'success' => false, 'message' => esc_html__( 'Not an image.', 'alpaca' ) ), 400 );
	}

	// Return raw image bytes with proper headers to avoid JSON-encoding binary data.
	// Echo and exit so WordPress does not JSON-encode the response body.
	header( 'Content-Type: ' . $content_type );
	header( 'Access-Control-Allow-Origin: *' );
	header( 'Cache-Control: public, max-age=600' );
	echo $body;
	// Stop further output; this is a direct response for the proxy route.
	exit;
}

/**
 * Upload an attachment for an issue comment.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response REST response object.
 */
function alpaca_upload_comment_attachment( WP_REST_Request $request ) {
	$issue_id = (int) $request->get_param( 'issue_id' );
	$issue    = alpaca_get_issue_for_attachment( $issue_id, 'comment_attachment_upload' );

	if ( $issue['response'] ) {
		return $issue['response'];
	}

	if ( empty( $_FILES['file'] ) ) {
		return alpaca_comment_attachment_error_response(
			'comment_attachment_upload',
			__( 'Missing attachment file.', 'alpaca' ),
			400
		);
	}

	$file = $_FILES['file'];

	$allowed_mimes = get_allowed_mime_types();
	$checked_type  = wp_check_filetype_and_ext( $file['tmp_name'], $file['name'], $allowed_mimes );

	if ( empty( $checked_type['type'] ) || empty( $checked_type['ext'] ) ) {
		return alpaca_comment_attachment_error_response(
			'comment_attachment_upload',
			__( 'This file type is not allowed.', 'alpaca' ),
			400
		);
	}

	$base_paths = alpaca_get_attachment_base_paths();
	$subdir     = alpaca_get_issue_attachment_subdir( $issue['issue'], $issue_id );
	$subdir     = '/' . $subdir;
	$target_dir = $base_paths['base_dir'] . ltrim( $subdir, '/' );

	if ( ! wp_mkdir_p( $target_dir ) ) {
		return alpaca_comment_attachment_error_response(
			'comment_attachment_upload',
			__( 'Failed to prepare upload directory.', 'alpaca' ),
			500
		);
	}

	$upload_dir_filter = function ( $dirs ) use ( $subdir ) {
		$dirs['subdir'] = $subdir;
		$dirs['path']   = $dirs['basedir'] . $subdir;
		$dirs['url']    = $dirs['baseurl'] . $subdir;
		return $dirs;
	};

	add_filter( 'upload_dir', $upload_dir_filter );

	alpaca_require_file_functions();

	$uploaded = wp_handle_sideload(
		$file,
		[
			'test_form' => false,
			'mimes'     => $allowed_mimes,
		]
	);

	remove_filter( 'upload_dir', $upload_dir_filter );

	if ( isset( $uploaded['error'] ) ) {
		$upload_error = function_exists( 'wp_handle_upload_error' )
			? wp_handle_upload_error( $file, $uploaded['error'] )
			: $uploaded;

		return alpaca_comment_attachment_error_response(
			'comment_attachment_upload',
			$upload_error['error'],
			500
		);
	}

	return alpaca_rest_response(
		'comment_attachment_upload',
		[
			'success' => true,
			'url'     => esc_url_raw( $uploaded['url'] ),
			'name'    => sanitize_file_name( wp_basename( $uploaded['file'] ) ),
			'mime'    => sanitize_text_field( $uploaded['type'] ),
		],
		200
	);
}

/**
 * Delete an attachment for an issue comment.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response REST response object.
 */
function alpaca_delete_comment_attachment( WP_REST_Request $request ) {
	$issue_id = (int) $request->get_param( 'issue_id' );
	$url      = (string) $request->get_param( 'url' );
	$issue    = alpaca_get_issue_for_attachment( $issue_id, 'comment_attachment_delete' );

	if ( $issue['response'] ) {
		return $issue['response'];
	}

	if ( empty( $url ) ) {
		return alpaca_comment_attachment_error_response(
			'comment_attachment_delete',
			__( 'Missing attachment URL.', 'alpaca' ),
			400
		);
	}

	$base_paths = alpaca_get_attachment_base_paths();
	$subdir     = alpaca_get_issue_attachment_subdir( $issue['issue'], $issue_id );
	$subdir     = trailingslashit( $subdir );

	if ( strpos( $url, $base_paths['base_url'] . $subdir ) !== 0 ) {
		return alpaca_comment_attachment_error_response(
			'comment_attachment_delete',
			__( 'Attachment URL is not valid.', 'alpaca' ),
			400
		);
	}

	$relative_path = ltrim( str_replace( $base_paths['base_url'], '', $url ), '/' );
	$file_path     = $base_paths['base_dir'] . $relative_path;

	if ( ! file_exists( $file_path ) ) {
		return alpaca_comment_attachment_error_response(
			'comment_attachment_delete',
			__( 'Attachment not found.', 'alpaca' ),
			404
		);
	}

	alpaca_require_file_functions();

	$deleted = wp_delete_file( $file_path );

	if ( ! $deleted ) {
		return alpaca_comment_attachment_error_response(
			'comment_attachment_delete',
			__( 'Failed to delete attachment.', 'alpaca' ),
			500
		);
	}

	return alpaca_rest_response(
		'comment_attachment_delete',
		[
			'success' => true,
			'message' => esc_html__( 'Attachment deleted.', 'alpaca' ),
		],
		200
	);
}

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
 * Intercept POST requests to the core comments endpoint for Alpaca issue comments.
 *
 * The Core REST controller throws a 403 if 'status' is provided but the user lacks 'moderate_comments'.
 * We work around this by stripping the 'status' param from the request here, allowing the
 * request to proceed to the controller. We then enforce the status via `pre_comment_approved`.
 */
add_filter( 'rest_pre_dispatch', function ( $result, $server, $request ) {
	if ( 'POST' !== $request->get_method() ) {
		return $result;
	}
	if ( '/wp/v2/comments' !== $request->get_route() ) {
		return $result;
	}

	// Check if this is an issue comment.
	$comment_type = (string) $request->get_param( 'comment_type' );
	if ( 'issuecomment' !== $comment_type ) {
		return $result;
	}

	// If the user can create an issue, let them create the comment without manual status assignment.
	// This prevents the controller from checking for 'moderate_comments' capability.
	if ( \Alpaca\Inc\Helpers::user_can( 'create_issue' ) ) {
		// Disable flood control for automated system comments.
		remove_action( 'check_comment_flood', 'check_comment_flood_db' );

		$params = $request->get_json_params();
		if ( isset( $params['status'] ) ) {
			unset( $params['status'] );
			$request->set_body_params( $params );
		}
		// Also unset if sent as a standard param (though JS usually sends JSON).
		if ( isset( $request['status'] ) ) {
			$request->offsetUnset( 'status' );
		}
	}

	return $result;
}, 10, 3 );

/**
 * Force-approve Alpaca issue comments for authorized users.
 *
 * This handles the approval logic centrally, ensuring comments are live immediately
 * even though we stripped the 'status' param in the REST request.
 */
add_filter( 'pre_comment_approved', function ( $approved, $commentdata ) {
	if ( isset( $commentdata['comment_type'] ) && 'issuecomment' === $commentdata['comment_type'] ) {
		if ( \Alpaca\Inc\Helpers::user_can( 'create_issue' ) ) {
			return 1;
		}
	}
	return $approved;
}, 10, 2 );

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
				return \Alpaca\Inc\Helpers::user_can( 'presence' );
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

/**
 * Expose basic author details in REST comment responses for Alpaca issue comments.
 * This ensures that users with lower privileges can still see the author's name
 * and avatar even if they cannot list users via the standard REST endpoint.
 */
add_filter( 'rest_prepare_comment', function( $response, $comment, $request ) {
	if ( 'issuecomment' === $comment->comment_type ) {
		$author_id = (int) $comment->user_id;
		if ( $author_id > 0 ) {
			// Include standard fields that our User component expects.
			$response->data['author_details'] = [
				'id'           => $author_id,
				'name'         => get_the_author_meta( 'display_name', $author_id ),
				'display_name' => get_the_author_meta( 'display_name', $author_id ),
				'avatar'       => alpaca_avatar( $author_id, 48 ),
				'avatar_urls'  => [
					'24' => alpaca_avatar( $author_id, 24 ),
					'48' => alpaca_avatar( $author_id, 48 ),
					'96' => alpaca_avatar( $author_id, 96 ),
				],
			];
		}
	}
	return $response;
}, 10, 3 );
