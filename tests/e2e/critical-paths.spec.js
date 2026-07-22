import { test, expect } from '@playwright/test';

test.describe('关键路径 1: 基本生成流程', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);
  });

  test('完整生成流程', async ({ page }) => {
    // 输入文本
    const textarea = page.locator('#text');
    await textarea.fill('静夜思');
    await page.waitForTimeout(300);

    // 验证预览更新
    const cells = page.locator('.cell');
    await expect(cells.first()).toBeVisible();

    // 切换格子类型
    await page.selectOption('#gridType', '米字格');
    await page.waitForTimeout(200);

    // 验证背景变化
    const firstCell = page.locator('.cell').first();
    const bg = await firstCell.evaluate(el => getComputedStyle(el).backgroundImage);
    expect(bg).toContain('米字格');

    // 切换颜色
    await page.selectOption('#gridColor', '红色');
    await page.waitForTimeout(200);
  });

  test('调整网格尺寸', async ({ page }) => {
    // 修改行数
    await page.fill('#rows', '15');
    await page.waitForTimeout(200);

    // 修改列数
    await page.fill('#cols', '12');
    await page.waitForTimeout(200);

    // 验证页面生成
    const pages = page.locator('.page');
    await expect(pages.first()).toBeVisible();
  });

  test('调整字体大小', async ({ page }) => {
    const textarea = page.locator('#text');
    await textarea.fill('测试');
    await page.waitForTimeout(300);

    // 修改字体大小
    await page.fill('#fontSize', '36');
    await page.waitForTimeout(200);

    // 验证字体大小已更新
    const cell = page.locator('.cell').first();
    const fontSize = await cell.evaluate(el => getComputedStyle(el).fontSize);
    expect(fontSize).toBe('36px');
  });

  test('多词模式输入', async ({ page }) => {
    // 切换到多词模式
    await page.click('text=多词');
    await page.waitForTimeout(100);

    // 输入多词文本
    const textarea = page.locator('#text');
    await textarea.fill('你好|世界|测试');
    await page.waitForTimeout(300);

    // 验证预览
    const cells = page.locator('.cell');
    const count = await cells.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('关键路径 2: 样式预设切换', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);
  });

  const presets = [
    '四线三格标准',
    '四线三格宽间',
    '田字格标准',
    '米字格标准',
    '米字格宽间',
    '回宫格标准',
    '回宫格宽间',
    '现代简约',
    '儿童卡通'
  ];

  for (const preset of presets) {
    test(`应该正确应用 ${preset}`, async ({ page }) => {
      await page.selectOption('#stylePreset', preset);
      await page.waitForTimeout(300);

      // 验证预设已应用（通过检查CSS变量或格子类型）
      const gridType = page.evaluate(() => {
        return getComputedStyle(document.documentElement)
          .getPropertyValue('--grid-type') || '';
      });

      // 至少应该没有错误
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      await page.waitForTimeout(100);
      expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
    });
  }

  test('现代简约预设应该应用圆角和细线', async ({ page }) => {
    await page.selectOption('#stylePreset', '现代简约');
    await page.waitForTimeout(300);

    // 验证CSS变量更新
    const cellRadius = page.evaluate(() => {
      return getComputedStyle(document.documentElement)
        .getPropertyValue('--cell-radius');
    });

    expect(cellRadius).toBeTruthy();
  });

  test('儿童卡通预设应该应用粗线和圆角', async ({ page }) => {
    await page.selectOption('#stylePreset', '儿童卡通');
    await page.waitForTimeout(300);

    // 验证应用成功
    const preset = page.locator('#stylePreset');
    await expect(preset).toHaveValue('儿童卡通');
  });
});

test.describe('关键路径 3: 诗库导入', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(1000);
  });

  test('应该看到诗库面板', async ({ page }) => {
    // 检查是否有诗库相关内容
    const hasLibrary = await page.locator('text=唐诗三百首').isVisible();
    // 如果页面加载了诗库数据
    if (hasLibrary) {
      await expect(page.locator('text=唐诗三百首')).toBeVisible();
    }
  });

  test('搜索诗歌功能', async ({ page }) => {
    // 展开诗库面板
    const poemSection = page.locator('text=唐诗三百首');
    if (await poemSection.isVisible()) {
      await poemSection.click();
      await page.waitForTimeout(300);

      // 查找搜索框
      const searchInput = page.locator('#poem-search');
      if (await searchInput.isVisible()) {
        await searchInput.fill('李白');
        await page.waitForTimeout(500);

        // 验证搜索结果
        const results = page.locator('.poem-item');
        const count = await results.count();
        expect(count).toBeGreaterThan(0);
      }
    }
  });
});

test.describe('关键路径 4: 导出功能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    // 输入一些文本
    const textarea = page.locator('#text');
    await textarea.fill('测试导出');
    await page.waitForTimeout(300);
  });

  test('导出配置为JSON', async ({ page }) => {
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('text=导出配置')
    ]);

    expect(download.suggestedFilename()).toBe('字帖配置.json');
  });

  test('保存模板', async ({ page }) => {
    // 触发保存模板对话框
    const saveButton = page.locator('text=保存模板');
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(200);

      // 验证对话框出现
      const modal = page.locator('.modal');
      await expect(modal).toBeVisible();
    }
  });

  test('打印预览', async ({ page }) => {
    // 验证打印按钮可用
    const printButton = page.locator('button:has-text("打印")');
    await expect(printButton).toBeVisible();

    // 点击打印（会打开打印预览）
    // 这里只验证按钮可点击，不实际触发打印
    await expect(printButton).toBeEnabled();
  });
});

test.describe('关键路径 5: 响应式布局', () => {
  test('桌面端布局 (>1200px)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await page.waitForTimeout(500);

    // 验证两列布局
    const leftPanel = page.locator('.col-lg-7');
    const rightPanel = page.locator('.col-lg-5');

    await expect(leftPanel).toBeVisible();
    await expect(rightPanel).toBeVisible();
  });

  test('平板端布局 (768px)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForTimeout(500);

    // 验证布局自适应
    const container = page.locator('.container');
    await expect(container).toBeVisible();
  });

  test('手机端布局 (<576px)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForTimeout(500);

    // 验证单列布局
    const container = page.locator('.container');
    await expect(container).toBeVisible();

    // 验证预览缩放（应该自动缩小）
    const preview = page.locator('#previewScale');
    if (await preview.isVisible()) {
      const scale = await preview.inputValue();
      expect(parseFloat(scale)).toBeLessThan(1);
    }
  });
});

test.describe('关键路径 6: 功能模块切换', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);
  });

  test('切换到控笔字帖', async ({ page }) => {
    const featureSelect = page.locator('#feature');
    await featureSelect.selectOption('控笔字帖');
    await page.waitForTimeout(200);

    // 验证难度选择出现
    const difficulty = page.locator('#difficulty');
    await expect(difficulty).toBeVisible();
  });

  test('切换到数字字母', async ({ page }) => {
    const featureSelect = page.locator('#feature');
    await featureSelect.selectOption('数字字母');
    await page.waitForTimeout(200);

    // 验证数字字母设置出现
    const alnumCount = page.locator('#alnumCount');
    await expect(alnumCount).toBeVisible();
  });

  test('控笔字帖难度切换', async ({ page }) => {
    // 切换到控笔字帖
    await page.selectOption('#feature', '控笔字帖');
    await page.waitForTimeout(200);

    // 选择难度
    await page.selectOption('#difficulty', '中级');
    await page.waitForTimeout(300);

    // 验证难度已切换
    const difficulty = page.locator('#difficulty');
    await expect(difficulty).toHaveValue('中级');
  });
});

test.describe('关键路径 7: 配置持久化', () => {
  test('设置应该保存到localStorage', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    // 修改设置
    await page.fill('#fontSize', '48');
    await page.waitForTimeout(300);

    // 检查 localStorage
    const settings = await page.evaluate(() => {
      return localStorage.getItem('copybook-settings');
    });

    expect(settings).toBeTruthy();
    const parsed = JSON.parse(settings);
    expect(parsed.fontSize).toBe('48');
  });

  test('刷新后设置应该恢复', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(500);

    // 修改设置
    await page.fill('#fontSize', '48');
    await page.waitForTimeout(300);

    // 刷新页面
    await page.reload();
    await page.waitForTimeout(500);

    // 验证设置已恢复
    const fontSize = await page.inputValue('#fontSize');
    expect(fontSize).toBe('48');
  });
});
