import React from 'react';

/**
 * 页眉与尾页设置组件
 */
export default function HeaderSettings({
  header,
  tailFill,
  updateSetting
}) {
  return React.createElement('div', { className: 'row g-2 mt-1' },
    React.createElement('div', { className: 'col-6' },
      React.createElement('label', { className: 'form-label', htmlFor: 'header' }, '自定义页眉'),
      React.createElement('input', {
        id: 'header',
        className: 'form-control',
        value: header,
        onChange: e => updateSetting('header', e.target.value),
        placeholder: '例如：三年级语文生字练习'
      })
    ),
    React.createElement('div', { className: 'col-6 d-flex align-items-end' },
      React.createElement('div', { className: 'form-check' },
        React.createElement('input', {
          className: 'form-check-input',
          type: 'checkbox',
          id: 'tailFill',
          checked: tailFill,
          onChange: e => updateSetting('tailFill', e.target.checked)
        }),
        React.createElement('label', { className: 'form-check-label', htmlFor: 'tailFill' }, '填充尾页（补齐最后一页空格）')
      )
    )
  );
}
