import React from 'react';

const styles = {
  wrapper: {
    marginTop: '1rem',
    padding: '1rem',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    background: '#fff',
  },
  group: {
    marginBottom: '0.75rem',
  },
  groupLabel: {
    fontSize: '0.75rem',
    color: '#9ca3af',
    marginBottom: '0.5rem',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  buttons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    alignItems: 'center',
  },
  divider: {
    width: '1px',
    height: '20px',
    background: '#e5e7eb',
    margin: '0 0.25rem',
  },
};

const iconBtn = (icon, text, onClick, opts = {}) =>
  React.createElement('button', {
    className: opts.className || 'btn btn-outline-secondary',
    onClick,
    disabled: opts.disabled,
    style: opts.style,
    onMouseEnter: (e) => { if (!opts.disabled) e.currentTarget.style.background = '#f9fafb'; },
    onMouseLeave: (e) => { e.currentTarget.style.background = 'transparent'; },
  }, `${icon}\u00a0${text}`);

export default function Toolbar({
  pages,
  onPrint,
  onExportPDF,
  onExportImage,
  onSaveTemplate,
  onLoadTemplate,
  onExportConfig,
  onImportConfig,
  onReset
}) {
  const disabled = pages.length === 0;

  return React.createElement('div', { style: styles.wrapper },
    // 打印导出组
    React.createElement('div', { style: styles.group },
      React.createElement('div', { style: styles.groupLabel }, '打印与导出'),
      React.createElement('div', { style: styles.buttons },
        iconBtn('🖨️', '打印', onPrint, {
          className: 'btn btn-success',
          disabled,
          style: { minWidth: '90px' },
        }),
        iconBtn('📄', 'PDF', onExportPDF, { disabled }),
        iconBtn('🖼️', 'PNG', onExportImage, { disabled })
      )
    ),

    // 模板配置组
    React.createElement('div', { style: styles.group },
      React.createElement('div', { style: styles.groupLabel }, '模板与配置'),
      React.createElement('div', { style: styles.buttons },
        iconBtn('📤', '导出', onExportConfig),
        React.createElement('button', {
          className: 'btn btn-outline-secondary',
          style: { position: 'relative' },
        },
          React.createElement('input', {
            type: 'file', accept: '.json',
            style: { position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', left: 0, top: 0 },
            onChange: onImportConfig,
          }),
          '📥\u00a0导入'
        ),
        React.createElement('div', { style: styles.divider }),
        iconBtn('💾', '保存', onSaveTemplate, { className: 'btn btn-outline-info' }),
        React.createElement('button', {
          className: 'btn btn-outline-info',
          style: { position: 'relative' },
        },
          React.createElement('input', {
            type: 'file', accept: '.json',
            style: { position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', left: 0, top: 0 },
            onChange: onLoadTemplate,
          }),
          '📂\u00a0加载'
        )
      )
    ),

    // 重置
    React.createElement('div', { style: { ...styles.group, marginBottom: 0 } },
      React.createElement('div', { style: styles.buttons },
        iconBtn('↺', '重置', onReset, { className: 'btn btn-outline-danger btn-sm' })
      )
    ),

    React.createElement('div', { style: { marginTop: '0.75rem', fontSize: '0.75rem', color: '#9ca3af' } },
      '建议使用现代浏览器')
  );
}
