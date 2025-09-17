
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
    const toast: ToastMessage = { id, title, message, type };
    
    setToasts(prev => [...prev, toast]);
    
    // Auto-remove after 5 seconds
    const timeout = setTimeout(() => {
      removeToast(id);
    }, 5000);
    
    timeoutRefs.current.set(id, timeout);
    
    return id;
  }, [removeToast]);

  const clearAllToasts = useCallback(() => {
    // Clear all timeouts
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current.clear();
    
    // Clear all toasts
    setToasts([]);
  }, []);

  return {
    toasts,
    showToast,
    removeToast,
    clearAllToasts
  };
}
