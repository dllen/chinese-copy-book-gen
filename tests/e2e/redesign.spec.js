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
