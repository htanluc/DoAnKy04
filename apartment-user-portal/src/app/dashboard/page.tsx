"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Home, 
  Receipt, 
  Bell, 
  Calendar, 
  Coffee, 
  MessageSquare, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Clock,
  User
} from 'lucide-react'
import Link from 'next/link'
import { fetchDashboardStats, fetchRecentActivities, fetchMyApartment } from '@/lib/api'

interface DashboardStats {
  totalInvoices: number
  pendingInvoices: number
  overdueInvoices: number
  totalAmount: number
  unreadAnnouncements: number
  upcomingEvents: number
  activeBookings: number
  supportRequests: number
}

interface RecentActivity {
  id: string
  type: 'invoice' | 'announcement' | 'event' | 'booking' | 'payment'
  title: string
  description: string
  timestamp: string
  status?: string
}

interface ApartmentInfo {
  apartmentNumber?: string
  buildingName?: string
  area?: number
  bedrooms?: number
  floor?: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalInvoices: 0,
    pendingInvoices: 0,
    overdueInvoices: 0,
    totalAmount: 0,
    unreadAnnouncements: 0,
    upcomingEvents: 0,
    activeBookings: 0,
    supportRequests: 0
  })
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [apartmentInfo, setApartmentInfo] = useState<ApartmentInfo>({})
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Fetch user info lại ở đây nếu cần
        // const userData = await fetchCurrentUser()
        // setUser(userData)
        const statsData = await fetchDashboardStats()
        setStats(statsData)
        const activitiesData = await fetchRecentActivities()
        setRecentActivities(activitiesData)
        const apartmentData = await fetchMyApartment()
        setApartmentInfo(apartmentData)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'invoice':
        return <Receipt className="h-4 w-4" />
      case 'announcement':
        return <Bell className="h-4 w-4" />
      case 'event':
        return <Calendar className="h-4 w-4" />
      case 'booking':
        return <Coffee className="h-4 w-4" />
      case 'payment':
        return <DollarSign className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status?: string) => {
    if (!status) return null
    
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="h-3 w-3 mr-1" />
          Chờ xử lý
        </span>
      case 'completed':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3 mr-1" />
          Hoàn thành
        </span>
      case 'overdue':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Quá hạn
        </span>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="h-full bg-gray-50 flex flex-col flex-1">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Chào mừng trở lại! Đây là tổng quan về tài khoản của bạn.</p>
            </div>
            <div className="flex items-center space-x-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="mb-6 p-4 bg-white rounded-lg shadow flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Xin chào, {user?.fullName || user?.username || 'Cư dân'}!</h2>
              <div className="text-gray-600 text-sm">Số điện thoại: <b>{user?.phoneNumber}</b></div>
              <div className="text-gray-600 text-sm">Trạng thái: <b>{user?.status}</b></div>
            </div>
            <div className="mt-4 md:mt-0">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {user?.roles?.join(', ') || 'Cư dân'}
              </span>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng hóa đơn</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalInvoices}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingInvoices} chờ thanh toán, {stats.overdueInvoices} quá hạn
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng tiền</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
              <p className="text-xs text-muted-foreground">
                Tổng số tiền hóa đơn
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Thông báo mới</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unreadAnnouncements}</div>
              <p className="text-xs text-muted-foreground">
                Thông báo chưa đọc
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sự kiện sắp tới</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
              <p className="text-xs text-muted-foreground">
                Sự kiện trong tháng này
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Hành động nhanh</CardTitle>
              <CardDescription>Thực hiện các thao tác thường dùng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/invoices">
                <Button variant="outline" className="w-full justify-start">
                  <Receipt className="mr-2 h-4 w-4" />
                  Xem hóa đơn
                </Button>
              </Link>
              <Link href="/dashboard/announcements">
                <Button variant="outline" className="w-full justify-start">
                  <Bell className="mr-2 h-4 w-4" />
                  Đọc thông báo
                </Button>
              </Link>
              <Link href="/dashboard/facility-bookings">
                <Button variant="outline" className="w-full justify-start">
                  <Coffee className="mr-2 h-4 w-4" />
                  Đặt tiện ích
                </Button>
              </Link>
              <Link href="/dashboard/service-requests">
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Yêu cầu hỗ trợ
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Hoạt động gần đây</CardTitle>
              <CardDescription>Những hoạt động mới nhất trong tài khoản của bạn</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                      <div className="flex-shrink-0 mt-1">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {activity.title}
                          </p>
                          <span className="text-xs text-gray-500">
                            {formatDate(activity.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {activity.description}
                        </p>
                        {getStatusBadge(activity.status)}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Chưa có hoạt động nào
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin căn hộ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Số căn hộ:</span>
                  <span className="text-sm font-medium">{apartmentInfo.apartmentNumber || 'Chưa có thông tin'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Tòa:</span>
                  <span className="text-sm font-medium">{apartmentInfo.buildingName || 'Chưa có thông tin'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Diện tích:</span>
                  <span className="text-sm font-medium">{apartmentInfo.area ? `${apartmentInfo.area}m²` : 'Chưa có thông tin'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Số phòng ngủ:</span>
                  <span className="text-sm font-medium">{apartmentInfo.bedrooms || 'Chưa có thông tin'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Liên hệ khẩn cấp</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Bảo vệ:</span>
                  <span className="text-sm font-medium">0123 456 789</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Kỹ thuật:</span>
                  <span className="text-sm font-medium">0123 456 790</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Quản lý:</span>
                  <span className="text-sm font-medium">0123 456 791</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Cứu hỏa:</span>
                  <span className="text-sm font-medium">114</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 