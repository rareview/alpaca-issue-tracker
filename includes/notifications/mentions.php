<?php

/**
 * Notification mention helpers for Alpaca Issue Tracker issue activity emails.
 *
 * @package AlpacaIssueTracker
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
function alpaistr_extract_mention_slugs_from_content( $content ) {
	$content = is_string( $content ) ? $content : '';
	if ( '' === $content ) {
		return [];
	}

	preg_match_all( '/(^|[\s>\(\[\{])@([a-zA-Z0-9._-]+)/', $content, $matches );
	if ( empty( $matches[2] ) || ! is_array( $matches[2] ) ) {
		return [];
	}

	$slugs = [];
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
function alpaistr_resolve_mention_users( $slugs ) {
	$slugs = array_values( array_unique( array_filter( array_map( 'sanitize_user', (array) $slugs ) ) ) );
	if ( empty( $slugs ) ) {
		return [];
	}

	$users = get_users(
		[
			'slug__in' => $slugs,
			'fields'   => [ 'ID', 'display_name', 'user_nicename', 'user_email' ],
		]
	);
	if ( empty( $users ) ) {
		return [];
	}

	$mentions = [];
	foreach ( $users as $user ) {
		$avatar_url = get_avatar_url(
			$user->ID,
			[
				'size' => 48,
			]
		);

		$mentions[] = [
			'id'           => (int) $user->ID,
			'slug'         => (string) $user->user_nicename,
			'display_name' => (string) $user->display_name,
			'avatar'       => is_string( $avatar_url ) ? $avatar_url : '',
		];
	}

	return $mentions;
}

/**
 * Synchronize mentioned user metadata for a comment.
 *
 * @param int $comment_id Comment ID.
 * @return array<int, array<string, mixed>> Mention records.
 */
function alpaistr_sync_comment_mentions( $comment_id ) {
	$comment = get_comment( (int) $comment_id );
	if ( ! ( $comment instanceof WP_Comment ) ) {
		return [];
	}

	$slugs    = alpaistr_extract_mention_slugs_from_content( $comment->comment_content );
	$mentions = alpaistr_resolve_mention_users( $slugs );

	if ( empty( $mentions ) ) {
		delete_comment_meta( $comment->comment_ID, 'alpacaMentionedUsers' );
		return [];
	}

	update_comment_meta( $comment->comment_ID, 'alpacaMentionedUsers', $mentions );

	return $mentions;
}

/**
 * Update mention metadata when a comment is edited.
 *
 * @param int $comment_id Comment ID.
 * @return void
 */
function alpaistr_handle_comment_mentions_after_edit( $comment_id ) {
	$comment = get_comment( (int) $comment_id );
	if ( ! ( $comment instanceof WP_Comment ) ) {
		return;
	}

	if ( 'issuecomment' !== $comment->comment_type ) {
		return;
	}

	alpaistr_sync_comment_mentions( $comment_id );
}
add_action( 'edit_comment', 'alpaistr_handle_comment_mentions_after_edit' );
