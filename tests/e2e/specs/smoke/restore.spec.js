const { test, expect } = require('@playwright/test');
const {
  readSeedManifest,
} = require('../../helpers/playground');
const { gotoAdminPage } = require('../../helpers/admin-pages');

const seedManifest = readSeedManifest();
const deletedIssueTitle = seedManifest.deletedIssues[0].title;

test.describe('Deleted Items smoke', () => {
  test('shows the seeded deleted issue', async ({ page }) => {
    await gotoAdminPage(page, 'alpaca-settings');
    await expect(page.getByRole('heading', { name: 'Configure' })).toBeVisible();
    await page.getByRole('tab', { name: 'Deleted Items' }).click();
    await expect(page.getByText(deletedIssueTitle, { exact: true })).toBeVisible();
  });
});
