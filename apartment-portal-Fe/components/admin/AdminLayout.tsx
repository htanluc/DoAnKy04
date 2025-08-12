"use client";

import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { LogOut, User, Home, Users, Building2, Bell, Calendar, Coffee, Receipt, MessageSquare, BarChart3, Settings, ClipboardList, History, LifeBuoy, Calculator } from 'lucide-react';
import LanguageSwitcher from '@/components/language-switcher';
import ThemeToggle from '@/components/theme-toggle';
import UserMenu from '@/components/user-menu';
import QuickCreateFAB from '@/components/admin/QuickCreateFAB';
import AdminCommandPalette from '@/components/admin/AdminCommandPalette';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
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
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const adminMenuSections = [
  {
    key: 'overview',
    label: 'admin.groups.overview',
    items: [
      { href: '/admin-dashboard', label: 'admin.dashboard.title', icon: <Home className="h-5 w-5" /> },
    ],
  },
  {
    key: 'people',
    label: 'admin.groups.people',
    items: [
      { href: '/admin-dashboard/users', label: 'admin.users.title', icon: <Users className="h-5 w-5" /> },
      { href: '/admin-dashboard/residents', label: 'admin.residents.title', icon: <Users className="h-5 w-5" /> },
      { href: '/admin-dashboard/apartments', label: 'admin.apartments.title', icon: <Building2 className="h-5 w-5" /> },
    ],
  },
  {
    key: 'comms',
    label: 'admin.groups.comms',
    items: [
      { href: '/admin-dashboard/announcements', label: 'admin.announcements.title', icon: <Bell className="h-5 w-5" /> },
      { href: '/admin-dashboard/events', label: 'admin.events.title', icon: <Calendar className="h-5 w-5" /> },
    ],
  },
  {
    key: 'facilities',
    label: 'admin.groups.facilities',
    items: [
      { href: '/admin-dashboard/facilities', label: 'admin.facilities.title', icon: <Coffee className="h-5 w-5" /> },
      { href: '/admin-dashboard/facility-bookings', label: 'admin.facility-bookings.title', icon: <ClipboardList className="h-5 w-5" /> },
    ],
  },
  {
    key: 'finance',
    label: 'admin.groups.finance',
    items: [
      { href: '/admin-dashboard/invoices', label: 'admin.invoices.title', icon: <Receipt className="h-5 w-5" /> },
      { href: '/admin-dashboard/yearly-billing', label: 'Tạo biểu phí 1 năm', icon: <Calculator className="h-5 w-5" /> },
      { href: '/admin-dashboard/billing-config', label: 'Cấu Hình Phí', icon: <Settings className="h-5 w-5" /> },
      { href: '/admin-dashboard/water-meter', label: 'Quản lý chỉ số nước', icon: <BarChart3 className="h-5 w-5" /> },
    ],
  },
  {
    key: 'support',
    label: 'admin.groups.support',
    items: [
      { href: '/admin-dashboard/feedbacks', label: 'admin.feedbacks.title', icon: <MessageSquare className="h-5 w-5" /> },
      { href: '/admin-dashboard/support-requests', label: 'admin.support-requests.title', icon: <LifeBuoy className="h-5 w-5" /> },
    ],
  },
  {
    key: 'reports',
    label: 'admin.groups.reports',
    items: [
      { href: '/admin-dashboard/reports', label: 'admin.reports.title', icon: <BarChart3 className="h-5 w-5" /> },
      { href: '/admin-dashboard/history', label: 'admin.history.title', icon: <History className="h-5 w-5" /> },
    ],
  },
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

  const sectionKey = React.useMemo(() => {
    const p = pathname || '';
    if (p === '/admin-dashboard' || p === '/admin-dashboard/') return 'overview';
    if (p.startsWith('/admin-dashboard/users') || p.startsWith('/admin-dashboard/residents') || p.startsWith('/admin-dashboard/apartments')) return 'people';
    if (p.startsWith('/admin-dashboard/announcements') || p.startsWith('/admin-dashboard/events')) return 'comms';
    if (p.startsWith('/admin-dashboard/facilities') || p.startsWith('/admin-dashboard/facility-bookings')) return 'facilities';
    if (p.startsWith('/admin-dashboard/invoices') || p.startsWith('/admin-dashboard/yearly-billing') || p.startsWith('/admin-dashboard/billing-config') || p.startsWith('/admin-dashboard/water-meter')) return 'finance';
    if (p.startsWith('/admin-dashboard/support-requests') || p.startsWith('/admin-dashboard/feedbacks')) return 'support';
    if (p.startsWith('/admin-dashboard/reports') || p.startsWith('/admin-dashboard/history')) return 'reports';
    return 'overview';
  }, [pathname]);

  const sectionAccent = React.useMemo(() => {
    switch (sectionKey) {
      case 'people':
        return '220 85% 56%';
      case 'comms':
        return '268 80% 60%';
      case 'facilities':
        return '152 60% 40%';
      case 'finance':
        return '30 95% 55%';
      case 'support':
        return '0 70% 55%';
      case 'reports':
        return '190 70% 45%';
      case 'overview':
      default:
        return 'var(--brand-orange)';
    }
  }, [sectionKey]);

  const headerStyle = React.useMemo(() => ({
    ['--section-accent' as any]: `hsl(${sectionAccent})`,
  }) as React.CSSProperties, [sectionAccent]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background fpt-bg overflow-x-hidden w-full">
        {/* Sidebar */}
        <Sidebar collapsible="icon" className="border-r w-64 min-w-64 max-w-64 h-screen overflow-y-auto overflow-x-hidden">
          <SidebarHeader>
            <div className="px-2 pt-4 pb-2">
              <div className="flex items-center gap-2 truncate">
                {/* FPT tri-color mark */}
                <div className="flex -space-x-1">
                  <span className="h-4 w-4 rounded-[4px] bg-[hsl(var(--brand-orange))] inline-block" />
                  <span className="h-4 w-4 rounded-[4px] bg-[hsl(var(--brand-green))] inline-block" />
                  <span className="h-4 w-4 rounded-[4px] bg-[hsl(var(--brand-blue))] inline-block" />
                </div>
                <div className="font-semibold text-sm text-sidebar-foreground/80">FPT Apartment Admin</div>
              </div>
              <div className="mt-3 h-[3px] rounded-full fpt-tricolor-bar" />
            </div>
          </SidebarHeader>
          <SidebarContent>
            {adminMenuSections.map((section) => (
              <SidebarGroup key={section.key} style={{ ['--group-accent' as any]: `hsl(${section.key==='people'?'220 85% 56%':section.key==='comms'?'268 80% 60%':section.key==='facilities'?'152 60% 40%':section.key==='finance'?'30 95% 55%':section.key==='support'?'0 70% 55%':section.key==='reports'?'190 70% 45%':'var(--brand-orange)'})` } as React.CSSProperties}>
                <SidebarGroupLabel className="relative pl-3 text-xs uppercase tracking-wide text-sidebar-foreground/60 before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-3 before:w-1.5 before:rounded-full before:bg-[var(--group-accent)]">
                  {t(section.label)}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {section.items.map((item) => {
                      const active = pathname?.startsWith(item.href)
                      return (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton
                            asChild
                            isActive={!!active}
                            tooltip={t(item.label)}
                            className="relative border-l-2 border-transparent hover:border-[var(--group-accent)] data-[active=true]:border-[var(--group-accent)] data-[active=true]:bg-[var(--group-accent)]/10 data-[active=true]:text-[var(--group-accent)]"
                          >
                            <Link href={item.href} className="flex items-center gap-3 w-full truncate">
                              <span className="h-6 w-6 grid place-items-center rounded-md bg-[var(--group-accent)]/10 text-[var(--group-accent)]">
                                {item.icon}
                              </span>
                              <span className="truncate block w-full text-left">{t(item.label)}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
          <SidebarSeparator />
          <SidebarFooter>
            <div className="flex items-center gap-2 px-2 pb-2">
              <User className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-700 truncate">Admin</span>
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
            <div className="mt-2 px-2 pb-2 text-[10px] text-sidebar-foreground/60">
              © FPT Apartment
            </div>
          </SidebarFooter>
        </Sidebar>
        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header style={headerStyle} className="sticky top-0 z-40 bg-gradient-to-r from-[var(--section-accent)] to-[hsl(var(--brand-blue))] text-white border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <SidebarTrigger className="-ml-1" />
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold truncate">
                  {title || t('admin.dashboard.title')}
                </h1>
                <p className="text-indigo-100/90 text-xs sm:text-sm truncate">{t('admin.dashboard.welcome')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:block">
                <div className="relative">
                  <Input placeholder={`${t('admin.search.placeholder')} (Ctrl+K)`} readOnly onFocus={() => typeof window !== 'undefined' && window.dispatchEvent(new CustomEvent('open-cmd'))} className="h-9 w-[220px] lg:w-[320px] bg-white/15 placeholder:text-white/80 text-white border-white/20 focus-visible:ring-white/60 cursor-pointer" />
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm" className="bg-white/20 text-white hover:bg-white/30">
                    + {t('admin.quickCreate')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Chọn loại</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push('/admin-dashboard/announcements/create')}>Thông báo</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/admin-dashboard/events/create')}>Sự kiện</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/admin-dashboard/invoices/create')}>Hóa đơn</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/admin-dashboard/users/create')}>Người dùng</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <LanguageSwitcher />
              <ThemeToggle />
              <UserMenu />
            </div>
          </header>
          <div className="fpt-tricolor-bar" />
          {/* Main content area */}
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6">
            <div className="bg-card text-card-foreground rounded-xl border p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
      {/* Floating Quick Create */}
      <QuickCreateFAB />
      <AdminCommandPalette />
    </SidebarProvider>
  );
} 