"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, ArrowLeft, Lock, Unlock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { API_BASE_URL, fetchRoles } from '@/lib/auth';
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
import { Textarea } from '@/components/ui/textarea';
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
  const { t } = useLanguage();
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
  const [isDeactivating, setIsDeactivating] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/api/admin/users/${userId}`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setError('');
      })
      .catch(() => {
        setError('Không thể tải dữ liệu');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    setApartmentsLoading(true);
    const token = localStorage.getItem('token');
    fetch(`${API_BASE_URL}/api/admin/apartment-residents/user/${userId}`, {
      headers: { 'Authorization': token ? `Bearer ${token}` : '' },
    })
      .then(res => res.json())
      .then((apartments) => {
        if (Array.isArray(apartments)) {
          setLinkedApartments(apartments);
        } else if (apartments && Array.isArray(apartments.data)) {
          setLinkedApartments(apartments.data);
        } else {
          setLinkedApartments([]);
        }
      })
      .finally(() => setApartmentsLoading(false));
  }, [userId]);

  useEffect(() => {
    fetchRoles().then(setAllRoles).catch(() => setAllRoles([]));
  }, []);

  const handleToggleStatus = async () => {
    if (!user) return;
    
    // Nếu đang kích hoạt tài khoản, thực hiện ngay
    if (user.status === 'INACTIVE') {
      await performStatusChange('ACTIVE', '');
      return;
    }
    
    // Nếu đang vô hiệu hóa, hiển thị dialog nhập lý do
    if (user.status === 'ACTIVE') {
      setDeactivationReason(user.lockReason || '');
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
    
    if (newStatus === 'INACTIVE' && !reason.trim()) {
      toast({ title: 'Lỗi', description: 'Bạn phải nhập lý do vô hiệu hóa!', variant: 'destructive' });
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
    if (!deactivationReason.trim()) {
      toast({ title: '❌ Lỗi', description: 'Bạn phải nhập lý do vô hiệu hóa!', variant: 'destructive' });
      return;
    }
    
    if (deactivationReason.trim().length < 10) {
      toast({ 
        title: '❌ Lý do quá ngắn', 
        description: 'Lý do vô hiệu hóa phải có ít nhất 10 ký tự để đảm bảo tính rõ ràng.', 
        variant: 'destructive' 
      });
      return;
    }
    
    performStatusChange('INACTIVE', deactivationReason);
  };

  const handleUnlinkApartment = async (apartmentId: string) => {
    setPendingUnlink(apartmentId);
  };

  const confirmUnlinkApartment = async () => {
    if (!pendingUnlink) return;
    const apartmentId = pendingUnlink;
    setPendingUnlink(null);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/apartments/${apartmentId}/residents`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error('Hủy liên kết thất bại');
      setLinkedApartments(linkedApartments.filter(ap => ap.apartmentId !== apartmentId));
      toast({ title: 'Thành công', description: 'Đã hủy liên kết căn hộ.' });
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể hủy liên kết!', variant: 'destructive' });
    }
  };

  const handleAssignRole = async () => {
    if (!user || !selectedRole) return;
    setAssigning(true);
    const token = localStorage.getItem('token');
    const roleObj = allRoles.find(r => r.name === selectedRole);
    if (!roleObj) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${user.id}/roles/assign?roleId=${roleObj.id}`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to assign role');
      setUser({ ...user, roles: [...(user.roles || []), selectedRole] });
      setSelectedRole('');
      toast({ title: 'Thành công', description: 'Đã gán vai trò cho user.' });
    } catch {
      toast({ title: 'Lỗi', description: 'Không thể gán vai trò!', variant: 'destructive' });
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveRole = async (roleName: string) => {
    if (!user) return;
    setAssigning(true);
    const token = localStorage.getItem('token');
    const roleObj = allRoles.find(r => r.name === roleName);
    if (!roleObj) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${user.id}/roles/remove?roleId=${roleObj.id}`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to remove role');
      setUser({ ...user, roles: (user.roles || []).filter(r => r !== roleName) });
      toast({ title: 'Thành công', description: 'Đã xóa vai trò khỏi user.' });
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
              <div><strong>{t('admin.users.createdAt', 'Ngày tạo')}:</strong> {new Date(user.createdAt).toLocaleDateString('vi-VN')}</div>
              {(user.status === 'INACTIVE') && user.lockReason && (
                <div className="text-red-600"><b>Lý do vô hiệu hóa:</b> {user.lockReason}</div>
              )}
            </div>
            <div className="mt-6">
              <div className="font-semibold mb-2">Căn hộ đã liên kết:</div>
              {apartmentsLoading ? (
                <div>Đang tải...</div>
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
                                {ap.relationType === 'OWNER' ? 'Chủ hộ' : ap.relationType === 'TENANT' ? 'Người thuê' : 'Thành viên'}
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
                                    <AlertDialogTitle>Xác nhận hủy liên kết</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Bạn có chắc chắn muốn hủy liên kết căn hộ <b>{ap.unitNumber}</b> với tài khoản này không?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                                    <AlertDialogAction onClick={confirmUnlinkApartment}>Đồng ý</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="text-center py-2 text-gray-500">Chưa liên kết căn hộ nào</td>
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

      {/* Dialog nhập lý do vô hiệu hóa */}
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
              Vô hiệu hóa tài khoản
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn sắp vô hiệu hóa tài khoản của <strong>{user?.username}</strong> ({user?.email}). 
              Vui lòng nhập lý do chi tiết để gửi thông báo cho cư dân.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="deactivation-reason">
                Lý do vô hiệu hóa * 
                <span className="text-sm text-gray-500 ml-1">(tối thiểu 10 ký tự)</span>
              </Label>
              <Textarea
                id="deactivation-reason"
                placeholder="Nhập lý do vô hiệu hóa tài khoản... (tối thiểu 10 ký tự)"
                value={deactivationReason}
                onChange={(e) => setDeactivationReason(e.target.value)}
                className="min-h-[100px] resize-none"
                disabled={isDeactivating}
              />
              <div className="text-xs text-gray-500 text-right">
                {deactivationReason.length}/500 ký tự
                {deactivationReason.length > 0 && deactivationReason.length < 10 && (
                  <span className="text-red-500 ml-2">⚠️ Quá ngắn</span>
                )}
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>📧 Thông báo email:</strong> Email thông báo sẽ được gửi tự động đến <strong>{user?.email}</strong> 
                với lý do vô hiệu hóa và hướng dẫn khôi phục tài khoản.
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
              Hủy
            </AlertDialogCancel>
            <Button
              onClick={handleDeactivate}
              disabled={isDeactivating || !deactivationReason.trim() || deactivationReason.trim().length < 10}
              variant="destructive"
              className="min-w-[100px]"
            >
              {isDeactivating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang xử lý...
                </>
              ) : (
                'Vô hiệu hóa'
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
} 