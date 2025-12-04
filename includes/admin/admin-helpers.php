<?php
/**
 * Admin helpers for issue post type customization.
 *
 * @package Alpaca
 */

/**
 * Remove Quick Edit actions from issue post row.
 *
 * @param array $actions Post row actions.
 * @return array Filtered post row actions.
 */
function alpaca_remove_quickedit_actions( $actions ) {
	if ( in_array(
		get_post_type(),
		array(
			'alpaca_issue',
		),
		true
	) ) {
		unset( $actions['inline hide-if-no-js'] );
	}
	return $actions;
}
add_filter( 'post_row_actions', 'alpaca_remove_quickedit_actions', 10, 1 );

/**
 * Redirect to board on issue save.
 *
 * @param string $location Redirect location.
 * @return string The location to redirect to.
 */
function alpaca_redirect_to_board_on_save( $location ) {
	if ( 'alpaca_issue' === get_post_type() ) {
		// phpcs:ignore WordPress.Security.NonceVerification.Missing
		if ( isset( $_POST['save'] ) || isset( $_POST['publish'] ) ) {
			return admin_url( 'edit.php?post_type=alpaca_issue&page=alpaca-board' );
		}
	}
	return $location;
}
add_filter( 'redirect_post_location', 'alpaca_redirect_to_board_on_save' );

/**
 * Add metabox to issue post type if screenshot exists.
 */
function alpaca_add_metabox_to_issue() {
	global $post;
	if ( ! $post || 'alpaca_issue' !== $post->post_type ) {
		return;
	}
	$screenshot = get_post_meta( $post->ID, 'alpaca_screenshot', true );
	if ( $screenshot ) {
		add_meta_box(
			'alpaca_screenshot_metabox',
			esc_html__( 'Screenshot', 'alpaca' ),
			'alpaca_screenshot_metabox_callback',
			'alpaca_issue',
			'side',
			'high'
		);
	}
}
add_action( 'add_meta_boxes', 'alpaca_add_metabox_to_issue' );

/**
 * Render screenshot metabox callback.
 *
 * @param WP_Post $post Post object.
 */
function alpaca_screenshot_metabox_callback( $post ) {
	$screenshot = get_post_meta( $post->ID, 'alpaca_screenshot', true );
	?>
	<div class="screenshot"><img src="<?php echo esc_url( $screenshot ); ?>" alt="Screenshot" /></div>
	<p><em>Warning: may not be 100% faithful.</em></p>
	<?php
}
