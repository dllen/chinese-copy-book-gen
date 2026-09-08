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
