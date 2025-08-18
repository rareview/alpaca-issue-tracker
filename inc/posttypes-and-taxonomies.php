<?php
add_action( 'init', function() {

    register_post_type( 'issue', array(
        'public'             => false,
        'show_in_rest'       => true,
        'show_ui'			 => true,
        // 'publicly_queryable' => false,
        // 'rewrite'			 => false,
        // 'query_var'			 => false,
        'label'              => 'Issues',
        'labels'			 => array(
	        'name'				=> 'Issue',
	        'singular_name'		=> 'Issue',
	        'all_items'			=> 'All Issues',
	        'edit_item'			=> 'Edit Issue',
	        'view_item'			=> 'View Issue',
	        'view_items'		=> 'View Issues',
        ),
        'menu_icon'          => 'dashicons-warning',
        'menu_position'		 => 102,
        'supports'           => array( 'editor','custom-fields','author','comments' ),
		'map_meta_cap' => true, // prevents viewing/editing if false
		// 'capabilities' => array(
		// 	'create_posts' => false, // Removes support for the "Add New" function ( use 'do_not_allow' instead of false for multisite set ups )
		// ),
    ) );

    function alpaca_register_taxonomy( $slug, $customargs=array() ) {
        $defaults = array(
            'public'             => true,
            'publicly_queryable' => false,
            'label' => $slug,
            'hierarchical' => false,
        );
        $args = array_merge( $defaults, $customargs );
        register_taxonomy( $slug, 'issue', $args );
    }
    alpaca_register_taxonomy( 'browser' );
    alpaca_register_taxonomy( 'phptemplate' );
    alpaca_register_taxonomy( 'type' );
    // alpaca_register_taxonomy( 'plugin' );
    // alpaca_register_taxonomy( 'query' );
    alpaca_register_taxonomy( 'assignee', array(
        'public' => true,
    ) );
    alpaca_register_taxonomy( 'status', array(  
        'meta_box_cb' => 'status_metabox', // custom metabox, see below
    ) );

    add_filter( 'rest_pre_insert_comment', function( $prepared_comment, $request ) {
        if ( isset( $request['comment_type'] ) && $request['comment_type'] === 'issuecomment' ) {
            $prepared_comment['comment_type'] = 'issuecomment';
        }
        return $prepared_comment;
    }, 10, 2 );

    add_filter( 'rest_comment_query', function( $args, $request ) {
        if ( isset( $request['comment_type'] ) && $request['comment_type'] === 'issuecomment' ) {
            $args['type'] = 'issuecomment';
        }
        return $args;
    }, 10, 2 );



    add_action( 'status_add_form_fields', function() {
        ?>
        <div class="form-field">
            <label for="term_score"><?php _e( 'Score', 'textdomain' ); ?></label>
            <input type="number" name="term_score" id="term_score" value="" step="1" min="0">
            <p class="description"><?php _e( 'Enter a numerical score for sorting purposes.', 'textdomain' ); ?></p>
        </div>
        <?php
    } );

    add_action( 'status_edit_form_fields', function( $term ) {
        $score = get_term_meta( $term->term_id, 'term_score', true );
        ?>
        <tr class="form-field">
            <th scope="row"><label for="term_score"><?php _e( 'Score', 'textdomain' ); ?></label></th>
            <td>
                <input type="number" name="term_score" id="term_score" value="<?php echo esc_attr( $score ); ?>" step="1">
                <p class="description"><?php _e( 'Enter a numerical score for sorting purposes.', 'textdomain' ); ?></p>
            </td>
        </tr>
        <?php
    }, 10, 1 );

    // Save term meta when creating or editing
    function save_status_term_score( $term_id ) {
        if ( isset( $_POST['term_score'] ) ) {
            $score = intval( $_POST['term_score'] );
            update_term_meta( $term_id, 'term_score', $score );
        }
    }
    add_action( 'created_status', 'save_status_term_score' );
    add_action( 'edited_status',  'save_status_term_score' );

    // Add new column header
    add_filter( 'manage_edit-status_columns', function( $columns ) {
        $columns['term_score'] = __( 'Score', 'textdomain' );
        return $columns;
    } );

    // Fill the column content
    add_filter( 'manage_status_custom_column', function( $content, $column_name, $term_id ) {
        if ( 'term_score' === $column_name ) {
            $score = get_term_meta( $term_id, 'term_score', true );
            $content = $score !== '' ? intval( $score ) : '—';
        }
        return $content;
    }, 10, 3 );
    add_filter( 'manage_edit-status_sortable_columns', function( $sortable_columns ) {
        $sortable_columns['term_score'] = 'term_score';
        return $sortable_columns;
    } );


    /*
        Inspiration taken from:
        https://wordpress.stackexchange.com/questions/50077/display-a-custom-taxonomy-as-a-dropdown-on-the-edit-posts-page
    */
    function status_metabox( $post ) {
        $current_terms = wp_get_post_terms($post->ID, 'status', array('fields' => 'ids'));
        $current_term_id = !empty($current_terms) ? $current_terms[0] : 0;

        $terms = alpaca_get_statuses();

        echo '<div class="statuses_radiolist">';
        foreach ($terms as $term) {
            $checked = ($current_term_id == $term->term_id) ? 'checked' : '';
            echo '<label><input type="radio" name="tax_input[status][]" value="' . esc_attr($term->slug) . '" ' . $checked . '/> ' . esc_html($term->name) . '</label><br>';
        }
        echo '</div>';
    }

});

add_filter('alpaca_board_statuses', function( $statuses ) {
    $desired_statuses = array();
    foreach ( $statuses as $status ) {
        if( $status->term_score > 100 ) {
            continue;
        }
        if( $status->term_score < -100 ) {
            continue;
        }
        $desired_statuses[] = $status;
    }
    return $desired_statuses;
});


/**
 * When a user's profile is updated, find the corresponding 'assignee' term
 * and update its name to match the user's new display name.
 *
 * The link between a user and an assignee term is the user's nicename (slug).
 *
 * @param int    $user_id       The ID of the user being updated.
 * @param object $old_user_data The old user data.
 */
function alpaca_update_assignee_term_on_profile_update( $user_id, $old_user_data ) {
	$user = get_userdata( $user_id );

	// No need to do anything if the display name hasn't changed.
	if ( $user->display_name === $old_user_data->display_name ) {
		return;
	}

	// Find the term in the 'assignee' taxonomy with a slug that matches the user's nicename.
	$term = get_term_by( 'slug', $user->user_nicename, 'assignee' );

	// If a term is found, update its name to the user's new display name.
	if ( $term ) {
		wp_update_term( $term->term_id, 'assignee', array( 'name' => $user->display_name ) );
	}
}
add_action( 'profile_update', 'alpaca_update_assignee_term_on_profile_update', 10, 2 );

function alpaca_get_statuses( $order = 'ASC' ) {
    $terms = get_terms(array(
		'taxonomy' => 'status',
		'hide_empty' => false,
		'meta_key' => 'term_score',
		'orderby' => 'meta_value_num',
		'order' => $order,
	));
    foreach( $terms as $term ) {
        $score = get_term_meta( $term->term_id, 'term_score', true );
        $term->term_score = $score;
    }
    return $terms;
}
