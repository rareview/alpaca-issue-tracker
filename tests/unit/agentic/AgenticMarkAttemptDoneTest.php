<?php
/**
 * Tests for ending a fix attempt with Mark attempt as done.
 *
 * @package AlpacaIssueTracker
 */

use Brain\Monkey;
use Brain\Monkey\Functions;

/**
 * Verifies a completed history entry closes the current attempt in Alpaca only.
 */
class AgenticMarkAttemptDoneTest extends \PHPUnit\Framework\TestCase {

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
				'add_action' => null,
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
		Monkey\tearDown();
		parent::tearDown();
	}

	/**
	 * A completed entry stays in history and ends the attempt before it.
	 */
	public function test_completed_entry_ends_the_current_attempt(): void {
		Functions\when( 'get_post_meta' )->justReturn(
			[
				[
					'type'          => 'sent',
					'github_number' => 10,
				],
				[
					'type'        => 'completed',
					'occurred_at' => '2026-10-15T12:00:00+00:00',
				],
				[
					'type'          => 'sent',
					'github_number' => 11,
				],
			]
		);

		$history = alpaistr_agentic_get_activity_history( 7 );
		$current = alpaistr_agentic_current_attempt_entries( 7 );

		$this->assertCount( 3, $history );
		$this->assertSame( 'completed', $history[1]['type'] );
		$this->assertCount( 1, $current );
		$this->assertSame( 11, $current[0]['github_number'] );
	}

	/**
	 * Marking the only attempt done leaves no active send for the next action.
	 */
	public function test_completed_attempt_has_no_active_send(): void {
		Functions\when( 'get_post_meta' )->justReturn(
			[
				[
					'type'          => 'sent',
					'github_number' => 10,
				],
				[
					'type' => 'completed',
				],
			]
		);

		$this->assertSame( [], alpaistr_agentic_current_attempt_entries( 7 ) );
		$this->assertSame(
			-1,
			alpaistr_agentic_current_attempt_original_sent_index( alpaistr_agentic_get_activity_history( 7 ) )
		);
	}
}
