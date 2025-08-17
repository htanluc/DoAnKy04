import { useState, useEffect, useCallback } from 'react';
import { userDataService, UserData } from '../lib/user-data-service';

interface UseUserDataReturn {
  userData: UserData | null;
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  clearCache: () => void;
  cacheStats: any;
}

export function useUserData(userId: string, autoFetch: boolean = true): UseUserDataReturn {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = useCallback(async (forceRefresh: boolean = false) => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await userDataService.getUserData(userId, forceRefresh);
      setUserData(data);
      console.log(`✅ User data loaded for user ${userId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user data';
      setError(errorMessage);
      console.error(`❌ Error loading user data for user ${userId}:`, err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const refreshData = useCallback(async () => {
    await fetchUserData(true);
  }, [fetchUserData]);

  const clearCache = useCallback(() => {
    userDataService.clearUserCache(userId);
    setUserData(null);
    console.log(`🗑️ Cache cleared for user ${userId}`);
  }, [userId]);

  // Auto-fetch data when component mounts
  useEffect(() => {
    if (autoFetch && userId) {
      fetchUserData();
    }
  }, [autoFetch, userId, fetchUserData]);

  // Get cache stats
  const cacheStats = userDataService.getCacheStats();

  return {
    userData,
    isLoading,
    error,
    refreshData,
    clearCache,
    cacheStats
  };
}

// Hook để quản lý dữ liệu user với auto-refresh
export function useUserDataWithAutoRefresh(
  userId: string, 
  refreshInterval: number = 5 * 60 * 1000 // 5 phút
): UseUserDataReturn & { lastUpdated: Date | null } {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const baseHook = useUserData(userId, false);

  // Auto-refresh logic
  useEffect(() => {
    if (!userId || refreshInterval <= 0) return;

    const interval = setInterval(async () => {
      console.log(`🔄 Auto-refreshing user data for user ${userId}`);
      await baseHook.refreshData();
      setLastUpdated(new Date());
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [userId, refreshInterval, baseHook.refreshData]);

  // Update lastUpdated when data changes
  useEffect(() => {
    if (baseHook.userData) {
      setLastUpdated(new Date());
    }
  }, [baseHook.userData]);

  return {
    ...baseHook,
    lastUpdated
  };
}

// Hook để quản lý dữ liệu user với real-time updates
export function useUserDataRealTime(
  userId: string,
  realTimeTypes: string[] = ['announcements', 'events', 'notifications']
): UseUserDataReturn & { 
  realTimeData: Partial<UserData>;
  subscribeToUpdates: (type: string) => void;
  unsubscribeFromUpdates: (type: string) => void;
} {
  const [realTimeData, setRealTimeData] = useState<Partial<UserData>>({});
  const baseHook = useUserData(userId, true);

  // Subscribe to real-time updates
  const subscribeToUpdates = useCallback((type: string) => {
    if (!realTimeTypes.includes(type)) return;

    // Trong thực tế, bạn sẽ sử dụng WebSocket hoặc Server-Sent Events
    console.log(`📡 Subscribed to real-time updates for ${type}`);
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        ...prev,
        [type]: baseHook.userData?.[type as keyof UserData] || []
      }));
    }, 30000); // 30 giây

    return () => clearInterval(interval);
  }, [realTimeTypes, baseHook.userData]);

  const unsubscribeFromUpdates = useCallback((type: string) => {
    console.log(`📡 Unsubscribed from real-time updates for ${type}`);
  }, []);

  // Auto-subscribe to updates when data changes
  useEffect(() => {
    if (baseHook.userData) {
      realTimeTypes.forEach(type => {
        setRealTimeData(prev => ({
          ...prev,
          [type]: baseHook.userData?.[type as keyof UserData] || []
        }));
      }));
    }
  }, [baseHook.userData, realTimeTypes]);

  return {
    ...baseHook,
    realTimeData,
    subscribeToUpdates,
    unsubscribeFromUpdates
  };
}
