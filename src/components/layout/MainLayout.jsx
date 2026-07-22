import React from 'react'
import ConfigPanel from '../ConfigPanel'
import Toolbar from '../Toolbar'
import PreviewPanel from '../PreviewPanel'
import { EmptyState } from '../EmptyState'

/**
 * 主布局组件
 * 包含左侧控制面板 + 右侧预览面板的响应式布局
 */
export default function MainLayout({
  // Settings
  mode, variant, layout, gridType, gridColor, customGridColor, customTextColor,
  textColorOpt, strokeMode, tailFill, template, customFont,
  rows, cols, cellSize, gridGap, fontSize,
  marginTop, marginRight, marginBottom, marginLeft,
  paper, header, text, randCount, randNoRepeat, previewScale,
  feature, difficulty, showGuide,
  enBlankRows, enRepeat, engShowZh,
  stylePreset, autoLayout, gridStrokeWidth, lineStyle,
  cellRadius, pageBg, cellBg, cellBorder, cellShadow, textShadow, textStroke,
  alnumIncludeDigits, alnumIncludeUpper, alnumIncludeLower,
  alnumCount, alnumNoRepeat, alnumSeqLocal,
  letterStyle, cellShadowLocal,
  // Setters & handlers
  updateSetting,
  handleLetterStyle,
  handleCellShadow,
  handleSetRows,
  handleSetCols,
  handleSetCellSize,
  handleSetGridGap,
  handleSetFontSize,
  handleSetMarginTop,
  handleSetMarginRight,
  handleSetMarginBottom,
  handleSetMarginLeft,
  handleSetEnRepeat,
  handleSetRandCount,
  handleSetAlnumCount,
  handleSetCellRadius,
  handleSetGridStrokeWidth,
  handleSetPreviewScale,
  handleAlnumSeq,
  handleSetCellShadow,
  onInsert,
  onEngShowZhChange,
  onGenAlnum,
  // Validation
  validationResult,
  // Alphanumeric stats
  alnumStats,
  // Preview panel props
  pages,
  onFillRandom,
  commonChars,
  // Export handlers
  onPrint,
  onExportPDF,
  onExportImage,
  onSaveTemplate,
  onLoadTemplate,
  onExportConfig,
  onImportConfig,
  onReset,
}) {
  return React.createElement(
    'div',
    { className: 'container py-3' },
    React.createElement('div', { className: 'no-print mb-3' },
      React.createElement('h1', { className: 'h4 mb-3' }, '字帖生成器'),
      React.createElement('div', { className: 'row g-3' },
        // Left panel - Config + Toolbar
        React.createElement('div', { className: 'col-lg-7' },
          React.createElement(ConfigPanel, {
            mode, variant, layout, gridType, gridColor, customGridColor, customTextColor,
            textColorOpt, strokeMode, tailFill, template, customFont,
            rows, cols, cellSize, gridGap, fontSize,
            marginTop, marginRight, marginBottom, marginLeft,
            paper, header, text, randCount, randNoRepeat, previewScale,
            feature, difficulty, showGuide,
            enBlankRows, enRepeat, engShowZh,
            stylePreset, autoLayout, gridStrokeWidth, lineStyle,
            cellRadius, pageBg, cellBg, cellBorder, cellShadow, textShadow, textStroke,
            alnumIncludeDigits, alnumIncludeUpper, alnumIncludeLower,
            alnumCount, alnumNoRepeat, alnumSeqLocal,
            letterStyle, cellShadowLocal,
            updateSetting,
            handleLetterStyle,
            handleCellShadow,
            handleSetRows,
            handleSetCols,
            handleSetCellSize,
            handleSetGridGap,
            handleSetFontSize,
            handleSetMarginTop,
            handleSetMarginRight,
            handleSetMarginBottom,
            handleSetMarginLeft,
            handleSetEnRepeat,
            handleSetRandCount,
            handleSetAlnumCount,
            handleSetCellRadius,
            handleSetGridStrokeWidth,
            handleSetPreviewScale,
            handleAlnumSeq,
            handleSetCellShadow,
            onInsert,
            onEngShowZhChange,
            onGenAlnum,
            validationResult,
            alnumStats
          }),
          React.createElement(Toolbar, {
            pages,
            onPrint,
            onExportPDF,
            onExportImage,
            onSaveTemplate,
            onLoadTemplate,
            onExportConfig,
            onImportConfig,
            onReset
          })
        ),
        // Right panel - Preview
        React.createElement('div', { className: 'col-lg-5' },
          !text ? React.createElement(EmptyState, {
            onTryExample: () => updateSetting('text', '静夜思'),
            onOpenLibrary: () => updateSetting('feature', '字帖模板')
          }) : React.createElement(PreviewPanel, {
            pages,
            onFillRandom,
            commonChars,
            onSetRandCount: handleSetRandCount,
            onSetPreviewScale: handleSetPreviewScale,
            updateSetting,
            text
          })
        )
      )
    )
  )
}
