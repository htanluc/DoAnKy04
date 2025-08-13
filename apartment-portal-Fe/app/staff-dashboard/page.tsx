"use client";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import LanguageSwitcher from "@/components/language-switcher";
import ThemeToggle from "@/components/theme-toggle";
import UserMenu from "@/components/user-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StaffDashboard() {
  const router = useRouter();
  const handleLogout = () => {
    logout();
    router.push("/login");
  };
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b px-4 sm:px-6 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Staff Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Khu vực dành cho nhân viên</p>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
          <UserMenu />
        </div>
      </header>

      <main className="flex-1">
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Tổng quan công việc</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Đang cập nhật...
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Thông báo</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Chưa có thông báo
              </CardContent>
            </Card>
          </div>
          <div className="mt-6">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}