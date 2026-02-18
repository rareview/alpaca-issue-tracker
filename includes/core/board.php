<?php
// phpcs:ignoreFile WordPress.DB.SlowDBQuery.slow_db_query_tax_query
/**
 * Board page and data functions for Alpaca.
 *
 * @package Alpaca
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Render the project board admin page.
 */
function alpaca_project_board_page() {
	?>
	<div class="wrap">
	<h1 class="wp-heading-inline"><?php echo esc_html__( 'Project Board', 'alpaca' ); ?></h1>
	<a id="alpaca-add-issue" href="#" class="page-title-action aria-button-if-js" role="button" aria-expanded="false"><?php echo esc_html__( 'Add Issue', 'alpaca' ); ?></a>
	
	<hr class="wp-header-end">

	<div id="project-board-controls"></div>

    <div id="alpaca-presence"></div>

	<div id="project-board"></div>
	</div>
	<?php
}

/**
 * Clear board cache when relevant posts or terms change.
 */
function alpaca_clear_board_cache() {
	global $wp_object_cache;
	if ( isset( $wp_object_cache->cache['alpaca'] ) ) {
		foreach ( array_keys( $wp_object_cache->cache['alpaca'] ) as $key ) {
			if ( 0 === strpos( $key, 'alpaca_board_data_' ) ) {
				wp_cache_delete( $key, 'alpaca' );
			}
		}
	}
}
add_action( 'save_post_alpaca_issue', 'alpaca_clear_board_cache' );
add_action( 'deleted_post', 'alpaca_clear_board_cache' );
add_action( 'set_object_terms', 'alpaca_clear_board_cache' );
add_action( 'created_term', 'alpaca_clear_board_cache' );
add_action( 'edited_term', 'alpaca_clear_board_cache' );
add_action( 'delete_term', 'alpaca_clear_board_cache' );
add_action( 'comment_post', 'alpaca_clear_board_cache' );
add_action( 'edit_comment', 'alpaca_clear_board_cache' );
add_action( 'delete_comment', 'alpaca_clear_board_cache' );

/**
 * Get checklist progress grouped by parent issue IDs.
 *
 * @param array $parent_issue_ids Parent issue post IDs.
 * @return array<int, array<string, int>> Progress keyed by parent ID.
 */
function alpaca_get_subissue_progress_by_parent( $parent_issue_ids ) {
	$parent_issue_ids = array_map( 'intval', (array) $parent_issue_ids );
	$parent_issue_ids = array_filter(
		$parent_issue_ids,
		static function ( $parent_issue_id ) {
			return $parent_issue_id > 0;
		}
	);
	$parent_issue_ids = array_values( array_unique( $parent_issue_ids ) );
	if ( empty( $parent_issue_ids ) ) {
		return [];
	}

	$subissue_ids = get_posts(
		[
			'post_type'        => 'alpaca_issue',
			'posts_per_page'   => -1,
			'post_parent__in'  => $parent_issue_ids,
			'fields'           => 'ids',
			'suppress_filters' => false,
		]
	);

	if ( empty( $subissue_ids ) ) {
		return [];
	}

	$progress_by_parent = [];
	foreach ( $subissue_ids as $subissue_id ) {
		$subissue_id = (int) $subissue_id;
		$parent_id   = (int) wp_get_post_parent_id( $subissue_id );
		if ( $parent_id <= 0 ) {
			continue;
		}

		if ( ! isset( $progress_by_parent[ $parent_id ] ) ) {
			$progress_by_parent[ $parent_id ] = [
				'total'     => 0,
				'completed' => 0,
			];
		}

		$progress_by_parent[ $parent_id ]['total']++;
		if ( ! empty( get_post_meta( $subissue_id, 'alpaca_subissue_completed', true ) ) ) {
			$progress_by_parent[ $parent_id ]['completed']++;
		}
	}

	return $progress_by_parent;
}

/**
 * Get board data with all issues organized by status.
 *
 * @return array Board data with statuses and issues.
 */
function alpaca_get_board_data() {
	global $wpdb;

	// Get statuses we want to display.
	$statuses         = alpaca_get_statuses();
	$desired_statuses = apply_filters( 'alpaca_board_statuses', $statuses );
	$status_ids       = wp_list_pluck( $desired_statuses, 'term_id' );

	if ( empty( $status_ids ) ) {
		return [];
	}

	// Build a cache key based on status IDs (stable regardless of order).
	sort( $status_ids );
	$cache_key   = 'alpaca_board_data_' . md5( implode( '-', $status_ids ) );
	$cache_group = 'alpaca';

	// Try cache first.
	$board_data = wp_cache_get( $cache_key, $cache_group );
	if ( false !== $board_data ) {
		return $board_data;
	}

	$board_data = [];

	// Get all issues in one query.
	// phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
	$posts = get_posts(
		[
			'post_type'      => 'alpaca_issue',
			'posts_per_page' => -1,
			'post_parent'    => 0,
			'tax_query'      => [ // phpcs:ignore-line WordPress.DB.SlowDBQuery.slow_db_query_tax_query
				[
					'taxonomy' => 'alpaca_status',
					'field'    => 'term_id',
					'terms'    => $status_ids,
				],
			],
		]
	);

	$post_ids = wp_list_pluck( $posts, 'ID' );
	$subissue_progress_by_parent = alpaca_get_subissue_progress_by_parent( $post_ids );

	// Group posts by status term.
	$posts_by_status = [];
	$status_terms    = wp_get_object_terms( $post_ids, 'alpaca_status', [ 'fields' => 'all_with_object_id' ] );
	foreach ( $status_terms as $term ) {
		$posts_by_status[ $term->term_id ][] = get_post( $term->object_id );
	}

	// Preload issue_order for all statuses.
	$issue_orders = [];
	foreach ( $desired_statuses as $status ) {
		$order                            = get_term_meta( $status->term_id, 'issue_order', true );
		$issue_orders[ $status->term_id ] = is_array( $order ) ? $order : [];
	}

	// Batch comment counts (only issuecomment type).
	$comment_counts = [];
	if ( ! empty( $post_ids ) ) {
		// Build placeholders for the IN clause.
		$placeholders_list = implode( ', ', array_fill( 0, count( $post_ids ), '%d' ) );
		// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Placeholders verified
		$sql = "SELECT comment_post_ID as post_id, COUNT(*) as count
            FROM {$wpdb->comments}
            WHERE comment_post_ID IN ({$placeholders_list})
              AND comment_type = %s
              AND comment_approved = '1'
            GROUP BY comment_post_ID";

		$prepared = $wpdb->prepare( $sql, array_merge( $post_ids, [ 'issuecomment' ] ) ); // phpcs:ignore WordPress.DB.PreparedSQL -- $sql contains placeholders validated above
		// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared,WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery
		$comment_counts = $wpdb->get_results( $prepared, OBJECT_K );
	}

	// Batch assignees.
	$assignee_terms    = wp_get_object_terms( $post_ids, 'alpaca_assignee', [ 'fields' => 'all_with_object_id' ] );
	$assignees_by_post = [];
	$slugs             = [];
	foreach ( $assignee_terms as $term ) {
		$assignees_by_post[ $term->object_id ][] = $term->slug;
		$slugs[ $term->slug ]                    = true;
	}

	// Preload all users for those slugs.
	$users         = get_users( [ 'slug__in' => array_keys( $slugs ) ] );
	$users_by_slug = [];
	foreach ( $users as $user ) {
		$users_by_slug[ $user->user_nicename ] = $user;
	}

	// Build final board data.
	foreach ( $desired_statuses as $status ) {
		$posts = isset( $posts_by_status[ $status->term_id ] ) ? $posts_by_status[ $status->term_id ] : [];

		// Apply issue order if present.
		if ( ! empty( $issue_orders[ $status->term_id ] ) ) {
			$order       = $issue_orders[ $status->term_id ];
			$posts_by_id = [];
			foreach ( $posts as $post ) {
				$posts_by_id[ $post->ID ] = $post;
			}
			$sorted_posts = [];
			foreach ( $order as $issue_id ) {
				if ( isset( $posts_by_id[ $issue_id ] ) ) {
					$sorted_posts[] = $posts_by_id[ $issue_id ];
					unset( $posts_by_id[ $issue_id ] );
				}
			}
			$posts = array_merge( $sorted_posts, array_values( $posts_by_id ) );
		}

		$issues = [];
		foreach ( $posts as $post ) {
			// Get comment count.
			$comment_count = isset( $comment_counts[ $post->ID ] )
				? intval( $comment_counts[ $post->ID ]->count )
				: 0;

			// Get assignees.
			$assignees = [];
			if ( ! empty( $assignees_by_post[ $post->ID ] ) ) {
				foreach ( $assignees_by_post[ $post->ID ] as $slug ) {
					if ( isset( $users_by_slug[ $slug ] ) ) {
						$user        = $users_by_slug[ $slug ];
						$assignees[] = [
							'id'           => $user->ID,
							'slug'         => $slug,
							'display_name' => $user->display_name,
							'avatar'       => alpaca_avatar( $user->ID, 32 ),
						];
					}
				}
			}

			$meta_vals_for_card             = [];
			$meta_vals_for_card['deadline'] = get_post_meta( $post->ID, 'alpaca_deadline', false );
			$meta_vals_for_card['alpaca_high_priority'] = (bool) get_post_meta( $post->ID, 'alpaca_high_priority', true );
			$meta_vals_for_card['lastActivity'] = get_post_meta( $post->ID, 'alpaca_lastActivity', true );

			if ( ! empty( $subissue_progress_by_parent[ $post->ID ] ) ) {
				$meta_vals_for_card['subissue_progress'] = [
					'total'     => (int) $subissue_progress_by_parent[ $post->ID ]['total'],
					'completed' => (int) $subissue_progress_by_parent[ $post->ID ]['completed'],
				];
			}

			$issues[] = [
				'id'            => $post->ID,
				'title'         => $post->post_title,
				'slug'          => $post->post_name,
				'post_date'     => $post->post_date,
				'comment_count' => $comment_count,
				'assignees'     => $assignees,
				'meta'          => $meta_vals_for_card,
			];
		}

		$board_data[] = [
			'id'     => $status->term_id,
			'title'  => $status->name,
			'issues' => $issues,
		];
	}

	// Store in cache for 1 minute.
	wp_cache_set( $cache_key, $board_data, $cache_group, MINUTE_IN_SECONDS );

	return $board_data;
}
