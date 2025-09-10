<?php

add_action( 'admin_menu', function() {

    add_menu_page(
		esc_html__( 'Project Board', 'alpaca' ), // page title
		esc_html__( 'Project Board', 'alpaca' ), // menu title
		'edit_posts', // capability
		'alpaca-board', // slug
		'project_board_page', // callback
		'dashicons-schedule', // icon
        101 // position
	);

    add_submenu_page(
		'alpaca-board', // parent
		esc_html__( 'Configure', 'alpaca' ), // page title
		esc_html__( 'Configure', 'alpaca' ), // menu title
		'manage_options', // capability
		'settings.php', // slug
		'alpaca_settings_page', // callback
	);
});



function alpaca_settings_page() {
	// https://developer.wordpress.org/news/2024/03/how-to-use-wordpress-react-components-for-plugin-pages/
?>
	<div class="alpaca-settings wrap">
	<h1><?php echo esc_html__( 'Configure', 'alpaca' ); ?></h1>

	<div id="alpaca-settings-internal"></div>

	<div id="alpaca-settings-plugin">
	<?php do_action("alpaca-settings-plugin"); ?>
	</div>

	</div>
	<?php
}

