<?php
add_action( 'init', function() {

    register_post_type( 'issue', array(
        'public'             => false,
        'show_ui'			 => true,
        'publicly_queryable' => false,
        'rewrite'			 => false,
        'query_var'			 => false,
        'label'              => 'Issues',
        'labels'			 => array(
	        'name'				=> 'Issue',
	        'singular_name'		=> 'Issues',
	        'all_items'			=> 'All Issues',
	        'edit_item'			=> 'Edit Issue',
	        'view_item'			=> 'View Issue',
	        'view_items'		=> 'View Issues',
        ),
        'menu_icon'          => 'dashicons-warning',
        'menu_position'		 => 102,
        'supports'           => array( 'custom-fields','author' ), // skipping 'comments' for now
		'map_meta_cap' => true, // prevents viewing/editing if false
    ) );
    register_taxonomy( 'browser', 'issue', array(
        'public'             => true,
        'publicly_queryable' => false,
        'label' => 'Browsers',
        'hierarchical' => false,
    ) );
/*
    register_taxonomy( 'template', 'bug', array(
        'public'             => true,
        'publicly_queryable' => false,
        'label' => 'Templates',
        'hierarchical' => false,
    ) );
*/
    register_taxonomy( 'type', 'issue', array(
        'public'             => true,
        'publicly_queryable' => false,
        'label' => 'Post Types',
        'hierarchical' => false,
    ) );
    register_taxonomy( 'query', 'issue', array(
        'public'             => true,
        'publicly_queryable' => false,
        'label' => 'Query Types',
        'hierarchical' => false,
    ) );
    register_taxonomy( 'status', 'issue', array(
        'public'             => true,
        'publicly_queryable' => false,
        'label' => 'Statuses',
        'hierarchical' => true,
        'meta_box_cb' => 'status_metabox', // custom metabox, see below
        ) );

    // $statuses = array(
	//     "Backlog",
	//     "To Do",
	//     "In Progress",
	//     "Done",
	//     "Won't fix"
    // );
    // foreach( $statuses as $status ) {
	//     $term = get_term_by( "name", $status, "status" );
	//     if( $term === false ) {
	// 	    $term = wp_insert_term(
	// 		    $status,
	// 		    "status",
	// 			array( "slug" =>  sanitize_title( $status ) )
	// 	    );
	//     }
    // }

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
            <input type="number" name="term_score" id="term_score" value="<?php echo esc_attr( $score ); ?>" step="1" min="0">
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


// can't be bothered dealing with Quick Edit options
add_filter( 'post_row_actions', 'remove_quickedit_actions', 10, 1 );
function remove_quickedit_actions( $actions ) {
    if( in_array( get_post_type(), array(
		'issue'
    ) ) ) {
		unset( $actions['inline hide-if-no-js'] );
    }
    return $actions;
}

function redirect_to_board_on_save( $location ) {
    if ( 'issue' == get_post_type() ) {
        if ( isset( $_POST['save'] ) || isset( $_POST['publish'] ) )
            return admin_url( "edit.php?post_type=issue&page=board.php" );
    }
    return $location;
}
// add_filter( 'redirect_post_location', 'redirect_to_board_on_save' );


/*
	Inspiration taken from:
	https://wordpress.stackexchange.com/questions/50077/display-a-custom-taxonomy-as-a-dropdown-on-the-edit-posts-page
*/
function status_metabox( $post ) {
    ?>
    <div id="taxonomy-status" class="categorydiv">
            <?php

			if( $bcolorder = get_option('bcolorder') ) {
				$theterms = array();
				$bcol_array = json_decode($bcolorder);
				foreach( $bcol_array as $k=>$v ) {
					$theterms[] = get_term( $v, 'status' );
				}
			} else {
				$theterms = get_terms(array(
		        	'taxonomy'		=> 'status',
		        	'hide_empty'	=> false,
                    'meta_key'   => 'term_score',
                    'orderby'    => 'meta_value_num',
                    'order'      => 'ASC',
    				));
			}

	        echo '<ul id="statuschecklist" class="categorychecklist">';

	        $currentstatus = wp_list_pluck( get_the_terms( $post,'status' ), 'term_id');

	        foreach($theterms as $term) {
		        echo PHP_EOL .'<li><label class="selectit">';
		        echo '<input value="' . $term->term_id . '" ';
		        echo 'name="tax_input[status][]"';
                if( $currentstatus ) {
                    if( $currentstatus[0] == $term->term_id ) {
                        echo 'checked="checked" ';
                    }
                }
		        echo 'type="radio">' . $term->name;
		        echo '</label></li>';
		    }

    		echo '</ul>';

	           ?>

    </div>
    <?php
}
});