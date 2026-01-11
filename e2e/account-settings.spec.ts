import { expect, test } from '@playwright/test';
import { loginAsAdmin } from './utils/appShell';

test('user can update account profile', async ({ page }) => {
  await loginAsAdmin(page);

  const username = `acct-${Date.now()}`;
  const createResponse = await page.request.post('/api/admin/users', {
    data: {
      username,
      name: 'Account User',
      role: 'USER',
    },
  });

  expect(createResponse.ok()).toBe(true);
  const { resetToken } = (await createResponse.json()) as { resetToken: string };
  expect(resetToken).toBeTruthy();

  await page.context().clearCookies();
  await page.evaluate(() => window.sessionStorage.clear());

  await page.goto(`/reset/confirm?token=${resetToken}`);
  await page.getByLabel(/new password/i).fill('ValidPass12!');
  await page.getByLabel(/confirm password/i).fill('ValidPass12!');
  await page.getByRole('button', { name: /set new password/i }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.getByLabel(/username or email/i).fill(username);
  await page.getByLabel(/password/i).fill('ValidPass12!');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/ideas$/);

  await page.goto('/account');
  await page.getByLabel(/^Name$/).fill('Updated Name');
  await page.getByRole('button', { name: /save changes/i }).click();
  await expect(page.getByText(/profile updated/i)).toBeVisible();

  await page.getByLabel(/^Email$/i).fill('new@example.com');
  await page.getByRole('button', { name: /save changes/i }).click();
  await expect(page.getByText(/current password is required/i)).toBeVisible();

  await page.getByLabel(/current password/i).fill('ValidPass12!');
  await page.getByRole('button', { name: /save changes/i }).click();
  await expect(page.getByText(/profile updated/i)).toBeVisible();
});
