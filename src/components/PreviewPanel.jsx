import React from 'react';

function ConfigSummary({ gridType, gridColor, stylePreset, rows, cols, cellSize, fontSize }) {
  const summary = [
    { label: '格子', value: gridType },
    { label: '颜色', value: gridColor },
    { label: '预设', value: stylePreset },
    { label: '尺寸', value: `${cols}×${rows}格` },
    { label: '格子大小', value: `${cellSize}px` },
    { label: '字体', value: `${fontSize}px` }
  ].filter(item => item.value).map(item =>
    React.createElement('span', { key: item.label, className: 'badge bg-secondary me-1 mb-1' },
      `${item.label}: ${item.value}`
    )
  );
  return React.createElement('div', { className: 'config-summary mt-2 p-2 bg-light rounded' },
    React.createElement('small', { className: 'text-muted' }, '当前配置：'),
    React.createElement('div', { className: 'mt-1' }, ...summary)
  );
}

export default function PreviewPanel({
  settings,
  onFillRandom,
  commonChars,
  handleSetPreviewScale,
  handleSetRandCount,
  updateSetting,
  usage: usageProp
}) {
  const { previewScale, randCount, randNoRepeat, gridType, gridColor, stylePreset, rows, cols, cellSize, fontSize } = settings;
  const usage = usageProp || { capacity: 0, used: 0, warn: false };

  return React.createElement('div', { className: 'card' },
    React.createElement('div', { className: 'card-body' },
      // Preview scale
      React.createElement('div', { className: 'mb-2' },
        React.createElement('label', { className: 'form-label', htmlFor: 'previewScale' }, '预览缩放'),
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
      React.createElement(ConfigSummary, { gridType, gridColor, stylePreset, rows, cols, cellSize, fontSize }),

      // Random char fill
      React.createElement('div', null,
        React.createElement('div', { className: 'fw-bold mb-2' }, '常用汉字随机'),
        React.createElement('div', { className: 'row g-2' },
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
            React.createElement('div', { className: 'form-check' },
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
        React.createElement('div', { className: 'mt-2 d-flex gap-2 align-items-center flex-wrap' },
          React.createElement('button', {
            className: 'btn btn-outline-primary',
            onClick: () => onFillRandom(true),
            disabled: commonChars.length === 0
          }, '覆盖输入'),
          React.createElement('button', {
            className: 'btn btn-outline-secondary',
            onClick: () => onFillRandom(false),
            disabled: commonChars.length === 0
          }, '追加到输入'),
          React.createElement('span', { className: 'legend' }, commonChars.length > 0 ? `可用汉字：${commonChars.length}` : '未读取到常用汉字'),
          React.createElement('span', { className: 'legend' }, `容量：${usage.capacity}，已用：${usage.used}`),
          usage.warn ? React.createElement('span', { className: 'error' }, '页面过多，建议分批打印') : null
        )
      ),
      React.createElement('div', { className: 'mt-2 text-muted small' }, '模板需本机安装相应字体。')
    )
  );
}
