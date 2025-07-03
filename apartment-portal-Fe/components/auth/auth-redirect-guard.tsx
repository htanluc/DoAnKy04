"use client"
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken, getRoleNames } from "@/lib/auth";

export default function AuthRedirectGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (token) {
      // Lấy user từ localStorage
      let user = null;
      if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            user = JSON.parse(userStr);
          } catch {}
        }
      }
      if (user && user.roles) {
        const roleNames = getRoleNames(user);
        if (roleNames.includes('ADMIN')) {
          router.replace('/admin-dashboard');
        } else if (roleNames.includes('STAFF')) {
          router.replace('/staff-dashboard');
        } else if (roleNames.includes('RESIDENT')) {
          router.replace('/resident-dashboard');
        } else {
          // Xóa localStorage và chuyển về login nếu không có quyền
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          router.replace('/login');
        }
      } else {
        router.replace('/dashboard'); // fallback
      }
    }
  }, [router]);

  return <>{children}</>;
} 