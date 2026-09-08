import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.7)', zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  modal: {
    background: '#fff', borderRadius: '12px', padding: '24px',
    maxWidth: '360px', width: '90%', textAlign: 'center',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '16px',
  },
  title: { fontSize: '16px', fontWeight: 700 },
  closeBtn: { background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6c757d' },
  qrBox: { margin: '16px auto', width: '180px', height: '180px' },
  info: { fontSize: '13px', color: '#6c757d', marginTop: '12px' },
};

export default function ShareCard({ open, onClose, title }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!open || !canvasRef.current) return;
    const url = window.location.href;
    QRCode.toCanvas(canvasRef.current, url, { width: 180, margin: 1 })
      .catch(() => { /* QR generation may fail in test env */ });
  }, [open]);

  if (!open) return null;
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <span style={styles.title}>分享字帖</span>
          <button style={styles.closeBtn} onClick={onClose}><span aria-hidden="true">×</span> 关闭</button>
        </div>
        <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '8px' }}>{title}</div>
        <div style={styles.qrBox}>
          <canvas ref={canvasRef} />
        </div>
        <div style={styles.info}>微信扫码获取字帖</div>
      </div>
    </div>
  );
}
