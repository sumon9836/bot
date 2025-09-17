
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
  const isPollingRef = useRef(false);

  const fetchSessions = useCallback(async () => {
    try {
      const response = await fetch('/api/sessions');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      
      if (data.success) {
        setSessions(data.sessions || []);
        setError(null);
      } else {
        throw new Error(data.error || 'Failed to fetch sessions');
      }
    } catch (err: any) {
      console.error('Sessions fetch error:', err);
      setError(err.message || 'Network error');
      showToast?.('Error', 'Failed to fetch sessions', 'error');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchSessions();
  }, [fetchSessions]);

  const startPolling = useCallback(() => {
    if (isPollingRef.current || !autoRefresh) return;
    
    isPollingRef.current = true;
    intervalRef.current = setInterval(fetchSessions, pollingInterval);
  }, [fetchSessions, pollingInterval, autoRefresh]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    isPollingRef.current = false;
  }, []);

  useEffect(() => {
    fetchSessions();
    if (autoRefresh) {
      startPolling();
    }

    return () => stopPolling();
  }, [fetchSessions, autoRefresh, startPolling, stopPolling]);

  return {
    sessions,
    loading,
    error,
    refresh,
    startPolling,
    stopPolling
  };
}
