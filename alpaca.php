<?php
/**
 * Plugin Name:       Alpaca
 * Plugin URI:        https://github.com/rareview/alpaca
 * Description:       A cute issue tracker for WordPress
 * Version:           1.0.0-beta.3
 * Requires at least: 6.8
 * Requires PHP:      7.4
 * Author:            Rareview
 * Author URI:        https://rareview.com/
 * Text Domain:       alpaca
 * Domain Path:       /languages
 * License:           GPL v2 or later
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 *
 * @package Alpaca
 */

namespace Alpaca;

use Alpaca\Inc\AlpacaServiceProvider;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Define plugin directory constant.
if ( ! defined( 'ALPACA_PLUGIN_DIR' ) ) {
	define( 'ALPACA_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
}

// Load Composer autoloader if available.
if ( file_exists( ALPACA_PLUGIN_DIR . 'vendor/autoload.php' ) ) {
	require_once ALPACA_PLUGIN_DIR . 'vendor/autoload.php';
}

// Manually require core classes for now.
require_once ALPACA_PLUGIN_DIR . 'includes/class-helpers.php';
require_once ALPACA_PLUGIN_DIR . 'includes/class-register.php';
require_once ALPACA_PLUGIN_DIR . 'includes/class-alpacaserviceprovider.php';
require_once ALPACA_PLUGIN_DIR . 'includes/class-activator.php';
require_once ALPACA_PLUGIN_DIR . 'includes/class-deactivator.php';

// Register activation and deactivation hooks.
register_activation_hook( __FILE__, array( 'Alpaca\\Activator', 'activate' ) );
register_deactivation_hook( __FILE__, array( 'Alpaca\\Deactivator', 'deactivate' ) );

// Initialize the Service Provider.
if ( class_exists( AlpacaServiceProvider::class ) ) {
	new AlpacaServiceProvider();
}

require_once ALPACA_PLUGIN_DIR . 'includes/class-alpaca.php';

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
