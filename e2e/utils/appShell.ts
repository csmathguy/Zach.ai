import { expect, type Page } from '@playwright/test';

export const knowledgeHeroHeadingMatcher = /Knowledge Base/i;

export const openAppShell = async (page: Page): Promise<void> => {
  await page.goto('/');
  await expect(page.getByTestId('app-shell')).toBeVisible();
};
