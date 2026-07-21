import { useState, useCallback } from 'react';

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', message, duration, action }) => {
    const id = ++toastId;
    const durations = { success: 2000, info: 2000, warning: 3000, error: 4000, progress: Infinity };
    const dur = duration ?? durations[type] ?? 2000;

    setToasts(prev => [...prev, { id, type, message, action }]);

    if (dur !== Infinity) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, dur);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg, opts) => addToast({ type: 'success', message: msg, ...opts }),
    error: (msg, opts) => addToast({ type: 'error', message: msg, ...opts }),
    warn: (msg, opts) => addToast({ type: 'warning', message: msg, ...opts }),
    info: (msg, opts) => addToast({ type: 'info', message: msg, ...opts }),
    progress: (msg, action) => addToast({ type: 'progress', message: msg, action }),
  };

  return { toasts, toast, removeToast };
}
