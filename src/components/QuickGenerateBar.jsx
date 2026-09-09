import React from 'react';

const styles = {
  bar: {
    position: 'sticky',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '12px 16px',
    background: '#fff',
    borderTop: '2px solid #dee2e6',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    zIndex: 20,
    boxShadow: '0 -2px 10px rgba(0,0,0,0.08)',
  },
  generateBtn: {
    padding: '10px 28px',
    fontSize: '16px',
    fontWeight: 700,
    border: 'none',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  generateBtnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  secondaryBtn: {
    padding: '8px 16px',
    fontSize: '14px',
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    background: '#fff',
    cursor: 'pointer',
  },
  info: { fontSize: '13px', color: '#6c757d', marginRight: 'auto' },
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
      <div style={styles.bar} className="quick-generate-bar" role="region" aria-label="操作栏">
        <span style={styles.info} className="info">
          {hasContent ? '已选内容，可生成字帖' : '请先选择内容'}
        </span>
        <button
          className="generate-btn"
          style={{ ...styles.generateBtn, ...(!hasContent ? styles.generateBtnDisabled : {}) }}
          disabled={!hasContent}
          onClick={onGenerate}
        >
          一键生成字帖
        </button>
        {onPreview && (
          <button className="secondary-btn" style={styles.secondaryBtn} onClick={onPreview}>预览</button>
        )}
        {onPrint && (
          <button className="secondary-btn" style={styles.secondaryBtn} onClick={onPrint}>打印</button>
        )}
        {onExportPDF && (
          <button className="secondary-btn" style={styles.secondaryBtn} onClick={onExportPDF}>PDF</button>
        )}

      </div>
    </>
  );
}
