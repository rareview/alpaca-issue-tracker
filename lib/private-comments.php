<?php

// Add the "Comment Type" column to the Comments screen
add_filter("manage_edit-comments_columns", function ($columns) {
    $where = 2;
    $before_columns = array_slice($columns, 0, $where, true);
    $new_column = [
        "comment_type" => "Type",
    ];
    $after_columns = array_slice($columns, $where, null, true);
    $sorted_columns = array_merge($before_columns, $new_column, $after_columns);
    return $sorted_columns;
});

// Populate the "Comment Type" column with data
add_action(
    "manage_comments_custom_column",
    function ($column, $post_id) {
        if ($column === "comment_type") {
            // Get the comment type
            $comment = get_comment($post_id);
            echo esc_html($comment->comment_type ?: "—"); // Default to '—' if no type is set
        }
    },
    10,
    2
);

function hide_comment_type( $type = '', $exclude_from_count = true ) {

    global $wpdb;

    // Helper: should we hide?
    $should_hide = function() {
        // If request has show_hidden_comments=1, skip hiding
        if ( isset( $_GET['show_hidden_comments'] ) && $_GET['show_hidden_comments'] == '1' ) {
            return false;
        }

        // If this is a REST request and the param is passed, skip hiding
        if ( defined( 'REST_REQUEST' ) && REST_REQUEST && isset( $_REQUEST['show_hidden_comments'] ) && $_REQUEST['show_hidden_comments'] == '1' ) {
            return false;
        }

        return true;
    };

    add_action("pre_get_comments", function ($query) use ($type, $should_hide) {
        global $pagenow;
        if ( is_admin() && $pagenow === "edit-comments.php" ) {
            return;
        }
        if ( $should_hide() && ( !isset($query->query_vars["type"]) || $query->query_vars["type"] !== $type ) ) {
            $query->query_vars["type__not_in"] = [$type];
        }
    });

    add_filter( "comment_feed_where", function( $where ) use ($type, $should_hide, $wpdb) {
        if ( $should_hide() ) {
            $where .= $wpdb->prepare( " AND comment_type != %s", esc_sql( $type ) );
        }
        return $where;
    }, 10, 2);

    add_filter( "get_comments_number", function ($count, $post_id) use ($type, $exclude_from_count, $should_hide, $wpdb) {
        if ( is_admin() ) { return $count; }
        if ( $should_hide() && $exclude_from_count ) {
            $count_hidden = $wpdb->get_var( $wpdb->prepare("
                SELECT COUNT(*) FROM {$wpdb->comments}
                WHERE comment_post_ID = %d
                AND comment_type = %s
                AND comment_approved = '1'
            ", $post_id, esc_sql( $type ) ) );
            return max( 0, $count - (int) $count_hidden );
        }
        return $count;
    }, 10, 2);

    add_filter( "comments_clauses", function( $clauses ) use ($type, $should_hide) {
        if ( !is_admin() && $should_hide() ) {
            $clauses['where'] .= sprintf( " AND comment_type != '%s'", esc_sql( $type ) );
        }
        return $clauses;
    }, 10, 1);

    add_filter( 'comments_template_query_args', function( $args ) use ( $type, $should_hide ) {
        if ( $should_hide() ) {
            if ( isset( $args['type__not_in'] ) && is_array( $args['type__not_in'] ) ) {
                $args['type__not_in'][] = $type;
            } else {
                $args['type__not_in'] = [$type];
            }
        }
        return $args;
    }, 10, 1);

    add_filter( 'comments_array', function( $comments ) use ( $type, $should_hide ) {
        if ( $should_hide() ) {
            foreach ( $comments as $key => $comment ) {
                if ( $comment->comment_type === $type ) {
                    unset( $comments[$key] );
                }
            }
        }
        return $comments;
    }, 10, 2);
}
