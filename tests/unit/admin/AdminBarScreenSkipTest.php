<?php
/**
 * Tests for admin-bar screen skip behavior.
 *
 * @package AlpacaIssueTracker
 */

use Brain\Monkey;
use Brain\Monkey\Functions;

/**
 * Tests admin editor screens that should not load contextual capture assets.
 */
class AdminBarScreenSkipTest extends \PHPUnit\Framework\TestCase {

	/**
	 * Set up Brain Monkey and load the admin-bar helper.
	 */
	protected function setUp(): void {
		parent::setUp();
		Monkey\setUp();

		Functions\stubs(
			[
				'add_action' => null,
			]
		);

		require_once dirname( __DIR__, 3 ) . '/includes/admin/admin-bar.php';
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
	 * Custom post type edit screens should skip contextual capture assets.
	 */
	public function test_custom_post_type_edit_screen_is_skipped(): void {
		$this->mockAdminScreen( 'portfolio', 'post' );

		$this->assertTrue( alpaistr_should_skip_admin_report_screen( 'post.php' ) );
	}

	/**
	 * Custom post type add-new screens should skip contextual capture assets.
	 */
	public function test_custom_post_type_add_new_screen_is_skipped(): void {
		$this->mockAdminScreen( 'portfolio', 'post' );

		$this->assertTrue( alpaistr_should_skip_admin_report_screen( 'post-new.php' ) );
	}

	/**
	 * Custom post type list screens should keep contextual capture available.
	 */
	public function test_custom_post_type_list_screen_is_not_skipped(): void {
		$this->mockAdminScreen( 'portfolio', 'edit' );

		$this->assertFalse( alpaistr_should_skip_admin_report_screen( 'edit.php' ) );
	}

	/**
	 * Mock the current WordPress admin screen.
	 *
	 * @param string $post_type   Current post type.
	 * @param string $screen_base Current screen base.
	 * @return void
	 */
	private function mockAdminScreen( $post_type, $screen_base ): void {
		Functions\when( 'is_admin' )->justReturn( true );
		Functions\when( 'get_current_screen' )->justReturn(
			(object) [
				'post_type' => $post_type,
				'base'      => $screen_base,
			]
		);
	}
}
