'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { BannedUser } from '../lib/types';

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
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const abortControllerRef = useRef<AbortController>();

  const fetchBanlist = useCallback(async (showLoadingState = true) => {
    // Cancel previous request silently
    if (abortControllerRef.current) {
      // Just replace the controller, don't abort the old one
    }

    abortControllerRef.current = new AbortController();
    
    if (showLoadingState) {
      setLoading(true);
    }
    setError(null);

    try {
      const response = await fetch('/api/blocklist', {
        signal: abortControllerRef.current.signal,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        setBannedUsers([]);
        return;
      }

      const responseText = await response.text();
      
      // Check if response starts with HTML
      if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
        setBannedUsers([]);
        return;
      }

      const data = JSON.parse(responseText);

      if (data.error) {
        throw new Error(data.error);
      }

      // Handle different response formats
      let userList: BannedUser[] = [];
      
      if (Array.isArray(data)) {
        userList = data.map(user => ({
          number: typeof user === 'string' ? user : user.number,
          blockedAt: user.blockedAt || user.timestamp
        }));
      } else if (data.data && Array.isArray(data.data)) {
        userList = data.data.map((user: any) => ({
          number: typeof user === 'string' ? user : user.number,
          blockedAt: user.blockedAt || user.timestamp
        }));
      } else if (typeof data === 'object' && data !== null) {
        // Convert object to array (for cases where banlist is returned as an object)
        userList = Object.keys(data).map(number => ({
          number,
          blockedAt: data[number].blockedAt || data[number].timestamp || new Date().toISOString()
        }));
      }

      setBannedUsers(userList);
      setError(null);
    } catch (err) {
      if (err && (err as Error).name !== 'AbortError') {
        // If it's a JSON parse error, show empty state instead of error
        if ((err as Error).message.includes('Unexpected token') || (err as Error).message.includes('JSON')) {
          setBannedUsers([]);
        } else {
          const errorMessage = 'Failed to fetch banlist';
          setError(errorMessage);
          if (showLoadingState) {
            showToast?.('Failed to Load Banlist', errorMessage, 'error');
          }
        }
      }
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const refreshBanlist = useCallback(() => {
    fetchBanlist(true);
  }, [fetchBanlist]);

  useEffect(() => {
    fetchBanlist(true);

    if (autoRefresh && pollingInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchBanlist(false); // Silent refresh
      }, pollingInterval);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
      // Just clear the ref, don't call abort during cleanup to avoid React errors
      abortControllerRef.current = undefined;
    };
  }, [fetchBanlist, autoRefresh, pollingInterval]);

  return {
    bannedUsers,
    loading,
    error,
    refreshBanlist,
    bannedCount: bannedUsers.length
  };
}