<?php
/**
 * Alpaca REST API: Report context endpoint.
 *
 * @package Alpaca
 */

use Alpaca\Inc\Helpers;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'rest_api_init', 'alpaca_register_report_context_endpoint' );
/**
 * Register the report context REST endpoint.
 *
 * @return void
 */
function alpaca_register_report_context_endpoint() {
	register_rest_route(
		'alpaca/v1',
		'/report-context',
		[
			'methods'             => 'GET',
			'callback'            => 'alpaca_get_report_context',
			'permission_callback' => function ( WP_REST_Request $request ) {
				return Helpers::validate_rest_nonce_permission( $request, 'create_issue' );
			},
		]
	);
}

/**
 * Return the current request context used for issue reporting.
 *
 * @return WP_REST_Response
 */
function alpaca_get_report_context() {
	if ( function_exists( 'alpaca_is_contextual_capture_enabled' ) && ! alpaca_is_contextual_capture_enabled() ) {
		return alpaca_rest_response( 'report_context', [], 200 );
	}

	return alpaca_rest_response( 'report_context', alpaca_prepare_datadump(), 200 );
}
