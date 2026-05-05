<?php
/**
 * Alpaca REST API: Comment Permission Filters.
 *
 * @package Alpaca
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register Alpaca's hidden issue comment type with the reusable private comments library.
 */
add_action(
	'init',
	function () {
		\Rareview\PrivateComments\hide_type( 'issuecomment', true );
	}
);

/**
 * Provide the request parameter used by Alpaca to include hidden comments.
 *
 * @return string Request parameter name.
 */
add_filter(
	'alpaca_private_comments_rest_visibility_param',
	function () {
		return 'alpaca_include_hidden_comments';
	}
);

/**
 * Allow authorized Alpaca users to view hidden issue comments.
 *
 * @param bool   $can_view Whether the current user can view the hidden type.
 * @param string $type     Hidden comment type.
 * @return bool Updated visibility decision.
 */
add_filter(
	'alpaca_private_comments_user_can_view_type',
	function ( $can_view, $type ) {
		if ( 'issuecomment' !== $type ) {
			return $can_view;
		}

		return $can_view
			|| \Alpaca\Inc\Helpers::user_can( 'watchlist' )
			|| \Alpaca\Inc\Helpers::user_can( 'create_issue' );
	},
	10,
	2
);

/**
 * Allow Contributors to interact with Alpaca issue comments via core REST endpoints.
 *
 * - Adjust permission callbacks for the core `/wp/v2/comments` route when
 *   `comment_type=issuecomment` so Contributors can list/create issue comments.
 * - Force-approve issue comments server-side to avoid REST field-level capability
 *   rejections when the client requests `status=approve`.
 */
add_filter(
	'rest_endpoints',
	function ( $endpoints ) {
		$can_view_issuecomment = static function () {
			return \Rareview\PrivateComments\user_can_view_type( 'issuecomment' );
		};

		if ( empty( $endpoints['/wp/v2/comments'] ) ) {
			$collection_routes = array();
		} else {
			$collection_routes = $endpoints['/wp/v2/comments'];
		}

		foreach ( $collection_routes as $idx => $route ) {
			$methods            = isset( $route['methods'] ) ? $route['methods'] : '';
			$methods_normalized = is_array( $methods ) ? $methods : explode( ',', (string) $methods );

			// Only patch collection-level routes (POST for create, GET for list).
			if ( in_array( 'POST', $methods_normalized, true ) || in_array( 'GET', $methods_normalized, true ) ) {
				$original = $route['permission_callback'] ?? null;

				$endpoints['/wp/v2/comments'][ $idx ]['permission_callback'] = function ( $request ) use ( $original, $can_view_issuecomment ) {
					$comment_type = (string) $request->get_param( 'comment_type' );

					// If this is an Alpaca issue comment, allow based on our helper.
					if ( 'issuecomment' === $comment_type ) {
						// Allow listing/creating issue comments for Contributors by default.
						if ( $can_view_issuecomment() ) {
							return true;
						}
					}

					// Fall back to original permission callback if present.
					if ( is_callable( $original ) ) {
						return call_user_func( $original, $request );
					}

					return false;
				};
			}
		}

		if ( ! empty( $endpoints['/wp/v2/comments/(?P<id>[\\d]+)'] ) ) {
			foreach ( $endpoints['/wp/v2/comments/(?P<id>[\\d]+)'] as $idx => $route ) {
				$methods            = isset( $route['methods'] ) ? $route['methods'] : '';
				$methods_normalized = is_array( $methods ) ? $methods : explode( ',', (string) $methods );

				if ( ! in_array( 'GET', $methods_normalized, true ) ) {
					continue;
				}

				$original = $route['permission_callback'] ?? null;

				$endpoints['/wp/v2/comments/(?P<id>[\\d]+)'][ $idx ]['permission_callback'] =
					function ( $request ) use ( $original ) {

						$comment_id = (int) $request->get_param( 'id' );
						$comment    = $comment_id > 0 ? get_comment( $comment_id ) : null;

						if ( $comment instanceof WP_Comment && 'issuecomment' === $comment->comment_type ) {
							return \Rareview\PrivateComments\should_allow_rest_override( 'issuecomment' );
						}

						if ( is_callable( $original ) ) {
							return call_user_func( $original, $request );
						}

						return false;
					};
			}
		}

		return $endpoints;
	},
	10,
	1
);

/**
 * Intercept POST requests to the core comments endpoint for Alpaca issue comments.
 *
 * The Core REST controller throws a 403 if 'status' is provided but the user lacks 'moderate_comments'.
 * We work around this by stripping the 'status' param from the request here, allowing the
 * request to proceed to the controller. We then enforce the status via `pre_comment_approved`.
 */
add_filter(
	'rest_pre_dispatch',
	function ( $result, $server, $request ) {
		if ( 'POST' !== $request->get_method() ) {
			return $result;
		}
		if ( '/wp/v2/comments' !== $request->get_route() ) {
			return $result;
		}

		// Check if this is an issue comment.
		$comment_type = (string) $request->get_param( 'comment_type' );
		if ( 'issuecomment' !== $comment_type ) {
			return $result;
		}

		// If the user can create an issue, let them create the comment without manual status assignment.
		// This prevents the controller from checking for 'moderate_comments' capability.
		if ( \Alpaca\Inc\Helpers::user_can( 'create_issue' ) ) {
			// Disable flood control for automated system comments.
			remove_action( 'check_comment_flood', 'check_comment_flood_db' );

			$params = $request->get_json_params();
			if ( isset( $params['status'] ) ) {
				unset( $params['status'] );
				$request->set_body_params( $params );
			}
			// Also unset if sent as a standard param (though JS usually sends JSON).
			if ( isset( $request['status'] ) ) {
				$request->offsetUnset( 'status' );
			}
		}

		return $result;
	},
	10,
	3
);

/**
 * Force-approve Alpaca issue comments for authorized users.
 *
 * This handles the approval logic centrally, ensuring comments are live immediately
 * even though we stripped the 'status' param in the REST request.
 */
add_filter(
	'pre_comment_approved',
	function ( $approved, $commentdata ) {
		if ( isset( $commentdata['comment_type'] ) && 'issuecomment' === $commentdata['comment_type'] ) {
			if ( \Alpaca\Inc\Helpers::user_can( 'create_issue' ) ) {
				return 1;
			}
		}
		return $approved;
	},
	10,
	2
);
