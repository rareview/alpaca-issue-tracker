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
		array(
			'methods'             => 'POST',
			'callback'            => 'alpaca_issue_callback',
			'permission_callback' => function ( WP_REST_Request $request ) {
				return \Alpaca\Inc\Helpers::validate_rest_nonce_permission( $request, 'create_issue' );
			},
		)
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
			array(
				'success' => false,
				'message' => esc_html__( 'Invalid request body.', 'alpaca' ),
			),
			400
		);
	}

	// Extract user + input safely.
	$user_id          = get_current_user_id();
	$feedback_raw     = (string) alpaca_arr_get( $payload, array( 'userinput', 'feedback' ), '' );
	$include_ctx      = (bool) alpaca_arr_get( $payload, array( 'userinput', 'includeContext' ), false );
	$is_high_priority = (bool) alpaca_arr_get( $payload, array( 'userinput', 'isHighPriority' ), false );

	if ( '' === trim( $feedback_raw ) ) {
		return alpaca_rest_response(
			'',
			array(
				'success' => false,
				'message' => esc_html__( 'Feedback is required.', 'alpaca' ),
			),
			400
		);
	}

	// Prepare post args (keep original behavior).
	$getbody   = $req->get_body();
	$post_args = array(
		'post_type'      => 'alpaca_issue',
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
			'',
			array(
				'success' => false,
				'message' => esc_html__( 'Failed to create issue.', 'alpaca' ),
			),
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
			$score = (int) alpaca_arr_get( (array) $s, array( 'term_score' ), 0 );
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
			wp_set_post_terms( $post_id, array( (int) $status_term->term_id ), 'alpaca_status' );
			$status_term_id = (int) $status_term->term_id;

			// Add new issue to the top of the issue_order for this status.
			$current_order = get_term_meta( $status_term_id, 'issue_order', true );
			$current_order = is_array( $current_order ) ? $current_order : array();
			// Remove the new issue ID if it already exists.
			$current_order = array_values( array_diff( $current_order, array( $post_id ) ) );
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
		$browser_name = (string) alpaca_arr_get( $payload, array( 'client', 'browser', 'name' ), '' );
		$os_name      = (string) alpaca_arr_get( $payload, array( 'client', 'os' ), '' );
		$template     = (string) alpaca_arr_get( $payload, array( 'wp', 'template' ), '' );
		$wp_types     = (array) alpaca_arr_get( $payload, array( 'wp', 'type' ), array() );

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

		update_post_meta( $post_id, 'alpaca_screenwidth', (int) alpaca_arr_get( $payload, array( 'client', 'browser', 'width' ), 0 ) );
		update_post_meta( $post_id, 'alpaca_screenheight', (int) alpaca_arr_get( $payload, array( 'client', 'browser', 'height' ), 0 ) );
		update_post_meta( $post_id, 'alpaca_url', esc_url_raw( (string) alpaca_arr_get( $payload, array( 'server', 'REQUEST_URI' ), '' ) ) );

		$qo = alpaca_arr_get( $payload, array( 'wp', 'queriedObject' ), null );
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

		$headers = alpaca_arr_get( $payload, array( 'headers' ), null );
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
	$errors = alpaca_arr_get( $payload, array( 'errors' ), null );
	if ( ! empty( $errors ) && is_array( $errors ) ) {
		// Basic sanitization of error fields.
		$sanitized_errors = array();
		foreach ( $errors as $error ) {
			if ( is_array( $error ) ) {
				$sanitized_error = array(
					'message'  => isset( $error['message'] ) ? sanitize_text_field( $error['message'] ) : '',
					'filename' => isset( $error['filename'] ) ? sanitize_text_field( $error['filename'] ) : '',
					'lineno'   => isset( $error['lineno'] ) ? (int) $error['lineno'] : 0,
					'colno'    => isset( $error['colno'] ) ? (int) $error['colno'] : 0,
					'stack'    => isset( $error['stack'] ) ? esc_textarea( $error['stack'] ) : '',
				);
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
		array(
			'title'            => $post_args['post_title'],
			'is_high_priority' => $is_high_priority,
			'statusId'         => $status_term_id,
		)
	);

	return alpaca_rest_response(
		'issue_submit',
		array_merge(
			array(
				'success' => true,
				'message' => esc_html__( 'Issue submitted successfully.', 'alpaca' ),
			),
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
		array(
			'methods'             => 'POST',
			'callback'            => 'alpaca_update_issue_callback',
			'permission_callback' => function ( WP_REST_Request $request ) {
				return \Alpaca\Inc\Helpers::validate_rest_nonce_permission( $request, 'update_issue' );
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
			array(
				'success' => false,
				'message' => esc_html__( 'Issue not found.', 'alpaca' ),
			),
			404
		);
	}

	$post_args = array(
		'ID'                => $issue_id,
		'post_title'        => isset( $data['title'] ) ? wp_kses_post( (string) $data['title'] ) : $post->post_title,
		'post_content'      => isset( $data['content'] ) ? wp_kses_post( (string) $data['content'] ) : $post->post_content,
		'post_modified'     => current_time( 'mysql' ),
		'post_modified_gmt' => current_time( 'mysql', 1 ),
	);
	if ( array_key_exists( 'post_parent', (array) $data ) ) {
		$post_parent = (int) $data['post_parent'];

		if ( $post_parent < 0 ) {
			return alpaca_rest_response(
				'',
				array(
					'success' => false,
					'message' => esc_html__( 'Invalid parent issue.', 'alpaca' ),
				),
				400
			);
		}

		if ( $post_parent === $issue_id ) {
			return alpaca_rest_response(
				'',
				array(
					'success' => false,
					'message' => esc_html__( 'An issue cannot be its own parent.', 'alpaca' ),
				),
				400
			);
		}

		if ( $post_parent > 0 ) {
			$parent_post = alpaca_assert_issue_exists( $post_parent );
			if ( ! $parent_post ) {
				return alpaca_rest_response(
					'',
					array(
						'success' => false,
						'message' => esc_html__( 'Parent issue not found.', 'alpaca' ),
					),
					404
				);
			}

			$parent_ancestors = array_map( 'intval', (array) get_post_ancestors( $parent_post ) );
			if ( in_array( $issue_id, $parent_ancestors, true ) ) {
				return alpaca_rest_response(
					'',
					array(
						'success' => false,
						'message' => esc_html__( 'Invalid parent hierarchy.', 'alpaca' ),
					),
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
			array(
				'success' => false,
				'message' => esc_html__( 'Failed to update the issue.', 'alpaca' ),
			),
			500
		);
	}

	// Taxonomies.
	if ( isset( $data['taxonomies'] ) && is_array( $data['taxonomies'] ) ) {
		foreach ( $data['taxonomies'] as $taxonomy => $terms ) {
			// Sanitize taxonomy name.
			$taxonomy = sanitize_key( $taxonomy );

				// Map old taxonomy names to new ones if necessary (for backward compat in JS payload).
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

	// Extract overrides for response data.
	$override_data = array(
		'title' => $post_args['post_title'],
	);
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
			array(
				'success' => true,
				'message' => esc_html__( 'Issue updated successfully.', 'alpaca' ),
			),
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
	$assignees   = array();
	$terms       = wp_get_object_terms( $subissue_id, 'alpaca_assignee', array( 'fields' => 'all' ) );

	if ( ! is_wp_error( $terms ) && ! empty( $terms ) ) {
		foreach ( $terms as $term ) {
			$assignees[] = array(
				'term_id'      => (int) $term->term_id,
				'name'         => $term->name,
				'slug'         => $term->slug,
				'username'     => $term->name,
				'display_name' => $term->description,
			);
		}
	}

	$status_terms = wp_get_object_terms( $subissue_id, 'alpaca_status', array( 'fields' => 'all' ) );
	$status_data  = array();

	if ( ! is_wp_error( $status_terms ) && ! empty( $status_terms ) ) {
		$status_data = array_map(
			static function ( $term ) {
				return array(
					'term_id' => (int) $term->term_id,
					'name'    => $term->name,
					'slug'    => $term->slug,
				);
			},
			$status_terms
		);
	}

	return array(
		'id'           => $subissue_id,
		'slug'         => (string) $post->post_name,
		'title'        => (string) $post->post_title,
		'content'      => (string) $post->post_content,
		'post_parent'  => (int) $post->post_parent,
		'is_completed' => ! empty( get_post_meta( $subissue_id, 'alpaca_subissue_completed', true ) ),
		'assignees'    => $assignees,
		'status'       => $status_data,
	);
}

/**
 * Get all subissues belonging to an issue.
 *
 * @param int $issue_id Parent issue post ID.
 * @return array Formatted subissues data.
 */
function alpaca_get_subissues_for_issue( $issue_id ) {
	$subissues = get_children(
		array(
			'post_parent'    => (int) $issue_id,
			'post_type'      => 'alpaca_issue',
			'post_status'    => array( 'publish', 'private' ),
			'posts_per_page' => -1,
			'orderby'        => 'date',
			'order'          => 'ASC',
		)
	);

	if ( empty( $subissues ) ) {
		return array();
	}

	$formatted_subissues = array();
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
		array(
			'methods'             => 'POST',
			'callback'            => 'alpaca_create_subissue_callback',
			// Require authentication and a valid nonce for browser-originated calls.
			'permission_callback' => function ( WP_REST_Request $request ) {
				return \Alpaca\Inc\Helpers::validate_rest_nonce_permission( $request, 'create_issue' );
			},
			'args'                => array(
				'parent_id' => array(
					'required'          => true,
					'validate_callback' => function ( $param ) {
						return is_numeric( $param ) && (int) $param > 0;
					},
				),
				'content'   => array(
					'required'          => true,
					'validate_callback' => function ( $param ) {
						return is_string( $param ) && '' !== trim( $param );
					},
				),
			),
		)
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
	$payload = is_array( $payload ) ? $payload : array();

	$parent_id = isset( $payload['parent_id'] ) ? (int) $payload['parent_id'] : 0;
	$content   = isset( $payload['content'] ) ? trim( (string) $payload['content'] ) : '';

	$parent_issue = alpaca_assert_issue_exists( $parent_id );
	if ( ! $parent_issue ) {
		return alpaca_rest_response(
			'',
			array(
				'success' => false,
				'message' => esc_html__( 'Parent issue not found.', 'alpaca' ),
			),
			404
		);
	}

	if ( '' === $content ) {
		return alpaca_rest_response(
			'',
			array(
				'success' => false,
				'message' => esc_html__( 'Subissue title is required.', 'alpaca' ),
			),
			400
		);
	}

	$post_args = array(
		'post_type'      => 'alpaca_issue',
		'post_status'    => 'publish',
		'post_author'    => get_current_user_id(),
		'post_title'     => wp_kses_post( $content ),
		'post_name'      => hash( 'adler32', (string) $request->get_body() ),
		'post_content'   => wp_kses_post( $content ),
		'post_parent'    => $parent_id,
		'comment_status' => 'open',
	);

	$subissue_id = wp_insert_post( $post_args, true );
	if ( is_wp_error( $subissue_id ) || 0 === (int) $subissue_id ) {
		return alpaca_rest_response(
			'',
			array(
				'success' => false,
				'message' => esc_html__( 'Failed to create subissue.', 'alpaca' ),
			),
			500
		);
	}

	$parent_status_ids = wp_get_post_terms( $parent_id, 'alpaca_status', array( 'fields' => 'ids' ) );
	if ( ! is_wp_error( $parent_status_ids ) && ! empty( $parent_status_ids ) ) {
		wp_set_post_terms( $subissue_id, alpaca_to_int_ids( $parent_status_ids ), 'alpaca_status', false );
	}

	$subissue_post = get_post( $subissue_id );

	return alpaca_rest_response(
		'subissue_create',
		array(
			'success'  => true,
			'message'  => esc_html__( 'Subissue created successfully.', 'alpaca' ),
			'subissue' => alpaca_get_subissue_response_data( $subissue_post ),
		),
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
		array(
			'methods'             => 'GET',
			'callback'            => 'alpaca_get_issue_data_callback',
			'permission_callback' => function () {
				return \Alpaca\Inc\Helpers::user_can( 'comment_count' );
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
			array(
				'success' => false,
				'message' => esc_html__( 'Issue not found.', 'alpaca' ),
			),
			404
		);
	}

	$post_data                             = $post->to_array();
	$post_data['post_author_display_name'] = get_the_author_meta( 'display_name', $post_data['post_author'] );
	$post_data['post_author_img']          = alpaca_avatar( $post_data['post_author'], 32 );

	$meta           = get_post_meta( $issue_id );
	$formatted_meta = array();
	foreach ( $meta as $key => $value ) {
		// PHP 7 compat: avoid str_starts_with.
		if ( 0 === strpos( $key, '_' ) ) {
			continue;
		}

		$formatted_meta[ $key ] = maybe_unserialize( $value[0] );
	}

	$all_taxonomies  = get_object_taxonomies( 'alpaca_issue', 'objects' );
	$terms_data      = array();
	$taxonomy_labels = array();
	foreach ( $all_taxonomies as $taxonomy_obj ) {
		$terms = wp_get_object_terms( $issue_id, $taxonomy_obj->name, array( 'fields' => 'all' ) );
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

	if ( isset( $terms_data['alpaca_status'] ) ) {
		$terms_data['status']      = $terms_data['alpaca_status'];
		$taxonomy_labels['status'] = $taxonomy_labels['alpaca_status'];
	}
	if ( isset( $terms_data['alpaca_assignee'] ) ) {
		$terms_data['assignee']      = $terms_data['alpaca_assignee'];
		$taxonomy_labels['assignee'] = $taxonomy_labels['alpaca_assignee'];
	}
	if ( isset( $terms_data['alpaca_label'] ) ) {
		$terms_data['label']      = $terms_data['alpaca_label'];
		$taxonomy_labels['label'] = $taxonomy_labels['alpaca_label'];
	}
	if ( isset( $terms_data['alpaca_watching'] ) ) {
		$terms_data['watching']      = $terms_data['alpaca_watching'];
		$taxonomy_labels['watching'] = $taxonomy_labels['alpaca_watching'];
	}

	$issue_comment_count = get_comments(
		array(
			'post_id' => $issue_id,
			'type'    => 'issuecomment',
			'count'   => true,
		)
	);
	$subissues           = alpaca_get_subissues_for_issue( $issue_id );

	return alpaca_rest_response(
		'',
		array(
			'success'         => true,
			'message'         => esc_html__( 'Issue data retrieved successfully.', 'alpaca' ),
			'post_id'         => $issue_id,
			'post_data'       => $post_data,
			'meta'            => $formatted_meta,
			'taxonomies'      => $terms_data,
			'taxonomy_labels' => $taxonomy_labels,
			'subissues'       => $subissues,
			'comment_count'   => (int) $issue_comment_count,
		),
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
		array(
			'methods'             => 'GET',
			'callback'            => 'alpaca_get_issue_comment_count_callback',
			'permission_callback' => function () {
				return \Alpaca\Inc\Helpers::user_can( 'list_users' );
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
 * Callback for comment count endpoint.
 *
 * @param WP_REST_Request $request REST request object.
 * @return WP_REST_Response REST response with comment count.
 */
function alpaca_get_issue_comment_count_callback( WP_REST_Request $request ) {

	$issue_id                     = (int) $request['id'];
	$comment_count_data           = function_exists( 'alpaca_get_issue_comment_counts' )
	? alpaca_get_issue_comment_counts( array( $issue_id ) )
		: array(
			'totals'   => array(),
			'by_agent' => array(),
		);
	$comment_counts               = isset( $comment_count_data['totals'] ) ? $comment_count_data['totals'] : array();
	$comment_counts_by_agent      = isset( $comment_count_data['by_agent'] ) ? $comment_count_data['by_agent'] : array();
	$issue_comment_count          = isset( $comment_counts[ $issue_id ] ) ? (int) $comment_counts[ $issue_id ] : 0;
	$issue_comment_count_by_agent = isset( $comment_counts_by_agent[ $issue_id ] ) && is_array( $comment_counts_by_agent[ $issue_id ] )
		? $comment_counts_by_agent[ $issue_id ]
		: array();

	return alpaca_rest_response(
		'',
		array(
			'success'                => true,
			'post_id'                => $issue_id,
			'comment_count'          => $issue_comment_count,
			'comment_count_by_agent' => $issue_comment_count_by_agent,
		),
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
		array(
			'methods'             => 'DELETE',
			'callback'            => 'alpaca_delete_issue_callback',
			'permission_callback' => function ( WP_REST_Request $request ) {
				$post_id = (int) $request['id'];
				return \Alpaca\Inc\Helpers::validate_rest_nonce_permission(
					$request,
					'delete_post',
					array(
						'post_id' => $post_id,
					)
				);
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
			array(
				'success' => false,
				'message' => esc_html__( 'Issue not found.', 'alpaca' ),
			),
			404
		);
	}

	$result = wp_trash_post( $issue_id );
	// Note: restoring from Trash puts the issue in Draft.
	if ( ! $result ) {
		return alpaca_rest_response(
			'',
			array(
				'success' => false,
				'message' => esc_html__( 'Failed to trash the issue.', 'alpaca' ),
			),
			500
		);
	}

	return alpaca_rest_response(
		'issue_trash',
		array(
			'success' => true,
			'message' => esc_html__( 'Issue trashed successfully.', 'alpaca' ),
		),
		200
	);
}
