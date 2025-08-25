"use client";

import React from 'react';
import { useLanguage } from '@/lib/i18n';
// import { useAuth } from '@/hooks/use-auth';
import { useRouter, usePathname } from 'next/navigation';
import { Home, Users, Building2, Bell, Calendar, Coffee, Receipt, MessageSquare, BarChart3, Settings, ClipboardList, History, LifeBuoy, Calculator, ChevronDown, Car } from 'lucide-react';
import LanguageSwitcher from '@/components/language-switcher';
import ThemeToggle from '@/components/theme-toggle';
import UserMenu from '@/components/user-menu';
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
  // SidebarSeparator,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarGroupAction,
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
      { href: '/admin-dashboard/yearly-billing', label: 'admin.yearly-billing.title', icon: <Calculator className="h-5 w-5" /> },
      { href: '/admin-dashboard/water-meter', label: 'admin.waterMeter.title', icon: <BarChart3 className="h-5 w-5" /> },
    ],
  },
  {
    key: 'support',
    label: 'admin.groups.support',
    items: [
      { href: '/admin-dashboard/feedbacks', label: 'admin.feedbacks.title', icon: <MessageSquare className="h-5 w-5" /> },
      { href: '/admin-dashboard/support-requests', label: 'admin.support-requests.title', icon: <LifeBuoy className="h-5 w-5" /> },
      { href: '/admin-dashboard/vehicle-registrations', label: 'admin.vehicle-registrations.title', icon: <Car className="h-5 w-5" /> },
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
  // const { logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = React.useState(false);
  const toggleGroup = (key: string) => {
    // Accordion mode: only one group open at a time
    const willOpen = !openGroups[key];
    const next: Record<string, boolean> = {};
    if (willOpen) next[key] = true;
    persistGroups(next);
  };

  const persistGroups = (next: Record<string, boolean>) => {
    setOpenGroups(next);
    try { localStorage.setItem('sidebar:groups', JSON.stringify(next)); } catch {}
  };

  // const handleLogout = () => {
  //   logout();
  //   router.push('/login');
  // };

  const sectionKey = React.useMemo(() => {
    const p = pathname || '';
    if (p === '/admin-dashboard' || p === '/admin-dashboard/') return 'overview';
    if (p.startsWith('/admin-dashboard/users') || p.startsWith('/admin-dashboard/residents') || p.startsWith('/admin-dashboard/apartments')) return 'people';
    if (p.startsWith('/admin-dashboard/announcements') || p.startsWith('/admin-dashboard/events')) return 'comms';
    if (p.startsWith('/admin-dashboard/facilities') || p.startsWith('/admin-dashboard/facility-bookings')) return 'facilities';
    if (p.startsWith('/admin-dashboard/invoices') || p.startsWith('/admin-dashboard/yearly-billing') || p.startsWith('/admin-dashboard/water-meter')) return 'finance';
    if (p.startsWith('/admin-dashboard/support-requests') || p.startsWith('/admin-dashboard/feedbacks') || p.startsWith('/admin-dashboard/vehicle-registrations')) return 'support';
    if (p.startsWith('/admin-dashboard/reports') || p.startsWith('/admin-dashboard/history')) return 'reports';
    return 'overview';
  }, [pathname]);

  React.useEffect(() => {
    // Load persisted group state on client to avoid SSR mismatch
    try {
      const raw = localStorage.getItem('sidebar:groups');
      if (raw) {
        setOpenGroups(JSON.parse(raw));
      }
    } catch {}
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    // Auto mở nhóm theo route hiện tại (sau khi hydrate)
    if (!hydrated) return;
    // Open only the current section by default (accordion)
    persistGroups({ [sectionKey]: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionKey, hydrated]);

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
      <div className="flex min-h-screen bg-background fpt-bg overflow-x-hidden w-full" style={headerStyle}>
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
              <SidebarGroup
                key={section.key}
                style={{
                  ['--group-accent' as any]: `hsl(${section.key==='people'?'220 85% 56%':section.key==='comms'?'268 80% 60%':section.key==='facilities'?'152 60% 40%':section.key==='finance'?'30 95% 55%':section.key==='support'?'0 70% 55%':section.key==='reports'?'190 70% 45%':'var(--brand-orange)'})`,
                  ['--group-border' as any]: `hsl(${section.key==='people'?'220 85% 56%':section.key==='comms'?'268 80% 60%':section.key==='facilities'?'152 60% 40%':section.key==='finance'?'30 95% 55%':section.key==='support'?'0 70% 55%':section.key==='reports'?'190 70% 45%':'var(--brand-orange)'} / 0.7)`,
                  ['--group-bg' as any]: `hsl(${section.key==='people'?'220 85% 56%':section.key==='comms'?'268 80% 60%':section.key==='facilities'?'152 60% 40%':section.key==='finance'?'30 95% 55%':section.key==='support'?'0 70% 55%':section.key==='reports'?'190 70% 45%':'var(--brand-orange)'} / 0.1)`,
                } as React.CSSProperties}
              >
                <SidebarGroupLabel
                  onClick={() => toggleGroup(section.key)}
                  className="relative pl-3 text-xs uppercase tracking-wide text-sidebar-foreground/60 cursor-pointer select-none before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-3 before:w-1.5 before:rounded-full before:bg-[var(--group-accent)]">
                  {t(section.label, section.key === 'overview' ? 'Tổng quan' : 
                     section.key === 'people' ? 'Người & Căn hộ' :
                     section.key === 'comms' ? 'Truyền thông' :
                     section.key === 'facilities' ? 'Tiện ích' :
                     section.key === 'finance' ? 'Tài chính' :
                     section.key === 'support' ? 'Hỗ trợ' :
                     section.key === 'reports' ? 'Báo cáo' : 'Khác')}
                </SidebarGroupLabel>
                <SidebarGroupAction asChild>
                  <button
                    aria-label="Toggle section"
                    onClick={() => toggleGroup(section.key)}
                    className={`transition-transform ${openGroups[section.key] ? '' : 'rotate-180'}`}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </SidebarGroupAction>
                <SidebarGroupContent className={hydrated && !openGroups[section.key] ? 'hidden' : ''}>
                  <div className="rounded-xl p-2 mb-3 shadow-sm border-2" style={{ background: 'var(--group-bg)', borderColor: 'var(--group-border)' }}>
                  <SidebarMenu>
                    {section.items.map((item) => {
                      const active = pathname?.startsWith(item.href)
                      return (
                        <SidebarMenuItem key={item.href}>
                          <SidebarMenuButton
                            asChild
                            isActive={!!active}
                            tooltip={t(item.label, item.label.includes('users') ? 'Quản lý người dùng' :
                                       item.label.includes('residents') ? 'Quản lý cư dân' :
                                       item.label.includes('apartments') ? 'Quản lý căn hộ' :
                                       item.label.includes('announcements') ? 'Quản lý thông báo' :
                                       item.label.includes('events') ? 'Quản lý sự kiện' :
                                       item.label.includes('facilities') ? 'Quản lý tiện ích' :
                                       item.label.includes('invoices') ? 'Quản lý hóa đơn' :
                                       item.label.includes('feedbacks') ? 'Quản lý phản hồi' :
                                       item.label.includes('support-requests') ? 'Quản lý yêu cầu hỗ trợ' :
                                       item.label.includes('vehicle-registrations') ? 'Quản lý đăng ký xe' :
                                       item.label.includes('reports') ? 'Quản lý báo cáo' :
                                       item.label.includes('history') ? 'Lịch sử AI Q&A' : 'Chức năng')}
                            className="relative border-l-2 border-transparent hover:border-[var(--group-accent)] data-[active=true]:border-[var(--group-accent)] data-[active=true]:bg-[var(--group-accent)]/10 data-[active=true]:text-[var(--group-accent)]"
                          >
                            <Link href={item.href} className="flex items-center gap-3 w-full truncate">
                              <span className="h-6 w-6 grid place-items-center rounded-md bg-[var(--group-accent)]/10 text-[var(--group-accent)]">
                                {item.icon}
                              </span>
                              <span className="truncate block w-full text-left">{t(item.label, item.label.includes('users') ? 'Quản lý người dùng' :
                                       item.label.includes('residents') ? 'Quản lý cư dân' :
                                       item.label.includes('apartments') ? 'Quản lý căn hộ' :
                                       item.label.includes('announcements') ? 'Quản lý thông báo' :
                                       item.label.includes('events') ? 'Quản lý sự kiện' :
                                       item.label.includes('facilities') ? 'Quản lý tiện ích' :
                                       item.label.includes('invoices') ? 'Quản lý hóa đơn' :
                                       item.label.includes('feedbacks') ? 'Quản lý phản hồi' :
                                       item.label.includes('support-requests') ? 'Quản lý yêu cầu hỗ trợ' :
                                       item.label.includes('vehicle-registrations') ? 'Quản lý đăng ký xe' :
                                       item.label.includes('reports') ? 'Quản lý báo cáo' :
                                       item.label.includes('history') ? 'Lịch sử AI Q&A' : 'Chức năng')}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
          {/* Footer removed per user request */}
        </Sidebar>
        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header style={headerStyle} className="sticky top-0 z-40 bg-gradient-to-r from-[var(--section-accent)] to-[hsl(var(--brand-blue))] text-white border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <SidebarTrigger className="-ml-1" />
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold truncate">
                  {title || t('admin.dashboard.title', 'Bảng điều khiển quản trị')}
                </h1>
                <p className="text-indigo-100/90 text-xs sm:text-sm truncate">{t('admin.dashboard.welcome', 'Chào mừng đến với hệ thống quản lý chung cư')}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:block">
                <div className="relative">
                  <Input placeholder={`${t('admin.search.placeholder', 'Tìm kiếm...')} (Ctrl+K)`} readOnly onFocus={() => typeof window !== 'undefined' && window.dispatchEvent(new CustomEvent('open-cmd'))} className="h-9 w-[220px] lg:w-[320px] bg-white/15 placeholder:text-white/80 text-white border-white/20 focus-visible:ring-white/60 cursor-pointer" />
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="sm" className="bg-white/20 text-white hover:bg-white/30">
                    + {t('admin.quickCreate', 'Tạo nhanh')}
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
            <div
              className="text-card-foreground rounded-xl border-2 p-6 shadow-sm"
              style={{ background: `hsl(${sectionAccent} / 0.08)`, borderColor: `hsl(${sectionAccent} / 0.55)` }}
            >
              {children}
            </div>
          </main>
        </div>
      </div>
      {/* Floating Quick Create removed per user request */}
      <AdminCommandPalette />
    </SidebarProvider>
  );
} 