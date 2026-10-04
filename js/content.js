/**
 * 内容解析 / 分页 —— 旧全局适配层
 *
 * 真实实现已迁移到 canonical 的 ESM 模块：
 *   - src/utils/text/splitter.js   （splitInput / toCells / 排版 / 随机采样）
 *   - src/utils/text/paginator.js  （paginate / splitRows / 竖排）
 *
 * 本文件只负责把它们暴露到 `window.__copybook__.content`，供旧调用方
 * （app.js、其它 <script> 脚本、以及读取全局的 React 组件）继续使用。
 *
 * 注意：本文件是 ES module，需以 <script type="module"> 加载。
 */
import * as splitter from '../src/utils/text/splitter.js';
import * as paginator from '../src/utils/text/paginator.js';

// ---- 兼容包装 ----------------------------------------------------------
// canonical 的 splitInput 在「多字」模式下会因空格/标点抛错（用于驱动 UI 校验），
// 而旧运行时对此是宽容的（直接逐字切分、不抛错）。为保证运行时行为与迁移前一致，
// 这里捕获该异常并退回旧的宽容行为；其余模式与函数保持原样直通。
function compatSplitInput(mode, text) {
  try {
    return splitter.splitInput(mode, text);
  } catch (e) {
    return Array.from((text || '').trim());
  }
}

function compatToCells(mode, text, variant) {
  try {
    return splitter.toCells(mode, text, variant);
  } catch (e) {
    const v = variant || '';
    const cells = [];
    Array.from((text || '').trim()).forEach((c) => {
      cells.push(c);
      if (v.includes('+1行')) cells.push('\n');
      if (v.includes('+1空行')) cells.push('');
    });
    return { pages: [cells] };
  }
}

// ---- 组装旧全局 API ----------------------------------------------------
const content = {
  ...paginator,
  ...splitter,
  splitInput: compatSplitInput,
  toCells: compatToCells,
};

if (typeof window !== 'undefined') {
  const w = window;
  w.__copybook__ = w.__copybook__ || {};
  w.__copybook__.content = content;
}

export default content;
export const {
  splitInput,
  toCells,
  paginate,
  paginateVertical,
  splitRows,
  splitRowsVertical,
  sampleRandom,
  layoutDocument,
  layoutDocumentVertical,
  layoutEnglish,
  wrapFlow,
  centerLine,
  wrapFlowVertical,
  centerLineVertical,
} = content;
