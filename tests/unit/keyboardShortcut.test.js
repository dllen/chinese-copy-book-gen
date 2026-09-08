import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKeyboardShortcut } from '../../src/hooks/useKeyboardShortcut';

describe('useKeyboardShortcut', () => {
  it('calls handler when key is pressed', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcut('g', handler));
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'g' }));
    });
    expect(handler).toHaveBeenCalled();
  });

  it('does not call handler for other keys', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcut('g', handler));
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'x' }));
    });
    expect(handler).not.toHaveBeenCalled();
  });

  it('supports modifier keys', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcut('Enter', handler, { ctrl: true }));
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: true }));
    });
    expect(handler).toHaveBeenCalled();
  });

  it('does not trigger without modifier when required', () => {
    const handler = vi.fn();
    renderHook(() => useKeyboardShortcut('Enter', handler, { ctrl: true }));
    act(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', ctrlKey: false }));
    });
    expect(handler).not.toHaveBeenCalled();
  });
});
