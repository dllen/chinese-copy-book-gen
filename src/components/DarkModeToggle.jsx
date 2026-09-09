import React from 'react';

const trackStyle = {
  position: 'relative',
  width: 44,
  height: 24,
  borderRadius: 12,
  background: '#d1d5db',
  cursor: 'pointer',
  transition: 'background 0.25s ease',
  flexShrink: 0,
};

const trackStyleDark = {
  background: '#4b5563',
};

const thumbStyle = {
  position: 'absolute',
  top: 3,
  left: 3,
  width: 18,
  height: 18,
  borderRadius: '50%',
  background: '#fff',
  boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
  transition: 'transform 0.25s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 10,
  lineHeight: 1,
};

const thumbStyleDark = {
  transform: 'translateX(20px)',
};

export default function DarkModeToggle({ darkMode, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label={darkMode ? '切换到浅色模式' : '切换到深色模式'}
      title={darkMode ? '切换到浅色模式' : '切换到深色模式'}
      style={{
        ...trackStyle,
        ...(darkMode ? trackStyleDark : {}),
        border: 'none',
        padding: 0,
      }}
    >
      <span style={{
        ...thumbStyle,
        ...(darkMode ? thumbStyleDark : {}),
      }}>
        {darkMode ? '🌙' : '☀️'}
      </span>
    </button>
  );
}
