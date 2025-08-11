<?php
add_action('admin_bar_menu', 'alpaca_add_admin_bar_menu', 500);
function alpaca_add_admin_bar_menu( $admin_bar ){
    // if( is_admin() ) {
	//     return;
	// }
    $admin_bar->add_menu( array(
        'id'    => 'alpaca-menu',
		'parent' => 'top-secondary',
        'title' => '<span class="ab-icon dashicons dashicons-warning"></span><span class="ab-label">Issues</span>',
        'href'  => '#',
        'meta'  => array( 'title' => 'Issues' )
    ));

	/**
	 * This one is really just a placeholder; it will be replaced by AlpacaModal
	 */
	$admin_bar->add_menu(array(
		'parent' => 'alpaca-menu',
		'title' => '',
		'id' => 'alpaca-report',
		'href' => '#',
	));

	$admin_bar->add_menu(array(
		'parent' => 'alpaca-menu',
		'title' => 'View All Issues',
		'id' => 'alpaca-view',
		'href' => admin_url('edit.php?post_type=issue'),
	));


}

