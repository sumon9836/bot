'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useApi } from './useApi';
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
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const abortControllerRef = useRef<AbortController>();
  const { get } = useApi();

  const fetchSessions = useCallback(async (showLoadingState = true) => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    
    if (showLoadingState) {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetch('/api/sessions', {
        signal: abortControllerRef.current.signal,
      });

      const data = await response.json();

      if (response.ok) {
        // Handle different response formats
        let sessionList: Session[] = [];
        
        if (Array.isArray(data)) {
          sessionList = data;
        } else if (data.data && Array.isArray(data.data)) {
          sessionList = data.data;
        } else if (data.sessions && Array.isArray(data.sessions)) {
          sessionList = data.sessions;
        } else if (typeof data === 'object' && data !== null) {
          // Convert object to array (for cases where sessions are returned as an object)
          sessionList = Object.keys(data).map(key => ({
            id: key,
            number: key,
            status: data[key].status || 'active',
            lastSeen: data[key].lastSeen,
            platform: data[key].platform
          }));
        }

        setSessions(sessionList);
        setError(null);
      } else {
        const errorMessage = data.error || data.message || 'Failed to fetch sessions';
        setError(errorMessage);
        if (showLoadingState) {
          showToast?.('Failed to Load Sessions', errorMessage, 'error');
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        const errorMessage = 'Failed to fetch sessions';
        setError(errorMessage);
        if (showLoadingState) {
          showToast?.('Network Error', errorMessage, 'error');
        }
      }
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const refreshSessions = useCallback(() => {
    fetchSessions(true);
  }, [fetchSessions]);

  useEffect(() => {
    fetchSessions(true);

    if (autoRefresh && pollingInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchSessions(false); // Silent refresh
      }, pollingInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchSessions, autoRefresh, pollingInterval]);

  return {
    sessions,
    loading,
    error,
    refreshSessions,
    sessionsCount: sessions.length
  };
}