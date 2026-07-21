import { useState, useCallback, useRef } from 'react';

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    clearTimeout(timersRef.current[id]);
    delete timersRef.current[id];
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback(({ type = 'info', message, duration, action }) => {
    const id = ++toastId;
    const durations = { success: 2000, info: 2000, warning: 3000, error: 4000, progress: Infinity };
    const dur = duration ?? durations[type] ?? 2000;
    const safeType = durations[type] !== undefined ? type : 'info';

    setToasts(prev => [...prev, { id, type: safeType, message, action }]);

    if (dur !== Infinity) {
      timersRef.current[id] = setTimeout(() => {
        removeToast(id);
      }, dur);
    }

    return id;
  }, [removeToast]);

  const toast = {
    success: (msg, opts) => addToast({ type: 'success', message: msg, ...opts }),
    error: (msg, opts) => addToast({ type: 'error', message: msg, ...opts }),
    warn: (msg, opts) => addToast({ type: 'warning', message: msg, ...opts }),
    info: (msg, opts) => addToast({ type: 'info', message: msg, ...opts }),
    progress: (msg, action) => addToast({ type: 'progress', message: msg, action }),
  };

  return { toasts, toast, removeToast };
}
