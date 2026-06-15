<?php
/**
 * Tests for REST permission and nonce handling in Helpers.
 *
 * @package AlpacaIssueTracker
 */

use AlpacaIssueTracker\Helpers;
use Brain\Monkey;
use Brain\Monkey\Functions;

/**
 * Tests validate_rest_nonce_permission() cookie-auth nonce behavior.
 */
class HelpersRestPermissionTest extends \PHPUnit\Framework\TestCase {

	/**
	 * Set up Brain Monkey and load Helpers.
	 */
	protected function setUp(): void {
		parent::setUp();
		Monkey\setUp();

		global $wp_rest_auth_cookie;
		$wp_rest_auth_cookie = null;

		require_once dirname( __DIR__, 3 ) . '/includes/class-helpers.php';

		Functions\when( '__' )->returnArg();
		Functions\when( 'esc_html__' )->returnArg();
		Functions\when( 'current_user_can' )->justReturn( true );
	}

	/**
	 * Tear down Brain Monkey.
	 */
	protected function tearDown(): void {
		global $wp_rest_auth_cookie;
		$wp_rest_auth_cookie = null;

		$this->addToAssertionCount( \Mockery::getContainer()->mockery_getExpectationCount() );
		Monkey\tearDown();
		parent::tearDown();
	}

	/**
	 * Non-cookie auth should not require a REST nonce.
	 */
	public function test_skips_nonce_check_for_non_cookie_authentication(): void {
		$request = new WP_REST_Request( [], [] );

		$result = Helpers::validate_rest_nonce_permission( $request, 'create_issue' );

		$this->assertTrue( $result );
	}

	/**
	 * Cookie auth should reject requests without a REST nonce.
	 */
	public function test_requires_nonce_for_cookie_authentication(): void {
		global $wp_rest_auth_cookie;
		$wp_rest_auth_cookie = true;

		$request = new WP_REST_Request( [], [] );

		$result = Helpers::validate_rest_nonce_permission( $request, 'create_issue' );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'rest_forbidden', $result->get_error_code() );
		$this->assertSame( [ 'status' => 401 ], $result->get_error_data() );
	}

	/**
	 * Cookie auth should accept a valid REST nonce header.
	 */
	public function test_accepts_valid_nonce_for_cookie_authentication(): void {
		global $wp_rest_auth_cookie;
		$wp_rest_auth_cookie = true;

		Functions\when( 'wp_verify_nonce' )->justReturn( 1 );

		$request = new WP_REST_Request(
			[],
			[ 'X-WP-Nonce' => 'valid-nonce' ]
		);

		$result = Helpers::validate_rest_nonce_permission( $request, 'create_issue' );

		$this->assertTrue( $result );
	}
}
