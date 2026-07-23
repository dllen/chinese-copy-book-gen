import React from 'react';

const scenarios = [
  { key: 'poem', label: '古诗练习', icon: '📜', feature: '字帖模板', layout: '古诗格式', gridType: '田字格', text: '静夜思\n李白\n床前明月光\n疑是地上霜' },
  { key: 'text', label: '课文练习', icon: '📖', feature: '字帖模板', layout: '文章格式', gridType: '田字格', text: '标题\n\n第一段内容。\n\n第二段内容。' },
  { key: 'english', label: '英语单词', icon: '🔤', feature: '字帖模板', layout: '英文格式', gridType: '四线三格', cols: 10, text: 'apple\nbanana\ncat' },
  { key: 'ctrl', label: '控笔训练', icon: '✍️', feature: '控笔字帖', layout: '连续排列', gridType: '田字格', text: '' },
  { key: 'alnum', label: '数字字母', icon: '🔢', feature: '数字字母', layout: '连续排列', gridType: '四线三格', text: '' },
  { key: 'chinese', label: '汉字练习', icon: '✏️', feature: '汉字练习', layout: '连续排列', gridType: '田字格', text: '' },
];

export default function QuickActions({ updateSetting, onOpenLibrary }) {
  const apply = (scenario) => {
    updateSetting('feature', scenario.feature);
    if (scenario.layout) updateSetting('layout', scenario.layout);
    updateSetting('gridType', scenario.gridType);
    if (scenario.cols) updateSetting('cols', scenario.cols);
    updateSetting('text', scenario.text);
    if (scenario.feature === '数字字母') {
      updateSetting('alnumSeq', '');
    }
    // 打开词库面板并切换到对应标签
    if (scenario.key === 'poem' && onOpenLibrary) {
      onOpenLibrary({ open: true, tab: 'poem' });
    } else if (scenario.key === 'text' && onOpenLibrary) {
      onOpenLibrary({ open: true, tab: 'text' });
    }
  };

  return React.createElement('div', { className: 'quick-actions mb-3' },
    React.createElement('div', { className: 'quick-actions-label' }, '快速开始：'),
    React.createElement('div', { className: 'quick-actions-buttons' },
      scenarios.map(s => React.createElement('button', {
        key: s.key,
        className: 'btn btn-sm btn-outline-primary',
        onClick: () => apply(s)
      }, s.icon + ' ' + s.label))
    )
  );
}
