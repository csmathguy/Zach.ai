import { test, expect } from '@playwright/test';

test('ideas flow: navigate, capture, and persist', async ({ page }) => {
  const ideaText = `E2E idea ${Date.now()}`;

  await page.goto('/');

  await page.getByRole('link', { name: /go to ideas/i }).click();
  await expect(page).toHaveURL(/\/ideas$/);
  await expect(page.getByRole('heading', { name: /^ideas$/i })).toBeVisible();

  await page.getByLabel(/enter your thought/i).fill(ideaText);
  await page.getByRole('button', { name: /capture/i }).click();

  await expect(page.getByRole('status')).toHaveText(/thought captured/i);
  await expect(page.getByText(ideaText)).toBeVisible();

  await page.reload();
  await expect(page.getByText(ideaText)).toBeVisible();
});
