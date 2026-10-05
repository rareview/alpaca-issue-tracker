<?php
/**
 * Tests for the Fix With AI workflow approval boundary.
 *
 * @package AlpacaIssueTracker
 */

/**
 * Verifies the public template and the agent trigger workflow.
 */
class WorkflowApprovalTest extends \PHPUnit\Framework\TestCase {

	/**
	 * The public issue template must not apply the Alpaca marker label.
	 */
	public function test_issue_template_does_not_apply_alpaca_ai(): void {
		$template = file_get_contents( dirname( __DIR__, 3 ) . '/includes/agentic/ISSUE_TEMPLATE/agent-ready.md' );

		$this->assertIsString( $template );
		$this->assertStringNotContainsString( "labels: 'agent-ready'", $template );
		$this->assertStringNotContainsString( "labels: 'alpaca-ai'", $template );
	}

	/**
	 * Automated screening nominates a candidate. It does not mark or start an Alpaca run.
	 */
	public function test_auto_label_workflow_only_adds_candidate_label(): void {
		$workflow = file_get_contents( dirname( __DIR__, 3 ) . '/includes/agentic/workflows/auto-label-agent-ready.yml' );

		$this->assertIsString( $workflow );
		$this->assertStringContainsString( "labels: ['agent-candidate']", $workflow );
		$this->assertStringNotContainsString( "labels: ['agent-ready']", $workflow );
		$this->assertStringNotContainsString( "labels: ['alpaca-ai']", $workflow );
	}

	/**
	 * The agent workflow starts only from workflow_dispatch.
	 */
	public function test_agent_workflow_starts_only_from_dispatch(): void {
		$workflow = file_get_contents( dirname( __DIR__, 3 ) . '/includes/agentic/workflows/agent-trigger.yml' );

		$this->assertIsString( $workflow );
		$this->assertStringContainsString( 'workflow_dispatch:', $workflow );
		$this->assertStringContainsString( 'issue_number:', $workflow );
		$this->assertStringNotContainsString( 'types: [labeled]', $workflow );
		$this->assertStringNotContainsString( 'github.event.label', $workflow );
	}
}
