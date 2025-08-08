# Tabler Template Implementation Guide

## 🎯 Why Tabler is Perfect for Your Project

Tabler is an excellent choice for your apartment management portal because:
- **Modern Design**: Clean, professional interface
- **Responsive**: Works perfectly on all devices
- **Free & Open Source**: No licensing costs
- **Rich Components**: 100+ pre-built components
- **Easy Integration**: Works seamlessly with Next.js and React

## 🚀 Step-by-Step Implementation

### Step 1: Install Tabler Dependencies

```bash
# Navigate to your user portal
cd apartment-user-portal

# Install Tabler dependencies
npm install @tabler/icons-react
npm install @tabler/core
npm install @tabler/theme
```

### Step 2: Update Tailwind Configuration

```typescript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Tabler color palette
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          900: '#0c4a6e',
        },
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        danger: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'tabler': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'tabler-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
```

### Step 3: Create Tabler Components

```typescript
// components/ui/tabler-card.tsx
import React from 'react'
import { cn } from '@/lib/utils'

interface TablerCardProps {
  children: React.ReactNode
  className?: string
  title?: string
  subtitle?: string
  actions?: React.ReactNode
}

export const TablerCard: React.FC<TablerCardProps> = ({
  children,
  className,
  title,
  subtitle,
  actions
}) => {
  return (
    <div className={cn(
      "bg-white rounded-lg border border-gray-200 shadow-tabler",
      "hover:shadow-tabler-lg transition-shadow duration-200",
      className
    )}>
      {(title || actions) && (
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}
```

### Step 4: Enhanced Dashboard Layout

```typescript
// components/layout/enhanced-sidebar.tsx
import React from 'react'
import { 
  Home, 
  Receipt, 
  Bell, 
  Calendar, 
  Coffee, 
  User, 
  Building,
  Settings,
  LogOut
} from '@tabler/icons-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SidebarProps {
  user?: any
  resident?: any
  apartment?: any
  roles?: string[]
  isOpen?: boolean
  onToggle?: () => void
}

export const EnhancedSidebar: React.FC<SidebarProps> = ({
  user,
  resident,
  apartment,
  roles,
  isOpen = false,
  onToggle
}) => {
  const pathname = usePathname()

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      current: pathname === '/dashboard'
    },
    {
      name: 'Hóa đơn',
      href: '/dashboard/invoices',
      icon: Receipt,
      current: pathname.startsWith('/dashboard/invoices')
    },
    {
      name: 'Thông báo',
      href: '/dashboard/announcements',
      icon: Bell,
      current: pathname.startsWith('/dashboard/announcements')
    },
    {
      name: 'Sự kiện',
      href: '/dashboard/events',
      icon: Calendar,
      current: pathname.startsWith('/dashboard/events')
    },
    {
      name: 'Tiện ích',
      href: '/dashboard/facility-bookings',
      icon: Coffee,
      current: pathname.startsWith('/dashboard/facility-bookings')
    },
    {
      name: 'Phương tiện',
      href: '/dashboard/vehicles',
      icon: User,
      current: pathname.startsWith('/dashboard/vehicles')
    },
    {
      name: 'Căn hộ',
      href: '/dashboard/apartments',
      icon: Building,
      current: pathname.startsWith('/dashboard/apartments')
    }
  ]

  return (
    <div className={cn(
      "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out",
      isOpen ? "translate-x-0" : "-translate-x-full",
      "lg:translate-x-0 lg:static lg:inset-0"
    )}>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
        <div className="flex items-center">
          <Building className="h-8 w-8 text-primary-600" />
          <span className="ml-2 text-xl font-bold text-gray-900">FPT Apartments</span>
        </div>
        <button
          onClick={onToggle}
          className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* User Info */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="h-6 w-6 text-primary-600" />
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900">
              {user?.fullName || 'Cư dân'}
            </p>
            <p className="text-xs text-gray-500">
              {apartment?.unitNumber || 'Chưa có thông tin'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200",
                item.current
                  ? "bg-primary-50 text-primary-700 border-r-2 border-primary-600"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <Icon className={cn(
                "mr-3 h-5 w-5",
                item.current ? "text-primary-600" : "text-gray-400"
              )} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Link
          href="/settings"
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors duration-200"
        >
          <Settings className="mr-3 h-5 w-5 text-gray-400" />
          Cài đặt
        </Link>
        <button
          onClick={() => {/* Handle logout */}}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors duration-200"
        >
          <LogOut className="mr-3 h-5 w-5 text-gray-400" />
          Đăng xuất
        </button>
      </div>
    </div>
  )
}
```

### Step 5: Enhanced Dashboard Stats

```typescript
// components/dashboard/enhanced-stats.tsx
import React from 'react'
import { 
  Receipt, 
  Bell, 
  Calendar, 
  Coffee,
  TrendingUp,
  TrendingDown
} from '@tabler/icons-react'
import { TablerCard } from '@/components/ui/tabler-card'

interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ReactNode
  color: 'primary' | 'success' | 'warning' | 'danger'
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon,
  color
}) => {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600 border-primary-200',
    success: 'bg-success-50 text-success-600 border-success-200',
    warning: 'bg-warning-50 text-warning-600 border-warning-200',
    danger: 'bg-danger-50 text-danger-600 border-danger-200'
  }

  return (
    <TablerCard className="relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {change >= 0 ? (
                <TrendingUp className="h-4 w-4 text-success-600 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 text-danger-600 mr-1" />
              )}
              <span className={cn(
                "text-sm font-medium",
                change >= 0 ? "text-success-600" : "text-danger-600"
              )}>
                {Math.abs(change)}%
              </span>
            </div>
          )}
        </div>
        <div className={cn(
          "p-3 rounded-lg border",
          colorClasses[color]
        )}>
          {icon}
        </div>
      </div>
    </TablerCard>
  )
}

export const EnhancedStats: React.FC<{ stats: any }> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Tổng hóa đơn"
        value={stats.totalInvoices}
        change={12}
        icon={<Receipt className="h-6 w-6" />}
        color="primary"
      />
      <StatsCard
        title="Thông báo mới"
        value={stats.unreadAnnouncements}
        change={-5}
        icon={<Bell className="h-6 w-6" />}
        color="warning"
      />
      <StatsCard
        title="Sự kiện sắp tới"
        value={stats.upcomingEvents}
        change={8}
        icon={<Calendar className="h-6 w-6" />}
        color="success"
      />
      <StatsCard
        title="Đặt chỗ tiện ích"
        value={stats.activeBookings}
        change={-2}
        icon={<Coffee className="h-6 w-6" />}
        color="primary"
      />
    </div>
  )
}
```

### Step 6: Enhanced Activity Feed

```typescript
// components/dashboard/enhanced-activities.tsx
import React from 'react'
import { TablerCard } from '@/components/ui/tabler-card'
import { 
  Receipt, 
  Bell, 
  Calendar, 
  Coffee,
  User,
  Building
} from '@tabler/icons-react'

interface Activity {
  id: string
  type: 'invoice' | 'announcement' | 'event' | 'booking' | 'vehicle' | 'apartment'
  title: string
  description: string
  time: string
  status?: 'success' | 'warning' | 'danger' | 'info'
}

const getActivityIcon = (type: Activity['type']) => {
  const icons = {
    invoice: Receipt,
    announcement: Bell,
    event: Calendar,
    booking: Coffee,
    vehicle: User,
    apartment: Building
  }
  return icons[type]
}

const getStatusColor = (status?: Activity['status']) => {
  const colors = {
    success: 'bg-success-100 text-success-800',
    warning: 'bg-warning-100 text-warning-800',
    danger: 'bg-danger-100 text-danger-800',
    info: 'bg-primary-100 text-primary-800'
  }
  return colors[status || 'info']
}

export const EnhancedActivities: React.FC<{ activities: Activity[] }> = ({ activities }) => {
  return (
    <TablerCard title="Hoạt động gần đây" subtitle="Cập nhật mới nhất">
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = getActivityIcon(activity.type)
          return (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                getStatusColor(activity.status)
              )}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <p className="text-sm text-gray-600">{activity.description}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            </div>
          )
        })}
      </div>
    </TablerCard>
  )
}
```

### Step 7: Update Main Dashboard

```typescript
// app/dashboard/page.tsx (Updated)
"use client"

import { useState, useEffect } from 'react'
import { EnhancedSidebar } from '@/components/layout/enhanced-sidebar'
import { EnhancedStats } from '@/components/dashboard/enhanced-stats'
import { EnhancedActivities } from '@/components/dashboard/enhanced-activities'
import { TablerCard } from '@/components/ui/tabler-card'
import { fetchDashboardStats, fetchRecentActivities } from '@/lib/api'

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalInvoices: 0,
    unreadAnnouncements: 0,
    upcomingEvents: 0,
    activeBookings: 0
  })
  const [activities, setActivities] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, activitiesData] = await Promise.all([
          fetchDashboardStats(),
          fetchRecentActivities()
        ])
        setStats(statsData)
        setActivities(activitiesData)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <EnhancedSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Chào mừng bạn trở lại!</p>
            </div>
            
            <EnhancedStats stats={stats} />
            
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EnhancedActivities activities={activities} />
              
              <TablerCard title="Thông tin căn hộ">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Số căn hộ:</span>
                    <span className="font-medium">A1-101</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Diện tích:</span>
                    <span className="font-medium">85m²</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Trạng thái:</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800">
                      Đang ở
                    </span>
                  </div>
                </div>
              </TablerCard>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
```

## 🎨 Additional Tabler Components

### Enhanced Button Component

```typescript
// components/ui/tabler-button.tsx
import React from 'react'
import { cn } from '@/lib/utils'

interface TablerButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  className?: string
  onClick?: () => void
}

export const TablerButton: React.FC<TablerButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className,
  onClick
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
  
  const variantClasses = {
    primary: "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500",
    success: "bg-success-600 text-white hover:bg-success-700 focus:ring-success-500",
    danger: "bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-500",
    warning: "bg-warning-600 text-white hover:bg-warning-700 focus:ring-warning-500"
  }
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  }

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  )
}
```

## 🚀 Quick Implementation Steps

1. **Install Dependencies**:
   ```bash
   cd apartment-user-portal
   npm install @tabler/icons-react @tabler/core
   ```

2. **Update Tailwind Config** (copy the configuration above)

3. **Create Tabler Components** (copy the component files above)

4. **Update Your Dashboard** (replace with the enhanced version)

5. **Test and Customize**:
   - Test on different screen sizes
   - Customize colors and typography
   - Add more Tabler components as needed

## 🎯 Benefits of This Implementation

- **Modern Design**: Clean, professional interface
- **Better UX**: Improved navigation and interactions
- **Responsive**: Works perfectly on all devices
- **Consistent**: Unified design system
- **Accessible**: Built with accessibility in mind
- **Performance**: Optimized for fast loading

This implementation will give your apartment portal a modern, professional look while maintaining all the functionality you've built!
