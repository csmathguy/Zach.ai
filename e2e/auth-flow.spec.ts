import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

const loginAsAdmin = async (page: Page) => {
  await page.goto('/login');
  await page.getByLabel(/username or email/i).fill(process.env.ADMIN_USERNAME ?? 'admin');
  await page.getByLabel(/password/i).fill(process.env.ADMIN_PASSWORD ?? 'AdminPass1!');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/ideas$/);
};

test('public landing loads with login CTA', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /zach.ai/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /log in/i })).toBeVisible();
});

test('login success redirects to authenticated landing', async ({ page }) => {
  await loginAsAdmin(page);
  await expect(page.getByRole('heading', { name: /^ideas$/i })).toBeVisible();
});

test('reset token request shows warning and accepts request', async ({ page }) => {
  await page.goto('/reset');
  await expect(page.getByText(/reset delivery is not configured/i)).toBeVisible();

  await page.getByLabel(/username or email/i).fill('someone');
  await page.getByRole('button', { name: /request reset token/i }).click();

  await expect(page.getByText(/request received/i)).toBeVisible();
});

test('reset token usage allows new login', async ({ page }) => {
  await loginAsAdmin(page);

  const username = `user-${Date.now()}`;
  const createResponse = await page.request.post('/api/admin/users', {
    data: {
      username,
      name: 'Reset User',
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
  await expect(page.getByText(/password reset complete\. please sign in/i)).toBeVisible();

  await page.getByLabel(/username or email/i).fill(username);
  await page.getByLabel(/password/i).fill('ValidPass12!');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/ideas$/);
});

test('admin account management creates user and issues token', async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto('/admin/accounts');

  const username = `acct-${Date.now()}`;
  await page.getByLabel('Username').fill(username);
  await page.getByLabel(/^Name$/).fill('Account User');
  await page.getByRole('button', { name: /create user/i }).click();

  await expect(page.getByText(/reset token issued/i)).toBeVisible();
  await expect(page.getByText(username)).toBeVisible();
});
