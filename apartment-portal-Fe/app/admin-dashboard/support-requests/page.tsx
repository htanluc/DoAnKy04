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
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  User,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { supportRequestsApi, vehiclesApi, Vehicle } from '@/lib/api';

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
  assignedAt: string; // Thêm thời gian gán nhân viên
  createdAt: string;
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
  const [activeTab, setActiveTab] = useState<'support' | 'vehicles'>('support');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState<boolean>(false);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

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
            assignedAt: item.assignedAt || 
                         item.assignedDate ||
                         '',
            createdAt: item.createdAt || 
                       item.requestDate ||
                       item.dateCreated ||
                       '',
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

  useEffect(() => {
    if (activeTab !== 'vehicles') return;
    let isMounted = true;
    setVehiclesLoading(true);
    vehiclesApi.getPending()
      .then((data) => {
        if (!isMounted) return;
        setVehicles(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!isMounted) return;
        setVehicles([]);
      })
      .finally(() => {
        if (!isMounted) return;
        setVehiclesLoading(false);
      });
    return () => { isMounted = false; };
  }, [activeTab]);

  const filteredSupportRequests = supportRequests.filter(request => {
    const matchesSearch = request.residentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.userPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const toggleExpandedRow = (requestId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(requestId)) {
      newExpandedRows.delete(requestId);
    } else {
      newExpandedRows.add(requestId);
    }
    setExpandedRows(newExpandedRows);
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
    <AdminLayout title={t('admin.support-requests.title')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[hsl(var(--brand-blue))]">
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

        {/* Tabs */}
        <div className="flex gap-2">
          <button
            className={`px-3 py-2 rounded border ${activeTab === 'support' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
            onClick={() => setActiveTab('support')}
          >
            {t('admin.support-requests.tab.support','Yêu cầu hỗ trợ')}
          </button>
          <button
            className={`px-3 py-2 rounded border ${activeTab === 'vehicles' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
            onClick={() => setActiveTab('vehicles')}
          >
            {t('admin.support-requests.tab.vehicles','Đăng ký xe (chờ duyệt)')}
          </button>
        </div>

        {/* Thống kê tổng tiền */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tổng tiền hóa đơn yêu cầu hỗ trợ */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600 mb-1">💰 {t('admin.support-requests.stats.totalInvoiceAmount', 'Tổng tiền hóa đơn')}</p>
                  <p className="text-2xl font-bold text-blue-800">
                    {new Intl.NumberFormat(language === 'vi' ? 'vi-VN' : 'en-US', { 
                      style: 'currency', 
                      currency: 'VND' 
                    }).format(2500000)}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {filteredSupportRequests.length} {t('admin.support-requests.stats.supportRequests', 'yêu cầu hỗ trợ')}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📋</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tổng tiền phí dịch vụ */}
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600 mb-1">🔧 {t('admin.support-requests.stats.totalServiceFee', 'Tổng tiền phí dịch vụ')}</p>
                  <p className="text-2xl font-bold text-green-800">
                    {new Intl.NumberFormat(language === 'vi' ? 'vi-VN' : 'en-US', { 
                      style: 'currency', 
                      currency: 'VND' 
                    }).format(1800000)}
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    {t('admin.support-requests.stats.repairMaintenanceFee', 'Phí sửa chữa & bảo trì')}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                  <span className="text-2xl">⚙️</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tổng tiền đăng ký xe */}
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600 mb-1">🚗 {t('admin.support-requests.stats.totalVehicleRegistration', 'Tổng tiền đăng ký xe')}</p>
                  <p className="text-2xl font-bold text-purple-800">
                    {new Intl.NumberFormat(language === 'vi' ? 'vi-VN' : 'en-US', { 
                      style: 'currency', 
                      currency: 'VND' 
                    }).format(3200000)}
                  </p>
                  <p className="text-xs text-purple-600 mt-1">
                    {vehicles.length} {t('admin.support-requests.stats.vehiclesPendingApproval', 'xe chờ duyệt')}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🚙</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tổng cộng tất cả */}
        <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-medium text-indigo-100 mb-2">💎 {t('admin.support-requests.stats.grandTotal', 'TỔNG CỘNG TẤT CẢ')}</p>
                <p className="text-3xl font-bold">
                  {new Intl.NumberFormat(language === 'vi' ? 'vi-VN' : 'en-US', { 
                    style: 'currency', 
                    currency: 'VND' 
                  }).format(7500000)}
                </p>
                <p className="text-sm text-indigo-200 mt-1">
                  {t('admin.support-requests.stats.grandTotalDesc', 'Tổng hợp tất cả chi phí và phí dịch vụ')}
                </p>
              </div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-3xl">💎</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {activeTab === 'support' && (
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
        )}

        {activeTab === 'support' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{t('admin.support-requests.list','Danh sách yêu cầu hỗ trợ')} ({filteredSupportRequests.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredSupportRequests.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">{t('admin.noData')}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('admin.support-requests.resident')}</TableHead>
                        <TableHead>{t('admin.support-requests.phoneNumber', 'Số điện thoại')}</TableHead>
                        <TableHead>{t('admin.support-requests.supportRequestTitle')}</TableHead>
                        <TableHead>{t('admin.support-requests.category')}</TableHead>
                        <TableHead>{t('admin.support-requests.priority')}</TableHead>
                        <TableHead>{t('admin.support-requests.assignedTo')}</TableHead>
                        <TableHead>{t('admin.support-requests.assignedAt', 'Thời gian gán')}</TableHead>
                        <TableHead>{t('admin.support-requests.status')}</TableHead>
                        <TableHead>{t('admin.support-requests.createdAt')}</TableHead>
                        <TableHead>{t('admin.users.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                       {filteredSupportRequests.map((request) => (
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
                                 <span className="hover:text-blue-600 transition-colors duration-200">
                                   {request.residentName || t('admin.support-requests.unknown', 'Không xác định')}
                                 </span>
                               </div>
                             </TableCell>
                             <TableCell>
                               {request.userPhone || 'Không có'}
                             </TableCell>
                             <TableCell className="max-w-xs truncate">
                               {request.title || t('admin.support-requests.noTitle', 'Không có tiêu đề')}
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
                             <TableCell>
                               {request.assignedAt ? (
                                 <div className="text-sm">
                                   <div className="font-medium">
                                     {new Date(request.assignedAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}
                                   </div>
                                   <div className="text-xs text-gray-500">
                                     {new Date(request.assignedAt).toLocaleTimeString(language === 'vi' ? 'vi-VN' : 'en-US', {
                                       hour: '2-digit',
                                       minute: '2-digit'
                                     })}
                                   </div>
                                 </div>
                               ) : (
                                 <span className="text-gray-400 text-sm">Chưa gán</span>
                               )}
                             </TableCell>
                             <TableCell>{getStatusBadge(request.status || 'PENDING')}</TableCell>
                             <TableCell>
                               {request.createdAt ? new Date(request.createdAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US') : 'Không xác định'}
                             </TableCell>
                             <TableCell>
                               <div className="flex items-center space-x-2">
                                 <Link href={`/admin-dashboard/support-requests/${request.id}`}>
                                   <Button variant="outline" size="sm">
                                     <Eye className="h-4 w-4" />
                                   </Button>
                                 </Link>
                                 <Link href={`/admin-dashboard/support-requests/edit/${request.id}`}>
                                   <Button variant="outline" size="sm">
                                     <Edit className="h-4 w-4" />
                                   </Button>
                                 </Link>
                                 <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                   <Trash2 className="h-4 w-4" />
                                 </Button>
                               </div>
                             </TableCell>
                           </TableRow>
                           
                           {/* Expanded row với thông tin chi tiết lịch sử gán nhân viên */}
                           {expandedRows.has(request.id) && (
                             <TableRow>
                               <TableCell colSpan={10} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
                                 <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                   <div className="flex items-center gap-2 font-semibold text-gray-700 border-b border-blue-200 pb-3">
                                     <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                     📋 Chi tiết lịch sử gán nhân viên
                                   </div>
                                   
                                   {request.assignedTo ? (
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                       <div className="space-y-3 bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                                         <div className="font-medium text-gray-600 text-sm uppercase tracking-wide">Thông tin gán</div>
                                         <div className="space-y-3">
                                           <div className="flex items-center gap-3">
                                             <span className="font-medium text-gray-600">👤 Nhân viên:</span>
                                             <span className="text-blue-700 font-semibold bg-blue-50 px-3 py-1 rounded-full">
                                               {request.assignedTo}
                                             </span>
                                           </div>
                                           <div className="flex items-center gap-3">
                                             <span className="font-medium text-gray-600">🕒 Thời gian gán:</span>
                                             <span className="text-gray-700 bg-gray-50 px-3 py-1 rounded">
                                               {request.assignedAt ? (
                                                 <>
                                                   {new Date(request.assignedAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}
                                                   {' '}
                                                   {new Date(request.assignedAt).toLocaleTimeString(language === 'vi' ? 'vi-VN' : 'en-US', {
                                                     hour: '2-digit',
                                                     minute: '2-digit'
                                                   })}
                                                 </>
                                               ) : t('admin.support-requests.unknown', 'Không xác định')}
                                             </span>
                                           </div>
                                         </div>
                                       </div>
                                       
                                       <div className="space-y-3 bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                                         <div className="font-medium text-gray-600 text-sm uppercase tracking-wide">{t('admin.support-requests.currentStatus', 'Trạng thái hiện tại')}</div>
                                         <div className="space-y-3">
                                           <div className="flex items-center gap-3">
                                             <span className="font-medium text-gray-600">📊 Trạng thái:</span>
                                             {getStatusBadge(request.status || 'PENDING')}
                                           </div>
                                           <div className="flex items-center gap-3">
                                             <span className="font-medium text-gray-600">⚡ Mức ưu tiên:</span>
                                             {getPriorityBadge(request.priority || t('admin.support-requests.priority.MEDIUM', 'Trung bình'))}
                                           </div>
                                         </div>
                                       </div>
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
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'vehicles' && (
          <Card>
              <CardHeader>
              <CardTitle>{t('admin.support-requests.vehicles.pendingTitle','Đăng ký xe chờ duyệt')} ({vehicles.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {vehiclesLoading ? (
                <div className="text-center py-8 text-gray-500">{t('admin.support-requests.vehicles.loading','Đang tải...')}</div>
              ) : vehicles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">{t('admin.support-requests.vehicles.empty','Không có đăng ký xe chờ duyệt')}</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                      <TableHead>{t('admin.support-requests.vehicles.columns.owner','Chủ xe')}</TableHead>
                      <TableHead>{t('admin.support-requests.vehicles.columns.type','Loại xe')}</TableHead>
                      <TableHead>{t('admin.support-requests.vehicles.columns.license','Biển số')}</TableHead>
                      <TableHead>{t('admin.support-requests.vehicles.columns.color','Màu sắc')}</TableHead>
                      <TableHead>{t('admin.support-requests.vehicles.columns.apartment','Căn hộ')}</TableHead>
                      <TableHead>{t('admin.support-requests.vehicles.columns.status','Trạng thái')}</TableHead>
                      <TableHead>{t('admin.support-requests.vehicles.columns.actions','Hành động')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vehicles.map((v) => (
                        <TableRow key={v.id}>
                          <TableCell className="font-medium">{v.userFullName || '-'}</TableCell>
                          <TableCell>{v.vehicleTypeDisplayName || v.vehicleType}</TableCell>
                          <TableCell>{v.licensePlate}</TableCell>
                          <TableCell>{v.color || '-'}</TableCell>
                          <TableCell>{v.apartmentUnitNumber || '-'}</TableCell>
                          <TableCell>
                            <Badge className="bg-yellow-100 text-yellow-800">{v.statusDisplayName || v.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={async () => {
                                try {
                                  await vehiclesApi.updateStatus(v.id, 'APPROVED');
                                  setVehicles((prev) => prev.filter((x) => x.id !== v.id));
                                } catch {}
                              }}>{t('admin.support-requests.vehicles.approve','Duyệt')}</Button>
                              <Button size="sm" variant="outline" className="text-red-600" onClick={() => {
                                setRejectingId(v.id);
                                setRejectionReason('');
                                setShowRejectModal(true);
                              }}>{t('admin.support-requests.vehicles.reject','Từ chối')}</Button>
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
        )}

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-4">
              <h3 className="text-lg font-semibold mb-2">{t('admin.support-requests.vehicles.rejectDialog.title','Nhập lý do từ chối')}</h3>
              <textarea
                className="w-full border rounded p-2 h-28"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={t('admin.support-requests.vehicles.rejectDialog.placeholder','Lý do từ chối...')}
              />
              <div className="mt-3 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowRejectModal(false)}>{t('admin.support-requests.vehicles.rejectDialog.cancel','Hủy')}</Button>
                <Button
                  className="bg-red-600 text-white"
                  onClick={async () => {
                    if (!rejectingId) return;
                    try {
                      await vehiclesApi.updateStatus(rejectingId, 'REJECTED', rejectionReason);
                      setVehicles((prev) => prev.filter((x) => x.id !== rejectingId));
                      setShowRejectModal(false);
                      setRejectingId(null);
                      setRejectionReason('');
                    } catch {}
                  }}
                >
                  {t('admin.support-requests.vehicles.rejectDialog.confirm','Xác nhận từ chối')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 