<?php
// phpcs:ignoreFile WordPress.PHP.DiscouragedFunctions.obfuscation_base64_encode
/**
 * Data dump functionality to expose WordPress data to client-side scripts.
 *
 * @package Alpaca
 */

/**
 * Prepare WordPress data dump for JavaScript.
 *
 * @return array Data to pass to JavaScript.
 */
function alpaca_prepare_datadump() {
	global $wp_query, $post, $template;
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

	if ( $template ) {
		$wp_data['template'] = basename( $template );
	}

	$user_data = [
		'id'          => $user->ID,
		'displayName' => $user->display_name,
	];

	// Combine all data into a single object.
	$alpaca_data = [
		'time'    => time(),
		'user'    => $user_data,
		'server'  => $_SERVER,
		'headers' => function_exists( 'getallheaders' ) ? getallheaders() : [],
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
		'raw' => $alpaca_data,
	];
}
