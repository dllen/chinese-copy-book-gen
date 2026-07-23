import React, { useEffect, useMemo } from 'react';
import { useToast } from './hooks/useToast';
import { useSettings } from './hooks/useSettings';
import { useDebounce } from './hooks/useDebounce';
import { ToastContainer } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary';
import MainLayout from './components/layout/MainLayout';
import PageGrid from './components/PageGrid';
import useCopybook from './hooks/useCopybook';

const { toHex, pageSize } = window.__copybook__.utils || {};
const CONFIG_FIELDS = [
  'gridType', 'gridColor', 'customGridColor', 'customTextColor', 'textColorOpt',
  'strokeMode', 'stylePreset', 'autoLayout', 'gridStrokeWidth', 'lineStyle',
  'cellRadius', 'pageBg', 'cellBg', 'cellBorder', 'textStroke', 'textShadow',
  'template', 'customFont', 'rows', 'cols', 'cellSize', 'gridGap', 'fontSize',
  'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'paper'
];

/**
 * 主应用组件
 * 协调状态、布局和业务逻辑
 */
export default function App() {
  const { toasts, toast, removeToast } = useToast();
  const { settings, updateSetting, setSettings } = useSettings(toast);

 // 本地状态管理
 const [commonChars, setCommonChars] = React.useState([]);
  const [letterStyle, setLetterStyle] = React.useState(settings.letterStyle || '印刷体');
  const [libraryState, setLibraryState] = React.useState({ open: false, tab: 'poem' });
  const [cellShadowLocal, setCellShadowLocal] = React.useState(settings.cellShadow || false);
  const [templateModalOpen, setTemplateModalOpen] = React.useState(false);
  const [templateName, setTemplateName] = React.useState('');

 // 使用 useCopybook Hook 管理核心业务逻辑
  const copybook = useCopybook(settings, updateSetting, { toast, removeToast, commonChars });
  const gColor = React.useMemo(() => {
    const custom = settings.customGridColor && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(settings.customGridColor) ? settings.customGridColor : null;
    return custom || toHex(settings.gridColor) || '#000';
  }, [settings.gridColor, settings.customGridColor]);

 const {
   pages,
   usage,
   bg,
   tColor,
   font,
   genAlnum,
   exportPDF,
   exportImage,
   exportSVG,
   fillRandom,
   insertFromLibrary,
 } = copybook;

  // 数字字母序列本地状态
  const [alnumSeqState, setAlnumSeqState] = React.useState('');
  useEffect(() => {
    if (settings.alnumSeq !== undefined) setAlnumSeqState(settings.alnumSeq);
  }, [settings.alnumSeq]);

  // 加载常用汉字
  useEffect(() => {
    const emb = (window.__copybookData__ || {}).commonChars;
    if (emb) {
      setCommonChars([...new Set(emb.filter(ch => /[一-鿿]/.test(ch)))]);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    fetch('./common-chars.json', { signal: controller.signal })
      .then(r => { clearTimeout(timeout); return r.json(); })
      .then(arr => {
        const uniq = [...new Set((arr || []).filter(ch => /[一-鿿]/.test(ch)))];
        setCommonChars(uniq);
      })
      .catch(e => {
        clearTimeout(timeout);
        if (e.name === 'AbortError') {
          toast.warn('词库加载超时，请检查网络后重试');
          return;
        }
        // Fallback: try markdown
        const controller2 = new AbortController();
        const timeout2 = setTimeout(() => controller2.abort(), 5000);
        fetch('./常用1000汉子.md', { signal: controller2.signal })
          .then(r => { clearTimeout(timeout2); return r.text(); })
          .then(t => {
            const lines = t.split('\n');
            let buckets = [];
            let curName = '';
            let curChars = [];
            for (const line of lines) {
              const isTitle = line.startsWith('##');
              if (isTitle) {
                if (curName) buckets.push({ name: curName.trim(), chars: [...new Set(curChars)] });
                curName = line.replace(/^#+\s*/, '').trim();
                curChars = [];
              } else {
                const arr = Array.from(line).filter(ch => /[一-鿿]/.test(ch));
                if (arr.length) curChars.push(...arr);
              }
            }
            if (curName) buckets.push({ name: curName.trim(), chars: [...new Set(curChars)] });
            const all = [...new Set(buckets.flatMap(b => b.chars))];
            setCommonChars(all);
          })
          .catch(e2 => {
            clearTimeout(timeout2);
            if (e2.name === 'AbortError') toast.warn('词库加载超时');
            else { toast.error('词库加载失败', { action: () => window.location.reload() }); setCommonChars([]); }
          });
      });

    return () => clearTimeout(timeout);
  }, []);

  // 移动端预览缩放
  useEffect(() => {
    if (window.matchMedia?.(`(max-width: 576px)`).matches) {
      updateSetting('previewScale', 0.6);
    }
  }, []);

  // CSS 变量：预览缩放
  useEffect(() => {
    document.documentElement.style.setProperty('--preview-scale', String(settings.previewScale));
  }, [settings.previewScale]);

  // 防抖文本
  const debouncedText = useDebounce(settings.text, 300);

  // 导出/保存/导入配置
  const exportConfig = () => {
    const config = CONFIG_FIELDS.reduce((obj, key) => ({ ...obj, [key]: settings[key] }), {});
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '字帖配置.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('配置已导出');
  };

  const saveTemplate = (e) => {
    e.stopPropagation();
    const name = templateName.trim() || '字帖模板';
    const tmpl = {
      config: { ...settings },
      content: settings.text,
    };
    const blob = new Blob([JSON.stringify(tmpl, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${name}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setTemplateModalOpen(false);
    setTemplateName('');
    toast.success('模板已保存');
  };



  const loadTemplate = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const tmpl = JSON.parse(ev.target?.result);
        if (tmpl.config) setSettings(tmpl.config);
        if (tmpl.content !== undefined) updateSetting('text', tmpl.content);
        toast.success('模板已加载');
      } catch {
        toast.error('模板格式错误');
      }
    };
    reader.readAsText(file);
  };

  const importConfig = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const config = JSON.parse(ev.target?.result);
        setSettings(config);
        toast.success('配置已导入');
      } catch {
        toast.error('配置格式错误');
      }
    };
    reader.readAsText(file);
  };

  const resetConfig = () => {
    if (window.confirm('确定要重置所有设置到默认值吗？')) {
      localStorage.removeItem('copybook-settings');
      window.location.reload();
    }
  };

  // 验证
  const validationResult = React.useMemo(() => {
    if (!settings.text || !settings.text.trim()) {
      return { valid: false, msg: '请输入文本内容' };
    }
    if (settings.feature === '字帖模板' && settings.layout === '连续排列') {
      const res = window.__copybook__.utils?.validate?.(settings.mode, settings.text) || { ok: true };
      return { valid: res.ok, msg: res.msg };
    }
    return { valid: true };
  }, [settings]);

  // 数字字母统计
  const alnumStats = React.useMemo(() => {
    const s = alnumSeqState || '';
    const up = (s.match(/[A-Z]/g) || []).length;
    const low = (s.match(/[a-z]/g) || []).length;
    const dig = (s.match(/[0-9]/g) || []).length;
    const total = Math.max(1, s.length);
    return { up, low, dig, upPct: Math.round(up * 100 / total), lowPct: Math.round(low * 100 / total), digPct: Math.round(dig * 100 / total), total };
  }, [alnumSeqState]);

  // 英文四线三格字体
  const engFont = (style) => {
    return style === '手写体'
      ? "'Comic Sans MS','Chalkboard SE','Segoe Script',cursive"
      : "'Arial','Helvetica Neue','Helvetica',sans-serif";
  };

  // CSS 变量更新
  useEffect(() => {
    const sz = pageSize(settings.paper);
    document.documentElement.style.setProperty('--page-width', sz.w);
    document.documentElement.style.setProperty('--page-height', sz.h);
    document.documentElement.style.setProperty('--cell-size', `${settings.cellSize}px`);
    document.documentElement.style.setProperty('--grid-gap', `${settings.gridGap}px`);
    document.documentElement.style.setProperty('--grid-color', gColor);
    document.documentElement.style.setProperty('--text-color', tColor);
    document.documentElement.style.setProperty('--font-size', `${settings.fontSize}px`);
    document.documentElement.style.setProperty('--page-margin-top', `${settings.marginTop}mm`);
    document.documentElement.style.setProperty('--page-margin-right', `${settings.marginRight}mm`);
    document.documentElement.style.setProperty('--page-margin-bottom', `${settings.marginBottom}mm`);
    document.documentElement.style.setProperty('--page-margin-left', `${settings.marginLeft}mm`);
    document.documentElement.style.setProperty('--guide-color', gColor);
    document.documentElement.style.setProperty('--page-bg', toHex(settings.pageBg) || '#fff');
    document.documentElement.style.setProperty('--cell-bg', toHex(settings.cellBg) || 'transparent');
    document.documentElement.style.setProperty('--cell-border-width', settings.cellBorder ? '2px' : '0px');
    document.documentElement.style.setProperty('--cell-shadow', cellShadowLocal ? '0 2px 4px rgba(0,0,0,0.1)' : 'none');
    document.documentElement.style.setProperty('--text-stroke-width',
      settings.textStroke === '无' ? '0px' :
      settings.textStroke === '细' ? '0.5px' :
      settings.textStroke === '中' ? '1px' : '2px'
    );
    document.documentElement.style.setProperty('--text-shadow', settings.textShadow ? '2px 2px 4px rgba(0,0,0,0.3)' : 'none');
  }, [
   settings.paper, settings.cellSize, settings.gridGap, gColor, tColor, settings.fontSize,
   settings.marginTop, settings.marginRight, settings.marginBottom, settings.marginLeft,
   settings.pageBg, settings.cellBg, settings.cellBorder, cellShadowLocal, settings.textShadow, settings.textStroke
 ]);
  // 样式预设联动
  useEffect(() => {
    if (!settings.stylePreset) return;
    const map = {
      '四线三格标准': { gridType: '四线三格', y1: '0.25', y2: '0.50', y3: '0.75', y4: '0.92' },
      '四线三格宽间': { gridType: '四线三格', y1: '0.20', y2: '0.50', y3: '0.80', y4: '0.95' },
      '田字格标准': { gridType: '田字格' },
      '米字格标准': { gridType: '米字格' },
      '米字格宽间': { gridType: '米字格' },
      '回宫格标准': { gridType: '回宫格' },
      '回宫格宽间': { gridType: '回宫格' },
      '现代简约': { gridType: '田字格', radius: '4px', stroke: '0.5' },
      '儿童卡通': { gridType: '田字格', radius: '8px', stroke: '2' },
    };
    const cfg = map[settings.stylePreset];
    if (!cfg) return;
    if (cfg.gridType) updateSetting('gridType', cfg.gridType);
    if (cfg.y1) {
      document.documentElement.style.setProperty('--fourline-y1', cfg.y1);
      document.documentElement.style.setProperty('--fourline-y2', cfg.y2);
      document.documentElement.style.setProperty('--fourline-y3', cfg.y3);
      document.documentElement.style.setProperty('--fourline-y4', cfg.y4);
    }
    if (cfg.radius) document.documentElement.style.setProperty('--cell-radius', cfg.radius);
    if (cfg.stroke) document.documentElement.style.setProperty('--grid-stroke-width', cfg.stroke);
  }, [settings.stylePreset, updateSetting]);

  // 动态网格属性
  useEffect(() => {
    document.documentElement.style.setProperty('--grid-stroke-width', String(settings.gridStrokeWidth));
    document.documentElement.style.setProperty('--cell-radius', `${settings.cellRadius}px`);
  }, [settings.gridStrokeWidth, settings.cellRadius]);

  // 英文基线
  useEffect(() => {
    document.documentElement.style.setProperty('--en-descent', letterStyle === '手写体' ? '0.286em' : '0.238em');
  }, [letterStyle]);

  // 四线三格自适应
  useEffect(() => {
    if (!settings.autoLayout || settings.gridType !== '四线三格') return;
    const s = settings.text || '';
    const up = (s.match(/[A-Z]/g) || []).length;
    const low = (s.match(/[a-z]/g) || []).length;
    const dig = (s.match(/[0-9]/g) || []).length;
    const total = Math.max(1, up + low + dig);
    let y1 = '0.23', y3 = '0.77', y4 = '0.94';
    if (up / total > 0.5) { y1 = '0.20'; y3 = '0.80'; y4 = '0.96'; }
    else if (low / total > 0.5) { y1 = '0.25'; y3 = '0.75'; y4 = '0.92'; }
    else if (dig / total > 0.5) { y1 = '0.22'; y3 = '0.78'; y4 = '0.95'; }
    document.documentElement.style.setProperty('--fourline-y1', y1);
    document.documentElement.style.setProperty('--fourline-y2', '0.50');
    document.documentElement.style.setProperty('--fourline-y3', y3);
    document.documentElement.style.setProperty('--fourline-y4', y4);
  }, [settings.autoLayout, settings.gridType, settings.text]);

  // 渲染
  return (
    <ErrorBoundary>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
     <MainLayout
       mode={settings.mode}
        usage={usage}
       variant={settings.variant}
        layout={settings.layout}
        gridType={settings.gridType}
        gridColor={settings.gridColor}
        customGridColor={settings.customGridColor}
        customTextColor={settings.customTextColor}
        textColorOpt={settings.textColorOpt}
        strokeMode={settings.strokeMode}
        tailFill={settings.tailFill}
        template={settings.template}
        customFont={settings.customFont}
        rows={settings.rows}
        cols={settings.cols}
        cellSize={settings.cellSize}
        gridGap={settings.gridGap}
        fontSize={settings.fontSize}
        marginTop={settings.marginTop}
        marginRight={settings.marginRight}
        marginBottom={settings.marginBottom}
        marginLeft={settings.marginLeft}
        paper={settings.paper}
        header={settings.header}
        text={settings.text}
        randCount={settings.randCount}
        randNoRepeat={settings.randNoRepeat}
        previewScale={settings.previewScale}
        feature={settings.feature}
        difficulty={settings.difficulty}
        showGuide={settings.showGuide}
        enBlankRows={settings.enBlankRows}
        enRepeat={settings.enRepeat}
        engShowZh={settings.engShowZh}
        stylePreset={settings.stylePreset}
        autoLayout={settings.autoLayout}
        gridStrokeWidth={settings.gridStrokeWidth}
        lineStyle={settings.lineStyle}
        cellRadius={settings.cellRadius}
        pageBg={settings.pageBg}
        cellBg={settings.cellBg}
        cellBorder={settings.cellBorder}
        cellShadow={settings.cellShadow}
        textShadow={settings.textShadow}
        textStroke={settings.textStroke}
        alnumIncludeDigits={settings.alnumIncludeDigits}
        alnumIncludeUpper={settings.alnumIncludeUpper}
        alnumIncludeLower={settings.alnumIncludeLower}
        alnumCount={settings.alnumCount}
        alnumNoRepeat={settings.alnumNoRepeat}
        alnumSeqLocal={alnumSeqState}
        letterStyle={letterStyle}
        cellShadowLocal={cellShadowLocal}
        updateSetting={updateSetting}
        handleLetterStyle={(v) => { setLetterStyle(v); updateSetting('letterStyle', v); }}
        handleCellShadow={(v) => { setCellShadowLocal(v); updateSetting('cellShadow', v); }}
        handleSetRows={(v) => updateSetting('rows', Math.max(1, Math.min(20, parseInt(v) || 1)))}
        handleSetCols={(v) => updateSetting('cols', Math.max(1, Math.min(20, parseInt(v) || 1)))}
        handleSetCellSize={(v) => updateSetting('cellSize', Math.max(30, Math.min(100, parseInt(v) || 60)))}
        handleSetGridGap={(v) => updateSetting('gridGap', Math.max(0, Math.min(20, parseInt(v) || 0)))}
        handleSetFontSize={(v) => updateSetting('fontSize', Math.max(12, Math.min(100, parseInt(v) || 42)))}
        handleSetMarginTop={(v) => updateSetting('marginTop', Math.max(0, Math.min(50, parseInt(v) || 0)))}
        handleSetMarginRight={(v) => updateSetting('marginRight', Math.max(0, Math.min(50, parseInt(v) || 0)))}
        handleSetMarginBottom={(v) => updateSetting('marginBottom', Math.max(0, Math.min(50, parseInt(v) || 0)))}
        handleSetMarginLeft={(v) => updateSetting('marginLeft', Math.max(0, Math.min(50, parseInt(v) || 0)))}
        handleSetEnRepeat={(v) => updateSetting('enRepeat', Math.max(1, Math.min(5, parseInt(v) || 1)))}
        handleSetRandCount={(v) => updateSetting('randCount', Math.max(1, parseInt(v) || 1))}
        handleSetAlnumCount={(v) => {
          const n = Math.max(1, parseInt(v) || 20);
          updateSetting('alnumCount', n);
          if (genAlnum) genAlnum({ count: n });
        }}
        handleSetCellRadius={(v) => updateSetting('cellRadius', parseInt(v) || 0)}
        handleSetGridStrokeWidth={(v) => updateSetting('gridStrokeWidth', parseFloat(v) || 1)}
        handleSetPreviewScale={(v) => updateSetting('previewScale', parseFloat(v) || 1)}
        handleAlnumSeq={(v) => { copybook.setAlnumSeqLocal?.(v); updateSetting('alnumSeq', v); }}
        handleSetCellShadow={(v) => { setCellShadowLocal(v); updateSetting('cellShadow', v); }}
        onInsert={insertFromLibrary}
        onEngShowZhChange={(v) => updateSetting('engShowZh', v)}
        onGenAlnum={copybook.genAlnum}
        onGenChineseChars={copybook.genChineseChars}
        settings={settings}
        validationResult={validationResult}
        alnumStats={alnumStats}
        pages={pages}
        onFillRandom={fillRandom}
        commonChars={commonChars}
        onPrint={() => window.print()}
        onExportPDF={exportPDF}
        onExportImage={exportImage}
       onSaveTemplate={saveTemplate}
       onLoadTemplate={loadTemplate}
       onImportConfig={importConfig}
        onExportConfig={exportConfig}
       onReset={resetConfig}
        libraryState={libraryState}
        onLibraryStateChange={(state) => setLibraryState(prev => ({ ...prev, ...state }))}
      />
      <PageGrid
        pages={pages}
        cols={settings.cols}
        layout={settings.layout}
        feature={settings.feature}
        header={settings.header}
        bg={bg}
        tColor={tColor}
        strokeMode={settings.strokeMode}
        font={font}
        fontSize={settings.fontSize}
       letterStyle={letterStyle}
       showGuide={settings.showGuide}
       engFont={engFont}
     />
      {templateModalOpen && (
        <div className="modal show d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-sm">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">保存模板</h5>
                <button type="button" className="btn-close" onClick={() => setTemplateModalOpen(false)} />
              </div>
              <div className="modal-body">
                <input
                  className="form-control"
                  placeholder="模板名称"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') confirmSaveTemplate(); }}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setTemplateModalOpen(false)}>取消</button>
                <button className="btn btn-primary" onClick={confirmSaveTemplate}>保存</button>
              </div>
            </div>
          </div>
        </div>
      )}
   </ErrorBoundary>
  );
}
