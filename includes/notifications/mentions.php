<?php
/**
 * Notification mention helpers for Alpaca issue activity emails.
 *
 * @package Alpaca
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Extract @mention slugs from comment content.
 *
 * @param string $content Raw comment content.
 * @return string[] Mention slugs.
 */
function alpaca_extract_mention_slugs_from_content( $content ) {
	$content = is_string( $content ) ? $content : '';
	if ( '' === $content ) {
		return array();
	}

	preg_match_all( '/(^|[\s>\(\[\{])@([a-zA-Z0-9._-]+)/', $content, $matches );
	if ( empty( $matches[2] ) || ! is_array( $matches[2] ) ) {
		return array();
	}

	$slugs = array();
	foreach ( $matches[2] as $slug ) {
		$slug = sanitize_user( (string) $slug, true );
		if ( '' !== $slug ) {
			$slugs[] = $slug;
		}
	}

	return array_values( array_unique( $slugs ) );
}

/**
 * Resolve mention user data by slug.
 *
 * @param string[] $slugs Mention slugs.
 * @return array<int, array<string, mixed>> Mention user records.
 */
function alpaca_resolve_mention_users( $slugs ) {
	$slugs = array_values( array_unique( array_filter( array_map( 'sanitize_user', (array) $slugs ) ) ) );
	if ( empty( $slugs ) ) {
		return array();
	}

	$users = get_users(
		array(
			'slug__in' => $slugs,
			'fields'   => array( 'ID', 'display_name', 'user_nicename', 'user_email' ),
		)
	);
	if ( empty( $users ) ) {
		return array();
	}

	$mentions = array();
	foreach ( $users as $user ) {
		$mentions[] = array(
			'id'           => (int) $user->ID,
			'slug'         => (string) $user->user_nicename,
			'display_name' => (string) $user->display_name,
		);
	}

	return $mentions;
}

/**
 * Synchronize mentioned user metadata for a comment.
 *
 * @param int $comment_id Comment ID.
 * @return array<int, array<string, mixed>> Mention records.
 */
function alpaca_sync_comment_mentions( $comment_id ) {
	$comment = get_comment( (int) $comment_id );
	if ( ! ( $comment instanceof WP_Comment ) ) {
		return array();
	}

	$slugs    = alpaca_extract_mention_slugs_from_content( $comment->comment_content );
	$mentions = alpaca_resolve_mention_users( $slugs );
	update_comment_meta( $comment->comment_ID, 'alpacaMentionedUsers', $mentions );

	return $mentions;
}

/**
 * Update mention metadata when a comment is edited.
 *
 * @param int $comment_id Comment ID.
 * @return void
 */
function alpaca_handle_comment_mentions_after_edit( $comment_id ) {
	$comment = get_comment( (int) $comment_id );
	if ( ! ( $comment instanceof WP_Comment ) ) {
		return;
	}

	if ( 'issuecomment' !== $comment->comment_type ) {
		return;
	}

	alpaca_sync_comment_mentions( $comment_id );
}
add_action( 'edit_comment', 'alpaca_handle_comment_mentions_after_edit' );
