<?php
add_action('admin_bar_menu', 'alpaca_add_admin_bar_menu', 500);
function alpaca_add_admin_bar_menu( $admin_bar ){
    // if( is_admin() ) {
	//     return;
	// }
    $admin_bar->add_menu( array(
        'id'    => 'alpaca-bugs',
		'parent' => 'top-secondary',
        'title' => '<span class="ab-icon dashicons dashicons-warning"></span><span class="ab-label">Issues</span>',
        'href'  => '#',
        'meta'  => array( 'title' => 'Issues' )
    ));
	$admin_bar->add_menu(array(
		'parent' => 'alpaca-bugs',
		'title' => 'Report an issue',
		'id' => 'alpaca-report',
		'href' => '#',
	));
	$admin_bar->add_menu(array(
		'parent' => 'alpaca-bugs',
		'title' => 'View all issues',
		'id' => 'alpaca-view',
		'href' => admin_url('edit.php?post_type=bug'),
	));
	$admin_bar->add_menu(array(
		'parent' => 'alpaca-bugs',
		'title' => 'Test snapDOM',
		'id' => 'alpaca-snapdom',
		'href' => '#',
	));

}

