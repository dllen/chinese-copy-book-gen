import { test, expect } from '@playwright/test';

test.describe('全站双视图', () => {
  test('默认打开首页并可进入汉字工作台', async ({ page }) => {
    await page.goto('/');

    await expect(
      page.getByRole('heading', { name: '免费在线字帖生成器' })
    ).toBeVisible();

    await page.getByRole('button', { name: '制作汉字字帖' }).click();

    await expect(page).toHaveURL(/#\/builder\/hanzi$/);
    await expect(
      page.getByRole('heading', { name: '字帖生成器工作台' })
    ).toBeAttached();
  });

  test('可以通过 hash 直接打开工作台', async ({ page }) => {
    await page.goto('/#/builder');

    await expect(
      page.getByRole('heading', { name: '字帖生成器工作台' })
    ).toBeAttached();
    await expect(page.getByRole('navigation', { name: '步骤导航' })).toBeVisible();
  });
});

test.describe('工作台结构', () => {
  test('桌面工作台提供配置和预览双栏', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/#/builder');

    await expect(page.locator('.builder-layout-container')).toBeVisible();
    await expect(page.locator('.builder-grid')).toBeVisible();
    await expect(page.locator('.builder-preview-column')).toBeVisible();
  });

  test('AI 面板默认折叠并可展开', async ({ page }) => {
    await page.goto('/#/builder');
    await page.getByRole('button', { name: '选样式' }).click();

    const details = page.locator('details.ai-panel-collapsible');
    await expect(details).not.toHaveAttribute('open', '');
    await details.locator('summary').click();
    await expect(details).toHaveAttribute('open', '');
    await expect(page.getByText('AI 智能生成')).toBeVisible();
  });

  test('移动端恢复纵向工作流并保留预览入口', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/#/builder');

    await expect(page.locator('.builder-preview-column')).toBeVisible();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth
    );
    expect(overflow).toBeLessThanOrEqual(1);
  });
});
