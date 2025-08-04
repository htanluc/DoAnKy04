"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Menu, X, LogOut, Building2, Clock } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { fetchAnnouncements } from "@/lib/api"
import { getAvatarUrl } from '@/lib/utils'

interface HeaderProps {
  onMenuToggle?: () => void
  isMenuOpen: boolean
  user: any
  resident?: any
  apartment?: any
  roles?: any
}

export default function Header({ onMenuToggle, isMenuOpen, user, resident, apartment, roles }: HeaderProps) {
  const [unreadCount, setUnreadCount] = useState(5)
  const [currentTime, setCurrentTime] = useState(new Date())
  const router = useRouter()

  const handleMenuToggle = () => {
    if (onMenuToggle) {
      onMenuToggle()
    }
  }

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
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

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
    if (resident?.fullName) {
      return resident.fullName
    }
    if (user?.username) {
      return user.username
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side - Menu button and title */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleMenuToggle}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            title="Menu"
            aria-label="Toggle menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">Xin Chào Cư Dân Căn hộ FPT</h1>
          </div>
        </div>

        {/* Right side - Announcements, time, user info */}
        <div className="flex items-center space-x-4">
          {/* Announcements */}
          <div className="relative flex items-center justify-center">
            <a 
              href="/dashboard/announcements"
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors relative flex items-center justify-center"
              title="Thông báo"
            >
              {unreadCount > 0 && (
                <span
                  className="absolute flex items-center justify-center"
                  style={{
                    top: '-10px',
                    left: '60%',
                    transform: 'translateX(-50%)',
                    zIndex: 10,
                  }}
                >
                  <span
                    className="bg-red-500 text-white text-xs font-bold rounded-full border-2 border-white shadow"
                    style={{
                      minWidth: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      lineHeight: 1,
                      padding: '0 4px',
                    }}
                  >
                    {unreadCount}
                  </span>
                </span>
              )}
              <Bell className="h-6 w-6" />
            </a>
          </div>

          {/* Time - Centered, larger, more beautiful */}
          <div className="hidden md:flex flex-col items-center justify-center mx-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-6 w-6 text-blue-500" />
              <span className="text-2xl font-bold text-gray-800 tracking-wide drop-shadow-sm">
                {formatTime(currentTime)}
              </span>
            </div>
            {/* Optional: Add a subtle label below */}
            {/* <span className="text-xs text-gray-400 mt-1">Giờ hiện tại</span> */}
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