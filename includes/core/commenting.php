<?php
/**
 * Simplified solution to allow duplicate (automated) comments on issues.
 *
 * I tried using the 'duplicate_comment_id' filter but commentdata['comment_type']
 * was wrong, so this solution bypasses the duplicate check for issue post types.
 *
 * @package Alpaca
 */

add_filter(
	'duplicate_comment_id',
	function ( $dupe_id, $commentdata ) {
		if ( get_post_type( $commentdata['comment_post_ID'] ) === 'issue' ) {
			return false;
		}
		return $dupe_id;
	},
	10,
	2
);
