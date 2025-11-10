<?php
/**
 * Plugin Name:       Alpaca
 * Plugin URI:        https://github.com/simonedickson/alpaca
 * Description:       A cute issue tracker for WordPress
 * Version:           2.0.0
 * Requires at least: 5.8
 * Requires PHP:      7.4
 * Author:            Simon Dickson
 * Author URI:        https://simondickson.co.uk
 * Text Domain:       alpaca
 * Domain Path:       /languages
 * License:           GPL v2 or later
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
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

// Load Composer autoloader if available.
if ( file_exists( ALPACA_PLUGIN_DIR . 'vendor/autoload.php' ) ) {
	require_once ALPACA_PLUGIN_DIR . 'vendor/autoload.php';
}

// Load core classes.
require_once ALPACA_PLUGIN_DIR . 'includes/class-alpaca.php';
require_once ALPACA_PLUGIN_DIR . 'includes/class-activator.php';
require_once ALPACA_PLUGIN_DIR . 'includes/class-deactivator.php';

// Register activation and deactivation hooks.
register_activation_hook( __FILE__, array( 'Alpaca\Activator', 'activate' ) );
register_deactivation_hook( __FILE__, array( 'Alpaca\Deactivator', 'deactivate' ) );

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
