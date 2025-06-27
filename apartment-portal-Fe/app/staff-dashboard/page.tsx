"use client";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function StaffDashboard() {
  const router = useRouter();
  const handleLogout = () => {
    logout();
    router.push("/login");
  };
  return (
    <div className="flex flex-col min-h-screen items-center justify-center gap-4">
      <h1 className="text-3xl font-bold">Staff Dashboard</h1>
      <button
        onClick={handleLogout}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Đăng xuất
      </button>
    </div>
  );
} 