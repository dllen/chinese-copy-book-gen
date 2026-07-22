# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.js >> 字帖生成器核心流程 >> 切换格子类型预览变化
- Location: tests/e2e/app.spec.js:24:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.selectOption: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('#gridType')

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - heading "应用出错" [level=2] [ref=e4]
  - paragraph [ref=e5]: 抱歉，遇到了一些问题，请尝试刷新页面
  - button "刷新页面" [ref=e6] [cursor=pointer]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('字帖生成器核心流程', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto('/');
  6  |   });
  7  | 
  8  |   test('加载首页无崩溃', async ({ page }) => {
  9  |     await expect(page.locator('body')).toBeVisible();
  10 |     const errors = [];
  11 |     page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  12 |     await page.waitForTimeout(1000);
  13 |     expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
  14 |   });
  15 | 
  16 |   test('输入文字后预览更新', async ({ page }) => {
  17 |     const textarea = page.locator('#text');
  18 |     await textarea.fill('静夜思');
  19 |     await page.waitForTimeout(500);
  20 |     const cells = page.locator('.cell');
  21 |     await expect(cells.first()).toBeVisible();
  22 |   });
  23 | 
  24 |   test('切换格子类型预览变化', async ({ page }) => {
> 25 |     await page.selectOption('#gridType', '米字格');
     |                ^ Error: page.selectOption: Test timeout of 30000ms exceeded.
  26 |     await page.waitForTimeout(200);
  27 |     const firstCell = page.locator('.cell').first();
  28 |     const bg = await firstCell.evaluate(el => getComputedStyle(el).backgroundImage);
  29 |     expect(bg).toContain('米字格');
  30 |   });
  31 | 
  32 |   test('导出配置成功', async ({ page }) => {
  33 |     const [download] = await Promise.all([
  34 |       page.waitForEvent('download'),
  35 |       page.click('text=导出配置'),
  36 |     ]);
  37 |     expect(download.suggestedFilename()).toBe('字帖配置.json');
  38 |   });
  39 | });
  40 | 
```