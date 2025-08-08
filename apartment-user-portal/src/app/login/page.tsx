"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Phone, Lock, Building2, Sparkles, Star } from 'lucide-react'
import { loginUser, resendVerification } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resent, setResent] = useState(false)
  const [resentMsg, setResentMsg] = useState('')

  useEffect(() => {
    // Kiểm tra nếu đã đăng nhập thì redirect về dashboard
    const token = localStorage.getItem('token')
    if (token) {
      // Validate token
      fetch('http://localhost:8080/api/auth/validate', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
        .then(async (res) => {
          const data = await res.json()
          if (res.ok && data.success) {
            router.push('/dashboard')
          } else {
            // Token không hợp lệ, xóa
            localStorage.removeItem('token')
          }
        })
        .catch(() => {
          // Lỗi kết nối, xóa token
          localStorage.removeItem('token')
        })
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Sử dụng hàm loginUser từ api.ts
      const data = await loginUser({
        phoneNumber: formData.phone,
        password: formData.password,
      })
      
      if (data.success && data.data && data.data.jwt && data.data.jwt.token) {
        // Kiểm tra role - chỉ cho phép RESIDENT đăng nhập vào user portal
        const userRoles = data.data.jwt.roles || [];
        if (!userRoles.includes('RESIDENT')) {
          setError('Chỉ cư dân mới được đăng nhập vào portal này. Vui lòng sử dụng admin portal.');
          return;
        }
        
        localStorage.setItem('token', data.data.jwt.token)
        localStorage.setItem('user', JSON.stringify(data.data.jwt))
        router.push('/dashboard')
        return
      } else if (data && data.data && data.data.status && data.data.status !== 'ACTIVE') {
        setError(data.message || 'Tài khoản không hoạt động: ' + data.data.status)
      } else {
        setError(data.message || 'Số điện thoại hoặc mật khẩu không đúng.')
      }
    } catch (err: any) {
      setError(err.message || 'Không thể kết nối máy chủ. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleResend = async () => {
    setResentMsg('')
    try {
      await resendVerification(formData.phone)
      setResent(true)
      setResentMsg('Đã gửi lại email xác nhận. Vui lòng kiểm tra hộp thư.')
    } catch (err: any) {
      setResentMsg(err.message || 'Gửi lại email xác nhận thất bại.')
    }
  }

  return (
    <div className="min-h-screen page-background auth-background flex items-center justify-center p-4 relative">
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10">
        <Sparkles className="h-8 w-8 text-blue-400 animate-pulse" />
      </div>
      <div className="absolute top-20 right-20">
        <Star className="h-6 w-6 text-yellow-400 animate-ping" />
      </div>
      <div className="absolute bottom-20 left-20">
        <Star className="h-4 w-4 text-purple-400 animate-bounce" />
      </div>
      
      <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm border-0 shadow-2xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent ml-3">
              Trải Nghiệm Căn Hộ FPT
            </h1>
          </div>
          <CardTitle className="text-2xl text-center text-gray-900">Đăng nhập</CardTitle>
          <CardDescription className="text-center text-gray-600">
            Đăng nhập vào tài khoản của bạn để truy cập portal<br/>
            <span className="text-xs text-gray-500">(Dùng số điện thoại & mật khẩu đã đăng ký)</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>{error}</span>
                </div>
                {error.includes('kích hoạt') && !resent && (
                  <div className="mt-3">
                    <button
                      type="button"
                      className="text-blue-600 underline hover:text-blue-800 text-sm font-medium"
                      onClick={handleResend}
                    >
                      Gửi lại email xác nhận
                    </button>
                  </div>
                )}
                {resentMsg && (
                  <div className="mt-2 text-green-600 font-medium">{resentMsg}</div>
                )}
              </div>
            )}
            <div className="space-y-3">
              <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Số điện thoại
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Nhập số điện thoại"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                  required
                />
              </div>
            </div>
            <div className="space-y-3">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="pl-10 pr-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600">Ghi nhớ đăng nhập</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-500 font-medium"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Đang đăng nhập...</span>
                </div>
              ) : (
                'Đăng nhập'
              )}
            </Button>
            <div className="text-center">
              <span className="text-sm text-gray-600">
                Chưa có tài khoản?{' '}
                <Link
                  href="/register"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Đăng ký ngay
                </Link>
              </span>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 