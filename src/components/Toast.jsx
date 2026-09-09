import React from 'react';

const typeStyles = {
  success: { bg: '#ecfdf5', color: '#065f46', border: '#6ee7b7', icon: '✓' },
  error:   { bg: '#fef2f2', color: '#991b1b', border: '#fca5a5', icon: '✕' },
  warning: { bg: '#fffbeb', color: '#92400e', border: '#fcd34d', icon: '!' },
  info:    { bg: '#eff6ff', color: '#1e40af', border: '#93c5fd', icon: 'i' },
  progress:{ bg: '#f5f3ff', color: '#5b21b6', border: '#c4b5fd', icon: '…' },
};

const defaultStyle = { bg: '#f9fafb', color: '#374151', border: '#d1d5db', icon: 'i' };

export function ToastContainer({ toasts, onRemove }) {
  return (
    <>
      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes toastFadeOut {
          from { opacity: 1; transform: translateX(0); }
          to   { opacity: 0; transform: translateX(8px); }
        }
        .toast-enter { animation: toastSlideIn 0.25s ease-out forwards; }
        .toast-exit { animation: toastFadeOut 0.2s ease-in forwards; }
      `}</style>
      <div style={{
        position: 'fixed', top: 16, right: 16, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 340,
      }} role="status" aria-live="polite">
        {toasts.map(t => {
          const style = typeStyles[t.type] || defaultStyle;
          return (
            <div key={t.id} className="toast-enter" style={{
              padding: '10px 14px',
              borderRadius: 8,
              border: `1px solid ${style.border}`,
              background: style.bg,
              color: style.color,
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}>
              <span style={{
                width: 18, height: 18, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, flexShrink: 0,
                background: style.border, color: '#fff',
              }}>{style.icon}</span>
              <span style={{ flex: 1, lineHeight: 1.4 }}>{t.message || ''}</span>
              {t.action && (
                <button onClick={t.action} style={{
                  background: 'none', border: 'none', textDecoration: 'underline',
                  cursor: 'pointer', color: 'inherit', fontSize: 12, fontWeight: 500,
                }}>重试</button>
              )}
              <button onClick={() => onRemove(t.id)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'inherit', fontSize: 15, lineHeight: 1, opacity: 0.6,
                padding: '0 2px',
              }} aria-label="关闭">×</button>
            </div>
          );
        })}
      </div>
    </>
  );
}
