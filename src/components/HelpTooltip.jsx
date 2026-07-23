import React, { useState } from 'react';

/**
 * 信息提示图标组件
 * 使用内联 SVG 图标，支持悬停和点击显示帮助信息
 */
export function HelpTooltip({ content, children, icon = 'info', placement = 'top' }) {
  const [show, setShow] = useState(false);

  // SVG 图标
  const icons = {
    info: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
    ),
    help: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <circle cx="12" cy="12" r="10"/>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    question: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  };

  // 位置样式映射
  const tooltipStyle = {
    position: 'absolute',
    background: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)',
    color: '#fff',
    padding: '10px 14px',
    borderRadius: 8,
    fontSize: 13,
    lineHeight: 1.5,
    whiteSpace: 'normal',
    zIndex: 1000,
    maxWidth: 300,
    minWidth: 120,
    boxShadow: '0 10px 25px rgba(0,0,0,0.25), 0 4px 10px rgba(0,0,0,0.2)',
    border: '1px solid rgba(255,255,255,0.1)',
    animation: 'tooltipFadeIn 0.2s ease-out',
  };

  // 箭头样式
  const getArrowStyle = () => {
    const base = { position: 'absolute', borderStyle: 'solid' };
    switch (placement) {
      case 'top':
        return { ...base, top: '100%', left: '50%', transform: 'translateX(-50%)', borderWidth: '6px', borderColor: '#1a202c transparent transparent transparent' };
      case 'bottom':
        return { ...base, bottom: '100%', left: '50%', transform: 'translateX(-50%)', borderWidth: '6px', borderColor: 'transparent transparent #1a202c transparent' };
      case 'left':
        return { ...base, left: '100%', top: '50%', transform: 'translateY(-50%)', borderWidth: '6px', borderColor: 'transparent transparent transparent #1a202c' };
      case 'right':
        return { ...base, right: '100%', top: '50%', transform: 'translateY(-50%)', borderWidth: '6px', borderColor: 'transparent #1a202c transparent transparent' };
      default:
        return { ...base, top: '100%', left: '50%', transform: 'translateX(-50%)', borderWidth: '6px', borderColor: '#1a202c transparent transparent transparent' };
    }
  };

  // wrapper 定位样式
  const getWrapperPosition = () => {
    switch (placement) {
      case 'top':
        return { marginBottom: 6 };
      case 'bottom':
        return { marginTop: 6 };
      case 'left':
        return { marginRight: 8 };
      case 'right':
        return { marginLeft: 8 };
      default:
        return { marginBottom: 6 };
    }
  };

  return (
    <span 
      style={{ 
        position: 'relative', 
        display: 'inline-flex', 
        alignItems: 'center',
        verticalAlign: 'middle',
      }}
      className="help-tooltip-wrapper"
    >
      {children}
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow(!show)}
        className="help-tooltip-icon"
        style={{ 
          cursor: 'pointer', 
          color: '#6c757d',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'color 0.2s ease',
          borderRadius: '50%',
          marginLeft: 4,
          lineHeight: 1,
        }}
        title={content}
        role="button"
        aria-label={content}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setShow(!show); }}
      >
        {icons[icon] || icons.info}
      </span>
      {show && (
        <div 
          style={{
            ...tooltipStyle,
            ...getWrapperPosition(),
            bottom: placement === 'top' ? '100%' : 'auto',
            top: placement === 'bottom' ? '100%' : 'auto',
            left: (placement === 'top' || placement === 'bottom') ? '50%' : 'auto',
            right: (placement === 'left' || placement === 'right') ? '100%' : 'auto',
            transform: (placement === 'top' || placement === 'bottom') ? 'translateX(-50%)' : 'translateY(-50%)',
          }}
          className="help-tooltip-content"
        >
          {content}
          <div style={getArrowStyle()} />
        </div>
      )}
    </span>
  );
}

/**
 * 简化的内联提示组件
 */
export function InlineHelp({ content, icon = 'info' }) {
  const [show, setShow] = useState(false);
  
  const icons = {
    info: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="16" x2="12" y2="12"/>
        <line x1="12" y1="8" x2="12.01" y2="8"/>
      </svg>
    ),
    tip: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
           strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
  };

  return (
    <span 
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', verticalAlign: 'middle' }}
      className="inline-help-wrapper"
    >
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        style={{ cursor: 'help', color: '#9ca3af', display: 'inline-flex', alignItems: 'center', marginLeft: 4 }}
        title={content}
      >
        {icons[icon] || icons.info}
      </span>
      {show && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: 4,
          background: '#1a202c',
          color: '#fff',
          padding: '6px 10px',
          borderRadius: 6,
          fontSize: 12,
          whiteSpace: 'nowrap',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        }}>
          {content}
        </div>
      )}
    </span>
  );
}

export default HelpTooltip;
