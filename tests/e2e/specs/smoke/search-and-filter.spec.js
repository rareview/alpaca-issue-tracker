const { test, expect } = require('@playwright/test');
const {
  gotoBoard,
  getIssueCard,
  searchBoard,
  applyLabelFilter,
  clearLabelFilter,
} = require('../../helpers/board');

const BACKLOG_ISSUE = 'Triage homepage form validation';
const LABELLED_NEXT_ISSUE = 'Review onboarding flow copy';
const LABELLED_PROGRESS_ISSUE = 'Fix checkout error on Safari';

test.describe('Board search and filter smoke', () => {
  test('combines board search with the label filter', async ({ page }) => {
    await gotoBoard(page);

    await searchBoard(page, 'latest');

    await expect(getIssueCard(page, BACKLOG_ISSUE)).toHaveCount(1);
    await expect(getIssueCard(page, LABELLED_NEXT_ISSUE)).toHaveCount(1);
    await expect(getIssueCard(page, LABELLED_PROGRESS_ISSUE)).toHaveCount(0);

    await applyLabelFilter(page, 'Design');

    await expect(getIssueCard(page, BACKLOG_ISSUE)).toHaveCount(0);
    await expect(getIssueCard(page, LABELLED_NEXT_ISSUE)).toHaveCount(1);
    await expect(getIssueCard(page, LABELLED_PROGRESS_ISSUE)).toHaveCount(0);

    await searchBoard(page, '');

    await expect(getIssueCard(page, BACKLOG_ISSUE)).toHaveCount(0);
    await expect(getIssueCard(page, LABELLED_NEXT_ISSUE)).toHaveCount(1);
    await expect(getIssueCard(page, LABELLED_PROGRESS_ISSUE)).toHaveCount(1);

    await clearLabelFilter(page);

    await expect(getIssueCard(page, BACKLOG_ISSUE)).toHaveCount(1);
    await expect(getIssueCard(page, LABELLED_NEXT_ISSUE)).toHaveCount(1);
    await expect(getIssueCard(page, LABELLED_PROGRESS_ISSUE)).toHaveCount(1);
  });
});
