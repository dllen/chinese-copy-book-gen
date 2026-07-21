import React from 'react';
import { HelpTooltip } from './HelpTooltip';

const { toHex } = window.__copybook__.utils || {};

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

export default function ConfigPanel({
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
  onInsert,
  onEngShowZhChange,
  onGenAlnum,
  // Validation
  validationResult,
  // Alphanumeric stats
  alnumStats
}) {
  return React.createElement('div', { className: 'card' },
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
        React.createElement(window.__copybook__.library.LibraryPanel, { onInsert: onInsert, engShowZh: engShowZh, onEngShowZhChange: onEngShowZhChange })
      ) : null,

      // Text input (字帖模板)
      feature === '字帖模板' ? React.createElement('div', { className: 'mb-2' },
        React.createElement('label', { className: 'form-label', htmlFor: 'text' }, '输入'),
        React.createElement('textarea', { id: 'text', className: `form-control ${validationResult.ok ? '' : 'is-invalid'}`, rows: 4, placeholder: '在此输入内容。多词用 | 或逗号/空格分隔；多句用 | 分隔页面。', value: text, onChange: e => updateSetting('text', e.target.value), 'aria-describedby': 'textHelp' }),
        React.createElement('div', { id: 'textHelp', className: 'form-text' }, '支持批量粘贴。'),
        validationResult.ok ? null : React.createElement('div', { className: 'invalid-feedback', role: 'alert' }, validationResult.msg)
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
              React.createElement('input', { className: 'form-check-input', type: 'checkbox', id: 'alnumNoRepeat', checked: alnumNoRepeat, onChange: e => { const v = e.target.checked; updateSetting('alnumNoRepeat', v); onGenAlnum({ noRepeat: v }); } }),
              React.createElement('label', { className: 'form-check-label', htmlFor: 'alnumNoRepeat' }, '不重复')
            )
          )
        ),
        React.createElement('div', { className: 'row g-2 mt-1' },
          React.createElement('div', { className: 'col-4' },
            React.createElement('div', { className: 'form-check form-switch' },
              React.createElement('input', { className: 'form-check-input', type: 'checkbox', id: 'alnumDigits', checked: alnumIncludeDigits, onChange: e => { const v = e.target.checked; updateSetting('alnumIncludeDigits', v); onGenAlnum({ includeDigits: v }); } }),
              React.createElement('label', { className: 'form-check-label', htmlFor: 'alnumDigits' }, '包含数字')
            )
          ),
          React.createElement('div', { className: 'col-4' },
            React.createElement('div', { className: 'form-check form-switch' },
              React.createElement('input', { className: 'form-check-input', type: 'checkbox', id: 'alnumUpper', checked: alnumIncludeUpper, onChange: e => { const v = e.target.checked; updateSetting('alnumIncludeUpper', v); onGenAlnum({ includeUpper: v }); } }),
              React.createElement('label', { className: 'form-check-label', htmlFor: 'alnumUpper' }, '包含大写')
            )
          ),
          React.createElement('div', { className: 'col-4' },
            React.createElement('div', { className: 'form-check form-switch' },
              React.createElement('input', { className: 'form-check-input', type: 'checkbox', id: 'alnumLower', checked: alnumIncludeLower, onChange: e => { const v = e.target.checked; updateSetting('alnumIncludeLower', v); onGenAlnum({ includeLower: v }); } }),
              React.createElement('label', { className: 'form-check-label', htmlFor: 'alnumLower' }, '包含小写')
            )
          )
        ),
        React.createElement('div', { className: 'mt-2 d-flex gap-2 align-items-center flex-wrap' },
          React.createElement('button', { className: 'btn btn-outline-primary', onClick: onGenAlnum }, '重新生成'),
          React.createElement('button', { className: 'btn btn-outline-secondary', onClick: () => { if (navigator.clipboard) navigator.clipboard.writeText(alnumSeqLocal || ''); } }, '复制结果'),
          React.createElement('span', { className: 'legend' }, `总数：${alnumStats.total}，大写：${alnumStats.up}（${alnumStats.upPct}%） 小写：${alnumStats.low}（${alnumStats.lowPct}%） 数字：${alnumStats.dig}（${alnumStats.digPct}%）`)
        ),
        React.createElement('div', { className: 'mt-2 p-2 border rounded font-monospace' }, alnumSeqLocal || '')
      ) : null,

      // Grid type + color row
      React.createElement('div', { className: 'row g-2' },
        React.createElement('div', { className: 'col-5' },
          React.createElement(HelpTooltip, { content: '田字格适合初学者，米字格增加对角线辅助' },
            React.createElement('label', { className: 'form-label', htmlFor: 'gridType' }, '格子类型')
          ),
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
          React.createElement(HelpTooltip, { content: '描红背景的深浅影响练习难度' },
            React.createElement('label', { className: 'form-label', htmlFor: 'stroke' }, '描红背景')
          ),
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
            React.createElement('input', { className: 'form-check-input', type: 'checkbox', id: 'cellShadow', checked: cellShadowLocal || false, onChange: e => { handleSetCellShadow(e.target.checked); if (e.target.checked) updateSetting('cellBorder', true); } }),
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
          React.createElement(HelpTooltip, { content: 'A4竖版适合家用打印机' },
            React.createElement('label', { className: 'form-label', htmlFor: 'paper' }, '纸张格式')
          ),
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
      )
    )
  );
}
