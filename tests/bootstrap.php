<?php
require_once dirname( __DIR__ ) . '/vendor/autoload.php';

// Minimal WordPress stubs needed to load the notification dispatch file.
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

// Stub the index guard used by includes/notifications/index.php.
if ( ! defined( 'ALPAISTR_PLUGIN_FILE' ) ) {
	define( 'ALPAISTR_PLUGIN_FILE', dirname( __DIR__ ) . '/alpacaissuetracker.php' );
}

// Minimal WP_Comment stub — only the properties the notification dispatch uses.
if ( ! class_exists( 'WP_Comment' ) ) {
	class WP_Comment { // phpcs:ignore
		public $comment_ID;       // phpcs:ignore WordPress.NamingConventions.ValidVariableName.PropertyNotSnakeCase
		public $comment_type;
		public $comment_approved;

		public function __construct( object $data ) {
			foreach ( get_object_vars( $data ) as $key => $value ) {
				$this->$key = $value;
			}
		}
	}
}
