<?php
/**
 * Inbox block registration and rendering.
 *
 * @package AlpacaIssueTracker
 */

namespace AlpacaIssueTracker;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers the dynamic Inbox block.
 */
class Inbox_Block {

	/**
	 * Constructor.
	 */
	public function __construct() {
		add_action( 'init', [ $this, 'register' ] );
	}

	/**
	 * Register the block metadata and dynamic renderer.
	 *
	 * @return void
	 */
	public function register() {
		wp_register_style(
			'alpaca-project-board-editor',
			Helpers::asset_url( 'dist/scss/project-board-editor.css' ),
			[],
			Helpers::version()
		);

		wp_register_script(
			'alpaca-inbox-editor',
			Helpers::asset_url( 'dist/inbox-editor.js' ),
			[
				'wp-block-editor',
				'wp-blocks',
				'wp-element',
				'wp-i18n',
			],
			Helpers::version(),
			true
		);

		wp_set_script_translations(
			'alpaca-inbox-editor',
			'alpaca-issue-tracker',
			ALPAISTR_PLUGIN_DIR . 'languages'
		);

		wp_register_script(
			'alpaca-inbox-view',
			Helpers::asset_url( 'dist/frontend-inbox.js' ),
			[
				'wp-api-fetch',
				'wp-components',
				'wp-element',
				'wp-hooks',
				'wp-i18n',
			],
			Helpers::version(),
			true
		);

		wp_register_style(
			'alpaca-inbox-view',
			Helpers::asset_url( 'dist/frontend-inbox.css' ),
			[ 'wp-components' ],
			Helpers::version()
		);

		register_block_type(
			ALPAISTR_PLUGIN_DIR . 'blocks/inbox',
			[
				'render_callback' => [ $this, 'render' ],
			]
		);
	}

	/**
	 * Render a protected Inbox block.
	 *
	 * @param array<string, mixed> $attributes Block attributes.
	 * @param string               $content    Saved block content.
	 * @param \WP_Block            $block      Block instance.
	 * @return string Block markup.
	 */
	public function render( $attributes, $content, $block ) {
		unset( $attributes, $content, $block );

		if ( ! is_user_logged_in() ) {
			return sprintf(
				'<div %1$s><p>%2$s</p></div>',
				get_block_wrapper_attributes( [ 'class' => 'alpaca-inbox-login-required' ] ),
				esc_html__( 'You must be logged in to view the Inbox.', 'alpaca-issue-tracker' )
			);
		}

		if ( ! Helpers::user_can( 'notification_inbox' ) ) {
			return sprintf(
				'<div %1$s><p>%2$s</p></div>',
				get_block_wrapper_attributes( [ 'class' => 'alpaca-inbox-access-denied' ] ),
				esc_html__( 'You do not have permission to view the Inbox.', 'alpaca-issue-tracker' )
			);
		}

		wp_enqueue_script( 'alpaca-inbox-view' );
		wp_enqueue_style( 'alpaca-inbox-view' );
		$instance_id = wp_unique_id( 'alpaca-inbox-' );

		return sprintf(
			'<div %1$s id="%2$s" data-alpaca-inbox="true"></div>',
			get_block_wrapper_attributes( [ 'class' => 'alpaca-inbox' ] ),
			esc_attr( $instance_id )
		);
	}
}