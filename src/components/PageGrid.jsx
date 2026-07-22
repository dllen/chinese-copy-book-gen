import React from 'react';

const { strokeLevel } = window.__copybook__?.utils || {};
const { content } = window.__copybook__ || {};
const { splitRows } = content || {};

function Cell({ ch, bg, textColor, strokeMode, font, fontSize, showGuide, cls }) {
  const style = strokeLevel(strokeMode, textColor);
  return React.createElement('div', {
    className: 'cell' + (cls ? ' ' + cls : ''),
    style: {
      backgroundImage: bg,
      color: style.color,
      WebkitTextStroke: style.WebkitTextStroke,
      opacity: style.opacity,
      fontFamily: font,
      fontSize: fontSize
    }
  }, ch || '', showGuide ? React.createElement('div', { className: 'guide' },
    React.createElement('div', { className: 'guide-arrow' })
  ) : null);
}

export default function PageGrid({
  pages,
  cols,
  layout,
  feature,
  header,
  bg,
  tColor,
  strokeMode,
  font,
  fontSize,
  letterStyle,
  showGuide,
  engFont
}) {
  return React.createElement('div', { className: 'page-wrapper' },
    pages.map((page, i) => React.createElement('div', { key: i, className: 'page' },
      header ? React.createElement('div', { className: 'header' }, header) : null,
      React.createElement('div', { className: 'grid' },
        (content && content.splitRows ? content.splitRows(page, cols) : (splitRows ? splitRows(page, cols) : [page])).map((row, ri) => React.createElement('div', {
          key: ri,
          className: 'grid-row',
          style: { display: 'grid', gridTemplateColumns: `repeat(${cols}, var(--cell-size))`, gap: layout === '英文格式' ? 0 : 'var(--grid-gap)' }
        },
          row.map((ch, ci) => React.createElement(Cell, {
            key: ci,
            ch: ch || '',
            bg: bg,
            textColor: tColor,
            strokeMode,
            cls: (layout === '英文格式' || feature === '数字字母') ? 'cell-en' : undefined,
            font: layout === '英文格式' ? engFont(letterStyle) : feature === '数字字母' ? (letterStyle === '印刷体' ? 'monospace' : 'cursive') : font,
            fontSize,
            showGuide: feature === '数字字母' && showGuide
          }))
        ))
      )
    ))
  );
}
