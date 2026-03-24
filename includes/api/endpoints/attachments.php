<?php
/**
 * Alpaca REST API: Comment Attachment Endpoints.
 *
 * @package Alpaca
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register comment meta fields for REST API.
 */
function alpaca_register_comment_meta_fields() {
	register_meta(
		'comment',
		'alpacaCommentTags',
		array(
			'type'          => 'array',
			'description'   => 'Comment tags for Alpaca issues.',
			'single'        => true,
			'show_in_rest'  => array(
				'schema' => array(
					'type'  => 'array',
					'items' => array(
						'type' => 'string',
					),
				),
			),
			'auth_callback' => function () {
				return \Alpaca\Inc\Helpers::user_can( 'register_comment_meta' );
			},
		)
	);

	register_meta(
		'comment',
		'alpacaCommentAttachments',
		array(
			'type'          => 'array',
			'description'   => 'Attachment URLs for Alpaca issue comments.',
			'single'        => true,
			'show_in_rest'  => array(
				'schema' => array(
					'type'  => 'array',
					'items' => array(
						'type' => 'string',
					),
				),
			),
			'auth_callback' => function () {
				return \Alpaca\Inc\Helpers::user_can( 'register_comment_meta' );
			},
		)
	);

	register_meta(
		'comment',
		'alpacaMentionedUsers',
		array(
			'type'          => 'array',
			'description'   => 'Mentioned users for Alpaca issue comments.',
			'single'        => true,
			'show_in_rest'  => array(
				'schema' => array(
					'type'  => 'array',
					'items' => array(
						'type'       => 'object',
						'properties' => array(
							'id'           => array(
								'type' => 'integer',
							),
							'slug'         => array(
								'type' => 'string',
							),
							'display_name' => array(
								'type' => 'string',
							),
							'avatar'       => array(
								'type' => 'string',
							),
						),
					),
				),
			),
			'auth_callback' => function () {
				return \Alpaca\Inc\Helpers::user_can( 'register_comment_meta' );
			},
		)
	);

	register_meta(
		'comment',
		'alpacaCommentLastEdit',
		array(
			'type'          => 'object',
			'description'   => 'Latest edit metadata for Alpaca issue comments.',
			'single'        => true,
			'show_in_rest'  => array(
				'schema' => array(
					'type'       => 'object',
					'properties' => array(
						'date'     => array(
							'type'   => 'string',
							'format' => 'date-time',
						),
						'userId'   => array(
							'type' => 'integer',
						),
						'userName' => array(
							'type' => 'string',
						),
					),
				),
			),
			'auth_callback' => function () {
				return \Alpaca\Inc\Helpers::user_can( 'register_comment_meta' );
			},
		)
	);

	register_meta(
		'comment',
		'alpacaNotificationContext',
		array(
			'type'              => 'object',
			'description'       => 'Structured notification context for Alpaca issue comments.',
			'single'            => true,
			'show_in_rest'      => array(
				'schema' => array(
					'type'                 => 'object',
					'additionalProperties' => true,
					'properties'           => array(
						'action'            => array(
							'type' => 'string',
						),
						'affected_user_ids' => array(
							'type'  => 'array',
							'items' => array(
								'type' => 'integer',
							),
						),
						'subissue_id'       => array(
							'type' => 'integer',
						),
						'subissue_title'    => array(
							'type' => 'string',
						),
					),
				),
			),
			'sanitize_callback' => 'alpaca_sanitize_notification_context_meta',
			'auth_callback'     => function () {
				return \Alpaca\Inc\Helpers::user_can( 'register_comment_meta' );
			},
		)
	);
}
add_action( 'rest_api_init', 'alpaca_register_comment_meta_fields' );

/**
 * Build a standard error response for comment attachment actions.
 *
 * @param string $action_type Action identifier for the response.
 * @param string $message     Error message.
 * @param int    $status      HTTP status code.
 * @return WP_REST_Response REST response object.
 */
function alpaca_comment_attachment_error_response( $action_type, $message, $status ) {
	return alpaca_rest_response(
		$action_type,
		array(
			'success' => false,
			'message' => esc_html( $message ),
		),
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
function alpaca_get_issue_for_attachment( $issue_id, $action_type ) {
	$issue = alpaca_assert_issue_exists( $issue_id );

	if ( ! $issue ) {
		return array(
			'issue'    => null,
			'response' => alpaca_comment_attachment_error_response(
				$action_type,
				__( 'Invalid issue.', 'alpaca' ),
				404
			),
		);
	}

	return array(
		'issue'    => $issue,
		'response' => null,
	);
}

/**
 * Get the issue attachment subdirectory (relative to uploads base).
 *
 * @param WP_Post $issue    Issue post object.
 * @param int     $issue_id Issue ID.
 * @return string Relative subdirectory (no leading or trailing slash).
 */
function alpaca_get_issue_attachment_subdir( $issue, $issue_id ) {
	$issue_slug = $issue->post_name ? $issue->post_name : 'issue-' . $issue_id;
	$issue_slug = sanitize_title( $issue_slug );

	return 'alpaca/' . $issue_slug;
}

/**
 * Get upload base paths for attachment handling.
 *
 * @return array{base_url: string, base_dir: string} Base URL and directory.
 */
function alpaca_get_attachment_base_paths() {
	$upload_dir = wp_upload_dir();

	return array(
		'base_url' => trailingslashit( $upload_dir['baseurl'] ),
		'base_dir' => trailingslashit( $upload_dir['basedir'] ),
	);
}

/**
 * Ensure file handling functions are available.
 *
 * @return void
 */
function alpaca_require_file_functions() {
	if ( ! function_exists( 'wp_handle_sideload' ) || ! function_exists( 'wp_delete_file' ) ) {
		require_once ABSPATH . 'wp-admin/includes/file.php';
	}
}

/**
 * Register REST endpoint for issue comment attachments.
 */
function alpaca_register_comment_attachment_endpoint() {
	register_rest_route(
		'alpaca/v1',
		'/comment-attachments',
		array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'alpaca_upload_comment_attachment',
			'permission_callback' => function () {
				return \Alpaca\Inc\Helpers::user_can( 'register_comment_meta' );
			},
			'args'                => array(
				'issue_id' => array(
					'type'              => 'integer',
					'required'          => true,
					'sanitize_callback' => 'absint',
				),
			),
		)
	);

	register_rest_route(
		'alpaca/v1',
		'/comment-attachments/delete',
		array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'alpaca_delete_comment_attachment',
			'permission_callback' => function () {
				return \Alpaca\Inc\Helpers::user_can( 'register_comment_meta' );
			},
			'args'                => array(
				'issue_id' => array(
					'type'              => 'integer',
					'required'          => true,
					'sanitize_callback' => 'absint',
				),
				'url'      => array(
					'type'              => 'string',
					'required'          => true,
					'sanitize_callback' => 'esc_url_raw',
				),
			),
		)
	);
}
add_action( 'rest_api_init', 'alpaca_register_comment_attachment_endpoint' );

/**
 * Upload an attachment for an issue comment.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response REST response object.
 */
function alpaca_upload_comment_attachment( WP_REST_Request $request ) {
	$issue_id = (int) $request->get_param( 'issue_id' );
	$issue    = alpaca_get_issue_for_attachment( $issue_id, 'comment_attachment_upload' );

	if ( $issue['response'] ) {
		return $issue['response'];
	}

	$file_params = $request->get_file_params();

	if ( empty( $file_params['file'] ) ) {
		return alpaca_comment_attachment_error_response(
			'comment_attachment_upload',
			__( 'Missing attachment file.', 'alpaca' ),
			400
		);
	}

	$file = $file_params['file'];

	$allowed_mimes = get_allowed_mime_types();
	$checked_type  = wp_check_filetype_and_ext( $file['tmp_name'], $file['name'], $allowed_mimes );

	if ( empty( $checked_type['type'] ) || empty( $checked_type['ext'] ) ) {
		return alpaca_comment_attachment_error_response(
			'comment_attachment_upload',
			__( 'This file type is not allowed.', 'alpaca' ),
			400
		);
	}

	$base_paths = alpaca_get_attachment_base_paths();
	$subdir     = alpaca_get_issue_attachment_subdir( $issue['issue'], $issue_id );
	$subdir     = '/' . $subdir;
	$target_dir = $base_paths['base_dir'] . ltrim( $subdir, '/' );

	if ( ! wp_mkdir_p( $target_dir ) ) {
		return alpaca_comment_attachment_error_response(
			'comment_attachment_upload',
			__( 'Failed to prepare upload directory.', 'alpaca' ),
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

	alpaca_require_file_functions();

	$uploaded = wp_handle_sideload(
		$file,
		array(
			'test_form' => false,
			'mimes'     => $allowed_mimes,
		)
	);

	remove_filter( 'upload_dir', $upload_dir_filter );

	if ( isset( $uploaded['error'] ) ) {
		$upload_error = function_exists( 'wp_handle_upload_error' )
			? wp_handle_upload_error( $file, $uploaded['error'] )
			: $uploaded;

		return alpaca_comment_attachment_error_response(
			'comment_attachment_upload',
			$upload_error['error'],
			500
		);
	}

	return alpaca_rest_response(
		'comment_attachment_upload',
		array(
			'success' => true,
			'url'     => esc_url_raw( $uploaded['url'] ),
			'name'    => sanitize_file_name( wp_basename( $uploaded['file'] ) ),
			'mime'    => sanitize_text_field( $uploaded['type'] ),
		),
		200
	);
}

/**
 * Delete an attachment for an issue comment.
 *
 * @param WP_REST_Request $request REST request.
 * @return WP_REST_Response REST response object.
 */
function alpaca_delete_comment_attachment( WP_REST_Request $request ) {
	$issue_id = (int) $request->get_param( 'issue_id' );
	$url      = (string) $request->get_param( 'url' );
	$issue    = alpaca_get_issue_for_attachment( $issue_id, 'comment_attachment_delete' );

	if ( $issue['response'] ) {
		return $issue['response'];
	}

	if ( empty( $url ) ) {
		return alpaca_comment_attachment_error_response(
			'comment_attachment_delete',
			__( 'Missing attachment URL.', 'alpaca' ),
			400
		);
	}

	$base_paths = alpaca_get_attachment_base_paths();
	$subdir     = alpaca_get_issue_attachment_subdir( $issue['issue'], $issue_id );
	$subdir     = trailingslashit( $subdir );

	if ( strpos( $url, $base_paths['base_url'] . $subdir ) !== 0 ) {
		return alpaca_comment_attachment_error_response(
			'comment_attachment_delete',
			__( 'Attachment URL is not valid.', 'alpaca' ),
			400
		);
	}

	$relative_path = ltrim( str_replace( $base_paths['base_url'], '', $url ), '/' );
	$file_path     = $base_paths['base_dir'] . $relative_path;

	if ( ! file_exists( $file_path ) ) {
		return alpaca_comment_attachment_error_response(
			'comment_attachment_delete',
			__( 'Attachment not found.', 'alpaca' ),
			404
		);
	}

	alpaca_require_file_functions();

	$deleted = wp_delete_file( $file_path );

	if ( ! $deleted ) {
		return alpaca_comment_attachment_error_response(
			'comment_attachment_delete',
			__( 'Failed to delete attachment.', 'alpaca' ),
			500
		);
	}

	return alpaca_rest_response(
		'comment_attachment_delete',
		array(
			'success' => true,
			'message' => esc_html__( 'Attachment deleted.', 'alpaca' ),
		),
		200
	);
}
