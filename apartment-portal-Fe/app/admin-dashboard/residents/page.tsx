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
  Trash2, 
  Eye,
  Filter,
  AlertCircle,
  Users,
  UserCheck,
  UserX,
  Download,
  RefreshCw,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileSpreadsheet,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { useResidents, Resident } from '@/hooks/use-residents';
import { getResidentIdCard, formatIdCard } from '@/lib/resident-utils';
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
import { 
  exportResidentsToExcel, 
  exportFilteredResidentsToExcel, 
  exportPaginatedResidentsToExcel,
  exportResidentsStatsToExcel 
} from '@/lib/excel-export';
import { useToast } from '@/hooks/use-toast';

export default function ResidentsPage() {
  return (
    <AdminGuard>
      <ResidentsPageContent />
    </AdminGuard>
  );
}

function ResidentsPageContent() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { residents, loading, error, getAllResidents, deleteResident } = useResidents();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const itemsPerPage = 10;

  const filteredResidents = residents.filter(resident => {
    const idCard = getResidentIdCard(resident);
    const matchesSearch = resident.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (idCard && idCard.includes(searchTerm)) ||
                         resident.phoneNumber.includes(searchTerm) ||
                         resident.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || resident.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredResidents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentResidents = filteredResidents.slice(startIndex, endIndex);

  // Reset to first page when search/filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const activeResidents = residents.filter(r => r.status === 'ACTIVE').length;
  const inactiveResidents = residents.filter(r => r.status === 'INACTIVE').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
          <UserCheck className="w-3 h-3 mr-1" />
          {t('admin.status.active')}
        </Badge>;
      case 'INACTIVE':
        return <Badge className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100">
          <UserX className="w-3 h-3 mr-1" />
          {t('admin.status.inactive')}
        </Badge>;
      default:
        return <Badge className="bg-gray-50 text-gray-700 border-gray-200">{status}</Badge>;
    }
  };

  const handleDeleteResident = async (id: number) => {
    if (confirm(t('admin.residents.delete.confirm', 'Bạn có chắc chắn muốn xóa cư dân này?'))) {
      const success = await deleteResident(id);
      if (success) {
        getAllResidents();
      }
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await getAllResidents();
    setIsRefreshing(false);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  // Excel Export Functions
  const handleExportAll = async () => {
    try {
      setIsExporting(true);
      exportResidentsToExcel(residents, {
        fileName: `danh-sach-cu-dan-tat-ca-${new Date().toISOString().split('T')[0]}`
      });
      toast({
        title: t('admin.export.success.title', 'Xuất Excel thành công'),
        description: t('admin.export.success.all', 'Đã xuất tất cả cư dân ra file Excel'),
        variant: "default",
      });
    } catch (error) {
      toast({
        title: t('admin.export.error.title', 'Lỗi xuất Excel'),
        description: error instanceof Error ? error.message : t('admin.export.error.general', 'Không thể xuất file Excel'),
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportFiltered = async () => {
    try {
      setIsExporting(true);
      exportFilteredResidentsToExcel(filteredResidents, searchTerm, filterStatus, {
        fileName: `cu-dan-da-loc-${new Date().toISOString().split('T')[0]}`
      });
      toast({
        title: t('admin.export.success.title', 'Xuất Excel thành công'),
        description: t('admin.export.success.filtered', 'Đã xuất cư dân đã lọc ra file Excel'),
        variant: "default",
      });
    } catch (error) {
      toast({
        title: t('admin.export.error.title', 'Lỗi xuất Excel'),
        description: error instanceof Error ? error.message : t('admin.export.error.general', 'Không thể xuất file Excel'),
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCurrentPage = async () => {
    try {
      setIsExporting(true);
      exportPaginatedResidentsToExcel(residents, currentPage, itemsPerPage, searchTerm, filterStatus, {
        fileName: `cu-dan-trang-${currentPage}-${new Date().toISOString().split('T')[0]}`
      });
      toast({
        title: t('admin.export.success.title', 'Xuất Excel thành công'),
        description: t('admin.export.success.page', 'Đã xuất cư dân trang {page} ra file Excel', { page: currentPage }),
        variant: "default",
      });
    } catch (error) {
      toast({
        title: t('admin.export.error.title', 'Lỗi xuất Excel'),
        description: error instanceof Error ? error.message : t('admin.export.error.general', 'Không thể xuất file Excel'),
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportStats = async () => {
    try {
      setIsExporting(true);
      exportResidentsStatsToExcel(residents, {
        fileName: `thong-ke-cu-dan-${new Date().toISOString().split('T')[0]}`
      });
      toast({
        title: t('admin.export.success.title', 'Xuất Excel thành công'),
        description: t('admin.export.success.stats', 'Đã xuất báo cáo thống kê ra file Excel'),
        variant: "default",
      });
    } catch (error) {
      toast({
        title: t('admin.export.error.title', 'Lỗi xuất Excel'),
        description: error instanceof Error ? error.message : t('admin.export.error.general', 'Không thể xuất file Excel'),
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const PaginationControls = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisiblePages = 5;
      
      if (totalPages <= maxVisiblePages) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 3; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = currentPage - 1; i <= currentPage + 1; i++) {
            pages.push(i);
          }
          pages.push('...');
          pages.push(totalPages);
        }
      }
      
      return pages;
    };

    return (
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <span>
            {t('admin.pagination.showing', 'Hiển thị {start}-{end} trong tổng số {total} cư dân', {
              start: startIndex + 1,
              end: Math.min(endIndex, filteredResidents.length),
              total: filteredResidents.length
            })}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
            title={t('admin.pagination.first', 'Trang đầu')}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
            title={t('admin.pagination.previous', 'Trang trước')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === '...' ? (
                <span className="px-2 py-1 text-gray-500">...</span>
              ) : (
                <Button
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => goToPage(page as number)}
                  className="h-8 w-8 p-0"
                >
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0"
            title={t('admin.pagination.next', 'Trang sau')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(totalPages)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0"
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
      <AdminLayout title={t('admin.residents.title')}>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
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
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-8 w-20" />
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
      <AdminLayout title={t('admin.residents.title')}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6 text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t('admin.error.load')}
              </h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="space-x-3">
                <Button 
                  onClick={() => getAllResidents()} 
                  variant="outline"
                >
                  {t('admin.action.retry')}
                </Button>
                <Button onClick={handleRefresh}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {t('admin.action.refresh')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={t('admin.residents.title')}>
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              {t('admin.residents.title')}
            </h1>
            <p className="text-gray-600">
              {t('admin.residents.listDesc')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              {t('admin.action.refresh')}
            </Button>
            <Link href="/admin-dashboard/residents/create">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {t('admin.residents.create')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t('admin.residents.stats.total')}
              </CardTitle>
              <Users className="h-8 w-8 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{residents.length}</div>
              <p className="text-xs text-gray-500 mt-1">
                {t('admin.residents.stats.totalDesc')}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t('admin.residents.stats.active')}
              </CardTitle>
              <UserCheck className="h-8 w-8 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{activeResidents}</div>
              <p className="text-xs text-gray-500 mt-1">
                {activeResidents > 0 ? `${((activeResidents / residents.length) * 100).toFixed(1)}%` : '0%'} {t('admin.residents.stats.ofTotal')}
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t('admin.residents.stats.inactive')}
              </CardTitle>
              <UserX className="h-8 w-8 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{inactiveResidents}</div>
              <p className="text-xs text-gray-500 mt-1">
                {inactiveResidents > 0 ? `${((inactiveResidents / residents.length) * 100).toFixed(1)}%` : '0%'} {t('admin.residents.stats.ofTotal')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and filters */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Search className="h-5 w-5 text-gray-600" />
              {t('admin.action.search')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t('admin.residents.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="lg:w-48">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder={t('admin.residents.filter.byStatus')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('admin.residents.status.all')}</SelectItem>
                    <SelectItem value="ACTIVE">{t('admin.residents.status.ACTIVE')}</SelectItem>
                    <SelectItem value="INACTIVE">{t('admin.residents.status.INACTIVE')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Excel Export Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-11 px-6" disabled={isExporting}>
                    <Download className="w-4 h-4 mr-2" />
                    {isExporting ? t('admin.export.exporting') : t('admin.action.export')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={handleExportAll} className="cursor-pointer">
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    {t('admin.export.all')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportFiltered} className="cursor-pointer">
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    {t('admin.export.filtered')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportCurrentPage} className="cursor-pointer">
                    <FileSpreadsheet className="w-4 h-4 mr-2" />
                    {t('admin.export.currentPage')}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleExportStats} className="cursor-pointer">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    {t('admin.export.stats')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* Residents table */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="text-lg">
                {t('admin.residents.list')} 
                <span className="text-gray-500 font-normal ml-2">
                  ({filteredResidents.length} {t('admin.residents.results')})
                </span>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredResidents.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || filterStatus !== 'all' 
                    ? t('admin.residents.empty.search') 
                    : t('admin.residents.empty.noData')}
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || filterStatus !== 'all' 
                    ? t('admin.residents.empty.searchHint')
                    : t('admin.residents.empty.noDataHint')}
                </p>
                {!searchTerm && filterStatus === 'all' && (
                  <Link href="/admin-dashboard/residents/create">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      {t('admin.residents.create')}
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="font-semibold text-gray-900">{t('admin.residents.columns.fullName')}</TableHead>
                        <TableHead className="font-semibold text-gray-900">{t('admin.residents.columns.phone')}</TableHead>
                        <TableHead className="font-semibold text-gray-900">{t('admin.residents.columns.email')}</TableHead>
                        <TableHead className="font-semibold text-gray-900">{t('admin.residents.columns.idCard')}</TableHead>
                        <TableHead className="font-semibold text-gray-900">{t('admin.residents.columns.status')}</TableHead>
                        <TableHead className="font-semibold text-gray-900 text-right">{t('admin.residents.columns.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentResidents.map((resident) => (
                        <TableRow key={resident.id} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="font-medium text-gray-900">
                            <div>
                              <div className="font-semibold">{resident.fullName}</div>
                              <div className="text-sm text-gray-500">{t('admin.residents.id')}: {resident.id}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-700">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{resident.phoneNumber}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-700">
                            <div className="max-w-[200px] truncate" title={resident.email}>
                              {resident.email}
                            </div>
                          </TableCell>
                          <TableCell className="text-gray-700 font-mono text-sm">
                            {formatIdCard(getResidentIdCard(resident))}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(resident.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link href={`/admin-dashboard/residents/${resident.id}`}>
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0" title={t('admin.action.view')}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Link href={`/admin-dashboard/residents/${resident.id}/edit`}>
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0" title={t('admin.action.edit')}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm" className="h-8 w-8 p-0" title={t('admin.action.more')}>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem asChild>
                                    <Link href={`/admin-dashboard/residents/${resident.id}`} className="flex items-center">
                                      <Eye className="w-4 h-4 mr-2" />
                                      {t('admin.action.view')}
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem asChild>
                                    <Link href={`/admin-dashboard/residents/${resident.id}/edit`} className="flex items-center">
                                      <Edit className="w-4 h-4 mr-2" />
                                      {t('admin.action.edit')}
                                    </Link>
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleDeleteResident(resident.id)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    {t('admin.residents.delete.action')}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Pagination */}
                <div className="mt-4">
                  <PaginationControls />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
} 