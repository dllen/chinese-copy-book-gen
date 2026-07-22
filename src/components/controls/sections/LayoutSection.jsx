import React from 'react';

/**
 * 布局格式选择组件
 */
export default function LayoutSection({
  feature,
  layout,
  gridType,
  stylePreset,
  updateSetting
}) {
  if (feature !== '字帖模板') return null;

  return React.createElement('div', { className: 'mb-2' },
    React.createElement('label', { className: 'form-label', htmlFor: 'layout' }, '排版格式'),
    React.createElement('select', {
      id: 'layout',
      className: 'form-select',
      value: layout,
      onChange: e => updateSetting('layout', e.target.value),
      'aria-label': '排版格式'
    },
      ['连续排列', '古诗格式', '文章格式', '英文格式'].map(v =>
        React.createElement('option', { key: v, value: v }, v)
      )
    ),
    layout === '古诗格式' ? React.createElement('div', { className: 'form-text' },
      '无标点的短行（标题、作者）自动居中；诗句按标点分行居中。'
    ) : null,
    layout === '文章格式' ? React.createElement('div', { className: 'form-text' },
      '首行为标题（居中）；其余每行为一段，段首缩进两格；标点自动避头尾。'
    ) : null,
    layout === '英文格式' ? React.createElement('div', { className: 'form-text' },
      '按词换行（不拆词），词间一格；每个输入行另起一行，空行留空行。自动使用四线三格，建议 10 列以上。'
    ) : null
  );
}
