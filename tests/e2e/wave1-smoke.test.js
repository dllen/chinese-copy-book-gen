import { test, expect } from '@playwright/test';

test('complete 3-step flow on desktop', async ({ page }) => {
  await page.goto('http://127.0.0.1:5174/');
  await page.waitForSelector('.step-bar');

  // Step 0: Select grade
  await page.click('.grade-card:has-text("一年级")');

  // Select unit
  await page.click('.unit-item:has-text("生字")');

  // Select content
  await page.click('.content-item:first-child');

  // Generate
  await page.click('text=一键生成字帖');

  // Verify preview renders
  await expect(page.locator('.preview-page')).toBeVisible();
});

test('mobile viewport - grade selector visible', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('http://127.0.0.1:5174/');
  await expect(page.locator('.grade-selector')).toBeVisible();
});
