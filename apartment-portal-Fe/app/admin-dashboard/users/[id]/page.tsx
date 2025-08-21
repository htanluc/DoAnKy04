"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminGuard from '@/components/auth/admin-guard';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, ArrowLeft, Lock, Unlock, AlertTriangle } from 'lucide-react';
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
            setError('Không thể tải dữ liệu');
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setError('Không thể tải dữ liệu');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [userId, router]);

  useEffect(() => {
    if (!userId) return;
    setApartmentsLoading(true);
    
    const loadApartments = async () => {
      try {
        const response = await apiCall(`${API_BASE_URL}/api/admin/apartment-residents/user/${userId}`);
        if (response) {
          if (response.ok) {
            const apartments = await response.json();
            if (Array.isArray(apartments)) {
              setLinkedApartments(apartments);
            } else if (apartments && Array.isArray(apartments.data)) {
              setLinkedApartments(apartments.data);
            } else {
              setLinkedApartments([]);
            }
          }
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
      toast({ title: 'Lỗi', description: 'Không có token xác thực!', variant: 'destructive' });
      return;
    }
    
    if (newStatus === 'INACTIVE' && !reason) {
      toast({ title: 'Lỗi', description: 'Bạn phải chọn lý do vô hiệu hóa!', variant: 'destructive' });
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
        throw new Error(`Failed to update status: ${res.status} ${res.statusText}`);
      }
      
      const result = await res.json();
      
      setUser({ ...user, status: newStatus, lockReason: reason });
      
      if (newStatus === 'INACTIVE') {
        toast({ 
          title: '✅ Vô hiệu hóa thành công', 
          description: `Tài khoản ${user.username} đã được vô hiệu hóa. Email thông báo đã được gửi đến ${user.email} với lý do: "${reason}"` 
        });
        setShowDeactivationDialog(false);
        setDeactivationReason('');
      } else {
        toast({ 
          title: '✅ Kích hoạt thành công', 
          description: `Tài khoản ${user.username} đã được kích hoạt lại!` 
        });
      }
    } catch (error: any) {
      console.error('Status change error:', error);
      toast({ 
        title: 'Lỗi', 
        description: `Không thể đổi trạng thái người dùng: ${error.message || 'Unknown error'}`, 
        variant: 'destructive' 
      });
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleDeactivate = () => {
    if (!deactivationReason) {
      toast({ title: '❌ Lỗi', description: 'Bạn phải chọn lý do vô hiệu hóa!', variant: 'destructive' });
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
          toast({ title: 'Thành công', description: 'Đã hủy liên kết căn hộ.' });
        } else {
          throw new Error('Hủy liên kết thất bại');
        }
      }
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể hủy liên kết!', variant: 'destructive' });
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
          toast({ title: 'Thành công', description: 'Đã gán vai trò cho user.' });
        } else {
          throw new Error('Failed to assign role');
        }
      }
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể gán vai trò!', variant: 'destructive' });
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
          toast({ title: 'Thành công', description: 'Đã xóa vai trò khỏi user.' });
        } else {
          throw new Error('Failed to remove role');
        }
      }
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể xóa vai trò!', variant: 'destructive' });
    } finally {
      setAssigning(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title={t('admin.users.details', 'Chi tiết người dùng')}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">{t('admin.loading')}</p>
        </div>
      </AdminLayout>
    );
  }

  if (error || !user) {
    return (
      <AdminLayout title={t('admin.users.details', 'Chi tiết người dùng')}>
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-red-500 mb-4">{error || t('admin.noData')}</p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" /> {t('admin.action.back', 'Quay lại')}
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={t('admin.users.details', 'Chi tiết người dùng')}>
      <div className="max-w-xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{user.username}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div><strong>{t('admin.users.email', 'Email')}:</strong> {user.email}</div>
              <div><strong>{t('admin.users.phoneNumber', 'Số điện thoại')}:</strong> {user.phoneNumber}</div>
              <div>
                <strong>{t('admin.users.role', 'Vai trò')}:</strong>
                {user.roles && user.roles.length > 0 ? (
                  user.roles.map((role, idx) => (
                    <Badge key={idx} className="mr-2">
                      {typeof role === 'string' ? role : (role as any)?.name || role}
                    </Badge>
                  ))
                ) : (
                  <Badge>-</Badge>
                )}
              </div>
              <div><strong>{t('admin.users.status', 'Trạng thái')}:</strong> <Badge>{user.status}</Badge></div>
              <div><strong>{t('admin.users.createdAt', 'Ngày tạo')}:</strong> {new Date(user.createdAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}</div>
              {(user.status === 'INACTIVE') && user.lockReason && (
                <div className="text-red-600"><b>{t('admin.users.deactivate.reason', 'Lý do vô hiệu hóa')}:</b> {t(`admin.users.deactivate.reason.${user.lockReason}`, user.lockReason)}</div>
              )}
            </div>
            <div className="mt-6">
              <div className="font-semibold mb-2">{t('admin.users.linkedApartments', 'Căn hộ đã liên kết')}:</div>
              {apartmentsLoading ? (
                <div>{t('admin.loading', 'Đang tải...')}</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-[400px] w-full text-sm rounded-lg shadow border border-gray-200">
                    <thead>
                      <tr className="bg-gray-100 text-center">
                        <th className="py-2 px-3">{t('admin.users.apartmentCode', 'Mã căn hộ')}</th>
                        <th className="py-2 px-3">{t('admin.users.building', 'Tòa')}</th>
                        <th className="py-2 px-3">{t('admin.users.relationType', 'Loại quan hệ')}</th>
                        <th className="py-2 px-3">{t('admin.users.action', 'Hành động')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(linkedApartments) && linkedApartments.length > 0 ? (
                        linkedApartments.map((ap) => (
                          <tr key={ap.apartmentId} className="hover:bg-gray-50 text-center">
                            <td className="py-2 px-3 font-medium">{ap.unitNumber}</td>
                            <td className="py-2 px-3">{ap.buildingName}</td>
                            <td className="py-2 px-3">
                              <span className={
                                ap.relationType === 'OWNER' ? 'bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-semibold' :
                                ap.relationType === 'TENANT' ? 'bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-semibold' :
                                'bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-semibold'
                              }>
                                {ap.relationType === 'OWNER' ? t('admin.users.relationType.OWNER', 'Chủ hộ') : ap.relationType === 'TENANT' ? t('admin.users.relationType.TENANT', 'Người thuê') : t('admin.users.relationType.FAMILY_MEMBER', 'Thành viên')}
                              </span>
                            </td>
                            <td className="py-2 px-3">
                              <AlertDialog open={pendingUnlink === ap.apartmentId} onOpenChange={open => !open && setPendingUnlink(null)}>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm" onClick={() => handleUnlinkApartment(ap.apartmentId)}>
                                    {t('admin.users.unlink', 'Hủy liên kết')}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>{t('admin.users.unlink.confirmTitle', 'Xác nhận hủy liên kết')}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {t('admin.users.unlink.confirmDesc', 'Bạn có chắc chắn muốn hủy liên kết căn hộ {unit} với tài khoản này không?').replace('{unit}', String(ap.unitNumber))}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>{t('admin.action.cancel', 'Hủy')}</AlertDialogCancel>
                                    <AlertDialogAction onClick={confirmUnlinkApartment}>{t('admin.action.confirm', 'Đồng ý')}</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="text-center py-2 text-gray-500">{t('admin.users.linkedApartments.none', 'Chưa liên kết căn hộ nào')}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-6">
              <Link href={`/admin-dashboard/users/edit/${user.id}`}>
                <Button variant="outline"><Edit className="h-4 w-4 mr-2" />{t('admin.action.edit', 'Sửa')}</Button>
              </Link>
              <Button
                variant="outline"
                className={user.status === 'ACTIVE' ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}
                onClick={handleToggleStatus}
              >
                {user.status === 'ACTIVE' ? <Lock className="h-4 w-4 mr-2" /> : <Unlock className="h-4 w-4 mr-2" />}
                {user.status === 'ACTIVE' ? t('admin.action.deactivate', 'Vô hiệu hóa') : t('admin.action.activate', 'Kích hoạt')}
              </Button>
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />{t('admin.action.back', 'Quay lại')}
              </Button>
            </div>
          </CardContent>
        </Card>
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