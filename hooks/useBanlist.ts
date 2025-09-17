
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
      const response = await fetch('/api/blocklist', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Banlist API response:', data);
      
      if (!mountedRef.current) return;

      // Handle different response formats
      let banlistData: Record<string, any> = {};

      if (data && typeof data === 'object') {
        if (data.success === false) {
          throw new Error(data.error || 'Failed to fetch banlist');
        } else if (data.success === true) {
          banlistData = data.data || {};
        } else if (typeof data === 'object' && !data.hasOwnProperty('success')) {
          // Direct object response
          banlistData = data;
        } else {
          console.warn('Unexpected banlist data format:', data);
          banlistData = {};
        }
      }

      setBannedUsers(banlistData);
      setError(null);
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
