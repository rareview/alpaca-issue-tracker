<?php

function project_board_page() {
?>
	<div class="wrap">
	<h1 class="wp-heading-inline"><?php echo esc_html__( 'Project Board', 'alpaca' ); ?></h1>
	<a id="alpaca-add-issue" href="#" class="page-title-action aria-button-if-js" role="button" aria-expanded="false">Add Issue</a>
	<hr class="wp-header-end">
	<div id="alpaca-board"></div>
	</div>
	<?php
}

function alpaca_get_board_data() {
    $board_data = array();
    $statuses = alpaca_get_statuses();

    foreach ( $statuses as $status ) {
        $posts = get_posts( array(
            'post_type' => 'issue',
            'posts_per_page' => -1,
            'tax_query' => array(
                array(
                    'taxonomy' => 'status',
                    'field' => 'term_id',
                    'terms' => $status->term_id,
                ),
            ),
        ) );

        // Get the saved order of issue IDs from term meta.
        $issue_order = get_term_meta( $status->term_id, 'issue_order', true );

        if ( ! empty( $issue_order ) && is_array( $issue_order ) ) {
            // Create an associative array of posts, keyed by post ID for efficient lookup.
            $posts_by_id = array();
            foreach ( $posts as $post ) {
                $posts_by_id[ $post->ID ] = $post;
            }

            // Build the sorted list of posts based on the saved order.
            $sorted_posts = array();
            foreach ( $issue_order as $issue_id ) {
                if ( isset( $posts_by_id[ $issue_id ] ) ) {
                    $sorted_posts[] = $posts_by_id[ $issue_id ];
                    // Remove the post from the map to track posts not in the saved order.
                    unset( $posts_by_id[ $issue_id ] );
                }
            }

            // Append any remaining posts that were not in the saved order (e.g., new issues).
            $posts = array_merge( $sorted_posts, array_values( $posts_by_id ) );
        }

        $issues = array();
        foreach ( $posts as $post ) {
            $issues[] = array(
                'id' => $post->ID,
                'title' => $post->post_title,
                'author_id' => $post->post_author,
                'author_name' => get_the_author_meta( 'display_name', $post->post_author ),
                'author_img' => get_avatar_url( $post->post_author, array( 'size' => 24 ) ),
            );
        }

        $board_data[] = array(
            'id' => $status->term_id,
            'title' => $status->name,
            'issues' => $issues,
        );
    }

    return $board_data;
}
