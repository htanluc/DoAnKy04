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
  MoreHorizontal,
  Calendar,
  Users,
  Bell,
  TrendingUp,
  AlertTriangle,
  Info,

  RefreshCw,
  Download,
  Upload
} from 'lucide-react';
import Link from 'next/link';
import { announcementsApi, Announcement, AnnouncementType, TargetAudience } from '@/lib/api';
import { exportFilteredAnnouncementsToExcel, exportAnnouncementsStatsToExcel } from '@/lib/excel-export';
import { useToast } from '@/hooks/use-toast';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function AnnouncementsPage() {
  return (
    <AdminGuard>
      <AnnouncementsPageContent />
    </AdminGuard>
  );
}

function AnnouncementsPageContent() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');


  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [sortBy, setSortBy] = useState<'createdAt' | 'title' | 'type'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const pageSize = 12;

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await announcementsApi.getAll();
      setAnnouncements(data);
    } catch (error) {
      toast({
        title: t('admin.error.load','Lỗi'),
        description: t('admin.announcements.loadError','Không thể tải danh sách thông báo'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Reset về trang 1 khi filter/search thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  const handleDelete = async (id: number) => {
    if (window.confirm(t('admin.announcements.confirmDelete','Bạn có chắc chắn muốn xóa thông báo này?'))) {
      try {
        await announcementsApi.delete(id);
        toast({
          title: t('admin.success.delete','Thành công'),
          description: t('admin.announcements.deleteSuccess','Đã xóa thông báo'),
        });
        fetchAnnouncements();
      } catch (error) {
        toast({
          title: t('admin.error.delete','Lỗi'),
          description: t('admin.announcements.deleteError','Không thể xóa thông báo'),
          variant: "destructive",
        });
      }
    }
  };

  const handleExportExcel = () => {
    try {
      exportFilteredAnnouncementsToExcel(sortedAnnouncements, searchTerm, filterType, {
        fileName: `thong-bao-${new Date().toISOString().split('T')[0]}`,
        sheetName: 'Thông Báo'
      });
      
      toast({
        title: t('admin.success.export','Thành công'),
        description: t('admin.announcements.exportSuccess','Đã xuất Excel thành công'),
      });
    } catch (error) {
      toast({
        title: t('admin.error.export','Lỗi'),
        description: t('admin.announcements.exportError','Không thể xuất file Excel'),
        variant: "destructive",
      });
    }
  };

  const handleExportStatsExcel = () => {
    try {
      exportAnnouncementsStatsToExcel(announcements, {
        fileName: `thong-ke-thong-bao-${new Date().toISOString().split('T')[0]}`,
        sheetName: 'Thống Kê Thông Báo'
      });
      
      toast({
        title: t('admin.success.export','Thành công'),
        description: t('admin.announcements.exportStatsSuccess','Đã xuất thống kê Excel thành công'),
      });
    } catch (error) {
      toast({
        title: t('admin.error.export','Lỗi'),
        description: t('admin.announcements.exportError','Không thể xuất file thống kê Excel'),
        variant: "destructive",
      });
    }
  };



  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || announcement.type === filterType;
    
    return matchesSearch && matchesType;
  });

  // Sắp xếp theo logic mới
  const sortedAnnouncements = [...filteredAnnouncements].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'createdAt':
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
        break;
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'type':
        aValue = a.type;
        bValue = b.type;
        break;
      default:
        aValue = new Date(a.createdAt).getTime();
        bValue = new Date(b.createdAt).getTime();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Phân trang
  const totalPages = Math.max(1, Math.ceil(sortedAnnouncements.length / pageSize));
  const startIdx = (currentPage - 1) * pageSize;
  const pageAnnouncements = sortedAnnouncements.slice(startIdx, startIdx + pageSize);

  const getTypeBadge = (type: AnnouncementType) => {
    switch (type) {
      case 'NEWS':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1">
          <Info className="h-3 w-3" />
          {t('admin.announcements.type.news','Tin tức')}
        </Badge>;
      case 'REGULAR':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200 flex items-center gap-1">
          <Bell className="h-3 w-3" />
          {t('admin.announcements.type.regular','Thường')}
        </Badge>;
      case 'URGENT':
        return <Badge className="bg-red-100 text-red-800 border-red-200 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          {t('admin.announcements.type.urgent','Khẩn cấp')}
        </Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">{type}</Badge>;
    }
  };





  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStats = () => {
    const total = announcements.length;
    const active = announcements.filter(a => a.isActive).length;
    const urgent = announcements.filter(a => a.type === 'URGENT').length;
    const news = announcements.filter(a => a.type === 'NEWS').length;
    
    return { total, active, urgent, news };
  };

  const stats = getStats();

  if (loading) {
    return (
      <AdminLayout title={t('admin.announcements.title', 'Quản lý thông báo')}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">{t('admin.loading', 'Đang tải...')}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={t('admin.announcements.title', 'Quản lý thông báo')}>
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('admin.announcements.title', 'Quản lý thông báo')}</h1>
            <p className="text-gray-600 mt-2">{t('admin.announcements.listDesc', 'Quản lý tất cả thông báo trong hệ thống')}</p>
          </div>
                     <div className="flex flex-col sm:flex-row gap-3">
             <Button variant="outline" size="sm" onClick={fetchAnnouncements}>
               <RefreshCw className="h-4 w-4 mr-2" />
               {t('admin.refresh', 'Làm mới')}
             </Button>
             {sortedAnnouncements.length > 0 && (
               <Button variant="outline" size="sm" onClick={handleExportExcel}>
                 <Download className="h-4 w-4 mr-2" />
                 {t('admin.export', 'Xuất Excel')}
               </Button>
             )}
             <Link href="/admin-dashboard/announcements/create">
               <Button className="flex items-center gap-2">
                 <Plus className="h-4 w-4" />
                 {t('admin.announcements.create', 'Tạo thông báo mới')}
               </Button>
             </Link>
           </div>
        </div>

                 {/* Stats Cards */}
         <div className="space-y-4">
           {/* Stats Cards Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
               <CardContent className="p-4">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm font-medium text-blue-600">{t('admin.announcements.total', 'Tổng số')}</p>
                     <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
                   </div>
                   <Bell className="h-8 w-8 text-blue-600" />
                 </div>
               </CardContent>
             </Card>
             
             <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
               <CardContent className="p-4">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm font-medium text-green-600">{t('admin.announcements.active', 'Đang hoạt động')}</p>
                     <p className="text-2xl font-bold text-green-900">{stats.active}</p>
                   </div>
                   <Bell className="h-8 w-8 text-green-600" />
                 </div>
               </CardContent>
             </Card>
             
             <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
               <CardContent className="p-4">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm font-medium text-red-600">{t('admin.announcements.urgent', 'Khẩn cấp')}</p>
                     <p className="text-2xl font-bold text-red-900">{stats.urgent}</p>
                   </div>
                   <AlertTriangle className="h-8 w-8 text-red-600" />
                 </div>
               </CardContent>
             </Card>
             
             <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
               <CardContent className="p-4">
                 <div className="flex items-center justify-between">
                   <div>
                     <p className="text-sm font-medium text-purple-600">{t('admin.announcements.news', 'Tin tức')}</p>
                     <p className="text-2xl font-bold text-purple-900">{stats.news}</p>
                   </div>
                   <Info className="h-8 w-8 text-purple-600" />
                 </div>
               </CardContent>
             </Card>
           </div>
           
           
         </div>

        {/* Search and filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              {t('admin.filters.searchAndFilter', 'Tìm kiếm & lọc')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t('admin.announcements.searchPlaceholder', 'Tìm kiếm theo tiêu đề, nội dung...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              
                             {/* Filters and Controls Row */}
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2 border-t">
                 {/* Filter Type */}
                 <div className="space-y-2">
                   <label className="text-sm font-medium text-gray-700">{t('admin.filters.type', 'Loại thông báo')}</label>
                   <Select value={filterType} onValueChange={setFilterType}>
                     <SelectTrigger className="w-full">
                       <SelectValue placeholder={t('admin.announcements.type.all', 'Tất cả loại')} />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="all">{t('admin.announcements.type.all', 'Tất cả loại')}</SelectItem>
                       <SelectItem value="NEWS">{t('admin.announcements.type.news', 'Tin tức')}</SelectItem>
                       <SelectItem value="REGULAR">{t('admin.announcements.type.regular', 'Thường')}</SelectItem>
                       <SelectItem value="URGENT">{t('admin.announcements.type.urgent', 'Khẩn cấp')}</SelectItem>
                     </SelectContent>
                   </Select>
                 </div>

                 {/* Sorting Controls */}
                 <div className="space-y-2">
                   <label className="text-sm font-medium text-gray-700">{t('admin.sort.by', 'Sắp xếp theo')}</label>
                   <div className="flex items-center gap-2">
                     <Select value={sortBy} onValueChange={(value: 'createdAt' | 'title' | 'type') => setSortBy(value)}>
                       <SelectTrigger className="w-32">
                         <SelectValue />
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="createdAt">{t('admin.sort.createdAt', 'Ngày tạo')}</SelectItem>
                         <SelectItem value="title">{t('admin.sort.title', 'Tiêu đề')}</SelectItem>
                         <SelectItem value="type">{t('admin.sort.type', 'Loại')}</SelectItem>
                       </SelectContent>
                     </Select>
                     
                     <Button
                       variant="outline"
                       size="sm"
                       onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                       className="px-3"
                     >
                       {sortOrder === 'asc' ? '↑' : '↓'}
                     </Button>
                   </div>
                 </div>

                 {/* View Mode Toggle */}
                 <div className="space-y-2">
                   <label className="text-sm font-medium text-gray-700">{t('admin.view.mode', 'Chế độ xem')}</label>
                   <div className="flex items-center gap-1">
                     <Button
                       variant={viewMode === 'table' ? 'default' : 'outline'}
                       size="sm"
                       onClick={() => setViewMode('table')}
                       className="flex-1"
                     >
                       {t('admin.view.table', 'Bảng')}
                     </Button>
                     <Button
                       variant={viewMode === 'grid' ? 'default' : 'outline'}
                       size="sm"
                       onClick={() => setViewMode('grid')}
                       className="flex-1"
                     >
                       {t('admin.view.grid', 'Lưới')}
                     </Button>
                   </div>
                 </div>
               </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {t('admin.results.showing', 'Hiển thị')} {startIdx + 1}-{Math.min(startIdx + pageSize, sortedAnnouncements.length)} {t('admin.results.of', 'trong tổng số')} {sortedAnnouncements.length} {t('admin.announcements.results', 'kết quả')}
          </p>
                     {sortedAnnouncements.length > 0 && (
             <div className="flex items-center gap-2">
               <Button variant="outline" size="sm" onClick={handleExportStatsExcel}>
                 <Download className="h-4 w-4 mr-2" />
                 {t('admin.export.stats', 'Xuất thống kê')}
               </Button>
               <Button variant="outline" size="sm" onClick={handleExportExcel}>
                 <Download className="h-4 w-4 mr-2" />
                 {t('admin.export.data', 'Xuất dữ liệu')}
               </Button>
             </div>
           )}
        </div>

        {/* Announcements Content */}
        {sortedAnnouncements.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('admin.announcements.noResults', 'Không tìm thấy thông báo')}
              </h3>
              <p className="text-gray-500 mb-4">
                {t('admin.announcements.noResultsDesc', 'Không có thông báo nào khớp với tiêu chí tìm kiếm của bạn')}
              </p>
              <Link href="/admin-dashboard/announcements/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t('admin.announcements.createFirst', 'Tạo thông báo đầu tiên')}
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : viewMode === 'table' ? (
          /* Table View */
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold">{t('admin.announcements.announcementTitle','Tiêu đề')}</TableHead>
                      <TableHead className="font-semibold">{t('admin.announcements.type','Loại thông báo')}</TableHead>
                      
                      
                      <TableHead className="font-semibold">{t('admin.users.createdAt','Ngày tạo')}</TableHead>
                      <TableHead className="text-right font-semibold">{t('admin.users.actions','Thao tác')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pageAnnouncements.map((announcement) => (
                      <TableRow key={announcement.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium max-w-xs">
                          <div>
                            <p className="font-semibold text-gray-900 truncate">{announcement.title}</p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">{announcement.content}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getTypeBadge(announcement.type)}
                        </TableCell>
                        
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{formatDate(announcement.createdAt)}</span>
                          </div>
                        </TableCell>
                                                 <TableCell className="text-right">
                           <div className="flex items-center justify-end space-x-2">
                             <TooltipProvider>
                               <Tooltip>
                                 <TooltipTrigger asChild>
                                   <Link href={`/admin-dashboard/announcements/${announcement.id}`}>
                                     <Button variant="outline" size="sm">
                                       <Eye className="h-4 w-4" />
                                     </Button>
                                   </Link>
                                 </TooltipTrigger>
                                 <TooltipContent>
                                   <p>{t('admin.view', 'Xem chi tiết')}</p>
                                 </TooltipContent>
                               </Tooltip>
                             </TooltipProvider>

                             <TooltipProvider>
                               <Tooltip>
                                 <TooltipTrigger asChild>
                                   <Link href={`/admin-dashboard/announcements/edit/${announcement.id}`}>
                                     <Button variant="outline" size="sm">
                                       <Edit className="h-4 w-4" />
                                     </Button>
                                   </Link>
                                 </TooltipTrigger>
                                 <TooltipContent>
                                   <p>{t('admin.edit', 'Chỉnh sửa')}</p>
                                 </TooltipContent>
                               </Tooltip>
                             </TooltipProvider>

                             <TooltipProvider>
                               <Tooltip>
                                 <TooltipTrigger asChild>
                                   <Button 
                                     variant="outline" 
                                     size="sm"
                                     onClick={() => handleDelete(announcement.id)}
                                     className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                   >
                                     <Trash2 className="h-4 w-4" />
                                   </Button>
                                 </TooltipTrigger>
                                 <TooltipContent>
                                   <p>{t('admin.delete', 'Xóa')}</p>
                                 </TooltipContent>
                               </Tooltip>
                             </TooltipProvider>
                           </div>
                         </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pageAnnouncements.map((announcement) => (
              <Card key={announcement.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                        {announcement.title}
                      </h3>
                                             <div className="flex items-center gap-2 mb-2">
                         {getTypeBadge(announcement.type)}
                       </div>
                    </div>
                                         <div className="flex items-center gap-1">
                       <Link href={`/admin-dashboard/announcements/${announcement.id}`}>
                         <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                           <Eye className="h-4 w-4" />
                         </Button>
                       </Link>
                       <Link href={`/admin-dashboard/announcements/edit/${announcement.id}`}>
                         <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                           <Edit className="h-4 w-4" />
                         </Button>
                       </Link>
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                         onClick={() => handleDelete(announcement.id)}
                       >
                         <Trash2 className="h-4 w-4" />
                       </Button>
                     </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {announcement.content}
                  </p>
                  
                                     <div className="space-y-2 mb-4">
                     <div className="flex items-center gap-2 text-sm text-gray-500">
                       <Calendar className="h-4 w-4" />
                       {formatDate(announcement.createdAt)}
                     </div>
                   </div>
                  
                                     <div className="flex gap-2">
                     <Link href={`/admin-dashboard/announcements/${announcement.id}`} className="flex-1">
                       <Button variant="outline" size="sm" className="w-full">
                         <Eye className="h-4 w-4 mr-2" />
                         {t('admin.view', 'Xem')}
                       </Button>
                     </Link>
                     <Link href={`/admin-dashboard/announcements/edit/${announcement.id}`} className="flex-1">
                       <Button variant="outline" size="sm" className="w-full">
                         <Edit className="h-4 w-4 mr-2" />
                         {t('admin.edit', 'Chỉnh sửa')}
                       </Button>
                     </Link>
                     <Button 
                       variant="outline" 
                       size="sm" 
                       className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                       onClick={() => handleDelete(announcement.id)}
                     >
                       <Trash2 className="h-4 w-4 mr-2" />
                       {t('admin.delete', 'Xóa')}
                     </Button>
                   </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(currentPage - 1); }}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                
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
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href="#"
                        isActive={pageNum === currentPage}
                        onClick={(e) => { e.preventDefault(); setCurrentPage(pageNum); }}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage(currentPage + 1); }}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 