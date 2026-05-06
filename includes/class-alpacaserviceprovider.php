<?php
/**
 * Alpaca Service Provider.
 *
 * @package Alpaca
 */

namespace Alpaca;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Plugin service provider.
 */
class AlpacaServiceProvider {

	/**
	 * The plugin features that should be bootstrapped.
	 *
	 * @var array
	 */
	public static array $services = [
		Register::class,
	];

	/**
	 * Boot the service provider.
	 *
	 * @return void
	 */
	public function __construct() {
		foreach ( self::$services as $service ) {
			if ( class_exists( $service ) ) {
				new $service();
			}
		}
	}
}
