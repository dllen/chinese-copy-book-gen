import React from 'react';

// Placeholder App component - full refactor from app.js happens in Task 7
// For now, we mount the original app via ReactDOM.render to keep things working
export default function App() {
  // The actual app logic from app.js will be integrated in Task 7
  // This placeholder just renders a loading message until then
  return React.createElement('div', { className: 'container py-3' },
    React.createElement('h1', { className: 'h4 mb-3' }, '字帖生成器 v2 (加载中...)')
  );
}
