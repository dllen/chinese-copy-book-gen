import { test, expect } from '@playwright/test';

/**
 * 回归测试：LessonList（以及相邻的 GradeSelector / UnitList）在选中状态切换时
 * 不能触发 React 的样式冲突警告：
 *   "Removing a style property during rerender (borderColor) when a conflicting
 *    property is set (border)"
 *
 * 场景：先选一篇课文（该条目 borderColor 变为蓝色），再选另一篇课文，
 * 让前一条目移除 borderColor —— 这正是原警告的触发条件。
 */

test.describe('LessonList 样式警告回归', () => {
  test('切换课文选中状态不产生 borderColor/border 警告，且样式正确', async ({ page }) => {
    const consoleMessages = [];
    page.on('console', (msg) => consoleMessages.push(`[${msg.type()}] ${msg.text()}`));
    page.on('pageerror', (err) => consoleMessages.push(`[pageerror] ${err.message}`));

    await page.goto('/#/builder');
    await expect(page.locator('.builder-layout-container')).toBeVisible();

    // 进入 LessonList 渲染路径
    await page.locator('.grade-card', { hasText: '一年级' }).first().click();
    await page.locator('.unit-item', { hasText: '生字' }).first().click();

    const lessons = page.locator('.lesson-item');
    await expect(lessons.first()).toBeVisible();
    const count = await lessons.count();
    expect(count).toBeGreaterThan(1);

    // 选中第一课 → 选中第二课（触发前一条目移除 borderColor 的重渲染）
    await lessons.nth(0).click();
    await lessons.nth(1).click();
    await lessons.nth(0).click();

    // 样式校验：最终选中第一课；选中项 borderColor 为蓝色，未选中项为灰色，
    // 且都有 1px 实线边框
    const selected = lessons.nth(0);
    const unselected = lessons.nth(1);
    await expect(selected).toHaveClass(/selected/);
    await expect(unselected).not.toHaveClass(/selected/);

    // border-color 有 0.15s 过渡，轮询等待动画结束后的稳定值
    await expect
      .poll(() => selected.evaluate((el) => getComputedStyle(el).borderColor))
      .toBe('rgb(13, 110, 253)');
    await expect
      .poll(() => unselected.evaluate((el) => getComputedStyle(el).borderColor))
      .toBe('rgb(222, 226, 230)');
    const unselectedStyle = await unselected.evaluate((el) => getComputedStyle(el).borderStyle);
    const unselectedWidth = await unselected.evaluate((el) => getComputedStyle(el).borderWidth);
    const borderRadius = await unselected.evaluate((el) => getComputedStyle(el).borderRadius);
    const listDisplay = await page
      .locator('.lesson-list')
      .evaluate((el) => getComputedStyle(el).display);
    expect(unselectedStyle).toBe('solid');
    expect(unselectedWidth).toBe('1px');
    expect(borderRadius).toBe('8px');
    expect(listDisplay).toBe('flex');

    // 视觉：课文标题文本可见
    await expect(selected.locator('span').first()).toBeVisible();

    // 功能校验：点击课文后生字面板出现（选中课文驱动后续流程）
    const charCards = page.locator('.character-selector .char-card');
    await expect(charCards.first()).toBeVisible();

    // 触发 CharacterSelector 选中态切换，覆盖其边框样式（原先也会触发同名警告）
    await charCards.first().click();
    await expect
      .poll(() => charCards.first().evaluate((el) => getComputedStyle(el).borderColor))
      .toBe('rgb(222, 226, 230)');

    const borderWarnings = consoleMessages.filter(
      (m) => /borderColor|Removing a style property/i.test(m)
    );
    expect(borderWarnings, `Unexpected border warnings:\n${borderWarnings.join('\n')}`).toEqual([]);
  });
});
