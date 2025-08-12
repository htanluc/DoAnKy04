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
  User,
  Plus
} from 'lucide-react';
import Link from 'next/link';
import { supportRequestsApi, vehiclesApi, Vehicle } from '@/lib/api';

interface SupportRequest {
  id: string;
  residentName: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  assignedTo: string;
  createdAt: string;
}

export default function SupportRequestsPage() {
  const { t } = useLanguage();
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

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    supportRequestsApi.getAll()
      .then((data) => {
        if (!isMounted) return;
        // Sửa lại mapping cho đúng với dữ liệu API thực tế
        const mapped = data.map((item: any) => ({
          id: item.id,
          residentName: item.residentName || '',
          title: item.title || item.description || '',
          description: item.description || '',
          category: item.categoryName || '',
          priority: item.priority || '',
          status: item.status || '',
          assignedTo: item.assignedTo || '',
          createdAt: item.createdAt || '',
        }));
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
                         request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ xử lý</Badge>;
      case 'ASSIGNED':
        return <Badge className="bg-blue-100 text-blue-800">Đã giao</Badge>;
      case 'IN_PROGRESS':
        return <Badge className="bg-orange-100 text-orange-800">Đang xử lý</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-green-100 text-green-800">Hoàn thành</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-red-100 text-red-800">Đã hủy</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <Badge className="bg-red-100 text-red-800">Khẩn cấp</Badge>;
      case 'HIGH':
        return <Badge className="bg-orange-100 text-orange-800">Cao</Badge>;
      case 'MEDIUM':
        return <Badge className="bg-yellow-100 text-yellow-800">Trung bình</Badge>;
      case 'LOW':
        return <Badge className="bg-green-100 text-green-800">Thấp</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{priority}</Badge>;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'PLUMBING':
        return <Badge className="bg-blue-100 text-blue-800">Điện nước</Badge>;
      case 'ELEVATOR':
        return <Badge className="bg-purple-100 text-purple-800">Thang máy</Badge>;
      case 'ELECTRICAL':
        return <Badge className="bg-yellow-100 text-yellow-800">Điện</Badge>;
      case 'ADMINISTRATIVE':
        return <Badge className="bg-gray-100 text-gray-800">Hành chính</Badge>;
      case 'SECURITY':
        return <Badge className="bg-red-100 text-red-800">An ninh</Badge>;
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
            Yêu cầu hỗ trợ
          </button>
          <button
            className={`px-3 py-2 rounded border ${activeTab === 'vehicles' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
            onClick={() => setActiveTab('vehicles')}
          >
            Đăng ký xe (chờ duyệt)
          </button>
        </div>

        {activeTab === 'support' && (
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder={t('admin.support-requests.searchPlaceholder','Tìm kiếm theo cư dân, tiêu đề, mô tả...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-400" />
                  <select
                    title="Trạng thái yêu cầu"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">{t('admin.status.all','Tất cả trạng thái')}</option>
                    <option value="PENDING">Chờ xử lý</option>
                    <option value="ASSIGNED">Đã giao</option>
                    <option value="IN_PROGRESS">Đang xử lý</option>
                    <option value="COMPLETED">Hoàn thành</option>
                    <option value="CANCELLED">Đã hủy</option>
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
                <span>Danh sách yêu cầu hỗ trợ ({filteredSupportRequests.length})</span>
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
                        <TableHead>{t('admin.support-requests.supportRequestTitle')}</TableHead>
                        <TableHead>{t('admin.support-requests.category')}</TableHead>
                        <TableHead>{t('admin.support-requests.priority')}</TableHead>
                        <TableHead>{t('admin.support-requests.assignedTo')}</TableHead>
                        <TableHead>{t('admin.support-requests.status')}</TableHead>
                        <TableHead>{t('admin.support-requests.createdAt')}</TableHead>
                        <TableHead>{t('admin.users.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSupportRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">
                            {request.residentName}
                          </TableCell>
                          <TableCell className="max-w-xs truncate">
                            {request.title}
                          </TableCell>
                          <TableCell>{getCategoryBadge(request.category)}</TableCell>
                          <TableCell>{getPriorityBadge(request.priority)}</TableCell>
                          <TableCell>
                            {request.assignedTo ? (
                              <div className="flex items-center space-x-1">
                                <User className="h-4 w-4 text-gray-500" />
                                <span>{request.assignedTo}</span>
                              </div>
                            ) : (
                              <span className="text-gray-500">Chưa giao</span>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell>
                            {new Date(request.createdAt).toLocaleDateString('vi-VN')}
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
              <CardTitle>Đăng ký xe chờ duyệt ({vehicles.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {vehiclesLoading ? (
                <div className="text-center py-8 text-gray-500">Đang tải...</div>
              ) : vehicles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Không có đăng ký xe chờ duyệt</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Chủ xe</TableHead>
                        <TableHead>Loại xe</TableHead>
                        <TableHead>Biển số</TableHead>
                        <TableHead>Màu sắc</TableHead>
                        <TableHead>Căn hộ</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Hành động</TableHead>
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
                              }}>Duyệt</Button>
                              <Button size="sm" variant="outline" className="text-red-600" onClick={() => {
                                setRejectingId(v.id);
                                setRejectionReason('');
                                setShowRejectModal(true);
                              }}>Từ chối</Button>
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
              <h3 className="text-lg font-semibold mb-2">Nhập lý do từ chối</h3>
              <textarea
                className="w-full border rounded p-2 h-28"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Lý do từ chối..."
              />
              <div className="mt-3 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowRejectModal(false)}>Hủy</Button>
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
                  Xác nhận từ chối
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
} 