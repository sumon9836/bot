'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface BannedUser {
  number: string;
  blockedAt?: string;
}

interface UseBanlistOptions {
  pollingInterval?: number;
  autoRefresh?: boolean;
  showToast?: (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export function useBanlist(options: UseBanlistOptions = {}) {
  const { pollingInterval = 30000, autoRefresh = true, showToast } = options;
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const fetchBanlist = useCallback(async () => {
    try {
      const response = await fetch('/api/blocklist');
      const data = await response.json();

      if (!mountedRef.current) return;

      if (data.success) {
        setBannedUsers(data.blocklist || []);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch banned users');
        showToast?.('Error', data.error || 'Failed to fetch banned users', 'error');
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

  const refreshBanlist = useCallback(() => {
    setLoading(true);
    fetchBanlist();
  }, [fetchBanlist]);

  // Initial fetch
  useEffect(() => {
    fetchBanlist();
  }, [fetchBanlist]);

  // Auto refresh polling
  useEffect(() => {
    if (autoRefresh && pollingInterval > 0) {
      intervalRef.current = setInterval(fetchBanlist, pollingInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefresh, pollingInterval, fetchBanlist]);

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
    bannedUsers,
    loading,
    error,
    refreshBanlist
  };
}