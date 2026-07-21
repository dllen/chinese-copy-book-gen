import React from 'react';

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

  return React.createElement('div', { className: 'mt-3 d-flex flex-wrap gap-2' },
    React.createElement('div', { className: 'btn-group' },
      React.createElement('button', { className: 'btn btn-success', onClick: onPrint, disabled }, '打印/另存为PDF'),
      React.createElement('button', { className: 'btn btn-primary', onClick: onExportPDF, disabled }, '生成高清PDF'),
      React.createElement('button', { className: 'btn btn-outline-primary', onClick: onExportImage, disabled }, '导出PNG')
    ),
    React.createElement('div', { className: 'btn-group' },
      React.createElement('button', { className: 'btn btn-outline-secondary', onClick: onExportConfig }, '导出配置'),
      React.createElement('button', { className: 'btn btn-outline-secondary' },
        React.createElement('input', { type: 'file', accept: '.json', style: { position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }, onChange: onImportConfig }),
        '导入配置'
      ),
      React.createElement('button', { className: 'btn btn-outline-danger', onClick: onReset }, '重置')
    ),
    React.createElement('div', { className: 'btn-group' },
      React.createElement('button', { className: 'btn btn-info', onClick: onSaveTemplate }, '保存模板'),
      React.createElement('button', { className: 'btn btn-info' },
        React.createElement('input', { type: 'file', accept: '.json', style: { position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }, onChange: onLoadTemplate }),
        '加载模板'
      )
    ),
    React.createElement('span', { className: 'legend' }, '建议使用现代浏览器。')
  );
}
