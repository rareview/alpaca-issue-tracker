<?php

add_action( 'admin_menu', function() {

    add_menu_page(
		esc_html__( 'Project Board', 'alpaca' ), // page title
		esc_html__( 'Project Board', 'alpaca' ), // menu title
		'manage_options', // capability
		'alpaca-board', // slug
		'project_board_page', // callback
		'dashicons-schedule', // icon
        120 // position
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