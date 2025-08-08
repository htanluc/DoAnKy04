"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bell, Menu, X, LogOut, Building2, Clock, User, Settings, Search, Sparkles, Star, Heart, Zap, Target, Award, Shield, Coffee, Wrench, MapPin, Flame, TrendingUp, Sun, Moon, Wifi, Battery, Signal, Cloud, CloudRain
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { fetchAnnouncements } from "@/lib/api"
import { getAvatarUrl } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface EnhancedHeaderProps {
  onMenuToggle?: () => void
  isMenuOpen: boolean
  user: any
  resident?: any
  apartment?: any
  roles?: any
  apartmentResident?: any
  isDarkMode?: boolean
  onDarkModeToggle?: () => void
}

export default function EnhancedHeader({ 
  onMenuToggle, 
  isMenuOpen, 
  user, 
  resident, 
  apartment, 
  roles,
  isDarkMode = false,
  onDarkModeToggle
}: EnhancedHeaderProps) {
  const [unreadCount, setUnreadCount] = useState(0)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showNotifications, setShowNotifications] = useState(false)
  const [recentNotifications, setRecentNotifications] = useState<any[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const [weather, setWeather] = useState({ temp: 25, condition: 'sunny' })
  const router = useRouter()

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  const handleMenuToggle = () => {
    onMenuToggle?.()
  }

  const getAnnouncements = async () => {
    try {
      const data = await fetchAnnouncements()
      const unread = data.filter((ann: any) => !ann.read).length
      setUnreadCount(unread)
      setRecentNotifications(data.slice(0, 5)) // Get top 5 recent announcements
    } catch (error) {
      console.error("Failed to fetch announcements:", error)
    }
  }

  useEffect(() => {
    getAnnouncements()
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000) // Update time every second

    // Simulate weather update
    const weatherInterval = setInterval(() => {
      const newTemp = Math.floor(Math.random() * (35 - 20 + 1)) + 20 // 20-35°C
      const conditions = ['sunny', 'cloudy', 'rainy']
      const newCondition = conditions[Math.floor(Math.random() * conditions.length)]
      setWeather({ temp: newTemp, condition: newCondition })
    }, 60000) // Update weather every minute

    // Listen for storage changes (e.g., logout from another tab)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'token' && !event.newValue) {
        router.push('/login')
      }
    }
    window.addEventListener('storage', handleStorageChange)

    return () => {
      clearInterval(interval)
      clearInterval(weatherInterval)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  const getUserDisplayName = () => {
    return user?.fullName || resident?.fullName || "Cư dân"
  }

  const getUserInfo = () => {
    if (apartment?.apartmentNumber && apartment?.buildingName) {
      return `Căn hộ ${apartment.apartmentNumber}`
    }
    if (roles && roles.length > 0) {
      return roles[0] // Display first role
    }
    return "Người dùng"
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Vừa xong'
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`
    return date.toLocaleDateString('vi-VN')
  }

  const getWeatherIcon = () => {
    switch (weather.condition) {
      case 'sunny': return <Sun className="h-4 w-4 text-yellow-500" />
      case 'cloudy': return <Cloud className="h-4 w-4 text-gray-500" />
      case 'rainy': return <CloudRain className="h-4 w-4 text-blue-500" />
      default: return <Sun className="h-4 w-4 text-yellow-500" />
    }
  }

  return (
    <header className={cn(
      "sticky top-0 z-50 border-b backdrop-blur-sm",
      isDarkMode 
        ? "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-slate-700/50" 
        : "bg-gradient-to-r from-white via-blue-50 to-cyan-50 border-blue-200/50"
    )}>
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <button onClick={handleMenuToggle} className={cn(
              "relative p-2 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg",
              "bg-gradient-to-br from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600"
            )} aria-label="Toggle menu">
              <Menu className="h-5 w-5" />
              <div className="absolute inset-0 bg-white/20 rounded-xl blur-sm"></div>
            </button>
            <div className="hidden md:flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className={cn(
                  "text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                )}>Trải Nghiệm Căn Hộ</h1>
                <p className={cn(
                  "text-xs",
                  isDarkMode ? "text-slate-400" : "text-gray-500"
                )}>FPT Smart Living</p>
              </div>
            </div>
          </div>

          {/* Center Section - Weather & Time */}
          <div className="hidden lg:flex items-center space-x-6">
            <div className={cn(
              "flex items-center space-x-2 px-4 py-2 rounded-xl shadow-sm",
              isDarkMode 
                ? "bg-slate-800/70 text-slate-200" 
                : "bg-white/70 text-gray-700"
            )}>
              {getWeatherIcon()}
              <span className="text-sm font-medium">{weather.temp}°C</span>
            </div>
            <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl text-white shadow-lg">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">{formatTime(currentTime)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Wifi className="h-4 w-4 text-green-500" />
              <Battery className="h-4 w-4 text-green-500" />
              <Signal className="h-4 w-4 text-green-500" />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            <button className={cn(
              "hidden md:flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-opacity-90 transition-colors shadow-sm",
              isDarkMode 
                ? "bg-slate-800/70 text-slate-300 hover:bg-slate-700/70" 
                : "bg-white/70 text-gray-600 hover:bg-white/90"
            )}>
              <Search className="h-4 w-4" />
              <span className="text-sm">Tìm kiếm...</span>
            </button>
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className={cn(
                "relative p-2 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg",
                "bg-gradient-to-br from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
              )} aria-label="Thông báo">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className={cn(
                  "absolute right-0 mt-2 w-80 rounded-lg shadow-xl overflow-hidden z-50 border animate-fade-in-down",
                  isDarkMode 
                    ? "bg-slate-800 border-slate-700" 
                    : "bg-white border-gray-200"
                )}>
                  <div className={cn(
                    "p-4 border-b",
                    isDarkMode ? "border-slate-700" : "border-gray-200"
                  )}>
                    <div className="flex items-center justify-between">
                      <h3 className={cn(
                        "text-lg font-semibold",
                        isDarkMode ? "text-slate-200" : "text-gray-800"
                      )}>Thông báo ({unreadCount})</h3>
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                        Xem tất cả
                      </Button>
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {recentNotifications.length > 0 ? (
                      recentNotifications.map((notification, index) => (
                        <div key={index} className={cn(
                          "flex items-start p-4 hover:bg-opacity-50 transition-colors border-b last:border-b-0",
                          isDarkMode 
                            ? "hover:bg-slate-700 border-slate-700" 
                            : "hover:bg-gray-50 border-gray-100"
                        )}>
                          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                            <Bell className="h-4 w-4" />
                          </div>
                          <div className="ml-3 flex-1">
                            <p className={cn(
                              "text-sm font-medium",
                              isDarkMode ? "text-slate-200" : "text-gray-900"
                            )}>{notification.title}</p>
                            <p className={cn(
                              "text-xs mt-1",
                              isDarkMode ? "text-slate-400" : "text-gray-600"
                            )}>{notification.description}</p>
                            <p className="text-xs text-gray-400 mt-1">{formatNotificationTime(notification.timestamp)}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className={cn(
                        "p-4 text-center text-sm",
                        isDarkMode ? "text-slate-400" : "text-gray-500"
                      )}>Không có thông báo mới.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <button className={cn(
                "flex items-center space-x-2 p-2 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg",
                "bg-gradient-to-br from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
              )}>
                <Avatar className="h-8 w-8 ring-2 ring-white/20">
                  <AvatarImage src={getAvatarUrl(user)} />
                  <AvatarFallback className="bg-white/20 text-white text-sm">{getUserDisplayName().charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">{getUserDisplayName()}</p>
                  <p className="text-xs opacity-80">{getUserInfo()}</p>
                </div>
              </button>
            </div>
            <button onClick={onDarkModeToggle} className={cn(
              "p-2 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg",
              "bg-gradient-to-br from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700"
            )} aria-label="Toggle theme">
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button onClick={handleLogout} className={cn(
              "p-2 rounded-xl transition-all duration-300 hover:scale-105 shadow-lg",
              "bg-gradient-to-br from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600"
            )} aria-label="Đăng xuất">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="md:hidden mt-3 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Trải Nghiệm Căn Hộ
            </h1>
          </div>
        </div>
      </div>
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500"></div>
      <div className="absolute top-2 right-4"><Sparkles className="h-4 w-4 text-blue-400 animate-pulse" /></div>
      <div className="absolute top-4 left-1/4"><Star className="h-3 w-3 text-yellow-400 animate-ping" /></div>
    </header>
  )
}

