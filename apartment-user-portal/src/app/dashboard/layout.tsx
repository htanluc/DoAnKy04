"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import EnhancedLayout from '@/components/layout/enhanced-layout'
import { fetchUserProfile } from '@/lib/api'
import { Skeleton } from '@/components/ui/skeleton'

// Loading component for better UX
function LoadingSpinner() {
  return (
  <div className="min-h-screen flex items-center justify-center bg-brand-gradient-br/10 px-4">
      <div className="text-center animate-fade-in">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-[color:#CCE5FF] border-t-brand-accent rounded-full animate-spin mx-auto mb-6"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-[color:#99CCFF] rounded-full animate-ping opacity-20"></div>
        </div>
        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Đang tải dữ liệu...
          </h2>
          <p className="text-gray-600 max-w-md">
            Vui lòng chờ trong giây lát để chúng tôi chuẩn bị trải nghiệm tốt nhất cho bạn
          </p>
          <div className="flex justify-center space-x-1 mt-4">
            <div className="w-2 h-2 bg-brand-accent rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-brand-accent rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Error component
function ErrorDisplay({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Đã xảy ra lỗi</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Thử lại
        </button>
      </div>
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    
    const loadProfile = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await fetchUserProfile()
        setProfile(data)
      } catch (err) {
        console.error('Error loading profile:', err)
        setError('Không thể tải thông tin người dùng. Vui lòng thử lại.')
        localStorage.removeItem('token')
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [router])

  const handleRetry = () => {
    setError(null)
    setIsLoading(true)
    window.location.reload()
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={handleRetry} />
  }

  return (
    <EnhancedLayout
      user={profile?.user}
      resident={profile?.resident}
      apartment={profile?.apartment}
      roles={profile?.roles}
    >
      <Suspense fallback={
        <div className="space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg border bg-card p-6">
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </div>
      }>
        {children}
      </Suspense>
    </EnhancedLayout>
  )
} 