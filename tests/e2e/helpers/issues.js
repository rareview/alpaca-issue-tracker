const { expect } = require('@playwright/test');

const MODIFIER_KEY = process.platform === 'darwin' ? 'Meta' : 'Control';

/**
 * Return the issue title field locator inside the modal.
 *
 * @param {import('@playwright/test').Page} page Playwright page.
 * @return {import('@playwright/test').Locator} Title field locator.
 */
function getIssueTitleField(page) {
  return page.locator('[aria-label="Issue title"]').first();
}

/**
 * Open an issue from the board.
 *
 * @param {import('@playwright/test').Page} page       Playwright page.
 * @param {string}                          issueTitle Issue title.
 * @return {Promise<void>} Resolves when the issue modal is visible.
 */
async function openIssue(page, issueTitle) {
  await page
    .locator('.alpaca-item')
    .filter({ hasText: issueTitle })
    .first()
    .click();
  await expect(getIssueTitleField(page)).toBeVisible();
}

/**
 * Close the currently open issue modal.
 *
 * @param {import('@playwright/test').Page} page Playwright page.
 * @return {Promise<void>} Resolves when the modal closes.
 */
async function closeIssue(page) {
  const issueDialog = page.getByRole('dialog');

  await issueDialog.getByRole('button', { name: 'Close' }).click();
  await expect(issueDialog).toHaveCount(0);
  await expect(getIssueTitleField(page)).toHaveCount(0);
}

/**
 * Create a new board issue using the Add Issue control.
 *
 * @param {import('@playwright/test').Page} page       Playwright page.
 * @param {string}                          issueTitle Issue title.
 * @return {Promise<void>} Resolves when the issue appears on the board.
 */
async function createBoardIssue(page, issueTitle) {
  await page.locator('#alpaca-add-issue').click();
  await expect(getIssueTitleField(page)).toBeVisible();
  await page.keyboard.type(issueTitle);
  await page.getByRole('button', { name: 'Create Issue' }).click();
  await expect(
    page.locator('.alpaca-item').filter({ hasText: issueTitle }).first(),
  ).toBeVisible();
}

/**
 * Rename the currently open issue.
 *
 * @param {import('@playwright/test').Page} page     Playwright page.
 * @param {string}                          newTitle New issue title.
 * @return {Promise<void>} Resolves when the new title is visible.
 */
async function renameOpenIssue(page, newTitle) {
  const titleField = getIssueTitleField(page);

  await titleField.click();
  await page.keyboard.press(`${MODIFIER_KEY}+A`);
  await page.keyboard.type(newTitle);
  await page.keyboard.press('Tab');
  await expect(titleField).toContainText(newTitle);
}

/**
 * Progress the currently open issue to the next status.
 *
 * @param {import('@playwright/test').Page} page Playwright page.
 * @return {Promise<void>} Resolves when the action completes.
 */
async function progressOpenIssue(page) {
  await page.locator('.alpaca-modal-options-button').click();
  await page.getByRole('menuitem', { name: /Progress Issue to/i }).click();
}

/**
 * Add a comment to the currently open issue.
 *
 * @param {import('@playwright/test').Page} page        Playwright page.
 * @param {string}                          commentText Comment text.
 * @return {Promise<void>} Resolves when the comment appears.
 */
async function addCommentToOpenIssue(page, commentText) {
  await page.getByPlaceholder('Add a comment…').fill(commentText);
  await page.getByRole('button', { name: 'Submit Comment' }).click();
  await expect(
    page
      .locator('.alpaca-comments-timeline .alpaca-comment-content')
      .filter({ hasText: commentText })
      .last(),
  ).toBeVisible();
}

module.exports = {
  getIssueTitleField,
  openIssue,
  closeIssue,
  createBoardIssue,
  renameOpenIssue,
  progressOpenIssue,
  addCommentToOpenIssue,
};
