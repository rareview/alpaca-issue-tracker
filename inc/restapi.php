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
            'post_name' => hash('adler32', $getbody), // Unique slug based on the request body
            'post_content' =>wp_kses_post(  $json['userinput']['feedback'] ),
            'comment_status' => 'open', // Allow comments on the issue
        );
        $post_id = wp_insert_post( $post_args );

        if ( is_wp_error( $post_id ) || $post_id === 0 ) {
            return new WP_REST_Response( array(
                'success' => false,
                'message' => 'Failed to create the issue post.',
            ), 500 );
        }

        $status_term_id = 0;
        $statuses         = alpaca_get_statuses(); // Already ordered by score
        if ( ! empty( $statuses ) ) {
            $status_term       = null;
            $default_status_id = get_option( 'alpaca_default_status_id' );

            // 1. Try to use the saved default status
            if ( ! empty( $default_status_id ) ) {
                $term = get_term( (int) $default_status_id, 'status' );
                // Check if the term exists and is one of the statuses on the board
                if ( $term && ! is_wp_error( $term ) && in_array( $term->term_id, wp_list_pluck( $statuses, 'term_id' ) ) ) {
                    $status_term = $term;
                }
            }

            // 2. If no valid default is set, fall back to the first status with a non-negative score
            if ( ! $status_term ) {
                foreach ( $statuses as $s ) {
                    if ( (int) $s->term_score >= 0 ) {
                        $status_term = $s;
                        break;
                    }
                }
            }

            // 3. If still no status, just use the first one available
            if ( ! $status_term ) {
                $status_term = reset( $statuses );
            }

            // If we found a status, assign it
            if ( $status_term ) {
                wp_set_post_terms( $post_id, array( $status_term->term_id ), 'status' );
                $status_term_id = $status_term->term_id;
            }
        }

        /*
        // OLD LOGIC
        $status_term_id = 0;
        $statuses = alpaca_get_statuses();
        if ( ! empty( $statuses ) ) {
            $status_term = null;
            foreach ( $statuses as $s ) {
                $score = get_term_meta( $s->term_id, 'term_score', true );
                if ( $score > -1 ) {
                    $status_term = $s;
                    break;
                }
            }
            // Fallback: if none found, use the first status as before
            if ( ! $status_term && ! empty( $statuses ) ) {
                $status_term = reset( $statuses );
            }
            wp_set_post_terms( $post_id, array( $status_term->term_id ), 'status' );
            $status_term_id = $status_term->term_id;
        }*/
        
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

        if( isset( $json['wp']['queriedObject'] ) ) {
            if( isset( $json['wp']['queriedObject']['post_content'] ) ) {
                unset( $json['wp']['queriedObject']['post_content'] );
                // todo: how to handle post_content (if we think we need it)
            }
            $encoded = json_encode( $json['wp']['queriedObject'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE );
            update_post_meta( $post_id, 'queriedObject', $encoded );           
        }

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
                    'comment_count' => 0, // New issue has 0 comments
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
                // Special handling for assignee: convert usernames to term IDs
                if ( $taxonomy === 'assignee' ) {
                    $term_ids = [];
                    foreach ( (array) $terms as $user_slug ) {
                        $user = get_user_by( 'slug', $user_slug );
                        if ( $user ) {
                            // Use display name as term name, slug as term slug
                            $term = get_term_by( 'slug', $user->user_nicename, 'assignee' );
                            if ( ! $term ) {
                                $term = wp_insert_term(
                                    $user->display_name,
                                    'assignee',
                                    [
                                        'slug'        => $user->user_nicename,
                                        'description' => $user->user_login,
                                    ]
                                );
                                $term_id = is_array( $term ) ? $term['term_id'] : $term;
                            } else {
                                $term_id = $term->term_id;
                            }
                            if ( $term_id ) {
                                $term_ids[] = (int) $term_id;
                            }
                        }
                    }
                    wp_set_post_terms( $issue_id, $term_ids, 'assignee', false );
                } else {
                    $term_ids = array_map( 'intval', (array) $terms );
                    wp_set_post_terms( $issue_id, $term_ids, $taxonomy, false );
                }
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

add_action( 'rest_api_init', 'alpaca_register_options_endpoints' );
function alpaca_register_options_endpoints() {
    register_rest_route(
        'alpaca/v1',
        '/options/default_status',
        array(
            array(
                'methods'             => 'GET',
                'callback'            => 'alpaca_get_default_status_option',
                'permission_callback' => function () {
                    return current_user_can( 'manage_options' );
                },
            ),
            array(
                'methods'             => 'POST',
                'callback'            => 'alpaca_update_default_status_option',
                'permission_callback' => function () {
                    return current_user_can( 'manage_options' );
                },
                'args'                => array(
                    'value' => array(
                        'required'          => true,
                        'validate_callback' => function ( $param ) {
                            return is_numeric( $param ) || $param === '';
                        },
                    ),
                ),
            ),
        )
    );
}

function alpaca_get_default_status_option() {
    $default_status_id = get_option( 'alpaca_default_status_id', '' );
    return new WP_REST_Response( array( 'value' => $default_status_id ), 200 );
}

function alpaca_update_default_status_option( WP_REST_Request $request ) {
    $value = $request->get_param( 'value' );
    update_option( 'alpaca_default_status_id', intval( $value ) );
    return new WP_REST_Response( array( 'success' => true, 'value' => intval( $value ) ), 200 );
}

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
            // For assignee, return usernames
            if ( $taxonomy_obj->name === 'assignee' ) {
                foreach ( $terms as &$term ) {
                    $term->username = $term->name;
                    // Optionally, try to get display_name from description
                    $term->display_name = $term->description;
                }
            }
            $terms_data[ $taxonomy_obj->name ] = $terms;
        }
    }

    // We need to specifically count our custom comment type,
    // as they are excluded from the standard post->comment_count.
    $issue_comment_count = get_comments( array(
        'post_id' => $issue_id,
        'type'    => 'issuecomment',
        'count'   => true,
    ) );

    // Structure the response similar to alpaca_update_issue_callback, but with more data
    $response_data = array(
        'success' => true,
        'message' => 'Issue data retrieved successfully.',
        'post_id' => $issue_id,
        'post_data' => $post_data,
        'meta'      => $formatted_meta,
        'taxonomies' => $terms_data,
        'comment_count' => $issue_comment_count,
    );

    return new WP_REST_Response( $response_data, 200 );
}

add_action( 'rest_api_init', 'alpaca_register_user_list_endpoint' );
function alpaca_register_user_list_endpoint() {
    register_rest_route(
        'alpaca/v1',
        '/users',
        array(
            'methods'             => 'GET',
            'callback'            => 'alpaca_get_all_users_callback',
            'permission_callback' => function () {
                return current_user_can( 'edit_posts' );
            },
        )
    );
}

function alpaca_get_all_users_callback() {
    // We can add role filtering here if needed in the future, e.g., 'role__in' => ['administrator', 'editor', 'author']
    $users = get_users( array( 'fields' => array( 'ID', 'display_name', 'user_nicename' ) ) );

    if ( empty( $users ) ) {
        return new WP_REST_Response( array(), 200 );
    }

    $response_data = array();
    foreach ( $users as $user ) {
        $response_data[] = array(
            'id'          => $user->ID,
            'name'        => $user->display_name,
            'slug'        => $user->user_nicename,
            'avatar_urls' => array(
                '24' => get_avatar_url( $user->ID, array( 'size' => 24 ) ),
                '48' => get_avatar_url( $user->ID, array( 'size' => 48 ) ),
                '96' => get_avatar_url( $user->ID, array( 'size' => 96 ) ),
            ),
        );
    }

    return new WP_REST_Response( $response_data, 200 );
}

add_action( 'rest_api_init', 'alpaca_watchlist_endpoint' );
function alpaca_watchlist_endpoint() {
    register_rest_route(
        'alpaca/v1',
        '/watchlist',
        array(
            'methods' => 'POST',
            'callback' => 'alpaca_update_watchlist_callback',
            'permission_callback' => function () {
                return current_user_can( 'edit_posts' );
            }
        )
    );

    register_rest_route(
        'alpaca/v1',
        '/watchlist',
        array(
            'methods' => 'GET',
            'callback' => 'alpaca_get_watchlist_callback',
            'permission_callback' => function () {
                return current_user_can( 'edit_posts' );
            }
        )
    );
}

function alpaca_get_watchlist_callback() {
    $user_id = get_current_user_id();
    $watchlist = get_user_meta( $user_id, 'alpaca_watchlist', true );

    if ( ! is_array( $watchlist ) ) {
        $watchlist = array();
    }

    return new WP_REST_Response( $watchlist, 200 );
}

function alpaca_update_watchlist_callback( WP_REST_Request $request ) {
    $issue_id = $request->get_param( 'issue_id' );
    $user_id = get_current_user_id();
    $watchlist = get_user_meta( $user_id, 'alpaca_watchlist', true );

    if ( ! is_array( $watchlist ) ) {
        $watchlist = array();
    }

    if ( in_array( $issue_id, $watchlist ) ) {
        $watchlist = array_values(array_diff( $watchlist, array( $issue_id ) ));
    } else {
        $watchlist[] = $issue_id;
    }

    update_user_meta( $user_id, 'alpaca_watchlist', $watchlist );

    return new WP_REST_Response( array( 'success' => true, 'watchlist' => $watchlist ), 200 );
}

add_action( 'rest_api_init', 'alpaca_get_statuses_endpoint' );
function alpaca_get_statuses_endpoint() {
    register_rest_route(
        'alpaca/v1',
        '/statuses',
        array(
            'methods'             => 'GET',
            'callback'            => 'alpaca_get_statuses_callback',
            'permission_callback' => function () {
                return current_user_can( 'manage_options' );
            },
        )
    );
}

function alpaca_get_statuses_callback() {
    // This function is in posttypes-and-taxonomies.php
    $statuses = alpaca_get_statuses();
    if ( is_wp_error( $statuses ) ) {
        return $statuses;
    }
    return new WP_REST_Response( $statuses, 200 );
}


add_action( 'rest_api_init', 'alpaca_update_status_endpoint' );
function alpaca_update_status_endpoint() {
    register_rest_route(
        'alpaca/v1',
        '/status/(?P<id>\d+)',
        array(
            'methods'  => 'POST',
            'callback' => 'alpaca_update_status_callback',
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

function alpaca_update_status_callback( WP_REST_Request $request ) {
    $term_id = (int) $request['id'];
    $data    = $request->get_json_params();

    // Check term exists and is a 'status'
    $term = get_term( $term_id, 'status' );
    if ( ! $term || is_wp_error( $term ) ) {
        return new WP_REST_Response(
            array(
                'success' => false,
                'message' => 'Status not found.',
            ),
            404
        );
    }

    // Update term name if provided
    if ( isset( $data['name'] ) ) {
        $new_name = $data['name'];
        $new_slug = sanitize_title( $new_name ); // generate a slug from the name

        $update_result = wp_update_term(
            $term_id,
            'status',
            array(
                'name' => $new_name,
                'slug' => $new_slug,
            )
        );

        if ( is_wp_error( $update_result ) ) {
            return new WP_REST_Response(
                array(
                    'success' => false,
                    'message' => 'Failed to update status name and slug.',
                ),
                500
            );
        }
    }

    // Update term score if provided
    if ( isset( $data['term_score'] ) ) {
        update_term_meta( $term_id, 'term_score', $data['term_score'] );
    }

    return new WP_REST_Response(
        array(
            'success' => true,
            'message' => 'Status updated successfully.',
        ),
        200
    );
}