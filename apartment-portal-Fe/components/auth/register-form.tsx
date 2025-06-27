"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { register, RegisterRequest } from "@/lib/auth"
import { useLanguage } from "../../lib/i18n"
import LanguageSwitcher from "@/components/language-switcher"

export default function RegisterForm() {
  const router = useRouter()
  const { t } = useLanguage()
  const [formData, setFormData] = useState<RegisterRequest>({
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    fullName: "",
    confirmPassword: ""
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear messages when user starts typing
    if (error) setError("")
    if (success) setSuccess("")
  }

  const validateForm = (): boolean => {
    if (!formData.email || !formData.phoneNumber || !formData.password || !formData.fullName || !formData.confirmPassword) {
      setError(t('validation.required'))
      return false
    }

    if (formData.password.length < 6) {
      setError(t('validation.password.min'))
      return false
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t('validation.password.confirm'))
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError(t('validation.email.invalid'))
      return false
    }

    const phoneRegex = /^[0-9]{10,11}$/
    if (!phoneRegex.test(formData.phoneNumber)) {
      setError(t('validation.phone.invalid'))
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const { fullName, email, phoneNumber, password, confirmPassword } = formData;
      const response = await register({
        fullName,
        email,
        phoneNumber,
        password,
        confirmPassword
      });
      
      if (response.success) {
        setSuccess("Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.")
        setFormData({
          username: formData.phoneNumber,
          email: "",
          phoneNumber: "",
          password: "",
          fullName: "",
          confirmPassword: ""
        })
        // Lưu emailOrPhone vào localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('emailOrPhone', formData.phoneNumber || formData.email)
        }
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        setError(response.message || "Đăng ký thất bại")
      }
    } catch (error) {
      console.error("Register error:", error)
      setError(t('error.general'))
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
          <CardTitle className="text-2xl font-bold text-center">{t('register.title')}</CardTitle>
          <CardDescription className="text-center">
            {t('register.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert>
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="fullName">{t('register.fullName', 'Họ tên')}</Label>
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder={t('register.fullName.placeholder', 'Nhập họ tên')}
                value={formData.fullName}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t('register.email')}</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder={t('register.email.placeholder')}
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">{t('register.phoneNumber')}</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder={t('register.phoneNumber.placeholder')}
                value={formData.phoneNumber}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('register.password')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t('register.password.placeholder')}
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('register.confirmPassword', 'Xác nhận mật khẩu')}</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder={t('register.confirmPassword.placeholder', 'Nhập lại mật khẩu')}
                value={formData.confirmPassword}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('register.loading')}
                </>
              ) : (
                t('register.submit')
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              {t('register.hasAccount')}{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-semibold"
                onClick={() => router.push("/login")}
              >
                {t('register.login')}
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 