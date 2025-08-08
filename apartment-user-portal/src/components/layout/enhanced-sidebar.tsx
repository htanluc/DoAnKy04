"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn, getAvatarUrl } from "@/lib/utils"
import {
  Home, FileText, Bell, Calendar, MessageSquare, User, Building, Menu, X, Car, Activity,
  Sparkles, Star, Heart, Zap, Target, Award, Shield, Coffee, Wrench, MapPin, Building2, Flame, TrendingUp,
  Sun, Moon
} from "lucide-react"

const navigation = [
  {
    name: "Tổng quan", href: "/dashboard", icon: Home,
    description: "Xem tổng quan căn hộ", color: "from-blue-500 to-cyan-500", gradient: "bg-gradient-to-br from-blue-500 to-cyan-500"
  },
  {
    name: "Hóa đơn", href: "/dashboard/invoices", icon: FileText,
    description: "Quản lý thanh toán", color: "from-orange-500 to-red-500", gradient: "bg-gradient-to-br from-orange-500 to-red-500"
  },
  {
    name: "Thông báo", href: "/dashboard/announcements", icon: Bell,
    description: "Cập nhật tin tức", color: "from-purple-500 to-pink-500", gradient: "bg-gradient-to-br from-purple-500 to-pink-500"
  },
  {
    name: "Sự kiện", href: "/dashboard/events", icon: Calendar,
    description: "Tham gia cộng đồng", color: "from-green-500 to-emerald-500", gradient: "bg-gradient-to-br from-green-500 to-emerald-500"
  },
  {
    name: "Tiện ích", href: "/dashboard/facility-bookings", icon: Coffee,
    description: "Đặt chỗ dễ dàng", color: "from-cyan-500 to-indigo-500", gradient: "bg-gradient-to-br from-cyan-500 to-indigo-500"
  },
  {
    name: "Yêu cầu dịch vụ", href: "/dashboard/service-requests", icon: Wrench,
    description: "Gửi yêu cầu hỗ trợ", color: "from-red-500 to-orange-500", gradient: "bg-gradient-to-br from-red-500 to-orange-500"
  },
  {
    name: "Cập nhật thông tin", href: "/dashboard/update-info", icon: User,
    description: "Quản lý hồ sơ", color: "from-pink-500 to-purple-500", gradient: "bg-gradient-to-br from-pink-500 to-purple-500"
  },
  {
    name: "Phương tiện", href: "/dashboard/vehicles", icon: Car,
    description: "Đăng ký xe", color: "from-teal-500 to-blue-500", gradient: "bg-gradient-to-br from-teal-500 to-blue-500"
  },
  {
    name: "Nhật ký hoạt động", href: "/dashboard/activity-logs", icon: Activity,
    description: "Theo dõi lịch sử", color: "from-indigo-500 to-purple-500", gradient: "bg-gradient-to-br from-indigo-500 to-purple-500"
  },
]

interface EnhancedSidebarProps {
  user: any
  resident?: any
  apartment?: any
  roles?: any
  isOpen?: boolean
  onToggle?: () => void
  isDarkMode?: boolean
  onDarkModeToggle?: () => void
}

export default function EnhancedSidebar({ 
  user, 
  resident, 
  apartment, 
  roles, 
  isOpen = true, 
  onToggle,
  isDarkMode = false,
  onDarkModeToggle
}: EnhancedSidebarProps) {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)
  const [lastPathname, setLastPathname] = useState(pathname)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  // Detect screen size changes
  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
    }
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Auto-close sidebar on mobile when navigating to a new page
  useEffect(() => {
    if (isMobile && isOpen && pathname !== lastPathname) {
      onToggle?.()
    }
    setLastPathname(pathname)
  }, [pathname, isMobile, isOpen, onToggle, lastPathname])

  const getUserDisplayName = () => {
    return user?.fullName || resident?.fullName || "Cư dân"
  }

  const getUserInfo = () => {
    if (apartment?.apartmentNumber && apartment?.buildingName) {
      return `Căn hộ ${apartment.apartmentNumber}, ${apartment.buildingName}`
    }
    if (roles && roles.length > 0) {
      return roles.join(', ')
    }
    return "Người dùng"
  }

  const handleCloseMenu = () => {
    if (isMobile && isOpen) {
      onToggle?.()
    }
  }

  return (
    <>
      {isOpen && isMobile && (
        <div className="fixed inset-0 z-30 bg-black bg-opacity-50 transition-opacity duration-300" onClick={handleCloseMenu} aria-label="Đóng menu" />
      )}
      <div className={cn(
        "h-full w-80 transform transition-transform duration-300 ease-in-out",
        isMobile ? "fixed left-0 top-0 z-40" : "relative",
        isOpen ? "translate-x-0" : isMobile ? "-translate-x-full" : "translate-x-0",
        isDarkMode 
          ? "bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50" 
          : "bg-gradient-to-b from-slate-50 via-white to-slate-50 border-r border-slate-200/50",
        "shadow-2xl"
      )}>
        {/* Sidebar Header */}
        <div className={cn(
          "relative h-32 p-6",
          isDarkMode 
            ? "bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600" 
            : "bg-gradient-to-br from-blue-600 via-purple-600 to-cyan-600"
        )}>
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="relative z-10 flex items-center space-x-3">
            <Avatar className="h-16 w-16 ring-4 ring-white/30 shadow-lg">
              <AvatarImage src={getAvatarUrl(user)} alt={getUserDisplayName()} />
              <AvatarFallback className="bg-white/30 text-white text-xl font-semibold">{getUserDisplayName().charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-white text-lg font-semibold truncate">{getUserDisplayName()}</p>
              <p className="text-blue-100 text-sm truncate">{getUserInfo()}</p>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-xs text-white/80">Online</span>
              </div>
            </div>
          </div>
          <div className="absolute top-4 right-4"><Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" /></div>
          <div className="absolute bottom-4 left-4"><Star className="h-4 w-4 text-white/50 animate-ping" /></div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <nav className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const isHovered = hoveredItem === item.name
              return (
                <Link key={item.name} href={item.href}
                  onMouseEnter={() => setHoveredItem(item.name)} onMouseLeave={() => setHoveredItem(null)}
                  className={cn(
                    "group relative flex items-center px-4 py-3 rounded-xl transition-all duration-300",
                    "hover:scale-105 hover:shadow-lg",
                    isActive ? `${item.gradient} text-white shadow-lg scale-105` : 
                      isDarkMode 
                        ? "text-slate-300 hover:text-white hover:bg-slate-800/50" 
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
                  )}>
                  {isHovered && !isActive && (<div className={`absolute inset-0 ${item.gradient} opacity-20 rounded-xl transition-opacity duration-300`} />)}
                  <div className={cn(
                    "relative z-10 flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300", 
                    isActive ? "bg-white/20 text-white" : 
                      isDarkMode 
                        ? "bg-slate-700/50 text-slate-400 group-hover:bg-white/10 group-hover:text-white" 
                        : "bg-slate-100/50 text-slate-500 group-hover:bg-white/10 group-hover:text-slate-700"
                  )}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="relative z-10 ml-4 flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className={cn(
                      "text-xs transition-all duration-300", 
                      isActive ? "text-white/80" : 
                        isDarkMode 
                          ? "text-slate-500 group-hover:text-slate-300" 
                          : "text-slate-500 group-hover:text-slate-600"
                    )}>
                      {item.description}
                    </p>
                  </div>
                  {isActive && (<div className="absolute right-2 top-1/2 -translate-y-1/2"><div className="w-2 h-2 bg-white rounded-full"></div></div>)}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className={cn(
          "p-4 border-t",
          isDarkMode ? "border-slate-700/50" : "border-slate-200/50"
        )}>
          {/* Dark Mode Toggle */}
          <button
            onClick={onDarkModeToggle}
            className={cn(
              "flex items-center w-full px-4 py-3 rounded-xl transition-colors duration-200 group mb-2",
              isDarkMode 
                ? "text-slate-300 hover:text-white hover:bg-slate-800/50" 
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
            )}
          >
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300",
              isDarkMode 
                ? "bg-slate-700/50 text-slate-400 group-hover:bg-white/10 group-hover:text-white" 
                : "bg-slate-100/50 text-slate-500 group-hover:bg-white/10 group-hover:text-slate-700"
            )}>
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </div>
            <span className="ml-4 font-medium">
              {isDarkMode ? "Chế độ sáng" : "Chế độ tối"}
            </span>
          </button>

          <Link href="/dashboard/settings" className={cn(
            "flex items-center px-4 py-3 rounded-xl transition-colors duration-200 group",
            isDarkMode 
              ? "text-slate-300 hover:text-white hover:bg-slate-800/50" 
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/50"
          )}>
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300",
              isDarkMode 
                ? "bg-slate-700/50 text-slate-400 group-hover:bg-white/10 group-hover:text-white" 
                : "bg-slate-100/50 text-slate-500 group-hover:bg-white/10 group-hover:text-slate-700"
            )}>
              <Shield className="h-5 w-5" />
            </div>
            <span className="ml-4 font-medium">Cài đặt bảo mật</span>
          </Link>
        </div>

        {isMobile && (
          <button onClick={handleCloseMenu} className={cn(
            "absolute top-4 right-4 p-2 rounded-lg transition-colors",
            isDarkMode 
              ? "bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50" 
              : "bg-slate-100/50 text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
          )} aria-label="Đóng menu">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
    </>
  )
}
