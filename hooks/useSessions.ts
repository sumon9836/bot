
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
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!mountedRef.current) return;

      if (data.success && Array.isArray(data.data)) {
        setSessions(data.data);
        setError(null);
      } else {
        throw new Error(data.error || 'Invalid response format');
      }
    } catch (err: any) {
      if (!mountedRef.current) return;
      
      console.error('Sessions fetch error:', err);
      const errorMessage = err.message || 'Failed to fetch sessions';
      setError(errorMessage);
      
      if (showToast) {
        showToast('Sessions Error', errorMessage, 'error');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [showToast]);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchSessions();
  }, [fetchSessions]);

  useEffect(() => {
    mountedRef.current = true;
    fetchSessions();

    if (autoRefresh) {
      intervalRef.current = setInterval(fetchSessions, pollingInterval);
    }

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchSessions, autoRefresh, pollingInterval]);

  return {
    sessions,
    loading,
    error,
    refresh
  };
}
