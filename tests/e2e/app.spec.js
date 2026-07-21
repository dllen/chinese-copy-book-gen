import { test, expect } from '@playwright/test';

test.describe('字帖生成器核心流程', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('加载首页无崩溃', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.waitForTimeout(1000);
    expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
  });

  test('输入文字后预览更新', async ({ page }) => {
    const textarea = page.locator('#text');
    await textarea.fill('静夜思');
    await page.waitForTimeout(500);
    const cells = page.locator('.cell');
    await expect(cells.first()).toBeVisible();
  });

  test('切换格子类型预览变化', async ({ page }) => {
    await page.selectOption('#gridType', '米字格');
    await page.waitForTimeout(200);
    const firstCell = page.locator('.cell').first();
    const bg = await firstCell.evaluate(el => getComputedStyle(el).backgroundImage);
    expect(bg).toContain('米字格');
  });

  test('导出配置成功', async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('text=导出配置'),
    ]);
    expect(download.suggestedFilename()).toBe('字帖配置.json');
  });
});
