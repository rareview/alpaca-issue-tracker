<?php
/**
 * Plugin Name:       Alpaca Issue Tracker
 * Plugin URI:        https://github.com/rareview/alpaca-issue-tracker
 * Description:       A lightweight issue tracker built entirely inside WordPress, designed for developers and agencies managing client projects.
 * Version:           1.0.3
 * Requires at least: 6.9
 * Requires PHP:      8.0
 * Author:            Rareview®
 * Author URI:        https://rareview.com/
 * Text Domain:       alpaca-issue-tracker
 * Domain Path:       /languages
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 *
 * @package AlpacaIssueTracker
 */

namespace AlpacaIssueTracker;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Define plugin directory constant.
if ( ! defined( 'ALPAISTR_PLUGIN_DIR' ) ) {
	define( 'ALPAISTR_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
}

// Manually require core classes for now.
require_once ALPAISTR_PLUGIN_DIR . 'includes/class-alpacaissuetracker.php';
require_once ALPAISTR_PLUGIN_DIR . 'includes/class-helpers.php';
require_once ALPAISTR_PLUGIN_DIR . 'includes/class-register.php';
require_once ALPAISTR_PLUGIN_DIR . 'includes/class-activator.php';
require_once ALPAISTR_PLUGIN_DIR . 'includes/class-deactivator.php';

// Register activation and deactivation hooks.
register_activation_hook( __FILE__, [ Activator::class, 'activate' ] );
register_deactivation_hook( __FILE__, [ Deactivator::class, 'deactivate' ] );

// Initialize asset registration.
new Register();

/**
 * Initialize the plugin.
 *
 * @return AlpacaIssueTracker
 */
function alpaistr_init() {
	return AlpacaIssueTracker::instance();
}

// Start the plugin.
alpaistr_init();
