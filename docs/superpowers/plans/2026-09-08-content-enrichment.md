# 课程内容 AI 增强 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 为 1-6 年级语文和 3-6 年级英语生成 8 个离线 JSON 数据文件，包含拼音、词语、笔顺、练习、音标、例句、翻译。

**Architecture:** 基于现有课文/单词数据，使用 AI 生成辅助教学内容，输出为标准 JSON 文件。文件按内容类型分离，支持按需加载。

**Tech Stack:** Python 3（数据处理）+ pinyin-pro（拼音验证）+ 标准笔顺数据库

---

## Task 1: 生成 chinese-pinyin.json

**Files:**
- Create: `data/chinese-pinyin.json`

- [ ] **Step 1: Extract all unique characters**

```python
import json
with open('data/texts-xiaoxue.json') as f:
    texts = json.load(f)
chars = set()
for item in texts:
    for ch in item['paragraphs']:
        if '\u4e00' <= ch <= '\u9fff':
            chars.add(ch)
print(f'Total unique characters: {len(chars)}')
```

- [ ] **Step 2: Generate pinyin for each character**

Use pinyin-pro (already installed) to generate pinyin:

```javascript
// generate-pinyin.mjs
import { pinyin } from 'pinyin-pro';
import { readFileSync, writeFileSync } from 'fs';

const texts = JSON.parse(readFileSync('data/texts-xiaoxue.json', 'utf8'));
const chars = new Set();
texts.forEach(t => t.paragraphs.join('').split('').forEach(ch => {
  if (ch >= '\u4e00' && ch <= '\u9fff') chars.add(ch);
}));

const result = {};
chars.forEach(ch => {
  const py = pinyin(ch, { toneType: 'symbol', type: 'array' })[0];
  result[ch] = { pinyin: py, tones: getToneNumber(py) };
});

writeFileSync('data/chinese-pinyin.json', JSON.stringify(result, null, 2));
console.log(`Generated pinyin for ${Object.keys(result).length} characters`);
```

- [ ] **Step 3: Verify output**

```bash
node generate-pinyin.mjs
head -20 data/chinese-pinyin.json
```

Expected: Valid JSON with ~5000 entries, each with pinyin and tones.

---

## Task 2: 生成 chinese-vocabulary.json

**Files:**
- Create: `data/chinese-vocabulary.json`

- [ ] **Step 1: Generate vocabulary for each lesson**

For each lesson, extract key vocabulary words (2-4 character phrases), generate meaning and example sentence.

```json
{
  "cn-1": [
    {
      "word": "天地",
      "pinyin": "tiān dì",
      "meaning": "天和地，指整个自然界",
      "example": "天地之间，万物生长。"
    }
  ]
}
```

- [ ] **Step 2: Use AI to generate content**

For each lesson text, AI generates 3-5 vocabulary items with:
- word: the vocabulary phrase
- pinyin: romanization
- meaning: definition in simple Chinese
- example: example sentence

---

## Task 3: 生成 chinese-strokeorder.json

**Files:**
- Create: `data/chinese-strokeorder.json`

- [ ] **Step 1: Source stroke order data**

Use Unicode MakeMeAHanzi database or similar open-source stroke order data.

Format:
```json
{
  "天": {
    "strokes": 4,
    "order": ["横", "横", "撇", "捺"],
    "svg": "M10,20 L30,20 M20,10 L20,40 M10,30 L30,40 M30,30 L10,40"
  }
}
```

- [ ] **Step 2: Generate for common characters (~1000 most frequent)**

Priority: characters that appear in grade 1-3 textbooks first.

---

## Task 4: 生成 chinese-exercises.json

**Files:**
- Create: `data/chinese-exercises.json`

- [ ] **Step 1: Generate exercises for each lesson**

Types:
- fill-blank: "天____人" → "地"
- choice: multiple character recognition
- match: match character to pinyin

```json
{
  "cn-1": [
    {
      "type": "fill-blank",
      "question": "天____人",
      "answer": "地",
      "hint": "天地人"
    }
  ]
}
```

---

## Task 5: 生成 english-ipa.json

**Files:**
- Create: `data/english-ipa.json`

- [ ] **Step 1: Generate IPA for each word**

```json
{
  "hello": { "ipa": "/həˈləʊ/", "phonetic": "赫楼" }
}
```

Use dictionary data or AI to generate IPA and phonetic approximation.

---

## Task 6: 生成 english-examples.json

**Files:**
- Create: `data/english-examples.json`

- [ ] **Step 1: Generate example sentences**

```json
{
  "hello": [
    { "en": "Hello, how are you?", "zh": "你好，你好吗？" }
  ]
}
```

---

## Task 7: 生成 english-exercises.json

**Files:**
- Create: `data/english-exercises.json`

- [ ] **Step 1: Generate exercises**

Types:
- spelling: "H_ _ _ _"
- choice: meaning matching
- translation: translate to Chinese

---

## Task 8: 生成 english-translations.json

**Files:**
- Create: `data/english-translations.json`

- [ ] **Step 1: Generate Chinese translations for all sentences**

```json
{
  "en-1": { "en": "Hello, I'm Amy.", "zh": "你好，我是艾米。" }
}
```

---

## Task 9: 集成到前端代码

**Files:**
- Create: `src/hooks/useEnrichedContent.js`
- Modify: `src/components/layout/MainLayout.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create useEnrichedContent hook**

```javascript
import { useState, useEffect, useCallback } from 'react';

export function useEnrichedContent() {
  const [pinyin, setPinyin] = useState({});
  const [ipa, setIpa] = useState({});

  useEffect(() => {
    import('../../data/chinese-pinyin.json').then(m => setPinyin(m.default));
    import('../../data/english-ipa.json').then(m => setIpa(m.default));
  }, []);

  return { pinyin, ipa };
}
```

- [ ] **Step 2: Wire into MainLayout**

Pass enriched content data to CharacterSelector for pinyin display.

---

## Self-Review

**Spec coverage:**
- ✅ 拼音标注 — Task 1
- ✅ 词语扩展 — Task 2
- ✅ 笔顺数据 — Task 3
- ✅ 同步练习 — Task 4
- ✅ 音标标注 — Task 5
- ✅ 例句扩展 — Task 6
- ✅ 英语练习 — Task 7
- ✅ 中文翻译 — Task 8
- ✅ 代码集成 — Task 9

**Placeholder scan:** No TBDs.

---

*Plan complete. 9 tasks.*
