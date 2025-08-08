"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Home as HomeIcon, 
  User, 
  Bell, 
  Calendar, 
  Coffee, 
  Receipt, 
  MessageSquare, 
  Building,
  ArrowRight,
  Shield,
  Zap,
  Star,
  Sparkles,
  Building2
} from 'lucide-react'

const features = [
  {
    icon: <HomeIcon className="h-6 w-6" />,
    title: "Thông tin Căn hộ",
    description: "Xem thông tin chi tiết về căn hộ của bạn",
    color: "blue",
    href: "/dashboard"
  },
  {
    icon: <Receipt className="h-6 w-6" />,
    title: "Hóa đơn & Thanh toán",
    description: "Xem và thanh toán hóa đơn dịch vụ",
    color: "green",
    href: "/dashboard/invoices"
  },
  {
    icon: <Bell className="h-6 w-6" />,
    title: "Thông báo",
    description: "Nhận thông báo quan trọng từ ban quản lý",
    color: "orange",
    href: "/dashboard/announcements"
  },
  {
    icon: <Coffee className="h-6 w-6" />,
    title: "Tiện ích",
    description: "Đặt và sử dụng các tiện ích chung cư",
    color: "purple",
    href: "/dashboard/facility-bookings"
  },
  {
    icon: <User className="h-6 w-6" />,
    title: "Quản lý xe gửi",
    description: "Đăng ký và quản lý xe gửi của bạn tại chung cư",
    color: "cyan",
    href: "/dashboard/vehicles"
  }
]

const quickLinks = [
  {
    icon: <HomeIcon className="h-5 w-5" />,
    title: "Dashboard",
    href: "/dashboard",
    color: "blue"
  },
  {
    icon: <Receipt className="h-5 w-5" />,
    title: "Hóa đơn",
    href: "/dashboard/invoices",
    color: "green"
  },
  {
    icon: <Bell className="h-5 w-5" />,
    title: "Thông báo",
    href: "/dashboard/announcements",
    color: "orange"
  },
  {
    icon: <Calendar className="h-5 w-5" />,
    title: "Sự kiện",
    href: "/dashboard/events",
    color: "red"
  },
  {
    icon: <Coffee className="h-5 w-5" />,
    title: "Tiện ích",
    href: "/dashboard/facility-bookings",
    color: "purple"
  },
  {
    icon: <MessageSquare className="h-5 w-5" />,
    title: "Yêu cầu dịch vụ",
    href: "/dashboard/service-requests",
    color: "cyan"
  }
]

const getColorClasses = (color: string) => {
  const colors = {
    blue: "bg-blue-500 hover:bg-blue-600 text-white",
    green: "bg-green-500 hover:bg-green-600 text-white",
    orange: "bg-orange-500 hover:bg-orange-600 text-white",
    purple: "bg-purple-500 hover:bg-purple-600 text-white",
    cyan: "bg-cyan-500 hover:bg-cyan-600 text-white",
    red: "bg-red-500 hover:bg-red-600 text-white"
  }
  return colors[color as keyof typeof colors] || colors.blue
}

const getIconColorClasses = (color: string) => {
  const colors = {
    blue: "text-blue-600",
    green: "text-green-600",
    orange: "text-orange-600",
    purple: "text-purple-600",
    cyan: "text-cyan-600",
    red: "text-red-600"
  }
  return colors[color as keyof typeof colors] || colors.blue
}

export default function Home() {
  const router = useRouter()

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  return (
    <div className="min-h-screen page-background dashboard-background">
      <div className="container mx-auto px-4 py-8 relative">
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
        
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="mb-8">
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl mx-auto">
                <Building2 className="h-12 w-12 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                <Shield className="h-3 w-3 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
              Chào mừng đến với
              <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Trải Nghiệm Căn Hộ FPT
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Quản lý căn hộ thông minh - Kết nối cộng đồng - Dịch vụ tiện ích hiện đại
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => handleNavigation('/login')}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Đăng nhập
            </button>
            <button
              onClick={() => handleNavigation('/register')}
              className="px-8 py-4 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
            >
              Đăng ký
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
            Tính năng chính
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-stagger">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 border border-white/20"
                onClick={() => handleNavigation(feature.href)}
              >
                <div className={`w-14 h-14 rounded-xl ${getColorClasses(feature.color)} flex items-center justify-center mb-6 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                <div className="flex items-center text-blue-600 font-medium">
                  Khám phá ngay
                  <ArrowRight className="h-4 w-4 ml-2" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
            Truy cập nhanh
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 animate-stagger">
            {quickLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-white/20"
              >
                <div className={`w-12 h-12 rounded-xl ${getColorClasses(link.color)} flex items-center justify-center mx-auto mb-4 shadow-md`}>
                  {link.icon}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {link.title}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-10 mb-12 shadow-2xl border border-white/20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
            Tại sao chọn chúng tôi?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Quản lý thông minh</h3>
              <p className="text-gray-600 leading-relaxed">
                Hệ thống quản lý hiện đại, tự động hóa các quy trình, tiết kiệm thời gian và công sức.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Bảo mật cao</h3>
              <p className="text-gray-600 leading-relaxed">
                Bảo mật thông tin cá nhân, thanh toán an toàn, đảm bảo quyền riêng tư của cư dân.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Dịch vụ 24/7</h3>
              <p className="text-gray-600 leading-relaxed">
                Hỗ trợ khách hàng 24/7, phản hồi nhanh chóng, giải quyết vấn đề kịp thời.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500">
          <p className="text-sm">
            © 2024 Trải Nghiệm Căn Hộ FPT. Tất cả quyền được bảo lưu.
          </p>
        </div>
      </div>
    </div>
  )
}