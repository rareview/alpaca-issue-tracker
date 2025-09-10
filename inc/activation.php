<?php

function alpaca_activate() {
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
            $status_id = wp_insert_term( $name, 'status' );
            update_term_meta( $status_id, 'term_score', $index );

            if( $index === "0" ) {
                update_option( 'alpaca_default_status_id', $status_id );
            }

        }
        

    }

}


