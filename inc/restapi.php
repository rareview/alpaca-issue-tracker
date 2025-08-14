<?php

add_action( 'init', function() {
    wp_localize_script(
        'wp-api',
        'wpApiSettings',
        array( 'root' => esc_url_raw( rest_url() ), 'nonce' => wp_create_nonce( 'wp_rest' ) )
    );
    wp_enqueue_script( 'wp-api' );
});

add_action( 'rest_api_init', 'alpaca_issue_submit' );
function alpaca_issue_submit(){
    register_rest_route(
        'issue/v1/', // Namespace
        'submit', // Endpoint
        array(
            'methods'  => 'POST',
            'callback' => 'alpaca_issue_callback',
            'permission_callback' => function() {
                return current_user_can('edit_others_posts');
            }
        )
    );
}

function alpaca_issue_callback( WP_REST_Request $req ) {
    $getbody = $req->get_body();
    if ( isset($getbody) ) {
        $json = json_decode( $getbody,true );

        $post_args = array(
            'post_type' => 'issue',
            'post_status' => 'publish',
            'post_author' => $json['user']['id'],
            'post_title' => wp_kses_post( wp_trim_words( $json['userinput']['feedback'], 10 ) ), // Original title
            'post_name' => hash('fnv164', $getbody), // Unique slug based on the request body
            'post_content' =>wp_kses_post(  $json['userinput']['feedback'] ),
            'comment_status' => 'open', // Allow comments on the issue
        );
        $post_id = wp_insert_post( $post_args );

        if ( is_wp_error( $post_id ) || $post_id === 0 ) {
            return new WP_REST_Response(
                array(
                    'success' => false,
                    'message' => 'Failed to create the issue post.',
                ),
                500
            );
        }

        $status_term_id = 0;
        $statuses = alpaca_get_statuses();
        if ( ! empty( $statuses ) ) {
            $status_term = reset( $statuses ); // Get the first status term
            wp_set_post_terms( $post_id, array( $status_term->term_id ), 'status' );
            $status_term_id = $status_term->term_id;
            // sets issue status to lowest scored term
            // TODO: allow user to choose the default status
        }
        
        // set terms and meta here
        wp_set_post_terms( $post_id, $json['client']['browser']['name'], 'browser', true );
        wp_set_post_terms( $post_id, $json['client']['os'], 'browser', true );
        wp_set_post_terms( $post_id, $json['wp']['template'], 'phptemplate' );
        foreach( $json['wp']['type'] as $t ) {
            wp_set_post_terms( $post_id, $t, 'type' );
        }
        // consider: active plugins as a taxonomy?
        update_post_meta( $post_id, 'screenshot', $json['screenshot'] );
        update_post_meta( $post_id, 'screenwidth', $json['client']['browser']['width'] );
        update_post_meta( $post_id, 'screenheight', $json['client']['browser']['height'] );
        update_post_meta( $post_id, 'URL', $json['server']['REQUEST_URI'] );
        update_post_meta( $post_id, 'queriedObject', json_encode( $json['wp']['queriedObject'] ) );

        if( in_array( 'singular', $json['wp']['type'] ) ) {
            wp_update_post( array(
                'ID' => $post_id,
                'post_parent' => $json['wp']['queriedObject']['ID']
            ));
        }

        return new WP_REST_Response(
            array(
                'success' => true,
                'message' => 'Issue submitted successfully.',
                'post_id' => $post_id,
                'issue'   => array(
                    'id'          => $post_id,
                    'title'       => $post_args['post_title'],
                    'author_id'   => $post_args['post_author'],
                    'author_name' => get_the_author_meta( 'display_name', $post_args['post_author'] ),
                    'author_img'  => get_avatar_url( $post_args['post_author'], array( 'size' => 24 ) ),
                ),
                'statusId'  => $status_term_id,
            ),
            200
        );
    }

    return new WP_REST_Response(
        array(
            'success' => false,
            'message' => 'Invalid request body.',
        ),
        400
    );
}

add_action( 'rest_api_init', 'alpaca_get_board' );
function alpaca_get_board() {
    register_rest_route(
        'alpaca/v1',
        '/board',
        array(
            'methods' => 'GET',
            'callback' => 'alpaca_get_board_data_callback',
            'permission_callback' => function () {
                return current_user_can( 'edit_posts' );
            }
        )
    );
}

function alpaca_get_board_data_callback() {
    $board_data = alpaca_get_board_data();
    return new WP_REST_Response( $board_data, 200 );
}

add_action( 'rest_api_init', 'alpaca_update_board' );
function alpaca_update_board() {
    register_rest_route(
        'alpaca/v1',
        '/board',
        array(
            'methods' => 'POST',
            'callback' => 'alpaca_update_board_data_callback',
            'permission_callback' => function () {
                return current_user_can( 'edit_posts' );
            }
        )
    );
}

function alpaca_update_board_data_callback( WP_REST_Request $request ) {
    $columns = $request->get_json_params();

    // Check if the received data is an array, which matches the structure from saveBoardOrder.
    if ( ! is_array( $columns ) ) {
        return new WP_REST_Response(
            [
                'success' => false,
                'message' => 'Invalid data format. Expected an array of columns.',
            ],
            400
        );
    }

    foreach ( $columns as $column ) {
        // Basic validation for each column object.
        if ( ! isset( $column['id'] ) || ! isset( $column['issues'] ) || ! is_array( $column['issues'] ) ) {
            // Silently skip malformed column data.
            continue;
        }

        $term_id   = (int) $column['id'];
        $issue_ids = array_map( 'intval', $column['issues'] );

        // A term ID of 0 is invalid.
        if ( $term_id > 0 ) {
            // Save the ordered array of issue IDs to the term's metadata.
            update_term_meta( $term_id, 'issue_order', $issue_ids );
        }
    }

    return new WP_REST_Response( [ 'success' => true, 'message' => 'Board order saved successfully.' ], 200 );
}

add_action( 'rest_api_init', 'alpaca_update_issue' );
function alpaca_update_issue() {
    register_rest_route(
        'issue/v1',
        '/update/(?P<id>\d+)',
        array(
            'methods'  => 'POST',
            'callback' => 'alpaca_update_issue_callback',
            'permission_callback' => function () {
                return current_user_can( 'edit_posts' );
            },
            'args' => array(
                'id' => array(
                    'validate_callback' => function ( $param ) {
                        return is_numeric( $param ) && $param > 0;
                    }
                )
            )
        )
    );
}

function alpaca_update_issue_callback( WP_REST_Request $request ) {
    $issue_id = (int) $request['id'];
    $data     = $request->get_json_params();

    // Check post exists and is an 'issue'
    $post = get_post( $issue_id );
    if ( ! $post || $post->post_type !== 'issue' ) {
        return new WP_REST_Response(
            array(
                'success' => false,
                'message' => 'Issue not found.',
            ),
            404
        );
    }

    // Prepare updated post args
    $post_args = array(
        'ID'           => $issue_id,
        'post_title'   => isset( $data['title'] ) ? wp_kses_post( $data['title'] ) : $post->post_title,
        'post_content' => isset( $data['content'] ) ? wp_kses_post( $data['content'] ) : $post->post_content,
        'post_modified'     => current_time( 'mysql' ),
        'post_modified_gmt' => current_time( 'mysql', 1 ),
    );

    // Update the post
    $update_result = wp_update_post( $post_args, true );

    if ( is_wp_error( $update_result ) ) {
        return new WP_REST_Response(
            array(
                'success' => false,
                'message' => 'Failed to update the issue.',
            ),
            500
        );
    }

    // Update taxonomies if provided
    if ( isset( $data['taxonomies'] ) && is_array( $data['taxonomies'] ) ) {
        foreach ( $data['taxonomies'] as $taxonomy => $terms ) {
            if ( taxonomy_exists( $taxonomy ) ) {
                // Force integers to avoid WP creating new terms
                $term_ids = array_map( 'intval', (array) $terms );
                wp_set_post_terms( $issue_id, $term_ids, $taxonomy, false );
            }
        }
    }

    // Update meta fields if provided
    if ( isset( $data['meta'] ) && is_array( $data['meta'] ) ) {
        foreach ( $data['meta'] as $meta_key => $meta_value ) {
            update_post_meta( $issue_id, sanitize_key( $meta_key ), maybe_serialize( $meta_value ) );
        }
    }



    return new WP_REST_Response(
        array(
            'success' => true,
            'message' => 'Issue updated successfully.',
            'post_id' => $issue_id,
        ),
        200
    );
}

// --- NEW ENDPOINT START ---
add_action( 'rest_api_init', 'alpaca_get_issue_data' );
function alpaca_get_issue_data() {
    register_rest_route(
        'issue/v1', // Namespace
        '/get/(?P<id>\d+)', // Endpoint with ID parameter
        array(
            'methods'  => 'GET',
            'callback' => 'alpaca_get_issue_data_callback',
            'permission_callback' => function () {
                // Users must be able to edit posts to view issue details.
                return current_user_can( 'edit_posts' );
            },
            'args' => array(
                'id' => array(
                    'validate_callback' => function ( $param ) {
                        return is_numeric( $param ) && $param > 0;
                    }
                )
            )
        )
    );
}

function alpaca_get_issue_data_callback( WP_REST_Request $request ) {
    $issue_id = (int) $request['id'];

    // Get the post object
    $post = get_post( $issue_id );

    // Check if the post exists and is of type 'issue'
    if ( ! $post || $post->post_type !== 'issue' ) {
        return new WP_REST_Response(
            array(
                'success' => false,
                'message' => 'Issue not found.',
            ),
            404
        );
    }

    // Convert the post object to an array for easier manipulation
    $post_data = $post->to_array();
    $post_data['post_author_display_name'] = get_the_author_meta( 'display_name', $post_data['post_author'] );
    $post_data['post_author_img'] = get_avatar_url( $post_data['post_author'], array( 'size' => 32 ) );

    // Get all post meta
    $meta = get_post_meta( $issue_id );
    $formatted_meta = [];
    foreach ( $meta as $key => $value ) {
        // Automatically unserialize if needed and remove internal WP meta keys
        if ( ! str_starts_with( $key, '_' ) ) {
            $formatted_meta[ $key ] = maybe_unserialize( $value[0] );
        }
    }

    // Get all taxonomies associated with 'issue' post type
    $all_taxonomies = get_object_taxonomies( 'issue', 'objects' );
    $terms_data = [];
    foreach ( $all_taxonomies as $taxonomy_obj ) {
        $terms = wp_get_object_terms( $issue_id, $taxonomy_obj->name, array( 'fields' => 'all' ) );
        if ( ! is_wp_error( $terms ) && ! empty( $terms ) ) {
            $terms_data[ $taxonomy_obj->name ] = $terms;
        }
    }

    // Structure the response similar to alpaca_update_issue_callback, but with more data
    $response_data = array(
        'success' => true,
        'message' => 'Issue data retrieved successfully.',
        'post_id' => $issue_id,
        'post_data' => $post_data,
        'meta'      => $formatted_meta,
        'taxonomies' => $terms_data,
    );

    return new WP_REST_Response( $response_data, 200 );
}
// --- NEW ENDPOINT END ---