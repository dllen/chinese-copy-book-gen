# 英语字帖格式优化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 英文格式达到正规英语字帖标准：词内紧凑、基线坐线、四线规范（基线实线其余虚线且跟随格色），新增临摹空行、单词重复、中文释义。

**Architecture:** 纯 CSS + 布局函数方案。`js/content.js` 的 `layoutEnglish` 增加 `opts`（blankRows/repeat）；基线对位用 `.cell-en` CSS 类（flex-end + calc padding）；四线三格 SVG 两处（js/grid.js 与 app.js 兜底）同步改；释义在词库面板经 props 由 app.js 托管状态。零新依赖，file:// 可用。

**Tech Stack:** 原生 JS + React 18 (CDN UMD) + Bootstrap 5；Node 跑 layout 单测；Playwright 截图目检。

**Spec:** `docs/superpowers/specs/2026-07-19-english-copybook-format-design.md`

---

### Task 1: layoutEnglish 支持 opts（blankRows / repeat），TDD

**Files:**
- Modify: `js/content.js`（layoutEnglish、layoutDocument）
- Create: `tools/test_english_layout.js`

- [x] **Step 1: 写失败测试**

创建 `tools/test_english_layout.js`：

```js
// Node 单测：js/content.js 英文排版。运行：node tools/test_english_layout.js
global.window = {};
require('../js/content.js');
const C = global.window.__copybook__.content;
let fail = 0;
function eq(name, got, want) {
  const a = JSON.stringify(got), b = JSON.stringify(want);
  if (a === b) { console.log('✅ ' + name); }
  else { fail++; console.log('❌ ' + name + '\n  got:  ' + a + '\n  want: ' + b); }
}
// 把 cells 数组按 cols 切回行（''=空格），便于断言
function rows(res, cols) {
  const out = [];
  for (let i = 0; i + cols <= res.pages[0].length; i += cols) out.push(res.pages[0].slice(i, i + cols).join(''));
  return out;
}

// 回归：无 opts 时行为不变
eq('回归-贪心换行不拆词', rows(C.layoutEnglish('hello world', 10), 10), ['hello     ', 'world     ']);
eq('回归-词间一格', rows(C.layoutEnglish('a b', 5), 5), ['a b  ']);
eq('回归-空输入行=空行', rows(C.layoutEnglish('ab\n\ncd', 4), 4), ['ab  ', '    ', 'cd  ']);
eq('回归-每个输入行另起行', rows(C.layoutEnglish('ab\ncd', 4), 4), ['ab  ', 'cd  ']);
eq('回归-超长词硬换行', rows(C.layoutEnglish('abcdef', 3), 3), ['abc', 'def']);

// blankRows：每条内容行后补 N 行空行；空输入行后不补
eq('blankRows=1', rows(C.layoutEnglish('ab\ncd', 4, { blankRows: 1 }), 4), ['ab  ', '    ', 'cd  ', '    ']);
eq('blankRows=1-空输入行不补', rows(C.layoutEnglish('ab\n\ncd', 4, { blankRows: 1 }), 4), ['ab  ', '    ', '    ', 'cd  ', '    ']);
eq('blankRows=2', rows(C.layoutEnglish('ab', 4, { blankRows: 2 }), 4), ['ab  ', '    ', '    ']);
eq('blankRows-绕排行每行都补', rows(C.layoutEnglish('aaa bbb', 3, { blankRows: 1 }), 3), ['aaa', '   ', 'bbb', '   ']);
eq('blankRows-越界钳制为0', rows(C.layoutEnglish('ab', 4, { blankRows: 9 }), 4), ['ab  ', '    ', '    ']);

// repeat：单词行重复 N 次；多词句子行不重复
eq('repeat=3-单词', rows(C.layoutEnglish('apple', 16, { repeat: 3 }), 16), ['apple apple     ', 'apple           ']);
eq('repeat=3-句子不受影响', rows(C.layoutEnglish('hello world', 16, { repeat: 3 }), 16), ['hello world     ']);
eq('repeat=1-不变', rows(C.layoutEnglish('apple', 8, { repeat: 1 }), 8), ['apple   ']);
eq('repeat-越界钳制为5', rows(C.layoutEnglish('ab', 20, { repeat: 9 }), 20), ['ab ab ab ab ab     ']);

// blankRows 与 repeat 组合
eq('组合', rows(C.layoutEnglish('ab', 8, { repeat: 2, blankRows: 1 }), 8), ['ab ab   ', '        ']);

// layoutDocument 透传 opts
eq('layoutDocument-透传', rows(C.layoutDocument('英文格式', 'ab', 4, { blankRows: 1 }), 4), ['ab  ', '    ']);
eq('layoutDocument-无opts兼容', rows(C.layoutDocument('英文格式', 'ab', 4), 4), ['ab  ']);

if (fail) { console.log('\n' + fail + ' 个失败'); process.exit(1); }
console.log('\n全部通过');
```

注意：`'ab ab ab ab ab     '` 长度须为 20（`ab`×5 + 4 个词间空格 = 19 字符 + 1 补齐空格）。写测试时先用纸笔核对每行长度 = cols。

- [x] **Step 2: 运行确认失败**

Run: `cd /Users/shichaopeng/Work/self-dir/my-code/chinese-copy-book-gen && node tools/test_english_layout.js`
Expected: 回归用例通过，blankRows/repeat/透传用例失败。

- [x] **Step 3: 实现**

`js/content.js` 中替换整个 `layoutEnglish` 函数与 `layoutDocument` 首行：

```js
  // 英文格式：单词间空一格；按词换行（不拆词）；每个输入行另起一行；空输入行=空一行
  // opts.blankRows: 每条内容行后补 N 行空行（0/1/2）；opts.repeat: 单词输入行重复 N 次（1~5）
  function layoutEnglish(text,cols,opts){
    opts=opts||{};
    const blankRows=Math.max(0,Math.min(2,opts.blankRows|0));
    const repeat=Math.max(1,Math.min(5,opts.repeat|0));
    const out=[];
    (text||'').split('\n').forEach(raw=>{
      const s=raw.trim();
      if(!s){ out.push([]); return; }
      let words=s.split(/\s+/).filter(Boolean);
      if(repeat>1&&words.length===1){ const one=words[0]; words=[]; for(let i=0;i<repeat;i++) words.push(one); }
      const rs=[]; let cur=[];
      words.forEach(wd=>{
        const wcs=Array.from(wd);
        if(cur.length===0) cur=wcs.slice();
        else if(cur.length+1+wcs.length<=cols){ cur.push(''); cur=cur.concat(wcs); }
        else { rs.push(cur); cur=wcs.slice(); }
        while(cur.length>cols){ rs.push(cur.slice(0,cols)); cur=cur.slice(cols); } // 超长词硬换行
      });
      if(cur.length) rs.push(cur);
      rs.forEach(r=>{ out.push(r); for(let i=0;i<blankRows;i++) out.push([]); });
    });
    const cells=[];
    out.forEach(l=>{ cells.push.apply(cells,l); const n=l.length===0?cols:(l.length%cols===0?0:cols-l.length%cols); for(let i=0;i<n;i++) cells.push(''); });
    return { pages:[cells] };
  }
```

`layoutDocument` 签名改 4 参并透传：

```js
  function layoutDocument(kind,text,cols,opts){
    if(kind==='英文格式') return layoutEnglish(text,cols,opts);
```

（函数体其余部分不变。）

- [x] **Step 4: 运行确认通过**

Run: `node tools/test_english_layout.js`
Expected: 全部通过。

- [x] **Step 5: Commit**

```bash
git add js/content.js tools/test_english_layout.js
git commit -m "feat: 英文排版支持临摹空行与单词重复（layoutEnglish opts）"
```

---

### Task 2: 四线三格 SVG 标准化（基线实线、其余虚线、跟随格色、线条无缝）

**Files:**
- Modify: `js/grid.js`（svgDataURL 四线三格分支）
- Modify: `app.js`（内联兜底 svgDataURL 四线三格分支）
- Modify: `index.html`（移除不再使用的 CSS 变量）

- [x] **Step 1: 修改 js/grid.js 四线三格分支**

将 `if(type==='四线三格'){...}` 整段替换为：

```js
if(type==='四线三格'){ const cs=getComputedStyle(document.documentElement); const y1=Math.round(s*parseFloat(cs.getPropertyValue('--fourline-y1')||'0.20')); const y2=Math.round(s*parseFloat(cs.getPropertyValue('--fourline-y2')||'0.47')); const y3=Math.round(s*parseFloat(cs.getPropertyValue('--fourline-y3')||'0.74')); const y4=Math.round(s*parseFloat(cs.getPropertyValue('--fourline-y4')||'0.94')); const don=cs.getPropertyValue('--fourline-dash-on')||'5'; const doff=cs.getPropertyValue('--fourline-dash-off')||'2'; const dash=` stroke-dasharray='${don.trim()},${doff.trim()}'`; const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}' shape-rendering='crispEdges'>`+`<line x1='0' y1='${y1}' x2='${s}' y2='${y1}' stroke='${c}' stroke-width='${wv}'${dash}/>`+`<line x1='0' y1='${y2}' x2='${s}' y2='${y2}' stroke='${c}' stroke-width='${wv}'${dash}/>`+`<line x1='0' y1='${y3}' x2='${s}' y2='${y3}' stroke='${c}' stroke-width='${wv}'/>`+`<line x1='0' y1='${y4}' x2='${s}' y2='${y4}' stroke='${c}' stroke-width='${wv}'${dash}/>`+`</svg>`; return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`; }
```

要点：y3（基线）实线，y1/y2/y4 虚线；全部用传入的格色 `c`；x 从 0 到 s（列间距 0 时无缝）。

- [x] **Step 2: 修改 app.js 内联兜底分支**

app.js 的 `svgDataURL` 中 `if(type==='四线三格'){...}` 整段替换为（注意此处线宽变量名为 `w`）：

```js
if(type==='四线三格'){ const cs=getComputedStyle(document.documentElement); const y1=Math.round(s*parseFloat(cs.getPropertyValue('--fourline-y1')||'0.25')); const y2=Math.round(s*parseFloat(cs.getPropertyValue('--fourline-y2')||'0.50')); const y3=Math.round(s*parseFloat(cs.getPropertyValue('--fourline-y3')||'0.75')); const y4=Math.round(s*parseFloat(cs.getPropertyValue('--fourline-y4')||'0.92')); const dash=` stroke-dasharray='4,4'`; const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}' shape-rendering='crispEdges'>`+`<line x1='0' y1='${y1}' x2='${s}' y2='${y1}' stroke='${c}' stroke-width='${w}'${dash}/>`+`<line x1='0' y1='${y2}' x2='${s}' y2='${y2}' stroke='${c}' stroke-width='${w}'${dash}/>`+`<line x1='0' y1='${y3}' x2='${s}' y2='${y3}' stroke='${c}' stroke-width='${w}'/>`+`<line x1='0' y1='${y4}' x2='${s}' y2='${y4}' stroke='${c}' stroke-width='${w}'${dash}/>`+`</svg>`; return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`; }
```

- [x] **Step 3: 清理 index.html 无用变量**

`:root` 中删除 `--fourline-top-color` 与 `--fourline-mid-color` 两行（`--fourline-dash-on/off` 仍被 grid.js 使用，保留）。

- [x] **Step 4: 浏览器目检 + Commit**

Playwright 打开 `file://…/index.html`，格子类型选四线三格截图确认：基线实线、其余虚线、颜色跟随格色。然后：

```bash
git add js/grid.js app.js index.html
git commit -m "feat: 四线三格标准化——基线实线其余虚线、颜色跟随格色、线条无缝"
```

---

### Task 3: .cell-en 基线对位 CSS

**Files:**
- Modify: `index.html`（`<style>` 内）

- [x] **Step 1: 新增样式**

在 `.cell { ... }` 规则后添加：

```css
    .cell-en {
      line-height: normal;
      align-items: flex-end;
      padding-bottom: max(0px, calc((1 - var(--fourline-y3)) * var(--cell-size) - var(--en-descent, 0.212em)));
    }
```

原理：`line-height: normal` 让行盒高度 ≈ 字体 ascent+descent；`align-items: flex-end` 把行盒压到 padding 上沿；padding-bottom = (1−y3)×格高 − 字体 descent，使 baseline 恰好落在 y3 线上。`--en-descent` 由 app.js 按字体设置（Task 4）。

- [x] **Step 2: Commit**

```bash
git add index.html
git commit -m "feat: .cell-en 英文基线对位样式"
```

---

### Task 4: app.js 集成（Cell className、列间距、descent 变量、新控件与持久化）

**Files:**
- Modify: `app.js`

- [x] **Step 1: Cell 组件支持附加类名**

```js
  function Cell({ ch,bg,textColor,strokeMode,font,fontSize,showGuide,cls }){ const style=strokeLevel(strokeMode,textColor); return React.createElement('div',{ className:'cell'+(cls?' '+cls:''), style:{ backgroundImage:bg, color:style.color, WebkitTextStroke:style.WebkitTextStroke, opacity:style.opacity, fontFamily:font, fontSize:fontSize } }, ch||'', showGuide?React.createElement('div',{ className:'guide' }, React.createElement('div',{ className:'guide-arrow' })):null); }
```

- [x] **Step 2: 新状态 + 持久化**

state 声明（放在 `letterStyle` 附近）：

```js
    const [enBlankRows,setEnBlankRows]=useState(0);
    const [enRepeat,setEnRepeat]=useState(1);
    const [engShowZh,setEngShowZh]=useState(false);
```

恢复 effect 的 switch 中新增：`case 'enBlankRows':setEnBlankRows(v);break; case 'enRepeat':setEnRepeat(v);break; case 'engShowZh':setEngShowZh(v);break;`
保存 effect 的对象与依赖数组均加入 `enBlankRows,enRepeat,engShowZh`。

- [x] **Step 3: --en-descent 变量**

新增 effect：

```js
    useEffect(()=>{ document.documentElement.style.setProperty('--en-descent', letterStyle==='手写体'?'0.28em':'0.212em'); },[letterStyle]);
```

- [x] **Step 4: layoutDocument 传 opts**

parsed useMemo 中：

```js
if(feature==='字帖模板'&&layout!=='连续排列'&&cp.content&&cp.content.layoutDocument) return cp.content.layoutDocument(layout,text,cols,{ blankRows:enBlankRows, repeat:enRepeat });
```

依赖数组追加 `enBlankRows,enRepeat`。

- [x] **Step 5: 渲染列间距 0 + cell-en 类**

grid div：

```js
React.createElement('div',{ className:'grid', style:{ gridTemplateColumns:`repeat(${cols}, var(--cell-size))`, columnGap: layout==='英文格式'?0:undefined } },
```

Cell 调用处加 `cls`：

```js
page.map((ch,idx)=>React.createElement(Cell,{ key:idx, ch: ch==='\n'?'':ch, bg:bg, textColor:tColor, strokeMode, cls: (layout==='英文格式'||feature==='数字字母')?'cell-en':undefined, font: layout==='英文格式'?engFont(letterStyle):feature==='数字字母'?(letterStyle==='印刷体'?'monospace':'cursive'):font, fontSize, showGuide: feature==='数字字母' && showGuide }))
```

- [x] **Step 6: 英文格式区新控件**

把现有"英文字体"块（`layout==='英文格式'?React.createElement('div',{ className:'mb-2' }, …letterStyle select… ):null,`）替换为三列行：

```js
                layout==='英文格式'?React.createElement('div',{ className:'row g-2 mb-2' },
                  React.createElement('div',{ className:'col-4' },
                    React.createElement('label',{ className:'form-label', htmlFor:'letterStyle' },'英文字体'),
                    React.createElement('select',{ id:'letterStyle', className:'form-select', value:letterStyle, onChange:e=>setLetterStyle(e.target.value) },
                      ['印刷体','手写体'].map(v=>React.createElement('option',{ key:v, value:v },v))
                    )
                  ),
                  React.createElement('div',{ className:'col-4' },
                    React.createElement('label',{ className:'form-label', htmlFor:'enBlankRows' },'临摹空行'),
                    React.createElement('select',{ id:'enBlankRows', className:'form-select', value:enBlankRows, onChange:e=>setEnBlankRows(parseInt(e.target.value||'0')) },
                      [[0,'无'],[1,'1 行'],[2,'2 行']].map(([v,l])=>React.createElement('option',{ key:v, value:v },l))
                    )
                  ),
                  React.createElement('div',{ className:'col-4' },
                    React.createElement('label',{ className:'form-label', htmlFor:'enRepeat' },'单词重复'),
                    React.createElement('input',{ id:'enRepeat', className:'form-control', type:'number', min:1, max:5, value:enRepeat, onChange:e=>setEnRepeat(Math.max(1,Math.min(5,parseInt(e.target.value||'1')))) })
                  )
                ):null,
```

- [x] **Step 7: LibraryPanel 传 props**

```js
React.createElement(window.__copybook__.library.LibraryPanel,{ onInsert:insertFromLibrary, engShowZh:engShowZh, onEngShowZhChange:v=>setEngShowZh(v) })
```

- [x] **Step 8: Commit**

```bash
git add app.js
git commit -m "feat: 英文格式集成——列间距0、基线对位、临摹空行/单词重复控件"
```

---

### Task 5: 词库中文释义

**Files:**
- Modify: `js/library.js`（LibraryPanel）

- [x] **Step 1: buildEngText 支持释义**

```js
    function buildEngText(){
      const arr=engType==='word'?(st.englishWords||[]):(st.englishSentences||[]);
      const items=arr.filter(x=>engSel[x.id]);
      if(!items.length) return null;
      const showZh=engType==='word'&&!!props.engShowZh;
      return { mode:'多句', layout:'英文格式', text: items.map(x=>engType==='word'?(showZh&&x.t?x.w+' '+x.t:x.w):x.en).join('\n') };
    }
```

- [x] **Step 2: 英语面板加勾选框**

在英语面板按钮行（`E('div',{className:'mt-2 d-flex gap-2 flex-wrap'}, …覆盖到字帖…)`）之前插入：

```js
          engType==='word'?E('div',{className:'form-check form-check-sm mt-1'},
            E('input',{className:'form-check-input',type:'checkbox',id:'engShowZh',checked:!!props.engShowZh,onChange:e=>props.onEngShowZhChange&&props.onEngShowZhChange(e.target.checked)}),
            E('label',{className:'form-check-label',htmlFor:'engShowZh'},'附中文释义')
          ):null,
```

- [x] **Step 3: 目检 + Commit**

浏览器词库英语 tab 勾选"附中文释义"，插入单词确认文本为 `apple 苹果` 形式。然后：

```bash
git add js/library.js
git commit -m "feat: 词库英语单词可附中文释义"
```

---

### Task 6: Playwright 视觉验证与 --en-descent 校准

**Files:**
- Create: `tools/shot_english.js`（临时验证脚本，验证后可保留）

- [x] **Step 1: 截图脚本**

```js
// 用法：node tools/shot_english.js  （需本机可用的 playwright）
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
  await page.goto('file://' + path.resolve(__dirname, '../index.html'));
  await page.evaluate(() => {
    localStorage.setItem('copybook.settings', JSON.stringify({
      layout: '英文格式', text: 'Bgypq apple\nMy name’s Zip.\napple 苹果',
      gridType: '四线三格', gridColor: '绿色', cols: 12, rows: 8, cellSize: 60,
      fontSize: 42, gridGap: 8, letterStyle: '印刷体', enBlankRows: 1, enRepeat: 1,
      feature: '字帖模板', mode: '多句', stylePreset: '四线三格标准', autoLayout: false
    }));
  });
  await page.reload();
  await page.waitForTimeout(800);
  await page.locator('.page').first().screenshot({ path: '/tmp/en-print.png' });
  await page.selectOption('#letterStyle', '手写体');
  await page.waitForTimeout(400);
  await page.locator('.page').first().screenshot({ path: '/tmp/en-hand.png' });
  await browser.close();
})();
```

- [x] **Step 2: 运行并查看截图**

Run: `node tools/shot_english.js`，用读图工具查看 `/tmp/en-print.png`、`/tmp/en-hand.png`。

检查项：
- 小写 a/c/e 主体在 y2–y3 之间；baseline 精确压在实线上；b/d 顶到 y1；g/y/p 下伸接近 y4
- 词内字母无间隙，词间一格清晰
- 虚线样式正确、颜色为格色
- 每条内容行后有一行空行
- 中文"苹果"正常显示

- [x] **Step 3: 校准 --en-descent**

若 baseline 偏高/偏低，用 Playwright 量取偏差像素 ÷ fontSize 折算 em，调整 app.js 中两个系数（印刷体 0.212em 起步，手写体 0.28em 起步），重复 Step 2 直至两字体均坐线。

- [x] **Step 4: 中文回归截图**

settings 改 `layout:'古诗格式'`、中文诗句文本截图，确认中文格子居中不受影响。

- [x] **Step 5: 全部测试 + Commit**

```bash
node tools/test_english_layout.js   # 单测全绿
git add tools/shot_english.js
git commit -m "test: 英文格式 Playwright 截图验证脚本"
```

---

## Self-Review 记录

- Spec 覆盖：A（间距）→Task4 Step5；B（基线）→Task3+Task4 Step1/3/5+Task6；C（四线）→Task2；D（临摹空行）→Task1+Task4 Step6；E（重复）→Task1+Task4 Step6；F（释义）→Task5+Task4 Step2/7；持久化→Task4 Step2；验证→Task6。全覆盖。
- 类型一致：`opts.blankRows/opts.repeat` 在 content.js、app.js 调用、测试三处一致；`engShowZh/onEngShowZhChange` props 名在 app.js 与 library.js 一致；`cls` prop 在 Cell 定义与调用一致。
- 无占位符。
