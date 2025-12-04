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
 * Get plugin version.
 *
 * @return string Plugin version.
 */
function alpaca_get_version() {
	return defined( 'ALPACA_VERSION' ) ? ALPACA_VERSION : '2.0.0';
}

/**
 * Check if test logs are enabled.
 *
 * @return bool True if test logs enabled.
 */
function alpaca_is_test_logs_enabled() {
	return '1' === get_option( 'alpaca_enable_test_logs', '0' );
}

/**
 * Log a message (wrapper for error_log with prefix).
 *
 * @param string $message Message to log.
 * @param string $level   Log level (info, warning, error).
 */
function alpaca_log( $message, $level = 'info' ) {
	if ( ! alpaca_is_test_logs_enabled() && 'error' !== $level ) {
		return;
	}

	$prefix = '[Alpaca] [' . strtoupper( $level ) . '] ';
	error_log( $prefix . $message ); // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log -- Intentional logging for webhook debugging.
}

/**
 * Get secure log directory path.
 *
 * @return string Log directory path.
 */
function alpaca_get_log_dir() {
	$upload_dir = \wp_upload_dir();
	return $upload_dir['basedir'] . '/alpaca-logs';
}

/**
 * Ensure log directory exists with security files.
 *
 * @return bool True if directory exists/created successfully.
 */
function alpaca_ensure_log_dir() {
	$log_dir = alpaca_get_log_dir();

	if ( file_exists( $log_dir ) ) {
		return true;
	}

	if ( ! \wp_mkdir_p( $log_dir ) ) {
		return false;
	}

	// Add .htaccess to deny web access.
	// phpcs:disable WordPress.WP.AlternativeFunctions.file_operations_file_put_contents -- Simple security file creation.
	$htaccess = $log_dir . '/.htaccess';
	if ( ! file_exists( $htaccess ) ) {
		file_put_contents( $htaccess, 'deny from all' );
	}

	// Add index.php.
	$index = $log_dir . '/index.php';
	if ( ! file_exists( $index ) ) {
		file_put_contents( $index, '<?php // Silence is golden.' );
	}
	// phpcs:enable WordPress.WP.AlternativeFunctions.file_operations_file_put_contents

	return true;
}

/**
 * Setup default status terms.
 *
 * Creates a starter set of status terms if none exist:
 * - Backlog (score: 0)
 * - Inbox (score: 1, set as default)
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
				'message' => 'Statuses already exist.',
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
			'name'       => esc_html__( 'Inbox', 'alpaca' ),
			'slug'       => 'inbox',
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
			error_log( '[Alpaca] Failed to create status ' . $status['name'] . ': ' . $term->get_error_message() );
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
