<?php
// phpcs:ignoreFile -- Test bootstrap defines WordPress stub classes.
/**
 * PHPUnit bootstrap for Alpaca Issue Tracker tests.
 *
 * @package AlpacaIssueTracker
 */

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
		/**
		 * Comment ID.
		 *
		 * @var int
		 */
		public $comment_ID;       // phpcs:ignore WordPress.NamingConventions.ValidVariableName.PropertyNotSnakeCase

		/**
		 * Comment type.
		 *
		 * @var string
		 */
		public $comment_type;

		/**
		 * Comment approval value.
		 *
		 * @var string|int
		 */
		public $comment_approved;

		/**
		 * Create a comment stub.
		 *
		 * @param object $data Comment data.
		 */
		public function __construct( object $data ) {
			foreach ( get_object_vars( $data ) as $key => $value ) {
				$this->$key = $value;
			}
		}
	}
}

// Minimal WP_Error stub for API callback unit tests.
if ( ! class_exists( 'WP_Error' ) ) {
	class WP_Error { // phpcs:ignore
		/**
		 * Error code.
		 *
		 * @var string
		 */
		public $code;

		/**
		 * Error message.
		 *
		 * @var string
		 */
		public $message;

		/**
		 * Error data.
		 *
		 * @var mixed
		 */
		public $data;

		/**
		 * Create an error stub.
		 *
		 * @param string $code    Error code.
		 * @param string $message Error message.
		 * @param mixed  $data    Error data.
		 */
		public function __construct( string $code = '', string $message = '', $data = '' ) {
			$this->code    = $code;
			$this->message = $message;
			$this->data    = $data;
		}

		/**
		 * Get the error code.
		 *
		 * @return string Error code.
		 */
		public function get_error_code(): string {
			return $this->code;
		}

		/**
		 * Get the error message.
		 *
		 * @return string Error message.
		 */
		public function get_error_message(): string {
			return $this->message;
		}

		/**
		 * Get the error data.
		 *
		 * @return mixed Error data.
		 */
		public function get_error_data() {
			return $this->data;
		}
	}
}

// Minimal WP_User stub for ability audit tests.
if ( ! class_exists( 'WP_User' ) ) {
	class WP_User { // phpcs:ignore
		/**
		 * User ID.
		 *
		 * @var int
		 */
		public $ID;           // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase

		/**
		 * Display name.
		 *
		 * @var string
		 */
		public $display_name;

		/**
		 * User email.
		 *
		 * @var string
		 */
		public $user_email;

		/**
		 * User nicename.
		 *
		 * @var string
		 */
		public $user_nicename;

		/**
		 * Whether the user exists.
		 *
		 * @var bool
		 */
		private $exists;

		/**
		 * Create a user stub.
		 *
		 * @param array<string, mixed> $data User data.
		 */
		public function __construct( array $data = [] ) {
			$this->ID            = $data['ID'] ?? 0;
			$this->display_name  = $data['display_name'] ?? '';
			$this->user_email    = $data['user_email'] ?? '';
			$this->user_nicename = $data['user_nicename'] ?? '';
			$this->exists        = $data['exists'] ?? true;
		}

		/**
		 * Check whether the user exists.
		 *
		 * @return bool True when the user exists.
		 */
		public function exists(): bool {
			return (bool) $this->exists;
		}
	}
}

// Minimal WP_Term stub for ability audit tests.
if ( ! class_exists( 'WP_Term' ) ) {
	class WP_Term { // phpcs:ignore
		/**
		 * Term ID.
		 *
		 * @var int
		 */
		public $term_id;

		/**
		 * Term name.
		 *
		 * @var string
		 */
		public $name;

		/**
		 * Term slug.
		 *
		 * @var string
		 */
		public $slug;

		/**
		 * Create a term stub.
		 *
		 * @param array<string, mixed> $data Term data.
		 */
		public function __construct( array $data = [] ) {
			$this->term_id = $data['term_id'] ?? 0;
			$this->name    = $data['name'] ?? '';
			$this->slug    = $data['slug'] ?? '';
		}
	}
}

// Minimal WP_REST_Request stub for REST permission tests.
if ( ! class_exists( 'WP_REST_Request' ) ) {
	class WP_REST_Request { // phpcs:ignore
		/**
		 * Request parameters.
		 *
		 * @var array<string, mixed>
		 */
		private $params;

		/**
		 * Request headers.
		 *
		 * @var array<string, string>
		 */
		private $headers;

		/**
		 * Create a REST request stub.
		 *
		 * @param array<string, mixed> $params  Request parameters.
		 * @param array<string, string> $headers Request headers.
		 */
		public function __construct( array $params = [], array $headers = [] ) {
			$this->params  = $params;
			$this->headers = $headers;
		}

		/**
		 * Get a request parameter.
		 *
		 * @param string $key Parameter key.
		 * @return mixed Parameter value.
		 */
		public function get_param( $key ) {
			return $this->params[ $key ] ?? null;
		}

		/**
		 * Get a request header.
		 *
		 * @param string $key Header name.
		 * @return string|null Header value.
		 */
		public function get_header( $key ) {
			return $this->headers[ $key ] ?? null;
		}
	}
}
