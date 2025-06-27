"use client";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import AuthGuard from "@/components/auth/auth-guard";
import { useRequireResidentInfo } from "@/hooks/use-require-resident-info";

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
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar có thể tái sử dụng, hoặc để trống nếu chưa có */}
        <aside className="w-64 bg-white shadow-md hidden md:block"></aside>
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white shadow px-6 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-700">{t('dashboard.resident.title')}</h1>
            {/* Nút Logout */}
            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            >
              Logout
            </button>
            {/* Có thể thêm avatar, menu user ở đây */}
          </header>
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
            <div className="container mx-auto px-4 py-8">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Thông báo */}
                <section className="bg-white rounded shadow p-4">
                  <h2 className="font-semibold text-lg mb-2">{t('dashboard.notifications')}</h2>
                  <div className="text-gray-500 text-sm">{t('dashboard.placeholder.empty')}</div>
                </section>
                {/* Hóa đơn */}
                <section className="bg-white rounded shadow p-4">
                  <h2 className="font-semibold text-lg mb-2">{t('dashboard.billing')}</h2>
                  <div className="text-gray-500 text-sm">{t('dashboard.placeholder.empty')}</div>
                </section>
                {/* Tiện ích */}
                <section className="bg-white rounded shadow p-4">
                  <h2 className="font-semibold text-lg mb-2">{t('dashboard.facilities')}</h2>
                  <div className="text-gray-500 text-sm">{t('dashboard.placeholder.empty')}</div>
                </section>
                {/* Hỗ trợ */}
                <section className="bg-white rounded shadow p-4">
                  <h2 className="font-semibold text-lg mb-2">{t('dashboard.support')}</h2>
                  <div className="text-gray-500 text-sm">{t('dashboard.placeholder.empty')}</div>
                </section>
                {/* Sự kiện */}
                <section className="bg-white rounded shadow p-4">
                  <h2 className="font-semibold text-lg mb-2">{t('dashboard.events')}</h2>
                  <div className="text-gray-500 text-sm">{t('dashboard.placeholder.empty')}</div>
                </section>
                {/* AI Q&A */}
                <section className="bg-white rounded shadow p-4">
                  <h2 className="font-semibold text-lg mb-2">{t('dashboard.aiqa')}</h2>
                  <div className="text-gray-500 text-sm">{t('dashboard.placeholder.empty')}</div>
                </section>
              </div>
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
} 