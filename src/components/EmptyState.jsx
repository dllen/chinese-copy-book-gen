import React from 'react';

const iconStyle = {
  width: 56,
  height: 56,
  borderRadius: '16px',
  background: '#f3f4f6',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 28,
  margin: '0 auto 16px',
};

const primaryBtn = {
  padding: '8px 20px',
  fontSize: '13px',
  fontWeight: 500,
  border: 'none',
  borderRadius: '8px',
  background: '#111827',
  color: '#fff',
  cursor: 'pointer',
  transition: 'background 0.15s',
};

const secondaryBtn = {
  padding: '8px 20px',
  fontSize: '13px',
  fontWeight: 500,
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  background: '#fff',
  color: '#374151',
  cursor: 'pointer',
  transition: 'background 0.15s, border-color 0.15s',
};

export function EmptyState({ onTryExample, onOpenLibrary }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '48px 24px',
      color: '#6b7280',
    }}>
      <div style={iconStyle} aria-hidden="true">📝</div>
      <h3 style={{ color: '#111827', marginBottom: 6, fontSize: '16px', fontWeight: 600 }}>
        还没有内容
      </h3>
      <p style={{ marginBottom: 24, fontSize: '13px', lineHeight: 1.5, maxWidth: 280, margin: '0 auto 24px' }}>
        输入文字或从词库选择模板，即可生成字帖
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          style={primaryBtn}
          onClick={onTryExample}
          onMouseEnter={e => { e.currentTarget.style.background = '#374151'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#111827'; }}
        >
          试试示例
        </button>
        {onOpenLibrary && (
          <button
            style={secondaryBtn}
            onClick={onOpenLibrary}
            onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#9ca3af'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#d1d5db'; }}
          >
            从词库选择
          </button>
        )}
      </div>
    </div>
  );
}
