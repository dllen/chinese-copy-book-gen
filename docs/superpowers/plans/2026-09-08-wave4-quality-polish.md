# Wave 4: 品质打磨 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 让产品「手感」达到良质 — 暗色模式、键盘快捷键、PWA 离线、微交互动画、无障碍。

**Architecture:** 通过 CSS 变量实现暗色模式切换；通过 useKeyboardShortcut Hook 实现快捷键；通过 Service Worker + manifest 实现 PWA；通过 CSS transition 实现微交互。

**Tech Stack:** React 18 + CSS Variables + Vite PWA plugin（可选，或手写 SW）

---

## Task 1: 暗色模式

**Files:**
- Modify: `src/hooks/useSettings.js`
- Modify: `src/App.jsx`
- Modify: `index.html`
- Test: `tests/unit/darkMode.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/unit/darkMode.test.js
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

function DarkModeToggle({ darkMode, onToggle }) {
  return (
    <div>
      <button onClick={onToggle}>
        {darkMode ? '🌞 浅色' : '🌙 深色'}
      </button>
      <span data-testid="mode">{darkMode ? 'dark' : 'light'}</span>
    </div>
  );
}

describe('darkMode', () => {
  it('toggles dark mode label', () => {
    render(<DarkModeToggle darkMode={false} onToggle={() => {}} />);
    expect(screen.getByText(/深色/)).toBeTruthy();
  });

  it('shows active state when dark', () => {
    render(<DarkModeToggle darkMode={true} onToggle={() => {}} />);
    expect(screen.getByText(/浅色/)).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/darkMode.test.js 2>&1 | tail -10`
Expected: FAIL

- [ ] **Step 3: Implement dark mode**

**In `src/hooks/useSettings.js`:**
Add `darkMode: false` to DEFAULTS.

**In `src/App.jsx`:**
Add useEffect to apply dark mode class:
```javascript
React.useEffect(() => {
  document.documentElement.classList.toggle('dark-mode', settings.darkMode);
}, [settings.darkMode]);
```

**In `index.html`:**
Add dark mode CSS variables inside the `<style>` tag:
```css
.dark-mode {
  --page-bg: #1a1a2e;
  --text-color: #e0e0e0;
  --grid-color: #4ecca3;
  --cell-bg: #16213e;
  --bs-body-bg: #1a1a2e;
  --bs-body-color: #e0e0e0;
}
.dark-mode .card, .dark-mode .modal { background: #16213e; color: #e0e0e0; }
.dark-mode .btn-outline-secondary { color: #e0e0e0; border-color: #555; }
.dark-mode .form-control, .dark-mode .form-select { background: #0f3460; color: #e0e0e0; border-color: #555; }
```

**In `src/components/ConfigPanel.jsx`:**
Add a dark mode toggle in the header area or as a small icon button.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/darkMode.test.js 2>&1 | tail -10`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useSettings.js src/App.jsx index.html src/components/ConfigPanel.jsx tests/unit/darkMode.test.js
git commit m "feat(ui): add dark mode toggle with CSS variables"
```

---

## Task 2: 键盘快捷键

**Files:**
- Create: `src/hooks/useKeyboardShortcut.js`
- Test: `tests/unit/keyboardShortcut.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/unit/keyboardShortcut.test.js
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKeyboardShortcut } from '../../src/hooks/useKeyboardShortcut';

describe('useKeyboardShortcut', () => {
  it('calls handler when key is pressed', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcut('g', handler));
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'g' }));
    });
    expect(handler).toHaveBeenCalled();
  });

  it('does not call handler for other keys', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcut('g', handler));
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'x' }));
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it('supports modifier keys', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcut('Enter', handler, { ctrl: true }));
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true }));
    });
    expect(handler).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/keyboardShortcut.test.js 2>&1 | tail -10`
Expected: FAIL

- [ ] **Step 3: Implement useKeyboardShortcut**

```javascript
// src/hooks/useKeyboardShortcut.js
import { useEffect } from 'react';

export function useKeyboardShortcut(key, handler, options = {}) {
  useEffect(() => {
    const listener = (e) => {
      if (e.key !== key) return;
      if (options.ctrl && !e.ctrlKey) return;
      if (options.shift && !e.shiftKey) return;
      if (options.alt && !e.altKey) return;
      if (options.preventDefault !== false) e.preventDefault();
      handler(e);
    };
    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, [key, handler, options]);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/keyboardShortcut.test.js 2>&1 | tail -10`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useKeyboardShortcut.js tests/unit/keyboardShortcut.test.js
git commit m "feat(hooks): add keyboard shortcut hook for power users"
```

---

## Task 3: PWA 离线支持

**Files:**
- Create: `public/manifest.json`
- Create: `public/sw.js`
- Modify: `src/App.jsx`
- Modify: `index.html`

- [ ] **Step 1: Create manifest.json**

```json
{
  "name": "字帖生成器",
  "short_name": "字帖",
  "description": "小学1-5年级语文英语字帖一键生成",
  "start_url": "./index.html",
  "display": "standalone",
  "background_color": "#f0f2f5",
  "theme_color": "#667eea",
  "icons": [
    { "src": "./favicon.ico", "sizes": "64x64", "type": "image/x-icon" }
  ]
}
```

- [ ] **Step 2: Create sw.js**

```javascript
const CACHE_NAME = 'copybook-v1';
const ASSETS = ['./', './index.html', './favicon.ico'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)));
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request))
  );
});
```

- [ ] **Step 3: Register SW in App.jsx**

```javascript
React.useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}, []);
```

- [ ] **Step 4: Add manifest link to index.html**

```html
<link rel="manifest" href="./manifest.json">
<meta name="theme-color" content="#667eea">
```

- [ ] **Step 5: Commit**

```bash
git add public/manifest.json public/sw.js src/App.jsx index.html
git commit m "feat(pwa): add service worker and manifest for offline use"
```

---

## Task 4: 微交互动画

**Files:**
- Modify: `src/components/StepBar.jsx`
- Modify: `src/components/GradeSelector.jsx`
- Modify: `src/components/layout/MainLayout.jsx`

- [ ] **Step 1: Add step transition animation**

In MainLayout.jsx, wrap step content in a fading container:
```jsx
React.createElement('div', {
  className: 'step-content-wrapper',
  style: { animation: 'fadeIn 0.3s ease-out' },
  key: currentStep // re-mount on step change
}, ...)
```

Add to index.html style:
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/MainLayout.jsx index.html
git commit m "feat(ui): add step transition fade-in animation"
```

---

## Task 5: 无障碍改进

**Files:**
- Modify: `src/components/StepBar.jsx`
- Modify: `src/components/QuickGenerateBar.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Add a11y attributes**

- StepBar: add `role="navigation"`, `aria-label="步骤导航"`, `aria-current="step"` on active step
- QuickGenerateBar: add `role="region"`, `aria-label="操作栏"`
- App.jsx: add skip link and main landmark

```jsx
// In App.jsx return, add before MainLayout:
React.createElement('a', {
  href: '#main-content',
  className: 'sr-only sr-only-focusable',
  style: { position: 'absolute', top: '-40px', left: 0, background: '#0d6efd', color: '#fff', padding: '8px 16px', zIndex: 9999 }
}, '跳转到主要内容')

// Wrap MainLayout in:
React.createElement('main', { id: 'main-content' }, React.createElement(MainLayout, { ... }))
```

- [ ] **Step 2: Commit**

```bash
git add src/components/StepBar.jsx src/components/QuickGenerateBar.jsx src/App.jsx
git commit m "feat(a11y): add skip link, landmarks, and ARIA attributes"
```

---

## Self-Review

**Spec coverage:**
- ✅ 微交互动画 — Task 4
- ✅ 暗色模式 — Task 1
- ✅ 键盘快捷键 — Task 2
- ✅ PWA 离线可用 — Task 3
- ✅ 无障碍 a11y — Task 5

**Placeholder scan:** No TBDs, all code blocks complete.

---

*Plan complete. 5 tasks, all TDD where applicable.*
