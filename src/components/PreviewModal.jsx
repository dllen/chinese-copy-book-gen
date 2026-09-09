import React from 'react';

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.6)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  modal: {
    background: '#f6f7f9',
    borderRadius: '12px',
    maxWidth: '900px',
    width: '100%',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    background: '#fff',
    borderBottom: '1px solid #e0e0e0',
  },
  title: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#333',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666',
    padding: '4px 8px',
    lineHeight: 1,
  },
  body: {
    flex: 1,
    overflow: 'auto',
    padding: '24px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '12px 20px',
    background: '#fff',
    borderTop: '1px solid #e0e0e0',
  },
  btn: {
    padding: '8px 20px',
    fontSize: '14px',
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    background: '#fff',
    cursor: 'pointer',
  },
  btnPrimary: {
    padding: '8px 20px',
    fontSize: '14px',
    border: 'none',
    borderRadius: '6px',
    background: '#0d6efd',
    color: '#fff',
    cursor: 'pointer',
  },
};

export default function PreviewModal({ open, onClose, onPrint, onExportPDF, children }) {
  if (!open) return null;

  return React.createElement('div', {
    style: styles.overlay,
    onClick: (e) => { if (e.target === e.currentTarget) onClose(); }
  },
    React.createElement('div', { style: styles.modal },
      React.createElement('div', { style: styles.header },
        React.createElement('span', { style: styles.title }, '字帖预览'),
        React.createElement('button', {
          style: styles.closeBtn,
          onClick: onClose,
          ariaLabel: '关闭预览'
        }, '×')
      ),
      React.createElement('div', { style: styles.body }, children),
      React.createElement('div', { style: styles.footer },
        onExportPDF && React.createElement('button', { style: styles.btn, onClick: onExportPDF }, '导出 PDF'),
        onPrint && React.createElement('button', { style: styles.btnPrimary, onClick: onPrint }, '打印')
      )
    )
  );
}
