import { test, expect } from '@playwright/test';

test('ideas flow: navigate, capture, and persist', async ({ page }) => {
  const ideaText = `E2E idea ${Date.now()}`;
  const thoughts: {
    id: string;
    text: string;
    source: string;
    timestamp: string;
    processedState: string;
  }[] = [];

  await page.route('**/api/thoughts', async (route) => {
    const { method } = route.request();

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(thoughts),
      });
      return;
    }

    if (method === 'POST') {
      const created = {
        id: `thought-${Date.now()}`,
        text: ideaText,
        source: 'text',
        timestamp: new Date().toISOString(),
        processedState: 'UNPROCESSED',
      };
      thoughts.unshift(created);
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(created),
      });
      return;
    }

    await route.fallback();
  });

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
