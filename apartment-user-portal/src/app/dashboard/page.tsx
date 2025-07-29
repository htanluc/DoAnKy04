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
  User,
  Building,
  Activity,
  Phone,
  Shield,
  Wrench,
  Building2,
  Flame,
  MapPin,
  Square,
  Bed,
  Layers,
  Sparkles,
  TrendingUp,
  Star,
  Zap,
  Target,
  Heart,
  Users,
  Award,
  Car,
  X
} from 'lucide-react'
import Link from 'next/link'
import { fetchDashboardStats, fetchRecentActivities, fetchMyApartment } from '@/lib/api'
import { getAvatarUrl } from '@/lib/utils'

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
  type: 'invoice' | 'announcement' | 'event' | 'booking' | 'payment' | 'login' | 'facility_booking'
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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [statsData, activitiesData, apartmentData] = await Promise.all([
          fetchDashboardStats(),
          fetchRecentActivities(),
          fetchMyApartment()
        ])
        
        setStats(statsData)
        setRecentActivities(activitiesData)
        setApartmentInfo(apartmentData)
      } catch (err) {
        setError('Không thể tải dữ liệu dashboard')
        console.error('Dashboard fetch error:', err)
      } finally {
        setIsLoading(false)
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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'invoice': return <Receipt className="h-4 w-4" />
      case 'announcement': return <Bell className="h-4 w-4" />
      case 'event': return <Calendar className="h-4 w-4" />
      case 'booking': return <Coffee className="h-4 w-4" />
      case 'payment': return <DollarSign className="h-4 w-4" />
      case 'login': return <User className="h-4 w-4" />
      case 'facility_booking': return <Building className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status?: string) => {
    if (!status) return null
    
    const statusConfig = {
      'paid': { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
      'pending': { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-3 w-3" /> },
      'overdue': { color: 'bg-red-100 text-red-800', icon: <AlertTriangle className="h-3 w-3" /> },
      'confirmed': { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
      'cancelled': { color: 'bg-gray-100 text-gray-800', icon: <X className="h-3 w-3" /> }
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    if (!config) return null

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        <span className="ml-1 capitalize">{status}</span>
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Lỗi tải dữ liệu</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Thử lại
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Chào mừng trở lại!</h1>
            <p className="text-blue-100">
              Căn hộ {apartmentInfo.apartmentNumber} - {apartmentInfo.buildingName}
            </p>
          </div>
          <div className="hidden md:block">
            <Building className="h-16 w-16 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-stagger">
        <Card className="hover-lift transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng hóa đơn</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvoices}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingInvoices} chờ thanh toán
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Thông báo mới</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unreadAnnouncements}</div>
            <p className="text-xs text-muted-foreground">
              Cần đọc ngay
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sự kiện sắp tới</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
            <p className="text-xs text-muted-foreground">
              Trong tháng này
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đặt tiện ích</CardTitle>
            <Coffee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeBookings}</div>
            <p className="text-xs text-muted-foreground">
              Đang hoạt động
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2" />
            Thao tác nhanh
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/dashboard/invoices">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                <Receipt className="h-6 w-6" />
                <span className="text-sm">Xem hóa đơn</span>
              </Button>
            </Link>
            <Link href="/dashboard/announcements">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                <Bell className="h-6 w-6" />
                <span className="text-sm">Thông báo</span>
              </Button>
            </Link>
            <Link href="/dashboard/facility-bookings">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                <Coffee className="h-6 w-6" />
                <span className="text-sm">Đặt tiện ích</span>
              </Button>
            </Link>
            <Link href="/dashboard/service-requests">
              <Button variant="outline" className="w-full h-auto p-4 flex flex-col items-center space-y-2">
                <MessageSquare className="h-6 w-6" />
                <span className="text-sm">Yêu cầu dịch vụ</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Hoạt động gần đây
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {activity.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex items-center space-x-2">
                    {getStatusBadge(activity.status)}
                    <span className="text-xs text-gray-400">
                      {formatDate(activity.timestamp)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Chưa có hoạt động nào</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 