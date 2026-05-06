<?php
/**
 * Register class.
 *
 * @package Alpaca
 */

namespace Alpaca\Inc;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Register
 */
class Register {

	const PREFIX = 'alpaca';

	/**
	 * Constructor.
	 */
	public function __construct() {
		$this->register_assets();
	}

	/**
	 * Register assets.
	 *
	 * @return void
	 */
	public function register_assets() {

		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_assets' ) );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_assets' ) );
	}

	/**
	 * Get the base script dependencies shared across Alpaca screens.
	 *
	 * @return string[] Script dependency handles.
	 */
	private function get_base_script_dependencies() {

		return array(
			'wp-element',
			'wp-api-fetch',
			'wp-i18n',
			'wp-components',
			'wp-dom-ready',
			'wp-data',
			'wp-hooks',
			'bowser',
		);
	}

	/**
	 * Get the reduced script dependencies needed on generic wp-admin screens.
	 *
	 * @return string[] Script dependency handles.
	 */
	private function get_global_admin_script_dependencies() {

		return array(
			'wp-element',
			'wp-api-fetch',
			'wp-i18n',
			'wp-components',
			'wp-hooks',
			'bowser',
		);
	}

	/**
	 * Get the additional block editor dependencies for the email template screen.
	 *
	 * @return string[] Script dependency handles.
	 */
	private function get_notification_template_dependencies() {

		return array(
			'wp-blocks',
			'wp-block-library',
			'wp-block-editor',
			'wp-core-data',
			'wp-editor',
			'wp-media-utils',
			'wp-rich-text',
			'wp-compose',
			'wp-format-library',
		);
	}

	/**
	 * Determine whether the current admin page is a notification template screen.
	 *
	 * @param string $hook_suffix Current admin page hook suffix.
	 * @return bool True when the page is a notification template screen.
	 */
	private function is_notification_template_admin_page( $hook_suffix ) {
		return in_array(
			$hook_suffix,
			array(
				'project-board_page_alpaca-email-templates',
			),
			true
		);
	}

	/**
	 * Get the translation path for JavaScript catalogs.
	 *
	 * @return string Absolute path to the translation directory.
	 */
	private function get_script_translation_path() {
		$locale = determine_locale();

		/**
		 * Filters the locale used to load Alpaca script translations.
		 *
		 * @param string $locale The locale to load.
		 */
		// phpcs:ignore WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedHooknameFound -- This uses the core WordPress plugin locale filter.
		$locale = apply_filters( 'plugin_locale', $locale, 'alpaca' );

		$locale_short = strtolower( substr( $locale, 0, 2 ) );
		$paths        = array(
			ALPACA_PLUGIN_DIR . 'languages/' . $locale,
			ALPACA_PLUGIN_DIR . 'languages/' . $locale_short,
			ALPACA_PLUGIN_DIR . 'languages',
		);

		foreach ( $paths as $path ) {
			if ( is_dir( $path ) ) {
				return $path;
			}
		}

		return ALPACA_PLUGIN_DIR . 'languages';
	}

	/**
	 * Get the SnapDOM proxy URL prefix for image capture requests.
	 *
	 * @return string Proxy URL prefix.
	 */
	private function get_snapdom_proxy_setting() {
		return esc_url_raw(
			rest_url(
				'alpaca/v1/proxy?proxy_token=' .
				rawurlencode( function_exists( 'alpaca_get_proxy_auth_token' ) ? alpaca_get_proxy_auth_token() : '' ) .
				'&url='
			)
		);
	}

	/**
	 * Get the saved item datapoint visibility settings.
	 *
	 * @return array<string, bool> Visibility map keyed by datapoint slug.
	 */
	private function get_item_datapoint_visibility_setting() {
		$raw_visibility = get_option( 'alpaca_item_datapoint_visibility', array() );

		if ( ! is_array( $raw_visibility ) ) {
			return array();
		}

		$visibility = array();

		foreach ( $raw_visibility as $slug => $is_enabled ) {
			if ( ! is_string( $slug ) ) {
				continue;
			}

			$clean_slug = sanitize_key( $slug );

			if ( '' === $clean_slug ) {
				continue;
			}

			$visibility[ $clean_slug ] = (bool) $is_enabled;
		}

		return $visibility;
	}

	/**
	 * Determine whether contextual capture is enabled.
	 *
	 * @return bool True when contextual capture should be active.
	 */
	private function is_contextual_capture_enabled() {
		return function_exists( 'alpaca_is_contextual_capture_enabled' )
			? alpaca_is_contextual_capture_enabled()
			: '1' === (string) get_option( 'alpaca_enable_context_capture', '1' );
	}

	/**
	 * Determine whether the current admin page needs the full Alpaca app bundle.
	 *
	 * @param string $hook_suffix Current admin page hook suffix.
	 * @return bool True when the full bundle should load.
	 */
	private function is_full_admin_bundle_screen( $hook_suffix ) {
		return in_array(
			$hook_suffix,
			array(
				'index.php',
				'toplevel_page_project-board',
				'project-board_page_project-activity',
				'project-board_page_alpaca-settings',
				'project-board_page_alpaca-notifications',
				'project-board_page_alpaca-email-templates',
			),
			true
		);
	}

	/**
	 * Determine whether the current admin page should skip Alpaca admin assets.
	 *
	 * Page/post editor screens are already asset-heavy. The matching admin-bar
	 * report UI is omitted on those screens as well.
	 *
	 * @param string $hook_suffix Current admin page hook suffix.
	 * @return bool True when Alpaca admin assets should not load.
	 */
	private function is_skipped_admin_bundle_screen( $hook_suffix ) {
		if ( function_exists( '\alpaca_should_skip_admin_report_screen' ) ) {
			return \alpaca_should_skip_admin_report_screen( $hook_suffix );
		}

		return false;
	}

	/**
	 * Get a version string for an asset based on filemtime.
	 *
	 * @param string $asset_relative_path Relative path from the plugin root.
	 * @return string Version string.
	 */
	private function get_asset_version( $asset_relative_path ) {
		$asset_version = Helpers::version();
		$asset_path    = dirname( __DIR__ ) . '/' . ltrim( $asset_relative_path, '/' );

		if ( file_exists( $asset_path ) ) {
			$asset_version = (string) filemtime( $asset_path );
		}

		return $asset_version;
	}

	/**
	 * Enqueue shared third-party assets used by Alpaca bundles.
	 *
	 * @return void
	 */
	private function enqueue_vendor_assets() {
		wp_enqueue_script(
			'bowser',
			Helpers::asset_url( 'vendor/bowser.es5.min.js' ),
			array(),
			Helpers::version(),
			true
		);

		wp_enqueue_script(
			'snapdom',
			Helpers::asset_url( 'vendor/snapdom.min.js' ),
			array(),
			Helpers::version(),
			true
		);
	}

	/**
	 * Enqueue the shared font used by the full Alpaca interface.
	 *
	 * @return void
	 */
	private function enqueue_full_bundle_font() {
		wp_enqueue_style(
			'atkinson-hyperlegible-mono',
			'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Mono&display=swap',
			array(),
			Helpers::version()
		);
	}

	/**
	 * Localize shared client settings for an Alpaca script bundle.
	 *
	 * @param string $script_handle      Script handle.
	 * @param bool   $include_admin_url  Whether to expose the wp-admin URL.
	 * @return void
	 */
	private function localize_script_settings( $script_handle, $include_admin_url = false ) {
		$settings = array(
			'canManageOptions'         => current_user_can( 'manage_options' ),
			'canDeleteIssues'          => Helpers::user_can( 'delete_issue' ),
			'contextualCaptureEnabled' => $this->is_contextual_capture_enabled(),
			'snapdomProxy'             => $this->get_snapdom_proxy_setting(),
			'itemDatapointVisibility'  => $this->get_item_datapoint_visibility_setting(),
		);

		if ( $include_admin_url ) {
			$settings['adminUrl'] = admin_url( 'admin.php' );
		}

		wp_localize_script( $script_handle, 'alpacaSettings', $settings );
	}

	/**
	 * Enqueue the full Alpaca application bundle.
	 *
	 * @param string[] $script_dependencies Script dependencies for the main bundle.
	 * @param bool     $include_admin_url   Whether to expose the wp-admin URL.
	 * @param bool     $localize_datadump   Whether to localize the report data dump.
	 * @return void
	 */
	private function enqueue_shared_assets( $script_dependencies, $include_admin_url = false, $localize_datadump = false ) {

		// Only load Alpaca for logged-in users.
		if ( ! is_user_logged_in() ) {
			return;
		}
		$script_version = $this->get_asset_version( 'dist/index.js' );
		$style_version  = $this->get_asset_version( 'dist/index.css' );

		$this->enqueue_full_bundle_font();
		$this->enqueue_vendor_assets();

		// Main script (includes Prism.js via npm import).
		wp_enqueue_script(
			self::PREFIX . '-script',
			Helpers::asset_url( 'dist/index.js' ),
			$script_dependencies,
			$script_version,
			true
		);

		wp_set_script_translations(
			self::PREFIX . '-script',
			'alpaca',
			$this->get_script_translation_path()
		);

		wp_enqueue_style(
			self::PREFIX . '-style',
			Helpers::asset_url( 'dist/index.css' ),
			array( 'wp-components', 'atkinson-hyperlegible-mono' ),
			$style_version
		);

		if ( $localize_datadump && function_exists( 'alpaca_prepare_datadump' ) ) {
			if ( $this->is_contextual_capture_enabled() ) {
				wp_localize_script( self::PREFIX . '-script', 'alpacaDataDump', \alpaca_prepare_datadump() );
			}
		}

		$this->localize_script_settings( self::PREFIX . '-script', $include_admin_url );
	}

	/**
	 * Enqueue the lightweight admin bundle used on generic wp-admin screens.
	 *
	 * @return void
	 */
	private function enqueue_global_admin_bundle_assets() {

		// Only load Alpaca for logged-in users.
		if ( ! is_user_logged_in() ) {
			return;
		}

		$script_handle  = self::PREFIX . '-admin-global-script';
		$style_handle   = self::PREFIX . '-admin-global-style';
		$script_version = $this->get_asset_version( 'dist/admin-global.js' );
		$style_version  = $this->get_asset_version( 'dist/admin-global.css' );

		$this->enqueue_vendor_assets();

		wp_enqueue_script(
			$script_handle,
			Helpers::asset_url( 'dist/admin-global.js' ),
			$this->get_global_admin_script_dependencies(),
			$script_version,
			true
		);

		wp_set_script_translations(
			$script_handle,
			'alpaca',
			$this->get_script_translation_path()
		);

		wp_enqueue_style(
			$style_handle,
			Helpers::asset_url( 'dist/admin-global.css' ),
			array( 'wp-components' ),
			$style_version
		);

		$this->localize_script_settings( $script_handle, true );
	}

	/**
	 * Enqueue frontend assets.
	 *
	 * @return void
	 */
	public function enqueue_assets() {
		if ( ! $this->is_contextual_capture_enabled() ) {
			return;
		}

		$this->enqueue_shared_assets( $this->get_base_script_dependencies(), false, true );
	}

	/**
	 * Enqueue admin assets.
	 *
	 * @param string $hook_suffix Current admin page hook suffix.
	 */
	public function enqueue_admin_assets( $hook_suffix ) {
		if ( $this->is_skipped_admin_bundle_screen( $hook_suffix ) ) {
			return;
		}

		if ( $this->is_full_admin_bundle_screen( $hook_suffix ) ) {
			$script_dependencies = $this->get_base_script_dependencies();
			if ( $this->is_notification_template_admin_page( $hook_suffix ) ) {
				$script_dependencies = array_merge(
					$script_dependencies,
					$this->get_notification_template_dependencies()
				);
			}

			$this->enqueue_shared_assets( array_values( array_unique( $script_dependencies ) ), true, true );

			if ( $this->is_notification_template_admin_page( $hook_suffix ) ) {
				wp_enqueue_media();
				wp_enqueue_style( 'wp-editor' );
				wp_enqueue_style( 'wp-edit-blocks' );
				wp_enqueue_style( 'wp-block-library' );
				wp_enqueue_style( 'wp-block-library-theme' );
			}

			// On the project board page.
			if ( 'toplevel_page_project-board' === $hook_suffix ) {
				// Ensure WP Heartbeat is available on the board page.
				wp_enqueue_script( 'heartbeat' );

				// Pass board data.
				wp_localize_script(
					self::PREFIX . '-script',
					'alpacaBoardData',
					\alpaca_get_board_data()
				);

				wp_localize_script(
					self::PREFIX . '-script',
					'alpacaUserData',
					array(
						'currentUserId' => get_current_user_id(),
					)
				);
			}

			return;
		}

		$this->enqueue_global_admin_bundle_assets();
	}
}
