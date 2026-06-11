<?php
/**
 * Tests for Abilities API activity/audit behavior.
 *
 * @package AlpacaIssueTracker
 */

use Brain\Monkey;
use Brain\Monkey\Functions;

/**
 * Tests ability callbacks create the same activity comments as UI flows.
 */
class AbilitiesAuditTest extends \PHPUnit\Framework\TestCase {

	/**
	 * Captured activity comments keyed by generated comment ID.
	 *
	 * @var array<int, array<string, mixed>>
	 */
	private array $inserted_comments = [];

	/**
	 * Captured comment meta writes keyed by generated comment ID.
	 *
	 * @var array<int, array<string, mixed>>
	 */
	private array $comment_meta = [];

	/**
	 * Set up Brain Monkey and load ability callbacks.
	 */
	protected function setUp(): void {
		parent::setUp();
		Monkey\setUp();

		$this->inserted_comments = [];
		$this->comment_meta      = [];

		Functions\stubs( [ 'add_action' => null ] );

		require_once dirname( __DIR__, 3 ) . '/includes/notifications/dispatch.php';
		require_once dirname( __DIR__, 3 ) . '/includes/api/abilities.php';

		$this->stubTranslationFunctions();
		$this->stubSanitizers();
		$this->stubActivityCommentPersistence();
	}

	/**
	 * Tear down Brain Monkey.
	 */
	protected function tearDown(): void {
		$this->addToAssertionCount( \Mockery::getContainer()->mockery_getExpectationCount() );
		Monkey\tearDown();
		parent::tearDown();
	}

	/**
	 * Create ability creates an issue-created comment and matching priority audit.
	 */
	public function test_create_issue_creates_issue_and_priority_activity_comments(): void {
		Functions\when( 'get_current_user_id' )->justReturn( 7 );
		Functions\when( 'wp_get_current_user' )->justReturn( $this->makeUser( 7, 'Pratik', 'pratik' ) );
		Functions\when( 'wp_insert_post' )->justReturn( 101 );
		Functions\when( 'alpaistr_get_statuses' )->justReturn( [] );

		Functions\expect( 'update_post_meta' )->once()->with( 101, 'alpaca_high_priority', 1 );
		Functions\expect( 'delete_post_meta' )->never();
		Functions\expect( 'alpaistr_update_last_activity' )->once()->with( 101 );
		Functions\expect( 'alpaistr_clear_board_cache' )->once();
		Functions\when( 'alpaistr_get_issue_response_data' )->justReturn( [ 'post_id' => 101 ] );

		$result = alpaistr_ability_create_issue(
			[
				'feedback'         => 'Important broken checkout flow',
				'is_high_priority' => true,
			]
		);

		$this->assertSame( [ 'post_id' => 101 ], $result );
		$this->assertCount( 2, $this->inserted_comments );

		$comments = array_values( $this->inserted_comments );
		$this->assertSame( 'create', $comments[0]['comment_agent'] );
		$this->assertSame( 'issuecomment', $comments[0]['comment_type'] );
		$this->assertSame( 'Important broken checkout flow', $comments[0]['comment_content'] );
		$this->assertSame( [ 'issue-created', 'high-priority' ], $this->comment_meta[201]['alpacaCommentTags'] );

		$this->assertSame( 'audit', $comments[1]['comment_agent'] );
		$this->assertStringContainsString( 'Priority set to **High** by **Pratik**', $comments[1]['comment_content'] );
		$this->assertSame( [ 'priority-changed', 'action-add' ], $this->comment_meta[202]['alpacaCommentTags'] );
		$this->assertSame( [ 'action' => 'enable' ], $this->comment_meta[202]['alpacaNotificationContext'] );
	}

	/**
	 * Update ability creates status, assignee, and priority audit comments.
	 */
	public function test_update_issue_creates_status_assignee_and_priority_activity_comments(): void {
		$status_calls   = 0;
		$assignee_calls = 0;
		$priority_calls = 0;

		Functions\when( 'alpaistr_assert_issue_exists' )->justReturn( (object) [ 'ID' => 101 ] );
		Functions\when( 'wp_get_current_user' )->justReturn( $this->makeUser( 7, 'Pratik', 'pratik' ) );
		Functions\when( 'term_exists' )->justReturn( true );
		Functions\when( 'current_time' )->justReturn( '2026-06-10 10:00:00' );
		Functions\when( 'wp_update_post' )->justReturn( 101 );
		Functions\when( 'alpaistr_get_or_create_user_taxonomy_term' )->justReturn( 77 );
		Functions\when( 'alpaistr_to_int_ids' )->alias(
			static function ( array $ids ): array {
				return array_map( 'intval', $ids );
			}
		);
		Functions\when( 'alpaistr_get_issue_response_data' )->justReturn( [ 'post_id' => 101 ] );

		Functions\when( 'get_user_by' )->alias(
			function ( string $field, string $value ) {
				unset( $field );

				if ( 'alice' === $value ) {
					return $this->makeUser( 12, 'Alice', 'alice' );
				}

				return false;
			}
		);

		Functions\when( 'wp_get_post_terms' )->alias(
			function ( int $issue_id, string $taxonomy ) use ( &$status_calls, &$assignee_calls ): array {
				$this->assertSame( 101, $issue_id );

				if ( 'alpaca_status' === $taxonomy ) {
					++$status_calls;
					return 1 === $status_calls ? [ $this->makeTerm( 4, 'Backlog', 'backlog' ) ] : [ $this->makeTerm( 8, 'In Progress', 'in-progress' ) ];
				}

				if ( 'alpaca_assignee' === $taxonomy ) {
					++$assignee_calls;
					return 1 === $assignee_calls ? [] : [ $this->makeTerm( 77, 'Alice', 'alice' ) ];
				}

				return [];
			}
		);

		Functions\when( 'get_post_meta' )->alias(
			static function () use ( &$priority_calls ) {
				++$priority_calls;

				return 1 === $priority_calls ? '' : 1;
			}
		);

		Functions\expect( 'wp_set_post_terms' )->twice();
		Functions\expect( 'update_post_meta' )->once()->with( 101, 'alpaca_high_priority', 1 );
		Functions\expect( 'alpaistr_update_last_activity' )->once()->with( 101 );
		Functions\expect( 'alpaistr_clear_board_cache' )->once();

		$result = alpaistr_ability_update_issue(
			[
				'id'               => 101,
				'status_id'        => 8,
				'assignees'        => [ 'alice' ],
				'is_high_priority' => true,
			]
		);

		$this->assertSame( [ 'post_id' => 101 ], $result );
		$this->assertCount( 3, $this->inserted_comments );

		$this->assertSame( [ 'status-changed' ], $this->comment_meta[201]['alpacaCommentTags'] );
		$this->assertSame( [ 'action' => 'changed' ], $this->comment_meta[201]['alpacaNotificationContext'] );

		$this->assertSame( [ 'assignee-changed', 'action-add' ], $this->comment_meta[202]['alpacaCommentTags'] );
		$this->assertSame(
			[
				'action'            => 'assign',
				'affected_user_ids' => [ 12 ],
			],
			$this->comment_meta[202]['alpacaNotificationContext']
		);

		$this->assertSame( [ 'priority-changed', 'action-add' ], $this->comment_meta[203]['alpacaCommentTags'] );
		$this->assertSame( [ 'action' => 'enable' ], $this->comment_meta[203]['alpacaNotificationContext'] );
	}

	/**
	 * Update ability rejects unknown assignee slugs before writing the issue.
	 */
	public function test_update_issue_rejects_unknown_assignee_before_writes(): void {
		Functions\when( 'alpaistr_assert_issue_exists' )->justReturn( (object) [ 'ID' => 101 ] );
		Functions\when( 'wp_get_current_user' )->justReturn( $this->makeUser( 7, 'Pratik', 'pratik' ) );
		Functions\when( 'wp_get_post_terms' )->justReturn( [] );
		Functions\when( 'get_post_meta' )->justReturn( '' );
		Functions\when( 'get_user_by' )->justReturn( false );

		Functions\expect( 'wp_update_post' )->never();
		Functions\expect( 'wp_set_post_terms' )->never();
		Functions\expect( 'update_post_meta' )->never();
		Functions\expect( 'delete_post_meta' )->never();

		$result = alpaistr_ability_update_issue(
			[
				'id'        => 101,
				'title'     => 'Changed title',
				'assignees' => [ 'not-a-user' ],
			]
		);

		$this->assertInstanceOf( WP_Error::class, $result );
		$this->assertSame( 'invalid_assignee', $result->get_error_code() );
		$this->assertSame( [], $this->inserted_comments );
	}

	/**
	 * Delete ability creates an issue-deleted audit comment when trash succeeds.
	 */
	public function test_delete_issue_creates_issue_deleted_activity_comment(): void {
		Functions\when( 'alpaistr_assert_issue_exists' )->justReturn( (object) [ 'ID' => 101 ] );
		Functions\when( 'wp_get_current_user' )->justReturn( $this->makeUser( 7, 'Pratik', 'pratik' ) );
		Functions\when( 'wp_trash_post' )->justReturn( (object) [ 'ID' => 101 ] );

		Functions\expect( 'alpaistr_update_last_activity' )->once()->with( 101 );
		Functions\expect( 'alpaistr_clear_board_cache' )->once();

		$result = alpaistr_ability_delete_issue( [ 'id' => 101 ] );

		$this->assertSame(
			[
				'success' => true,
				'message' => 'Issue moved to trash successfully.',
				'id'      => 101,
			],
			$result
		);
		$this->assertCount( 1, $this->inserted_comments );

		$comments = array_values( $this->inserted_comments );
		$this->assertSame( 'audit', $comments[0]['comment_agent'] );
		$this->assertStringContainsString( 'Issue **deleted** by **Pratik**', $comments[0]['comment_content'] );
		$this->assertSame( [ 'issue-deleted' ], $this->comment_meta[201]['alpacaCommentTags'] );
		$this->assertSame( [ 'action' => 'delete' ], $this->comment_meta[201]['alpacaNotificationContext'] );
	}

	/**
	 * Stub translation functions.
	 */
	private function stubTranslationFunctions(): void {
		Functions\when( '__' )->alias(
			static function ( string $text ): string {
				return $text;
			}
		);
	}

	/**
	 * Stub sanitizer and utility functions used by the ability callbacks.
	 */
	private function stubSanitizers(): void {
		Functions\when( 'absint' )->alias(
			static function ( $value ): int {
				return abs( (int) $value );
			}
		);
		Functions\when( 'sanitize_key' )->alias(
			static function ( $value ): string {
				return strtolower( preg_replace( '/[^a-z0-9_\-]/', '', (string) $value ) );
			}
		);
		Functions\when( 'sanitize_text_field' )->alias(
			static function ( $value ): string {
				return trim( (string) $value );
			}
		);
		Functions\when( 'sanitize_user' )->alias(
			static function ( $value ): string {
				return trim( (string) $value );
			}
		);
		Functions\when( 'wp_kses_post' )->alias(
			static function ( $value ): string {
				return (string) $value;
			}
		);
		Functions\when( 'wp_trim_words' )->alias(
			static function ( string $text ): string {
				return $text;
			}
		);
		Functions\when( 'wp_slash' )->alias(
			static function ( array $value ): array {
				return $value;
			}
		);
		Functions\when( 'wp_filter_comment' )->alias(
			static function ( array $value ): array {
				return $value;
			}
		);
		Functions\when( 'is_wp_error' )->alias(
			static function ( $value ): bool {
				return $value instanceof WP_Error;
			}
		);
	}

	/**
	 * Stub comment persistence and notification dispatch.
	 */
	private function stubActivityCommentPersistence(): void {
		Functions\when( 'wp_insert_comment' )->alias(
			function ( array $commentdata ): int {
				$comment_id                             = 201 + count( $this->inserted_comments );
				$this->inserted_comments[ $comment_id ] = $commentdata;

				return $comment_id;
			}
		);
		Functions\when( 'update_comment_meta' )->alias(
			function ( int $comment_id, string $key, $value ): bool {
				$this->comment_meta[ $comment_id ][ $key ] = $value;

				return true;
			}
		);
		Functions\when( 'get_comment' )->alias(
			static function ( int $comment_id ): WP_Comment {
				return new WP_Comment(
					(object) [
						'comment_ID'       => $comment_id,
						'comment_type'     => 'issuecomment',
						'comment_approved' => 1,
					]
				);
			}
		);
		Functions\when( 'alpaistr_sync_comment_mentions' )->justReturn( null );
		Functions\when( 'alpaistr_get_notification_event_from_comment' )->justReturn( [ 'type' => 'ability-audit' ] );
		Functions\when( 'alpaistr_send_notifications_for_event' )->justReturn( null );
	}

	/**
	 * Create a test user object.
	 *
	 * @param int    $user_id User ID.
	 * @param string $name    Display name.
	 * @param string $slug    User nicename.
	 * @return WP_User Test user.
	 */
	private function makeUser( int $user_id, string $name, string $slug ): WP_User {
		return new WP_User(
			[
				'ID'            => $user_id,
				'display_name'  => $name,
				'user_email'    => $slug . '@example.test',
				'user_nicename' => $slug,
			]
		);
	}

	/**
	 * Create a test term object.
	 *
	 * @param int    $term_id Term ID.
	 * @param string $name    Term name.
	 * @param string $slug    Term slug.
	 * @return WP_Term Test term.
	 */
	private function makeTerm( int $term_id, string $name, string $slug ): WP_Term {
		return new WP_Term(
			[
				'term_id' => $term_id,
				'name'    => $name,
				'slug'    => $slug,
			]
		);
	}
}
