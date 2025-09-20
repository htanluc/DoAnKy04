"use client"

import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    <span className="ml-2 text-gray-600">Đang tải...</span>
  </div>
)

// Lazy load heavy components
export const LazyInvoiceDetail = dynamic(
  () => import('@/app/dashboard/invoices/[id]/page'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
)

export const LazyEventDetail = dynamic(
  () => import('@/app/dashboard/events/[id]/page'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
)

export const LazyFacilityBooking = dynamic(
  () => import('@/app/dashboard/facility-bookings/page'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
)

export const LazySupportRequests = dynamic(
  () => import('@/app/dashboard/support-requests/page'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
)

export const LazyAnnouncements = dynamic(
  () => import('@/app/dashboard/announcements/page'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
)

export const LazyEvents = dynamic(
  () => import('@/app/dashboard/events/page'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
)

export const LazyInvoices = dynamic(
  () => import('@/app/dashboard/invoices/page'),
  {
    loading: () => <LoadingSpinner />,
    ssr: false
  }
)

// Lazy load charts and heavy UI components
export const LazyRecharts = dynamic(
  () => import('recharts').then(mod => ({ default: mod.ResponsiveContainer })),
  {
    loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded" />,
    ssr: false
  }
)

export const LazyCalendar = dynamic(
  () => import('react-day-picker').then(mod => ({ default: mod.DayPicker })),
  {
    loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded" />,
    ssr: false
  }
)

// Wrapper component for Suspense
export const SuspenseWrapper = ({ children, fallback }: { children: React.ReactNode, fallback?: React.ReactNode }) => (
  <Suspense fallback={fallback || <LoadingSpinner />}>
    {children}
  </Suspense>
)
