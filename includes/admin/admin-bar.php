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
 * Determine whether the current admin screen should omit global report UI.
 *
 * The report bundle is intentionally not loaded on WordPress page/post editor
 * screens because those screens are already asset-heavy.
 *
 * @param string $hook_suffix Optional admin page hook suffix.
 * @return bool True when global report UI should be skipped.
 */
function alpaca_should_skip_admin_report_screen( $hook_suffix = '' ) {
	if ( ! is_admin() || ! function_exists( 'get_current_screen' ) ) {
		return false;
	}

	$current_screen = get_current_screen();
	if ( ! $current_screen ) {
		return false;
	}

	$post_type   = isset( $current_screen->post_type ) ? $current_screen->post_type : '';
	$screen_base = isset( $current_screen->base ) ? $current_screen->base : '';

	if ( ! in_array( $post_type, array( 'page', 'post' ), true ) ) {
		return false;
	}

	return 'post' === $screen_base
		|| in_array( $hook_suffix, array( 'post-new.php', 'post.php' ), true );
}

/**
 * Add Alpaca menu items to the WordPress admin bar.
 *
 * @param WP_Admin_Bar $admin_bar The admin bar object.
 * @return void
 */
function alpaca_add_admin_bar_menu( $admin_bar ) {
	if ( ! is_admin() ) {
		return;
	}

	if ( function_exists( 'alpaca_is_contextual_capture_enabled' ) && ! alpaca_is_contextual_capture_enabled() ) {
		return;
	}

	if ( alpaca_should_skip_admin_report_screen() ) {
		return;
	}

	// Hide the menu when on the project board page.
	$current_screen = get_current_screen();
	if ( $current_screen && 'toplevel_page_project-board' === $current_screen->id ) {
		return;
	}

	/**
	 * Context Capture - top-level admin bar item with SVG icon.
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
