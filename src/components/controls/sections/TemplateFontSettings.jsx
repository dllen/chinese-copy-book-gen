import React from 'react';

/**
 * 模板字体设置组件
 */
export default function TemplateFontSettings({
  template,
  customFont,
  updateSetting
}) {
  return React.createElement('div', { className: 'row g-2 mt-1' },
    React.createElement('div', { className: 'col-6' },
      React.createElement('label', { className: 'form-label', htmlFor: 'template' }, '字帖模板'),
      React.createElement('select', {
        id: 'template',
        className: 'form-select',
        value: template,
        onChange: e => updateSetting('template', e.target.value)
      },
        ['楷书', '行书', '草书', '隶书', '庞中华', '田英章', '自定义'].map(v =>
          React.createElement('option', { key: v, value: v }, v)
        )
      )
    ),
    React.createElement('div', { className: 'col-6' },
      React.createElement('label', { className: 'form-label', htmlFor: 'customFont' }, '自定义字体'),
      React.createElement('input', {
        id: 'customFont',
        className: 'form-control',
        placeholder: '系统已安装字体名',
        disabled: template !== '自定义',
        value: customFont,
        onChange: e => updateSetting('customFont', e.target.value)
      })
    )
  );
}
