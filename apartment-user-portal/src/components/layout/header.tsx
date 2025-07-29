"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Menu, X, LogOut, Building2, Sparkles, Clock, Wifi } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { fetchAnnouncements } from "@/lib/api"
import { getAvatarUrl } from '@/lib/utils'

interface HeaderProps {
  onMenuToggle: () => void
  isMenuOpen: boolean
  user: any
  resident?: any
  apartment?: any
  roles?: any
}

export default function Header({ onMenuToggle, isMenuOpen, user, resident, apartment, roles }: HeaderProps) {
  const [unreadCount, setUnreadCount] = useState(5)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()

  const getAnnouncements = async () => {
    try {
      const announcements = await fetchAnnouncements()
      const unread = announcements.filter((a: any) => !a.read)
      setUnreadCount(unread.length)
    } catch (e) {
      console.log('Using default notification count')
    }
  }

  useEffect(() => {
    getAnnouncements()
    
    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'announcements-updated') {
        getAnnouncements()
      }
    }

    const handleAnnouncementsUpdate = () => {
      getAnnouncements()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('announcements-updated', handleAnnouncementsUpdate)

    return () => {
      clearInterval(timeInterval)
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('announcements-updated', handleAnnouncementsUpdate)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const getUserDisplayName = () => {
    // Ưu tiên: resident.fullName > user.username > fallback
    if (resident?.fullName) {
      return resident.fullName
    }
    if (user?.username) {
      return user.username
    }
    return 'Nguyễn Văn A'
  }

  const getUserInfo = () => {
    // Ưu tiên: apartment.unitNumber > user.phoneNumber > fallback
    if (apartment?.unitNumber) {
      return apartment.unitNumber
    }
    if (user?.phoneNumber) {
      return user.phoneNumber
    }
    return 'A1-01'
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Menu button and title */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            title="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">Cư dân Portal</h1>
          </div>
        </div>

        {/* Right side - Notifications, time, user info */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button 
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              title="Thông báo"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Time */}
          <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{formatTime(currentTime)}</span>
          </div>

          {/* User info */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
              <p className="text-xs text-gray-500">{getUserInfo()}</p>
            </div>
            
            <Avatar className="h-8 w-8">
              <AvatarImage src={getAvatarUrl(user)} alt={getUserDisplayName()} />
              <AvatarFallback>{getUserDisplayName().charAt(0)}</AvatarFallback>
            </Avatar>

            <button
              onClick={handleLogout}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
} 