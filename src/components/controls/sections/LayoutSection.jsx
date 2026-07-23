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

  const layoutOptions = [
    { value: '连续排列', label: '连续排列', desc: '字符按顺序连续排列，每行填满自动换行。' },
    { value: '竖排连续', label: '竖排连续', desc: '竖排文本，从上到下，从右到左。适合书法练习。' },
    { value: '古诗格式', label: '古诗格式', desc: '无标点的短行（标题、作者）自动居中；诗句按标点分行居中。' },
    { value: '竖排古诗', label: '竖排古诗', desc: '竖排古诗格式，标题居中，诗句竖向排列。' },
    { value: '文章格式', label: '文章格式', desc: '首行为标题（居中）；其余每行为一段，段首缩进两格；标点自动避头尾。' },
    { value: '竖排文章', label: '竖排文章', desc: '竖排文章格式，标题居中，正文竖向排列。' },
    { value: '英文格式', label: '英文格式', desc: '按词换行（不拆词），词间一格；每个输入行另起一行，空行留空行。自动使用四线三格，建议 10 列以上。' },
  ];

  const currentLayout = layoutOptions.find(o => o.value === layout);

  return React.createElement('div', { className: 'mb-2' },
    React.createElement('label', { className: 'form-label', htmlFor: 'layout' }, '排版格式'),
    React.createElement('select', {
      id: 'layout',
      className: 'form-select',
      value: layout,
      onChange: e => updateSetting('layout', e.target.value),
      'aria-label': '排版格式'
    },
      layoutOptions.map(v =>
        React.createElement('option', { key: v.value, value: v.value }, v.label)
      )
    ),
    currentLayout?.desc ? React.createElement('div', { className: 'form-text' },
      currentLayout.desc
    ) : null
  );
}
