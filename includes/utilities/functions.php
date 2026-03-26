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
		update_post_meta( $post_id, 'alpaca_lastActivity', gmdate( 'c' ) );
	}
}

/**
 * Get the most recent approved issue comment timestamp for an issue.
 *
 * Returned value is in MySQL datetime format in UTC.
 *
 * @param int $issue_id The issue post ID.
 * @return string Latest comment date in UTC (MySQL datetime) or empty string.
 */
function alpaca_get_latest_issuecomment_date_for_issue( $issue_id ) {
	$issue_id = (int) $issue_id;
	if ( $issue_id <= 0 ) {
		return '';
	}

	if ( 'alpaca_issue' !== get_post_type( $issue_id ) ) {
		return '';
	}

	global $wpdb;

	// NOTE: `issuecomment` is a hidden comment type in Alpaca.
	// Using `get_comments()` can be affected by filters that hide this type.
	// Query the table directly so lastActivity reflects real comment activity.
	// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching
	$date = $wpdb->get_var(
		$wpdb->prepare(
			"SELECT comment_date_gmt FROM {$wpdb->comments}
				WHERE comment_post_ID = %d
				AND comment_type = %s
				AND comment_approved = '1'
				ORDER BY comment_date_gmt DESC
				LIMIT 1",
			$issue_id,
			'issuecomment'
		)
	);

	return is_string( $date ) ? $date : '';
}

/**
 * Update an issue's lastActivity meta based on the most recent approved issue comment.
 *
 * If the issue has no remaining approved issue comments, the meta is deleted so
 * clients can fall back to the issue's post date.
 *
 * @param int $issue_id The issue post ID.
 * @return string Updated last activity value (ISO-8601 UTC) or empty string.
 */
function alpaca_update_last_activity_from_issuecomments( $issue_id ) {
	$issue_id = (int) $issue_id;
	if ( $issue_id <= 0 ) {
		return '';
	}

	$latest = alpaca_get_latest_issuecomment_date_for_issue( $issue_id );
	if ( '' === $latest ) {
		delete_post_meta( $issue_id, 'alpaca_lastActivity' );
		return '';
	}

	$latest_unix_utc = strtotime( $latest . ' UTC' );
	if ( false === $latest_unix_utc ) {
		delete_post_meta( $issue_id, 'alpaca_lastActivity' );
		return '';
	}

	$latest_iso_utc = gmdate( 'c', $latest_unix_utc );
	update_post_meta( $issue_id, 'alpaca_lastActivity', $latest_iso_utc );
	return $latest_iso_utc;
}

/**
 * Get or create a taxonomy term that mirrors a user identity.
 *
 * @param WP_User $user     User object.
 * @param string  $taxonomy Taxonomy slug.
 * @return int Term ID when available, otherwise 0.
 */
function alpaca_get_or_create_user_taxonomy_term( $user, $taxonomy ) {
	if ( ! ( $user instanceof WP_User ) ) {
		return 0;
	}

	$taxonomy = sanitize_key( (string) $taxonomy );
	if ( '' === $taxonomy || ! taxonomy_exists( $taxonomy ) ) {
		return 0;
	}

	$existing = get_term_by( 'slug', $user->user_nicename, $taxonomy );
	if ( $existing && ! is_wp_error( $existing ) ) {
		return (int) $existing->term_id;
	}

	$inserted = wp_insert_term(
		$user->display_name,
		$taxonomy,
		array(
			'slug'        => $user->user_nicename,
			'description' => $user->user_login,
		)
	);

	if ( is_wp_error( $inserted ) ) {
		return 0;
	}

	if ( is_array( $inserted ) && isset( $inserted['term_id'] ) ) {
		return (int) $inserted['term_id'];
	}

	return (int) $inserted;
}

/**
 * Migrate legacy usermeta watchlist entries to the watching taxonomy.
 *
 * @param int $user_id User ID.
 * @return void
 */
function alpaca_migrate_watchlist_usermeta_to_taxonomy( $user_id ) {
	$user_id = (int) $user_id;
	if ( $user_id <= 0 ) {
		return;
	}

	if ( ! taxonomy_exists( 'alpaca_watching' ) ) {
		return;
	}

	$legacy_watchlist = get_user_meta( $user_id, 'alpaca_watchlist', true );
	if ( ! is_array( $legacy_watchlist ) || empty( $legacy_watchlist ) ) {
		return;
	}

	$user = get_user_by( 'id', $user_id );
	if ( ! ( $user instanceof WP_User ) ) {
		return;
	}

	$term_id = alpaca_get_or_create_user_taxonomy_term( $user, 'alpaca_watching' );
	if ( $term_id <= 0 ) {
		return;
	}

	$watchlist = alpaca_to_int_ids( $legacy_watchlist );
	foreach ( $watchlist as $post_id ) {
		if ( 'alpaca_issue' !== get_post_type( $post_id ) ) {
			continue;
		}

		wp_set_post_terms( $post_id, array( $term_id ), 'alpaca_watching', true );
	}

	delete_user_meta( $user_id, 'alpaca_watchlist' );
}

/**
 * Determine whether legacy watchlist migration should run.
 *
 * This temporary migration path can be removed in the future once legacy
 * installs are no longer relevant.
 *
 * @return bool True when migration should run.
 */
function alpaca_should_migrate_legacy_watchlist() {
	/**
	 * Filter whether legacy watchlist usermeta should be migrated.
	 *
	 * Returning false disables migration while preserving taxonomy behavior.
	 *
	 * @param bool $should_migrate Whether migration should run.
	 */
	return (bool) apply_filters( 'alpaca_should_migrate_legacy_watchlist', true );
}

/**
 * Migrate legacy watchlist usermeta when migration is enabled.
 *
 * @param int $user_id User ID.
 * @return void
 */
function alpaca_maybe_migrate_watchlist_usermeta_to_taxonomy( $user_id ) {
	if ( ! alpaca_should_migrate_legacy_watchlist() ) {
		return;
	}

	alpaca_migrate_watchlist_usermeta_to_taxonomy( $user_id );
}

/**
 * Get watched issue IDs for a user.
 *
 * @param int $user_id User ID.
 * @return array Watched issue IDs.
 */
function alpaca_get_watched_issue_ids_for_user( $user_id ) {
	$user_id = (int) $user_id;
	if ( $user_id <= 0 ) {
		return array();
	}

	if ( ! taxonomy_exists( 'alpaca_watching' ) ) {
		return array();
	}

	alpaca_maybe_migrate_watchlist_usermeta_to_taxonomy( $user_id );

	$user = get_user_by( 'id', $user_id );
	if ( ! ( $user instanceof WP_User ) ) {
		return array();
	}

	// phpcs:disable WordPress.DB.SlowDBQuery.slow_db_query_tax_query
	$watchlist = get_posts(
		array(
			'post_type'              => 'alpaca_issue',
			'post_status'            => 'any',
			'posts_per_page'         => -1,
			'fields'                 => 'ids',
			'orderby'                => 'ID',
			'order'                  => 'ASC',
			'no_found_rows'          => true,
			'update_post_meta_cache' => false,
			'update_post_term_cache' => false,
			'tax_query'              => array(
				array(
					'taxonomy' => 'alpaca_watching',
					'field'    => 'slug',
					'terms'    => $user->user_nicename,
				),
			),
		)
	);
	// phpcs:enable WordPress.DB.SlowDBQuery.slow_db_query_tax_query

	return alpaca_to_int_ids( $watchlist );
}
