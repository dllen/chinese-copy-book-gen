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

test.describe('首页视觉系统', () => {
  test('首页使用品牌渐变和满屏首屏', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const hero = page.locator('.home-hero');
    const heroHeight = await hero.evaluate(
      (element) => element.getBoundingClientRect().height
    );
    const buttonBackground = await page
      .locator('.home-hero .btn-gradient-primary')
      .evaluate((element) => getComputedStyle(element).backgroundImage);

    expect(heroHeight).toBeGreaterThan(620);
    expect(buttonBackground).toContain('linear-gradient');
  });

  test('首页卡片使用统一圆角和悬浮阴影', async ({ page }) => {
    await page.goto('/');

    const card = page.locator('.home-feature-card').first();
    const styles = await card.evaluate((element) => {
      const computed = getComputedStyle(element);
      return {
        radius: computed.borderRadius,
        shadow: computed.boxShadow,
      };
    });

    expect(parseFloat(styles.radius)).toBeGreaterThanOrEqual(12);
    expect(styles.shadow).not.toBe('none');
  });
});

test.describe('工作台视觉和主题', () => {
  test('桌面预览区域使用粘性定位', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/#/builder');

    const position = await page
      .locator('.builder-preview-column')
      .evaluate((element) => getComputedStyle(element).position);

    expect(position).toBe('sticky');
  });

  test('移动端预览取消粘性并保留底部操作栏', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/#/builder');

    const previewPosition = await page
      .locator('.builder-preview-column')
      .evaluate((element) => getComputedStyle(element).position);
    const barPosition = await page
      .locator('.quick-generate-bar')
      .evaluate((element) => getComputedStyle(element).position);

    expect(previewPosition).toBe('static');
    expect(barPosition).toBe('sticky');
  });

  test('深色模式应用到 Header、首页和工作台', async ({ page }) => {
    await page.goto('/#/builder');

    await page.getByRole('button', { name: '切换到深色模式' }).click();

    await expect(page.locator('html')).toHaveClass(/dark-mode/);
    const background = await page
      .locator('.builder-page')
      .evaluate((element) => getComputedStyle(element).backgroundColor);

    expect(background).not.toBe('rgb(255, 255, 255)');
  });
});
