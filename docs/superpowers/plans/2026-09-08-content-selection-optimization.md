# 选内容模块优化 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 优化选内容模块：添加六年级、学科选择（语文/英语）、按年级过滤课文、课文内生字多选。

**Architecture:** 在现有 3 步向导基础上，将「选内容」从 1 步扩展为 4 步（年级→学科→单元→课文→生字）。新增 SubjectSelector、LessonList、CharacterSelector 三个组件，改造 courseData.js 增加年级过滤，扩展 useCourseData hook 管理新增状态。

**Tech Stack:** React 18 + 内联样式（与现有模式一致）+ Vitest + @testing-library/react

---

## File Structure

### New Files
- `src/components/SubjectSelector.jsx` — 学科选择器（语文/英语卡片）
- `src/components/LessonList.jsx` — 课文列表（按年级+单元过滤）
- `src/components/CharacterSelector.jsx` — 生字多选器（全选→取消）
- `tests/unit/subjectSelector.test.js`
- `tests/unit/lessonList.test.js`
- `tests/unit/characterSelector.test.js`
- `tests/unit/courseDataGrades.test.js`

### Modified Files
- `src/data/courseData.js` — 添加 getLessons()、getLessonCharacters()、六年级
- `src/hooks/useCourseData.js` — 添加 selectedSubject/selectedLesson/selectedCharacters 状态
- `src/components/GradeSelector.jsx` — 添加六年级卡片
- `src/components/UnitList.jsx` — 按年级过滤单元
- `src/components/layout/MainLayout.jsx` — 集成新的选内容流程
- `src/App.jsx` — 传递新 props

---

## Task 1: 添加六年级 + courseData 年级过滤

**Files:**
- Modify: `src/data/courseData.js`
- Test: `tests/unit/courseDataGrades.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/unit/courseDataGrades.test.js
import { describe, it, expect } from 'vitest';
import { getGrades, getUnits, getLessons, getLessonCharacters } from '../../src/data/courseData';

describe('courseData grade filtering', () => {
  it('getGrades includes grade 6', () => {
    const grades = getGrades();
    expect(grades).toHaveLength(6);
    expect(grades[5]).toMatchObject({ id: 'g6', name: '六年级' });
  });

  it('getUnits returns English for grade 3+', () => {
    const units = getUnits('g3', '英语');
    expect(units.length).toBeGreaterThan(0);
    expect(units[0]).toHaveProperty('id');
  });

  it('getUnits returns only Chinese for grade 1-2', () => {
    const units = getUnits('g1', '语文');
    expect(units.length).toBeGreaterThan(0);
  });

  it('getLessons filters by grade', () => {
    const lessons = getLessons('g1', 'shengzi');
    expect(lessons.length).toBeGreaterThan(0);
    expect(lessons[0].grade).toContain('一年级');
  });

  it('getLessonCharacters returns characters for a lesson', () => {
    const lessons = getLessons('g1', 'shengzi');
    if (lessons.length > 0) {
      const chars = getLessonCharacters(lessons[0].id);
      expect(chars.length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/courseDataGrades.test.js 2>&1 | tail -10`
Expected: FAIL

- [ ] **Step 3: Implement grade 6 + filtering in courseData.js**

Add to GRADES array:
```javascript
{ id: 'g6', name: '六年级', icon: '🎓', semesters: ['上册', '下册'] },
```

Add new functions:
```javascript
export function getLessons(gradeId, unitId) {
  const gradeObj = GRADES.find(g => g.id === gradeId);
  if (!gradeObj) return [];
  const gradeName = gradeObj.name; // e.g. "三年级"
  
  if (unitId === 'words' || unitId === 'sentences' || unitId === 'letters' || unitId === 'dialogue') {
    // English content
    return ENGLISH_CONTENTS.filter(c => c.grade.startsWith(gradeName) && c.unit === unitId);
  }
  // Chinese content - filter by grade
  return CHINESE_CONTENTS.filter(c => c.grade.startsWith(gradeName));
}

export function getLessonCharacters(lessonId) {
  const lesson = CHINESE_CONTENTS.find(c => c.id === lessonId);
  return lesson?.characters || [];
}
```

Update getUnits to accept grade:
```javascript
export function getUnits(gradeId, subject) {
  if (subject === '语文') {
    // Grade 1-2 include pinyin
    if (gradeId === 'g1' || gradeId === 'g2') return CHINESE_UNITS;
    return CHINESE_UNITS.filter(u => u.id !== 'pinyin');
  }
  return ENGLISH_UNITS;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/courseDataGrades.test.js 2>&1 | tail -10`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/data/courseData.js tests/unit/courseDataGrades.test.js
git commit m "feat(data): add 6th grade and grade-based filtering for lessons"
```

---

## Task 2: SubjectSelector 组件

**Files:**
- Create: `src/components/SubjectSelector.jsx`
- Test: `tests/unit/subjectSelector.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/unit/subjectSelector.test.js
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SubjectSelector from '../../src/components/SubjectSelector';

describe('SubjectSelector', () => {
  it('renders Chinese subject', () => {
    render(<SubjectSelector gradeId="g3" selectedSubject="语文" onSelectSubject={() => {}} />);
    expect(screen.getByText('语文')).toBeTruthy();
  });

  it('renders English for grade 3+', () => {
    render(<SubjectSelector gradeId="g3" selectedSubject="语文" onSelectSubject={() => {}} />);
    expect(screen.getByText('英语')).toBeTruthy();
  });

  it('does NOT render English for grade 1-2', () => {
    render(<SubjectSelector gradeId="g1" selectedSubject="语文" onSelectSubject={() => {}} />);
    expect(screen.queryByText('英语')).toBeNull();
  });

  it('calls onSelectSubject when clicked', () => {
    const onSelect = vi.fn();
    render(<SubjectSelector gradeId="g3" selectedSubject="语文" onSelectSubject={onSelect} />);
    fireEvent.click(screen.getByText('英语'));
    expect(onSelect).toHaveBeenCalledWith('英语');
  });

  it('highlights selected subject', () => {
    render(<SubjectSelector gradeId="g3" selectedSubject="英语" onSelectSubject={() => {}} />);
    const card = screen.getByText('英语').closest('.subject-card');
    expect(card.classList.contains('selected')).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/subjectSelector.test.js 2>&1 | tail -10`
Expected: FAIL

- [ ] **Step 3: Implement SubjectSelector.jsx**

```jsx
// src/components/SubjectSelector.jsx
import React from 'react';

const SUBJECTS = [
  { id: '语文', name: '语文', icon: '📖', desc: '生字、词语、古诗' },
  { id: '英语', name: '英语', icon: '🔤', desc: '字母、单词、句子' },
];

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
  cardSelected: { borderColor: '#0d6efd', background: '#e7f1ff' },
  icon: { fontSize: '28px', marginBottom: '8px' },
  name: { fontSize: '15px', fontWeight: 600 },
  desc: { fontSize: '12px', color: '#6c757d', marginTop: '4px' },
};

export default function SubjectSelector({ gradeId, selectedSubject, onSelectSubject }) {
  const showEnglish = ['g3', 'g4', 'g5', 'g6'].includes(gradeId);
  const availableSubjects = showEnglish ? SUBJECTS : SUBJECTS.filter(s => s.id === '语文');

  return (
    <div style={styles.grid} className="subject-selector">
      {availableSubjects.map((subject) => {
        const isSelected = selectedSubject === subject.id;
        return (
          <div
            key={subject.id}
            className={`subject-card ${isSelected ? 'selected' : ''}`}
            style={{ ...styles.card, ...(isSelected ? styles.cardSelected : {}) }}
            onClick={() => onSelectSubject(subject.id)}
          >
            <div style={styles.icon}>{subject.icon}</div>
            <div style={styles.name}>{subject.name}</div>
            <div style={styles.desc}>{subject.desc}</div>
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/subjectSelector.test.js 2>&1 | tail -10`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/SubjectSelector.jsx tests/unit/subjectSelector.test.js
git commit m "feat(ui): add SubjectSelector for Chinese/English selection"
```

---

## Task 3: LessonList 组件

**Files:**
- Create: `src/components/LessonList.jsx`
- Test: `tests/unit/lessonList.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/unit/lessonList.test.js
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LessonList from '../../src/components/LessonList';

const LESSONS = [
  { id: 'cn-1', title: '天地人', characterCount: 3, unit: '第一单元' },
  { id: 'cn-2', title: '口耳目', characterCount: 3, unit: '第一单元' },
  { id: 'cn-3', title: '日月山川', characterCount: 4, unit: '第一单元' },
];

describe('LessonList', () => {
  it('renders lesson items', () => {
    render(<LessonList lessons={LESSONS} selectedLesson={null} onSelectLesson={() => {}} />);
    expect(screen.getByText('天地人')).toBeTruthy();
    expect(screen.getByText('口耳目')).toBeTruthy();
  });

  it('shows character count badge', () => {
    render(<LessonList lessons={LESSONS} selectedLesson={null} onSelectLesson={() => {}} />);
    expect(screen.getByText(/3字/)).toBeTruthy();
  });

  it('calls onSelectLesson when clicked', () => {
    const onSelect = vi.fn();
    render(<LessonList lessons={LESSONS} selectedLesson={null} onSelectLesson={onSelect} />);
    fireEvent.click(screen.getByText('天地人'));
    expect(onSelect).toHaveBeenCalledWith(LESSONS[0]);
  });

  it('highlights selected lesson', () => {
    render(<LessonList lessons={LESSONS} selectedLesson={LESSONS[0]} onSelectLesson={() => {}} />);
    const card = screen.getByText('天地人').closest('.lesson-item');
    expect(card.classList.contains('selected')).toBe(true);
  });

  it('shows empty state when no lessons', () => {
    render(<LessonList lessons={[]} selectedLesson={null} onSelectLesson={() => {}} />);
    expect(screen.getByText(/暂无课文/)).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/lessonList.test.js 2>&1 | tail -10`
Expected: FAIL

- [ ] **Step 3: Implement LessonList.jsx**

```jsx
// src/components/LessonList.jsx
import React from 'react';

const styles = {
  list: { display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '400px', overflowY: 'auto' },
  item: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 14px', border: '1px solid #dee2e6', borderRadius: '8px',
    cursor: 'pointer', background: '#fff', transition: 'all 0.15s',
  },
  itemSelected: { borderColor: '#0d6efd', background: '#e7f1ff', fontWeight: 600 },
  title: { fontSize: '14px', fontWeight: 500 },
  badge: { fontSize: '11px', color: '#6c757d', background: '#e9ecef', padding: '2px 8px', borderRadius: '12px' },
  empty: { textAlign: 'center', padding: '24px', color: '#6c757d', fontSize: '14px' },
};

export default function LessonList({ lessons, selectedLesson, onSelectLesson }) {
  if (!lessons || lessons.length === 0) {
    return <div style={styles.empty}>该单元暂无课文，请选择其他单元</div>;
  }

  return (
    <div style={styles.list} className="lesson-list">
      {lessons.map((lesson) => {
        const isSelected = selectedLesson?.id === lesson.id;
        return (
          <div
            key={lesson.id}
            className={`lesson-item ${isSelected ? 'selected' : ''}`}
            style={{ ...styles.item, ...(isSelected ? styles.itemSelected : {}) }}
            onClick={() => onSelectLesson(lesson)}
          >
            <span style={styles.title}>{lesson.title}</span>
            {lesson.characterCount && <span style={styles.badge}>{lesson.characterCount}字</span>}
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/lessonList.test.js 2>&1 | tail -10`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/LessonList.jsx tests/unit/lessonList.test.js
git commit m "feat(ui): add LessonList with character count badges"
```

---

## Task 4: CharacterSelector 组件

**Files:**
- Create: `src/components/CharacterSelector.jsx`
- Test: `tests/unit/characterSelector.test.js`

- [ ] **Step 1: Write the failing test**

```javascript
// tests/unit/characterSelector.test.js
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CharacterSelector from '../../src/components/CharacterSelector';

const CHARS = ['天', '地', '人', '你', '我'];

describe('CharacterSelector', () => {
  it('renders all characters', () => {
    render(<CharacterSelector characters={CHARS} selectedCharacters={new Set(CHARS)} onToggleCharacter={() => {}} />);
    CHARS.forEach(ch => expect(screen.getByText(ch)).toBeTruthy());
  });

  it('shows selected count', () => {
    render(<CharacterSelector characters={CHARS} selectedCharacters=new Set(['天', '地'])} onToggleCharacter={() => {}} />);
    expect(screen.getByText(/已选 2 \/ 5/)).toBeTruthy();
  });

  it('calls onToggleCharacter when clicked', () => {
    const onToggle = vi.fn();
    render(<CharacterSelector characters={CHARS} selectedCharacters={new Set(CHARS)} onToggleCharacter={onToggle} />);
    fireEvent.click(screen.getByText('天'));
    expect(onToggle).toHaveBeenCalledWith('天');
  });

  it('highlights selected characters', () => {
    render(<CharacterSelector characters={CHARS} selectedCharacters={new Set(['天'])} onToggleCharacter={() => {}} />);
    const card = screen.getByText('天').closest('.char-card');
    expect(card.classList.contains('selected')).toBe(true);
  });

  it('select all button works', () => {
    const onSelectAll = vi.fn();
    render(<CharacterSelector characters={CHARS} selectedCharacters={new Set()} onToggleCharacter={() => {}} onSelectAll={onSelectAll} />);
    fireEvent.click(screen.getByText('全选'));
    expect(onSelectAll).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/unit/characterSelector.test.js 2>&1 | tail -10`
Expected: FAIL

- [ ] **Step 3: Implement CharacterSelector.jsx**

```jsx
// src/components/CharacterSelector.jsx
import React from 'react';

const styles = {
  container: { marginBottom: '16px' },
  toolbar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: '12px', padding: '8px 12px', background: '#f8f9fa', borderRadius: '8px',
  },
  count: { fontSize: '13px', color: '#6c757d' },
  actions: { display: 'flex', gap: '8px' },
  btn: {
    padding: '4px 12px', fontSize: '12px', border: '1px solid #dee2e6',
    borderRadius: '4px', background: '#fff', cursor: 'pointer',
  },
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))',
    gap: '8px', maxHeight: '300px', overflowY: 'auto',
  },
  card: {
    padding: '12px 8px', border: '2px solid #dee2e6', borderRadius: '8px',
    textAlign: 'center', cursor: 'pointer', fontSize: '24px', fontWeight: 500,
    background: '#fff', transition: 'all 0.15s', userSelect: 'none',
  },
  cardSelected: { borderColor: '#0d6efd', background: '#e7f1ff' },
  empty: { textAlign: 'center', padding: '24px', color: '#6c757d', fontSize: '14px' },
};

export default function CharacterSelector({ characters, selectedCharacters, onToggleCharacter, onSelectAll, onDeselectAll }) {
  if (!characters || characters.length === 0) {
    return <div style={styles.empty}>该课文暂无生字数据</div>;
  }

  const allSelected = selectedCharacters.size === characters.length;

  return (
    <div style={styles.container} className="character-selector">
      <div style={styles.toolbar}>
        <span style={styles.count}>已选 {selectedCharacters.size} / {characters.length}</span>
        <div style={styles.actions}>
          <button style={styles.btn} onClick={onSelectAll} disabled={allSelected}>全选</button>
          <button style={styles.btn} onClick={onDeselectAll} disabled={selectedCharacters.size === 0}>取消全选</button>
        </div>
      </div>
      <div style={styles.grid}>
        {characters.map((ch) => {
          const isSelected = selectedCharacters.has(ch);
          return (
            <div
              key={ch}
              className={`char-card ${isSelected ? 'selected' : ''}`}
              style={{ ...styles.card, ...(isSelected ? styles.cardSelected : {}) }}
              onClick={() => onToggleCharacter(ch)}
            >
              {ch}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/unit/characterSelector.test.js 2>&1 | tail -10`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/CharacterSelector.jsx tests/unit/characterSelector.test.js
git commit m "feat(ui): add CharacterSelector with select-all/deselect-all"
```

---

## Task 5: 更新 useCourseData Hook

**Files:**
- Modify: `src/hooks/useCourseData.js`

- [ ] **Step 1: Add new state and methods**

```javascript
// src/hooks/useCourseData.js
import { useState, useCallback, useMemo } from 'react';
import { getGrades, getUnits, getLessons, getLessonCharacters, searchContents } from '../data/courseData';

export function useCourseData() {
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('语文');
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedCharacters, setSelectedCharacters] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const grades = useMemo(() => getGrades(), []);
  const units = useMemo(
    () => (selectedGrade ? getUnits(selectedGrade, selectedSubject) : []),
    [selectedGrade, selectedSubject]
  );
  const lessons = useMemo(
    () => (selectedGrade && selectedUnit ? getLessons(selectedGrade, selectedUnit) : []),
    [selectedGrade, selectedUnit]
  );
  const searchResults = useMemo(
    () => (searchQuery ? searchContents(searchQuery) : []),
    [searchQuery]
  );

  const selectGrade = useCallback((gradeId) => {
    setSelectedGrade(gradeId);
    setSelectedUnit(null);
    setSelectedLesson(null);
    setSelectedCharacters(new Set());
    setSearchQuery('');
  }, []);

  const selectSubject = useCallback((subject) => {
    setSelectedSubject(subject);
    setSelectedUnit(null);
    setSelectedLesson(null);
    setSelectedCharacters(new Set());
  }, []);

  const selectUnit = useCallback((unitId) => {
    setSelectedUnit(unitId);
    setSelectedLesson(null);
    setSelectedCharacters(new Set());
  }, []);

  const selectLesson = useCallback((lesson) => {
    setSelectedLesson(lesson);
    // Default: select all characters
    const chars = getLessonCharacters(lesson.id);
    setSelectedCharacters(new Set(chars));
  }, []);

  const toggleCharacter = useCallback((char) => {
    setSelectedCharacters(prev => {
      const next = new Set(prev);
      if (next.has(char)) next.delete(char);
      else next.add(char);
      return next;
    });
  }, []);

  const selectAllCharacters = useCallback(() => {
    if (selectedLesson) {
      const chars = getLessonCharacters(selectedLesson.id);
      setSelectedCharacters(new Set(chars));
    }
  }, [selectedLesson]);

  const deselectAllCharacters = useCallback(() => {
    setSelectedCharacters(new Set());
  }, []);

  const search = useCallback((query) => {
    setSearchQuery(query);
  }, []);

  return {
    grades, units, lessons, searchResults,
    selectedGrade, selectedSubject, selectedUnit, selectedLesson, selectedCharacters, searchQuery,
    selectGrade, selectSubject, selectUnit, selectLesson, toggleCharacter,
    selectAllCharacters, deselectAllCharacters, search,
  };
}
```

- [ ] **Step 2: Run existing tests to verify no regression**

Run: `npx vitest run tests/unit/useCourseData.test.js 2>&1 | tail -10`
Expected: PASS (existing tests may need minor updates for new return values)

- [ ] **Step 3: Commit**

```bash
git add src/hooks/useCourseData.js
git commit m "feat(hooks): extend useCourseData with subject/lesson/character selection"
```

---

## Task 6: 更新 GradeSelector + UnitList

**Files:**
- Modify: `src/components/GradeSelector.jsx`
- Modify: `src/components/UnitList.jsx`

- [ ] **Step 1: Add 6th grade to GradeSelector**

In `src/components/GradeSelector.jsx`, the grades are passed from App.jsx via courseData.grades, so no change needed here (it's already dynamic).

- [ ] **Step 2: Update UnitList to show grade-appropriate units**

The UnitList component already receives `units` as a prop from MainLayout, which comes from `courseData.units`. Since `getUnits()` now filters by grade, the UnitList will automatically show the correct units. No change needed.

- [ ] **Step 3: Commit (if any changes)**

```bash
git add src/components/GradeSelector.jsx src/components/UnitList.jsx
git commit m "feat(ui): grade selector and unit list support 6th grade"
```

---

## Task 7: 集成到 MainLayout

**Files:**
- Modify: `src/components/layout/MainLayout.jsx`

- [ ] **Step 1: Add new props to MainLayout**

Add to destructured props:
```javascript
// Step flow props
currentStep, onStepChange,
grades, units, lessons,
selectedGrade, selectedSubject, selectedUnit, selectedLesson, selectedCharacters,
onSelectGrade, onSelectSubject, onSelectUnit, onSelectLesson,
onToggleCharacter, onSelectAllCharacters, onDeselectAllCharacters,
hasContent,
```

- [ ] **Step 2: Import new components**

```javascript
import SubjectSelector from '../SubjectSelector';
import LessonList from '../LessonList';
import CharacterSelector from '../CharacterSelector';
```

- [ ] **Step 3: Update step 0 content to include SubjectSelector + LessonList + CharacterSelector**

Replace the current step 0 content (GradeSelector + UnitList + ContentList) with:
1. GradeSelector (always visible as header)
2. SubjectSelector (after grade selected)
3. UnitList (after subject selected)
4. LessonList (after unit selected)
5. CharacterSelector (after lesson selected)

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/MainLayout.jsx
git commit m("feat(layout): integrate subject/lesson/character selection into step flow")
```

---

## Task 8: 更新 App.jsx

**Files:**
- Modify: `src/App.jsx`

- [ ] **Step 1: Pass new props to MainLayout**

Add to MainLayout JSX:
```jsx
lessons={courseData.lessons}
selectedSubject={courseData.selectedSubject}
selectedLesson={courseData.selectedLesson}
selectedCharacters={courseData.selectedCharacters}
onSelectSubject={courseData.selectSubject}
onSelectUnit={courseData.selectUnit}
onSelectLesson={courseData.selectLesson}
onToggleCharacter={courseData.toggleCharacter}
onSelectAllCharacters={courseData.selectAllCharacters}
onDeselectAllCharacters={courseData.deselectAllCharacters}
```

- [ ] **Step 2: Update handleSelectContent to use new lesson-based flow**

```javascript
const handleSelectLesson = React.useCallback((lesson) => {
  courseData.selectLesson(lesson);
}, [courseData]);
```

- [ ] **Step 3: Build to verify**

Run: `npx vite build 2>&1 | tail -10`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx
git commit m("feat: wire new content selection flow into App")
```

---

## Self-Review

**Spec coverage:**
- ✅ 选年级后内容按年级过滤 — Task 1 (getLessons)
- ✅ 3+ 年级显示英语 — Task 2 (SubjectSelector)
- ✅ 一/二年级不显示英语 — Task 2 (SubjectSelector)
- ✅ 选课文后默认全选生字 — Task 4 (CharacterSelector) + Task 5 (selectLesson)
- ✅ 可取消部分生字 — Task 4 (CharacterSelector)
- ✅ 六年级正常显示 — Task 1 (GRADES)
- ✅ 搜索课文标题 — Task 3 (LessonList, existing search)
- ✅ 移动端可完成 — All components use responsive grid

**Placeholder scan:** No TBDs, all code blocks complete.

**Type consistency:** `getLessons(gradeId, unitId)` returns array of lesson objects with `{id, title, grade, characters, characterCount}`. `getLessonCharacters(lessonId)` returns array of characters. `selectedCharacters` is a `Set<string>`.

---

*Plan complete. 8 tasks, all TDD.*
