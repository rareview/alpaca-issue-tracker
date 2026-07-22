<?php
/**
 * Admin screens and menu setup for Alpaca.
 *
 * @package AlpacaIssueTracker
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
			'alpaistr_project_board_page',
			'dashicons-schedule'
		);

		add_submenu_page(
			'project-board',
			esc_html__( 'Project Activity', 'alpaca-issue-tracker' ),
			esc_html__( 'Project Activity', 'alpaca-issue-tracker' ),
			'edit_posts',
			'project-activity',
			'alpaistr_activity_page'
		);

		add_submenu_page(
			'project-board',
			esc_html__( 'Configure', 'alpaca-issue-tracker' ),
			esc_html__( 'Configure', 'alpaca-issue-tracker' ),
			'manage_options',
			'alpaca-settings',
			'alpaistr_settings_page'
		);

		add_submenu_page(
			'project-board',
			esc_html__( 'My Notifications', 'alpaca-issue-tracker' ),
			esc_html__( 'My Notifications', 'alpaca-issue-tracker' ),
			'edit_posts',
			'alpaca-notifications',
			'alpaistr_notifications_page'
		);

		add_submenu_page(
			'project-board',
			esc_html__( 'Email Templates', 'alpaca-issue-tracker' ),
			esc_html__( 'Email Templates', 'alpaca-issue-tracker' ),
			'manage_options',
			'alpaca-email-templates',
			'alpaistr_email_templates_page'
		);

		add_submenu_page(
			'project-board',
			esc_html__( 'AI Issue Resolver', 'alpaca-issue-tracker' ),
			esc_html__( 'AI Issue Resolver', 'alpaca-issue-tracker' ),
			'manage_options',
			'alpaca-ai-issue-resolver',
			'alpaistr_ai_issue_resolver_page'
		);

		$alpaca_docs_hook = add_submenu_page(
			'project-board',
			esc_html__( 'Documentation', 'alpaca-issue-tracker' ),
			esc_html__( 'Documentation', 'alpaca-issue-tracker' ) . ' <span class="dashicons dashicons-external" aria-hidden="true"></span>',
			'manage_options',
			'alpaca-docs',
			'alpaistr_docs_redirect'
		);

		if ( $alpaca_docs_hook ) {
			add_action( 'load-' . $alpaca_docs_hook, 'alpaistr_docs_redirect' );
		}
	}
);

/**
 * Render the Alpaca Issue Tracker settings page.
 *
 * @see https://developer.wordpress.org/news/2024/03/how-to-use-wordpress-react-components-for-plugin-pages/
 */
function alpaistr_settings_page() {
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
 * Render the Alpaca Issue Tracker activity page.
 */
function alpaistr_activity_page() {
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
function alpaistr_notifications_page() {
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
function alpaistr_email_templates_page() {
	?>
	<div class="alpaca-settings wrap alpaca-email-templates-admin-page">
		<h1><?php echo esc_html__( 'Email Templates', 'alpaca-issue-tracker' ); ?></h1>
		<div id="alpaca-email-templates-page"></div>
	</div>
	<?php
}

/**
 * Render the AI Issue Resolver settings page mount point.
 */
function alpaistr_ai_issue_resolver_page() {
	?>
	<div class="wrap agentic-wizard-wrap">
		<div id="alpaca-ai-issue-resolver-page"></div>
	</div>
	<?php
}

/**
 * Redirects to the external documentation URL.
 *
 * @return void
 */
function alpaistr_docs_redirect() {
	add_filter(
		'allowed_redirect_hosts',
		function ( $hosts ) {
			$hosts[] = 'docs.alpacaissuetracker.com';
			return $hosts;
		}
	);
	wp_safe_redirect( 'https://docs.alpacaissuetracker.com' );
	exit;
}
