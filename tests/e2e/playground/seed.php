<?php
/**
 * Deterministic Playground seed data for Alpaca E2E testing.
 *
 * @package Alpaca
 */

if ( ! defined( 'ABSPATH' ) ) {
	return;
}

/**
 * Read the seed manifest from disk.
 *
 * @param string $manifest_path Absolute manifest path.
 * @return array<string, mixed> Parsed manifest data.
 */
function alpaca_playground_read_seed_manifest( $manifest_path ) {
	if ( ! is_string( $manifest_path ) || '' === $manifest_path ) {
		return array();
	}

	if ( ! file_exists( $manifest_path ) ) {
		return array();
	}

	$manifest_json = file_get_contents( $manifest_path );

	if ( false === $manifest_json ) {
		return array();
	}

	$manifest_data = json_decode( $manifest_json, true );

	if ( ! is_array( $manifest_data ) ) {
		return array();
	}

	return $manifest_data;
}

/**
 * Resolve the admin user used for seeded content.
 *
 * @return WP_User|null Resolved admin user.
 */
function alpaca_playground_get_admin_user() {
	$admin_user = get_user_by( 'id', 1 );

	if ( $admin_user instanceof WP_User ) {
		return $admin_user;
	}

	$current_user = wp_get_current_user();

	if ( $current_user instanceof WP_User && $current_user->exists() ) {
		return $current_user;
	}

	return null;
}

/**
 * Create or update labels from the seed manifest.
 *
 * @param array<int, array<string, mixed>> $labels Label entries.
 * @return array<string, int> Map of label slug to term ID.
 */
function alpaca_playground_prepare_labels( $labels ) {
	$label_ids = array();

	foreach ( (array) $labels as $label ) {
		if ( ! is_array( $label ) ) {
			continue;
		}

		$label_slug = isset( $label['slug'] ) ? sanitize_title( $label['slug'] ) : '';
		$label_name = isset( $label['name'] ) ? sanitize_text_field( $label['name'] ) : '';

		if ( '' === $label_slug || '' === $label_name ) {
			continue;
		}

		$term = get_term_by( 'slug', $label_slug, 'alpaca_label' );

		if ( ! $term instanceof WP_Term ) {
			$created_label = wp_insert_term(
				$label_name,
				'alpaca_label',
				array(
					'slug' => $label_slug,
				)
			);

			if ( is_wp_error( $created_label ) || empty( $created_label['term_id'] ) ) {
				continue;
			}

			$term = get_term( (int) $created_label['term_id'], 'alpaca_label' );
		}

		if ( ! $term instanceof WP_Term ) {
			continue;
		}

		if ( ! empty( $label['color'] ) ) {
			update_term_meta(
				(int) $term->term_id,
				'alpaca_label_color',
				sanitize_hex_color( $label['color'] )
			);
		}

		$label_ids[ $label_slug ] = (int) $term->term_id;
	}

	return $label_ids;
}

/**
 * Seed a single issue from the manifest.
 *
 * @param array<string, mixed> $issue_entry Manifest issue entry.
 * @param array<string, mixed> $context     Shared seed context.
 * @param bool                 $trash_issue Whether to trash the issue after creation.
 * @return int Seeded issue ID.
 */
function alpaca_playground_seed_issue( $issue_entry, $context, $trash_issue = false ) {
	if ( ! is_array( $issue_entry ) || ! is_array( $context ) ) {
		return 0;
	}

	$status_slug = isset( $issue_entry['status'] ) ? sanitize_title( $issue_entry['status'] ) : '';
	$status_map  = isset( $context['status_map'] ) && is_array( $context['status_map'] ) ? $context['status_map'] : array();

	if ( '' === $status_slug || empty( $status_map[ $status_slug ] ) || ! $status_map[ $status_slug ] instanceof WP_Term ) {
		return 0;
	}

	$admin_user = isset( $context['admin_user'] ) && $context['admin_user'] instanceof WP_User ? $context['admin_user'] : null;
	$post_author = $admin_user instanceof WP_User ? (int) $admin_user->ID : 1;

	$issue_id = wp_insert_post(
		array(
			'post_type'    => 'alpaca_issue',
			'post_status'  => 'publish',
			'post_title'   => isset( $issue_entry['title'] ) ? sanitize_text_field( $issue_entry['title'] ) : '',
			'post_content' => isset( $issue_entry['content'] ) ? wp_kses_post( $issue_entry['content'] ) : '',
			'post_author'  => $post_author,
		),
		true
	);

	if ( is_wp_error( $issue_id ) || $issue_id <= 0 ) {
		return 0;
	}

	wp_set_object_terms( $issue_id, array( (int) $status_map[ $status_slug ]->term_id ), 'alpaca_status' );

	if ( ! empty( $issue_entry['deadline'] ) ) {
		update_post_meta(
			$issue_id,
			'alpaca_deadline',
			sanitize_text_field( $issue_entry['deadline'] )
		);
	}

	if ( ! empty( $issue_entry['highPriority'] ) ) {
		update_post_meta( $issue_id, 'alpaca_high_priority', 1 );
	}

	$label_ids = array();
	$label_map = isset( $context['label_map'] ) && is_array( $context['label_map'] ) ? $context['label_map'] : array();

	foreach ( (array) ( isset( $issue_entry['labels'] ) ? $issue_entry['labels'] : array() ) as $label_slug ) {
		$sanitized_label_slug = sanitize_title( $label_slug );

		if ( ! empty( $label_map[ $sanitized_label_slug ] ) ) {
			$label_ids[] = (int) $label_map[ $sanitized_label_slug ];
		}
	}

	if ( ! empty( $label_ids ) ) {
		wp_set_object_terms( $issue_id, $label_ids, 'alpaca_label', false );
	}

	$assignee_term_id = isset( $context['assignee_term_id'] ) ? (int) $context['assignee_term_id'] : 0;
	$watching_term_id = isset( $context['watching_term_id'] ) ? (int) $context['watching_term_id'] : 0;

	if ( ! empty( $issue_entry['assignAdmin'] ) && $assignee_term_id > 0 ) {
		wp_set_object_terms( $issue_id, array( $assignee_term_id ), 'alpaca_assignee', true );
	}

	if ( ! empty( $issue_entry['watchAdmin'] ) && $watching_term_id > 0 ) {
		wp_set_object_terms( $issue_id, array( $watching_term_id ), 'alpaca_watching', true );
	}

	$comments = isset( $issue_entry['comments'] ) && is_array( $issue_entry['comments'] ) ? $issue_entry['comments'] : array();

	foreach ( $comments as $comment_index => $comment_content ) {
		if ( ! is_string( $comment_content ) || '' === $comment_content ) {
			continue;
		}

		$comment_timestamp = strtotime( '+ ' . (string) $comment_index . ' hours', strtotime( '2026-04-09 12:00:00 UTC' ) );
		$comment_date_gmt  = gmdate( 'Y-m-d H:i:s', $comment_timestamp );

		wp_insert_comment(
			array(
				'comment_post_ID'      => $issue_id,
				'comment_content'      => $comment_content,
				'comment_type'         => 'issuecomment',
				'comment_approved'     => 1,
				'user_id'              => $post_author,
				'comment_author'       => $admin_user instanceof WP_User ? $admin_user->display_name : 'Admin',
				'comment_author_email' => $admin_user instanceof WP_User ? $admin_user->user_email : 'admin@example.com',
				'comment_date'         => get_date_from_gmt( $comment_date_gmt, 'Y-m-d H:i:s' ),
				'comment_date_gmt'     => $comment_date_gmt,
			)
		);
	}

	if ( function_exists( 'alpaca_update_last_activity_from_issuecomments' ) ) {
		alpaca_update_last_activity_from_issuecomments( $issue_id );
	} elseif ( function_exists( 'alpaca_update_last_activity' ) ) {
		alpaca_update_last_activity( $issue_id );
	}

	if ( $trash_issue ) {
		wp_trash_post( $issue_id );
	}

	return $issue_id;
}

/**
 * Seed the deterministic Playground board.
 *
 * @param string $manifest_path Absolute manifest path.
 * @return void
 */
function alpaca_playground_seed( $manifest_path ) {
	if ( ! function_exists( 'alpaca_setup_default_statuses' ) ) {
		return;
	}

	alpaca_setup_default_statuses();

	$existing_issues = get_posts(
		array(
			'post_type'      => 'alpaca_issue',
			'post_status'    => 'any',
			'posts_per_page' => 1,
			'fields'         => 'ids',
		)
	);

	if ( ! empty( $existing_issues ) ) {
		return;
	}

	$manifest = alpaca_playground_read_seed_manifest( $manifest_path );

	if ( empty( $manifest ) ) {
		return;
	}

	$status_terms = get_terms(
		array(
			'taxonomy'   => 'alpaca_status',
			'hide_empty' => false,
		)
	);

	if ( is_wp_error( $status_terms ) ) {
		return;
	}

	$status_map = array();

	foreach ( $status_terms as $status_term ) {
		$status_map[ $status_term->slug ] = $status_term;
	}

	foreach ( (array) ( isset( $manifest['statuses'] ) ? $manifest['statuses'] : array() ) as $status_entry ) {
		$status_slug = is_array( $status_entry ) && ! empty( $status_entry['slug'] ) ? sanitize_title( $status_entry['slug'] ) : '';

		if ( '' === $status_slug || empty( $status_map[ $status_slug ] ) ) {
			return;
		}
	}

	$admin_user       = alpaca_playground_get_admin_user();
	$assignee_term_id = 0;
	$watching_term_id = 0;

	if ( $admin_user instanceof WP_User && function_exists( 'alpaca_get_or_create_user_taxonomy_term' ) ) {
		$assignee_term_id = (int) alpaca_get_or_create_user_taxonomy_term( $admin_user, 'alpaca_assignee' );
		$watching_term_id = (int) alpaca_get_or_create_user_taxonomy_term( $admin_user, 'alpaca_watching' );
	}

	$context = array(
		'status_map'        => $status_map,
		'label_map'         => alpaca_playground_prepare_labels( isset( $manifest['labels'] ) ? $manifest['labels'] : array() ),
		'admin_user'        => $admin_user,
		'assignee_term_id'  => $assignee_term_id,
		'watching_term_id'  => $watching_term_id,
	);

	foreach ( (array) ( isset( $manifest['issues'] ) ? $manifest['issues'] : array() ) as $issue_entry ) {
		alpaca_playground_seed_issue( $issue_entry, $context, false );
	}

	foreach ( (array) ( isset( $manifest['deletedIssues'] ) ? $manifest['deletedIssues'] : array() ) as $issue_entry ) {
		alpaca_playground_seed_issue( $issue_entry, $context, true );
	}
}
