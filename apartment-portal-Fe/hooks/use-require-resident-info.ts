import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Hàm lấy user info từ localStorage (hoặc context tuỳ bạn)
function getUserInfo() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function useRequireResidentInfo() {
  const router = useRouter();
  useEffect(() => {
    const user = getUserInfo();
    if (user?.roles?.includes("RESIDENT") && user?.requireResidentInfo) {
      window.location.href = "/resident-dashboard/update-info";
    }
  }, []);
} 