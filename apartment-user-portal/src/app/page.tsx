import Link from 'next/link'
import { Home as HomeIcon, User, Bell, Calendar, Coffee, Receipt, MessageSquare, Settings } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">🏢 Apartment Portal</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Đăng nhập
              </Link>
              <Link 
                href="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Đăng ký
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Chào mừng đến với Portal Quản lý Chung cư
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Quản lý thông tin căn hộ, hóa đơn, tiện ích và các dịch vụ một cách dễ dàng và thuận tiện
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
              <HomeIcon className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Thông tin Căn hộ</h3>
            <p className="text-gray-600 text-sm">
              Xem thông tin chi tiết về căn hộ của bạn
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
              <Receipt className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Hóa đơn & Thanh toán</h3>
            <p className="text-gray-600 text-sm">
              Xem và thanh toán hóa đơn dịch vụ
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-4">
              <Bell className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Thông báo</h3>
            <p className="text-gray-600 text-sm">
              Nhận thông báo quan trọng từ ban quản lý
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
              <Coffee className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Tiện ích</h3>
            <p className="text-gray-600 text-sm">
              Đặt và sử dụng các tiện ích chung cư
            </p>
          </div>
        </div>

        {/* Quick Access */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Truy cập nhanh
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link 
              href="/dashboard"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <HomeIcon className="h-5 w-5 text-blue-600 mr-3" />
              <span className="font-medium">Dashboard</span>
            </Link>
            
            <Link 
              href="/dashboard/invoices"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              <Receipt className="h-5 w-5 text-green-600 mr-3" />
              <span className="font-medium">Hóa đơn</span>
            </Link>
            
            <Link 
              href="/dashboard/announcements"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors"
            >
              <Bell className="h-5 w-5 text-orange-600 mr-3" />
              <span className="font-medium">Thông báo</span>
            </Link>
            
            <Link 
              href="/dashboard/events"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors"
            >
              <Calendar className="h-5 w-5 text-red-600 mr-3" />
              <span className="font-medium">Sự kiện</span>
            </Link>
            
            <Link 
              href="/dashboard/facilities"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
            >
              <Coffee className="h-5 w-5 text-purple-600 mr-3" />
              <span className="font-medium">Tiện ích</span>
            </Link>
            
            <Link 
              href="/dashboard/support"
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-colors"
            >
              <MessageSquare className="h-5 w-5 text-yellow-600 mr-3" />
              <span className="font-medium">Hỗ trợ</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-300">
              © 2024 Apartment Management Portal. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}