"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { validateToken, getCurrentUser } from "@/lib/auth"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRoles?: string[]
}

export default function AuthGuard({ children, requiredRoles = [] }: AuthGuardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isValid = await validateToken()
        setIsAuthenticated(isValid)

        if (isValid) {
          const user = getCurrentUser()
          // Nếu user chưa kích hoạt, chỉ cho phép truy cập /activate-account
          if (user && user.status && user.status.toUpperCase() !== 'ACTIVE') {
            const currentPath = window.location.pathname;
            if (!currentPath.startsWith('/activate-account')) {
              // Ưu tiên phoneNumber, fallback email
              const emailOrPhone = user.phoneNumber || user.email || '';
              window.location.href = `/activate-account?emailOrPhone=${encodeURIComponent(emailOrPhone)}`;
              return;
            }
            setHasPermission(true);
            return;
          }
          if (user && requiredRoles.length > 0) {
            let userRoles: string[] = [];
            if (Array.isArray(user.roles) && user.roles.length > 0) {
              if (user.roles.every((r: any) => typeof r === 'string')) {
                userRoles = user.roles.map((r: any) => String(r));
              } else if (user.roles.every((r: any) => typeof r === 'object' && r !== null && 'name' in r)) {
                userRoles = user.roles.map((r: any) => String(r.name));
              }
            }
            const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
            setHasPermission(hasRequiredRole);
            if (!hasRequiredRole) {
              router.push("/");
            }
          } else {
            setHasPermission(true)
          }
        } else {
          router.push("/login")
        }
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [router, requiredRoles])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-gray-500">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  if (!hasPermission && requiredRoles.length > 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Không có quyền truy cập</h1>
          <p className="text-gray-600">Bạn không có quyền truy cập trang này.</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
} 