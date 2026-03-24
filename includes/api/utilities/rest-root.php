<?php
/**
 * Alpaca REST API: REST Root Utilities.
 *
 * @package Alpaca
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Build request origin details from the current HTTP request.
 *
 * @return array{scheme:string,host:string,port:int|null,origin:string}
 */
function alpaca_get_request_origin_parts() {
	$scheme      = is_ssl() ? 'https' : 'http';
	$host_header = isset( $_SERVER['HTTP_HOST'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_HOST'] ) ) : '';

	if ( '' === $host_header ) {
		return array(
			'scheme' => $scheme,
			'host'   => '',
			'port'   => null,
			'origin' => '',
		);
	}

	$parsed_host = wp_parse_url( $scheme . '://' . $host_header );
	if ( ! is_array( $parsed_host ) || empty( $parsed_host['host'] ) ) {
		return array(
			'scheme' => $scheme,
			'host'   => '',
			'port'   => null,
			'origin' => '',
		);
	}

	$request_host = (string) $parsed_host['host'];
	$request_port = isset( $parsed_host['port'] ) ? (int) $parsed_host['port'] : null;

	return array(
		'scheme' => $scheme,
		'host'   => $request_host,
		'port'   => $request_port,
		'origin' => $scheme . '://' . $host_header,
	);
}

/**
 * When REST root host matches current request host, align scheme/port to request origin.
 *
 * @param string $rest_root REST root URL.
 * @return string
 */
function alpaca_align_rest_root_to_request_origin( $rest_root ) {
	$rest_root = is_string( $rest_root ) ? trim( $rest_root ) : '';
	if ( '' === $rest_root ) {
		return esc_url_raw( rest_url() );
	}

	$request_parts = alpaca_get_request_origin_parts();
	if ( '' === $request_parts['origin'] ) {
		return $rest_root;
	}

	$rest_parts = wp_parse_url( $rest_root );
	if ( ! is_array( $rest_parts ) || empty( $rest_parts['host'] ) ) {
		return $rest_root;
	}

	$rest_host    = strtolower( (string) $rest_parts['host'] );
	$request_host = strtolower( (string) $request_parts['host'] );
	if ( '' === $request_host || $rest_host !== $request_host ) {
		return $rest_root;
	}

	$path = isset( $rest_parts['path'] ) ? (string) $rest_parts['path'] : '/wp-json/';
	if ( '' === $path ) {
		$path = '/wp-json/';
	}

	$aligned = $request_parts['origin'] . $path;
	if ( isset( $rest_parts['query'] ) && '' !== $rest_parts['query'] ) {
		$aligned .= '?' . $rest_parts['query'];
	}
	if ( isset( $rest_parts['fragment'] ) && '' !== $rest_parts['fragment'] ) {
		$aligned .= '#' . $rest_parts['fragment'];
	}

	return $aligned;
}

/**
 * Resolve localized wpApiSettings root and custom-root flag.
 *
 * @return array{root:string,has_custom_root:bool}
 */
function alpaca_get_wp_api_settings_root_data() {
	$default_root  = esc_url_raw( rest_url() );
	$filtered_root = apply_filters(
		'alpaca_rest_api_root',
		$default_root,
		array(
			'default_root' => $default_root,
			'request'      => alpaca_get_request_origin_parts(),
		)
	);

	$filtered_root = is_string( $filtered_root ) ? trim( $filtered_root ) : '';
	if ( '' === $filtered_root ) {
		$filtered_root = $default_root;
	}

	$has_custom_root = untrailingslashit( $filtered_root ) !== untrailingslashit( $default_root );
	$resolved_root   = $has_custom_root ? $filtered_root : alpaca_align_rest_root_to_request_origin( $filtered_root );

	return array(
		'root'            => esc_url_raw( trailingslashit( $resolved_root ) ),
		'has_custom_root' => $has_custom_root,
	);
}

/*
 * Bootstrapping: expose wpApiSettings for frontend REST requests.
 */
add_action(
	'init',
	function () {
		$root_data = alpaca_get_wp_api_settings_root_data();

		wp_localize_script(
			'wp-api',
			'wpApiSettings',
			array(
				'root'                => $root_data['root'],
				'nonce'               => wp_create_nonce( 'wp_rest' ),
				'alpacaHasCustomRoot' => (bool) $root_data['has_custom_root'],
			)
		);
		wp_enqueue_script( 'wp-api' );
	}
);
