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
 * Get the generated PHP icon registry.
 *
 * @return array<string, array<string, string>> Icon registry data.
 */
function alpaca_get_icon_registry() {
	static $icon_registry = null;

	if ( null !== $icon_registry ) {
		return $icon_registry;
	}

	$icon_registry = array(
		'icons'   => array(),
		'aliases' => array(),
	);

	$icon_registry_file = trailingslashit( ALPACA_PLUGIN_DIR ) . 'includes/utilities/icon-registry.php';

	if ( ! file_exists( $icon_registry_file ) ) {
		return $icon_registry;
	}

	$loaded_registry = require $icon_registry_file;

	if ( ! is_array( $loaded_registry ) ) {
		return $icon_registry;
	}

	if ( isset( $loaded_registry['icons'] ) && is_array( $loaded_registry['icons'] ) ) {
		$icon_registry['icons'] = $loaded_registry['icons'];
	}

	if ( isset( $loaded_registry['aliases'] ) && is_array( $loaded_registry['aliases'] ) ) {
		$icon_registry['aliases'] = $loaded_registry['aliases'];
	}

	return $icon_registry;
}

/**
 * Get shared SVG sanitizer allowlist data.
 *
 * This reads a JSON file at `includes/utilities/icon-sanitizer-allowlist.json`
 * that defines `globalAttributes` and `allowedTags`. If the file is missing
 * or invalid the function returns an empty allowlist structure.
 *
 * @return array<string, mixed> Sanitizer allowlist configuration.
 */
function alpaca_get_icon_sanitizer_allowlist_data() {
	static $allowlist_data = null;

	if ( null !== $allowlist_data ) {
		return $allowlist_data;
	}

	$allowlist_file = trailingslashit( ALPACA_PLUGIN_DIR ) . 'includes/utilities/icon-sanitizer-allowlist.json';

	$allowlist_data = array(
		'globalAttributes' => array(),
		'allowedTags'      => array(),
	);

	if ( ! file_exists( $allowlist_file ) ) {
		return $allowlist_data;
	}

	// phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- Reading local plugin configuration JSON.
	$allowlist_json = file_get_contents( $allowlist_file );

	if ( ! is_string( $allowlist_json ) || '' === $allowlist_json ) {
		return $allowlist_data;
	}

	$decoded = json_decode( $allowlist_json, true );
	if ( ! is_array( $decoded ) ) {
		return $allowlist_data;
	}

	if ( isset( $decoded['globalAttributes'] ) && is_array( $decoded['globalAttributes'] ) ) {
		$allowlist_data['globalAttributes'] = $decoded['globalAttributes'];
	}

	if ( isset( $decoded['allowedTags'] ) && is_array( $decoded['allowedTags'] ) ) {
		$allowlist_data['allowedTags'] = $decoded['allowedTags'];
	}

	return $allowlist_data;
}

/**
 * Build allowed SVG tags map for wp_kses from shared allowlist data.
 *
 * @return array<string, array<string, bool>> Allowed SVG tags for wp_kses.
 */
function alpaca_get_icon_svg_allowed_tags() {
	$allowlist_data    = alpaca_get_icon_sanitizer_allowlist_data();
	$global_attributes = array_map( 'strtolower', $allowlist_data['globalAttributes'] );
	$allowed_svg_tags  = array();

	foreach ( $allowlist_data['allowedTags'] as $tag_name => $tag_attributes ) {
		if ( ! is_array( $tag_attributes ) ) {
			continue;
		}

		$sanitized_tag_name = strtolower( (string) $tag_name );
		$merged_attributes  = array_merge( $global_attributes, array_map( 'strtolower', $tag_attributes ) );
		$merged_attributes  = array_values( array_unique( $merged_attributes ) );

		$allowed_svg_tags[ $sanitized_tag_name ] = array_fill_keys( $merged_attributes, true );
	}

	return $allowed_svg_tags;
}

/**
 * Sanitize SVG icon markup before returning it for output.
 *
 * @param string $svg_markup Raw SVG markup.
 * @return string Sanitized SVG markup.
 */
function alpaca_sanitize_icon_svg_markup( $svg_markup ) {
	if ( ! is_string( $svg_markup ) || '' === $svg_markup ) {
		return '';
	}

	$allowed_svg_tags = alpaca_get_icon_svg_allowed_tags();
	$svg_markup       = preg_replace( '/<\?(xml|php)[^>]*\?>/i', '', $svg_markup );
	$svg_markup       = preg_replace( '/<!doctype[^>]*>/i', '', $svg_markup );

	if ( ! is_string( $svg_markup ) ) {
		return '';
	}

	return wp_kses( $svg_markup, $allowed_svg_tags );
}

/**
 * Load an SVG icon by logical icon slug.
 *
 * Icons are generated into a PHP registry from the same source SVG folder that
 * builds the React icon component, so PHP and React stay in sync without
 * depending on Parcel to emit standalone SVG assets for every icon.
 *
 * @param string $icon_slug Logical icon slug, for example `calendar2-week`.
 * @return string SVG markup when found, otherwise an empty string.
 */
function alpaca_get_icon( $icon_slug ) {
	$icon_slug     = sanitize_title( (string) $icon_slug );
	$fallback_slug = 'missing';
	$icon_registry = alpaca_get_icon_registry();

	if ( '' === $icon_slug ) {
		$icon_slug = $fallback_slug;
	}

	if ( isset( $icon_registry['aliases'][ $icon_slug ] ) && is_string( $icon_registry['aliases'][ $icon_slug ] ) ) {
		$icon_slug = sanitize_title( $icon_registry['aliases'][ $icon_slug ] );
	}

	if ( isset( $icon_registry['icons'][ $icon_slug ] ) && is_string( $icon_registry['icons'][ $icon_slug ] ) ) {
		return alpaca_sanitize_icon_svg_markup( $icon_registry['icons'][ $icon_slug ] );
	}

	if ( isset( $icon_registry['icons'][ $fallback_slug ] ) && is_string( $icon_registry['icons'][ $fallback_slug ] ) ) {
		return alpaca_sanitize_icon_svg_markup( $icon_registry['icons'][ $fallback_slug ] );
	}

	return '';
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
 * Determine whether contextual capture is enabled.
 *
 * @return bool True when contextual capture should be active.
 */
function alpaca_is_contextual_capture_enabled() {
	return '1' === (string) get_option( 'alpaca_enable_context_capture', '1' );
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
 * Get the most recent visible issue comment timestamp for an issue.
 *
 * Returned value is in MySQL datetime format in UTC.
 *
 * @param int $issue_id The issue post ID.
 * Includes comments with approval state `1` and `post-trashed`, because
 * WordPress marks comments this way when their parent post is in trash.
 *
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
				AND comment_approved IN ('1', 'post-trashed')
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
 * Restore trashed issue comments to approved when an issue is untrashed.
 *
 * WordPress marks comments for trashed posts with comment_approved =
 * `post-trashed`. When an `alpaca_issue` is restored, these comments should
 * become approved (`1`) again so activity, counts, and timeline displays work.
 *
 * @param int $issue_id Issue post ID.
 * @return int Number of comments updated.
 */
function alpaca_restore_issuecomment_approval_statuses( $issue_id ) {
	$issue_id = (int) $issue_id;
	if ( $issue_id <= 0 ) {
		return 0;
	}

	if ( 'alpaca_issue' !== get_post_type( $issue_id ) ) {
		return 0;
	}

	global $wpdb;

	// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery,WordPress.DB.DirectDatabaseQuery.NoCaching -- Updating related comment statuses for a single restored issue.
	$updated_rows = $wpdb->query(
		$wpdb->prepare(
			"UPDATE {$wpdb->comments}
				SET comment_approved = '1'
				WHERE comment_post_ID = %d
				AND comment_type = %s
				AND comment_approved = %s",
			$issue_id,
			'issuecomment',
			'post-trashed'
		)
	); // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared,WordPress.DB.PreparedSQL.InterpolatedNotPrepared

	if ( false === $updated_rows ) {
		return 0;
	}

	if ( function_exists( 'alpaca_update_last_activity_from_issuecomments' ) ) {
		alpaca_update_last_activity_from_issuecomments( $issue_id );
	}

	return (int) $updated_rows;
}

/**
 * Get direct child issue IDs for a parent issue.
 *
 * @param int    $issue_id     Parent issue post ID.
 * @param string $post_status  Optional post status filter.
 * @return int[] Direct child issue IDs.
 */
function alpaca_get_child_issue_ids( $issue_id, $post_status = 'any' ) {
	$issue_id = (int) $issue_id;
	if ( $issue_id <= 0 ) {
		return array();
	}

	$post_status = is_string( $post_status ) && '' !== $post_status ? $post_status : 'any';

	$child_ids = get_children(
		array(
			'post_parent'    => $issue_id,
			'post_type'      => 'alpaca_issue',
			'post_status'    => $post_status,
			'fields'         => 'ids',
			'posts_per_page' => -1,
		)
	);

	if ( empty( $child_ids ) || ! is_array( $child_ids ) ) {
		return array();
	}

	return array_map( 'intval', array_values( $child_ids ) );
}

/**
 * Trash direct child issues when a parent issue is trashed.
 *
 * Child issues trashed by this cascade are marked so they can be safely
 * restored only when their parent issue is restored.
 *
 * @param int $parent_issue_id Parent issue post ID.
 * @return int Number of child issues trashed.
 */
function alpaca_trash_child_issues_with_parent( $parent_issue_id ) {
	$parent_issue_id = (int) $parent_issue_id;
	if ( $parent_issue_id <= 0 ) {
		return 0;
	}

	$trashed_count = 0;
	$child_ids     = alpaca_get_child_issue_ids( $parent_issue_id, 'any' );

	foreach ( $child_ids as $child_id ) {
		$child_status = get_post_status( $child_id );
		if ( 'trash' === $child_status ) {
			continue;
		}

		update_post_meta( $child_id, 'alpaca_trashed_with_parent', $parent_issue_id );
		if ( is_string( $child_status ) && '' !== $child_status ) {
			update_post_meta( $child_id, 'alpaca_status_before_parent_trash', $child_status );
		}

		if ( wp_trash_post( $child_id ) ) {
			++$trashed_count;
		} else {
			delete_post_meta( $child_id, 'alpaca_trashed_with_parent' );
			delete_post_meta( $child_id, 'alpaca_status_before_parent_trash' );
		}
	}

	return $trashed_count;
}

/**
 * Get direct child issues that were auto-trashed with a parent issue.
 *
 * @param int    $parent_issue_id Parent issue post ID.
 * @param string $fields          Query field mode. Accepts `ids` or `all`.
 * @return array<int, int>|array<int, WP_Post> Matching child issue IDs or posts.
 */
function alpaca_get_child_issues_trashed_with_parent( $parent_issue_id, $fields = 'ids' ) {
	$parent_issue_id = (int) $parent_issue_id;
	if ( $parent_issue_id <= 0 ) {
		return array();
	}

	$fields = 'all' === $fields ? 'all' : 'ids';

	// phpcs:disable WordPress.DB.SlowDBQuery.slow_db_query_meta_key,WordPress.DB.SlowDBQuery.slow_db_query_meta_value
	$child_issues = get_posts(
		array(
			'post_type'      => 'alpaca_issue',
			'post_status'    => 'trash',
			'post_parent'    => $parent_issue_id,
			'meta_key'       => 'alpaca_trashed_with_parent',
			'meta_value'     => (string) $parent_issue_id,
			'fields'         => $fields,
			'posts_per_page' => -1,
			'orderby'        => 'date',
			'order'          => 'ASC',
		)
	);
	// phpcs:enable WordPress.DB.SlowDBQuery.slow_db_query_meta_key,WordPress.DB.SlowDBQuery.slow_db_query_meta_value

	if ( empty( $child_issues ) || ! is_array( $child_issues ) ) {
		return array();
	}

	if ( 'ids' === $fields ) {
		return array_map( 'intval', array_values( $child_issues ) );
	}

	return array_values(
		array_filter(
			$child_issues,
			static function ( $child_issue ) {
				return $child_issue instanceof WP_Post;
			}
		)
	);
}

/**
 * Restore direct child issues that were auto-trashed with a parent issue.
 *
 * @param int    $parent_issue_id      Parent issue post ID.
 * @param string $restored_post_status Post status to apply when no prior
 *                                     child status was recorded.
 * @return int Number of child issues restored.
 */
function alpaca_restore_child_issues_trashed_with_parent( $parent_issue_id, $restored_post_status = 'publish' ) {
	$parent_issue_id = (int) $parent_issue_id;
	if ( $parent_issue_id <= 0 ) {
		return 0;
	}

	$restored_post_status = is_string( $restored_post_status ) && '' !== $restored_post_status
		? $restored_post_status
		: 'publish';

	$restored_count = 0;
	$child_ids      = alpaca_get_child_issues_trashed_with_parent( $parent_issue_id, 'ids' );

	foreach ( $child_ids as $child_id ) {
		$child_id = (int) $child_id;
		if ( $child_id <= 0 ) {
			continue;
		}

		if ( wp_untrash_post( $child_id ) ) {
			$child_post_status = get_post_meta( $child_id, 'alpaca_status_before_parent_trash', true );
			$child_post_status = is_string( $child_post_status ) && '' !== $child_post_status
				? $child_post_status
				: $restored_post_status;

			if ( 'trash' === $child_post_status ) {
				$child_post_status = $restored_post_status;
			}

			wp_update_post(
				array(
					'ID'          => $child_id,
					'post_status' => $child_post_status,
				)
			);

			delete_post_meta( $child_id, 'alpaca_trashed_with_parent' );
			delete_post_meta( $child_id, 'alpaca_status_before_parent_trash' );
			++$restored_count;
		}
	}

	return $restored_count;
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
