<?php
// phpcs:ignoreFile WordPress.DB.SlowDBQuery.slow_db_query_tax_query
/**
 * Board page and data functions for Alpaca.
 *
 * @package Alpaca
 */

use Alpaca\Helpers;

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

        <div id="project-board-controls">
            <div id="alpaca-presence"></div>
            <div id="project-board-controls-mount"></div>
        </div>

        <div id="project-board"></div>
	</div>
	<?php
}

/**
 * Get the current board cache version.
 *
 * @return int Cache version.
 */
function alpaca_get_board_cache_version() {
	$version = (int) get_option( 'alpaca_board_cache_version', 1 );

	if ( $version < 1 ) {
		$version = 1;
	}

	return $version;
}

/**
 * Bump the board cache version to invalidate cached board payloads.
 *
 * @return void
 */
function alpaca_bump_board_cache_version() {
	$next_version = alpaca_get_board_cache_version() + 1;
	update_option( 'alpaca_board_cache_version', $next_version, false );
}

/**
 * Clear board cache when relevant posts or terms change.
 */
function alpaca_clear_board_cache() {
	alpaca_bump_board_cache_version();

	global $wp_object_cache;
	if ( isset( $wp_object_cache->cache['alpaca'] ) ) {
		foreach ( array_keys( $wp_object_cache->cache['alpaca'] ) as $key ) {
			if ( 0 === strpos( $key, 'alpaca_board_data_' ) ) {
				wp_cache_delete( $key, 'alpaca' );
			}
		}
	}
}

/**
 * Clear board cache when relevant term meta changes.
 *
 * @param int|array $meta_ids  Meta ID or IDs.
 * @param int       $object_id Term ID.
 * @param string    $meta_key  Updated meta key.
 * @param mixed     $meta_value Meta value.
 * @return void
 */
function alpaca_clear_board_cache_on_term_meta_change( $meta_ids, $object_id, $meta_key, $meta_value ) {
	unset( $meta_ids, $object_id, $meta_value );

	$meta_keys_that_affect_board = [
		'alpaca_label_color',
		'issue_order',
		// Term score affects status ordering on the board; clear cache when it changes.
		'term_score',
	];

	if ( in_array( $meta_key, $meta_keys_that_affect_board, true ) ) {
		alpaca_clear_board_cache();
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
add_action( 'added_term_meta', 'alpaca_clear_board_cache_on_term_meta_change', 10, 4 );
add_action( 'updated_term_meta', 'alpaca_clear_board_cache_on_term_meta_change', 10, 4 );
add_action( 'deleted_term_meta', 'alpaca_clear_board_cache_on_term_meta_change', 10, 4 );

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
 * Get issue comment totals and per-agent counts.
 *
 * Legacy issue-created comments were previously stored with a `human`
 * `comment_agent`. Reclassify those rows into the `create` bucket at read time
 * so card counts remain correct without requiring a database migration.
 *
 * @param array $post_ids Issue post IDs.
 * @return array<string, array<int, int|array<string, int>>> Comment totals and
 *                                                    per-agent counts keyed by
 *                                                    post ID.
 */
function alpaca_get_issue_comment_counts( $post_ids ) {
	global $wpdb;

	$post_ids = array_map( 'intval', (array) $post_ids );
	$post_ids = array_filter(
		$post_ids,
		static function ( $post_id ) {
			return $post_id > 0;
		}
	);
	$post_ids = array_values( array_unique( $post_ids ) );

	$comment_counts          = [];
	$comment_counts_by_agent = [];

	if ( empty( $post_ids ) ) {
		return [
			'totals'   => $comment_counts,
			'by_agent' => $comment_counts_by_agent,
		];
	}

	$placeholders_list = implode( ', ', array_fill( 0, count( $post_ids ), '%d' ) );

	// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Placeholders verified above.
	$total_sql = "SELECT comment_post_ID as post_id, COUNT(*) as count
		FROM {$wpdb->comments}
		WHERE comment_post_ID IN ({$placeholders_list})
			AND comment_type = %s
			AND comment_approved = '1'
		GROUP BY comment_post_ID";

	$total_prepared = $wpdb->prepare( $total_sql, array_merge( $post_ids, [ 'issuecomment' ] ) ); // phpcs:ignore WordPress.DB.PreparedSQL -- Query placeholders are fully prepared.
	// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared,WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery
	$total_results = $wpdb->get_results( $total_prepared );

	foreach ( $total_results as $total_result ) {
		$comment_counts[ (int) $total_result->post_id ] = (int) $total_result->count;
	}

	// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Placeholders verified above.
	$typed_sql = "SELECT comment_post_ID as post_id, comment_agent as comment_agent, COUNT(*) as count
		FROM {$wpdb->comments}
		WHERE comment_post_ID IN ({$placeholders_list})
			AND comment_type = %s
			AND comment_approved = '1'
			AND comment_agent != ''
		GROUP BY comment_post_ID, comment_agent";

	$typed_prepared = $wpdb->prepare( $typed_sql, array_merge( $post_ids, [ 'issuecomment' ] ) ); // phpcs:ignore WordPress.DB.PreparedSQL -- Query placeholders are fully prepared.
	// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared,WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery
	$typed_results = $wpdb->get_results( $typed_prepared );

	foreach ( $typed_results as $typed_result ) {
		$post_id = (int) $typed_result->post_id;
		$agent   = strtolower( (string) $typed_result->comment_agent );

		if ( '' === $agent ) {
			continue;
		}

		if ( ! isset( $comment_counts_by_agent[ $post_id ] ) || ! is_array( $comment_counts_by_agent[ $post_id ] ) ) {
			$comment_counts_by_agent[ $post_id ] = [];
		}

		$comment_counts_by_agent[ $post_id ][ $agent ] = (int) $typed_result->count;
	}

	// phpcs:ignore WordPress.DB.PreparedSQL.InterpolatedNotPrepared -- Placeholders verified above.
	$legacy_create_sql = "SELECT c.comment_post_ID as post_id, COUNT(*) as count
		FROM {$wpdb->comments} c
		INNER JOIN {$wpdb->commentmeta} cm
			ON cm.comment_id = c.comment_ID
		WHERE c.comment_post_ID IN ({$placeholders_list})
			AND c.comment_type = %s
			AND c.comment_approved = '1'
			AND c.comment_agent = %s
			AND cm.meta_key = %s
			AND cm.meta_value LIKE %s
		GROUP BY c.comment_post_ID";

	$legacy_create_prepared = $wpdb->prepare(
		$legacy_create_sql,
		array_merge(
			$post_ids,
			[
				'issuecomment',
				'human',
				'alpacaCommentTags',
				'%issue-created%',
			]
		)
	); // phpcs:ignore WordPress.DB.PreparedSQL -- Query placeholders are fully prepared.
	// phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared,WordPress.DB.PreparedSQL.InterpolatedNotPrepared,WordPress.DB.DirectDatabaseQuery.DirectQuery
	$legacy_create_results = $wpdb->get_results( $legacy_create_prepared );

	foreach ( $legacy_create_results as $legacy_create_result ) {
		$post_id              = (int) $legacy_create_result->post_id;
		$legacy_create_count  = (int) $legacy_create_result->count;
		$existing_human_count = isset( $comment_counts_by_agent[ $post_id ]['human'] )
			? (int) $comment_counts_by_agent[ $post_id ]['human']
			: 0;
		$existing_create_count = isset( $comment_counts_by_agent[ $post_id ]['create'] )
			? (int) $comment_counts_by_agent[ $post_id ]['create']
			: 0;

		if ( ! isset( $comment_counts_by_agent[ $post_id ] ) || ! is_array( $comment_counts_by_agent[ $post_id ] ) ) {
			$comment_counts_by_agent[ $post_id ] = [];
		}

		$comment_counts_by_agent[ $post_id ]['human']  = max( 0, $existing_human_count - $legacy_create_count );
		$comment_counts_by_agent[ $post_id ]['create'] = $existing_create_count + $legacy_create_count;
	}

	return [
		'totals'   => $comment_counts,
		'by_agent' => $comment_counts_by_agent,
	];
}

/**
 * Get board data with all issues organized by status.
 *
 * @return array Board data with statuses and issues.
 */
function alpaca_get_board_data() {
	// Get statuses we want to display.
	$statuses         = alpaca_get_statuses();
	$desired_statuses = apply_filters( 'alpaca_board_statuses', $statuses );
	$status_ids       = wp_list_pluck( $desired_statuses, 'term_id' );

	if ( empty( $status_ids ) ) {
		return [];
	}

	// Build a cache key based on status IDs (stable regardless of order).
	sort( $status_ids );
	$cache_seed  = implode( '-', $status_ids ) . '|' . alpaca_get_board_cache_version();
	$cache_key   = 'alpaca_board_data_' . md5( $cache_seed );
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

	$comment_count_data     = alpaca_get_issue_comment_counts( $post_ids );
	$comment_counts         = isset( $comment_count_data['totals'] ) ? $comment_count_data['totals'] : [];
	$comment_counts_by_agent = isset( $comment_count_data['by_agent'] ) ? $comment_count_data['by_agent'] : [];

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

	// Batch labels.
	$label_terms    = wp_get_object_terms( $post_ids, 'alpaca_label', [ 'fields' => 'all_with_object_id' ] );
	$labels_by_post = [];
	foreach ( $label_terms as $term ) {
		$color = get_term_meta( $term->term_id, 'alpaca_label_color', true );
		if ( ! is_string( $color ) || '' === $color ) {
			$color = Helpers::DEFAULT_LABEL_COLOR;
		}

		$labels_by_post[ $term->object_id ][] = [
			'term_id' => (int) $term->term_id,
			'name'    => $term->name,
			'slug'    => $term->slug,
			'color'   => $color,
		];
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
				? intval( $comment_counts[ $post->ID ] )
				: 0;

			// Get typed comment counts by comment_agent.
			$comment_count_by_agent = isset( $comment_counts_by_agent[ $post->ID ] ) && is_array( $comment_counts_by_agent[ $post->ID ] )
				? $comment_counts_by_agent[ $post->ID ]
				: [];

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

			// Get labels.
			$labels = [];
			if ( isset( $labels_by_post[ $post->ID ] ) && is_array( $labels_by_post[ $post->ID ] ) ) {
				$labels = $labels_by_post[ $post->ID ];
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
				'post_date_gmt' => $post->post_date_gmt,
				'post_date'     => $post->post_date,
				'comment_count' => $comment_count,
				'comment_count_by_agent' => $comment_count_by_agent,
				'assignees'     => $assignees,
				'labels'        => $labels,
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
