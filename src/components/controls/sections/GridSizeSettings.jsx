import React from 'react';

/**
 * 网格尺寸设置组件
 */
export default function GridSizeSettings({
  rows,
  cols,
  cellSize,
  gridGap,
  handleSetRows,
  handleSetCols,
  handleSetCellSize,
  handleSetGridGap
}) {
  return React.createElement(React.Fragment, null,
    // Rows + cols + cell size
    React.createElement('div', { className: 'row g-2 mt-1' },
      React.createElement('div', { className: 'col-4' },
        React.createElement('label', { className: 'form-label', htmlFor: 'rows' }, '行数/页'),
        React.createElement('input', {
          id: 'rows',
          className: 'form-control',
          type: 'number',
          min: 1,
          value: rows,
          onChange: e => handleSetRows(e.target.value)
        })
      ),
      React.createElement('div', { className: 'col-4' },
        React.createElement('label', { className: 'form-label', htmlFor: 'cols' }, '列数/行'),
        React.createElement('input', {
          id: 'cols',
          className: 'form-control',
          type: 'number',
          min: 1,
          value: cols,
          onChange: e => handleSetCols(e.target.value)
        })
      ),
      React.createElement('div', { className: 'col-4' },
        React.createElement('label', { className: 'form-label', htmlFor: 'cellSize' }, '格子尺寸'),
        React.createElement('input', {
          id: 'cellSize',
          className: 'form-control',
          type: 'number',
          min: 30,
          value: cellSize,
          onChange: e => handleSetCellSize(e.target.value)
        })
      )
    ),

    // Gap + font size
    React.createElement('div', { className: 'row g-2 mt-1' },
      React.createElement('div', { className: 'col-6' },
        React.createElement('label', { className: 'form-label', htmlFor: 'gridGap' }, '行距'),
        React.createElement('input', {
          id: 'gridGap',
          className: 'form-control',
          type: 'number',
          min: 0,
          value: gridGap,
          onChange: e => handleSetGridGap(e.target.value)
        })
      )
    )
  );
}
