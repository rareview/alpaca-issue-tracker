const { test } = require('@playwright/test');
const { gotoBoard } = require('../../helpers/board');
const {
  openIssue,
  closeIssue,
  addCommentToOpenIssue,
} = require('../../helpers/issues');
const { measureAction } = require('../../helpers/performance');

const ISSUE_TITLE = 'Fix checkout error on Safari';

test.describe('Comments smoke', () => {
  test('adds a comment to an existing issue', async ({ page }, testInfo) => {
    const commentText = `Playwright comment ${Date.now()}`;

    await gotoBoard(page);
    await openIssue(page, ISSUE_TITLE);
    await measureAction(
      testInfo,
      'comment-submit',
      async () => {
        await addCommentToOpenIssue(page, commentText);
      },
      {
        issueTitle: ISSUE_TITLE,
      },
    );
    await closeIssue(page);
  });
});
