"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminGuard from '@/components/auth/admin-guard';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, ArrowLeft, Lock, Unlock, AlertTriangle, User } from 'lucide-react';
import Link from 'next/link';
import { API_BASE_URL, fetchRoles, getToken, refreshToken, removeTokens } from '@/lib/auth';
import { toast } from '@/components/ui/use-toast';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ServiceRequest, supportRequestsApi } from '@/lib/api';

interface UserDetail {
  id: string;
  username: string;
  email?: string;
  phoneNumber: string;
  roles?: string[];
  status: string;
  createdAt: string;
  lockReason?: string;
}

export default function UserDetailPage() {
  return (
    <AdminGuard>
      <UserDetailContent />
    </AdminGuard>
  );
}

function UserDetailContent() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const userId = params?.id as string;
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [linkedApartments, setLinkedApartments] = useState<any[]>([]);
  const [apartmentsLoading, setApartmentsLoading] = useState(false);
  const [pendingUnlink, setPendingUnlink] = useState<string | null>(null);
  const [allRoles, setAllRoles] = useState<{id: number, name: string}[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [assigning, setAssigning] = useState(false);
  const [showDeactivationDialog, setShowDeactivationDialog] = useState(false);
  const [deactivationReason, setDeactivationReason] = useState('');

  // Danh sách lý do cố định
  const fixedReasons: { value: string; label: string }[] = [
    { value: 'VIOLATION_RULES', label: 'Vi phạm nội quy' },
    { value: 'FRAUD_SUSPICION', label: 'Nghi ngờ gian lận' },
    { value: 'INAPPROPRIATE_BEHAVIOR', label: 'Hành vi không phù hợp' },
    { value: 'SECURITY_CONCERN', label: 'Vấn đề bảo mật' },
    { value: 'REQUESTED_BY_USER', label: 'Theo yêu cầu của người dùng' },
  ];
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [staffHistory, setStaffHistory] = useState<ServiceRequest[]>([]);
  const [staffHistoryLoading, setStaffHistoryLoading] = useState(false);

  // Hàm kiểm tra và refresh token
  const checkAndRefreshToken = async (): Promise<string | null> => {
    let token = getToken();
    if (!token) {
      router.push('/login');
      return null;
    }
    return token;
  };

  // Hàm xử lý API call với authentication
  const apiCall = async (url: string, options: RequestInit = {}) => {
    let token = await checkAndRefreshToken();
    if (!token) return null;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Nếu 401, thử refresh token
    if (response.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed && refreshed.token) {
        // Gửi lại request với token mới
        const retryResponse = await fetch(url, {
          ...options,
          headers: {
            'Authorization': `Bearer ${refreshed.token}`,
            'Content-Type': 'application/json',
            ...options.headers,
          },
        });
        return retryResponse;
      } else {
        // Token hết hạn, logout và redirect
        removeTokens();
        router.push('/login');
        return null;
      }
    }

    return response;
  };

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    
    const loadUserData = async () => {
      try {
        const response = await apiCall(`${API_BASE_URL}/api/admin/users/${userId}`);
        if (response) {
          if (response.ok) {
            const data = await response.json();
            setUser(data);
            setError('');
          } else {
            setError(t('admin.users.loadError', 'Không thể tải dữ liệu'));
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setError(t('admin.users.loadError', 'Không thể tải dữ liệu'));
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [userId, router]);

  useEffect(() => {
    if (!user) return;
    const roles = (user.roles || []).map(r => (typeof r === 'string' ? r : (r as any)?.name || r)).map(String);
    const isStaff = roles.some(r => ['STAFF','TECHNICIAN','CLEANER','SECURITY'].includes(String(r).toUpperCase()));
    if (!isStaff) {
      setStaffHistory([]);
      return;
    }
    setStaffHistoryLoading(true);
    (async () => {
      try {
        const list = await supportRequestsApi.getAssignedTo(Number(userId));
        const items = Array.isArray(list) ? list : [];
        const completed = items.filter(it => String(it.status).toUpperCase() === 'COMPLETED');
        setStaffHistory(completed);
      } catch {
        setStaffHistory([]);
      } finally {
        setStaffHistoryLoading(false);
      }
    })();
  }, [user, userId]);

  useEffect(() => {
    if (!userId) return;
    setApartmentsLoading(true);
    
    const loadApartments = async () => {
      try {
        // Thử gọi API apartment-residents trước (không cần quyền admin)
        let response = await fetch(`${API_BASE_URL}/api/apartment-residents/user/${userId}`);
        
        // Nếu không có quyền, thử gọi với token admin
        if (!response.ok && response.status === 401) {
          const token = getToken();
          if (token) {
            response = await fetch(`${API_BASE_URL}/api/apartment-residents/user/${userId}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
          }
        }
        
        if (response && response.ok) {
          const apartments = await response.json();
          console.log('Loaded apartments for user:', apartments);
          
          if (Array.isArray(apartments)) {
            setLinkedApartments(apartments);
          } else if (apartments && Array.isArray(apartments.data)) {
            setLinkedApartments(apartments.data);
          } else {
            setLinkedApartments([]);
          }
        } else {
          console.error('Failed to load apartments:', response.status, response.statusText);
          setLinkedApartments([]);
        }
      } catch (error) {
        console.error('Error loading apartments:', error);
        setLinkedApartments([]);
      } finally {
        setApartmentsLoading(false);
      }
    };

    loadApartments();
  }, [userId, router]);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const roles = await fetchRoles();
        setAllRoles(roles);
      } catch (error) {
        console.error('Error loading roles:', error);
        setAllRoles([]);
      }
    };
    loadRoles();
  }, []);

  const handleToggleStatus = async () => {
    if (!user) return;
    
    // Nếu đang kích hoạt tài khoản, thực hiện ngay
    if (user.status === 'INACTIVE') {
      await performStatusChange('ACTIVE', '');
      return;
    }
    
    // Nếu đang vô hiệu hóa, hiển thị dialog chọn lý do
    if (user.status === 'ACTIVE') {
      setDeactivationReason('');
      setShowDeactivationDialog(true);
      return;
    }
  };

  const performStatusChange = async (newStatus: string, reason: string) => {
    if (!user) return;
    
    const token = localStorage.getItem('token');
    if (!token) {
      toast({ title: t('admin.error', 'Lỗi'), description: t('admin.users.noToken', 'Không có token xác thực!'), variant: 'destructive' });
      return;
    }
    
    if (newStatus === 'INACTIVE' && !reason) {
      toast({ title: t('admin.error', 'Lỗi'), description: t('admin.users.deactivate.reason.required', 'Bạn phải chọn lý do vô hiệu hóa!'), variant: 'destructive' });
      return;
    }
    
    setIsDeactivating(true);
    
    try {
      let url = `${API_BASE_URL}/api/admin/users/${user.id}/status?status=${newStatus}`;
      if (newStatus === 'INACTIVE' && reason) {
        url += `&reason=${encodeURIComponent(reason)}`;
      }
      
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.message) {
            throw new Error(`Backend error: ${errorJson.message}`);
          }
        } catch (parseError) {
          // Nếu không parse được JSON, sử dụng text gốc
        }
        throw new Error(t('admin.users.statusUpdateError', `Failed to update status: ${res.status} ${res.statusText}`));
      }
      
      const result = await res.json();
      
      setUser({ ...user, status: newStatus, lockReason: reason });
      
      if (newStatus === 'INACTIVE') {
        toast({ 
          title: t('admin.success', '✅ Vô hiệu hóa thành công'), 
          description: t('admin.users.deactivate.success', `Tài khoản ${user.username} đã được vô hiệu hóa. Email thông báo đã được gửi đến ${user.email} với lý do: "${reason}"`) 
        });
        setShowDeactivationDialog(false);
        setDeactivationReason('');
      } else {
        toast({ 
          title: t('admin.success', '✅ Kích hoạt thành công'), 
          description: t('admin.users.activate.success', `Tài khoản ${user.username} đã được kích hoạt lại!`) 
        });
      }
    } catch (error: any) {
      console.error('Status change error:', error);
      toast({ 
        title: t('admin.error', 'Lỗi'), 
        description: t('admin.users.statusChangeError', `Không thể đổi trạng thái người dùng: ${error.message || 'Unknown error'}`), 
        variant: 'destructive' 
      });
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleDeactivate = () => {
    if (!deactivationReason) {
      toast({ title: t('admin.error', '❌ Lỗi'), description: t('admin.users.deactivate.noReason', 'Bạn phải chọn lý do vô hiệu hóa!'), variant: 'destructive' });
      return;
    }
    // Gửi label làm lý do hiển thị trong email/thông báo
    const selected = fixedReasons.find(r => r.value === deactivationReason);
    performStatusChange('INACTIVE', selected?.label || deactivationReason);
  };

  const handleUnlinkApartment = async (apartmentId: string) => {
    setPendingUnlink(apartmentId);
  };

  const confirmUnlinkApartment = async () => {
    if (!pendingUnlink) return;
    const apartmentId = pendingUnlink;
    setPendingUnlink(null);
    try {
      const res = await apiCall(`${API_BASE_URL}/api/apartments/${apartmentId}/residents`, { 
        method: 'DELETE',
        body: JSON.stringify({ userId }) 
      });
      if (res) {
        if (res.ok) {
          setLinkedApartments(linkedApartments.filter(ap => ap.apartmentId !== apartmentId));
          toast({ title: t('admin.success', 'Thành công'), description: t('admin.users.unlinkSuccess', 'Đã hủy liên kết căn hộ.') });
        } else {
          throw new Error(t('admin.users.unlinkFailed', 'Hủy liên kết thất bại'));
        }
      }
    } catch {
      toast({ title: t('admin.error', 'Lỗi'), description: t('admin.users.unlinkError', 'Không thể hủy liên kết!'), variant: 'destructive' });
    }
  };

  const handleAssignRole = async () => {
    if (!user || !selectedRole) return;
    setAssigning(true);
    const roleObj = allRoles.find(r => r.name === selectedRole);
    if (!roleObj) return;
    try {
      const res = await apiCall(`${API_BASE_URL}/api/admin/users/${user.id}/roles/assign?roleId=${roleObj.id}`, { method: 'POST' });
      if (res) {
        if (res.ok) {
          setUser({ ...user, roles: [...(user.roles || []), selectedRole] });
          setSelectedRole('');
          toast({ title: t('admin.success', 'Thành công'), description: t('admin.users.assignRoleSuccess', 'Đã gán vai trò cho user.') });
        } else {
          throw new Error(t('admin.users.assignRoleFailed', 'Failed to assign role'));
        }
      }
    } catch {
      toast({ title: t('admin.error', 'Lỗi'), description: t('admin.users.assignRoleError', 'Không thể gán vai trò!'), variant: 'destructive' });
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveRole = async (roleName: string) => {
    if (!user) return;
    setAssigning(true);
    const roleObj = allRoles.find(r => r.name === roleName);
    if (!roleObj) return;
    try {
      const res = await apiCall(`${API_BASE_URL}/api/admin/users/${user.id}/roles/remove?roleId=${roleObj.id}`, { method: 'POST' });
      if (res) {
        if (res.ok) {
          setUser({ ...user, roles: (user.roles || []).filter(r => r !== roleName) });
          toast({ title: t('admin.success', 'Thành công'), description: t('admin.users.removeRoleSuccess', 'Đã xóa vai trò khỏi user.') });
        } else {
          throw new Error(t('admin.users.removeRoleFailed', 'Failed to remove role'));
        }
      }
    } catch {
      toast({ title: t('admin.error', 'Lỗi'), description: t('admin.users.removeRoleError', 'Không thể xóa vai trò!'), variant: 'destructive' });
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title={t('admin.users.details', 'Chi tiết người dùng')}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">{t('admin.loading', 'Đang tải...')}</p>
        </div>
      </AdminLayout>
    );
  }

  if (error || !user) {
    return (
      <AdminLayout title={t('admin.users.details', 'Chi tiết người dùng')}>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-red-500 mb-4">{error || t('admin.noData', 'Không có dữ liệu')}</p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" /> {t('admin.action.back', 'Quay lại')}
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={t('admin.users.details', 'Chi tiết người dùng')}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{user.username}</h1>
              <p className="text-blue-100 text-lg">{t('admin.users.details.subtitle', 'Thông tin chi tiết người dùng')}</p>
            </div>
          </div>
        </div>

        {/* User Information Card */}
        <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-100">
            <CardTitle className="flex items-center space-x-2 text-gray-800">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-blue-600" />
              </div>
                             <span>{t('admin.users.personalInfo', 'Thông tin cá nhân')}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div>
                                         <div className="text-sm text-gray-500 font-medium">{t('admin.users.email', 'Email')}</div>
                     <div className="text-gray-900 font-semibold">{user.email || t('admin.users.notUpdated', 'Chưa cập nhật')}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                                         <div className="text-sm text-gray-500 font-medium">{t('admin.users.phoneNumber', 'Số điện thoại')}</div>
                    <div className="text-gray-900 font-semibold">{user.phoneNumber}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div>
                                         <div className="text-sm text-gray-500 font-medium">{t('admin.users.role', 'Vai trò')}</div>
                     <div className="flex flex-wrap gap-2">
                       {user.roles && user.roles.length > 0 ? (
                         user.roles.map((role, idx) => (
                           <Badge key={idx} className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200">
                             {typeof role === 'string' ? role : (role as any)?.name || role}
                           </Badge>
                         ))
                       ) : (
                         <Badge variant="outline" className="text-gray-500">{t('admin.users.noRole', 'Chưa phân quyền')}</Badge>
                       )}
                     </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                                         <div className="text-sm text-gray-500 font-medium">{t('admin.users.status', 'Trạng thái')}</div>
                     <Badge className={
                       user.status === 'ACTIVE' 
                         ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200' 
                         : 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
                     }>
                       {user.status === 'ACTIVE' ? t('admin.users.status.active', 'Hoạt động') : t('admin.users.status.inactive', 'Vô hiệu hóa')}
                     </Badge>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                                         <div className="text-sm text-gray-500 font-medium">{t('admin.users.createdAt', 'Ngày tạo')}</div>
                    <div className="text-gray-900 font-semibold">{new Date(user.createdAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}</div>
                  </div>
                </div>
              </div>
            </div>

            {(user.status === 'INACTIVE') && user.lockReason && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                                     <span className="text-red-800 font-medium">{t('admin.users.deactivate.reason', 'Lý do vô hiệu hóa')}:</span>
                  <span className="text-red-700">{t(`admin.users.deactivate.reason.${user.lockReason}`, user.lockReason)}</span>
                </div>
              </div>
            )}
            {/* Chỉ hiển thị phần liên kết căn hộ nếu user KHÔNG phải là nhân viên */}
            {(() => {
              const roles = (user.roles || []).map(r => (typeof r === 'string' ? r : (r as any)?.name || r)).map(String);
              const isStaff = roles.some(r => ['STAFF','TECHNICIAN','CLEANER','SECURITY'].includes(String(r).toUpperCase()));
              
              // Nếu là nhân viên, không hiển thị gì cả
              if (isStaff) {
                return null;
              }
              
              return (
                <div className="mt-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800">{t('admin.users.linkedApartments', 'Căn hộ đã liên kết')}</h3>
                  </div>
                  
                  {apartmentsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="flex items-center space-x-3 text-gray-600">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="text-lg">{t('admin.loading', 'Đang tải...')}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                      {Array.isArray(linkedApartments) && linkedApartments.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">{t('admin.users.apartmentCode', 'Mã căn hộ')}</th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">{t('admin.users.relationType', 'Loại quan hệ')}</th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">{t('admin.users.action', 'Hành động')}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {linkedApartments.map((ap) => (
                                <tr key={ap.apartmentId} className="hover:bg-gray-50 transition-colors duration-200">
                                  <td className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <span className="text-blue-600 font-bold text-sm">{ap.apartmentUnitNumber?.charAt(0) || 'A'}</span>
                                      </div>
                                      <div>
                                        <div className="text-sm font-semibold text-gray-900">{ap.apartmentUnitNumber || 'N/A'}</div>
                                        <div className="text-xs text-gray-500">{t('admin.users.apartment', 'Căn hộ')}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className={
                                      ap.relationType === 'OWNER' 
                                        ? 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200' :
                                      ap.relationType === 'TENANT' 
                                        ? 'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200' :
                                        'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200'
                                    }>
                                      {ap.relationType === 'OWNER' ? t('admin.users.relationType.OWNER', 'Chủ hộ') : 
                                       ap.relationType === 'TENANT' ? t('admin.users.relationType.TENANT', 'Người thuê') : 
                                       t('admin.users.relationType.FAMILY_MEMBER', 'Thành viên')}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                    <AlertDialog open={pendingUnlink === ap.apartmentId} onOpenChange={open => !open && setPendingUnlink(null)}>
                                      <AlertDialogTrigger asChild>
                                        <Button 
                                          variant="outline" 
                                          size="sm" 
                                          onClick={() => handleUnlinkApartment(ap.apartmentId)}
                                          className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                                        >
                                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                          </svg>
                                          {t('admin.users.unlink', 'Hủy liên kết')}
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle className="flex items-center space-x-2 text-red-600">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                            </svg>
                                            <span>{t('admin.users.unlink.confirmTitle', 'Xác nhận hủy liên kết')}</span>
                                          </AlertDialogTitle>
                                          <AlertDialogDescription>
                                            {t('admin.users.unlink.confirmDesc', 'Bạn có chắc chắn muốn hủy liên kết căn hộ {unit} với tài khoản này không?').replace('{unit}', String(ap.apartmentUnitNumber || 'N/A'))}
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>{t('admin.action.cancel', 'Hủy')}</AlertDialogCancel>
                                          <AlertDialogAction onClick={confirmUnlinkApartment} className="bg-red-600 hover:bg-red-700">
                                            {t('admin.action.confirm', 'Đồng ý')}
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-16 px-6">
                          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                                                     <h3 className="text-lg font-medium text-gray-900 mb-2">{t('admin.users.linkedApartments.none', 'Chưa liên kết căn hộ nào')}</h3>
                           <p className="text-gray-500 max-w-sm mx-auto">{t('admin.users.linkedApartments.noDescription', 'User này chưa được gán vào căn hộ nào trong hệ thống. Bạn có thể liên kết căn hộ từ trang quản lý căn hộ.')}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
            <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-200">
              <Link href={`/admin-dashboard/users/edit/${user.id}`}>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-all duration-200 hover:shadow-lg">
                  <Edit className="h-4 w-4 mr-2" />
                  {t('admin.action.edit', 'Chỉnh sửa')}
                </Button>
              </Link>
              
              <Button
                variant="outline"
                className={`px-6 py-2 rounded-lg transition-all duration-200 hover:shadow-lg ${
                  user.status === 'ACTIVE' 
                    ? 'border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400' 
                    : 'border-green-300 text-green-600 hover:bg-green-50 hover:border-green-400'
                }`}
                onClick={handleToggleStatus}
              >
                {user.status === 'ACTIVE' ? <Lock className="h-4 w-4 mr-2" /> : <Unlock className="h-4 w-4 mr-2" />}
                {user.status === 'ACTIVE' ? t('admin.action.deactivate', 'Vô hiệu hóa') : t('admin.action.activate', 'Kích hoạt')}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => router.back()}
                className="px-6 py-2 rounded-lg transition-all duration-200 hover:shadow-lg border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('admin.action.back', 'Quay lại')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Chỉ hiển thị lịch sử nhiệm vụ nếu user là nhân viên */}
        {(() => {
          const roles = (user.roles || []).map(r => (typeof r === 'string' ? r : (r as any)?.name || r)).map(String);
          const isStaff = roles.some(r => ['STAFF','TECHNICIAN','CLEANER','SECURITY'].includes(String(r).toUpperCase()));
          
          // Nếu không phải nhân viên, không hiển thị phần lịch sử nhiệm vụ
          if (!isStaff) {
            return null;
          }
          
          return (
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.users.staff.history', 'Lịch sử nhiệm vụ đã làm')}</CardTitle>
              </CardHeader>
              <CardContent>
                {staffHistoryLoading ? (
                  <div className="text-gray-600">{t('admin.loading', 'Đang tải...')}</div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table className="min-w-[600px] w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead>{t('admin.users.staff.residentName', 'Tên cư dân')}</TableHead>
                          <TableHead>{t('admin.users.staff.category', 'Danh mục')}</TableHead>
                          <TableHead>{t('admin.users.staff.status', 'Trạng thái')}</TableHead>
                          <TableHead>{t('admin.users.staff.createdAt', 'Ngày tạo')}</TableHead>
                          <TableHead className="text-right">{t('admin.users.action', 'Hành động')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {staffHistory.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                              <div className="flex flex-col items-center space-y-2">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                  </svg>
                                </div>
                                                                 <span className="text-gray-600 font-medium">{t('admin.supportRequests.none', 'Chưa có nhiệm vụ đã hoàn thành')}</span>
                                 <span className="text-sm text-gray-400">{t('admin.users.staff.noTasks', 'Nhân viên này chưa hoàn thành nhiệm vụ nào')}</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          staffHistory.map(item => (
                            <TableRow key={item.id} className="hover:bg-gray-50 transition-colors duration-200">
                              <TableCell className="py-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                                       <span className="text-blue-600 font-semibold text-sm">
                                     {(item.user?.username || item.userName || 'U')?.charAt(0).toUpperCase()}
                                   </span>
                                 </div>
                                 <div>
                                   <div className="font-medium text-gray-900">
                                     {item.user?.username || item.userName || t('admin.users.unknown', 'Không rõ')}
                                   </div>
                                   <div className="text-sm text-gray-500">{t('admin.users.id', 'ID')}: {item.id}</div>
                                 </div>
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="flex items-center space-x-2">
                                  <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                    </svg>
                                  </div>
                                                                     <span className="text-sm font-medium text-gray-700">
                                     {(item.category as any)?.categoryName || (item as any)?.categoryName || t('admin.users.noCategory', 'Không phân loại')}
                                   </span>
                                </div>
                              </TableCell>
                              <TableCell className="py-4">
                                <Badge className="bg-green-100 text-green-800 border border-green-200 hover:bg-green-200 transition-colors">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  {t('admin.status.completed','Hoàn thành')}
                                </Badge>
                              </TableCell>
                              <TableCell className="py-4">
                                <div className="text-sm text-gray-900">
                                  {item.submittedAt 
                                    ? new Date(item.submittedAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')
                                    : item.createdAt 
                                      ? new Date(item.createdAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')
                                      : '-'
                                  }
                                </div>
                                <div className="text-xs text-gray-500">
                                  {item.submittedAt 
                                    ? new Date(item.submittedAt).toLocaleTimeString(language === 'vi' ? 'vi-VN' : 'en-US', {hour: '2-digit', minute: '2-digit'})
                                    : item.createdAt 
                                      ? new Date(item.createdAt).toLocaleTimeString(language === 'vi' ? 'vi-VN' : 'en-US', {hour: '2-digit', minute: '2-digit'})
                                      : '-'
                                  }
                                </div>
                              </TableCell>
                              <TableCell className="py-4 text-right">
                                <Link href={`/admin-dashboard/support-requests/${item.id}`}>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                                  >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    {t('admin.action.view','Xem chi tiết')}
                                  </Button>
                                </Link>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })()}
      </div>

      {/* Dialog chọn lý do vô hiệu hóa */}
      <AlertDialog 
        open={showDeactivationDialog} 
        onOpenChange={(open) => {
          if (!open && !isDeactivating) {
            setShowDeactivationDialog(false);
            setDeactivationReason('');
          }
        }}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              {t('admin.users.deactivate.title', 'Vô hiệu hóa tài khoản')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.users.deactivate.desc', `Bạn sắp vô hiệu hóa tài khoản của {username} ({email}). Vui lòng chọn một lý do để gửi thông báo cho cư dân.`)
                .replace('{username}', String(user?.username || ''))
                .replace('{email}', String(user?.email || ''))}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="deactivation-reason">{t('admin.users.deactivate.reason', 'Lý do vô hiệu hóa')} *</Label>
              <Select
                value={deactivationReason}
                onValueChange={(v) => setDeactivationReason(v)}
                disabled={isDeactivating}
              >
                <SelectTrigger id="deactivation-reason">
                  <SelectValue placeholder={t('admin.users.deactivate.reason.placeholder', 'Chọn lý do')} />
                </SelectTrigger>
                <SelectContent>
                  {fixedReasons.map((r) => (
                    <SelectItem key={r.value} value={r.value}>{t(`admin.users.deactivate.reason.${r.value}`, r.label)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                {t('admin.users.deactivate.emailNotice', 'Email thông báo sẽ được gửi tự động đến {email} với lý do đã chọn và hướng dẫn khôi phục tài khoản.')
                  .replace('{email}', String(user?.email || ''))}
              </p>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel 
              disabled={isDeactivating}
              onClick={() => {
                setShowDeactivationDialog(false);
                setDeactivationReason('');
              }}
            >
              {t('admin.action.cancel', 'Hủy')}
            </AlertDialogCancel>
            <Button
              onClick={handleDeactivate}
              disabled={isDeactivating || !deactivationReason}
              variant="destructive"
              className="min-w-[100px]"
            >
              {isDeactivating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('admin.action.loading', 'Đang tải...')}
                </>
              ) : (
                t('admin.action.deactivate', 'Vô hiệu hóa')
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
} 