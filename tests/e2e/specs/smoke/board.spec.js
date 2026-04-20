const { test, expect } = require('@playwright/test');
const { readSeedManifest } = require('../../helpers/playground');
const {
  gotoBoard,
  expectSeededColumns,
  expectIssueInConfiguredColumn,
} = require('../../helpers/board');
const { measureAction } = require('../../helpers/performance');

const seedManifest = readSeedManifest();

test.describe('Project Board smoke', () => {
  test('loads the seeded board data', async ({ page }, testInfo) => {
    await measureAction(testInfo, 'board-load', async () => {
      await gotoBoard(page);
    });

    await expect(page).toHaveTitle(/Project Board/);
    await expectSeededColumns(page);

    for (const issueEntry of seedManifest.issues) {
      await expectIssueInConfiguredColumn(page, issueEntry);
    }
  });
});
