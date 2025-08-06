"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, Menu, X, LogOut, Building2, Clock, User, Settings } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
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
  const [unreadCount, setUnreadCount] = useState(0)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showNotifications, setShowNotifications] = useState(false)
  const [recentNotifications, setRecentNotifications] = useState<any[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const router = useRouter()

  // Detect screen size changes
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const handleMenuToggle = () => {
    console.log('Menu toggle clicked, current state:', isMenuOpen)
    if (onMenuToggle) {
      onMenuToggle()
    }
  }

  const getAnnouncements = async () => {
    try {
      const announcements = await fetchAnnouncements()
      const unread = announcements.filter((a: any) => !a.read)
      setUnreadCount(unread.length)
      setRecentNotifications(announcements.slice(0, 5))
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

  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffMinutes = Math.ceil(diffTime / (1000 * 60))

    if (diffMinutes < 1) return 'Vừa xong'
    if (diffMinutes < 60) return `${diffMinutes} phút trước`
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} giờ trước`
    return date.toLocaleDateString('vi-VN')
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-6 py-4 relative z-40">
      <div className="flex items-center justify-between">
        {/* Left side - Menu button and title */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={handleMenuToggle}
            className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors focus-ring touch-target btn-accessible"
            title="Menu"
            aria-label="Toggle menu"
            type="button"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
              Xin Chào Cư Dân Căn hộ FPT
            </h1>
          </div>
        </div>

        {/* Right side - Announcements, time, user info */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Enhanced Announcements */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors relative focus-ring touch-target btn-accessible"
              title="Thông báo"
              type="button"
            >
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center">
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full border-2 border-white shadow notification-badge"
                    style={{
                      minWidth: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      lineHeight: 1,
                      padding: '0 4px',
                    }}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                </span>
              )}
              <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-lg border border-gray-200 z-50 animate-scale-in">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Thông báo</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push('/dashboard/announcements')}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      Xem tất cả
                    </Button>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {recentNotifications.length > 0 ? (
                    recentNotifications.map((notification, index) => (
                      <div
                        key={notification.id}
                        className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => {
                          router.push('/dashboard/announcements')
                          setShowNotifications(false)
                        }}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <Bell className="h-4 w-4 text-blue-600" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-500 truncate mt-1">
                              {notification.content}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {formatNotificationTime(notification.createdAt)}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="flex-shrink-0">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>Không có thông báo mới</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Time Display */}
          <div className="hidden md:flex flex-col items-center justify-center mx-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-6 w-6 text-blue-500" />
              <span className="text-2xl font-bold text-gray-800 tracking-wide drop-shadow-sm">
                {formatTime(currentTime)}
              </span>
            </div>
            <span className="text-xs text-gray-400 mt-1">
              {currentTime.toLocaleDateString('vi-VN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>

          {/* Enhanced User info */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-900 truncate max-w-[120px]">{getUserDisplayName()}</p>
              <p className="text-xs text-gray-500 truncate max-w-[120px]">{getUserInfo()}</p>
            </div>
            
            <div className="relative group">
              <Avatar className="h-8 w-8 cursor-pointer hover-scale transition-transform">
                <AvatarImage src={getAvatarUrl(user)} alt={getUserDisplayName()} />
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {getUserDisplayName().charAt(0)}
                </AvatarFallback>
              </Avatar>

              {/* User dropdown menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                <div className="py-2">
                  <button
                    onClick={() => router.push('/dashboard/update-info')}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <User className="h-4 w-4" />
                    <span>Cập nhật thông tin</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </header>
  )
} 