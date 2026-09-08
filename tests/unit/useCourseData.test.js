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

  it('changing subject resets unit', () => {
    const { result } = renderHook(() => useCourseData());
    act(() => result.current.selectGrade('g1'));
    act(() => result.current.selectUnit('shengzi'));
    act(() => result.current.selectSubject('英语'));
    expect(result.current.selectedUnit).toBeNull();
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
