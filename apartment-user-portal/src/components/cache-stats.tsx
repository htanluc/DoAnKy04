"use client"

import React, { useState, useEffect } from 'react';
import { RefreshCw, Trash2, Database, Clock, Users, HardDrive } from 'lucide-react';
import { userDataService } from '../lib/user-data-service';

interface CacheStatsProps {
  className?: string;
}

export default function CacheStats({ className = '' }: CacheStatsProps) {
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshStats = () => {
    setCacheStats(userDataService.getCacheStats());
  };

  const clearAllCache = () => {
    userDataService.clearAllCache();
    refreshStats();
  };

  const clearUserCache = (userId: string) => {
    userDataService.clearUserCache(userId);
    refreshStats();
  };

  useEffect(() => {
    refreshStats();
    
    // Auto-refresh stats every 10 seconds
    const interval = setInterval(refreshStats, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!cacheStats) {
    return (
      <div className={`p-4 bg-gray-50 rounded-lg ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const cacheUsagePercent = (cacheStats.totalEntries / cacheStats.maxSize) * 100;
  const cacheAge = cacheStats.cacheDuration / 1000 / 60; // Convert to minutes

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-medium text-gray-900">Cache Statistics</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={refreshStats}
              disabled={isRefreshing}
              className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
              title="Refresh stats"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={clearAllCache}
              className="p-1 text-red-400 hover:text-red-600"
              title="Clear all cache"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Total Entries */}
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 bg-blue-100 rounded-full">
              <HardDrive className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{cacheStats.totalEntries}</div>
            <div className="text-xs text-gray-500">Total Entries</div>
          </div>

          {/* Valid Entries */}
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 bg-green-100 rounded-full">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{cacheStats.validEntries}</div>
            <div className="text-xs text-gray-500">Valid Entries</div>
          </div>

          {/* Expired Entries */}
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 bg-yellow-100 rounded-full">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{cacheStats.expiredEntries}</div>
            <div className="text-xs text-gray-500">Expired</div>
          </div>

          {/* Cache Usage */}
          <div className="text-center">
            <div className="flex items-center justify-center w-10 h-10 mx-auto mb-2 bg-purple-100 rounded-full">
              <Database className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{Math.round(cacheUsagePercent)}%</div>
            <div className="text-xs text-gray-500">Usage</div>
          </div>
        </div>

        {/* Cache Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Cache Usage</span>
            <span>{cacheStats.totalEntries} / {cacheStats.maxSize}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                cacheUsagePercent > 80 ? 'bg-red-500' :
                cacheUsagePercent > 60 ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(cacheUsagePercent, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Cache Info */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Max Size:</span>
              <span className="ml-2 font-medium">{cacheStats.maxSize} users</span>
            </div>
            <div>
              <span className="text-gray-500">Cache Duration:</span>
              <span className="ml-2 font-medium">{cacheAge} minutes</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={refreshStats}
              disabled={isRefreshing}
              className="flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Stats
            </button>
            <button
              onClick={clearAllCache}
              className="flex items-center justify-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Cache
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
