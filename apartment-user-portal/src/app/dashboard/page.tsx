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
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Vừa xong'
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`
    return date.toLocaleDateString('vi-VN')
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'invoice': return <Receipt className="h-4 w-4" />
      case 'announcement': return <Bell className="h-4 w-4" />
      case 'event': return <Calendar className="h-4 w-4" />
      case 'booking': return <Building className="h-4 w-4" />
      case 'payment': return <DollarSign className="h-4 w-4" />
      case 'login': return <User className="h-4 w-4" />
      case 'facility_booking': return <Coffee className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status?: string) => {
    const config = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-3 w-3" /> },
      completed: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="h-3 w-3" /> },
      overdue: { color: 'bg-red-100 text-red-800', icon: <AlertTriangle className="h-3 w-3" /> },
      active: { color: 'bg-blue-100 text-blue-800', icon: <Zap className="h-3 w-3" /> }
    }
    
    const statusConfig = config[status as keyof typeof config] || config.pending
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
        {statusConfig.icon}
        <span className="ml-1 capitalize">{status}</span>
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        {/* Welcome Section Skeleton */}
        <div className="bg-gradient-to-r from-[color:#FF6600] via-[color:#009966] to-[color:#0066CC] rounded-xl p-4 sm:p-6">
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
    <div className="space-y-6 animate-fade-in">
      {/* Enhanced Welcome Section with Glass Effect */}
      <div className="relative bg-gradient-to-r from-[color:#FF6600] via-[color:#009966] to-[color:#0066CC] rounded-2xl p-6 sm:p-8 text-white overflow-hidden shadow-2xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black bg-opacity-10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-10 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative flex items-center justify-between">
          <div className="space-y-3 flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-yellow-300 animate-pulse" />
              <h1 className="text-2xl sm:text-4xl font-bold mb-2 animate-slide-up text-ellipsis">
                Chào mừng trở lại! 👋
              </h1>
            </div>
            <p className="text-white/80 text-lg sm:text-xl text-ellipsis">
              Căn hộ {apartmentInfo.apartmentNumber} - {apartmentInfo.buildingName}
            </p>
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 mt-4">
              <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-lg px-3 py-1">
                <MapPin className="h-4 w-4" />
                <span className="text-sm font-medium">Tầng {apartmentInfo.floor}</span>
              </div>
              <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-lg px-3 py-1">
                <Square className="h-4 w-4" />
                <span className="text-sm font-medium">{apartmentInfo.area}m²</span>
              </div>
              <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-lg px-3 py-1">
                <Bed className="h-4 w-4" />
                <span className="text-sm font-medium">{apartmentInfo.bedrooms} phòng ngủ</span>
              </div>
            </div>
          </div>
          <div className="hidden sm:block relative">
            <div className="w-20 h-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <Building2 className="h-10 w-10 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
              <CheckCircle className="h-3 w-3 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bg-gradient-to-br from-[color:#0066CC] to-[color:#0066CC] text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Tổng hóa đơn</CardTitle>
              <Receipt className="h-6 w-6 text-[color:#E6F2FF]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalInvoices}</div>
            <p className="text-[color:#E6F2FF] text-sm">Hóa đơn trong tháng</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Chờ thanh toán</CardTitle>
              <Clock className="h-6 w-6 text-orange-200" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingInvoices}</div>
            <p className="text-orange-200 text-sm">Hóa đơn chờ xử lý</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Sự kiện sắp tới</CardTitle>
              <Calendar className="h-6 w-6 text-green-200" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcomingEvents}</div>
            <p className="text-green-200 text-sm">Sự kiện trong tuần</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[color:#009966] to-[color:#0066CC] text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Thông báo mới</CardTitle>
              <Bell className="h-6 w-6 text-[color:#E6F2FF]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unreadAnnouncements}</div>
            <p className="text-[color:#E6F2FF] text-sm">Thông báo chưa đọc</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-[color:#0066CC]" />
            <CardTitle>Thao tác nhanh</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link href="/dashboard/invoices">
              <div className="group p-4 rounded-xl bg-gradient-to-br from-[color:#E6F2FF] to-[color:#CCE5FF] hover:from-[color:#D9EBFF] hover:to-[color:#B3D7FF] transition-all duration-300 cursor-pointer border border-[color:#99CCFF] hover:border-[color:#80BFFF]">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-12 h-12 bg-[color:#0066CC] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Receipt className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Hóa đơn</span>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/facility-bookings">
              <div className="group p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 transition-all duration-300 cursor-pointer border border-green-200 hover:border-green-300">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Building className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Đặt tiện ích</span>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/service-requests">
              <div className="group p-4 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 transition-all duration-300 cursor-pointer border border-orange-200 hover:border-orange-300">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Wrench className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Yêu cầu dịch vụ</span>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/announcements">
              <div className="group p-4 rounded-xl bg-gradient-to-br from-[color:#E6F2FF] to-[color:#CCE5FF] hover:from-[color:#D9EBFF] hover:to-[color:#B3D7FF] transition-all duration-300 cursor-pointer border border-[color:#99CCFF] hover:border-[color:#80BFFF]">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-12 h-12 bg-[color:#0066CC] rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Bell className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">Thông báo</span>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-[color:#0066CC]" />
                  <CardTitle>Hoạt động gần đây</CardTitle>
                </div>
                <Link href="/dashboard/activity-logs">
                  <Button variant="ghost" size="sm" className="text-[color:#0066CC] hover:text-[color:#0a74d1]">
                    Xem tất cả
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.slice(0, 5).map((activity, index) => (
                  <div key={`activity-${activity.id || index}-${Date.now()}`} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-400">{formatDate(activity.timestamp)}</span>
                        {activity.status && getStatusBadge(activity.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Apartment Info */}
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Home className="h-5 w-5 text-blue-600" />
                <CardTitle>Thông tin căn hộ</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[color:#E6F2FF] to-[color:#CCE5FF] rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Số căn hộ</span>
                  <span className="text-sm font-semibold text-gray-900">{apartmentInfo.apartmentNumber}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Tòa nhà</span>
                  <span className="text-sm font-semibold text-gray-900">{apartmentInfo.buildingName}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[color:#FFF3E8] to-[color:#FFE0CC] rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Diện tích</span>
                  <span className="text-sm font-semibold text-gray-900">{apartmentInfo.area}m²</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Phòng ngủ</span>
                  <span className="text-sm font-semibold text-gray-900">{apartmentInfo.bedrooms}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-[color:#E6F2FF] to-[color:#CCE5FF] rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Tầng</span>
                  <span className="text-sm font-semibold text-gray-900">{apartmentInfo.floor}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 
  