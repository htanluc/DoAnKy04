"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Calendar, 
  Search, 
  MapPin, 
  Clock, 
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  Star
} from 'lucide-react'
import { registerEvent, cancelEventRegistrationByEventId } from '@/lib/api'
import type { JSX } from 'react'

// Custom CSS for animations
const customStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideInFromLeft {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
  }
  
  @keyframes shimmer {
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: calc(200px + 100%) 0;
    }
  }
  
  .animate-fade-in-up {
    animation: fadeInUp 0.6s ease-out;
  }
  
  .animate-slide-in-left {
    animation: slideInFromLeft 0.5s ease-out;
  }
  
  .animate-pulse-slow {
    animation: pulse 2s infinite;
  }
  
  .event-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform-origin: center;
  }
  
  .event-card:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
  
  .event-card.registered {
    border: 2px solid #10b981;
    background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
  }
  
  .event-card.ongoing {
    border: 2px solid #f59e0b;
    background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%);
    animation: pulse 2s infinite;
  }
  
  .event-card.upcoming {
    border: 2px solid #3b82f6;
    background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
  }
  
  .status-badge {
    transition: all 0.2s ease;
  }
  
  .status-badge:hover {
    transform: scale(1.1);
  }
  
  .summary-card {
    transition: all 0.3s ease;
    background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  }
  
  .summary-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  }
  
  .loading-shimmer {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200px 100%;
    animation: shimmer 1.5s infinite;
  }
`

interface Event {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  createdAt: string;
  participantCount: number;
  registered: boolean; // Changed from isRegistered to match backend
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const hasFetched = useRef(false)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:8080/api/events', {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Lỗi khi lấy sự kiện')
      const data = await res.json()
      setEvents(data)
      hasFetched.current = true
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Prevent multiple API calls
    if (hasFetched.current) return
    fetchEvents()
  }, [fetchEvents])

  const getEventStatus = useCallback((event: Event) => {
    const now = new Date();
    const [startDatePart, startTimePart] = event.startTime.split(' ');
    const [startYear, startMonth, startDay] = startDatePart.split('-');
    const [startHour, startMinute] = startTimePart.split(':');
    const startTime = new Date(parseInt(startYear), parseInt(startMonth) - 1, parseInt(startDay), parseInt(startHour), parseInt(startMinute));
    
    const [endDatePart, endTimePart] = event.endTime.split(' ');
    const [endYear, endMonth, endDay] = endDatePart.split('-');
    const [endHour, endMinute] = endTimePart.split(':');
    const endTime = new Date(parseInt(endYear), parseInt(endMonth) - 1, parseInt(endDay), parseInt(endHour), parseInt(endMinute));
    
    if (now > endTime) {
      return 'COMPLETED';
    } else if (now >= startTime && now <= endTime) {
      return 'ONGOING';
    } else {
      return 'UPCOMING';
    }
  }, [])

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.location.toLowerCase().includes(searchTerm.toLowerCase())
      const eventStatus = getEventStatus(event)
      const matchesStatus = filterStatus === 'all' || eventStatus === filterStatus
      
      return matchesSearch && matchesStatus
    })
  }, [events, searchTerm, filterStatus, getEventStatus])

  const formatDate = useCallback((dateString: string) => {
    // Parse format "yyyy-MM-dd HH:mm:ss"
    const [datePart] = dateString.split(' ');
    const [year, month, day] = datePart.split('-');
    return `${day}/${month}/${year}`;
  }, [])

  const formatTime = useCallback((dateString: string) => {
    // Parse format "yyyy-MM-dd HH:mm:ss"
    const [datePart, timePart] = dateString.split(' ');
    const [hours, minutes] = timePart.split(':');
    return `${hours}:${minutes}`;
  }, [])

  const formatDateTime = useCallback((dateString: string) => {
    // Parse format "yyyy-MM-dd HH:mm:ss"
    const [datePart, timePart] = dateString.split(' ');
    const [year, month, day] = datePart.split('-');
    const [hours, minutes] = timePart.split(':');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }, [])

  const isSameDay = useCallback((startTime: string, endTime: string) => {
    const [startDatePart] = startTime.split(' ');
    const [endDatePart] = endTime.split(' ');
    return startDatePart === endDatePart;
  }, [])

  const getStatusBadge = useCallback((status: string) => {
    switch (status) {
      case 'UPCOMING':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1" />
            Sắp diễn ra
          </span>
        )
      case 'ONGOING':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Đang diễn ra
          </span>
        )
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Đã kết thúc
          </span>
        )
      default:
        return null
    }
  }, [])

  const handleRegister = useCallback(async (eventId: string) => {
    setError(null)
    setSuccess(null)
    try {
      await registerEvent({ eventId: parseInt(eventId) })
      setSuccess('Đăng ký sự kiện thành công!')
      // Refresh data to get updated registration status
      hasFetched.current = false
      fetchEvents()
    } catch (err: any) {
      if (err.message.includes('đã đăng ký')) {
        setSuccess('Bạn đã đăng ký sự kiện này rồi!')
        // Refresh data to get updated registration status
        hasFetched.current = false
        fetchEvents()
      } else {
        setError(err.message || 'Đăng ký sự kiện thất bại')
      }
    }
  }, [fetchEvents])

  const handleUnregister = useCallback(async (eventId: string) => {
    setError(null)
    setSuccess(null)
    try {
      await cancelEventRegistrationByEventId(eventId)
      setSuccess('Hủy đăng ký sự kiện thành công!')
      // Refresh data to get updated registration status
      hasFetched.current = false
      fetchEvents()
    } catch (err: any) {
      setError(err.message || 'Hủy đăng ký sự kiện thất bại')
    }
  }, [fetchEvents])

  const getUpcomingEvents = useMemo(() => {
    return events.filter(event => getEventStatus(event) === 'UPCOMING').length
  }, [events, getEventStatus])

  const getRegisteredEvents = useMemo(() => {
    return events.filter(event => event.registered).length
  }, [events])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <style>{customStyles}</style>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-fade-in-up">
            <div className="mb-8">
              <div className="loading-shimmer h-8 w-64 rounded mb-2"></div>
              <div className="loading-shimmer h-4 w-96 rounded"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="summary-card p-6 rounded-lg border">
                  <div className="loading-shimmer h-4 w-24 rounded mb-2"></div>
                  <div className="loading-shimmer h-8 w-16 rounded mb-1"></div>
                  <div className="loading-shimmer h-3 w-32 rounded"></div>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="event-card p-6 rounded-lg border">
                  <div className="loading-shimmer h-4 w-20 rounded mb-2"></div>
                  <div className="loading-shimmer h-6 w-48 rounded mb-3"></div>
                  <div className="loading-shimmer h-3 w-full rounded mb-2"></div>
                  <div className="loading-shimmer h-3 w-3/4 rounded mb-2"></div>
                  <div className="loading-shimmer h-3 w-1/2 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  if (!events || events.length === 0) {
    return <div>Chưa có sự kiện nào.</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{customStyles}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <Sparkles className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">Sự kiện & Cộng đồng</h1>
              </div>
              <p className="text-gray-600 text-lg">Tham gia các sự kiện và hoạt động cộng đồng của chung cư</p>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-sm text-gray-500">Cộng đồng năng động</span>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="summary-card animate-slide-in-left" style={{animationDelay: '0.1s'}}>
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Tổng sự kiện</CardTitle>
                <Calendar className="h-5 w-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-1">{filteredEvents.length}</div>
                <p className="text-xs text-gray-500 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Tổng số sự kiện
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="summary-card animate-slide-in-left" style={{animationDelay: '0.2s'}}>
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Sắp diễn ra</CardTitle>
                <Clock className="h-5 w-5 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-1">{getUpcomingEvents}</div>
                <p className="text-xs text-gray-500 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Sự kiện sắp diễn ra
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="summary-card animate-slide-in-left" style={{animationDelay: '0.3s'}}>
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">Đã đăng ký</CardTitle>
                <Users className="h-5 w-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-1">{getRegisteredEvents}</div>
                <p className="text-xs text-gray-500 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Sự kiện đã đăng ký
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Tìm kiếm sự kiện..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('all')}
                  className="transition-all duration-200 hover:scale-105"
                >
                  Tất cả
                </Button>
                <Button
                  variant={filterStatus === 'UPCOMING' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('UPCOMING')}
                  className="transition-all duration-200 hover:scale-105"
                >
                  Sắp diễn ra
                </Button>
                <Button
                  variant={filterStatus === 'ONGOING' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('ONGOING')}
                  className="transition-all duration-200 hover:scale-105"
                >
                  Đang diễn ra
                </Button>
                <Button
                  variant={filterStatus === 'COMPLETED' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('COMPLETED')}
                  className="transition-all duration-200 hover:scale-105"
                >
                  Đã kết thúc
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events List */}
        <div className="animate-fade-in-up" style={{animationDelay: '0.5s'}}>
          {filteredEvents.length === 0 ? (
            <Card className="text-center py-16">
              <div className="animate-pulse-slow">
                <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">Không có sự kiện nào</p>
                <p className="text-gray-400 text-sm">Hãy thử thay đổi bộ lọc hoặc tìm kiếm</p>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event, index) => {
                const eventStatus = getEventStatus(event)
                const cardClass = `event-card ${
                  event.registered ? 'registered' : 
                  eventStatus === 'ONGOING' ? 'ongoing' : 
                  eventStatus === 'UPCOMING' ? 'upcoming' : ''
                }`
                
                return (
                  <Card 
                    key={event.id} 
                    className={cardClass}
                    style={{animationDelay: `${0.6 + index * 0.1}s`}}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="status-badge">
                          {getStatusBadge(eventStatus)}
                        </div>
                        {event.registered && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-pulse-slow">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Đã đăng ký
                          </span>
                        )}
                      </div>
                      <CardTitle className="text-lg font-bold text-gray-900 mb-2">{event.title}</CardTitle>
                      <CardDescription className="line-clamp-3 text-gray-600">
                        {event.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {isSameDay(event.startTime, event.endTime) ? (
                          <>
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="h-4 w-4 mr-3 text-blue-500" />
                              <span className="font-medium">{formatDate(event.startTime)}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="h-4 w-4 mr-3 text-orange-500" />
                              <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center text-sm text-gray-600">
                              <Calendar className="h-4 w-4 mr-3 text-blue-500" />
                              <span className="font-medium">Từ: {formatDateTime(event.startTime)}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-600">
                              <Clock className="h-4 w-4 mr-3 text-orange-500" />
                              <span className="font-medium">Đến: {formatDateTime(event.endTime)}</span>
                            </div>
                          </>
                        )}
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-3 text-red-500" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="h-4 w-4 mr-3 text-green-500" />
                          <span>{event.participantCount} người tham gia</span>
                        </div>
                        {eventStatus === 'UPCOMING' && (
                          <div className="pt-4">
                            {event.registered ? (
                              <Button 
                                variant="outline" 
                                className="w-full transition-all duration-200 hover:bg-red-50 hover:border-red-300 hover:text-red-700"
                                onClick={() => handleUnregister(event.id)}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Hủy đăng ký
                              </Button>
                            ) : (
                              <Button 
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105"
                                onClick={() => handleRegister(event.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Đăng ký tham gia
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 