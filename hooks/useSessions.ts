
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Session } from '../lib/types';

interface UseSessionsOptions {
  pollingInterval?: number;
  autoRefresh?: boolean;
  showToast?: (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export function useSessions(options: UseSessionsOptions = {}) {
  const { pollingInterval = 15000, autoRefresh = true, showToast } = options;
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const fetchSessions = useCallback(async () => {
    try {
      const response = await fetch('/api/sessions');
      const data = await response.json();

      if (!mountedRef.current) return;

      if (data.success) {
        setSessions(data.sessions || []);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch sessions');
        showToast?.('Error', data.error || 'Failed to fetch sessions', 'error');
      }
    } catch (err: any) {
      if (!mountedRef.current) return;
      
      const errorMessage = err.message || 'Network error occurred';
      setError(errorMessage);
      showToast?.('Network Error', errorMessage, 'error');
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [showToast]);

  const refreshSessions = useCallback(() => {
    setLoading(true);
    fetchSessions();
  }, [fetchSessions]);

  // Initial fetch
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Auto refresh polling
  useEffect(() => {
    if (autoRefresh && pollingInterval > 0) {
      intervalRef.current = setInterval(fetchSessions, pollingInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, pollingInterval, fetchSessions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    sessions,
    loading,
    error,
    refreshSessions
  };
}
