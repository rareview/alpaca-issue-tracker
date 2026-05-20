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
			esc_html__( 'Project Board', 'alpaca-issue-tracker' ),
			esc_html__( 'Project Board', 'alpaca-issue-tracker' ),
			'edit_posts',
			'project-board',
			'alpaca_project_board_page',
			'dashicons-schedule',
			3
		);

		add_submenu_page(
			'project-board',
			esc_html__( 'Project Activity', 'alpaca-issue-tracker' ),
			esc_html__( 'Project Activity', 'alpaca-issue-tracker' ),
			'edit_posts',
			'project-activity',
			'alpaca_activity_page'
		);

		add_submenu_page(
			'project-board',
			esc_html__( 'Configure', 'alpaca-issue-tracker' ),
			esc_html__( 'Configure', 'alpaca-issue-tracker' ),
			'manage_options',
			'alpaca-settings',
			'alpaca_settings_page'
		);

		add_submenu_page(
			'project-board',
			esc_html__( 'My Notifications', 'alpaca-issue-tracker' ),
			esc_html__( 'My Notifications', 'alpaca-issue-tracker' ),
			'edit_posts',
			'alpaca-notifications',
			'alpaca_notifications_page'
		);

		add_submenu_page(
			'project-board',
			esc_html__( 'Email Templates', 'alpaca-issue-tracker' ),
			esc_html__( 'Email Templates', 'alpaca-issue-tracker' ),
			'manage_options',
			'alpaca-email-templates',
			'alpaca_email_templates_page'
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
	<h1><?php echo esc_html__( 'Configure', 'alpaca-issue-tracker' ); ?></h1>

	<div class="notice notice-warning inline">
		<p><?php echo esc_html__( 'Changes made on this screen will affect all users.', 'alpaca-issue-tracker' ); ?></p>
	</div>

	<div id="alpaca-settings-internal"></div>

	<div id="alpaca-settings-plugin">
	<?php do_action( 'alpaca_settings_plugin' ); ?>
	</div>

	</div>
	<?php
}

/**
 * Render the Alpaca activity page.
 */
function alpaca_activity_page() {
	?>
	<div class="wrap">
		<h1><?php echo esc_html__( 'Project Activity', 'alpaca-issue-tracker' ); ?></h1>
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
		<h1><?php echo esc_html__( 'My Notifications', 'alpaca-issue-tracker' ); ?></h1>

		<div class="notice notice-info inline">
			<p><?php echo esc_html__( 'Changes made on this screen will only affect the current user.', 'alpaca-issue-tracker' ); ?></p>
		</div>

		<div id="alpaca-notifications-page"></div>
	</div>
	<?php
}

/**
 * Render the admin email templates page.
 */
function alpaca_email_templates_page() {
	?>
	<div class="alpaca-settings wrap alpaca-email-templates-admin-page">
		<h1><?php echo esc_html__( 'Email Templates', 'alpaca-issue-tracker' ); ?></h1>
		<div id="alpaca-email-templates-page"></div>
	</div>
	<?php
}
