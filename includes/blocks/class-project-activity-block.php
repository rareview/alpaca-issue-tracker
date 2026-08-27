<?php
/**
 * Project Activity block registration and rendering.
 *
 * @package AlpacaIssueTracker
 */

namespace AlpacaIssueTracker;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers the dynamic Project Activity block.
 */
class Project_Activity_Block {

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
			'alpaca-project-activity-editor',
			Helpers::asset_url( 'dist/project-activity-editor.js' ),
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
			'alpaca-project-activity-editor',
			'alpaca-issue-tracker',
			ALPAISTR_PLUGIN_DIR . 'languages'
		);

		wp_register_script(
			'alpaca-project-activity-view',
			Helpers::asset_url( 'dist/frontend-activity.js' ),
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
			'alpaca-project-activity-view',
			Helpers::asset_url( 'dist/frontend-activity.css' ),
			[ 'wp-components' ],
			Helpers::version()
		);

		register_block_type(
			ALPAISTR_PLUGIN_DIR . 'blocks/project-activity',
			[
				'render_callback' => [ $this, 'render' ],
			]
		);
	}

	/**
	 * Render a protected compact Project Activity block.
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
				get_block_wrapper_attributes( [ 'class' => 'alpaca-project-activity-login-required' ] ),
				esc_html__( 'You must be logged in to view project activity.', 'alpaca-issue-tracker' )
			);
		}

		if ( ! Helpers::user_can( 'view_project_activity' ) ) {
			return sprintf(
				'<div %1$s><p>%2$s</p></div>',
				get_block_wrapper_attributes( [ 'class' => 'alpaca-project-activity-access-denied' ] ),
				esc_html__( 'You do not have permission to view project activity.', 'alpaca-issue-tracker' )
			);
		}

		wp_enqueue_script( 'alpaca-project-activity-view' );
		wp_enqueue_style( 'alpaca-project-activity-view' );
		$instance_id = wp_unique_id( 'alpaca-project-activity-' );

		return sprintf(
			'<div %1$s data-alpaca-project-activity="%2$s"></div>',
			get_block_wrapper_attributes( [ 'class' => 'alpaca-project-activity' ] ),
			esc_attr( $instance_id )
		);
	}
}
