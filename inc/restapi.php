<?php

add_action( 'init', function() {
	wp_localize_script(
		'wp-api',
		'wpApiSettings',
		array( 'root' => esc_url_raw( rest_url() ), 'nonce' => wp_create_nonce( 'wp_rest' ) )
	);
	wp_enqueue_script( 'wp-api' );
});

add_action( 'rest_api_init', 'alpaca_issue_submit' );
function alpaca_issue_submit(){
    register_rest_route(
        'issue/v1/', // Namespace
        'submit', // Endpoint
        array(
            'methods'  => 'POST',
            'callback' => 'alpaca_issue_callback',
			'permission_callback' => function() {
				return current_user_can('edit_others_posts');
			}
        )
    );
}

function alpaca_issue_callback( WP_REST_Request $req ) {
    $getbody = $req->get_body();
    if ( isset($getbody) ) {
	    $json = json_decode( $getbody,true );

	    $post_args = array(
		    'post_type' => 'issue',
		    'post_status' => 'publish',
		    'post_author' => $json['user']['id'],
		    'post_title' => wp_kses_post( wp_trim_words( $json['userinput']['feedback'], 6 ) ),
		    'post_content' =>wp_kses_post(  $json['userinput']['feedback'] )
	    );
	    $post_id = wp_insert_post( $post_args );

// 	    if( $post_id ) {
// 			wp_set_post_terms( $post_id, $json['browser']['name'], 'browser' );
// // 			wp_set_post_terms( $post_id, $json['wp']['post']['template'], 'template' );
// // 			might need to drop this... seems to be an issue with block themes
// 			wp_set_post_terms( $post_id, $json['wp']['post']['type'], 'type' );
// //			☝️ this line gives a PHP warning: Undefined array key "post"
// //			and then: Trying to access array offset on value of type null
// 			wp_set_post_terms( $post_id, $json['wp']['query'], 'query' );

// 			$todoterm = term_exists( 'to-do', 'status' );
// 			wp_set_post_terms( $post_id, $todoterm, 'status' );

// 			update_post_meta( $post_id, 'permalink', $json['browser']['url'] );
// 			update_post_meta( $post_id, 'server', json_encode( $json['server'] ) );
// 			update_post_meta( $post_id, 'session', json_encode( $json['session'] ) );
// 			update_post_meta( $post_id, 'get', json_encode( $json['get'] ) );
// 			update_post_meta( $post_id, 'post', json_encode( $json['post'] ) );
// 			update_post_meta( $post_id, 'query_vars', json_encode( $json['wp']['query_vars'] ) );
// 			update_post_meta( $post_id, 'active_plugins', json_encode( $json['wp']['active_plugins'] ) );
// 			update_post_meta( $post_id, 'screenshot', $json['screenshot'] );

// 			if( $json['wp']['query'] === 'singular' ) {
// 				wp_update_post( array(
// 					'ID' => $post_id,
// 					'post_parent' => $json['wp']['post']['id']
// 				));
// 			}
// 		}
	}
}

