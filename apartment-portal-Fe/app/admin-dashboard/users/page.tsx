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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Search,
  Eye,
  Filter,
  Download,
  FileSpreadsheet,
  BarChart3,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { User, Role } from '@/lib/api';
import { apiFetch } from '@/lib/api';
import { getRoleNames } from '@/lib/auth';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  exportUsersToExcel, 
  exportUsersByTabToExcel,
  exportUsersStatsToExcel 
} from '@/lib/excel-export';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  // filterRole là string để phù hợp với value của <select>
  const [filterRole, setFilterRole] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'staff' | 'resident'>('staff');
  const [page, setPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const PAGE_SIZE = 10;

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
        setError(t('admin.error.load', 'Không thể tải dữ liệu'));
        setUsers([]);
      })
      .finally(() => {
        setLoading(false);
        (window as any).__USERS_LOADING__ = false;
      });
  }, []);

  // Debounce search input
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(id);
  }, [searchTerm]);

  // Danh sách theo tab + filter
  const filteredUsers = users.filter(user => {
    const roleNames = getRoleNames(user);
    // Loại bỏ user admin (username === 'admin') và user có role ADMIN
    if (roleNames.includes('ADMIN') || user.username === 'admin') return false;
    const matchesSearch =
      (user.username?.toLowerCase().includes(debouncedSearch.toLowerCase()) ?? false) ||
      (user.email?.toLowerCase().includes(debouncedSearch.toLowerCase()) ?? false) ||
      (user.phoneNumber?.includes(debouncedSearch) ?? false) ||
      (user.fullName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ?? false);

    const inTab = activeTab === 'resident'
      ? roleNames.includes('RESIDENT')
      : roleNames.some(r => r !== 'RESIDENT' && r !== 'ADMIN'); // nhân viên: các role không phải RESIDENT/ADMIN

    // Filter theo role cho tab staff, theo status cho tab resident
    let matchesFilter = true;
    if (activeTab === 'resident') {
      // Tab resident: filter theo status
      matchesFilter = filterRole === 'all' || user.status === filterRole;
    } else {
      // Tab staff: filter theo role
      matchesFilter = filterRole === 'all' || roleNames.includes(filterRole);
    }

    return matchesSearch && inTab && matchesFilter;
  });

  const pagedUsers = filteredUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));

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
            roleStr === 'TECHNICIAN' ? 'bg-orange-100 text-orange-800' :
            roleStr === 'CLEANER' ? 'bg-yellow-100 text-yellow-800' :
            roleStr === 'SECURITY' ? 'bg-indigo-100 text-indigo-800' :
            'bg-gray-100 text-gray-800'
    }>{t(roleKey, roleStr) || '-'}</Badge>;
  };

  // Excel Export Functions
  const handleExportAll = async () => {
    try {
      setIsExporting(true);
      exportUsersToExcel(users, {
        fileName: `danh-sach-nguoi-dung-tat-ca-${new Date().toISOString().split('T')[0]}`
      });
      toast({
        title: "Xuất Excel thành công",
        description: "Đã xuất tất cả người dùng ra file Excel",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Lỗi xuất Excel",
        description: error instanceof Error ? error.message : "Không thể xuất file Excel",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCurrentTab = async () => {
    try {
      setIsExporting(true);
      exportUsersByTabToExcel(users, activeTab, debouncedSearch, filterRole, {
        fileName: `nguoi-dung-${activeTab}-${new Date().toISOString().split('T')[0]}`
      });
      toast({
        title: "Xuất Excel thành công",
        description: `Đã xuất ${activeTab === 'staff' ? 'nhân viên' : 'cư dân'} ra file Excel`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Lỗi xuất Excel",
        description: error instanceof Error ? error.message : "Không thể xuất file Excel",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportFiltered = async () => {
    try {
      setIsExporting(true);
      exportUsersByTabToExcel(users, activeTab, debouncedSearch, filterRole, {
        fileName: `nguoi-dung-${activeTab}-da-loc-${new Date().toISOString().split('T')[0]}`
      });
      toast({
        title: "Xuất Excel thành công",
        description: "Đã xuất người dùng đã lọc ra file Excel",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Lỗi xuất Excel",
        description: error instanceof Error ? error.message : "Không thể xuất file Excel",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportStats = async () => {
    try {
      setIsExporting(true);
      exportUsersStatsToExcel(users, activeTab, {
        fileName: `thong-ke-nguoi-dung-${activeTab}-${new Date().toISOString().split('T')[0]}`
      });
      toast({
        title: "Xuất thống kê thành công",
        description: `Đã xuất báo cáo thống kê ${activeTab === 'staff' ? 'nhân viên' : 'cư dân'} ra file Excel`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Lỗi xuất Excel",
        description: error instanceof Error ? error.message : "Không thể xuất file thống kê Excel",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title={t('admin.users.title', 'Quản lý người dùng')}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">{t('admin.loading', 'Đang tải...')}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title={t('admin.users.title', 'Quản lý người dùng')}>
        <div className="flex items-center justify-center h-64">
          <p className="text-red-500">{error}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={t('admin.users.title', 'Quản lý người dùng')}>
      <div className="space-y-8">
        {/* Hero Header Section */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-8 text-white shadow-2xl">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">
                    {activeTab === 'staff' ? t('admin.users.staff.title', 'Quản lý nhân viên') : t('admin.users.resident.title', 'Quản lý cư dân')}
                  </h1>
                  <p className="text-blue-100 text-lg">{t('admin.users.listDesc', 'Quản lý tất cả người dùng trong hệ thống')}</p>
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">{filteredUsers.length}</div>
                  <div className="text-blue-100 text-sm">{t('admin.users.stats.totalUsers', 'Tổng số người dùng')}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">
                    {filteredUsers.filter(u => u.status === 'ACTIVE').length}
                  </div>
                  <div className="text-blue-100 text-sm">{t('admin.users.stats.activeUsers', 'Đang hoạt động')}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-2xl font-bold">
                    {filteredUsers.filter(u => u.status === 'INACTIVE').length}
                  </div>
                  <div className="text-blue-100 text-sm">{t('admin.users.stats.inactiveUsers', 'Đã vô hiệu hóa')}</div>
                </div>
              </div>
            </div>
            
            <div className="flex-shrink-0">
              {activeTab === 'staff' ? (
                <Link href="/admin-dashboard/users/create">
                  <Button className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                    <Plus className="h-5 w-5 mr-2" />
                    <span>{t('admin.action.createStaff', 'Tạo nhân viên mới')}</span>
                  </Button>
                </Link>
              ) : (
                <Link href="/admin-dashboard/residents/create">
                  <Button className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                    <Plus className="h-5 w-5 mr-2" />
                    <span>{t('admin.action.createResident', 'Tạo cư dân mới')}</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                      <Tabs value={activeTab} onValueChange={(v) => { 
              setActiveTab(v as 'staff' | 'resident'); 
              setFilterRole('all'); 
              setPage(1); // Reset về trang 1 khi chuyển tab
            }}>
            <div className="px-6 pt-6">
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-xl">
                <TabsTrigger 
                  value="staff" 
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {t('admin.users.staff.tab', 'Nhân viên')}
                </TabsTrigger>
                <TabsTrigger 
                  value="resident"
                  className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-lg transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {t('admin.users.resident.tab', 'Cư dân')}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Enhanced Search and Filter */}
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder={t('admin.users.searchPlaceholder', 'Tìm kiếm tên, email, số ĐT...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12 text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Filter className="h-5 w-5 text-gray-600" />
                  </div>
                  <Select value={filterRole} onValueChange={(v) => setFilterRole(v)}>
                    <SelectTrigger className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl">
                      <SelectValue placeholder={activeTab === 'resident' ? t('admin.users.filterStatus', 'Lọc trạng thái') : t('admin.users.filterRole', 'Lọc vai trò')} />
                    </SelectTrigger>
                    <SelectContent>
                      {activeTab === 'resident' ? (
                        <>
                          <SelectItem value="all">{t('admin.users.filter.allStatus', 'Tất cả trạng thái')}</SelectItem>
                          <SelectItem value="ACTIVE">{t('admin.users.status.active', 'Hoạt động')}</SelectItem>
                          <SelectItem value="INACTIVE">{t('admin.users.status.inactive', 'Vô hiệu hóa')}</SelectItem>
                        </>
                      ) : (
                        <>
                          <SelectItem value="all">{t('admin.users.filter.all', 'Tất cả vai trò')}</SelectItem>
                          <SelectItem value="STAFF">{t('admin.users.role.staff', 'Nhân viên')}</SelectItem>
                          <SelectItem value="TECHNICIAN">{t('admin.users.role.technician', 'Kỹ thuật viên')}</SelectItem>
                          <SelectItem value="CLEANER">{t('admin.users.role.cleaner', 'Nhân viên vệ sinh')}</SelectItem>
                          <SelectItem value="SECURITY">{t('admin.users.role.security', 'Bảo vệ')}</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {/* Excel Export Dropdown */}
                <div className="flex items-center justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="outline" 
                        className="h-12 px-6 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                        disabled={isExporting}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        {isExporting ? 'Đang xuất...' : 'Xuất Excel'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onClick={handleExportAll} className="cursor-pointer">
                        <Users className="w-4 h-4 mr-2" />
                        Xuất tất cả người dùng
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleExportCurrentTab} className="cursor-pointer">
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Xuất {activeTab === 'staff' ? 'nhân viên' : 'cư dân'} hiện tại
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleExportFiltered} className="cursor-pointer">
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Xuất người dùng đã lọc
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleExportStats} className="cursor-pointer">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Xuất báo cáo thống kê
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

          {/* Users Table by Tab (content is same, just title/count) */}
          <TabsContent value="staff" className="px-6 pb-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {t('admin.users.staff.list', 'Danh sách nhân viên')} 
                    <span className="ml-2 text-sm font-normal text-gray-500">({filteredUsers.length})</span>
                  </h3>
                </div>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('admin.noData', 'Không có dữ liệu')}</h3>
                  <p className="text-gray-600 max-w-md mx-auto">{t('admin.users.emptyHint', 'Hãy thử thay đổi bộ lọc hoặc tạo người dùng mới')}</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="bg-gray-50 border-b border-gray-200">
                        <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-700">{t('admin.users.fullName', 'Họ và tên')}</TableHead>
                        <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-700">{t('admin.users.email', 'Email')}</TableHead>
                        <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-700">{t('admin.users.phone', 'Số điện thoại')}</TableHead>
                        <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-700">{t('admin.users.role', 'Vai trò')}</TableHead>
                        <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-700">{t('admin.users.status', 'Trạng thái')}</TableHead>
                        <TableHead className="px-6 py-4 text-right text-sm font-semibold text-gray-700">{t('admin.users.actions', 'Thao tác')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100">
                      {pagedUsers.map((user) => (
                        <TableRow key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                          <TableCell className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10 border-2 border-gray-100">
                                <AvatarImage src={undefined} alt={user.fullName || user.username} />
                                <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                                  {(user.fullName || user.username)?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-semibold text-gray-900">{user.fullName || user.username}</div>
                                <div className="text-sm text-gray-500">@{user.username}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <div className="text-sm text-gray-900">{user.email}</div>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <div className="text-sm text-gray-900">{user.phoneNumber}</div>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            {getRoleBadge(getRoleNames(user)[0])}
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            {getStatusBadge(user.status)}
                          </TableCell>
                          <TableCell className="px-6 py-4 text-right">
                            <Link href={`/admin-dashboard/users/${user.id}`}>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                                title={t('admin.action.view', 'Xem chi tiết')}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Enhanced Pagination */}
              {filteredUsers.length > 0 && (
                <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="text-sm text-gray-600">
                    {t('pagination.display', 'Hiển thị {start}-{end} trong {total}', {
                      start: (page - 1) * PAGE_SIZE + 1,
                      end: Math.min(page * PAGE_SIZE, filteredUsers.length),
                      total: filteredUsers.length
                    })}
                  </div>
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={page === 1} 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className="border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                      {t('pagination.previous.label', 'Trước')}
                    </Button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: pageCount }, (_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setPage(i + 1)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                            page === i + 1
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={page === pageCount} 
                      onClick={() => setPage(p => Math.min(pageCount, p + 1))}
                      className="border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                      {t('pagination.next.label', 'Sau')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="resident" className="px-6 pb-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {t('admin.users.resident.list', 'Danh sách cư dân')} 
                    <span className="ml-2 text-sm font-normal text-gray-500">({filteredUsers.length})</span>
                  </h3>
                </div>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('admin.noData', 'Không có dữ liệu')}</h3>
                  <p className="text-gray-600 max-w-md mx-auto">{t('admin.users.emptyHint', 'Hãy thử thay đổi bộ lọc hoặc tạo người dùng mới')}</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <Table className="w-full">
                    <TableHeader>
                      <TableRow className="bg-gray-50 border-b border-gray-200">
                        <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-700">{t('admin.users.fullName', 'Họ và tên')}</TableHead>
                        <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-700">{t('admin.users.email', 'Email')}</TableHead>
                        <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-700">{t('admin.users.phone', 'Số điện thoại')}</TableHead>
                        <TableHead className="px-6 py-4 text-left text-sm font-semibold text-gray-700">{t('admin.users.status', 'Trạng thái')}</TableHead>
                        <TableHead className="px-6 py-4 text-right text-sm font-semibold text-gray-700">{t('admin.users.actions', 'Thao tác')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-gray-100">
                      {pagedUsers.map((user) => (
                        <TableRow key={user.id} className="hover:bg-gray-50 transition-colors duration-200">
                          <TableCell className="px-6 py-4">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10 border-2 border-gray-100">
                                <AvatarImage src={undefined} alt={user.fullName || user.username} />
                                <AvatarFallback className="bg-green-100 text-green-600 font-semibold">
                                  {(user.fullName || user.username)?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-semibold text-gray-900">{user.fullName || user.username}</div>
                                <div className="text-sm text-gray-500">@{user.username}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <div className="text-sm text-gray-900">{user.email}</div>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            <div className="text-sm text-gray-900">{user.phoneNumber}</div>
                          </TableCell>
                          <TableCell className="px-6 py-4">
                            {getStatusBadge(user.status)}
                          </TableCell>
                          <TableCell className="px-6 py-4 text-right">
                            <Link href={`/admin-dashboard/users/${user.id}`}>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-colors"
                                title={t('admin.action.view', 'Xem chi tiết')}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Enhanced Pagination */}
              {filteredUsers.length > 0 && (
                <div className="flex items-center justify-between bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="text-sm text-gray-600">
                    {t('pagination.display', 'Hiển thị {start}-{end} trong {total}', {
                      start: (page - 1) * PAGE_SIZE + 1,
                      end: Math.min(page * PAGE_SIZE, filteredUsers.length),
                      total: filteredUsers.length
                    })}
                  </div>
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={page === 1} 
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      className="border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                      {t('pagination.previous.label', 'Trước')}
                    </Button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: pageCount }, (_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => setPage(i + 1)}
                          className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                            page === i + 1
                              ? 'bg-green-600 text-white'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={page === pageCount} 
                      onClick={() => setPage(p => Math.min(pageCount, p + 1))}
                      className="border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                    >
                      {t('pagination.next.label', 'Sau')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </AdminLayout>
  );
}