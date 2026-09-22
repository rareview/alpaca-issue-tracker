<?php
/**
 * Daily digest notification loader.
 *
 * @package AlpacaIssueTracker
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/schedule.php';
require_once __DIR__ . '/payload.php';
require_once __DIR__ . '/template.php';
require_once __DIR__ . '/render.php';
require_once __DIR__ . '/worker.php';
