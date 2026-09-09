import React from 'react';

const styles = {
  bar: {
    position: 'sticky',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '12px 16px',
    background: '#fff',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    zIndex: 20,
    boxShadow: '0 -1px 3px rgba(0,0,0,0.04)',
  },
  generateBtn: {
    padding: '9px 24px',
    fontSize: '14px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '8px',
    background: '#111827',
    color: '#fff',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  generateBtnDisabled: { opacity: 0.4, cursor: 'not-allowed' },
  secondaryBtn: {
    padding: '8px 16px',
    fontSize: '13px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    background: '#fff',
    cursor: 'pointer',
    color: '#374151',
    fontWeight: 500,
    transition: 'background 0.15s, border-color 0.15s',
  },
  secondaryBtnDisabled: { opacity: 0.4, cursor: 'not-allowed' },
  info: { fontSize: 13, color: '#6b7280', marginRight: 'auto' },
};

export default function QuickGenerateBar({ onGenerate, onPrint, onExportPDF, onPreview, hasContent }) {
  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .quick-generate-bar { flex-direction: column; gap: 8px; align-items: stretch; }
          .quick-generate-bar .generate-btn { width: 100%; }
          .quick-generate-bar .secondary-btn { width: 100%; }
          .quick-generate-bar .info { margin-right: 0; text-align: center; }
        }
      `}</style>
      <div style={styles.bar} className="quick-generate-bar no-print" role="region" aria-label="操作栏">
        <span style={styles.info} className="info">
          {hasContent ? '已选内容，可生成字帖' : '请先选择内容'}
        </span>
        {onPreview && (
          <button
            className="secondary-btn"
            style={{ ...styles.secondaryBtn, ...(hasContent ? {} : styles.secondaryBtnDisabled) }}
            disabled={!hasContent}
            onClick={onPreview}
            onMouseEnter={e => { if (hasContent) { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#9ca3af'; }}}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#d1d5db'; }}
          >预览</button>
        )}
        <button
          className="generate-btn"
          style={{ ...styles.generateBtn, ...(!hasContent ? styles.generateBtnDisabled : {}) }}
          disabled={!hasContent}
          onClick={onGenerate}
          onMouseEnter={e => { if (hasContent) e.currentTarget.style.background = '#374151'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#111827'; }}
        >
          一键生成字帖
        </button>
        {onPrint && (
          <button
            className="secondary-btn"
            style={styles.secondaryBtn}
            onClick={onPrint}
            onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#9ca3af'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#d1d5db'; }}
          >打印</button>
        )}
        {onExportPDF && (
          <button
            className="secondary-btn"
            style={styles.secondaryBtn}
            onClick={onExportPDF}
            onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#9ca3af'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#d1d5db'; }}
          >PDF</button>
        )}
      </div>
    </>
  );
}
