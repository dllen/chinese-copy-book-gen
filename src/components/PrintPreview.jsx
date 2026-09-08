import React from 'react';

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.7)', zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  modal: {
    background: '#fff', borderRadius: '12px', padding: '24px',
    maxWidth: '600px', width: '90%', maxHeight: '80vh', overflowY: 'auto',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '16px', borderBottom: '1px solid #dee2e6', paddingBottom: '12px',
  },
  title: { fontSize: '18px', fontWeight: 700 },
  closeBtn: {
    background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer',
    color: '#6c757d', padding: '4px 8px',
  },
  info: { marginBottom: '16px', fontSize: '14px', color: '#6c757d' },
  pagePreview: {
    width: '210mm', minHeight: '297mm', margin: '0 auto',
    background: '#fff', border: '1px solid #dee2e6', padding: '20mm',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '16px',
    transform: 'scale(0.6)', transformOrigin: 'top center',
  },
  actions: { display: 'flex', gap: '12px', justifyContent: 'center' },
  printBtn: {
    padding: '10px 24px', background: '#0d6efd', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
  },
  cancelBtn: {
    padding: '10px 24px', background: '#6c757d', color: '#fff',
    border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
  },
};

export default function PrintPreview({ open, onClose, pages }) {
  if (!open) return null;
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <span style={styles.title}>打印预览</span>
          <button style={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        <div style={styles.info}>
          A4 纸张 · 共 {pages} 页 · 建议使用 100% 缩放打印
        </div>
        <div style={styles.pagePreview}>
          <div style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>
            第 1 页（预览）
          </div>
        </div>
        <div style={styles.actions}>
          <button style={styles.cancelBtn} onClick={onClose}>关闭</button>
          <button style={styles.printBtn} onClick={() => window.print()}>
            确认打印
          </button>
        </div>
      </div>
    </div>
  );
}
