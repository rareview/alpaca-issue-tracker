<?php
/**
 * Post types and taxonomies registration for Alpaca issues.
 *
 * @package Alpaca
 */

use Alpaca\Helpers;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register a taxonomy with optional custom arguments.
 *
 * @param string $slug       Taxonomy slug.
 * @param array  $customargs Custom arguments to merge with defaults.
 */
function alpaca_register_taxonomy( $slug, $customargs = [] ) {
	$defaults = [
		'public'             => true,
		'publicly_queryable' => false,
		'label'              => $slug,
		'hierarchical'       => false,
	];
	$args     = array_merge( $defaults, $customargs );
	register_taxonomy( $slug, 'alpaca_issue', $args );
}

/**
 * Register custom post types and taxonomies for Alpaca.
 */
function alpaca_register_cpts_and_taxonomies() {

	register_term_meta(
		'alpaca_status',
		'term_score',
		[
			'type'         => 'number',
			'description'  => 'A score for ordering statuses on the board.',
			'single'       => true,
			'show_in_rest' => true,
			'default'      => 0,
		]
	);
	register_term_meta(
		'alpaca_label',
		'alpaca_label_color',
		[
			'type'              => 'string',
			'description'       => 'Display color for issue labels.',
			'single'            => true,
			'show_in_rest'      => true,
			'default'           => Helpers::DEFAULT_LABEL_COLOR,
			'sanitize_callback' => 'sanitize_hex_color',
		]
	);

	register_post_type(
		'alpaca_issue',
		[
			'public'        => false,
			'show_in_rest'  => true,
			'show_ui'       => false,
			'label'         => esc_html__( 'Issues', 'alpaca-issue-tracker' ),
			'labels'        => [
				'name'          => esc_html__( 'Issue', 'alpaca-issue-tracker' ),
				'singular_name' => esc_html__( 'Issue', 'alpaca-issue-tracker' ),
				'all_items'     => esc_html__( 'All Issues', 'alpaca-issue-tracker' ),
				'edit_item'     => esc_html__( 'Edit Issue', 'alpaca-issue-tracker' ),
				'view_item'     => esc_html__( 'View Issue', 'alpaca-issue-tracker' ),
				'view_items'    => esc_html__( 'View Issues', 'alpaca-issue-tracker' ),
			],
			'menu_icon'     => 'dashicons-warning',
			'menu_position' => 102,
			'supports'      => [ 'editor', 'custom-fields', 'author', 'comments' ],
			'map_meta_cap'  => true,
		]
	);

	alpaca_register_taxonomy( 'alpaca_browser', [ 'label' => esc_html__( 'Browser', 'alpaca-issue-tracker' ) ] );
	alpaca_register_taxonomy( 'alpaca_phptemplate', [ 'label' => esc_html__( 'PHP Template', 'alpaca-issue-tracker' ) ] );
	alpaca_register_taxonomy( 'alpaca_type', [ 'label' => esc_html__( 'Type', 'alpaca-issue-tracker' ) ] );
	alpaca_register_taxonomy(
		'alpaca_assignee',
		[
			'public' => true,
			'label'  => esc_html__( 'Assignee', 'alpaca-issue-tracker' ),
		]
	);
	alpaca_register_taxonomy(
		'alpaca_status',
		[
			'show_in_rest' => true,
			'label'        => esc_html__( 'Status', 'alpaca-issue-tracker' ),
		]
	);
	alpaca_register_taxonomy(
		'alpaca_label',
		[
			'public'       => true,
			'show_ui'      => false,
			'show_in_rest' => true,
			'label'        => esc_html__( 'Labels', 'alpaca-issue-tracker' ),
		]
	);
	alpaca_register_taxonomy(
		'alpaca_watching',
		[
			'public'             => false,
			'publicly_queryable' => false,
			'show_ui'            => false,
			'show_in_rest'       => false,
			'label'              => esc_html__( 'Watching', 'alpaca-issue-tracker' ),
		]
	);

	add_filter( 'rest_pre_insert_comment', 'alpaca_rest_pre_insert_comment', 10, 2 );
	add_filter( 'rest_comment_query', 'alpaca_rest_comment_query', 10, 2 );
	add_filter( 'comments_open', 'alpaca_comments_open', 10, 2 );

	// Allow Contributors to comment on and delete alpaca_issue posts.
	add_filter(
		'map_meta_cap',
		function ( $caps, $cap, $user_id, $args ) {
			// Grant edit_post capability for commenting on issues.
			if ( 'edit_post' === $cap && ! empty( $args[0] ) ) {
				$post = get_post( $args[0] );

				if ( $post && 'alpaca_issue' === $post->post_type && Helpers::user_can( 'create_issue' ) ) {
					return [ 'exist' ];
				}
			}

			// Grant delete_post capability for deleting issues.
			if ( 'delete_post' === $cap && ! empty( $args[0] ) ) {
				$post = get_post( $args[0] );

				if ( $post && 'alpaca_issue' === $post->post_type && Helpers::user_can( 'create_issue' ) ) {
					return [ 'exist' ];
				}
			}

			return $caps;
		},
		10,
		4
	);

	// Save term meta when creating or editing.
	/**
	 * Save status term score when status is created or edited.
	 *
	 * @param int $term_id Term ID.
	 */
	function alpaca_save_status_term_score( $term_id ) {
		// Verify nonce for security.
		if ( ! isset( $_POST['alpaca_status_nonce'] ) ) {
			return;
		}

		// Sanitize and unslash nonce.
		$nonce = sanitize_text_field( wp_unslash( $_POST['alpaca_status_nonce'] ) );

		// Check nonce validity (handles both add and edit actions).
		$nonce_add  = wp_verify_nonce( $nonce, 'alpaca_status_meta_add' );
		$nonce_edit = wp_verify_nonce( $nonce, 'alpaca_status_meta_edit' );

		if ( ! $nonce_add && ! $nonce_edit ) {
			return;
		}

		// Check user capabilities.
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		// Save term score.
		if ( isset( $_POST['term_score'] ) ) {
			$score = intval( $_POST['term_score'] );
			update_term_meta( $term_id, 'term_score', $score );
		}
	}
	add_action( 'created_alpaca_status', 'alpaca_save_status_term_score' );
	add_action( 'edited_alpaca_status', 'alpaca_save_status_term_score' );
}

/**
 * Allow duplicate comments on Alpaca issues.
 *
 * @param int|false $dupe_id     Duplicate comment ID if found, otherwise false.
 * @param array     $commentdata Comment data array.
 * @return int|false Duplicate comment ID or false to allow duplicate comment.
 */
function alpaca_allow_duplicate_issue_comments( $dupe_id, $commentdata ) {
	$post_id = isset( $commentdata['comment_post_ID'] ) ? (int) $commentdata['comment_post_ID'] : 0;

	if ( $post_id > 0 && 'alpaca_issue' === get_post_type( $post_id ) ) {
		return false;
	}

	return $dupe_id;
}
add_filter( 'duplicate_comment_id', 'alpaca_allow_duplicate_issue_comments', 10, 2 );
add_action( 'init', 'alpaca_register_cpts_and_taxonomies' );

add_filter(
	'alpaca_board_statuses',
	function ( $statuses ) {
		$desired_statuses = [];
		foreach ( $statuses as $status ) {
			// Filter out statuses outside the visible range.
			if ( $status->term_score > alpaca_get_max_term_score() ) {
				continue;
			}
			if ( $status->term_score < alpaca_get_min_term_score() ) {
				continue;
			}
			$desired_statuses[] = $status;
		}
		return $desired_statuses;
	}
);

/**
 * Update mirrored user terms when user profile is updated.
 *
 * When a user's profile is updated, find matching user terms in supported
 * taxonomies and update the term name and slug to match current user data.
 *
 * @param int    $user_id       The ID of the user being updated.
 * @param object $old_user_data The old user data.
 */
function alpaca_update_user_terms_on_profile_update( $user_id, $old_user_data ) {
	$user = get_userdata( $user_id );
	if ( ! ( $user instanceof WP_User ) ) {
		return;
	}

	$old_slug = '';
	if ( isset( $old_user_data->user_nicename ) ) {
		$old_slug = sanitize_user( (string) $old_user_data->user_nicename );
	}

	$new_slug = sanitize_user( (string) $user->user_nicename );
	$slugs    = array_filter(
		[
			$new_slug,
			$old_slug,
		]
	);
	$slugs    = array_values( array_unique( $slugs ) );

	$old_display_name = '';
	if ( isset( $old_user_data->display_name ) ) {
		$old_display_name = (string) $old_user_data->display_name;
	}

	// No need to do anything if term-linked identity values are unchanged.
	if ( $old_display_name === $user->display_name && $old_slug === $new_slug ) {
		return;
	}

	$taxonomies = [
		'alpaca_assignee',
		'alpaca_watching',
	];
	foreach ( $taxonomies as $taxonomy ) {
		if ( ! taxonomy_exists( $taxonomy ) ) {
			continue;
		}

		foreach ( $slugs as $slug ) {
			$term = get_term_by( 'slug', $slug, $taxonomy );
			if ( ! $term || is_wp_error( $term ) ) {
				continue;
			}

			wp_update_term(
				$term->term_id,
				$taxonomy,
				[
					'name'        => $user->display_name,
					'slug'        => $new_slug,
					'description' => '',
				]
			);

			break;
		}
	}
}
add_action( 'profile_update', 'alpaca_update_user_terms_on_profile_update', 10, 2 );

/**
 * Get statuses ordered by score.
 *
 * @param string $order Sort order (ASC or DESC).
 * @return array Array of status terms.
 */
function alpaca_get_statuses( $order = 'ASC' ) {
	$terms = get_terms(
		[
			'taxonomy'   => 'alpaca_status',
			'hide_empty' => false,
			// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
			'meta_key'   => 'term_score',
			'orderby'    => 'meta_value_num',
			'order'      => $order,
		]
	);
	if ( empty( $terms )
		|| ! is_array( $terms )
		|| is_wp_error( $terms )
	) {
		return [];
	}
	foreach ( $terms as $term ) {
		$score            = get_term_meta( $term->term_id, 'term_score', true );
		$term->term_score = $score;
	}
	return $terms;
}

/**
 * Filter REST API comment insertion to handle custom comment types.
 *
 * @param array           $prepared_comment Prepared comment data.
 * @param WP_REST_Request $request          REST request object.
 * @return array Modified comment data.
 */
function alpaca_rest_pre_insert_comment( $prepared_comment, $request ) {
	if ( isset( $request['comment_type'] ) && 'issuecomment' === $request['comment_type'] ) {
		$prepared_comment['comment_type'] = 'issuecomment';
	}

	if ( isset( $request['author_user_agent'] ) ) {
		$prepared_comment['comment_agent'] = sanitize_text_field( $request['author_user_agent'] );
	}

	return $prepared_comment;
}

/**
 * Filter REST API comment query to handle custom comment types.
 *
 * @param array           $args    Comment query arguments.
 * @param WP_REST_Request $request REST request object.
 * @return array Modified query arguments.
 */
function alpaca_rest_comment_query( $args, $request ) {
	if ( isset( $request['comment_type'] ) && 'issuecomment' === $request['comment_type'] ) {
		$args['type'] = 'issuecomment';
	}
	return $args;
}

/**
 * Filter comments_open to always allow comments on alpaca_issue posts.
 *
 * @param bool $open    Whether comments are open.
 * @param int  $post_id Post ID.
 * @return bool Whether comments are open.
 */
function alpaca_comments_open( $open, $post_id ) {
	$post = get_post( $post_id );
	if ( $post && 'alpaca_issue' === $post->post_type ) {
		return true;
	}
	return $open;
}
