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

    add_action("pre_get_comments", function ($query) use ($type) {
        global $pagenow;
        if (is_admin() && $pagenow === "edit-comments.php") {
            return;
        }
        if (
            !isset($query->query_vars["type"]) ||
            $query->query_vars["type"] !== $type
        ) {
            $query->query_vars["type__not_in"] = [$type];
        }
    });

    add_filter( "comment_feed_where", function( $where, $wp_comment_query ) use ($type) {
        global $wpdb;
        $where .= $wpdb->prepare(
            " AND comment_type != '%s'",
            esc_sql( $type )
        );
        return $where;
    }, 10, 2);

    add_filter( "get_comments_number", function ($count, $post_id)  use ($type, $exclude_from_count) {

        // do not change count if on an admin screen
        if( is_admin() ) { return $count; }

        // TODO: is this only ever called in relation to a singular? If not, need to test if singular, then add comment_post_ID condition
        
        if( $exclude_from_count ) {
            global $wpdb;
            $count_hidden = $wpdb->get_var(
                $wpdb->prepare("
                    SELECT COUNT(*) FROM {$wpdb->comments}
                    WHERE comment_post_ID = %d
                    AND comment_type = %s
                    AND comment_approved = '1'
                    ",
                    $post_id,
                    esc_sql( $type )
                )
            );
            return max(0, $count - (int) $count_hidden);
        }

        return $count;

    }, 10, 2 );

    add_filter( "comments_clauses", function( $clauses ) use ($type) {
        if( !is_admin() ) {
            $clauses['where'] .= sprintf(
                " AND comment_type != '%s'",
                esc_sql( $type )
            );
        }
        return $clauses;
    }, 10, 1);

    // Suggested by AI... but I don't think it's needed.
    // Does this hook even have type?
    // Still, nothing to lose by adding it in
    //
    add_filter( 'comments_template_query_args', function( $args ) use ( $type ) {
        if ( isset( $args['type__not_in'] ) && is_array( $args['type__not_in'] ) ) {
            $args['type__not_in'] = array_merge( $args['type__not_in'], $type );
        } else {
            $args['type__not_in'] = $type;
        }
        return $args;
    }, 10, 1);

    // Suggested by AI... but it may not be needed?
    // Only (usually) applies to comments_template
    // but comments of the hidden type should already have been filtered out
    // 
    add_filter( 'comments_array', function( $comments, $post_id ) use ( $type ) {
        foreach ( $comments as $key => $comment ) {
            if ( in_array( $comment->comment_type, $type ) ) {
                unset( $comments[ $key ] );
            }
        }
        return $comments;
    }, 10, 2);

}