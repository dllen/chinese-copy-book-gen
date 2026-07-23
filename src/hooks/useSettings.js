import { useState, useEffect } from 'react';

const STORAGE_KEY = 'copybook-settings';

const DEFAULTS = {
  mode: '多字', variant: '多字', layout: '连续排列', gridType: '田字格',
  gridColor: '绿色', customGridColor: '', customTextColor: '', textColorOpt: '黑色',
  strokeMode: '适中', tailFill: true, template: '楷书', customFont: '',
  rows: 10, cols: 8, cellSize: 60, gridGap: 8, fontSize: 42,
  marginTop: 16, marginRight: 12, marginBottom: 16, marginLeft: 12,
  paper: 'A4竖版', header: '', text: '', randCount: 50, randNoRepeat: true,
  previewScale: 1, feature: '字帖模板', difficulty: '初级', showGuide: false,
  letterStyle: '印刷体', enBlankRows: 0, enRepeat: 1, engShowZh: false,
  stylePreset: '四线三格标准', autoLayout: true, gridStrokeWidth: 1,
  lineStyle: '实线', cellRadius: 0, pageBg: '白色', cellBg: '透明',
  cellBorder: false, cellShadow: false, textShadow: false, textStroke: '无',
  alnumIncludeDigits: true, alnumIncludeUpper: true, alnumIncludeLower: true,
  alnumCount: 20, alnumNoRepeat: true, alnumSeq: '',
  chineseCharCount: 30, chineseCharNoRepeat: true, chineseCharSeq: '',
  chineseCharCount: 30, chineseCharNoRepeat: true, chineseCharSeq: '',
};

export function useSettings(toast) {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...DEFAULTS, ...JSON.parse(saved) };
    } catch (e) { /* ignore */ }
    return DEFAULTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        toast?.warn('存储空间已满，部分设置未保存，请清理浏览器缓存');
      }
    }
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return { settings, updateSetting, setSettings };
}
