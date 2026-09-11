import React from 'react';

const TRUST_ITEMS = ['免登录', '高清 PDF', '本地生成', '在线编辑'];

export default function HeroSection({ onStartBuilder }) {
  return React.createElement(
    'section',
    { className: 'hero-section home-hero' },
    React.createElement('div', { className: 'hero-background', 'aria-hidden': 'true' }),
    React.createElement(
      'div',
      { className: 'home-hero-inner' },
      React.createElement(
        'div',
        { className: 'hero-content hero-copy' },
        React.createElement(
          'div',
          { className: 'hero-eyebrow' },
          React.createElement('span', { className: 'hero-eyebrow-dot' }),
          '免费在线字帖工具'
        ),
        React.createElement('h1', { id: 'home-title', className: 'hero-title', tabIndex: -1 }, '免费在线字帖生成器'),
        React.createElement('p', { className: 'hero-subtitle' }, '覆盖汉字、拼音、英文与数字字母，自定义内容、格线和排版，实时预览后直接打印。'),
        React.createElement(
          'div',
          { className: 'hero-actions' },
          React.createElement(
            'button',
            {
              type: 'button',
              className: 'btn-gradient-primary',
              onClick: () => onStartBuilder?.('hanzi'),
            },
            '制作汉字字帖',
            React.createElement('span', { 'aria-hidden': 'true' }, '→')
          ),
          React.createElement(
            'button',
            {
              type: 'button',
              className: 'btn-outline-brand',
              onClick: () => onStartBuilder?.('english'),
            },
            '制作英文字帖'
          )
        ),
        React.createElement(
          'div',
          { className: 'hero-trust' },
          TRUST_ITEMS.map((item) =>
            React.createElement('span', { key: item, className: 'hero-trust-item' }, item)
          )
        )
      ),
      React.createElement(
        'div',
        { className: 'hero-product', 'aria-label': '字帖工作台预览' },
        React.createElement(
          'div',
          { className: 'hero-product-topbar', 'aria-hidden': 'true' },
          React.createElement('i'),
          React.createElement('i'),
          React.createElement('i')
        ),
        React.createElement(
          'div',
          { className: 'hero-product-layout' },
          React.createElement(
            'div',
            { className: 'hero-product-controls' },
            React.createElement('span'),
            React.createElement('span'),
            React.createElement('span'),
            React.createElement('span')
          ),
          React.createElement(
            'div',
            { className: 'hero-paper' },
            React.createElement('div', { className: 'hero-paper-header' }, '山行'),
            React.createElement(
              'div',
              { className: 'hero-paper-grid', 'aria-hidden': 'true' },
              Array.from({ length: 24 }, (_, index) =>
                React.createElement('i', { key: index })
              )
            )
          )
        )
      )
    )
  );
}
