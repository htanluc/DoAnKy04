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
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plus, 
  Search, 
  Edit, 
  Eye,
  Filter,
  Users,
  AlertCircle,
  Home,
  Building2,
  MapPin,
  Square,
  DollarSign,
  RefreshCw,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Apartment {
  id: number;
  unitNumber: string;
  building?: string;
  floor: number;
  area: number;
  status: string;
  type: string;
  price: number;
}

export default function ApartmentsPage() {
  return (
    <AdminGuard>
      <ApartmentsPageContent />
    </AdminGuard>
  );
}

function ApartmentsPageContent() {
  const { t } = useLanguage();
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    loadApartments();
  }, []);

  const loadApartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch('/api/admin/apartments');
      if (response.ok) {
        const data = await response.json();
        setApartments(data);
      } else {
        throw new Error('Failed to fetch apartments');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch apartments');
      setApartments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadApartments();
    setIsRefreshing(false);
  };

  const filteredApartments = apartments.filter(apartment => {
    const matchesSearch = apartment.unitNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (apartment.building && apartment.building.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'all' || apartment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredApartments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentApartments = filteredApartments.slice(startIndex, endIndex);

  // Reset to first page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OCCUPIED':
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
          <Users className="w-3 h-3 mr-1" />
          {t('admin.apartments.status.OCCUPIED', 'Có người ở')}
        </Badge>;
      case 'VACANT':
        return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100">
          <Home className="w-3 h-3 mr-1" />
          {t('admin.apartments.status.VACANT', 'Trống')}
        </Badge>;
      case 'MAINTENANCE':
        return <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100">
          <AlertCircle className="w-3 h-3 mr-1" />
          {t('admin.apartments.status.MAINTENANCE', 'Bảo trì')}
        </Badge>;
      default:
        return <Badge className="bg-gray-50 text-gray-700 border-gray-200">{status}</Badge>;
    }
  };

  // Calculate statistics
  const totalApartments = apartments.length;
  const occupiedApartments = apartments.filter(a => a.status === 'OCCUPIED').length;
  const vacantApartments = apartments.filter(a => a.status === 'VACANT').length;
  const maintenanceApartments = apartments.filter(a => a.status === 'MAINTENANCE').length;
  const totalArea = apartments.reduce((sum, a) => sum + a.area, 0);
  const averagePrice = apartments.length > 0 ? apartments.reduce((sum, a) => sum + a.price, 0) / apartments.length : 0;

  // Pagination Controls Component
  const PaginationControls = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between px-2 py-4">
        <div className="text-sm text-gray-700">
          {t('admin.pagination.showing', 'Hiển thị')} {startIndex + 1} - {Math.min(endIndex, filteredApartments.length)} {t('admin.pagination.of', 'trong tổng số')} {filteredApartments.length} {t('admin.apartments.results', 'kết quả')}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
            title={t('admin.pagination.first', 'Trang đầu')}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            title={t('admin.pagination.previous', 'Trang trước')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {/* Page numbers */}
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(pageNum)}
                  className="w-8 h-8 p-0"
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            title={t('admin.pagination.next', 'Trang sau')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
            title={t('admin.pagination.last', 'Trang cuối')}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <AdminLayout title={t('admin.apartments.title')}>
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>

          {/* Stats skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-20" />
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-48" />
              </div>
            </CardContent>
          </Card>

          {/* Table skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-8 w-24" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title={t('admin.apartments.title')}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('admin.error.load', 'Lỗi tải dữ liệu')}
              </h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="space-x-3">
                <Button 
                  onClick={() => loadApartments()} 
                  variant="outline"
                >
                  {t('admin.action.retry','Thử lại')}
                </Button>
                <Button onClick={handleRefresh}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t('admin.action.refresh', 'Làm mới')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={t('admin.apartments.title')}>
      <div className="space-y-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen p-6">
        {/* Header with actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t('admin.apartments.title', 'Quản lý căn hộ')}
            </h1>
            <p className="text-gray-600 text-lg">
              {t('admin.apartments.listDesc', 'Quản lý thông tin căn hộ trong hệ thống')}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              className="border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {t('admin.action.refresh', 'Làm mới')}
            </Button>
            <Link href="/admin-dashboard/apartments/create">
              <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                <Plus className="h-4 w-4" />
                {t('admin.apartments.addButton', 'Thêm Căn Hộ')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-100">
                {t('admin.apartments.stats.total', 'Tổng số căn hộ')}
              </CardTitle>
              <Building2 className="h-8 w-8 text-blue-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalApartments}</div>
              <p className="text-xs text-blue-200 mt-1">
                {t('admin.apartments.stats.totalDesc', 'Tất cả căn hộ trong hệ thống')}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-100">
                {t('admin.apartments.stats.occupied', 'Căn hộ có người ở')}
              </CardTitle>
              <Users className="h-8 w-8 text-emerald-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{occupiedApartments}</div>
              <p className="text-xs text-emerald-200 mt-1">
                {totalApartments > 0 ? `${((occupiedApartments / totalApartments) * 100).toFixed(1)}%` : '0%'} {t('admin.apartments.stats.ofTotal', 'tổng số')}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-100">
                {t('admin.apartments.stats.vacant', 'Căn hộ trống')}
              </CardTitle>
              <Home className="h-8 w-8 text-amber-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{vacantApartments}</div>
              <p className="text-xs text-amber-200 mt-1">
                {totalApartments > 0 ? `${((vacantApartments / totalApartments) * 100).toFixed(1)}%` : '0%'} {t('admin.apartments.stats.ofTotal', 'tổng số')}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-0 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-100">
                {t('admin.apartments.stats.totalArea', 'Tổng diện tích')}
              </CardTitle>
              <Square className="h-8 w-8 text-purple-200" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalArea.toLocaleString()}</div>
              <p className="text-xs text-purple-200 mt-1">
                {t('admin.apartments.stats.areaDesc', 'm² - Trung bình')} {(totalArea / totalApartments).toFixed(1)} {t('admin.apartments.stats.perApartment', 'm²/căn')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and filters */}
        <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-white shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl text-gray-800">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Search className="h-6 w-6 text-blue-600" />
              </div>
              {t('admin.filters.searchAndFilter', 'Tìm kiếm & Lọc')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  placeholder={t('admin.apartments.searchPlaceholder', 'Tìm theo mã căn hộ, tòa nhà...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-14 text-lg border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl transition-all duration-200"
                />
              </div>
              <div className="lg:w-56">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="h-14 border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 rounded-xl text-lg transition-all duration-200">
                    <SelectValue placeholder={t('admin.apartments.status.all', 'Lọc theo trạng thái')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('admin.apartments.status.all', 'Tất cả trạng thái')}</SelectItem>
                    <SelectItem value="OCCUPIED">{t('admin.apartments.status.OCCUPIED', 'Có người ở')}</SelectItem>
                    <SelectItem value="VACANT">{t('admin.apartments.status.VACANT', 'Trống')}</SelectItem>
                    <SelectItem value="MAINTENANCE">{t('admin.apartments.status.MAINTENANCE', 'Bảo trì')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Apartments table */}
        <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-white shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <span className="text-xl text-gray-800">
                {t('admin.apartments.list', 'Danh sách căn hộ')} 
                <span className="text-blue-600 font-semibold ml-3 bg-blue-100 px-3 py-1 rounded-full text-sm">
                  {filteredApartments.length} {t('admin.apartments.results', 'kết quả')}
                </span>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredApartments.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Building2 className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {searchTerm || filterStatus !== 'all' 
                    ? t('admin.apartments.empty.search', 'Không tìm thấy căn hộ nào phù hợp') 
                    : t('admin.apartments.empty.noData', 'Chưa có căn hộ nào')}
                </h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                  {searchTerm || filterStatus !== 'all' 
                    ? t('admin.apartments.empty.searchHint', 'Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc') 
                    : t('admin.apartments.empty.noDataHint', 'Bắt đầu bằng cách thêm căn hộ đầu tiên vào hệ thống')}
                </p>
                {!searchTerm && filterStatus === 'all' && (
                  <Link href="/admin-dashboard/apartments/create">
                    <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                      <Plus className="w-5 h-5 mr-2" />
                      {t('admin.apartments.addButton', 'Thêm Căn Hộ')}
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div className="rounded-xl border-2 border-gray-100 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-gray-50 to-blue-50 hover:from-gray-50 hover:to-blue-50">
                        <TableHead className="font-bold text-gray-800 text-lg py-4">{t('admin.apartments.columns.unitNumber', 'Mã Căn Hộ')}</TableHead>
                        <TableHead className="font-bold text-gray-800 text-lg py-4">{t('admin.apartments.columns.area', 'Diện Tích (m²)')}</TableHead>
                        <TableHead className="font-bold text-gray-800 text-lg py-4">{t('admin.apartments.columns.status', 'Trạng Thái')}</TableHead>
                        <TableHead className="font-bold text-gray-800 text-lg py-4 text-right">{t('admin.apartments.columns.actions', 'Thao Tác')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentApartments.map((apartment) => (
                        <TableRow key={apartment.id} className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 border-b border-gray-100">
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Home className="h-5 w-5 text-blue-600" />
                              </div>
                              <span className="font-semibold text-gray-900 text-lg">{apartment.unitNumber}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <Square className="h-5 w-5 text-purple-600" />
                              </div>
                              <span className="font-medium text-gray-700 text-lg">{apartment.area} m²</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            {getStatusBadge(apartment.status)}
                          </TableCell>
                          <TableCell className="py-4 text-right">
                            <div className="flex items-center justify-end">
                              <Link href={`/admin-dashboard/apartments/${apartment.id}`}>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-10 w-10 p-0 border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 transform hover:scale-110" 
                                  title={t('admin.action.viewDetails', 'Xem chi tiết')}
                                >
                                  <Eye className="h-5 w-5 text-blue-600" />
                                </Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination Controls */}
                <PaginationControls />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
} 