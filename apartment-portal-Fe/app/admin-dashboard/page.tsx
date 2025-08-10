"use client";

import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n';
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
  Bot, 
  BarChart3,
  Plus,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { announcementsApi, eventsApi, facilitiesApi, api, supportRequestsApi } from '@/lib/api';
import RealTimeNotifications from '@/components/real-time-notifications';
import LiveChat from '@/components/live-chat';

interface ActivityLog {
  id?: string | number;
  description?: string;
  details?: string;
  time?: string;
  timestamp?: string;
}

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [counts, setCounts] = useState({
    users: 0,
    residents: 0,
    apartments: 0,
    announcements: 0,
    events: 0,
    facilities: 0,
    invoices: 0,
    supportRequests: 0,
  });
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  useEffect(() => {
    async function fetchCounts() {
      try {
        // Fetch counts từ các API thực tế
        const [announcements, events, facilities] = await Promise.all([
          announcementsApi.getAll(),
          eventsApi.getAll(),
          facilitiesApi.getAll(),
        ]);
        
        // Lấy số lượng hóa đơn
        let invoicesCount = 0;
        try {
          const res = await api.get('/api/admin/invoices');
          if (res.ok) {
            const data = await res.json();
            invoicesCount = Array.isArray(data) ? data.length : (data?.data?.length ?? 0);
          }
        } catch {}

        // Lấy số lượng users, residents, apartments, support requests
        let usersCount = 0;
        let residentsCount = 0;
        let apartmentsCount = 0;
        let supportRequestsCount = 0;
        try {
          const [usersRes, residentsRes, apartmentsRes, supportReqs] = await Promise.all([
            api.get('/api/admin/users'),
            api.get('/api/admin/residents'),
            api.get('/api/admin/apartments'),
            supportRequestsApi.getAll().catch(() => [] as any[]),
          ]);
          if (usersRes && 'ok' in usersRes && usersRes.ok) {
            const users = await usersRes.json();
            usersCount = Array.isArray(users) ? users.length : (users?.data?.length ?? 0);
          }
          if (residentsRes && 'ok' in residentsRes && residentsRes.ok) {
            const residents = await residentsRes.json();
            residentsCount = Array.isArray(residents) ? residents.length : (residents?.data?.length ?? 0);
          }
          if (apartmentsRes && 'ok' in apartmentsRes && apartmentsRes.ok) {
            const apartments = await apartmentsRes.json();
            apartmentsCount = Array.isArray(apartments) ? apartments.length : (apartments?.data?.length ?? 0);
          }
          supportRequestsCount = Array.isArray(supportReqs) ? supportReqs.length : 0;
        } catch {}
        
        setCounts((prev) => ({
          ...prev,
          announcements: announcements.length,
          events: events.length,
          facilities: facilities.length,
          invoices: invoicesCount,
          users: usersCount,
          residents: residentsCount,
          apartments: apartmentsCount,
          supportRequests: supportRequestsCount,
        }));
      } catch (error) {
        console.error('Error fetching counts:', error);
        // Không set error state để tránh crash UI, chỉ log lỗi
      }
    }
    fetchCounts();
  }, []);

  useEffect(() => {
    async function fetchActivities() {
      try {
        const res = await api.get('/api/dashboard/recent-activities');
        if (res.ok) {
          const data = await res.json();
          setActivities(Array.isArray(data) ? data.slice(0, 10) : (data?.data ?? []).slice(0, 10));
        } else if (res.status === 404) {
          setActivities([]);
        } else {
          console.error('Failed to fetch activities:', res.status);
          setActivities([]);
        }
      } catch (error) {
        console.error('Error fetching activities:', error);
        setActivities([]);
      }
    }
    fetchActivities();
  }, []);

  const stats = [
    {
      title: t('admin.users.title'),
      value: counts.users,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      href: '/admin-dashboard/users'
    },
    {
      title: t('admin.residents.title'),
      value: counts.residents,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      href: '/admin-dashboard/residents'
    },
    {
      title: t('admin.apartments.title'),
      value: counts.apartments,
      icon: Building2,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      href: '/admin-dashboard/apartments'
    },
    {
      title: t('admin.announcements.title'),
      value: counts.announcements,
      icon: Bell,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      href: '/admin-dashboard/announcements'
    },
    {
      title: t('admin.events.title'),
      value: counts.events,
      icon: Calendar,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      href: '/admin-dashboard/events'
    },
    {
      title: t('admin.facilities.title'),
      value: counts.facilities,
      icon: Coffee,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      href: '/admin-dashboard/facilities'
    },
    {
      title: t('admin.invoices.title'),
      value: counts.invoices,
      icon: Receipt,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      href: '/admin-dashboard/invoices'
    },
    {
      title: t('admin.support-requests.title'),
      value: counts.supportRequests,
      icon: HelpCircle,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
      href: '/admin-dashboard/support-requests'
    }
  ];

  const quickActions = [
    {
      title: t('admin.announcements.create', 'Tạo thông báo mới'),
      description: t('admin.announcements.createDesc', 'Tạo một thông báo gửi đến cư dân'),
      icon: Bell,
      href: '/admin-dashboard/announcements/create',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      title: t('admin.events.create', 'Tạo sự kiện mới'),
      description: t('admin.events.createDesc', 'Tổ chức sự kiện cho cư dân'),
      icon: Calendar,
      href: '/admin-dashboard/events/create',
      color: 'bg-red-100 text-red-600'
    },
    {
      title: t('admin.invoices.create', 'Tạo hóa đơn mới'),
      description: t('admin.invoices.createDesc', 'Xuất hóa đơn cho cư dân'),
      icon: Receipt,
      href: '/admin-dashboard/invoices/create',
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      title: t('admin.users.createStaff', 'Tạo tài khoản nhân viên'),
      description: t('admin.users.createStaffDesc', 'Thêm mới tài khoản cho nhân viên quản lý'),
      icon: Users,
      href: '/admin-dashboard/users/create',
      color: 'bg-blue-100 text-blue-600'
    }
  ];

  return (
    <AdminLayout title={t('admin.dashboard.title')}>
      <div className="p-6 space-y-6">
        {/* Header with Real-time Notifications */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600">Quản lý hệ thống chung cư</p>
          </div>
          <div className="flex items-center gap-4">
            <RealTimeNotifications />
            <LiveChat />
          </div>
        </div>

        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">
            {t('admin.dashboard.welcome')}
          </h2>
          <p className="text-blue-100">
            Quản lý toàn diện hệ thống chung cư của bạn
          </p>
        </div>

        {/* Statistics Grid */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            {t('admin.dashboard.overview', 'Thống kê tổng quan')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Link key={index} href={stat.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center justify-center py-8 px-4 text-center h-full border border-gray-200 rounded-2xl">
                  <div className={`mx-auto mb-4 rounded-full w-16 h-16 flex items-center justify-center text-3xl ${stat.bgColor}`}> 
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-base mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mb-0">{stat.value}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Thao tác nhanh</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col items-center justify-center py-8 px-4 text-center h-full">
                  <div className={`mx-auto mb-4 rounded-full w-16 h-16 flex items-center justify-center text-3xl ${action.color}`}> 
                    <action.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="font-semibold text-base mb-1">{action.title}</p>
                    <p className="text-sm text-gray-500">{action.description}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 