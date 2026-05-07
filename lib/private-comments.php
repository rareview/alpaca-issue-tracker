<?php
/**
 * Functionality to hide and manage private comment types.
 *
 * @package Alpaca
 */

namespace Alpaca;

use WP_Comment_Query;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Add the "Comment Type" column to the Comments screen.
 */
add_filter(
	'manage_edit-comments_columns',
	function ( $columns ) {
		$where          = array_slice( $columns, 0, 2, true );
		$new_column     = [
			'comment_type' => 'Type',
		];
		$after_columns  = array_slice( $columns, 2, null, true );
		$sorted_columns = array_merge( $where, $new_column, $after_columns );

		return $sorted_columns;
	}
);

/**
 * Populate the "Comment Type" column with data.
 */
add_action(
	'manage_comments_custom_column',
	function ( $column, $post_id ) {
		if ( 'comment_type' === $column ) {
			$comment = get_comment( $post_id );
			echo esc_html( $comment->comment_type ? $comment->comment_type : '—' );
		}
	},
	10,
	2
);

/**
 * Get a normalized request parameter value.
 *
 * @param string $key Request parameter key.
 * @return string Normalized request parameter value.
 */
function get_request_param( $key ) {
	if ( ! is_string( $key ) || '' === $key ) {
		return '';
	}

	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only inspection for request routing.
	if ( ! isset( $_REQUEST[ $key ] ) || is_array( $_REQUEST[ $key ] ) ) {
		return '';
	}

	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only inspection for request routing.
	return sanitize_text_field( wp_unslash( (string) $_REQUEST[ $key ] ) );
}

/**
 * Determine whether the current request asks to include hidden comments.
 *
 * Projects may provide the request parameter name via the
 * `alpaca_private_comments_rest_visibility_param` filter.
 *
 * @return bool Whether the current request asks to include hidden comments.
 */
function is_rest_override_requested() {
	$override_param = apply_filters( 'alpaca_private_comments_rest_visibility_param', '' );

	if ( ! is_string( $override_param ) || '' === $override_param ) {
		return false;
	}

	return '1' === get_request_param( $override_param );
}

/**
 * Determine whether a request value targets the given comment type.
 *
 * @param mixed  $requested_value Raw request value.
 * @param string $type            Hidden comment type.
 * @return bool Whether the request value targets the comment type.
 */
function value_targets_type( $requested_value, $type ) {
	if ( is_array( $requested_value ) ) {
		foreach ( $requested_value as $requested_type ) {
			if ( value_targets_type( $requested_type, $type ) ) {
				return true;
			}
		}

		return false;
	}

	if ( ! is_scalar( $requested_value ) ) {
		return false;
	}

	$requested_types = array_filter(
		array_map( 'trim', explode( ',', (string) $requested_value ) ),
		'strlen'
	);

	return in_array( $type, $requested_types, true );
}

/**
 * Determine whether the current request explicitly targets a hidden comment type.
 *
 * @param string $type Hidden comment type.
 * @return bool Whether the current request explicitly targets the comment type.
 */
function request_targets_type( $type ) {
	return value_targets_type( get_request_param( 'type' ), $type )
		|| value_targets_type( get_request_param( 'comment_type' ), $type );
}

/**
 * Determine whether a query explicitly targets a hidden comment type.
 *
 * @param string $type       Hidden comment type.
 * @param array  $query_vars Comment query vars.
 * @return bool Whether the query explicitly targets the comment type.
 */
function query_targets_type( $type, $query_vars = [] ) {
	if ( ! is_array( $query_vars ) ) {
		return false;
	}

	$target_keys = [ 'type', 'comment_type', 'type__in' ];

	foreach ( $target_keys as $target_key ) {
		if ( isset( $query_vars[ $target_key ] ) && value_targets_type( $query_vars[ $target_key ], $type ) ) {
			return true;
		}
	}

	return false;
}

/**
 * Get the request-scoped visibility stack for private comment types.
 *
 * @return array<string,int> Visibility stack keyed by comment type.
 */
function &get_visibility_stack() {
	static $visibility_stack = [];

	return $visibility_stack;
}

/**
 * Mark a private comment type as intentionally visible for the current request.
 *
 * @param string $type Hidden comment type.
 * @return void
 */
function mark_type_visible( $type ) {
	$visibility_stack = &get_visibility_stack();

	if ( ! isset( $visibility_stack[ $type ] ) ) {
		$visibility_stack[ $type ] = 0;
	}

	++$visibility_stack[ $type ];
}

/**
 * Clear one visibility mark for a private comment type.
 *
 * @param string $type Hidden comment type.
 * @return void
 */
function unmark_type_visible( $type ) {
	$visibility_stack = &get_visibility_stack();

	if ( empty( $visibility_stack[ $type ] ) ) {
		return;
	}

	--$visibility_stack[ $type ];

	if ( $visibility_stack[ $type ] <= 0 ) {
		unset( $visibility_stack[ $type ] );
	}
}

/**
 * Determine whether a private comment type is intentionally visible right now.
 *
 * @param string $type Hidden comment type.
 * @return bool Whether the type is marked visible.
 */
function is_type_marked_visible( $type ) {
	$visibility_stack = &get_visibility_stack();

	return ! empty( $visibility_stack[ $type ] );
}

/**
 * Determine whether the current user can view a hidden comment type.
 *
 * @param string $type Hidden comment type.
 * @return bool Whether the current user can view the hidden type.
 */
function user_can_view_type( $type ) {
	$can_view = current_user_can( 'moderate_comments' );

	/**
	 * Filter whether the current user can view a hidden comment type.
	 *
	 * @param bool   $can_view Whether the current user can view the type.
	 * @param string $type     Hidden comment type.
	 */
	return (bool) apply_filters( 'alpaca_private_comments_user_can_view_type', $can_view, $type );
}

/**
 * Determine whether the REST visibility override should be allowed.
 *
 * This allows trusted REST callers to opt in to hidden comments only when the
 * request explicitly targets the hidden type in an edit-context route and the
 * current user is allowed to view that type.
 *
 * @param string $type Hidden comment type.
 * @return bool Whether the REST visibility override should be allowed.
 */
function should_allow_rest_override( $type ) {
	if ( ! defined( 'REST_REQUEST' ) || ! REST_REQUEST ) {
		return false;
	}

	if ( ! is_rest_override_requested() ) {
		return false;
	}

	if ( 'edit' !== get_request_param( 'context' ) ) {
		return false;
	}

	if ( ! request_targets_type( $type ) ) {
		return false;
	}

	return user_can_view_type( $type );
}

/**
 * Determine whether a hidden comment type should be suppressed for a query.
 *
 * Explicit server-side queries for the hidden type are allowed. The request
 * override parameter is honored only for trusted REST requests that explicitly
 * target the hidden type.
 *
 * @param string $type       Hidden comment type.
 * @param array  $query_vars Comment query vars.
 * @return bool Whether the type should be hidden.
 */
function should_hide_type( $type, $query_vars = [] ) {
	$targets_type = query_targets_type( $type, $query_vars );

	if ( defined( 'REST_REQUEST' ) && REST_REQUEST ) {
		if ( $targets_type && ! request_targets_type( $type ) ) {
			return false;
		}

		if ( should_allow_rest_override( $type ) ) {
			return false;
		}
	}

	if ( ! defined( 'REST_REQUEST' ) || ! REST_REQUEST ) {
		if ( $targets_type || is_type_marked_visible( $type ) ) {
			return false;
		}
	}

	return true;
}

/**
 * Hide a comment type from public display.
 *
 * @param string $type               Comment type to hide.
 * @param bool   $exclude_from_count Whether to exclude from comment counts.
 * @return void
 */
function hide_type( $type = '', $exclude_from_count = true ) {
	global $wpdb;

	if ( ! is_string( $type ) || '' === $type ) {
		return;
	}

	$should_hide = function ( $query_vars = [] ) use ( $type ) {
		return should_hide_type( $type, $query_vars );
	};

	add_action(
		'pre_get_comments',
		function ( $query ) use ( $type, $should_hide ) {
			if ( ! $query instanceof WP_Comment_Query ) {
				return;
			}

			if ( $should_hide( $query->query_vars ) ) {
				$excluded_types = [];

				if ( isset( $query->query_vars['type__not_in'] ) ) {
					$excluded_types = (array) $query->query_vars['type__not_in'];
				}

				if ( ! in_array( $type, $excluded_types, true ) ) {
					$excluded_types[] = $type;
				}

				$query->query_vars['type__not_in'] = $excluded_types;
			}
		}
	);

	add_filter(
		'comment_feed_where',
		function ( $where ) use ( $type, $should_hide, $wpdb ) {
			if ( $should_hide() ) {
				$where .= $wpdb->prepare( ' AND comment_type != %s', $type );
			}

			return $where;
		},
		10,
		2
	);

	add_filter(
		'get_comments_number',
		function ( $count, $post_id ) use ( $type, $exclude_from_count, $should_hide, $wpdb ) {
			if ( is_admin() ) {
				return $count;
			}

			if ( $should_hide() && $exclude_from_count ) {
				// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- Comment count calculation requires direct query for accuracy.
				$count_hidden = $wpdb->get_var(
					$wpdb->prepare(
						"
						SELECT COUNT(*) FROM {$wpdb->comments}
						WHERE comment_post_ID = %d
						AND comment_type = %s
						AND comment_approved = '1'
						",
						$post_id,
						$type
					)
				);

				return max( 0, $count - (int) $count_hidden );
			}

			return $count;
		},
		10,
		2
	);

	add_filter(
		'comments_clauses',
		function ( $clauses, $comment_query ) use ( $type, $should_hide, $wpdb ) {
			if ( ! is_admin() && $should_hide( $comment_query->query_vars ) ) {
				$clauses['where'] .= $wpdb->prepare( ' AND comment_type != %s', $type );
			}

			return $clauses;
		},
		10,
		2
	);

	add_filter(
		'comments_template_query_args',
		function ( $args ) use ( $type, $should_hide ) {
			if ( $should_hide( $args ) ) {
				if ( isset( $args['type__not_in'] ) && is_array( $args['type__not_in'] ) ) {
					if ( ! in_array( $type, $args['type__not_in'], true ) ) {
						$args['type__not_in'][] = $type;
					}
				} else {
					$args['type__not_in'] = [ $type ];
				}
			} else {
				mark_type_visible( $type );
			}

			return $args;
		},
		10,
		1
	);

	add_filter(
		'comments_array',
		function ( $comments ) use ( $type, $should_hide ) {
			if ( is_type_marked_visible( $type ) ) {
				unmark_type_visible( $type );

				return $comments;
			}

			if ( $should_hide() ) {
				foreach ( $comments as $key => $comment ) {
					if ( $type === $comment->comment_type ) {
						unset( $comments[ $key ] );
					}
				}
			}

			return $comments;
		},
		10,
		2
	);
}
