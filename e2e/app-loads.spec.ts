import { test, expect } from '@playwright/test';

// KISS: simple smoke test to ensure the app loads and main header renders.

test('app loads and shows dashboard header', async ({ page }) => {
  await page.goto('/');

  // Expect the main app header to be visible.
  const title = page.getByRole('heading', { name: /application dashboard/i });
  await expect(title).toBeVisible();
});
