<?php

function project_board_page() {
?>
	<div class="wrap">
	<h1 class="wp-heading-inline"><?php echo esc_html__( 'Project Board', 'alpaca' ); ?></h1>
	<a id="alpaca-add-issue" href="#" class="page-title-action aria-button-if-js" role="button" aria-expanded="false">Add Issue</a>
    <div class="notice notice-warning">
        <p><strong>SIMON: remember to <code>npm run watch</code></strong> when you start work. You've wasted enough hours of your life already, forgetting to do this.</p>
    </div>
    
	<hr class="wp-header-end">
    <div id="alpaca-board-controls">
    </div>

	<div id="alpaca-board"></div>
	</div>
	<script type="text/javascript">
		document.addEventListener('DOMContentLoaded', function() {
			const addIssueButton = document.getElementById('alpaca-add-issue');
			if (addIssueButton) {
				addIssueButton.addEventListener('click', function(e) {
					e.preventDefault();
					wp.hooks.doAction('alpaca.openModal');
				});
			}
		});
	</script>
	<?php
}

function alpaca_clear_board_cache() {
    global $wp_object_cache;
    if ( isset( $wp_object_cache->cache['alpaca'] ) ) {
        foreach ( array_keys( $wp_object_cache->cache['alpaca'] ) as $key ) {
            if ( strpos( $key, 'alpaca_board_data_' ) === 0 ) {
                wp_cache_delete( $key, 'alpaca' );
            }
        }
    }
}
add_action( 'save_post_issue', 'alpaca_clear_board_cache' );
add_action( 'deleted_post', 'alpaca_clear_board_cache' );
add_action( 'set_object_terms', 'alpaca_clear_board_cache' );
add_action( 'created_term', 'alpaca_clear_board_cache' );
add_action( 'edited_term', 'alpaca_clear_board_cache' );
add_action( 'delete_term', 'alpaca_clear_board_cache' );
add_action( 'comment_post', 'alpaca_clear_board_cache' );
add_action( 'edit_comment', 'alpaca_clear_board_cache' );
add_action( 'delete_comment', 'alpaca_clear_board_cache' );

function alpaca_get_board_data() {
    global $wpdb;

    // Get statuses we want to display
    $statuses         = alpaca_get_statuses();
    $desired_statuses = apply_filters( 'alpaca_board_statuses', $statuses );
    $status_ids       = wp_list_pluck( $desired_statuses, 'term_id' );

    if ( empty( $status_ids ) ) {
        return array();
    }

    // Build a cache key based on status IDs (stable regardless of order)
    sort( $status_ids );
    $cache_key   = 'alpaca_board_data_' . md5( implode( '-', $status_ids ) );
    $cache_group = 'alpaca';

    // Try cache first
    $board_data = wp_cache_get( $cache_key, $cache_group );
    if ( false !== $board_data ) {
        return $board_data;
    }

    $board_data = array();

    // Get all issues in one query
    $posts = get_posts( array(
        'post_type'      => 'issue',
        'posts_per_page' => -1,
        'tax_query'      => array(
            array(
                'taxonomy' => 'status',
                'field'    => 'term_id',
                'terms'    => $status_ids,
            ),
        ),
    ) );

    

    $post_ids = wp_list_pluck( $posts, 'ID' );

    // Group posts by status term
    $posts_by_status = array();
    $status_terms    = wp_get_object_terms( $post_ids, 'status', array( 'fields' => 'all_with_object_id' ) );
    foreach ( $status_terms as $term ) {
        $posts_by_status[ $term->term_id ][] = get_post( $term->object_id );
    }

    // Preload issue_order for all statuses
    $issue_orders = array();
    foreach ( $desired_statuses as $status ) {
        $order = get_term_meta( $status->term_id, 'issue_order', true );
        $issue_orders[ $status->term_id ] = is_array( $order ) ? $order : array();
    }

    // Batch comment counts (only issuecomment type)
    $comment_counts = array();
    if ( ! empty( $post_ids ) ) {
        $placeholders   = implode( ',', array_fill( 0, count( $post_ids ), '%d' ) );
        $comment_counts = $wpdb->get_results(
            $wpdb->prepare(
                "
            SELECT comment_post_ID as post_id, COUNT(*) as count
            FROM $wpdb->comments
            WHERE comment_post_ID IN ($placeholders)
              AND comment_type = %s
              AND comment_approved = '1'
            GROUP BY comment_post_ID
            ",
                array_merge( $post_ids, array( 'issuecomment' ) )
            ),
            OBJECT_K
        );
    }

    // Batch assignees
    $assignee_terms    = wp_get_object_terms( $post_ids, 'assignee', array( 'fields' => 'all_with_object_id' ) );
    $assignees_by_post = array();
    $slugs             = array();
    foreach ( $assignee_terms as $term ) {
        $assignees_by_post[ $term->object_id ][] = $term->slug;
        $slugs[ $term->slug ] = true;
    }

    // Preload all users for those slugs
    $users         = get_users( array( 'slug__in' => array_keys( $slugs ) ) );
    $users_by_slug = array();
    foreach ( $users as $user ) {
        $users_by_slug[ $user->user_nicename ] = $user;
    }

    // Build final board data
    foreach ( $desired_statuses as $status ) {
        $posts = isset( $posts_by_status[ $status->term_id ] ) ? $posts_by_status[ $status->term_id ] : array();

        // Apply issue order if present
        if ( ! empty( $issue_orders[ $status->term_id ] ) ) {
            $order       = $issue_orders[ $status->term_id ];
            $posts_by_id = array();
            foreach ( $posts as $post ) {
                $posts_by_id[ $post->ID ] = $post;
            }
            $sorted_posts = array();
            foreach ( $order as $issue_id ) {
                if ( isset( $posts_by_id[ $issue_id ] ) ) {
                    $sorted_posts[] = $posts_by_id[ $issue_id ];
                    unset( $posts_by_id[ $issue_id ] );
                }
            }
            $posts = array_merge( $sorted_posts, array_values( $posts_by_id ) );
        }

        $issues = array();
        foreach ( $posts as $post ) {
            // Get comment count
            $comment_count = isset( $comment_counts[ $post->ID ] )
                ? intval( $comment_counts[ $post->ID ]->count )
                : 0;

            // Get assignees
            $assignees = array();
            if ( ! empty( $assignees_by_post[ $post->ID ] ) ) {
                foreach ( $assignees_by_post[ $post->ID ] as $slug ) {
                    if ( isset( $users_by_slug[ $slug ] ) ) {
                        $user        = $users_by_slug[ $slug ];
                        $assignees[] = array(
                            'id'           => $user->ID,
                            'slug'         => $slug,
                            'display_name' => $user->display_name,
                            'avatar'       => get_avatar_url( $user->ID, array( 'size' => 32 ) ),
                        );
                    }
                }
            }

            $meta_vals_for_card = [];
            $meta_vals_for_card['deadline'] = get_post_meta( $post->ID, 'deadline' );

            $checklist_json = get_post_meta( $post->ID, 'checklist', true );
            if ( $checklist_json ) {
                $decoded_checklist = json_decode( $checklist_json, true );
                if (is_array($decoded_checklist)) {
                    $meta_vals_for_card['checklist'] = $decoded_checklist;
                }
            }

            $issues[] = array(
                'id'            => $post->ID,
                'title'         => $post->post_title,
                'comment_count' => $comment_count,
                'assignees'     => $assignees,
                'meta'          => $meta_vals_for_card,
            );
        }

        $board_data[] = array(
            'id'     => $status->term_id,
            'title'  => $status->name,
            'issues' => $issues,
        );
    }

    // Store in cache for 1 minute (adjust TTL as needed)
    wp_cache_set( $cache_key, $board_data, $cache_group, MINUTE_IN_SECONDS );

    return $board_data;
}
