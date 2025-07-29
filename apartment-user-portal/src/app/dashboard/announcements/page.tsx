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
import { markAnnouncementAsRead, markAllAnnouncementsAsRead, fetchAnnouncements } from '@/lib/api'

// Custom CSS for animations
const customStyles = `
  @keyframes slideInFromRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  .animate-slide-in {
    animation: slideInFromRight 0.3s ease-out;
  }
  
  .animate-fade-in {
    animation: fadeIn 0.3s ease-out;
  }
  
  .announcement-item {
    transition: all 0.2s ease-in-out;
  }
  
  .announcement-item:hover {
    transform: translateY(-1px);
  }
  
  .announcement-item.selected {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
  }
`

interface Announcement {
  id: string
  title: string
  content: string
  type: 'NEWS' | 'REGULAR' | 'URGENT' | 'EVENT'
  read: boolean
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
    return announcements.filter(announcement => !announcement.read).length
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAnnouncementAsRead(id);
      setAnnouncements(prev =>
        prev.map(a => a.id === id ? { ...a, read: true } : a)
      );
      // Trigger event để notify header component
      window.dispatchEvent(new Event('announcements-updated'));
    } catch (e) {
      console.error('Error marking as read:', e);
    }
  };
  
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAnnouncementsAsRead(announcements.filter(a => !a.read).map(a => a.id));
      setAnnouncements(prev => prev.map(a => ({ ...a, read: true })));
      // Trigger event để notify header component
      window.dispatchEvent(new Event('announcements-updated'));
    } catch (e) {}
  };

  if (loading) return <div>Đang tải dữ liệu...</div>
  if (error) return <div className="text-red-500">{error}</div>
  if (!announcements || announcements.length === 0) return <div>Chưa có thông báo nào.</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{customStyles}</style>
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
                <Button variant="outline" onClick={handleMarkAllAsRead}>
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
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4 lg:gap-6">
          {/* List - More compact */}
          <div className="xl:col-span-1 order-2 xl:order-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Danh sách thông báo ({filteredAnnouncements.length})</CardTitle>
                <CardDescription className="text-sm">Các thông báo mới nhất từ ban quản lý</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3 max-h-[400px] xl:max-h-[600px] overflow-y-auto">
                  {filteredAnnouncements.map((announcement) => (
                    <div 
                      key={announcement.id} 
                      className={`announcement-item border rounded-lg p-3 hover:shadow-md cursor-pointer ${
                        selectedAnnouncement?.id === announcement.id 
                          ? 'selected bg-blue-50 border-blue-300 shadow-md' 
                          : !announcement.read 
                            ? 'bg-blue-50 border-blue-200' 
                            : 'hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        setSelectedAnnouncement(announcement)
                        if (!announcement.read) {
                          handleMarkAsRead(announcement.id)
                        }
                      }}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-sm line-clamp-1">{announcement.title}</h3>
                          <Eye className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="flex items-center space-x-2">
                          {getTypeBadge(announcement.type)}
                          {!announcement.read && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Mới
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 text-xs line-clamp-2">
                          {announcement.content}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(announcement.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Details - Larger with animation */}
          <div className="xl:col-span-3 order-1 xl:order-2">
            <Card className="transition-all duration-300 ease-in-out">
              <CardHeader>
                <CardTitle className="text-xl">Chi tiết thông báo</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedAnnouncement ? (
                  <div className="animate-slide-in">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-6">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{selectedAnnouncement.title}</h3>
                      <div className="flex items-center space-x-2">
                        {getTypeBadge(selectedAnnouncement.type)}
                        {!selectedAnnouncement.read && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Mới
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-500 mb-6">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(selectedAnnouncement.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>1 lượt xem</span>
                      </div>
                    </div>
                    <div className="prose max-w-none">
                      <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">
                        {selectedAnnouncement.content}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-16 animate-fade-in">
                    <Bell className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-base sm:text-lg">Chọn một thông báo để xem chi tiết</p>
                    <p className="text-gray-400 text-sm mt-2">Danh sách thông báo sẽ hiển thị bên dưới</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}