"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { login, LoginRequest, getRoleNames } from "@/lib/auth"
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
  const [animating, setAnimating] = useState(false)
  const animateAndGo = (path: string) => {
    setAnimating(true)
    setTimeout(() => {
      router.push(path)
    }, 700)
  }

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
        let roleNames: string[] = getRoleNames({ roles });
        if (roleNames.includes('ADMIN')) {
          animateAndGo('/admin-dashboard');
        } else if (roleNames.includes('STAFF')) {
          animateAndGo('/staff-dashboard');
        } else if (roleNames.includes('RESIDENT')) {
          animateAndGo('/resident-dashboard');
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
    <div className="relative min-h-screen px-4 py-12 sm:px-6 lg:px-8 flex items-center justify-center overflow-hidden fpt-bg">
      {/* FPT tri-color ribbon */}
      <div className="absolute top-0 left-0 right-0 fpt-tricolor-bar" />
      {/* Large brand backdrop */}
      <div className="pointer-events-none absolute -top-1/3 -right-1/4 w-[60vw] h-[60vw] rounded-full bg-[hsl(var(--brand-blue))]/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-1/3 -left-1/4 w-[60vw] h-[60vw] rounded-full bg-[hsl(var(--brand-orange))]/5 blur-3xl" />
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      <Card className={`w-full max-w-lg relative border-0 shadow-xl fpt-circuit ${animating ? 'success' : ''}`}>
        <div className="absolute -top-3 left-6 px-2 bg-card text-[10px] uppercase tracking-wider text-[hsl(var(--brand-blue))]">FPT</div>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-[hsl(var(--brand-blue))]">{t('login.title', language)}</CardTitle>
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

            {/* 3 panels theo màu chủ đạo FPT */}
            <div className="flex flex-col gap-3">
              {/* Số điện thoại - xanh lá FPT */}
              <div className="p-3 rounded-lg border bg-[hsl(var(--brand-green))]/8 border-[hsl(var(--brand-green))]/30">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-[hsl(var(--brand-green))]">{t('login.phoneNumber', language)}</Label>
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
              </div>

              {/* Mật khẩu - xanh dương FPT */}
              <div className="p-3 rounded-lg border bg-[hsl(var(--brand-blue))]/8 border-[hsl(var(--brand-blue))]/30">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[hsl(var(--brand-blue))]">{t('login.password', language)}</Label>
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
              </div>

              {/* Đăng nhập - cam FPT */}
              <div className="p-3 rounded-lg border border-transparent bg-[hsl(var(--brand-orange))] text-white flex items-center justify-center relative overflow-hidden">
                <div className="fpt-electric-line" />
                <Button
                  type="submit"
                  className="w-full bg-white/10 hover:bg-white/20 text-white h-11 text-base"
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
              </div>
            </div>
          </form>

          {/* Hidden registration/demos per request */}
        </CardContent>
      </Card>
    </div>
  )
} 