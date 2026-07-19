# 2026-07-19 英语字帖格式优化设计

## 目标

让"英文格式"排版达到正规英语字帖/作业本标准：词内字母紧凑、字母基线坐线、四线三格样式规范，并新增临摹空行、单词重复、中文释义三项练习增强。中文格式与现有功能零回归，保持纯静态、file:// 可用、无新依赖。

## 现状问题

1. `.grid` 的 `gap` 同时作用于行列，词内字母被 8px 间距拆散（`a p p l e`）。
2. `.cell` 用 `line-height: var(--cell-size)` 垂直居中，字母在格中"漂浮"，不落在四线三格基线（第三条线）上，g/y/p 等下伸字母位置错误。
3. 四线三格四条线样式不规范（grid.js 中 y2、y3 均虚线），且颜色取自写死的 `--fourline-top-color/--fourline-mid-color`（黑/灰），不跟随用户选择的格子颜色。
4. 无临摹空行：内容行连续排，学生没有留白行照着写。
5. 单词只出现一次，无重复描红。
6. 词库 848 词的释义字段 `t` 未被使用。

## 方案

纯 CSS + 布局函数优化（已通过评审）。不采用 Canvas TextMetrics 逐字测量（过度工程），不做"只改样式不动基线"的折中（留核心问题）。

## 设计明细

### A. 词内字母挨紧
- `app.js` 渲染 `.grid` 时，`layout==='英文格式'` 设 `columnGap: 0`；行距仍为用户的 `gridGap`。
- 四线三格 SVG 横线从 `x=0` 画到 `x=s`（原为 1..s-1），列间距为 0 时相邻格线条无缝连接。

### B. 基线对位
- `index.html` 新增 `.cell-en` 类：
  `line-height: normal; align-items: flex-end; padding-bottom: max(0px, calc((1 - var(--fourline-y3)) * var(--cell-size) - var(--en-descent, 0.212em)))`
  使字母 baseline 精确落在第三条线（y3）上。
- `--en-descent` 由 `app.js` 按 `letterStyle` 设置到 `:root`：印刷体（Arial/Helvetica）`0.212em`，手写体（Comic Sans 等）`0.28em`；用 Playwright 截图校准系数。
- `Cell` 组件增加可选 className 参数；仅英文格式传 `cell-en`，中文格子样式不变。
- 默认字号 42px / 格 60px 下，大写字母顶到 y1、小写主体在中间格，符合常规字帖。

### C. 四线三格样式标准化
- 基线 y3 实线，y1/y2/y4 虚线（dash 模式沿用 `--fourline-dash-on/off`）。
- 四线颜色改用用户格子颜色（`svgDataURL` 的 color 参数），不再使用 `--fourline-top-color/--fourline-mid-color`；index.html 中相应无用变量移除。
- `js/grid.js` 与 `app.js` 内联兜底两处 `svgDataURL` 同步修改。

### D. 临摹空行
- `layoutEnglish(text, cols, opts)` 新增 `opts.blankRows`（0/1/2，默认 0）：每条内容行后补 N 行空行（整行 cols 个空单元格）；空输入行后不补。
- `layoutDocument(kind, text, cols, opts)` 第 4 参透传。
- 界面英文格式区加"临摹空行"下拉（无/1 行/2 行），状态键 `enBlankRows`。

### E. 单词重复
- `opts.repeat`（1~5，默认 1）：输入行去空格后是单个词时，展开为 N 份（词间一格）再走原有贪心换行；多词句子行不受影响。
- 界面加"单词重复"数字输入，状态键 `enRepeat`。

### F. 中文释义
- `js/library.js` 英语 tab 的单词模式下加"附中文释义"勾选框（默认关，仿照现有"含标题"模式）。
- 勾选后 `buildEngText` 单词行输出 `w + ' ' + t`（如 `apple 苹果`）；句子无释义字段，句子模式不显示该勾选框。
- 状态键 `engShowZh`。

### 持久化
- `enBlankRows`、`enRepeat`、`engShowZh` 存入 `copybook.settings` localStorage，恢复逻辑与现有键一致。

## 影响文件

- `js/content.js`：layoutEnglish/layoutDocument 签名与逻辑
- `js/grid.js`、`app.js`：svgDataURL 四线三格分支；app.js 另加 Cell className、columnGap、--en-descent、新 UI 控件与持久化
- `js/library.js`：释义勾选与 buildEngText
- `index.html`：.cell-en 样式、CSS 变量清理

## 验证

- Node 单测（tools/test_english_layout.js，以伪 window 加载 js/content.js）：blankRows 补行、repeat 展开、贪心换行不拆词、空行/超长词回归。
- Playwright 起 file:// 截图目检：基线落线（含 g/y 下伸、b/d 上伸）、词内紧凑词间一格、虚线样式、中英混排（释义）、印刷体/手写体两种字体；校准 --en-descent 系数。
- 回归：中文古诗/文章格式、数字字母模块不受影响。

## 非目标

- 逐字母比例宽度（i/l 窄格）排版。
- 首字深、后续浅的逐格描红灰度（需 Cell 级独立样式，留待后续）。
- 句子释义、手写体专用字体引入。
