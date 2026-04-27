const { test, expect } = require('@playwright/test');
const {
  gotoBoard,
  applyLabelFilter,
  openContainerOptions,
} = require('../../helpers/board');

test.describe('Filtered board regressions', () => {
  test('disables bulk container actions while filtering', async ({ page }) => {
    await gotoBoard(page);
    await applyLabelFilter(page, 'Design');

    await openContainerOptions(page, 'Backlog');
    await expect(
      page.getByRole('menuitem', { name: 'Lift Priority Items' }),
    ).toHaveAttribute('aria-disabled', 'true');
    await expect(
      page.getByRole('menuitem', { name: 'Move All To Next Column' }),
    ).toHaveAttribute('aria-disabled', 'true');

    await page.keyboard.press('Escape');

    await openContainerOptions(page, 'Done');
    await expect(
      page.getByRole('menuitem', { name: 'Lift Priority Items' }),
    ).toHaveAttribute('aria-disabled', 'true');
    await expect(
      page.getByRole('menuitem', { name: 'Delete All' }),
    ).toHaveAttribute('aria-disabled', 'true');
  });
});
