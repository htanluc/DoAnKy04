"use client";

import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, User, Home, Users, Building2, Bell, Calendar, Coffee, Receipt, MessageSquare, BarChart3, Settings, ClipboardList, History, LifeBuoy } from 'lucide-react';
import LanguageSwitcher from '@/components/language-switcher';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const adminMenuItems = [
  { href: '/admin-dashboard', label: 'admin.dashboard.title', icon: <Home className="h-5 w-5" /> },
  { href: '/admin-dashboard/users', label: 'admin.users.title', icon: <Users className="h-5 w-5" /> },
  { href: '/admin-dashboard/residents', label: 'admin.residents.title', icon: <Users className="h-5 w-5" /> },
  { href: '/admin-dashboard/apartments', label: 'admin.apartments.title', icon: <Building2 className="h-5 w-5" /> },
  { href: '/admin-dashboard/announcements', label: 'admin.announcements.title', icon: <Bell className="h-5 w-5" /> },
  { href: '/admin-dashboard/events', label: 'admin.events.title', icon: <Calendar className="h-5 w-5" /> },
  { href: '/admin-dashboard/invoices', label: 'admin.invoices.title', icon: <Receipt className="h-5 w-5" /> },
  { href: '/admin-dashboard/feedbacks', label: 'admin.feedbacks.title', icon: <MessageSquare className="h-5 w-5" /> },
  { href: '/admin-dashboard/support-requests', label: 'admin.support-requests.title', icon: <LifeBuoy className="h-5 w-5" /> },
  { href: '/admin-dashboard/water-meter', label: 'Quản lý chỉ số nước', icon: <BarChart3 className="h-5 w-5" /> },
  { href: '/admin-dashboard/reports', label: 'admin.reports.title', icon: <BarChart3 className="h-5 w-5" /> },
  { href: '/admin-dashboard/facilities', label: 'admin.facilities.title', icon: <Coffee className="h-5 w-5" /> },
];

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const { t } = useLanguage();
  const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50 overflow-x-hidden w-full">
        {/* Sidebar */}
        <Sidebar className="bg-white shadow-md border-r w-64 min-w-64 max-w-64 h-screen overflow-y-auto overflow-x-hidden">
          <SidebarHeader>
            <div className="font-bold text-lg text-blue-700 px-2 py-4 truncate">
              {t('admin.dashboard.title')}
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={t(item.label)}
                  >
                    <a href={item.href} className="flex items-center gap-3 w-full truncate">
                      {item.icon}
                      <span className="truncate block w-full text-left">{t(item.label)}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarSeparator />
          <SidebarFooter>
            <div className="flex items-center gap-2 px-2 pb-2">
              <User className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-700 truncate">Admin</span>
            </div>
            <div className="px-2 pb-2">
              <LanguageSwitcher />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2 w-full"
            >
              <LogOut className="h-4 w-4" />
              <span className="truncate">{t('admin.action.logout')}</span>
            </Button>
          </SidebarFooter>
        </Sidebar>
        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="bg-white shadow px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {title || t('admin.dashboard.title')}
              </h1>
              <p className="text-gray-600 text-sm">
                {t('admin.dashboard.welcome')}
              </p>
            </div>
          </header>
          {/* Main content area */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
            <div className="bg-white rounded-lg shadow p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
} 