
import { useState, useEffect, useCallback } from 'react';
import { useConnectionStatus } from './useConnectionStatus';

interface OfflineDataOptions {
  key: string;
  fetcher: () => Promise<any>;
  enabled?: boolean;
  staleTime?: number;
}

export const useOfflineData = <T>({
  key,
  fetcher,
  enabled = true,
  staleTime = 5 * 60 * 1000 // 5 minutes
}: OfflineDataOptions) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isStale, setIsStale] = useState(false);
  const { isSupabaseConnected } = useConnectionStatus();

  // Cache data in Service Worker
  const cacheData = useCallback(async (data: T) => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'CACHE_DATA',
        key,
        data: {
          value: data,
          timestamp: Date.now()
        }
      });
    }
    
    // Also cache in localStorage as fallback
    try {
      localStorage.setItem(`offline_${key}`, JSON.stringify({
        value: data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Failed to cache in localStorage:', error);
    }
  }, [key]);

  // Retrieve cached data
  const getCachedData = useCallback(async (): Promise<{ value: T; timestamp: number } | null> => {
    // Try Service Worker first
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      try {
        const messageChannel = new MessageChannel();
        
        return new Promise((resolve) => {
          messageChannel.port1.onmessage = (event) => {
            resolve(event.data.data);
          };
          
          navigator.serviceWorker.controller!.postMessage(
            { type: 'GET_CACHED_DATA', key },
            [messageChannel.port2]
          );
          
          // Timeout after 1 second
          setTimeout(() => resolve(null), 1000);
        });
      } catch (error) {
        console.warn('Failed to get data from Service Worker:', error);
      }
    }
    
    // Fallback to localStorage
    try {
      const cached = localStorage.getItem(`offline_${key}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn('Failed to get data from localStorage:', error);
      return null;
    }
  }, [key]);

  // Fetch fresh data
  const fetchData = useCallback(async () => {
    if (!enabled) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (isSupabaseConnected) {
        // Online: fetch fresh data
        console.log(`🌐 Fetching fresh data for ${key}...`);
        const freshData = await fetcher();
        setData(freshData);
        setIsStale(false);
        await cacheData(freshData);
      } else {
        // Offline: use cached data
        console.log(`📱 Loading cached data for ${key}...`);
        const cached = await getCachedData();
        
        if (cached) {
          const isDataStale = Date.now() - cached.timestamp > staleTime;
          setData(cached.value);
          setIsStale(isDataStale);
          
          if (isDataStale) {
            console.log(`⚠️ Cached data for ${key} is stale`);
          }
        } else {
          setData(null);
          setError(new Error('No cached data available offline'));
        }
      }
    } catch (err) {
      console.error(`❌ Error fetching data for ${key}:`, err);
      
      // If online fetch fails, try cached data
      const cached = await getCachedData();
      if (cached) {
        setData(cached.value);
        setIsStale(true);
        setError(new Error('Using cached data due to network error'));
      } else {
        setError(err as Error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, enabled, isSupabaseConnected, staleTime, cacheData, getCachedData]);

  // Refresh data
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Effect to load data initially and when connection status changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Listen for connection changes to refresh when coming back online
  useEffect(() => {
    if (isSupabaseConnected && data && isStale) {
      console.log(`🔄 Connection restored, refreshing stale data for ${key}`);
      fetchData();
    }
  }, [isSupabaseConnected, isStale, key, fetchData, data]);

  return {
    data,
    isLoading,
    error,
    isStale,
    isOffline: !isSupabaseConnected,
    refresh
  };
};
