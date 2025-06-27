"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { logout } from "@/lib/auth"
import {
  Building2,
  Users,
  Home,
  Receipt,
  Bell,
  Calendar,
  Coffee,
  MessageSquare,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react"

const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Quản lý Cư dân", href: "/residents", icon: Users },
  { name: "Quản lý Căn hộ", href: "/apartments", icon: Building2 },
  { name: "Hóa đơn & Thanh toán", href: "/billing", icon: Receipt },
  { name: "Thông báo & Tin tức", href: "/announcements", icon: Bell },
  { name: "Sự kiện & Cộng đồng", href: "/events", icon: Calendar },
  { name: "Tiện ích & Dịch vụ", href: "/facilities", icon: Coffee },
  { name: "Phản hồi & Hỗ trợ", href: "/feedback", icon: MessageSquare },
  { name: "Báo cáo & Phân tích", href: "/reports", icon: BarChart3 },
  { name: "Cài đặt", href: "/settings", icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  return (
    <div className="flex h-full w-64 flex-col border-r bg-white dark:bg-gray-950 dark:border-gray-800">
      <div className="flex h-16 items-center border-b px-6 dark:border-gray-800">
        <h1 className="text-xl font-bold">Quản lý Tòa nhà</h1>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm">
          {navItems.map((item, index) => {
            const Icon = item.icon
            return (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-gray-900 dark:hover:text-gray-50",
                  pathname === item.href
                    ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50"
                    : "text-gray-500 dark:text-gray-400",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="mt-auto border-t p-4 dark:border-gray-800">
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </button>
      </div>
    </div>
  )
}
