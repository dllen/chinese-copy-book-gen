import React from 'react';
import { HelpTooltip } from '../../HelpTooltip';

const { toHex } = window.__copybook__.utils || {};

/** 颜色选项：label -> hex */
const GRID_COLORS = [
  ['绿色', '#198754'],
  ['蓝色', '#0d6efd'],
  ['黑色', '#212529'],
  ['红色', '#dc3545'],
  ['紫色', '#6f42c1'],
  ['橙色', '#fd7e14'],
  ['灰色', '#6c757d'],
];

const TEXT_COLORS = [
  ['绿色', '#198754'],
  ['黑色', '#212529'],
  ['红色', '#dc3545'],
  ['蓝色', '#0d6efd'],
  ['紫色', '#6f42c1'],
];

/** 颜色选择按钮组 */
function ColorSwatch({ options, value, toHexFn, onChange, id, label }) {
  const hex = value.startsWith('#') ? value : (toHexFn?.(value) || value);
  return React.createElement('div', { className: 'd-flex flex-wrap gap-1', role: 'group', 'aria-label': label },
    options.map(([name, color]) =>
      React.createElement('button', {
        key: name,
        type: 'button',
        title: name,
        'aria-label': name + (color === hex || name === value ? ' (当前)' : ''),
        'aria-pressed': color === hex || name === value,
        onClick: () => onChange(name),
        style: {
          width: '28px',
          height: '28px',
          borderRadius: '4px',
          backgroundColor: color,
          border: (color === hex || name === value) ? '2px solid #000' : '1px solid #ccc',
          cursor: 'pointer',
          padding: 0,
          flexShrink: 0,
        }
      })
    )
  );
}

/**
 * 颜色与描红设置组件
 */
export default function ColorSettings({
  gridColor,
  customGridColor,
  textColorOpt,
  customTextColor,
  strokeMode,
  updateSetting
}) {
  const effectiveGrid = customGridColor || toHex(gridColor) || '#198754';
  const effectiveText = customTextColor || toHex(textColorOpt) || '#212529';

  return React.createElement(React.Fragment, null,
    // 文字颜色 + 自定义 + 描红
    React.createElement('div', { className: 'row g-2 mt-1' },
      React.createElement('div', { className: 'col-4' },
        React.createElement('label', { className: 'form-label', htmlFor: 'textColor' }, '文字颜色'),
        React.createElement(ColorSwatch, {
          options: TEXT_COLORS,
          value: textColorOpt,
          toHexFn: toHex,
          onChange: v => { updateSetting('textColorOpt', v); updateSetting('customTextColor', ''); },
          id: 'textColor',
          label: '文字颜色'
        })
      ),
      React.createElement('div', { className: 'col-4 d-flex flex-column justify-content-end' },
        React.createElement('label', { className: 'form-label', htmlFor: 'customTextColor' }, '自定义颜色'),
        React.createElement('input', {
          id: 'customTextColor',
          className: 'form-control form-control-sm',
          type: 'color',
          value: effectiveText,
          onChange: e => { updateSetting('customTextColor', e.target.value); }
        })
      ),
      React.createElement('div', { className: 'col-4' },
        React.createElement(HelpTooltip, { 
          content: '描红背景的深浅影响练习难度。较深的颜色适合初学者，较浅的颜色适合进阶练习。',
          icon: 'info',
          placement: 'top'
        },
          React.createElement('label', { className: 'form-label', htmlFor: 'stroke' }, '描红背景')
        ),
        React.createElement('select', {
          id: 'stroke',
          className: 'form-select',
          value: strokeMode,
          onChange: e => updateSetting('strokeMode', e.target.value)
        },
          ['非常深', '深', '较深', '略浅', '适中', '非常浅', '白色（不可见）', '空芯'].map(v =>
            React.createElement('option', { key: v, value: v }, v)
          )
        )
      )
    )
  );
}
