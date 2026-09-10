/**
 * HeroSection — Gradient hero with value proposition, CTAs, and trust signals.
 * Inspired by ziyouzt.com hero.
 */
export default function HeroSection({ onStartBuilder, onNavigate }) {
  return React.createElement(
    'section',
    { className: 'hero-section' },
    React.createElement(
      'div',
      { className: 'hero-content animate-fade-in' },
      React.createElement('h1', { className: 'hero-title' }, '免费在线字帖生成器'),
      React.createElement('p', { className: 'hero-subtitle' }, '汉字 · 拼音 · 数学 · 英文 — 自定义内容，高清 PDF 下载打印，免注册即用'),
      React.createElement(
        'div',
        { className: 'hero-actions' },
        React.createElement('button', { className: 'btn-gradient-primary', onClick: () => onStartBuilder?.('hanzi') }, '✏️ 制作汉字字帖'),
        React.createElement('button', { className: 'btn-gradient-green', onClick: () => onStartBuilder?.('math') }, '🔢 制作数学字帖'),
        React.createElement('button', { className: 'btn-outline-white', onClick: () => onNavigate?.('tutorial') }, '📖 使用教程')
      ),
      React.createElement(
        'div',
        { className: 'hero-trust' },
        React.createElement('span', { className: 'hero-trust-item' }, '🆓 免费下载'),
        React.createElement('span', { className: 'hero-trust-item' }, '📄 高清 PDF'),
        React.createElement('span', { className: 'hero-trust-item' }, '🤖 AI 生成'),
        React.createElement('span', { className: 'hero-trust-item' }, '✍️ 在线编辑')
      )
    )
  );
}
