<?php
/**
 * Tests for explicitly removing Fix With AI GitHub setup.
 *
 * @package AlpacaIssueTracker
 */

use Brain\Monkey;
use Brain\Monkey\Functions;

/**
 * Verify cleanup only selects unmodified plugin-managed files.
 */
class AgenticGithubCleanupTest extends \PHPUnit\Framework\TestCase {

	/**
	 * Initialize endpoint helpers and WordPress stubs.
	 */
	protected function setUp(): void {
		parent::setUp();
		Monkey\setUp();
		if ( ! defined( 'ALPAISTR_PLUGIN_DIR' ) ) {
			define( 'ALPAISTR_PLUGIN_DIR', dirname( __DIR__, 3 ) . '/' );
		}
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
	 * Release WordPress stubs.
	 */
	protected function tearDown(): void {
		Monkey\tearDown();
		parent::tearDown();
	}

	/**
	 * Matching content is removable, but customized content must be preserved.
	 */
	public function test_only_matching_file_is_safe_to_remove(): void {
		$this->assertSame( 'safe', alpaistr_agentic_classify_cleanup_file( base64_encode( 'expected' ), 'expected' ) );
		$this->assertSame( 'modified', alpaistr_agentic_classify_cleanup_file( base64_encode( 'customized' ), 'expected' ) );
	}

	/**
	 * The installation branch name remains available after uninstall cleanup removal.
	 */
	public function test_config_branch_name_is_available_at_runtime(): void {
		$this->assertSame( 'alpaca/ai-development', alpaistr_agentic_get_config_branch_name() );
	}

	/**
	 * Mock repository and file responses for the cleanup preview.
	 */
	private function mock_github_preview(): void {
		Functions\when( 'get_option' )->alias(
			static function ( string $key ) {
				if ( 'alpaistr_agentic_settings' === $key ) {
					return [
						'github_token'     => 'token',
						'github_repo'      => 'example/project',
						'ai_target_branch' => 'ai-work',
					];
				}
				return '';
			}
		);
		Functions\when( 'add_query_arg' )->alias(
			static function ( string $key, string $value, string $url ): string {
				return $url . '?' . $key . '=' . $value;
			}
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
		Functions\when( 'wp_remote_get' )->alias(
			static function ( string $url ): array {
				if ( str_ends_with( $url, '/example/project' ) ) {
					return [ 'response' => [ 'code' => 200 ], 'body' => '{"default_branch":"main"}' ];
				}
				if ( str_contains( $url, '/contents/.github/LABELS.yml' ) ) {
					$content = file_get_contents( ALPAISTR_PLUGIN_DIR . 'includes/agentic/LABELS.yml' );
					return [ 'response' => [ 'code' => 200 ], 'body' => json_encode( [ 'content' => base64_encode( $content ), 'sha' => 'safe-sha' ] ) ];
				}
				if ( str_contains( $url, '/contents/.github/workflows/claude.yml' ) ) {
					return [ 'response' => [ 'code' => 200 ], 'body' => json_encode( [ 'content' => base64_encode( 'customized' ), 'sha' => 'custom-sha' ] ) ];
				}
				return [ 'response' => [ 'code' => 404 ], 'body' => '{}' ];
			}
		);
	}

	/**
	 * The preview identifies changed files without scheduling their removal.
	 */
	public function test_preview_marks_modified_files_for_manual_review(): void {
		$this->mock_github_preview();
		$preview = alpaistr_agentic_github_cleanup_preview();

		$this->assertSame( 'example/project', $preview['repo'] );
		$this->assertSame( 'safe', $preview['files'][0]['status'] );
		$this->assertSame( 'modified', $preview['files'][1]['status'] );
		$this->assertSame( 'manual', $preview['variable'] );
	}

	/**
	 * An incorrect repository confirmation must not issue a DELETE request.
	 */
	public function test_cleanup_requires_exact_repository_confirmation(): void {
		$this->mock_github_preview();
		Functions\expect( 'wp_remote_request' )->never();

		$result = alpaistr_agentic_github_cleanup_callback( new WP_REST_Request( [ 'confirm_repo' => 'other/project' ] ) );

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'confirmation_required', $result->get_error_code() );
	}

	/**
	 * Cleanup deletes unchanged content by SHA and keeps customized files.
	 */
	public function test_cleanup_removes_only_unchanged_file(): void {
		$this->mock_github_preview();
		Functions\when( 'wp_json_encode' )->alias( 'json_encode' );
		Functions\expect( 'wp_remote_request' )->once()->withArgs(
			static function ( string $url, array $args ): bool {
				$body = json_decode( $args['body'], true );
				return str_contains( $url, '/contents/.github/LABELS.yml' ) && 'DELETE' === $args['method'] && 'safe-sha' === $body['sha'];
			}
		)->andReturn( [ 'response' => [ 'code' => 200 ], 'body' => '{}' ] );
		Functions\expect( 'delete_option' )->once()->with( 'alpaistr_agentic_workflow_revision' );
		Functions\expect( 'delete_transient' )->once();
		Functions\when( 'rest_ensure_response' )->alias(
			static function ( array $data ): WP_REST_Response {
				return new WP_REST_Response( $data );
			}
		);

		$result = alpaistr_agentic_github_cleanup_callback( new WP_REST_Request( [ 'confirm_repo' => 'example/project' ] ) );
		$data   = $result->get_data();

		$this->assertSame( [ '.github/LABELS.yml' ], $data['removed'] );
		$this->assertSame( [ '.github/workflows/claude.yml' ], $data['manual'] );
	}

	/**
	 * A GitHub rejection must remain visible and preserve local workflow state.
	 */
	public function test_cleanup_reports_failed_delete_without_resetting_state(): void {
		$this->mock_github_preview();
		Functions\when( 'wp_json_encode' )->alias( 'json_encode' );
		Functions\when( 'sanitize_text_field' )->alias(
			static function ( string $value ): string {
				return $value;
			}
		);
		Functions\expect( 'wp_remote_request' )->once()->andReturn( [ 'response' => [ 'code' => 403 ], 'body' => '{"message":"Protected branch"}' ] );
		Functions\expect( 'delete_option' )->never();
		Functions\expect( 'delete_transient' )->never();
		Functions\when( 'rest_ensure_response' )->alias(
			static function ( array $data ): WP_REST_Response {
				return new WP_REST_Response( $data );
			}
		);

		$result = alpaistr_agentic_github_cleanup_callback( new WP_REST_Request( [ 'confirm_repo' => 'example/project' ] ) );
		$data   = $result->get_data();

		$this->assertSame( [], $data['removed'] );
		$this->assertCount( 1, $data['errors'] );
		$this->assertStringContainsString( 'Protected branch', $data['errors'][0] );
	}
}
