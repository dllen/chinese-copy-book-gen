import React from 'react';
import { HelpTooltip } from './HelpTooltip';
import LayoutSection from './controls/sections/LayoutSection';
import EnglishSettings from './controls/sections/EnglishSettings';
import TextInputSection from './controls/sections/TextInputSection';
import SpecialFeatureSettings from './controls/sections/SpecialFeatureSettings';
import ColorSettings from './controls/sections/ColorSettings';
import GridSizeSettings from './controls/sections/GridSizeSettings';
import PaperSettings from './controls/sections/PaperSettings';
import TemplateFontSettings from './controls/sections/TemplateFontSettings';
import HeaderSettings from './controls/sections/HeaderSettings';

const { toHex } = window.__copybook__.utils || {};

// Wraps LibraryPanel to catch React 18 hooks incompatibility
class LibraryPanelErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

/**
 * 配置面板主组件
 * 组合各个子组件，提供完整的配置界面
 */
export default function ConfigPanel({
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
}) {
  return React.createElement('div', { className: 'card' },
    React.createElement('div', { className: 'card-body' },

      // 功能模块
      React.createElement('div', { className: 'mb-2' },
        React.createElement('label', { className: 'form-label', htmlFor: 'feature' }, '功能模块'),
        React.createElement('select', {
          id: 'feature',
          className: 'form-select',
          value: feature,
          onChange: e => updateSetting('feature', e.target.value)
        },
          ['字帖模板', '控笔字帖', '数字字母'].map(v =>
            React.createElement('option', { key: v, value: v }, v)
          )
        )
      ),

      // 排版格式
      React.createElement(LayoutSection, {
        feature,
        layout,
        gridType,
        stylePreset,
        updateSetting
      }),

      // 英文格式特殊设置
      feature === '字帖模板' && layout === '英文格式' ? React.createElement(EnglishSettings, {
        letterStyle,
        enBlankRows,
        enRepeat,
        engShowZh,
        handleLetterStyle,
        updateSetting
      }) : null,

      // 诗库/文库
      feature === '字帖模板' && window.__copybook__.library ? React.createElement(LibraryPanelErrorBoundary, null,
        React.createElement(window.__copybook__.library.LibraryPanel, {
          onInsert: onInsert,
          engShowZh: engShowZh,
          onEngShowZhChange: onEngShowZhChange
        })
      ) : null,

      // 文本输入
      feature === '字帖模板' ? React.createElement(TextInputSection, {
        mode,
        variant,
        layout,
        text,
        feature,
        updateSetting
      }) : null,

      // 控笔/数字字母特殊设置
      React.createElement(SpecialFeatureSettings, {
        feature,
        difficulty,
        showGuide,
        alnumIncludeDigits,
        alnumIncludeUpper,
        alnumIncludeLower,
        alnumCount,
        alnumNoRepeat,
        alnumSeqLocal,
        alnumStats,
        updateSetting,
        handleSetAlnumCount,
        onGenAlnum
      }),

      // 分隔线
      React.createElement('hr', { className: 'my-3' }),

      // 样式与网格
      React.createElement('div', { className: 'mb-2' },
        React.createElement('div', { className: 'fw-bold mb-2' }, '样式与网格'),

        // 打印样式预设
        React.createElement('div', { className: 'mb-2' },
          React.createElement('label', { className: 'form-label', htmlFor: 'stylePreset' }, '打印样式'),
          React.createElement('select', {
            id: 'stylePreset',
            className: 'form-select form-select-sm',
            value: stylePreset,
            onChange: e => updateSetting('stylePreset', e.target.value)
          },
            [
              '四线三格标准', '四线三格宽间',
              '田字格标准',
              '米字格标准', '米字格宽间',
              '回宫格标准', '回宫格宽间',
              '现代简约', '儿童卡通'
            ].map(v => React.createElement('option', { key: v, value: v }, v))
          )
        ),

        // 格子类型 + 颜色
        React.createElement('div', { className: 'row g-2' },
          React.createElement('div', { className: 'col-5' },
            React.createElement(HelpTooltip, { content: '田字格适合初学者，米字格增加对角线辅助' },
              React.createElement('label', { className: 'form-label', htmlFor: 'gridType' }, '格子类型')
            ),
            React.createElement('select', {
              id: 'gridType',
              className: 'form-select form-select-sm',
              value: gridType,
              onChange: e => updateSetting('gridType', e.target.value)
            },
              ['田字格', '米字格', '回宫格', '四线三格', '无格'].map(v =>
                React.createElement('option', { key: v, value: v }, v)
              )
            )
          ),
          React.createElement('div', { className: 'col-4' },
            React.createElement('label', { className: 'form-label', htmlFor: 'gridColor' }, '格子颜色'),
            React.createElement('select', {
              id: 'gridColor',
              className: 'form-select form-select-sm',
              value: gridColor,
              onChange: e => updateSetting('gridColor', e.target.value)
            },
              ['绿色', '黑色', '红色', '蓝色', '紫色'].map(v =>
                React.createElement('option', { key: v, value: v }, v)
              )
            )
          ),
          React.createElement('div', { className: 'col-3' },
            React.createElement('label', { className: 'form-label', htmlFor: 'customGridColor' }, '自定义'),
            React.createElement('input', {
              id: 'customGridColor',
              className: 'form-control form-control-sm',
              type: 'color',
              value: customGridColor || toHex(gridColor),
              onChange: e => updateSetting('customGridColor', e.target.value)
            })
          )
        ),

        // 颜色设置
        React.createElement(ColorSettings, {
          gridColor,
          customGridColor,
          textColorOpt,
          customTextColor,
          strokeMode,
          updateSetting
        }),

        // 线条样式 + 圆角 + 边框
        React.createElement('div', { className: 'row g-2 mt-1' },
          React.createElement('div', { className: 'col-4' },
            React.createElement('label', { className: 'form-label', htmlFor: 'lineStyle' }, '线条样式'),
            React.createElement('select', {
              id: 'lineStyle',
              className: 'form-select form-select-sm',
              value: lineStyle,
              onChange: e => updateSetting('lineStyle', e.target.value)
            },
              ['实线', '虚线', '点线', '点划线'].map(v =>
                React.createElement('option', { key: v, value: v }, v)
              )
            )
          ),
          React.createElement('div', { className: 'col-4' },
            React.createElement('label', { className: 'form-label', htmlFor: 'cellRadius' }, '格子圆角'),
            React.createElement('input', {
              id: 'cellRadius',
              className: 'form-range form-range-sm',
              type: 'range',
              min: 0,
              max: 10,
              step: 1,
              value: cellRadius,
              onChange: e => handleSetCellRadius(e.target.value)
            }),
            React.createElement('div', { className: 'form-text' }, `${cellRadius}px`)
          ),
          React.createElement('div', { className: 'col-4 d-flex align-items-end' },
            React.createElement('div', { className: 'form-check' },
              React.createElement('input', {
                className: 'form-check-input',
                type: 'checkbox',
                id: 'cellBorder',
                checked: cellBorder,
                onChange: e => updateSetting('cellBorder', e.target.checked)
              }),
              React.createElement('label', { className: 'form-check-label', htmlFor: 'cellBorder' }, '加边框')
            )
          )
        ),

        // 网格尺寸
        React.createElement(GridSizeSettings, {
          rows,
          cols,
          cellSize,
          gridGap,
          handleSetRows,
          handleSetCols,
          handleSetCellSize,
          handleSetGridGap
        }),

        // 智能排版
        React.createElement('div', { className: 'form-check mt-1' },
          React.createElement('input', {
            className: 'form-check-input',
            type: 'checkbox',
            id: 'autoLayout',
            checked: autoLayout,
            onChange: e => updateSetting('autoLayout', e.target.checked)
          }),
          React.createElement('label', { className: 'form-check-label', htmlFor: 'autoLayout' }, '智能排版（四线三格）')
        )
      ),

      // 分隔线
      React.createElement('hr', { className: 'my-3' }),

      // 纸张与排版
      React.createElement('div', { className: 'mb-2' },
        React.createElement('div', { className: 'fw-bold mb-2' }, '纸张与排版'),

        // 纸张设置
        React.createElement(PaperSettings, {
          paper,
          marginTop,
          marginRight,
          marginBottom,
          marginLeft,
          handleSetMarginTop,
          handleSetMarginRight,
          handleSetMarginBottom,
          handleSetMarginLeft
        }),

        // 字体大小
        React.createElement('div', { className: 'row g-2 mt-1' },
          React.createElement('div', { className: 'col-6' },
            React.createElement('label', { className: 'form-label', htmlFor: 'fontSize' }, '字体大小'),
            React.createElement('input', {
              id: 'fontSize',
              className: 'form-control',
              type: 'number',
              min: 12,
              value: fontSize,
              onChange: e => handleSetFontSize(e.target.value)
            })
          )
        )
      ),

      // 分隔线
      React.createElement('hr', { className: 'my-3' }),

      // 高级设置
      React.createElement('div', { className: 'mb-2' },
        React.createElement('div', { className: 'fw-bold mb-2' }, '高级设置'),

        // 模板字体
        React.createElement(TemplateFontSettings, {
          template,
          customFont,
          updateSetting
        }),

        // 页眉 + 尾页
        React.createElement(HeaderSettings, {
          header,
          tailFill,
          updateSetting
        })
      )

    )
  );
}
