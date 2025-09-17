
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseBanlistOptions {
  pollingInterval?: number;
  autoRefresh?: boolean;
  showToast?: (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export function useBanlist(options: UseBanlistOptions = {}) {
  const { pollingInterval = 30000, autoRefresh = true, showToast } = options;
  const [bannedUsers, setBannedUsers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const fetchBanlist = useCallback(async () => {
    try {
      const response = await fetch('/api/blocklist');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!mountedRef.current) return;

      if (data.success) {
        setBannedUsers(data.data || {});
        setError(null);
      } else {
        throw new Error(data.error || 'Failed to fetch banlist');
      }
    } catch (err: any) {
      if (!mountedRef.current) return;
      
      console.error('Banlist fetch error:', err);
      const errorMessage = err.message || 'Failed to fetch banned users';
      setError(errorMessage);
      
      if (showToast) {
        showToast('Banlist Error', errorMessage, 'error');
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
    fetchBanlist();
  }, [fetchBanlist]);

  useEffect(() => {
    mountedRef.current = true;
    fetchBanlist();

    if (autoRefresh) {
      intervalRef.current = setInterval(fetchBanlist, pollingInterval);
    }

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchBanlist, autoRefresh, pollingInterval]);

  return {
    bannedUsers,
    loading,
    error,
    refresh
  };
}
