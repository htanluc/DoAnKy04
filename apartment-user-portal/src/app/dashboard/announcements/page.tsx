"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Bell, 
  Search, 
  Eye, 
  Calendar,
  User,
  AlertTriangle,
  Info,
  Megaphone
} from 'lucide-react'
import type { JSX } from 'react'

interface Announcement {
  id: string
  title: string
  content: string
  type: 'NEWS' | 'REGULAR' | 'URGENT'
  isRead: boolean
  createdAt: string
  createdBy: string
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:8080/api/announcements', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error('Lỗi khi lấy thông báo')
        const data = await res.json()
        setAnnouncements(data)
      } catch (error: any) {
        setError(error.message || 'Lỗi khi lấy thông báo')
      } finally {
        setLoading(false)
      }
    }
    fetchAnnouncements()
  }, [])

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || announcement.type === filterType
    return matchesSearch && matchesType
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'URGENT':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Khẩn cấp
          </span>
        )
      case 'NEWS':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Megaphone className="h-3 w-3 mr-1" />
            Tin tức
          </span>
        )
      case 'REGULAR':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Info className="h-3 w-3 mr-1" />
            Thường
          </span>
        )
      default:
        return null
    }
  }

  const getUnreadCount = () => {
    return announcements.filter(announcement => !announcement.isRead).length
  }

  const markAsRead = (id: string) => {
    setAnnouncements(prev => 
      prev.map(announcement => 
        announcement.id === id 
          ? { ...announcement, isRead: true }
          : announcement
      )
    )
  }

  const markAllAsRead = () => {
    setAnnouncements(prev => 
      prev.map(announcement => ({ ...announcement, isRead: true }))
    )
  }

  if (loading) return <div>Đang tải dữ liệu...</div>
  if (error) return <div className="text-red-500">{error}</div>
  if (!announcements || announcements.length === 0) return <div>Chưa có thông báo nào.</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Thông báo</h1>
              <p className="text-gray-600">Cập nhật thông tin mới nhất từ ban quản lý chung cư</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {getUnreadCount()} thông báo chưa đọc
              </span>
              {getUnreadCount() > 0 && (
                <Button variant="outline" onClick={markAllAsRead}>
                  Đánh dấu tất cả đã đọc
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Tìm kiếm thông báo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterType === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterType('all')}
                >
                  Tất cả
                </Button>
                <Button
                  variant={filterType === 'URGENT' ? 'default' : 'outline'}
                  onClick={() => setFilterType('URGENT')}
                >
                  Khẩn cấp
                </Button>
                <Button
                  variant={filterType === 'NEWS' ? 'default' : 'outline'}
                  onClick={() => setFilterType('NEWS')}
                >
                  Tin tức
                </Button>
                <Button
                  variant={filterType === 'REGULAR' ? 'default' : 'outline'}
                  onClick={() => setFilterType('REGULAR')}
                >
                  Thường
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Announcements List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Danh sách thông báo ({filteredAnnouncements.length})</CardTitle>
                <CardDescription>
                  Các thông báo mới nhất từ ban quản lý
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredAnnouncements.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Không có thông báo nào</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAnnouncements.map((announcement) => (
                      <div 
                        key={announcement.id} 
                        className={`border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer ${
                          !announcement.isRead ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                        onClick={() => {
                          setSelectedAnnouncement(announcement)
                          if (!announcement.isRead) {
                            markAsRead(announcement.id)
                          }
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-lg">{announcement.title}</h3>
                              {getTypeBadge(announcement.type)}
                              {!announcement.isRead && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Mới
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 line-clamp-2 mb-2">
                              {announcement.content}
                            </p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {formatDate(announcement.createdAt)}
                              </span>
                              <span className="flex items-center">
                                <User className="h-4 w-4 mr-1" />
                                {announcement.createdBy}
                              </span>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Detail View */}
          <div className="lg:col-span-1">
            {selectedAnnouncement ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2 mb-2">
                    {getTypeBadge(selectedAnnouncement.type)}
                    {!selectedAnnouncement.isRead && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Mới
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-xl">{selectedAnnouncement.title}</CardTitle>
                  <CardDescription>
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mt-2">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(selectedAnnouncement.createdAt)}
                      </span>
                      <span className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {selectedAnnouncement.createdBy}
                      </span>
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                      {selectedAnnouncement.content}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8">
                  <div className="text-center">
                    <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Chọn một thông báo để xem chi tiết</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 