<?php

/**
 * Alpaca Issue Tracker REST API: Comment Attachment Endpoints.
 *
 * @package AlpacaIssueTracker
 */

use AlpacaIssueTracker\Helpers;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register comment meta fields for REST API.
 */
function alpaistr_register_comment_meta_fields() {
	register_meta(
		'comment',
		'alpacaCommentTags',
		[
			'type'          => 'array',
			'description'   => 'Comment tags for Alpaca Issue Tracker issues.',
			'single'        => true,
			'show_in_rest'  => [
				'schema' => [
					'type'  => 'array',
					'items' => [
						'type' => 'string',
					],
				],
			],
			'auth_callback' => function () {
				return Helpers::user_can( 'register_comment_meta' );
			},
		]
	);

	register_meta(
		'comment',
		'alpacaCommentAttachments',
		[
			'type'          => 'array',
			'description'   => 'Attachment URLs for Alpaca Issue Tracker issue comments.',
			'single'        => true,
			'show_in_rest'  => [
				'schema' => [
					'type'  => 'array',
					'items' => [
						'type' => 'string',
					],
				],
			],
			'auth_callback' => function () {
				return Helpers::user_can( 'register_comment_meta' );
			},
		]
	);

	register_meta(
		'comment',
		'alpacaMentionedUsers',
		[
			'type'          => 'array',
			'description'   => 'Mentioned users for Alpaca Issue Tracker issue comments.',
			'single'        => true,
			'show_in_rest'  => [
				'schema' => [
					'type'  => 'array',
					'items' => [
						'type'       => 'object',
						'properties' => [
							'id'           => [
								'type' => 'integer',
							],
							'slug'         => [
								'type' => 'string',
							],
							'display_name' => [
								'type' => 'string',
							],
							'avatar'       => [
								'type' => 'string',
							],
						],
					],
				],
			],
			'auth_callback' => function () {
				return Helpers::user_can( 'register_comment_meta' );
			},
		]
	);

	register_meta(
		'comment',
		'alpacaCommentLastEdit',
		[
			'type'          => 'object',
			'description'   => 'Latest edit metadata for Alpaca Issue Tracker issue comments.',
			'single'        => true,
			'show_in_rest'  => [
				'schema' => [
					'type'       => 'object',
					'properties' => [
						'date'     => [
							'type'   => 'string',
							'format' => 'date-time',
						],
						'userId'   => [
							'type' => 'integer',
						],
						'userName' => [
							'type' => 'string',
						],
					],
				],
			],
			'auth_callback' => function () {
				return Helpers::user_can( 'register_comment_meta' );
			},
		]
	);

	register_meta(
		'comment',
		'alpacaNotificationContext',
		[
			'type'              => 'object',
			'description'       => 'Structured notification context for Alpaca Issue Tracker issue comments.',
			'single'            => true,
			'show_in_rest'      => [
				'schema' => [
					'type'                 => 'object',
					'additionalProperties' => true,
					'properties'           => [
						'action'            => [
							'type' => 'string',
						],
						'affected_user_ids' => [
							'type'  => 'array',
							'items' => [
								'type' => 'integer',
							],
						],
						'subissue_id'       => [
							'type' => 'integer',
						],
						'subissue_title'    => [
							'type' => 'string',
						],
					],
				],
			],
			'sanitize_callback' => 'alpaistr_sanitize_notification_context_meta',
			'auth_callback'     => function () {
				return Helpers::user_can( 'register_comment_meta' );
			},
		]
	);
}
add_action( 'rest_api_init', 'alpaistr_register_comment_meta_fields' );

/**
 * Build a standard error response for comment attachment actions.
 *
 * @param string $action_type Action identifier for the response.
 * @param string $message     Error message.
 * @param int    $status      HTTP status code.
 * @return WP_REST_Response REST response object.
 */
function alpaistr_comment_attachment_error_response( $action_type, $message, $status ) {
	return alpaistr_rest_response(
		$action_type,
		[
			'success' => false,
			'message' => esc_html( $message ),
		],
		$status
	);
}

/**
 * Validate and load the issue for attachment operations.
 *
 * @param int    $issue_id    Issue ID.
 * @param string $action_type Action identifier for the response.
 * @return array{issue: WP_Post|null, response: WP_REST_Response|null} Result array.
 */
function alpaistr_get_issue_for_attachment( $issue_id, $action_type ) {
	$issue = alpaistr_assert_issue_exists( $issue_id );

	if ( ! $issue ) {
		return [
			'issue'    => null,
			'response' => alpaistr_comment_attachment_error_response(
				$action_type,
				__( 'Invalid issue.', 'alpaca-issue-tracker' ),
				404
			),
		];
	}

	return [
		'issue'    => $issue,
		'response' => null,
	];
}

/**
 * Get the issue attachment subdirectory (relative to uploads base).
 *
 * @param WP_Post $issue    Issue post object.
 * @param int     $issue_id Issue ID.
 * @return string Relative subdirectory (no leading or trailing slash).
 */
function alpaistr_get_issue_attachment_subdir( $issue, $issue_id ) {
	$issue_slug = $issue->post_name ? $issue->post_name : 'issue-' . $issue_id;
	$issue_slug = sanitize_title( $issue_slug );

	return 'alpaca/' . $issue_slug;
}

/**
 * Get upload base paths for attachment handling.
 *
 * @return array{base_url: string, base_dir: string} Base URL and directory.
 */
function alpaistr_get_attachment_base_paths() {
	$upload_dir = wp_upload_dir();

	return [
		'base_url' => trailingslashit( $upload_dir['baseurl'] ),
		'base_dir' => trailingslashit( $upload_dir['basedir'] ),
	];
}

/**
 * Ensure file handling functions are available.
 *
 * @return void
 */
function alpaistr_require_file_functions() {
	if ( ! function_exists( 'wp_handle_sideload' ) || ! function_exists( 'wp_delete_file' ) ) {
		require_once ABSPATH . 'wp-admin/includes/file.php';
	}
}

/**
 * Register REST endpoint for issue comment attachments.
 */
function alpaistr_register_comment_attachment_endpoint() {
	register_rest_route(
		'alpaca/v1',
		'/comment-attachments',
		[
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'alpaistr_upload_comment_attachment',
			'permission_callback' => function ( WP_REST_Request $request ) {
				return Helpers::validate_rest_nonce_permission( $request, 'register_comment_meta' );
			},
			'args'                => [
				'issue_id' => [
					'type'              => 'integer',
					'required'          => true,
					'sanitize_callback' => 'absint',
				],
			],
		]
	);

	register_rest_route(
		'alpaca/v1',
		'/comment-attachments/delete',
		[
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'alpaistr_delete_comment_attachment',
			'permission_callback' => function ( WP_REST_Request $request ) {
				return Helpers::validate_rest_nonce_permission( $request, 'register_comment_meta' );
			},
			'args'                => [
				'issue_id'   => [
					'type'              => 'integer',
					'required'          => true,
					'sanitize_callback' => 'absint',
				],
				'comment_id' => [
					'type'              => 'integer',
					'required'          => false,
					'sanitize_callback' => 'absint',
				],
				'url'        => [
					'type'              => 'string',
					'required'          => true,
					'sanitize_callback' => 'esc_url_raw',
				],
			],
		]
	);
}
add_action( 'rest_api_init', 'alpaistr_register_comment_attachment_endpoint' );

/**
 * Upload an attachment for an issue comment.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response REST response object.
 */
function alpaistr_upload_comment_attachment( WP_REST_Request $request ) {
	$issue_id = (int) $request->get_param( 'issue_id' );
	$issue    = alpaistr_get_issue_for_attachment( $issue_id, 'comment_attachment_upload' );

	if ( $issue['response'] ) {
		return $issue['response'];
	}

	$file_params = $request->get_file_params();

	if ( empty( $file_params['file'] ) ) {
		return alpaistr_comment_attachment_error_response(
			'comment_attachment_upload',
			__( 'Missing attachment file.', 'alpaca-issue-tracker' ),
			400
		);
	}

	$file = $file_params['file'];

	$allowed_mimes = get_allowed_mime_types();
	$checked_type  = wp_check_filetype_and_ext( $file['tmp_name'], $file['name'], $allowed_mimes );

	if ( empty( $checked_type['type'] ) || empty( $checked_type['ext'] ) ) {
		return alpaistr_comment_attachment_error_response(
			'comment_attachment_upload',
			__( 'This file type is not allowed.', 'alpaca-issue-tracker' ),
			400
		);
	}

	$base_paths = alpaistr_get_attachment_base_paths();
	$subdir     = alpaistr_get_issue_attachment_subdir( $issue['issue'], $issue_id );
	$subdir     = '/' . $subdir;
	$target_dir = $base_paths['base_dir'] . ltrim( $subdir, '/' );

	if ( ! wp_mkdir_p( $target_dir ) ) {
		return alpaistr_comment_attachment_error_response(
			'comment_attachment_upload',
			__( 'Failed to prepare upload directory.', 'alpaca-issue-tracker' ),
			500
		);
	}

	$upload_dir_filter = function ( $dirs ) use ( $subdir ) {
		$dirs['subdir'] = $subdir;
		$dirs['path']   = $dirs['basedir'] . $subdir;
		$dirs['url']    = $dirs['baseurl'] . $subdir;
		return $dirs;
	};

	add_filter( 'upload_dir', $upload_dir_filter );

	alpaistr_require_file_functions();

	$uploaded = wp_handle_sideload(
		$file,
		[
			'test_form' => false,
			'mimes'     => $allowed_mimes,
		]
	);

	remove_filter( 'upload_dir', $upload_dir_filter );

	if ( isset( $uploaded['error'] ) ) {
		$upload_error = function_exists( 'wp_handle_upload_error' )
			? wp_handle_upload_error( $file, $uploaded['error'] )
			: $uploaded;

		return alpaistr_comment_attachment_error_response(
			'comment_attachment_upload',
			$upload_error['error'],
			500
		);
	}

	return alpaistr_rest_response(
		'comment_attachment_upload',
		[
			'success' => true,
			'url'     => esc_url_raw( $uploaded['url'] ),
			'name'    => sanitize_file_name( wp_basename( $uploaded['file'] ) ),
			'mime'    => sanitize_text_field( $uploaded['type'] ),
		],
		200
	);
}

/**
 * Resolve the issue comment that currently references an attachment URL.
 *
 * @param int    $issue_id Issue ID.
 * @param string $url      Attachment URL.
 * @return WP_Comment|null Matching issue comment, or null when not found.
 */
function alpaistr_get_comment_for_attachment_url( $issue_id, $url ) {
	$comments = get_comments(
		[
			'post_id' => (int) $issue_id,
			'type'    => 'issuecomment',
			'status'  => 'all',
		]
	);

	foreach ( $comments as $comment ) {
		$attachments = get_comment_meta( $comment->comment_ID, 'alpacaCommentAttachments', true );

		if ( ! is_array( $attachments ) ) {
			continue;
		}

		$normalized_attachments = array_map( 'esc_url_raw', $attachments );
		if ( in_array( esc_url_raw( $url ), $normalized_attachments, true ) ) {
			return $comment;
		}
	}

	return null;
}

/**
 * Determine whether a specific issue comment references the attachment URL.
 *
 * @param int    $comment_id Comment ID.
 * @param string $url        Attachment URL.
 * @return bool True when URL is present in comment attachment meta, false otherwise.
 */
function alpaistr_comment_contains_attachment_url( $comment_id, $url ) {
	$attachments = get_comment_meta( (int) $comment_id, 'alpacaCommentAttachments', true );

	if ( ! is_array( $attachments ) ) {
		return false;
	}

	$normalized_attachments = array_map( 'esc_url_raw', $attachments );

	return in_array( esc_url_raw( $url ), $normalized_attachments, true );
}

/**
 * Delete an attachment for an issue comment.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response REST response object.
 */
function alpaistr_delete_comment_attachment( WP_REST_Request $request ) {
	$issue_id   = (int) $request->get_param( 'issue_id' );
	$comment_id = (int) $request->get_param( 'comment_id' );
	$url        = (string) $request->get_param( 'url' );
	$issue      = alpaistr_get_issue_for_attachment( $issue_id, 'comment_attachment_delete' );

	if ( $issue['response'] ) {
		return $issue['response'];
	}

	if ( empty( $url ) ) {
		return alpaistr_comment_attachment_error_response(
			'comment_attachment_delete',
			__( 'Missing attachment URL.', 'alpaca-issue-tracker' ),
			400
		);
	}

	$attachment_comment = null;

	if ( $comment_id > 0 ) {
		$attachment_comment = get_comment( $comment_id );

		if ( ! ( $attachment_comment instanceof WP_Comment ) ) {
			return alpaistr_comment_attachment_error_response(
				'comment_attachment_delete',
				__( 'Comment was not found.', 'alpaca-issue-tracker' ),
				404
			);
		}

		if ( (int) $attachment_comment->comment_post_ID !== $issue_id || 'issuecomment' !== (string) $attachment_comment->comment_type ) {
			return alpaistr_comment_attachment_error_response(
				'comment_attachment_delete',
				__( 'Comment does not match this issue.', 'alpaca-issue-tracker' ),
				400
			);
		}

		if ( ! alpaistr_comment_contains_attachment_url( $comment_id, $url ) ) {
			return alpaistr_comment_attachment_error_response(
				'comment_attachment_delete',
				__( 'Attachment does not belong to this comment.', 'alpaca-issue-tracker' ),
				400
			);
		}
	} else {
		$attachment_comment = alpaistr_get_comment_for_attachment_url( $issue_id, $url );

		if ( $attachment_comment instanceof WP_Comment ) {
			return alpaistr_comment_attachment_error_response(
				'comment_attachment_delete',
				__( 'Comment ID is required to delete this attachment.', 'alpaca-issue-tracker' ),
				400
			);
		}
	}

	if ( $attachment_comment instanceof WP_Comment ) {
		$current_user_id       = (int) get_current_user_id();
		$is_comment_author     = $current_user_id > 0 && (int) $attachment_comment->user_id === $current_user_id;
		$user_can_manage       = current_user_can( 'manage_options' );
		$can_delete_attachment = $is_comment_author || $user_can_manage;

		if ( ! $can_delete_attachment ) {
			return alpaistr_comment_attachment_error_response(
				'comment_attachment_delete',
				__( 'You are not allowed to delete this attachment.', 'alpaca-issue-tracker' ),
				403
			);
		}
	}

	$base_paths = alpaistr_get_attachment_base_paths();
	$subdir     = alpaistr_get_issue_attachment_subdir( $issue['issue'], $issue_id );
	$subdir     = trailingslashit( $subdir );

	if ( strpos( $url, $base_paths['base_url'] . $subdir ) !== 0 ) {
		return alpaistr_comment_attachment_error_response(
			'comment_attachment_delete',
			__( 'Attachment URL is not valid.', 'alpaca-issue-tracker' ),
			400
		);
	}

	$relative_path = ltrim( str_replace( $base_paths['base_url'], '', $url ), '/' );
	$relative_path = wp_normalize_path( rawurldecode( $relative_path ) );
	$file_path     = wp_normalize_path( $base_paths['base_dir'] . $relative_path );
	$issue_dir     = wp_normalize_path( trailingslashit( $base_paths['base_dir'] . $subdir ) );
	$issue_dir_raw = realpath( $issue_dir );
	$file_dir_raw  = realpath( dirname( $file_path ) );

	if ( false === $issue_dir_raw || false === $file_dir_raw ) {
		return alpaistr_comment_attachment_error_response(
			'comment_attachment_delete',
			__( 'Attachment path is not valid.', 'alpaca-issue-tracker' ),
			400
		);
	}

	$issue_dir = trailingslashit( wp_normalize_path( $issue_dir_raw ) );
	$file_dir  = trailingslashit( wp_normalize_path( $file_dir_raw ) );

	if ( 0 !== strpos( $file_dir, $issue_dir ) ) {
		return alpaistr_comment_attachment_error_response(
			'comment_attachment_delete',
			__( 'Attachment path is not valid.', 'alpaca-issue-tracker' ),
			400
		);
	}

	if ( ! file_exists( $file_path ) ) {
		return alpaistr_comment_attachment_error_response(
			'comment_attachment_delete',
			__( 'Attachment not found.', 'alpaca-issue-tracker' ),
			404
		);
	}

	alpaistr_require_file_functions();

	$deleted = wp_delete_file( $file_path );

	if ( ! $deleted ) {
		return alpaistr_comment_attachment_error_response(
			'comment_attachment_delete',
			__( 'Failed to delete attachment.', 'alpaca-issue-tracker' ),
			500
		);
	}

	return alpaistr_rest_response(
		'comment_attachment_delete',
		[
			'success' => true,
			'message' => esc_html__( 'Attachment deleted.', 'alpaca-issue-tracker' ),
		],
		200
	);
}
