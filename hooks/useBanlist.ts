
'use client';

import { useState, useEffect, useCallback } from 'react';

interface BannedUser {
  number: string;
  blockedAt?: string;
}

interface UseBanlistOptions {
  showToast?: (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export function useBanlist(options: UseBanlistOptions = {}) {
  const { showToast } = options;
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBannedUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/blocklist');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      
      if (data.success) {
        setBannedUsers(data.blocklist || []);
        setError(null);
      } else {
        throw new Error(data.error || 'Failed to fetch banned users');
      }
    } catch (err: any) {
      console.error('Banlist fetch error:', err);
      setError(err.message || 'Network error');
      showToast?.('Error', 'Failed to fetch banned users', 'error');
      setBannedUsers([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const refresh = useCallback(() => {
    setLoading(true);
    fetchBannedUsers();
  }, [fetchBannedUsers]);

  useEffect(() => {
    fetchBannedUsers();
  }, [fetchBannedUsers]);

  return {
    bannedUsers,
    loading,
    error,
    refresh
  };
}
