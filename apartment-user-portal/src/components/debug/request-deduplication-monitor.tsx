"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RefreshCw, Database, Activity, Clock, Zap, AlertCircle } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

export default function RequestDeduplicationMonitor() {
  const [stats, setStats] = useState<any>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setIsVisible(true)
      updateStats()
      
      // Update stats every 2 seconds
      const interval = setInterval(updateStats, 2000)
      return () => clearInterval(interval)
    }
  }, [])

  const updateStats = () => {
    try {
      const currentStats = apiClient.getCacheStats()
      setStats(currentStats)
    } catch (error) {
      console.error('Error getting cache stats:', error)
    }
  }

  const clearCache = () => {
    apiClient.invalidateCache()
    updateStats()
  }

  const clearPendingRequests = () => {
    apiClient.clearPendingRequests()
    updateStats()
  }

  if (!isVisible || !stats) return null

  return (
    <div className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 border border-gray-200 dark:border-gray-700 max-w-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-500" />
            <CardTitle className="text-lg">Request Deduplication</CardTitle>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={updateStats}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          Monitor cache và request deduplication
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Cache Stats */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Database className="h-4 w-4" />
            Cache Statistics
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total:</span>
              <Badge variant="outline">{stats.cacheSize}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Valid:</span>
              <Badge variant="outline" className="text-green-600">{stats.validEntries}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Expired:</span>
              <Badge variant="outline" className="text-red-600">{stats.expiredEntries}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Hit Rate:</span>
              <Badge variant="outline" className="text-blue-600">
                {(stats.cacheHitRate * 100).toFixed(1)}%
              </Badge>
            </div>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Pending Requests
          </h4>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Active: {stats.pendingRequests}
            </span>
            {stats.pendingRequests > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={clearPendingRequests}
                className="text-xs"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Cache Keys */}
        {stats.cacheKeys.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Cached Endpoints
            </h4>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {stats.cacheKeys.slice(0, 5).map((key: string, index: number) => (
                <div key={index} className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {key.split(':')[1] || key}
                </div>
              ))}
              {stats.cacheKeys.length > 5 && (
                <div className="text-xs text-gray-500">
                  +{stats.cacheKeys.length - 5} more...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
          <Button
            size="sm"
            variant="outline"
            onClick={clearCache}
            className="flex-1 text-xs"
          >
            Clear Cache
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsVisible(false)}
            className="text-xs"
          >
            Hide
          </Button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400">
          Chỉ hiển thị trong development mode
        </p>
      </CardContent>
    </div>
  )
}
