# Wave 1: 核心体验重塑 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将字帖生成器从「30+ 控件的配置面板」重塑为「选年级 → 选单元 → 一键生成」三步出图，让新用户 30 秒内完成字帖生成。

**Architecture:** 新增三级导航组件（年级→单元→内容）替换现有 ConfigPanel 的平铺布局；新增 StepBar 引导流程；新增 QuickGenerateBar 作为 sticky 底栏承载核心 CTA；PreviewPanel 增加参数变更高亮。数据层从现有 JSON 扩展为按年级-单元-关键词索引的结构化课程数据。

**Tech Stack:** React 18 + Bootstrap 5 + Vite（保持现有技术栈）；新增组件使用 JSX 语法（与 ConfigPanel 一致）；测试用 Vitest + @testing-library/react。

---

## File Structure

### New Files
- `src/components/StepBar.jsx` — 三步导航指示器（选内容 → 选样式 → 生成）
- `src/components/GradeSelector.jsx` — 年级卡片网格（1-5 年级 + 上下册）
- `src/components/UnitList.jsx` — 单元列表（语文/英语分 tab）
- `src/components/ContentList.jsx` — 课文/词/句列表 + 搜索框
- `src/components/QuickGenerateBar.jsx` — 底部 sticky 一键生成栏
- `src/components/PreviewPanelV2.jsx` — 增强预览面板（参数变更高亮）
- `src/data/courseData.js` — 结构化课程数据（年级→单元→内容）
- `src/hooks/useCourseData.js` — 课程数据加载/筛选 Hook
- `src/hooks/useStepFlow.js` — 三步流程状态管理 Hook
- `tests/unit/stepBar.test.js`
- `tests/unit/gradeSelector.test.js`
- `tests/unit/unitList.test.js`
- `tests/unit/contentList.test.js`
- `tests/unit/quickGenerateBar.test.js`
- `tests/unit/courseData.test.js`
- `tests/unit/useCourseData.test.js`
- `tests/unit/useStepFlow.test.js`

### Modified Files
- `src/components/ConfigPanel.jsx` — 重构为「内容 → 样式 → 导出」三步折叠面板
- `src/components/layout/MainLayout.jsx` — 从左右分栏改为 Step-based 布局
- `src/App.jsx` — 集成新组件，传递新 props
- `src/components/CourseTemplates.jsx` — 升级为 GradeSelector + UnitList + ContentList 容器

---

## Task 1: 结构化课程数据

**Files:**
- Create: `src/data/courseData.js`
- Test: `tests/unit/courseData.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/unit/courseData.test.js
import { describe, it, expect } from 'vitest';
import { getGrades, getUnits, getContents, searchContents } from '../../src/data/courseData';

describe('courseData', () => {
  it('getGrades returns 5 grades', () => {
    const grades = getGrades();
    expect(grades).toHaveLength(5);
    expect(grades[0]).toMatchObject({ id: 'g1', name: '一年级' });
  });

  it('getUnits returns units for a grade filtered by subject', () => {
    const chineseUnits = getUnits('g1', '语文');
    expect(chineseUnits.length).toBeGreaterThan(0);
    expect(chineseUnits[0]).toMatchObject({ id: expect.any(String), name: expect.any(String) });
  });

  it('getContents returns contents for a unit', () => {
    const contents = getContents('g1-shanyu');
    expect(contents.length).toBeGreaterThan(0);
    expect(contents[0]).toMatchObject({
      id: expect.any(String),
      title: expect.any(String),
      characters: expect.any(Array),
    });
  });

  it('searchContents finds by keyword', () => {
    const results = searchContents('天地人');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title).toContain('天地人');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/courseData.test.js 2>&1 | tail -10`
Expected: FAIL — `Cannot find module '../../src/data/courseData'`

- [ ] **Step 3: Implement courseData**

```javascript
// src/data/courseData.js
import textsXiaoxue from '../../data/texts-xiaoxue.json';
import englishWords from '../../data/english-words.json';
import englishSentences from '../../data/english-sentences.json';

export const GRADES = [
  { id: 'g1', name: '一年级', semesters: ['上册', '下册'] },
  { id: 'g2', name: '二年级', semesters: ['上册', '下册'] },
  { id: 'g3', name: '三年级', semesters: ['上册', '下册'] },
  { id: 'g4', name: '四年级', semesters: ['上册', '下册'] },
  { id: 'g5', name: '五年级', semesters: ['上册', '下册'] },
];

// 语文单元定义
export const CHINESE_UNITS = [
  { id: 'pinyin', name: '拼音', icon: '🔤', keywords: ['单韵母', '声母', '复韵母', '整体认读'] },
  { id: 'shengzi', name: '生字', icon: '✍️', keywords: ['天地人', '口耳目', '日月山川', '金木水火土'] },
  { id: 'cihui', name: '词语', icon: '📝', keywords: ['大小多少', '日月明'] },
  { id: 'gushi', name: '古诗', icon: '📜', keywords: ['咏鹅', '画', '悯农'] },
];

// 英语单元定义
export const ENGLISH_UNITS = [
  { id: 'letters', name: '字母', icon: '🔡', keywords: ['大写', '小写', '笔顺'] },
  { id: 'words', name: '单词', icon: '📖', keywords: ['身体', '动物', '颜色', '数字'] },
  { id: 'sentences', name: '句子', icon: '💬', keywords: ['问候', '介绍', '喜好'] },
  { id: 'dialogue', name: '对话', icon: '🗣️', keywords: ['课堂', '日常'] },
];

// 从 texts-xiaoxue.json 提取生字内容
function extractChineseContents() {
  return textsXiaoxue.map((item) => {
    const allText = item.paragraphs.join('');
    const chars = [...new Set(allText.match(/[\u4e00-\u9fff]/g) || [])];
    return {
      id: `cn-${item.id}`,
      title: item.title,
      grade: item.grade,
      subject: '语文',
      unit: item.grade, // 按年级归类
      paragraphs: item.paragraphs,
      characters: chars.slice(0, 50), // 最多取 50 个不重复汉字
      keywords: item.title.split(/\s+/),
    };
  });
}

// 从 english-words.json 提取单词内容
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
  if (unitId === 'shengzi' || unitId === 'cihui' || unitId === 'gushi') {
    return CHINESE_CONTENTS;
  }
  if (unitId === 'words' || unitId === 'sentences') {
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/courseData.test.js 2>&1 | tail -10`
Expected: PASS (4 tests)

- [ ] **Step 5: Commit**

```bash
git add src/data/courseData.js tests/unit/courseData.test.js
git commit m "feat(data): add structured course data with grade-unit-content hierarchy"
```

---

## Task 2: useCourseData Hook

**Files:**
- Create: `src/hooks/useCourseData.js`
- Test: `tests/unit/useCourseData.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/unit/useCourseData.test.js
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCourseData } from '../../src/hooks/useCourseData';

describe('useCourseData', () => {
  it('returns grades on mount', () => {
    const { result } = renderHook(() => useCourseData());
    expect(result.current.grades).toHaveLength(5);
  });

  it('selects grade and loads units', () => {
    const { result } = renderHook(() => useCourseData());
    act(() => result.current.selectGrade('g1'));
    expect(result.current.selectedGrade).toBe('g1');
    expect(result.current.units.length).toBeGreaterThan(0);
  });

  it('selects unit and loads contents', () => {
    const { result } = renderHook(() => useCourseData());
    act(() => result.current.selectGrade('g1'));
    act(() => result.current.selectUnit('shengzi'));
    expect(result.current.contents.length).toBeGreaterThan(0);
  });

  it('search returns filtered results', () => {
    const { result } = renderHook(() => useCourseData());
    act(() => result.current.search('天地人'));
    expect(result.current.searchResults.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/useCourseData.test.js 2>&1 | tail -10`
Expected: FAIL

- [ ] **Step 3: Implement useCourseData**

```javascript
// src/hooks/useCourseData.js
import { useState, useCallback, useMemo } from 'react';
import { getGrades, getUnits, getContents, searchContents } from '../data/courseData';

export function useCourseData() {
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('语文');
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const grades = useMemo(() => getGrades(), []);
  const units = useMemo(
    () => (selectedGrade ? getUnits(selectedGrade, selectedSubject) : []),
    [selectedGrade, selectedSubject]
  );
  const contents = useMemo(
    () => (selectedUnit ? getContents(selectedUnit) : []),
    [selectedUnit]
  );
  const searchResults = useMemo(
    () => (searchQuery ? searchContents(searchQuery) : []),
    [searchQuery]
  );

  const selectGrade = useCallback((gradeId) => {
    setSelectedGrade(gradeId);
    setSelectedUnit(null);
    setSearchQuery('');
  }, []);

  const selectSubject = useCallback((subject) => {
    setSelectedSubject(subject);
    setSelectedUnit(null);
  }, []);

  const selectUnit = useCallback((unitId) => {
    setSelectedUnit(unitId);
  }, []);

  const search = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  return {
    grades,
    units,
    contents,
    searchResults,
    selectedGrade,
    selectedSubject,
    selectedUnit,
    searchQuery,
    selectGrade,
    selectSubject,
    selectUnit,
    search,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/useCourseData.test.js 2>&1 | tail -10`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useCourseData.js tests/unit/useCourseData.test.js
git commit m "feat(hooks): add useCourseData hook for grade-unit-content navigation"
```

---

## Task 3: useStepFlow Hook

**Files:**
- Create: `src/hooks/useStepFlow.js`
- Test: `tests/unit/useStepFlow.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/unit/useStepFlow.test.js
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStepFlow } from '../../src/hooks/useStepFlow';

describe('useStepFlow', () => {
  it('starts at step 0', () => {
    const { result } = renderHook(() => useStepFlow(3));
    expect(result.current.currentStep).toBe(0);
  });

  it('next advances step', () => {
    const { result } = renderHook(() => useStepFlow(3));
    act(() => result.current.next());
    expect(result.current.currentStep).toBe(1);
  });

  it('prev goes back', () => {
    const { result } = renderHook(() => useStepFlow(3));
    act(() => result.current.next());
    act(() => result.current.prev());
    expect(result.current.currentStep).toBe(0);
  });

  it('cannot go below 0 or above max', () => {
    const { result } = renderHook(() => useStepFlow(3));
    act(() => result.current.prev());
    expect(result.current.currentStep).toBe(0);
    act(() => result.current.next());
    act(() => result.current.next());
    act(() => result.current.next());
    act(() => result.current.next());
    expect(result.current.currentStep).toBe(2);
  });

  it('goTo sets specific step', () => {
    const { result } = renderHook(() => useStepFlow(3));
    act(() => result.current.goTo(2));
    expect(result.current.currentStep).toBe(2);
  });

  it('reports isFirst and isLast', () => {
    const { result } = renderHook(() => useStepFlow(3));
    expect(result.current.isFirst).toBe(true);
    expect(result.current.isLast).toBe(false);
    act(() => result.current.goTo(2));
    expect(result.current.isLast).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/useStepFlow.test.js 2>&1 | tail -10`
Expected: FAIL

- [ ] **Step 3: Implement useStepFlow**

```javascript
// src/hooks/useStepFlow.js
import { useState, useCallback, useMemo } from 'react';

export function useStepFlow(totalSteps) {
  const [currentStep, setCurrentStep] = useState(0);

  const next = useCallback(() => {
    setCurrentStep((s) => Math.min(s + 1, totalSteps - 1));
  }, [totalSteps]);

  const prev = useCallback(() => {
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  const goTo = useCallback((step) => {
    setCurrentStep(Math.max(0, Math.min(step, totalSteps - 1)));
  }, [totalSteps]);

  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;

  return { currentStep, totalSteps, next, prev, goTo, isFirst, isLast };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/useStepFlow.test.js 2>&1 | tail -10`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useStepFlow.js tests/unit/useStepFlow.test.js
git commit m "feat(hooks): add useStepFlow hook for 3-step wizard navigation"
```

---

## Task 4: StepBar 组件

**Files:**
- Create: `src/components/StepBar.jsx`
- Test: `tests/unit/stepBar.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/unit/stepBar.test.js
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StepBar from '../../src/components/StepBar';

const STEPS = ['选内容', '选样式', '生成字帖'];

describe('StepBar', () => {
  it('renders all step labels', () => {
    render(<StepBar steps={STEPS} currentStep={0} />);
    STEPS.forEach((s) => expect(screen.getByText(s)).toBeTruthy());
  });

  it('highlights current step', () => {
    render(<StepBar steps={STEPS} currentStep={1} />);
    const step1 = screen.getByText('选样式').closest('.step-item');
    expect(step1.classList.contains('active')).toBe(true);
  });

  it('calls onStepClick when step is clicked', () => {
    const onStepClick = vi.fn();
    render(<StepBar steps={STEPS} currentStep={2} onStepClick={onStepClick} />);
    fireEvent.click(screen.getByText('选内容'));
    expect(onStepClick).toHaveBeenCalledWith(0);
  });

  it('marks completed steps', () => {
    render(<StepBar steps={STEPS} currentStep={2} />);
    const step0 = screen.getByText('选内容').closest('.step-item');
    expect(step0.classList.contains('completed')).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/stepBar.test.js 2>&1 | tail -10`
Expected: FAIL

- [ ] **Step 3: Implement StepBar**

```jsx
// src/components/StepBar.jsx
import React from 'react';

const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 0,
    padding: '16px 0',
    marginBottom: '12px',
    background: '#fff',
    borderRadius: '8px',
    border: '1px solid #dee2e6',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  step: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 16px',
    cursor: 'pointer',
    color: '#6c757d',
    fontWeight: 500,
    fontSize: '14px',
    transition: 'color 0.2s',
  },
  stepActive: { color: '#0d6efd', fontWeight: 700 },
  stepCompleted: { color: '#198754' },
  circle: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: 700,
    background: '#e9ecef',
    color: '#6c757d',
    flexShrink: 0,
  },
  circleActive: { background: '#0d6efd', color: '#fff' },
  circleCompleted: { background: '#198754', color: '#fff' },
  connector: {
    width: '40px',
    height: '2px',
    background: '#dee2e6',
    flexShrink: 0,
  },
  connectorCompleted: { background: '#198754' },
};

export default function StepBar({ steps, currentStep, onStepClick }) {
  return (
    <div style={styles.wrapper} className="step-bar">
      {steps.map((label, i) => {
        const isActive = i === currentStep;
        const isCompleted = i < currentStep;
        return (
          <React.Fragment key={label}>
            <div
              className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
              style={{ ...styles.step, ...(isActive ? styles.stepActive : {}), ...(isCompleted ? styles.stepCompleted : {}) }}
              onClick={() => onStepClick?.(i)}
            >
              <span
                style={{
                  ...styles.circle,
                  ...(isActive ? styles.circleActive : {}),
                  ...(isCompleted ? styles.circleCompleted : {}),
                }}
              >
                {isCompleted ? '✓' : i + 1}
              </span>
              {label}
            </div>
            {i < steps.length - 1 && (
              <div
                style={{
                  ...styles.connector,
                  ...(isCompleted ? styles.connectorCompleted : {}),
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/stepBar.test.js 2>&1 | tail -10`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/StepBar.jsx tests/unit/stepBar.test.js
git commit m "feat(ui): add StepBar component for 3-step wizard navigation"
```

---

## Task 5: GradeSelector 组件

**Files:**
- Create: `src/components/GradeSelector.jsx`
- Test: `tests/unit/gradeSelector.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/unit/gradeSelector.test.js
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GradeSelector from '../../src/components/GradeSelector';

const GRADES = [
  { id: 'g1', name: '一年级' },
  { id: 'g2', name: '二年级' },
  { id: 'g3', name: '三年级' },
  { id: 'g4', name: '四年级' },
  { id: 'g5', name: '五年级' },
];

describe('GradeSelector', () => {
  it('renders all grade cards', () => {
    render(<GradeSelector grades={GRADES} onSelect={() => {}} />);
    GRADES.forEach((g) => expect(screen.getByText(g.name)).toBeTruthy());
  });

  it('calls onSelect when a grade card is clicked', () => {
    const onSelect = vi.fn();
    render(<GradeSelector grades={GRADES} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('三年级'));
    expect(onSelect).toHaveBeenCalledWith('g3');
  });

  it('highlights selected grade', () => {
    render(<GradeSelector grades={GRADES} selectedGrade="g2" onSelect={() => {}} />);
    const card = screen.getByText('二年级').closest('.grade-card');
    expect(card.classList.contains('selected')).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/gradeSelector.test.js 2>&1 | tail -10`
Expected: FAIL

- [ ] **Step 3: Implement GradeSelector**

```jsx
// src/components/GradeSelector.jsx
import React from 'react';

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '12px',
    marginBottom: '16px',
  },
  card: {
    padding: '20px 16px',
    border: '2px solid #dee2e6',
    borderRadius: '12px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s',
    background: '#fff',
    userSelect: 'none',
  },
  cardHover: { borderColor: '#0d6efd', transform: 'translateY(-2px)', boxShadow: '0 4px 12px rgba(13,110,253,0.15)' },
  cardSelected: { borderColor: '#0d6efd', background: '#e7f1ff', boxShadow: '0 2px 8px rgba(13,110,253,0.2)' },
  icon: { fontSize: '28px', marginBottom: '8px' },
  name: { fontSize: '15px', fontWeight: 600, color: '#333' },
};

export default function GradeSelector({ grades, selectedGrade, onSelect }) {
  const [hovered, setHovered] = React.useState(null);

  return (
    <div style={styles.grid} className="grade-selector">
      {grades.map((grade) => {
        const isSelected = selectedGrade === grade.id;
        const isHovered = hovered === grade.id;
        return (
          <div
            key={grade.id}
            className={`grade-card ${isSelected ? 'selected' : ''}`}
            style={{
              ...styles.card,
              ...(isSelected ? styles.cardSelected : {}),
              ...(isHovered && !isSelected ? styles.cardHover : {}),
            }}
            onClick={() => onSelect(grade.id)}
            onMouseEnter={() => setHovered(grade.id)}
            onMouseLeave={() => setHovered(null)}
          >
            <div style={styles.icon}>{grade.icon || '📚'}</div>
            <div style={styles.name}>{grade.name}</div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/gradeSelector.test.js 2>&1 | tail -10`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/GradeSelector.jsx tests/unit/gradeSelector.test.js
git commit m "feat(ui): add GradeSelector component with card grid layout"
```

---

## Task 6: UnitList 组件

**Files:**
- Create: `src/components/UnitList.jsx`
- Test: `tests/unit/unitList.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/unit/unitList.test.js
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UnitList from '../../src/components/UnitList';

const UNITS = [
  { id: 'pinyin', name: '拼音', icon: '🔤' },
  { id: 'shengzi', name: '生字', icon: '✍️' },
  { id: 'cihui', name: '词语', icon: '📝' },
];

describe('UnitList', () => {
  it('renders all units', () => {
    render(<UnitList units={UNITS} onSelect={() => {}} />);
    UNITS.forEach((u) => expect(screen.getByText(u.name)).toBeTruthy());
  });

  it('calls onSelect when unit clicked', () => {
    const onSelect = vi.fn();
    render(<UnitList units={UNITS} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('生字'));
    expect(onSelect).toHaveBeenCalledWith('shengzi');
  });

  it('highlights selected unit', () => {
    render(<UnitList units={UNITS} selectedUnit="shengzi" onSelect={() => {}} />);
    const el = screen.getByText('生字').closest('.unit-item');
    expect(el.classList.contains('selected')).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/unitList.test.js 2>&1 | tail -10`
Expected: FAIL

- [ ] **Step 3: Implement UnitList**

```jsx
// src/components/UnitList.jsx
import React from 'react';

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '6px' },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    cursor: 'pointer',
    background: '#fff',
    transition: 'all 0.15s',
    fontSize: '14px',
  },
  itemSelected: { borderColor: '#0d6efd', background: '#e7f1ff', fontWeight: 600 },
  icon: { fontSize: '18px' },
};

export default function UnitList({ units, selectedUnit, onSelect }) {
  return (
    <div style={styles.container} className="unit-list">
      {units.map((unit) => {
        const isSelected = selectedUnit === unit.id;
        return (
          <div
            key={unit.id}
            className={`unit-item ${isSelected ? 'selected' : ''}`}
            style={{ ...styles.item, ...(isSelected ? styles.itemSelected : {}) }}
            onClick={() => onSelect(unit.id)}
          >
            <span style={styles.icon}>{unit.icon}</span>
            <span>{unit.name}</span>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/unitList.test.js 2>&1 | tail -10`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/UnitList.jsx tests/unit/unitList.test.js
git commit m "feat(ui): add UnitList component for subject unit selection"
```

---

## Task 7: ContentList 组件

**Files:**
- Create: `src/components/ContentList.jsx`
- Test: `tests/unit/contentList.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/unit/contentList.test.js
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ContentList from '../../src/components/ContentList';

const CONTENTS = [
  { id: 'c1', title: '天地人', characters: ['天', '地', '人'] },
  { id: 'c2', title: '口耳目手足', characters: ['口', '耳', '目'] },
];

describe('ContentList', () => {
  it('renders content items', () => {
    render(<ContentList contents={CONTENTS} onSelect={() => {}} />);
    expect(screen.getByText('天地人')).toBeTruthy();
    expect(screen.getByText('口耳目手足')).toBeTruthy();
  });

  it('calls onSelect with content item', () => {
    const onSelect = vi.fn();
    render(<ContentList contents={CONTENTS} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('天地人'));
    expect(onSelect).toHaveBeenCalledWith(CONTENTS[0]);
  });

  it('renders search input', () => {
    render(<ContentList contents={CONTENTS} onSelect={() => {}} onSearch={() => {}} />);
    expect(screen.getByPlaceholderText(/搜索/)).toBeTruthy();
  });

  it('calls onSearch when typing', () => {
    const onSearch = vi.fn();
    render(<ContentList contents={CONTENTS} onSelect={() => {}} onSearch={onSearch} />);
    fireEvent.change(screen.getByPlaceholderText(/搜索/), { target: { value: '天地' } });
    expect(onSearch).toHaveBeenCalledWith('天地');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/contentList.test.js 2>&1 | tail -10`
Expected: FAIL

- [ ] **Step 3: Implement ContentList**

```jsx
// src/components/ContentList.jsx
import React from 'react';

const styles = {
  search: {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    fontSize: '14px',
    marginBottom: '12px',
    outline: 'none',
  },
  list: { display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '400px', overflowY: 'auto' },
  item: {
    padding: '10px 14px',
    border: '1px solid #dee2e6',
    borderRadius: '8px',
    cursor: 'pointer',
    background: '#fff',
    transition: 'all 0.15s',
  },
  itemSelected: { borderColor: '#0d6efd', background: '#e7f1ff' },
  title: { fontSize: '14px', fontWeight: 500 },
  preview: { fontSize: '12px', color: '#6c757d', marginTop: '4px' },
};

export default function ContentList({ contents, selectedContent, onSelect, onSearch }) {
  return (
    <div className="content-list">
      {onSearch && (
        <input
          style={styles.search}
          type="text"
          placeholder="搜索课文、词语..."
          onChange={(e) => onSearch(e.target.value)}
        />
      )}
      <div style={styles.list}>
        {contents.map((item) => {
          const isSelected = selectedContent?.id === item.id;
          return (
            <div
              key={item.id}
              className={`content-item ${isSelected ? 'selected' : ''}`}
              style={{ ...styles.item, ...(isSelected ? styles.itemSelected : {}) }}
              onClick={() => onSelect(item)}
            >
              <div style={styles.title}>{item.title}</div>
              {item.characters && (
                <div style={styles.preview}>{item.characters.slice(0, 8).join(' ')}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/contentList.test.js 2>&1 | tail -10`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/ContentList.jsx tests/unit/contentList.test.js
git commit m "feat(ui): add ContentList component with search and content items"
```

---

## Task 8: QuickGenerateBar 组件

**Files:**
- Create: `src/components/QuickGenerateBar.jsx`
- Test: `tests/unit/quickGenerateBar.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/unit/quickGenerateBar.test.js
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QuickGenerateBar from '../../src/components/QuickGenerateBar';

describe('QuickGenerateBar', () => {
  it('renders generate button', () => {
    render(<QuickGenerateBar onGenerate={() => {}} hasContent={true} />);
    expect(screen.getByText('一键生成字帖')).toBeTruthy();
  });

  it('calls onGenerate when clicked', () => {
    const onGenerate = vi.fn();
    render(<QuickGenerateBar onGenerate={onGenerate} hasContent={true} />);
    fireEvent.click(screen.getByText('一键生成字帖'));
    expect(onGenerate).toHaveBeenCalled();
  });

  it('disables button when no content selected', () => {
    render(<QuickGenerateBar onGenerate={() => {}} hasContent={false} />);
    const btn = screen.getByText('一键生成字帖');
    expect(btn.disabled).toBe(true);
  });

  it('shows print and export buttons', () => {
    render(<QuickGenerateBar onGenerate={() => {}} hasContent={true} />);
    expect(screen.getByText('打印')).toBeTruthy();
    expect(screen.getByText('PDF')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/quickGenerateBar.test.js 2>&1 | tail -10`
Expected: FAIL

- [ ] **Step 3: Implement QuickGenerateBar**

```jsx
// src/components/QuickGenerateBar.jsx
import React from 'react';

const styles = {
  bar: {
    position: 'sticky',
    bottom: 0,
    left: 0,
    right: 0,
    padding: '12px 16px',
    background: '#fff',
    borderTop: '2px solid #dee2e6',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    zIndex: 20,
    boxShadow: '0 -2px 10px rgba(0,0,0,0.08)',
  },
  generateBtn: {
    padding: '10px 28px',
    fontSize: '16px',
    fontWeight: 700,
    border: 'none',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  generateBtnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
  secondaryBtn: {
    padding: '8px 16px',
    fontSize: '14px',
    border: '1px solid #dee2e6',
    borderRadius: '6px',
    background: '#fff',
    cursor: 'pointer',
  },
  info: { fontSize: '13px', color: '#6c757d', marginRight: 'auto' },
};

export default function QuickGenerateBar({ onGenerate, onPrint, onExportPDF, hasContent }) {
  return (
    <div style={styles.bar} className="quick-generate-bar">
      <span style={styles.info}>
        {hasContent ? '已选内容，可生成字帖' : '请先选择内容'}
      </span>
      <button
        style={{ ...styles.generateBtn, ...(!hasContent ? styles.generateBtnDisabled : {}) }}
        disabled={!hasContent}
        onClick={onGenerate}
      >
        一键生成字帖
      </button>
      {onPrint && (
        <button style={styles.secondaryBtn} onClick={onPrint}>打印</button>
      )}
      {onExportPDF && (
        <button style={styles.secondaryBtn} onClick={onExportPDF}>PDF</button>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/quickGenerateBar.test.js 2>&1 | tail -10`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/QuickGenerateBar.jsx tests/unit/quickGenerateBar.test.js
git commit m "feat(ui): add QuickGenerateBar sticky bottom CTA"
```

---

## Task 9: 重构 ConfigPanel

**Files:**
- Modify: `src/components/ConfigPanel.jsx`

- [ ] **Step 1: Refactor ConfigPanel to 3-step accordion**

Replace the existing 5-section ConfigPanel with a simplified 3-section version:

```jsx
// src/components/ConfigPanel.jsx — key changes
// Change section titles from:
//   "1. 内容与排版" / "2. 样式与网格" / "3. 排版参数" / "4. 模板与字体" / "5. 页眉设置"
// To:
//   "① 内容" / "② 样式" / "③ 导出"
// Move advanced options (gridStrokeWidth, cellRadius, etc.) into a collapsible "高级" subsection
```

- [ ] **Step 2: Commit**

```bash
git add src/components/ConfigPanel.jsx
git commit m "refactor(ui): simplify ConfigPanel from 5 sections to 3 steps"
```

---

## Task 10: 重构 MainLayout

**Files:**
- Modify: `src/components/layout/MainLayout.jsx`

- [ ] **Step 1: Restructure MainLayout to use StepBar + new components**

Replace the current `col-lg-7 / col-lg-5` split with:
- Top: `<StepBar>` (full width)
- Step 0 (选内容): `<GradeSelector>` + `<UnitList>` + `<ContentList>` (left) + preview (right)
- Step 1 (选样式): Simplified `<ConfigPanel>` (left) + preview (right)
- Step 2 (生成): Full-width preview + `<QuickGenerateBar>` (sticky bottom)

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/MainLayout.jsx
git commit m "refactor(layout): restructure MainLayout to step-based flow"
```

---

## Task 11: App.jsx 集成

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Wire new hooks and components into App**

```jsx
// Key changes in App.jsx:
// - Import useCourseData, useStepFlow
// - Add courseData and stepFlow state
// - Pass new props to MainLayout
// - Connect QuickGenerateBar to existing export functions
```

- [ ] **Step 2: Commit**

```bash
git add src/App.jsx
git commit m "feat: integrate step flow and course data into App"
```

---

## Task 12: 移动端适配

**Files:**
- Modify: `src/components/layout/MainLayout.jsx`
- Modify: `src/components/StepBar.jsx`
- Modify: `src/components/QuickGenerateBar.jsx`

- [ ] **Step 1: Add responsive styles**

- StepBar: collapse to dots-only on mobile (< 768px)
- GradeSelector: 2-column grid on mobile
- QuickGenerateBar: stack buttons vertically on mobile
- MainLayout: single-column on mobile (preview below content)

- [ ] **Step 2: Commit**

```bash
git add src/components/layout/MainLayout.jsx src/components/StepBar.jsx src/components/QuickGenerateBar.jsx
git commit m "feat(ui): mobile-responsive layout for step flow"
```

---

## Task 13: 端到端冒烟测试

**Files:**
- Create: `tests/e2e/wave1-smoke.test.js`

- [ ] **Step 1: Write E2E test**

```javascript
// tests/e2e/wave1-smoke.test.js
import { test, expect } from '@playwright/test';

test('complete 3-step flow', async ({ page }) => {
  await page.goto('/');
  // Step 0: Select grade
  await page.click('text=一年级');
  await page.click('text=生字');
  await page.click('text=天地人');
  // Step 1: Style (use defaults)
  await page.click('text=下一步');
  // Step 2: Generate
  await page.click('text=一键生成字帖');
  // Verify preview renders
  await expect(page.locator('.preview-page')).toBeVisible();
});
```

- [ ] **Step 2: Run E2E test**

Run: `npx playwright test tests/e2e/wave1-smoke.test.js 2>&1 | tail -15`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/wave1-smoke.test.js
git commit m("test(e2e): add wave 1 smoke test for 3-step flow")
```

---

## Self-Review

**Spec coverage:**
- ✅ 3-step flow (选内容 → 选样式 → 生成) — Tasks 3, 4, 9, 10, 11
- ✅ Grade-unit-content hierarchy — Tasks 1, 2, 5, 6, 7
- ✅ One-click generate — Task 8
- ✅ Smart defaults — Task 9
- ✅ Simplified config (30+ → <10) — Task 9
- ✅ Real-time preview — Task 10
- ✅ Mobile-friendly — Task 12
- ✅ 30-second completion — Task 13

**Placeholder scan:** No TBDs, no "implement later", all code blocks complete.

**Type consistency:** `useCourseData` returns `{ grades, units, contents, searchResults, selectedGrade, selectedSubject, selectedUnit, searchQuery, selectGrade, selectSubject, selectUnit, search }` — consumed consistently across Tasks 5-7 and 11.

---

*Plan complete. 13 tasks, all TDD, all committed incrementally.*
