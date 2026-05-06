<?php
/**
 * Alpaca REST API: Image Proxy Endpoint.
 *
 * @package Alpaca
 */

use Alpaca\Inc\Helpers;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Build a time-based auth token for the image proxy endpoint.
 *
 * @param int|null $tick    Optional tick value. Defaults to the current tick.
 * @param int|null $user_id Optional user ID. Defaults to current user.
 * @return string Signed token.
 */
function alpaca_get_proxy_auth_token( $tick = null, $user_id = null ) {
	if ( null === $tick ) {
		$tick = (int) ceil( time() / ( 12 * HOUR_IN_SECONDS ) );
	}

	if ( null === $user_id ) {
		$user_id = get_current_user_id();
	}

	$payload = 'alpaca_proxy|' . (int) $user_id . '|' . (int) $tick;

	return hash_hmac( 'sha256', $payload, wp_salt( 'nonce' ) );
}

/**
 * Validate a proxy auth token against current and previous time ticks.
 *
 * @param string   $token   Token to validate.
 * @param int|null $user_id Optional user ID. Defaults to current user.
 * @return bool True when valid.
 */
function alpaca_verify_proxy_auth_token( $token, $user_id = null ) {
	$token = is_string( $token ) ? trim( $token ) : '';
	if ( '' === $token ) {
		return false;
	}

	if ( null === $user_id ) {
		$user_id = get_current_user_id();
	}

	$current_tick   = (int) ceil( time() / ( 12 * HOUR_IN_SECONDS ) );
	$current_token  = alpaca_get_proxy_auth_token( $current_tick, $user_id );
	$previous_token = alpaca_get_proxy_auth_token( $current_tick - 1, $user_id );

	return hash_equals( $current_token, $token ) || hash_equals( $previous_token, $token );
}

/**
 * Validate authentication for the image proxy endpoint.
 *
 * Accepts either a valid `wp_rest` nonce (same-origin authenticated requests)
 * or a signed `proxy_token` (cross-origin requests where cookies are omitted).
 *
 * @param WP_REST_Request $request REST request object.
 * @return true|WP_Error True when valid, WP_Error otherwise.
 */
function alpaca_validate_image_proxy_permission( WP_REST_Request $request ) {
	// Same-origin path: validate nonce and capability.
	$nonce_validation = Helpers::validate_rest_nonce_permission( $request, 'view_board' );
	if ( true === $nonce_validation ) {
		return true;
	}

	$proxy_token = (string) $request->get_param( 'proxy_token' );
	if ( alpaca_verify_proxy_auth_token( $proxy_token ) ) {
		return true;
	}

	return new WP_Error(
		'rest_forbidden',
		esc_html__( 'Invalid proxy authentication token.', 'alpaca' ),
		[ 'status' => 401 ]
	);
}

/**
 * Image proxy endpoint for SnapDOM useProxy option.
 *
 * Fetches an external image server-side and returns it with CORS headers so
 * the browser can load it without cross-origin tainting. Only allows safe
 * public URLs and requires proxy authentication.
 */
function alpaca_register_image_proxy_endpoint() {
	register_rest_route(
		'alpaca/v1',
		'/proxy',
		[
			'methods'             => 'GET',
			'callback'            => 'alpaca_image_proxy_callback',
			'permission_callback' => function ( WP_REST_Request $request ) {
				return alpaca_validate_image_proxy_permission( $request );
			},
			'args'                => [
				'nonce'       => [
					'sanitize_callback' => 'sanitize_text_field',
				],
				'proxy_token' => [
					'sanitize_callback' => 'sanitize_text_field',
				],
				'url'         => [
					'required'          => true,
					'sanitize_callback' => 'esc_url_raw',
				],
			],
		]
	);
}
add_action( 'rest_api_init', 'alpaca_register_image_proxy_endpoint' );


/**
 * Check whether an IP address is private or reserved.
 *
 * Uses PHP\'s built-in FILTER_VALIDATE_IP flags to cover all RFC 1918 ranges
 * (10.x, 172.16-31.x, 192.168.x), loopback, link-local, and IPv6 private/reserved.
 *
 * @param string $ip Candidate IP.
 * @return bool True if private/reserved or invalid.
 */
function alpaca_proxy_is_private_or_reserved_ip( $ip ) {
	$ip = is_string( $ip ) ? trim( $ip ) : '';
	if ( '' === $ip ) {
		return true;
	}

	if ( false === filter_var( $ip, FILTER_VALIDATE_IP ) ) {
		return true;
	}

	$is_public = filter_var(
		$ip,
		FILTER_VALIDATE_IP,
		FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE
	);

	return false === $is_public;
}

/**
 * Validate that a URL is safe for proxy retrieval.
 *
 * Checks URL structure, scheme, host resolution, and ensures all resolved IPs
 * are public (non-private, non-reserved) to prevent SSRF attacks.
 *
 * @param string $url Target URL.
 * @return true|WP_Error True when valid.
 */
function alpaca_validate_proxy_target_url( $url ) {
	$url = is_string( $url ) ? trim( $url ) : '';
	if ( '' === $url || ! wp_http_validate_url( $url ) ) {
		return new WP_Error(
			'alpaca_proxy_invalid_url',
			esc_html__( 'Invalid URL.', 'alpaca' ),
			[ 'status' => 400 ]
		);
	}

	$scheme = (string) wp_parse_url( $url, PHP_URL_SCHEME );
	if ( ! in_array( strtolower( $scheme ), [ 'http', 'https' ], true ) ) {
		return new WP_Error(
			'alpaca_proxy_invalid_scheme',
			esc_html__( 'Only HTTP and HTTPS URLs are allowed.', 'alpaca' ),
			[ 'status' => 400 ]
		);
	}

	$host = (string) wp_parse_url( $url, PHP_URL_HOST );
	if ( '' === $host ) {
		return new WP_Error(
			'alpaca_proxy_invalid_host',
			esc_html__( 'Invalid host.', 'alpaca' ),
			[ 'status' => 400 ]
		);
	}

	// If the host is already an IP, validate it directly.
	if ( false !== filter_var( $host, FILTER_VALIDATE_IP ) ) {
		if ( alpaca_proxy_is_private_or_reserved_ip( $host ) ) {
			return new WP_Error(
				'alpaca_proxy_disallowed_ip',
				esc_html__( 'URL not allowed.', 'alpaca' ),
				[ 'status' => 400 ]
			);
		}
		return true;
	}

	// Resolve hostname and validate all resulting IPs.
	$ip = gethostbyname( $host );
	if ( $ip === $host ) {
		return new WP_Error(
			'alpaca_proxy_unresolvable',
			esc_html__( 'Unable to resolve host.', 'alpaca' ),
			[ 'status' => 400 ]
		);
	}

	if ( alpaca_proxy_is_private_or_reserved_ip( $ip ) ) {
		return new WP_Error(
			'alpaca_proxy_disallowed_ip',
			esc_html__( 'URL not allowed.', 'alpaca' ),
			[ 'status' => 400 ]
		);
	}

	return true;
}

/**
 * Allowed image MIME types for the proxy.
 *
 * Explicitly excludes image/svg+xml to prevent XSS via embedded scripts.
 *
 * @return array List of allowed MIME types.
 */
function alpaca_proxy_allowed_image_types() {
	return [ 'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif', 'image/bmp', 'image/tiff' ];
}

/**
 * Callback for the image proxy.
 *
 * Fetches an external image server-side and returns it with CORS headers so
 * the browser can load it without cross-origin tainting.
 *
 * @param WP_REST_Request $request Request.
 * @return WP_REST_Response|void REST response on error; raw image bytes on success.
 */
function alpaca_image_proxy_callback( WP_REST_Request $request ) {
	$url = (string) $request->get_param( 'url' );

	// Validate URL is safe (structure, scheme, SSRF checks).
	$validation = alpaca_validate_proxy_target_url( $url );
	if ( is_wp_error( $validation ) ) {
		$error_data = $validation->get_error_data();
		$status     = is_array( $error_data ) && isset( $error_data['status'] ) ? (int) $error_data['status'] : 400;
		return alpaca_rest_response(
			'image_proxy',
			[
				'success' => false,
				'message' => $validation->get_error_message(),
			],
			$status
		);
	}

	$args = [
		'timeout'             => 10,
		'redirection'         => 5,
		'reject_unsafe_urls'  => true,
		'limit_response_size' => 5 * MB_IN_BYTES,
		'headers'             => [
			'User-Agent' => 'AlpacaImageProxy/1.0',
		],
	];

	$resp = wp_safe_remote_get( $url, $args );
	if ( is_wp_error( $resp ) ) {
		return alpaca_rest_response(
			'image_proxy',
			[
				'success' => false,
				'message' => esc_html( $resp->get_error_message() ),
			],
			502
		);
	}

	$code = wp_remote_retrieve_response_code( $resp );
	if ( 200 !== (int) $code ) {
		return alpaca_rest_response(
			'image_proxy',
			[
				'success' => false,
				'message' => esc_html__( 'Failed to fetch image.', 'alpaca' ),
			],
			502
		);
	}

	$body         = wp_remote_retrieve_body( $resp );
	$content_type = wp_remote_retrieve_header( $resp, 'content-type' );

	// Strip charset or boundary suffixes (e.g. 'image/png; charset=utf-8').
	$mime_only = $content_type ? strtolower( trim( strtok( $content_type, ';' ) ) ) : '';

	if ( ! in_array( $mime_only, alpaca_proxy_allowed_image_types(), true ) ) {
		return alpaca_rest_response(
			'image_proxy',
			[
				'success' => false,
				'message' => esc_html__( 'Unsupported image type.', 'alpaca' ),
			],
			400
		);
	}

	// Return raw image bytes with proper headers to avoid JSON-encoding binary data.
	// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Binary image data cannot be escaped.
	header( 'Content-Type: ' . $mime_only );
	header( 'X-Content-Type-Options: nosniff' );
	header( 'Access-Control-Allow-Origin: ' . esc_url( home_url() ) );
	header( 'Cache-Control: public, max-age=600' );
	// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Binary image data cannot be escaped.
	echo $body;
	exit;
}
