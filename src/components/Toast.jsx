import React from 'react';

const typeStyles = {
  success: { bg: '#d1fae5', color: '#065f46', border: '#34d399' },
  error:   { bg: '#fee2e2', color: '#991b1b', border: '#f87171' },
  warning: { bg: '#fef3c7', color: '#92400e', border: '#fbbf24' },
  info:    { bg: '#dbeafe', color: '#1e40af', border: '#60a5fa' },
  progress:{ bg: '#eff6ff', color: '#1e40af', border: '#60a5fa' },
};

const defaultStyle = { bg: '#f3f4f6', color: '#374151', border: '#9ca3af' };

export function ToastContainer({ toasts, onRemove }) {
  return (
    <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 320 }}>
      {toasts.map(t => {
        const style = typeStyles[t.type] || defaultStyle;
        return (
          <div key={t.id} style={{
            ...style,
            padding: '10px 14px',
            borderRadius: 8,
            border: `1px solid ${style.border}`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            <span style={{ flex: 1 }}>{t.message || ''}</span>
            {t.action && <button onClick={t.action} style={{ background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer', color: 'inherit', fontSize: 13 }}>重试</button>}
            <button onClick={() => onRemove(t.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: 16, lineHeight: 1 }}>×</button>
          </div>
        );
      })}
    </div>
  );
}
