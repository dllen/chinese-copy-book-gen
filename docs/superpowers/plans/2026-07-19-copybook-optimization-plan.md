# 2026-07-19 Copybook Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the existing static copybook generator UI, add mobile/print polish, and improve export stability while keeping all current behaviors.

**Architecture:** Keep the static frontend in `index.html` and `app.js`, extract smaller render helpers from `app.js`, and keep data/grid/export logic in the existing `js/` modules. Add print styles and a safer PDF export path with fallback behavior.

**Tech Stack:** React 18, Bootstrap 5, html2pdf.js, static browser APIs.

---

### Task 1: Add layout and state helpers in app.js

**Files:**
- Modify: `app.js`
- Test: `tests.html`

- [ ] **Step 1: Add helper state and render utilities**

Add small helpers in `app.js` for panel sections, preview wrapper, and status feedback so the main render stays readable.

```javascript
function Section({title, children, defaultOpen}){
  const [open, setOpen] = React.useState(defaultOpen !== false);
  return React.createElement('div', {className:'mb-3 border rounded'},
    React.createElement('div',{className:'p-2 d-flex justify-content-between align-items-center'},
      React.createElement('div',{className:'fw-semibold'}, title),
      React.createElement('button',{
        className:'btn btn-sm btn-outline-secondary',
        type:'button',
        'aria-expanded': String(open),
        onClick:()=>setOpen(v=>!v)
      }, open ? '收起' : '展开')
    ),
    open ? React.createElement('div',{className:'p-2 pt-0'}, children) : null
  );
}

function PreviewStatus({pages, rows, cols}){
  const capacity = (rows||0)*(cols||0);
  const used = pages.reduce((sum,pg)=>sum+pg.filter(ch=>ch&&ch!=='\\n').length,0);
  const warn = pages.length > 50;
  return React.createElement('div',{className:'d-flex flex-wrap gap-2 align-items-center legend'},
    React.createElement('span',null,`页数：${pages.length}`),
    React.createElement('span',null,`容量：${capacity}，已用：${used}`),
    warn ? React.createElement('span',{className:'error'},'页面过多，建议分批打印') : null
  );
}
```

- [ ] **Step 2: Update tests.html with a smoke check**

```html
<script>
  const m=window.__copybook__;
  assert('section helper exists', typeof m && typeof m.Section === 'function');
  assert('preview status helper exists', typeof m && typeof m.PreviewStatus === 'function');
</script>
```

- [ ] **Step 3: Run browser tests**

Open `tests.html` and confirm the two new assertions pass.

- [ ] **Step 4: Commit**

```bash
git add app.js tests.html
git commit -m "feat: add panel section and preview status helpers"
```

---

### Task 2: Refactor desktop layout into side-by-side control + preview

**Files:**
- Modify: `index.html`, `app.js`

- [ ] **Step 1: Add desktop layout styles in index.html**

```css
.app-shell { display:flex; gap:16px; align-items:flex-start; }
.control-panel { width:380px; flex-shrink:0; }
.preview-area { flex:1 1 auto; min-width:0; }
@media (max-width: 991.98px) {
  .app-shell { flex-direction: column; }
  .control-panel { width:100%; }
}
```

- [ ] **Step 2: Wrap App render in app.js**

```javascript
return React.createElement('div',{className:'container py-3'},
  React.createElement('div',{className:'app-shell'},
    React.createElement('aside',{className:'control-panel card no-print'},
      React.createElement('div',{className:'card-body'},
        /* existing controls grouped */
      )
    ),
    React.createElement('main',{className:'preview-area page-wrapper'},
      /* existing preview pages */
    )
  )
);
```

- [ ] **Step 3: Visually verify layout**

Open `index.html` and check desktop shows left controls and right preview.

- [ ] **Step 4: Commit**

```bash
git add index.html app.js
git commit -m "feat: add desktop side-by-side layout shell"
```

---

### Task 3: Group controls and add collapsible advanced sections

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Create grouped control blocks**

Use the `Section` helper for advanced controls such as margins, font size, grid gap, stroke width, random chars, and header/fill options.

```javascript
React.createElement(Section,{title:'高级排版',defaultOpen:false},
  React.createElement('div',{className:'row g-2 mt-1'}, /* rows/cols/cell */),
  React.createElement('div',{className:'row g-2 mt-1'}, /* font size/gap/paper */),
  React.createElement('div',{className:'row g-2 mt-1'}, /* margins */)
),
React.createElement(Section,{title:'页眉与尾页',defaultOpen:false},
  React.createElement('div',{className:'row g-2 mt-1'}, /* header input */)
),
React.createElement(Section,{title:'随机汉字',defaultOpen:false},
  React.createElement('div',{className:'row g-2'}, /* rand controls */)
)
```

- [ ] **Step 2: Keep quick actions in the main panel**

Keep mode, grid, colors, template, feature, and export buttons outside collapsed sections.

- [ ] **Step 3: Run smoke test**

Open `index.html` and verify sections expand/collapse and export actions remain visible.

- [ ] **Step 4: Commit**

```bash
git add app.js
git commit -m "feat: group controls into quick and advanced sections"
```

---

### Task 4: Improve mobile layout and preview visibility

**Files:**
- Modify: `index.html`, `app.js`

- [ ] **Step 1: Add mobile styles in index.html**

```css
@media (max-width: 991.98px) {
  .preview-area { order: -1; }
  .control-panel .sticky-actions { position: sticky; bottom: 0; background:#fff; padding:10px 0; }
}
```

- [ ] **Step 2: Add sticky mobile action bar**

```javascript
React.createElement('div',{className:'control-panel'},
  React.createElement('div',{className:'card-body'},
    React.createElement(Section,{title:'常用设置',defaultOpen:true}, /* quick controls */),
    React.createElement('button',{className:'btn btn-success w-100 mt-2',onClick:window.print()},'打印/另存为PDF')
  )
)
```

- [ ] **Step 3: Verify on small viewport**

Resize browser to mobile width and confirm preview is visible first and controls remain usable.

- [ ] **Step 4: Commit**

```bash
git add index.html app.js
git commit -m "feat: improve mobile preview-first layout"
```

---

### Task 5: Add print styles and prevent preview-only UI from printing

**Files:**
- Modify: `index.html`

- [ ] **Step 1: Add print rules**

```css
@media print {
  body { background:#fff; }
  .no-print, .control-panel, .preview-area > :not(.page) { display:none !important; }
  .page-wrapper { overflow:visible; }
  .page { box-shadow:none; margin:0; page-break-after:always; transform:none; }
}
```

- [ ] **Step 2: Verify print preview**

Open browser print preview and confirm only pages print without controls.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "fix: improve print styles and preview isolation"
```

---

### Task 6: Replace exportPDF with a more stable image-to-PDF flow

**Files:**
- Modify: `js/export.js`, `index.html`

- [ ] **Step 1: Add PDF dependency script in index.html**

```html
<script src="https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js"></script>
```

- [ ] **Step 2: Implement exportPDF in js/export.js**

```javascript
async function exportPDF(paper){
  const pages = Array.from(document.querySelectorAll('.page'));
  if(!pages.length) return;
  const { PDFDocument, rgb } = window.PDFLib;
  const pdf = await PDFDocument.create();
  const sizes = { 'A4竖版':[595.28,841.89], 'A4横版':[841.89,595.28], 'A5竖版':[419.53,595.28], 'A5横版':[595.28,419.53], '作文纸A4':[595.28,841.89] };
  const [width, height] = sizes[paper] || sizes['A4竖版'];
  for(const node of pages){
    const canvas = await new Promise(resolve=>{
      const el = node.cloneNode(true);
      el.style.transform = 'none';
      el.style.background = '#fff';
      document.body.appendChild(el);
      html2canvas(el, { scale:4, useCORS:true, backgroundColor:'#ffffff' }).then(c=>{
        document.body.removeChild(el);
        resolve(c);
      });
    });
    const page = pdf.addPage([width, height]);
    const img = await pdf.embedPng(canvas.toDataURL('image/png'));
    const imgWidth = width;
    const imgHeight = width * (canvas.height / canvas.width);
    page.drawImage(img, { x:0, y: height - imgHeight, width: imgWidth, height: imgHeight });
  }
  const blob = await pdf.save();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '字帖.pdf';
  a.click();
  URL.revokeObjectURL(url);
}
w.__copybook__.exporting = { exportPDF, exportImage };
```

- [ ] **Step 3: Verify export**

Generate a multi-page PDF and confirm pages and orientation match selected paper format.

- [ ] **Step 4: Commit**

```bash
git add js/export.js index.html
git commit -m "feat: switch PDF export to image-based stable flow"
```

---

### Task 7: Add preview status and validation feedback

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Show PreviewStatus in preview area**

```javascript
React.createElement('div',{className:'preview-area'},
  React.createElement(PreviewStatus,{pages, rows, cols}),
  pages.map((page,i)=> /* existing page render */)
)
```

- [ ] **Step 2: Improve input validation messaging**

Keep existing validation but ensure invalid textarea shows invalid-feedback near the input.

- [ ] **Step 3: Disable exports when invalid**

```javascript
disabled: pages.length === 0 || !v.ok
```

- [ ] **Step 4: Run smoke test**

Open `index.html`, enter invalid multi-word text, and verify validation + disabled export behavior.

- [ ] **Step 5: Commit**

```bash
git add app.js
git commit -m "feat: add preview status and validation feedback"
```

---

### Task 8: Add lightweight tests for pagination and preview feedback

**Files:**
- Modify: `tests.html`

- [ ] **Step 1: Add assertions**

```html
<script>
  const m=window.__copybook__;
  assert('multi-sentence pagination', JSON.stringify(m.paginate([['a','b','c','d']],2,2,true))===JSON.stringify([['a','b'],['c','d']]));
  assert('preview status helper exists', typeof m && typeof m.PreviewStatus === 'function');
</script>
```

- [ ] **Step 2: Run tests**

Open `tests.html` and confirm new assertions pass.

- [ ] **Step 3: Commit**

```bash
git add tests.html
git commit -m "test: add pagination and preview helper checks"
```

---

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-19-copybook-optimization-plan.md`. Two execution options:

1. Subagent-Driven (recommended) - I dispatch a fresh subagent per task, review between tasks, fast iteration
2. Inline Execution - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
