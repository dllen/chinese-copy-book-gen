/**
 * SiteFooter — Dark footer with brand, nav links, description, and copyright.
 * Inspired by ziyouzt.com footer.
 */
export default function SiteFooter({ onNavigate }) {
  const navLinks = [
    { key: 'hanzi', label: '汉字字帖' },
    { key: 'math', label: '数学字帖' },
    { key: 'pinyin', label: '拼音字帖' },
    { key: 'english', label: '英文字帖' },
    { key: 'tutorial', label: '使用教程' },
  ];

  return React.createElement(
    'footer',
    { className: 'site-footer' },
    React.createElement(
      'div',
      { className: 'footer-inner' },
      React.createElement(
        'div',
        { className: 'footer-top' },
        React.createElement(
          'div',
          { className: 'footer-brand' },
          React.createElement(
            'div',
            { className: 'footer-brand-icon' },
            React.createElement(
              'svg',
              { viewBox: '0 0 24 24', className: 'brand-icon-svg', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' },
              React.createElement('path', { d: 'M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z' }),
              React.createElement('path', { d: 'M12 20h9' })
            )
          ),
          React.createElement('span', { style: { fontWeight: 700, fontSize: '1rem' } }, '字帖生成器')
        ),
        React.createElement(
          'nav',
          { className: 'footer-nav' },
          navLinks.map((link) =>
            React.createElement('a', {
              key: link.key,
              href: '#',
              onClick: (e) => { e.preventDefault(); onNavigate?.(link.key); },
            }, link.label)
          )
        )
      ),
      React.createElement('p', { className: 'footer-desc' },
        '免费在线字帖生成工具，支持高清 PDF 下载与 A4 打印。提供楷书汉字帖、笔画帖、语文生字与课文文章帖；拼音临摹、看拼音写汉字、看汉字写拼音；数字描写、加减口算、乘除口算与竖式计算；英文大小写字母与单词临摹，适合小学生汉字、拼音与英语书写练习。'
      ),
      React.createElement(
        'div',
        { className: 'footer-bottom' },
        React.createElement('span', null, '© 2026 字帖生成器 All rights reserved.')
      )
    )
  );
}
