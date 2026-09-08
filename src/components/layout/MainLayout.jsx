import React from 'react'
import ConfigPanel from '../ConfigPanel'
import Toolbar from '../Toolbar'
import PreviewPanel from '../PreviewPanel'
import { EmptyState } from '../EmptyState'
import DarkModeToggle from '../DarkModeToggle';
import StepBar from '../StepBar'
import GradeSelector from '../GradeSelector'
import UnitList from '../UnitList'
import ContentList from '../ContentList'
import QuickGenerateBar from '../QuickGenerateBar'

const STEPS = ['选内容', '选样式', '生成字帖']

/**
 * 主布局组件 — 三步向导式布局
 * StepBar (sticky) → 步骤内容 → QuickGenerateBar (sticky bottom)
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
  chineseCharCount, chineseCharNoRepeat, chineseCharSeqLocal,
  copybookType, copybookStyle, pinyinText, hanziText,
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
  onGenChineseChars,
  // Validation
  validationResult,
  // Alphanumeric stats
  alnumStats,
  // Preview panel props
  pages,
  onFillRandom,
  commonChars,
  usage,
  // Export handlers
  onPrint,
  onExportPDF,
  onPrintPreview,
  onShare,
  onBatchExport,
  onExportImage,
  onSaveTemplate,
  onLoadTemplate,
  onExportConfig,
  onImportConfig,
  onReset,
  libraryState,
  onLibraryStateChange,
  settings,
  toast,
  // Step flow props
  currentStep,
  onStepChange,
  grades,
  units,
  contents,
  searchResults,
  selectedGrade,
  selectedSubject,
  selectedUnit,
  selectedContent,
  onSelectGrade,
  onSelectSubject,
  onSelectUnit,
  onSelectContent,
  onSearchContents,
  hasContent,
  darkMode,
  onToggleDarkMode,
}) {
  const showPreview = !!text

  // ---- Step 0: 选内容 ----
  const step0Content = React.createElement('div', { className: 'row g-3' },
    React.createElement('div', { className: 'col-12 col-lg-7' },
      React.createElement('div', { className: 'card mb-3' },
        React.createElement('div', { className: 'card-body' },
          React.createElement('h5', { className: 'card-title h6 mb-3' }, '选择年级'),
          React.createElement(GradeSelector, {
            grades,
            selectedGrade,
            onSelect: onSelectGrade,
          })
        )
      ),
      React.createElement('div', { className: 'card mb-3' },
        React.createElement('div', { className: 'card-body' },
          React.createElement('h5', { className: 'card-title h6 mb-3' }, '选择单元'),
          units && units.length > 0
            ? React.createElement(UnitList, {
                units,
                selectedUnit,
                onSelect: onSelectUnit,
              })
            : React.createElement('p', { className: 'text-muted small mb-0' }, '请先选择年级')
        )
      ),
      React.createElement('div', { className: 'card' },
        React.createElement('div', { className: 'card-body' },
          React.createElement('h5', { className: 'card-title h6 mb-3' }, '选择课文'),
          React.createElement(ContentList, {
            contents: searchResults && searchResults.length > 0 ? searchResults : contents,
            selectedContent,
            onSelect: onSelectContent,
            onSearch: onSearchContents,
          })
        )
      )
    ),
    React.createElement('div', { className: 'col-12 col-lg-5' },
      !showPreview
        ? React.createElement(EmptyState, {
            onTryExample: () => updateSetting('text', '静夜思'),
            onOpenLibrary: () => updateSetting('feature', '字帖模板')
          })
        : React.createElement(PreviewPanel, {
            pages,
            onFillRandom,
            commonChars,
            onSetRandCount: handleSetRandCount,
            onSetPreviewScale: handleSetPreviewScale,
            updateSetting,
            text,
            gridType,
            gridColor,
            stylePreset,
            rows,
            cols,
            cellSize,
            fontSize,
            usage,
            randCount,
            randNoRepeat,
            previewScale
          })
    )
  )

  // ---- Step 1: 选样式 ----
  const step1Content = React.createElement('div', { className: 'row g-3' },
    React.createElement('div', { className: 'col-12 col-lg-7' },
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
        chineseCharCount, chineseCharNoRepeat, chineseCharSeqLocal,
        copybookType, copybookStyle, pinyinText, hanziText,
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
        onGenChineseChars,
        validationResult,
        alnumStats,
        libraryState,
        onLibraryStateChange,
        settings,
        toast,
      })
    ),
    React.createElement('div', { className: 'col-12 col-lg-5' },
      !showPreview
        ? React.createElement(EmptyState, {
            onTryExample: () => updateSetting('text', '静夜思'),
            onOpenLibrary: () => updateSetting('feature', '字帖模板')
          })
        : React.createElement(PreviewPanel, {
            pages,
            onFillRandom,
            commonChars,
            onSetRandCount: handleSetRandCount,
            onSetPreviewScale: handleSetPreviewScale,
            updateSetting,
            text,
            gridType,
            gridColor,
            stylePreset,
            rows,
            cols,
            cellSize,
            fontSize,
            usage,
            randCount,
            randNoRepeat,
            previewScale
          })
    )
  )

  // ---- Step 2: 生成字帖 (full-width preview + toolbar) ----
  const step2Content = React.createElement('div', { className: 'row g-3' },
    React.createElement('div', { className: 'col-12' },
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
      }),
      !showPreview
        ? React.createElement(EmptyState, {
            onTryExample: () => updateSetting('text', '静夜思'),
            onOpenLibrary: () => updateSetting('feature', '字帖模板')
          })
        : React.createElement(PreviewPanel, {
            pages,
            onFillRandom,
            commonChars,
            onSetRandCount: handleSetRandCount,
            onSetPreviewScale: handleSetPreviewScale,
            updateSetting,
            text,
            gridType,
            gridColor,
            stylePreset,
            rows,
            cols,
            cellSize,
            fontSize,
            usage,
            randCount,
            randNoRepeat,
            previewScale
          })
    )
  )

  const stepContents = [step0Content, step1Content, step2Content]

  return React.createElement(
    React.Fragment,
    null,
    React.createElement('style', null, `
      @media (max-width: 768px) {
        .main-layout-container { padding: 8px !important; }
        .main-layout-container .card-body { padding: 12px; }
        .main-layout-container h1 { font-size: 1.1rem; }
      }
    `),
    React.createElement(
      'div',
      { className: 'container py-3 main-layout-container' },
      React.createElement('div', { className: 'no-print mb-3' },
        React.createElement('div', { className: 'd-flex justify-content-between align-items-center mb-3' },
          React.createElement('h1', { className: 'h4 mb-0' }, '字帖生成器'),
          React.createElement(DarkModeToggle, { darkMode, onToggleDarkMode })
        ),
        React.createElement(StepBar, {
          steps: STEPS,
          currentStep,
          onStepClick: onStepChange,
        }),
        React.createElement("div", { className: 'step-content-wrapper', key: currentStep }, stepContents[currentStep] || step0Content),
        React.createElement(QuickGenerateBar, {
          onGenerate: () => onStepChange && onStepChange(2),
          onPrint,
          onExportPDF,
          onPrintPreview,
          onShare,
          onBatchExport,
          hasContent: hasContent || showPreview,
        })
      )
    )
  )
}
