const { expect } = require('@playwright/test');
const { readSeedManifest } = require('./playground');
const { gotoAdminPage } = require('./admin-pages');

const seedManifest = readSeedManifest();

/**
 * Return a status display name for a slug.
 *
 * @param {string} statusSlug Status slug.
 * @return {string} Status label.
 */
function getStatusName(statusSlug) {
  const matchedStatus = seedManifest.statuses.find(
    (status) => status.slug === statusSlug,
  );

  if (matchedStatus) {
    return matchedStatus.name;
  }

  return statusSlug;
}

/**
 * Escape a string for use inside a regular expression.
 *
 * @param {string} value Raw string value.
 * @return {string} Escaped regular expression string.
 */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Return the issue card locator for a title.
 *
 * @param {import('@playwright/test').Page} page       Playwright page.
 * @param {string}                          issueTitle Issue title.
 * @return {import('@playwright/test').Locator} Issue card locator.
 */
function getIssueCard(page, issueTitle) {
  const issueTitlePattern = new RegExp(`^\\s*${escapeRegExp(issueTitle)}\\s*$`);

  return page.locator('.alpaca-item').filter({
    has: page.locator('.alpaca-item-content').filter({
      hasText: issueTitlePattern,
    }),
  });
}

/**
 * Return the container locator for a status title.
 *
 * @param {import('@playwright/test').Page} page           Playwright page.
 * @param {string}                          containerTitle Column title.
 * @return {import('@playwright/test').Locator} Container locator.
 */
function getContainer(page, containerTitle) {
  return page
    .locator('.alpaca-container')
    .filter({ hasText: containerTitle })
    .first();
}

/**
 * Open the board page and wait for the seeded board to render.
 *
 * @param {import('@playwright/test').Page} page Playwright page.
 * @return {Promise<void>} Resolves when the board is ready.
 */
async function gotoBoard(page) {
  await gotoAdminPage(page, 'project-board');
  await expect(page.locator('.alpaca-container-title').first()).toBeVisible();
}

/**
 * Fill the board search control.
 *
 * @param {import('@playwright/test').Page} page  Playwright page.
 * @param {string}                          query Search query.
 * @return {Promise<void>} Resolves when the input is updated.
 */
async function searchBoard(page, query) {
  await page.getByRole('searchbox', { name: 'Search' }).fill(query);
}

/**
 * Apply the board label filter.
 *
 * @param {import('@playwright/test').Page} page      Playwright page.
 * @param {string}                          labelName Label name.
 * @return {Promise<void>} Resolves when the filter is selected.
 */
async function applyLabelFilter(page, labelName) {
  await page.getByRole('button', { name: 'Label' }).click();
  await page.getByRole('button', { name: labelName }).click();
}

/**
 * Clear the active board label filter.
 *
 * @param {import('@playwright/test').Page} page Playwright page.
 * @return {Promise<void>} Resolves when the filter is cleared.
 */
async function clearLabelFilter(page) {
  await page.getByRole('button', { name: 'Clear filter' }).click();
}

/**
 * Open the options menu for a board container.
 *
 * @param {import('@playwright/test').Page} page           Playwright page.
 * @param {string}                          containerTitle Column title.
 * @return {Promise<void>} Resolves when the menu is open.
 */
async function openContainerOptions(page, containerTitle) {
  const container = getContainer(page, containerTitle);

  await container.getByRole('button', { name: 'Options' }).click();
}

/**
 * Expect all seeded status columns to be visible.
 *
 * @param {import('@playwright/test').Page} page Playwright page.
 * @return {Promise<void>} Resolves when every column is visible.
 */
async function expectSeededColumns(page) {
  for (const status of seedManifest.statuses) {
    await expect(
      page.locator('.alpaca-container-title', {
        hasText: status.name,
      }),
    ).toBeVisible();
  }
}

/**
 * Expect an issue card to be visible inside its configured status column.
 *
 * @param {import('@playwright/test').Page} page       Playwright page.
 * @param {Object}                          issueEntry Seed manifest issue entry.
 * @return {Promise<void>} Resolves when the card is visible.
 */
async function expectIssueInConfiguredColumn(page, issueEntry) {
  const column = page
    .locator('.alpaca-container')
    .filter({ hasText: getStatusName(issueEntry.status) })
    .first();

  await expect(column).toContainText(issueEntry.title);
}

module.exports = {
  gotoBoard,
  expectSeededColumns,
  expectIssueInConfiguredColumn,
  getStatusName,
  getIssueCard,
  getContainer,
  searchBoard,
  applyLabelFilter,
  clearLabelFilter,
  openContainerOptions,
};
