"use client"

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  RefreshCw, 
  Database, 
  Zap, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Info,
  Settings,
  ArrowRight
} from 'lucide-react';
import { 
  initializeSearchIndexes, 
  syncAllDataToSearch, 
  checkMeilisearchHealth,
  getSearchMode,
  refreshSearchSystem,
  getIndexStats
} from '../lib/search';

interface SystemStatus {
  meilisearch: {
    status: 'healthy' | 'unhealthy' | 'error' | 'checking';
    message: string;
  };
  localSearch: {
    status: 'available' | 'unavailable';
    message: string;
  };
  currentMode: string;
}

export default function SearchTest() {
  const [query, setQuery] = useState('');
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    meilisearch: { status: 'checking', message: 'Đang kiểm tra...' },
    localSearch: { status: 'available', message: 'Sẵn sàng sử dụng' },
    currentMode: 'Đang kiểm tra...'
  });
  const [isInitializing, setIsInitializing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string>('');
  const [indexStats, setIndexStats] = useState<any>({});

  // Check system status on component mount
  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    try {
      // Check Meilisearch health
      const meiliHealth = await checkMeilisearchHealth();
      
      // Get current search mode
      const { mode } = getSearchMode();
      
      setSystemStatus({
        meilisearch: {
          status: meiliHealth.status === 'healthy' ? 'healthy' : 'unhealthy',
          message: meiliHealth.message
        },
        localSearch: {
          status: 'available',
          message: 'Sẵn sàng sử dụng (fallback)'
        },
        currentMode: mode
      });

      // Get index stats if Meilisearch is healthy
      if (meiliHealth.status === 'healthy') {
        const stats = await getIndexStats();
        setIndexStats(stats);
      }
    } catch (error) {
      console.error('Error checking system status:', error);
      setSystemStatus(prev => ({
        ...prev,
        meilisearch: { status: 'error', message: 'Không thể kiểm tra trạng thái' },
        currentMode: 'Local Search (fallback)'
      }));
    }
  };

  const handleInitializeSearch = async () => {
    setIsInitializing(true);
    try {
      const result = await initializeSearchIndexes();
      if (result) {
        alert('✅ Hệ thống tìm kiếm đã được khởi tạo thành công!');
        await checkSystemStatus(); // Refresh status
      } else {
        alert('❌ Khởi tạo hệ thống tìm kiếm thất bại!');
      }
    } catch (error) {
      console.error('Initialization error:', error);
      alert('❌ Có lỗi xảy ra khi khởi tạo hệ thống tìm kiếm!');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSyncData = async () => {
    setIsSyncing(true);
    try {
      const result = await syncAllDataToSearch();
      if (result) {
        setSyncResult('✅ Đồng bộ dữ liệu thành công!');
        await checkSystemStatus(); // Refresh status
      } else {
        setSyncResult('❌ Đồng bộ dữ liệu thất bại!');
      }
    } catch (error) {
      console.error('Sync error:', error);
      setSyncResult('❌ Có lỗi xảy ra khi đồng bộ dữ liệu!');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRefreshSystem = async () => {
    try {
      const newMode = await refreshSearchSystem();
      setSystemStatus(prev => ({
        ...prev,
        currentMode: newMode.mode
      }));
      alert(`🔄 Hệ thống đã được làm mới! Chế độ hiện tại: ${newMode.mode}`);
    } catch (error) {
      console.error('Refresh error:', error);
      alert('❌ Có lỗi xảy ra khi làm mới hệ thống!');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'available':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'unhealthy':
      case 'unavailable':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'checking':
        return <RefreshCw className="w-5 h-5 text-yellow-500 animate-spin" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'available':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'unhealthy':
      case 'unavailable':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'error':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'checking':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🔍 Hệ Thống Tìm Kiếm Toàn Diện
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Kiểm tra và quản lý hệ thống tìm kiếm tích hợp Meilisearch với khả năng fallback về Local Search Engine
          </p>
        </div>

        {/* System Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Current Mode */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Chế Độ Hiện Tại</h3>
              <Settings className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {systemStatus.currentMode}
              </div>
              <p className="text-sm text-gray-600">
                Hệ thống tự động chọn engine tìm kiếm phù hợp
              </p>
            </div>
            <button
              onClick={handleRefreshSystem}
              className="mt-4 w-full bg-blue-50 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-100 transition-colors"
            >
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Làm Mới Hệ Thống
            </button>
          </div>

          {/* Meilisearch Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Meilisearch</h3>
              <Database className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Trạng thái:</span>
              {getStatusIcon(systemStatus.meilisearch.status)}
            </div>
            <p className={`text-sm p-3 rounded-md border ${getStatusColor(systemStatus.meilisearch.status)}`}>
              {systemStatus.meilisearch.message}
            </p>
            {systemStatus.meilisearch.status === 'healthy' && (
              <div className="mt-3 text-xs text-gray-500">
                ✅ Server đang chạy trên port 7700
              </div>
            )}
          </div>

          {/* Local Search Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Local Search</h3>
              <Zap className="w-5 h-5 text-gray-400" />
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Trạng thái:</span>
              {getStatusIcon(systemStatus.localSearch.status)}
            </div>
            <p className={`text-sm p-3 rounded-md border ${getStatusColor(systemStatus.localSearch.status)}`}>
              {systemStatus.localSearch.message}
            </p>
            <div className="mt-3 text-xs text-gray-500">
              🔄 Luôn sẵn sàng làm fallback
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quản Lý Hệ Thống</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleInitializeSearch}
              disabled={isInitializing || systemStatus.meilisearch.status !== 'healthy'}
              className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isInitializing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Database className="w-4 h-4 mr-2" />
              )}
              {isInitializing ? 'Đang khởi tạo...' : 'Khởi tạo hệ thống search'}
            </button>
            
            <button
              onClick={handleSyncData}
              disabled={isSyncing || systemStatus.meilisearch.status !== 'healthy'}
              className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isSyncing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              {isSyncing ? 'Đang đồng bộ...' : 'Sync dữ liệu'}
            </button>
          </div>
          
          {syncResult && (
            <div className={`mt-4 p-3 rounded-md border ${
              syncResult.includes('✅') 
                ? 'text-green-700 bg-green-50 border-green-200' 
                : 'text-red-700 bg-red-50 border-red-200'
            }`}>
              {syncResult}
            </div>
          )}
        </div>

        {/* Index Statistics */}
        {systemStatus.meilisearch.status === 'healthy' && Object.keys(indexStats).length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống Kê Index</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(indexStats).map(([indexName, stats]: [string, any]) => (
                <div key={indexName} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900 capitalize">
                    {indexName.replace('_', ' ')}
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.numberOfDocuments || 0}
                  </div>
                  <div className="text-sm text-gray-500">documents</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* System Information */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Thông Tin Hệ Thống Tìm Kiếm</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <strong>Chế độ hiện tại:</strong> {systemStatus.currentMode}
            </div>
            <div>
              <strong>Dữ liệu được index:</strong> 6 loại
            </div>
            <div>
              <strong>Hỗ trợ ngôn ngữ:</strong> Tiếng Việt + Tiếng Anh
            </div>
            <div>
              <strong>Độ trễ:</strong> {systemStatus.currentMode.includes('Meilisearch') ? '<50ms' : 'Thời gian thực'}
            </div>
            <div>
              <strong>Yêu cầu:</strong> {systemStatus.currentMode.includes('Meilisearch') ? 'Docker + Port 7700' : 'Không cần cài đặt thêm'}
            </div>
            <div>
              <strong>Khả năng mở rộng:</strong> {systemStatus.currentMode.includes('Meilisearch') ? 'Không giới hạn' : 'Hạn chế'}
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-sm text-blue-800">
              <strong>💡 Lưu ý:</strong> Hệ thống tự động chuyển đổi giữa Meilisearch và Local Search Engine. 
              Khi Meilisearch không khả dụng, hệ thống sẽ sử dụng Local Search Engine để đảm bảo tính năng tìm kiếm luôn hoạt động.
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-4">
            <a
              href="/demo-search"
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              <Search className="w-4 h-4 mr-2" />
              Demo Tìm Kiếm
            </a>
            <ArrowRight className="w-5 h-5 text-gray-400" />
            <a
              href="/"
              className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Trang Chủ
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
