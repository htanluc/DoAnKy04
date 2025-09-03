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
import { Pagination } from '@/components/ui/pagination';
import { 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Star,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import Link from 'next/link';
import { feedbacksApi, Feedback, FeedbackStatus } from '@/lib/api';

export default function FeedbacksPage() {
  return (
    <AdminGuard>
      <FeedbacksPageContent />
    </AdminGuard>
  );
}

function FeedbacksPageContent() {
  const { t, language } = useLanguage();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [exporting, setExporting] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await feedbacksApi.getAll();
        setFeedbacks(data);
      } catch (err: any) {
        setError(err.message || t('admin.feedbacks.loadError','Lỗi khi tải phản hồi'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredFeedbacks = feedbacks.filter(feedback => {
    const matchesSearch = (feedback.residentName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (feedback.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (feedback.content || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || feedback.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalItems = filteredFeedbacks.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFeedbacks = filteredFeedbacks.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const updateStatus = async (id: number, status: FeedbackStatus) => {
    try {
      setUpdatingId(id);
      const updated = await feedbacksApi.updateStatus(id, status);
      setFeedbacks(prev => prev.map(f => f.id === id ? { ...f, status: updated.status, updatedAt: updated.updatedAt } : f));
    } catch (e) {
      setError((e as any)?.message || t('admin.feedbacks.updateStatusError','Cập nhật trạng thái thất bại'));
    } finally {
      setUpdatingId(null);
    }
  };

  const exportToExcel = async () => {
    try {
      setExporting(true);
      
      // Import dynamic để tránh lỗi SSR
      const XLSX = await import('xlsx');
      
      // Chuẩn bị dữ liệu cho Excel
      const excelData = filteredFeedbacks.map((fb, index) => {
        const categoryCode = (fb.categoryCode || '').toString().toUpperCase().trim();
        let categoryName = fb.categoryName || '';
        
        // Map category code to Vietnamese name
        const categoryMap: Record<string, string> = {
          'SUGGESTION': 'Góp ý',
          'COMPLIMENT': 'Khen ngợi', 
          'COMPLAINT': 'Phàn nàn',
          'GENERAL_SERVICE': 'Dịch vụ chung',
          'SECURITY': 'An ninh',
          'CLEANING': 'Vệ sinh',
          'FACILITY': 'Tiện ích',
          'MANAGEMENT': 'Quản lý',
        };
        
        if (categoryCode && categoryMap[categoryCode]) {
          categoryName = categoryMap[categoryCode];
        }
        
        const statusMap: Record<string, string> = {
          'PENDING': 'Chờ xử lý',
          'RESPONDED': 'Đã phản hồi',
          'REJECTED': 'Từ chối'
        };
        
        return {
          'STT': index + 1,
          'Tên cư dân': fb.residentName || (fb as any).resident_name || fb.username || (fb as any).userName || (fb.userId ? `User #${fb.userId}` : 'Ẩn danh'),
          'Tiêu đề': fb.title || '',
          'Nội dung': fb.content || '',
          'Loại phản hồi': categoryName,
          'Đánh giá': fb.rating ? `${fb.rating}/5 sao` : 'Không có',
          'Trạng thái': statusMap[fb.status] || fb.status,
          'Ngày tạo': new Date(fb.createdAt).toLocaleString('vi-VN'),
          'Ngày cập nhật': fb.updatedAt ? new Date(fb.updatedAt).toLocaleString('vi-VN') : ''
        };
      });
      
      // Tạo workbook và worksheet
      const ws = XLSX.utils.json_to_sheet(excelData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Danh sách phản hồi');
      
      // Đặt độ rộng cột
      const colWidths = [
        { wch: 5 },   // STT
        { wch: 20 },  // Tên cư dân
        { wch: 30 },  // Tiêu đề
        { wch: 50 },  // Nội dung
        { wch: 15 },  // Loại phản hồi
        { wch: 12 },  // Đánh giá
        { wch: 12 },  // Trạng thái
        { wch: 20 },  // Ngày tạo
        { wch: 20 }   // Ngày cập nhật
      ];
      ws['!cols'] = colWidths;
      
      // Tạo tên file với timestamp
      const now = new Date();
      const timestamp = now.toISOString().slice(0, 19).replace(/:/g, '-');
      const fileName = `danh-sach-phan-hoi-${timestamp}.xlsx`;
      
      // Xuất file
      XLSX.writeFile(wb, fileName);
      
      // Hiển thị thông báo thành công (tạm thời)
      console.log(`Đã xuất thành công ${filteredFeedbacks.length} phản hồi ra file: ${fileName}`);
      
    } catch (error) {
      console.error('Lỗi khi xuất Excel:', error);
      setError('Có lỗi xảy ra khi xuất file Excel');
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            <Clock className="w-3 h-3 mr-1" />
            Chờ xử lý
          </Badge>
        );
      case 'RESPONDED':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Đã phản hồi
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Từ chối
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 border-gray-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            {status}
          </Badge>
        );
    }
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  if (loading) {
    return (
      <AdminLayout title={t('admin.feedbacks.title')}>
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Search and Filter Skeleton */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>

          {/* Table Skeleton */}
          <Card>
            <CardHeader>
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
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
    <AdminLayout title={t('admin.feedbacks.title')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {t('admin.feedbacks.list')}
            </h2>
            <p className="text-gray-600">
              {t('admin.feedbacks.listDesc','Quản lý tất cả phản hồi từ cư dân')}
            </p>
          </div>
          
          {/* Stats */}
          <div className="flex flex-wrap gap-4">
            <div className="bg-blue-50 px-3 py-2 rounded-lg">
              <div className="text-sm text-blue-600 font-medium">
                {searchTerm || filterStatus !== 'all' ? 'Kết quả lọc' : 'Tổng phản hồi'}
              </div>
              <div className="text-lg font-bold text-blue-900">{totalItems}</div>
              {(searchTerm || filterStatus !== 'all') && (
                <div className="text-xs text-blue-500">
                  / {feedbacks.length} tổng
                </div>
              )}
            </div>
            <div className="bg-yellow-50 px-3 py-2 rounded-lg">
              <div className="text-sm text-yellow-600 font-medium">Chờ xử lý</div>
              <div className="text-lg font-bold text-yellow-900">
                {filteredFeedbacks.filter(f => f.status === 'PENDING').length}
              </div>
            </div>
            <div className="bg-green-50 px-3 py-2 rounded-lg">
              <div className="text-sm text-green-600 font-medium">Đã xử lý</div>
              <div className="text-lg font-bold text-green-900">
                {filteredFeedbacks.filter(f => f.status === 'RESPONDED').length}
              </div>
            </div>

          </div>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t('admin.feedbacks.searchPlaceholder','Tìm kiếm theo cư dân, tiêu đề, nội dung...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select
                    title="Lọc theo trạng thái"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm min-w-[140px]"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="PENDING">Chờ xử lý</option>
                    <option value="RESPONDED">Đã phản hồi</option>
                  </select>
                </div>
                <Button
                  onClick={exportToExcel}
                  disabled={exporting || filteredFeedbacks.length === 0}
                  className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  title={filteredFeedbacks.length === 0 ? "Không có dữ liệu để xuất" : "Xuất danh sách phản hồi ra file Excel"}
                >
                  {exporting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      <span className="hidden sm:inline">Đang xuất...</span>
                      <span className="sm:hidden">Xuất...</span>
                    </>
                  ) : (
                    <>
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">Xuất Excel</span>
                      <span className="sm:hidden">Excel</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feedbacks Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <span>{t('admin.feedbacks.list','Danh sách phản hồi')}</span>
                <Badge variant="secondary" className="ml-2">
                  {totalItems} {totalItems === 1 ? 'phản hồi' : 'phản hồi'}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {error ? (
              <div className="text-center text-red-500 py-12">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Có lỗi xảy ra</p>
                <p className="text-sm text-gray-600">{error}</p>
              </div>
            ) : filteredFeedbacks.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">Không có phản hồi nào</p>
                <p className="text-sm text-gray-600">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Không tìm thấy phản hồi phù hợp với bộ lọc của bạn'
                    : 'Chưa có phản hồi nào từ cư dân'
                  }
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-semibold min-w-[200px]">Cư dân</TableHead>
                        <TableHead className="font-semibold min-w-[250px]">Nội dung</TableHead>
                        <TableHead className="font-semibold min-w-[120px]">Ngày tạo</TableHead>
                        <TableHead className="font-semibold min-w-[120px]">Loại phản hồi</TableHead>
                        <TableHead className="font-semibold min-w-[120px]">Trạng thái</TableHead>
                        <TableHead className="font-semibold min-w-[150px]">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentFeedbacks.map((fb) => (
                        <TableRow key={fb.id} className="hover:bg-gray-50">
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600">
                                  {(fb.residentName || (fb as any).resident_name || fb.username || (fb as any).userName || 'Ẩn danh').charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {fb.residentName || (fb as any).resident_name || fb.username || (fb as any).userName || (fb.userId ? `User #${fb.userId}` : 'Ẩn danh')}
                                </p>
                                {fb.rating && (
                                  <div className="flex items-center space-x-1 mt-1">
                                    {renderStars(fb.rating)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <p className="text-sm text-gray-900 overflow-hidden" style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                              }}>
                                {fb.content || <span className="italic text-gray-400">(Không có nội dung)</span>}
                              </p>
                              {fb.title && (
                                <p className="text-xs text-gray-500 mt-1 font-medium truncate">{fb.title}</p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p className="text-gray-900">
                                {new Date(fb.createdAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}
                              </p>
                              <p className="text-gray-500">
                                {new Date(fb.createdAt).toLocaleTimeString(language === 'vi' ? 'vi-VN' : 'en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {(() => {
                              const codeRaw = (fb.categoryCode || '').toString().toUpperCase().trim();
                              let code = codeRaw;
                              if (!code && fb.categoryName) {
                                const n = fb.categoryName.toString().trim().toLowerCase();
                                const byName: Record<string, string> = {
                                  'dịch vụ chung': 'GENERAL_SERVICE',
                                  'an ninh': 'SECURITY',
                                  'vệ sinh': 'CLEANING',
                                  'tiện ích': 'FACILITY',
                                  'quản lý': 'MANAGEMENT',
                                  'góp ý': 'SUGGESTION',
                                  'khen ngợi': 'COMPLIMENT',
                                  'phàn nàn': 'COMPLAINT',
                                };
                                code = byName[n] || '';
                              }
                              const nameMap: Record<string, string> = {
                                SUGGESTION: t('admin.feedbacks.category.SUGGESTION','Góp ý'),
                                COMPLIMENT: t('admin.feedbacks.category.COMPLIMENT','Khen ngợi'),
                                COMPLAINT: t('admin.feedbacks.category.COMPLAINT','Phàn nàn'),
                                GENERAL_SERVICE: t('admin.feedbacks.category.GENERAL_SERVICE','Dịch vụ chung'),
                                SECURITY: t('admin.feedbacks.category.SECURITY','An ninh'),
                                CLEANING: t('admin.feedbacks.category.CLEANING','Vệ sinh'),
                                FACILITY: t('admin.feedbacks.category.FACILITY','Tiện ích'),
                                MANAGEMENT: t('admin.feedbacks.category.MANAGEMENT','Quản lý'),
                              };
                              const text = nameMap[code] || (fb.categoryName ?? code ?? '-');
                              const style =
                                code === 'COMPLAINT'
                                  ? { background: '#fee2e2', color: '#b91c1c' }
                                  : code === 'COMPLIMENT'
                                  ? { background: '#dcfce7', color: '#166534' }
                                  : code === 'SUGGESTION'
                                  ? { background: '#dbeafe', color: '#1e40af' }
                                  : { background: '#f3f4f6', color: '#374151' };
                              return <Badge style={style}>{text}</Badge>;
                            })()}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(fb.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              {fb.status === 'PENDING' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateStatus(fb.id, 'RESPONDED')}
                                  disabled={updatingId === fb.id}
                                  className="text-green-600 border-green-200 hover:bg-green-50"
                                >
                                  {updatingId === fb.id ? (
                                    <>
                                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600 mr-1"></div>
                                      Đang xử lý...
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Đánh dấu đã xem
                                    </>
                                  )}
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                Xem chi tiết
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
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    totalItems={totalItems}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
} 