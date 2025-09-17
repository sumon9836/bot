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
  }, [removeToast]);

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
'use client';

import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((title: string, message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, title, message, type };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return {
    toasts,
    showToast,
    removeToast
  };
}
