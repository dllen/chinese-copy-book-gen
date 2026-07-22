import React from 'react';
import { HelpTooltip } from '../../HelpTooltip';

/**
 * 纸张与页边距设置组件
 */
export default function PaperSettings({
  paper,
  marginTop,
  marginRight,
  marginBottom,
  marginLeft,
  handleSetMarginTop,
  handleSetMarginRight,
  handleSetMarginBottom,
  handleSetMarginLeft
}) {
  return React.createElement(React.Fragment, null,
    // Paper + margins
    React.createElement('div', { className: 'row g-2 mt-1' },
      React.createElement('div', { className: 'col-4' },
        React.createElement(HelpTooltip, { content: 'A4竖版适合家用打印机' },
          React.createElement('label', { className: 'form-label', htmlFor: 'paper' }, '纸张格式')
        ),
        React.createElement('select', {
          id: 'paper',
          className: 'form-select',
          value: paper,
          onChange: e => updateSetting('paper', e.target.value)
        },
          ['A4竖版', 'A4横版', 'A5竖版', 'A5横版', '作文纸A4'].map(v =>
            React.createElement('option', { key: v, value: v }, v)
          )
        )
      ),
      React.createElement('div', { className: 'col-8' },
        React.createElement('div', { className: 'row g-1' },
          React.createElement('div', { className: 'col-3' },
            React.createElement('label', { className: 'form-label', htmlFor: 'marginTop' }, '上(mm)'),
            React.createElement('input', {
              id: 'marginTop',
              className: 'form-control form-control-sm',
              type: 'number',
              min: 0,
              value: marginTop,
              onChange: e => handleSetMarginTop(e.target.value)
            })
          ),
          React.createElement('div', { className: 'col-3' },
            React.createElement('label', { className: 'form-label', htmlFor: 'marginRight' }, '右(mm)'),
            React.createElement('input', {
              id: 'marginRight',
              className: 'form-control form-control-sm',
              type: 'number',
              min: 0,
              value: marginRight,
              onChange: e => handleSetMarginRight(e.target.value)
            })
          ),
          React.createElement('div', { className: 'col-3' },
            React.createElement('label', { className: 'form-label', htmlFor: 'marginBottom' }, '下(mm)'),
            React.createElement('input', {
              id: 'marginBottom',
              className: 'form-control form-control-sm',
              type: 'number',
              min: 0,
              value: marginBottom,
              onChange: e => handleSetMarginBottom(e.target.value)
            })
          ),
          React.createElement('div', { className: 'col-3' },
            React.createElement('label', { className: 'form-label', htmlFor: 'marginLeft' }, '左(mm)'),
            React.createElement('input', {
              id: 'marginLeft',
              className: 'form-control form-control-sm',
              type: 'number',
              min: 0,
              value: marginLeft,
              onChange: e => handleSetMarginLeft(e.target.value)
            })
          )
        )
      )
    )
  );
}
