import { test, expect } from '@playwright/test';

test.describe('字帖生成器核心流程', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#/builder');
    await page.locator('.step-item[aria-label="选样式"]').click();
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
    // Fill text first
    await page.locator('#text').fill('静夜思');
    await page.waitForTimeout(300);

    await page.selectOption('#gridType', '米字格');
    await page.waitForTimeout(200);
    await page.locator('.step-item[aria-label="生成字帖"]').click();
    await page.waitForTimeout(300);
    const firstCell = page.locator('.cell').first();
    const bg = await firstCell.evaluate(el => getComputedStyle(el).backgroundImage);
    expect(bg).not.toBe('none');
  });

  test('保存模板成功', async ({ page }) => {
    // Fill some content first
    const textarea = page.locator('#text');
    await textarea.fill('测试内容');
    await page.waitForTimeout(300);
    
    await page.getByText('课程模板 · 一键生成').click();
    await page.waitForTimeout(300);
    const saveBtn = page.getByRole('button', { name: '保存当前' });
    await saveBtn.click();
    await page.waitForTimeout(300);
    await page.locator('.modal input').fill('测试模板');
    await page.getByRole('button', { name: '保存', exact: true }).click();
    await page.waitForTimeout(300);

    const saved = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('copybook-custom-templates') || '[]')
    );
    expect(saved[0].name).toBe('测试模板');
  });
});
