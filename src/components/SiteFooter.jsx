import React from 'react';

const NAV_LINKS = [
  { key: 'hanzi', label: '汉字字帖' },
  { key: 'pinyin', label: '拼音字帖' },
  { key: 'english', label: '英文字帖' },
  { key: 'digits', label: '数字与字母' },
  { key: 'tutorial', label: '生成流程' },
];

export default function SiteFooter({ onNavigate }) {
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
          React.createElement('span', { className: 'footer-brand-icon', 'aria-hidden': 'true' }, '字'),
          React.createElement('span', null, '字帖生成器')
        ),
        React.createElement(
          'nav',
          { className: 'footer-nav', 'aria-label': '页脚导航' },
          NAV_LINKS.map((link) =>
            React.createElement(
              'button',
              {
                key: link.key,
                type: 'button',
                onClick: () => onNavigate?.(link.key),
              },
              link.label
            )
          )
        )
      ),
      React.createElement('p', { className: 'footer-desc' }, '免费在线字帖工具，支持汉字、拼音、英文和数字字母练习，提供实时预览、A4 打印和多种格式导出。'),
      React.createElement('div', { className: 'footer-bottom' }, '© 2026 字帖生成器')
    )
  );
}
