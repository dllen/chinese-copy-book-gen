# 课程内容 AI 增强 — 设计规范

> 版本: v1.0 | 日期: 2026-09-08
> 状态: 设计稿 → 待实施

---

## 1. 背景与目标

### 1.1 当前状态

Wave 1-4 实现了完整的字帖生成流程，但内容数据仅包含基础信息：
- 语文：课文 → 提取的生字列表
- 英语：单词 + 句子

缺少教学场景中常用的辅助内容：拼音标注、词语解释、笔顺数据、练习题等。

### 1.2 优化目标

为 1-6 年级语文和 3-6 年级英语生成丰富的辅助教学内容，离线打包为 JSON 文件：
- 语文：拼音、词语扩展、笔顺数据、同步练习
- 英语：音标、例句、中文翻译、同步练习

---

## 2. 数据文件规划

### 2.1 文件清单

| 文件 | 内容 | 预估大小 | 加载策略 |
|------|------|---------|---------|
| `chinese-pinyin.json` | 汉字→拼音映射（~5000字） | ~200KB | 立即加载 |
| `chinese-vocabulary.json` | 课文→词语+解释+造句（~2000词） | ~500KB | 按需加载 |
| `chinese-strokeorder.json` | 汉字→笔顺数据（~5000字） | ~2MB | 按需加载 |
| `chinese-exercises.json` | 课文→练习题（~500课） | ~1MB | 按需加载 |
| `english-ipa.json` | 单词→音标映射（~850词） | ~50KB | 立即加载 |
| `english-examples.json` | 单词→例句+翻译（~850词） | ~300KB | 按需加载 |
| `english-exercises.json` | 单词→练习题（~850词） | ~400KB | 按需加载 |
| `english-translations.json` | 句子→中文翻译（~2574句） | ~600KB | 按需加载 |

**总数据量**：约 5-8MB（未压缩），gzip 后约 1.5-2MB

### 2.2 数据结构

#### chinese-pinyin.json
```json
{
  "天": { "pinyin": "tiān", "tones": 1 },
  "地": { "pinyin": "dì", "tones": 4 },
  "人": { "pinyin": "rén", "tones": 2 }
}
```

#### chinese-vocabulary.json
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

#### chinese-strokeorder.json
```json
{
  "天": {
    "strokes": 4,
    "order": ["横", "横", "撇", "捺"],
    "svg": "M10,20 L30,20 M20,10 L20,40 M10,30 L30,40 M30,30 L10,40"
  }
}
```

#### chinese-exercises.json
```json
{
  "cn-1": [
    {
      "type": "fill-blank",
      "question": "天____人",
      "answer": "地",
      "hint": "天地人"
    },
    {
      "type": "choice",
      "question": "下列哪个字是天地的天？",
      "options": ["大", "天", "太"],
      "answer": 1
    }
  ]
}
```

#### english-ipa.json
```json
{
  "hello": { "ipa": "/həˈləʊ/", "phonetic": "赫楼" },
  "world": { "ipa": "/wɜːld/", "phonetic": "沃尔德" }
}
```

#### english-examples.json
```json
{
  "hello": [
    { "en": "Hello, how are you?", "zh": "你好，你好吗？" },
    { "en": "Say hello to your friend.", "zh": "向你的朋友问好。" }
  ]
}
```

#### english-exercises.json
```json
{
  "hello": [
    {
      "type": "spelling",
      "question": "H_ _ _ _",
      "answer": "hello"
    },
    {
      "type": "choice",
      "question": "Hello 的意思是？",
      "options": ["你好", "再见", "谢谢", "对不起"],
      "answer": 0
    }
  ]
}
```

#### english-translations.json
```json
{
  "en-1": { "en": "Hello, I'm Amy.", "zh": "你好，我是艾米。" },
  "en-2": { "en": "What's your name?", "zh": "你叫什么名字？" }
}
```

---

## 3. 生成方式

AI Agent 基于现有数据生成：

| 内容 | 生成依据 | 验证方式 |
|------|---------|---------|
| 拼音 | 汉字 + pinyin-pro 库 | 与库输出一致 |
| 词语 | 课文文本 → 分词 → 重点词语 | 人工审核 |
| 笔顺 | Unicode 笔顺数据库（MakeMeAHanzi） | 标准笔顺 |
| 练习 | 课文内容 → 题目模板生成 | 答案正确 |
| 音标 | 单词 + 词典数据 | IPA 标准 |
| 例句 | 单词用法 → 生成 + 翻译 | 语法正确 |
| 翻译 | 句子 → 翻译 | 准确通顺 |

---

## 4. 代码集成

### 4.1 新增 Hook: useEnrichedContent.js

```javascript
export function useEnrichedContent() {
  const [pinyin, setPinyin] = useState({});
  const [vocabulary, setVocabulary] = useState({});
  const [strokeOrder, setStrokeOrder] = useState({});
  const [exercises, setExercises] = useState({});
  const [ipa, setIpa] = useState({});
  const [examples, setExamples] = useState({});
  const [translations, setTranslations] = useState({});

  // 立即加载小文件
  useEffect(() => {
    import('../../data/chinese-pinyin.json').then(m => setPinyin(m.default));
    import('../../data/english-ipa.json').then(m => setIpa(m.default));
  }, []);

  // 按需加载大文件
  const loadVocabulary = useCallback(async (lessonId) => {
    if (!vocabulary[lessonId]) {
      const mod = await import('../../data/chinese-vocabulary.json');
      setVocabulary(prev => ({ ...prev, ...mod.default }));
    }
  }, [vocabulary]);

  return {
    pinyin, vocabulary, strokeOrder, exercises,
    ipa, examples, translations,
    loadVocabulary, /* ... */
  };
}
```

### 4.2 集成到 MainLayout

在 CharacterSelector 中：
- 显示拼音（从 pinyin 数据获取）
- 点击汉字显示笔顺动画
- 显示词语解释

在 PreviewPanel 中：
- 显示英语音标
- 显示例句
- 显示中文翻译

### 4.3 新增练习模式

新增「练习模式」入口：
- 语文：填空、选择、连线
- 英语：拼写、选择、翻译

---

## 5. 性能优化

1. **代码分割**：大文件（笔顺、练习）按需 import()
2. **缓存策略**：localStorage 缓存已加载数据
3. **压缩**：JSON 文件 gzip 压缩（服务器端配置）
4. **懒加载**：练习模式数据仅在进入时加载

---

## 6. 验收标准

- [ ] 所有 479 篇语文课文有拼音数据
- [ ] 所有 848 个英语单词有音标数据
- [ ] 所有 2574 个英语句子有中文翻译
- [ ] 每篇语文课文有至少 3 个词语解释
- [ ] 每篇语文课文有至少 2 道练习题
- [ ] 每个英语单词有至少 1 个例句
- [ ] 每个英语单词有至少 1 道练习题
- [ ] 常用汉字（~1000字）有笔顺数据
- [ ] 数据加载不影响字帖生成性能

---

## 7. 后续步骤

1. ✅ 设计规范（本文档）
2. ⬜ 用 writing-plans skill 写实施计划
3. ⬜ 开始实施

---

*文档状态: v1.0 设计稿 | 最后更新: 2026-09-08*
