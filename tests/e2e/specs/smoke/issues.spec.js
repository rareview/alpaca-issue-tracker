const { test, expect } = require('@playwright/test');
const {
  gotoBoard,
  getContainer,
  getIssueCard,
} = require('../../helpers/board');
const {
  openIssue,
  closeIssue,
  createBoardIssue,
  renameOpenIssue,
  progressOpenIssue,
} = require('../../helpers/issues');
const { measureAction } = require('../../helpers/performance');

test.describe('Issue lifecycle smoke', () => {
  test('creates, edits, and progresses an issue', async ({
    page,
  }, testInfo) => {
    const createdTitle = `Playwright created issue ${Date.now()}`;
    const renamedTitle = `${createdTitle} updated`;

    await gotoBoard(page);
    await measureAction(
      testInfo,
      'issue-create',
      async () => {
        await createBoardIssue(page, createdTitle);
      },
      {
        issueTitle: createdTitle,
      },
    );
    await expect(getContainer(page, 'Backlog')).toContainText(createdTitle);

    await openIssue(page, createdTitle);
    await renameOpenIssue(page, renamedTitle);
    await measureAction(
      testInfo,
      'issue-progress',
      async () => {
        await progressOpenIssue(page);
      },
      {
        issueTitle: renamedTitle,
      },
    );
    await closeIssue(page);

    await expect(getIssueCard(page, createdTitle)).toHaveCount(0);
    await expect(getContainer(page, 'Next')).toContainText(renamedTitle);
  });
});
