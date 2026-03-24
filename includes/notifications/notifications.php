<?php
/**
 * Notification services loader for Alpaca issue activity emails.
 *
 * @package Alpaca
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once __DIR__ . '/template.php';
require_once __DIR__ . '/inbox.php';
require_once __DIR__ . '/preferences.php';
require_once __DIR__ . '/mentions.php';
require_once __DIR__ . '/events.php';
require_once __DIR__ . '/recipients.php';
require_once __DIR__ . '/render.php';
require_once __DIR__ . '/digest/index.php';
require_once __DIR__ . '/dispatch.php';
