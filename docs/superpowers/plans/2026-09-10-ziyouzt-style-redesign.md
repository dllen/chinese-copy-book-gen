# 全站同系视觉重构 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将现有字帖工具升级为首页到工作台的双视图产品，并统一使用参考站的蓝紫粉现代教育工具视觉体系。

**Architecture:** 用无依赖的 hash 路由在 `App` 中切换首页和工作台；首页由现有落地页组件重构而来，工作台保留现有三步与业务 Hooks，只重组桌面双栏布局和视觉层。生成、导出、选文、分页和本地存储逻辑保持不变。

**Tech Stack:** React 18、Vite 6、Bootstrap 5 栅格、原生 CSS、Vitest、Testing Library、Playwright

---

## File Map

### 创建

| 文件 | 责任 |
|------|------|
| `src/utils/appRoutes.js` | 解析 hash、生成 hash、提供四种字帖预选设置 |
| `src/components/WorkflowSection.jsx` | 首页三步生成流程 |
| `src/components/UseCasesSection.jsx` | 首页真实使用场景 |
| `src/styles/landing.css` | 首页专属布局、卡片和动效 |
| `src/styles/builder.css` | 工作台双栏、粘性预览、移动端和深色模式 |
| `tests/unit/appRoutes.test.js` | 路由与预选纯函数测试 |
| `tests/unit/brandHeader.test.jsx` | Header 导航与移动端菜单测试 |
| `tests/unit/heroSection.test.jsx` | Hero CTA 测试 |
| `tests/unit/landingSections.test.jsx` | 首页内容和 CTA 测试 |
| `tests/e2e/redesign.spec.js` | 首页、工作台、响应式、深色模式和视觉断言 |

### 修改

| 文件 | 责任 |
|------|------|
| `src/main.jsx` | 导入设计系统、首页和工作台 CSS |
| `src/App.jsx` | 接入双视图、hash 同步、预选设置和公共 Header |
| `src/components/BrandHeader.jsx` | 统一品牌导航、移动端菜单和深色切换 |
| `src/components/HeroSection.jsx` | 改为双栏首屏和产品演示 |
| `src/components/StatsSection.jsx` | 改为真实能力指标 |
| `src/components/FeatureCards.jsx` | 改为四种真实能力入口 |
| `src/components/SiteFooter.jsx` | 统一页脚视觉和真实功能说明 |
| `src/components/LandingPage.jsx` | 组合全部首页区块 |
| `src/components/layout/MainLayout.jsx` | 工作台双栏结构、公共 Header 后调整 |
| `src/components/ConfigPanel.jsx` | 接入可折叠 AI 面板 |
| `src/components/StepBar.jsx` | 适配新步骤条样式和键盘交互 |
| `src/styles/design-system.css` | 全局令牌、基础控件、Header 和深色主题 |
| `playwright.config.js` | 自动启动 Vite 测试服务器 |
| `tests/e2e/app.spec.js` | 工作台测试改为直接访问 `#/builder` |
| `tests/e2e/layout.spec.js` | 工作台测试改为直接访问 `#/builder` |
| `tests/e2e/critical-paths.spec.js` | 工作台测试改为直接访问 `#/builder` |
| `docs/superpowers/plans/2026-09-10-ziyouzt-style-redesign.md` | 本实施计划 |

### 删除

| 文件 | 原因 |
|------|------|
| `src/components/Testimonials.jsx` | 用真实 `UseCasesSection` 替代无来源用户评价 |

---

## Task 1: Hash 路由与字帖预选

**Files:**
- Create: `src/utils/appRoutes.js`
- Create: `tests/unit/appRoutes.test.js`

- [ ] **Step 1: 写失败测试**

Create `tests/unit/appRoutes.test.js`:

```js
import { describe, it, expect } from 'vitest';
import {
  APP_VIEW,
  hashForRoute,
  parseAppHash,
  presetForBuilderType,
} from '../../src/utils/appRoutes';

describe('parseAppHash', () => {
  it('defaults to home for an empty hash', () => {
    expect(parseAppHash('')).toEqual({
      view: APP_VIEW.HOME,
      builderType: null,
    });
  });

  it('parses the builder root', () => {
    expect(parseAppHash('#/builder')).toEqual({
      view: APP_VIEW.BUILDER,
      builderType: null,
    });
  });

  it('parses a known builder type', () => {
    expect(parseAppHash('#/builder/english')).toEqual({
      view: APP_VIEW.BUILDER,
      builderType: 'english',
    });
  });

  it('normalizes an unknown builder type', () => {
    expect(parseAppHash('#/builder/unknown')).toEqual({
      view: APP_VIEW.BUILDER,
      builderType: null,
    });
  });

  it('falls back to home for unknown paths', () => {
    expect(parseAppHash('#/not-found')).toEqual({
      view: APP_VIEW.HOME,
      builderType: null,
    });
  });
});

describe('hashForRoute', () => {
  it('builds the home hash', () => {
    expect(hashForRoute(APP_VIEW.HOME)).toBe('#/');
  });

  it('builds the builder root hash', () => {
    expect(hashForRoute(APP_VIEW.BUILDER)).toBe('#/builder');
  });

  it('builds a typed builder hash', () => {
    expect(hashForRoute(APP_VIEW.BUILDER, 'pinyin')).toBe('#/builder/pinyin');
  });
});

describe('presetForBuilderType', () => {
  it('returns the hanzi preset', () => {
    expect(presetForBuilderType('hanzi')).toEqual({
      feature: '汉字练习',
      copybookType: '汉字字帖',
      gridType: '田字格',
    });
  });

  it('returns the pinyin preset', () => {
    expect(presetForBuilderType('pinyin')).toEqual({
      feature: '汉字练习',
      copybookType: '拼音字帖',
      gridType: '拼音格',
    });
  });

  it('returns the english preset', () => {
    expect(presetForBuilderType('english')).toEqual({
      feature: '字帖模板',
      layout: '英文格式',
      gridType: '四线三格',
      cols: 10,
    });
  });

  it('returns the digits preset', () => {
    expect(presetForBuilderType('digits')).toEqual({
      feature: '数字字母',
      gridType: '四线三格',
    });
  });

  it('returns null for an unknown type', () => {
    expect(presetForBuilderType('unknown')).toBeNull();
  });

  it('returns a copy so callers cannot mutate the preset registry', () => {
    const preset = presetForBuilderType('hanzi');
    preset.gridType = '米字格';
    expect(presetForBuilderType('hanzi').gridType).toBe('田字格');
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run:

```bash
npm run test:unit -- tests/unit/appRoutes.test.js --run
```

Expected: FAIL because `src/utils/appRoutes.js` does not exist.

- [ ] **Step 3: 实现纯函数**

Create `src/utils/appRoutes.js`:

```js
export const APP_VIEW = Object.freeze({
  HOME: 'home',
  BUILDER: 'builder',
});

export const BUILDER_PRESETS = Object.freeze({
  hanzi: Object.freeze({
    feature: '汉字练习',
    copybookType: '汉字字帖',
    gridType: '田字格',
  }),
  pinyin: Object.freeze({
    feature: '汉字练习',
    copybookType: '拼音字帖',
    gridType: '拼音格',
  }),
  english: Object.freeze({
    feature: '字帖模板',
    layout: '英文格式',
    gridType: '四线三格',
    cols: 10,
  }),
  digits: Object.freeze({
    feature: '数字字母',
    gridType: '四线三格',
  }),
});

export function parseAppHash(hash = '') {
  const clean = String(hash).replace(/^#/, '').replace(/^\/+/, '');
  if (!clean) return { view: APP_VIEW.HOME, builderType: null };

  const [view, builderType = ''] = clean.split('/');
  if (view !== APP_VIEW.BUILDER) {
    return { view: APP_VIEW.HOME, builderType: null };
  }

  return {
    view: APP_VIEW.BUILDER,
    builderType: BUILDER_PRESETS[builderType] ? builderType : null,
  };
}

export function hashForRoute(view, builderType = null) {
  if (view === APP_VIEW.BUILDER) {
    return builderType ? `#/builder/${builderType}` : '#/builder';
  }
  return '#/';
}

export function presetForBuilderType(builderType) {
  const preset = BUILDER_PRESETS[builderType];
  return preset ? { ...preset } : null;
}
```

- [ ] **Step 4: 运行测试确认通过**

Run:

```bash
npm run test:unit -- tests/unit/appRoutes.test.js --run
```

Expected: PASS, 14 tests.

- [ ] **Step 5: 提交**

```bash
git add src/utils/appRoutes.js tests/unit/appRoutes.test.js
git commit -m "feat: add app route and builder preset helpers"
```

---

## Task 2: 首页和工作台双视图

**Files:**
- Modify: `src/App.jsx`
- Modify: `tests/e2e/app.spec.js`
- Modify: `tests/e2e/layout.spec.js`
- Modify: `tests/e2e/critical-paths.spec.js`
- Create: `tests/e2e/redesign.spec.js`

- [ ] **Step 1: 写失败的 e2e 测试**

Create `tests/e2e/redesign.spec.js` with the first two tests:

```js
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
```

- [ ] **Step 2: 运行测试确认失败**

Start the Vite server in a separate terminal:

```bash
npm run dev -- --host 127.0.0.1
```

Run:

```bash
npx playwright test tests/e2e/redesign.spec.js
```

Expected: FAIL because `/` still opens the builder and no `字帖生成器工作台` heading exists.

- [ ] **Step 3: 在 `App` 中接入 hash 路由**

In `src/App.jsx`, update the React and component imports:

```jsx
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import LandingPage from './components/LandingPage';
import BrandHeader from './components/BrandHeader';
import {
  APP_VIEW,
  hashForRoute,
  parseAppHash,
  presetForBuilderType,
} from './utils/appRoutes';
```

Remove the unused `DarkModeToggle` import.

Add route state immediately after `useSettings`:

```jsx
const [route, setRoute] = React.useState(() =>
  parseAppHash(window.location.hash)
);
```

Add hash synchronization before the dark-mode effect:

```jsx
useEffect(() => {
  const syncRoute = () => {
    const next = parseAppHash(window.location.hash);
    setRoute(next);
    const canonicalHash = hashForRoute(next.view, next.builderType);
    if (window.location.hash !== canonicalHash) {
      window.history.replaceState(null, '', canonicalHash);
    }
  };

  syncRoute();
  window.addEventListener('hashchange', syncRoute);
  return () => window.removeEventListener('hashchange', syncRoute);
}, []);
```

Add navigation callbacks after `const stepFlow = useStepFlow(3);`:

```jsx
const navigateTo = useCallback((view, builderType = null) => {
  const next = {
    view,
    builderType: view === APP_VIEW.BUILDER ? builderType : null,
  };
  setRoute(next);
  window.location.hash = hashForRoute(next.view, next.builderType);
}, []);

const openBuilder = useCallback((builderType = 'hanzi') => {
  const preset = presetForBuilderType(builderType);
  if (preset) {
    setSettings((previous) => ({ ...previous, ...preset }));
  }
  stepFlow.goTo(0);
  navigateTo(APP_VIEW.BUILDER, builderType);
}, [navigateTo, setSettings, stepFlow]);

const handleNavigate = useCallback((key) => {
  if (key === 'home') {
    navigateTo(APP_VIEW.HOME);
    return;
  }

  if (['hanzi', 'pinyin', 'english', 'digits'].includes(key)) {
    openBuilder(key);
    return;
  }

  if (key === 'tutorial') {
    navigateTo(APP_VIEW.HOME);
    window.requestAnimationFrame(() => {
      document.getElementById('workflow')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }
}, [navigateTo, openBuilder]);
```

Add a route-focus effect after the dark-mode effect:

```jsx
useEffect(() => {
  const target = document.getElementById(
    route.view === APP_VIEW.HOME ? 'home-title' : 'builder-title'
  );
  target?.focus?.({ preventScroll: true });
  window.scrollTo?.({ top: 0, behavior: 'auto' });
}, [route.view, route.builderType]);
```

Replace the current return body's main wrapper with:

```jsx
<BrandHeader
  darkMode={settings.darkMode}
  onToggleDarkMode={() => updateSetting('darkMode', !settings.darkMode)}
  currentView={
    route.view === APP_VIEW.BUILDER
      ? route.builderType || 'builder'
      : 'home'
  }
  onNavigate={handleNavigate}
/>
<main id="main-content" tabIndex={-1}>
  {route.view === APP_VIEW.HOME ? (
    <LandingPage
      onStartBuilder={openBuilder}
      onNavigate={handleNavigate}
    />
  ) : (
    <MainLayout
      mode={settings.mode}
      usage={usage}
      variant={settings.variant}
      layout={settings.layout}
      gridType={settings.gridType}
      gridColor={settings.gridColor}
      customGridColor={settings.customGridColor}
      customTextColor={settings.customTextColor}
      textColorOpt={settings.textColorOpt}
      strokeMode={settings.strokeMode}
      tailFill={settings.tailFill}
      template={settings.template}
      customFont={settings.customFont}
      rows={settings.rows}
      cols={settings.cols}
      cellSize={settings.cellSize}
      gridGap={settings.gridGap}
      fontSize={settings.fontSize}
      marginTop={settings.marginTop}
      marginRight={settings.marginRight}
      marginBottom={settings.marginBottom}
      marginLeft={settings.marginLeft}
      paper={settings.paper}
      header={settings.header}
      text={settings.text}
      randCount={settings.randCount}
      randNoRepeat={settings.randNoRepeat}
      previewScale={settings.previewScale}
      feature={settings.feature}
      difficulty={settings.difficulty}
      showGuide={settings.showGuide}
      enBlankRows={settings.enBlankRows}
      enRepeat={settings.enRepeat}
      engShowZh={settings.engShowZh}
      stylePreset={settings.stylePreset}
      autoLayout={settings.autoLayout}
      gridStrokeWidth={settings.gridStrokeWidth}
      lineStyle={settings.lineStyle}
      cellRadius={settings.cellRadius}
      pageBg={settings.pageBg}
      cellBg={settings.cellBg}
      cellBorder={settings.cellBorder}
      cellShadow={settings.cellShadow}
      textShadow={settings.textShadow}
      textStroke={settings.textStroke}
      alnumIncludeDigits={settings.alnumIncludeDigits}
      alnumIncludeUpper={settings.alnumIncludeUpper}
      alnumIncludeLower={settings.alnumIncludeLower}
      alnumCount={settings.alnumCount}
      alnumNoRepeat={settings.alnumNoRepeat}
      alnumSeqLocal={alnumSeqLocal}
      chineseCharCount={settings.chineseCharCount}
      chineseCharNoRepeat={settings.chineseCharNoRepeat}
      chineseCharSeqLocal={copybook.chineseCharSeqLocal}
      letterStyle={settings.letterStyle}
      cellShadowLocal={settings.cellShadow}
      copybookType={settings.copybookType}
      copybookStyle={settings.copybookStyle}
      showPinyin={settings.showPinyin}
      pinyinText={settings.pinyinText}
      hanziText={settings.hanziText}
      updateSetting={updateSetting}
      handleLetterStyle={(value) => updateSetting('letterStyle', value)}
      handleCellShadow={(value) => updateSetting('cellShadow', value)}
      handleSetRows={(value) => updateSetting('rows', Math.max(1, Math.min(20, parseInt(value) || 1)))}
      handleSetCols={(value) => updateSetting('cols', Math.max(1, Math.min(20, parseInt(value) || 1)))}
      handleSetCellSize={(value) => updateSetting('cellSize', Math.max(30, Math.min(100, parseInt(value) || 60)))}
      handleSetGridGap={(value) => updateSetting('gridGap', Math.max(0, Math.min(20, parseInt(value) || 0)))}
      handleSetFontSize={(value) => updateSetting('fontSize', Math.max(12, Math.min(100, parseInt(value) || 42)))}
      handleSetMarginTop={(value) => updateSetting('marginTop', Math.max(0, Math.min(50, parseInt(value) || 0)))}
      handleSetMarginRight={(value) => updateSetting('marginRight', Math.max(0, Math.min(50, parseInt(value) || 0)))}
      handleSetMarginBottom={(value) => updateSetting('marginBottom', Math.max(0, Math.min(50, parseInt(value) || 0)))}
      handleSetMarginLeft={(value) => updateSetting('marginLeft', Math.max(0, Math.min(50, parseInt(value) || 0)))}
      handleSetEnRepeat={(value) => updateSetting('enRepeat', Math.max(1, Math.min(5, parseInt(value) || 1)))}
      handleSetRandCount={(value) => updateSetting('randCount', Math.max(1, parseInt(value) || 1))}
      handleSetAlnumCount={(value) => updateSetting('alnumCount', Math.max(1, parseInt(value) || 20))}
      handleSetCellRadius={(value) => updateSetting('cellRadius', parseInt(value) || 0)}
      handleSetGridStrokeWidth={(value) => updateSetting('gridStrokeWidth', parseFloat(value) || 1)}
      handleSetPreviewScale={(value) => updateSetting('previewScale', parseFloat(value) || 1)}
      handleAlnumSeq={(value) => {
        setAlnumSeqLocal?.(value);
        updateSetting('alnumSeq', value);
      }}
      handleSetCellShadow={(value) => updateSetting('cellShadow', value)}
      onInsert={insertFromLibrary}
      onEngShowZhChange={(value) => updateSetting('engShowZh', value)}
      onGenAlnum={genAlnum}
      onGenChineseChars={copybook.genChineseChars}
      settings={settings}
      validationResult={validationResult}
      alnumStats={alnumStats}
      pages={pages}
      onFillRandom={fillRandom}
      commonChars={commonChars}
      onPrint={() => window.print()}
      onExportPDF={exportPDF}
      onExportImage={exportImage}
      onSaveTemplate={confirmSaveTemplate}
      onLoadTemplate={loadTemplate}
      onImportConfig={importConfig}
      onExportConfig={exportConfig}
      onReset={resetConfig}
      libraryState={libraryState}
      onLibraryStateChange={(state) => setLibraryState((previous) => ({ ...previous, ...state }))}
      toast={toast}
      currentStep={stepFlow.currentStep}
      onStepChange={stepFlow.goTo}
      grades={courseData.grades}
      units={courseData.units}
      contents={courseData.contents}
      searchResults={courseData.searchResults}
      selectedGrade={courseData.selectedGrade}
      selectedSubject={courseData.selectedSubject}
      selectedUnit={courseData.selectedUnit}
      onSelectGrade={courseData.selectGrade}
      onSelectSubject={courseData.selectSubject}
      onSelectUnit={courseData.selectUnit}
      onSearchContents={courseData.search}
      hasContent={courseData.selectedCharacters && courseData.selectedCharacters.size > 0}
      bg={bg}
      tColor={tColor}
      font={font}
      engFont={engFont}
      lessons={courseData.lessons}
      selectedLesson={courseData.selectedLesson}
      selectedCharacters={courseData.selectedCharacters}
      onSelectLesson={courseData.selectLesson}
      onToggleCharacter={courseData.toggleCharacter}
      onSelectAllCharacters={courseData.selectAllCharacters}
      onDeselectAllCharacters={courseData.deselectAllCharacters}
    />
  )}
</main>
```

Keep the existing modal and `ErrorBoundary` around the new Header and main content.

- [ ] **Step 4: 更新既有 e2e 测试入口**

In `tests/e2e/app.spec.js`, `tests/e2e/layout.spec.js`, and `tests/e2e/critical-paths.spec.js`, replace every builder entry:

```diff
- await page.goto('/');
+ await page.goto('/#/builder');
```

The replacement applies to all occurrences in those three files. After each builder `goto` in a `beforeEach` or standalone test, add:

```js
await page.getByRole('button', { name: '选样式' }).click();
```

This enters the second step where the existing `#text`, `#gridType`, `#fontSize`, and feature controls are rendered.

In `tests/e2e/app.spec.js`, replace the stale `导出配置成功` test with:

```js
test('保存模板成功', async ({ page }) => {
  await page.getByText('课程模板 · 一键生成').click();
  await page.getByText('保存当前').click();
  await page.locator('.modal input').fill('测试模板');
  await page.getByRole('button', { name: '保存' }).click();

  const saved = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('copybook-custom-templates') || '[]')
  );
  expect(saved[0].name).toBe('测试模板');
});
```

- [ ] **Step 5: 运行路由和既有核心测试**

Run:

```bash
npm run test:unit -- tests/unit/appRoutes.test.js --run
npx playwright test tests/e2e/redesign.spec.js
npx playwright test tests/e2e/app.spec.js
```

Expected: all listed tests PASS.

- [ ] **Step 6: 提交**

```bash
git add src/App.jsx tests/e2e/app.spec.js tests/e2e/layout.spec.js tests/e2e/critical-paths.spec.js tests/e2e/redesign.spec.js
git commit -m "feat: add home and builder app views"
```

---

## Task 3: Header 与 Hero

**Files:**
- Modify: `src/components/BrandHeader.jsx`
- Modify: `src/components/HeroSection.jsx`
- Create: `tests/unit/brandHeader.test.jsx`
- Create: `tests/unit/heroSection.test.jsx`

- [ ] **Step 1: 写 Header 和 Hero 失败测试**

Create `tests/unit/brandHeader.test.jsx`:

```jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BrandHeader from '../../src/components/BrandHeader';

describe('BrandHeader', () => {
  it('navigates to a builder type from desktop navigation', () => {
    const onNavigate = vi.fn();
    render(
      <BrandHeader
        darkMode={false}
        onToggleDarkMode={() => {}}
        currentView="home"
        onNavigate={onNavigate}
      />
    );

    fireEvent.click(screen.getByRole('link', { name: '汉字字帖' }));
    expect(onNavigate).toHaveBeenCalledWith('hanzi');
  });

  it('opens and closes the mobile navigation', () => {
    render(
      <BrandHeader
        darkMode={false}
        onToggleDarkMode={() => {}}
        currentView="home"
        onNavigate={() => {}}
      />
    );

    const toggle = screen.getByRole('button', { name: '打开导航菜单' });
    fireEvent.click(toggle);
    expect(screen.getByRole('button', { name: '关闭导航菜单' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('toggles dark mode', () => {
    const onToggleDarkMode = vi.fn();
    render(
      <BrandHeader
        darkMode={false}
        onToggleDarkMode={onToggleDarkMode}
        currentView="home"
        onNavigate={() => {}}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '切换到深色模式' }));
    expect(onToggleDarkMode).toHaveBeenCalledOnce();
  });
});
```

Create `tests/unit/heroSection.test.jsx`:

```jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HeroSection from '../../src/components/HeroSection';

describe('HeroSection', () => {
  it('starts the hanzi builder from the primary CTA', () => {
    const onStartBuilder = vi.fn();
    render(<HeroSection onStartBuilder={onStartBuilder} />);

    fireEvent.click(screen.getByRole('button', { name: '制作汉字字帖' }));
    expect(onStartBuilder).toHaveBeenCalledWith('hanzi');
  });

  it('shows only claims supported by the product', () => {
    render(<HeroSection onStartBuilder={() => {}} />);

    expect(screen.getByText('免登录')).toBeInTheDocument();
    expect(screen.getByText('高清 PDF')).toBeInTheDocument();
    expect(screen.queryByText('100,000+ 用户')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run:

```bash
npm run test:unit -- tests/unit/brandHeader.test.jsx tests/unit/heroSection.test.jsx --run
```

Expected: FAIL because the current Header does not expose the mobile menu and Hero uses different accessible names and claims.

- [ ] **Step 3: 重写 `BrandHeader`**

Replace `src/components/BrandHeader.jsx` with:

```jsx
import React, { useEffect, useState } from 'react';
import DarkModeToggle from './DarkModeToggle';

const NAV_ITEMS = [
  { key: 'home', label: '首页' },
  { key: 'hanzi', label: '汉字字帖' },
  { key: 'pinyin', label: '拼音字帖' },
  { key: 'english', label: '英文字帖' },
  { key: 'digits', label: '数字与字母' },
  { key: 'tutorial', label: '教程' },
];

export default function BrandHeader({
  darkMode,
  onToggleDarkMode,
  currentView,
  onNavigate,
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navigate = (key) => {
    setMenuOpen(false);
    onNavigate?.(key);
  };

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''} ${menuOpen ? 'is-mobile-nav-open' : ''}`}>
      <div className="header-inner">
        <a
          className="brand"
          href="#/"
          onClick={(event) => {
            event.preventDefault();
            navigate('home');
          }}
        >
          <span className="brand-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="brand-icon-svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
              <path d="M12 20h9" />
            </svg>
          </span>
          <span className="brand-text">字帖生成器</span>
        </a>

        <nav className="nav desktop-nav" aria-label="主导航">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.key}
              className={`nav-link ${currentView === item.key ? 'active' : ''}`}
              href="#"
              onClick={(event) => {
                event.preventDefault();
                navigate(item.key);
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <DarkModeToggle darkMode={darkMode} onToggle={onToggleDarkMode} />
          <button
            type="button"
            className={`menu-toggle ${menuOpen ? 'active' : ''}`}
            aria-label={menuOpen ? '关闭导航菜单' : '打开导航菜单'}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="menu-toggle-lines" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </button>
        </div>
      </div>

      <button
        type="button"
        className={`mobile-mask ${menuOpen ? 'open' : ''}`}
        aria-label="关闭导航遮罩"
        onClick={() => setMenuOpen(false)}
      />
      <nav
        id="mobile-navigation"
        className={`mobile-drawer ${menuOpen ? 'open' : ''}`}
        aria-label="移动端导航"
      >
        {NAV_ITEMS.map((item) => (
          <a
            key={item.key}
            className={`mobile-link ${currentView === item.key ? 'active' : ''}`}
            href="#"
            onClick={(event) => {
              event.preventDefault();
              navigate(item.key);
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
```

- [ ] **Step 4: 重写 `HeroSection`**

Replace `src/components/HeroSection.jsx` with:

```jsx
import React from 'react';

const TRUST_ITEMS = ['免登录', '高清 PDF', '本地生成', '在线编辑'];

export default function HeroSection({ onStartBuilder }) {
  return (
    <section className="hero-section home-hero">
      <div className="hero-background" aria-hidden="true" />
      <div className="home-hero-inner">
        <div className="hero-content hero-copy">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-dot" />
            免费在线字帖工具
          </div>
          <h1 id="home-title" className="hero-title" tabIndex={-1}>
            免费在线字帖生成器
          </h1>
          <p className="hero-subtitle">
            覆盖汉字、拼音、英文与数字字母，自定义内容、格线和排版，实时预览后直接打印。
          </p>
          <div className="hero-actions">
            <button
              type="button"
              className="btn-gradient-primary"
              onClick={() => onStartBuilder?.('hanzi')}
            >
              制作汉字字帖
              <span aria-hidden="true">→</span>
            </button>
            <button
              type="button"
              className="btn-outline-brand"
              onClick={() => onStartBuilder?.('english')}
            >
              制作英文字帖
            </button>
          </div>
          <div className="hero-trust">
            {TRUST_ITEMS.map((item) => (
              <span key={item} className="hero-trust-item">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="hero-product" aria-label="字帖工作台预览">
          <div className="hero-product-topbar" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <div className="hero-product-layout">
            <div className="hero-product-controls">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="hero-paper">
              <div className="hero-paper-header">山行</div>
              <div className="hero-paper-grid" aria-hidden="true">
                {Array.from({ length: 24 }, (_, index) => (
                  <i key={index} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: 运行测试确认通过**

Run:

```bash
npm run test:unit -- tests/unit/brandHeader.test.jsx tests/unit/heroSection.test.jsx --run
```

Expected: PASS, 5 tests.

- [ ] **Step 6: 提交**

```bash
git add src/components/BrandHeader.jsx src/components/HeroSection.jsx tests/unit/brandHeader.test.jsx tests/unit/heroSection.test.jsx
git commit -m "feat: rebuild header and home hero"
```

---

## Task 4: 首页内容区块

**Files:**
- Modify: `src/components/StatsSection.jsx`
- Modify: `src/components/FeatureCards.jsx`
- Create: `src/components/WorkflowSection.jsx`
- Create: `src/components/UseCasesSection.jsx`
- Delete: `src/components/Testimonials.jsx`
- Modify: `src/components/SiteFooter.jsx`
- Modify: `src/components/LandingPage.jsx`
- Create: `tests/unit/landingSections.test.jsx`

- [ ] **Step 1: 写首页区块失败测试**

Create `tests/unit/landingSections.test.jsx`:

```jsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LandingPage from '../../src/components/LandingPage';

describe('LandingPage', () => {
  it('renders truthful capability metrics', () => {
    render(<LandingPage onStartBuilder={() => {}} onNavigate={() => {}} />);

    expect(screen.getByText('4 类')).toBeInTheDocument();
    expect(screen.getByText('20+ 种')).toBeInTheDocument();
    expect(screen.getAllByText('高清 PDF').length).toBeGreaterThan(0);
    expect(screen.getAllByText('免登录').length).toBeGreaterThan(0);
    expect(screen.queryByText('100,000+')).not.toBeInTheDocument();
  });

  it('starts the correct builder from a feature card', () => {
    const onStartBuilder = vi.fn();
    render(<LandingPage onStartBuilder={onStartBuilder} onNavigate={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: /拼音字帖/ }));
    expect(onStartBuilder).toHaveBeenCalledWith('pinyin');
  });

  it('renders real use cases instead of user testimonials', () => {
    render(<LandingPage onStartBuilder={() => {}} onNavigate={() => {}} />);

    expect(screen.getByText('家庭辅导')).toBeInTheDocument();
    expect(screen.getByText('教师备课')).toBeInTheDocument();
    expect(screen.queryByText('用户评价')).not.toBeInTheDocument();
  });

  it('links the tutorial CTA to the workflow section', () => {
    const onNavigate = vi.fn();
    render(<LandingPage onStartBuilder={() => {}} onNavigate={onNavigate} />);

    fireEvent.click(screen.getByRole('button', { name: '查看生成流程' }));
    expect(onNavigate).toHaveBeenCalledWith('tutorial');
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run:

```bash
npm run test:unit -- tests/unit/landingSections.test.jsx --run
```

Expected: FAIL because current metrics and components differ.

- [ ] **Step 3: 重写能力指标和功能卡**

Replace `src/components/StatsSection.jsx` with:

```jsx
import React from 'react';

const STATS = [
  { value: '4 类', label: '字帖内容' },
  { value: '20+ 种', label: '格线与预设' },
  { value: '高清 PDF', label: '打印导出' },
  { value: '免登录', label: '直接使用' },
];

export default function StatsSection() {
  return (
    <section className="stats-section" aria-label="产品能力">
      <div className="stats-grid">
        {STATS.map((stat) => (
          <div key={stat.label} className="stat-item">
            <div className="stat-item-value">{stat.value}</div>
            <div className="stat-item-label">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
```

Replace `src/components/FeatureCards.jsx` with:

```jsx
import React from 'react';

const CARDS = [
  {
    key: 'hanzi',
    icon: '文',
    title: '汉字字帖',
    desc: '田字格、米字格与回宫格，支持常用字、古诗和课文内容。',
    color: 'blue',
  },
  {
    key: 'pinyin',
    icon: '拼',
    title: '拼音字帖',
    desc: '拼音临摹、看拼音写汉字和看汉字写拼音。',
    color: 'pink',
  },
  {
    key: 'english',
    icon: 'A',
    title: '英文字帖',
    desc: '四线三格字母、单词和句子书写练习。',
    color: 'purple',
  },
  {
    key: 'digits',
    icon: '123',
    title: '数字与字母',
    desc: '数字和字母描写，适合基础书写训练。',
    color: 'green',
  },
];

export default function FeatureCards({ onSelect }) {
  return (
    <section className="features-section" id="features">
      <div className="container-narrow">
        <div className="section-header">
          <h2 className="home-section-title">选择字帖类型</h2>
          <p className="home-section-subtitle">
            从内容、格线到排版都可调整，生成后可直接打印或导出。
          </p>
        </div>
        <div className="features-grid">
          {CARDS.map((card) => (
            <button
              key={card.key}
              type="button"
              className={`feature-card feature-card--${card.color}`}
              onClick={() => onSelect?.(card.key)}
              aria-label={`${card.title}，立即制作`}
            >
              <span className="feature-card-icon" aria-hidden="true">{card.icon}</span>
              <span className="feature-card-title">{card.title}</span>
              <span className="feature-card-desc">{card.desc}</span>
              <span className="feature-card-cta">立即制作 →</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: 新增流程和使用场景组件**

Create `src/components/WorkflowSection.jsx`:

```jsx
import React from 'react';

const STEPS = [
  {
    number: '01',
    title: '选择内容',
    desc: '输入文字，或从常用字、古诗、课文和英语资料中选择。',
  },
  {
    number: '02',
    title: '调整样式',
    desc: '设置字帖类型、格线、字体、字号、颜色和纸张参数。',
  },
  {
    number: '03',
    title: '生成与导出',
    desc: '实时查看分页效果，打印或导出高清 PDF、图片和 SVG。',
  },
];

export default function WorkflowSection({ onStartBuilder, onNavigate }) {
  return (
    <section className="workflow-section" id="workflow">
      <div className="container-narrow">
        <div className="section-header">
          <h2 className="home-section-title">三步生成字帖</h2>
          <p className="home-section-subtitle">
            不改变现有工作流，只把每一步做得更清楚。
          </p>
        </div>
        <div className="workflow-grid">
          {STEPS.map((step) => (
            <article key={step.number} className="workflow-card">
              <span className="workflow-number">{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
            </article>
          ))}
        </div>
        <div className="workflow-actions">
          <button
            type="button"
            className="btn-gradient-primary"
            onClick={() => onStartBuilder?.('hanzi')}
          >
            立即开始制作
          </button>
          <button
            type="button"
            className="btn-text"
            onClick={() => onNavigate?.('tutorial')}
          >
            查看生成流程
          </button>
        </div>
      </div>
    </section>
  );
}
```

Create `src/components/UseCasesSection.jsx`:

```jsx
import React from 'react';

const CASES = [
  {
    title: '家庭辅导',
    desc: '按当天学习内容快速生成练习页，孩子完成后直接打印下一份。',
  },
  {
    title: '教师备课',
    desc: '从教材生字、词语和课文中选择内容，批量生成课堂练习。',
  },
  {
    title: '课后巩固',
    desc: '把易错字、英文单词或数字组合成短时练习，即时调整重复次数。',
  },
];

export default function UseCasesSection() {
  return (
    <section className="usecases-section">
      <div className="container-narrow">
        <div className="section-header">
          <h2 className="home-section-title">适合这些真实场景</h2>
          <p className="home-section-subtitle">
            内容留在浏览器本地，无需注册，也不依赖云端账户。
          </p>
        </div>
        <div className="usecases-grid">
          {CASES.map((item) => (
            <article key={item.title} className="usecase-card">
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
```

Delete `src/components/Testimonials.jsx`.

- [ ] **Step 5: 更新页脚和首页组合**

Replace `src/components/SiteFooter.jsx` with:

```jsx
import React from 'react';

const NAV_LINKS = [
  { key: 'hanzi', label: '汉字字帖' },
  { key: 'pinyin', label: '拼音字帖' },
  { key: 'english', label: '英文字帖' },
  { key: 'digits', label: '数字与字母' },
  { key: 'tutorial', label: '生成流程' },
];

export default function SiteFooter({ onNavigate }) {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="footer-brand-icon" aria-hidden="true">字</span>
            <span>字帖生成器</span>
          </div>
          <nav className="footer-nav" aria-label="页脚导航">
            {NAV_LINKS.map((link) => (
              <button
                key={link.key}
                type="button"
                onClick={() => onNavigate?.(link.key)}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>
        <p className="footer-desc">
          免费在线字帖工具，支持汉字、拼音、英文和数字字母练习，提供实时预览、A4 打印和多种格式导出。
        </p>
        <div className="footer-bottom">
          © 2026 字帖生成器
        </div>
      </div>
    </footer>
  );
}
```

Replace `src/components/LandingPage.jsx` with:

```jsx
import React from 'react';
import HeroSection from './HeroSection';
import StatsSection from './StatsSection';
import FeatureCards from './FeatureCards';
import WorkflowSection from './WorkflowSection';
import UseCasesSection from './UseCasesSection';
import SiteFooter from './SiteFooter';

export default function LandingPage({ onStartBuilder, onNavigate }) {
  return (
    <div className="landing-page">
      <HeroSection onStartBuilder={onStartBuilder} />
      <StatsSection />
      <FeatureCards onSelect={onStartBuilder} />
      <WorkflowSection
        onStartBuilder={onStartBuilder}
        onNavigate={onNavigate}
      />
      <UseCasesSection />
      <section className="final-cta">
        <h2>现在开始制作一份专属字帖</h2>
        <p>选择内容、调整样式，然后直接打印。</p>
        <button
          type="button"
          className="btn-gradient-primary"
          onClick={() => onStartBuilder?.('hanzi')}
        >
          进入字帖工作台
        </button>
      </section>
      <SiteFooter onNavigate={onNavigate} />
    </div>
  );
}
```

- [ ] **Step 6: 运行测试确认通过**

Run:

```bash
npm run test:unit -- tests/unit/landingSections.test.jsx --run
```

Expected: PASS, 4 tests.

- [ ] **Step 7: 提交**

```bash
git add src/components/StatsSection.jsx src/components/FeatureCards.jsx src/components/WorkflowSection.jsx src/components/UseCasesSection.jsx src/components/Testimonials.jsx src/components/SiteFooter.jsx src/components/LandingPage.jsx tests/unit/landingSections.test.jsx
git commit -m "feat: rebuild landing page content"
```

---

## Task 5: 工作台双栏结构与 AI 面板

**Files:**
- Modify: `src/components/layout/MainLayout.jsx`
- Modify: `src/components/ConfigPanel.jsx`
- Modify: `tests/e2e/redesign.spec.js`

- [ ] **Step 1: 追加失败的工作台结构测试**

Append to `tests/e2e/redesign.spec.js`:

```js
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
```

- [ ] **Step 2: 运行测试确认失败**

Run:

```bash
npx playwright test tests/e2e/redesign.spec.js --grep "工作台结构"
```

Expected: FAIL because `.builder-layout-container`, `.ai-panel-collapsible`, and the final heading do not exist.

- [ ] **Step 3: 调整 `MainLayout` 外框和双栏类名**

In `src/components/layout/MainLayout.jsx`, remove:

```jsx
import DarkModeToggle from '../DarkModeToggle';
```

Also remove the two unused component parameters:

```diff
-  darkMode,
-  onToggleDarkMode,
```

Change the two builder content rows:

```diff
- const step0Content = React.createElement('div', { className: 'row g-3' },
+ const step0Content = React.createElement('div', { className: 'row g-3 builder-grid' },
```

```diff
-     React.createElement('div', { className: 'col-12 col-lg-5' },
+     React.createElement('div', { className: 'col-12 col-lg-5 builder-preview-column' },
```

Apply the same two replacements to `step1Content`.

Change the third step row:

```diff
- const step2Content = React.createElement('div', { className: 'row g-3' },
+ const step2Content = React.createElement('div', { className: 'row g-3 builder-grid builder-grid--full' },
```

Replace the current return opening and header block:

```jsx
return React.createElement(
  React.Fragment,
  null,
  React.createElement('style', null, `
    @media (max-width: 768px) {
      .main-layout-container { padding: 8px !important; }
      .main-layout-container .card-body { padding: 12px; }
      .main-layout-container h1 { font-size: 1.1rem; }
    }
  `),
  React.createElement(
    'div',
    { className: 'builder-page' },
    React.createElement(
      'div',
      { className: 'container-fluid builder-layout-container' },
      React.createElement(
        'h1',
        {
          id: 'builder-title',
          className: 'sr-only',
          tabIndex: -1,
        },
        '字帖生成器工作台'
      ),
      React.createElement(
        'div',
        { className: 'no-print mb-3 builder-toolbar' },
        React.createElement(StepBar, {
          steps: STEPS,
          currentStep,
          onStepClick: onStepChange,
        }),
        React.createElement(
          'div',
          {
            className: 'step-content-wrapper',
            key: currentStep,
          },
          stepContents[currentStep] || step0Content
        ),
        React.createElement(QuickGenerateBar, {
          onGenerate: () => {
            if (selectedCharacters && selectedCharacters.size > 0) {
              const selectedText = Array.from(selectedCharacters).join('');
              updateSetting('text', selectedText);
            }
            onStepChange && onStepChange(2);
          },
          onPrint: handlePrint,
          onExportPDF,
          onPreview: text ? () => setShowPreviewModal(true) : undefined,
          hasContent: hasContent || showPreview,
        }),
        React.createElement(
          PreviewModal,
          {
            open: showPreviewModal,
            onClose: () => setShowPreviewModal(false),
            onPrint: handlePrint,
            onExportPDF,
          },
          text
            ? React.createElement(PageGrid, {
                pages,
                cols,
                layout,
                feature,
                header,
                bg,
                tColor,
                strokeMode,
                font,
                fontSize,
                letterStyle,
                showGuide,
                engFont,
                copybookType,
                copybookStyle,
                showPinyin,
                pinyinColor: '#dc3545',
              })
            : React.createElement(
                'div',
                {
                  style: {
                    color: '#999',
                    fontSize: '14px',
                    padding: '40px',
                    textAlign: 'center',
                  },
                },
                '请先生成字帖'
              )
        )
      )
    )
  )
);
```

The old `DarkModeToggle`, visible `<h1>` and surrounding header markup are removed. The shared `BrandHeader` already provides the page-level header.

- [ ] **Step 4: 在 `ConfigPanel` 接入可折叠 AI 面板**

Add the import at the top of `src/components/ConfigPanel.jsx`:

```jsx
import AIGenerationPanel from './AIGenerationPanel';
```

Insert this block immediately after `<CourseTemplates ... />`:

```jsx
<details className="ai-panel-collapsible">
  <summary>AI 内容生成</summary>
  <AIGenerationPanel
    toast={toast}
    onGenerated={(generatedText) => updateSetting('text', generatedText)}
  />
</details>
```

- [ ] **Step 5: 运行工作台结构测试**

Run:

```bash
npx playwright test tests/e2e/redesign.spec.js --grep "工作台结构"
```

Expected: PASS, 3 tests.

- [ ] **Step 6: 提交**

```bash
git add src/components/layout/MainLayout.jsx src/components/ConfigPanel.jsx tests/e2e/redesign.spec.js
git commit -m "feat: add two-column builder shell"
```

---

## Task 6: 全局设计系统与首页样式

**Files:**
- Modify: `src/main.jsx`
- Modify: `src/styles/design-system.css`
- Create: `src/styles/landing.css`
- Modify: `tests/e2e/redesign.spec.js`

- [ ] **Step 1: 追加视觉失败测试**

Append to `tests/e2e/redesign.spec.js`:

```js
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
```

- [ ] **Step 2: 运行视觉测试确认失败**

Run:

```bash
npx playwright test tests/e2e/redesign.spec.js --grep "首页视觉系统"
```

Expected: FAIL because `design-system.css` and `landing.css` are not imported, and the home feature card class does not exist.

- [ ] **Step 3: 导入样式文件**

Update the top of `src/main.jsx`:

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/design-system.css';
import './styles/landing.css';
import { ErrorBoundary } from './components/ErrorBoundary';
import App from './App';
```

Add the home card class in `src/components/FeatureCards.jsx`:

```diff
- className={`feature-card feature-card--${card.color}`}
+ className={`feature-card home-feature-card feature-card--${card.color}`}
```

- [ ] **Step 4: 扩展全局设计系统**

Append to `src/styles/design-system.css`:

```css
:root {
  --app-bg: #f8fafc;
  --app-surface: #ffffff;
  --app-surface-soft: #f1f5f9;
  --app-border: #e2e8f0;
  --app-text: #1f2937;
  --app-muted: #64748b;
  --app-focus: rgba(37, 99, 235, .24);
  --header-radius: 12px;
}

html {
  scroll-behavior: smooth;
}

body {
  background: var(--app-bg);
  color: var(--app-text);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC",
    "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
}

button,
input,
select,
textarea {
  font: inherit;
}

button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible,
textarea:focus-visible,
summary:focus-visible {
  outline: 3px solid var(--app-focus);
  outline-offset: 2px;
}

.header-actions {
  align-items: center;
  display: flex;
  gap: .5rem;
  margin-left: auto;
}

.desktop-nav .nav-link.active {
  background: linear-gradient(135deg, #eef4ff, #f4f0ff);
  border-color: #dbe4ff;
  color: #4f46e5;
}

.menu-toggle {
  align-items: center;
  background: #fff;
  border: 1px solid #dbe4ff;
  border-radius: 8px;
  color: #334155;
  display: none;
  height: 2.25rem;
  justify-content: center;
  padding: 0 .62rem;
}

.menu-toggle-lines {
  display: inline-flex;
  flex-direction: column;
  gap: 4px;
}

.menu-toggle-lines i {
  background: currentColor;
  border-radius: 2px;
  display: block;
  height: 2px;
  width: 16px;
}

.menu-toggle.active .menu-toggle-lines i:first-child {
  transform: translateY(6px) rotate(45deg);
}

.menu-toggle.active .menu-toggle-lines i:nth-child(2) {
  opacity: 0;
}

.menu-toggle.active .menu-toggle-lines i:nth-child(3) {
  transform: translateY(-6px) rotate(-45deg);
}

.mobile-drawer,
.mobile-mask {
  display: none;
}

.btn-gradient-primary,
.btn-outline-brand {
  align-items: center;
  border-radius: 12px;
  display: inline-flex;
  font-size: .95rem;
  font-weight: 700;
  gap: .5rem;
  justify-content: center;
  min-height: 46px;
  padding: .75rem 1.35rem;
  text-decoration: none;
}

.btn-gradient-primary {
  background: var(--gradient-brand);
  border: 1px solid rgba(255, 255, 255, .65);
  color: #fff;
  box-shadow: 0 10px 25px rgba(124, 58, 237, .28);
}

.btn-outline-brand {
  background: #fff;
  border: 1px solid #dbe4ff;
  color: #4338ca;
}

.btn-text {
  background: transparent;
  border: 0;
  color: #4f46e5;
  font-weight: 700;
  padding: .75rem .5rem;
}

.dark-mode {
  --app-bg: #0f172a;
  --app-surface: #172033;
  --app-surface-soft: #1e293b;
  --app-border: #334155;
  --app-text: #e2e8f0;
  --app-muted: #94a3b8;
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
}

@media (max-width: 1024px) {
  .desktop-nav {
    display: none;
  }

  .menu-toggle {
    display: inline-flex;
  }

  .mobile-mask {
    background: rgba(15, 23, 42, .22);
    border: 0;
    bottom: 0;
    display: block;
    left: 0;
    opacity: 0;
    pointer-events: none;
    position: fixed;
    right: 0;
    top: 64px;
    transition: opacity .2s ease;
    z-index: 55;
  }

  .mobile-mask.open {
    opacity: 1;
    pointer-events: auto;
  }

  .mobile-drawer {
    background: rgba(255, 255, 255, .96);
    bottom: 0;
    display: flex;
    flex-direction: column;
    gap: .35rem;
    left: 0;
    padding: 1.5rem;
    position: fixed;
    right: 0;
    top: 64px;
    transform: translateY(-12px);
    visibility: hidden;
    z-index: 56;
  }

  .mobile-drawer.open {
    opacity: 1;
    transform: translateY(0);
    visibility: visible;
  }

  .mobile-link {
    border-radius: 12px;
    color: var(--app-text);
    font-size: 1.1rem;
    font-weight: 700;
    padding: .9rem 1rem;
    text-decoration: none;
  }

  .mobile-link.active,
  .mobile-link:hover {
    background: #eef2ff;
    color: #4f46e5;
  }
}

.dark-mode .site-header,
.dark-mode .mobile-drawer {
  background: rgba(15, 23, 42, .96);
  border-color: #334155;
}

.dark-mode .menu-toggle,
.dark-mode .btn-outline-brand {
  background: #1e293b;
  border-color: #475569;
  color: #e2e8f0;
}

.dark-mode .mobile-link {
  color: #e2e8f0;
}

.dark-mode .mobile-link.active,
.dark-mode .mobile-link:hover {
  background: #1e293b;
  color: #93c5fd;
}
```

- [ ] **Step 5: 创建首页样式**

Create `src/styles/landing.css`:

```css
.landing-page {
  background: #fff;
}

.home-hero {
  align-items: stretch;
  background:
    linear-gradient(rgba(99, 102, 241, .055) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99, 102, 241, .055) 1px, transparent 1px),
    linear-gradient(180deg, #ffffff, #f8fafc);
  background-size: 44px 44px, 44px 44px, auto;
  color: #1f2937;
  display: flex;
  min-height: calc(100svh - 64px);
  overflow: hidden;
  padding: 0;
  position: relative;
}

.hero-background {
  background:
    radial-gradient(circle at 78% 26%, rgba(168, 85, 247, .18), transparent 28%),
    radial-gradient(circle at 68% 78%, rgba(236, 72, 153, .12), transparent 24%);
  inset: 0;
  pointer-events: none;
  position: absolute;
}

.home-hero-inner {
  align-items: center;
  display: grid;
  gap: 4rem;
  grid-template-columns: minmax(0, .92fr) minmax(460px, 1.08fr);
  margin: 0 auto;
  max-width: 1240px;
  padding: 5rem 2rem;
  position: relative;
  width: 100%;
  z-index: 1;
}

.hero-copy {
  margin: 0;
  max-width: 620px;
  text-align: left;
}

.hero-eyebrow {
  align-items: center;
  background: rgba(255, 255, 255, .82);
  border: 1px solid rgba(99, 102, 241, .15);
  border-radius: 999px;
  color: #475569;
  display: inline-flex;
  font-size: .78rem;
  font-weight: 700;
  gap: .55rem;
  margin-bottom: 1.25rem;
  padding: .5rem .82rem;
}

.hero-eyebrow-dot {
  background: #22c55e;
  border-radius: 50%;
  box-shadow: 0 0 0 5px rgba(34, 197, 94, .12);
  height: .48rem;
  width: .48rem;
}

.home-hero .hero-title {
  color: #0f172a;
  font-size: clamp(3rem, 4.8vw, 4.8rem);
  font-weight: 900;
  letter-spacing: -.045em;
  line-height: 1.04;
  margin: 0 0 1.25rem;
}

.home-hero .hero-subtitle {
  color: #475569;
  font-size: 1.08rem;
  line-height: 1.75;
  margin: 0 0 1.75rem;
  max-width: 560px;
}

.home-hero .hero-actions {
  justify-content: flex-start;
  margin-bottom: 1.25rem;
}

.home-hero .hero-trust {
  color: #64748b;
  justify-content: flex-start;
}

.hero-trust-item {
  background: rgba(255, 255, 255, .78);
  border: 1px solid rgba(226, 232, 240, .9);
  border-radius: 999px;
  padding: .35rem .65rem;
}

.hero-product {
  background: rgba(255, 255, 255, .84);
  border: 1px solid rgba(255, 255, 255, .92);
  border-radius: 24px;
  box-shadow: 0 30px 80px rgba(79, 70, 229, .22);
  padding: 1.65rem .7rem .7rem;
  position: relative;
}

.hero-product-topbar {
  display: flex;
  gap: .35rem;
  left: 1rem;
  position: absolute;
  top: .8rem;
}

.hero-product-topbar i {
  border-radius: 50%;
  display: block;
  height: .48rem;
  width: .48rem;
}

.hero-product-topbar i:first-child { background: #f87171; }
.hero-product-topbar i:nth-child(2) { background: #fbbf24; }
.hero-product-topbar i:nth-child(3) { background: #34d399; }

.hero-product-layout {
  display: grid;
  gap: .65rem;
  grid-template-columns: .36fr .64fr;
}

.hero-product-controls,
.hero-paper {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
}

.hero-product-controls {
  display: grid;
  gap: .65rem;
  padding: .75rem;
}

.hero-product-controls span {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  height: 2.2rem;
}

.hero-product-controls span:first-child {
  background: linear-gradient(90deg, #eef4ff, #f5f3ff);
  border-color: #dbe4ff;
}

.hero-paper {
  box-shadow: 0 18px 45px rgba(15, 23, 42, .1);
  padding: 1rem;
}

.hero-paper-header {
  color: #334155;
  font-size: 1rem;
  font-weight: 800;
  margin-bottom: .75rem;
  text-align: center;
}

.hero-paper-grid {
  display: grid;
  gap: 5px;
  grid-template-columns: repeat(6, 1fr);
}

.hero-paper-grid i {
  aspect-ratio: 1;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  position: relative;
}

.hero-paper-grid i::before,
.hero-paper-grid i::after {
  background: #dbeafe;
  content: "";
  left: 50%;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
}

.hero-paper-grid i::before {
  height: 1px;
  width: 100%;
}

.hero-paper-grid i::after {
  height: 100%;
  width: 1px;
}

.container-narrow {
  margin: 0 auto;
  max-width: 1180px;
  padding: 0 1.5rem;
}

.home-section-title {
  color: #0f172a;
  font-size: clamp(1.8rem, 3vw, 2.5rem);
  font-weight: 900;
  letter-spacing: -.035em;
  margin-bottom: .65rem;
}

.home-section-subtitle {
  color: #64748b;
  font-size: 1rem;
  line-height: 1.7;
  margin: 0 auto;
  max-width: 680px;
}

.features-section {
  background: #fff;
  padding: 5.5rem 0;
}

.home-feature-card {
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  min-height: 245px;
  text-align: left;
  width: 100%;
}

.home-feature-card .feature-card-icon {
  align-items: center;
  display: flex;
  font-size: 1.35rem;
  font-weight: 900;
  height: 3.25rem;
  justify-content: center;
  margin-bottom: 1.2rem;
  width: 3.25rem;
}

.home-feature-card .feature-card-title {
  font-size: 1.15rem;
  margin-bottom: .6rem;
}

.home-feature-card .feature-card-desc {
  flex: 1;
}

.workflow-section {
  background: #f8fafc;
  padding: 5.5rem 0;
}

.workflow-grid,
.usecases-grid {
  display: grid;
  gap: 1.25rem;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.workflow-card,
.usecase-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 22px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, .06);
  padding: 1.75rem;
}

.workflow-number {
  color: #6366f1;
  display: block;
  font-size: .8rem;
  font-weight: 900;
  letter-spacing: .12em;
  margin-bottom: 1.25rem;
}

.workflow-card h3,
.usecase-card h3 {
  color: #1e293b;
  font-size: 1.2rem;
  font-weight: 800;
  margin-bottom: .65rem;
}

.workflow-card p,
.usecase-card p {
  color: #64748b;
  line-height: 1.7;
  margin: 0;
}

.workflow-actions {
  align-items: center;
  display: flex;
  gap: .75rem;
  justify-content: center;
  margin-top: 2rem;
}

.usecases-section {
  background: #fff;
  padding: 5.5rem 0;
}

.final-cta {
  background: linear-gradient(110deg, #2563eb, #7c3aed 52%, #db2777);
  color: #fff;
  padding: 4rem 1.5rem;
  text-align: center;
}

.final-cta h2 {
  font-size: clamp(1.8rem, 3.5vw, 2.6rem);
  font-weight: 900;
  letter-spacing: -.035em;
  margin-bottom: .75rem;
}

.final-cta p {
  color: rgba(255, 255, 255, .84);
  margin-bottom: 1.5rem;
}

.final-cta .btn-gradient-primary {
  background: #fff;
  color: #4338ca;
}

.site-footer .footer-nav button {
  background: transparent;
  border: 0;
  color: #94a3b8;
  padding: 0;
}

.site-footer .footer-nav button:hover {
  color: #fff;
}

@media (max-width: 1023px) {
  .home-hero-inner {
    grid-template-columns: 1fr;
    padding: 4rem 1.25rem;
  }

  .hero-product {
    margin: 0 auto;
    max-width: 620px;
    width: 100%;
  }
}

@media (max-width: 767px) {
  .home-hero {
    min-height: auto;
  }

  .home-hero-inner {
    gap: 2rem;
    padding: 3rem 1rem 4rem;
  }

  .home-hero .hero-title {
    font-size: 2.65rem;
  }

  .home-hero .hero-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .home-hero .hero-actions > * {
    width: 100%;
  }

  .home-hero .hero-trust {
    gap: .5rem;
  }

  .hero-product-layout {
    grid-template-columns: 1fr;
  }

  .hero-product-controls {
    display: none;
  }

  .workflow-grid,
  .usecases-grid {
    grid-template-columns: 1fr;
  }

  .workflow-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .workflow-actions > * {
    width: 100%;
  }
}

.dark-mode .landing-page,
.dark-mode .features-section,
.dark-mode .usecases-section {
  background: var(--app-bg);
}

.dark-mode .home-hero {
  background:
    linear-gradient(rgba(129, 140, 248, .06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(129, 140, 248, .06) 1px, transparent 1px),
    linear-gradient(180deg, #0f172a, #111827);
  background-size: 44px 44px, 44px 44px, auto;
  color: #e2e8f0;
}

.dark-mode .home-hero .hero-title,
.dark-mode .home-section-title,
.dark-mode .workflow-card h3,
.dark-mode .usecase-card h3 {
  color: #f8fafc;
}

.dark-mode .home-hero .hero-subtitle,
.dark-mode .home-section-subtitle,
.dark-mode .workflow-card p,
.dark-mode .usecase-card p,
.dark-mode .home-hero .hero-trust {
  color: #94a3b8;
}

.dark-mode .hero-eyebrow,
.dark-mode .hero-trust-item,
.dark-mode .hero-product,
.dark-mode .workflow-card,
.dark-mode .usecase-card {
  background: rgba(30, 41, 59, .9);
  border-color: #334155;
}

.dark-mode .hero-product-controls,
.dark-mode .hero-paper {
  background: #111827;
  border-color: #334155;
}

.dark-mode .workflow-section {
  background: #111827;
}
```

- [ ] **Step 6: 运行视觉测试确认通过**

Run:

```bash
npx playwright test tests/e2e/redesign.spec.js --grep "首页视觉系统"
```

Expected: PASS, 2 tests.

- [ ] **Step 7: 提交**

```bash
git add src/main.jsx src/styles/design-system.css src/styles/landing.css src/components/FeatureCards.jsx tests/e2e/redesign.spec.js
git commit -m "style: add global and landing design system"
```

---

## Task 7: 工作台样式、响应式与深色主题

**Files:**
- Modify: `src/main.jsx`
- Modify: `src/components/StepBar.jsx`
- Modify: `src/components/QuickGenerateBar.jsx`
- Create: `src/styles/builder.css`
- Modify: `tests/e2e/redesign.spec.js`

- [ ] **Step 1: 追加工作台样式失败测试**

Append to `tests/e2e/redesign.spec.js`:

```js
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
```

- [ ] **Step 2: 运行测试确认失败**

Run:

```bash
npx playwright test tests/e2e/redesign.spec.js --grep "工作台视觉和主题"
```

Expected: FAIL because `.builder-preview-column` is not sticky, `.quick-generate-bar` is not class-driven, and no builder theme styling exists.

- [ ] **Step 3: 将步骤条和底部操作栏改为类驱动**

Add the builder stylesheet import to `src/main.jsx`:

```diff
 import './styles/design-system.css';
 import './styles/landing.css';
+import './styles/builder.css';
 import { ErrorBoundary } from './components/ErrorBoundary';
```

Replace `src/components/StepBar.jsx` with:

```jsx
import React from 'react';

export default function StepBar({ steps, currentStep, onStepClick }) {
  return (
    <div className="step-bar" role="navigation" aria-label="步骤导航">
      {steps.map((label, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;
        return (
          <React.Fragment key={label}>
            <button
              type="button"
              className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              aria-current={isActive ? 'step' : undefined}
              aria-label={label}
              onClick={() => onStepClick?.(index)}
            >
              <span className="step-circle">
                {isCompleted ? '✓' : index + 1}
              </span>
              <span className="step-label">{label}</span>
            </button>
            {index < steps.length - 1 && (
              <span
                className={`step-connector ${isCompleted ? 'completed' : ''}`}
                aria-hidden="true"
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
```

Replace `src/components/QuickGenerateBar.jsx` with:

```jsx
import React from 'react';

export default function QuickGenerateBar({
  onGenerate,
  onPrint,
  onExportPDF,
  onPreview,
  hasContent,
}) {
  return (
    <div
      className="quick-generate-bar no-print"
      role="region"
      aria-label="操作栏"
    >
      <span className="quick-generate-info">
        {hasContent ? '已选内容，可生成字帖' : '请先选择内容'}
      </span>
      {onPreview && (
        <button
          type="button"
          className="builder-btn builder-btn-secondary"
          disabled={!hasContent}
          onClick={onPreview}
        >
          预览
        </button>
      )}
      <button
        type="button"
        className="builder-btn builder-btn-primary"
        disabled={!hasContent}
        onClick={onGenerate}
      >
        一键生成字帖
      </button>
      {onPrint && (
        <button
          type="button"
          className="builder-btn builder-btn-secondary"
          onClick={onPrint}
        >
          打印
        </button>
      )}
      {onExportPDF && (
        <button
          type="button"
          className="builder-btn builder-btn-secondary"
          onClick={onExportPDF}
        >
          PDF
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 4: 创建工作台样式**

Create `src/styles/builder.css`:

```css
.builder-page {
  background:
    linear-gradient(rgba(99, 102, 241, .025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99, 102, 241, .025) 1px, transparent 1px),
    #f6f8fc;
  background-size: 36px 36px, 36px 36px, auto;
  min-height: calc(100vh - 64px);
  padding-bottom: 7rem;
}

.builder-layout-container {
  margin: 0 auto;
  max-width: 1560px;
  padding: 1.5rem 1.5rem 3rem;
}

.builder-toolbar {
  min-width: 0;
}

.builder-grid.row {
  --bs-gutter-x: 1.5rem;
  align-items: flex-start;
}

.builder-preview-column {
  align-self: flex-start;
  position: sticky;
  top: 84px;
  z-index: 2;
}

.builder-page .card,
.builder-page .section-card {
  background: rgba(255, 255, 255, .96);
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  box-shadow: 0 12px 32px rgba(15, 23, 42, .06);
  overflow: hidden;
}

.builder-page .card + .card,
.builder-page .section-card + .section-card {
  margin-top: 1rem;
}

.builder-page .card-body,
.builder-page .section-body {
  padding: 1.15rem;
}

.builder-page .section-header {
  background: linear-gradient(135deg, #f8fafc, #f5f3ff);
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
  font-size: .95rem;
  font-weight: 800;
}

.builder-page .section-header:hover {
  background: linear-gradient(135deg, #eef4ff, #f4f0ff);
}

.builder-page .form-label {
  color: #475569;
  font-size: .84rem;
  font-weight: 700;
  margin-bottom: .4rem;
}

.builder-page .form-control,
.builder-page .form-select,
.builder-page .form-range {
  border-color: #dbe2ea;
  border-radius: 10px;
}

.builder-page .form-control,
.builder-page .form-select {
  min-height: 42px;
}

.builder-page .form-control:focus,
.builder-page .form-select:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, .14);
}

.builder-page .btn {
  border-radius: 10px;
  font-weight: 700;
}

.step-bar {
  align-items: center;
  background: rgba(255, 255, 255, .9);
  border: 1px solid rgba(226, 232, 240, .95);
  border-radius: 16px;
  box-shadow: 0 10px 28px rgba(15, 23, 42, .06);
  display: flex;
  gap: .45rem;
  justify-content: center;
  margin-bottom: 1rem;
  padding: .75rem 1rem;
  position: sticky;
  top: 76px;
  z-index: 20;
}

.step-item {
  align-items: center;
  background: transparent;
  border: 0;
  border-radius: 10px;
  color: #94a3b8;
  display: inline-flex;
  font-size: .82rem;
  font-weight: 700;
  gap: .5rem;
  padding: .5rem .7rem;
}

.step-item.active {
  background: linear-gradient(135deg, #eef4ff, #f5f3ff);
  color: #4f46e5;
}

.step-item.completed {
  color: #0f766e;
}

.step-circle {
  align-items: center;
  background: #eef2f7;
  border-radius: 50%;
  display: inline-flex;
  flex: 0 0 26px;
  font-size: .72rem;
  height: 26px;
  justify-content: center;
  width: 26px;
}

.step-item.active .step-circle {
  background: var(--gradient-brand);
  color: #fff;
}

.step-item.completed .step-circle {
  background: #d1fae5;
  color: #047857;
}

.step-connector {
  background: #dbe2ea;
  border-radius: 999px;
  height: 2px;
  width: 30px;
}

.step-connector.completed {
  background: #86efac;
}

.quick-generate-bar {
  align-items: center;
  backdrop-filter: blur(18px);
  background: rgba(255, 255, 255, .9);
  border: 1px solid rgba(226, 232, 240, .95);
  border-radius: 16px;
  bottom: 1rem;
  box-shadow: 0 14px 36px rgba(15, 23, 42, .12);
  display: flex;
  gap: .65rem;
  left: 50%;
  margin-top: 1rem;
  max-width: 1120px;
  padding: .75rem;
  position: sticky;
  transform: translateX(-50%);
  width: calc(100% - 1rem);
  z-index: 25;
}

.quick-generate-info {
  color: #64748b;
  font-size: .82rem;
  margin-right: auto;
}

.builder-btn {
  border-radius: 10px;
  font-size: .84rem;
  font-weight: 800;
  min-height: 38px;
  padding: .5rem 1rem;
}

.builder-btn-primary {
  background: var(--gradient-brand);
  border: 0;
  color: #fff;
}

.builder-btn-secondary {
  background: #fff;
  border: 1px solid #dbe2ea;
  color: #475569;
}

.builder-btn:disabled {
  cursor: not-allowed;
  opacity: .45;
}

.ai-panel-collapsible {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  margin-bottom: 1rem;
  overflow: hidden;
}

.ai-panel-collapsible summary {
  background: linear-gradient(135deg, #eef4ff, #f5f3ff);
  color: #4338ca;
  cursor: pointer;
  font-size: .9rem;
  font-weight: 800;
  list-style: none;
  padding: .85rem 1rem;
}

.ai-panel-collapsible summary::-webkit-details-marker {
  display: none;
}

.ai-panel-collapsible[open] summary {
  border-bottom: 1px solid #dbe4ff;
}

.ai-panel-collapsible .ai-panel {
  border: 0;
  border-radius: 0;
  margin: 0;
}

.dark-mode .builder-page {
  background:
    linear-gradient(rgba(129, 140, 248, .035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(129, 140, 248, .035) 1px, transparent 1px),
    #0f172a;
  background-size: 36px 36px, 36px 36px, auto;
}

.dark-mode .builder-page .card,
.dark-mode .builder-page .section-card,
.dark-mode .step-bar,
.dark-mode .quick-generate-bar {
  background: rgba(23, 32, 51, .96);
  border-color: #334155;
}

.dark-mode .builder-page .section-header,
.dark-mode .ai-panel-collapsible summary {
  background: #1e293b;
  border-color: #334155;
  color: #c4b5fd;
}

.dark-mode .builder-page .form-control,
.dark-mode .builder-page .form-select,
.dark-mode .builder-page .form-range {
  background: #111827;
  border-color: #475569;
  color: #e2e8f0;
}

.dark-mode .builder-btn-secondary {
  background: #1e293b;
  border-color: #475569;
  color: #cbd5e1;
}

@media (max-width: 1024px) {
  .builder-preview-column {
    position: static;
    top: auto;
  }

  .step-bar {
    top: 68px;
  }
}

@media (max-width: 767px) {
  .builder-page {
    padding-bottom: 8rem;
  }

  .builder-layout-container {
    padding: .75rem .55rem 2rem;
  }

  .builder-grid.row {
    --bs-gutter-x: .75rem;
  }

  .step-bar {
    border-radius: 12px;
    gap: .15rem;
    padding: .5rem;
    top: 62px;
  }

  .step-item {
    flex: 1 1 0;
    justify-content: center;
    padding: .4rem;
  }

  .step-label {
    display: none;
  }

  .step-connector {
    width: 10px;
  }

  .quick-generate-bar {
    border-radius: 14px 14px 0 0;
    bottom: 0;
    display: grid;
    gap: .4rem;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    left: 0;
    margin: 0;
    max-width: none;
    padding: .65rem;
    transform: none;
    width: 100%;
  }

  .quick-generate-info {
    grid-column: 1 / -1;
    margin: 0;
    text-align: center;
  }

  .builder-btn-primary {
    grid-column: 1 / -1;
  }
}
```

- [ ] **Step 5: 运行工作台样式测试确认通过**

Run:

```bash
npx playwright test tests/e2e/redesign.spec.js --grep "工作台视觉和主题"
```

Expected: PASS, 3 tests.

- [ ] **Step 6: 运行相关单元测试**

Run:

```bash
npm run test:unit -- tests/unit/stepBar.test.js tests/unit/quickGenerateBar.test.js --run
```

Expected: PASS, existing button labels and callbacks unchanged.

- [ ] **Step 7: 提交**

```bash
git add src/main.jsx src/components/StepBar.jsx src/components/QuickGenerateBar.jsx src/styles/builder.css tests/e2e/redesign.spec.js
git commit -m "style: rebuild builder layout and dark theme"
```

---

## Task 8: 端到端验收与视觉回归

**Files:**
- Modify: `playwright.config.js`
- Modify: `tests/e2e/redesign.spec.js`
- Modify: existing e2e selectors if the redesigned DOM requires it

- [ ] **Step 1: 追加最终验收测试**

Append to `tests/e2e/redesign.spec.js`:

```js
test.describe('最终验收', () => {
  for (const viewport of [
    { width: 1440, height: 900, name: 'desktop' },
    { width: 1024, height: 768, name: 'tablet' },
    { width: 390, height: 844, name: 'mobile' },
  ]) {
    test(`${viewport.name} 首页无横向溢出`, async ({ page }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto('/');

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth
      );
      expect(overflow).toBeLessThanOrEqual(1);

      await page.screenshot({
        path: `test-results/redesign-home-${viewport.name}.png`,
        fullPage: true,
      });
    });

    test(`${viewport.name} 工作台无横向溢出`, async ({ page }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto('/#/builder');

      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth
      );
      expect(overflow).toBeLessThanOrEqual(1);

      await page.screenshot({
        path: `test-results/redesign-builder-${viewport.name}.png`,
        fullPage: true,
      });
    });
  }

  test('功能卡预选不覆盖用户文本', async ({ page }) => {
    await page.goto('/#/builder');
    await page.getByRole('button', { name: '选样式' }).click();
    await page.locator('#text').fill('用户已有内容');

    await page.goto('/');
    await page.getByRole('button', { name: /英文字帖，立即制作/ }).click();

    const settings = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('copybook-settings'))
    );
    expect(settings.text).toBe('用户已有内容');
    expect(settings.feature).toBe('字帖模板');
    expect(settings.layout).toBe('英文格式');
    expect(settings.gridType).toBe('四线三格');
  });

  test('浏览器返回和刷新保留工作台 hash', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '制作汉字字帖' }).click();
    await expect(page).toHaveURL(/#\/builder\/hanzi$/);

    await page.reload();
    await expect(page).toHaveURL(/#\/builder\/hanzi$/);
    await expect(
      page.getByRole('heading', { name: '字帖生成器工作台' })
    ).toBeAttached();

    await page.goBack();
    await expect(page).toHaveURL(/#\/$/);
    await expect(
      page.getByRole('heading', { name: '免费在线字帖生成器' })
    ).toBeVisible();
  });
});
```

- [ ] **Step 2: 让 Playwright 自动启动 Vite**

Update `playwright.config.js`:

```js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  retries: 1,
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    baseURL: 'http://127.0.0.1:5174',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1',
    url: 'http://127.0.0.1:5174',
    reuseExistingServer: true,
    timeout: 120000,
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
```

- [ ] **Step 3: 运行端到端验收**

Run:

```bash
npx playwright test tests/e2e/redesign.spec.js
```

Expected: PASS, including desktop, tablet, mobile, dark mode, hash restore and preset preservation tests.

- [ ] **Step 4: 运行全部测试**

Run:

```bash
npm run test:unit -- --run
npm run test
```

Expected:

- Vitest exits with 0 failures.
- Playwright exits with 0 failures.

- [ ] **Step 5: 运行生产构建**

Run:

```bash
npm run build
```

Expected: Vite build succeeds and writes `dist/`.

- [ ] **Step 6: 人工检查截图**

Open these files and verify:

```text
test-results/redesign-home-desktop.png
test-results/redesign-home-tablet.png
test-results/redesign-home-mobile.png
test-results/redesign-builder-desktop.png
test-results/redesign-builder-tablet.png
test-results/redesign-builder-mobile.png
```

Verification checklist:

```text
[ ] 首页与工作台没有横向滚动
[ ] Header、步骤条和卡片文字没有重叠
[ ] 桌面工作台预览为 sticky
[ ] 移动端底部操作栏没有遮挡最后一组控件
[ ] 深色模式下表单、按钮和选中态可辨识
[ ] 预览纸张和打印区域没有应用页面主题色
[ ] 首页没有用户量、下载量、评分或冒充评价
```

- [ ] **Step 7: 提交**

```bash
git add playwright.config.js tests/e2e/redesign.spec.js
git commit -m "test: add redesign end-to-end coverage"
```

---

## Plan Self-Review

- [ ] **Spec coverage:** `页面架构` 由 Task 1 和 Task 2 覆盖；`首页信息架构` 由 Task 3、Task 4 和 Task 6 覆盖；`工作台结构` 由 Task 2、Task 5 和 Task 7 覆盖；`视觉系统`、`动效` 和 `深色主题` 由 Task 6 和 Task 7 覆盖；`状态与数据流` 由 Task 1、Task 2 和 Task 8 覆盖；`错误与可访问性` 由 Task 3、Task 5 和 Task 8 覆盖。
- [ ] **Placeholder scan:** 已完成未完成标记检查，计划中没有遗留占位内容。
- [ ] **Type consistency:** 路由函数统一使用 `APP_VIEW`、`parseAppHash`、`hashForRoute` 和 `presetForBuilderType`；builder 类型统一使用 `hanzi`、`pinyin`、`english`、`digits`；设置键统一使用现有 `feature`、`layout`、`gridType`、`cols` 和 `copybookType`。
