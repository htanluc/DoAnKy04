"use client"
import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn, getAvatarUrl } from "@/lib/utils"
import {
  Home,
  FileText,
  Bell,
  Calendar,
  MessageSquare,
  User,
  Building,
  Menu,
  X,
  Car,
  Activity
} from "lucide-react"

const navigation = [
  { name: "Tổng quan", href: "/dashboard", icon: Home },
  { name: "Hóa đơn", href: "/dashboard/invoices", icon: FileText },
  { name: "Thông báo", href: "/dashboard/announcements", icon: Bell },
  { name: "Sự kiện", href: "/dashboard/events", icon: Calendar },
  { name: "Yêu cầu dịch vụ", href: "/dashboard/service-requests", icon: MessageSquare },
  { name: "Đặt tiện ích", href: "/dashboard/facility-bookings", icon: Building },
  { name: "Quản lý xe", href: "/dashboard/vehicles", icon: Car },
  { name: "Hoạt động", href: "/dashboard/activity-logs", icon: Activity },
  { name: "Cập nhật thông tin", href: "/dashboard/update-info", icon: User },
]

interface SidebarProps {
  user: any
  resident?: any
  apartment?: any
  roles?: any
  isOpen?: boolean
  onToggle?: () => void
}

export default function Sidebar({ user, resident, apartment, roles, isOpen = true, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const [isMobile, setIsMobile] = useState(false)
  const [lastPathname, setLastPathname] = useState(pathname)

  // Detect screen size changes
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Auto-close sidebar on mobile when route changes (but not on initial load)
  useEffect(() => {
    if (isMobile && isOpen && onToggle && lastPathname !== pathname && lastPathname !== '') {
      console.log('Route changed, auto-closing menu on mobile')
      onToggle()
    }
    setLastPathname(pathname)
  }, [pathname, isMobile, isOpen, onToggle, lastPathname])

  const getUserDisplayName = () => {
    if (user?.fullName) {
      return user.fullName
    }
    return ""
  }

  const getUserInfo = () => {
    if (apartment?.unitNumber) {
      return apartment.unitNumber
    }
    if (user?.phoneNumber) {  
      return user.phoneNumber
    }
    return ""
  }

  const handleCloseMenu = () => {
    console.log('Sidebar close clicked')
    if (onToggle) {
      onToggle()
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 transition-opacity duration-300"
          onClick={handleCloseMenu}
          aria-label="Đóng menu"
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-white border-r border-gray-200 transition-all duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:relative md:translate-x-0 md:flex md:z-auto"
        )}
        style={{ 
          height: "100vh",
          transform: isMobile && !isOpen ? "translateX(-100%)" : "translateX(0)"
        }}
      >
        {/* Header */}
        <div className="flex h-16 items-center px-6 border-b border-gray-200 justify-between">
          <h1 className="text-xl font-bold text-gray-900">Menu</h1>
          {isMobile && (
            <button
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors focus-ring btn-accessible"
              aria-label="Đóng menu"
              onClick={handleCloseMenu}
              type="button"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                  isActive
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
                onClick={() => {
                  if (isMobile && onToggle) {
                    console.log('Navigation item clicked, closing menu')
                    onToggle()
                  }
                }}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200",
                    isActive ? "text-blue-700" : "text-gray-400 group-hover:text-gray-500"
                  )}
                />  
                <span className="truncate">{item.name}</span>
              </Link>
            )
          })}
        </nav>
        
        {/* User profile */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage src={getAvatarUrl(user)} alt={getUserDisplayName()} />
              <AvatarFallback className="bg-blue-100 text-blue-600">
                {getUserDisplayName().charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{getUserDisplayName()}</p>
              <p className="text-xs text-gray-500 truncate">{getUserInfo()}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 