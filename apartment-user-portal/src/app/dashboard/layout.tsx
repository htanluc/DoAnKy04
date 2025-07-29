"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'
import { fetchUserProfile } from '@/lib/api'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(true) // Default to open
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

  const toggleMenu = () => {
    console.log('Toggle menu clicked, current state:', isMenuOpen)
    setIsMenuOpen(!isMenuOpen)
  }

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
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        user={profile?.user} 
        resident={profile?.resident}
        apartment={profile?.apartment}
        roles={profile?.roles}
        isOpen={isMenuOpen}
        onToggle={toggleMenu}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden md:ml-0">
        {/* Header */}
        <Header 
          onMenuToggle={toggleMenu}
          isMenuOpen={isMenuOpen}
          user={profile?.user} 
          resident={profile?.resident}
          apartment={profile?.apartment}
          roles={profile?.roles}
        />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
} 