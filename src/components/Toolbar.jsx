import React from 'react';

// 分组样式
const styles = {
  wrapper: {
    marginTop: '1rem',
    padding: '1rem',
    border: '1px solid #dee2e6',
    borderRadius: '0.5rem',
    background: '#fff',
  },
  group: {
    marginBottom: '0.75rem',
  },
  groupLabel: {
    fontSize: '0.8rem',
    color: '#6c757d',
    marginBottom: '0.5rem',
    fontWeight: 500,
  },
  buttons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    alignItems: 'center',
  },
  divider: {
    width: '1px',
    height: '24px',
    background: '#dee2e6',
    margin: '0 0.25rem',
  }
};

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
        React.createElement('button', { className: 'btn btn-success', onClick: onPrint, disabled, style: { minWidth: '100px' } }, '打印'),
        React.createElement('button', { className: 'btn btn-primary', onClick: onExportPDF, disabled }, '生成 PDF'),
        React.createElement('button', { className: 'btn btn-outline-primary', onClick: onExportImage, disabled }, '导出 PNG')
      )
    ),

    // 模板配置组
    React.createElement('div', { style: styles.group },
      React.createElement('div', { style: styles.groupLabel }, '模板与配置'),
      React.createElement('div', { style: styles.buttons },
        React.createElement('button', { className: 'btn btn-outline-secondary', onClick: onExportConfig }, '导出配置'),
        React.createElement('button', { className: 'btn btn-outline-secondary', style: { position: 'relative' } },
          React.createElement('input', { type: 'file', accept: '.json', style: { position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', left: 0, top: 0 }, onChange: onImportConfig }),
          '导入配置'
        ),
        React.createElement('div', { style: styles.divider }),
        React.createElement('button', { className: 'btn btn-outline-info', onClick: onSaveTemplate }, '保存模板'),
        React.createElement('button', { className: 'btn btn-outline-info', style: { position: 'relative' } },
          React.createElement('input', { type: 'file', accept: '.json', style: { position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer', left: 0, top: 0 }, onChange: onLoadTemplate }),
          '加载模板'
        )
      )
    ),

    // 重置
    React.createElement('div', { style: { ...styles.group, marginBottom: 0 } },
      React.createElement('div', { style: styles.buttons },
        React.createElement('button', { className: 'btn btn-outline-danger btn-sm', onClick: onReset }, '重置设置')
      )
    ),

    React.createElement('div', { style: { marginTop: '0.75rem', fontSize: '0.8rem', color: '#6c757d' } }, '建议使用现代浏览器')
  );
}
