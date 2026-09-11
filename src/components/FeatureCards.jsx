import React from 'react';

const CARDS = [
  {
    key: 'hanzi',
    icon: '文',
    title: '汉字字帖',
    desc: '田字格、米字格与回宫格，支持常用字、古诗和课文内容。',
    color: 'blue',
  },
  {
    key: 'pinyin',
    icon: '拼',
    title: '拼音字帖',
    desc: '拼音临摹、看拼音写汉字和看汉字写拼音。',
    color: 'pink',
  },
  {
    key: 'english',
    icon: 'A',
    title: '英文字帖',
    desc: '四线三格字母、单词和句子书写练习。',
    color: 'purple',
  },
  {
    key: 'digits',
    icon: '123',
    title: '数字与字母',
    desc: '数字和字母描写，适合基础书写训练。',
    color: 'green',
  },
];

export default function FeatureCards({ onSelect }) {
  return React.createElement(
    'section',
    { className: 'features-section', id: 'features' },
    React.createElement(
      'div',
      { className: 'container-narrow' },
      React.createElement(
        'div',
        { className: 'section-header' },
        React.createElement('h2', { className: 'home-section-title' }, '选择字帖类型'),
        React.createElement('p', { className: 'home-section-subtitle' }, '从内容、格线到排版都可调整，生成后可直接打印或导出。')
      ),
      React.createElement(
        'div',
        { className: 'features-grid' },
        CARDS.map((card) =>
          React.createElement(
            'button',
            {
              key: card.key,
              type: 'button',
              className: `feature-card home-feature-card feature-card--${card.color}`,
              onClick: () => onSelect?.(card.key),
              'aria-label': `${card.title}，立即制作`,
            },
            React.createElement('span', { className: 'feature-card-icon', 'aria-hidden': 'true' }, card.icon),
            React.createElement('span', { className: 'feature-card-title' }, card.title),
            React.createElement('span', { className: 'feature-card-desc' }, card.desc),
            React.createElement('span', { className: 'feature-card-cta' }, '立即制作 →')
          )
        )
      )
    )
  );
}
