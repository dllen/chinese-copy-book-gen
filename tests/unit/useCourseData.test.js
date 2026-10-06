import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCourseData } from '../../src/hooks/useCourseData';

describe('useCourseData', () => {
  it('returns 6 grades on mount', () => {
    const { result } = renderHook(() => useCourseData());
    expect(result.current.grades).toHaveLength(6);
  });

  it('selects grade and loads units', () => {
    const { result } = renderHook(() => useCourseData());
    act(() => result.current.selectGrade('g1'));
    expect(result.current.selectedGrade).toBe('g1');
    expect(result.current.units.length).toBeGreaterThan(0);
  });

  it('auto-selects the first unit when a grade is chosen', () => {
    const { result } = renderHook(() => useCourseData());
    act(() => result.current.selectGrade('g1'));
    // 第一个单元被自动选中，课文列表无需额外点击即可加载
    expect(result.current.selectedUnit).toBe(result.current.units[0].id);
    expect(result.current.lessons.length).toBeGreaterThan(0);
  });

  it('auto-selects the first unit of the new subject', () => {
    const { result } = renderHook(() => useCourseData());
    act(() => result.current.selectGrade('g3'));
    act(() => result.current.selectSubject('英语'));
    expect(result.current.selectedUnit).toBe(result.current.units[0].id);
  });

  it('selects unit and loads lessons', () => {
    const { result } = renderHook(() => useCourseData());
    act(() => result.current.selectGrade('g1'));
    act(() => result.current.selectUnit('shengzi'));
    expect(result.current.lessons.length).toBeGreaterThan(0);
  });

  it('search returns filtered results', () => {
    const { result } = renderHook(() => useCourseData());
    act(() => result.current.search('天地人'));
    expect(result.current.searchResults.length).toBeGreaterThan(0);
  });

  it('changing subject resets to the first unit of the new subject', () => {
    const { result } = renderHook(() => useCourseData());
    act(() => result.current.selectGrade('g1'));
    act(() => result.current.selectUnit('shengzi'));
    act(() => result.current.selectSubject('英语'));
    // 学科变化后不再停留旧单元，自动落到新学科的第一个单元
    expect(result.current.selectedUnit).not.toBe('shengzi');
    expect(result.current.selectedUnit).toBe(result.current.units[0].id);
  });

  it('selecting lesson selects all characters by default', () => {
    const { result } = renderHook(() => useCourseData());
    act(() => result.current.selectGrade('g1'));
    act(() => result.current.selectUnit('shengzi'));
    const lesson = result.current.lessons[0];
    if (lesson) {
      act(() => result.current.selectLesson(lesson));
      expect(result.current.selectedCharacters.size).toBeGreaterThan(0);
    }
  });

  it('toggle character works', () => {
    const { result } = renderHook(() => useCourseData());
    act(() => result.current.selectGrade('g1'));
    act(() => result.current.selectUnit('shengzi'));
    const lesson = result.current.lessons[0];
    if (lesson) {
      act(() => result.current.selectLesson(lesson));
      const initialCount = result.current.selectedCharacters.size;
      const char = [...result.current.selectedCharacters][0];
      act(() => result.current.toggleCharacter(char));
      expect(result.current.selectedCharacters.size).toBe(initialCount - 1);
    }
  });
});
