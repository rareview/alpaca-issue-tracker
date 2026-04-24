<?php
/**
 * Admin bar menu integration for Alpaca issues.
 *
 * @package Alpaca
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'admin_bar_menu', 'alpaca_add_admin_bar_menu', 500 );
/**
 * Add Alpaca menu items to the WordPress admin bar.
 *
 * @param WP_Admin_Bar $admin_bar The admin bar object.
 */
function alpaca_add_admin_bar_menu( $admin_bar ) {
	/**
	 * Filter whether Alpaca should register the admin bar report menu item.
	 *
	 * @param bool $enabled True to register the admin bar report menu item.
	 */
	if ( ! apply_filters( 'alpaca_enable_admin_bar_report_menu', false ) ) {
		return;
	}

	if ( ! is_admin() ) {
		return;
	}

	// Hide the menu when on the project board page.
	$current_screen = get_current_screen();
	if ( $current_screen && 'toplevel_page_project-board' === $current_screen->id ) {
		return;
	}

	/**
	 * Report an Issue - top-level admin bar item with SVG icon.
	 */
	$icon_svg = alpaca_get_icon( 'exclamation-circle-fill' );

	$admin_bar->add_menu(
		array(
			'parent' => 'top-secondary',
			'title'  => $icon_svg . esc_html__( 'Report An Issue', 'alpaca' ),
			'id'     => 'alpaca-report',
			'href'   => '#',
		)
	);
}
