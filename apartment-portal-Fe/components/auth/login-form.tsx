"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { login, LoginRequest } from "@/lib/auth"
import { useLanguage } from "../../lib/i18n"
import LanguageSwitcher from "@/components/language-switcher"
import { residentsApi } from '@/lib/api'

export default function LoginForm() {
  const router = useRouter()
  const { language, t } = useLanguage()
  const [formData, setFormData] = useState<LoginRequest>({
    phoneNumber: "",
    password: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!formData.phoneNumber || !formData.password) {
      setError(t('validation.required', language))
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await login(formData)
      console.log("Login response:", response);
      if (response.success && response.data) {
        // Luôn lưu user info vào localStorage
        localStorage.setItem("user", JSON.stringify(response.data));
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
        }
        // Nếu backend trả về requireResidentInfo thì chuyển hướng luôn
        if ((response.data as any)?.requireResidentInfo) {
          window.location.href = '/resident-dashboard/update-info';
          return;
        }
        const { status, roles, email, phoneNumber, lockReason } = response.data;
        if (typeof status === 'string' && status.toUpperCase() === 'INACTIVE') {
          // Chỉ lấy email, không lấy phoneNumber
          const emailOrPhone = email || '';
          router.push(`/activate-account?emailOrPhone=${encodeURIComponent(emailOrPhone)}`);
          return;
        }
        if (typeof status === 'string' && status.toUpperCase() === 'LOCKED') {
          setError(`Tài khoản đã bị khóa.\n${lockReason ? 'Lý do: ' + lockReason : ''}`);
          return;
        }
        // Chỉ kiểm tra role khi đã active và không requireResidentInfo
        let roleNames: string[] = [];
        if (Array.isArray(roles) && roles.length > 0) {
          if (roles.every((r: any) => typeof r === 'string')) {
            roleNames = roles.map(r => String(r));
          } else if (roles.every((r: any) => typeof r === 'object' && r !== null && 'name' in r)) {
            roleNames = (roles as any[]).map(r => String(r.name));
          }
        }
        if (roleNames.includes('ADMIN')) {
          router.push('/admin-dashboard');
        } else if (roleNames.includes('STAFF')) {
          router.push('/staff-dashboard');
        } else if (roleNames.includes('RESIDENT')) {
          router.push('/resident-dashboard');
        } else {
          setError('Bạn không có quyền truy cập.');
          setTimeout(() => {
            router.push('/login');
          }, 1000);
          return;
        }
        // Lưu refreshToken nếu có
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
      } else {
        if (response.message && response.message.toLowerCase().includes('chưa kích hoạt')) {
          // Chỉ lấy email, không lấy phoneNumber
          const emailOrPhone = '';
          router.push(`/activate-account?emailOrPhone=${encodeURIComponent(emailOrPhone)}`);
          return;
        }
        setError(response.message || "Đăng nhập thất bại")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError("Có lỗi xảy ra, vui lòng thử lại")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">{t('login.title', language)}</CardTitle>
          <CardDescription className="text-center">
            {t('login.subtitle', language)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">{t('login.phoneNumber', language)}</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="text"
                placeholder={t('login.phoneNumber.placeholder', language)}
                value={formData.phoneNumber}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('login.password', language)}</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t('login.password.placeholder', language)}
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('login.loading', language)}
                </>
              ) : (
                t('login.submit', language)
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              {t('login.noAccount', language)}{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-semibold"
                onClick={() => router.push("/register")}
              >
                {t('login.register', language)}
              </Button>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs text-blue-700 font-medium mb-1">{t('login.demo.title', language)}</p>
            <p className="text-xs text-blue-600">{t('login.demo.phone', language)}</p>
            <p className="text-xs text-blue-600">{t('login.demo.password', language)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 