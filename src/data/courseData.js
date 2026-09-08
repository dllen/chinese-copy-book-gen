import textsXiaoxue from '../../data/texts-xiaoxue.json';
import englishWords from '../../data/english-words.json';

export const GRADES = [
  { id: 'g1', name: '一年级', icon: '📚', semesters: ['上册', '下册'] },
  { id: 'g2', name: '二年级', icon: '📖', semesters: ['上册', '下册'] },
  { id: 'g3', name: '三年级', icon: '📝', semesters: ['上册', '下册'] },
  { id: 'g4', name: '四年级', icon: '📓', semesters: ['上册', '下册'] },
  { id: 'g5', name: '五年级', icon: '📒', semesters: ['上册', '下册'] },
];

export const CHINESE_UNITS = [
  { id: 'pinyin', name: '拼音', icon: '🔤', keywords: ['单韵母', '声母', '复韵母', '整体认读'] },
  { id: 'shengzi', name: '生字', icon: '✍️', keywords: ['天地人', '口耳目', '日月山川', '金木水火土'] },
  { id: 'cihui', name: '词语', icon: '📝', keywords: ['大小多少', '日月明'] },
  { id: 'gushi', name: '古诗', icon: '📜', keywords: ['咏鹅', '画', '悯农'] },
];

export const ENGLISH_UNITS = [
  { id: 'letters', name: '字母', icon: '🔡', keywords: ['大写', '小写', '笔顺'] },
  { id: 'words', name: '单词', icon: '📖', keywords: ['身体', '动物', '颜色', '数字'] },
  { id: 'sentences', name: '句子', icon: '💬', keywords: ['问候', '介绍', '喜好'] },
  { id: 'dialogue', name: '对话', icon: '🗣️', keywords: ['课堂', '日常'] },
];

function extractChineseContents() {
  return textsXiaoxue.map((item) => {
    const allText = item.paragraphs.join('');
    const chars = [...new Set(allText.match(/[\u4e00-\u9fff]/g) || [])];
    return {
      id: `cn-${item.id}`,
      title: item.title,
      grade: item.grade,
      subject: '语文',
      unit: item.grade,
      paragraphs: item.paragraphs,
      characters: chars.slice(0, 50),
      keywords: item.title.split(/\s+/),
    };
  });
}

function extractEnglishContents() {
  const grouped = {};
  englishWords.forEach((w) => {
    if (!grouped[w.g]) grouped[w.g] = [];
    grouped[w.g].push(w);
  });
  return Object.entries(grouped).map(([grade, words]) => ({
    id: `en-words-${grade.replace(/\s+/g, '-')}`,
    title: `${grade} 词汇`,
    grade,
    subject: '英语',
    unit: 'words',
    words: words.slice(0, 30),
    keywords: words.slice(0, 5).map((w) => w.w),
  }));
}

const CHINESE_CONTENTS = extractChineseContents();
const ENGLISH_CONTENTS = extractEnglishContents();

export function getGrades() {
  return GRADES;
}

export function getUnits(gradeId, subject) {
  return subject === '语文' ? CHINESE_UNITS : ENGLISH_UNITS;
}

export function getContents(unitId) {
  if (unitId === 'shengzi' || unitId === 'cihui' || unitId === 'gushi' || unitId === 'pinyin') {
    return CHINESE_CONTENTS;
  }
  if (unitId === 'words' || unitId === 'sentences' || unitId === 'letters' || unitId === 'dialogue') {
    return ENGLISH_CONTENTS;
  }
  return [...CHINESE_CONTENTS, ...ENGLISH_CONTENTS];
}

export function searchContents(keyword) {
  const all = [...CHINESE_CONTENTS, ...ENGLISH_CONTENTS];
  const lower = keyword.toLowerCase();
  return all.filter(
    (c) =>
      c.title.toLowerCase().includes(lower) ||
      (c.keywords || []).some((k) => k.toLowerCase().includes(lower)) ||
      (c.characters || []).some((ch) => ch.includes(keyword))
  );
}
