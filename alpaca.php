<?php
/**
 * Plugin Name:       Alpaca Issue Tracker
 * Plugin URI:        https://github.com/rareview/alpaca
 * Description:       Bug reporting and Trello-esque kanban project management inside WordPress. No subscriptions, no new accounts, no artificial limitations.
 * Version:           1.0.0
 * Requires at least: 6.8
 * Requires PHP:      7.4
 * Author:            Rareview®
 * Author URI:        https://rareview.com/
 * Text Domain:       alpaca
 * Domain Path:       /languages
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 *
 * @package Alpaca
 */

namespace Alpaca;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Define plugin directory constant.
if ( ! defined( 'ALPACA_PLUGIN_DIR' ) ) {
	define( 'ALPACA_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
}

// Manually require core classes for now.
require_once ALPACA_PLUGIN_DIR . 'includes/class-alpaca.php';
require_once ALPACA_PLUGIN_DIR . 'includes/class-helpers.php';
require_once ALPACA_PLUGIN_DIR . 'includes/class-register.php';
require_once ALPACA_PLUGIN_DIR . 'includes/class-activator.php';
require_once ALPACA_PLUGIN_DIR . 'includes/class-deactivator.php';

// Register activation and deactivation hooks.
register_activation_hook( __FILE__, array( Activator::class, 'activate' ) );
register_deactivation_hook( __FILE__, array( Deactivator::class, 'deactivate' ) );

// Initialize asset registration.
new Register();

/**
 * Initialize the plugin.
 *
 * @return Alpaca
 */
function alpaca_init() {
	return Alpaca::instance();
}

// Start the plugin.
alpaca_init();
