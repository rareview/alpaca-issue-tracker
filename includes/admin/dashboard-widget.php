<?php
/**
 * Dashboard widget for main WP admin dashboard.
 *
 * @package Alpaca
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add a widget to the dashboard.
 */
function alpaca_add_dashboard_widgets() {
	wp_add_dashboard_widget(
		'alpaca_dashboard_widget',                          // Widget slug.
		esc_html__( 'Project Issues', 'alpaca-issue-tracker' ),           // Title.
		'alpaca_dashboard_widget_render'                    // Display function.
	);
}
add_action( 'wp_dashboard_setup', 'alpaca_add_dashboard_widgets' );

/**
 * Create the function to output the content of our Dashboard Widget.
 */
function alpaca_dashboard_widget_render() {
	$data = alpaca_get_dashboard_widget_data();
	?>
	<div id="alpaca-dashboard-widget" data-props="<?php echo esc_attr( wp_json_encode( $data ) ); ?>"></div>
	<?php
}
