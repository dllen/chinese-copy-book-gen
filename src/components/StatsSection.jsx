/**
 * StatsSection — Social proof with key metrics.
 * Inspired by ziyouzt.com stats bar.
 */
const STATS = [
  { value: '10,000+', label: '用户使用' },
  { value: '500+', label: '字帖模板' },
  { value: '100,000+', label: '下载次数' },
  { value: '4.9', label: '用户评分' },
];

export default function StatsSection() {
  return React.createElement(
    'section',
    { className: 'stats-section' },
    React.createElement(
      'div',
      { className: 'stats-grid' },
      STATS.map((stat, i) =>
        React.createElement(
          'div',
          { key: i, className: 'stat-item' },
          React.createElement('div', { className: 'stat-item-value' }, stat.value),
          React.createElement('div', { className: 'stat-item-label' }, stat.label)
        )
      )
    )
  );
}
