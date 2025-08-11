<?php

add_action( 'admin_menu', function() {

    add_menu_page(
		esc_html__( 'Project Board', 'alpaca' ), // page title
		esc_html__( 'Project Board', 'alpaca' ), // menu title
		'manage_options', // capability
		'alpaca-board', // slug
		'project_board_page', // callback
		'dashicons-schedule', // icon
        101 // position
	);

    add_submenu_page(
		'alpaca-board', // parent
		esc_html__( 'Posts', 'alpaca' ), // page title
		esc_html__( 'Posts', 'alpaca' ), // menu title
		'manage_options', // capability
		'edit.php', // slug
	);

    add_submenu_page(
		'alpaca-board', // parent
		esc_html__( 'Pages', 'alpaca' ), // page title
		esc_html__( 'Pages', 'alpaca' ), // menu title
		'manage_options', // capability
		'edit.php?post_type=issue', // slug,
	);

});


function project_board_page() {
	return; // just to prevent an error
}

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

function add_metabox_to_issue() {
	global $post;
	if( ! $post || 'issue' !== $post->post_type ) {
		return;
	}
	if( $screenshot = get_post_meta( $post->ID, 'screenshot', true ) ) {
		add_meta_box(
			'alpaca_screenshot_metabox',	// ID
			esc_html__( 'Screenshot', 'alpaca' ), // Title
			'alpaca_screenshot_metabox_callback', // Callback function
			'issue', // Post type
			'side', // Context
			'high' // Priority
		);
	}
}
add_action( 'add_meta_boxes', 'add_metabox_to_issue' );

function alpaca_screenshot_metabox_callback( $post ) {
	$screenshot = get_post_meta( $post->ID, 'screenshot', true );
	?>
	<div class="screenshot"><img src="<?php echo($screenshot); ?>" alt="Screenshot" /></div>
	<p><em>Warning: may not be 100% faithful</em></p>
	<?php
}