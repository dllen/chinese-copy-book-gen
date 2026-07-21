import React, { useState, useEffect, useMemo } from 'react';
import { useToast } from './hooks/useToast';
import { ToastContainer } from './components/Toast';
import { useSettings } from './hooks/useSettings';
import { useDebounce } from './hooks/useDebounce';
import { ErrorBoundary } from './components/ErrorBoundary';

const { toHex, strokeLevel, fontByTemplate, pageSize, validate } = window.__copybook__.utils || {};
const { splitRows } = window.__copybook__.content || {};

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

// Wraps LibraryPanel to catch React 18 hooks incompatibility
class LibraryPanelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

function Cell({ ch, bg, textColor, strokeMode, font, fontSize, showGuide, cls }) {
  const style = strokeLevel(strokeMode, textColor);
  return React.createElement('div', {
    className: 'cell' + (cls ? ' ' + cls : ''),
    style: {
      backgroundImage: bg,
      color: style.color,
      WebkitTextStroke: style.WebkitTextStroke,
      opacity: style.opacity,
      fontFamily: font,
      fontSize: fontSize
    }
  }, ch || '', showGuide ? React.createElement('div', { className: 'guide' },
    React.createElement('div', { className: 'guide-arrow' })
  ) : null);
}

function Section({ title, children, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen !== false);
  return React.createElement('div', { className: 'mb-3 border rounded' },
    React.createElement('div', { className: 'p-2 d-flex justify-content-between align-items-center' },
      React.createElement('div', { className: 'fw-semibold' }, title),
      React.createElement('button', {
        className: 'btn btn-sm btn-outline-secondary',
        type: 'button',
        'aria-expanded': String(open),
        onClick: () => setOpen(v => !v)
      }, open ? '收起' : '展开')
    ),
    open ? React.createElement('div', { className: 'p-2 pt-0' }, children) : null
  );
}

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

function ConfigSummary({ gridType, gridColor, stylePreset, rows, cols, cellSize, fontSize }) {
  const summary = [
    { label: '格子', value: gridType },
    { label: '颜色', value: gridColor },
    { label: '预设', value: stylePreset },
    { label: '尺寸', value: `${cols}×${rows}格` },
    { label: '格子大小', value: `${cellSize}px` },
    { label: '字体', value: `${fontSize}px` }
  ].filter(item => item.value).map(item =>
    React.createElement('span', { className: 'badge bg-secondary me-1 mb-1' },
      `${item.label}: ${item.value}`
    )
  );
  return React.createElement('div', { className: 'config-summary mt-2 p-2 bg-light rounded' },
    React.createElement('small', { className: 'text-muted' }, '当前配置：'),
    React.createElement('div', { className: 'mt-1' }, ...summary)
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
  const v = layout !== '连续排列' ? ((text && text.trim()) ? { ok: true, msg: '' } : { ok: false, msg: '请输入内容' }) : validate(mode, text);

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
          // Left panel
          React.createElement('div', { className: 'col-lg-7' },
            React.createElement('div', { className: 'card' },
              React.createElement('div', { className: 'card-body' },

                // Feature module
                React.createElement('div', { className: 'mb-2' },
                  React.createElement('label', { className: 'form-label', htmlFor: 'feature' }, '功能模块'),
                  React.createElement('select', { id: 'feature', className: 'form-select', value: feature, onChange: e => updateSetting('feature', e.target.value) },
                    ['字帖模板', '控笔字帖', '数字字母'].map(v => React.createElement('option', { key: v, value: v }, v))
                  )
                ),

                // Layout format (字帖模板)
                feature === '字帖模板' ? React.createElement('div', { className: 'mb-2' },
                  React.createElement('label', { className: 'form-label', htmlFor: 'layout' }, '排版格式'),
                  React.createElement('select', { id: 'layout', className: 'form-select', value: layout, onChange: e => updateSetting('layout', e.target.value), 'aria-label': '排版格式' },
                    ['连续排列', '古诗格式', '文章格式', '英文格式'].map(v => React.createElement('option', { key: v, value: v }, v))
                  ),
                  layout === '古诗格式' ? React.createElement('div', { className: 'form-text' }, '无标点的短行（标题、作者）自动居中；诗句按标点分行居中。') : null,
                  layout === '文章格式' ? React.createElement('div', { className: 'form-text' }, '首行为标题（居中）；其余每行为一段，段首缩进两格；标点自动避头尾。') : null,
                  layout === '英文格式' ? React.createElement('div', { className: 'form-text' }, '按词换行（不拆词），词间一格；每个输入行另起一行，空行留空行。自动使用四线三格，建议 10 列以上。') : null
                ) : null,

                // English format options
                layout === '英文格式' ? React.createElement('div', { className: 'row g-2 mb-2' },
                  React.createElement('div', { className: 'col-4' },
                    React.createElement('label', { className: 'form-label', htmlFor: 'letterStyle' }, '英文字体'),
                    React.createElement('select', { id: 'letterStyle', className: 'form-select', value: letterStyle, onChange: e => handleLetterStyle(e.target.value) },
                      ['印刷体', '手写体'].map(v => React.createElement('option', { key: v, value: v }, v))
                    )
                  ),
                  React.createElement('div', { className: 'col-4' },
                    React.createElement('label', { className: 'form-label', htmlFor: 'enBlankRows' }, '临摹空行'),
                    React.createElement('select', { id: 'enBlankRows', className: 'form-select', value: enBlankRows, onChange: e => updateSetting('enBlankRows', parseInt(e.target.value || '0')) },
                      [[0, '无'], [1, '1 行'], [2, '2 行']].map(([v, l]) => React.createElement('option', { key: v, value: v }, l))
                    )
                  ),
                  React.createElement('div', { className: 'col-4' },
                    React.createElement('label', { className: 'form-label', htmlFor: 'enRepeat' }, '单词重复'),
                    React.createElement('input', { id: 'enRepeat', className: 'form-control', type: 'number', min: 1, max: 5, value: enRepeat, onChange: e => handleSetEnRepeat(e.target.value) })
                  )
                ) : null,

                // Mode (连续排列 only)
                feature === '字帖模板' && layout === '连续排列' ? React.createElement('div', { className: 'mb-2' },
                  React.createElement('label', { className: 'form-label', htmlFor: 'mode' }, '文本类型'),
                  React.createElement('select', { id: 'mode', className: 'form-select', value: mode, onChange: e => { updateSetting('mode', e.target.value); updateSetting('variant', e.target.value); }, 'aria-label': '文本类型' },
                    ['多字', '多词', '多句', '文章'].map(v => React.createElement('option', { key: v, value: v }, v))
                  )
                ) : null,

                // Variant
                feature === '字帖模板' && layout === '连续排列' ? React.createElement('div', { className: 'mb-2' },
                  React.createElement('label', { className: 'form-label', htmlFor: 'variant' }, '变体'),
                  React.createElement('select', { id: 'variant', className: 'form-select', value: variant, onChange: e => updateSetting('variant', e.target.value) },
                    [`${mode}`, `${mode}+1行`, `${mode}+1空行`, `${mode}+1行+1空行`].map(v => React.createElement('option', { key: v, value: v }, v))
                  )
                ) : null,

                // Library panel - wrapped in error boundary for React 18 hooks compatibility
                feature === '字帖模板' && window.__copybook__.library ? React.createElement(LibraryPanelErrorBoundary, null,
                  React.createElement(window.__copybook__.library.LibraryPanel, { onInsert: insertFromLibrary, engShowZh: engShowZh, onEngShowZhChange: v => updateSetting('engShowZh', v) })
                ) : null,

                // Text input (字帖模板)
                feature === '字帖模板' ? React.createElement('div', { className: 'mb-2' },
                  React.createElement('label', { className: 'form-label', htmlFor: 'text' }, '输入'),
                  React.createElement('textarea', { id: 'text', className: `form-control ${v.ok ? '' : 'is-invalid'}`, rows: 4, placeholder: '在此输入内容。多词用 | 或逗号/空格分隔；多句用 | 分隔页面。', value: text, onChange: e => updateSetting('text', e.target.value), 'aria-describedby': 'textHelp' }),
                  React.createElement('div', { id: 'textHelp', className: 'form-text' }, '支持批量粘贴。'),
                  v.ok ? null : React.createElement('div', { className: 'invalid-feedback', role: 'alert' }, v.msg)
                ) : null,

                // Difficulty (控笔字帖)
                feature === '控笔字帖' ? React.createElement('div', { className: 'mb-2' },
                  React.createElement('label', { className: 'form-label', htmlFor: 'difficulty' }, '难度'),
                  React.createElement('select', { id: 'difficulty', className: 'form-select', value: difficulty, onChange: e => updateSetting('difficulty', e.target.value) },
                    ['初级', '中级', '高级'].map(v => React.createElement('option', { key: v, value: v }, v))
                  )
                ) : null,

                // Letter/number style + guide (数字字母)
                feature === '数字字母' ? React.createElement('div', { className: 'mb-2' },
                  React.createElement('label', { className: 'form-label', htmlFor: 'letterStyle' }, '风格'),
                  React.createElement('select', { id: 'letterStyle', className: 'form-select', value: letterStyle, onChange: e => handleLetterStyle(e.target.value) },
                    ['印刷体', '手写体'].map(v => React.createElement('option', { key: v, value: v }, v))
                  ),
                  React.createElement('div', { className: 'form-check mt-2' },
                    React.createElement('input', { className: 'form-check-input', type: 'checkbox', id: 'guide', checked: showGuide, onChange: e => updateSetting('showGuide', e.target.checked) }),
                    React.createElement('label', { className: 'form-check-label', htmlFor: 'guide' }, '显示指示箭头')
                  )
                ) : null,

                // Alphanumeric section
                feature === '数字字母' ? React.createElement('div', { className: 'mt-2' },
                  React.createElement('div', { className: 'fw-bold mb-2' }, '字母数字（随机生成）'),
                  React.createElement('div', { className: 'row g-2' },
                    React.createElement('div', { className: 'col-6' },
                      React.createElement('label', { className: 'form-label', htmlFor: 'alnumCount' }, '数量'),
                      React.createElement('input', { id: 'alnumCount', className: 'form-control', type: 'number', min: 1, value: alnumCount, onChange: e => handleSetAlnumCount(e.target.value) })
                    ),
                    React.createElement('div', { className: 'col-6 d-flex align-items-end' },
                      React.createElement('div', { className: 'form-check form-switch' },
                        React.createElement('input', { className: 'form-check-input', type: 'checkbox', id: 'alnumNoRepeat', checked: alnumNoRepeat, onChange: e => { const v = e.target.checked; updateSetting('alnumNoRepeat', v); genAlnum({ noRepeat: v }); } }),
                        React.createElement('label', { className: 'form-check-label', htmlFor: 'alnumNoRepeat' }, '不重复')
                      )
                    )
                  ),
                  React.createElement('div', { className: 'row g-2 mt-1' },
                    React.createElement('div', { className: 'col-4' },
                      React.createElement('div', { className: 'form-check form-switch' },
                        React.createElement('input', { className: 'form-check-input', type: 'checkbox', id: 'alnumDigits', checked: alnumIncludeDigits, onChange: e => { const v = e.target.checked; updateSetting('alnumIncludeDigits', v); genAlnum({ includeDigits: v }); } }),
                        React.createElement('label', { className: 'form-check-label', htmlFor: 'alnumDigits' }, '包含数字')
                      )
                    ),
                    React.createElement('div', { className: 'col-4' },
                      React.createElement('div', { className: 'form-check form-switch' },
                        React.createElement('input', { className: 'form-check-input', type: 'checkbox', id: 'alnumUpper', checked: alnumIncludeUpper, onChange: e => { const v = e.target.checked; updateSetting('alnumIncludeUpper', v); genAlnum({ includeUpper: v }); } }),
                        React.createElement('label', { className: 'form-check-label', htmlFor: 'alnumUpper' }, '包含大写')
                      )
                    ),
                    React.createElement('div', { className: 'col-4' },
                      React.createElement('div', { className: 'form-check form-switch' },
                        React.createElement('input', { className: 'form-check-input', type: 'checkbox', id: 'alnumLower', checked: alnumIncludeLower, onChange: e => { const v = e.target.checked; updateSetting('alnumIncludeLower', v); genAlnum({ includeLower: v }); } }),
                        React.createElement('label', { className: 'form-check-label', htmlFor: 'alnumLower' }, '包含小写')
                      )
                    )
                  ),
                  React.createElement('div', { className: 'mt-2 d-flex gap-2 align-items-center flex-wrap' },
                    React.createElement('button', { className: 'btn btn-outline-primary', onClick: genAlnum }, '重新生成'),
                    React.createElement('button', { className: 'btn btn-outline-secondary', onClick: () => { if (navigator.clipboard) navigator.clipboard.writeText(alnumSeqLocal || ''); } }, '复制结果'),
                    React.createElement('span', { className: 'legend' }, `总数：${alnumStats.total}，大写：${alnumStats.up}（${alnumStats.upPct}%） 小写：${alnumStats.low}（${alnumStats.lowPct}%） 数字：${alnumStats.dig}（${alnumStats.digPct}%）`)
                  ),
                  React.createElement('div', { className: 'mt-2 p-2 border rounded font-monospace' }, alnumSeqLocal || '')
                ) : null,

                // Grid type + color row
                React.createElement('div', { className: 'row g-2' },
                  React.createElement('div', { className: 'col-5' },
                    React.createElement('label', { className: 'form-label', htmlFor: 'gridType' }, '格子类型'),
                    React.createElement('select', { id: 'gridType', className: 'form-select', value: gridType, onChange: e => updateSetting('gridType', e.target.value) },
                      ['田字格', '米字格', '回宫格', '四线三格', '无格'].map(v => React.createElement('option', { key: v, value: v }, v))
                    )
                  ),
                  React.createElement('div', { className: 'col-4' },
                    React.createElement('label', { className: 'form-label', htmlFor: 'gridColor' }, '格子颜色'),
                    React.createElement('select', { id: 'gridColor', className: 'form-select', value: gridColor, onChange: e => updateSetting('gridColor', e.target.value) },
                      ['绿色', '黑色', '红色', '蓝色', '紫色'].map(v => React.createElement('option', { key: v, value: v }, v))
                    )
                  ),
                  React.createElement('div', { className: 'col-3' },
                    React.createElement('label', { className: 'form-label', htmlFor: 'customGridColor' }, '自定义'),
                    React.createElement('input', { id: 'customGridColor', className: 'form-control form-control-sm', type: 'color', value: customGridColor || toHex(gridColor), onChange: e => updateSetting('customGridColor', e.target.value) })
                  )
                ),

                // Line style + radius + border row
                React.createElement('div', { className: 'row g-2 mt-1' },
                  React.createElement('div', { className: 'col-4' },
                    React.createElement('label', { className: 'form-label', htmlFor: 'lineStyle' }, '线条样式'),
                    React.createElement('select', { id: 'lineStyle', className: 'form-select form-select-sm', value: lineStyle, onChange: e => updateSetting('lineStyle', e.target.value) },
                      ['实线', '虚线', '点线', '点划线'].map(v => React.createElement('option', { key: v, value: v }, v))
                    )
                  ),
                  React.createElement('div', { className: 'col-4' },
                    React.createElement('label', { className: 'form-label', htmlFor: 'cellRadius' }, '格子圆角'),
                    React.createElement('input', { id: 'cellRadius', className: 'form-range form-range-sm', type: 'range', min: '0', max: '10', step: '1', value: cellRadius, onChange: e => handleSetCellRadius(e.target.value) })
                  ),
                  React.createElement('div', { className: 'col-4 d-flex align-items-end' },
                    React.createElement('div', { className: 'form-check' },
                      React.createElement('input', { className: 'form-check-input', type: 'checkbox', id: 'cellBorder', checked: cellBorder, onChange: e => updateSetting('cellBorder', e.target.checked) }),
                      React.createElement('label', { className: 'form-check-label', htmlFor: 'cellBorder' }, '加边框')
                    )
                  )
                ),

                // Style preset + stroke width row
                React.createElement('div', { className: 'row g-2 mt-1' },
                  React.createElement('div', { className: 'col-6' },
                    React.createElement('label', { className: 'form-label', htmlFor: 'stylePreset' }, '打印样式'),
                    React.createElement('select', { id: 'stylePreset', className: 'form-select', value: stylePreset, onChange: e => updateSetting('stylePreset', e.target.value) },
                      ['四线三格标准', '四线三格宽间', '田字格标准', '米字格标准', '米字格宽间', '回宫格标准', '回宫格宽间', '现代简约', '儿童卡通'].map(v => React.createElement('option', { key: v, value: v }, v))
                    )
                  ),
                  React.createElement('div', { className: 'col-6' },
                    React.createElement('label', { className: 'form-label', htmlFor: 'strokeWidth' }, '线条粗细'),
                    React.createElement('input', { id: 'strokeWidth', className: 'form-range', type: 'range', min: '0.5', max: '3', step: '0.5', value: gridStrokeWidth, onChange: e => handleSetGridStrokeWidth(e.target.value) })
                  )
                ),

                // Auto layout toggle
                React.createElement('div', { className: 'form-check mt-1' },
                  React.createElement('input', { className: 'form-check-input', type: 'checkbox', id: 'autoLayout', checked: autoLayout, onChange: e => updateSetting('autoLayout', e.target.checked) }),
                  React.createElement('label', { className: 'form-check-label', htmlFor: 'autoLayout' }, '智能排版（四线三格）')
                ),

                // Text color + stroke mode row
                React.createElement('div', { className: 'row g-2 mt-1' },
                  React.createElement('div', { className: 'col-4' },
                    React.createElement('label', { className: 'form-label', htmlFor: 'textColor' }, '文字颜色'),
                    React.createElement('select', { id: 'textColor', className: 'form-select', value: textColorOpt, onChange: e => updateSetting('textColorOpt', e.target.value) },
                      ['绿色', '黑色', '红色', '蓝色', '紫色'].map(v => React.createElement('option', { key: v, value: v }, v))
                    )
                  ),
                  React.createElement('div', { className: 'col-4' },
                    React.createElement('label', { className: 'form-label', htmlFor: 'customTextColor' }, '自定义'),
                    React.createElement('input', { id: 'customTextColor', className: 'form-control form-control-sm', type: 'color', value: customTextColor || toHex(textColorOpt), onChange: e => updateSetting('customTextColor', e.target.value) })
                  ),
                  React.createElement('div', { className: 'col-4' },
                    React.createElement('label', { className: 'form-label', htmlFor: 'stroke' }, '描红背景'),
                    React.createElement('select', { id: 'stroke', className: 'form-select', value: strokeMode, onChange: e => updateSetting('strokeMode', e.target.value) },
                      ['非常深', '深', '较深', '略浅', '适中', '非常浅', '白色（不可见）', '空芯'].map(v => React.createElement('option', { key: v, value: v }, v))
                    )
                  )
                ),

                // Text stroke + shadow + cell shadow row
                React.createElement('div', { className: 'row g-2 mt-1' },
                  React.createElement('div', { className: 'col-4' },
                    React.createElement('label', { className: 'form-label', htmlFor: 'textStroke' }, '文字描边'),
                    React.createElement('select', { id: 'textStroke', className: 'form-select form-select-sm', value: textStroke, onChange: e => updateSetting('textStroke', e.target.value) },
                      ['无', '细', '中', '粗'].map(v => React.createElement('option', { key: v, value: v }, v))
                    )
                  ),
                  React.createElement('div', { className: 'col-4' },
                    React.createElement('label', { className: 'form-label', htmlFor: 'textShadow' }, '文字阴影'),
                    React.createElement('div', { className: 'form-check form-switch' },
                      React.createElement('input', { className: 'form-check-input', type: 'checkbox', id: 'textShadow', checked: textShadow, onChange: e => updateSetting('textShadow', e.target.checked) }),
                      React.createElement('label', { className: 'form-check-label', htmlFor: 'textShadow' }, textShadow ? '开启' : '关闭')
                    )
                  ),
                  React.createElement('div', { className: 'col-4 d-flex align-items-end' },
                    React.createElement('div', { className: 'form-check' },
                      React.createElement('input', { className: 'form-check-input', type: 'checkbox', id: 'cellShadow', checked: cellShadowLocal || false, onChange: e => { handleCellShadow(e.target.checked); if (e.target.checked) updateSetting('cellBorder', true); } }),
                      React.createElement('label', { className: 'form-check-label', htmlFor: 'cellShadow' }, '立体效果')
                    )
                  )
                ),

                // Rows + cols + cell size row
                React.createElement('div', { className: 'row g-2 mt-1' },
                  React.createElement('div', { className: 'col-4' },
                    React.createElement('label', { className: 'form-label', htmlFor: 'rows' }, '行数/页'),
                    React.createElement('input', { id: 'rows', className: 'form-control', type: 'number', min: 1, value: rows, onChange: e => handleSetRows(e.target.value) })
                  ),
                  React.createElement('div', { className: 'col-4' },
                    React.createElement('label', { className: 'form-label', htmlFor: 'cols' }, '列数/行'),
                    React.createElement('input', { id: 'cols', className: 'form-control', type: 'number', min: 1, value: cols, onChange: e => handleSetCols(e.target.value) })
                  ),
                  React.createElement('div', { className: 'col-4' },
                    React.createElement('label', { className: 'form-label', htmlFor: 'cell' }, '格子尺寸'),
                    React.createElement('input', { id: 'cell', className: 'form-control', type: 'number', min: 30, value: cellSize, onChange: e => handleSetCellSize(e.target.value) })
                  )
                ),

                // Gap + font size + paper row
                React.createElement('div', { className: 'row g-2 mt-1' },
                  React.createElement('div', { className: 'col-4' },
                    React.createElement('label', { className: 'form-label', htmlFor: 'gap' }, '行距'),
                    React.createElement('input', { id: 'gap', className: 'form-control', type: 'number', min: 0, value: gridGap, onChange: e => handleSetGridGap(e.target.value) })
                  ),
                  React.createElement('div', { className: 'col-4' },
                    React.createElement('label', { className: 'form-label', htmlFor: 'fsize' }, '字体大小'),
                    React.createElement('input', { id: 'fsize', className: 'form-control', type: 'number', min: 12, value: fontSize, onChange: e => handleSetFontSize(e.target.value) })
                  ),
                  React.createElement('div', { className: 'col-4' },
                    React.createElement('label', { className: 'form-label', htmlFor: 'paper' }, '纸张格式'),
                    React.createElement('select', { id: 'paper', className: 'form-select', value: paper, onChange: e => updateSetting('paper', e.target.value) },
                      ['A4竖版', 'A4横版', 'A5竖版', 'A5横版', '作文纸A4'].map(v => React.createElement('option', { key: v, value: v }, v))
                    )
                  )
                ),

                // Margins row
                React.createElement('div', { className: 'row g-2 mt-1' },
                  React.createElement('div', { className: 'col-3' },
                    React.createElement('label', { className: 'form-label', htmlFor: 'mt' }, '上边距(mm)'),
                    React.createElement('input', { id: 'mt', className: 'form-control', type: 'number', min: 0, value: marginTop, onChange: e => handleSetMarginTop(e.target.value) })
                  ),
                  React.createElement('div', { className: 'col-3' },
                    React.createElement('label', { className: 'form-label', htmlFor: 'mr' }, '右边距(mm)'),
                    React.createElement('input', { id: 'mr', className: 'form-control', type: 'number', min: 0, value: marginRight, onChange: e => handleSetMarginRight(e.target.value) })
                  ),
                  React.createElement('div', { className: 'col-3' },
                    React.createElement('label', { className: 'form-label', htmlFor: 'mb' }, '下边距(mm)'),
                    React.createElement('input', { id: 'mb', className: 'form-control', type: 'number', min: 0, value: marginBottom, onChange: e => handleSetMarginBottom(e.target.value) })
                  ),
                  React.createElement('div', { className: 'col-3' },
                    React.createElement('label', { className: 'form-label', htmlFor: 'ml' }, '左边距(mm)'),
                    React.createElement('input', { id: 'ml', className: 'form-control', type: 'number', min: 0, value: marginLeft, onChange: e => handleSetMarginLeft(e.target.value) })
                  )
                ),

                // Template + custom font row
                React.createElement('div', { className: 'row g-2 mt-1' },
                  React.createElement('div', { className: 'col-6' },
                    React.createElement('label', { className: 'form-label', htmlFor: 'template' }, '字帖模板'),
                    React.createElement('select', { id: 'template', className: 'form-select', value: template, onChange: e => updateSetting('template', e.target.value) },
                      ['楷书', '行书', '草书', '隶书', '庞中华', '田英章', '自定义'].map(v => React.createElement('option', { key: v, value: v }, v))
                    )
                  ),
                  React.createElement('div', { className: 'col-6' },
                    React.createElement('label', { className: 'form-label', htmlFor: 'cfont' }, '自定义字体'),
                    React.createElement('input', { id: 'cfont', className: 'form-control', placeholder: '系统已安装字体名', disabled: template !== '自定义', value: customFont, onChange: e => updateSetting('customFont', e.target.value) })
                  )
                ),

                // Header + tailFill row
                React.createElement('div', { className: 'row g-2 mt-1' },
                  React.createElement('div', { className: 'col-6' },
                    React.createElement('label', { className: 'form-label', htmlFor: 'header' }, '自定义页眉'),
                    React.createElement('input', { id: 'header', className: 'form-control', value: header, onChange: e => updateSetting('header', e.target.value) })
                  ),
                  React.createElement('div', { className: 'col-6 d-flex align-items-end' },
                    React.createElement('div', { className: 'form-check' },
                      React.createElement('input', { className: 'form-check-input', type: 'checkbox', id: 'fill', checked: tailFill, onChange: e => updateSetting('tailFill', e.target.checked) }),
                      React.createElement('label', { className: 'form-check-label', htmlFor: 'fill' }, '填充尾页')
                    )
                  )
                ),

                // Action buttons
                React.createElement('div', { className: 'mt-3 d-flex flex-wrap gap-2' },
                  React.createElement('div', { className: 'btn-group' },
                    React.createElement('button', { className: 'btn btn-success', onClick: () => window.print(), disabled: pages.length === 0 }, '打印/另存为PDF'),
                    React.createElement('button', { className: 'btn btn-primary', onClick: exportPDF, disabled: pages.length === 0 }, '生成高清PDF'),
                    React.createElement('button', { className: 'btn btn-outline-primary', onClick: exportImage, disabled: pages.length === 0 }, '导出PNG')
                  ),
                  React.createElement('div', { className: 'btn-group' },
                    React.createElement('button', { className: 'btn btn-outline-secondary', onClick: exportConfig }, '导出配置'),
                    React.createElement('button', { className: 'btn btn-outline-secondary' },
                      React.createElement('input', { type: 'file', accept: '.json', style: { position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }, onChange: importConfig }),
                      '导入配置'
                    ),
                    React.createElement('button', { className: 'btn btn-outline-danger', onClick: resetConfig }, '重置')
                  ),
                  React.createElement('div', { className: 'btn-group' },
                    React.createElement('button', { className: 'btn btn-info', onClick: saveTemplate }, '保存模板'),
                    React.createElement('button', { className: 'btn btn-info' },
                      React.createElement('input', { type: 'file', accept: '.json', style: { position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }, onChange: loadTemplate }),
                      '加载模板'
                    )
                  ),
                  React.createElement('span', { className: 'legend' }, '建议使用现代浏览器。')
                )
              )
            )
          ),

          // Right panel: preview + random
          React.createElement('div', { className: 'col-lg-5' },
            React.createElement('div', { className: 'card' },
              React.createElement('div', { className: 'card-body' },
                // Preview scale
                React.createElement('div', { className: 'mb-2' },
                  React.createElement('label', { className: 'form-label', htmlFor: 'previewScale' }, '预览缩放'),
                  React.createElement('input', { id: 'previewScale', className: 'form-range', type: 'range', min: '0.4', max: '1.2', step: '0.05', value: previewScale, onChange: e => handleSetPreviewScale(e.target.value) })
                ),
                React.createElement(ConfigSummary, { gridType, gridColor, stylePreset, rows, cols, cellSize, fontSize }),

                // Random char fill
                React.createElement('div', null,
                  React.createElement('div', { className: 'fw-bold mb-2' }, '常用汉字随机'),
                  React.createElement('div', { className: 'row g-2' },
                    React.createElement('div', { className: 'col-6' },
                      React.createElement('label', { className: 'form-label', htmlFor: 'randCount' }, '筛选数量'),
                      React.createElement('input', { id: 'randCount', className: 'form-control', type: 'number', min: 1, value: randCount, onChange: e => handleSetRandCount(e.target.value) })
                    ),
                    React.createElement('div', { className: 'col-6 d-flex align-items-end' },
                      React.createElement('div', { className: 'form-check' },
                        React.createElement('input', { className: 'form-check-input', type: 'checkbox', id: 'noRepeat', checked: randNoRepeat, onChange: e => updateSetting('randNoRepeat', e.target.checked) }),
                        React.createElement('label', { className: 'form-check-label', htmlFor: 'noRepeat' }, '不重复')
                      )
                    )
                  ),
                  React.createElement('div', { className: 'mt-2 d-flex gap-2 align-items-center flex-wrap' },
                    React.createElement('button', { className: 'btn btn-outline-primary', onClick: () => fillRandom(true), disabled: commonChars.length === 0 }, '覆盖输入'),
                    React.createElement('button', { className: 'btn btn-outline-secondary', onClick: () => fillRandom(false), disabled: commonChars.length === 0 }, '追加到输入'),
                    React.createElement('span', { className: 'legend' }, commonChars.length > 0 ? `可用汉字：${commonChars.length}` : '未读取到常用汉字'),
                    React.createElement('span', { className: 'legend' }, `容量：${usage.capacity}，已用：${usage.used}`),
                    usage.warn ? React.createElement('span', { className: 'error' }, '页面过多，建议分批打印') : null
                  )
                ),
                React.createElement('div', { className: 'mt-2 text-muted small' }, '模板需本机安装相应字体。')
              )
            )
          )
        )
      ),

      // Page output
      React.createElement('div', { className: 'page-wrapper' },
        pages.map((page, i) => React.createElement('div', { key: i, className: 'page' },
          header ? React.createElement('div', { className: 'header' }, header) : null,
          React.createElement('div', { className: 'grid' },
            (cp.content && cp.content.splitRows ? cp.content.splitRows(page, cols) : (splitRows ? splitRows(page, cols) : [page])).map((row, ri) => React.createElement('div', {
              key: ri,
              className: 'grid-row',
              style: { display: 'grid', gridTemplateColumns: `repeat(${cols}, var(--cell-size))`, gap: layout === '英文格式' ? 0 : 'var(--grid-gap)' }
            },
              row.map((ch, ci) => React.createElement(Cell, {
                key: ci,
                ch: ch || '',
                bg: bg,
                textColor: tColor,
                strokeMode,
                cls: (layout === '英文格式' || feature === '数字字母') ? 'cell-en' : undefined,
                font: layout === '英文格式' ? engFont(letterStyle) : feature === '数字字母' ? (letterStyle === '印刷体' ? 'monospace' : 'cursive') : font,
                fontSize,
                showGuide: feature === '数字字母' && showGuide
              }))
            ))
          )
        ))
      )
    )
  );
}
