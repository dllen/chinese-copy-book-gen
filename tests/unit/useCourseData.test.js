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

  it('changing subject resets unit', () => {
    const { result } = renderHook(() => useCourseData());
    act(() => result.current.selectGrade('g1'));
    act(() => result.current.selectUnit('shengzi'));
    act(() => result.current.selectSubject('英语'));
    expect(result.current.selectedUnit).toBeNull();
  });
});
