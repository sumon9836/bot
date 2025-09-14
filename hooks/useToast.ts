'use client';

import { useState, useCallback, useRef } from 'react';
import { ToastMessage, ToastType } from '../lib/types';

let toastIdCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timeoutRefs = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const showToast = useCallback((title: string, message: string, type: ToastType = 'success', duration: number = 4000) => {
    const id = `toast-${++toastIdCounter}`;
    
    const toast: ToastMessage = {
      id,
      title,
      message,
      type,
      duration
    };

    setToasts(prev => [...prev, toast]);

    // Auto-remove toast after duration
    const timeout = setTimeout(() => {
      removeToast(id);
    }, duration);

    timeoutRefs.current.set(id, timeout);

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    const timeout = timeoutRefs.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutRefs.current.delete(id);
    }
    
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const removeAllToasts = useCallback(() => {
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current.clear();
    setToasts([]);
  }, []);

  return {
    toasts,
    showToast,
    removeToast,
    removeAllToasts
  };
}