import { expect, test } from '@playwright/test';

import { knowledgeHeroHeadingMatcher, openAppShell } from './utils/appShell';

test.describe('App Shell experience', () => {
  test.beforeEach(async ({ page }) => {
    await openAppShell(page);
  });

  test('supports keyboard navigation across the utility nav', async ({ page }) => {
    const healthButton = page.getByRole('tab', { name: 'Health' });
    await healthButton.focus();

    const brainButton = page.getByRole('tab', { name: 'Knowledge' });
    const ideasButton = page.getByRole('tab', { name: 'Ideas' });

    await page.keyboard.press('ArrowRight');
    await expect(brainButton).toBeFocused();

    await page.keyboard.press('ArrowRight');
    await expect(ideasButton).toBeFocused();

    await page.keyboard.press('ArrowLeft');
    await expect(brainButton).toBeFocused();
  });

  test('Heart icon navigates to the health dashboard panel', async ({ page }) => {
    await page.getByRole('tab', { name: 'Health' }).click();
    await expect(page).toHaveURL(/codebase-analysis\?panel=health/);
    await expect(page.getByRole('heading', { name: /codebase analysis/i })).toBeVisible();
  });

  test('Brain icon exposes the placeholder route', async ({ page }) => {
    await page.getByRole('tab', { name: 'Knowledge' }).click();
    await expect(page.getByRole('heading', { name: knowledgeHeroHeadingMatcher })).toBeVisible();
  });

  test('Theme toggle persists across reloads', async ({ page }) => {
    const toggle = page.getByTestId('theme-toggle');
    await toggle.click();

    await expect
      .poll(async () => {
        return page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      })
      .toBe('dark');

    await page.reload();
    const persistedTheme = await page.evaluate(() =>
      document.documentElement.getAttribute('data-theme')
    );
    expect(persistedTheme).toBe('dark');
  });

  test('Brain deep link renders under the new shell', async ({ page }) => {
    await page.goto('/knowledge');
    await expect(page.getByRole('heading', { name: knowledgeHeroHeadingMatcher })).toBeVisible();
    await expect(page.getByTestId('app-shell')).toBeVisible();
  });

  test('Ideas placeholder route renders inside the shell', async ({ page }) => {
    await page.goto('/ideas');
    await expect(page.getByRole('heading', { name: /Ideas & Inbox/i })).toBeVisible();
    await expect(page.getByTestId('app-shell')).toBeVisible();
    await expect(page.getByRole('link', { name: /Review Inbox work item/i })).toBeVisible();
  });

  test('App shell fits within a narrow viewport without horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    );
    expect(hasOverflow).toBe(false);
    await expect(page.getByTestId('utility-nav')).toBeVisible();
  });
});
