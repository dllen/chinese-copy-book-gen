import { describe, it, expect } from 'vitest';
import {
  APP_VIEW,
  hashForRoute,
  parseAppHash,
  presetForBuilderType,
} from '../../src/utils/appRoutes';

describe('parseAppHash', () => {
  it('defaults to home for an empty hash', () => {
    expect(parseAppHash('')).toEqual({
      view: APP_VIEW.HOME,
      builderType: null,
    });
  });

  it('parses the builder root', () => {
    expect(parseAppHash('#/builder')).toEqual({
      view: APP_VIEW.BUILDER,
      builderType: null,
    });
  });

  it('parses a known builder type', () => {
    expect(parseAppHash('#/builder/english')).toEqual({
      view: APP_VIEW.BUILDER,
      builderType: 'english',
    });
  });

  it('normalizes an unknown builder type', () => {
    expect(parseAppHash('#/builder/unknown')).toEqual({
      view: APP_VIEW.BUILDER,
      builderType: null,
    });
  });

  it('falls back to home for unknown paths', () => {
    expect(parseAppHash('#/not-found')).toEqual({
      view: APP_VIEW.HOME,
      builderType: null,
    });
  });
});

describe('hashForRoute', () => {
  it('builds the home hash', () => {
    expect(hashForRoute(APP_VIEW.HOME)).toBe('#/');
  });

  it('builds the builder root hash', () => {
    expect(hashForRoute(APP_VIEW.BUILDER)).toBe('#/builder');
  });

  it('builds a typed builder hash', () => {
    expect(hashForRoute(APP_VIEW.BUILDER, 'pinyin')).toBe('#/builder/pinyin');
  });
});

describe('presetForBuilderType', () => {
  it('returns the hanzi preset', () => {
    expect(presetForBuilderType('hanzi')).toEqual({
      feature: '汉字练习',
      copybookType: '汉字字帖',
      gridType: '田字格',
    });
  });

  it('returns the pinyin preset', () => {
    expect(presetForBuilderType('pinyin')).toEqual({
      feature: '汉字练习',
      copybookType: '拼音字帖',
      gridType: '拼音格',
    });
  });

  it('returns the english preset', () => {
    expect(presetForBuilderType('english')).toEqual({
      feature: '字帖模板',
      layout: '英文格式',
      gridType: '四线三格',
      cols: 10,
    });
  });

  it('returns the digits preset', () => {
    expect(presetForBuilderType('digits')).toEqual({
      feature: '数字字母',
      gridType: '四线三格',
    });
  });

  it('returns null for an unknown type', () => {
    expect(presetForBuilderType('unknown')).toBeNull();
  });

  it('returns a copy so callers cannot mutate the preset registry', () => {
    const preset = presetForBuilderType('hanzi');
    preset.gridType = '米字格';
    expect(presetForBuilderType('hanzi').gridType).toBe('田字格');
  });
});
