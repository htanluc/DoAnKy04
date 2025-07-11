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
  Trash2, 
  Eye,
  Filter,
  Calendar,
  Clock
} from 'lucide-react';
import Link from 'next/link';
import { facilityBookingsApi, FacilityBooking, BookingStatus } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function FacilityBookingsPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<FacilityBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await facilityBookingsApi.getAll();
      setBookings(data);
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
    const matchesSearch = booking.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.purpose.toLowerCase().includes(searchTerm.toLowerCase());
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
            <h2 className="text-2xl font-bold text-gray-900">
              {t('admin.facility-bookings.list')}
            </h2>
            <p className="text-gray-600">
              Quản lý tất cả đặt tiện ích trong chung cư
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm theo cư dân, tiện ích, mục đích..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="PENDING">Chờ xác nhận</option>
                  <option value="APPROVED">Đã xác nhận</option>
                  <option value="REJECTED">Từ chối</option>
                  <option value="CANCELLED">Đã hủy</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Facility Bookings Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Danh sách đặt tiện ích ({filteredBookings.length})</span>
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
                      <TableHead>Cư dân</TableHead>
                      <TableHead>Tiện ích</TableHead>
                      <TableHead>Thời gian bắt đầu</TableHead>
                      <TableHead>Thời gian kết thúc</TableHead>
                      <TableHead>Mục đích</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">
                          {booking.residentName}
                        </TableCell>
                        <TableCell>
                          {booking.facilityName}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3 text-gray-500" />
                            <span>{formatDateTime(booking.startTime)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-gray-500" />
                            <span>{formatDateTime(booking.endTime)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {booking.purpose}
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