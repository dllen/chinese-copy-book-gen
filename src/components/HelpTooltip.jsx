import React, { useState } from 'react';

export function HelpTooltip({ content, children }) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      {children}
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        style={{ cursor: 'help', marginLeft: 4, color: '#6c757d' }}
      >?</span>
      {show && (
        <div style={{
          position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
          background: '#333', color: '#fff', padding: '8px 12px', borderRadius: 6, fontSize: 13,
          whiteSpace: 'normal', zIndex: 100, maxWidth: 280,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        }}>
          {content}
        </div>
      )}
    </span>
  );
}
