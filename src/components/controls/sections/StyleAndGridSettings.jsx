import React from 'react';

/**
 * 样式预设与网格设置组件
 */
export default function StyleAndGridSettings({
  gridType,
  stylePreset,
  autoLayout,
  gridStrokeWidth,
  lineStyle,
  cellRadius,
  pageBg,
  cellBg,
  cellBorder,
  cellShadow,
  textShadow,
  textStroke,
  updateSetting,
  handleSetCellRadius,
  handleSetGridStrokeWidth
}) {
  // 从 window.__copybook__.gridTypes 获取格子类型列表，确保与 grid.js 同步
  const allGridTypes = window.__copybook__?.gridTypes || [
    '田字格', '米字格', '回宫格', '回宫格黄金', '四线三格', '拼音格',
    '九宫格', '十六宫格', '作文格', '椭圆米字格', '圆形格', '口字格',
    '横线格', '横线', '田字格+斜', '双田字格',
    '竖线格', '竖排田字格', '竖排米字格',
    '数字格', '田格', '方格', '无格'
  ];

  const stylePresetOptions = [
    '四线三格标准', '四线三格宽间', '回宫格黄金', '拼音格标准', '数字格标准', '竖排书法',
    '田字格标准', '米字格标准', '米字格宽间', '回宫格标准', '回宫格宽间', '现代简约', '儿童卡通'
  ];

  return React.createElement(React.Fragment, null,
    // 打印样式预设
    React.createElement('div', { className: 'mb-2' },
      React.createElement('label', { className: 'form-label', htmlFor: 'stylePreset' }, '打印样式'),
      React.createElement('select', {
        id: 'stylePreset',
        className: 'form-select',
        value: stylePreset,
        onChange: e => updateSetting('stylePreset', e.target.value)
      },
        stylePresetOptions.map(v => React.createElement('option', { key: v, value: v }, v))
      )
    ),

    // 网格设置
    React.createElement('div', { className: 'row g-2 mb-2' },
      React.createElement('div', { className: 'col-6' },
        React.createElement('label', { className: 'form-label', htmlFor: 'gridType' }, '格子类型'),
        React.createElement('select', {
          id: 'gridType',
          className: 'form-select',
          value: gridType,
          onChange: e => updateSetting('gridType', e.target.value)
        },
          allGridTypes.map(v =>
            React.createElement('option', { key: v, value: v }, v)
          )
        )
      ),
      React.createElement('div', { className: 'col-6' },
        React.createElement('label', { className: 'form-label', htmlFor: 'lineStyle' }, '线条样式'),
        React.createElement('select', {
          id: 'lineStyle',
          className: 'form-select',
          value: lineStyle,
          onChange: e => updateSetting('lineStyle', e.target.value)
        },
          ['实线', '虚线', '点线', '点划线'].map(v =>
            React.createElement('option', { key: v, value: v }, v)
          )
        )
      )
    ),

    // 圆角和线条粗细
    React.createElement('div', { className: 'row g-2 mb-2' },
      React.createElement('div', { className: 'col-6' },
        React.createElement('label', { className: 'form-label', htmlFor: 'cellRadius' }, '格子圆角'),
        React.createElement('input', {
          id: 'cellRadius',
          className: 'form-range',
          type: 'range',
          min: 0,
          max: 10,
          value: cellRadius,
          onChange: e => handleSetCellRadius(e.target.value)
        }),
        React.createElement('div', { className: 'form-text' }, `${cellRadius}px`)
      ),
      React.createElement('div', { className: 'col-6' },
        React.createElement('label', { className: 'form-label', htmlFor: 'gridStrokeWidth' }, '线条粗细'),
        React.createElement('input', {
          id: 'gridStrokeWidth',
          className: 'form-range',
          type: 'range',
          min: 0.5,
          max: 3,
          step: 0.5,
          value: gridStrokeWidth,
          onChange: e => handleSetGridStrokeWidth(e.target.value)
        }),
        React.createElement('div', { className: 'form-text' }, `${gridStrokeWidth}px`)
      )
    ),

    // 背景和填充
    React.createElement('div', { className: 'row g-2 mb-2' },
      React.createElement('div', { className: 'col-6' },
        React.createElement('label', { className: 'form-label', htmlFor: 'pageBg' }, '页面背景'),
        React.createElement('select', {
          id: 'pageBg',
          className: 'form-select',
          value: pageBg,
          onChange: e => updateSetting('pageBg', e.target.value)
        },
          ['白色', '米色', '淡蓝', '淡绿'].map(v =>
            React.createElement('option', { key: v, value: v }, v)
          )
        )
      ),
      React.createElement('div', { className: 'col-6' },
        React.createElement('label', { className: 'form-label', htmlFor: 'cellBg' }, '格子填充'),
        React.createElement('select', {
          id: 'cellBg',
          className: 'form-select',
          value: cellBg,
          onChange: e => updateSetting('cellBg', e.target.value)
        },
          ['透明', '白色', '浅灰'].map(v =>
            React.createElement('option', { key: v, value: v }, v)
          )
        )
      )
    ),

    // 边框和阴影
    React.createElement('div', { className: 'row g-2 mb-2' },
      React.createElement('div', { className: 'col-6' },
        React.createElement('div', { className: 'form-check' },
          React.createElement('input', {
            className: 'form-check-input',
            type: 'checkbox',
            id: 'cellBorder',
            checked: cellBorder,
            onChange: e => updateSetting('cellBorder', e.target.checked)
          }),
          React.createElement('label', { className: 'form-check-label', htmlFor: 'cellBorder' }, '格子边框')
        )
      ),
      React.createElement('div', { className: 'col-6' },
        React.createElement('div', { className: 'form-check' },
          React.createElement('input', {
            className: 'form-check-input',
            type: 'checkbox',
            id: 'cellShadow',
            checked: cellShadow,
            onChange: e => updateSetting('cellShadow', e.target.checked)
          }),
          React.createElement('label', { className: 'form-check-label', htmlFor: 'cellShadow' }, '立体效果')
        )
      )
    ),

    // 文字描边和阴影
    React.createElement('div', { className: 'row g-2 mb-2' },
      React.createElement('div', { className: 'col-6' },
        React.createElement('label', { className: 'form-label', htmlFor: 'textStroke' }, '文字描边'),
        React.createElement('select', {
          id: 'textStroke',
          className: 'form-select',
          value: textStroke,
          onChange: e => updateSetting('textStroke', e.target.value)
        },
          ['无', '细', '中', '粗'].map(v =>
            React.createElement('option', { key: v, value: v }, v)
          )
        )
      ),
      React.createElement('div', { className: 'col-6 d-flex align-items-center' },
        React.createElement('div', { className: 'form-check' },
          React.createElement('input', {
            className: 'form-check-input',
            type: 'checkbox',
            id: 'textShadow',
            checked: textShadow,
            onChange: e => updateSetting('textShadow', e.target.checked)
          }),
          React.createElement('label', { className: 'form-check-label', htmlFor: 'textShadow' }, '文字阴影')
        )
      )
    )
  );
}
