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

        $issues = array();
        foreach ( $posts as $post ) {
            $issues[] = array(
                'id' => $post->ID,
                'title' => $post->post_title,
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
