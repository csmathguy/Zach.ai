import { test, expect } from '@playwright/test';

// KISS: simple smoke test to ensure the app loads and main header renders.

test('app loads and shows landing header', async ({ page }) => {
  await page.goto('/');

  const title = page.getByRole('heading', { name: /zach.ai/i });
  await expect(title).toBeVisible();
  await expect(page.getByRole('link', { name: /log in/i })).toBeVisible();
});
