<?php
/**
 * Notification event helpers for Alpaca issue activity emails.
 *
 * @package Alpaca
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Return issue assignee IDs for an issue.
 *
 * @param int $issue_id Issue ID.
 * @return int[] Assignee user IDs.
 */
function alpaca_get_issue_assignee_ids( $issue_id ) {
	$terms = wp_get_post_terms( (int) $issue_id, 'alpaca_assignee', array( 'fields' => 'all' ) );
	if ( is_wp_error( $terms ) || empty( $terms ) ) {
		return array();
	}

	$slugs = array();
	foreach ( $terms as $term ) {
		$slugs[] = (string) $term->slug;
	}
	$slugs = array_values( array_unique( array_filter( $slugs ) ) );
	if ( empty( $slugs ) ) {
		return array();
	}

	$users = get_users(
		array(
			'slug__in' => $slugs,
			'fields'   => array( 'ID' ),
		)
	);

	$ids = array();
	foreach ( $users as $user ) {
		$ids[] = (int) $user->ID;
	}

	return array_values( array_unique( array_filter( $ids ) ) );
}

/**
 * Return watcher user IDs for an issue.
 *
 * @param int $issue_id Issue ID.
 * @return int[] Watcher user IDs.
 */
function alpaca_get_issue_watcher_ids( $issue_id ) {
	$terms = wp_get_post_terms( (int) $issue_id, 'alpaca_watching', array( 'fields' => 'all' ) );
	if ( is_wp_error( $terms ) || empty( $terms ) ) {
		return array();
	}

	$slugs = array();
	foreach ( $terms as $term ) {
		$slugs[] = (string) $term->slug;
	}
	$slugs = array_values( array_unique( array_filter( $slugs ) ) );
	if ( empty( $slugs ) ) {
		return array();
	}

	$users = get_users(
		array(
			'slug__in' => $slugs,
			'fields'   => array( 'ID' ),
		)
	);

	$ids = array();
	foreach ( $users as $user ) {
		$ids[] = (int) $user->ID;
	}

	return array_values( array_unique( array_filter( $ids ) ) );
}

/**
 * Return label term IDs for an issue.
 *
 * @param int $issue_id Issue ID.
 * @return int[] Label term IDs.
 */
function alpaca_get_issue_label_ids( $issue_id ) {
	$terms = wp_get_post_terms(
		(int) $issue_id,
		'alpaca_label',
		array(
			'fields' => 'ids',
		)
	);

	if ( is_wp_error( $terms ) || ! is_array( $terms ) ) {
		return array();
	}

	return array_values( array_unique( array_filter( array_map( 'absint', $terms ) ) ) );
}

/**
 * Get the issue URL used in email notifications.
 *
 * @param WP_Post $issue Issue post object.
 * @return string URL.
 */
function alpaca_get_notification_issue_url( $issue ) {
	return admin_url( 'admin.php?page=project-board&issue=' . rawurlencode( (string) $issue->post_name ) );
}

/**
 * Determine the event family for a comment.
 *
 * @param WP_Comment $comment Comment object.
 * @return string Event family slug.
 */
function alpaca_get_notification_event_family_for_comment( $comment ) {
	$tags  = get_comment_meta( $comment->comment_ID, 'alpacaCommentTags', true );
	$tags  = is_array( $tags ) ? $tags : array();
	$agent = (string) $comment->comment_agent;

	if ( 'audit' !== $agent ) {
		return 'human_comments';
	}

	if ( in_array( 'status-changed', $tags, true ) ) {
		return 'status_changes';
	}

	if ( in_array( 'assignee-changed', $tags, true ) ) {
		return 'issue_assignment_changes';
	}

	if ( in_array( 'deadline-changed', $tags, true ) ) {
		return 'due_date_changes';
	}

	if ( in_array( 'subissue-created', $tags, true ) || in_array( 'subissue-deleted', $tags, true ) ) {
		return 'checklist_created_deleted';
	}

	if ( in_array( 'subissue-assignee-changed', $tags, true ) ) {
		return 'checklist_assignment_changes';
	}

	if ( in_array( 'subissue-completion-changed', $tags, true ) ) {
		return 'checklist_completion_changes';
	}

	if ( in_array( 'subissue-promoted', $tags, true ) ) {
		return 'checklist_promotions';
	}

	if ( in_array( 'priority-changed', $tags, true ) ) {
		return 'priority_changes';
	}

	return 'human_comments';
}

/**
 * Return a human-friendly label for an event.
 *
 * @param string               $event_family Event family slug.
 * @param array<string, mixed> $comment      Comment payload.
 * @return string Event label.
 */
function alpaca_get_notification_event_label( $event_family, $comment = array() ) {
	$context = isset( $comment['context'] ) && is_array( $comment['context'] ) ? $comment['context'] : array();
	$tags    = isset( $comment['tags'] ) && is_array( $comment['tags'] ) ? $comment['tags'] : array();
	$action  = isset( $context['action'] ) ? sanitize_key( (string) $context['action'] ) : '';

	switch ( $event_family ) {
		case 'human_comments':
			if ( in_array( 'issue-created', $tags, true ) ) {
				return esc_html__( 'Issue added', 'alpaca' );
			}

			return esc_html__( 'Comment added', 'alpaca' );

		case 'status_changes':
			return esc_html__( 'Status changed', 'alpaca' );

		case 'issue_assignment_changes':
			if ( 'assign' === $action ) {
				return esc_html__( 'Issue assigned', 'alpaca' );
			}

			if ( 'unassign' === $action ) {
				return esc_html__( 'Issue unassigned', 'alpaca' );
			}

			return esc_html__( 'Issue assignment changed', 'alpaca' );

		case 'due_date_changes':
			if ( 'added' === $action ) {
				return esc_html__( 'Due date set', 'alpaca' );
			}

			if ( 'deleted' === $action ) {
				return esc_html__( 'Due date removed', 'alpaca' );
			}

			return esc_html__( 'Due date changed', 'alpaca' );

		case 'checklist_created_deleted':
			if ( 'create' === $action ) {
				return esc_html__( 'Checklist item created', 'alpaca' );
			}

			if ( 'delete' === $action ) {
				return esc_html__( 'Checklist item deleted', 'alpaca' );
			}

			return esc_html__( 'Checklist updated', 'alpaca' );

		case 'checklist_assignment_changes':
			if ( 'assign' === $action ) {
				return esc_html__( 'Checklist item assigned', 'alpaca' );
			}

			if ( 'unassign' === $action ) {
				return esc_html__( 'Checklist item unassigned', 'alpaca' );
			}

			return esc_html__( 'Checklist assignment changed', 'alpaca' );

		case 'checklist_completion_changes':
			if ( 'complete' === $action ) {
				return esc_html__( 'Checklist item completed', 'alpaca' );
			}

			if ( 'reopen' === $action ) {
				return esc_html__( 'Checklist item reopened', 'alpaca' );
			}

			return esc_html__( 'Checklist completion changed', 'alpaca' );

		case 'checklist_promotions':
			return esc_html__( 'Checklist item promoted', 'alpaca' );

		case 'priority_changes':
			if ( 'enable' === $action ) {
				return esc_html__( 'High priority enabled', 'alpaca' );
			}

			if ( 'disable' === $action ) {
				return esc_html__( 'High priority removed', 'alpaca' );
			}

			return esc_html__( 'Priority changed', 'alpaca' );
	}

	return esc_html__( 'Issue activity updated', 'alpaca' );
}

/**
 * Get structured notification context data from comment meta.
 *
 * @param int $comment_id Comment ID.
 * @return array<string, mixed> Structured context data.
 */
function alpaca_get_comment_notification_context( $comment_id ) {
	$context = get_comment_meta( (int) $comment_id, 'alpacaNotificationContext', true );

	if ( ! is_array( $context ) ) {
		return array();
	}

	return $context;
}

/**
 * Determine whether an event represents a newly created task.
 *
 * @param array<string, mixed> $event Notification event.
 * @return bool True when the event is a new task event.
 */
function alpaca_is_notification_new_task_event( $event ) {
	$event_family = isset( $event['event_family'] ) ? (string) $event['event_family'] : '';
	$tags         = isset( $event['comment']['tags'] ) && is_array( $event['comment']['tags'] ) ? $event['comment']['tags'] : array();
	$context      = isset( $event['comment']['context'] ) && is_array( $event['comment']['context'] ) ? $event['comment']['context'] : array();
	$action       = isset( $context['action'] ) ? sanitize_key( (string) $context['action'] ) : '';

	if ( 'human_comments' === $event_family && in_array( 'issue-created', $tags, true ) ) {
		return true;
	}

	if ( 'checklist_created_deleted' === $event_family && 'create' === $action ) {
		return true;
	}

	return false;
}

/**
 * Build the normalized notification event for a comment.
 *
 * @param WP_Comment $comment Comment object.
 * @return array<string, mixed>|null Normalized event or null when invalid.
 */
function alpaca_get_notification_event_from_comment( $comment ) {
	if ( ! ( $comment instanceof WP_Comment ) ) {
		return null;
	}

	if ( 'issuecomment' !== $comment->comment_type ) {
		return null;
	}

	$issue = get_post( (int) $comment->comment_post_ID );
	if ( ! ( $issue instanceof WP_Post ) || 'alpaca_issue' !== $issue->post_type ) {
		return null;
	}

	$family               = alpaca_get_notification_event_family_for_comment( $comment );
	$tags                 = get_comment_meta( $comment->comment_ID, 'alpacaCommentTags', true );
	$attachments          = get_comment_meta( $comment->comment_ID, 'alpacaCommentAttachments', true );
	$mentioned_users      = get_comment_meta( $comment->comment_ID, 'alpacaMentionedUsers', true );
	$notification_context = alpaca_get_comment_notification_context( $comment->comment_ID );
	$actor_id             = (int) $comment->user_id;
	$actor                = $actor_id > 0 ? get_user_by( 'id', $actor_id ) : null;
	$assignee_ids         = alpaca_get_issue_assignee_ids( $issue->ID );
	$watcher_ids          = alpaca_get_issue_watcher_ids( $issue->ID );
	$label_ids            = alpaca_get_issue_label_ids( $issue->ID );

	return array(
		'comment_id'   => (int) $comment->comment_ID,
		'comment'      => array(
			'id'           => (int) $comment->comment_ID,
			'raw'          => (string) $comment->comment_content,
			'tags'         => is_array( $tags ) ? $tags : array(),
			'attachments'  => is_array( $attachments ) ? $attachments : array(),
			'mentions'     => is_array( $mentioned_users ) ? $mentioned_users : array(),
			'context'      => $notification_context,
			'author_agent' => (string) $comment->comment_agent,
		),
		'actor'        => array(
			'id'           => $actor instanceof WP_User ? (int) $actor->ID : 0,
			'display_name' => $actor instanceof WP_User ? (string) $actor->display_name : esc_html__( 'Unknown user', 'alpaca' ),
			'email'        => $actor instanceof WP_User ? (string) $actor->user_email : '',
		),
		'event_family' => $family,
		'event_label'  => alpaca_get_notification_event_label(
			$family,
			array(
				'tags'    => is_array( $tags ) ? $tags : array(),
				'context' => $notification_context,
			)
		),
		'issue'        => array(
			'id'           => (int) $issue->ID,
			'title'        => (string) $issue->post_title,
			'slug'         => (string) $issue->post_name,
			'url'          => alpaca_get_notification_issue_url( $issue ),
			'creator_id'   => (int) $issue->post_author,
			'assignee_ids' => $assignee_ids,
			'watcher_ids'  => $watcher_ids,
			'label_ids'    => $label_ids,
		),
		'site'         => array(
			'title'   => wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES ),
			'tagline' => wp_specialchars_decode( get_bloginfo( 'description' ), ENT_QUOTES ),
			'url'     => home_url( '/' ),
		),
		'timestamp'    => get_comment_date( 'c', $comment ),
	);
}

/**
 * Build a sample notification event used by preview and test-send.
 *
 * @return array<string, mixed> Sample event data.
 */
function alpaca_get_notification_sample_event() {
	$current_user = wp_get_current_user();
	$actor_name   = $current_user instanceof WP_User && $current_user->exists() ? (string) $current_user->display_name : esc_html__( 'Alpaca User', 'alpaca' );

	return array(
		'comment_id'   => 0,
		'comment'      => array(
			'id'           => 0,
			'raw'          => esc_html__( 'This is a sample notification comment. It includes the full comment content exactly as the email will render it.', 'alpaca' ),
			'tags'         => array( 'sample' ),
			'attachments'  => array(),
			'mentions'     => array(),
			'context'      => array(),
			'author_agent' => 'human',
		),
		'actor'        => array(
			'id'           => $current_user instanceof WP_User ? (int) $current_user->ID : 0,
			'display_name' => $actor_name,
			'email'        => $current_user instanceof WP_User ? (string) $current_user->user_email : '',
		),
		'event_family' => 'human_comments',
		'event_label'  => esc_html__( 'Comment added', 'alpaca' ),
		'issue'        => array(
			'id'           => 0,
			'title'        => esc_html__( 'Sample issue title', 'alpaca' ),
			'slug'         => 'sample-issue-title',
			'url'          => admin_url( 'admin.php?page=project-board&issue=sample-issue-title' ),
			'creator_id'   => $current_user instanceof WP_User ? (int) $current_user->ID : 0,
			'assignee_ids' => array(),
			'watcher_ids'  => array(),
			'label_ids'    => array(),
		),
		'site'         => array(
			'title'   => wp_specialchars_decode( get_bloginfo( 'name' ), ENT_QUOTES ),
			'tagline' => wp_specialchars_decode( get_bloginfo( 'description' ), ENT_QUOTES ),
			'url'     => home_url( '/' ),
		),
		'timestamp'    => gmdate( 'c' ),
	);
}
