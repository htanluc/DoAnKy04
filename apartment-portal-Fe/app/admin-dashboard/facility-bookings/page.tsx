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
import { Separator } from '@/components/ui/separator';
import { 
  Search, 
  Edit, 
  Eye,
  Filter,
  Calendar,
  Clock,
  Building2,
  Users,
  CalendarDays,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  MoreHorizontal,
  FileText,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { facilityBookingsApi, FacilityBooking, BookingStatus } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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

  // Pagination logic
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBookings = filteredBookings.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 flex items-center space-x-1 px-3 py-1">
            <AlertCircle className="h-3 w-3" />
            <span>Chờ xác nhận</span>
          </Badge>
        );
      case 'APPROVED':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center space-x-1 px-3 py-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>Đã xác nhận</span>
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center space-x-1 px-3 py-1">
            <XCircle className="h-3 w-3" />
            <span>Từ chối</span>
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200 flex items-center space-x-1 px-3 py-1">
            <XCircle className="h-3 w-3" />
            <span>Đã hủy</span>
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200 flex items-center space-x-1 px-3 py-1">
            <span>{status}</span>
          </Badge>
        );
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

  const getStatusText = (status: BookingStatus) => {
    switch (status) {
      case 'PENDING':
        return 'Chờ xác nhận';
      case 'APPROVED':
        return 'Đã xác nhận';
      case 'REJECTED':
        return 'Từ chối';
      case 'CANCELLED':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const exportToExcel = () => {
    try {
      const exportData = filteredBookings.map((booking, index) => ({
        'STT': startIndex + index + 1,
        'Cư dân': booking.resident?.name || '-',
        'Tiện ích': booking.facility?.name || '-',
        'Thời gian bắt đầu': formatDateTime(booking.start_time),
        'Thời gian kết thúc': formatDateTime(booking.end_time),
        'Mục đích': booking.purpose || '-',
        'Trạng thái': getStatusText(booking.status)
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách đặt tiện ích');

      const fileName = `danh-sach-dat-tien-ich-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast({
        title: t('admin.success.export', 'Thành công'),
        description: 'Đã xuất Excel thành công',
      });
    } catch (error) {
      toast({
        title: t('admin.error.export', 'Lỗi'),
        description: 'Không thể xuất Excel',
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <AdminLayout title={t('admin.facility-bookings.title')}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
              <CalendarDays className="h-6 w-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900">{t('admin.loading')}</p>
              <p className="text-sm text-gray-500">Đang tải danh sách đặt tiện ích</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={t('admin.facility-bookings.title')}>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <CalendarDays className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {t('admin.facility-bookings.list')}
                  </h1>
                  <p className="text-gray-600">
                    {t('admin.facility-bookings.listDesc')}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button 
                onClick={exportToExcel}
                variant="outline" 
                size="sm"
                className="bg-white/80 hover:bg-white border-green-300 text-green-700 hover:text-green-800"
              >
                <Download className="h-4 w-4 mr-2" />
                {t('admin.export.excel', 'Xuất Excel')}
              </Button>
              <Badge variant="outline" className="px-3 py-1 bg-white/80">
                <Users className="h-3 w-3 mr-1" />
                {filteredBookings.length} {t('admin.counter.bookings', 'đặt chỗ')}
              </Badge>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <Card className="shadow-sm border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Search className="h-4 w-4 text-blue-600" />
              </div>
              <CardTitle className="text-lg font-semibold text-gray-900">
                {t('admin.filters.searchAndFilter', 'Tìm kiếm & lọc')}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t('admin.facility-bookings.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">{t('admin.filters.statusLabel', 'Trạng thái:')}</span>
                </div>
                <select
                  title="Trạng thái đặt tiện ích"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 bg-white"
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
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 text-green-600" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  {t('admin.facility-bookings.list')} ({filteredBookings.length})
                </CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="px-3 py-1">
                  <Building2 className="h-3 w-3 mr-1" />
                  {filteredBookings.length} {t('admin.counter.bookings', 'đặt chỗ')}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {currentBookings.length === 0 ? (
              <div className="flex items-center justify-center py-16">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <CalendarDays className="h-8 w-8 text-gray-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium text-gray-900">Không có đặt chỗ nào</h3>
                    <p className="text-gray-500">Chưa có đặt chỗ tiện ích nào được tìm thấy</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="font-semibold text-gray-700 py-4">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span>{t('admin.facility-bookings.columns.resident')}</span>
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4">
                        <div className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4 text-gray-500" />
                          <span>{t('admin.facility-bookings.columns.facility')}</span>
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>{t('admin.facility-bookings.columns.startTime')}</span>
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>{t('admin.facility-bookings.columns.endTime')}</span>
                        </div>
                      </TableHead>
                      <TableHead className="font-semibold text-gray-700 py-4">
                        <div className="flex items-center space-x-2">
                          <CheckCircle2 className="h-4 w-4 text-gray-500" />
                          <span>{t('admin.facility-bookings.columns.status')}</span>
                        </div>
                      </TableHead>
                      <TableHead className="text-right font-semibold text-gray-700 py-4">
                        <div className="flex items-center justify-end space-x-2">
                          <MoreHorizontal className="h-4 w-4 text-gray-500" />
                          <span>{t('admin.facility-bookings.columns.actions')}</span>
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentBookings.map((booking, index) => (
                      <TableRow key={booking.id} className="hover:bg-gray-50/50 transition-colors">
                        <TableCell className="py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {booking.resident?.name || '-'}
                              </p>
                              {booking.purpose && (
                                <p className="text-sm text-gray-500 truncate max-w-[200px]">
                                  {booking.purpose}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center space-x-2">
                            <Building2 className="h-4 w-4 text-gray-500" />
                            <span className="font-medium text-gray-900">
                              {booking.facility?.name || '-'}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-900">
                              {formatDateTime(booking.start_time)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-900">
                              {formatDateTime(booking.end_time)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          {getStatusBadge(booking.status)}
                        </TableCell>
                        <TableCell className="text-right py-4">
                          <div className="flex items-center justify-end space-x-2">
                            <Link href={`/admin-dashboard/facility-bookings/${booking.id}`}>
                              <Button variant="outline" size="sm" className="hover:bg-blue-50 hover:border-blue-300">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin-dashboard/facility-bookings/edit/${booking.id}`}>
                              <Button variant="outline" size="sm" className="hover:bg-green-50 hover:border-green-300">
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

        {/* Pagination */}
        {totalPages > 1 && (
          <Card className="shadow-sm border-0 bg-white">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>
                    {t('admin.pagination.showing', 'Hiển thị {start}-{end} trong tổng số {total} cư dân')
                      .replace('{start}', String(startIndex + 1))
                      .replace('{end}', String(Math.min(endIndex, filteredBookings.length)))
                      .replace('{total}', String(filteredBookings.length))
                      .replace('cư dân', t('admin.counter.bookings', 'đặt chỗ'))}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center space-x-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>{t('admin.pagination.previous', 'Trang trước')}</span>
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      // Show first page, last page, current page, and pages around current page
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <Button
                            key={page}
                            variant={page === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 p-0 ${
                              page === currentPage
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </Button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span key={page} className="text-gray-400">
                            ...
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center space-x-1"
                  >
                    <span>{t('admin.pagination.next', 'Trang sau')}</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
} 