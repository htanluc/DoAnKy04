"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home,
  FileText,
  Bell,
  Calendar,
  MessageSquare,
  User,
  Building,
  Settings
} from "lucide-react"

const navigation = [
  { name: "Tổng quan", href: "/dashboard", icon: Home },
  { name: "Hóa đơn", href: "/dashboard/invoices", icon: FileText },
  { name: "Thông báo", href: "/dashboard/announcements", icon: Bell },
  { name: "Sự kiện", href: "/dashboard/events", icon: Calendar },
  { name: "Yêu cầu dịch vụ", href: "/dashboard/service-requests", icon: MessageSquare },
  { name: "Đặt tiện ích", href: "/dashboard/facility-bookings", icon: Building },
  { name: "Cập nhật thông tin", href: "/dashboard/update-info", icon: User },
]

interface SidebarProps {
  user: any
  resident?: any
  apartment?: any
  roles?: any
}

export default function Sidebar({ user, resident, apartment, roles }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Cư dân Portal</h1>
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
          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold">{resident?.fullName || user?.fullName || user?.username || 'Người dùng'}</p>
            <p className="text-xs text-gray-500">{apartment?.unitNumber || ''}</p>
          </div>
        </div>
      </div>
    </div>
  )
} 