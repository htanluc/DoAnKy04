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
  Eye,
  Filter,
} from 'lucide-react';
import Link from 'next/link';
import { User, Role } from '@/lib/api';
import { apiFetch } from '@/lib/api';
import { getRoleNames } from '@/lib/auth';

// Hàm kiểm tra role có phải là ADMIN không (fix lỗi typescript)
function hasAdminRole(roles?: Role[]): boolean {
  if (!roles) return false;
  // Sửa lỗi: ép kiểu role về string trước khi so sánh
  return roles.some(role => String(role) === 'ADMIN');
}

export default function UsersPage() {
  return (
    <AdminGuard>
      <UsersPageContent />
    </AdminGuard>
  );
}

function UsersPageContent() {
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  // filterRole là string để phù hợp với value của <select>
  const [filterRole, setFilterRole] = useState<string>('all');

  useEffect(() => {
    setLoading(true);
    setError('');
    // Guard để tránh gọi API lặp khi dev StrictMode
    if ((window as any).__USERS_LOADING__) {
      setLoading(false);
      return;
    }
    (window as any).__USERS_LOADING__ = true;
    apiFetch(`/api/admin/users`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data) => {
        setUsers(Array.isArray(data) ? data : data?.data ?? []);
        setError('');
      })
      .catch(() => {
        setError(t('admin.error.load'));
        setUsers([]);
      })
      .finally(() => {
        setLoading(false);
        (window as any).__USERS_LOADING__ = false;
      });
  }, []);

  // Sửa lỗi: so sánh đúng kiểu Role (so sánh string, không truyền string vào mảng Role)
  const filteredUsers = users.filter(user => {
    const roleNames = getRoleNames(user);
    // Loại bỏ user admin (username === 'admin') và user có role ADMIN
    if (roleNames.includes('ADMIN') || user.username === 'admin') return false;
    const matchesSearch =
      (user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (user.phoneNumber?.includes(searchTerm) ?? false);
    const matchesRole = filterRole === 'all' || roleNames.includes(filterRole);
    return matchesSearch && matchesRole;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800">{t('admin.status.active','Hoạt động')}</Badge>;
      case 'INACTIVE':
        return <Badge className="bg-red-100 text-red-800">{t('admin.status.inactive','Không hoạt động')}</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  // Sửa lỗi: truyền đúng kiểu cho role
  const getRoleBadge = (role?: Role | string) => {
    if (!role || role === '-') {
      return <Badge className="bg-gray-100 text-gray-800">-</Badge>;
    }
    const roleStr = String(role);
    const roleKey = `admin.users.role.${roleStr.toLowerCase()}`;
    return <Badge className={
      roleStr === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
        roleStr === 'STAFF' ? 'bg-blue-100 text-blue-800' :
          roleStr === 'RESIDENT' ? 'bg-green-100 text-green-800' :
            'bg-gray-100 text-gray-800'
    }>{t(roleKey, roleStr) || '-'}</Badge>;
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const res = await apiFetch(`/api/${user.id}/status?status=${newStatus}`, { method: 'PUT' });
      if (!res.ok) throw new Error('Failed to update status');
      setUsers((prev) => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
    } catch {
      alert('Không thể đổi trạng thái người dùng!');
    }
  };

  if (loading) {
    return (
      <AdminLayout title={t('admin.users.title')}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">{t('admin.loading')}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title={t('admin.users.title')}>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={t('admin.users.title')}>
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {t('admin.users.list')}
            </h2>
            <p className="text-gray-600">{t('admin.users.listDesc')}</p>
          </div>
          <Link href="/admin-dashboard/users/create">
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>{t('admin.action.create')}</span>
            </Button>
          </Link>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t('admin.action.search')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  title={t('admin.users.filterRole')}
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">{t('admin.users.filter.all')}</option>
                  <option value="ADMIN">{t('admin.users.role.admin')}</option>
                  <option value="STAFF">{t('admin.users.role.staff')}</option>
                  <option value="RESIDENT">{t('admin.users.role.resident')}</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t('admin.users.list')} ({filteredUsers.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">{t('admin.noData')}</p>
              </div>
            ) : (
              <Table className="table-fixed w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[110px] truncate">{t('admin.users.username')}</TableHead>
                    <TableHead className="w-[130px] truncate">{t('admin.users.email')}</TableHead>
                    <TableHead className="w-[110px] truncate">{t('admin.users.phone')}</TableHead>
                    <TableHead className="w-[80px] truncate">{t('admin.users.role')}</TableHead>
                    <TableHead className="w-[90px] truncate">{t('admin.users.status')}</TableHead>
                    <TableHead className="w-[60px] truncate">{t('admin.users.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium truncate max-w-[110px]" title={user.username}>{user.username}</TableCell>
                      <TableCell className="truncate max-w-[130px] whitespace-normal break-words" title={user.email}>{user.email}</TableCell>
                      <TableCell className="truncate max-w-[110px]" title={user.phoneNumber}>{user.phoneNumber}</TableCell>
                      <TableCell>
                        {getRoleBadge(getRoleNames(user)[0])}
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Link href={`/admin-dashboard/users/${user.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}