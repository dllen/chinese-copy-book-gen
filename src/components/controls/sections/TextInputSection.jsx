import React from 'react';

/**
 * 文本输入区域组件
 */
export default function TextInputSection({
  mode,
  variant,
  layout,
  text,
  feature,
  updateSetting,
  onInsert
}) {
  return React.createElement('div', { className: 'mb-3' },
    React.createElement('label', { className: 'form-label', htmlFor: 'text' }, '文本内容'),
    React.createElement('textarea', {
      id: 'text',
      className: 'form-control font-monospace',
      rows: 4,
      value: text,
      onChange: e => updateSetting('text', e.target.value),
      placeholder: '输入文字，或从下方词库选择',
      'aria-label': '文本内容'
    }),
    feature === '字帖模板' && layout === '连续排列' ? React.createElement('div', { className: 'form-check form-check-inline' },
      React.createElement('input', {
        className: 'form-check-input',
        type: 'radio',
        name: 'mode',
        id: 'mode-multi',
        value: '多字',
        checked: mode === '多字',
        onChange: () => updateSetting('mode', '多字')
      }),
      React.createElement('label', { className: 'form-check-label', htmlFor: 'mode-multi' }, '多字')
    ) : null,
    feature === '字帖模板' && layout === '连续排列' ? React.createElement('div', { className: 'form-check form-check-inline' },
      React.createElement('input', {
        className: 'form-check-input',
        type: 'radio',
        name: 'mode',
        id: 'mode-word',
        value: '多词',
        checked: mode === '多词',
        onChange: () => updateSetting('mode', '多词')
      }),
      React.createElement('label', { className: 'form-check-label', htmlFor: 'mode-word' }, '多词')
    ) : null,
    feature === '字帖模板' && layout === '连续排列' ? React.createElement('div', { className: 'form-check form-check-inline' },
      React.createElement('input', {
        className: 'form-check-input',
        type: 'radio',
        name: 'mode',
        id: 'mode-sentence',
        value: '多句',
        checked: mode === '多句',
        onChange: () => updateSetting('mode', '多句')
      }),
      React.createElement('label', { className: 'form-check-label', htmlFor: 'mode-sentence' }, '多句')
    ) : null,
    feature === '字帖模板' && layout === '连续排列' ? React.createElement('div', { className: 'form-check form-check-inline' },
      React.createElement('input', {
        className: 'form-check-input',
        type: 'radio',
        name: 'mode',
        id: 'mode-article',
        value: '文章',
        checked: mode === '文章',
        onChange: () => updateSetting('mode', '文章')
      }),
      React.createElement('label', { className: 'form-check-label', htmlFor: 'mode-article' }, '文章')
    ) : null
  );
}
