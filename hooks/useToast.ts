
'use client';

import { useState, useCallback, useRef } from 'react';
import { ToastMessage, ToastType } from '../lib/types';

let toastIdCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timeoutRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    const timeout = timeoutRefs.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutRefs.current.delete(id);
    }
    
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((title: string, message: string, type: ToastType = 'info') => {
    const id = `toast-${++toastIdCounter}`;
    const newToast: ToastMessage = {
      id,
      title,
      message,
      type
    };

    setToasts(prev => [...prev, newToast]);

    // Auto remove after 5 seconds
    const timeout = setTimeout(() => {
      removeToast(id);
    }, 5000);

    timeoutRefs.current.set(id, timeout);

    return id;
  }, [removeToast]);

  return {
    toasts,
    showToast,
    removeToast
  };
}
