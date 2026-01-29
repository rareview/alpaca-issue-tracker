<?php
/**
 * Utility functions and helpers.
 *
 * @package Alpaca
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Get the maximum term score for board visibility.
 *
 * @return int Maximum term score.
 */
function alpaca_get_max_term_score() {
	return \Alpaca\Alpaca::MAX_TERM_SCORE;
}

/**
 * Get the minimum term score for board visibility.
 *
 * @return int Minimum term score.
 */
function alpaca_get_min_term_score() {
	return \Alpaca\Alpaca::MIN_TERM_SCORE;
}

/**
 * Setup default status terms.
 *
 * Creates a starter set of status terms if none exist:
 * - Backlog (score: 0)
 * - Next (score: 1, set as default)
 * - In Progress (score: 2)
 * - Done (score: 3)
 *
 * @param bool $force Force creation even if statuses exist. Default false.
 * @return array Result array with success status and message.
 */
function alpaca_setup_default_statuses( $force = false ) {
	if ( ! function_exists( 'alpaca_register_cpts_and_taxonomies' ) ) {
		require_once ALPACA_PLUGIN_DIR . 'includes/core/posttypes-and-taxonomies.php';
	}

	if ( ! taxonomy_exists( 'alpaca_status' ) ) {
		alpaca_register_cpts_and_taxonomies();
	}

	if ( ! $force ) {
		$existing_statuses = get_terms(
			array(
				'taxonomy'   => 'alpaca_status',
				'hide_empty' => false,
			)
		);

		if ( ! empty( $existing_statuses ) && ! is_wp_error( $existing_statuses ) ) {
			return array(
				'success' => false,
				'message' => esc_html__( 'Statuses already exist.', 'alpaca' ),
			);
		}
	}

	$default_statuses = array(
		array(
			'name'  => esc_html__( 'Backlog', 'alpaca' ),
			'slug'  => 'backlog',
			'score' => 0,
		),
		array(
			'name'       => esc_html__( 'Next', 'alpaca' ),
			'slug'       => 'next',
			'score'      => 1,
			'is_default' => true,
		),
		array(
			'name'  => esc_html__( 'In Progress', 'alpaca' ),
			'slug'  => 'in-progress',
			'score' => 2,
		),
		array(
			'name'  => esc_html__( 'Done', 'alpaca' ),
			'slug'  => 'done',
			'score' => 3,
		),
	);

	$default_term_id = 0;
	$created_count   = 0;

	foreach ( $default_statuses as $status ) {
		$term = wp_insert_term(
			$status['name'],
			'alpaca_status',
			array(
				'slug' => $status['slug'],
			)
		);

		if ( ! is_wp_error( $term ) && isset( $term['term_id'] ) ) {
			update_term_meta( $term['term_id'], 'term_score', $status['score'] );
			++$created_count;

			if ( ! empty( $status['is_default'] ) ) {
				$default_term_id = $term['term_id'];
			}
		} elseif ( is_wp_error( $term ) ) {
			error_log( '[Alpaca] Failed to create status ' . $status['name'] . ': ' . $term->get_error_message() ); // phpcs:ignore
		}
	}

	if ( $default_term_id > 0 ) {
		update_option( 'alpaca_default_status_id', $default_term_id );
	}

	return array(
		'success' => true,
		'message' => sprintf(
			/* translators: %d: number of statuses created */
			esc_html__( 'Successfully created %d default statuses.', 'alpaca' ),
			$created_count
		),
		'count'   => $created_count,
	);
}

/**
 * Update the last activity timestamp for an issue.
 *
 * @param int $post_id The ID of the issue post.
 */
function alpaca_update_last_activity( $post_id ) {
	if ( 'alpaca_issue' === get_post_type( $post_id ) ) {
		update_post_meta( $post_id, 'alpaca_last_activity', current_time( 'mysql' ) );
	}
}
