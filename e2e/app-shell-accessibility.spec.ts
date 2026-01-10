import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { knowledgeHeroHeadingMatcher, openAppShell } from './utils/appShell';

test.describe('App Shell accessibility guardrails', () => {
  test.beforeEach(async ({ page }) => {
    await openAppShell(page);
  });

  test('utility nav exposes labelled tabs', async ({ page }) => {
    await expect(page.getByRole('tablist', { name: 'Utility navigation' })).toBeVisible();

    await expect(page.getByRole('tab', { name: 'Knowledge' })).toHaveAttribute(
      'aria-selected',
      'false'
    );
    await expect(page.getByRole('tab', { name: 'Ideas' })).toHaveAttribute('tabindex', '-1');
  });

  test('theme toggle updates aria-pressed state', async ({ page }) => {
    const toggle = page.getByTestId('theme-toggle');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  });

  test('knowledge placeholder uses semantic headings and landmarks', async ({ page }) => {
    await page.goto('/knowledge');

    await expect(
      page.getByRole('heading', { level: 1, name: knowledgeHeroHeadingMatcher })
    ).toBeVisible();
    await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible();

    const section = page.locator('section[aria-labelledby="knowledge-placeholder-title"]');
    await expect(section).toHaveAttribute('aria-labelledby', 'knowledge-placeholder-title');
    await expect(page.locator('main[role="main"]')).toBeVisible();
  });

  test('ideas route provides labeled inputs and actions', async ({ page }) => {
    await page.goto('/ideas');

    await expect(page.getByLabel(/enter your thought/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /capture/i })).toBeVisible();
  });

  test('passes axe accessibility checks in light and dark modes', async ({ page }) => {
    const analyzeShell = async () =>
      new AxeBuilder({ page }).include('[data-testid="app-shell-header"]').analyze();

    const lightShell = await analyzeShell();
    expect(lightShell.violations).toEqual([]);

    await page.getByTestId('theme-toggle').click();

    const darkShell = await analyzeShell();
    expect(darkShell.violations).toEqual([]);

    await page.goto('/knowledge');
    const placeholderResults = await new AxeBuilder({ page })
      .include('section[aria-labelledby="knowledge-placeholder-title"]')
      .analyze();
    expect(placeholderResults.violations).toEqual([]);
  });
});
