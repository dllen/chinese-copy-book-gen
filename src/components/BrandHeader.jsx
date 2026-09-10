import React, { useEffect, useState } from 'react';

/**
 * BrandHeader — Sticky header with gradient brand icon, nav links, and dark mode toggle.
 * Inspired by ziyouzt.com header (sticky + backdrop-blur on scroll).
 */
export default function BrandHeader({ darkMode, onToggleDarkMode, currentView, onNavigate }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navItems = [
    { key: 'home', label: '首页' },
    { key: 'hanzi', label: '汉字字帖' },
    { key: 'math', label: '数学字帖' },
    { key: 'pinyin', label: '拼音字帖' },
    { key: 'english', label: '英文字帖' },
    { key: 'tutorial', label: '教程' },
  ];

  return React.createElement(
    'header',
    { className: `site-header ${scrolled ? 'is-scrolled' : ''}` },
    React.createElement(
      'div',
      { className: 'header-inner' },
      // Brand
      React.createElement(
        'a',
        { className: 'brand', href: '#', onClick: (e) => { e.preventDefault(); onNavigate?.('home'); } },
        React.createElement(
          'span',
          { className: 'brand-icon' },
          React.createElement(
            'svg',
            { viewBox: '0 0 24 24', className: 'brand-icon-svg', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' },
            React.createElement('path', { className: 'brand-stroke brand-stroke-pen', pathLength: '1', d: 'M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z' }),
            React.createElement('path', { className: 'brand-stroke brand-stroke-line', pathLength: '1', d: 'M12 20h9' })
          )
        ),
        React.createElement('span', { className: 'brand-text' }, '字帖生成器')
      ),
      // Desktop Nav
      React.createElement(
        'nav',
        { className: 'nav desktop-nav', style: { display: 'flex', gap: '.25rem', flex: 1, flexWrap: 'wrap', justifyContent: 'center', margin: '0 .5rem' } },
        navItems.map((item) =>
          React.createElement(
            'a',
            {
              key: item.key,
              className: `nav-link ${currentView === item.key ? 'active' : ''}`,
              href: '#',
              onClick: (e) => { e.preventDefault(); onNavigate?.(item.key); },
            },
            item.label
          )
        )
      ),
      // Dark mode toggle
      React.createElement(
        'button',
        {
          className: 'btn btn-sm btn-outline-secondary',
          onClick: onToggleDarkMode,
          title: darkMode ? '切换亮色模式' : '切换暗色模式',
          style: { borderRadius: 'var(--radius-md)', fontSize: '1rem', lineHeight: 1, padding: '.35rem .5rem' },
        },
        darkMode ? '☀️' : '🌙'
      )
    )
  );
}
