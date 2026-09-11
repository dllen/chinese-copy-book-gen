import React from 'react';

export default function QuickGenerateBar({
  onGenerate,
  onPrint,
  onExportPDF,
  onPreview,
  hasContent,
}) {
  return React.createElement(
    'div',
    {
      className: 'quick-generate-bar no-print',
      role: 'region',
      'aria-label': '操作栏',
    },
    React.createElement(
      'span',
      { className: 'quick-generate-info' },
      hasContent ? '已选内容，可生成字帖' : '请先选择内容'
    ),
    onPreview && React.createElement(
      'button',
      {
        type: 'button',
        className: 'builder-btn builder-btn-secondary',
        disabled: !hasContent,
        onClick: onPreview,
      },
      '预览'
    ),
    React.createElement(
      'button',
      {
        type: 'button',
        className: 'builder-btn builder-btn-primary',
        disabled: !hasContent,
        onClick: onGenerate,
      },
      '一键生成字帖'
    ),
    onPrint && React.createElement(
      'button',
      {
        type: 'button',
        className: 'builder-btn builder-btn-secondary',
        onClick: onPrint,
      },
      '打印'
    ),
    onExportPDF && React.createElement(
      'button',
      {
        type: 'button',
        className: 'builder-btn builder-btn-secondary',
        onClick: onExportPDF,
      },
      'PDF'
    )
  );
}
