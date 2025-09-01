"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Edit, 
  Trash2,
  Calendar,
  User,
  Eye,
  AlertCircle,
  Bell,
  Info,
  AlertTriangle,
  Users,
  Clock,
  FileText,
  Tag,
  Shield,
  Phone
} from 'lucide-react';
import Link from 'next/link';
import { announcementsApi, usersApi, Announcement, AnnouncementType, TargetAudience } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function ViewAnnouncementPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const announcementId = parseInt(params.id as string);
  
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [creatorInfo, setCreatorInfo] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncement = async () => {
    try {
      setLoading(true);
      const data = await announcementsApi.getById(announcementId);
      setAnnouncement(data);
      
      // Lấy thông tin người tạo
      if (data.createdBy) {
        try {
          const userData = await usersApi.getById(data.createdBy);
          setCreatorInfo({
            name: userData.fullName || userData.name || `User ${data.createdBy}`,
            email: userData.email || 'N/A'
          });
        } catch (userError) {
          console.warn('Không thể lấy thông tin người tạo:', userError);
          setCreatorInfo({
            name: `User ${data.createdBy}`,
            email: 'N/A'
          });
        }
      }
    } catch (error) {
      toast({
        title: t('admin.error.load', 'Lỗi'),
        description: t('admin.announcements.loadError', 'Không thể tải thông tin thông báo'),
        variant: "destructive",
      });
      router.push('/admin-dashboard/announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!announcement) return;
    
    if (window.confirm(t('admin.announcements.confirmDelete', 'Bạn có chắc chắn muốn xóa thông báo này?'))) {
      try {
        await announcementsApi.delete(announcement.id);
        toast({
          title: t('admin.success.delete', 'Thành công'),
          description: t('admin.announcements.deleteSuccess', 'Đã xóa thông báo'),
        });
        router.push('/admin-dashboard/announcements');
      } catch (error) {
        toast({
          title: t('admin.error.delete', 'Lỗi'),
          description: t('admin.announcements.deleteError', 'Không thể xóa thông báo'),
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    if (announcementId) {
      fetchAnnouncement();
    }
  }, [announcementId]);

  const getTypeBadge = (type: AnnouncementType) => {
    switch (type) {
      case 'NEWS':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1 px-3 py-1">
          <Info className="h-3 w-3" />
          {t('admin.announcements.type.news', 'Tin tức')}
        </Badge>;
      case 'REGULAR':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200 flex items-center gap-1 px-3 py-1">
          <Bell className="h-3 w-3" />
          {t('admin.announcements.type.regular', 'Thường')}
        </Badge>;
      case 'URGENT':
        return <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1 px-3 py-1">
          <AlertTriangle className="h-3 w-3" />
          {t('admin.announcements.type.urgent', 'Khẩn cấp')}
        </Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200 px-3 py-1">{type}</Badge>;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? 
      <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1 px-3 py-1">
        <Bell className="h-3 w-3" />
        {t('admin.announcements.status.active', 'Đang hoạt động')}
      </Badge> :
      <Badge className="bg-gray-100 text-gray-800 border-gray-200 flex items-center gap-1 px-3 py-1">
        <AlertCircle className="h-3 w-3" />
        {t('admin.announcements.status.inactive', 'Không hoạt động')}
      </Badge>;
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
      <AdminLayout title={t('admin.announcements.viewTitle', 'Chi tiết thông báo')}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">{t('admin.loading', 'Đang tải...')}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!announcement) {
    return (
      <AdminLayout title={t('admin.announcements.notFound', 'Không tìm thấy thông báo')}>
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            {t('admin.announcements.notFound', 'Không tìm thấy thông báo')}
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {t('admin.announcements.notFoundDesc', 'Thông báo bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.')}
          </p>
          <Link href="/admin-dashboard/announcements">
            <Button className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t('admin.backToList', 'Quay lại danh sách')}
            </Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={t('admin.announcements.viewTitle', 'Chi tiết thông báo')}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center space-x-4">
              <Link href="/admin-dashboard/announcements">
                <Button variant="outline" size="sm" className="flex items-center gap-2 hover:bg-gray-50">
                  <ArrowLeft className="h-4 w-4" />
                  {t('admin.back', 'Quay lại')}
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  {t('admin.announcements.viewTitle', 'Chi tiết thông báo')}
                </h1>
                <p className="text-gray-600 mt-2">
                  {t('admin.announcements.viewDesc', 'Xem thông tin chi tiết của thông báo')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href={`/admin-dashboard/announcements/edit/${announcement.id}`}>
                <Button variant="outline" className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-700">
                  <Edit className="h-4 w-4" />
                  {t('admin.edit', 'Chỉnh sửa')}
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={handleDelete}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {t('admin.delete', 'Xóa')}
              </Button>
            </div>
          </div>
        </div>

                {/* 3 Cards Info Row */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Basic Info - Màu xanh dương nhẹ */}
          <Card className="shadow-md border-0 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-800 flex-1">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
                <Info className="h-5 w-5 text-blue-600" />
                {t('admin.announcements.basicInfo', 'Thông tin cơ bản')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-blue-200/50 rounded-lg border border-blue-200">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-700">
                    {t('admin.announcements.createdAt', 'Tạo lúc')}
                  </p>
                  <p className="text-sm text-blue-800 font-semibold">
                    {formatDate(announcement.createdAt)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-blue-200/50 rounded-lg border border-blue-200">
                <User className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-700">
                    {t('admin.announcements.createdBy', 'Tạo bởi')}
                  </p>
                  <p className="text-sm text-blue-800 font-semibold">
                    {creatorInfo ? creatorInfo.name : `ID ${announcement.createdBy}`}
                  </p>
                  {creatorInfo && creatorInfo.email !== 'N/A' && (
                    <p className="text-xs text-blue-600 mt-1">
                      {creatorInfo.email}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions - Màu cam nhẹ */}
          <Card className="shadow-md border-0 bg-gradient-to-br from-orange-50 to-orange-100 text-orange-800 flex-1">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
                <Eye className="h-5 w-5 text-orange-600" />
                {t('admin.quickActions', 'Thao tác nhanh')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <Link href={`/admin-dashboard/announcements/edit/${announcement.id}`} className="w-full">
                  <Button variant="outline" className="w-full justify-start bg-orange-200/50 hover:bg-orange-300/50 text-orange-800 border-orange-300 hover:border-orange-400">
                    <Edit className="h-4 w-4 mr-2" />
                    {t('admin.edit', 'Chỉnh sửa')}
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={handleDelete}
                  className="w-full justify-start bg-red-200/50 hover:bg-red-300/50 text-red-700 border-red-300 hover:border-red-400"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('admin.delete', 'Xóa')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info - Màu xanh lá nhẹ */}
          <Card className="shadow-md border-0 bg-gradient-to-br from-green-50 to-green-100 text-green-800 flex-1">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-green-800">
                <Shield className="h-5 w-5 text-green-600" />
                Thông tin bổ sung
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <div className="bg-green-200/50 rounded-lg p-4 border border-green-200">
                  <Phone className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-green-700 font-medium">
                    Liên hệ hỗ trợ
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Cần hỗ trợ? Liên hệ admin
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Nội dung thông báo */}
        <Card className="shadow-sm border-0 bg-white">
          <CardHeader className="pb-6">
            <div className="space-y-6">
              {/* Title Section */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 leading-tight mb-4">
                  {announcement.title}
                </h2>
                
                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {t('admin.announcements.type', 'Loại:')}
                    </span>
                    {getTypeBadge(announcement.type)}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <Separator className="mb-8" />
            
            {/* Content Section */}
            <div className="prose max-w-none">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-base">
                  {announcement.content}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
} 