const { test, expect } = require('@playwright/test');
const { gotoAdminPage } = require('../../helpers/admin-pages');

test.describe('Notifications smoke', () => {
  test('loads the notifications screen', async ({ page }) => {
    await gotoAdminPage(page, 'alpaca-notifications');
    await expect(
      page.getByRole('heading', { name: 'My Notifications' }),
    ).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Preferences' })).toBeVisible();
  });

  test('loads the email templates screen', async ({ page }) => {
    await gotoAdminPage(page, 'alpaca-email-templates');
    await expect(
      page.getByRole('heading', { name: 'Email Templates' }),
    ).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Daily Digest' })).toBeVisible();
  });
});
