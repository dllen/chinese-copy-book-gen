# 选内容模块优化 — 设计规范

> 版本: v1.0 | 日期: 2026-09-08
> 状态: 设计稿 → 待实施

---

## 1. 背景与目标

### 1.1 当前问题

Wave 1-4 实现了 3 步向导（选内容 → 选样式 → 生成），但「选内容」模块存在以下问题：

1. **无年级过滤**：选一年级后，内容列表显示所有年级的课文（包括六年级）
2. **无学科区分**：语文和英语混在一起，没有明确的学科选择
3. **英语年级不当**：英语数据从三年级开始，但 UI 没有限制
4. **内容组织粗糙**：只显示单元 → 内容两级，缺少「课文」这一关键层级
5. **无法多选生字**：选了一篇课文后无法选择部分生字练习

### 1.2 优化目标

- 选年级后，内容按年级正确过滤
- 3+ 年级显示英语学科，低年级只显示语文
- 内容层级：年级 → 学科 → 单元 → 课文 → 生字
- 选课文后，默认全选该课生字，可取消不需要的
- 添加六年级支持（英语数据覆盖 3-6 年级）

---

## 2. 数据覆盖

| 学科 | 年级范围 | 数据量 | 来源文件 |
|------|---------|--------|---------|
| 语文 | 1-6 年级 | 479 篇课文 | data/texts-xiaoxue.json |
| 英语单词 | 3-6 年级 | 848 个词 | data/english-words.json |
| 英语句子 | 3-6 年级 | 2574 句 | data/english-sentences.json |

---

## 3. 用户流程

```
Step 0: 选年级（1-6 年级卡片）
  ↓
Step 1: 选学科（语文/英语卡片）
  ↓ （3+ 年级才显示英语选项）
Step 2: 选单元（生字/词语/古诗 或 字母/单词/句子）
  ↓
Step 3: 选课文（按年级+单元过滤的课文列表）
  ↓
Step 4: 选生字（默认全选，可取消）→ 生成字帖
```

---

## 4. 组件设计

### 4.1 新增组件

#### SubjectSelector（学科选择器）

```jsx
<SubjectSelector
  gradeId="g3"
  selectedSubject="语文"
  onSelectSubject={(subject) => ...}
/>
```

- 根据年级动态显示可选学科
- 1-2 年级：只显示「语文」
- 3-6 年级：显示「语文」+「英语」
- 卡片式布局，带图标和描述

#### LessonList（课文列表）

```jsx
<LessonList
  lessons={[
    { id: 'cn-1', title: '天地人', characterCount: 3, unit: '第一单元' },
    { id: 'cn-2', title: '口耳目', characterCount: 3, unit: '第一单元' },
  ]}
  selectedLesson={selectedLesson}
  onSelectLesson={(lesson) => ...}
/>
```

- 按单元分组显示课文
- 每项显示：课文标题 + 生字数量 badge
- 支持搜索过滤
- 单选

#### CharacterSelector（生字选择器）

```jsx
<CharacterSelector
  characters={['天', '地', '人', '你', '我']}
  selectedCharacters={new Set(['天', '地', '人'])}
  onToggleCharacter={(char) => ...}
  onSelectAll={() => ...}
  onDeselectAll={() => ...}
/>
```

- 网格布局，每个生字是一个 checkbox 卡片
- 默认全选
- 顶部操作栏：「全选」「取消全选」「已选 N 个字」
- 选中状态：高亮边框 + 勾选标记

### 4.2 修改组件

#### GradeSelector

- 添加六年级卡片 `{ id: 'g6', name: '六年级', icon: '🎓' }`

#### UnitList

- 接收 `gradeId` 参数，按年级过滤单元
- 1-2 年级：显示「拼音」「生字」「词语」「古诗」
- 3-6 年级语文：显示「生字」「词语」「古诗」（无拼音）
- 3-6 年级英语：显示「字母」「单词」「句子」「对话」

#### courseData.js

```javascript
// 新增函数
export function getUnits(gradeId, subject) {
  if (subject === '语文') {
    return gradeId === 'g1' || gradeId === 'g2'
      ? CHINESE_UNITS  // 含拼音
      : CHINESE_UNITS.filter(u => u.id !== 'pinyin');
  }
  // 英语
  return ENGLISH_UNITS;
}

export function getLessons(gradeId, unitId) {
  const gradeName = GRADES.find(g => g.id === gradeId)?.name; // e.g. "三年级"
  // 按年级前缀过滤课文
  return CHINESE_CONTENTS.filter(c => {
    const gradeMatch = c.grade.startsWith(gradeName);
    const unitMatch = unitId === 'shengzi' || unitId === 'cihui' || unitId === 'gushi'
      ? true // 语文单元不精确匹配，显示所有
      : c.unit === unitId;
    return gradeMatch && unitMatch;
  });
}

export function getLessonCharacters(lessonId) {
  const lesson = CHINESE_CONTENTS.find(c => c.id === lessonId);
  return lesson?.characters || [];
}
```

### 4.3 状态管理（useCourseData Hook）

新增状态：
```javascript
const [selectedSubject, setSelectedSubject] = useState('语文');
const [selectedLesson, setSelectedLesson] = useState(null);
const [selectedCharacters, setSelectedCharacters] = useState(new Set());
```

新增方法：
```javascript
const onSelectSubject = useCallback((subject) => {
  setSelectedSubject(subject);
  setSelectedUnit(null);
  setSelectedLesson(null);
  setSelectedCharacters(new Set());
}, []);

const onSelectLesson = useCallback((lesson) => {
  setSelectedLesson(lesson);
  // 默认全选该课生字
  setSelectedCharacters(new Set(lesson.characters || []));
}, []);

const onToggleCharacter = useCallback((char) => {
  setSelectedCharacters(prev => {
    const next = new Set(prev);
    if (next.has(char)) next.delete(char);
    else next.add(char);
    return next;
  });
}, []);
```

---

## 5. 交互细节

### 5.1 学科选择

| 年级 | 可选学科 |
|------|---------|
| 一年级 | 语文 |
| 二年级 | 语文 |
| 三年级 | 语文、英语 |
| 四年级 | 语文、英语 |
| 五年级 | 语文、英语 |
| 六年级 | 语文、英语 |

### 5.2 课文列表

- 按单元分组，单元作为折叠 header
- 每项显示：课文标题 + 生字数量 badge（如「天地人 · 3字」）
- 空状态：该单元暂无课文

### 5.3 生字选择

- 网格布局（auto-fill, minmax(60px, 1fr)）
- 每个生字卡片：显示汉字 + 拼音（小字上方）
- 选中状态：蓝色边框 + 勾选标记
- 顶部操作栏：
  - 左侧：「已选 N / M 个字」
  - 右侧：「全选」「取消全选」按钮
- 底部：「已选 N 个字 → 生成字帖」按钮

### 5.4 错误处理

- 无课文时显示空状态：「该单元暂无课文，请选择其他单元」
- 无生字时显示：「该课文暂无生字数据」
- 未选生字时禁用生成按钮：「请至少选择一个生字」

---

## 6. 移动端适配

- SubjectSelector：2 列网格
- LessonList：全宽列表项，增大触摸目标（min 44px）
- CharacterSelector：3-4 列网格，卡片适当缩小
- 操作栏：sticky bottom，按钮全宽

---

## 7. 验收标准

- [ ] 选一年级后，只显示一年级课文
- [ ] 选三年级后，显示语文和英语两个学科
- [ ] 选一年级后，不显示英语学科
- [ ] 选课文后，默认全选该课生字
- [ ] 可取消部分生字，生成字帖只包含选中生字
- [ ] 六年级正常显示，英语数据正确
- [ ] 搜索课文标题可正确过滤
- [ ] 移动端可完成完整流程

---

## 8. 后续步骤

1. ✅ 设计规范（本文档）
2. ⬜ 用 writing-plans skill 写实施计划
3. ⬜ 开始实施

---

*文档状态: v1.0 设计稿 | 最后更新: 2026-09-08*
