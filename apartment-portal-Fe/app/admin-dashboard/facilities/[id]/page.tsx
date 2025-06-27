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
  MapPin,
  Clock,
  Users,
  AlertCircle,
  Building
} from 'lucide-react';
import Link from 'next/link';
import { facilitiesApi, Facility } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function ViewFacilityPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const facilityId = parseInt(params.id as string);
  
  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchFacility = async () => {
    try {
      setLoading(true);
      const data = await facilitiesApi.getById(facilityId);
      setFacility(data);
    } catch (error) {
      toast({
        title: t('admin.error.load', 'Lỗi'),
        description: t('admin.facilities.loadError', 'Không thể tải thông tin tiện ích'),
        variant: "destructive",
      });
      router.push('/admin-dashboard/facilities');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!facility) return;
    
    if (window.confirm('Bạn có chắc chắn muốn xóa cơ sở vật chất này?')) {
      try {
        await facilitiesApi.delete(facility.id);
        toast({
          title: t('admin.success.delete', 'Thành công'),
          description: t('admin.facilities.deleteSuccess', 'Đã xóa tiện ích'),
        });
        router.push('/admin-dashboard/facilities');
      } catch (error) {
        toast({
          title: t('admin.error.delete', 'Lỗi'),
          description: t('admin.facilities.deleteError', 'Không thể xóa tiện ích'),
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    if (facilityId) {
      fetchFacility();
    }
  }, [facilityId]);

  if (loading) {
    return (
      <AdminLayout title={t('admin.facilities.details', 'Chi tiết tiện ích')}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!facility) {
    return (
      <AdminLayout title="Không tìm thấy cơ sở vật chất">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy cơ sở vật chất</h2>
          <p className="text-gray-600 mb-4">Cơ sở vật chất bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Link href="/admin-dashboard/facilities">
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
    <AdminLayout title={t('admin.facilities.details', 'Chi tiết tiện ích')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin-dashboard/facilities">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('admin.action.back', 'Quay lại')}
              </Button>
            </Link>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {t('admin.facilities.details', 'Chi tiết tiện ích')}
              </h2>
              <p className="text-gray-600">
                {t('admin.facilities.detailsDesc', 'Xem thông tin chi tiết của tiện ích')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link href={`/admin-dashboard/facilities/edit/${facility.id}`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                {t('admin.action.edit', 'Chỉnh sửa')}
              </Button>
            </Link>
            <Link href={`/admin-dashboard/facility-bookings?facilityId=${facility.id}`}>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                {t('admin.facilities.viewBookings', 'Xem đặt chỗ')}
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {t('admin.action.delete', 'Xóa')}
            </Button>
          </div>
        </div>

        {/* Facility Details */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Content */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{facility.name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {facility.description}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Facility Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('admin.facilities.info', 'Thông tin tiện ích')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {t('admin.facilities.name', 'Tên tiện ích')}: {facility.name}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {t('admin.facilities.capacity', 'Sức chứa')}: {facility.capacity} {t('admin.facilities.people', 'người')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-700">{t('admin.facilities.usageFee', 'Phí sử dụng')}:</span>
                  <span className="text-sm text-gray-600">{facility.usageFee ? facility.usageFee : t('admin.facilities.free', 'Miễn phí')}</span>
                </div>
                {facility.otherDetails && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-gray-700">{t('admin.facilities.otherDetails', 'Chi tiết khác')}:</span>
                    <div className="text-sm text-gray-600">
                      {facility.otherDetails}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 