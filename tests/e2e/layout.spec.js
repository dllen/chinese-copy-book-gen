import { test, expect } from '@playwright/test';

test.describe('排版格式测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('四线三格三条辅助线可见', async ({ page }) => {
    await page.selectOption('#gridType', '四线三格');
    await page.waitForTimeout(200);
    const firstCell = page.locator('.cell').first();
    const bg = await firstCell.evaluate(el => getComputedStyle(el).backgroundImage);
    expect(bg).toContain('svg');
  });

  test('PDF导出生成成功', async ({ page }) => {
    await page.locator('#text').fill('测试文字');
    await page.waitForTimeout(500);
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('text=生成高清PDF'),
    ]);
    expect(download.suggestedFilename()).toMatch(/\.pdf$/);
  });
});
