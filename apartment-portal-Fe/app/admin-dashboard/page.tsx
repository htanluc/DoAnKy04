"use client";

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Building2, 
  Bell, 
  Calendar, 
  Coffee, 
  Receipt, 
  MessageSquare, 
  HelpCircle, 
  BarChart3,
  Plus,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Car,
  Droplets,
  Activity,
  Clock,
  DollarSign,
  UserPlus,
  Calculator
} from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

interface DashboardStats {
  totalResidents: number;
  totalApartments: number;
  totalVehicles: number;
  totalInvoices: number;
  pendingInvoices: number;
  totalRevenue: number;
  occupancyRate: number;
  totalWaterMeters: number;
  totalStaff: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalResidents: 0,
    totalApartments: 0,
    totalVehicles: 0,
    totalInvoices: 0,
    pendingInvoices: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    totalWaterMeters: 0,
    totalStaff: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load tất cả dữ liệu song song
      const [
        residentsResponse,
        apartmentsResponse,
        vehiclesResponse,
        invoicesResponse,
        waterMetersResponse,
        apartmentRelationsResponse,
        usersResponse
      ] = await Promise.all([
        apiFetch('/api/admin/residents'),
        apiFetch('/api/apartments'),
        apiFetch('/api/admin/vehicles'),
        apiFetch('/api/admin/invoices'),
        apiFetch('/api/water-meters'),
        apiFetch('/api/apartment-residents'),
        apiFetch('/api/admin/users')
      ]);

      // Xử lý dữ liệu residents
      const residents = residentsResponse.ok ? await residentsResponse.json() : [];
      const totalResidents = Array.isArray(residents) ? residents.length : 0;

      // Xử lý dữ liệu apartments
      const apartments = apartmentsResponse.ok ? await apartmentsResponse.json() : [];
      const totalApartments = Array.isArray(apartments) ? apartments.length : 0;

      // Xử lý dữ liệu vehicles
      const vehicles = vehiclesResponse.ok ? await vehiclesResponse.json() : [];
      const totalVehicles = Array.isArray(vehicles) ? vehicles.length : 0;

      // Xử lý dữ liệu invoices
      const invoices = invoicesResponse.ok ? await invoicesResponse.json() : [];
      const totalInvoices = Array.isArray(invoices) ? invoices.length : 0;
      const pendingInvoices = Array.isArray(invoices) ? 
        invoices.filter((inv: any) => inv.status === 'UNPAID' || inv.status === 'PENDING').length : 0;
      const totalRevenue = Array.isArray(invoices) ? 
        invoices.reduce((sum: number, inv: any) => sum + (inv.totalAmount || 0), 0) : 0;

      // Xử lý dữ liệu water meters
      const waterMeters = waterMetersResponse.ok ? await waterMetersResponse.json() : [];
      const totalWaterMeters = Array.isArray(waterMeters) ? waterMeters.length : 0;

      // Xử lý dữ liệu users (nhân viên)
      const users = usersResponse.ok ? await usersResponse.json() : [];
      const totalStaff = Array.isArray(users) ? 
        users.filter((user: any) => 
          user.roles && 
          user.roles.some((role: string) => ['STAFF', 'TECHNICIAN', 'CLEANER', 'SECURITY'].includes(role))
        ).length : 0;

      // Tính tỷ lệ lấp đầy
      const apartmentRelations = apartmentRelationsResponse.ok ? await apartmentRelationsResponse.json() : [];
      const occupiedApartments = Array.isArray(apartmentRelations) ? 
        new Set(apartmentRelations.map((rel: any) => rel.apartmentId)).size : 0;
      const occupancyRate = totalApartments > 0 ? Math.round((occupiedApartments / totalApartments) * 100) : 0;

      setStats({
        totalResidents,
        totalApartments,
        totalVehicles,
        totalInvoices,
        pendingInvoices,
        totalRevenue,
        occupancyRate,
        totalWaterMeters,
        totalStaff
      });

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading) {
    return (
      <AdminLayout title="Bảng điều khiển quản trị">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải dữ liệu dashboard...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Bảng điều khiển quản trị">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={loadDashboardData}>
              🔄 Thử lại
            </Button>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-medium text-red-800">Lỗi tải dữ liệu</h3>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Bảng điều khiển quản trị">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bảng điều khiển quản trị</h1>
            <p className="text-gray-600 mt-1">Tổng quan hệ thống quản lý căn hộ</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button asChild variant="outline">
              <Link href="/admin-dashboard/users/create">
                <UserPlus className="h-4 w-4 mr-2" />
                Tạo nhân viên
              </Link>
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng cư dân</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalResidents}</div>
              <p className="text-xs text-muted-foreground">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +12% so với tháng trước
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng căn hộ</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalApartments}</div>
              <p className="text-xs text-muted-foreground">
                Tỷ lệ lấp đầy {stats.occupancyRate}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Xe đăng ký</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalVehicles}</div>
              <p className="text-xs text-muted-foreground">
                Trung bình {stats.totalApartments > 0 ? (stats.totalVehicles / stats.totalApartments).toFixed(1) : 0} xe/căn hộ
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingInvoices} hóa đơn chờ thanh toán
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hóa đơn</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalInvoices}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingInvoices} chờ thanh toán
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Nhân viên</CardTitle>
              <UserPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStaff}</div>
              <p className="text-xs text-muted-foreground">
                Nhân viên đang hoạt động
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chỉ số nước</CardTitle>
              <Droplets className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalWaterMeters}</div>
              <p className="text-xs text-muted-foreground">
                Đồng hồ nước đang hoạt động
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tỷ lệ lấp đầy</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.occupancyRate}%</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalApartments - Math.round(stats.totalApartments * stats.occupancyRate / 100)} căn hộ trống
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Thao tác nhanh
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
              <Button asChild variant="outline" className="h-auto p-4 flex-col">
                <Link href="/admin-dashboard/users/create">
                  <UserPlus className="h-6 w-6 mb-2" />
                  <span>Tạo nhân viên</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto p-4 flex-col">
                <Link href="/admin-dashboard/users">
                  <Users className="h-6 w-6 mb-2" />
                  <span>Quản lý nhân viên</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto p-4 flex-col">
                <Link href="/admin-dashboard/billing-config">
                  <Calculator className="h-6 w-6 mb-2" />
                  <span>Cấu Hình Phí</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto p-4 flex-col">
                <Link href="/admin-dashboard/announcements/new">
                  <Bell className="h-6 w-6 mb-2" />
                  <span>Thông báo</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto p-4 flex-col">
                <Link href="/admin-dashboard/events/new">
                  <Calendar className="h-6 w-6 mb-2" />
                  <span>Tạo sự kiện</span>
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto p-4 flex-col">
                <Link href="/admin-dashboard/facilities/new">
                  <Coffee className="h-6 w-6 mb-2" />
                  <span>Thêm tiện ích</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
} 