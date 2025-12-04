<?php
/**
 * Simplified solution to allow duplicate (automated) comments on issues.
 *
 * @package Alpaca
 */

add_filter(
	'duplicate_comment_id',
	function ( $dupe_id, $commentdata ) {
		if ( get_post_type( $commentdata['comment_post_ID'] ) === 'alpaca_issue' ) {
			return false;
		}
		return $dupe_id;
	},
	10,
	2
);
