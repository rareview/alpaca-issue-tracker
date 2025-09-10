<?php

function alpaca_activate() {
    add_option( 'alpaca_needs_term_setup', true );
    flush_rewrite_rules();
}

add_action( 'init', 'alpaca_setup_default_terms', 20 );
function alpaca_setup_default_terms() {
    if ( get_option( 'alpaca_needs_term_setup' ) ) {

        $statuses = alpaca_get_statuses();
        if ( empty( $statuses ) ) {
            $default_statuses = array(
                "-1" => "Backlog",
                "0" => "Inbox",
                "1" => "Next",
                "2" => "In Progress",
                "3" => "Done",
            );
            foreach ( $default_statuses as $index => $name ) {
                $term_data = wp_insert_term( $name, 'status' );
                if ( ! is_wp_error( $term_data ) ) {
                    $status_id = $term_data['term_id'];
                    update_term_meta( $status_id, 'term_score', $index );

                    if( $index === "0" ) {
                        update_option( 'alpaca_default_status_id', $status_id );
                    }
                }
            }
        }
        
        delete_option( 'alpaca_needs_term_setup' );
    }
}