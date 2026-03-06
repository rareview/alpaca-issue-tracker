<?php
/**
 * Helpers class.
 *
 * @package Alpaca
 */

namespace Alpaca\Inc;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Helpers
 */
class Helpers {

	/**
	 * Plugin version.
	 *
	 * @return string
	 */
	public static function version() {
		return '1.0.0-beta';
	}

	/**
	 * Get asset URL.
	 *
	 * @param string $file Relative path to file.
	 * @return string Full URL.
	 */
	public static function asset_url( $file ) {
		return \plugins_url( $file, \dirname( __DIR__ ) . '/alpaca.php' );
	}

	/**
	 * Centralized permission check for Alpaca actions.
	 *
	 * This allows filtering of permission decisions via the
	 * `alpaca_user_can` filter. Plugins or themes can override
	 * behavior by hooking into that filter and returning a boolean.
	 *
	 * @param string $action Action name identifier.
	 * @param array  $args   Optional context (e.g. post_id).
	 * @return bool True when current user is allowed, false otherwise.
	 */
	public static function user_can( $action, $args = array() ) {
		$action = is_string( $action ) ? $action : '';
		$args   = is_array( $args ) ? $args : array();

		// Default decision for common actions.
		switch ( $action ) {
			case 'view_board':
			case 'get_issue':
			case 'comment_count':
			case 'list_users':
			case 'presence':
			case 'watchlist':
			case 'get_statuses':
				// Allow any logged-in user with basic read/edit capability (Contributor+).
				$allowed = \current_user_can( 'edit_posts' );
				break;

			case 'create_issue':
			case 'update_issue':
			case 'update_board':
			case 'update_status':
			case 'watchlist_toggle':
			case 'register_comment_meta':
				// Contributors should be able to perform these by default.
				$allowed = \current_user_can( 'edit_posts' );
				break;

			case 'delete_post':
				$post_id = isset( $args['post_id'] ) ? (int) $args['post_id'] : 0;
				$allowed = $post_id > 0 ? \current_user_can( 'delete_post', $post_id ) : false;
				break;

			case 'manage_options':
			case 'options_update':
			case 'restore_statuses':
				$allowed = \current_user_can( 'manage_options' );
				break;

			default:
				// Conservative default: require edit_posts.
				$allowed = \current_user_can( 'edit_posts' );
				break;
		}

		/**
		 * Filter Alpaca permission checks.
		 *
		 * @param bool   $allowed Whether the current user is allowed.
		 * @param string $action  Action identifier.
		 * @param array  $args    Contextual args (post_id etc.).
		 */
		return (bool) apply_filters( 'alpaca_user_can', $allowed, $action, $args );
	}

	/**
	 * Validate a REST request against an optional Alpaca capability and WP REST nonce.
	 *
	 * @param \WP_REST_Request $request           REST request object.
	 * @param string           $capability_action Optional. Action name passed to user_can().
	 * @param array            $capability_args   Optional. Context passed to user_can().
	 * @return true|\WP_Error True when valid, WP_Error otherwise.
	 */
	public static function validate_rest_nonce_permission( \WP_REST_Request $request, $capability_action = '', $capability_args = array() ) {
		$capability_action = is_string( $capability_action ) ? trim( $capability_action ) : '';
		$capability_args   = is_array( $capability_args ) ? $capability_args : array();

		if ( '' !== $capability_action && ! self::user_can( $capability_action, $capability_args ) ) {
			return new \WP_Error(
				'rest_forbidden',
				esc_html__( 'You are not allowed to access this endpoint.', 'alpaca' ),
				array( 'status' => 403 )
			);
		}

		$nonce = (string) $request->get_param( 'nonce' );
		if ( '' === $nonce ) {
			$nonce = (string) $request->get_header( 'X-WP-Nonce' );
		}

		if ( '' === $nonce || ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
			return new \WP_Error(
				'rest_forbidden',
				esc_html__( 'Invalid nonce.', 'alpaca' ),
				array( 'status' => 401 )
			);
		}

		return true;
	}
}
