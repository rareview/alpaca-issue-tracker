<?php

function alpaca_activate() {
    $statuses = alpaca_get_statuses();
    if ( empty( $statuses ) ) {
        $default_statuses = array(
            "-2" => "Future",
            "-1" => "Backlog",
            "0" => "Inbox",
            "1" => "To Do",
            "2" => "Doing",
            "3" => "Done",
            "4" => "Archive"
        );
        foreach ( $default_statuses as $index => $name ) {
            $status_id = wp_insert_term( $name, 'status' );
            update_term_meta( $status_id, 'term_score', $index );
        }
    }

}


