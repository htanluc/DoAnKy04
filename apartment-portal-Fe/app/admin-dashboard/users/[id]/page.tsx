"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Trash2, ArrowLeft, Lock, Unlock } from 'lucide-react';
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
    const token = localStorage.getItem('token');
    setApartmentsLoading(true);
    fetch(`${API_BASE_URL}/api/apartments`, {
      headers: { 'Authorization': token ? `Bearer ${token}` : '' },
    })
      .then(res => res.json())
      .then(async (apartments) => {
        const results = await Promise.all(
          apartments.map(async (ap: any) => {
            const res = await fetch(`${API_BASE_URL}/api/apartments/${ap.id}/residents`, {
              headers: { 'Authorization': token ? `Bearer ${token}` : '' },
            });
            if (!res.ok) return null;
            const residents = await res.json();
            const found = residents.find((r: any) => r.userId == userId);
            if (found) {
              return {
                apartmentId: ap.id,
                unitNumber: ap.unitNumber,
                buildingId: ap.buildingId,
                relationType: found.relationType,
              };
            }
            return null;
          })
        );
        setLinkedApartments(results.filter(Boolean));
      })
      .finally(() => setApartmentsLoading(false));
  }, [userId]);

  useEffect(() => {
    fetchRoles().then(setAllRoles).catch(() => setAllRoles([]));
  }, []);

  const handleToggleStatus = async () => {
    if (!user) return;
    const token = localStorage.getItem('token');
    let newStatus = user.status === 'ACTIVE' ? 'LOCKED' : 'ACTIVE';
    let reason = '';
    if (newStatus === 'LOCKED') {
      reason = prompt('Nhập lý do khóa tài khoản:', user.lockReason || '') || '';
      if (!reason.trim()) {
        alert('Bạn phải nhập lý do khóa!');
        return;
      }
    }
    let url = `${API_BASE_URL}/api/admin/users/${user.id}/status?status=${newStatus}`;
    if (newStatus === 'LOCKED') {
      url += `&reason=${encodeURIComponent(reason)}`;
    }
    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });
      if (!res.ok) throw new Error('Failed to update status');
      setUser({ ...user, status: newStatus, lockReason: reason });
    } catch {
      alert('Không thể đổi trạng thái người dùng!');
    }
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
                    <Badge key={role} className="mr-2">
                      {role}
                      <Button size="sm" variant="ghost" onClick={() => handleRemoveRole(role)} disabled={assigning || role === 'ADMIN'}>
                        <Trash2 className="h-3 w-3 ml-1" />
                      </Button>
                    </Badge>
                  ))
                ) : (
                  <Badge>-</Badge>
                )}
                <div className="mt-2 flex items-center gap-2">
                  <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)} className="border rounded px-2 py-1">
                    <option value="">Chọn vai trò...</option>
                    {allRoles.filter(r => !user.roles?.includes(r.name)).map(r => (
                      <option key={r.id} value={r.name}>{r.name}</option>
                    ))}
                  </select>
                  <Button size="sm" onClick={handleAssignRole} disabled={!selectedRole || assigning}>Gán vai trò</Button>
                </div>
              </div>
              <div><strong>{t('admin.users.status', 'Trạng thái')}:</strong> <Badge>{user.status}</Badge></div>
              <div><strong>{t('admin.users.createdAt', 'Ngày tạo')}:</strong> {new Date(user.createdAt).toLocaleDateString('vi-VN')}</div>
              {(user.status === 'LOCKED' || user.status === 'INACTIVE') && user.lockReason && (
                <div className="text-red-600"><b>Lý do khóa:</b> {user.lockReason}</div>
              )}
            </div>
            <div className="mt-6">
              <div className="font-semibold mb-2">Căn hộ đã liên kết:</div>
              {apartmentsLoading ? (
                <div>Đang tải...</div>
              ) : linkedApartments.length === 0 ? (
                <div className="text-gray-500">Chưa liên kết căn hộ nào</div>
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
                      {linkedApartments.map((ap) => (
                        <tr key={ap.apartmentId} className="hover:bg-gray-50 text-center">
                          <td className="py-2 px-3 font-medium">{ap.unitNumber}</td>
                          <td className="py-2 px-3">{ap.buildingId}</td>
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
                      ))}
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
                className={user.status === 'ACTIVE' ? 'text-yellow-600 hover:text-yellow-700' : 'text-green-600 hover:text-green-700'}
                onClick={handleToggleStatus}
              >
                {user.status === 'ACTIVE' ? <Lock className="h-4 w-4 mr-2" /> : <Unlock className="h-4 w-4 mr-2" />}
                {user.status === 'ACTIVE' ? t('admin.action.lock', 'Khóa') : t('admin.action.unlock', 'Mở khóa')}
              </Button>
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />{t('admin.action.back', 'Quay lại')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
} 