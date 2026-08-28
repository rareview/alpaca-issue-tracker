<?php
/**
 * Project Board block registration and rendering.
 *
 * @package AlpacaIssueTracker
 */

namespace AlpacaIssueTracker;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Registers the dynamic Project Board block.
 */
class Project_Board_Block {

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
		$script_handle       = 'alpaca-project-board-editor';
		$editor_style_handle = 'alpaca-project-board-editor';
		$view_script_handle  = 'alpaca-project-board-view';
		wp_register_script(
			$script_handle,
			Helpers::asset_url( 'dist/project-board-editor.js' ),
			[
				'wp-api-fetch',
				'wp-block-editor',
				'wp-blocks',
				'wp-components',
				'wp-element',
				'wp-i18n',
			],
			Helpers::version(),
			true
		);

		wp_set_script_translations(
			$script_handle,
			'alpaca-issue-tracker',
			ALPAISTR_PLUGIN_DIR . 'languages'
		);

		wp_register_style(
			$editor_style_handle,
			Helpers::asset_url( 'dist/scss/project-board-editor.css' ),
			[],
			Helpers::version()
		);

		wp_register_script(
			$view_script_handle,
			Helpers::asset_url( 'dist/frontend-board.js' ),
			[
				'wp-api-fetch',
				'wp-components',
				'wp-dom-ready',
				'wp-element',
				'wp-hooks',
				'wp-i18n',
			],
			Helpers::version(),
			true
		);

		wp_register_style(
			'alpaca-project-board-view',
			Helpers::asset_url( 'dist/frontend-board.css' ),
			[ 'wp-components' ],
			Helpers::version()
		);

		register_block_type(
			ALPAISTR_PLUGIN_DIR . 'blocks/project-board',
			[
				'render_callback' => [ $this, 'render' ],
			]
		);
	}

	/**
	 * Render a protected Project Board block.
	 *
	 * The access boundary is evaluated before any board data or interactive
	 * controls are exposed on a frontend page.
	 *
	 * @param array<string, mixed> $attributes Block attributes.
	 * @param string               $content    Saved block content.
	 * @param \WP_Block            $block      Block instance.
	 * @return string Block markup.
	 */
	public function render( $attributes, $content, $block ) {
		unset( $content );

		$context = [
			'attributes' => is_array( $attributes ) ? $attributes : [],
			'post_id'    => isset( $block->context['postId'] ) ? (int) $block->context['postId'] : 0,
		];

		if ( ! is_user_logged_in() ) {
			$redirect_url = get_permalink( $context['post_id'] );
			if ( ! is_string( $redirect_url ) || '' === $redirect_url ) {
				$redirect_url = home_url( '/' );
			}

			return sprintf(
				'<div %1$s><p>%2$s</p><p><a href="%3$s">%4$s</a></p></div>',
				get_block_wrapper_attributes( [ 'class' => 'alpaca-project-board-login-required' ] ),
				esc_html__( 'You must be logged in to view this project board.', 'alpaca-issue-tracker' ),
				esc_url( wp_login_url( $redirect_url ) ),
				esc_html__( 'Log in', 'alpaca-issue-tracker' )
			);
		}

		if ( ! Helpers::user_can( 'view_frontend_board', $context ) ) {
			return sprintf(
				'<div %1$s><p>%2$s</p></div>',
				get_block_wrapper_attributes( [ 'class' => 'alpaca-project-board-access-denied' ] ),
				esc_html__( 'You do not have permission to view this project board.', 'alpaca-issue-tracker' )
			);
		}

		$instance_id = wp_unique_id( 'alpaca-project-board-' );
		$board_data  = alpaistr_get_board_data();
		$appearance  = isset( $context['attributes']['appearance'] ) ? $context['attributes']['appearance'] : 'auto';
		$status_ids  = isset( $context['attributes']['statusIds'] ) && is_array( $context['attributes']['statusIds'] )
			? array_filter( array_map( 'intval', $context['attributes']['statusIds'] ) )
			: [];

		if ( ! in_array( $appearance, [ 'auto', 'light', 'dark' ], true ) ) {
			$appearance = 'auto';
		}

		if ( ! empty( $status_ids ) ) {
			$board_data = array_values(
				array_filter(
					$board_data,
					static function ( $column ) use ( $status_ids ) {
						return is_array( $column ) && isset( $column['id'] ) && in_array( (int) $column['id'], $status_ids, true );
					}
				)
			);
		}

		wp_enqueue_script( 'alpaca-project-board-view' );
		wp_enqueue_style( 'alpaca-project-board-view' );

		wp_add_inline_script(
			'alpaca-project-board-view',
			'window.alpaistrApiSettings = ' . wp_json_encode(
				[
					'hasCustomRoot' => true,
					'nonce'         => wp_create_nonce( 'wp_rest' ),
					'root'          => esc_url_raw( rest_url() ),
				]
			) . ';',
			'before'
		);

		wp_add_inline_script(
			'alpaca-project-board-view',
			'window.alpaistrFrontendBoards = window.alpaistrFrontendBoards || {}; window.alpaistrFrontendBoards[' . wp_json_encode( $instance_id ) . '] = ' . wp_json_encode(
				[
					'boardData'   => $board_data,
					'datapoints'  => isset( $context['attributes']['datapoints'] ) && is_array( $context['attributes']['datapoints'] ) ? $context['attributes']['datapoints'] : [],
					'showFilters' => ! isset( $context['attributes']['showFilters'] ) || (bool) $context['attributes']['showFilters'],
					'showSearch'  => ! isset( $context['attributes']['showSearch'] ) || (bool) $context['attributes']['showSearch'],
				]
			) . ';',
			'before'
		);

		return sprintf(
			'<div %1$s data-alpaca-project-board="%2$s" data-alpaca-appearance="%3$s"><div class="alpaca-project-board-controls" id="%4$s-controls"><div class="alpaca-project-board-presence" id="%4$s-presence"></div><div class="alpaca-project-board-controls-mount" id="%4$s-controls-mount"></div></div><div id="%4$s-board"></div></div>',
			get_block_wrapper_attributes( [ 'class' => 'alpaca-project-board' ] ),
			esc_attr( $instance_id ),
			esc_attr( $appearance ),
			esc_attr( $instance_id )
		);
	}
}
