<?php
/**
 * Plugin activation handler.
 *
 * @package AlpacaIssueTracker
 */

namespace AlpacaIssueTracker;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Activator class.
 */
class Activator {

	/**
	 * Run on plugin activation.
	 */
	public static function activate() {
		// Check requirements.
		self::check_requirements();

		// Setup default status terms.
		self::setup_default_statuses();

		// Setup inbox storage.
		self::setup_notification_inbox();

		// Setup digest storage.
		self::setup_notification_digests();

		// Flush rewrite rules.
		flush_rewrite_rules();

		// Create log directory.
		self::create_log_directory();
	}

	/**
	 * Check system requirements.
	 */
	private static function check_requirements() {
		// Check PHP version.
		if ( version_compare( PHP_VERSION, AlpacaIssueTracker::MIN_PHP_VERSION, '<' ) ) {
			deactivate_plugins( plugin_basename( ALPAISTR_PLUGIN_FILE ) );
			wp_die(
				sprintf(
					/* translators: 1: Required PHP version, 2: Current PHP version */
					esc_html__( 'Alpaca Issue Tracker requires PHP version %1$s or higher. You are running version %2$s.', 'alpaca-issue-tracker' ),
					esc_html( AlpacaIssueTracker::MIN_PHP_VERSION ),
					esc_html( PHP_VERSION )
				),
				esc_html__( 'Plugin Activation Error', 'alpaca-issue-tracker' ),
				[ 'back_link' => true ]
			);
		}

		// Check WordPress version.
		global $wp_version;
		if ( version_compare( $wp_version, AlpacaIssueTracker::MIN_WP_VERSION, '<' ) ) {
			deactivate_plugins( plugin_basename( ALPAISTR_PLUGIN_FILE ) );
			wp_die(
				sprintf(
					/* translators: 1: Required WP version, 2: Current WP version */
					esc_html__( 'Alpaca Issue Tracker requires WordPress version %1$s or higher. You are running version %2$s.', 'alpaca-issue-tracker' ),
					esc_html( AlpacaIssueTracker::MIN_WP_VERSION ),
					esc_html( $wp_version )
				),
				esc_html__( 'Plugin Activation Error', 'alpaca-issue-tracker' ),
				[ 'back_link' => true ]
			);
		}
	}

	/**
	 * Setup default status terms on first activation.
	 *
	 * Creates a starter set of status terms if none exist:
	 * - Backlog (score: 0)
	 * - Inbox (score: 1, set as default)
	 * - In Progress (score: 2)
	 * - Done (score: 3)
	 */
	private static function setup_default_statuses() {
		alpaistr_setup_default_statuses();
	}

	/**
	 * Create the notification inbox table.
	 *
	 * @return void
	 */
	private static function setup_notification_inbox() {
		require_once ALPAISTR_PLUGIN_DIR . 'includes/notifications/inbox.php';

		alpaistr_install_notification_inbox_table();
	}

	/**
	 * Create the notification digest tables.
	 *
	 * @return void
	 */
	private static function setup_notification_digests() {
		require_once ALPAISTR_PLUGIN_DIR . 'includes/notifications/digest/index.php';

		alpaistr_install_notification_digest_tables();
	}

	/**
	 * Create log directory with security files.
	 */
	private static function create_log_directory() {
		$upload_dir = wp_upload_dir();
		$log_dir    = $upload_dir['basedir'] . '/alpaca-logs';

		if ( ! file_exists( $log_dir ) ) {
			wp_mkdir_p( $log_dir );

			// Add .htaccess to deny web access.
			// phpcs:disable WordPress.WP.AlternativeFunctions.file_operations_file_put_contents -- Simple security file creation during activation.
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
		}
	}
}
