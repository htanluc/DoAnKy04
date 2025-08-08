'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Download, Filter, Search } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface ActivityLog {
  logId: number
  userId: number
  actionType: string
  actionTypeDisplayName: string
  description: string
  timestamp: string
  username: string
  userFullName: string
}

interface ActivityLogResponse {
  success: boolean
  message: string
  data: {
    content: ActivityLog[]
    totalElements: number
    totalPages: number
    currentPage: number
    size: number
  }
}

const actionTypeOptions = [
  { value: 'LOGIN', label: 'Đăng nhập' },
  { value: 'LOGOUT', label: 'Đăng xuất' },
  { value: 'PASSWORD_CHANGE', label: 'Đổi mật khẩu' },
  { value: 'VIEW_INVOICE', label: 'Xem hóa đơn' },
  { value: 'DOWNLOAD_INVOICE', label: 'Tải hóa đơn' },
  { value: 'PAY_INVOICE', label: 'Thanh toán hóa đơn' },
  { value: 'REGISTER_VEHICLE', label: 'Đăng ký xe' },
  { value: 'UPDATE_VEHICLE', label: 'Cập nhật thông tin xe' },
  { value: 'DELETE_VEHICLE', label: 'Xóa thông tin xe' },
  { value: 'CREATE_FACILITY_BOOKING', label: 'Đặt tiện ích' },
  { value: 'UPDATE_FACILITY_BOOKING', label: 'Cập nhật đặt tiện ích' },
  { value: 'CANCEL_FACILITY_BOOKING', label: 'Hủy đặt tiện ích' },
  { value: 'VIEW_ANNOUNCEMENT', label: 'Xem thông báo' },
  { value: 'VIEW_EVENT', label: 'Xem sự kiện' },
  { value: 'CREATE_SUPPORT_REQUEST', label: 'Tạo yêu cầu hỗ trợ' },
  { value: 'UPDATE_SUPPORT_REQUEST', label: 'Cập nhật yêu cầu hỗ trợ' },
  { value: 'SUBMIT_FEEDBACK', label: 'Gửi phản hồi' }
]

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [pageSize, setPageSize] = useState(20)
  
  // Filters
  const [selectedActionType, setSelectedActionType] = useState<string>('all')
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()
  const [searchTerm, setSearchTerm] = useState('')

  const fetchActivityLogs = async () => {
    try {
      setLoading(true)
      setError('')

      const token = localStorage.getItem('token')
      if (!token) {
        setError('Vui lòng đăng nhập')
        return
      }

      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: pageSize.toString()
      })

      if (selectedActionType && selectedActionType !== 'all') {
        params.append('actionType', selectedActionType)
      }
      if (startDate) {
        params.append('startDate', startDate.toISOString())
      }
      if (endDate) {
        params.append('endDate', endDate.toISOString())
      }

      const response = await fetch(`/api/activity-logs/my?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Không thể tải dữ liệu')
      }

      const data: ActivityLogResponse = await response.json()
      
      if (data.success) {
        setLogs(data.data.content)
        setTotalPages(data.data.totalPages)
        setTotalElements(data.data.totalElements)
      } else {
        setError(data.message || 'Có lỗi xảy ra')
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }

  const exportLogs = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Vui lòng đăng nhập')
        return
      }

      // Build query parameters for export
      const params = new URLSearchParams()
      if (selectedActionType && selectedActionType !== 'all') {
        params.append('actionType', selectedActionType)
      }
      if (startDate) {
        params.append('startDate', startDate.toISOString())
      }
      if (endDate) {
        params.append('endDate', endDate.toISOString())
      }

      const response = await fetch(`/api/activity-logs/my/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Không thể xuất dữ liệu')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `activity-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi xuất dữ liệu')
    }
  }

  const clearFilters = () => {
    setSelectedActionType('all')
    setStartDate(undefined)
    setEndDate(undefined)
    setSearchTerm('')
    setCurrentPage(0)
  }

  const getStatusBadge = (actionType: string) => {
    const action = actionTypeOptions.find(option => option.value === actionType)
    if (!action) return <Badge variant="secondary">{actionType}</Badge>

    // Color coding based on action type
    if (actionType.includes('PAY') || actionType.includes('SUCCESS')) {
      return <Badge variant="default" className="bg-green-500">{action.label}</Badge>
    } else if (actionType.includes('CREATE') || actionType.includes('REGISTER')) {
      return <Badge variant="default" className="bg-blue-500">{action.label}</Badge>
    } else if (actionType.includes('UPDATE')) {
      return <Badge variant="default" className="bg-yellow-500">{action.label}</Badge>
    } else if (actionType.includes('DELETE') || actionType.includes('CANCEL')) {
      return <Badge variant="destructive">{action.label}</Badge>
    } else if (actionType.includes('VIEW') || actionType.includes('LOGIN')) {
      return <Badge variant="secondary">{action.label}</Badge>
    } else {
      return <Badge variant="outline">{action.label}</Badge>
    }
  }

  useEffect(() => {
    fetchActivityLogs()
  }, [currentPage, pageSize, selectedActionType, startDate, endDate])

  const filteredLogs = logs.filter(log =>
    searchTerm === '' || 
    log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.actionTypeDisplayName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Nhật ký hoạt động</h1>
          <p className="text-muted-foreground">
            Theo dõi các hoạt động của bạn trong hệ thống
          </p>
        </div>
        <Button onClick={exportLogs} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Xuất CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Bộ lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tìm kiếm</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo mô tả..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Loại hoạt động</label>
              <Select value={selectedActionType} onValueChange={setSelectedActionType}>
                <SelectTrigger>
                  <SelectValue placeholder="Tất cả loại hoạt động" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại hoạt động</SelectItem>
                  {actionTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Từ ngày</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd/MM/yyyy") : "Chọn ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    locale={vi}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Đến ngày</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd/MM/yyyy") : "Chọn ngày"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    locale={vi}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={clearFilters} variant="outline">
              Xóa bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity Logs */}
      <Card>
        <CardHeader>
          <CardTitle>
            Hoạt động ({totalElements} bản ghi)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Không có hoạt động nào được tìm thấy
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div
                  key={log.logId}
                  className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusBadge(log.actionType)}
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm', { locale: vi })}
                      </span>
                    </div>
                    <p className="text-sm">{log.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
              >
                Trước
              </Button>
              
              <span className="text-sm">
                Trang {currentPage + 1} / {totalPages}
              </span>
              
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
              >
                Sau
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 