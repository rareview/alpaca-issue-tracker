const { expect } = require('@playwright/test');
const {
  getAdminPageUrl,
  getPlaygroundBaseUrl,
} = require('./playground');

const WORDPRESS_NOT_READY_TEXT = 'WordPress is not ready yet';

/**
 * Wait until the current page stops showing the Playground bootstrap placeholder.
 *
 * @param {import('@playwright/test').Page} page Playwright page.
 * @return {Promise<void>} Resolves when the placeholder has cleared.
 */
async function waitForBootstrapPlaceholderToClear(page) {
  await expect
    .poll(
      async () => {
        const bodyText = await page.locator('body').textContent();

        if (!bodyText || !bodyText.includes(WORDPRESS_NOT_READY_TEXT)) {
          return true;
        }

        await page.reload({ waitUntil: 'domcontentloaded' });

        return false;
      },
      {
        timeout: 60 * 1000,
        intervals: [1_000],
      },
    )
    .toBe(true);
}

/**
 * Warm up the WordPress admin shell before opening a page that triggers app boot.
 *
 * @param {import('@playwright/test').Page} page Playwright page.
 * @return {Promise<void>} Resolves when the admin shell is visible.
 */
async function ensureAdminShellReady(page) {
  await page.goto(`${getPlaygroundBaseUrl()}/wp-admin/`);
  await waitForBootstrapPlaceholderToClear(page);
  await expect(page.locator('#wpadminbar')).toBeVisible();
}

/**
 * Open an Alpaca admin page and recover from Playground bootstrap placeholders.
 *
 * @param {import('@playwright/test').Page} page     Playwright page.
 * @param {string}                          pageSlug Admin page slug.
 * @return {Promise<void>} Resolves when the placeholder has cleared.
 */
async function gotoAdminPage(page, pageSlug) {
  await ensureAdminShellReady(page);
  await page.goto(getAdminPageUrl(pageSlug));
  await waitForBootstrapPlaceholderToClear(page);
}

module.exports = {
  gotoAdminPage,
};
