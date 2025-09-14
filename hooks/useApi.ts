'use client';

import { useState, useCallback } from 'react';
import { ApiResponse } from '../lib/types';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  showToast?: (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = useCallback(async <T = any>(
    endpoint: string,
    options: RequestInit & UseApiOptions = {}
  ): Promise<ApiResponse<T>> => {
    const { onSuccess, onError, showToast, ...fetchOptions } = options;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(endpoint, {
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
        ...fetchOptions,
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error || data.message || `HTTP ${response.status}`;
        setError(errorMessage);
        onError?.(errorMessage);
        showToast?.('Request Failed', errorMessage, 'error');
        return { success: false, error: errorMessage };
      }

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