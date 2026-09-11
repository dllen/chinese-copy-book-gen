export const APP_VIEW = Object.freeze({
  HOME: 'home',
  BUILDER: 'builder',
});

export const BUILDER_PRESETS = Object.freeze({
  hanzi: Object.freeze({
    feature: '汉字练习',
    copybookType: '汉字字帖',
    gridType: '田字格',
  }),
  pinyin: Object.freeze({
    feature: '汉字练习',
    copybookType: '拼音字帖',
    gridType: '拼音格',
  }),
  english: Object.freeze({
    feature: '字帖模板',
    layout: '英文格式',
    gridType: '四线三格',
    cols: 10,
  }),
  digits: Object.freeze({
    feature: '数字字母',
    gridType: '四线三格',
  }),
});

export function parseAppHash(hash = '') {
  const clean = String(hash).replace(/^#/, '').replace(/^\/+/, '');
  if (!clean) return { view: APP_VIEW.HOME, builderType: null };

  const [view, builderType = ''] = clean.split('/');
  if (view !== APP_VIEW.BUILDER) {
    return { view: APP_VIEW.HOME, builderType: null };
  }

  return {
    view: APP_VIEW.BUILDER,
    builderType: BUILDER_PRESETS[builderType] ? builderType : null,
  };
}

export function hashForRoute(view, builderType = null) {
  if (view === APP_VIEW.BUILDER) {
    return builderType ? `#/builder/${builderType}` : '#/builder';
  }
  return '#/';
}

export function presetForBuilderType(builderType) {
  const preset = BUILDER_PRESETS[builderType];
  return preset ? { ...preset } : null;
}
