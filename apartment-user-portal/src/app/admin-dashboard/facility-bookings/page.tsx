"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Calendar, 
  Clock, 
  Users,
  CheckCircle,
  XCircle,
  Eye,
  DollarSign,
  CreditCard,
  Wallet
} from 'lucide-react'

interface FacilityBooking {
  id: string
  facilityId: string
  facilityName: string
  startTime: string
  endTime: string
  numberOfPeople: number
  totalCost: number
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED'
  purpose: string
  createdAt: string
  paymentStatus?: string
  paymentMethod?: string
  paymentDate?: string
  transactionId?: string
  userName: string
}

const paymentMethods = [
  { id: 'CASH', name: 'Tiền mặt', icon: <DollarSign className="h-4 w-4" /> },
  { id: 'BANK_TRANSFER', name: 'Chuyển khoản', icon: <CreditCard className="h-4 w-4" /> },
  { id: 'MOMO', name: 'MoMo', icon: <Wallet className="h-4 w-4" /> },
  { id: 'VNPAY', name: 'VNPay', icon: <CreditCard className="h-4 w-4" /> },
  { id: 'ZALOPAY', name: 'ZaloPay', icon: <Wallet className="h-4 w-4" /> },
  { id: 'VISA', name: 'Visa/Mastercard', icon: <CreditCard className="h-4 w-4" /> },
]

export default function AdminFacilityBookingsPage() {
  const [bookings, setBookings] = useState<FacilityBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('all')
  const [selectedBooking, setSelectedBooking] = useState<FacilityBooking | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('')
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/admin/facility-bookings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      }
    } catch (error) {
      console.error('Error fetching bookings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updatePaymentStatus = async () => {
    if (!selectedBooking || !selectedPaymentStatus) return
    
    setUpdating(true)
    try {
      const response = await fetch(`http://localhost:8080/api/admin/facility-bookings/${selectedBooking.id}/payment-status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          paymentStatus: selectedPaymentStatus,
          ...(selectedPaymentMethod && { paymentMethod: selectedPaymentMethod })
        })
      })
      
      if (response.ok) {
        await fetchBookings()
        setShowPaymentModal(false)
        setSelectedBooking(null)
        setSelectedPaymentMethod('')
        setSelectedPaymentStatus('')
      }
    } catch (error) {
      console.error('Error updating payment status:', error)
    } finally {
      setUpdating(false)
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = booking.facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.purpose.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus
    const matchesPaymentStatus = filterPaymentStatus === 'all' || booking.paymentStatus === filterPaymentStatus
    return matchesSearch && matchesStatus && matchesPaymentStatus
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ xác nhận</Badge>
      case 'CONFIRMED':
        return <Badge className="bg-green-100 text-green-800">Đã xác nhận</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800">Bị từ chối</Badge>
      case 'CANCELLED':
        return <Badge className="bg-gray-100 text-gray-800">Đã hủy</Badge>
      case 'COMPLETED':
        return <Badge className="bg-blue-100 text-blue-800">Hoàn thành</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-green-100 text-green-800">Đã thanh toán</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ thanh toán</Badge>
      case 'FAILED':
        return <Badge className="bg-red-100 text-red-800">Thất bại</Badge>
      case 'REFUNDED':
        return <Badge className="bg-blue-100 text-blue-800">Đã hoàn tiền</Badge>
      case 'CANCELLED':
        return <Badge className="bg-gray-100 text-gray-800">Đã hủy</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status || 'Chưa có'}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý đặt tiện ích</h1>
          <p className="text-gray-600">Quản lý và theo dõi tất cả đặt tiện ích của cư dân</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Tìm kiếm theo tên tiện ích, cư dân, mục đích..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  aria-label="Lọc theo trạng thái booking"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="PENDING">Chờ xác nhận</option>
                  <option value="CONFIRMED">Đã xác nhận</option>
                  <option value="REJECTED">Bị từ chối</option>
                  <option value="CANCELLED">Đã hủy</option>
                  <option value="COMPLETED">Hoàn thành</option>
                </select>
                <select
                  value={filterPaymentStatus}
                  onChange={(e) => setFilterPaymentStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  aria-label="Lọc theo trạng thái thanh toán"
                >
                  <option value="all">Tất cả thanh toán</option>
                  <option value="PENDING">Chờ thanh toán</option>
                  <option value="PAID">Đã thanh toán</option>
                  <option value="FAILED">Thất bại</option>
                  <option value="REFUNDED">Đã hoàn tiền</option>
                  <option value="CANCELLED">Đã hủy</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <Card>
          <CardHeader>
            <CardTitle>Danh sách đặt tiện ích ({filteredBookings.length})</CardTitle>
            <CardDescription>
              Quản lý tất cả đặt tiện ích và trạng thái thanh toán
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredBookings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Không có đặt tiện ích nào</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((booking) => (
                  <Card key={booking.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getStatusBadge(booking.status)}
                            {getPaymentStatusBadge(booking.paymentStatus || 'PENDING')}
                          </div>
                          
                          <h3 className="text-lg font-semibold mb-2">{booking.facilityName}</h3>
                          <p className="text-gray-600 mb-3">{booking.purpose}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500 mb-3">
                            <div>
                              <span className="font-medium">Cư dân:</span> {booking.userName}
                            </div>
                            <div>
                              <span className="font-medium">Bắt đầu:</span> {formatDateTime(booking.startTime)}
                            </div>
                            <div>
                              <span className="font-medium">Kết thúc:</span> {formatDateTime(booking.endTime)}
                            </div>
                            <div>
                              <span className="font-medium">Số người:</span> {booking.numberOfPeople}
                            </div>
                            <div>
                              <span className="font-medium">Đặt lúc:</span> {formatDate(booking.createdAt)}
                            </div>
                            <div>
                              <span className="font-medium">Chi phí:</span> {formatCurrency(booking.totalCost)}
                            </div>
                          </div>
                          
                          {/* Payment Information */}
                          {booking.paymentStatus === 'PAID' && (
                            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                              <div className="text-sm text-green-800">
                                <div>Phương thức: {booking.paymentMethod || '---'}</div>
                                <div>Ngày thanh toán: {booking.paymentDate ? formatDateTime(booking.paymentDate) : '---'}</div>
                                {booking.transactionId && <div>Mã giao dịch: {booking.transactionId}</div>}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedBooking(booking)
                              setSelectedPaymentStatus(booking.paymentStatus || 'PENDING')
                              setSelectedPaymentMethod(booking.paymentMethod || '')
                              setShowPaymentModal(true)
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Quản lý thanh toán
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment Management Modal */}
      {showPaymentModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Quản lý thanh toán</h3>
            <p className="text-sm text-gray-600 mb-4">
              Tiện ích: {selectedBooking.facilityName}<br/>
              Cư dân: {selectedBooking.userName}<br/>
              Chi phí: {formatCurrency(selectedBooking.totalCost)}
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trạng thái thanh toán
                </label>
                <select
                  value={selectedPaymentStatus}
                  onChange={(e) => setSelectedPaymentStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  aria-label="Chọn trạng thái thanh toán"
                >
                  <option value="PENDING">Chờ thanh toán</option>
                  <option value="PAID">Đã thanh toán</option>
                  <option value="FAILED">Thất bại</option>
                  <option value="REFUNDED">Đã hoàn tiền</option>
                  <option value="CANCELLED">Đã hủy</option>
                </select>
              </div>
              
              {selectedPaymentStatus === 'PAID' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phương thức thanh toán
                  </label>
                  <select
                    value={selectedPaymentMethod}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    aria-label="Chọn phương thức thanh toán"
                  >
                    <option value="">Chọn phương thức</option>
                    {paymentMethods.map(method => (
                      <option key={method.id} value={method.id}>
                        {method.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 mt-6">
              <Button
                onClick={updatePaymentStatus}
                disabled={updating}
                className="flex-1"
              >
                {updating ? 'Đang cập nhật...' : 'Cập nhật'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowPaymentModal(false)
                  setSelectedBooking(null)
                  setSelectedPaymentMethod('')
                  setSelectedPaymentStatus('')
                }}
                className="flex-1"
              >
                Hủy
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
