import { useEffect } from 'react';

export function useKeyboardShortcut(key, handler, options = {}) {
  useEffect(() => {
    const listener = (e) => {
      if (e.key !== key) return;
      if (options.ctrl && !e.ctrlKey) return;
      if (options.shift && !e.shiftKey) return;
      if (options.alt && !e.altKey) return;
      if (options.preventDefault !== false) e.preventDefault();
      handler(e);
    };
    document.addEventListener('keydown', listener);
    return () => document.removeEventListener('keydown', listener);
  }, [key, handler, options]);
}
