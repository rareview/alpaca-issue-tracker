<?php

add_action( 'init', function() {
	wp_localize_script( 'wp-api', 'wpApiSettings', array( 'root' => esc_url_raw( rest_url() ), 'nonce' => wp_create_nonce( 'wp_rest' ) ) );
	wp_enqueue_script( 'wp-api' );
});
