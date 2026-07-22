import React from 'react';
import QuickActions from './controls/QuickActions';
import Section from './controls/Section';
import LayoutSection from './controls/sections/LayoutSection';
import EnglishSettings from './controls/sections/EnglishSettings';
import TextInputSection from './controls/sections/TextInputSection';
import SpecialFeatureSettings from './controls/sections/SpecialFeatureSettings';
import ColorSettings from './controls/sections/ColorSettings';
import StyleAndGridSettings from './controls/sections/StyleAndGridSettings';
import GridSizeSettings from './controls/sections/GridSizeSettings';
import PaperSettings from './controls/sections/PaperSettings';
import TemplateFontSettings from './controls/sections/TemplateFontSettings';
import HeaderSettings from './controls/sections/HeaderSettings';

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

export default function ConfigPanel({ mode, variant,
  feature, layout, gridType, gridColor, customGridColor, customTextColor,
  textColorOpt, strokeMode, tailFill, template, customFont,
  rows, cols, cellSize, gridGap, fontSize,
  marginTop, marginRight, marginBottom, marginLeft,
  paper, header, text, randCount, randNoRepeat, previewScale,
  difficulty, showGuide,
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
  return (
    <div className="card">
      <div className="card-body">
        <QuickActions updateSetting={updateSetting} />

        <Section title="1. 内容与排版" defaultOpen>
          <div className="mb-2">
            <label className="form-label" htmlFor="feature">功能模块</label>
            <select id="feature" className="form-select" value={feature} onChange={e => updateSetting('feature', e.target.value)}>
              {['字帖模板', '控笔字帖', '数字字母'].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>

          <LayoutSection feature={feature} layout={layout} gridType={gridType} stylePreset={stylePreset} updateSetting={updateSetting} />

          {feature === '字帖模板' && layout === '英文格式' && (
            <EnglishSettings
              letterStyle={letterStyle}
              enBlankRows={enBlankRows}
              enRepeat={enRepeat}
              engShowZh={engShowZh}
              handleLetterStyle={handleLetterStyle}
              updateSetting={updateSetting}
            />
          )}

          {feature === '字帖模板' && window.__copybook__.library && (
            <LibraryPanelErrorBoundary>
              <window.__copybook__.library.LibraryPanel
                onInsert={onInsert}
                engShowZh={engShowZh}
                onEngShowZhChange={onEngShowZhChange}
              />
            </LibraryPanelErrorBoundary>
          )}

          {feature === '字帖模板' && (
            <TextInputSection
              mode={mode}
              variant={variant}
              layout={layout}
              text={text}
              feature={feature}
              updateSetting={updateSetting}
            />
          )}

          <SpecialFeatureSettings
            feature={feature}
            difficulty={difficulty}
            showGuide={showGuide}
            alnumIncludeDigits={alnumIncludeDigits}
            alnumIncludeUpper={alnumIncludeUpper}
            alnumIncludeLower={alnumIncludeLower}
            alnumCount={alnumCount}
            alnumNoRepeat={alnumNoRepeat}
            alnumSeqLocal={alnumSeqLocal}
            alnumStats={alnumStats}
            updateSetting={updateSetting}
            handleSetAlnumCount={handleSetAlnumCount}
            onGenAlnum={onGenAlnum}
          />
        </Section>

        <Section title="2. 样式与网格">
          <StyleAndGridSettings
            gridType={gridType}
            stylePreset={stylePreset}
            autoLayout={autoLayout}
            gridStrokeWidth={gridStrokeWidth}
            lineStyle={lineStyle}
            cellRadius={cellRadius}
            pageBg={pageBg}
            cellBg={cellBg}
            cellBorder={cellBorder}
            cellShadow={cellShadow}
            textShadow={textShadow}
            textStroke={textStroke}
            updateSetting={updateSetting}
            handleSetCellRadius={handleSetCellRadius}
            handleSetGridStrokeWidth={handleSetGridStrokeWidth}
          />
          <ColorSettings
            gridColor={gridColor}
            customGridColor={customGridColor}
            textColorOpt={textColorOpt}
            customTextColor={customTextColor}
            strokeMode={strokeMode}
            updateSetting={updateSetting}
          />
        </Section>

        <Section title="3. 排版参数">
          <GridSizeSettings
            rows={rows}
            cols={cols}
            cellSize={cellSize}
            gridGap={gridGap}
            fontSize={fontSize}
            handleSetRows={handleSetRows}
            handleSetCols={handleSetCols}
            handleSetCellSize={handleSetCellSize}
            handleSetGridGap={handleSetGridGap}
            handleSetFontSize={handleSetFontSize}
          />
          <PaperSettings
            paper={paper}
            marginTop={marginTop}
            marginRight={marginRight}
            marginBottom={marginBottom}
            marginLeft={marginLeft}
            handleSetMarginTop={handleSetMarginTop}
            handleSetMarginRight={handleSetMarginRight}
            handleSetMarginBottom={handleSetMarginBottom}
            handleSetMarginLeft={handleSetMarginLeft}
            updateSetting={updateSetting}
          />
          <TemplateFontSettings
            template={template}
            customFont={customFont}
            updateSetting={updateSetting}
          />
          <HeaderSettings
            header={header}
            tailFill={tailFill}
            updateSetting={updateSetting}
          />
        </Section>
      </div>
    </div>
  );
}
