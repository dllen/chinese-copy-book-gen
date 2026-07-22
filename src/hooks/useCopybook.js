import { useState, useEffect, useMemo, useCallback } from 'react'
import { useToast } from './useToast'

/**
 * 字帖生成核心逻辑 Hook
 * 包含文本解析、分页、导出、随机填充等核心业务逻辑
 * 支持外部传入 toast 实例，避免重复创建
 */
export default function useCopybook(settings, updateSetting, deps = {}) {
  const { toast: toastDep, removeToast: removeToastDep } = deps;
  const selfToast = useToast();
  const toast = toastDep || selfToast.toast;
  const removeToast = removeToastDep || selfToast.removeToast;

  // 本地状态（不在 useSettings 中的）
  const [letterStyle, setLetterStyle] = useState('印刷体');
  const [cellShadowLocal, setCellShadowLocal] = useState(false);
  const [alnumSeqLocal, setAlnumSeqLocal] = useState('');

  // 同步本地状态到 settings
  useEffect(() => {
    if (settings.letterStyle !== undefined) setLetterStyle(settings.letterStyle);
  }, [settings.letterStyle]);

  useEffect(() => {
    if (settings.cellShadow !== undefined) setCellShadowLocal(settings.cellShadow);
  }, [settings.cellShadow]);

  useEffect(() => {
    if (settings.alnumSeq !== undefined) setAlnumSeqLocal(settings.alnumSeq);
  }, [settings.alnumSeq]);

  // 文本解析（带防抖）
  const parsed = useMemo(() => {
    const cp = window.__copybook__ || {};
    const { feature, mode, text, variant, difficulty, alnumSeq, layout, cols, enBlankRows, enRepeat } = settings;

    if (feature === '控笔字帖') {
      if (cp.features && cp.features.buildControlPages) {
        return cp.features.buildControlPages(difficulty);
      }
      // Fallback
      const basic = ['一', '丨', '丿', '丶', '亅'];
      const mids = ['氵', '亻', '讠', '艹', '月', '女', '口', '木', '火', '土', '日', '目', '田'];
      const adv = ['永', '德', '善', '爱', '勇', '强'];
      let pool = difficulty === '初级' ? basic : difficulty === '中级' ? mids : adv;
      const seq = [];
      pool.forEach(c => { seq.push(c); seq.push(''); });
      return { pages: [seq] };
    }

    if (feature === '数字字母') {
      const s = alnumSeqLocal || '';
      return { pages: [Array.from(s)] };
    }

    if (feature === '字帖模板' && layout !== '连续排列' && cp.content && cp.content.layoutDocument) {
      return cp.content.layoutDocument(layout, text, cols, {
        blankRows: enBlankRows,
        repeat: enRepeat
      });
    }

    // 默认：使用 toCells
    const cpContent = cp.content;
    if (cpContent && cpContent.toCells) {
      return cpContent.toCells(mode, text, variant);
    }

    return { pages: [[]] };
  }, [settings, alnumSeqLocal]);

  // 分页
  const pages = useMemo(() => {
    const cp = window.__copybook__ || {};
    const paginateFn = cp.content?.paginate || window.__copybook__?.content?.paginate;
    if (!paginateFn) return [];
    return paginateFn(parsed.pages, settings.rows, settings.cols, settings.tailFill);
  }, [parsed, settings.rows, settings.cols, settings.tailFill]);

  // 使用统计
  const usage = useMemo(() => {
    const capacity = settings.rows * settings.cols * pages.length;
    let used = 0;
    pages.forEach(pg => pg.forEach(ch => { if (ch && ch !== '\n') used++; }));
    const warn = pages.length > 50;
    return { capacity, used, warn };
  }, [pages, settings.rows, settings.cols]);

  // 网格背景
  const bg = useMemo(() => {
    const cp = window.__copybook__ || {};
    const { gridType, cellSize, gridColor, customGridColor, lineStyle } = settings;
    const custom = customGridColor && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(customGridColor) ? customGridColor : null;
    const gColor = custom || (cp.utils?.toHex ? cp.utils.toHex(gridColor) : '#000');
    return cp.grid?.svgDataURL ? cp.grid.svgDataURL(gridType, cellSize, gColor, lineStyle) : '';
  }, [settings.gridType, settings.cellSize, settings.gridColor, settings.customGridColor, settings.lineStyle]);

  // 文字颜色
  const tColor = useMemo(() => {
    const custom = settings.customTextColor && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(settings.customTextColor) ? settings.customTextColor : null;
    const cp = window.__copybook__ || {};
    return custom || (cp.utils?.toHex ? cp.utils.toHex(settings.textColorOpt) : '#000');
  }, [settings.textColorOpt, settings.customTextColor]);

  // 字体
  const font = useMemo(() => {
    const cp = window.__copybook__ || {};
    return cp.utils?.fontByTemplate ? cp.utils.fontByTemplate(settings.template, settings.customFont) : 'serif';
  }, [settings.template, settings.customFont]);

  // 生成随机数字字母
  const genAlnum = useCallback((opts = {}) => {
    const {
      includeUpper = settings.alnumIncludeUpper,
      includeLower = settings.alnumIncludeLower,
      includeDigits = settings.alnumIncludeDigits,
      count = settings.alnumCount,
      noRepeat = settings.alnumNoRepeat
    } = opts;

    let pool = '';
    if (includeUpper) pool += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLower) pool += 'abcdefghijklmnopqrstuvwxyz';
    if (includeDigits) pool += '0123456789';

    const arr = Array.from(pool);
    if (arr.length === 0) {
      setAlnumSeqLocal('');
      updateSetting('alnumSeq', '');
      return;
    }

    const n = Math.max(1, Math.min(count, noRepeat ? arr.length : count));
    const out = [];

    if (noRepeat) {
      const used = new Set();
      for (let i = 0; i < n; i++) {
        let idx;
        do {
          const u = new Uint32Array(1);
          crypto.getRandomValues(u);
          idx = u[0] % arr.length;
        } while (used.has(idx));
        used.add(idx);
        out.push(arr[idx]);
      }
    } else {
      for (let i = 0; i < n; i++) {
        const u = new Uint32Array(1);
        crypto.getRandomValues(u);
        const idx = u[0] % arr.length;
        out.push(arr[idx]);
      }
    }

    const seq = out.join('');
    setAlnumSeqLocal(seq);
    updateSetting('alnumSeq', seq);
  }, [settings, updateSetting]);

  // 导出 PDF
  const exportPDF = useCallback((paper = settings.paper) => {
    const id = toast.progress('正在生成 PDF...');
    try {
      const cp = window.__copybook__ || {};
      if (cp.exporting?.exportPDF) {
        cp.exporting.exportPDF(paper);
        removeToast(id);
      } else {
        const opt = {
          margin: 0,
          filename: '字帖.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 4 },
          jsPDF: {
            unit: 'mm',
            format: paper?.indexOf('横版') > -1 ? 'a4' : 'a4',
            orientation: paper?.indexOf('横版') > -1 ? 'landscape' : 'portrait'
          }
        };
        const node = document.querySelectorAll('.page');
        const container = document.createElement('div');
        node.forEach(n => container.appendChild(n.cloneNode(true)));
        html2pdf().from(container).set(opt).save()
          .then(() => removeToast(id))
          .catch(() => removeToast(id));
      }
    } catch (err) {
      removeToast(id);
      toast.error('PDF导出失败：' + err.message);
    }
  }, [toast, removeToast]);

  // 导出图片
  const exportImage = useCallback(() => {
    const id = toast.progress('正在导出图片...');
    try {
      const cp = window.__copybook__ || {};
      if (cp.exporting?.exportImage) {
        cp.exporting.exportImage();
        removeToast(id);
      } else {
        const node = document.querySelectorAll('.page');
        const container = document.createElement('div');
        node.forEach(n => container.appendChild(n.cloneNode(true)));
        html2pdf().from(container).toImg().save('字帖.png')
          .then(() => removeToast(id))
          .catch(() => removeToast(id));
      }
    } catch (err) {
      removeToast(id);
      toast.error('图片导出失败：' + err.message);
    }
  }, [toast, removeToast]);

  // 导出 SVG
  const exportSVG = useCallback(() => {
    const nodes = document.querySelectorAll('.page');
    if (!nodes.length) return;

    if (nodes.length > 1) {
      console.warn('[exportSVG] Multiple pages detected, exporting first page only.');
    }

    const page = nodes[0];
    const grid = page.querySelector('.grid');
    if (!grid) return;

    const cells = grid.querySelectorAll('.cell');
    const rect = page.getBoundingClientRect();

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}" viewBox="0 0 ${rect.width} ${rect.height}">`;
    svg += `<style>text { font-family: inherit; }</style>`;
    svg += `<rect width="100%" height="100%" fill="${getComputedStyle(page).backgroundColor || '#fff'}"/>`;

    cells.forEach((cell) => {
      const cellRect = cell.getBoundingClientRect();
      const x = cellRect.left - rect.left;
      const y = cellRect.top - rect.top;
      const w = cellRect.width;
      const h = cellRect.height;
      const txt = cell.textContent || '';
      const bg = cell.style.backgroundImage || '';

      if (bg) {
        svg += `<image x="${x}" y="${y}" width="${w}" height="${h}" href="${bg}" />`;
      }
      if (txt.trim()) {
        const style = cell.style;
        const fsize = style.fontSize || '42px';
        const color = style.color || '#000';
        svg += `<text x="${x + w / 2}" y="${y + h / 2 + parseFloat(fsize) / 3}" text-anchor="middle" font-size="${fsize}" fill="${color}">${txt}</text>`;
      }
    });

    svg += '</svg>';
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '字帖.svg';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // 随机填充
  const fillRandom = useCallback((overwrite) => {
    const cp = window.__copybook__ || {};
    const s = cp.content?.sampleRandom ? cp.content.sampleRandom(settings.commonChars, settings.randCount, settings.randNoRepeat) : '';
    if (!s) return;
    if (overwrite) {
      updateSetting('text', s);
    } else {
      updateSetting('text', (settings.text || '') + s);
    }
  }, [settings, updateSetting]);

  // 从诗库插入
  const insertFromLibrary = useCallback((mode, text, append, layoutKind) => {
    if (layoutKind) {
      updateSetting('layout', layoutKind);
      if (layoutKind === '英文格式') {
        updateSetting('gridType', '四线三格');
        updateSetting('cols', Math.max(settings.cols, 10));
      }
    }
    updateSetting('mode', mode);
    updateSetting('variant', mode);
    if (append) {
      const p = (settings.text || '').trim();
      const sep = layoutKind ? '\n' : (mode === '多句' ? '|' : '');
      updateSetting('text', p ? p + sep + text : text);
    } else {
      updateSetting('text', text);
    }
  }, [settings, updateSetting]);

  return {
    // 状态
    letterStyle,
    cellShadowLocal,
    alnumSeqLocal,
    // 派生数据
    parsed,
    pages,
    usage,
    bg,
    tColor,
    font,
    // 操作函数
    genAlnum,
    exportPDF,
    exportImage,
    exportSVG,
    fillRandom,
    insertFromLibrary,
  };
}
