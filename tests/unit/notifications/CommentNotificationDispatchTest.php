<?php
/**
 * Tests for comment notification dispatch logic.
 *
 * Covers alpaistr_dispatch_new_comment_notifications() and the two hooks that
 * call it, verifying each comment-creation path (REST /wp/v2/comments, Abilities
 * API, WP-CLI / direct PHP) dispatches correctly.
 *
 * Note: the REST_REQUEST guard in alpaistr_handle_new_comment_notifications()
 * cannot be tested here because PHP constants cannot be redefined once set.
 * That guard is exercised structurally: the REST path routes through
 * rest_after_insert_comment, tested below.
 */

use Brain\Monkey;
use Brain\Monkey\Functions;

class CommentNotificationDispatchTest extends \PHPUnit\Framework\TestCase {

	protected function setUp(): void {
		parent::setUp();
		Monkey\setUp();

		// Stub add_action so dispatch.php registers hooks without a real WP environment.
		Functions\stubs( [ 'add_action' => null ] );

		require_once dirname( __DIR__, 3 ) . '/includes/notifications/dispatch.php';
	}

	protected function tearDown(): void {
		// Report Mockery expectation checks as PHPUnit assertions so tests aren't flagged risky.
		$this->addToAssertionCount( \Mockery::getContainer()->mockery_getExpectationCount() );
		Monkey\tearDown();
		parent::tearDown();
	}

	// -------------------------------------------------------------------------
	// alpaistr_dispatch_new_comment_notifications()
	// -------------------------------------------------------------------------

	public function test_dispatch_skips_non_issuecomment_type(): void {
		$comment               = new stdClass();
		$comment->comment_type = 'comment';

		Functions\expect( 'alpaistr_sync_comment_mentions' )->never();
		Functions\expect( 'alpaistr_send_notifications_for_event' )->never();

		alpaistr_dispatch_new_comment_notifications( 1, $comment );
	}

	public function test_dispatch_syncs_mentions_but_skips_notifications_for_unapproved(): void {
		$comment                   = new stdClass();
		$comment->comment_type     = 'issuecomment';
		$comment->comment_approved = '0';

		Functions\expect( 'alpaistr_sync_comment_mentions' )->once()->with( 42 );
		Functions\expect( 'alpaistr_send_notifications_for_event' )->never();

		alpaistr_dispatch_new_comment_notifications( 42, $comment );
	}

	public function test_dispatch_sends_notifications_for_approved_issuecomment(): void {
		$comment                   = new stdClass();
		$comment->comment_type     = 'issuecomment';
		$comment->comment_approved = '1';
		$event                     = [ 'type' => 'comment', 'post_id' => 99 ];

		Functions\expect( 'alpaistr_sync_comment_mentions' )->once()->with( 42 );
		Functions\expect( 'alpaistr_get_notification_event_from_comment' )
			->once()
			->with( $comment )
			->andReturn( $event );
		Functions\expect( 'alpaistr_send_notifications_for_event' )->once()->with( $event );

		alpaistr_dispatch_new_comment_notifications( 42, $comment );
	}

	public function test_dispatch_skips_notifications_when_event_is_not_array(): void {
		$comment                   = new stdClass();
		$comment->comment_type     = 'issuecomment';
		$comment->comment_approved = '1';

		Functions\expect( 'alpaistr_sync_comment_mentions' )->once();
		Functions\expect( 'alpaistr_get_notification_event_from_comment' )->andReturn( null );
		Functions\expect( 'alpaistr_send_notifications_for_event' )->never();

		alpaistr_dispatch_new_comment_notifications( 42, $comment );
	}

	public function test_dispatch_treats_integer_one_approval_as_approved(): void {
		$comment                   = new stdClass();
		$comment->comment_type     = 'issuecomment';
		$comment->comment_approved = 1; // integer, not string.
		$event                     = [ 'type' => 'comment' ];

		Functions\expect( 'alpaistr_sync_comment_mentions' )->once();
		Functions\expect( 'alpaistr_get_notification_event_from_comment' )->andReturn( $event );
		Functions\expect( 'alpaistr_send_notifications_for_event' )->once();

		alpaistr_dispatch_new_comment_notifications( 1, $comment );
	}

	// -------------------------------------------------------------------------
	// alpaistr_handle_new_comment_notifications() — wp_insert_comment hook
	// (REST_REQUEST undefined = WP-CLI / direct PHP path)
	// -------------------------------------------------------------------------

	public function test_wp_insert_hook_dispatches_outside_rest(): void {
		$comment                   = new stdClass();
		$comment->comment_type     = 'issuecomment';
		$comment->comment_approved = '1';
		$event                     = [ 'type' => 'comment' ];

		Functions\expect( 'alpaistr_sync_comment_mentions' )->once()->with( 7 );
		Functions\expect( 'alpaistr_get_notification_event_from_comment' )->andReturn( $event );
		Functions\expect( 'alpaistr_send_notifications_for_event' )->once();

		alpaistr_handle_new_comment_notifications( 7, $comment );
	}

	// -------------------------------------------------------------------------
	// alpaistr_handle_rest_insert_comment_notifications() — rest_after_insert_comment
	// -------------------------------------------------------------------------

	public function test_rest_hook_skips_non_wp_comment_object(): void {
		Functions\expect( 'alpaistr_sync_comment_attachments_meta' )->never();

		alpaistr_handle_rest_insert_comment_notifications( new stdClass(), null, true );
	}

	public function test_rest_hook_syncs_attachments_but_skips_dispatch_on_update(): void {
		$wp_comment = $this->makeComment( 5, 'issuecomment', '1' );

		Functions\expect( 'alpaistr_sync_comment_attachments_meta' )->once()->with( 5 );
		Functions\expect( 'alpaistr_sync_comment_mentions' )->never();
		Functions\expect( 'alpaistr_send_notifications_for_event' )->never();

		alpaistr_handle_rest_insert_comment_notifications( $wp_comment, null, false );
	}

	public function test_rest_hook_dispatches_full_flow_on_create(): void {
		$wp_comment = $this->makeComment( 5, 'issuecomment', '1' );
		$event      = [ 'type' => 'comment' ];

		Functions\expect( 'alpaistr_sync_comment_attachments_meta' )->once()->with( 5 );
		Functions\expect( 'alpaistr_sync_comment_mentions' )->once()->with( 5 );
		Functions\expect( 'alpaistr_get_notification_event_from_comment' )->andReturn( $event );
		Functions\expect( 'alpaistr_send_notifications_for_event' )->once();

		alpaistr_handle_rest_insert_comment_notifications( $wp_comment, null, true );
	}

	public function test_rest_hook_skips_notifications_for_non_issuecomment_on_create(): void {
		$wp_comment = $this->makeComment( 5, 'comment', '1' );

		Functions\expect( 'alpaistr_sync_comment_attachments_meta' )->once()->with( 5 );
		Functions\expect( 'alpaistr_sync_comment_mentions' )->never();
		Functions\expect( 'alpaistr_send_notifications_for_event' )->never();

		alpaistr_handle_rest_insert_comment_notifications( $wp_comment, null, true );
	}

	// -------------------------------------------------------------------------
	// Helpers
	// -------------------------------------------------------------------------

	private function makeComment( int $id, string $type, string $approved ): WP_Comment {
		return new WP_Comment(
			(object) [
				'comment_ID'       => $id,
				'comment_type'     => $type,
				'comment_approved' => $approved,
			]
		);
	}
}
