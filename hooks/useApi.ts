
'use client';

import { useState, useCallback } from 'react';
import { ApiResponse } from '../lib/types';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  showToast?: (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
  method?: string;
  headers?: Record<string, string>;
  body?: string;
}

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = useCallback(async (endpoint: string, options: UseApiOptions = {}): Promise<ApiResponse> => {
    const { onSuccess, onError, showToast, method = 'GET', headers = {}, body } = options;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      setError(null);
      onSuccess?.(data);
      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error';
      setError(errorMessage);
      onError?.(errorMessage);
      showToast?.('Network Error', 'Failed to connect to server', 'error');
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const get = useCallback((endpoint: string, options?: UseApiOptions) => 
    apiCall(endpoint, { ...options, method: 'GET' }), [apiCall]);

  const post = useCallback((endpoint: string, data?: any, options?: UseApiOptions) =>
    apiCall(endpoint, { 
      ...options, 
      method: 'POST', 
      body: data ? JSON.stringify(data) : undefined 
    }), [apiCall]);

  const put = useCallback((endpoint: string, data?: any, options?: UseApiOptions) =>
    apiCall(endpoint, { 
      ...options, 
      method: 'PUT', 
      body: data ? JSON.stringify(data) : undefined 
    }), [apiCall]);

  const del = useCallback((endpoint: string, options?: UseApiOptions) =>
    apiCall(endpoint, { ...options, method: 'DELETE' }), [apiCall]);

  return {
    loading,
    error,
    apiCall,
    get,
    post,
    put,
    del
  };
}
