<?php
/**
 * Tests for recovering a partially sent Fix With AI issue.
 *
 * @package AlpacaIssueTracker
 */

use Brain\Monkey;
use Brain\Monkey\Functions;

/**
 * Verifies that label failures preserve the existing GitHub issue for retry.
 */
class AgenticIssueSendTest extends \PHPUnit\Framework\TestCase {

	/**
	 * Initialize function mocks and load the endpoint helpers.
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
	 * A failed label request must not discard the persisted remote issue.
	 */
	public function test_label_failure_keeps_pending_issue_for_retry(): void {
		Functions\expect( 'wp_remote_post' )
			->once()
			->withArgs(
				static function ( string $url ): bool {
					return str_contains( $url, '/issues/42/labels' );
				}
			)
			->andReturn( new WP_Error( 'network_error', 'Connection lost.' ) );
		Functions\expect( 'delete_post_meta' )->never();

		$result = alpaistr_agentic_complete_pending_issue(
			7,
			'token',
			[ 'owner' => 'example', 'name' => 'project' ],
			[
				'repo'               => 'example/project',
				'url'                => 'https://github.com/example/project/issues/42',
				'number'             => 42,
				'target_branch'      => 'ai-work',
				'draft'              => [ 'title' => 'Fix issue' ],
				'apply_agent_ready'  => true,
			]
		);

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'github_label_error', $result->get_error_code() );
	}

	/**
	 * Retrying a completed remote issue must not append another sent entry.
	 */
	public function test_retry_reuses_existing_github_issue_and_history(): void {
		$existing_history = [
			[
				'type'          => 'sent',
				'github_number' => 42,
				'url'           => 'https://github.com/example/project/issues/42',
			],
		];

		Functions\expect( 'wp_remote_post' )->once()->andReturn( [ 'response' => [ 'code' => 200 ] ] );
		Functions\when( 'wp_remote_retrieve_response_code' )->justReturn( 200 );
		Functions\when( 'wp_remote_retrieve_body' )->justReturn( '[]' );
		Functions\when( 'get_post_meta' )->justReturn( $existing_history );
		Functions\expect( 'update_post_meta' )->never();
		Functions\expect( 'delete_post_meta' )->once()->with( 7, ALPAISTR_AGENTIC_PENDING_ISSUE_META );
		Functions\when( 'rest_ensure_response' )->alias(
			static function ( array $data ): WP_REST_Response {
				return new WP_REST_Response( $data );
			}
		);

		$result = alpaistr_agentic_complete_pending_issue(
			7,
			'token',
			[ 'owner' => 'example', 'name' => 'project' ],
			[
				'repo'              => 'example/project',
				'url'               => 'https://github.com/example/project/issues/42',
				'number'            => 42,
				'target_branch'     => 'ai-work',
				'draft'             => [ 'title' => 'Fix issue' ],
				'apply_agent_ready' => true,
			]
		);

		$this->assertInstanceOf( WP_REST_Response::class, $result );
		$this->assertSame( 42, $result->get_data()['github_number'] );
		$this->assertSame( $existing_history, $result->get_data()['history'] );
	}
}
