"use client"

import { useRef, useCallback } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  promise?: Promise<T>
}

interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  maxSize?: number // Maximum cache size
}

const DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes
const DEFAULT_MAX_SIZE = 100

export function useApiCache<T = any>(options: CacheOptions = {}) {
  const cache = useRef<Map<string, CacheEntry<T>>>(new Map())
  const { ttl = DEFAULT_TTL, maxSize = DEFAULT_MAX_SIZE } = options

  const isExpired = useCallback((entry: CacheEntry<T>) => {
    return Date.now() - entry.timestamp > ttl
  }, [ttl])

  const cleanup = useCallback(() => {
    const now = Date.now()
    const entries = Array.from(cache.current.entries())
    
    // Remove expired entries
    entries.forEach(([key, entry]) => {
      if (now - entry.timestamp > ttl) {
        cache.current.delete(key)
      }
    })

    // Remove oldest entries if cache is too large
    if (cache.current.size > maxSize) {
      const sortedEntries = entries
        .filter(([_, entry]) => !isExpired(entry))
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
      
      const toRemove = sortedEntries.slice(0, cache.current.size - maxSize)
      toRemove.forEach(([key]) => cache.current.delete(key))
    }
  }, [ttl, maxSize, isExpired])

  const get = useCallback((key: string): T | null => {
    const entry = cache.current.get(key)
    if (!entry) return null
    
    if (isExpired(entry)) {
      cache.current.delete(key)
      return null
    }
    
    return entry.data
  }, [isExpired])

  const set = useCallback((key: string, data: T) => {
    cleanup() // Clean up before adding new entry
    
    cache.current.set(key, {
      data,
      timestamp: Date.now()
    })
  }, [cleanup])

  const getOrSet = useCallback(async (
    key: string, 
    fetcher: () => Promise<T>,
    forceRefresh = false
  ): Promise<T> => {
    // Return cached data if available and not forcing refresh
    if (!forceRefresh) {
      const cached = get(key)
      if (cached !== null) {
        return cached
      }
    }

    // Check if there's already a pending request
    const entry = cache.current.get(key)
    if (entry?.promise) {
      return entry.promise
    }

    // Create new request
    const promise = fetcher().then(data => {
      set(key, data)
      return data
    }).catch(error => {
      // Remove failed promise from cache
      const currentEntry = cache.current.get(key)
      if (currentEntry?.promise === promise) {
        cache.current.delete(key)
      }
      throw error
    })

    // Store promise in cache to prevent duplicate requests
    cache.current.set(key, {
      data: null as any, // Will be updated when promise resolves
      timestamp: Date.now(),
      promise
    })

    return promise
  }, [get, set])

  const invalidate = useCallback((key: string) => {
    cache.current.delete(key)
  }, [])

  const clear = useCallback(() => {
    cache.current.clear()
  }, [])

  const getStats = useCallback(() => {
    const now = Date.now()
    const entries = Array.from(cache.current.values())
    const validEntries = entries.filter(entry => !isExpired(entry))
    
    return {
      size: cache.current.size,
      validSize: validEntries.length,
      expiredSize: entries.length - validEntries.length,
      oldestEntry: validEntries.length > 0 
        ? Math.min(...validEntries.map(e => e.timestamp))
        : null
    }
  }, [isExpired])

  return {
    get,
    set,
    getOrSet,
    invalidate,
    clear,
    getStats
  }
}

export default useApiCache
