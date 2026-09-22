<?php
// phpcs:ignoreFile WordPress.PHP.DiscouragedFunctions.obfuscation_base64_encode
/**
 * Data dump functionality to expose WordPress data to client-side scripts.
 *
 * @package AlpacaIssueTracker
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Get the $_SERVER keys allowed in contextual capture payloads.
 *
 * @return string[] Allowed server keys.
 */
function alpaistr_get_datadump_server_whitelist() {
	$allowed_keys = [
		'REQUEST_URI',
		'HTTP_USER_AGENT',
		'SERVER_SOFTWARE',
		'REQUEST_METHOD',
		'SERVER_PROTOCOL',
		'HTTPS',
		'HTTP_HOST',
		'HTTP_REFERER',
		'REMOTE_ADDR',
	];

	/**
	 * Filter the $_SERVER keys included in contextual capture payloads.
	 *
	 * @param string[] $allowed_keys Allowed server keys.
	 */
	return apply_filters( 'alpaca_datadump_allowed_server_keys', $allowed_keys );
}

/**
 * Get request header names allowed in contextual capture payloads.
 *
 * @return string[] Allowed header names (lowercase).
 */
function alpaistr_get_datadump_header_whitelist() {
	$allowed_names = [
		'user-agent',
		'accept',
		'accept-language',
		'referer',
		'content-type',
	];

	/**
	 * Filter request header names included in contextual capture payloads.
	 *
	 * @param string[] $allowed_names Allowed header names.
	 */
	return apply_filters( 'alpaca_datadump_allowed_header_names', $allowed_names );
}

/**
 * Remove sensitive $_SERVER values from a contextual capture payload.
 *
 * @param array<string, mixed> $server_data Sanitized server data.
 * @return array<string, string> Filtered server data.
 */
function alpaistr_filter_datadump_server_data( $server_data ) {
	if ( ! is_array( $server_data ) ) {
		return [];
	}

	$whitelist = alpaistr_get_datadump_server_whitelist();
	$filtered  = [];

	foreach ( $server_data as $key => $value ) {
		if ( ! is_string( $key ) || ! in_array( $key, $whitelist, true ) || is_array( $value ) ) {
			continue;
		}

		$filtered[ $key ] = (string) $value;
	}

	return $filtered;
}

/**
 * Remove sensitive request headers from a contextual capture payload.
 *
 * @param array<string, mixed> $headers Request headers.
 * @return array<string, string> Filtered headers.
 */
function alpaistr_filter_datadump_headers( $headers ) {
	if ( ! is_array( $headers ) ) {
		return [];
	}

	$whitelist = alpaistr_get_datadump_header_whitelist();
	$filtered  = [];

	foreach ( $headers as $key => $value ) {
		if ( ! is_string( $key ) || is_array( $value ) ) {
			continue;
		}

		if ( ! in_array( strtolower( $key ), $whitelist, true ) ) {
			continue;
		}

		$filtered[ $key ] = sanitize_text_field( (string) $value );
	}

	return $filtered;
}

/**
 * Prepare WordPress data dump for JavaScript.
 *
 * @return array Data to pass to JavaScript.
 */
function alpaistr_prepare_datadump() {
	global $wp_query;
	$theme = wp_get_theme();
	$user  = wp_get_current_user();

	$type = [];
	if ( is_admin() ) {
		$type[] = 'wp-admin';
	} elseif ( is_customize_preview() ) {
		$type[] = 'customize_preview';
	} elseif ( is_front_page() ) {
		$type[] = 'front_page';
	} elseif ( is_home() ) {
		$type[] = 'home';
	} elseif ( is_singular() ) {
		$type[] = 'singular';
		$type[] = get_post_type();
	} elseif ( is_archive() ) {
		$type[] = 'archive';
		if ( is_date() ) {
			$type[] = 'date';
		} elseif ( is_category() || is_tag() || is_tax() ) {
			$type[] = 'taxonomy';
			$type[] = get_queried_object()->taxonomy;
			$type[] = get_queried_object()->slug;
		} elseif ( is_post_type_archive() ) {
			$type[] = 'post_type';
			$type[] = $wp_query->query_vars['post_type'];
		} elseif ( is_author() ) {
			$type[] = 'author';
		}
	} elseif ( is_search() ) {
		$type[] = 'search';
	} elseif ( is_404() ) {
		$type[] = '404';
	} else {
		$type[] = 'unidentified';
	}
	if ( is_preview() ) {
		$type[] = 'preview';
	}
	if ( is_customize_preview() ) {
		$type[] = 'customize_preview';
	}

	$wp_data = [
		'theme'         => [
			'stylesheet' => $theme->stylesheet,
			'version'    => $theme->get( 'Version' ),
		],
		'plugins'       => get_option( 'active_plugins', false ),
		'queryVars'     => $wp_query->query_vars,
		'queriedObject' => $wp_query->get_queried_object(),
		'type'          => $type,
		'bodyClasses'   => get_body_class(),
	];

	$alpaistr_template = '';
	if ( isset( $GLOBALS['template'] ) && is_string( $GLOBALS['template'] ) ) {
		$alpaistr_template = $GLOBALS['template'];
	}

	if ( '' !== $alpaistr_template ) {
		$wp_data['template'] = basename( $alpaistr_template );
	}

	$user_data = [
		'id'          => $user->ID,
		'displayName' => $user->display_name,
	];
	$server_data = alpaistr_filter_datadump_server_data(
		map_deep( wp_unslash( $_SERVER ), 'sanitize_text_field' )
	);
	$headers = alpaistr_filter_datadump_headers(
		function_exists( 'getallheaders' ) ? getallheaders() : []
	);

	// Combine all data into a single object.
	$alpaca_data = [
		'time'    => time(),
		'user'    => $user_data,
		'server'  => $server_data,
		'headers' => $headers,
		'wp'      => $wp_data,
	];

	// Encode the JSON string into Base64.
	// $encoded_data = base64_encode( wp_json_encode( $alpaca_data ) );
	// Then to decode the Base64 string and parse the JSON.
	// In JS: decoded_data = atob( encoded_data ); then JSON.parse( decoded_data ).
	// In PHP: $decoded_data = base64_decode( $encoded_string ); then json_decode( $decoded_string ).

	// Return data for JavaScript localization.
	$alpaca_json = wp_json_encode( $alpaca_data );
	return [
		'env' => base64_encode( $alpaca_json ), // phpcs:ignore WordPress.PHP.DiscouragedFunctions.obfuscation_base64_encode
	];
}
