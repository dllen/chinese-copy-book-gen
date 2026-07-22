import React from 'react';
import { HelpTooltip } from '../../HelpTooltip';

const { toHex } = window.__copybook__.utils || {};

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
  return React.createElement(React.Fragment, null,
    // 文字颜色 + 描红
    React.createElement('div', { className: 'row g-2 mt-1' },
      React.createElement('div', { className: 'col-4' },
        React.createElement('label', { className: 'form-label', htmlFor: 'textColor' }, '文字颜色'),
        React.createElement('select', {
          id: 'textColor',
          className: 'form-select',
          value: textColorOpt,
          onChange: e => updateSetting('textColorOpt', e.target.value)
        },
          ['绿色', '黑色', '红色', '蓝色', '紫色'].map(v =>
            React.createElement('option', { key: v, value: v }, v)
          )
        )
      ),
      React.createElement('div', { className: 'col-4' },
        React.createElement('label', { className: 'form-label', htmlFor: 'customTextColor' }, '自定义'),
        React.createElement('input', {
          id: 'customTextColor',
          className: 'form-control form-control-sm',
          type: 'color',
          value: customTextColor || toHex(textColorOpt),
          onChange: e => updateSetting('customTextColor', e.target.value)
        })
      ),
      React.createElement('div', { className: 'col-4' },
        React.createElement(HelpTooltip, { content: '描红背景的深浅影响练习难度' },
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
