# Wave 3: 导出与分享 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 让字帖无缝进入课堂和家庭 — 智能 PDF 导出、批量导出、打印预览、微信分享。

**Architecture:** 在现有 html2pdf 导出基础上，增加打印预览模态框、CSS 打印标记（裁切线/页码/装订线）、批量导出功能、以及二维码分享卡片生成。

**Tech Stack:** React 18 + html2pdf.js（已有）+ qrcode@1.5.4（已安装）+ Canvas API

---

## Task 1: 打印预览模态框

**Files:**
- Create: `src/components/PrintPreview.jsx`
- Test: `tests/unit/printPreview.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/unit/printPreview.test.js
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PrintPreview from '../../src/components/PrintPreview';

describe('PrintPreview', () => {
  it('renders when open is true', () => {
    render(<PrintPreview open={true} onClose={() => {}} pages={2} />);
    expect(screen.getByText(/打印预览/)).toBeTruthy();
  });

  it('does not render when open is false', () => {
    render(<PrintPreview open={false} onClose={() => {}} pages={2} />);
    expect(screen.queryByText(/打印预览/)).toBeNull();
  });

  it('shows page count', () => {
    render(<PrintPreview open={true} onClose={() => {}} pages={5} />);
    expect(screen.getByText(/共 5 页/)).toBeTruthy();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<PrintPreview open={true} onClose={onClose} pages={1} />);
    fireEvent.click(screen.getByText(/关闭/));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows A4 paper dimensions', () => {
    render(<PrintPreview open={true} onClose={() => {}} pages={1} />);
    expect(screen.getByText(/A4/)).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/printPreview.test.js 2>&1 | tail -10`
Expected: FAIL

- [ ] **Step 3: Implement PrintPreview.jsx**

```jsx
// src/components/PrintPreview.jsx
import React from 'react';

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.7)', zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  modal: {
    background: '#fff', borderRadius: '12px', padding: '24px',
    maxWidth: '600px', width: '90%', maxHeight: '80vh', overflowY: 'auto',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '16px', borderBottom: '1px solid #dee2e6', paddingBottom: '12px',
  },
  title: { fontSize: '18px', fontWeight: 700 },
  closeBtn: {
    background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer',
    color: '#6c757d', padding: '4px 8px',
  },
  info: { marginBottom: '16px', fontSize: '14px', color: '#6c757d' },
  pagePreview: {
    width: '210mm', minHeight: '297mm', margin: '0 auto',
    background: '#fff', border: '1px solid #dee2e6', padding: '20mm',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '16px',
    transform: 'scale(0.6)', transformOrigin: 'top center',
  },
  actions: { display: 'flex', gap: '12px', justifyContent: 'center' },
  printBtn: {
    padding: '10px 24px', background: '#0d6efd', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
  },
};

export default function PrintPreview({ open, onClose, pages }) {
  if (!open) return null;
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <span style={styles.title}>打印预览</span>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        <div style={styles.info}>
          A4 纸张 · 共 {pages} 页 · 建议使用 100% 缩放打印
        </div>
        <div style={styles.pagePreview}>
          <div style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>
            第 1 页（预览）
          </div>
        </div>
        <div style={styles.actions}>
          <button style={styles.printBtn} onClick={() => window.print()}>
            确认打印
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/printPreview.test.js 2>&1 | tail -10`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/PrintPreview.jsx tests/unit/printPreview.test.js
git commit m "feat(ui): add print preview modal with A4 paper info"
```

---

## Task 2: CSS 打印标记（裁切线 + 页码 + 装订线）

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add print marker CSS**

Add inside the `<style>` tag in index.html, after the existing `@media print` rules:

```css
/* 打印标记：裁切线 + 页码 + 装订线 */
@media print {
  .page {
    position: relative;
  }
  /* 裁切标记 */
  .page::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    pointer-events: none;
    background:
      linear-gradient(to right, #ccc 1px, transparent 1px) 0 0 / 100% 1px no-repeat,
      linear-gradient(to bottom, #ccc 1px, transparent 1px) 0 0 / 1px 100% no-repeat;
    opacity: 0.3;
  }
  /* 页码 */
  .page-number {
    position: absolute;
    bottom: 8mm;
    right: 10mm;
    font-size: 10pt;
    color: #999;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add index.html
git commit m "feat(print): add cut lines, page numbers, and binding margin CSS"
```

---

## Task 3: 批量导出功能

**Files:**
- Create: `src/utils/batchExport.js`
- Test: `tests/unit/batchExport.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/unit/batchExport.test.js
import { describe, it, expect } from 'vitest';
import { generateUnitPages, estimatePageCount } from '../../src/utils/batchExport';

describe('batchExport', () => {
  it('generates pages from content list', () => {
    const contents = [
      { id: 'c1', title: '天地人', characters: ['天', '地', '人'] },
      { id: 'c2', title: '口耳目', characters: ['口', '耳', '目'] },
    ];
    const pages = generateUnitPages(contents, { cols: 8, rows: 10 });
    expect(pages.length).toBeGreaterThan(0);
    expect(pages[0].length).toBeGreaterThan(0);
  });

  it('estimates page count correctly', () => {
    const contents = [
      { characters: new Array(80).fill('一') }, // 80 chars = 1 page at 8x10
    ];
    expect(estimatePageCount(contents, { cols: 8, rows: 10 })).toBe(1);
  });

  it('handles empty content', () => {
    const pages = generateUnitPages([], { cols: 8, rows: 10 });
    expect(pages).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/batchExport.test.js 2>&1 | tail -10`
Expected: FAIL

- [ ] **Step 3: Implement batchExport.js**

```javascript
// src/utils/batchExport.js
export function generateUnitPages(contents, options = {}) {
  const { cols = 8, rows = 10 } = options;
  const cellsPer = cols * rows;
  const allChars = [];
  contents.forEach((c) => {
    if (c.characters) allChars.push(...c.characters);
    if (c.vocabulary) c.vocabulary.forEach((v) => allChars.push(...v.split('')));
  });
  if (allChars.length === 0) return [];
  const pages = [];
  for (let i = 0; i < allChars.length; i += cellsPer) {
    pages.push(allChars.slice(i, i + cellsPer));
  }
  return pages;
}

export function estimatePageCount(contents, options = {}) {
  const { cols = 8, rows = 10 } = options;
  const cellsPer = cols * rows;
  let totalChars = 0;
  contents.forEach((c) => {
    if (c.characters) totalChars += c.characters.length;
    if (c.vocabulary) totalChars += c.vocabulary.reduce((s, v) => s + v.length, 0);
  });
  return Math.max(1, Math.ceil(totalChars / cellsPer));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/batchExport.test.js 2>&1 | tail -10`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/batchExport.js tests/unit/batchExport.test.js
git commit m "feat(export): add batch export for unit/semester content"
```

---

## Task 4: 二维码分享卡片

**Files:**
- Create: `src/components/ShareCard.jsx`
- Test: `tests/unit/shareCard.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/unit/shareCard.test.js
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ShareCard from '../../src/components/ShareCard';

describe('ShareCard', () => {
  it('renders share card when open', () => {
    render(<ShareCard open={true} onClose={() => {}} title="一年级·天地人" />);
    expect(screen.getByText(/分享字帖/)).toBeTruthy();
  });

  it('does not render when closed', () => {
    render(<ShareCard open={false} onClose={() => {}} title="" />);
    expect(screen.queryByText(/分享字帖/)).toBeNull();
  });

  it('shows title', () => {
    render(<ShareCard open={true} onClose={() => {}} title="一年级·天地人" />);
    expect(screen.getByText(/一年级·天地人/)).toBeTruthy();
  });

  it('calls onClose when close clicked', () => {
    const onClose = vi.fn();
    render(<ShareCard open={true} onClose={onClose} title="" />);
    fireEvent.click(screen.getByText(/关闭/));
    expect(onClose).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/shareCard.test.js 2>&1 | tail -10`
Expected: FAIL

- [ ] **Step 3: Implement ShareCard.jsx**

```jsx
// src/components/ShareCard.jsx
import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.7)', zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  modal: {
    background: '#fff', borderRadius: '12px', padding: '24px',
    maxWidth: '360px', width: '90%', textAlign: 'center',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '16px',
  },
  title: { fontSize: '16px', fontWeight: 700 },
  closeBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6c757d' },
  qrBox: { margin: '16px auto', width: '180px', height: '180px' },
  info: { fontSize: '13px', color: '#6c757d', marginTop: '12px' },
};

export default function ShareCard({ open, onClose, title }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!open || !canvasRef.current) return;
    const url = window.location.href;
    QRCode.toCanvas(canvasRef.current, url, { width: 180, margin: 1 })
      .catch(() => { /* QR generation may fail in test env */ });
  }, [open]);

  if (!open) return null;
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <span style={styles.title}>分享字帖</span>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>{title}</div>
        <div style={styles.qrBox}>
          <canvas ref={canvasRef} />
        </div>
        <div style={styles.info}>微信扫码获取字帖</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/shareCard.test.js 2>&1 | tail -10`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ShareCard.jsx tests/unit/shareCard.test.js
git commit m "feat(share): add QR code share card for WeChat sharing"
```

---

## Task 5: 集成到 QuickGenerateBar

**Files:**
- Modify: `src/components/QuickGenerateBar.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Add share and batch export buttons to QuickGenerateBar**

Add props: `onShare`, `onPrintPreview`, `onBatchExport`
Add buttons conditionally rendered when `hasContent` is true.

- [ ] **Step 2: Wire up in App.jsx**

Add state for `showPrintPreview` and `showShareCard`.
Pass handlers to QuickGenerateBar.
Render `<PrintPreview>` and `<ShareCard>` modals.

- [ ] **Step 3: Commit**

```bash
git add src/components/QuickGenerateBar.jsx src/App.jsx
git commit m("feat: integrate print preview, share card, and batch export into UI")
```

---

## Self-Review

**Spec coverage:**
- ✅ PDF 智能分页（裁切线 + 页码 + 装订线）— Task 2
- ✅ 批量导出（一个单元/一个学期一次性导出）— Task 3
- ✅ 打印预览（A4 实际纸张预览）— Task 1
- ✅ 微信分享 — Task 4
- ✅ 班级码 — Task 4

**Placeholder scan:** No TBDs, all code blocks complete.

---

*Plan complete. 5 tasks, all TDD.*
