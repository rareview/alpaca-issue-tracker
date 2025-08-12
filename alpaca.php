<?php
/**
* Plugin Name:       Alpaca
* Plugin URI:        
* Description:       A cute issue tracker
* Version:           202508
* Author:            Simon Dickson
* Author URI:        https://simondickson.co.uk
* Text Domain:       alpaca
* License:           GPL v2 or later
* License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
*/

namespace alpaca;

include('lib/private-comments.php');
add_action('init', function() {
    hide_comment_type(
        'comment',  // comment type
        true        // remove from comment counts?
    );
});

$all_includes = glob(__DIR__ . '/inc/*.php');
foreach ($all_includes as $file) {
	include_once($file);
}

add_action( 'admin_enqueue_scripts', function() {
    enqueue_alpaca_scripts();
}, 500);

add_action('wp_enqueue_scripts', function() {
    enqueue_alpaca_scripts();
}, 500);

function enqueue_alpaca_scripts() {
	$plugin_url = plugin_dir_url( __FILE__ );

    wp_enqueue_script(
		'alpaca',
		$plugin_url . 'dist/index.js',
		array(
			'wp-element',
			'wp-api-fetch',
			'wp-i18n',
			'wp-components',
			'wp-dom-ready',
		),
		'1.00',
		true
	);

    wp_enqueue_style(
		'alpaca',
		$plugin_url . 'dist/index.css',
		array(
			'wp-components' // needed to style the modal
		)
	);

    wp_enqueue_script(
		'snapdom',
		$plugin_url . 'vendor/snapdom.min.js',
    );
    wp_enqueue_script(
		'bowser',
		$plugin_url . 'vendor/bowser.es5.min.js',
    );


}