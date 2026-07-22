import React from 'react';

/**
 * 英文格式设置组件
 */
export default function EnglishSettings({
  letterStyle,
  enBlankRows,
  enRepeat,
  engShowZh,
  handleLetterStyle,
  updateSetting
}) {
  return React.createElement('div', { className: 'row g-2 mb-2' },
    React.createElement('div', { className: 'col-4' },
      React.createElement('label', { className: 'form-label', htmlFor: 'letterStyle' }, '英文字体'),
      React.createElement('select', {
        id: 'letterStyle',
        className: 'form-select',
        value: letterStyle,
        onChange: e => handleLetterStyle(e.target.value)
      },
        ['印刷体', '手写体'].map(v => React.createElement('option', { key: v, value: v }, v))
      )
    ),
    React.createElement('div', { className: 'col-4' },
      React.createElement('label', { className: 'form-label', htmlFor: 'enBlankRows' }, '临摹空行'),
      React.createElement('select', {
        id: 'enBlankRows',
        className: 'form-select',
        value: enBlankRows,
        onChange: e => updateSetting('enBlankRows', parseInt(e.target.value || '0'))
      },
        [[0, '无'], [1, '1 行'], [2, '2 行']].map(([v, l]) =>
          React.createElement('option', { key: v, value: v }, l)
        )
      )
    ),
    React.createElement('div', { className: 'col-4' },
      React.createElement('label', { className: 'form-label', htmlFor: 'enRepeat' }, '单词重复'),
      React.createElement('select', {
        id: 'enRepeat',
        className: 'form-select',
        value: enRepeat,
        onChange: e => updateSetting('enRepeat', Math.max(1, Math.min(5, parseInt(e.target.value || '1'))))
      },
        [1, 2, 3, 4, 5].map(v => React.createElement('option', { key: v, value: v }, `${v} 次`))
      )
    )
  );
}
