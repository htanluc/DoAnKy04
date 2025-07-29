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
  Star
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
    blue: "text-blue-500",
    green: "text-green-500",
    orange: "text-orange-500",
    purple: "text-purple-500",
    cyan: "text-cyan-500",
    red: "text-red-500"
  }
  return colors[color as keyof typeof colors] || colors.blue
}

export default function Home() {
  const router = useRouter()

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12 animate-fade-in">
        <div className="mb-6">
          <Building className="h-16 w-16 mx-auto text-blue-600 mb-4" />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Chào mừng đến với
            <span className="gradient-text">Căn Hộ FPT</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Quản lý căn hộ thông minh - Kết nối cộng đồng - Dịch vụ tiện ích
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => handleNavigation('/login')}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-smooth hover-lift"
          >
            Đăng nhập
          </button>
          <button
            onClick={() => handleNavigation('/register')}
            className="px-8 py-3 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold rounded-lg transition-smooth hover-lift"
          >
            Đăng ký
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Tính năng chính
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-stagger">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 hover-lift transition-smooth cursor-pointer"
              onClick={() => handleNavigation(feature.href)}
            >
              <div className={`w-12 h-12 rounded-lg ${getColorClasses(feature.color)} flex items-center justify-center mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 mb-4">
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
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Truy cập nhanh
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-stagger">
          {quickLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="bg-white rounded-lg shadow-md p-4 text-center hover-lift transition-smooth"
            >
              <div className={`w-10 h-10 rounded-lg ${getColorClasses(link.color)} flex items-center justify-center mx-auto mb-3`}>
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
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-12">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Tại sao chọn chúng tôi?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Bảo mật cao
            </h3>
            <p className="text-gray-600">
              Thông tin cá nhân được bảo vệ an toàn với công nghệ mã hóa tiên tiến
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nhanh chóng
            </h3>
            <p className="text-gray-600">
              Xử lý yêu cầu nhanh chóng, tiết kiệm thời gian cho cư dân
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Dịch vụ tốt
            </h3>
            <p className="text-gray-600">
              Hỗ trợ 24/7 với đội ngũ nhân viên chuyên nghiệp
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Sẵn sàng trải nghiệm?
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Tham gia ngay để tận hưởng những tiện ích tuyệt vời
        </p>
        <button
          onClick={() => handleNavigation('/register')}
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg text-lg transition-smooth hover-lift"
        >
          Bắt đầu ngay
        </button>
      </div>
      </div>
    </div>
  )
}