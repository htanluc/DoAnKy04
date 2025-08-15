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
  Filter,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { facilitiesApi, Facility } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { facilityBookingsApi, FacilityBooking } from '@/lib/api';

export default function FacilitiesPage() {
  return (
    <AdminGuard>
      <FacilitiesPageContent />
    </AdminGuard>
  );
}

function FacilitiesPageContent() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCapacity, setFilterCapacity] = useState('all');
  const [bookings, setBookings] = useState<FacilityBooking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const data = await facilitiesApi.getAll();
      setFacilities(data);
    } catch (error) {
      toast({
        title: t('admin.error.load', 'Lỗi'),
        description: t('admin.facilities.loadError', 'Không thể tải danh sách tiện ích'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
    facilityBookingsApi.getAll().then(data => {
      setBookings(data);
      setLoadingBookings(false);
    }).catch(() => setLoadingBookings(false));
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tiện ích này?')) {
      try {
        await facilitiesApi.delete(id);
        toast({
          title: t('admin.success.delete', 'Thành công'),
          description: t('admin.facilities.deleteSuccess', 'Đã xóa tiện ích'),
        });
        fetchFacilities();
      } catch (error) {
        toast({
          title: t('admin.error.delete', 'Lỗi'),
          description: t('admin.facilities.deleteError', 'Không thể xóa tiện ích'),
          variant: "destructive",
        });
      }
    }
  };

  const filteredFacilities = facilities.filter(facility => {
    const matchesSearch = facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         facility.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCapacity = filterCapacity === 'all' || 
                           (filterCapacity === 'small' && facility.capacity <= 20) ||
                           (filterCapacity === 'medium' && facility.capacity > 20 && facility.capacity <= 50) ||
                           (filterCapacity === 'large' && facility.capacity > 50);
    return matchesSearch && matchesCapacity;
  });

  const getCapacityBadge = (capacity: number) => {
    if (capacity <= 20) {
      return <Badge className="bg-green-100 text-green-800">{t('admin.facilities.capacity.label.small', 'Nhỏ')} ({capacity})</Badge>;
    } else if (capacity <= 50) {
      return <Badge className="bg-yellow-100 text-yellow-800">{t('admin.facilities.capacity.label.medium', 'Trung bình')} ({capacity})</Badge>;
    } else {
      return <Badge className="bg-blue-100 text-blue-800">{t('admin.facilities.capacity.label.large', 'Lớn')} ({capacity})</Badge>;
    }
  };

  if (loading) {
    return (
      <AdminLayout title={t('admin.facilities.title')}>
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
    <AdminLayout title={t('admin.facilities.title')}>
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {t('admin.facilities.list')}
            </h2>
            <p className="text-gray-600">
              {t('admin.facilities.listDesc', 'Quản lý tất cả tiện ích trong chung cư')}
            </p>
          </div>
          <Link href="/admin-dashboard/facilities/create">
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>{t('admin.action.create')}</span>
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
                  placeholder={t('admin.facilities.searchPlaceholder', 'Tìm kiếm theo tên, mô tả...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  title="Sức chứa tiện ích"
                  value={filterCapacity}
                  onChange={(e) => setFilterCapacity(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">{t('admin.facilities.capacity.all', 'Tất cả sức chứa')}</option>
                  <option value="small">{t('admin.facilities.capacity.small', 'Nhỏ (≤20)')}</option>
                  <option value="medium">{t('admin.facilities.capacity.medium', 'Trung bình (21-50)')}</option>
                  <option value="large">{t('admin.facilities.capacity.large', 'Lớn (>50)')}</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Facilities Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t('admin.facilities.list', 'Danh sách tiện ích')} ({filteredFacilities.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredFacilities.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">{t('admin.noData')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('admin.facilities.name', 'Tên tiện ích')}</TableHead>
                      <TableHead>{t('admin.facilities.description', 'Mô tả')}</TableHead>
                      <TableHead>{t('admin.facilities.capacity', 'Sức chứa')}</TableHead>
                      <TableHead>{t('admin.facilities.usageFee', 'Phí sử dụng')}</TableHead>
                      <TableHead>{t('admin.facilities.otherDetails', 'Chi tiết khác')}</TableHead>
                      <TableHead className="text-right">{t('admin.action.actions', 'Thao tác')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFacilities.map((facility) => (
                      <TableRow key={facility.id}>
                        <TableCell className="font-medium">
                          {facility.name}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {facility.description}
                        </TableCell>
                        <TableCell>
                          {getCapacityBadge(facility.capacity)}
                        </TableCell>
                        <TableCell>
                          {facility.usageFee ? facility.usageFee : t('admin.facilities.free', 'Miễn phí')}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {facility.otherDetails}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Link href={`/admin-dashboard/facilities/${facility.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin-dashboard/facilities/edit/${facility.id}`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDelete(facility.id)}
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

        {/* Facility Bookings Table (10 booking gần nhất) */}
        <Card className="mt-8">
            <CardHeader>
            <CardTitle>{t('admin.facilities.recentBookingsTitle', '10 tiện ích cư dân đã đặt gần nhất')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingBookings ? (
              <div className="text-center py-8">{t('admin.loading', 'Đang tải...')}</div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8">{t('admin.noData', 'Không có dữ liệu')}</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('admin.facilities.recent.resident', 'Cư dân')}</TableHead>
                      <TableHead>{t('admin.facilities.recent.facility', 'Tiện ích')}</TableHead>
                      <TableHead>{t('admin.facilities.recent.bookingTime', 'Thời gian đặt')}</TableHead>
                      <TableHead>{t('admin.facilities.recent.numPeople', 'Số người')}</TableHead>
                      <TableHead>{t('admin.facilities.recent.status', 'Trạng thái')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.slice(0, 10).map((booking: any) => (
                        <TableRow key={booking.id}>
                        <TableCell>{booking.residentName || booking.user?.username || booking.user?.email || booking.user?.phoneNumber || t('common.anonymous', 'Ẩn danh')}</TableCell>
                        <TableCell>{booking.facilityName || booking.facility?.name}</TableCell>
                        <TableCell>
                          {(booking.startTime ? new Date(booking.startTime).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US') : (booking.bookingTime ? new Date(booking.bookingTime).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US') : '-')) +
                          (booking.endTime ? ' - ' + new Date(booking.endTime).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US') : '')}
                        </TableCell>
                        <TableCell>{booking.numberOfPeople}</TableCell>
                        <TableCell>{booking.status}</TableCell>
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