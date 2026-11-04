<?php
/**
 * Helpers class.
 *
 * @package AlpacaIssueTracker
 */

namespace AlpacaIssueTracker;

use WP_Error;
use WP_REST_Request;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Helpers
 */
class Helpers {

	/**
	 * Default label color.
	 *
	 * @var string
	 */
	const DEFAULT_LABEL_COLOR = '#172b4d';

	/**
	 * Permission thresholds, ordered from the lowest to highest standard role.
	 *
	 * @var array<string, string>
	 */
	private const ROLE_CAPABILITIES = [
		'subscriber'    => 'read',
		'contributor'   => 'edit_posts',
		'author'        => 'publish_posts',
		'editor'        => 'edit_others_posts',
		'administrator' => 'manage_options',
	];

	/**
	 * Default minimum roles for configurable permissions.
	 *
	 * @return array<string, string>
	 */
	public static function get_permission_defaults() {
		return [
			'view_board'                => 'subscriber',
			'create_issue'              => 'contributor',
			'edit_issue'                => 'contributor',
			'add_comment'               => 'subscriber',
			'edit_comment'              => 'contributor',
			'change_issue_status'       => 'contributor',
			'change_final_issue_status' => 'contributor',
		];
	}

	/**
	 * Get all registered WordPress roles.
	 *
	 * @return array<string, array<string, bool>> Registered role definitions.
	 */
	private static function get_registered_roles() {
		if ( ! function_exists( 'wp_roles' ) ) {
			return [];
		}

		$roles = wp_roles()->roles;

		return is_array( $roles ) ? $roles : [];
	}

	/**
	 * Sanitize configurable permission thresholds.
	 *
	 * @param mixed $value Submitted permission settings.
	 * @return array<string, string> Sanitized settings with defaults.
	 */
	public static function sanitize_permissions( $value ) {
		$defaults         = self::get_permission_defaults();
		$registered_roles = self::get_registered_roles();
		$value            = is_array( $value ) ? $value : [];
		$clean            = [];

		foreach ( $defaults as $permission => $default_role ) {
			$role = isset( $value[ $permission ] ) && is_string( $value[ $permission ] )
				? strtolower( sanitize_key( $value[ $permission ] ) )
				: '';

			$is_registered_role   = isset( self::ROLE_CAPABILITIES[ $role ] ) || isset( $registered_roles[ $role ] );
			$clean[ $permission ] = $is_registered_role
				? $role
				: $default_role;
		}

		return $clean;
	}

	/**
	 * Get saved permission thresholds, filling in defaults for existing installs.
	 *
	 * @return array<string, string> Permission settings.
	 */
	public static function get_permissions() {
		return self::sanitize_permissions( get_option( 'alpaistr_permissions', [] ) );
	}

	/**
	 * Select the status-change permission for a destination status.
	 *
	 * @param int        $status_id Destination status ID.
	 * @param array|null $statuses  Optional ordered status terms for testing or reuse.
	 * @return string Permission action for the status change.
	 */
	public static function get_status_change_permission_action( $status_id, $statuses = null ) {
		if ( null === $statuses && function_exists( 'alpaistr_get_statuses' ) ) {
			$statuses = alpaistr_get_statuses( 'DESC' );
		}

		$status_ids = is_array( $status_id ) ? array_map( 'absint', $status_id ) : [ (int) $status_id ];
		$statuses   = is_array( $statuses ) ? $statuses : [];
		$final_id   = ! empty( $statuses ) ? (int) $statuses[0]->term_id : 0;

		return $final_id > 0 && in_array( $final_id, $status_ids, true )
			? 'change_final_issue_status'
			: 'change_issue_status';
	}

	/**
	 * Check whether the current user meets a minimum role threshold.
	 *
	 * @param string $permission Permission setting key.
	 * @return bool Whether the user meets the threshold.
	 */
	private static function user_can_minimum_role( $permission ) {
		$permissions  = self::get_permissions();
		$minimum_role = isset( $permissions[ $permission ] ) ? $permissions[ $permission ] : 'contributor';

		if ( isset( self::ROLE_CAPABILITIES[ $minimum_role ] ) ) {
			return current_user_can( self::ROLE_CAPABILITIES[ $minimum_role ] );
		}

		$minimum_role_object = function_exists( 'get_role' ) ? get_role( $minimum_role ) : null;
		if ( ! is_object( $minimum_role_object ) || ! isset( $minimum_role_object->capabilities ) || ! is_array( $minimum_role_object->capabilities ) ) {
			return current_user_can( self::ROLE_CAPABILITIES['contributor'] );
		}

		$current_user = function_exists( 'wp_get_current_user' ) ? wp_get_current_user() : null;
		$user_roles   = is_object( $current_user ) && isset( $current_user->roles ) && is_array( $current_user->roles )
			? $current_user->roles
			: [];

		if ( in_array( $minimum_role, $user_roles, true ) ) {
			return true;
		}

		$user_capabilities     = is_object( $current_user ) && isset( $current_user->allcaps ) && is_array( $current_user->allcaps )
			? $current_user->allcaps
			: [];
		$required_capabilities = array_keys( array_filter( $minimum_role_object->capabilities ) );

		if ( empty( $required_capabilities ) ) {
			return false;
		}

		foreach ( $required_capabilities as $capability ) {
			if ( empty( $user_capabilities[ $capability ] ) ) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Plugin version.
	 *
	 * @return string
	 */
	public static function version() {
		if ( defined( 'ALPAISTR_VERSION' ) ) {
			return ALPAISTR_VERSION;
		}

		return '';
	}

	/**
	 * Get asset URL.
	 *
	 * @param string $file Relative path to file.
	 * @return string Full URL.
	 */
	public static function asset_url( $file ) {
		return plugins_url( $file, dirname( __DIR__ ) . '/alpacaissuetracker.php' );
	}

	/**
	 * Centralized permission check for Alpaca Issue Tracker actions.
	 *
	 * This allows filtering of permission decisions via the
	 * `alpaca_user_can` filter. Plugins or themes can override
	 * behavior by hooking into that filter and returning a boolean.
	 *
	 * @param string $action Action name identifier.
	 * @param array  $args   Optional context (e.g. post_id).
	 * @return bool True when current user is allowed, false otherwise.
	 */
	public static function user_can( $action, $args = [] ) {
		$action = is_string( $action ) ? $action : '';
		$args   = is_array( $args ) ? $args : [];

		// Default decision for common actions.
		switch ( $action ) {
			case 'view_board':
			case 'get_issue':
			case 'comment_count':
			case 'list_users':
			case 'presence':
			case 'watchlist':
			case 'get_statuses':
				$allowed = self::user_can_minimum_role( 'view_board' );
				break;
			case 'create_issue':
				$allowed = self::user_can_minimum_role( 'create_issue' );
				break;
			case 'edit_issue':
			case 'update_issue':
				$allowed = self::user_can_minimum_role( 'edit_issue' );
				break;
			case 'add_comment':
				$allowed = self::user_can_minimum_role( 'add_comment' );
				break;
			case 'edit_comment':
				$allowed = self::user_can_minimum_role( 'edit_comment' );
				break;
			case 'change_issue_status':
				$allowed = self::user_can_minimum_role( 'change_issue_status' );
				break;
			case 'change_final_issue_status':
				$allowed = self::user_can_minimum_role( 'change_final_issue_status' );
				break;
			case 'register_comment_meta':
				$allowed = self::user_can( 'add_comment' ) || self::user_can( 'edit_comment' );
				break;
			case 'notification_preferences':
			case 'notification_inbox':
				$allowed = current_user_can( 'edit_posts' );
				break;
			case 'update_board':
			case 'watchlist_toggle':
				// Contributors should be able to perform these by default.
				$allowed = current_user_can( 'edit_posts' );
				break;

			case 'delete_post':
				$post_id = isset( $args['post_id'] ) ? (int) $args['post_id'] : 0;
				$allowed = $post_id > 0 ? current_user_can( 'delete_post', $post_id ) : false;
				break;
			case 'delete_issue':
				// Restrict issue deletion by default while keeping it filterable for custom roles.
				$allowed = current_user_can( 'manage_options' );
				break;

			case 'manage_options':
			case 'options_update':
			case 'notification_template_manage':
			case 'restore_statuses':
			case 'update_status':
				$allowed = current_user_can( 'manage_options' );
				break;
			default:
				// Conservative default: require edit_posts.
				$allowed = current_user_can( 'edit_posts' );
				break;
		}

		/**
		 * Filter Alpaca Issue Tracker permission checks.
		 *
		 * @param bool   $allowed Whether the current user is allowed.
		 * @param string $action  Action identifier.
		 * @param array  $args    Contextual args (post_id etc.).
		 */
		return (bool) apply_filters( 'alpaca_user_can', $allowed, $action, $args );
	}

	/**
	 * Validate a REST request against an optional Alpaca Issue Tracker capability and WP REST nonce.
	 *
	 * The `wp_rest` nonce is enforced only for cookie-authenticated requests, matching
	 * WordPress Core's `rest_cookie_check_errors()` behavior. Application Passwords,
	 * OAuth, JWT, and other non-cookie authentication methods do not send a nonce.
	 *
	 * @param WP_REST_Request $request           REST request object.
	 * @param string          $capability_action Optional. Action name passed to user_can().
	 * @param array           $capability_args   Optional. Context passed to user_can().
	 * @return true|WP_Error True when valid, WP_Error otherwise.
	 */
	public static function validate_rest_nonce_permission( WP_REST_Request $request, $capability_action = '', $capability_args = [] ) {
		$capability_action = is_string( $capability_action ) ? trim( $capability_action ) : '';
		$capability_args   = is_array( $capability_args ) ? $capability_args : [];

		if ( '' !== $capability_action && ! self::user_can( $capability_action, $capability_args ) ) {
			return new WP_Error(
				'rest_forbidden',
				esc_html__( 'You are not allowed to access this endpoint.', 'alpaca-issue-tracker' ),
				[ 'status' => 403 ]
			);
		}

		if ( self::rest_request_used_cookie_auth() ) {
			$nonce = (string) $request->get_param( 'nonce' );
			if ( '' === $nonce ) {
				$nonce = (string) $request->get_header( 'X-WP-Nonce' );
			}

			if ( '' === $nonce || ! wp_verify_nonce( $nonce, 'wp_rest' ) ) {
				return new WP_Error(
					'rest_forbidden',
					esc_html__( 'Invalid nonce.', 'alpaca-issue-tracker' ),
					[ 'status' => 401 ]
				);
			}
		}

		return true;
	}

	/**
	 * Determine whether the current REST request was authenticated via a login cookie.
	 *
	 * When REST cookie authentication succeeds, Core sets the `$wp_rest_auth_cookie`
	 * global to `true` in `rest_cookie_collect_status()`. Application Passwords, OAuth,
	 * JWT, and unauthenticated requests leave the global unset or set to a `WP_Error`.
	 *
	 * @return bool True when the request authenticated via a login cookie.
	 */
	private static function rest_request_used_cookie_auth() {
		global $wp_rest_auth_cookie;

		return true === $wp_rest_auth_cookie;
	}
}
