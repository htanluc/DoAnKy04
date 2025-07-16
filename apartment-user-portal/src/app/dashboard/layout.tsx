"use client"

import React, { useState, useEffect, isValidElement, cloneElement } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'
import { fetchUserProfile } from '@/lib/api'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
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

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar user={profile?.user} resident={profile?.resident} apartment={profile?.apartment} roles={profile?.roles} />
      
      {/* Mobile overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
      
      {/* Mobile sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:hidden
        ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar user={profile?.user} resident={profile?.resident} apartment={profile?.apartment} roles={profile?.roles} />
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        <Header user={profile?.user} resident={profile?.resident} apartment={profile?.apartment} roles={profile?.roles} onMenuToggle={handleMenuToggle} isMenuOpen={isMenuOpen} />
        
        <main className="h-full flex flex-col flex-1">
          <div className="pt-0 px-6 pb-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 