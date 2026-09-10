/**
 * FeatureCards — Grid of content-type cards with icons, descriptions, and CTAs.
 * Inspired by ziyouzt.com feature section.
 */
const CARDS = [
  { key: 'hanzi', icon: '文', title: '汉字字帖', desc: '楷书汉字帖、笔画帖、语文生字与课文文章帖，规范书写传承文化', color: 'blue', cta: '立即制作 →' },
  { key: 'math', icon: '123', title: '数学字帖', desc: '数字描写、加减口算、乘除口算与竖式计算，适合小学数学练习', color: 'green', cta: '立即制作 →' },
  { key: 'pinyin', icon: '拼', title: '拼音字帖', desc: '拼音临摹、拼音字母笔顺、看拼音写汉字、看汉字写拼音', color: 'pink', cta: '立即制作 →' },
  { key: 'english', icon: 'A', title: '英文字帖', desc: '大小写字母、单词与文章临摹，四线三格规范英语书写', color: 'purple', cta: '立即制作 →' },
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
        React.createElement('h2', { className: 'section-title' }, '四大字帖类型'),
        React.createElement('p', { className: 'section-subtitle' }, '覆盖语文、数学、英语多学科，满足幼小衔接到小学各年级练习需求')
      ),
      React.createElement(
        'div',
        { className: 'features-grid' },
        CARDS.map((card) =>
          React.createElement(
            'a',
            {
              key: card.key,
              className: `feature-card feature-card--${card.color}`,
              href: '#',
              onClick: (e) => { e.preventDefault(); onSelect?.(card.key); },
            },
            React.createElement('div', { className: 'feature-card-icon' }, card.icon),
            React.createElement('h3', { className: 'feature-card-title' }, card.title),
            React.createElement('p', { className: 'feature-card-desc' }, card.desc),
            React.createElement('span', { className: 'feature-card-cta' }, card.cta)
          )
        )
      )
    )
  );
}
