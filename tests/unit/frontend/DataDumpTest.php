<?php
/**
 * Tests for contextual capture server/header redaction.
 *
 * @package AlpacaIssueTracker
 */

use Brain\Monkey;
use Brain\Monkey\Functions;

/**
 * Tests datadump server and header filtering.
 */
class DataDumpTest extends \PHPUnit\Framework\TestCase {

	/**
	 * Set up Brain Monkey and load data dump helpers.
	 */
	protected function setUp(): void {
		parent::setUp();
		Monkey\setUp();

		require_once dirname( __DIR__, 3 ) . '/includes/frontend/data-dump.php';

		Functions\when( 'sanitize_text_field' )->returnArg();
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
	 * Sensitive $_SERVER values should be omitted from snapshots.
	 */
	public function test_filter_datadump_server_data_omits_sensitive_keys(): void {
		$server_data = [
			'REQUEST_URI'    => '/sample-page',
			'DB_PASSWORD'    => 'super-secret',
			'HTTP_COOKIE'    => 'session=abc',
			'HTTP_USER_AGENT' => 'Mozilla/5.0',
		];

		$filtered = alpaistr_filter_datadump_server_data( $server_data );

		$this->assertSame(
			[
				'REQUEST_URI'     => '/sample-page',
				'HTTP_USER_AGENT' => 'Mozilla/5.0',
			],
			$filtered
		);
	}

	/**
	 * Sensitive request headers should be omitted from snapshots.
	 */
	public function test_filter_datadump_headers_omit_sensitive_names(): void {
		$headers = [
			'Accept'        => 'application/json',
			'Authorization' => 'Bearer top-secret',
			'Cookie'        => 'wordpress_logged_in=abc',
			'User-Agent'    => 'Mozilla/5.0',
		];

		$filtered = alpaistr_filter_datadump_headers( $headers );

		$this->assertSame(
			[
				'Accept'     => 'application/json',
				'User-Agent' => 'Mozilla/5.0',
			],
			$filtered
		);
	}
}
