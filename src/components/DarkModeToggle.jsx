import React from 'react';

const styles = {
  btn: {
    background: 'none', border: '1px solid #dee2e6', borderRadius: '6px',
    padding: '4px 10px', fontSize: '14px', cursor: 'pointer',
    color: 'inherit',
  },
};

export default function DarkModeToggle({ darkMode, onToggle }) {
  return (
    <button
      style={styles.btn}
      onClick={onToggle}
      aria-label={darkMode ? '切换到浅色模式' : '切换到深色模式'}
      title={darkMode ? '切换到浅色模式' : '切换到深色模式'}
    >
      {darkMode ? '🌞 浅色' : '🌙 深色'}
    </button>
  );
}
