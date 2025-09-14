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
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const mountedRef = useRef(true);

  const fetchSessions = useCallback(async (showLoadingState = true) => {
    if (!mountedRef.current) return;
    
    if (showLoadingState) {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetch('/api/sessions');
      const data = await response.json();

      if (!mountedRef.current) return;
      
      if (response.ok) {
        // Handle different response formats
        let sessionList: Session[] = [];
        
        if (Array.isArray(data)) {
          sessionList = data;
        } else if (data.data && Array.isArray(data.data)) {
          sessionList = data.data;
        } else if (data.sessions && Array.isArray(data.sessions)) {
          sessionList = data.sessions;
        } else if (data.data && Array.isArray(data.data.active) && data.data.status) {
          // Handle backend format: {success: true, data: {active: [...], status: {...}}}
          const { active, status } = data.data;
          sessionList = active.map((number: string) => ({
            id: number,
            number: number,
            status: status[number]?.connected ? 'Connected' : 'Disconnected',
            lastSeen: status[number]?.lastSeen,
            platform: status[number]?.platform || 'WhatsApp',
            user: status[number]?.user !== 'unknown' ? status[number]?.user : undefined
          }));
        } else if (Array.isArray(data.active) && data.status) {
          // Handle direct backend format: {active: [...], status: {...}}
          const { active, status } = data;
          sessionList = active.map((number: string) => ({
            id: number,
            number: number,
            status: status[number]?.connected ? 'Connected' : 'Disconnected',
            lastSeen: status[number]?.lastSeen,
            platform: status[number]?.platform || 'WhatsApp',
            user: status[number]?.user !== 'unknown' ? status[number]?.user : undefined
          }));
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
      if (!mountedRef.current) return;
      
      const errorMessage = 'Failed to fetch sessions';
      setError(errorMessage);
      if (showLoadingState) {
        showToast?.('Network Error', errorMessage, 'error');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [showToast]);

  const refreshSessions = useCallback(() => {
    fetchSessions(true);
  }, [fetchSessions]);

  useEffect(() => {
    mountedRef.current = true;
    fetchSessions(true);

    if (autoRefresh && pollingInterval > 0) {
      intervalRef.current = setInterval(() => {
        if (mountedRef.current) {
          fetchSessions(false); // Silent refresh
        }
      }, pollingInterval);
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
    refreshSessions,
    sessionsCount: sessions.length
  };
}