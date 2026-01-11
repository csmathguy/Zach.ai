import { expect, test } from '@playwright/test';
import { loginAsAdmin } from './utils/appShell';

test('logout ends session and redirects to login', async ({ page }) => {
  await loginAsAdmin(page);

  await page.getByRole('button', { name: /log out/i }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test('protected routes are blocked after logout', async ({ page }) => {
  await loginAsAdmin(page);

  await page.getByRole('button', { name: /log out/i }).click();
  await expect(page).toHaveURL(/\/login$/);

  await page.goto('/ideas');
  await expect(page).toHaveURL(/\/login$/);
});
