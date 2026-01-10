import { test, expect } from '@playwright/test';

// KISS: simple smoke test to ensure the app loads and main header renders.

test('app loads and shows welcome header', async ({ page }) => {
  await page.goto('/');

  // Expect the main welcome heading to be visible (O8 redesign).
  const title = page.getByRole('heading', { name: /welcome to your application/i });
  await expect(title).toBeVisible();
});
