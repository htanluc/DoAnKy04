"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/sidebar'
import Header from '@/components/layout/header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Kiểm tra token khi component mount
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    // Validate token với backend
    fetch('http://localhost:8080/api/auth/validate', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const data = await res.json()
        if (!res.ok || !data.success) {
          // Token không hợp lệ, xóa và redirect
          localStorage.removeItem('token')
          router.push('/login')
        } else {
          setIsLoading(false)
        }
      })
      .catch(() => {
        // Lỗi kết nối, xóa token và redirect
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
      <Sidebar />
      
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
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        <Header onMenuToggle={handleMenuToggle} isMenuOpen={isMenuOpen} />
        
        <main className="pt-16 min-h-screen">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
} 