/**
 * 格子（字帖网格）生成 —— canonical 实现
 *
 * `svgDataURL(type, size, color, lineStyle)` 依据格子类型生成内联 SVG 的
 * data URL，用作单元格背景图。这是网格生成的唯一真实来源；
 * `js/grid.js` 仅作为其「旧全局 (`window.__copybook__.grid`) 访问」的适配层。
 *
 * SVG 会用到的尺寸/线宽等参数来自 CSS 变量：
 *   --grid-stroke-width, --fourline-y1..y4, --fourline-dash-on/off
 */

// 线条样式 → stroke-dasharray 属性片段
const DASH_MAP = {
  '实线': '',
  '虚线': ` stroke-dasharray='5,2'`,
  '点线': ` stroke-dasharray='1,4'`,
  '点划线': ` stroke-dasharray='5,2,1,2'`,
};

// 供 UI 下拉菜单使用的格子类型列表（顺序即展示顺序）
export const GRID_TYPES = [
  '田字格', '米字格', '回宫格', '回宫格黄金', '四线三格', '拼音格',
  '九宫格', '十六宫格', '作文格', '椭圆米字格', '圆形格', '口字格',
  '横线格', '横线', '田字格+斜', '双田字格',
  '竖线格', '竖排田字格', '竖排米字格',
  '数字格', '田格', '方格', '无格',
];

// ---- SVG 片段构造helper -------------------------------------------------
const svgTag = (s) =>
  `<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}' shape-rendering='crispEdges'>`;

const rect = (x, y, w, h, c, wv, extra = '') =>
  `<rect x='${x}' y='${y}' width='${w}' height='${h}' fill='none' stroke='${c}' stroke-width='${wv}'${extra}/>`;

const line = (x1, y1, x2, y2, c, wv, extra = '') =>
  `<line x1='${x1}' y1='${y1}' x2='${x2}' y2='${y2}' stroke='${c}' stroke-width='${wv}'${extra}/>`;

const wrap = (svg) => `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;

const CLOSE = '</svg>';

// ---- 各格子类型 --------------------------------------------------------
// 每个 builder 接收 { s, c, wv, dash, thinDash, rootCS, lineStyle }，返回 SVG 字符串
const BUILDERS = {
  '田字格': ({ s, c, wv, dash }) =>
    svgTag(s) +
    rect(0.5, 0.5, s - 1, s - 1, c, wv, dash) +
    line(s / 2, 1, s / 2, s - 1, c, wv, dash) +
    line(1, s / 2, s - 1, s / 2, c, wv, dash) +
    CLOSE,

  '米字格': ({ s, c, wv }) =>
    svgTag(s) +
    rect(0.5, 0.5, s - 1, s - 1, c, wv) +
    line(s / 2, 1, s / 2, s - 1, c, wv) +
    line(1, s / 2, s - 1, s / 2, c, wv) +
    line(1, 1, s - 1, s - 1, c, wv) +
    line(s - 1, 1, 1, s - 1, c, wv) +
    CLOSE,

  '回宫格': ({ s, c, wv }) => {
    const inner = Math.round(s * 0.6);
    const offset = (s - inner) / 2;
    return (
      svgTag(s) +
      rect(0.5, 0.5, s - 1, s - 1, c, wv) +
      rect(offset, offset, inner, inner, c, wv) +
      line(s / 2, 1, s / 2, s - 1, c, wv) +
      line(1, s / 2, s - 1, s / 2, c, wv) +
      CLOSE
    );
  },

  '回宫格黄金': ({ s, c, wv }) => {
    const inner = Math.round(s * 0.618);
    const offset = Math.round((s - inner) / 2);
    return (
      svgTag(s) +
      rect(0.5, 0.5, s - 1, s - 1, c, wv) +
      rect(offset, offset, inner, inner, c, wv, ` stroke-dasharray='5,3'`) +
      line(s / 2, 1, s / 2, s - 1, c, wv, ` stroke-dasharray='3,3'`) +
      line(1, s / 2, s - 1, s / 2, c, wv, ` stroke-dasharray='3,3'`) +
      CLOSE
    );
  },

  '四线三格': ({ s, c, wv, rootCS, lineStyle }) => {
    const y1 = Math.round(s * parseFloat(rootCS.getPropertyValue('--fourline-y1') || '0.20'));
    const y2 = Math.round(s * parseFloat(rootCS.getPropertyValue('--fourline-y2') || '0.47'));
    const y3 = Math.round(s * parseFloat(rootCS.getPropertyValue('--fourline-y3') || '0.74'));
    const y4 = Math.round(s * parseFloat(rootCS.getPropertyValue('--fourline-y4') || '0.94'));
    const don = rootCS.getPropertyValue('--fourline-dash-on') || '5';
    const doff = rootCS.getPropertyValue('--fourline-dash-off') || '2';
    const defaultDash = ` stroke-dasharray='${don.trim()},${doff.trim()}'`;
    const fourDash = lineStyle && lineStyle !== '实线' ? (DASH_MAP[lineStyle] || defaultDash) : defaultDash;
    return (
      svgTag(s) +
      line(0, y1, s, y1, c, wv, fourDash) +
      line(0, y2, s, y2, c, wv, fourDash) +
      line(0, y3, s, y3, c, wv) +
      line(0, y4, s, y4, c, wv, fourDash) +
      CLOSE
    );
  },

  '拼音格': ({ s, c, wv }) => {
    const y1 = Math.round(s * 0.20);
    const y2 = Math.round(s * 0.45);
    const y3 = Math.round(s * 0.70);
    const y4 = Math.round(s * 0.95);
    return (
      svgTag(s) +
      line(0, y1, s, y1, c, wv, ` stroke-dasharray='3,3'`) +
      line(0, y2, s, y2, c, wv) +
      line(0, y3, s, y3, c, wv, ` stroke-dasharray='3,3'`) +
      line(0, y4, s, y4, c, wv) +
      CLOSE
    );
  },

  '方格': ({ s, c, wv, dash }) => svgTag(s) + rect(0.5, 0.5, s - 1, s - 1, c, wv, dash) + CLOSE,

  '横线格': ({ s, c, wv, thinDash }) => {
    const mid = Math.round(s * 0.5);
    const top = Math.round(s * 0.15);
    const bot = Math.round(s * 0.85);
    return (
      svgTag(s) +
      line(0, top, s, top, c, wv, thinDash) +
      line(0, mid, s, mid, c, wv) +
      line(0, bot, s, bot, c, wv, thinDash) +
      CLOSE
    );
  },

  '横线': ({ s, c, wv }) => {
    const mid = Math.round(s * 0.5);
    return svgTag(s) + line(0, mid, s, mid, c, wv) + CLOSE;
  },

  '九宫格': ({ s, c, wv }) => {
    const t = s / 3;
    return (
      svgTag(s) +
      rect(0.5, 0.5, s - 1, s - 1, c, wv) +
      line(t, 1, t, s - 1, c, wv) +
      line(t * 2, 1, t * 2, s - 1, c, wv) +
      line(1, t, s - 1, t, c, wv) +
      line(1, t * 2, s - 1, t * 2, c, wv) +
      CLOSE
    );
  },

  '十六宫格': ({ s, c, wv }) => {
    const t = s / 4;
    return (
      svgTag(s) +
      rect(0.5, 0.5, s - 1, s - 1, c, wv) +
      line(t, 1, t, s - 1, c, wv) +
      line(t * 2, 1, t * 2, s - 1, c, wv) +
      line(t * 3, 1, t * 3, s - 1, c, wv) +
      line(1, t, s - 1, t, c, wv) +
      line(1, t * 2, s - 1, t * 2, c, wv) +
      line(1, t * 3, s - 1, t * 3, c, wv) +
      CLOSE
    );
  },

  '作文格': ({ s, c, wv }) => {
    const mid = s / 2;
    const third = s / 3;
    return (
      svgTag(s) +
      rect(0.5, 0.5, s - 1, s - 1, c, wv) +
      line(mid, 1, mid, s - 1, c, wv) +
      line(1, mid, s - 1, mid, c, wv) +
      line(1, third, s - 1, third, c, wv, ` stroke-dasharray='3,3'`) +
      line(1, third * 2, s - 1, third * 2, c, wv, ` stroke-dasharray='3,3'`) +
      CLOSE
    );
  },

  '椭圆米字格': ({ s, c, wv }) =>
    svgTag(s) +
    rect(0.5, 0.5, s - 1, s - 1, c, wv) +
    `<ellipse cx='${s / 2}' cy='${s / 2}' rx='${s / 2 - 1}' ry='${s / 2 - 1}' fill='none' stroke='${c}' stroke-width='${wv}' stroke-dasharray='5,3'/>` +
    line(s / 2, 1, s / 2, s - 1, c, wv) +
    line(1, s / 2, s - 1, s / 2, c, wv) +
    line(1, 1, s - 1, s - 1, c, wv) +
    line(s - 1, 1, 1, s - 1, c, wv) +
    CLOSE,

  '圆形格': ({ s, c, wv }) =>
    svgTag(s) +
    `<circle cx='${s / 2}' cy='${s / 2}' r='${s / 2 - 1}' fill='none' stroke='${c}' stroke-width='${wv}'/>` +
    line(s / 2, 1, s / 2, s - 1, c, wv, ` stroke-dasharray='3,3'`) +
    line(1, s / 2, s - 1, s / 2, c, wv, ` stroke-dasharray='3,3'`) +
    CLOSE,

  '口字格': ({ s, c, wv }) => svgTag(s) + rect(0.5, 0.5, s - 1, s - 1, c, wv) + CLOSE,

  '田字格+斜': ({ s, c, wv }) =>
    svgTag(s) +
    rect(0.5, 0.5, s - 1, s - 1, c, wv) +
    line(s / 2, 1, s / 2, s - 1, c, wv) +
    line(1, s / 2, s - 1, s / 2, c, wv) +
    line(1, 1, s - 1, s - 1, c, wv) +
    line(s - 1, 1, 1, s - 1, c, wv) +
    CLOSE,

  '双田字格': ({ s, c, wv }) => {
    const h = s / 2;
    return (
      svgTag(s) +
      rect(0.5, 0.5, s - 1, s - 1, c, wv) +
      line(1, h, s - 1, h, c, wv) +
      line(h, 1, h, h, c, wv) +
      line(h, h, s - 1, h, c, wv) +
      line(h, 1, h, h, c, wv) +
      line(h / 2, 1, h / 2, h, c, wv, ` stroke-dasharray='2,2'`) +
      line(1, h / 2, h, h / 2, c, wv, ` stroke-dasharray='2,2'`) +
      line(h + h / 2, h, h + h / 2, s - 1, c, wv, ` stroke-dasharray='2,2'`) +
      line(h + 1, h + h / 2, s - 1, h + h / 2, c, wv, ` stroke-dasharray='2,2'`) +
      CLOSE
    );
  },

  '竖线格': ({ s, c, wv }) =>
    svgTag(s) +
    line(0, 0, 0, s, c, wv) +
    line(s, 0, s, s, c, wv) +
    CLOSE,

  '竖排田字格': ({ s, c, wv }) =>
    svgTag(s) +
    rect(0.5, 0.5, s - 1, s - 1, c, wv) +
    line(s / 2, 1, s / 2, s - 1, c, wv) +
    line(1, s / 2, s - 1, s / 2, c, wv) +
    CLOSE,

  '竖排米字格': ({ s, c, wv }) =>
    svgTag(s) +
    rect(0.5, 0.5, s - 1, s - 1, c, wv) +
    line(s / 2, 1, s / 2, s - 1, c, wv) +
    line(1, s / 2, s - 1, s / 2, c, wv) +
    line(1, 1, s - 1, s - 1, c, wv) +
    line(s - 1, 1, 1, s - 1, c, wv) +
    CLOSE,

  '数字格': ({ s, c, wv }) =>
    svgTag(s) +
    rect(0.5, 0.5, s - 1, s - 1, c, wv) +
    line(1, s / 2, s - 1, s / 2, c, wv, ` stroke-dasharray='2,2'`) +
    line(s / 2, 1, s / 2, s - 1, c, wv, ` stroke-dasharray='2,2'`) +
    CLOSE,

  '田格': ({ s, c, wv }) =>
    svgTag(s) +
    rect(0.5, 0.5, s - 1, s - 1, c, wv) +
    line(s / 2, 1, s / 2, s - 1, c, wv, ` stroke-dasharray='2,2'`) +
    line(1, s / 2, s - 1, s / 2, c, wv, ` stroke-dasharray='2,2'`) +
    CLOSE,
};

/**
 * 生成格子背景图（SVG data URL）
 * @param {string} type - 格子类型（见 GRID_TYPES）
 * @param {number} size - 格子边长（px）
 * @param {string} color - 线条颜色
 * @param {string} lineStyle - 线条样式（实线/虚线/点线/点划线）
 * @returns {string} CSS 可用的 url(...)，类型未知或「无格」时返回 ''
 */
export function svgDataURL(type, size, color, lineStyle) {
  const builder = BUILDERS[type];
  if (!builder) return '';

  const s = size;
  const c = color;
  const rootCS = getComputedStyle(document.documentElement);
  const wv = parseFloat(rootCS.getPropertyValue('--grid-stroke-width') || '1');
  const dash = DASH_MAP[lineStyle] || '';
  const thinDash = ` stroke-dasharray='2,2'`;

  return wrap(builder({ s, c, wv, dash, thinDash, rootCS, lineStyle }));
}
