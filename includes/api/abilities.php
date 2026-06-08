<?php
/**
 * Alpaca Issue Tracker: WordPress Abilities API registrations and callbacks.
 *
 * @package AlpacaIssueTracker
 */

use AlpacaIssueTracker\Helpers;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Hook category registration.
add_action( 'wp_abilities_api_categories_init', 'alpaistr_register_abilities_category' );

// Hook abilities registration.
add_action( 'wp_abilities_api_init', 'alpaistr_register_abilities' );

/**
 * Register Alpaca abilities category.
 *
 * @return void
 */
function alpaistr_register_abilities_category() {
	if ( function_exists( 'wp_register_ability_category' ) ) {
		wp_register_ability_category(
			'alpaca',
			[
				'label'       => __( 'Alpaca Issue Tracker', 'alpaca-issue-tracker' ),
				'description' => __( 'Abilities for managing issues, comments, and the project board in the Alpaca Issue Tracker.', 'alpaca-issue-tracker' ),
			]
		);
	}
}

/**
 * Register Alpaca abilities with WordPress Abilities API.
 *
 * @return void
 */
function alpaistr_register_abilities() {
	if ( ! function_exists( 'wp_register_ability' ) ) {
		return;
	}

	// 1. Get Board.
	wp_register_ability(
		'alpaca/get-board',
		[
			'label'               => __( 'Get Board', 'alpaca-issue-tracker' ),
			'description'         => __( 'Retrieves the backlog and board columns with their issues.', 'alpaca-issue-tracker' ),
			'category'            => 'alpaca',
			'execute_callback'    => 'alpaistr_ability_get_board',
			'permission_callback' => 'alpaistr_ability_permission_view',
			'input_schema'        => [
				'type'                 => 'object',
				'properties'           => [],
				'additionalProperties' => false,
			],
			'output_schema'       => [
				'type'  => 'array',
				'items' => [
					'type'       => 'object',
					'properties' => [
						'id'     => [ 'type' => 'integer' ],
						'title'  => [ 'type' => 'string' ],
						'issues' => [ 'type' => 'array' ],
					],
				],
			],
			'meta'                => [
				'show_in_rest' => true,
				'mcp'          => [
					'public' => true,
					'type'   => 'tool',
				],
			],
		]
	);

	// 2. Create Issue.
	wp_register_ability(
		'alpaca/create-issue',
		[
			'label'               => __( 'Create Issue', 'alpaca-issue-tracker' ),
			'description'         => __( 'Creates a new issue in the tracker.', 'alpaca-issue-tracker' ),
			'category'            => 'alpaca',
			'execute_callback'    => 'alpaistr_ability_create_issue',
			'permission_callback' => 'alpaistr_ability_permission_create',
			'input_schema'        => [
				'type'       => 'object',
				'properties' => [
					'feedback'         => [
						'type'        => 'string',
						'description' => __( 'The title or feedback content of the issue.', 'alpaca-issue-tracker' ),
					],
					'is_high_priority' => [
						'type'        => 'boolean',
						'description' => __( 'Whether the issue is high priority.', 'alpaca-issue-tracker' ),
					],
				],
				'required'   => [ 'feedback' ],
			],
			'output_schema'       => [
				'type'       => 'object',
				'properties' => [
					'post_id'  => [ 'type' => 'integer' ],
					'issue'    => [ 'type' => 'object' ],
					'statusId' => [ 'type' => 'integer' ],
				],
			],
			'meta'                => [
				'show_in_rest' => true,
				'mcp'          => [
					'public' => true,
					'type'   => 'tool',
				],
			],
		]
	);

	// 3. Get Issue.
	wp_register_ability(
		'alpaca/get-issue',
		[
			'label'               => __( 'Get Issue Details', 'alpaca-issue-tracker' ),
			'description'         => __( 'Retrieves detailed data for a specific issue by its ID.', 'alpaca-issue-tracker' ),
			'category'            => 'alpaca',
			'execute_callback'    => 'alpaistr_ability_get_issue',
			'permission_callback' => 'alpaistr_ability_permission_view',
			'input_schema'        => [
				'type'       => 'object',
				'properties' => [
					'id' => [
						'type'        => 'integer',
						'description' => __( 'The ID of the issue.', 'alpaca-issue-tracker' ),
					],
				],
				'required'   => [ 'id' ],
			],
			'output_schema'       => [
				'type'       => 'object',
				'properties' => [
					'success'       => [ 'type' => 'boolean' ],
					'post_id'       => [ 'type' => 'integer' ],
					'post_data'     => [ 'type' => 'object' ],
					'parent_issue'  => [ 'type' => [ 'object', 'null' ] ],
					'meta'          => [ 'type' => 'object' ],
					'taxonomies'    => [ 'type' => 'object' ],
					'subissues'     => [ 'type' => 'array' ],
					'comment_count' => [ 'type' => 'integer' ],
				],
			],
			'meta'                => [
				'show_in_rest' => true,
				'mcp'          => [
					'public' => true,
					'type'   => 'tool',
				],
			],
		]
	);

	// 4. Update Issue.
	wp_register_ability(
		'alpaca/update-issue',
		[
			'label'               => __( 'Update Issue', 'alpaca-issue-tracker' ),
			'description'         => __( 'Updates specified fields of a given issue.', 'alpaca-issue-tracker' ),
			'category'            => 'alpaca',
			'execute_callback'    => 'alpaistr_ability_update_issue',
			'permission_callback' => 'alpaistr_ability_permission_update',
			'input_schema'        => [
				'type'       => 'object',
				'properties' => [
					'id'               => [
						'type'        => 'integer',
						'description' => __( 'The ID of the issue to update.', 'alpaca-issue-tracker' ),
					],
					'title'            => [
						'type'        => 'string',
						'description' => __( 'The new title for the issue.', 'alpaca-issue-tracker' ),
					],
					'content'          => [
						'type'        => 'string',
						'description' => __( 'The new description content for the issue.', 'alpaca-issue-tracker' ),
					],
					'status_id'        => [
						'type'        => 'integer',
						'description' => __( 'The ID of the status term to assign.', 'alpaca-issue-tracker' ),
					],
					'is_high_priority' => [
						'type'        => 'boolean',
						'description' => __( 'Set to true to mark the issue as high priority, or false to clear.', 'alpaca-issue-tracker' ),
					],
					'parent_id'        => [
						'type'        => 'integer',
						'description' => __( 'The parent issue ID (0 to remove parent).', 'alpaca-issue-tracker' ),
					],
					'assignees'        => [
						'type'        => 'array',
						'items'       => [ 'type' => 'string' ],
						'description' => __( 'An array of user slugs to assign to the issue.', 'alpaca-issue-tracker' ),
					],
				],
				'required'   => [ 'id' ],
			],
			'output_schema'       => [
				'type'       => 'object',
				'properties' => [
					'post_id'  => [ 'type' => 'integer' ],
					'issue'    => [ 'type' => 'object' ],
					'statusId' => [ 'type' => 'integer' ],
				],
			],
			'meta'                => [
				'show_in_rest' => true,
				'mcp'          => [
					'public' => true,
					'type'   => 'tool',
				],
			],
		]
	);

	// 5. Delete Issue.
	wp_register_ability(
		'alpaca/delete-issue',
		[
			'label'               => __( 'Delete Issue', 'alpaca-issue-tracker' ),
			'description'         => __( 'Moves a specific issue to the trash.', 'alpaca-issue-tracker' ),
			'category'            => 'alpaca',
			'execute_callback'    => 'alpaistr_ability_delete_issue',
			'permission_callback' => 'alpaistr_ability_permission_delete',
			'input_schema'        => [
				'type'       => 'object',
				'properties' => [
					'id' => [
						'type'        => 'integer',
						'description' => __( 'The ID of the issue to move to trash.', 'alpaca-issue-tracker' ),
					],
				],
				'required'   => [ 'id' ],
			],
			'output_schema'       => [
				'type'       => 'object',
				'properties' => [
					'success' => [ 'type' => 'boolean' ],
					'message' => [ 'type' => 'string' ],
					'id'      => [ 'type' => 'integer' ],
				],
			],
			'meta'                => [
				'show_in_rest' => true,
				'mcp'          => [
					'public' => true,
					'type'   => 'tool',
				],
			],
		]
	);

	// 6. Add Comment.
	wp_register_ability(
		'alpaca/add-comment',
		[
			'label'               => __( 'Add Comment', 'alpaca-issue-tracker' ),
			'description'         => __( 'Posts a new comment on a specific issue.', 'alpaca-issue-tracker' ),
			'category'            => 'alpaca',
			'execute_callback'    => 'alpaistr_ability_add_comment',
			'permission_callback' => 'alpaistr_ability_permission_create',
			'input_schema'        => [
				'type'       => 'object',
				'properties' => [
					'issue_id' => [
						'type'        => 'integer',
						'description' => __( 'The ID of the issue.', 'alpaca-issue-tracker' ),
					],
					'content'  => [
						'type'        => 'string',
						'description' => __( 'The comment content.', 'alpaca-issue-tracker' ),
					],
				],
				'required'   => [ 'issue_id', 'content' ],
			],
			'output_schema'       => [
				'type'       => 'object',
				'properties' => [
					'success'    => [ 'type' => 'boolean' ],
					'comment_id' => [ 'type' => 'integer' ],
					'comment'    => [ 'type' => 'object' ],
				],
			],
			'meta'                => [
				'show_in_rest' => true,
				'mcp'          => [
					'public' => true,
					'type'   => 'tool',
				],
			],
		]
	);

	// 7. Get Comments.
	wp_register_ability(
		'alpaca/get-comments',
		[
			'label'               => __( 'Get Comments', 'alpaca-issue-tracker' ),
			'description'         => __( 'Retrieves comments for a specific issue.', 'alpaca-issue-tracker' ),
			'category'            => 'alpaca',
			'execute_callback'    => 'alpaistr_ability_get_comments',
			'permission_callback' => 'alpaistr_ability_permission_view',
			'input_schema'        => [
				'type'       => 'object',
				'properties' => [
					'issue_id' => [
						'type'        => 'integer',
						'description' => __( 'The ID of the issue.', 'alpaca-issue-tracker' ),
					],
				],
				'required'   => [ 'issue_id' ],
			],
			'output_schema'       => [
				'type'  => 'array',
				'items' => [
					'type'       => 'object',
					'properties' => [
						'id'          => [ 'type' => 'integer' ],
						'content'     => [ 'type' => 'string' ],
						'author_name' => [ 'type' => 'string' ],
						'author_id'   => [ 'type' => 'integer' ],
						'date'        => [ 'type' => 'string' ],
						'date_gmt'    => [ 'type' => 'string' ],
					],
				],
			],
			'meta'                => [
				'show_in_rest' => true,
				'mcp'          => [
					'public' => true,
					'type'   => 'tool',
				],
			],
		]
	);
}

/**
 * Permission callback: View permission checks.
 *
 * Checks if the current user has capability to view issues/board.
 *
 * @return bool True if authorized, false otherwise.
 */
function alpaistr_ability_permission_view() {
	return Helpers::user_can( 'view_board' );
}

/**
 * Permission callback: Create permission checks.
 *
 * Checks if the current user has capability to create issues/comments.
 *
 * @return bool True if authorized, false otherwise.
 */
function alpaistr_ability_permission_create() {
	return Helpers::user_can( 'create_issue' );
}

/**
 * Permission callback: Update permission checks.
 *
 * Checks if the current user has capability to update issues.
 *
 * @return bool True if authorized, false otherwise.
 */
function alpaistr_ability_permission_update() {
	return Helpers::user_can( 'update_issue' );
}

/**
 * Permission callback: Delete permission checks.
 *
 * Checks if the current user has capability to delete issues.
 *
 * @return bool True if authorized, false otherwise.
 */
function alpaistr_ability_permission_delete() {
	return Helpers::user_can( 'delete_issue' );
}

/**
 * Ability callback: Get board data.
 *
 * @param array $input Input parameters.
 * @return array|\WP_Error Board data or error.
 */
function alpaistr_ability_get_board( $input ) {
	unset( $input );

	if ( ! function_exists( 'alpaistr_get_board_data' ) ) {
		return new WP_Error(
			'missing_function',
			__( 'Alpaca Issue Tracker core board functions are missing.', 'alpaca-issue-tracker' )
		);
	}

	return alpaistr_get_board_data();
}

/**
 * Ability callback: Create a new issue.
 *
 * @param array $input Input parameters.
 * @return array|\WP_Error Issue response data or error.
 */
function alpaistr_ability_create_issue( $input ) {
	$feedback_raw = isset( $input['feedback'] ) ? trim( (string) $input['feedback'] ) : '';

	if ( '' === $feedback_raw ) {
		return new WP_Error(
			'missing_feedback',
			__( 'Feedback is required.', 'alpaca-issue-tracker' )
		);
	}

	$user_id   = get_current_user_id();
	$post_args = [
		'post_type'      => 'alpaca_issue',
		'post_status'    => 'publish',
		'post_author'    => $user_id,
		'post_title'     => wp_kses_post( wp_trim_words( $feedback_raw, 10 ) ),
		'post_name'      => hash( 'adler32', $feedback_raw ),
		'post_content'   => wp_kses_post( $feedback_raw ),
		'comment_status' => 'open',
	];

	$post_id = wp_insert_post( $post_args, true );

	if ( is_wp_error( $post_id ) || 0 === (int) $post_id ) {
		return new WP_Error(
			'create_failed',
			__( 'Failed to create issue.', 'alpaca-issue-tracker' )
		);
	}

	$status_term_id = 0;
	$statuses       = alpaistr_get_statuses();

	if ( ! empty( $statuses ) && ! is_wp_error( $statuses ) ) {
		$status_term = null;
		$min_score   = PHP_INT_MAX;

		foreach ( $statuses as $s ) {
			$score = (int) alpaistr_arr_get( (array) $s, [ 'term_score' ], 0 );
			if ( $score < $min_score ) {
				$min_score   = $score;
				$status_term = $s;
			}
		}

		if ( ! $status_term ) {
			$status_term = reset( $statuses );
		}

		$status_term = apply_filters( 'alpaca_default_status', $status_term, $statuses );

		if ( $status_term ) {
			wp_set_post_terms( $post_id, [ (int) $status_term->term_id ], 'alpaca_status' );
			$status_term_id = (int) $status_term->term_id;

			$current_order = get_term_meta( $status_term_id, 'issue_order', true );
			$current_order = is_array( $current_order ) ? $current_order : [];
			$current_order = array_values( array_diff( $current_order, [ $post_id ] ) );
			array_unshift( $current_order, $post_id );

			update_term_meta( $status_term_id, 'issue_order', $current_order );
			alpaistr_clear_board_cache();
		}
	}

	if ( ! empty( $input['is_high_priority'] ) ) {
		update_post_meta( $post_id, 'alpaca_high_priority', 1 );
	} else {
		delete_post_meta( $post_id, 'alpaca_high_priority' );
	}

	return alpaistr_get_issue_response_data( $post_id );
}

/**
 * Ability callback: Get details of a specific issue.
 *
 * @param array $input Input parameters.
 * @return array|\WP_Error Issue details data or error.
 */
function alpaistr_ability_get_issue( $input ) {
	$issue_id = isset( $input['id'] ) ? (int) $input['id'] : 0;
	$post     = alpaistr_assert_issue_exists( $issue_id );

	if ( ! $post ) {
		return new WP_Error(
			'issue_not_found',
			__( 'Issue not found.', 'alpaca-issue-tracker' )
		);
	}

	$post_data                             = $post->to_array();
	$post_data['post_author_display_name'] = get_the_author_meta( 'display_name', $post_data['post_author'] );
	$post_data['post_author_img']          = alpaistr_avatar( $post_data['post_author'], 32 );
	$parent_issue_data                     = null;
	$parent_issue_id                       = isset( $post_data['post_parent'] ) ? (int) $post_data['post_parent'] : 0;

	if ( $parent_issue_id > 0 ) {
		$parent_issue = alpaistr_assert_issue_exists( $parent_issue_id );

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
				$terms[ $idx ]->username     = (string) $term->name;
				$terms[ $idx ]->display_name = (string) $term->name;
				$terms[ $idx ]->description  = '';
			}
		}

		if ( 'alpaca_label' === $taxonomy_obj->name ) {
			foreach ( $terms as $idx => $term ) {
				$color = get_term_meta( $term->term_id, 'alpaca_label_color', true );
				if ( ! is_string( $color ) || '' === $color ) {
					$color = Helpers::DEFAULT_LABEL_COLOR;
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
	$subissues           = alpaistr_get_subissues_for_issue( $issue_id );

	return [
		'success'         => true,
		'post_id'         => $issue_id,
		'post_data'       => $post_data,
		'parent_issue'    => $parent_issue_data,
		'meta'            => $formatted_meta,
		'taxonomies'      => $terms_data,
		'taxonomy_labels' => $taxonomy_labels,
		'subissues'       => $subissues,
		'comment_count'   => (int) $issue_comment_count,
	];
}

/**
 * Ability callback: Update an issue.
 *
 * @param array $input Input parameters.
 * @return array|\WP_Error Issue details data or error.
 */
function alpaistr_ability_update_issue( $input ) {
	$issue_id = isset( $input['id'] ) ? (int) $input['id'] : 0;
	$post     = alpaistr_assert_issue_exists( $issue_id );

	if ( ! $post ) {
		return new WP_Error(
			'issue_not_found',
			__( 'Issue not found.', 'alpaca-issue-tracker' )
		);
	}

	$post_args = [
		'ID'                => $issue_id,
		'post_modified'     => current_time( 'mysql' ),
		'post_modified_gmt' => current_time( 'mysql', 1 ),
	];

	if ( isset( $input['title'] ) ) {
		$post_args['post_title'] = wp_kses_post( (string) $input['title'] );
	}

	if ( isset( $input['content'] ) ) {
		$post_args['post_content'] = wp_kses_post( (string) $input['content'] );
	}

	if ( isset( $input['parent_id'] ) ) {
		$parent_id = (int) $input['parent_id'];

		if ( $parent_id < 0 ) {
			return new WP_Error(
				'invalid_parent',
				__( 'Invalid parent issue.', 'alpaca-issue-tracker' )
			);
		}

		if ( $parent_id === $issue_id ) {
			return new WP_Error(
				'invalid_parent_self',
				__( 'An issue cannot be its own parent.', 'alpaca-issue-tracker' )
			);
		}

		if ( $parent_id > 0 ) {
			$parent_post = alpaistr_assert_issue_exists( $parent_id );
			if ( ! $parent_post ) {
				return new WP_Error(
					'parent_not_found',
					__( 'Parent issue not found.', 'alpaca-issue-tracker' )
				);
			}

			$parent_ancestors = array_map( 'intval', (array) get_post_ancestors( $parent_post ) );
			if ( in_array( $issue_id, $parent_ancestors, true ) ) {
				return new WP_Error(
					'invalid_parent_hierarchy',
					__( 'Invalid parent hierarchy.', 'alpaca-issue-tracker' )
				);
			}
		}

		$post_args['post_parent'] = $parent_id;
	}

	$update_result = wp_update_post( $post_args, true );
	if ( is_wp_error( $update_result ) ) {
		return new WP_Error(
			'update_failed',
			__( 'Failed to update the issue.', 'alpaca-issue-tracker' )
		);
	}

	if ( isset( $input['status_id'] ) ) {
		$status_id = (int) $input['status_id'];
		if ( term_exists( $status_id, 'alpaca_status' ) ) {
			wp_set_post_terms( $issue_id, [ $status_id ], 'alpaca_status', false );
		} else {
			return new WP_Error(
				'invalid_status_id',
				__( 'Status term not found.', 'alpaca-issue-tracker' )
			);
		}
	}

	if ( isset( $input['assignees'] ) && is_array( $input['assignees'] ) ) {
		$term_ids = [];
		foreach ( $input['assignees'] as $user_slug ) {
			$user_slug = sanitize_user( (string) $user_slug );
			if ( '' === $user_slug ) {
				continue;
			}

			$user = get_user_by( 'slug', $user_slug );
			if ( ! $user ) {
				continue;
			}

			$term_id = alpaistr_get_or_create_user_taxonomy_term( $user, 'alpaca_assignee' );
			if ( $term_id > 0 ) {
				$term_ids[] = $term_id;
			}
		}
		wp_set_post_terms( $issue_id, alpaistr_to_int_ids( $term_ids ), 'alpaca_assignee', false );
	}

	if ( isset( $input['is_high_priority'] ) ) {
		if ( (bool) $input['is_high_priority'] ) {
			update_post_meta( $issue_id, 'alpaca_high_priority', 1 );
		} else {
			delete_post_meta( $issue_id, 'alpaca_high_priority' );
		}
	}

	alpaistr_update_last_activity( $issue_id );
	alpaistr_clear_board_cache();

	return alpaistr_get_issue_response_data( $issue_id );
}

/**
 * Ability callback: Delete a specific issue.
 *
 * @param array $input Input parameters.
 * @return array|\WP_Error Deleted status object or error.
 */
function alpaistr_ability_delete_issue( $input ) {
	$issue_id = isset( $input['id'] ) ? (int) $input['id'] : 0;
	$post     = alpaistr_assert_issue_exists( $issue_id );

	if ( ! $post ) {
		return new WP_Error(
			'issue_not_found',
			__( 'Issue not found.', 'alpaca-issue-tracker' )
		);
	}

	$result = wp_trash_post( $issue_id );
	if ( ! $result ) {
		return new WP_Error(
			'delete_failed',
			__( 'Failed to delete the issue.', 'alpaca-issue-tracker' )
		);
	}

	alpaistr_clear_board_cache();

	return [
		'success' => true,
		'message' => __( 'Issue moved to trash successfully.', 'alpaca-issue-tracker' ),
		'id'      => $issue_id,
	];
}

/**
 * Ability callback: Add a comment to an issue.
 *
 * @param array $input Input parameters.
 * @return array|\WP_Error Posted comment info or error.
 */
function alpaistr_ability_add_comment( $input ) {
	$issue_id = isset( $input['issue_id'] ) ? (int) $input['issue_id'] : 0;
	$content  = isset( $input['content'] ) ? trim( (string) $input['content'] ) : '';

	$post = alpaistr_assert_issue_exists( $issue_id );
	if ( ! $post ) {
		return new WP_Error(
			'issue_not_found',
			__( 'Issue not found.', 'alpaca-issue-tracker' )
		);
	}

	if ( '' === $content ) {
		return new WP_Error(
			'missing_content',
			__( 'Comment content is required.', 'alpaca-issue-tracker' )
		);
	}

	$user        = wp_get_current_user();
	$commentdata = [
		'comment_post_ID'      => $issue_id,
		'comment_content'      => $content,
		'comment_type'         => 'issuecomment',
		'user_id'              => $user->ID,
		'comment_author'       => $user->display_name,
		'comment_author_email' => $user->user_email,
		'comment_approved'     => 1,
	];

	$comment_id = wp_insert_comment( $commentdata );
	if ( ! $comment_id ) {
		return new WP_Error(
			'comment_failed',
			__( 'Failed to post comment.', 'alpaca-issue-tracker' )
		);
	}

	alpaistr_update_last_activity( $issue_id );
	alpaistr_clear_board_cache();

	$comment = get_comment( $comment_id );

	return [
		'success'    => true,
		'comment_id' => (int) $comment_id,
		'comment'    => [
			'id'          => (int) $comment_id,
			'content'     => $comment->comment_content,
			'author_name' => $comment->comment_author,
			'date'        => $comment->comment_date,
			'date_gmt'    => $comment->comment_date_gmt,
		],
	];
}

/**
 * Ability callback: Get all comments for an issue.
 *
 * @param array $input Input parameters.
 * @return array|\WP_Error Array of comments or error.
 */
function alpaistr_ability_get_comments( $input ) {
	$issue_id = isset( $input['issue_id'] ) ? (int) $input['issue_id'] : 0;
	$post     = alpaistr_assert_issue_exists( $issue_id );

	if ( ! $post ) {
		return new WP_Error(
			'issue_not_found',
			__( 'Issue not found.', 'alpaca-issue-tracker' )
		);
	}

	$comments = get_comments(
		[
			'post_id' => $issue_id,
			'type'    => 'issuecomment',
			'status'  => 'approve',
			'order'   => 'ASC',
		]
	);

	$formatted = [];

	foreach ( $comments as $comment ) {
		$formatted[] = [
			'id'          => (int) $comment->comment_ID,
			'content'     => $comment->comment_content,
			'author_name' => $comment->comment_author,
			'author_id'   => (int) $comment->user_id,
			'date'        => $comment->comment_date,
			'date_gmt'    => $comment->comment_date_gmt,
		];
	}

	return $formatted;
}
