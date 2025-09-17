
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
      console.log('Sessions API response:', data);
      
      if (!mountedRef.current) return;

      // Handle different response formats
      let sessionsData: Session[] = [];

      if (data && typeof data === 'object') {
        if (data.success === true && Array.isArray(data.data)) {
          sessionsData = data.data;
        } else if (data.success === true && data.data && typeof data.data === 'object') {
          // Convert object to array if needed
          sessionsData = Object.keys(data.data).map(key => ({
            id: key,
            number: data.data[key].number || key,
            status: data.data[key].status || 'active',
            lastSeen: data.data[key].lastSeen || data.data[key].connectedAt,
            platform: data.data[key].platform || data.data[key].deviceInfo,
            user: data.data[key].user
          }));
        } else if (Array.isArray(data)) {
          sessionsData = data;
        } else if (typeof data === 'object' && !data.success) {
          // Direct object response - convert to array
          sessionsData = Object.keys(data).map(key => ({
            id: key,
            number: data[key].number || key,
            status: data[key].status || 'active',
            lastSeen: data[key].lastSeen || data[key].connectedAt,
            platform: data[key].platform || data[key].deviceInfo,
            user: data[key].user
          }));
        } else {
          console.warn('Unexpected sessions data format:', data);
          sessionsData = [];
        }
      }

      setSessions(sessionsData);
      setError(null);
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
