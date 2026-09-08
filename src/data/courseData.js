import textsXiaoxue from '../../data/texts-xiaoxue.json';
import englishWords from '../../data/english-words.json';
import englishSentences from '../../data/english-sentences.json';

export const GRADES = [
  { id: 'g1', name: '一年级', icon: '📚', semesters: ['上册', '下册'] },
  { id: 'g2', name: '二年级', icon: '📖', semesters: ['上册', '下册'] },
  { id: 'g3', name: '三年级', icon: '📝', semesters: ['上册', '下册'] },
  { id: 'g4', name: '四年级', icon: '📓', semesters: ['上册', '下册'] },
  { id: 'g5', name: '五年级', icon: '📒', semesters: ['上册', '下册'] },
  { id: 'g6', name: '六年级', icon: '🎓', semesters: ['上册', '下册'] },
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
    const uniqueChars = [...new Set(allText.match(/[\u4e00-\u9fff]/g) || [])];
    const allChars = allText.match(/[\u4e00-\u9fff]/g) || [];
    const vocabulary = [];
    for (let i = 0; i < allChars.length - 1; i++) {
      const pair = allChars[i] + allChars[i + 1];
      if (!vocabulary.includes(pair)) vocabulary.push(pair);
    }
    return {
      id: `cn-${item.id}`,
      title: item.title,
      grade: item.grade,
      subject: '语文',
      unit: item.grade,
      paragraphs: item.paragraphs,
      characters: uniqueChars.slice(0, 50),
      vocabulary: vocabulary.slice(0, 30),
      totalChars: allChars.length,
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

function extractEnglishSentenceContents() {
  const grouped = {};
  englishSentences.forEach((s) => {
    const grade = s.grade || s.g || '未知';
    if (!grouped[grade]) grouped[grade] = [];
    grouped[grade].push(s);
  });
  return Object.entries(grouped).map(([grade, sentences]) => ({
    id: `en-sentences-${grade.replace(/\s+/g, '-')}`,
    title: `${grade} 句子`,
    grade,
    subject: '英语',
    unit: 'sentences',
    sentences: sentences.slice(0, 20),
    keywords: sentences.slice(0, 3).map((s) => s.s || s.en || s.english || ''),
  }));
}

const CHINESE_CONTENTS = extractChineseContents();
const ENGLISH_CONTENTS = extractEnglishContents();
const ENGLISH_SENTENCE_CONTENTS = extractEnglishSentenceContents();

export function getGrades() {
  return GRADES;
}

export function getUnits(gradeId, subject) {
  if (subject === '语文') {
    if (gradeId === 'g1' || gradeId === 'g2') return CHINESE_UNITS;
    return CHINESE_UNITS.filter(u => u.id !== 'pinyin');
  }
  return ENGLISH_UNITS;
}

export function getLessons(gradeId, unitId) {
  const gradeObj = GRADES.find(g => g.id === gradeId);
  if (!gradeObj) return [];
  const gradeName = gradeObj.name;
  
  if (unitId === 'words' || unitId === 'sentences' || unitId === 'letters' || unitId === 'dialogue') {
    return ENGLISH_CONTENTS.filter(c => c.grade.startsWith(gradeName) && c.unit === unitId);
  }
  return CHINESE_CONTENTS.filter(c => c.grade.startsWith(gradeName));
}

export function getLessonCharacters(lessonId) {
  const lesson = CHINESE_CONTENTS.find(c => c.id === lessonId);
  return lesson?.characters || [];
}

export function getContents(unitId) {
  if (unitId === 'shengzi' || unitId === 'cihui' || unitId === 'gushi' || unitId === 'pinyin') {
    return CHINESE_CONTENTS;
  }
  if (unitId === 'words' || unitId === 'letters' || unitId === 'dialogue') {
    return ENGLISH_CONTENTS;
  }
  if (unitId === 'sentences') {
    return ENGLISH_SENTENCE_CONTENTS;
  }
  return [...CHINESE_CONTENTS, ...ENGLISH_CONTENTS, ...ENGLISH_SENTENCE_CONTENTS];
}

export function searchContents(keyword) {
  const all = [...CHINESE_CONTENTS, ...ENGLISH_CONTENTS, ...ENGLISH_SENTENCE_CONTENTS];
  const lower = keyword.toLowerCase();
  return all.filter(
    (c) =>
      c.title.toLowerCase().includes(lower) ||
      (c.keywords || []).some((k) => k.toLowerCase().includes(lower)) ||
      (c.characters || []).some((ch) => ch.includes(keyword))
  );
}
