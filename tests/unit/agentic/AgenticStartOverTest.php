<?php
/**
 * Tests for GitHub cleanup during Fix With AI Start Over.
 *
 * @package AlpacaIssueTracker
 */

use Brain\Monkey;
use Brain\Monkey\Functions;

/**
 * Verifies remote closure failures are reported instead of discarded.
 */
class AgenticStartOverTest extends \PHPUnit\Framework\TestCase {

	/**
	 * Initialize function mocks and endpoint helpers.
	 */
	protected function setUp(): void {
		parent::setUp();
		Monkey\setUp();

		if ( ! defined( 'ALPAISTR_VERSION' ) ) {
			define( 'ALPAISTR_VERSION', '1.1.2' );
		}

		Functions\stubs(
			[
				'add_action'  => null,
				'is_wp_error' => static function ( $value ): bool {
					return $value instanceof WP_Error;
				},
				'__'         => static function ( string $value ): string {
					return $value;
				},
			]
		);

		require_once dirname( __DIR__, 3 ) . '/includes/api/endpoints/agentic.php';
	}

	/**
	 * Release function mocks.
	 */
	protected function tearDown(): void {
		$this->addToAssertionCount( \Mockery::getContainer()->mockery_getExpectationCount() );
		Monkey\tearDown();
		parent::tearDown();
	}

	/**
	 * A failed GitHub close response must not be treated as success.
	 */
	public function test_close_issue_reports_remote_failure(): void {
		Functions\when( 'wp_json_encode' )->alias( 'json_encode' );
		Functions\when( 'wp_remote_get' )->justReturn( [ 'response' => [ 'code' => 200 ], 'body' => '{"state":"open"}' ] );
		Functions\when( 'wp_remote_retrieve_response_code' )->alias(
			static function ( array $response ): int {
				return (int) $response['response']['code'];
			}
		);
		Functions\when( 'wp_remote_retrieve_body' )->alias(
			static function ( array $response ): string {
				return (string) $response['body'];
			}
		);
		Functions\expect( 'wp_remote_request' )->once()->andReturn( [ 'response' => [ 'code' => 403 ], 'body' => '{"message":"Forbidden"}' ] );

		$result = alpaistr_agentic_close_github_issue( 'token', [ 'owner' => 'example', 'name' => 'project' ], 42 );

		$this->assertInstanceOf( WP_Error::class, $result );
	}

	/**
	 * A closed pull request needs no write request.
	 */
	public function test_already_closed_pull_request_is_successful(): void {
		Functions\when( 'wp_remote_get' )->justReturn( [ 'response' => [ 'code' => 200 ], 'body' => '{"state":"closed"}' ] );
		Functions\when( 'wp_remote_retrieve_response_code' )->justReturn( 200 );
		Functions\when( 'wp_remote_retrieve_body' )->justReturn( '{"state":"closed"}' );
		Functions\expect( 'wp_remote_request' )->never();

		$result = alpaistr_agentic_close_github_pull_request( 'token', [ 'owner' => 'example', 'name' => 'project' ], 43 );

		$this->assertTrue( $result );
	}

	/**
	 * A failed close must stop Start Over before local state is changed.
	 */
	public function test_close_open_work_propagates_pull_request_failure(): void {
		Functions\when( 'get_post_meta' )->justReturn(
			[
				[
					'type'          => 'sent',
					'github_number' => 42,
					'pr_number'     => 43,
				],
			]
		);
		Functions\when( 'wp_json_encode' )->alias( 'json_encode' );
		Functions\when( 'wp_remote_get' )->justReturn( [ 'response' => [ 'code' => 200 ], 'body' => '{"state":"open"}' ] );
		Functions\when( 'wp_remote_retrieve_response_code' )->alias(
			static function ( array $response ): int {
				return (int) $response['response']['code'];
			}
		);
		Functions\when( 'wp_remote_retrieve_body' )->justReturn( '{"state":"open"}' );
		Functions\when( 'wp_remote_request' )->justReturn( [ 'response' => [ 'code' => 403 ] ] );
		Functions\expect( 'delete_post_meta' )->never();

		$result = alpaistr_agentic_close_open_github_work( 'token', [ 'owner' => 'example', 'name' => 'project' ], 7, 'ai-work' );

		$this->assertInstanceOf( WP_Error::class, $result );
	}

	/**
	 * A failed PR discovery request must not be mistaken for no open work.
	 */
	public function test_close_open_work_reports_pull_request_lookup_failure(): void {
		Functions\when( 'get_post_meta' )->justReturn(
			[
				[
					'type'          => 'sent',
					'github_number' => 42,
				],
			]
		);
		Functions\when( 'wp_remote_get' )->justReturn( new WP_Error( 'network_error', 'Connection lost.' ) );
		Functions\expect( 'wp_remote_request' )->never();

		$result = alpaistr_agentic_close_open_github_work( 'token', [ 'owner' => 'example', 'name' => 'project' ], 7, 'ai-work' );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'github_lookup_failed', $result->get_error_code() );
	}
}
