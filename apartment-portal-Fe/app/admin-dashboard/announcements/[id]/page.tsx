"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit, 
  Trash2,
  Calendar,
  User,
  Eye,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { announcementsApi, Announcement, AnnouncementType, TargetAudience } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function ViewAnnouncementPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const announcementId = parseInt(params.id as string);
  
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAnnouncement = async () => {
    try {
      setLoading(true);
      const data = await announcementsApi.getById(announcementId);
      setAnnouncement(data);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin thông báo",
        variant: "destructive",
      });
      router.push('/admin-dashboard/announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!announcement) return;
    
    if (window.confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
      try {
        await announcementsApi.delete(announcement.id);
        toast({
          title: "Thành công",
          description: "Đã xóa thông báo",
        });
        router.push('/admin-dashboard/announcements');
      } catch (error) {
        toast({
          title: "Lỗi",
          description: "Không thể xóa thông báo",
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
        return <Badge className="bg-green-100 text-green-800">Cư dân tòa A</Badge>;
      case 'TOWER_B_RESIDENTS':
        return <Badge className="bg-blue-100 text-blue-800">Cư dân tòa B</Badge>;
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
      <AdminLayout title="Chi tiết thông báo">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!announcement) {
    return (
      <AdminLayout title="Không tìm thấy thông báo">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy thông báo</h2>
          <p className="text-gray-600 mb-4">Thông báo bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Link href="/admin-dashboard/announcements">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại danh sách
            </Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Chi tiết thông báo">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin-dashboard/announcements">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            </Link>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Chi tiết thông báo
              </h2>
              <p className="text-gray-600">
                Xem thông tin chi tiết của thông báo
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link href={`/admin-dashboard/announcements/edit/${announcement.id}`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa
            </Button>
          </div>
        </div>

        {/* Announcement Details */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Content */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{announcement.title}</CardTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      {getTypeBadge(announcement.type)}
                      {getStatusBadge(announcement.isActive)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {announcement.content}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Thông tin cơ bản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Tạo lúc: {formatDate(announcement.createdAt)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Tạo bởi: ID {announcement.createdBy}
                  </span>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-medium text-gray-700">Đối tượng nhận:</span>
                  <div>{getTargetAudienceBadge(announcement.targetAudience)}</div>
                </div>
              </CardContent>
            </Card>

            {/* Status Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trạng thái</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Hoạt động:</span>
                    {getStatusBadge(announcement.isActive)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Loại:</span>
                    {getTypeBadge(announcement.type)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 