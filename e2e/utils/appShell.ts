import { expect, type Page } from '@playwright/test';

export const knowledgeHeroHeadingMatcher = /Knowledge Base/i;

export const loginAsAdmin = async (page: Page): Promise<void> => {
  await page.goto('/login');
  await page.getByLabel(/username or email/i).fill(process.env.ADMIN_USERNAME ?? 'admin');
  await page.getByLabel(/password/i).fill(process.env.ADMIN_PASSWORD ?? 'AdminPass1!');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/ideas$/);
};

export const openAppShell = async (page: Page): Promise<void> => {
  await loginAsAdmin(page);
  await expect(page.getByTestId('app-shell')).toBeVisible();
};
