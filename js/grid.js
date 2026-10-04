/**
 * 格子（字帖网格）生成 —— 旧全局适配层
 *
 * 真实实现已迁移到 canonical 的 ESM 模块 `src/utils/grid.js`。
 * 本文件只负责把它暴露到 `window.__copybook__.grid` / `window.__copybook__.gridTypes`，
 * 供旧调用方（app.js、其它 <script> 脚本，以及读取全局的 React 组件）继续使用。
 *
 * 注意：本文件是 ES module，需以 <script type="module"> 加载。
 */
import { GRID_TYPES, svgDataURL } from '../src/utils/grid.js';

const grid = { svgDataURL };

if (typeof window !== 'undefined') {
  const w = window;
  w.__copybook__ = w.__copybook__ || {};
  w.__copybook__.gridTypes = GRID_TYPES;
  w.__copybook__.grid = grid;
}

export default grid;
export { svgDataURL, GRID_TYPES };
