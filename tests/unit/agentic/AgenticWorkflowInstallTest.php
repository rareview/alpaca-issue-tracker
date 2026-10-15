<?php
/**
 * Tests for repairing and updating Fix With AI workflow files.
 *
 * @package AlpacaIssueTracker
 */

use AlpacaIssueTracker\Agentic\Agentic;
use Brain\Monkey;
use Brain\Monkey\Functions;

/**
 * Verifies installed status against the current workflow revision.
 */
class AgenticWorkflowInstallTest extends \PHPUnit\Framework\TestCase {

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

		require_once dirname( __DIR__, 3 ) . '/includes/class-agentic.php';
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
	 * An older workflow revision must not count as installed.
	 */
	public function test_older_workflow_revision_requires_update(): void {
		Functions\when( 'get_option' )->justReturn( 1 );

		$this->assertFalse( Agentic::is_workflow_revision_current() );
	}

	/**
	 * Installed status must compare file content, not just one path.
	 */
	public function test_workflow_files_match_requires_current_content(): void {
		$path = dirname( __DIR__, 3 ) . '/includes/agentic/ISSUE_TEMPLATE/agent-ready.md';
		Functions\when( 'wp_remote_get' )->justReturn( [ 'response' => [ 'code' => 200 ], 'body' => json_encode( [ 'sha' => 'old-sha', 'content' => base64_encode( 'outdated' ) ] ) ] );
		Functions\when( 'add_query_arg' )->alias(
			static function ( string $key, string $value, string $url ): string {
				return $url . '?' . $key . '=' . $value;
			}
		);
		Functions\when( 'wp_remote_retrieve_response_code' )->justReturn( 200 );
		Functions\when( 'wp_remote_retrieve_body' )->alias(
			static function ( array $response ): string {
				return (string) $response['body'];
			}
		);

		$result = alpaistr_agentic_workflow_files_match(
			'token',
			[ 'owner' => 'example', 'name' => 'project' ],
			'main',
			[ 'ISSUE_TEMPLATE/agent-ready.md' => $path ],
			'ai-work'
		);

		$this->assertFalse( $result );
	}

	/**
	 * Updating an existing GitHub file must send its current SHA.
	 */
	public function test_existing_workflow_file_update_includes_sha(): void {
		Functions\when( 'wp_remote_get' )->justReturn( [ 'response' => [ 'code' => 200 ], 'body' => '{"sha":"old-sha","content":"b2xk"}' ] );
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
		Functions\when( 'add_query_arg' )->alias(
			static function ( string $key, string $value, string $url ): string {
				return $url . '?' . $key . '=' . $value;
			}
		);
		Functions\when( 'wp_json_encode' )->alias( 'json_encode' );
		Functions\expect( 'wp_remote_request' )->once()->withArgs(
			static function ( string $url, array $args ): bool {
				$body = json_decode( $args['body'], true );
				return str_contains( $url, '/contents/' ) && 'old-sha' === ( $body['sha'] ?? '' );
			}
		)->andReturn( [ 'response' => [ 'code' => 200 ], 'body' => '{}' ] );

		$result = alpaistr_agentic_commit_workflow_file(
			'token',
			[ 'owner' => 'example', 'name' => 'project' ],
			'alpaca/ai-development',
			'workflows/agent-trigger.yml',
			'new content'
		);

		$this->assertSame( 'committed', $result );
	}

	/**
	 * The Actions secret must be the same token, sealed for GitHub.
	 */
	public function test_actions_token_secret_stores_the_sealed_token(): void {
		if ( ! function_exists( 'sodium_crypto_box_keypair' ) ) {
			$this->markTestSkipped( 'The sodium extension is required.' );
		}

		$keypair    = sodium_crypto_box_keypair();
		$public_key = sodium_crypto_box_publickey( $keypair );
		$captured   = null;

		Functions\when( 'wp_remote_get' )->justReturn(
			[
				'response' => [ 'code' => 200 ],
				'body'     => json_encode(
					[
						'key_id' => 'key-1',
						'key'    => base64_encode( $public_key ),
					]
				),
			]
		);
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
		Functions\when( 'wp_json_encode' )->alias( 'json_encode' );
		Functions\expect( 'wp_remote_request' )->once()->andReturnUsing(
			static function ( string $url, array $args ) use ( &$captured ): array {
				$captured = [
					'url'  => $url,
					'body' => json_decode( $args['body'], true ),
				];
				return [ 'response' => [ 'code' => 201 ], 'body' => '' ];
			}
		);

		$result = alpaistr_agentic_sync_actions_token_secret(
			'ghp_test',
			[
				'owner' => 'example',
				'name'  => 'project',
			]
		);

		$this->assertTrue( $result );
		$this->assertIsArray( $captured );
		$this->assertStringContainsString( '/actions/secrets/ALPACA_GITHUB_TOKEN', $captured['url'] );
		$this->assertSame( 'key-1', $captured['body']['key_id'] );
		$opened = sodium_crypto_box_seal_open( base64_decode( $captured['body']['encrypted_value'] ), $keypair );
		$this->assertSame( 'ghp_test', $opened );
	}

	/**
	 * A token without Secrets permission must not look like a successful install step.
	 */
	public function test_actions_token_secret_reports_github_rejection(): void {
		if ( ! function_exists( 'sodium_crypto_box_seal' ) ) {
			$this->markTestSkipped( 'The sodium extension is required.' );
		}

		Functions\when( 'wp_remote_get' )->justReturn(
			[
				'response' => [ 'code' => 403 ],
				'body'     => '{"message":"Resource not accessible by integration"}',
			]
		);
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

		$result = alpaistr_agentic_sync_actions_token_secret(
			'ghp_test',
			[
				'owner' => 'example',
				'name'  => 'project',
			]
		);

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'github_api_error', $result->get_error_code() );
		$this->assertStringContainsString( 'Resource not accessible by integration', $result->get_error_message() );
	}
}
