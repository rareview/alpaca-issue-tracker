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
