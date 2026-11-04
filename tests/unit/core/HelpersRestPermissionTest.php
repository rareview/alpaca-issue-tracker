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
		Functions\when( 'sanitize_key' )->returnArg();
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

	/**
	 * Permission settings should use the requested default role thresholds.
	 */
	public function test_permission_defaults_match_expected_roles(): void {
		$this->assertSame(
			[
				'view_board'                => 'subscriber',
				'create_issue'              => 'contributor',
				'edit_issue'                => 'contributor',
				'add_comment'               => 'subscriber',
				'edit_comment'              => 'contributor',
				'change_issue_status'       => 'contributor',
				'change_final_issue_status' => 'contributor',
			],
			Helpers::get_permission_defaults()
		);
	}

	/**
	 * Invalid and missing roles should fall back to their defaults.
	 */
	public function test_sanitize_permissions_rejects_invalid_roles(): void {
		$permissions = Helpers::sanitize_permissions(
			[
				'view_board'   => 'administrator',
				'create_issue' => 'custom-role',
			]
		);

		$this->assertSame( 'administrator', $permissions['view_board'] );
		$this->assertSame( 'contributor', $permissions['create_issue'] );
		$this->assertSame( 'contributor', $permissions['edit_issue'] );
	}

	/**
	 * Registered custom roles should be retained as permission thresholds.
	 */
	public function test_sanitize_permissions_accepts_registered_custom_roles(): void {
		Functions\when( 'wp_roles' )->justReturn(
			(object) [
				'roles' => [
					'project_manager' => [ 'capabilities' => [ 'manage_project' => true ] ],
				],
			]
		);

		$permissions = Helpers::sanitize_permissions( [ 'edit_issue' => 'project_manager' ] );

		$this->assertSame( 'project_manager', $permissions['edit_issue'] );
	}

	/**
	 * Users assigned a configured custom role should meet its threshold.
	 */
	public function test_user_can_matches_configured_custom_role(): void {
		Functions\when( 'wp_roles' )->justReturn(
			(object) [
				'roles' => [ 'project_manager' => [ 'capabilities' => [ 'manage_project' => true ] ] ],
			]
		);
		Functions\when( 'get_option' )->justReturn( [ 'view_board' => 'project_manager' ] );
		Functions\when( 'get_role' )->justReturn(
			(object) [ 'capabilities' => [ 'manage_project' => true ] ]
		);
		Functions\when( 'wp_get_current_user' )->justReturn(
			(object) [ 'roles' => [ 'project_manager' ], 'allcaps' => [ 'manage_project' => true ] ]
		);

		$this->assertTrue( Helpers::user_can( 'view_board' ) );
	}

	/**
	 * Configured roles should map to their WordPress capability threshold.
	 */
	public function test_user_can_uses_configured_role_capability(): void {
		Functions\when( 'get_option' )->justReturn(
			[
				'view_board' => 'author',
			]
		);
		Functions\when( 'current_user_can' )->alias(
			static function ( $capability ) {
				return 'publish_posts' === $capability;
			}
		);

		$this->assertTrue( Helpers::user_can( 'view_board' ) );
	}

	/**
	 * The highest-scored status should use the dedicated permission action.
	 */
	public function test_final_status_uses_separate_permission_action(): void {
		$statuses = [
			(object) [ 'term_id' => 3, 'term_score' => 100 ],
			(object) [ 'term_id' => 2, 'term_score' => 50 ],
		];

		$this->assertSame(
			'change_final_issue_status',
			Helpers::get_status_change_permission_action( 3, $statuses )
		);
		$this->assertSame(
			'change_final_issue_status',
			Helpers::get_status_change_permission_action( [ 2, 3 ], $statuses )
		);
		$this->assertSame(
			'change_issue_status',
			Helpers::get_status_change_permission_action( 2, $statuses )
		);
	}
}
