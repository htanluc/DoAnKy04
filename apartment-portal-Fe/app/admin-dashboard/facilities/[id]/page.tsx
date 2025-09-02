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
  Building2,
  DollarSign,
  FileText,
  Star,
  TrendingUp,
  Activity,
  MoreHorizontal,
  Copy,
  Share2,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Info
} from 'lucide-react';
import Link from 'next/link';
import { facilitiesApi, Facility } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
    
    if (window.confirm('Bạn có chắc chắn muốn xóa tiện ích này?')) {
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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t('admin.success.copy', 'Đã sao chép'),
      description: `${label} đã được sao chép vào clipboard`,
    });
  };

  const getCapacityBadge = (capacity: number) => {
    if (capacity <= 20) {
      return <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
        <Users className="h-3 w-3 mr-1" />
        {t('admin.facilities.capacity.label.small', 'Nhỏ')} ({capacity})
      </Badge>;
    } else if (capacity <= 50) {
      return <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">
        <Users className="h-3 w-3 mr-1" />
        {t('admin.facilities.capacity.label.medium', 'Trung bình')} ({capacity})
      </Badge>;
    } else {
      return <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
        <Users className="h-3 w-3 mr-1" />
        {t('admin.facilities.capacity.label.large', 'Lớn')} ({capacity})
      </Badge>;
    }
  };

  const getFeeDisplay = (fee: number | null) => {
    if (!fee || fee === 0) {
      return <Badge variant="outline" className="text-green-600 border-green-300">Miễn phí</Badge>;
    }
    return <span className="font-medium text-gray-900">${fee.toLocaleString()}</span>;
  };

  useEffect(() => {
    if (facilityId) {
      fetchFacility();
    }
  }, [facilityId]);

  if (loading) {
    return (
      <AdminLayout title={t('admin.facilities.details', 'Chi tiết tiện ích')}>
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-10 w-24" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-20" />
            </div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!facility) {
    return (
      <AdminLayout title="Không tìm thấy tiện ích">
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy tiện ích</h2>
          <p className="text-gray-600 mb-6">Tiện ích bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Link href="/admin-dashboard/facilities">
            <Button className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách
            </Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`${facility.name} - Chi tiết tiện ích`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Link href="/admin-dashboard/facilities">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                {t('admin.action.back', 'Quay lại')}
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{facility.name}</h1>
              <p className="text-gray-600 mt-1">
                {t('admin.facilities.detailsDesc', 'Thông tin chi tiết của tiện ích')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t('admin.action.actions', 'Thao tác')}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => copyToClipboard(facility.name, 'Tên tiện ích')}>
                  <Copy className="h-4 w-4 mr-2" />
                  {t('admin.action.copyName', 'Sao chép tên')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => copyToClipboard(facility.description || '', 'Mô tả')}>
                  <Copy className="h-4 w-4 mr-2" />
                  {t('admin.action.copyDescription', 'Sao chép mô tả')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('admin.action.delete', 'Xóa')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Link href={`/admin-dashboard/facilities/edit/${facility.id}`}>
              <Button variant="outline" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                {t('admin.action.edit', 'Chỉnh sửa')}
              </Button>
            </Link>
            <Link href={`/admin-dashboard/facility-bookings?facilityId=${facility.id}`}>
              <Button className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200">
                <Calendar className="h-4 w-4" />
                {t('admin.facilities.viewBookings', 'Xem đặt chỗ')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t('admin.facilities.stats.capacity', 'Sức chứa')}
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{facility.capacity}</div>
              <p className="text-xs text-gray-500 mt-1">
                {t('admin.facilities.stats.capacityDesc', 'Người có thể sử dụng')}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t('admin.facilities.stats.usageFee', 'Phí sử dụng')}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {facility.usageFee ? `$${facility.usageFee.toLocaleString()}` : 'Miễn phí'}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t('admin.facilities.stats.usageFeeDesc', 'Phí cho mỗi lần sử dụng')}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t('admin.facilities.stats.location', 'Vị trí')}
              </CardTitle>
              <MapPin className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {facility.location ? 'Có' : 'Chưa có'}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {t('admin.facilities.stats.locationDesc', 'Thông tin vị trí')}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t('admin.facilities.stats.status', 'Trạng thái')}
              </CardTitle>
              <Activity className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">Hoạt động</div>
              <p className="text-xs text-gray-500 mt-1">
                {t('admin.facilities.stats.statusDesc', 'Tiện ích đang hoạt động')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                  {t('admin.facilities.description', 'Mô tả')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="prose max-w-none">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {facility.description || (
                      <div className="text-gray-500 italic">
                        {t('admin.facilities.noDescription', 'Chưa có mô tả cho tiện ích này')}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Other Details Card */}
            {facility.otherDetails && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="border-b border-gray-100">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Info className="h-5 w-5 text-green-600" />
                    {t('admin.facilities.otherDetails', 'Chi tiết khác')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {facility.otherDetails}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Activity className="h-5 w-5 text-purple-600" />
                  {t('admin.facilities.quickActions', 'Thao tác nhanh')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link href={`/admin-dashboard/facility-bookings?facilityId=${facility.id}`}>
                    <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center gap-2">
                      <Calendar className="h-6 w-6" />
                      <span>{t('admin.facilities.viewBookings', 'Xem đặt chỗ')}</span>
                    </Button>
                  </Link>
                  <Link href={`/admin-dashboard/facilities/edit/${facility.id}`}>
                    <Button variant="outline" className="w-full h-16 flex flex-col items-center justify-center gap-2">
                      <Edit className="h-6 w-6" />
                      <span>{t('admin.action.edit', 'Chỉnh sửa')}</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Facility Info Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  {t('admin.facilities.info', 'Thông tin tiện ích')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{t('admin.facilities.id', 'ID')}:</span>
                    <Badge variant="outline" className="font-mono">{facility.id}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{t('admin.facilities.capacity', 'Sức chứa')}:</span>
                    {getCapacityBadge(facility.capacity)}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{t('admin.facilities.usageFee', 'Phí sử dụng')}:</span>
                    {getFeeDisplay(facility.usageFee)}
                  </div>
                  
                  {facility.location && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{t('admin.facilities.location', 'Vị trí')}:</span>
                      <span className="text-sm text-gray-600 max-w-32 truncate" title={facility.location}>
                        {facility.location}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Facility Status Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  {t('admin.facilities.status', 'Trạng thái')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium text-gray-900">Hoạt động</div>
                    <div className="text-sm text-gray-500">Tiện ích đang hoạt động bình thường</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact & Support Card */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="border-b border-gray-100">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Info className="h-5 w-5 text-blue-600" />
                  {t('admin.facilities.support', 'Hỗ trợ')}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="text-sm text-gray-600">
                  <p className="mb-2">Cần hỗ trợ về tiện ích này?</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>Giờ làm việc: 8:00 - 18:00</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>Văn phòng quản lý</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <Share2 className="h-4 w-4 mr-2" />
                  {t('admin.facilities.contactSupport', 'Liên hệ hỗ trợ')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 