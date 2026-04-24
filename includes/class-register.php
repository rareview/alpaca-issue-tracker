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
		$dependencies = array(
			'wp-element',
			'wp-api-fetch',
			'wp-i18n',
			'wp-components',
			'wp-dom-ready',
			'wp-data',
		);

		if ( $this->should_enqueue_capture_vendor_assets() ) {
			$dependencies[] = 'bowser';
		}

		/**
		 * Filter the base script dependencies shared across Alpaca screens.
		 *
		 * @param string[] $dependencies Script dependency handles.
		 */
		$filtered_dependencies = apply_filters( 'alpaca_base_script_dependencies', $dependencies );

		if ( ! is_array( $filtered_dependencies ) ) {
			return $dependencies;
		}

		return array_values( array_unique( $filtered_dependencies ) );
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
	 * Determine whether capture-specific vendor assets should be enqueued.
	 *
	 * @return bool True when capture vendor assets should be enqueued.
	 */
	private function should_enqueue_capture_vendor_assets() {
		/**
		 * Filter whether Alpaca should enqueue capture-specific vendor assets.
		 *
		 * @param bool $should_enqueue True to enqueue capture-specific vendor assets.
		 */
		return (bool) apply_filters( 'alpaca_enable_capture_vendor_assets', false );
	}

	/**
	 * Determine whether capture context data should be localized to the script.
	 *
	 * @return bool True when capture context data should be localized.
	 */
	private function should_localize_capture_context() {
		/**
		 * Filter whether Alpaca should localize capture context data.
		 *
		 * @param bool $should_localize True to localize capture context data.
		 */
		return (bool) apply_filters( 'alpaca_enable_capture_context', false );
	}

	/**
	 * Build the settings object exposed to the shared Alpaca script.
	 *
	 * @param bool   $is_admin    Whether the current request is for wp-admin.
	 * @param string $hook_suffix Current admin hook suffix when available.
	 * @return array<string, mixed> Script settings.
	 */
	private function get_script_settings( $is_admin = false, $hook_suffix = '' ) {
		$enable_capture_ui       = (bool) apply_filters( 'alpaca_enable_capture_ui', false, $is_admin, $hook_suffix );
		$enable_admin_bar_modal  = (bool) apply_filters( 'alpaca_enable_admin_bar_modal', $enable_capture_ui, $is_admin, $hook_suffix );
		$enable_frontend_toolbar = (bool) apply_filters( 'alpaca_enable_frontend_toolbar', $enable_capture_ui, $is_admin, $hook_suffix );
		$enable_capture_context  = $this->should_localize_capture_context();
		$enable_capture_assets   = $this->should_enqueue_capture_vendor_assets();

		$settings = array(
			'canManageOptions'        => current_user_can( 'manage_options' ),
			'itemDatapointVisibility' => $this->get_item_datapoint_visibility_setting(),
			'enableCaptureUi'         => $enable_capture_ui,
			'enableAdminBarModal'     => $enable_admin_bar_modal,
			'enableFrontendToolbar'   => $enable_frontend_toolbar,
			'enableCaptureContext'    => $enable_capture_context,
			'enableCaptureAssets'     => $enable_capture_assets,
			'snapdomProxy'            => $enable_capture_assets ? $this->get_snapdom_proxy_setting() : '',
		);

		if ( $is_admin ) {
			$settings['adminUrl'] = admin_url( 'admin.php' );
		}

		/**
		 * Filter the script settings exposed to the shared Alpaca script.
		 *
		 * @param array<string, mixed> $settings    Script settings.
		 * @param bool                 $is_admin    Whether the current request is for wp-admin.
		 * @param string               $hook_suffix Current admin hook suffix when available.
		 */
		$filtered_settings = apply_filters( 'alpaca_script_settings', $settings, $is_admin, $hook_suffix );

		if ( ! is_array( $filtered_settings ) ) {
			return $settings;
		}

		return $filtered_settings;
	}

	/**
	 * Enqueue shared Alpaca assets.
	 *
	 * @param string[] $script_dependencies Script dependencies for the main bundle.
	 * @param bool     $is_admin            Whether the current request is for wp-admin.
	 * @param string   $hook_suffix         Current admin hook suffix when available.
	 * @return void
	 */
	private function enqueue_shared_assets( $script_dependencies, $is_admin = false, $hook_suffix = '' ) {

		// Only load Alpaca for logged-in users.
		if ( ! is_user_logged_in() ) {
			return;
		}
		$script_version = Helpers::version();
		$style_version  = Helpers::version();
		$plugin_root    = dirname( __DIR__ );
		$script_path    = $plugin_root . '/dist/index.js';
		$style_path     = $plugin_root . '/dist/index.css';

		if ( file_exists( $script_path ) ) {
			$script_version = (string) filemtime( $script_path );
		}

		if ( file_exists( $style_path ) ) {
			$style_version = (string) filemtime( $style_path );
		}

		wp_enqueue_style(
			'atkinson-hyperlegible-mono',
			'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Mono&display=swap',
			array(),
			Helpers::version()
		);

		if ( $this->should_enqueue_capture_vendor_assets() ) {
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

		// Localize script.
		if ( $this->should_localize_capture_context() && function_exists( 'alpaca_prepare_datadump' ) ) {
			wp_localize_script( self::PREFIX . '-script', 'alpacaDataDump', \alpaca_prepare_datadump() );
		}

		wp_localize_script(
			self::PREFIX . '-script',
			'alpacaSettings',
			$this->get_script_settings( $is_admin, $hook_suffix )
		);

		/**
		 * Fires after Alpaca enqueues its shared frontend assets.
		 *
		 * @param bool   $is_admin           Whether the current request is for wp-admin.
		 * @param string $hook_suffix        Current admin hook suffix when available.
		 * @param string[] $script_dependencies Script dependencies used for the main bundle.
		 */
		do_action( 'alpaca_shared_assets_enqueued', $is_admin, $hook_suffix, $script_dependencies );
	}

	/**
	 * Enqueue frontend assets.
	 *
	 * @return void
	 */
	public function enqueue_assets() {
		$this->enqueue_shared_assets( $this->get_base_script_dependencies(), false, '' );
	}

	/**
	 * Enqueue admin assets.
	 *
	 * @param string $hook_suffix Current admin page hook suffix.
	 */
	public function enqueue_admin_assets( $hook_suffix ) {

		$script_dependencies = $this->get_base_script_dependencies();
		if ( $this->is_notification_template_admin_page( $hook_suffix ) ) {
			$script_dependencies = array_merge(
				$script_dependencies,
				$this->get_notification_template_dependencies()
			);
		}

		$this->enqueue_shared_assets( array_values( array_unique( $script_dependencies ) ), true, $hook_suffix );

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
	}
}
