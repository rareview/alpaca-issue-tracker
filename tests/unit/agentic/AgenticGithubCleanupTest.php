<?php
/**
 * Tests for explicitly removing Fix With AI GitHub setup.
 *
 * @package AlpacaIssueTracker
 */

use AlpacaIssueTracker\Agentic\Agentic;
use Brain\Monkey;
use Brain\Monkey\Functions;

/**
 * Verify cleanup removes every plugin-created resource it finds.
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
	 * Cleanup covers every bundled plugin path.
	 */
	public function test_cleanup_paths_include_bundled_files(): void {
		$paths = alpaistr_agentic_cleanup_paths();

		$this->assertContains( '.github/LABELS.yml', $paths );
		$this->assertContains( '.github/workflows/claude.yml', $paths );
		$this->assertContains( '.github/alpaca/security/agent.json', $paths );
		$this->assertSame( $paths, array_unique( $paths ) );
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
				if ( str_contains( $url, '/actions/variables/ALPACA_AI_TARGET_BRANCH' ) ) {
					return [ 'response' => [ 'code' => 200 ], 'body' => '{"name":"ALPACA_AI_TARGET_BRANCH","value":"ai-work"}' ];
				}
				if ( str_contains( $url, '/git/ref/heads/' ) ) {
					return [ 'response' => [ 'code' => 200 ], 'body' => '{"ref":"refs/heads/alpaca/ai-development"}' ];
				}
				if ( str_contains( $url, '/contents/.github/LABELS.yml' ) ) {
					return [ 'response' => [ 'code' => 200 ], 'body' => json_encode( [ 'content' => base64_encode( 'anything' ), 'sha' => 'labels-sha' ] ) ];
				}
				if ( str_contains( $url, '/contents/.github/workflows/claude.yml' ) ) {
					return [ 'response' => [ 'code' => 200 ], 'body' => json_encode( [ 'content' => base64_encode( 'customized' ), 'sha' => 'custom-sha' ] ) ];
				}
				return [ 'response' => [ 'code' => 404 ], 'body' => '{}' ];
			}
		);
	}

	/**
	 * Edited files stay on the removal list because the plugin created the path.
	 */
	public function test_preview_lists_every_plugin_file_regardless_of_content(): void {
		$this->mock_github_preview();
		$preview = alpaistr_agentic_github_cleanup_preview();

		$this->assertSame( 'example/project', $preview['repo'] );
		$this->assertSame(
			[ '.github/LABELS.yml', '.github/workflows/claude.yml' ],
			array_column( $preview['files'], 'path' )
		);
		$this->assertArrayNotHasKey( 'status', $preview['files'][0] );
		$this->assertTrue( $preview['variable'] );
		$this->assertSame( 'alpaca/ai-development', $preview['setup_branch'] );
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
	 * Cleanup deletes every file by SHA, plus the Actions variable and setup branch.
	 */
	public function test_cleanup_removes_files_variable_and_setup_branch(): void {
		$this->mock_github_preview();
		Functions\when( 'wp_json_encode' )->alias( 'json_encode' );
		$requested = [];
		Functions\expect( 'wp_remote_request' )->times( 4 )->andReturnUsing(
			static function ( string $url, array $args ) use ( &$requested ): array {
				$requested[] = $url;
				if ( str_contains( $url, '/contents/' ) ) {
					return [ 'response' => [ 'code' => 200 ], 'body' => '{}' ];
				}
				return [ 'response' => [ 'code' => 204 ], 'body' => '' ];
			}
		);
		Functions\expect( 'delete_option' )->twice();
		Functions\expect( 'delete_transient' )->once();
		Functions\when( 'rest_ensure_response' )->alias(
			static function ( array $data ): WP_REST_Response {
				return new WP_REST_Response( $data );
			}
		);

		$result = alpaistr_agentic_github_cleanup_callback( new WP_REST_Request( [ 'confirm_repo' => 'example/project' ] ) );
		$data   = $result->get_data();

		$this->assertSame(
			[
				'.github/LABELS.yml',
				'.github/workflows/claude.yml',
				'ALPACA_AI_TARGET_BRANCH',
				'alpaca/ai-development',
			],
			$data['removed']
		);
		$this->assertSame( [], $data['errors'] );
		$this->assertStringContainsString( '/actions/variables/ALPACA_AI_TARGET_BRANCH', $requested[2] );
		$this->assertStringContainsString( '/git/refs/heads/', $requested[3] );
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
		Functions\when( 'wp_remote_request' )->justReturn( [ 'response' => [ 'code' => 403 ], 'body' => '{"message":"Protected branch"}' ] );
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
		$this->assertCount( 4, $data['errors'] );
		$this->assertStringContainsString( 'Protected branch', $data['errors'][0] );
	}

	/**
	 * The plugins-page link needs a saved repository and token, not a setup pull request.
	 */
	public function test_github_cleanup_link_requires_saved_repository_and_token(): void {
		Functions\when( 'current_user_can' )->justReturn( true );
		Functions\when( 'get_option' )->alias(
			static function ( string $key ) {
				if ( Agentic::OPTION_KEY === $key ) {
					return [
						'github_repo'  => 'example/project',
						'github_token' => 'token',
					];
				}
				return '';
			}
		);

		$this->assertTrue( Agentic::can_show_github_cleanup_link() );
	}

	/**
	 * No repository means there is no GitHub setup to remove.
	 */
	public function test_github_cleanup_link_stays_hidden_without_repository(): void {
		Functions\when( 'current_user_can' )->justReturn( true );
		Functions\when( 'get_option' )->alias(
			static function ( string $key ) {
				if ( Agentic::OPTION_KEY === $key ) {
					return [
						'github_token' => 'token',
					];
				}
				return '';
			}
		);

		$this->assertFalse( Agentic::can_show_github_cleanup_link() );
	}

	/**
	 * Cleanup is limited to administrators, matching the REST permission.
	 */
	public function test_github_cleanup_link_stays_hidden_without_manage_options(): void {
		Functions\when( 'current_user_can' )->justReturn( false );

		$this->assertFalse( Agentic::can_show_github_cleanup_link() );
	}
}
