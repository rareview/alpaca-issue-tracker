<?php
/**
 * Alpaca Issue Tracker REST API: Report context endpoint.
 *
 * @package AlpacaIssueTracker
 */

use AlpacaIssueTracker\Helpers;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'rest_api_init', 'alpaistr_register_report_context_endpoint' );
/**
 * Register the report context REST endpoint.
 *
 * @return void
 */
function alpaistr_register_report_context_endpoint() {
	register_rest_route(
		'alpaca/v1',
		'/report-context',
		[
			'methods'             => 'GET',
			'callback'            => 'alpaistr_get_report_context',
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
function alpaistr_get_report_context() {
	if ( function_exists( 'alpaistr_is_contextual_capture_enabled' ) && ! alpaistr_is_contextual_capture_enabled() ) {
		return alpaistr_rest_response( 'report_context', [], 200 );
	}

	return alpaistr_rest_response( 'report_context', alpaistr_prepare_datadump(), 200 );
}
