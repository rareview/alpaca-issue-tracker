<?php
/**
 * Alpaca REST API: Comment Response Filter.
 *
 * @package Alpaca
 */

/**
 * Expose basic author details in REST comment responses for Alpaca issue comments.
 * This ensures that users with lower privileges can still see the author's name
 * and avatar even if they cannot list users via the standard REST endpoint.
 */
add_filter(
	'rest_prepare_comment',
	function ( $response, $comment ) {
		if ( 'issuecomment' === $comment->comment_type ) {
			$author_id = (int) $comment->user_id;
			if ( $author_id > 0 ) {
				// Include standard fields that our User component expects.
				$response->data['author_details'] = array(
					'id'           => $author_id,
					'name'         => get_the_author_meta( 'display_name', $author_id ),
					'display_name' => get_the_author_meta( 'display_name', $author_id ),
					'avatar'       => alpaca_avatar( $author_id, 48 ),
					'avatar_urls'  => array(
						'24' => alpaca_avatar( $author_id, 24 ),
						'48' => alpaca_avatar( $author_id, 48 ),
						'96' => alpaca_avatar( $author_id, 96 ),
					),
				);
			}
		}
		return $response;
	},
	10,
	3
);
