import React from 'react';

const STEPS = [
  {
    number: '01',
    title: '选择内容',
    desc: '输入文字，或从常用字、古诗、课文和英语资料中选择。',
  },
  {
    number: '02',
    title: '调整样式',
    desc: '设置字帖类型、格线、字体、字号、颜色和纸张参数。',
  },
  {
    number: '03',
    title: '生成与导出',
    desc: '实时查看分页效果，打印或导出高清 PDF、图片和 SVG。',
  },
];

export default function WorkflowSection({ onStartBuilder, onNavigate }) {
  return React.createElement(
    'section',
    { className: 'workflow-section', id: 'workflow' },
    React.createElement(
      'div',
      { className: 'container-narrow' },
      React.createElement(
        'div',
        { className: 'section-header' },
        React.createElement('h2', { className: 'home-section-title' }, '三步生成字帖'),
        React.createElement('p', { className: 'home-section-subtitle' }, '不改变现有工作流，只把每一步做得更清楚。')
      ),
      React.createElement(
        'div',
        { className: 'workflow-grid' },
        STEPS.map((step) =>
          React.createElement(
            'article',
            { key: step.number, className: 'workflow-card' },
            React.createElement('span', { className: 'workflow-number' }, step.number),
            React.createElement('h3', null, step.title),
            React.createElement('p', null, step.desc)
          )
        )
      ),
      React.createElement(
        'div',
        { className: 'workflow-actions' },
        React.createElement(
          'button',
          {
            type: 'button',
            className: 'btn-gradient-primary',
            onClick: () => onStartBuilder?.('hanzi'),
          },
          '开始制作字帖'
        ),
        React.createElement(
          'button',
          {
            type: 'button',
            className: 'btn-text',
            onClick: () => onNavigate?.('tutorial'),
          },
          '查看生成流程'
        )
      )
    )
  );
}
