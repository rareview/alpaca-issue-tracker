<?php
/**
 * Alpaca Issue Tracker Issues – REST Endpoints facade.
 *
 * @package AlpacaIssueTracker
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$alpaca_rest_api_modules = [
	'utilities/rest-root.php',
	'utilities/helpers.php',
	'endpoints/report-context.php',
	'endpoints/issues.php',
	'endpoints/board.php',
	'endpoints/options-statuses.php',
	'endpoints/users-labels-watchlist.php',
	'endpoints/notifications.php',
	'endpoints/attachments.php',
	'proxy/image-proxy.php',
	'filters/comment-filters.php',
	'endpoints/presence.php',
	'filters/comment-response.php',
	'abilities.php',
];

foreach ( $alpaca_rest_api_modules as $alpaca_rest_api_module ) {
	require_once __DIR__ . '/' . $alpaca_rest_api_module;
}
