<?php
/**
 * Tests for Fix With AI setup state when switching repositories.
 *
 * @package AlpacaIssueTracker
 */

use AlpacaIssueTracker\Agentic\Agentic;
use Brain\Monkey;
use Brain\Monkey\Functions;

/**
 * Verifies that setup markers belong to the configured repository.
 */
class AgenticSettingsStateTest extends \PHPUnit\Framework\TestCase {

	/**
	 * Initialize WordPress function mocks.
	 */
	protected function setUp(): void {
		parent::setUp();
		Monkey\setUp();
		require_once dirname( __DIR__, 3 ) . '/includes/class-agentic.php';
	}

	/**
	 * Release WordPress function mocks.
	 */
	protected function tearDown(): void {
		$this->addToAssertionCount( \Mockery::getContainer()->mockery_getExpectationCount() );
		Monkey\tearDown();
		parent::tearDown();
	}

	/**
	 * A different repository must require a fresh workflow install.
	 */
	public function test_switching_repository_clears_workflow_state(): void {
		Functions\expect( 'delete_option' )->twice();
		Functions\expect( 'delete_transient' )->once()->with( 'alpaistr_agentic_workflow_installed' );

		Agentic::clear_workflow_state_after_settings_change( 'owner/old', 'owner/new', 'ai-main', 'ai-main' );
	}

	/**
	 * A new AI target branch must invalidate rendered workflow templates.
	 */
	public function test_switching_target_branch_clears_workflow_state(): void {
		Functions\expect( 'delete_option' )->twice();
		Functions\expect( 'delete_transient' )->once()->with( 'alpaistr_agentic_workflow_installed' );

		Agentic::clear_workflow_state_after_settings_change( 'owner/current', 'owner/current', 'ai-old', 'ai-new' );
	}

	/**
	 * Saving the current repository must preserve its workflow state.
	 */
	public function test_saving_same_repository_keeps_workflow_state(): void {
		Functions\expect( 'delete_option' )->never();
		Functions\expect( 'delete_transient' )->never();

		Agentic::clear_workflow_state_after_settings_change( 'owner/current', 'owner/current', 'ai-main', 'ai-main' );
	}
}
