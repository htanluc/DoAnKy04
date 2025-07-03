"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Phone, Lock, Building2 } from 'lucide-react'
import { resendVerification } from '@/lib/api'

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
      // Gọi API backend
      const res = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: formData.phone,
          password: formData.password,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success && data.data && data.data.token) {
        // Lưu token vào localStorage
        localStorage.setItem('token', data.data.token)
        // Lưu thêm user info nếu có
        if (data.data.user) {
          localStorage.setItem('user', JSON.stringify(data.data.user))
        }
        router.push('/dashboard')
      } else if (data && data.data && data.data.status && data.data.status !== 'ACTIVE') {
        setError(data.message || 'Tài khoản không hoạt động: ' + data.data.status)
      } else {
        setError(data.message || 'Số điện thoại hoặc mật khẩu không đúng.')
      }
    } catch (err) {
      setError('Không thể kết nối máy chủ. Vui lòng thử lại.')
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-8 w-8 text-blue-600 mr-2" />
            <h1 className="text-2xl font-bold text-gray-900">Apartment Portal</h1>
          </div>
          <CardTitle className="text-2xl text-center">Đăng nhập</CardTitle>
          <CardDescription className="text-center">
            Đăng nhập vào tài khoản của bạn để truy cập portal<br/>
            <span className="text-xs text-gray-400">(Dùng số điện thoại & mật khẩu đã đăng ký)</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
                {error.includes('kích hoạt') && !resent && (
                  <div className="mt-2">
                    <button
                      type="button"
                      className="text-blue-600 underline hover:text-blue-800 text-sm"
                      onClick={handleResend}
                    >
                      Gửi lại email xác nhận
                    </button>
                  </div>
                )}
                {resentMsg && (
                  <div className="mt-2 text-green-600">{resentMsg}</div>
                )}
              </div>
            )}
            <div className="space-y-2">
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
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
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
                  className="pl-10 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Quên mật khẩu?
              </Link>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
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