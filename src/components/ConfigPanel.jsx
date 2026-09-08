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
import CourseTemplates from './CourseTemplates';

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

export default function ConfigPanel({ settings,
  mode, variant,
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
  chineseCharCount, chineseCharNoRepeat, chineseCharSeqLocal,
  letterStyle, cellShadowLocal,
  copybookType, copybookStyle, pinyinText, hanziText,
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
  toast
}) {
  return (
    <div className="card">
      <div className="card-body">
        <QuickActions 
          updateSetting={updateSetting}
          onOpenLibrary={onLibraryStateChange}
        />

        <CourseTemplates
          settings={settings}
          updateSetting={updateSetting}
          toast={toast}
        />

        {/* ① 内容 — feature, layout, text input, library */}
        <Section title="① 内容" defaultOpen>
          <div className="mb-2">
            <label className="form-label" htmlFor="feature">功能模块</label>
            <select id="feature" className="form-select" value={feature} onChange={e => updateSetting('feature', e.target.value)}>
              {['字帖模板', '控笔字帖', '数字字母', '汉字练习'].map(v => <option key={v} value={v}>{v}</option>)}
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
                defaultOpen={libraryState?.open}
                defaultTab={libraryState?.tab}
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
            chineseCharCount={chineseCharCount}
            chineseCharNoRepeat={chineseCharNoRepeat}
            chineseCharSeqLocal={chineseCharSeqLocal}
            onGenChineseChars={onGenChineseChars}
            copybookType={copybookType}
            copybookStyle={copybookStyle}
            pinyinText={pinyinText}
            hanziText={hanziText}
          />
        </Section>

        {/* ② 样式 — grid type, style preset, colors, grid size + 高级设置 */}
        <Section title="② 样式" defaultOpen>
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

          <div className="form-check mb-2">
            <input className="form-check-input" type="checkbox" id="showPinyin"
              checked={settings.showPinyin} onChange={e => updateSetting('showPinyin', e.target.checked)} />
            <label className="form-check-label" htmlFor="showPinyin">显示拼音标注</label>
          </div>
          <ColorSettings
            gridColor={gridColor}
            customGridColor={customGridColor}
            textColorOpt={textColorOpt}
            customTextColor={customTextColor}
            strokeMode={strokeMode}
            updateSetting={updateSetting}
          />
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
          <Section title="高级设置" defaultOpen={false}>
            <div className="row g-2 mb-2">
              <div className="col-6">
                <label className="form-label" htmlFor="advCellRadius">格子圆角</label>
                <input
                  id="advCellRadius"
                  className="form-range"
                  type="range"
                  min={0}
                  max={10}
                  value={cellRadius}
                  onChange={e => handleSetCellRadius(e.target.value)}
                />
                <div className="form-text">{cellRadius}px</div>
              </div>
              <div className="col-6">
                <label className="form-label" htmlFor="advGridStrokeWidth">线条粗细</label>
                <input
                  id="advGridStrokeWidth"
                  className="form-range"
                  type="range"
                  min={0.5}
                  max={3}
                  step={0.5}
                  value={gridStrokeWidth}
                  onChange={e => handleSetGridStrokeWidth(e.target.value)}
                />
                <div className="form-text">{gridStrokeWidth}px</div>
              </div>
            </div>
            <div className="row g-2 mb-2">
              <div className="col-6">
                <label className="form-label" htmlFor="advTextStroke">文字描边</label>
                <select
                  id="advTextStroke"
                  className="form-select"
                  value={textStroke}
                  onChange={e => updateSetting('textStroke', e.target.value)}
                >
                  {['无', '细', '中', '粗'].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="col-6 d-flex align-items-center">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="advTextShadow"
                    checked={textShadow}
                    onChange={e => updateSetting('textShadow', e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="advTextShadow">文字阴影</label>
                </div>
              </div>
            </div>
          </Section>
        </Section>

        {/* ③ 导出 — paper settings, margins + 高级设置 */}
        <Section title="③ 导出" defaultOpen>
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
          <Section title="高级设置" defaultOpen={false}>
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
        </Section>
      </div>
    </div>
  );
}
