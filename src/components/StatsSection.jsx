import React from 'react';

const STATS = [
  { value: '4 类', label: '字帖内容' },
  { value: '20+ 种', label: '格线与预设' },
  { value: '高清 PDF', label: '打印导出' },
  { value: '免登录', label: '直接使用' },
];

export default function StatsSection() {
  return React.createElement(
    'section',
    { className: 'stats-section', 'aria-label': '产品能力' },
    React.createElement(
      'div',
      { className: 'stats-grid' },
      STATS.map((stat) =>
        React.createElement(
          'div',
          { key: stat.label, className: 'stat-item' },
          React.createElement('div', { className: 'stat-item-value' }, stat.value),
          React.createElement('div', { className: 'stat-item-label' }, stat.label)
        )
      )
    )
  );
}
