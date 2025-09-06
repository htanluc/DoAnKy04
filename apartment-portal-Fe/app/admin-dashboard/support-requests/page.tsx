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
  User,
  Plus,
  Image,
  X,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  UserCheck,
  FileText
} from 'lucide-react';
import Link from 'next/link';
import { supportRequestsApi } from '@/lib/api';
import ServiceRequestMiniProgress from '@/components/admin/ServiceRequestMiniProgress';

interface SupportRequest {
  id: string;
  residentName: string;
  userPhone: string; // Thêm số điện thoại cư dân
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  assignedTo: string;
  // assignedAt: string; // Bỏ thời gian gán nhân viên
  createdAt: string;
  attachmentUrls?: string[];
}

export default function SupportRequestsPage() {
  return (
    <AdminGuard>
      <SupportRequestsPageContent />
    </AdminGuard>
  );
}

function SupportRequestsPageContent() {
  const { t, language } = useLanguage();
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const truncateTitle = (title: string, max: number = 10) => {
    if (!title) return '';
    return title.length > max ? `${title.slice(0, max)}…` : title;
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    supportRequestsApi.getAll()
      .then((data) => {
        if (!isMounted) return;
        // Sửa lại mapping cho đúng với dữ liệu API thực tế
        console.log('Raw API data:', data); // Debug: xem dữ liệu thô từ API
        const mapped = data.map((item: any) => {
          console.log('Processing item:', item); // Debug: xem từng item
          console.log('User object:', item.user); // Debug: xem object user
          console.log('Username:', item.user?.username); // Debug: xem username
          console.log('All possible user fields:', {
            user: item.user,
            userId: item.userId,
            residentId: item.residentId,
            residentName: item.residentName,
            userName: item.userName,
            fullName: item.fullName,
            firstName: item.firstName,
            lastName: item.lastName
          });
          
          // Debug: kiểm tra cấu trúc dữ liệu từ backend ServiceRequestDto
          console.log('Backend DTO fields:', {
            userName: item.userName,
            userPhone: item.userPhone,
            categoryId: item.categoryId,
            categoryName: item.categoryName,
            title: item.title,
            description: item.description,
            priority: item.priority,
            status: item.status,
            assignedTo: item.assignedTo,
            createdAt: item.createdAt
          });
          
          // Cải thiện logic mapping tên cư dân
          let residentName = t('admin.support-requests.unknown', 'Không xác định');
          
          // Backend trả về ServiceRequestDto với userName trực tiếp
          if (item.userName && item.userName.trim()) {
            residentName = item.userName;
          } else if (item.user) {
            // Fallback: nếu có user object, ưu tiên các trường này
            if (item.user.fullName && item.user.fullName.trim()) {
              residentName = item.user.fullName;
            } else if (item.user.firstName && item.user.lastName) {
              residentName = `${item.user.firstName} ${item.user.lastName}`;
            } else if (item.user.username && item.user.username.trim()) {
              residentName = item.user.username;
            }
          } else {
            // Fallback: kiểm tra các trường khác có thể có
            if (item.residentName && item.residentName.trim()) {
              residentName = item.residentName;
            } else if (item.fullName && item.fullName.trim()) {
              residentName = item.fullName;
            } else if (item.firstName && item.lastName) {
              residentName = `${item.firstName} ${item.lastName}`;
            }
          }
          
          return {
            id: item.id || 
                item.requestId ||
                item.supportRequestId ||
                item.serviceRequestId ||
                '',
            residentName: residentName,
            userPhone: item.userPhone || "", // Thêm số điện thoại cư dân
            title: item.title || 
                   item.description || 
                   item.requestTitle ||
                   item.subject ||
                   '',
            description: item.description || 
                         item.details ||
                         item.content ||
                         item.notes ||
                         '',
            category: item.categoryName || 
                      item.serviceCategory ||
                      item.categoryCode ||
                      '',
            priority: item.priority || 
                      item.priorityLevel ||
                      item.urgency ||
                      '',
            status: item.status || 
                     item.requestStatus ||
                     item.currentStatus ||
                     '',
            assignedTo: item.assignedTo || 
                        item.assignedToUser ||
                        item.assignedToName ||
                        '',
            // assignedAt: item.assignedAt || item.assignedDate || '',
            createdAt: item.createdAt || 
                       item.requestDate ||
                       item.dateCreated ||
                       '',
            attachmentUrls: item.attachmentUrls || item.attachments || [],
          };
        });
        console.log('Mapped data:', mapped); // Debug: xem dữ liệu sau khi map
        setSupportRequests(mapped);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setSupportRequests([]);
        setLoading(false);
        alert('Lỗi tải danh sách yêu cầu hỗ trợ: ' + (err?.message || err));
      });
    return () => { isMounted = false; };
  }, []);





  const sortedSupportRequests = [...supportRequests].sort((a, b) => {
    const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return tb - ta; // mới nhất trước
  });

  const filteredSupportRequests = sortedSupportRequests.filter(request => {
    const matchesSearch = request.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalItems = filteredSupportRequests.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSupportRequests = filteredSupportRequests.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  const toggleExpandedRow = (requestId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(requestId)) {
      newExpandedRows.delete(requestId);
    } else {
      newExpandedRows.add(requestId);
    }
    setExpandedRows(newExpandedRows);
  };

  const openLightbox = (images: string[], startIndex: number = 0) => {
    setCurrentImages(images);
    setCurrentImageIndex(startIndex);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setCurrentImages([]);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % currentImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">{t('admin.support-requests.status.PENDING','Chờ xử lý')}</Badge>;
      case 'ASSIGNED':
        return <Badge className="bg-blue-100 text-blue-800">{t('admin.support-requests.status.ASSIGNED','Đã giao')}</Badge>;
      case 'IN_PROGRESS':
        return <Badge className="bg-orange-100 text-orange-800">{t('admin.support-requests.status.IN_PROGRESS','Đang xử lý')}</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-800">{t('admin.support-requests.status.COMPLETED','Hoàn thành')}</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-red-100 text-red-800">{t('admin.support-requests.status.CANCELLED','Đã hủy')}</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <Badge className="bg-red-100 text-red-800">{t('admin.support-requests.priority.URGENT','Khẩn cấp')}</Badge>;
      case 'HIGH':
        return <Badge className="bg-orange-100 text-orange-800">{t('admin.support-requests.priority.HIGH','Cao')}</Badge>;
      case 'MEDIUM':
        return <Badge className="bg-yellow-100 text-yellow-800">{t('admin.support-requests.priority.MEDIUM','Trung bình')}</Badge>;
      case 'LOW':
        return <Badge className="bg-green-100 text-green-800">{t('admin.support-requests.priority.LOW','Thấp')}</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{priority}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    let code = (category || '').toString().toUpperCase();
    // If backend sends Vietnamese names, map them to codes
    if (!['PLUMBING','ELEVATOR','ELECTRICAL','ADMINISTRATIVE','SECURITY','CLEANING','OTHER','WATER','AIR_CONDITIONER','GREENERY'].includes(code)) {
      const name = (category || '').toString().trim().toLowerCase();
      const byName: Record<string, string> = {
        'điện': 'ELECTRICAL',
        'nước': 'WATER',
        'vệ sinh': 'CLEANING',
        'an ninh': 'SECURITY',
        'thang máy': 'ELEVATOR',
        'hành chính': 'ADMINISTRATIVE',
        'điều hòa': 'AIR_CONDITIONER',
        'cây xanh': 'GREENERY',
        'khác': 'OTHER',
      };
      code = byName[name] || code;
    }
    switch (code) {
      case 'PLUMBING':
        return <Badge className="bg-blue-100 text-blue-800">{t('admin.support-requests.category.PLUMBING','Điện nước')}</Badge>;
      case 'ELEVATOR':
        return <Badge className="bg-purple-100 text-purple-800">{t('admin.support-requests.category.ELEVATOR','Thang máy')}</Badge>;
      case 'ELECTRICAL':
        return <Badge className="bg-yellow-100 text-yellow-800">{t('admin.support-requests.category.ELECTRICAL','Điện')}</Badge>;
      case 'WATER':
        return <Badge className="bg-blue-100 text-blue-800">{t('admin.support-requests.category.WATER','Nước')}</Badge>;
      case 'ADMINISTRATIVE':
        return <Badge className="bg-gray-100 text-gray-800">{t('admin.support-requests.category.ADMINISTRATIVE','Hành chính')}</Badge>;
      case 'SECURITY':
        return <Badge className="bg-red-100 text-red-800">{t('admin.support-requests.category.SECURITY','An ninh')}</Badge>;
      case 'CLEANING':
        return <Badge className="bg-green-100 text-green-800">{t('admin.support-requests.category.CLEANING','Vệ sinh')}</Badge>;
      case 'AIR_CONDITIONER':
        return <Badge className="bg-blue-100 text-blue-800">{t('admin.support-requests.category.AIR_CONDITIONER','Điều hòa')}</Badge>;
      case 'GREENERY':
        return <Badge className="bg-green-100 text-green-800">{t('admin.support-requests.category.GREENERY','Cây xanh')}</Badge>;
      case 'OTHER':
        return <Badge className="bg-gray-100 text-gray-800">{t('admin.support-requests.category.OTHER','Khác')}</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{category}</Badge>;
    }
  };

  if (loading) {
    return (
      <AdminLayout title={t('admin.support-requests.title')}>
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>

          {/* Search and Filter Skeleton */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 h-10 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          {/* Table Skeleton */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="p-4">
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
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={t('admin.support-requests.title')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {t('admin.support-requests.list', 'Danh sách yêu cầu hỗ trợ')}
            </h2>
            <p className="text-gray-600">
              {t('admin.support-requests.listDesc', 'Quản lý tất cả yêu cầu hỗ trợ của cư dân')}
            </p>
          </div>
          <div>
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>{t('admin.action.create', 'Tạo mới')}</span>
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-600">{t('admin.support-requests.stats.total', 'Tổng yêu cầu')}</div>
              <MessageSquare className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{totalItems}</div>
            <div className="text-xs text-gray-500 mt-1">
              {searchTerm || filterStatus !== 'all' ? t('admin.support-requests.stats.filtered', 'Kết quả lọc') : t('admin.support-requests.stats.all', 'Tất cả yêu cầu')}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-600">{t('admin.support-requests.stats.pending', 'Chờ xử lý')}</div>
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {filteredSupportRequests.filter(r => r.status === 'PENDING').length}
            </div>
            <div className="text-xs text-gray-500 mt-1">{t('admin.support-requests.stats.pendingDesc', 'Cần xử lý ngay')}</div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-600">{t('admin.support-requests.stats.inProgress', 'Đang xử lý')}</div>
              <UserCheck className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {filteredSupportRequests.filter(r => r.status === 'IN_PROGRESS').length}
            </div>
            <div className="text-xs text-gray-500 mt-1">{t('admin.support-requests.stats.inProgressDesc', 'Đang được xử lý')}</div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-medium text-gray-600">{t('admin.support-requests.stats.completed', 'Hoàn thành')}</div>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {filteredSupportRequests.filter(r => r.status === 'COMPLETED').length}
            </div>
            <div className="text-xs text-gray-500 mt-1">{t('admin.support-requests.stats.completedDesc', 'Đã hoàn thành')}</div>
          </div>
        </div>

        {/* Tabs - Chỉ hiển thị tab yêu cầu hỗ trợ */}
        <div className="flex gap-2">
          <button
            className="px-3 py-2 rounded border bg-blue-600 text-white border-blue-600"
          >
            {t('admin.support-requests.tab.support','Yêu cầu hỗ trợ')}
          </button>
        </div>



        {/* Đã loại bỏ các khối thống kê và tổng cộng theo yêu cầu */}

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t('admin.support-requests.searchPlaceholder','Tìm kiếm theo cư dân, số điện thoại, tiêu đề, mô tả...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  title={t('admin.support-requests.filter.statusTitle', 'Trạng thái yêu cầu')}
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">{t('admin.status.all','Tất cả trạng thái')}</option>
                  <option value="PENDING">{t('admin.status.pending','Chờ xử lý')}</option>
                  <option value="ASSIGNED">{t('admin.support-requests.status.ASSIGNED','Đã giao')}</option>
                  <option value="IN_PROGRESS">{t('admin.support-requests.status.IN_PROGRESS','Đang xử lý')}</option>
                  <option value="COMPLETED">{t('admin.status.completed','Hoàn thành')}</option>
                  <option value="CANCELLED">{t('admin.status.cancelled','Đã hủy')}</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <span>{t('admin.support-requests.list','Danh sách yêu cầu hỗ trợ')}</span>
                <Badge variant="secondary" className="ml-2">
                  {totalItems} {totalItems === 1 ? t('admin.support-requests.request', 'yêu cầu') : t('admin.support-requests.requests', 'yêu cầu')}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredSupportRequests.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">{t('admin.support-requests.noData', 'Không có yêu cầu hỗ trợ nào')}</p>
                <p className="text-sm text-gray-600">
                  {searchTerm || filterStatus !== 'all' 
                    ? t('admin.support-requests.noResults', 'Không tìm thấy yêu cầu phù hợp với bộ lọc của bạn')
                    : t('admin.support-requests.noDataDesc', 'Chưa có yêu cầu hỗ trợ nào từ cư dân')
                  }
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-semibold min-w-[200px]">{t('admin.support-requests.resident')}</TableHead>
                        <TableHead className="font-semibold min-w-[200px]">{t('admin.support-requests.supportRequestTitle')}</TableHead>
                        <TableHead className="font-semibold min-w-[120px]">{t('admin.support-requests.category')}</TableHead>
                        <TableHead className="font-semibold min-w-[120px]">{t('admin.support-requests.priority')}</TableHead>
                        <TableHead className="font-semibold min-w-[150px]">{t('admin.support-requests.assignedTo')}</TableHead>
                        <TableHead className="font-semibold min-w-[120px]">{t('admin.support-requests.status')}</TableHead>
                        {/* Created At moved to expanded details */}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                       {currentSupportRequests.map((request) => (
                         <React.Fragment key={request.id}>
                           <TableRow 
                             className="cursor-pointer hover:bg-gray-50"
                             onClick={() => toggleExpandedRow(request.id)}
                           >
                             <TableCell className="font-medium">
                               <div className="flex items-center gap-2">
                                 <button
                                   className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     toggleExpandedRow(request.id);
                                   }}
                                 >
                                   {expandedRows.has(request.id) ? '▼' : '▶'}
                                 </button>
                                 <div className="flex items-center space-x-2">
                                   <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                     <span className="text-sm font-medium text-blue-600">
                                       {(request.residentName || 'Ẩn danh').charAt(0).toUpperCase()}
                                     </span>
                                   </div>
                                   <div>
                                     <p className="font-medium text-gray-900">
                                       {request.residentName || t('admin.support-requests.unknown', 'Không xác định')}
                                     </p>
                                     {request.userPhone && (
                                       <p className="text-xs text-gray-500">{request.userPhone}</p>
                                     )}
                                   </div>
                                 </div>
                               </div>
                             </TableCell>
                             <TableCell className="max-w-xs">
                               <div className="max-w-xs">
                                 <p className="text-sm text-gray-900 overflow-hidden" style={{
                                   display: '-webkit-box',
                                   WebkitLineClamp: 2,
                                   WebkitBoxOrient: 'vertical'
                                 }}>
                                   {request.title || t('admin.support-requests.noTitle', 'Không có tiêu đề')}
                                 </p>
                                 {request.description && (
                                   <p className="text-xs text-gray-500 mt-1">
                                     {request.description.length > 10 ? `${request.description.slice(0, 10)}…` : request.description}
                                   </p>
                                 )}
                               </div>
                             </TableCell>
                             <TableCell>{getCategoryBadge(request.category || t('admin.support-requests.category.OTHER', 'Khác'))}</TableCell>
                             <TableCell>{getPriorityBadge(request.priority || t('admin.support-requests.priority.MEDIUM', 'Trung bình'))}</TableCell>
                             <TableCell>
                               {request.assignedTo && request.assignedTo.trim() !== '' ? (
                                 <div className="flex items-center space-x-1">
                                   <User className="h-4 w-4 text-gray-500" />
                                   <span>{request.assignedTo}</span>
                                 </div>
                               ) : (
                                 <span className="text-gray-500">{t('admin.support-requests.notAssigned','Chưa giao')}</span>
                               )}
                             </TableCell>
                             {/* Bỏ ô thời gian gán */}
                             <TableCell>
                               <div className="flex items-center gap-2">
                                 {getStatusBadge(request.status || 'PENDING')}
                                 <ServiceRequestMiniProgress status={request.status} />
                               </div>
                             </TableCell>
                             {/* Bỏ cột thao tác */}
                           </TableRow>
                           
                           {/* Expanded row với thông tin chi tiết lịch sử gán nhân viên */}
                           {expandedRows.has(request.id) && (
                             <TableRow>
                               <TableCell colSpan={8} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                                 <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                   <div className="flex items-center gap-2 font-semibold text-gray-700 border-b border-blue-200 pb-3">
                                     <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                     📋 {t('admin.support-requests.assignmentHistory', 'Chi tiết lịch sử gán nhân viên')}
                                   </div>
                                   
                                   {request.assignedTo ? (
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                       <div className="space-y-3 bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                                         <div className="font-medium text-gray-600 text-sm uppercase tracking-wide">{t('admin.support-requests.assignmentInfo', 'Thông tin gán')}</div>
                                         <div className="space-y-3">
                                           <div className="flex items-center gap-3">
                                             <span className="font-medium text-gray-600">👤 {t('admin.support-requests.staff', 'Nhân viên')}:</span>
                                             <span className="text-blue-700 font-semibold bg-blue-50 px-3 py-1 rounded-full">
                                               {request.assignedTo || t('admin.support-requests.notAssigned','Chưa giao')}
                                             </span>
                                           </div>
                                           <div className="flex items-center gap-3">
                                             <span className="font-medium text-gray-600">🕒 {t('admin.support-requests.createdAt', 'Thời gian tạo')}:</span>
                                             <span className="text-gray-700">
                                               {request.createdAt
                                                 ? `${new Date(request.createdAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')} ${new Date(request.createdAt).toLocaleTimeString(language === 'vi' ? 'vi-VN' : 'en-US', { hour: '2-digit', minute: '2-digit' })}`
                                                 : t('admin.support-requests.unknown', 'Không xác định')}
                                             </span>
                                           </div>
                                         </div>
                                       </div>
                                       
                                       <div className="space-y-3 bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                                         <div className="font-medium text-gray-600 text-sm uppercase tracking-wide">{t('admin.support-requests.currentStatus', 'Trạng thái hiện tại')}</div>
                                         <div className="space-y-3">
                                           <div className="flex items-center gap-3">
                                             <span className="font-medium text-gray-600">📊 {t('admin.support-requests.status', 'Trạng thái')}:</span>
                                             {getStatusBadge(request.status || 'PENDING')}
                                           </div>
                                           <div className="flex items-center gap-3">
                                             <span className="font-medium text-gray-600">⚡ {t('admin.support-requests.priority', 'Mức ưu tiên')}:</span>
                                             {getPriorityBadge(request.priority || t('admin.support-requests.priority.MEDIUM', 'Trung bình'))}
                                           </div>
                                         </div>
                                       </div>
                                       
                                       {/* Display Attached Images */}
                                       {request.attachmentUrls && request.attachmentUrls.length > 0 && (
                                         <div className="space-y-3 bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                                           <div className="font-medium text-gray-600 text-sm uppercase tracking-wide flex items-center gap-2">
                                             <Image className="h-4 w-4" />
                                             {t('admin.support-requests.attachments', 'Hình ảnh đính kèm')} ({request.attachmentUrls.length} {t('admin.support-requests.images', 'ảnh')})
                                           </div>
                                           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                             {request.attachmentUrls.map((url, index) => (
                                               <div key={index} className="relative group">
                                                 <img
                                                   src={url}
                                                   alt={t('admin.support-requests.imageAlt', 'Hình ảnh') + ` ${index + 1}`}
                                                   className="w-full h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors"
                                                   onClick={() => openLightbox(request.attachmentUrls!, index)}
                                                   title={t('admin.support-requests.clickToView', 'Click để xem ảnh đầy đủ')}
                                                 />
                                                 <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center pointer-events-none">
                                                   <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                     <div className="bg-white bg-opacity-90 rounded-full p-1">
                                                       <Image className="h-3 w-3 text-gray-700" />
                                                     </div>
                                                   </div>
                                                 </div>
                                               </div>
                                             ))}
                                           </div>
                                         </div>
                                       )}
                                     </div>
                                   ) : (
                                     <div className="text-center py-8 text-gray-500 bg-white rounded-lg shadow-sm border border-gray-200">
                                       <div className="text-4xl mb-3">🚫</div>
                                       <div className="text-lg font-medium mb-2">{t('admin.support-requests.notAssigned', 'Chưa được gán')}</div>
                                       <div className="text-sm text-gray-400 mb-4">{t('admin.support-requests.notAssignedDesc', 'Yêu cầu này chưa được gán cho nhân viên nào')}</div>
                                       <div className="text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded">
                                         💡 {t('admin.support-requests.assignTip', 'Click vào nút "Gán nhân viên" trong trang chi tiết để gán')}
                                       </div>
                                     </div>
                                   )}
                                   
                                   <div className="flex justify-end pt-4 border-t border-blue-200">
                                     <Link href={`/admin-dashboard/support-requests/${request.id}`}>
                                       <Button variant="outline" size="sm" className="bg-white hover:bg-blue-50 border-blue-200 text-blue-700">
                                         👁️ {t('admin.support-requests.viewFullDetails', 'Xem chi tiết đầy đủ')}
                                       </Button>
                                     </Link>
                                   </div>
                                 </div>
                               </TableCell>
                             </TableRow>
                           )}
                        </React.Fragment>
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

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            >
              <X className="h-8 w-8" />
            </button>

            {/* Navigation buttons */}
            {currentImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}

            {/* Image */}
            <div className="p-4">
              <img
                src={currentImages[currentImageIndex]}
                alt={t('admin.support-requests.imageAlt', 'Hình ảnh') + ` ${currentImageIndex + 1}`}
                className="max-w-[90vw] max-h-[85vh] w-auto h-auto object-contain rounded-lg"
              />
            </div>

            {/* Image counter */}
            {currentImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {currentImages.length}
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}