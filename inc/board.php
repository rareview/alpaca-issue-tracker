<?php

function project_board_page() {
?>
	<div class="wrap">
	<h1 class="wp-heading-inline"><?php echo esc_html__( 'Project Board', 'alpaca' ); ?></h1>
	<a id="alpaca-add-issue" href="#" class="page-title-action aria-button-if-js" role="button" aria-expanded="false">Add Issue</a>
	<hr class="wp-header-end">
	<div id="alpaca-board"></div>
	</div>
	<script type="text/javascript">
		document.addEventListener('DOMContentLoaded', function() {
			const addIssueButton = document.getElementById('alpaca-add-issue');
			if (addIssueButton) {
				addIssueButton.addEventListener('click', function(e) {
					e.preventDefault();
					document.dispatchEvent(new CustomEvent('alpaca:open-modal'));
				});
			}
		});
	</script>
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
            $posts_by_id = array();
            foreach ( $posts as $post ) {
                $posts_by_id[ $post->ID ] = $post;
            }
            $sorted_posts = array();
            foreach ( $issue_order as $issue_id ) {
                if ( isset( $posts_by_id[ $issue_id ] ) ) {
                    $sorted_posts[] = $posts_by_id[ $issue_id ];
                    unset( $posts_by_id[ $issue_id ] );
                }
            }
            $posts = array_merge( $sorted_posts, array_values( $posts_by_id ) );
        }

        $issues = array();
        foreach ( $posts as $post ) {
            // Count only 'issuecomment' type comments
            $issue_comment_count = get_comments( array(
                'post_id' => $post->ID,
                'type'    => 'issuecomment',
                'count'   => true,
            ) );

            // --- Assignees ---
            $assignee_terms = wp_get_object_terms( $post->ID, 'assignee', array( 'fields' => 'all' ) );
            $assignees = array();
            foreach ( $assignee_terms as $term ) {
                $user = get_user_by( 'slug', $term->slug );
                $avatar = $user ? get_avatar_url( $user->ID, array( 'size' => 32 ) ) : '';
                $assignees[] = array(
                    'id'           => $term->term_id,
                    'slug'         => $term->slug,
                    'display_name' => $term->name, // term name is display name
                    'avatar'       => $avatar,
                );
            }

            $issues[] = array(
                'id' => $post->ID,
                'title' => $post->post_title,
                'comment_count' => $issue_comment_count,
                'assignees' => $assignees, // <-- Add this line
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
