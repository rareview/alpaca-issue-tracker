<?php
/**
 * Plugin activation handler.
 *
 * @package Alpaca
 */

namespace Alpaca;

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

		// Flush rewrite rules.
		\flush_rewrite_rules();

		// Create log directory.
		self::create_log_directory();
	}

	/**
	 * Check system requirements.
	 */
	private static function check_requirements() {
		// Check PHP version.
		if ( version_compare( PHP_VERSION, \Alpaca\Alpaca::MIN_PHP_VERSION, '<' ) ) {
			\deactivate_plugins( \plugin_basename( ALPACA_PLUGIN_FILE ) );
			\wp_die(
				sprintf(
					/* translators: 1: Required PHP version, 2: Current PHP version */
					\esc_html__( 'Alpaca requires PHP version %1$s or higher. You are running version %2$s.', 'alpaca' ),
					\esc_html( \Alpaca\Alpaca::MIN_PHP_VERSION ),
					\esc_html( PHP_VERSION )
				),
				\esc_html__( 'Plugin Activation Error', 'alpaca' ),
				array( 'back_link' => true )
			);
		}

		// Check WordPress version.
		global $wp_version;
		if ( version_compare( $wp_version, \Alpaca\Alpaca::MIN_WP_VERSION, '<' ) ) {
			\deactivate_plugins( \plugin_basename( ALPACA_PLUGIN_FILE ) );
			\wp_die(
				sprintf(
					/* translators: 1: Required WP version, 2: Current WP version */
					\esc_html__( 'Alpaca requires WordPress version %1$s or higher. You are running version %2$s.', 'alpaca' ),
					\esc_html( \Alpaca\Alpaca::MIN_WP_VERSION ),
					\esc_html( $wp_version )
				),
				\esc_html__( 'Plugin Activation Error', 'alpaca' ),
				array( 'back_link' => true )
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
		if ( ! function_exists( 'alpaca_register_cpts_and_taxonomies' ) ) {
			require_once ALPACA_PLUGIN_DIR . 'includes/core/posttypes-and-taxonomies.php';
		}

		alpaca_register_cpts_and_taxonomies();

		$existing_statuses = \get_terms(
			array(
				'taxonomy'   => 'status',
				'hide_empty' => false,
			)
		);

		if ( ! empty( $existing_statuses ) && ! \is_wp_error( $existing_statuses ) ) {
			return;
		}

		$default_statuses = array(
			array(
				'name'  => \esc_html__( 'Backlog', 'alpaca' ),
				'slug'  => 'backlog',
				'score' => 0,
			),
			array(
				'name'       => \esc_html__( 'Inbox', 'alpaca' ),
				'slug'       => 'inbox',
				'score'      => 1,
				'is_default' => true,
			),
			array(
				'name'  => \esc_html__( 'In Progress', 'alpaca' ),
				'slug'  => 'in-progress',
				'score' => 2,
			),
			array(
				'name'  => \esc_html__( 'Done', 'alpaca' ),
				'slug'  => 'done',
				'score' => 3,
			),
		);

		$default_term_id = 0;

		foreach ( $default_statuses as $status ) {
			$term = \wp_insert_term(
				$status['name'],
				'status',
				array(
					'slug' => $status['slug'],
				)
			);

			if ( ! \is_wp_error( $term ) && isset( $term['term_id'] ) ) {
				\update_term_meta( $term['term_id'], 'term_score', $status['score'] );

				if ( ! empty( $status['is_default'] ) ) {
					$default_term_id = $term['term_id'];
				}
			}
		}

		if ( $default_term_id > 0 ) {
			\update_option( 'alpaca_default_status_id', $default_term_id );
		}
	}

	/**
	 * Create log directory with security files.
	 */
	private static function create_log_directory() {
		$upload_dir = \wp_upload_dir();
		$log_dir    = $upload_dir['basedir'] . '/alpaca-logs';

		if ( ! file_exists( $log_dir ) ) {
			\wp_mkdir_p( $log_dir );

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
