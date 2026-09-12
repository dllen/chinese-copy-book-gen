import { test, expect } from '@playwright/test';

/**
 * Regression: 在 Step 0（选内容）选择年级和课文后，预览面板必须实时反映
 * 选中的生字，而不是只在点击「一键生成字帖」后才更新。
 *
 * 复现步骤：
 *   1. 进入 builder，默认停在 Step 0
 *   2. 选择 一年级 → 学科 语文 → 单元 生字 → 任意一篇课文
 *   3. 在右侧预览区域，应立即看到这些生字的字帖预览
 */

test.describe('Step 0 实时预览', () => {
  test('选择年级/课文后预览立即更新', async ({ page }) => {
    await page.goto('/#/builder');
    await expect(page.locator('.builder-layout-container')).toBeVisible();

    // 选年级：一年级
    await page.locator('.grade-card', { hasText: '一年级' }).first().click();
    // 选单元：生字
    await page.locator('.unit-item', { hasText: '生字' }).first().click();
    // 选课文：第一篇
    const firstLesson = page.locator('.lesson-item').first();
    await firstLesson.click();

    // 期望：右侧预览面板不再显示 EmptyState，而是显示 PageGrid 单元格
    // EmptyState 的特征：包含「还没有内容」文案
    await expect(page.locator('text=还没有内容')).toHaveCount(0);

    // 预览区应渲染至少一个 cell
    const cells = page.locator('.cell');
    await expect(cells.first()).toBeVisible();
    const cellCount = await cells.count();
    expect(cellCount).toBeGreaterThan(0);
  });

  test('切换生字时预览同步更新', async ({ page }) => {
    await page.goto('/#/builder');

    await page.locator('.grade-card', { hasText: '一年级' }).first().click();
    await page.locator('.unit-item', { hasText: '生字' }).first().click();
    await page.locator('.lesson-item').first().click();

    // 取消选中第一个字，预览中的 cell 数量应减少
    const firstChar = page.locator('.character-selector .char-card').first();
    const initialCellCount = await page.locator('.cell').count();

    await firstChar.click();

    const afterToggleCount = await page.locator('.cell').count();
    expect(afterToggleCount).toBeLessThan(initialCellCount);
  });

  test('切换单元时预览清空', async ({ page }) => {
    await page.goto('/#/builder');

    await page.locator('.grade-card', { hasText: '一年级' }).first().click();
    await page.locator('.unit-item', { hasText: '生字' }).first().click();
    await page.locator('.lesson-item').first().click();

    // 确认有预览
    await expect(page.locator('.cell').first()).toBeVisible();

    // 切换到另一个单元（古诗），课文清空 → 预览应回到 EmptyState
    await page.locator('.unit-item', { hasText: '古诗' }).first().click();
    await expect(page.locator('text=还没有内容')).toBeVisible();
  });
});
