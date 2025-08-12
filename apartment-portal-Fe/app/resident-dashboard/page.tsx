"use client";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import AuthGuard from "@/components/auth/auth-guard";
import { useRequireResidentInfo } from "@/hooks/use-require-resident-info";
import LanguageSwitcher from "@/components/language-switcher";
import ThemeToggle from "@/components/theme-toggle";
import UserMenu from "@/components/user-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ResidentDashboard() {
  const router = useRouter();
  const { t } = useLanguage();
  useRequireResidentInfo();

  const handleLogout = () => {
    logout();
    router.push("/login");
    window.location.reload();
  };

  return (
    <AuthGuard requiredRoles={["RESIDENT"]}>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b px-4 sm:px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">{t('dashboard.resident.title')}</h1>
            <p className="text-xs sm:text-sm text-muted-foreground">Tổng quan dành cho cư dân</p>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
            <UserMenu />
          </div>
        </header>

        {/* Content */}
        <main className="flex-1">
          <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>{t('dashboard.notifications')}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {t('dashboard.placeholder.empty')}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('dashboard.billing')}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {t('dashboard.placeholder.empty')}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('dashboard.facilities')}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {t('dashboard.placeholder.empty')}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('dashboard.support')}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {t('dashboard.placeholder.empty')}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('dashboard.events')}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {t('dashboard.placeholder.empty')}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('dashboard.aiqa')}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {t('dashboard.placeholder.empty')}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
} 