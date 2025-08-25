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
  Edit, 
  Eye,
  Filter,
  Calendar,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { facilityBookingsApi, FacilityBooking, BookingStatus } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Giả định lại kiểu FacilityBooking cho đúng với dữ liệu thực tế
// Nếu cần, hãy sửa lại import FacilityBooking từ API cho đúng
type Resident = {
  id: string;
  name: string;
};

type Facility = {
  id: string;
  name: string;
};

// Mapping kiểu dữ liệu dùng cho UI
type FacilityBookingFixed = {
  id: string;
  resident: Resident;
  facility: Facility;
  start_time: string;
  end_time: string;
  purpose: string;
  status: BookingStatus;
};

export default function FacilityBookingsPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<FacilityBookingFixed[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Chuẩn hóa status từ BE sang UI
  const normalizeStatus = (status: string): BookingStatus => {
    const up = String(status || '').toUpperCase();
    switch (up) {
      case 'CONFIRMED':
      case 'APPROVE':
      case 'APPROVED':
        return 'APPROVED';
      case 'REJECTED':
      case 'REJECT':
        return 'REJECTED';
      case 'CANCELLED':
      case 'CANCELED':
        return 'CANCELLED';
      default:
        return 'PENDING';
    }
  };

  const addDurationToStart = (startIso: string, duration: number | undefined): string => {
    if (!startIso) return '';
    try {
      const start = new Date(startIso);
      const minutes = typeof duration === 'number' ? duration : 0;
      const end = new Date(start.getTime() + minutes * 60 * 1000);
      // Nếu back đã có endTime, sẽ dùng field đó ở dưới; còn không thì dùng tính toán này
      return end.toISOString();
    } catch {
      return '';
    }
  };

  // Sửa lỗi: Map lại dữ liệu trả về từ API sang FacilityBookingFixed
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data: FacilityBooking[] = await facilityBookingsApi.getAll();
      // Map dữ liệu sang FacilityBookingFixed theo nhiều khả năng field từ BE
      const mapped: FacilityBookingFixed[] = (data as any[]).map((item: any) => {
        const startRaw: string = item.bookingTime || item.startTime || item.start_time || item.startDateTime || '';
        const endRaw: string = item.endTime || item.end_time || '';
        const durationRaw: number | undefined = item.durationMinutes ?? item.duration ?? item.durationInMinutes;

        const startIso = startRaw;
        const endIso = endRaw || addDurationToStart(startIso, durationRaw);

        const residentName: string =
          item.user?.fullName ||
          item.userFullName ||
          item.user?.username ||
          item.username ||
          item.userName ||
          item.residentName ||
          '';

        const facilityName: string =
          item.facility?.name ||
          item.facilityName ||
          item.facility?.facilityName ||
          '';

        const purpose: string = item.purpose || item.reason || item.description || '';

        return {
          id: String(item.id ?? item.bookingId ?? ''),
          resident: residentName ? { id: String(item.user?.id ?? ''), name: residentName } : { id: '', name: '' },
          facility: facilityName ? { id: String(item.facility?.id ?? ''), name: facilityName } : { id: '', name: '' },
          start_time: startIso,
          end_time: endIso,
          purpose,
          status: normalizeStatus(item.status),
        };
      });
      setBookings(mapped);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách đặt tiện ích",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch =
      booking.resident?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.facility?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.purpose?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ xác nhận</Badge>;
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800">Đã xác nhận</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800">Từ chối</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-gray-100 text-gray-800">Đã hủy</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const formatDateTime = (dateTime: string) => {
    if (!dateTime) return '';
    return new Date(dateTime).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <AdminLayout title={t('admin.facility-bookings.title')}>
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
    <AdminLayout title={t('admin.facility-bookings.title')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('admin.facility-bookings.list')}</h2>
            <p className="text-gray-600">{t('admin.facility-bookings.listDesc')}</p>
          </div>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t('admin.facility-bookings.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  title="Trạng thái đặt tiện ích"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">{t('admin.facility-bookings.status.all')}</option>
                  <option value="PENDING">{t('admin.facility-bookings.status.PENDING')}</option>
                  <option value="APPROVED">{t('admin.facility-bookings.status.APPROVED')}</option>
                  <option value="REJECTED">{t('admin.facility-bookings.status.REJECTED')}</option>
                  <option value="CANCELLED">{t('admin.facility-bookings.status.CANCELLED')}</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Facility Bookings Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t('admin.facility-bookings.list')} ({filteredBookings.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredBookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">{t('admin.noData')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('admin.facility-bookings.columns.resident')}</TableHead>
                      <TableHead>{t('admin.facility-bookings.columns.facility')}</TableHead>
                      <TableHead>{t('admin.facility-bookings.columns.startTime')}</TableHead>
                      <TableHead>{t('admin.facility-bookings.columns.endTime')}</TableHead>
                      <TableHead>{t('admin.facility-bookings.columns.status')}</TableHead>
                      <TableHead className="text-right">{t('admin.facility-bookings.columns.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">
                          {booking.resident?.name || '-'}
                        </TableCell>
                        <TableCell>
                          {booking.facility?.name || '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3 text-gray-500" />
                            <span>{formatDateTime(booking.start_time)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-gray-500" />
                            <span>{formatDateTime(booking.end_time)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(booking.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Link href={`/admin-dashboard/facility-bookings/${booking.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin-dashboard/facility-bookings/edit/${booking.id}`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
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