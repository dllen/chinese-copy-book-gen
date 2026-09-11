import React from 'react';

const CASES = [
  {
    icon: '👨‍👩‍👧',
    title: '家庭辅导',
    desc: '家长根据孩子课本内容生成字帖，课后巩固生字和拼音。',
  },
  {
    icon: '👩‍🏫',
    title: '教师备课',
    desc: '老师快速生成课堂练习字帖，支持多种格线和排版。',
  },
  {
    icon: '📚',
    title: '课后巩固',
    desc: '学生根据学习进度生成个性化练习，重复书写重点内容。',
  },
];

export default function UseCasesSection() {
  return React.createElement(
    'section',
    { className: 'usecases-section' },
    React.createElement(
      'div',
      { className: 'container-narrow' },
      React.createElement(
        'div',
        { className: 'section-header' },
        React.createElement('h2', { className: 'home-section-title' }, '适用场景'),
        React.createElement('p', { className: 'home-section-subtitle' }, '不虚构用户评价，只描述真实的使用方式。')
      ),
      React.createElement(
        'div',
        { className: 'usecases-grid' },
        CASES.map((item) =>
          React.createElement(
            'article',
            { key: item.title, className: 'usecase-card' },
            React.createElement('span', { className: 'usecase-icon', 'aria-hidden': 'true' }, item.icon),
            React.createElement('h3', null, item.title),
            React.createElement('p', null, item.desc)
          )
        )
      )
    )
  );
}
