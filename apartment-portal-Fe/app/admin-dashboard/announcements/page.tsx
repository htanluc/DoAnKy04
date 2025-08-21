"use client";

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminGuard from '@/components/auth/admin-guard';
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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

export default function AnnouncementsPage() {
  return (
    <AdminGuard>
      <AnnouncementsPageContent />
    </AdminGuard>
  );
}

function AnnouncementsPageContent() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await announcementsApi.getAll();
      setAnnouncements(data);
    } catch (error) {
      toast({
        title: t('admin.error.load','Lỗi'),
        description: t('admin.announcements.loadError','Không thể tải danh sách thông báo'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Reset về trang 1 khi filter/search thay đổi hoặc dữ liệu mới về
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, announcements]);

  const handleDelete = async (id: number) => {
    if (window.confirm(t('admin.announcements.confirmDelete','Bạn có chắc chắn muốn xóa thông báo này?'))) {
      try {
        await announcementsApi.delete(id);
        toast({
          title: t('admin.success.delete','Thành công'),
          description: t('admin.announcements.deleteSuccess','Đã xóa thông báo'),
        });
        fetchAnnouncements();
      } catch (error) {
        toast({
          title: t('admin.error.delete','Lỗi'),
          description: t('admin.announcements.deleteError','Không thể xóa thông báo'),
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

  // Sắp xếp mới nhất trước (giảm dần theo createdAt)
  const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return bTime - aTime;
  });

  // Phân trang 10 thông báo/trang
  const totalPages = Math.max(1, Math.ceil(sortedAnnouncements.length / pageSize));
  const startIdx = (currentPage - 1) * pageSize;
  const pageAnnouncements = sortedAnnouncements.slice(startIdx, startIdx + pageSize);

  const getTypeBadge = (type: AnnouncementType) => {
    switch (type) {
      case 'NEWS':
        return <Badge className="bg-blue-100 text-blue-800">{t('admin.announcements.type.news','Tin tức')}</Badge>;
      case 'REGULAR':
        return <Badge className="bg-gray-100 text-gray-800">{t('admin.announcements.type.regular','Thường')}</Badge>;
      case 'URGENT':
        return <Badge className="bg-red-100 text-red-800">{t('admin.announcements.type.urgent','Khẩn cấp')}</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{type}</Badge>;
    }
  };

  const getTargetAudienceBadge = (targetAudience: TargetAudience) => {
    switch (targetAudience) {
      case 'ALL_RESIDENTS':
        return <Badge className="bg-purple-100 text-purple-800">{t('admin.announcements.targetAudience.ALL_RESIDENTS','Tất cả cư dân')}</Badge>;
      case 'TOWER_A_RESIDENTS':
        return <Badge className="bg-green-100 text-green-800">{t('admin.announcements.targetAudience.TOWER_A_RESIDENTS','Tòa A')}</Badge>;
      case 'TOWER_B_RESIDENTS':
        return <Badge className="bg-blue-100 text-blue-800">{t('admin.announcements.targetAudience.TOWER_B_RESIDENTS','Tòa B')}</Badge>;
      case 'SPECIFIC_APARTMENTS':
        return <Badge className="bg-orange-100 text-orange-800">{t('admin.announcements.targetAudience.SPECIFIC_APARTMENTS','Căn hộ cụ thể')}</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{targetAudience}</Badge>;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-800">{t('admin.status.active','Hoạt động')}</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800">{t('admin.status.inactive','Không hoạt động')}</Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <AdminLayout title={t('admin.announcements.title', 'Quản lý thông báo')}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">{t('admin.loading', 'Đang tải...')}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={t('admin.announcements.title', 'Quản lý thông báo')}>
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('admin.announcements.title', 'Quản lý thông báo')}</h2>
            <p className="text-gray-600 mt-1">{t('admin.announcements.listDesc', 'Quản lý tất cả thông báo trong hệ thống')}</p>
          </div>
          <Link href="/admin-dashboard/announcements/create">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {t('admin.announcements.create', 'Tạo thông báo mới')}
            </Button>
          </Link>
        </div>

        {/* Search and filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              {t('admin.filters.searchAndFilter', 'Tìm kiếm & lọc')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder={t('admin.announcements.searchPlaceholder', 'Tìm kiếm theo tiêu đề, nội dung...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="sm:w-48">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Lọc theo loại"
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
              <span>{t('admin.announcements.list','Danh sách thông báo')} ({sortedAnnouncements.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedAnnouncements.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">{t('admin.noData')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('admin.announcements.announcementTitle','Tiêu đề')}</TableHead>
                      <TableHead>{t('admin.announcements.type','Loại thông báo')}</TableHead>
                      <TableHead>{t('admin.announcements.targetAudience','Đối tượng')}</TableHead>
                      <TableHead>{t('admin.users.status','Trạng thái')}</TableHead>
                      <TableHead>{t('admin.users.createdAt','Ngày tạo')}</TableHead>
                      <TableHead className="text-right">{t('admin.users.actions','Thao tác')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageAnnouncements.map((announcement) => (
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
                {totalPages > 1 && (
                  <div className="mt-4">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(currentPage - 1); }}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                          />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              href="#"
                              isActive={page === currentPage}
                              onClick={(e) => { e.preventDefault(); setCurrentPage(page); }}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage(currentPage + 1); }}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
} 