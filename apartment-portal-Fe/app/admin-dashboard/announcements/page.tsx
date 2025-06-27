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
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import { announcementsApi, Announcement, AnnouncementType, TargetAudience } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function AnnouncementsPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await announcementsApi.getAll();
      setAnnouncements(data);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách thông báo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
      try {
        await announcementsApi.delete(id);
        toast({
          title: "Thành công",
          description: "Đã xóa thông báo",
        });
        fetchAnnouncements();
      } catch (error) {
        toast({
          title: "Lỗi",
          description: "Không thể xóa thông báo",
          variant: "destructive",
        });
      }
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || announcement.type === filterType;
    return matchesSearch && matchesType;
  });

  const getTypeBadge = (type: AnnouncementType) => {
    switch (type) {
      case 'NEWS':
        return <Badge className="bg-blue-100 text-blue-800">Tin tức</Badge>;
      case 'REGULAR':
        return <Badge className="bg-gray-100 text-gray-800">Thường</Badge>;
      case 'URGENT':
        return <Badge className="bg-red-100 text-red-800">Khẩn cấp</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{type}</Badge>;
    }
  };

  const getTargetAudienceBadge = (targetAudience: TargetAudience) => {
    switch (targetAudience) {
      case 'ALL_RESIDENTS':
        return <Badge className="bg-purple-100 text-purple-800">Tất cả cư dân</Badge>;
      case 'TOWER_A_RESIDENTS':
        return <Badge className="bg-green-100 text-green-800">Tòa A</Badge>;
      case 'TOWER_B_RESIDENTS':
        return <Badge className="bg-blue-100 text-blue-800">Tòa B</Badge>;
      case 'SPECIFIC_APARTMENTS':
        return <Badge className="bg-orange-100 text-orange-800">Căn hộ cụ thể</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{targetAudience}</Badge>;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? 
      <Badge className="bg-green-100 text-green-800">Đang hoạt động</Badge> :
      <Badge className="bg-gray-100 text-gray-800">Không hoạt động</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <AdminLayout title={t('admin.announcements.title')}>
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
    <AdminLayout title={t('admin.announcements.title')}>
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {t('admin.announcements.list', 'Danh sách thông báo')}
            </h2>
            <p className="text-gray-600">
              {t('admin.announcements.listDesc', 'Quản lý tất cả thông báo trong hệ thống')}
            </p>
          </div>
          <Link href="/admin-dashboard/announcements/create">
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>{t('admin.action.create', 'Tạo mới')}</span>
            </Button>
          </Link>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t('admin.announcements.searchPlaceholder', 'Tìm kiếm theo tiêu đề, nội dung...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">{t('admin.announcements.type.all', 'Tất cả loại')}</option>
                  <option value="NEWS">{t('admin.announcements.type.news', 'Tin tức')}</option>
                  <option value="REGULAR">{t('admin.announcements.type.regular', 'Thường')}</option>
                  <option value="URGENT">{t('admin.announcements.type.urgent', 'Khẩn cấp')}</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Announcements Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Danh sách thông báo ({filteredAnnouncements.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredAnnouncements.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">{t('admin.noData')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tiêu đề</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Đối tượng</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAnnouncements.map((announcement) => (
                      <TableRow key={announcement.id}>
                        <TableCell className="font-medium max-w-xs truncate">
                          {announcement.title}
                        </TableCell>
                        <TableCell>
                          {getTypeBadge(announcement.type)}
                        </TableCell>
                        <TableCell>
                          {getTargetAudienceBadge(announcement.targetAudience)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(announcement.isActive)}
                        </TableCell>
                        <TableCell>
                          {formatDate(announcement.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Link href={`/admin-dashboard/announcements/${announcement.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin-dashboard/announcements/edit/${announcement.id}`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDelete(announcement.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
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