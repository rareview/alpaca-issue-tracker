<?php
/**
 * Alpaca Issues – REST Endpoints (refactored)
 * NOTE: Endpoints, routes, permissions, and behaviors are preserved.
 */

/* -------------------------------------------------------------
 * Bootstrapping: expose wpApiSettings (unchanged behavior)
 * ----------------------------------------------------------- */
add_action( 'init', function () {
	wp_localize_script(
		'wp-api',
		'wpApiSettings',
		array(
			'root'  => esc_url_raw( rest_url() ),
			'nonce' => wp_create_nonce( 'wp_rest' ),
		)
	);
	wp_enqueue_script( 'wp-api' );
} );

/* -------------------------------------------------------------
 * Small utilities (pure helpers; no side effects)
 * ----------------------------------------------------------- */

/** Uniform REST response */
function alpaca_rest_response( $data, $status = 200 ) {
	return new WP_REST_Response( $data, (int) $status );
}

/** Get safe array value with default */
function alpaca_arr_get( $array, $path, $default = null ) {
	$ref = $array;
	foreach ( (array) $path as $key ) {
		if ( is_array( $ref ) && array_key_exists( $key, $ref ) ) {
			$ref = $ref[ $key ];
		} else {
			return $default;
		}
	}
	return $ref;
}

/** Cast to int array and dedupe */
function alpaca_to_int_ids( $vals ) {
	$vals = array_map( 'intval', (array) $vals );
	return array_values( array_unique( array_filter( $vals, static function ( $v ) { return $v > 0; } ) ) );
}

/** Tiny helper for avatars (keeps code tidy) */
function alpaca_avatar( $user_id, $size = 24 ) {
	return get_avatar_url( (int) $user_id, array( 'size' => (int) $size ) );
}

/** Check a post is an issue */
function alpaca_assert_issue_exists( $post_id ) {
	$post = get_post( (int) $post_id );
	return ( $post && $post->post_type === 'issue' ) ? $post : null;
}

/* -------------------------------------------------------------
 * Issue submit
 * ----------------------------------------------------------- */
add_action( 'rest_api_init', 'alpaca_issue_submit' );
function alpaca_issue_submit() {
	register_rest_route(
		'issue/v1/',
		'submit',
		array(
			'methods'             => 'POST',
			'callback'            => 'alpaca_issue_callback',
			'permission_callback' => function () {
				return current_user_can( 'edit_others_posts' );
			},
		)
	);
}

function alpaca_issue_callback( WP_REST_Request $req ) {
	$payload = $req->get_json_params();

	if ( ! is_array( $payload ) ) {
		return alpaca_rest_response(
			array( 'success' => false, 'message' => 'Invalid request body.' ),
			400
		);
	}

	// Extract user + input safely
	$user_id      = (int) alpaca_arr_get( $payload, array( 'user', 'id' ), get_current_user_id() );
	$feedback_raw = (string) alpaca_arr_get( $payload, array( 'userinput', 'feedback' ), '' );
	$include_ctx  = (bool) alpaca_arr_get( $payload, array( 'userinput', 'includeContext' ), false );

	if ( '' === trim( $feedback_raw ) ) {
		return alpaca_rest_response(
			array( 'success' => false, 'message' => 'Feedback is required.' ),
			400
		);
	}

	// Prepare post args (keep original behavior)
	$getbody   = $req->get_body(); // used for hash slug parity with original
	$post_args = array(
		'post_type'      => 'issue',
		'post_status'    => 'publish',
		'post_author'    => $user_id,
		'post_title'     => wp_kses_post( wp_trim_words( $feedback_raw, 10 ) ),
		'post_name'      => hash( 'adler32', (string) $getbody ),
		'post_content'   => wp_kses_post( $feedback_raw ),
		'comment_status' => 'open',
	);

	$post_id = wp_insert_post( $post_args, true );
	if ( is_wp_error( $post_id ) || 0 === (int) $post_id ) {
		return alpaca_rest_response(
			array( 'success' => false, 'message' => 'Failed to create the issue post.' ),
			500
		);
	}

	// Assign initial status (keeps your improved logic)
	$status_term_id = 0;
	$statuses       = alpaca_get_statuses(); // external function, expected ordered by score
	if ( ! empty( $statuses ) && ! is_wp_error( $statuses ) ) {
		$status_term       = null;
		$default_status_id = (int) get_option( 'alpaca_default_status_id' );

		// 1) Saved default if valid/on board
		if ( $default_status_id > 0 ) {
			$term = get_term( $default_status_id, 'status' );
			if (
				$term && ! is_wp_error( $term )
				&& in_array( $term->term_id, wp_list_pluck( $statuses, 'term_id' ), true )
			) {
				$status_term = $term;
			}
		}
		// 2) First non-negative score
		if ( ! $status_term ) {
			foreach ( $statuses as $s ) {
				if ( (int) alpaca_arr_get( (array) $s, array( 'term_score' ), 0 ) >= 0 ) {
					$status_term = $s;
					break;
				}
			}
		}
		// 3) Fallback to first available
		if ( ! $status_term ) {
			$status_term = reset( $statuses );
		}
		if ( $status_term ) {
			wp_set_post_terms( $post_id, array( (int) $status_term->term_id ), 'status' );
			$status_term_id = (int) $status_term->term_id;
		}
	}

	// Optional context (kept, but hardened)
	if ( $include_ctx ) {
		$browser_name = (string) alpaca_arr_get( $payload, array( 'client', 'browser', 'name' ), '' );
		$os_name      = (string) alpaca_arr_get( $payload, array( 'client', 'os' ), '' );
		$template     = (string) alpaca_arr_get( $payload, array( 'wp', 'template' ), '' );
		$wp_types     = (array) alpaca_arr_get( $payload, array( 'wp', 'type' ), array() );

		if ( $browser_name !== '' ) {
			wp_set_post_terms( $post_id, $browser_name, 'browser', true );
		}
		if ( $os_name !== '' ) {
			wp_set_post_terms( $post_id, $os_name, 'browser', true );
		}
		if ( $template !== '' ) {
			wp_set_post_terms( $post_id, $template, 'phptemplate' );
		}
		foreach ( $wp_types as $t ) {
			if ( is_scalar( $t ) && $t !== '' ) {
				wp_set_post_terms( $post_id, (string) $t, 'type' );
			}
		}

		update_post_meta( $post_id, 'screenshot', (string) alpaca_arr_get( $payload, array( 'screenshot' ), '' ) );
		update_post_meta( $post_id, 'screenwidth', (int) alpaca_arr_get( $payload, array( 'client', 'browser', 'width' ), 0 ) );
		update_post_meta( $post_id, 'screenheight', (int) alpaca_arr_get( $payload, array( 'client', 'browser', 'height' ), 0 ) );
		update_post_meta( $post_id, 'URL', (string) alpaca_arr_get( $payload, array( 'server', 'REQUEST_URI' ), '' ) );

		$qo = alpaca_arr_get( $payload, array( 'wp', 'queriedObject' ), null );
		if ( is_array( $qo ) ) {
			// Avoid storing post_content (unchanged behavior)
			if ( array_key_exists( 'post_content', $qo ) ) {
				unset( $qo['post_content'] );
			}
			update_post_meta(
				$post_id,
				'queriedObject',
				wp_json_encode( $qo, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE )
			);
		}

		$headers = alpaca_arr_get( $payload, array( 'headers' ), null );
		if ( is_array( $headers ) ) {
			update_post_meta(
				$post_id,
				'headers',
				wp_json_encode( $headers, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE )
			);
		}

		// Parent link when singular
		if ( in_array( 'singular', $wp_types, true ) ) {
			$parent_id = (int) alpaca_arr_get( $payload, array( 'wp', 'queriedObject', 'ID' ), 0 );
			if ( $parent_id > 0 ) {
				wp_update_post(
					array(
						'ID'          => $post_id,
						'post_parent' => $parent_id,
					)
				);
			}
		}
	}

	return alpaca_rest_response(
		array(
			'success' => true,
			'message' => 'Issue submitted successfully.',
			'post_id' => $post_id,
			'issue'   => array(
				'id'            => $post_id,
				'title'         => $post_args['post_title'],
				'author_id'     => $post_args['post_author'],
				'author_name'   => get_the_author_meta( 'display_name', $post_args['post_author'] ),
				'author_img'    => alpaca_avatar( $post_args['post_author'], 24 ),
			),
			'statusId' => $status_term_id,
		),
		200
	);
}

/* -------------------------------------------------------------
 * Board: get + update
 * ----------------------------------------------------------- */
add_action( 'rest_api_init', 'alpaca_get_board' );
function alpaca_get_board() {
	register_rest_route(
		'alpaca/v1',
		'/board',
		array(
			'methods'             => 'GET',
			'callback'            => 'alpaca_get_board_data_callback',
			'permission_callback' => function () {
				return current_user_can( 'edit_posts' );
			},
		)
	);
}
function alpaca_get_board_data_callback() {
	$board_data = alpaca_get_board_data(); // external
	return alpaca_rest_response( $board_data, 200 );
}

add_action( 'rest_api_init', 'alpaca_update_board' );
function alpaca_update_board() {
	register_rest_route(
		'alpaca/v1',
		'/board',
		array(
			'methods'             => 'POST',
			'callback'            => 'alpaca_update_board_data_callback',
			'permission_callback' => function () {
				return current_user_can( 'edit_posts' );
			},
		)
	);
}
function alpaca_update_board_data_callback( WP_REST_Request $request ) {
	$columns = $request->get_json_params();

	if ( ! is_array( $columns ) ) {
		return alpaca_rest_response(
			array( 'success' => false, 'message' => 'Invalid data format. Expected an array of columns.' ),
			400
		);
	}

	foreach ( $columns as $column ) {
		if ( ! is_array( $column ) ) {
			continue;
		}
		$term_id   = (int) ( $column['id'] ?? 0 );
		$issue_ids = alpaca_to_int_ids( $column['issues'] ?? array() );

		if ( $term_id > 0 ) {
			update_term_meta( $term_id, 'issue_order', $issue_ids );
		}
	}

	return alpaca_rest_response(
		array( 'success' => true, 'message' => 'Board order saved successfully.' ),
		200
	);
}

/* -------------------------------------------------------------
 * Issue: update
 * ----------------------------------------------------------- */
add_action( 'rest_api_init', 'alpaca_update_issue' );
function alpaca_update_issue() {
	register_rest_route(
		'issue/v1',
		'/update/(?P<id>\d+)',
		array(
			'methods'             => 'POST',
			'callback'            => 'alpaca_update_issue_callback',
			'permission_callback' => function () {
				return current_user_can( 'edit_posts' );
			},
			'args'                 => array(
				'id' => array(
					'validate_callback' => function ( $param ) {
						return is_numeric( $param ) && $param > 0;
					},
				),
			),
		)
	);
}

function alpaca_update_issue_callback( WP_REST_Request $request ) {
	$issue_id = (int) $request['id'];
	$data     = $request->get_json_params();

	$post = alpaca_assert_issue_exists( $issue_id );
	if ( ! $post ) {
		return alpaca_rest_response(
			array( 'success' => false, 'message' => 'Issue not found.' ),
			404
		);
	}

	$post_args = array(
		'ID'                 => $issue_id,
		'post_title'         => isset( $data['title'] ) ? wp_kses_post( (string) $data['title'] ) : $post->post_title,
		'post_content'       => isset( $data['content'] ) ? wp_kses_post( (string) $data['content'] ) : $post->post_content,
		'post_modified'      => current_time( 'mysql' ),
		'post_modified_gmt'  => current_time( 'mysql', 1 ),
	);

	$update_result = wp_update_post( $post_args, true );
	if ( is_wp_error( $update_result ) ) {
		return alpaca_rest_response(
			array( 'success' => false, 'message' => 'Failed to update the issue.' ),
			500
		);
	}

	// Taxonomies
	if ( isset( $data['taxonomies'] ) && is_array( $data['taxonomies'] ) ) {
		foreach ( $data['taxonomies'] as $taxonomy => $terms ) {
			if ( ! taxonomy_exists( $taxonomy ) ) {
				continue;
			}

			if ( 'assignee' === $taxonomy ) {
				$term_ids = array();
				foreach ( (array) $terms as $user_slug ) {
					$user_slug = (string) $user_slug;
					if ( '' === $user_slug ) {
						continue;
					}
					$user = get_user_by( 'slug', $user_slug );
					if ( ! $user ) {
						continue;
					}

					$existing = get_term_by( 'slug', $user->user_nicename, 'assignee' );
					if ( ! $existing ) {
						$inserted = wp_insert_term(
							$user->display_name,
							'assignee',
							array(
								'slug'        => $user->user_nicename,
							'description' => $user->user_login,
							)
						);
						$term_id = is_wp_error( $inserted ) ? 0 : (int) ( is_array( $inserted ) ? $inserted['term_id'] : $inserted );
					} else {
						$term_id = (int) $existing->term_id;
					}
					if ( $term_id > 0 ) {
						$term_ids[] = $term_id;
					}
				}
				wp_set_post_terms( $issue_id, alpaca_to_int_ids( $term_ids ), 'assignee', false );
			} else {
				$term_ids = alpaca_to_int_ids( $terms );
				wp_set_post_terms( $issue_id, $term_ids, $taxonomy, false );
			}
		}
	}

	// Meta
	if ( isset( $data['meta'] ) && is_array( $data['meta'] ) ) {
		foreach ( $data['meta'] as $meta_key => $meta_value ) {
			$key = sanitize_key( (string) $meta_key );
			update_post_meta( $issue_id, $key, maybe_serialize( $meta_value ) );
		}
	}

	return alpaca_rest_response(
		array(
			'success' => true,
			'message' => 'Issue updated successfully.',
			'post_id' => $issue_id,
		),
		200
	);
}

/* -------------------------------------------------------------
 * Options: default status
 * ----------------------------------------------------------- */
add_action( 'rest_api_init', 'alpaca_register_options_endpoints' );
function alpaca_register_options_endpoints() {
	register_rest_route(
		'alpaca/v1',
		'/options/default_status',
		array(
			array(
				'methods'             => 'GET',
				'callback'            => 'alpaca_get_default_status_option',
				'permission_callback' => function () {
					return current_user_can( 'manage_options' );
				},
			),
			array(
				'methods'             => 'POST',
				'callback'            => 'alpaca_update_default_status_option',
				'permission_callback' => function () {
					return current_user_can( 'manage_options' );
				},
				'args'                => array(
					'value' => array(
						'required'          => true,
						'validate_callback' => function ( $param ) {
							return is_numeric( $param ) || $param === '';
						},
					),
				),
			),
		)
	);
}
function alpaca_get_default_status_option() {
	$default_status_id = get_option( 'alpaca_default_status_id', '' );
	return alpaca_rest_response( array( 'value' => $default_status_id ), 200 );
}
function alpaca_update_default_status_option( WP_REST_Request $request ) {
	$value   = $request->get_param( 'value' );
	$new_val = (int) $value;
	$old_val = (int) get_option( 'alpaca_default_status_id', 0 );

	if ( $new_val !== $old_val ) {
		update_option( 'alpaca_default_status_id', $new_val );
	}

	return alpaca_rest_response( array( 'success' => true, 'value' => $new_val ), 200 );
}

/* -------------------------------------------------------------
 * Issue: get details
 * ----------------------------------------------------------- */
add_action( 'rest_api_init', 'alpaca_get_issue_data' );
function alpaca_get_issue_data() {
	register_rest_route(
		'issue/v1',
		'/get/(?P<id>\d+)',
		array(
			'methods'             => 'GET',
			'callback'            => 'alpaca_get_issue_data_callback',
			'permission_callback' => function () {
				return current_user_can( 'edit_posts' );
			},
			'args'                 => array(
				'id' => array(
					'validate_callback' => function ( $param ) {
						return is_numeric( $param ) && $param > 0;
					},
				),
			),
		)
	);
}

function alpaca_get_issue_data_callback( WP_REST_Request $request ) {
	$issue_id = (int) $request['id'];
	$post     = alpaca_assert_issue_exists( $issue_id );

	if ( ! $post ) {
		return alpaca_rest_response(
			array( 'success' => false, 'message' => 'Issue not found.' ),
			404
		);
	}

	$post_data                              = $post->to_array();
	$post_data['post_author_display_name']  = get_the_author_meta( 'display_name', $post_data['post_author'] );
	$post_data['post_author_img']           = alpaca_avatar( $post_data['post_author'], 32 );

	$meta           = get_post_meta( $issue_id );
	$formatted_meta = array();
	foreach ( $meta as $key => $value ) {
		// PHP 7 compat: avoid str_starts_with
		if ( 0 === strpos( $key, '_' ) ) {
			continue; // skip internal keys
		}
		$formatted_meta[ $key ] = maybe_unserialize( $value[0] );
	}

	$all_taxonomies = get_object_taxonomies( 'issue', 'objects' );
	$terms_data     = array();
	foreach ( $all_taxonomies as $taxonomy_obj ) {
		$terms = wp_get_object_terms( $issue_id, $taxonomy_obj->name, array( 'fields' => 'all' ) );
		if ( is_wp_error( $terms ) || empty( $terms ) ) {
			continue;
		}
		if ( 'assignee' === $taxonomy_obj->name ) {
			foreach ( $terms as $idx => $term ) {
				// Keep original structure but enrich
				$terms[ $idx ]->username     = $term->name;
				$terms[ $idx ]->display_name = $term->description; // as before
			}
		}
		$terms_data[ $taxonomy_obj->name ] = $terms;
	}

	$issue_comment_count = get_comments(
		array(
			'post_id' => $issue_id,
			'type'    => 'issuecomment',
			'count'   => true,
		)
	);

	return alpaca_rest_response(
		array(
			'success'       => true,
			'message'       => 'Issue data retrieved successfully.',
			'post_id'       => $issue_id,
			'post_data'     => $post_data,
			'meta'          => $formatted_meta,
			'taxonomies'    => $terms_data,
			'comment_count' => (int) $issue_comment_count,
		),
		200
	);
}

/* -------------------------------------------------------------
 * Users list
 * ----------------------------------------------------------- */
add_action( 'rest_api_init', 'alpaca_register_user_list_endpoint' );
function alpaca_register_user_list_endpoint() {
	register_rest_route(
		'alpaca/v1',
		'/users',
		array(
			'methods'             => 'GET',
			'callback'            => 'alpaca_get_all_users_callback',
			'permission_callback' => function () {
				return current_user_can( 'edit_posts' );
			},
		)
	);
}
function alpaca_get_all_users_callback() {
	$users = get_users( array( 'fields' => array( 'ID', 'display_name', 'user_nicename' ) ) );
	if ( empty( $users ) ) {
		return alpaca_rest_response( array(), 200 );
	}

	$response_data = array();
	foreach ( $users as $user ) {
		$response_data[] = array(
			'id'          => (int) $user->ID,
			'name'        => $user->display_name,
			'slug'        => $user->user_nicename,
			'avatar_urls' => array(
				'24' => alpaca_avatar( $user->ID, 24 ),
				'48' => alpaca_avatar( $user->ID, 48 ),
				'96' => alpaca_avatar( $user->ID, 96 ),
			),
		);
	}

	return alpaca_rest_response( $response_data, 200 );
}

/* -------------------------------------------------------------
 * Watchlist (GET/POST toggle)
 * ----------------------------------------------------------- */
add_action( 'rest_api_init', 'alpaca_watchlist_endpoint' );
function alpaca_watchlist_endpoint() {
	register_rest_route(
		'alpaca/v1',
		'/watchlist',
		array(
			'methods'             => 'POST',
			'callback'            => 'alpaca_update_watchlist_callback',
			'permission_callback' => function () {
				return current_user_can( 'edit_posts' );
			},
		)
	);

	register_rest_route(
		'alpaca/v1',
		'/watchlist',
		array(
			'methods'             => 'GET',
			'callback'            => 'alpaca_get_watchlist_callback',
			'permission_callback' => function () {
				return current_user_can( 'edit_posts' );
			},
		)
	);
}
function alpaca_get_watchlist_callback() {
	$user_id   = get_current_user_id();
	$watchlist = get_user_meta( $user_id, 'alpaca_watchlist', true );
	$watchlist = alpaca_to_int_ids( is_array( $watchlist ) ? $watchlist : array() );

	return alpaca_rest_response( array( 'success' => true, 'watchlist' => $watchlist ), 200 );
}
function alpaca_update_watchlist_callback( WP_REST_Request $request ) {
	$params             = $request->get_json_params();
	$issue_id           = isset( $params['issue_id'] ) ? (int) $params['issue_id'] : 0;
	$user_id            = get_current_user_id();
	$original_watchlist = get_user_meta( $user_id, 'alpaca_watchlist', true );
	$original_watchlist = is_array( $original_watchlist ) ? $original_watchlist : array();
	$watchlist          = alpaca_to_int_ids( $original_watchlist );

	if ( $issue_id > 0 ) {
		if ( in_array( $issue_id, $watchlist, true ) ) {
			$watchlist = array_values( array_diff( $watchlist, array( $issue_id ) ) );
		} else {
			$watchlist[] = $issue_id;
		}
		update_user_meta( $user_id, 'alpaca_watchlist', $watchlist, $original_watchlist );
	}

	return alpaca_rest_response( array( 'success' => true, 'watchlist' => $watchlist ), 200 );
}

/* -------------------------------------------------------------
 * Statuses: list + update
 * ----------------------------------------------------------- */
add_action( 'rest_api_init', 'alpaca_get_statuses_endpoint' );
function alpaca_get_statuses_endpoint() {
	register_rest_route(
		'alpaca/v1',
		'/statuses',
		array(
			'methods'             => 'GET',
			'callback'            => 'alpaca_get_statuses_callback',
			'permission_callback' => function () {
				return current_user_can( 'manage_options' );
			},
		)
	);
}
function alpaca_get_statuses_callback() {
	$statuses = alpaca_get_statuses(); // external
	if ( is_wp_error( $statuses ) ) {
		return $statuses;
	}
	return alpaca_rest_response( $statuses, 200 );
}

add_action( 'rest_api_init', 'alpaca_update_status_endpoint' );
function alpaca_update_status_endpoint() {
	register_rest_route(
		'alpaca/v1',
		'/status/(?P<id>\d+)',
		array(
			'methods'             => 'POST',
			'callback'            => 'alpaca_update_status_callback',
			'permission_callback' => function () {
				return current_user_can( 'edit_posts' );
			},
			'args'                 => array(
				'id' => array(
					'validate_callback' => function ( $param ) {
						return is_numeric( $param ) && $param > 0;
					},
				),
			),
		)
	);
}
function alpaca_update_status_callback( WP_REST_Request $request ) {
	$term_id = (int) $request['id'];
	$data    = $request->get_json_params();

	$term = get_term( $term_id, 'status' );
	if ( ! $term || is_wp_error( $term ) ) {
		return alpaca_rest_response(
			array( 'success' => false, 'message' => 'Status not found.' ),
			404
		);
	}

	if ( isset( $data['name'] ) ) {
		$new_name = (string) $data['name'];
		$new_slug = sanitize_title( $new_name );

		$update_result = wp_update_term(
			$term_id,
			'status',
			array(
				'name' => $new_name,
				'slug' => $new_slug,
			)
		);

		if ( is_wp_error( $update_result ) ) {
			return alpaca_rest_response(
				array( 'success' => false, 'message' => 'Failed to update status name and slug.' ),
				500
			);
		}
	}

	if ( array_key_exists( 'term_score', (array) $data ) ) {
		update_term_meta( $term_id, 'term_score', $data['term_score'] );
	}

	return alpaca_rest_response(
		array( 'success' => true, 'message' => 'Status updated successfully.' ),
		200
	);
}

/* -------------------------------------------------------------
 * Issue: delete
 * ----------------------------------------------------------- */
add_action( 'rest_api_init', 'alpaca_delete_issue' );
function alpaca_delete_issue() {
	register_rest_route(
		'issue/v1',
		'/delete/(?P<id>\d+)',
		array(
			'methods'             => 'DELETE',
			'callback'            => 'alpaca_delete_issue_callback',
			'permission_callback' => function ( WP_REST_Request $request ) {
				$post_id = (int) $request['id'];
				return current_user_can( 'delete_post', $post_id );
			},
			'args'                 => array(
				'id' => array(
					'validate_callback' => function ( $param ) {
						return is_numeric( $param ) && $param > 0;
					},
				),
			),
		)
	);
}
function alpaca_delete_issue_callback( WP_REST_Request $request ) {
	$issue_id = (int) $request['id'];
	$post     = alpaca_assert_issue_exists( $issue_id );

	if ( ! $post ) {
		return alpaca_rest_response(
			array( 'success' => false, 'message' => 'Issue not found.' ),
			404
		);
	}

	$result = wp_delete_post( $issue_id, true );
	if ( ! $result ) {
		return alpaca_rest_response(
			array( 'success' => false, 'message' => 'Failed to delete the issue.' ),
			500
		);
	}

	return alpaca_rest_response(
		array( 'success' => true, 'message' => 'Issue deleted successfully.' ),
		200
	);
}

/* -------------------------------------------------------------
 * Issue: checklist
 * ----------------------------------------------------------- */
add_action( 'rest_api_init', 'alpaca_update_checklist_endpoint' );
function alpaca_update_checklist_endpoint() {
	register_rest_route(
		'issue/v1',
		'/checklist/(?P<id>\d+)',
		array(
			'methods'             => 'POST',
			'callback'            => 'alpaca_update_checklist_callback',
			'permission_callback' => function ( WP_REST_Request $request ) {
				$post_id = (int) $request['id'];
				return current_user_can( 'edit_post', $post_id );
			},
			'args'                 => array(
				'id' => array(
					'validate_callback' => function ( $param ) {
						return is_numeric( $param ) && $param > 0;
					},
				),
			),
		)
	);
}
function alpaca_update_checklist_callback( WP_REST_Request $request ) {
	$issue_id       = (int) $request['id'];
	$checklist_data = $request->get_json_params();

	$post = alpaca_assert_issue_exists( $issue_id );
	if ( ! $post ) {
		return alpaca_rest_response(
			array( 'success' => false, 'message' => 'Issue not found.' ),
			404
		);
	}

	if ( ! is_array( $checklist_data ) ) {
		return alpaca_rest_response(
			array( 'success' => false, 'message' => 'Invalid checklist data.' ),
			400
		);
	}

	update_post_meta( $issue_id, 'checklist', wp_json_encode( $checklist_data ) );

	return alpaca_rest_response(
		array( 'success' => true, 'message' => 'Checklist updated successfully.' ),
		200
	);
}
