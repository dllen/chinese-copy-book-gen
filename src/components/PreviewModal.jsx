import React from 'react';

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.55)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    animation: 'fadeIn 0.2s ease-out',
  },
  modal: {
    background: '#fff',
    borderRadius: '12px',
    maxWidth: '960px',
    width: '100%',
    maxHeight: '92vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 24px 48px rgba(0,0,0,0.2), 0 8px 16px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    animation: 'scaleIn 0.2s ease-out',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    background: '#fff',
    borderBottom: '1px solid #e5e7eb',
  },
  title: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#111827',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#9ca3af',
    padding: '4px 8px',
    lineHeight: 1,
    borderRadius: '6px',
    transition: 'color 0.15s, background 0.15s',
  },
  body: {
    flex: 1,
    overflow: 'auto',
    padding: '32px',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '14px 24px',
    background: '#f9fafb',
    borderTop: '1px solid #e5e7eb',
  },
  btn: {
    padding: '8px 20px',
    fontSize: '14px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    background: '#fff',
    cursor: 'pointer',
    color: '#374151',
    fontWeight: 500,
    transition: 'background 0.15s, border-color 0.15s',
  },
  btnPrimary: {
    padding: '8px 20px',
    fontSize: '14px',
    border: 'none',
    borderRadius: '6px',
    background: '#111827',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'background 0.15s',
  },
};

export default function PreviewModal({ open, onClose, onPrint, onExportPDF, children }) {
  const modalRef = React.useRef(null);
  const closeRef = React.useRef(null);

  // Focus the close button when modal opens
  React.useEffect(() => {
    if (open && closeRef.current) {
      closeRef.current.focus();
    }
  }, [open]);

  // Close on Escape key
  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
      // Simple focus trap: cycle between focusable elements
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return React.createElement('div', {
    className: 'preview-modal-overlay no-print',
    style: styles.overlay,
    onClick: (e) => { if (e.target === e.currentTarget) onClose(); },
    role: 'dialog',
    'aria-modal': 'true',
    'aria-label': '字帖预览',
  },
    React.createElement('div', { className: 'preview-modal-dialog', style: styles.modal, ref: modalRef },
      React.createElement('div', { style: styles.header },
        React.createElement('span', { style: styles.title }, '字帖预览'),
        React.createElement('button', {
          ref: closeRef,
          style: styles.closeBtn,
          onClick: onClose,
          'aria-label': '关闭预览',
          onMouseEnter: (e) => { e.currentTarget.style.color = '#111827'; e.currentTarget.style.background = '#f3f4f6'; },
          onMouseLeave: (e) => { e.currentTarget.style.color = '#9ca3af'; e.currentTarget.style.background = 'none'; },
        }, '×')
      ),
      React.createElement('div', { className: 'preview-modal-body', style: styles.body }, children),
      React.createElement('div', { style: styles.footer },
        onExportPDF && React.createElement('button', {
          style: styles.btn, onClick: onExportPDF,
          onMouseEnter: (e) => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#9ca3af'; },
          onMouseLeave: (e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#d1d5db'; },
        }, '导出 PDF'),
        onPrint && React.createElement('button', {
          style: styles.btnPrimary, onClick: onPrint,
          onMouseEnter: (e) => { e.currentTarget.style.background = '#374151'; },
          onMouseLeave: (e) => { e.currentTarget.style.background = '#111827'; },
        }, '打印')
      )
    )
  );
}
