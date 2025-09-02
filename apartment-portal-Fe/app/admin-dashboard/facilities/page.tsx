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
  Building2,
  Users,
  DollarSign,
  Filter,
  MapPin,
  XCircle,
  Download,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  EyeOff,
  EyeIcon
} from 'lucide-react';
import Link from 'next/link';
import { facilitiesApi, Facility } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

import * as XLSX from 'xlsx';
import { useFacilities } from '@/hooks/use-facilities';

export default function FacilitiesPage() {
  return (
    <AdminGuard>
      <FacilitiesPageContent />
    </AdminGuard>
  );
}

function FacilitiesPageContent() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { 
    facilities, 
    loading, 
    error, 
    deleteFacility, 
    toggleFacilityVisibility,
    fetchFacilities 
  } = useFacilities();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCapacity, setFilterCapacity] = useState('all');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const handleDelete = async (id: number) => {
    if (window.confirm(t('admin.facilities.confirmDelete', 'Bạn có chắc chắn muốn xóa tiện ích này?'))) {
      try {
        await deleteFacility(id);
        toast({
          title: t('admin.success.delete', 'Thành công'),
          description: t('admin.facilities.deleteSuccess', 'Đã xóa tiện ích thành công'),
        });
      } catch (error) {
        toast({
          title: t('admin.error.delete', 'Lỗi'),
          description: t('admin.facilities.deleteError', 'Không thể xóa tiện ích'),
          variant: "destructive",
        });
      }
    }
  };

  const handleToggleVisibility = async (id: number) => {
    try {
      await toggleFacilityVisibility(id);
      toast({
        title: t('admin.success.update', 'Thành công'),
        description: t('admin.facilities.visibilityToggleSuccess', 'Đã cập nhật trạng thái hiển thị'),
      });
    } catch (error) {
      toast({
        title: t('admin.error.update', 'Lỗi'),
        description: t('admin.facilities.visibilityToggleError', 'Không thể cập nhật trạng thái hiển thị'),
        variant: "destructive",
      });
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Tên', 'Mô tả', 'Vị trí', 'Sức chứa', 'Phí sử dụng', 'Chi tiết khác'];
    const csvContent = [
      headers.join(','),
      ...filteredFacilities.map(f => [
        f.id,
        `"${f.name}"`,
        `"${f.description || ''}"`,
        `"${f.location || ''}"`,
        f.capacity,
        f.usageFee || 0,
        `"${f.otherDetails || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `facilities_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: t('admin.success.export', 'Thành công'),
      description: t('admin.facilities.exportSuccess', 'Đã xuất dữ liệu thành công'),
    });
  };

  const exportToExcel = () => {
    // Prepare data for Excel
    const excelData = filteredFacilities.map(facility => ({
      'ID': facility.id,
      'Tên tiện ích': facility.name,
      'Mô tả': facility.description || '',
      'Vị trí': facility.location || '',
      'Sức chứa': facility.capacity,
      'Phí sử dụng': facility.usageFee || 0,
      'Chi tiết khác': facility.otherDetails || '',
      'Ngày xuất': new Date().toLocaleDateString('vi-VN')
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 8 },  // ID
      { wch: 25 }, // Tên tiện ích
      { wch: 40 }, // Mô tả
      { wch: 20 }, // Vị trí
      { wch: 12 }, // Sức chứa
      { wch: 15 }, // Phí sử dụng
      { wch: 30 }, // Chi tiết khác
      { wch: 15 }  // Ngày xuất
    ];
    worksheet['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Tiện ích');

    // Generate filename
    const fileName = `facilities_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Save file
    XLSX.writeFile(workbook, fileName);

    toast({
      title: t('admin.success.export', 'Thành công'),
      description: t('admin.facilities.excelExportSuccess', 'Đã xuất Excel thành công'),
    });
  };

  const filteredFacilities = facilities.filter(facility => {
    const matchesSearch = facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         facility.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         facility.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCapacity = filterCapacity === 'all' || 
                           (filterCapacity === 'small' && facility.capacity <= 20) ||
                           (filterCapacity === 'medium' && facility.capacity > 20 && facility.capacity <= 50) ||
                           (filterCapacity === 'large' && facility.capacity > 50);
    return matchesSearch && matchesCapacity;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredFacilities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageFacilities = filteredFacilities.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCapacity]);

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

  // Calculate statistics
  const totalFacilities = facilities.length;
  const totalCapacity = facilities.reduce((sum, f) => sum + f.capacity, 0);
  const averageFee = facilities.length > 0 
    ? facilities.reduce((sum, f) => sum + (f.usageFee || 0), 0) / facilities.length 
    : 0;
  const facilitiesWithLocation = facilities.filter(f => f.location).length;

  if (loading) {
    return (
      <AdminLayout title={t('admin.facilities.title', 'Quản lý tiện ích')}>
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

          {/* Table Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                    <div className="flex space-x-2 ml-auto">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={t('admin.facilities.title', 'Quản lý tiện ích')}>
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('admin.facilities.title', 'Quản lý tiện ích')}</h1>
            <p className="text-gray-600 mt-2">{t('admin.facilities.listDesc', 'Quản lý tất cả tiện ích trong chung cư')}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={exportToCSV}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {t('admin.facilities.exportCSV', 'Xuất CSV')}
            </Button>
            <Button 
              variant="outline" 
              onClick={exportToExcel}
              className="flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              {t('admin.facilities.exportExcel', 'Xuất Excel')}
            </Button>
            <Link href="/admin-dashboard/facilities/create">
              <Button className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200">
                <Plus className="h-4 w-4" />
                {t('admin.facilities.create', 'Tạo tiện ích mới')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t('admin.facilities.stats.total', 'Tổng tiện ích')}
              </CardTitle>
              <Building2 className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{totalFacilities}</div>
              <p className="text-xs text-gray-500 mt-1">
                {t('admin.facilities.stats.totalDesc', 'Tiện ích trong hệ thống')}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t('admin.facilities.stats.location', 'Có vị trí')}
              </CardTitle>
              <MapPin className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{facilitiesWithLocation}</div>
              <p className="text-xs text-gray-500 mt-1">
                {t('admin.facilities.stats.locationDesc', 'Tiện ích có vị trí')}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t('admin.facilities.stats.capacity', 'Tổng sức chứa')}
              </CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{totalCapacity.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">
                {t('admin.facilities.stats.capacityDesc', 'Người có thể sử dụng')}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t('admin.facilities.stats.avgFee', 'Phí trung bình')}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">${averageFee.toFixed(0)}</div>
              <p className="text-xs text-gray-500 mt-1">
                {t('admin.facilities.stats.avgFeeDesc', 'Phí sử dụng trung bình')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and filters */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="h-5 w-5 text-blue-600" />
              {t('admin.filters.searchAndFilter', 'Tìm kiếm & lọc')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t('admin.facilities.searchPlaceholder', 'Tìm kiếm theo tên, mô tả, vị trí...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={filterCapacity}
                  onChange={(e) => setFilterCapacity(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="all">{t('admin.facilities.capacity.all', 'Tất cả sức chứa')}</option>
                  <option value="small">{t('admin.facilities.capacity.small', 'Nhỏ (1-20)')}</option>
                  <option value="medium">{t('admin.facilities.capacity.medium', 'Trung bình (21-50)')}</option>
                  <option value="large">{t('admin.facilities.capacity.large', 'Lớn (>50)')}</option>
                </select>
              </div>

              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setFilterCapacity('all');
                }}
                className="flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                {t('admin.filters.clear', 'Xóa bộ lọc')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Facilities Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b border-gray-100">
            <CardTitle className="flex items-center justify-between">
              <span className="text-lg">{t('admin.facilities.list', 'Danh sách tiện ích')}</span>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                  {filteredFacilities.length} {t('admin.facilities.count', 'tiện ích')}
                </Badge>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{t('admin.pagination.itemsPerPage', 'Hiển thị:')}</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="text-sm border border-gray-200 rounded px-2 py-1"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredFacilities.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || filterCapacity !== 'all'
                    ? t('admin.facilities.noResults', 'Không tìm thấy tiện ích')
                    : t('admin.facilities.noData', 'Chưa có tiện ích nào')}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchTerm || filterCapacity !== 'all'
                    ? t('admin.facilities.noResultsDesc', 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm')
                    : t('admin.facilities.noDataDesc', 'Bắt đầu bằng cách tạo tiện ích đầu tiên')}
                </p>
                {!searchTerm && filterCapacity === 'all' && (
                  <Link href="/admin-dashboard/facilities/create">
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      {t('admin.facilities.create', 'Tạo tiện ích mới')}
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                                                 <TableHead className="font-semibold text-gray-700">{t('admin.facilities.name', 'Tên tiện ích')}</TableHead>
                         <TableHead className="font-semibold text-gray-700">{t('admin.facilities.description', 'Mô tả')}</TableHead>
                         <TableHead className="font-semibold text-gray-700">{t('admin.facilities.location', 'Vị trí')}</TableHead>
                         <TableHead className="font-semibold text-gray-700">{t('admin.facilities.capacity', 'Sức chứa')}</TableHead>
                         <TableHead className="font-semibold text-gray-700">{t('admin.facilities.usageFee', 'Phí sử dụng')}</TableHead>
                         <TableHead className="font-semibold text-gray-700">{t('admin.facilities.status', 'Trạng thái')}</TableHead>
                         <TableHead className="text-right font-semibold text-gray-700">{t('admin.action.actions', 'Thao tác')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentPageFacilities.map((facility) => (
                        <TableRow key={facility.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <TableCell className="font-medium">
                            <Link 
                              href={`/admin-dashboard/facilities/${facility.id}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline transition-colors duration-150"
                            >
                              {facility.name}
                            </Link>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate" title={facility.description}>
                              {facility.description || t('admin.facilities.noDescription', 'Không có mô tả')}
                            </div>
                          </TableCell>
                          <TableCell>{facility.location}</TableCell>
                          <TableCell className="text-center">{facility.capacity}</TableCell>
                          <TableCell className="text-center">
                            {getFeeDisplay(facility.usageFee)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={facility.isVisible ? "default" : "secondary"}>
                              {facility.isVisible ? t('admin.facilities.visible', 'Hiển thị') : t('admin.facilities.hidden', 'Ẩn')}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Link href={`/admin-dashboard/facilities/edit/${facility.id}`}>
                                <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleVisibility(facility.id)}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                title={facility.isVisible ? t('admin.facilities.hide', 'Ẩn') : t('admin.facilities.show', 'Hiện')}
                              >
                                {facility.isVisible ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <EyeIcon className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(facility.id)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="border-t border-gray-100 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {t('admin.pagination.showing', 'Hiển thị')} {startIndex + 1} - {Math.min(endIndex, filteredFacilities.length)} {t('admin.pagination.of', 'của')} {filteredFacilities.length} {t('admin.pagination.results', 'kết quả')}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="flex items-center gap-1"
                        >
                          <ChevronLeft className="h-4 w-4" />
                          {t('admin.pagination.previous', 'Trước')}
                        </Button>
                        
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNumber;
                            if (totalPages <= 5) {
                              pageNumber = i + 1;
                            } else if (currentPage <= 3) {
                              pageNumber = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNumber = totalPages - 4 + i;
                            } else {
                              pageNumber = currentPage - 2 + i;
                            }
                            
                            return (
                              <Button
                                key={pageNumber}
                                variant={currentPage === pageNumber ? "default" : "outline"}
                                size="sm"
                                onClick={() => setCurrentPage(pageNumber)}
                                className="w-8 h-8 p-0"
                              >
                                {pageNumber}
                              </Button>
                            );
                          })}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="flex items-center gap-1"
                        >
                          {t('admin.pagination.next', 'Sau')}
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}