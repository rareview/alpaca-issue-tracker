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

include('lib/expose-admin-colors.php');

include('lib/private-comments.php');
add_action('init', function() {
    hide_comment_type(
        'issuecomment',  // comment type
        true        // remove from comment counts?
    );
});

$all_includes = glob(__DIR__ . '/inc/*.php');
foreach ($all_includes as $file) {
	include_once($file);
}

register_activation_hook( __FILE__, 'alpaca_activate' );

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

    wp_enqueue_script_module(
		'alpaca-issue-comment-handler',
		$plugin_url . 'src/utils/issue-comment-handler.js',
		array(
			'wp-hooks',
			'wp-api-fetch',
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

add_action('wp_enqueue_scripts', function() {
    enqueue_alpaca_scripts();
}, 500);

add_action( 'admin_enqueue_scripts', function($hook_suffix) {
    enqueue_alpaca_scripts();

	// On the project board page, pass data from PHP to our script.
	// The hook for our page (admin.php?page=alpaca-board) is 'toplevel_page_alpaca-board'.
	if ( 'toplevel_page_alpaca-board' === $hook_suffix ) {
		wp_localize_script(
			'alpaca',
			'alpacaBoardData',
			alpaca_get_board_data()
		);
		wp_localize_script(
			'alpaca',
			'alpacaUserData',
			array(
				'currentUserId' => get_current_user_id(),
			)
		);

	}
}, 500);

add_action('admin_enqueue_scripts', function() {
    global $pagenow;

    // Only target the specific admin page
    if ( isset($_GET['page']) && $_GET['page'] === 'alpaca-board' ) {
        
        $me = get_current_user_id();

        // Register a dummy handle if needed, or use 'wp-admin' styles
        $handle = 'alpaca-admin-inline';
        wp_register_style( $handle, false );
        wp_enqueue_style( $handle );

        $custom_css = "
            .wp-admin #alpaca-board .alpaca-item[data-assignee-$me],
            .wp-admin #alpaca-board .alpaca-item-dragging[data-assignee-$me] {
                background-color: #eee;
                border: 1px solid #999;
            }
            .wp-admin #alpaca-board.filter-mine .alpaca-item:not([data-assignee-{$me}]) {
                opacity: 0.2;
            }";

        if ( function_exists('expose_admin_colors') ) {
            $custom_css .= "
                .wp-admin #alpaca-board .alpaca-item-dragging {
                    box-shadow: 0 0 8px var(--admin-color-1);
                }
				.wp-admin .alpaca-board-filter::before {
					background-color: var(--admin-color-1);
				}
				.alpaca-item .alpaca-item-controls .dashicons {
					color: var(--admin-color-1);
				}
			";
        }

        wp_add_inline_style( $handle, $custom_css );
    }
}, 501);
