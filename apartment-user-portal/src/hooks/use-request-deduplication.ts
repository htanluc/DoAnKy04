"use client"

import { useCallback, useRef, useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'

interface UseRequestDeduplicationOptions {
  endpoint: string
  options?: RequestInit
  useCache?: boolean
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
}

export function useRequestDeduplication() {
  const requestIdRef = useRef<string | null>(null)

  const makeRequest = useCallback(async <T>(
    endpoint: string,
    options: RequestInit = {},
    useCache = true
  ): Promise<T> => {
    try {
      // const result = await apiClient.request<T>(endpoint, options, useCache)
      throw new Error('Request deduplication disabled')
    } catch (error) {
      console.error(`Request failed for ${endpoint}:`, error)
      throw error
    }
  }, [])

  const batchRequest = useCallback(async <T>(
    requests: Array<{ endpoint: string; options?: RequestInit }>
  ): Promise<T[]> => {
    try {
      const results = await apiClient.batchRequest<T>(requests)
      return results
    } catch (error) {
      console.error('Batch request failed:', error)
      throw error
    }
  }, [])

  const preloadData = useCallback(async () => {
    try {
      const results = await apiClient.preloadCriticalData()
      console.log('Preloaded critical data:', results)
      return results
    } catch (error) {
      console.error('Preload failed:', error)
      throw error
    }
  }, [])

  const getCacheStats = useCallback(() => {
    return apiClient.getCacheStats()
  }, [])

  const clearCache = useCallback((pattern?: string) => {
    apiClient.invalidateCache(pattern)
  }, [])

  const clearPendingRequests = useCallback(() => {
    apiClient.clearPendingRequests()
  }, [])

  // Auto-preload on mount
  useEffect(() => {
    preloadData().catch(console.error)
  }, [preloadData])

  return {
    makeRequest,
    batchRequest,
    preloadData,
    getCacheStats,
    clearCache,
    clearPendingRequests,
    requestId: requestIdRef.current
  }
}

// Hook for specific endpoint with automatic deduplication
export function useEndpoint<T>(
  endpoint: string,
  options: RequestInit = {},
  useCache = true
) {
  const { makeRequest } = useRequestDeduplication()

  const fetchData = useCallback(async (): Promise<T> => {
    return makeRequest<T>(endpoint, options, useCache)
  }, [endpoint, options, useCache, makeRequest])

  return { fetchData }
}

// Hook for real-time cache monitoring
export function useCacheMonitor(interval = 2000) {
  const { getCacheStats } = useRequestDeduplication()
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    const updateStats = () => {
      try {
        const currentStats = getCacheStats()
        setStats(currentStats)
      } catch (error) {
        console.error('Error getting cache stats:', error)
      }
    }

    updateStats()
    const intervalId = setInterval(updateStats, interval)
    
    return () => clearInterval(intervalId)
  }, [getCacheStats, interval])

  return stats
}
