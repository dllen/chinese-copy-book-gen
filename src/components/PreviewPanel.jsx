import React from 'react';
import PageGrid from './PageGrid';

function ConfigSummary({ gridType, gridColor, stylePreset, rows, cols, cellSize, fontSize, pageCount }) {
  const summary = [
    { label: '格子类型', value: gridType },
    { label: '网格颜色', value: gridColor },
    { label: '样式预设', value: stylePreset },
    { label: '每页排版', value: (rows && cols) ? `${cols} 列 × ${rows} 行` : undefined },
    { label: '格子尺寸', value: cellSize ? `${cellSize}px` : undefined },
    { label: '字体大小', value: fontSize ? `${fontSize}px` : undefined },
    { label: '总页数', value: pageCount ? `${pageCount} 页` : undefined }
  ].filter(item => item.value);

  return React.createElement('div', { className: 'config-summary p-2 bg-light rounded' },
    React.createElement('span', { className: 'config-summary-title' }, '当前配置'),
    React.createElement('dl', { className: 'config-summary-list' },
      summary.map(item => React.createElement('div', { className: 'config-summary-row', key: item.label },
        React.createElement('dt', null, item.label),
        React.createElement('dd', null, item.value)
      ))
    )
  );
}

export default function PreviewPanel({
  pages, previewScale, randCount, randNoRepeat, gridType, gridColor, stylePreset,
  rows, cols, cellSize, fontSize, bg, tColor, strokeMode, font, letterStyle, showGuide,
  engFont, copybookType, copybookStyle, showPinyin, pinyinColor,
  onFillRandom, commonChars, onSetRandCount: handleSetRandCount, onSetPreviewScale: handleSetPreviewScale,
  updateSetting, usage: usageProp
}) {
  const usage = usageProp || { capacity: 0, used: 0, warn: false };

  return React.createElement('div', { className: 'card preview-panel' },
    React.createElement('div', { className: 'card-body p-3' },
      // Live preview
      React.createElement('div', { className: 'mb-3 preview-container' },
        pages && pages.length > 0
          ? React.createElement(PageGrid, {
              pages,
              cols,
              layout: '连续排列',
              feature: '',
              header: '',
              bg,
              tColor,
              strokeMode,
              font,
              fontSize,
              letterStyle,
              showGuide,
              engFont,
              copybookType,
              copybookStyle,
              showPinyin,
              pinyinColor,
            })
          : React.createElement('div', { className: 'text-muted text-center py-4 small' }, '输入内容后显示预览')
      ),

      // Section 1: Preview scale
      React.createElement('div', { className: 'mb-4' },
        React.createElement('label', { className: 'form-label d-flex justify-content-between', htmlFor: 'previewScale' },
          React.createElement('span', null, '预览缩放'),
          React.createElement('span', { className: 'text-muted small' }, `${Math.round(previewScale * 100)}%`)
        ),
        React.createElement('input', {
          id: 'previewScale',
          className: 'form-range',
          type: 'range',
          min: '0.4',
          max: '1.2',
          step: '0.05',
          value: previewScale,
          onChange: e => handleSetPreviewScale(e.target.value)
        })
      ),

      // Section 2: Config summary
      React.createElement(ConfigSummary, { gridType, gridColor, stylePreset, rows, cols, cellSize, fontSize, pageCount: pages && pages.length }),

      // Divider
      React.createElement('hr', { className: 'my-3' }),

      // Section 3: Random char fill
      React.createElement('div', null,
        React.createElement('div', { className: 'fw-bold mb-3' }, '常用汉字随机'),
        React.createElement('div', { className: 'row g-2 mb-3' },
          React.createElement('div', { className: 'col-6' },
            React.createElement('label', { className: 'form-label', htmlFor: 'randCount' }, '筛选数量'),
            React.createElement('input', {
              id: 'randCount',
              className: 'form-control',
              type: 'number',
              min: 1,
              value: randCount,
              onChange: e => handleSetRandCount(e.target.value)
            })
          ),
          React.createElement('div', { className: 'col-6 d-flex align-items-end' },
            React.createElement('div', { className: 'form-check mb-2' },
              React.createElement('input', {
                className: 'form-check-input',
                type: 'checkbox',
                id: 'noRepeat',
                checked: randNoRepeat,
                onChange: e => updateSetting('randNoRepeat', e.target.checked)
              }),
              React.createElement('label', { className: 'form-check-label', htmlFor: 'noRepeat' }, '不重复')
            )
          )
        ),
        React.createElement('div', { className: 'd-flex gap-2 align-items-center flex-wrap mb-2' },
          React.createElement('button', {
            className: 'btn btn-outline-primary btn-sm',
            onClick: () => onFillRandom(true),
            disabled: commonChars.length === 0
          }, '覆盖输入'),
          React.createElement('button', {
            className: 'btn btn-outline-secondary btn-sm',
            onClick: () => onFillRandom(false),
            disabled: commonChars.length === 0
          }, '追加到输入')
        ),
        React.createElement('div', { className: 'd-flex flex-wrap gap-3 small' },
          React.createElement('span', { className: 'legend' }, commonChars.length > 0 ? `可用汉字：${commonChars.length}` : '未读取到常用汉字'),
          React.createElement('span', { className: 'legend' }, `容量：${usage.capacity}，已用：${usage.used}`),
          usage.warn ? React.createElement('span', { className: 'error' }, '页面过多，建议分批打印') : null
        )
      ),

      // Footer hint
      React.createElement('div', { className: 'mt-3 pt-2 border-top' },
        React.createElement('small', { className: 'text-muted' }, '模板需本机安装相应字体。')
      )
    )
  );
}
