import React from 'react';
import { toPinyin } from '../utils/pinyin';

const { strokeLevel } = window.__copybook__?.utils || {};
const { content } = window.__copybook__ || {};
const { splitRows } = content || {};

/**
 * Cell component for rendering a single grid cell
 * Handles different cell types including pinyin-hanzi cells
 */
function Cell({ ch, bg, textColor, strokeMode, font, fontSize, showGuide, cls, cellType, pinyinColor, isPinyinCell, isBlankCell, showPinyin }) {
  const style = strokeLevel(strokeMode, textColor);

  // 显示拼音标注
  const isChineseChar = /[一-鿿]/.test(ch);
  const pinyinText = showPinyin && isChineseChar ? toPinyin(ch) : null;

  if (pinyinText) {
    return React.createElement('div', {
      className: 'cell ' + (cls || ''),
      style: {
        backgroundImage: bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        fontFamily: font,
        fontSize: fontSize,
        position: 'relative',
        color: style.color,
        WebkitTextStroke: style.WebkitTextStroke,
        opacity: style.opacity
      }
    },
      React.createElement('span', {
        style: { color: pinyinColor || '#999', fontSize: Math.max(8, fontSize * 0.35) + 'px', lineHeight: 1, marginBottom: '2px' }
      }, pinyinText),
      React.createElement('span', {
        style: { color: style.color, WebkitTextStroke: style.WebkitTextStroke, opacity: style.opacity }
      }, ch)
    );
  }
  
  // 看拼音写汉字的单元格：显示拼音在上
  if (isPinyinCell && ch && ch.startsWith('[') && ch.endsWith(']')) {
    const pinyin = ch.slice(1, -1);
    return React.createElement('div', {
      className: 'cell ' + (cls || ''),
      style: {
        backgroundImage: bg,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: font,
        fontSize: Math.max(12, fontSize * 0.6) + 'px'
      }
    },
      React.createElement('span', {
        style: { color: pinyinColor || '#dc3545', fontSize: Math.max(10, fontSize * 0.5) + 'px', fontWeight: 'bold' }
      }, pinyin),
      React.createElement('span', {
        style: { color: '#ccc', fontSize: Math.max(8, fontSize * 0.4) + 'px' }
      }, '____')
    );
  }
  
  // 答案单元格（看拼音写汉字时显示）
  if (isBlankCell) {
    return React.createElement('div', {
      className: 'cell ' + (cls || ''),
      style: {
        backgroundImage: bg,
        color: textColor,
        fontFamily: font,
        fontSize: fontSize
      }
    }, ch || '');
  }
  
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
  engFont,
  copybookType,
  copybookStyle, showPinyin,
  pinyinColor
}) {
  // 判断是否是看拼音写汉字模式
  const isPinyinHanzi = copybookType === '看拼音写汉字';
  // 判断是否是隔行样式
  const isEveryOtherLine = copybookStyle === '隔行';
  // 当前行索引（用于隔行样式）
  let lineIndex = 0;

  return React.createElement('div', { className: 'page-wrapper' },
    pages.map((page, i) => React.createElement('div', { key: i, className: 'page' },
      header ? React.createElement('div', { className: 'header' }, header) : null,
      React.createElement('div', { className: 'grid' },
        (content && content.splitRows ? content.splitRows(page, cols) : (splitRows ? splitRows(page, cols) : [page])).map((row, ri) => {
          // 隔行样式：奇数行显示，偶数行空白
          const shouldHide = isEveryOtherLine && lineIndex % 2 === 1;
          lineIndex++;
          
          return React.createElement('div', {
            key: ri,
            className: 'grid-row' + (shouldHide ? ' hidden-row' : ''),
            style: { 
              display: 'grid', 
              gridTemplateColumns: `repeat(${cols}, var(--cell-size))`, 
              gap: layout === '英文格式' ? 0 : 'var(--grid-gap)',
              opacity: shouldHide ? 0.3 : 1
            }
          },
            row.map((ch, ci) => {
              const isPinyinCell = isPinyinHanzi && ch && ch.startsWith('[');
              const isBlankCell = isPinyinHanzi && (!ch || !ch.startsWith('['));
              
              return React.createElement(Cell, {
                key: ci,
                ch: ch || '',
                bg: bg,
                textColor: tColor,
                strokeMode,
                cls: (layout === '英文格式' || feature === '数字字母') ? 'cell-en' : undefined,
                font: layout === '英文格式' ? engFont(letterStyle) : feature === '数字字母' ? (letterStyle === '印刷体' ? 'monospace' : 'cursive') : font,
                fontSize,
                showGuide: feature === '数字字母' && showGuide,
                isPinyinCell,
                isBlankCell, showPinyin,
                pinyinColor
              });
            })
          );
        })
      )
    ))
  );
}
