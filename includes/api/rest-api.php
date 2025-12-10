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
 * @param mixed $data   Response data.
 * @param int   $status HTTP status code.
 * @return WP_REST_Response REST response object.
 */
function alpaca_rest_response( $data, $status = 200 ) {
	return new WP_REST_Response( $data, (int) $status );
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
				return current_user_can( 'edit_others_posts' );
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
			[
				'success' => false,
				'message' => 'Invalid request body.',
			],
			400
		);
	}

	// Extract user + input safely.
	$user_id      = (int) alpaca_arr_get( $payload, [ 'user', 'id' ], get_current_user_id() );
	$feedback_raw = (string) alpaca_arr_get( $payload, [ 'userinput', 'feedback' ], '' );
	$include_ctx  = (bool) alpaca_arr_get( $payload, [ 'userinput', 'includeContext' ], false );

	if ( '' === trim( $feedback_raw ) ) {
		return alpaca_rest_response(
			[
				'success' => false,
				'message' => 'Feedback is required.',
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
			[
				'success' => false,
				'message' => 'Failed to create the issue post.',
			],
			500
		);
	}

	// Assign initial status.
	$status_term_id = 0;
	$statuses       = alpaca_get_statuses();
	if ( ! empty( $statuses ) && ! is_wp_error( $statuses ) ) {
		$status_term       = null;
		$default_status_id = (int) get_option( 'alpaca_default_status_id' );

		// 1) Saved default if valid/on board.
		if ( $default_status_id > 0 ) {
			$term = get_term( $default_status_id, 'alpaca_status' );
			if (
				$term && ! is_wp_error( $term )
				&& in_array( $term->term_id, wp_list_pluck( $statuses, 'term_id' ), true )
			) {
				$status_term = $term;
			}
		}
		// 2) First non-negative score.
		if ( ! $status_term ) {
			foreach ( $statuses as $s ) {
				if ( (int) alpaca_arr_get( (array) $s, [ 'term_score' ], 0 ) >= 0 ) {
					$status_term = $s;
					break;
				}
			}
		}
		// 3) Fallback to first available.
		if ( ! $status_term ) {
			$status_term = reset( $statuses );
		}
		if ( $status_term ) {
			wp_set_post_terms( $post_id, [ (int) $status_term->term_id ], 'alpaca_status' );
			$status_term_id = (int) $status_term->term_id;
		}
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

	return alpaca_rest_response(
		[
			'success'  => true,
			'message'  => 'Issue submitted successfully.',
			'post_id'  => $post_id,
			'issue'    => [
				'id'          => $post_id,
				'title'       => $post_args['post_title'],
				'author_id'   => $post_args['post_author'],
				'author_name' => get_the_author_meta( 'display_name', $post_args['post_author'] ),
				'author_img'  => alpaca_avatar( $post_args['post_author'], 24 ),
			],
			'statusId' => $status_term_id,
		],
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
				return current_user_can( 'edit_posts' );
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
	return alpaca_rest_response( $board_data, 200 );
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
				return current_user_can( 'edit_posts' );
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
			[
				'success' => false,
				'message' => 'Invalid data format. Expected an array of columns.',
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
		[
			'success' => true,
			'message' => 'Board order saved successfully.',
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
				return current_user_can( 'edit_posts' );
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
			[
				'success' => false,
				'message' => 'Issue not found.',
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
			[
				'success' => false,
				'message' => 'Failed to update the issue.',
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

	return alpaca_rest_response(
		[
			'success' => true,
			'message' => 'Issue updated successfully.',
			'post_id' => $issue_id,
		],
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
					return current_user_can( 'manage_options' );
				},
			],
			[
				'methods'             => 'POST',
				'callback'            => 'alpaca_update_default_status_option',
				'permission_callback' => function () {
					return current_user_can( 'manage_options' );
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
	return alpaca_rest_response( [ 'value' => $default_status_id ], 200 );
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
				return current_user_can( 'manage_options' );
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
				return current_user_can( 'edit_posts' );
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
			[
				'success' => false,
				'message' => 'Issue not found.',
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
		[
			'success'       => true,
			'message'       => 'Issue data retrieved successfully.',
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
				return current_user_can( 'edit_posts' );
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
				return current_user_can( 'edit_posts' );
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
		return alpaca_rest_response( [], 200 );
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

	return alpaca_rest_response( $response_data, 200 );
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
				return current_user_can( 'edit_posts' );
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
				return current_user_can( 'edit_posts' );
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
				return current_user_can( 'manage_options' );
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
	return alpaca_rest_response( $statuses, 200 );
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
				return current_user_can( 'edit_posts' );
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
			[
				'success' => false,
				'message' => 'Status not found.',
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
				[
					'success' => false,
					'message' => 'Failed to update status name and slug.',
				],
				500
			);
		}
	}

	if ( array_key_exists( 'term_score', (array) $data ) ) {
		update_term_meta( $term_id, 'term_score', $data['term_score'] );
	}

	return alpaca_rest_response(
		[
			'success' => true,
			'message' => 'Status updated successfully.',
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
				return current_user_can( 'delete_post', $post_id );
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
			[
				'success' => false,
				'message' => 'Issue not found.',
			],
			404
		);
	}

	$result = wp_trash_post( $issue_id );
	// Note: restoring from Trash puts the issue in Draft.
	if ( ! $result ) {
		return alpaca_rest_response(
			[
				'success' => false,
				'message' => 'Failed to trash the issue.',
			],
			500
		);
	}

	return alpaca_rest_response(
		[
			'success' => true,
			'message' => 'Issue trashed successfully.',
		],
		200
	);
}

/*
 * Webhook receiver endpoint.
 */
add_action( 'rest_api_init', 'alpaca_webhook_receiver_endpoint' );
/**
 * Register webhook receiver endpoint.
 */
function alpaca_webhook_receiver_endpoint() {
	register_rest_route(
		'alpaca/v1',
		'/webhook',
		[
			'methods'             => 'POST',
			'callback'            => 'alpaca_webhook_receiver_callback',
			'permission_callback' => '__return_true',
		]
	);
}

/**
 * Callback for webhook receiver endpoint.
 *
 * @param WP_REST_Request $request REST request object.
 * @return WP_REST_Response REST response.
 */
function alpaca_webhook_receiver_callback( WP_REST_Request $request ) {
	$body        = $request->get_body();
	$params      = $request->get_params();
	$data_to_log = $body;

	// Get signature from HTTP header (GitHub sends X-Hub-Signature-256).
	$signature = isset( $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ) 
		? sanitize_text_field( wp_unslash( $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ) ) 
		: '';

	// Verify webhook signature.
	if ( function_exists( 'alpaca_verify_github_payload' ) && ! alpaca_verify_github_payload( $body, $signature ) ) {
		// Log failed verification attempt.
		alpaca_log_webhook( 'Webhook verification failed - invalid signature', 'error' );
		return new WP_REST_Response( [ 'error' => 'Invalid signature' ], 401 );
	}

	// Check if body is valid JSON.
	json_decode( $body );
	if ( json_last_error() !== JSON_ERROR_NONE ) {
		// Fallback: log request params instead.
		$data_to_log = wp_json_encode( $params, JSON_PRETTY_PRINT );
	}

	// Log webhook data to secure location.
	alpaca_log_webhook( $data_to_log, 'webhook' );

	return alpaca_rest_response(
		[
			'success' => true,
			'message' => 'Webhook received.',
		],
		200
	);
}

/**
 * Log webhook data to secure location.
 *
 * @param string $message Message to log.
 * @param string $type    Log type (webhook, error, etc.).
 */
function alpaca_log_webhook( $message, $type = 'webhook' ) {
	$upload_dir = wp_upload_dir();
	$log_dir    = $upload_dir['basedir'] . '/alpaca-logs';

	// Ensure log directory exists.
	if ( ! file_exists( $log_dir ) ) {
		wp_mkdir_p( $log_dir );
		file_put_contents( $log_dir . '/.htaccess', 'deny from all' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_operations_file_put_contents
		file_put_contents( $log_dir . '/index.php', '<?php // Silence is golden.' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_operations_file_put_contents
	}

	// Create log filename with date.
	$log_file = $log_dir . '/webhook-' . gmdate( 'Y-m-d' ) . '.log';

	// Format log entry.
	$log_entry = sprintf(
		"[%s] [%s]\n%s\n\n",
		current_time( 'mysql' ),
		strtoupper( $type ),
		$message
	);

	// Append to log file.
	file_put_contents( $log_file, $log_entry, FILE_APPEND | LOCK_EX ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_operations_file_put_contents
}

/*
 * Webhook secrets endpoints.
 */
add_action( 'rest_api_init', 'alpaca_webhook_secrets_endpoint' );
/**
 * Register webhook secrets endpoints.
 */
function alpaca_webhook_secrets_endpoint() {
	register_rest_route(
		'alpaca/v1',
		'/webhook/secret/(?P<service>[a-zA-Z0-9_-]+)',
		[
			'methods'             => 'GET',
			'callback'            => 'alpaca_get_webhook_secret_callback',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
			'args'                => [
				'service' => [
					'validate_callback' => function ( $param ) {
						return is_string( $param ) && ! empty( trim( $param ) );
					},
				],
			],
		]
	);

	register_rest_route(
		'alpaca/v1',
		'/webhook/secret/(?P<service>[a-zA-Z0-9_-]+)/regenerate',
		[
			'methods'             => 'POST',
			'callback'            => 'alpaca_regenerate_webhook_secret_callback',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
			'args'                => [
				'service' => [
					'validate_callback' => function ( $param ) {
						return is_string( $param ) && ! empty( trim( $param ) );
					},
				],
			],
		]
	);
}

/**
 * Get or generate webhook secret.
 *
 * @param string $service_name Name of the service.
 * @param bool   $regenerate   Whether to regenerate the secret.
 * @return string The webhook secret.
 */
function alpaca_get_or_generate_webhook_secret( $service_name, $regenerate = false ) {
	$option_name = 'alpaca_webhook_secret_' . sanitize_key( $service_name );
	$secret      = get_option( $option_name );

	if ( ! $secret || $regenerate ) {
		$secret = wp_generate_password( 32, false );
		update_option( $option_name, $secret );
	}

	return $secret;
}

/**
 * Callback for GET webhook secret endpoint.
 *
 * @param WP_REST_Request $request REST request object.
 * @return WP_REST_Response REST response with secret.
 */
function alpaca_get_webhook_secret_callback( WP_REST_Request $request ) {
	$service = $request->get_param( 'service' );
	$secret  = alpaca_get_or_generate_webhook_secret( $service );
	return alpaca_rest_response(
		[
			'success' => true,
			'secret'  => $secret,
		],
		200
	);
}

/**
 * Callback for regenerate webhook secret endpoint.
 *
 * @param WP_REST_Request $request REST request object.
 * @return WP_REST_Response REST response with new secret.
 */
function alpaca_regenerate_webhook_secret_callback( WP_REST_Request $request ) {
	$service = $request->get_param( 'service' );
	$secret  = alpaca_get_or_generate_webhook_secret( $service, true );
	return alpaca_rest_response(
		[
			'success' => true,
			'secret'  => $secret,
		],
		200
	);
}
