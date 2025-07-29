'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Activity, Clock, User } from 'lucide-react';

interface ActivityLog {
  logId: number;
  userId: number;
  actionType: string;
  description: string;
  timestamp: string;
  user?: {
    username: string;
    fullName?: string;
  };
}

export default function ActivityLogsPage() {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivityLogs();
  }, []);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Chưa đăng nhập - không tìm thấy token');
      }
      
      console.log('Fetching activity logs with token:', token.substring(0, 20) + '...');
      
      const response = await fetch('http://localhost:8080/api/activity-logs', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        } else if (response.status === 403) {
          throw new Error('Không có quyền truy cập vào lịch sử hoạt động.');
        } else {
          throw new Error(`Lỗi server: ${response.status} - ${errorText}`);
        }
      }

      const data = await response.json();
      console.log('Activity logs data:', data);
      setActivityLogs(data);
    } catch (err) {
      console.error('Error fetching activity logs:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải lịch sử hoạt động');
    } finally {
      setLoading(false);
    }
  };

  const getActionTypeColor = (actionType: string) => {
    switch (actionType.toUpperCase()) {
      case 'LOGIN':
        return 'bg-green-100 text-green-800';
      case 'LOGOUT':
        return 'bg-gray-100 text-gray-800';
      case 'PAYMENT':
        return 'bg-blue-100 text-blue-800';
      case 'REGISTER':
        return 'bg-purple-100 text-purple-800';
      case 'UPDATE':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionTypeLabel = (actionType: string) => {
    switch (actionType.toUpperCase()) {
      case 'LOGIN':
        return 'Đăng nhập';
      case 'LOGOUT':
        return 'Đăng xuất';
      case 'PAYMENT':
        return 'Thanh toán';
      case 'REGISTER':
        return 'Đăng ký';
      case 'UPDATE':
        return 'Cập nhật';
      case 'DELETE':
        return 'Xóa';
      case 'CREATE':
        return 'Tạo mới';
      case 'BOOK':
        return 'Đặt chỗ';
      case 'CANCEL':
        return 'Hủy';
      default:
        return actionType;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải lịch sử hoạt động...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-2">
              <Activity className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Không thể tải dữ liệu</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchActivityLogs}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Lịch sử hoạt động</h1>
        <p className="text-gray-600">
          Theo dõi các hoạt động và thao tác của bạn trong hệ thống
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Tổng hoạt động</p>
                <p className="text-2xl font-bold text-gray-900">{activityLogs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Hoạt động hôm nay</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activityLogs.filter(log => {
                    const today = new Date().toDateString();
                    const logDate = new Date(log.timestamp).toDateString();
                    return today === logDate;
                  }).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <User className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Hoạt động gần nhất</p>
                <p className="text-sm font-semibold text-gray-900">
                  {activityLogs.length > 0 ? formatDate(activityLogs[0].timestamp) : 'Chưa có'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Logs List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Danh sách hoạt động
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activityLogs.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có hoạt động nào</h3>
              <p className="text-gray-600">Các hoạt động của bạn sẽ xuất hiện ở đây</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activityLogs.map((log, index) => (
                <div key={log.logId}>
                  <div className="flex items-start space-x-4 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Activity className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge className={getActionTypeColor(log.actionType)}>
                            {getActionTypeLabel(log.actionType)}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {log.user?.fullName || log.user?.username || 'Người dùng'}
                          </span>
                        </div>
                        <span className="text-sm text-gray-500 flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {formatDate(log.timestamp)}
                        </span>
                      </div>
                      
                      <p className="text-gray-900">{log.description}</p>
                    </div>
                  </div>
                  
                  {index < activityLogs.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 