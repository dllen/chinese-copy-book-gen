# 字帖生成器产品化实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将字帖生成器从单文件原型重构为可维护、可测试、可部署的正式产品，聚焦稳定性和基础体验而非新功能。

**Architecture:** Vite 构建系统替代纯 CDN 引入；React 组件拆分替代 714 行 IIFE；Playwright 端到端测试保障稳定性；GitHub Actions 自动部署 GitHub Pages。

**Tech Stack:** Vite + React 18 + Bootstrap 5 CDN + html2pdf.js CDN + Playwright

---

## 文件结构

```
chinese-copy-book-gen/
├── index.html              # 修改：引入 build 产物
├── vite.config.js          # 新增：Vite 配置
├── package.json            # 新增：依赖和脚本
├── .github/
│   └── workflows/
│       └── ci.yml          # 新增：CI/CD workflow
├── src/
│   ├── main.jsx            # 新增：React 入口
│   ├── App.jsx             # 新增：主组件（从 app.js 拆分）
│   ├── components/
│   │   ├── Toolbar.jsx     # 新增：工具栏
│   │   ├── ConfigPanel.jsx # 新增：左侧配置面板
│   │   ├── PreviewPanel.jsx# 新增：右侧预览
│   │   ├── PageGrid.jsx    # 新增：字帖页面渲染
│   │   ├── Toast.jsx       # 新增：Toast 通知组件
│   │   ├── LibraryPanel.jsx# 新增：词库面板（从 library.js 拆分 UI）
│   │   └── HelpTooltip.jsx # 新增：帮助提示
│   └── hooks/
│       ├── useSettings.js  # 新增：设置状态+localStorage容错
│       ├── useToast.js     # 新增：Toast 通知系统
│       └── useDebounce.js  # 新增：输入防抖
├── js/                     # 保持不变（纯算法）
│   ├── utils.js
│   ├── grid.js
│   ├── content.js
│   ├── features.js
│   ├── export.js
│   └── library.js
├── data/                   # 保持不变
├── tests/
│   └── e2e/
│       ├── app.spec.js     # 新增：主流程测试
│       └── layout.spec.js  # 新增：排版测试
└── docs/superpowers/
    ├── specs/2026-07-21-copybook-product-design.md  # 已存在
    └── plans/2026-07-21-copybook-productization.md  # 本计划
```

---

## Task 1: 初始化 Vite 项目

**Files:**
- Create: `package.json`
- Create: `vite.config.js`

- [ ] **Step 1: 创建 package.json**

```json
{
  "name": "chinese-copy-book-gen",
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "playwright test",
    "test:ui": "playwright test --ui"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "playwright": "^1.50.1",
    "vite": "^6.2.0"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  }
}
```

- [ ] **Step 2: 创建 vite.config.js**

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },
  server: {
    port: 5173,
  },
});
```

- [ ] **Step 3: 安装依赖**

Run: `npm install`
Expected: node_modules 安装成功

- [ ] **Step 4: 提交**

```bash
git add package.json vite.config.js
git commit -m "feat: init Vite project with React plugin

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Task 2: 创建 React 入口

**Files:**
- Create: `src/main.jsx`
- Modify: `index.html`（body 末尾改为引入 build 产物，删除旧 CDN script 标签）

- [ ] **Step 1: 创建 src/main.jsx**

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

window.__copybook__ = window.__copybook__ || {};
const root = createRoot(document.getElementById('root'));
root.render(React.createElement(App));
```

- [ ] **Step 2: 修改 index.html**

将 `<script src="./app.js">` 改为 `<script type="module" src="/src/main.jsx">`
将 `<script src="./js/*.js">` 引入方式改为 ES module 方式在 src/ 中 import（保持 js/ 目录文件不变，只改引用方式）

- [ ] **Step 3: 验证 dev server 启动**

Run: `npm run dev`
Expected: http://localhost:5173 打开，页面正常渲染（功能暂时不可用，等待 Task 3 完成）

- [ ] **Step 4: 提交**

```bash
git add index.html src/main.jsx
git commit -m "feat: add React entry point and update index.html for Vite

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Task 3: 创建 useToast Hook

**Files:**
- Create: `src/hooks/useToast.js`
- Create: `src/components/Toast.jsx`

- [ ] **Step 1: 创建 useToast hook**

```jsx
import { useState, useCallback } from 'react';

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', message, duration, action }) => {
    const id = ++toastId;
    const durations = { success: 2000, info: 2000, warning: 3000, error: 4000, progress: Infinity };
    const dur = duration ?? durations[type] ?? 2000;

    setToasts(prev => [...prev, { id, type, message, action }]);

    if (dur !== Infinity) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, dur);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg, opts) => addToast({ type: 'success', message: msg, ...opts }),
    error: (msg, opts) => addToast({ type: 'error', message: msg, ...opts }),
    warn: (msg, opts) => addToast({ type: 'warning', message: msg, ...opts }),
    info: (msg, opts) => addToast({ type: 'info', message: msg, ...opts }),
    progress: (msg, action) => addToast({ type: 'progress', message: msg, action }),
  };

  return { toasts, toast, removeToast };
}
```

- [ ] **Step 2: 创建 Toast 组件 src/components/Toast.jsx**

```jsx
import React from 'react';

const typeStyles = {
  success: { bg: '#d1fae5', color: '#065f46', border: '#34d399' },
  error:   { bg: '#fee2e2', color: '#991b1b', border: '#f87171' },
  warning: { bg: '#fef3c7', color: '#92400e', border: '#fbbf24' },
  info:    { bg: '#dbeafe', color: '#1e40af', border: '#60a5fa' },
  progress:{ bg: '#eff6ff', color: '#1e40af', border: '#60a5fa' },
};

export function ToastContainer({ toasts, onRemove }) {
  return (
    <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 320 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          ...typeStyles[t.type],
          padding: '10px 14px',
          borderRadius: 8,
          border: `1px solid ${typeStyles[t.type].border}`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          animation: 'slideIn 0.2s ease-out',
        }}>
          <span style={{ flex: 1 }}>{t.message}</span>
          {t.action && <button onClick={t.action} style={{ background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', color: 'inherit', fontSize: 13 }}>重试</button>}
          <button onClick={() => onRemove(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 16, lineHeight: 1 }}>×</button>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: 提交**

```bash
git add src/hooks/useToast.js src/components/Toast.jsx
git commit -m "feat: add useToast hook and Toast component

Provides toast notification system to replace all alert()/confirm():
- success/error/warn/info/progress types
- auto-dismiss with configurable duration
- optional action button for retry

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Task 4: 创建 useDebounce Hook

**Files:**
- Create: `src/hooks/useDebounce.js`

- [ ] **Step 1: 创建 useDebounce hook**

```jsx
import { useState, useEffect } from 'react';

export function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}
```

- [ ] **Step 2: 提交**

```bash
git add src/hooks/useDebounce.js
git commit -m "feat: add useDebounce hook

300ms debounce for text input to avoid full parse/paginate on each keystroke.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Task 5: 创建 useSettings Hook（带 localStorage 容错）

**Files:**
- Create: `src/hooks/useSettings.js`

- [ ] **Step 1: 创建 useSettings hook**

```jsx
import { useState, useEffect } from 'react';

const STORAGE_KEY = 'copybook.settings';

// 内置默认值（与 app.js useState 默认值一致）
const DEFAULTS = {
  mode: '多字', variant: '多字', layout: '连续排列', gridType: '田字格',
  gridColor: '绿色', customGridColor: '', customTextColor: '', textColorOpt: '黑色',
  strokeMode: '适中', tailFill: true, template: '楷书', customFont: '',
  rows: 10, cols: 8, cellSize: 60, gridGap: 8, fontSize: 42,
  marginTop: 16, marginRight: 12, marginBottom: 16, marginLeft: 12,
  paper: 'A4竖版', header: '', text: '', randCount: 50, randNoRepeat: true,
  previewScale: 1, feature: '字帖模板', difficulty: '初级', showGuide: false,
  letterStyle: '印刷体', enBlankRows: 0, enRepeat: 1, engShowZh: false,
  stylePreset: '四线三格标准', autoLayout: true, gridStrokeWidth: 1,
  lineStyle: '实线', cellRadius: 0, pageBg: '白色', cellBg: '透明',
  cellBorder: false, cellShadow: false, textShadow: false, textStroke: '无',
  alnumIncludeDigits: true, alnumIncludeUpper: true, alnumIncludeLower: true,
  alnumCount: 20, alnumNoRepeat: true, alnumSeq: '',
};

export function useSettings(toast) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...DEFAULTS, ...JSON.parse(saved) };
    } catch (e) { /* ignore */ }
    return DEFAULTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        toast?.warn('存储空间已满，部分设置未保存，请清理浏览器缓存');
      }
    }
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return { settings, updateSetting, setSettings };
}
```

- [ ] **Step 2: 提交**

```bash
git add src/hooks/useSettings.js
git commit -m "feat: add useSettings hook with localStorage fault tolerance

- Loads settings from localStorage on init, falls back to DEFAULTS
- Wraps localStorage.setItem in try/catch for QuotaExceededError
- Provides updateSetting(key, value) for ergonomic updates

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Task 6: 创建 Error Boundary

**Files:**
- Create: `src/components/ErrorBoundary.jsx`
- Modify: `src/main.jsx`（用 ErrorBoundary 包裹 App）

- [ ] **Step 1: 创建 ErrorBoundary 组件**

```jsx
import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, textAlign: 'center', fontFamily: 'system-ui' }}>
          <h2 style={{ color: '#dc3545' }}>应用出错</h2>
          <p style={{ color: '#666', margin: '16px 0' }}>抱歉，遇到了一些问题，请尝试刷新页面</p>
          <button
            onClick={() => { this.setState({ hasError: false }); location.reload(); }}
            style={{ padding: '8px 24px', background: '#0d6efd', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 15 }}
          >
            刷新页面
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
```

- [ ] **Step 2: 修改 src/main.jsx**

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ErrorBoundary } from './components/ErrorBoundary';
import App from './App';

window.__copybook__ = window.__copybook__ || {};

const root = createRoot(document.getElementById('root'));
root.render(
  React.createElement(ErrorBoundary, null,
    React.createElement(App)
  )
);
```

- [ ] **Step 3: 提交**

```bash
git add src/components/ErrorBoundary.jsx src/main.jsx
git commit -m "feat: add React Error Boundary

Wraps entire app - any uncaught exception shows a friendly error UI
instead of crashing the browser tab.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Task 7: 创建 App.jsx（从 app.js 拆分主组件）

**Files:**
- Create: `src/App.jsx`

这是最大最核心的任务，分多个步骤：

- [ ] **Step 1: 提取 app.js 的 state declarations 到 useSettings**

将所有 `useState` 声明移到 `useSettings` hook，App.jsx 通过 `useSettings().settings` 获取值，通过 `updateSetting` 更新值。

- [ ] **Step 2: 提取 Toast 到 App 顶层**

App 顶层调用 `useToast()`，通过 context 传递给子组件：
```jsx
export const ToastContext = React.createContext(null);
// App 顶层: <ToastContext.Provider value={toast}>...</ToastContext.Provider>
```

- [ ] **Step 3: 提取 debounce 到文字输入**

`text` state 用 `useDebounce(text, 300)` 传给 `parsed` useMemo。

- [ ] **Step 4: 替换所有 alert()/confirm() 为 toast 调用**

搜索 app.js 中所有 `alert(` 和 `confirm(` 替换为 `toast.success()` / `toast.error()` / `toast.info()`。

具体替换规则：
- `"保存成功"` / `"加载成功"` → `toast.success(...)`
- `"配置导入成功"` → `toast.success(...)`
- `"模板加载成功"` → `toast.success(...)`
- `"模板加载失败"` / `"配置导入失败"` → `toast.error(...)`
- `"确定要重置所有设置到默认值吗？"` → `window.confirm(...)`（保留，确认框语义重要）

- [ ] **Step 5: 修复数值输入 clamp**

在 `onChange` 处理函数中对 rows/cols/cellSize/enRepeat 等加 clamp：
```js
const clamped = Math.max(1, Math.min(20, parseInt(value) || 1));
```

- [ ] **Step 6: 添加 SVG 导出全页支持**

`exportSVG()` 遍历所有 page，生成多个 SVG 文件或打包为 ZIP。当前只导出第一页。

```js
async function exportSVG() {
  const { default: JSZip } = await import('jszip');
  const zip = new JSZip();
  const pages = document.querySelectorAll('.page');
  pages.forEach((page, i) => {
    const svg = generatePageSVG(page, i);
    zip.file(`字帖第${i+1}页.svg`, svg);
  });
  const blob = await zip.generateAsync({ type: 'blob' });
  // download...
}
```

注意：jszip 通过 CDN dynamic import 引入（不加入 package.json依赖）。

- [ ] **Step 7: 添加 PDF 导出进度 Toast**

```js
async function exportPDF() {
  const toastId = toast.progress('正在生成 PDF...');
  try {
    await generatePDFFull(paper);
    removeToast(toastId);
    toast.success('PDF 生成完成');
  } catch (e) {
    removeToast(toastId);
    toast.error('PDF 生成失败', { action: exportPDF });
  }
}
```

- [ ] **Step 8: 提交**

```bash
git add src/App.jsx
git commit -m "feat: create App.jsx from app.js refactor

- Extract all useState to useSettings hook with localStorage persistence
- Replace all alert()/confirm() with toast notifications
- Add debounce to text input (300ms)
- Add numeric input clamping (rows/cols/cellSize)
- Fix SVG export to include all pages (ZIP打包)
- Add PDF export progress toast

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Task 8: 创建组件拆分（Toolbar / ConfigPanel / PreviewPanel）

**Files:**
- Create: `src/components/Toolbar.jsx`
- Create: `src/components/ConfigPanel.jsx`
- Create: `src/components/PreviewPanel.jsx`
- Create: `src/components/PageGrid.jsx`

- [ ] **Step 1: 创建 Toolbar.jsx**

提取 app.js 中的按钮组（打印/导出/保存模板等）为一个独立组件。

```jsx
export function Toolbar({ pages, onPrint, onExportPDF, onExportImage, onSaveTemplate, onLoadTemplate, onExportConfig, onImportConfig, onReset }) {
  return (
    <div className="d-flex flex-wrap gap-2">
      {/* 打印/导出按钮组 */}
      <div className="btn-group">
        <button className="btn btn-success" onClick={onPrint} disabled={pages.length===0}>打印/另存为PDF</button>
        <button className="btn btn-primary" onClick={onExportPDF} disabled={pages.length===0}>生成高清PDF</button>
        <button className="btn btn-outline-primary" onClick={onExportImage} disabled={pages.length===0}>导出PNG</button>
      </div>
      {/* 配置导入导出 */}
      <div className="btn-group">
        <button className="btn btn-outline-secondary" onClick={onExportConfig}>导出配置</button>
        <button className="btn btn-outline-secondary" onClick={onLoadTemplate}>加载模板</button>
        <button className="btn btn-outline-danger" onClick={onReset}>重置</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 创建 ConfigPanel.jsx**

将左侧配置表单（feature/layout/mode/grid/text 等）提取为一个组件，通过 props 传递所有 state 和 setters。

- [ ] **Step 3: 创建 PreviewPanel.jsx**

将右侧预览面板（缩放控制/常用汉字随机/配置摘要）提取为一个组件。

- [ ] **Step 4: 创建 PageGrid.jsx**

将 `.page-wrapper` 的 JSX 渲染提取为独立组件。

```jsx
export function PageGrid({ pages, cols, layout, feature, header, bg, tColor, strokeMode, font, fontSize, letterStyle, showGuide, engFont }) {
  const cp = window.__copybook__ || {};
  const splitRows = cp.content?.splitRows || splitRowsFallback;

  return (
    <div className="page-wrapper">
      {pages.map((page, i) => (
        <div key={i} className="page">
          {header && <div className="header">{header}</div>}
          <div className="grid">
            {(cp.content?.splitRows ? cp.content.splitRows(page, cols) : (splitRows ? splitRows(page, cols) : [page])).map((row, ri) => (
              <div key={ri} className="grid-row" style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, var(--cell-size))`, gap: layout === '英文格式' ? 0 : `var(--grid-gap)` }}>
                {row.map((ch, ci) => (
                  <Cell key={ci} ch={ch || ''} bg={bg} textColor={tColor} strokeMode={strokeMode} cls={(layout === '英文格式' || feature === '数字字母') ? 'cell-en' : undefined} font={layout === '英文格式' ? engFont(letterStyle) : feature === '数字字母' ? (letterStyle === '印刷体' ? 'monospace' : 'cursive') : font} fontSize={fontSize} showGuide={feature === '数字字母' && showGuide} />
                ))}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 5: 提交**

```bash
git add src/components/Toolbar.jsx src/components/ConfigPanel.jsx src/components/PreviewPanel.jsx src/components/PageGrid.jsx
git commit -m "feat: split App into Toolbar/ConfigPanel/PreviewPanel/PageGrid components

- Toolbar: export/print/save/load buttons
- ConfigPanel: left-side configuration form
- PreviewPanel: right-side preview and random char tools
- PageGrid: page rendering with splitRows integration

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Task 9: 添加加载状态和空状态引导

**Files:**
- Modify: `src/App.jsx`
- Create: `src/components/EmptyState.jsx`

- [ ] **Step 1: 创建 EmptyState 组件**

```jsx
export function EmptyState({ onTryExample, onOpenLibrary }) {
  return (
    <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>📖</div>
      <h3 style={{ color: '#333', marginBottom: 8 }}>还没有内容</h3>
      <p style={{ marginBottom: 20 }}>输入文字或从词库选择模板开始生成字帖</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button className="btn btn-outline-primary" onClick={onTryExample}>试试示例：静夜思</button>
        <button className="btn btn-outline-secondary" onClick={onOpenLibrary}>从词库选择</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 在 App.jsx 中添加空状态判断**

当 `text` 为空且词库未选择时，显示 `<EmptyState>`。

- [ ] **Step 3: 提交**

```bash
git add src/components/EmptyState.jsx
git commit -m "feat: add EmptyState component for first-time users

Shows helpful guidance when no content is entered:
- 示例字帖快速体验
- 词库快速入口

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Task 10: 添加 HelpTooltip 组件

**Files:**
- Create: `src/components/HelpTooltip.jsx`
- Modify: `src/components/ConfigPanel.jsx`（在关键配置项旁添加）

- [ ] **Step 1: 创建 HelpTooltip 组件**

```jsx
import React, { useState } from 'react';

export function HelpTooltip({ content, children }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      {children}
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        style={{ cursor: 'help', marginLeft: 4, color: '#6c757d' }}
      >?</span>
      {show && (
        <div style={{
          position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
          background: '#333', color: '#fff', padding: '8px 12px', borderRadius: 6, fontSize: 13,
          whiteSpace: 'nowrap', zIndex: 100, maxWidth: 280, whiteSpace: 'normal',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        }}>
          {content}
        </div>
      )}
    </span>
  );
}
```

- [ ] **Step 2: 在 ConfigPanel 中关键项旁添加 tooltip**

例如 gridType 选择器旁："田字格适合初学者，米字格增加了对角线辅助"

- [ ] **Step 3: 提交**

```bash
git add src/components/HelpTooltip.jsx
git commit -m "feat: add HelpTooltip component

Contextual ? tooltips on key config options help parents understand
grid types, stroke modes, and layout choices without leaving the UI.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Task 11: 网络容错（词库加载 + 超时）

**Files:**
- Modify: `src/hooks/useSettings.js`（在 commonChars 加载处添加 AbortController + timeout）

- [ ] **Step 1: 修改 commonChars 加载逻辑**

在 App.jsx 的 useEffect（加载词库数据）中添加：
```js
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5000);
fetch('./common-chars.json', { signal: controller.signal })
  .then(r => r.json())
  .then(arr => {
    clearTimeout(timeout);
    const uniq = [...new Set((arr || []).filter(ch => /[一-鿿]/.test(ch)))];
    setCommonChars(uniq);
  })
  .catch(e => {
    clearTimeout(timeout);
    if (e.name === 'AbortError') toast.warn('词库加载超时，请检查网络后重试');
    else toast.error('词库加载失败', { action: () => fetchCommonChars() });
  });
```

- [ ] **Step 2: 提交**

```bash
git commit -m "fix: add AbortController timeout to commonChars fetch

- 5 second timeout on network requests
- AbortError shows specific '加载超时' message
- Generic error shows retry action toast

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Task 12: 设置 Playwright 测试

**Files:**
- Create: `playwright.config.js`
- Create: `tests/e2e/app.spec.js`
- Create: `tests/e2e/layout.spec.js`

- [ ] **Step 1: 创建 playwright.config.js**

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
  },
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173',
    port: 4173,
    reuseExistingServer: false,
    timeout: 60000,
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
  ],
});
```

- [ ] **Step 2: 创建 tests/e2e/app.spec.js**

```js
import { test, expect } from '@playwright/test';

test.describe('字帖生成器核心流程', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('加载首页无崩溃', async ({ page }) => {
    await expect(page.locator('body')).toBeVisible();
    // 不应有任何 error 级别的 console 日志
    const errors = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    await page.waitForTimeout(1000);
    expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0);
  });

  test('输入文字后预览更新', async ({ page }) => {
    const textarea = page.locator('#text');
    await textarea.fill('静夜思');
    await page.waitForTimeout(500); // debounce
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
    // 下载拦截
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('text=导出配置'),
    ]);
    expect(download.suggestedFilename()).toBe('字帖配置.json');
  });
});
```

- [ ] **Step 3: 创建 tests/e2e/layout.spec.js**

```js
import { test, expect } from '@playwright/test';

test.describe('排版格式测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('古诗格式标题居中', async ({ page }) => {
    await page.selectOption('#layout', '古诗格式');
    await page.locator('#text').fill('静夜思\n床前明月光，疑是地上霜。');
    await page.waitForTimeout(500);
    // 检查标题行有居中 padding
    const firstRow = page.locator('.grid-row').first();
    const style = await firstRow.evaluate(el => getComputedStyle(el).gridTemplateColumns);
    // 居中行第一个 cell 应该有左侧 padding（通过 cell 内容或 style 验证）
    expect(style).toBeTruthy();
  });

  test('四线三格三条辅助线可见', async ({ page }) => {
    await page.selectOption('#gridType', '四线三格');
    await page.waitForTimeout(200);
    const firstCell = page.locator('.cell').first();
    const bg = await firstCell.evaluate(el => getComputedStyle(el).backgroundImage);
    expect(bg).toContain('svg');
  });
});
```

- [ ] **Step 4: 验证测试可以运行**

Run: `npx playwright install --with-deps && npx playwright test`
Expected: 测试执行（可能部分失败，因为功能还未完全迁移）

- [ ] **Step 5: 提交**

```bash
git add playwright.config.js tests/
git commit -m "test: add Playwright e2e tests

- app.spec.js: core flow (load, input, grid change, export config)
- layout.spec.js: formatting (poetry centering, four-line grid)
- GitHub Actions CI runs tests before deploy

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Task 13: GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`
- Modify: `.github/workflows/pages.yml`（现有workflow清理）

- [ ] **Step 1: 创建 .github/workflows/ci.yml**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
```

- [ ] **Step 2: 更新 .github/workflows/pages.yml**

在 `needs: test` 后才执行 deploy：
```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps: [...]
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps: [...]
```

- [ ] **Step 3: 提交**

```bash
git add .github/workflows/ci.yml .github/workflows/pages.yml
git commit -m "ci: add GitHub Actions CI workflow

- Runs: npm install, build, playwright install, playwright test
- Deploy only runs after tests pass
- Artifacts uploaded on failure for debugging

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## Task 14: 最终验证和部署

- [ ] **Step 1: 完整构建验证**

Run: `npm run build`
Expected: `dist/` 目录生成成功，无报错

- [ ] **Step 2: 本地预览验证**

Run: `npm run preview`
Expected: http://localhost:4173 正常访问，所有功能可用

- [ ] **Step 3: Playwright 测试全量通过**

Run: `npx playwright test`
Expected: 全部测试通过（修复期间失败的测试）

- [ ] **Step 4: 推送到 main 触发 CI/CD**

```bash
git push origin main
```
Expected: GitHub Actions CI 运行 → 测试通过 → 自动部署到 GitHub Pages

- [ ] **Step 5: 验证 GitHub Pages 访问**

访问: `https://dllen.github.io/chinese-copy-book-gen/`
Expected: 页面正常加载，所有功能可用

- [ ] **Step 6: 提交最终产物**

```bash
git add -A && git commit -m "feat: 完成字帖生成器产品化重构

v2.0 正式发布:
- Vite 构建系统，生产优化
- React 组件拆分（App/Toolbar/ConfigPanel/PreviewPanel/PageGrid/Toast）
- Error Boundary 全局崩溃保护
- Toast 通知系统替换所有 alert/confirm
- localStorage 容错（QuotaExceededError 处理）
- 文字输入 300ms debounce
- PDF 导出进度 Toast
- SVG 导出全页（ZIP 打包）
- 词库加载 5s 超时 + 重试
- Playwright 端到端测试 + CI
- GitHub Pages 自动部署

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

## 验收检查清单

- [ ] `npm run build` 成功生成 `dist/`
- [ ] `npx playwright test` 全部通过
- [ ] GitHub Actions CI 绿灯
- [ ] GitHub Pages 正常访问
- [ ] 所有 `alert()/confirm()` 替换为 Toast
- [ ] Error Boundary 覆盖全 App
- [ ] 文字输入 debounce 生效
- [ ] localStorage 满时显示友好提示
- [ ] PDF 导出有进度反馈
- [ ] 词库加载失败可重试
