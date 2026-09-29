<?php
/**
 * Tests for the Fix With AI workflow approval boundary.
 *
 * @package AlpacaIssueTracker
 */

/**
 * Verifies that contributor-created issues cannot start the agent directly.
 */
class WorkflowApprovalTest extends \PHPUnit\Framework\TestCase {

	/**
	 * The public issue template must not grant the execution label.
	 */
	public function test_issue_template_does_not_apply_agent_ready(): void {
		$template = file_get_contents( dirname( __DIR__, 3 ) . '/includes/agentic/ISSUE_TEMPLATE/agent-ready.md' );

		$this->assertIsString( $template );
		$this->assertStringNotContainsString( "labels: 'agent-ready'", $template );
	}

	/**
	 * Automated screening can nominate an issue, but not authorize execution.
	 */
	public function test_auto_label_workflow_only_adds_candidate_label(): void {
		$workflow = file_get_contents( dirname( __DIR__, 3 ) . '/includes/agentic/workflows/auto-label-agent-ready.yml' );

		$this->assertIsString( $workflow );
		$this->assertStringContainsString( "labels: ['agent-candidate']", $workflow );
		$this->assertStringNotContainsString( "labels: ['agent-ready']", $workflow );
	}
}
