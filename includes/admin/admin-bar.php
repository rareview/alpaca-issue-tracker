<?php
/**
 * Admin bar menu integration for Alpaca issues.
 *
 * @package Alpaca
 */

add_action( 'admin_bar_menu', 'alpaca_add_admin_bar_menu', 500 );
/**
 * Add Alpaca menu items to the WordPress admin bar.
 *
 * @param WP_Admin_Bar $admin_bar The admin bar object.
 */
function alpaca_add_admin_bar_menu( $admin_bar ) {
	$admin_bar->add_menu(
		array(
			'id'     => 'alpaca-menu',
			'parent' => 'top-secondary',
			'title'  => '<span class="ab-icon dashicons dashicons-warning"></span><span class="ab-label">Issues</span>',
			'href'   => '#',
			'meta'   => array( 'title' => 'Issues' ),
		)
	);

	/**
	 * Placeholder menu item replaced by AlpacaModal.
	 */
	$admin_bar->add_menu(
		array(
			'parent' => 'alpaca-menu',
			'title'  => '',
			'id'     => 'alpaca-report',
			'href'   => '#',
		)
	);

	$admin_bar->add_menu(
		array(
			'parent' => 'alpaca-menu',
			'title'  => 'View Project Board',
			'id'     => 'alpaca-board',
			'href'   => admin_url( 'admin.php?page=alpaca-board' ),
		)
	);

	$admin_bar->add_menu(
		array(
			'parent' => 'alpaca-menu',
			'title'  => 'View All Issues',
			'id'     => 'alpaca-view',
			'href'   => admin_url( 'edit.php?post_type=alpaca_issue' ),
		)
	);
}
