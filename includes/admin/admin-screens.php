<?php
/**
 * Admin screens and menu setup for Alpaca.
 *
 * @package Alpaca
 */

add_action(
	'admin_menu',
	function () {
		add_menu_page(
			esc_html__( 'Project Board', 'alpaca' ),
			esc_html__( 'Project Board', 'alpaca' ),
			'edit_posts',
			'alpaca-board',
			'alpaca_project_board_page',
			'dashicons-schedule',
			101
		);

		add_submenu_page(
			'alpaca-board',
			esc_html__( 'Configure', 'alpaca' ),
			esc_html__( 'Configure', 'alpaca' ),
			'manage_options',
			'settings.php',
			'alpaca_settings_page'
		);
	}
);

/**
 * Render the Alpaca settings page.
 *
 * @see https://developer.wordpress.org/news/2024/03/how-to-use-wordpress-react-components-for-plugin-pages/
 */
function alpaca_settings_page() {
	?>
	<div class="alpaca-settings wrap">
	<h1><?php echo esc_html__( 'Configure', 'alpaca' ); ?></h1>

	<div id="alpaca-settings-internal"></div>

	<div id="alpaca-settings-plugin">
	<?php do_action( 'alpaca_settings_plugin' ); ?>
	</div>

	</div>
	<?php
}
