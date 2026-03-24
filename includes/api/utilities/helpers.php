<?php
/**
 * Alpaca REST API: Shared Utilities.
 *
 * @package Alpaca
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Uniform REST response wrapper.
 *
 * @param string $action_type Optional. Action identifier used to build the dynamic hook name.
 * @param mixed  $data        Response data.
 * @param int    $status      HTTP status code. Default 200.
 *
 * @return WP_REST_Response REST response object.
 */
function alpaca_rest_response( $action_type, $data, $status = 200 ) {
	$status      = (int) $status;
	$action_type = is_string( $action_type ) ? trim( $action_type ) : '';

	do_action( 'alpaca_rest_response', $action_type, $data, $status );

	if ( '' !== $action_type ) {
		if ( $status >= 200 && $status < 300 ) {
			do_action( 'alpaca_rest_' . $action_type, $data, $status );
		} else {
			do_action( 'alpaca_rest_error_' . $action_type, $data, $status );
		}
	}

	$response = new WP_REST_Response( $data, $status );

	return apply_filters(
		'alpaca_rest_response_object',
		$response,
		$action_type,
		$data,
		$status
	);
}

/**
 * Get safe array value with default fallback.
 *
 * @param array $arr     Array to search.
 * @param array $path    Path to traverse (array of keys).
 * @param mixed $def     Default value if path not found.
 * @return mixed Value at path or default.
 */
function alpaca_arr_get( $arr, $path, $def = null ) { // phpcs:disable-line WordPress.NamingConventions.ValidParameterName.VariableNotSnakeCase
	$ref = $arr;
	foreach ( (array) $path as $key ) {
		if ( is_array( $ref ) && array_key_exists( $key, $ref ) ) {
			$ref = $ref[ $key ];
		} else {
			return $def;
		}
	}
	return $ref;
}

/**
 * Cast to integer array and deduplicate.
 *
 * @param mixed $vals Values to convert.
 * @return array Array of unique integers.
 */
function alpaca_to_int_ids( $vals ) {
	$vals = array_map( 'intval', (array) $vals );
	return array_values(
		array_unique(
			array_filter(
				$vals,
				static function ( $v ) {
					return $v > 0;
				}
			)
		)
	);
}

/**
 * Get avatar URL for a user.
 *
 * @param int $user_id User ID.
 * @param int $size    Avatar size in pixels.
 * @return string Avatar URL.
 */
function alpaca_avatar( $user_id, $size = 24 ) {
	return get_avatar_url( (int) $user_id, array( 'size' => (int) $size ) );
}

/**
 * Verify a post is an issue and return it.
 *
 * @param int $post_id Post ID to check.
 * @return WP_Post|null Post object if valid issue, null otherwise.
 */
function alpaca_assert_issue_exists( $post_id ) {
	$post = get_post( (int) $post_id );
	return ( $post && 'alpaca_issue' === $post->post_type ) ? $post : null;
}

/**
 * Generates a consistent issue object for REST responses.
 *
 * @param int|WP_Post $issue      Issue post ID or object.
 * @param array       $override_data Optional data to override fetched values.
 *
 * @return array The issue data structure for API responses.
 */
function alpaca_get_issue_response_data( $issue, $override_data = array() ) {
	$post = get_post( $issue );
	if ( ! $post ) {
		return array();
	}

	$post_id   = $post->ID;
	$author_id = (int) $post->post_author;

	// Get high priority status.
	$is_high_priority = ! empty( get_post_meta( $post_id, 'alpaca_high_priority', true ) );
	if ( isset( $override_data['is_high_priority'] ) ) {
		$is_high_priority = (bool) $override_data['is_high_priority'];
	}

	// Get status term ID.
	$status_term_id = null;
	if ( isset( $override_data['statusId'] ) ) {
		$status_term_id = (int) $override_data['statusId'];
	} else {
		$terms = wp_get_post_terms( $post_id, 'alpaca_status', array( 'fields' => 'ids' ) );
		if ( ! is_wp_error( $terms ) && ! empty( $terms ) ) {
			$status_term_id = (int) $terms[0];
		}
	}

	$title = isset( $override_data['title'] ) ? $override_data['title'] : $post->post_title;

	return array(
		'post_id'  => $post_id,
		'issue'    => array(
			'id'          => $post_id,
			'slug'        => (string) $post->post_name,
			'title'       => $title,
			'author_id'   => $author_id,
			'author_name' => get_the_author_meta( 'display_name', $author_id ),
			'author_img'  => alpaca_avatar( $author_id, 24 ),
			'meta'        => array(
				'alpaca_high_priority' => $is_high_priority,
			),
		),
		'statusId' => $status_term_id,
	);
}
