import React, { useState, useEffect, useMemo } from 'react';
import { useToast } from './hooks/useToast';
import { ToastContainer } from './components/Toast';
import { useSettings } from './hooks/useSettings';
import { useDebounce } from './hooks/useDebounce';
import { ErrorBoundary } from './components/ErrorBoundary';
import Toolbar from './components/Toolbar';
import ConfigPanel from './components/ConfigPanel';
import PreviewPanel from './components/PreviewPanel';
import PageGrid from './components/PageGrid';

const { toHex, fontByTemplate, pageSize, validate } = window.__copybook__.utils || {};

// Shared config fields (matches useSettings.DEFAULTS keys)
const CONFIG_FIELDS = [
  'gridType','gridColor','customGridColor','customTextColor','textColorOpt',
  'strokeMode','stylePreset','autoLayout','gridStrokeWidth','lineStyle',
  'cellRadius','pageBg','cellBg','cellBorder','textStroke','textShadow',
  'template','customFont','rows','cols','cellSize','gridGap','fontSize',
  'marginTop','marginRight','marginBottom','marginLeft','paper',
  'mode','variant','layout','text','feature','difficulty','showGuide',
  'letterStyle','enBlankRows','enRepeat','engShowZh','tailFill','header',
  'randCount','randNoRepeat','previewScale','cellShadow',
  'alnumIncludeDigits','alnumIncludeUpper','alnumIncludeLower',
  'alnumCount','alnumNoRepeat','alnumSeq'
];

function PreviewStatus({ pages, rows, cols }) {
  const capacity = (rows || 0) * (cols || 0);
  const used = pages.reduce((sum, pg) => sum + pg.filter(ch => ch && ch !== '\n').length, 0);
  const warn = pages.length > 50;
  return React.createElement('div', { className: 'd-flex flex-wrap gap-2 align-items-center legend' },
    React.createElement('span', null, `页数：${pages.length}`),
    React.createElement('span', null, `容量：${capacity}，已用：${used}`),
    warn ? React.createElement('span', { className: 'error' }, '页面过多，建议分批打印') : null
  );
}

export default function App() {
  const { toasts, toast, removeToast } = useToast();
  const { settings, updateSetting, setSettings } = useSettings(toast);

  // Destructure all settings
  const {
    mode, variant, layout, gridType, gridColor, customGridColor, customTextColor,
    textColorOpt, strokeMode, tailFill, template, customFont,
    rows, cols, cellSize, gridGap, fontSize,
    marginTop, marginRight, marginBottom, marginLeft,
    paper, header, text, randCount, randNoRepeat, previewScale,
    feature, difficulty, showGuide,
    enBlankRows, enRepeat, engShowZh,
    stylePreset, autoLayout, gridStrokeWidth, lineStyle,
    cellRadius, pageBg, cellBg, cellBorder, cellShadow, textShadow, textStroke,
    alnumIncludeDigits, alnumIncludeUpper, alnumIncludeLower,
    alnumCount, alnumNoRepeat, alnumSeq
  } = settings;

  // letterStyle is not in useSettings DEFAULTS, manage separately
  const [letterStyle, setLetterStyle] = useState('印刷体');
  useEffect(() => { if (settings.letterStyle !== undefined) setLetterStyle(settings.letterStyle); }, []);
  const handleLetterStyle = (v) => { setLetterStyle(v); updateSetting('letterStyle', v); };

  // cellShadow is not in useSettings DEFAULTS, manage separately
  const [cellShadowLocal, setCellShadowLocal] = useState(false);
  useEffect(() => { if (settings.cellShadow !== undefined) setCellShadowLocal(settings.cellShadow); }, []);
  const handleCellShadow = (v) => { setCellShadowLocal(v); updateSetting('cellShadow', v); };

  // alnumSeq is not in useSettings DEFAULTS, manage separately
  const [alnumSeqLocal, setAlnumSeqLocal] = useState('');
  useEffect(() => { if (settings.alnumSeq !== undefined) setAlnumSeqLocal(settings.alnumSeq); }, []);
  const handleAlnumSeq = (v) => { setAlnumSeqLocal(v); updateSetting('alnumSeq', v); };

  // Numeric input handlers with clamping
  const handleSetRows = (v) => updateSetting('rows', Math.max(1, Math.min(20, parseInt(v) || 1)));
  const handleSetCols = (v) => updateSetting('cols', Math.max(1, Math.min(20, parseInt(v) || 1)));
  const handleSetCellSize = (v) => updateSetting('cellSize', Math.max(30, Math.min(100, parseInt(v) || 60)));
  const handleSetGridGap = (v) => updateSetting('gridGap', Math.max(0, Math.min(20, parseInt(v) || 0)));
  const handleSetFontSize = (v) => updateSetting('fontSize', Math.max(12, Math.min(100, parseInt(v) || 42)));
  const handleSetMarginTop = (v) => updateSetting('marginTop', Math.max(0, Math.min(50, parseInt(v) || 0)));
  const handleSetMarginRight = (v) => updateSetting('marginRight', Math.max(0, Math.min(50, parseInt(v) || 0)));
  const handleSetMarginBottom = (v) => updateSetting('marginBottom', Math.max(0, Math.min(50, parseInt(v) || 0)));
  const handleSetMarginLeft = (v) => updateSetting('marginLeft', Math.max(0, Math.min(50, parseInt(v) || 0)));
  const handleSetEnRepeat = (v) => updateSetting('enRepeat', Math.max(1, Math.min(5, parseInt(v) || 1)));
  const handleSetRandCount = (v) => updateSetting('randCount', Math.max(1, parseInt(v) || 1));
  const handleSetAlnumCount = (v) => {
    const n = Math.max(1, parseInt(v) || 20);
    updateSetting('alnumCount', n);
    genAlnum({ count: n });
  };
  const handleSetCellRadius = (v) => updateSetting('cellRadius', parseInt(v) || 0);
  const handleSetGridStrokeWidth = (v) => updateSetting('gridStrokeWidth', parseFloat(v) || 1);
  const handleSetPreviewScale = (v) => updateSetting('previewScale', parseFloat(v) || 1);
  const handleSetCellShadow = (v) => { setCellShadowLocal(v); updateSetting('cellShadow', v); };

  // Common chars loading
  const [commonChars, setCommonChars] = useState([]);
  useEffect(() => {
    const emb = (window.__copybookData__ || {}).commonChars;
    if (emb) { setCommonChars([...new Set(emb.filter(ch => /[一-鿿]/.test(ch)))]); return; }
    fetch('./common-chars.json').then(r => r.json()).then(arr => {
      const uniq = [...new Set((arr || []).filter(ch => /[一-鿿]/.test(ch)))];
      setCommonChars(uniq);
    }).catch(() => {
      fetch('./常用1000汉子.md').then(r => r.text()).then(t => {
        const lines = t.split('\n'); let buckets = []; let curName = ''; let curChars = [];
        for (const line of lines) {
          const isTitle = line.startsWith('##');
          if (isTitle) {
            if (curName) { buckets.push({ name: curName.trim(), chars: [...new Set(curChars)] }); }
            curName = line.replace(/^#+\s*/, '').trim(); curChars = [];
          } else {
            const arr = Array.from(line).filter(ch => /[一-鿿]/.test(ch));
            if (arr.length) curChars.push(...arr);
          }
        }
        if (curName) { buckets.push({ name: curName.trim(), chars: [...new Set(curChars)] }); }
        const all = [...new Set(buckets.flatMap(b => b.chars))];
        setCommonChars(all);
      }).catch(() => { setCommonChars([]); });
    });
  }, []);

  // Mobile preview scale
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(max-width: 576px)').matches) {
      updateSetting('previewScale', 0.6);
    }
  }, []);

  // Auto-gen alnum when feature changes to alnum
  useEffect(() => {
    if (feature === '数字字母') {
      updateSetting('gridType', '四线三格');
      if (!alnumSeqLocal) genAlnum();
    }
  }, [feature]);

  // CSS variable: preview scale
  useEffect(() => {
    document.documentElement.style.setProperty('--preview-scale', String(previewScale));
  }, [previewScale]);

  // gColor derived
  const gColor = useMemo(() => {
    const custom = customGridColor && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(customGridColor) ? customGridColor : null;
    return custom || toHex(gridColor);
  }, [gridColor, customGridColor]);

  // tColor derived
  const tColor = useMemo(() => {
    const custom = customTextColor && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(customTextColor) ? customTextColor : null;
    return custom || toHex(textColorOpt);
  }, [textColorOpt, customTextColor]);

  // Debounce text for heavy operations
  const debouncedText = useDebounce(text, 300);

  // parsed useMemo - use debouncedText instead of text
  const parsed = useMemo(() => {
    const cp = window.__copybook__ || {};
    if (feature === '控笔字帖') {
      if (cp.features && cp.features.buildControlPages) return cp.features.buildControlPages(difficulty);
      const basic = ['一', '丨', '丿', '丶', '亅'];
      const mids = ['氵', '亻', '讠', '艹', '月', '女', '口', '木', '火', '土', '日', '目', '田'];
      const adv = ['永', '德', '善', '爱', '勇', '强'];
      let pool = [];
      if (difficulty === '初级') pool = basic;
      else if (difficulty === '中级') pool = mids;
      else pool = adv;
      const seq = [];
      pool.forEach(c => { seq.push(c); seq.push(''); });
      return { pages: [seq] };
    }
    if (feature === '数字字母') {
      const s = alnumSeqLocal || '';
      return { pages: [Array.from(s)] };
    }
    if (feature === '字帖模板' && layout !== '连续排列' && cp.content && cp.content.layoutDocument) {
      return cp.content.layoutDocument(layout, text, cols, { blankRows: enBlankRows, repeat: enRepeat });
    }
    return (cp.content && cp.content.toCells ? cp.content.toCells(mode, debouncedText, variant) : {});
  }, [feature, mode, debouncedText, variant, difficulty, alnumSeqLocal, layout, cols, enBlankRows, enRepeat]);

  // pages useMemo
  const pages = useMemo(() => {
    const cp = window.__copybook__ || {};
    const paginateFn = cp.content && cp.content.paginate || (cp.content && cp.content.paginate);
    const fn = paginateFn || (window.__copybook__.content && window.__copybook__.content.paginate);
    return fn ? fn(parsed.pages, rows, cols, tailFill) : [];
  }, [parsed, rows, cols, tailFill]);

  // usage useMemo
  const usage = useMemo(() => {
    const capacity = rows * cols * pages.length;
    let used = 0;
    pages.forEach(pg => pg.forEach(ch => { if (ch && ch !== '\n') used++; }));
    const warn = pages.length > 50;
    return { capacity, used, warn };
  }, [pages, rows, cols]);

  // bg useMemo
  const bg = useMemo(() => {
    const cp = window.__copybook__ || {};
    return cp.grid ? cp.grid.svgDataURL(gridType, cellSize, gColor, lineStyle) : '';
  }, [gridType, cellSize, gColor, lineStyle]);

  // Page/grid CSS variables
  useEffect(() => {
    const sz = pageSize(paper);
    document.documentElement.style.setProperty('--page-width', sz.w);
    document.documentElement.style.setProperty('--page-height', sz.h);
    document.documentElement.style.setProperty('--cell-size', `${cellSize}px`);
    document.documentElement.style.setProperty('--grid-gap', `${gridGap}px`);
    document.documentElement.style.setProperty('--grid-color', gColor);
    document.documentElement.style.setProperty('--text-color', tColor);
    document.documentElement.style.setProperty('--font-size', `${fontSize}px`);
    document.documentElement.style.setProperty('--page-margin-top', `${marginTop}mm`);
    document.documentElement.style.setProperty('--page-margin-right', `${marginRight}mm`);
    document.documentElement.style.setProperty('--page-margin-bottom', `${marginBottom}mm`);
    document.documentElement.style.setProperty('--page-margin-left', `${marginLeft}mm`);
    document.documentElement.style.setProperty('--guide-color', gColor);
    document.documentElement.style.setProperty('--page-bg', toHex(pageBg) || '#fff');
    document.documentElement.style.setProperty('--cell-bg', toHex(cellBg) || 'transparent');
    document.documentElement.style.setProperty('--cell-border-width', cellBorder ? '2px' : '0px');
    document.documentElement.style.setProperty('--cell-shadow', cellShadowLocal ? '0 2px 4px rgba(0,0,0,0.1)' : 'none');
    document.documentElement.style.setProperty('--text-stroke-width', textStroke === '无' ? '0px' : textStroke === '细' ? '0.5px' : textStroke === '中' ? '1px' : '2px');
    document.documentElement.style.setProperty('--text-shadow', textShadow ? '2px 2px 4px rgba(0,0,0,0.3)' : 'none');
  }, [paper, cellSize, gridGap, gColor, tColor, fontSize, marginTop, marginRight, marginBottom, marginLeft, pageBg, cellBg, cellBorder, cellShadowLocal, textShadow, textStroke]);

  useEffect(() => {
    document.documentElement.style.setProperty('--grid-stroke-width', String(gridStrokeWidth));
    document.documentElement.style.setProperty('--cell-radius', `${cellRadius}px`);
  }, [gridStrokeWidth, cellRadius]);

  useEffect(() => {
    document.documentElement.style.setProperty('--en-descent', letterStyle === '手写体' ? '0.286em' : '0.238em');
  }, [letterStyle]);

  useEffect(() => {
    if (stylePreset === '四线三格标准') {
      document.documentElement.style.setProperty('--fourline-y1', '0.25');
      document.documentElement.style.setProperty('--fourline-y2', '0.50');
      document.documentElement.style.setProperty('--fourline-y3', '0.75');
      document.documentElement.style.setProperty('--fourline-y4', '0.92');
      updateSetting('gridType', '四线三格');
    } else if (stylePreset === '四线三格宽间') {
      document.documentElement.style.setProperty('--fourline-y1', '0.20');
      document.documentElement.style.setProperty('--fourline-y2', '0.50');
      document.documentElement.style.setProperty('--fourline-y3', '0.80');
      document.documentElement.style.setProperty('--fourline-y4', '0.95');
      updateSetting('gridType', '四线三格');
    } else if (stylePreset === '田字格标准') {
      updateSetting('gridType', '田字格');
    } else if (stylePreset === '米字格标准') {
      updateSetting('gridType', '米字格');
    } else if (stylePreset === '米字格宽间') {
      updateSetting('gridType', '米字格');
    } else if (stylePreset === '回宫格标准') {
      updateSetting('gridType', '回宫格');
    } else if (stylePreset === '回宫格宽间') {
      updateSetting('gridType', '回宫格');
    } else if (stylePreset === '现代简约') {
      updateSetting('gridType', '田字格');
      document.documentElement.style.setProperty('--cell-radius', '4px');
      document.documentElement.style.setProperty('--grid-stroke-width', '0.5');
    } else if (stylePreset === '儿童卡通') {
      updateSetting('gridType', '田字格');
      document.documentElement.style.setProperty('--cell-radius', '8px');
      document.documentElement.style.setProperty('--grid-stroke-width', '2');
    }
  }, [stylePreset]);

  useEffect(() => {
    if (autoLayout && gridType === '四线三格') {
      const s = (text || '');
      const upp = (s.match(/[A-Z]/g) || []).length;
      const low = (s.match(/[a-z]/g) || []).length;
      const dig = (s.match(/[0-9]/g) || []).length;
      const total = Math.max(1, upp + low + dig);
      const ru = upp / total, rl = low / total, rd = dig / total;
      let y1 = '0.23', y2 = '0.50', y3 = '0.77', y4 = '0.94';
      if (ru > 0.5) { y1 = '0.20'; y3 = '0.80'; y4 = '0.96'; }
      else if (rl > 0.5) { y1 = '0.25'; y3 = '0.75'; y4 = '0.92'; }
      else if (rd > 0.5) { y1 = '0.22'; y3 = '0.78'; y4 = '0.95'; }
      document.documentElement.style.setProperty('--fourline-y1', y1);
      document.documentElement.style.setProperty('--fourline-y2', '0.50');
      document.documentElement.style.setProperty('--fourline-y3', y3);
      document.documentElement.style.setProperty('--fourline-y4', y4);
    }
  }, [autoLayout, gridType, text]);

  const font = fontByTemplate(template, customFont);
  const validationResult = layout !== '连续排列' ? ((text && text.trim()) ? { ok: true, msg: '' } : { ok: false, msg: '请输入内容' }) : validate(mode, text);

  // --- Action handlers ---

  function resetConfig() {
    if (!confirm('确定要重置所有设置到默认值吗？')) return;
    localStorage.removeItem('copybook.settings');
    window.location.reload();
  }

  function saveTemplate() {
    const name = prompt('请输入模板名称：', '我的模板');
    if (!name) return;
    const config = {
      gridType, gridColor, customGridColor, customTextColor, textColorOpt,
      strokeMode, stylePreset, autoLayout, gridStrokeWidth, lineStyle,
      cellRadius, pageBg, cellBg, cellBorder, textStroke, textShadow,
      template, customFont, rows, cols, cellSize, gridGap, fontSize,
      marginTop, marginRight, marginBottom, marginLeft, paper
    };
    const payload = {
      name,
      createdAt: new Date().toISOString(),
      config,
      content: { mode, variant, layout, text }
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${payload.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function loadTemplate(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const tmpl = JSON.parse(event.target.result);
        const config = tmpl.config || {};
        const content = tmpl.content || {};
        Object.entries(config).forEach(([k, v]) => { if (v !== undefined && CONFIG_FIELDS.includes(k)) updateSetting(k, v); });
        if (content.mode) updateSetting('mode', content.mode);
        if (content.variant) updateSetting('variant', content.variant);
        if (content.layout) updateSetting('layout', content.layout);
        if (content.text) updateSetting('text', content.text);
        toast.success(`模板"${tmpl.name || '未命名'}"加载成功！`);
      } catch (err) {
        toast.error('模板加载失败：' + err.message);
      }
    };
    reader.readAsText(file);
  }

  function exportConfig() {
    const config = {
      gridType, gridColor, customGridColor, customTextColor, textColorOpt,
      strokeMode, stylePreset, autoLayout, gridStrokeWidth, lineStyle,
      cellRadius, pageBg, cellBg, cellBorder, textStroke, textShadow,
      template, customFont, rows, cols, cellSize, gridGap, fontSize,
      marginTop, marginRight, marginBottom, marginLeft, paper
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '字帖配置.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function importConfig(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const config = JSON.parse(event.target.result);
        Object.entries(config).forEach(([k, v]) => { if (v !== undefined && CONFIG_FIELDS.includes(k)) updateSetting(k, v); });
        toast.success('配置导入成功！');
      } catch (err) {
        toast.error('配置导入失败：' + err.message);
      }
    };
    reader.readAsText(file);
  }

  function genAlnum(opts = {}) {
    const includeUpper = opts.includeUpper !== undefined ? opts.includeUpper : alnumIncludeUpper;
    const includeLower = opts.includeLower !== undefined ? opts.includeLower : alnumIncludeLower;
    const includeDigits = opts.includeDigits !== undefined ? opts.includeDigits : alnumIncludeDigits;
    const count = opts.count !== undefined ? opts.count : alnumCount;
    const noRepeat = opts.noRepeat !== undefined ? opts.noRepeat : alnumNoRepeat;
    let pool = '';
    if (includeUpper) pool += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeLower) pool += 'abcdefghijklmnopqrstuvwxyz';
    if (includeDigits) pool += '0123456789';
    const arr = Array.from(pool);
    if (arr.length === 0) { handleAlnumSeq(''); return; }
    const n = Math.max(1, Math.min(count, noRepeat ? arr.length : count));
    const out = [];
    if (noRepeat) {
      const used = new Set();
      for (let i = 0; i < n; i++) {
        let idx;
        do { const u = new Uint32Array(1); crypto.getRandomValues(u); idx = u[0] % arr.length; } while (used.has(idx));
        used.add(idx); out.push(arr[idx]);
      }
    } else {
      for (let i = 0; i < n; i++) {
        const u = new Uint32Array(1); crypto.getRandomValues(u); const idx = u[0] % arr.length; out.push(arr[idx]);
      }
    }
    handleAlnumSeq(out.join(''));
  }

  const alnumStats = useMemo(() => {
    const s = alnumSeqLocal || '';
    const up = (s.match(/[A-Z]/g) || []).length;
    const low = (s.match(/[a-z]/g) || []).length;
    const dig = (s.match(/[0-9]/g) || []).length;
    const total = Math.max(1, s.length);
    return { up, low, dig, upPct: Math.round(up * 100 / total), lowPct: Math.round(low * 100 / total), digPct: Math.round(dig * 100 / total), total };
  }, [alnumSeqLocal]);

  function exportPDF() {
    const id = toast.progress('正在生成 PDF...');
    try {
      const cp = window.__copybook__ || {};
      if (cp.exporting && cp.exporting.exportPDF) {
        cp.exporting.exportPDF(paper);
        removeToast(id);
      } else {
        const opt = {
          margin: 0, filename: '字帖.pdf', image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 4 },
          jsPDF: { unit: 'mm', format: paper.indexOf('横版') > -1 ? 'a4' : 'a4', orientation: paper.indexOf('横版') > -1 ? 'landscape' : 'portrait' }
        };
        const node = document.querySelectorAll('.page');
        const container = document.createElement('div');
        node.forEach(n => container.appendChild(n.cloneNode(true)));
        html2pdf().from(container).set(opt).save().then(() => removeToast(id)).catch(() => removeToast(id));
      }
    } catch (err) {
      removeToast(id);
      toast.error('PDF导出失败：' + err.message);
    }
  }

  function exportImage() {
    const id = toast.progress('正在导出图片...');
    try {
      const cp = window.__copybook__ || {};
      if (cp.exporting && cp.exporting.exportImage) {
        cp.exporting.exportImage();
        removeToast(id);
      } else {
        const node = document.querySelectorAll('.page');
        const container = document.createElement('div');
        node.forEach(n => container.appendChild(n.cloneNode(true)));
        html2pdf().from(container).toImg().save('字帖.png').then(() => removeToast(id)).catch(() => removeToast(id));
      }
    } catch (err) {
      removeToast(id);
      toast.error('图片导出失败：' + err.message);
    }
  }

  function exportSVG() {
    const nodes = document.querySelectorAll('.page');
    if (!nodes.length) return;
    if (nodes.length > 1) {
      console.warn('[exportSVG] Multiple pages detected, exporting first page only. ZIP packaging is a future enhancement.');
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
      if (bg) { svg += `<image x="${x}" y="${y}" width="${w}" height="${h}" href="${bg}" />`; }
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
  }

  function fillRandom(overwrite) {
    const s = window.__copybook__.content.sampleRandom(commonChars, randCount, randNoRepeat);
    if (!s) return;
    if (overwrite) { updateSetting('text', s); }
    else { updateSetting('text', (settings.text || '') + s); }
  }

  function engFont(style) {
    return style === '手写体' ? "'Comic Sans MS','Chalkboard SE','Segoe Script',cursive" : "'Arial','Helvetica Neue','Helvetica',sans-serif";
  }

  function insertFromLibrary(m, t, append, layoutKind) {
    if (layoutKind) {
      updateSetting('layout', layoutKind);
      if (layoutKind === '英文格式') {
        updateSetting('gridType', '四线三格');
        updateSetting('cols', Math.max(settings.cols, 10));
      }
    }
    updateSetting('mode', m);
    updateSetting('variant', m);
    if (append) {
      const p = (settings.text || '').trim();
      const sep = layoutKind ? '\n' : (m === '多句' ? '|' : '');
      updateSetting('text', p ? p + sep + t : t);
    } else {
      updateSetting('text', t);
    }
  }

  const cp = window.__copybook__ || {};

  return React.createElement(React.Fragment, null,
    React.createElement(ToastContainer, { toasts, onRemove: removeToast }),
    React.createElement('div', { className: 'container py-3' },
      React.createElement('div', { className: 'no-print mb-3' },
        React.createElement('h1', { className: 'h4 mb-3' }, '字帖生成器'),
        React.createElement('div', { className: 'row g-3' },
          // Left panel - ConfigPanel + Toolbar
          React.createElement('div', { className: 'col-lg-7' },
            React.createElement(ConfigPanel, {
              // Settings state
              mode, variant, layout, gridType, gridColor, customGridColor, customTextColor,
              textColorOpt, strokeMode, tailFill, template, customFont,
              rows, cols, cellSize, gridGap, fontSize,
              marginTop, marginRight, marginBottom, marginLeft,
              paper, header, text, randCount, randNoRepeat, previewScale,
              feature, difficulty, showGuide,
              enBlankRows, enRepeat, engShowZh,
              stylePreset, autoLayout, gridStrokeWidth, lineStyle,
              cellRadius, pageBg, cellBg, cellBorder, cellShadow, textShadow, textStroke,
              alnumIncludeDigits, alnumIncludeUpper, alnumIncludeLower,
              alnumCount, alnumNoRepeat, alnumSeqLocal,
              letterStyle, cellShadowLocal,
              // Setters
              updateSetting,
              handleLetterStyle,
              handleCellShadow,
              handleSetRows,
              handleSetCols,
              handleSetCellSize,
              handleSetGridGap,
              handleSetFontSize,
              handleSetMarginTop,
              handleSetMarginRight,
              handleSetMarginBottom,
              handleSetMarginLeft,
              handleSetEnRepeat,
              handleSetRandCount,
              handleSetAlnumCount,
              handleSetCellRadius,
              handleSetGridStrokeWidth,
              handleSetPreviewScale,
              handleAlnumSeq,
              handleSetCellShadow,
              // Handlers
              onInsert: insertFromLibrary,
              onEngShowZhChange: v => updateSetting('engShowZh', v),
              onGenAlnum: genAlnum,
              // Validation
              validationResult,
              // Alphanumeric stats
              alnumStats
            }),
            React.createElement(Toolbar, {
              pages,
              onPrint: () => window.print(),
              onExportPDF: exportPDF,
              onExportImage: exportImage,
              onSaveTemplate: saveTemplate,
              onLoadTemplate: loadTemplate,
              onExportConfig: exportConfig,
              onImportConfig: importConfig,
              onReset: resetConfig
            })
          ),

          // Right panel - PreviewPanel
          React.createElement('div', { className: 'col-lg-5' },
            React.createElement(PreviewPanel, {
              settings,
              onFillRandom: fillRandom,
              commonChars,
              handleSetPreviewScale,
              handleSetRandCount,
              updateSetting,
              usage
            })
          )
        )
      ),

      // Page output - PageGrid
      React.createElement(PageGrid, {
        pages,
        cols,
        layout,
        feature,
        header,
        bg,
        tColor,
        strokeMode,
        font,
        fontSize,
        letterStyle,
        showGuide,
        engFont
      })
    )
  );
}
