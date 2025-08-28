"use client"

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import EnhancedSidebar from './enhanced-sidebar'
import EnhancedHeader from './enhanced-header'
import dynamic from 'next/dynamic'

const DynamicAiChatWidget = dynamic(() => import('../ui/ai-chat-widget'), { ssr: false })

interface EnhancedLayoutProps {
  children: React.ReactNode
  user: any
  resident?: any
  apartment?: any
  roles?: any
}

export default function EnhancedLayout({ children, user, resident, apartment, roles }: EnhancedLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const pathname = usePathname()

  // Check for dark mode preference and system preference
  useEffect(() => {
    const checkDarkMode = () => {
      const savedMode = localStorage.getItem('darkMode')
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      
      if (savedMode !== null) {
        setIsDarkMode(savedMode === 'true')
      } else {
        setIsDarkMode(systemPrefersDark)
      }
    }

    checkDarkMode()
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addListener(checkDarkMode)
    
    return () => mediaQuery.removeListener(checkDarkMode)
  }, [])

  // Apply dark mode to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  // Detect screen size changes & prevent horizontal scroll
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      
      // Only auto-close sidebar when switching from desktop to mobile
      // Don't auto-close when already on mobile
      if (mobile && isSidebarOpen && window.innerWidth >= 768) {
        setIsSidebarOpen(false)
      }
    }

    handleResize()
    // Ensure no horizontal scroll caused by layout shifts
    document.documentElement.style.overflowX = 'hidden'
    document.body.style.overflowX = 'hidden'
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      document.documentElement.style.overflowX = ''
      document.body.style.overflowX = ''
    }
  }, [isSidebarOpen])

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleDarkModeToggle = () => {
    const newMode = !isDarkMode
    setIsDarkMode(newMode)
    localStorage.setItem('darkMode', newMode.toString())
  }

  // Determine background class based on current path
  const getBackgroundClass = () => {
    if (pathname === '/dashboard') return 'dashboard-background'
    if (pathname === '/login' || pathname === '/register') return 'auth-background'
    if (pathname.includes('/invoices')) return 'invoices-background'
    if (pathname.includes('/events')) return 'events-background'
    if (pathname.includes('/facility-bookings')) return 'facility-background'
    if (pathname.includes('/service-requests')) return 'service-background'
    if (pathname.includes('/update-info')) return 'profile-background'
    if (pathname.includes('/vehicles')) return 'vehicles-background'
    if (pathname.includes('/activity-logs')) return 'activity-background'
    if (pathname.includes('/announcements')) return 'announcements-background'
    return 'dashboard-background' // default
  }

  return (
    <div className="min-h-screen flex overflow-x-hidden pt-[var(--app-header-h)] w-full">
      {/* Enhanced Sidebar - Always visible on desktop, hidden on mobile */}
      <div className={`${isMobile ? 'fixed inset-y-0 left-0 z-50' : 'relative'} overflow-x-hidden`}>
        <EnhancedSidebar
          user={user}
          resident={resident}
          apartment={apartment}
          roles={roles}
          isOpen={isSidebarOpen}
          onToggle={handleSidebarToggle}
          isDarkMode={isDarkMode}
          onDarkModeToggle={handleDarkModeToggle}
        />
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 overflow-x-hidden ${!isMobile && isSidebarOpen ? 'ml-0' : 'ml-0'}`}>
        {/* Enhanced Header */}
        <EnhancedHeader
          onMenuToggle={handleSidebarToggle}
          isMenuOpen={isSidebarOpen}
          user={user}
          resident={resident}
          apartment={apartment}
          roles={roles}
          isDarkMode={isDarkMode}
          onDarkModeToggle={handleDarkModeToggle}
        />

        {/* Page Content with Background */}
        <main className={`flex-1 page-background ${getBackgroundClass()} transition-all duration-300 overflow-x-hidden`}>
          <div className={`relative z-10 p-4 sm:p-6 transition-all duration-300`}>
            {children}
          </div>
        </main>
        {/* Floating AI Chat Widget on the right */}
        {typeof window !== 'undefined' && (
          // Lazy load to avoid SSR issues
          <DynamicAiChatWidget />
        )}
      </div>
    </div>
  )
}
