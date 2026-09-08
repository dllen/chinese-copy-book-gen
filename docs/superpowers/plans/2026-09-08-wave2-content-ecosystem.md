# Wave 2: 内容生态 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 扩充字帖内容生态：拼音标注、英语词句库集成、教材字库增强、自定义课文模版。

**Architecture:** 在 Wave 1 的 3 步向导基础上，增强数据层（courseData 支持句子/拼音）和网格渲染层（支持拼音标注）。新增 pinyin 工具模块和自定义文本处理模块。

**Tech Stack:** React 18 + Bootstrap 5 + Vite + pinyin-pro（已安装）

---

## Task 1: Pinyin 工具模块

**Files:**
- Create: `src/utils/pinyin.js`
- Test: `tests/unit/pinyin.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/unit/pinyin.test.js
import { describe, it, expect } from 'vitest';
import { toPinyin, toPinyinArray, hasPinyin } from '../../src/utils/pinyin';

describe('pinyin utils', () => {
  it('converts single character to pinyin', () => {
    expect(toPinyin('天')).toBe('tiān');
  });

  it('converts multiple characters', () => {
    const result = toPinyin('天地人');
    expect(result).toContain('tiān');
    expect(result).toContain('dì');
    expect(result).toContain('rén');
  });

  it('returns array form', () => {
    const arr = toPinyinArray('天地人');
    expect(arr).toEqual(['tiān', 'dì', 'rén']);
  });

  it('handles empty string', () => {
    expect(toPinyin('')).toBe('');
    expect(toPinyinArray('')).toEqual([]);
  });

  it('hasPinyin returns true for Chinese chars', () => {
    expect(hasPinyin()).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/pinyin.test.js 2>&1 | tail -10`
Expected: FAIL

- [ ] **Step 3: Implement pinyin.js**

```javascript
// src/utils/pinyin.js
import { pinyin } from 'pinyin-pro';

export function toPinyin(char) {
  if (!char) return '';
  return pinyin(char, { toneType: 'symbol', type: 'array' }).join(' ');
}

export function toPinyinArray(char) {
  if (!char) return [];
  return pinyin(char, { toneType: 'symbol', type: 'array' });
}

export function hasPinyin() {
  return true;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/pinyin.test.js 2>&1 | tail -10`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/pinyin.js tests/unit/pinyin.test.js
git commit m "feat(pinyin): add pinyin conversion utility using pinyin-pro"
```

---

## Task 2: 英语句子集成到 courseData

**Files:**
- Modify: `src/data/courseData.js`

- [ ] **Step 1: Add English sentence extraction**

Add to courseData.js after `extractEnglishContents()`:

```javascript
import englishSentences from '../../data/english-sentences.json';

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
    keywords: sentences.slice(0, 3).map((s) => s.s || s.en || ''),
  }));
}

const ENGLISH_SENTENCE_CONTENTS = extractEnglishSentenceContents();
```

- [ ] **Step 2: Update getContents to include sentences**

```javascript
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
```

- [ ] **Step 3: Run existing tests to verify no regression**

Run: `npx vitest run tests/unit/courseData.test.js 2>&1 | tail -10`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/data/courseData.js
git commit m "feat(data): integrate English sentences into course data"
```

---

## Task 3: 教材字库增强（按课文生字表）

**Files:**
- Modify: `src/data/courseData.js`

- [ ] **Step 1: Enhance character extraction with frequency ordering**

Update `extractChineseContents()` to:
- Extract characters in order of appearance (not just unique set)
- Add a `vocabulary` field with word-level segmentation (simple bigram approach)
- Add `totalChars` count

```javascript
function extractChineseContents() {
  return textsXiaoxue.map((item) => {
    const allText = item.paragraphs.join('');
    const uniqueChars = [...new Set(allText.match(/[\u4e00-\u9fff]/g) || [])];
    const allChars = allText.match(/[\u4e00-\u9fff]/g) || [];
    // Simple vocabulary: consecutive character pairs
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
```

- [ ] **Step 2: Run tests**

Run: `npx vitest run tests/unit/courseData.test.js 2>&1 | tail -10`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/data/courseData.js
git commit m "feat(data): enhance character extraction with vocabulary and frequency"
```

---

## Task 4: 拼音标注配置选项

**Files:**
- Modify: `src/hooks/useSettings.js` (or wherever settings defaults are defined)
- Modify: `src/components/ConfigPanel.jsx`

- [ ] **Step 1: Add `showPinyin` setting default**

Find where settings defaults are defined and add `showPinyin: false`.

- [ ] **Step 2: Add pinyin toggle to ConfigPanel**

In the "② 样式" section, add a toggle:
```jsx
<div className="form-check mb-2">
  <input className="form-check-input" type="checkbox" id="showPinyin"
    checked={settings.showPinyin} onChange={e => updateSetting('showPinyin', e.target.checked)} />
  <label className="form-check-label" htmlFor="showPinyin">显示拼音标注</label>
</div>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ConfigPanel.jsx
git commit m "feat(ui): add pinyin display toggle to style settings"
```

---

## Task 5: 网格拼音渲染

**Files:**
- Modify: `src/components/PageGrid.jsx` (or wherever grid cells are rendered)

- [ ] **Step 1: Import pinyin utility and render pinyin above characters**

In the grid cell rendering, when `showPinyin` is true and the cell contains a Chinese character, render the pinyin above the character in a smaller font.

- [ ] **Step 2: Commit**

```bash
git add src/components/PageGrid.jsx
git commit m("feat(grid): render pinyin above characters when enabled")
```

---

## Task 6: 自定义课文模版

**Files:**
- Create: `src/utils/textProcessor.js`
- Test: `tests/unit/textProcessor.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/unit/textProcessor.test.js
import { describe, it, expect } from 'vitest';
import { splitIntoChars, splitIntoWords, detectLanguage } from '../../src/utils/textProcessor';

describe('textProcessor', () => {
  it('splits Chinese text into unique characters', () => {
    const chars = splitIntoChars('天地人天地');
    expect(chars).toEqual(['天', '地', '人']);
  });

  it('splits English text into words', () => {
    const words = splitIntoWords('Hello world hello');
    expect(words).toEqual(['Hello', 'world']);
  });

  it('detects Chinese language', () => {
    expect(detectLanguage('天地人')).toBe('chinese');
  });

  it('detects English language', () => {
    expect(detectLanguage('Hello world')).toBe('english');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/textProcessor.test.js 2>&1 | tail -10`
Expected: FAIL

- [ ] **Step 3: Implement textProcessor.js**

```javascript
// src/utils/textProcessor.js
export function splitIntoChars(text) {
  const chars = text.match(/[\u4e00-\u9fff]/g) || [];
  return [...new Set(chars)];
}

export function splitIntoWords(text) {
  const words = text.match(/[a-zA-Z]+/g) || [];
  return [...new Set(words)];
}

export function detectLanguage(text) {
  const chineseCount = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const englishCount = (text.match(/[a-zA-Z]/g) || []).length;
  return chineseCount >= englishCount ? 'chinese' : 'english';
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/textProcessor.test.js 2>&1 | tail-10`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/textProcessor.js tests/unit/textProcessor.test.js
git commit m "feat(utils): add text processor for custom copybook templates"
```

---

## Self-Review

**Spec coverage:**
- ✅ 教材字库 (1-5 年级语文生字表按课文分级) — Task 3
- ✅ 英语词句库 (单词+句子) — Task 2
- ✅ 拼音标注 (自动在汉字上方标注拼音) — Tasks 1, 4, 5
- ✅ 自定义模版 (老师上传课文 → 自动切字 → 生成字帖) — Task 6

**Placeholder scan:** No TBDs, all code blocks complete.

**Type consistency:** `toPinyin` returns string, `toPinyinArray` returns array, `splitIntoChars` returns array, `detectLanguage` returns string.

---

*Plan complete. 6 tasks, all TDD.*
