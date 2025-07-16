"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Search, Menu, X, LogOut } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  onMenuToggle: () => void
  isMenuOpen: boolean
  user: any
  resident?: any
  apartment?: any
  roles?: any
}

export default function Header({ onMenuToggle, isMenuOpen, user, resident, apartment, roles }: HeaderProps) {
  const [notifications] = useState(3) // Mock notification count
  const router = useRouter()

  const handleLogout = () => {
    // Xóa token và user info
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // Redirect về trang login
    router.push('/login')
  }

  return (
    <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-6 fixed top-0 right-0 left-64 z-40">
      <div className="flex items-center space-x-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell className="h-5 w-5" />
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {notifications}
            </span>
          )}
        </button>

        {/* User Menu */}
        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900">
              {resident?.fullName || user?.fullName || user?.username || 'Người dùng'}
            </p>
            <p className="text-xs text-gray-500">
              {apartment?.unitNumber || user?.phoneNumber || 'Chưa có thông tin'}
            </p>
          </div>
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder-user.jpg" alt="User" />
            <AvatarFallback>
              {user?.username ? user.username.substring(0, 2).toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-gray-600 hover:text-red-600"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
} 