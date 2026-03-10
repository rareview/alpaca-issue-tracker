<?php
/**
 * Admin screens and menu setup for Alpaca.
 *
 * @package Alpaca
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action(
	'admin_menu',
	function () {
		add_menu_page(
			esc_html__( 'Project Board', 'alpaca' ),
			esc_html__( 'Project Board', 'alpaca' ),
			'edit_posts',
			'project-board',
			'alpaca_project_board_page',
			'dashicons-schedule',
			101
		);

		add_submenu_page(
			'project-board',
			esc_html__( 'Project Activity', 'alpaca' ),
			esc_html__( 'Project Activity', 'alpaca' ),
			'edit_posts',
			'project-activity',
			'alpaca_activity_page'
		);

		add_submenu_page(
			'project-board',
			esc_html__( 'Configure', 'alpaca' ),
			esc_html__( 'Configure', 'alpaca' ),
			'manage_options',
			'settings',
			'alpaca_settings_page'
		);

		add_submenu_page(
			'project-board',
			esc_html__( 'My Notifications', 'alpaca' ),
			esc_html__( 'My Notifications', 'alpaca' ),
			'edit_posts',
			'alpaca-notifications',
			'alpaca_notifications_page'
		);

		add_submenu_page(
			'project-board',
			esc_html__( 'Email Template', 'alpaca' ),
			esc_html__( 'Email Template', 'alpaca' ),
			'manage_options',
			'alpaca-notification-template',
			'alpaca_notification_template_page'
		);

		add_submenu_page(
			'project-board',
			esc_html__( 'About', 'alpaca' ),
			esc_html__( 'About', 'alpaca' ),
			'manage_options',
			'alpaca-about',
			'alpaca_about_page'
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

/**
 * Render the Alpaca about page.
 */
function alpaca_about_page() {
	?>
	<div class="wrap">
		<h1><?php echo esc_html__( 'About Alpaca', 'alpaca' ); ?></h1>
		<div id="alpaca-about-page"></div>
	</div>
	<?php
}

/**
 * Render the Alpaca activity page.
 */
function alpaca_activity_page() {
	?>
	<div class="wrap">
		<h1><?php echo esc_html__( 'Project Activity', 'alpaca' ); ?></h1>
		<div id="alpaca-activity-page"></div>
	</div>
	<?php
}

/**
 * Render the current user's notifications page.
 */
function alpaca_notifications_page() {
	?>
	<div class="alpaca-settings wrap alpaca-notifications-admin-page">
		<h1><?php echo esc_html__( 'My Notifications', 'alpaca' ); ?></h1>
		<div id="alpaca-notifications-page"></div>
	</div>
	<?php
}

/**
 * Render the admin email template page.
 */
function alpaca_notification_template_page() {
	?>
	<div class="alpaca-settings wrap alpaca-notification-template-admin-page">
		<h1><?php echo esc_html__( 'Email Template', 'alpaca' ); ?></h1>
		<div id="alpaca-notification-template-page"></div>
	</div>
	<?php
}
