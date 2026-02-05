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
	if ( ! is_admin() ) {
		return;
	}

	// Hide the menu when on the project board page.
	$current_screen = get_current_screen();
	if ( $current_screen && 'toplevel_page_alpaca-board' === $current_screen->id ) {
		return;
	}

	/**
	 * Report an Issue - top-level admin bar item with SVG icon.
	 */
	$plugin_dir = plugin_dir_path( dirname( __DIR__ ) );
	$icon_files = glob( $plugin_dir . 'dist/exclamation-circle-fill.*.svg' );
	$icon_svg   = '';

	if ( ! empty( $icon_files ) && file_exists( $icon_files[0] ) ) {
		$icon_svg = file_get_contents( $icon_files[0] );
	}

	$admin_bar->add_menu(
		array(
			'parent' => 'top-secondary',
			'title'  => $icon_svg . esc_html__( 'Report An Issue', 'alpaca' ),
			'id'     => 'alpaca-report',
			'href'   => '#',
		)
	);
}
