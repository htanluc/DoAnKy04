"use client"
import { useState } from "react"
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

  // Sửa lỗi: Đưa các hàm vào trong component để sử dụng props
  const getUserDisplayName = () => {
    // Ưu tiên: resident.fullName > user.username > fallback
    if (resident?.fullName) {
      return resident.fullName
    }
    if (user?.username) {
      return user.username
    }
    return ""
  }

  const getUserInfo = () => {
    // Ưu tiên: apartment.unitNumber > user.phoneNumber > fallback
    if (apartment?.unitNumber) {
      return apartment.unitNumber
    }
    if (user?.phoneNumber) {  
      return user.phoneNumber
    }
    return ""
  }

  return (
    <>
      {/* Hamburger button for mobile only - only show when menu is closed */}
      <button
        className={cn(
          "fixed top-4 left-4 z-50 p-2 rounded-md bg-white shadow-md border border-gray-200 text-gray-700 md:hidden",
          isOpen ? "hidden" : "block"
        )}
        aria-label="Mở menu"
        onClick={onToggle}
        type="button"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-white border-r border-gray-200 transition-transform duration-200",
          isOpen ? "translate-x-0" : "-translate-x-full",
          "md:relative md:translate-x-0 md:flex"
        )}
        style={{ height: "100vh" }}
      >
        {/* Close button for mobile */}
        <div className="flex h-16 items-center px-6 border-b border-gray-200 justify-between">
          <h1 className="text-xl font-bold text-gray-900">Menu</h1>
          <button
            className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
            aria-label="Đóng menu"
            onClick={onToggle}
            type="button"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="flex-1 space-y-1 px-4 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
                onClick={onToggle} // Đóng menu khi chọn link trên mobile
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0",
                    isActive ? "text-blue-700" : "text-gray-400 group-hover:text-gray-500"
                  )}
                />  
                {item.name}
              </Link>
            )
          })}
        </nav>
        
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
                <AvatarImage src={getAvatarUrl(user)} alt={getUserDisplayName()} />
                <AvatarFallback>{getUserDisplayName().charAt(0)}</AvatarFallback>
              </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">{getUserDisplayName()}</p>
              <p className="text-xs text-gray-500">{getUserInfo()}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Overlay for mobile when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-30 md:hidden"
          onClick={onToggle}
          aria-label="Đóng menu"
        />
      )}
    </>
  )
} 