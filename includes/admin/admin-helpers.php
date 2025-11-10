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
function remove_quickedit_actions( $actions ) {
	if ( in_array(
		get_post_type(),
		array(
			'issue',
		),
		true
	) ) {
		unset( $actions['inline hide-if-no-js'] );
	}
	return $actions;
}
add_filter( 'post_row_actions', 'remove_quickedit_actions', 10, 1 );

/**
 * Redirect to board on issue save.
 *
 * @param string $location Redirect location.
 * @return string The location to redirect to.
 */
function redirect_to_board_on_save( $location ) {
	if ( 'issue' === get_post_type() ) {
		// phpcs:ignore WordPress.Security.NonceVerification.Missing
		if ( isset( $_POST['save'] ) || isset( $_POST['publish'] ) ) {
			return admin_url( 'edit.php?post_type=issue&page=board.php' );
		}
	}
	return $location;
}

/**
 * Add metabox to issue post type if screenshot exists.
 */
function add_metabox_to_issue() {
	global $post;
	if ( ! $post || 'issue' !== $post->post_type ) {
		return;
	}
	$screenshot = get_post_meta( $post->ID, 'screenshot', true );
	if ( $screenshot ) {
		add_meta_box(
			'alpaca_screenshot_metabox',
			esc_html__( 'Screenshot', 'alpaca' ),
			'alpaca_screenshot_metabox_callback',
			'issue',
			'side',
			'high'
		);
	}
}
add_action( 'add_meta_boxes', 'add_metabox_to_issue' );

/**
 * Render screenshot metabox callback.
 *
 * @param WP_Post $post Post object.
 */
function alpaca_screenshot_metabox_callback( $post ) {
	$screenshot = get_post_meta( $post->ID, 'screenshot', true );
	?>
	<div class="screenshot"><img src="<?php echo esc_url( $screenshot ); ?>" alt="Screenshot" /></div>
	<p><em>Warning: may not be 100% faithful.</em></p>
	<?php
}
