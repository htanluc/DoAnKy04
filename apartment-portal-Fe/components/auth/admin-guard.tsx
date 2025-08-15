"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { validateToken, getCurrentUser, getRoleNames, refreshToken, removeTokens } from "@/lib/auth"
import { Loader2 } from "lucide-react"

interface AdminGuardProps {
  children: React.ReactNode
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [hasAdminPermission, setHasAdminPermission] = useState(false)

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        let isValid = await validateToken()
        
        // Nếu token không hợp lệ, thử refresh
        if (!isValid) {
          console.log('Token không hợp lệ, thử refresh...')
          const refreshed = await refreshToken()
          if (refreshed && refreshed.token) {
            console.log('Refresh token thành công, thử validate lại...')
            isValid = await validateToken()
          }
        }

        setIsAuthenticated(isValid)

        if (isValid) {
          const user = getCurrentUser()
          
          // Kiểm tra user có tồn tại và có trạng thái ACTIVE
          if (!user || (user.status && user.status.toUpperCase() !== 'ACTIVE')) {
            console.log('User không tồn tại hoặc chưa kích hoạt:', user)
            removeTokens()
            router.push("/login")
            return
          }

          // Kiểm tra user có role ADMIN
          const userRoles = getRoleNames(user)
          const isAdmin = userRoles.includes('ADMIN')
          
          console.log('User roles:', userRoles, 'Is admin:', isAdmin)
          
          if (!isAdmin) {
            console.log('User không có quyền ADMIN, redirecting to login')
            removeTokens()
            router.push("/login")
            return
          }

          setHasAdminPermission(true)
        } else {
          console.log('Token không hợp lệ sau khi refresh, redirecting to login')
          removeTokens()
          router.push("/login")
        }
      } catch (error) {
        console.error("Admin auth check error:", error)
        removeTokens()
        router.push("/login")
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm text-gray-500">Đang kiểm tra quyền admin...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !hasAdminPermission) {
    return null // Will redirect to login
  }

  return <>{children}</>
}
