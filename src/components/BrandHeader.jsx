import React, { useEffect, useState } from 'react';
import DarkModeToggle from './DarkModeToggle';

const NAV_ITEMS = [
  { key: 'home', label: '首页' },
  { key: 'hanzi', label: '汉字字帖' },
  { key: 'pinyin', label: '拼音字帖' },
  { key: 'english', label: '英文字帖' },
  { key: 'digits', label: '数字与字母' },
  { key: 'tutorial', label: '教程' },
];

export default function BrandHeader({
  darkMode,
  onToggleDarkMode,
  currentView,
  onNavigate,
}) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navigate = (key) => {
    setMenuOpen(false);
    onNavigate?.(key);
  };

  return React.createElement(
    'header',
    { className: `site-header ${scrolled ? 'is-scrolled' : ''}` },
    React.createElement(
      'div',
      { className: 'header-inner' },
      React.createElement(
        'a',
        {
          className: 'brand',
          href: '#',
          onClick: (e) => { e.preventDefault(); navigate('home'); },
        },
        React.createElement(
          'span',
          { className: 'brand-icon' },
          React.createElement(
            'svg',
            {
              viewBox: '0 0 24 24',
              className: 'brand-icon-svg',
              fill: 'none',
              stroke: 'currentColor',
              strokeWidth: '2',
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              'aria-hidden': 'true',
            },
            React.createElement('path', { className: 'brand-stroke brand-stroke-pen', pathLength: '1', d: 'M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z' }),
            React.createElement('path', { className: 'brand-stroke brand-stroke-line', pathLength: '1', d: 'M12 20h9' })
          )
        ),
        React.createElement('span', { className: 'brand-text' }, '字帖生成器')
      ),
      React.createElement(
        'nav',
        { className: 'nav desktop-nav', 'aria-label': '主导航' },
        NAV_ITEMS.map((item) =>
          React.createElement(
            'a',
            {
              key: item.key,
              className: `nav-link ${currentView === item.key ? 'active' : ''}`,
              href: '#',
              onClick: (e) => { e.preventDefault(); navigate(item.key); },
            },
            item.label
          )
        )
      ),
      React.createElement(
        'div',
        { className: 'header-actions' },
        React.createElement(DarkModeToggle, {
          darkMode,
          onToggle: onToggleDarkMode,
        }),
        React.createElement(
          'button',
          {
            type: 'button',
            className: `menu-toggle ${menuOpen ? 'active' : ''}`,
            'aria-expanded': menuOpen ? 'true' : 'false',
            'aria-label': menuOpen ? '关闭导航菜单' : '打开导航菜单',
            onClick: () => setMenuOpen((prev) => !prev),
          },
          React.createElement(
            'span',
            { className: 'menu-toggle-lines' },
            React.createElement('i'),
            React.createElement('i'),
            React.createElement('i')
          )
        )
      )
    ),
    menuOpen ? React.createElement('div', {
      className: `mobile-mask ${menuOpen ? 'open' : ''}`,
      'aria-hidden': 'true',
      onClick: () => setMenuOpen(false),
    }) : null,
    menuOpen ? React.createElement(
      'nav',
      {
        id: 'mobile-navigation',
        className: `mobile-drawer ${menuOpen ? 'open' : ''}`,
        'aria-label': '移动端导航',
      },
      NAV_ITEMS.map((item) =>
        React.createElement(
          'a',
          {
            key: item.key,
            className: `mobile-link ${currentView === item.key ? 'active' : ''}`,
            href: '#',
            onClick: (e) => {
              e.preventDefault();
              navigate(item.key);
            },
          },
          item.label
        )
      )
    ) : null
  );
}
