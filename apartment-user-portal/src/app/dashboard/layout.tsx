"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import OptimizedDashboard from '@/components/ui/optimized-dashboard'
import { fetchUserProfile } from '@/lib/api'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    
    fetchUserProfile()
      .then((data) => {
        setProfile(data)
        setIsLoading(false)
      })
      .catch(() => {
        localStorage.removeItem('token')
        router.push('/login')
      })
  }, [router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-lg font-semibold text-gray-700 mb-2">
            Đang tải dữ liệu...
          </div>
          <div className="text-sm text-gray-500">
            Vui lòng chờ trong giây lát
          </div>
        </div>
      </div>
    )
  }

  return (
    <OptimizedDashboard 
      user={profile?.user} 
      resident={profile?.resident} 
      apartment={profile?.apartment} 
      roles={profile?.roles}
    >
      {children}
    </OptimizedDashboard>
  )
} 