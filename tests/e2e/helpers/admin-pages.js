const { expect } = require('@playwright/test');
const { getAdminPageUrl, getPlaygroundBaseUrl } = require('./playground');

const WORDPRESS_NOT_READY_TEXT = 'WordPress is not ready yet';
const ADMIN_SHELL_RETRY_TIMEOUT_MS = 60 * 1000;
const ADMIN_SHELL_RETRY_INTERVAL_MS = 1_000;

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
 * Return whether the current page has loaded a usable WordPress admin shell.
 *
 * @param {import('@playwright/test').Page} page Playwright page.
 * @return {Promise<boolean>} True when the admin shell is ready.
 */
async function hasAdminShell(page) {
  const shellSelectors = ['#wpbody-content', '#adminmenuwrap', 'body.wp-admin'];

  for (const selector of shellSelectors) {
    if (await page.locator(selector).count()) {
      return true;
    }
  }

  return false;
}

/**
 * Warm up the WordPress admin shell before opening a page that triggers app boot.
 *
 * @param {import('@playwright/test').Page} page Playwright page.
 * @return {Promise<void>} Resolves when the admin shell is visible.
 */
async function ensureAdminShellReady(page) {
  const adminShellUrl = `${getPlaygroundBaseUrl()}/wp-admin/`;

  await expect
    .poll(
      async () => {
        await page.goto(adminShellUrl, { waitUntil: 'domcontentloaded' });
        await waitForBootstrapPlaceholderToClear(page);

        return hasAdminShell(page);
      },
      {
        timeout: ADMIN_SHELL_RETRY_TIMEOUT_MS,
        intervals: [ADMIN_SHELL_RETRY_INTERVAL_MS],
      },
    )
    .toBe(true);
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
