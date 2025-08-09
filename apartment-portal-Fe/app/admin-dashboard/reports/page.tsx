"use client";

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Eye,
  Filter,
  Download,
  Calendar,
  User,
  Activity
} from 'lucide-react';
import Link from 'next/link';

interface ActivityLog {
  id: string;
  user: string;
  action: string;
  resource: string;
  timestamp: string;
  ipAddress: string;
  details: string;
}

export default function ReportsPage() {
  const { t } = useLanguage();
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockActivityLogs: ActivityLog[] = [
      {
        id: '1',
        user: 'admin',
        action: 'CREATE',
        resource: 'User',
        timestamp: '2024-01-15T10:30:00',
        ipAddress: '192.168.1.100',
        details: 'Created new user: resident1'
      },
      {
        id: '2',
        user: 'staff1',
        action: 'UPDATE',
        resource: 'Apartment',
        timestamp: '2024-01-20T14:15:00',
        ipAddress: '192.168.1.101',
        details: 'Updated apartment A101 information'
      },
      {
        id: '3',
        user: 'admin',
        action: 'DELETE',
        resource: 'Announcement',
        timestamp: '2024-01-25T09:45:00',
        ipAddress: '192.168.1.100',
        details: 'Deleted announcement: Old maintenance notice'
      },
      {
        id: '4',
        user: 'resident1',
        action: 'LOGIN',
        resource: 'Auth',
        timestamp: '2024-01-26T08:20:00',
        ipAddress: '192.168.1.102',
        details: 'User logged in successfully'
      }
    ];

    setTimeout(() => {
      setActivityLogs(mockActivityLogs);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredActivityLogs = activityLogs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <Badge className="bg-green-100 text-green-800">Tạo mới</Badge>;
      case 'UPDATE':
        return <Badge className="bg-blue-100 text-blue-800">Cập nhật</Badge>;
      case 'DELETE':
        return <Badge className="bg-red-100 text-red-800">Xóa</Badge>;
      case 'LOGIN':
        return <Badge className="bg-purple-100 text-purple-800">Đăng nhập</Badge>;
      case 'LOGOUT':
        return <Badge className="bg-gray-100 text-gray-800">Đăng xuất</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{action}</Badge>;
    }
  };

  const getResourceBadge = (resource: string) => {
    switch (resource) {
      case 'User':
        return <Badge className="bg-blue-100 text-blue-800">Người dùng</Badge>;
      case 'Apartment':
        return <Badge className="bg-green-100 text-green-800">Căn hộ</Badge>;
      case 'Announcement':
        return <Badge className="bg-orange-100 text-orange-800">Thông báo</Badge>;
      case 'Auth':
        return <Badge className="bg-purple-100 text-purple-800">Xác thực</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{resource}</Badge>;
    }
  };

  if (loading) {
    return (
      <AdminLayout title={t('admin.reports.title')}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">{t('admin.loading')}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={t('admin.reports.title')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {t('admin.reports.activity-logs')}
            </h2>
            <p className="text-gray-600">
              Quản lý nhật ký hoạt động hệ thống
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Xuất báo cáo</span>
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm theo người dùng, hành động, tài nguyên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  title="Lọc hành động"
                  value={filterAction}
                  onChange={(e) => setFilterAction(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">Tất cả hành động</option>
                  <option value="CREATE">Tạo mới</option>
                  <option value="UPDATE">Cập nhật</option>
                  <option value="DELETE">Xóa</option>
                  <option value="LOGIN">Đăng nhập</option>
                  <option value="LOGOUT">Đăng xuất</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Nhật ký hoạt động ({filteredActivityLogs.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredActivityLogs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">{t('admin.noData')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('admin.reports.user')}</TableHead>
                      <TableHead>{t('admin.reports.action')}</TableHead>
                      <TableHead>{t('admin.reports.resource')}</TableHead>
                      <TableHead>Chi tiết</TableHead>
                      <TableHead>{t('admin.reports.timestamp')}</TableHead>
                      <TableHead>{t('admin.reports.ipAddress')}</TableHead>
                      <TableHead>{t('admin.users.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredActivityLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span>{log.user}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getActionBadge(log.action)}</TableCell>
                        <TableCell>{getResourceBadge(log.resource)}</TableCell>
                        <TableCell className="max-w-xs">
                          <div className="truncate" title={log.details}>
                            {log.details}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3 text-gray-500" />
                            <span>{new Date(log.timestamp).toLocaleDateString('vi-VN')}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {log.ipAddress}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Link href={`/admin-dashboard/reports/${log.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button variant="outline" size="sm">
                              <Activity className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
} 