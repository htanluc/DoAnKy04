"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SkeletonStats, SkeletonActivity } from '@/components/ui/skeleton'
import { useResponsive } from '@/hooks/use-responsive'
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
  X,
  ArrowRight,
  Plus
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
  const { isMobile, isTablet, isDesktop } = useResponsive()
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
        setError(null)
        
        const [statsData, activitiesData, apartmentData] = await Promise.all([
          fetchDashboardStats(),
          fetchRecentActivities(),
          fetchMyApartment()
        ])
        
        setStats(statsData)
        setRecentActivities(activitiesData)
        setApartmentInfo(apartmentData)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại.')
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
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Hôm nay'
    if (diffDays === 1) return 'Hôm qua'
    if (diffDays < 7) return `${diffDays} ngày trước`
    
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getActivityIcon = (type: string) => {
    const iconMap: { [key: string]: JSX.Element } = {
      invoice: <Receipt className="h-4 w-4 text-blue-600" />,
      announcement: <Bell className="h-4 w-4 text-yellow-600" />,
      event: <Calendar className="h-4 w-4 text-green-600" />,
      booking: <Coffee className="h-4 w-4 text-purple-600" />,
      payment: <DollarSign className="h-4 w-4 text-green-600" />,
      login: <User className="h-4 w-4 text-gray-600" />,
      facility_booking: <Building className="h-4 w-4 text-indigo-600" />
    }
    return iconMap[type] || <Activity className="h-4 w-4 text-gray-600" />
  }

  const getStatusBadge = (status?: string) => {
    if (!status) return null

    const statusConfig: { [key: string]: { color: string; icon: JSX.Element } } = {
      'pending': { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-3 w-3" /> },
      'paid': { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
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
      <div className="space-y-6 animate-fade-in">
        {/* Welcome Section Skeleton */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 sm:h-8 w-48 sm:w-64 bg-white bg-opacity-20 rounded"></div>
              <div className="h-4 w-36 sm:w-48 bg-white bg-opacity-20 rounded"></div>
            </div>
            <div className="hidden sm:block">
              <div className="h-12 sm:h-16 w-12 sm:w-16 bg-white bg-opacity-20 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <SkeletonStats />

        {/* Quick Actions Skeleton */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-4 sm:p-6">
            <div className="flex items-center mb-4">
              <div className="h-5 w-5 bg-gray-200 rounded mr-2"></div>
              <div className="h-5 w-24 bg-gray-200 rounded"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>

        {/* Activities Skeleton */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="p-4 sm:p-6">
            <div className="flex items-center mb-4">
              <div className="h-5 w-5 bg-gray-200 rounded mr-2"></div>
              <div className="h-5 w-32 bg-gray-200 rounded"></div>
            </div>
            <SkeletonActivity />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Lỗi tải dữ liệu</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} className="animate-pulse-glow">
          Thử lại
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Enhanced Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl p-4 sm:p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="relative flex items-center justify-between">
          <div className="space-y-2 flex-1 min-w-0">
            <h1 className="text-xl sm:text-3xl font-bold mb-2 animate-slide-up text-ellipsis">
              Chào mừng trở lại! 👋
            </h1>
            <p className="text-blue-100 text-sm sm:text-lg text-ellipsis">
              Căn hộ {apartmentInfo.apartmentNumber} - {apartmentInfo.buildingName}
            </p>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">Tầng {apartmentInfo.floor}</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Square className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">{apartmentInfo.area}m²</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Bed className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">{apartmentInfo.bedrooms} phòng ngủ</span>
              </div>
            </div>
          </div>
          <div className="hidden sm:block animate-scale-in flex-shrink-0 ml-4">
            <Building className="h-16 sm:h-20 w-16 sm:w-20 text-blue-200" />
          </div>
        </div>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-stagger">
        <Card className="hover-lift transition-smooth border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-ellipsis">Tổng hóa đơn</CardTitle>
            <Receipt className="h-4 w-4 text-blue-600 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.totalInvoices}</div>
            <p className="text-xs text-muted-foreground text-ellipsis">
              {stats.pendingInvoices} chờ thanh toán
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift transition-smooth border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-ellipsis">Thông báo mới</CardTitle>
            <Bell className="h-4 w-4 text-yellow-600 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.unreadAnnouncements}</div>
            <p className="text-xs text-muted-foreground text-ellipsis">
              Cần đọc ngay
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift transition-smooth border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-ellipsis">Sự kiện sắp tới</CardTitle>
            <Calendar className="h-4 w-4 text-green-600 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.upcomingEvents}</div>
            <p className="text-xs text-muted-foreground text-ellipsis">
              Trong tháng này
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift transition-smooth border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-ellipsis">Đặt tiện ích</CardTitle>
            <Coffee className="h-4 w-4 text-purple-600 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-purple-600">{stats.activeBookings}</div>
            <p className="text-xs text-muted-foreground text-ellipsis">
              Đang hoạt động
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Quick Actions */}
      <Card className="hover-lift transition-smooth">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Zap className="h-5 w-5 mr-2 text-yellow-600" />
            Thao tác nhanh
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link href="/dashboard/invoices">
              <Button variant="outline" className="w-full h-auto p-3 sm:p-4 flex flex-col items-center space-y-2 hover-scale">
                <Receipt className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                <span className="text-xs sm:text-sm font-medium text-ellipsis">Xem hóa đơn</span>
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
              </Button>
            </Link>
            <Link href="/dashboard/announcements">
              <Button variant="outline" className="w-full h-auto p-3 sm:p-4 flex flex-col items-center space-y-2 hover-scale">
                <Bell className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                <span className="text-xs sm:text-sm font-medium text-ellipsis">Thông báo</span>
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
              </Button>
            </Link>
            <Link href="/dashboard/facility-bookings">
              <Button variant="outline" className="w-full h-auto p-3 sm:p-4 flex flex-col items-center space-y-2 hover-scale">
                <Coffee className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                <span className="text-xs sm:text-sm font-medium text-ellipsis">Đặt tiện ích</span>
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
              </Button>
            </Link>
            <Link href="/dashboard/service-requests">
              <Button variant="outline" className="w-full h-auto p-3 sm:p-4 flex flex-col items-center space-y-2 hover-scale">
                <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                <span className="text-xs sm:text-sm font-medium text-ellipsis">Yêu cầu dịch vụ</span>
                <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Recent Activities */}
      <Card className="hover-lift transition-smooth">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-600" />
              Hoạt động gần đây
            </div>
            <Link href="/dashboard/activity-logs">
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                Xem tất cả
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity, index) => (
                <div 
                  key={activity.id} 
                  className="flex items-center space-x-3 sm:space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 text-ellipsis">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500 text-ellipsis-2">
                      {activity.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0 flex items-center space-x-2">
                    {getStatusBadge(activity.status)}
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatDate(activity.timestamp)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Chưa có hoạt động nào</p>
                <p className="text-sm mt-1">Các hoạt động sẽ xuất hiện ở đây</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 