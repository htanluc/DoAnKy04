/// <reference types="react" />

"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Search, 
  Plus, 
  Calendar, 
  Clock, 
  Users,
  CheckCircle,
  XCircle,
  Building,
  MapPin,
  DollarSign
} from 'lucide-react'
import {
  fetchMyFacilityBookings,
  createFacilityBooking,
  cancelFacilityBooking,
  createVNPayPayment,
  createMoMoPayment,
  createZaloPayPayment,
  createVisaPayment
} from '@/lib/api'
import type { FC, JSX } from 'react'

interface Facility {
  id: string
  name: string
  description: string
  location: string
  capacity: number
  usageFee: number
  image?: string
  amenities: string[]
  openingHours?: string
  status: 'AVAILABLE' | 'MAINTENANCE' | 'CLOSED'
}

interface Booking {
  id: string
  facilityId: string
  facilityName: string
  startTime: string
  endTime: string
  date: string
  numberOfPeople: number
  totalCost: number
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  purpose: string
  createdAt: string
}

const FacilityBookingsPage: FC = () => {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null)
  const [newBooking, setNewBooking] = useState({
    date: '',
    startTime: '',
    endTime: '',
    numberOfPeople: 1,
    purpose: ''
  })
  const paymentMethods = [
    { id: 'momo', name: 'MoMo', description: 'Thanh toán qua ví MoMo' },
    { id: 'vnpay', name: 'VNPay', description: 'Thanh toán qua VNPay' },
    { id: 'zalopay', name: 'ZaloPay', description: 'Thanh toán qua ZaloPay' },
    { id: 'visa', name: 'Visa/Mastercard', description: 'Thanh toán thẻ quốc tế' },
  ];
  const [payBefore, setPayBefore] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string>('');
  // State cho lỗi realtime
  const [numberError, setNumberError] = useState<string | null>(null);
  const [timeError, setTimeError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem('token');
        // Lấy danh sách tiện ích
        const resFacilities = await fetch('http://localhost:8080/api/facilities', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        });
        if (!resFacilities.ok) throw new Error('Lỗi khi lấy tiện ích')
        const facilitiesData = await resFacilities.json()
        setFacilities(facilitiesData)

        // Lấy lịch sử đặt chỗ
        const data = await fetchMyFacilityBookings()
        setBookings(data)
      } catch (err: any) {
        setError(err.message || 'Lỗi khi lấy lịch sử đặt tiện ích')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredBookings = bookings.filter((booking: Booking) => {
    const matchesSearch = booking.facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.purpose.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    return timeString
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
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Chờ xác nhận
          </span>
        )
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Đã xác nhận
          </span>
        )
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Đã hủy
          </span>
        )
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Hoàn thành
          </span>
        )
      default:
        return null
    }
  }

  const getFacilityStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Có sẵn
          </span>
        )
      case 'MAINTENANCE':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            Bảo trì
          </span>
        )
      case 'CLOSED':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Đóng cửa
          </span>
        )
      default:
        return null
    }
  }

  const handleBookFacility = (facility: Facility) => {
    setSelectedFacility(facility)
    setShowBookingForm(true)
  }

  const isFacilityTimeOverlap = (facilityId: string, newStart: string, newEnd: string) => {
    return bookings.some(b => {
      if (b.facilityId !== facilityId) return false;
      if (!['PENDING', 'CONFIRMED', 'COMPLETED'].includes(b.status)) return false;
      const bookedStart = new Date(b.startTime).getTime();
      const bookedEnd = new Date(b.endTime).getTime();
      const newStartTime = new Date(newStart).getTime();
      const newEndTime = new Date(newEnd).getTime();
      return (newStartTime < bookedEnd && newEndTime > bookedStart);
    });
  };

  const handleCreateBooking = async () => {
    if (!selectedFacility) return;
    setError(null);
    setSuccess(null);
    setPaymentError('');
    // Kiểm tra số lượng người đặt
    if (newBooking.numberOfPeople > 10) {
      setNumberError('Số lượng người đặt tối đa là 10!');
      return;
    }
    // Kiểm tra overlap thời gian
    const bookingTime = `${newBooking.date}T${newBooking.startTime}:00`;
    const endTime = `${newBooking.date}T${newBooking.endTime}:00`;
    if (isFacilityTimeOverlap(selectedFacility.id, bookingTime, endTime)) {
      setTimeError('Bạn đã có lịch đặt trùng thời gian với tiện ích này!');
      return;
    }
    if (payBefore && selectedPaymentMethod) {
      // Gọi API tạo booking trước, lấy bookingId, rồi gọi API thanh toán
      let bookingRes = null;
      try {
        // Ghép ngày + giờ bắt đầu thành LocalDateTime ISO
        const bookingTime = `${newBooking.date}T${newBooking.startTime}:00`;
        const [startHour, startMinute] = newBooking.startTime.split(":").map(Number);
        const [endHour, endMinute] = newBooking.endTime.split(":").map(Number);
        let duration = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
        if (duration <= 0) duration += 24 * 60;
        const bookingData = {
          facilityId: selectedFacility.id,
          bookingTime,
          duration,
          numberOfPeople: newBooking.numberOfPeople,
          purpose: newBooking.purpose
        };
        // Tạo booking trước
        bookingRes = await createFacilityBooking(bookingData);
        // Giả sử backend trả về bookingId và totalCost
        const bookingId = bookingRes.id || bookingRes.bookingId;
        const amount = bookingRes.totalCost || selectedFacility.usageFee;
        setPaymentLoading(true);
        let data, payUrl;
        if (selectedPaymentMethod === 'vnpay') {
          data = await createVNPayPayment(bookingId, amount, `Thanh toán đặt tiện ích ${selectedFacility.name}`);
          payUrl = data.data?.payUrl || data.data?.payurl;
        } else if (selectedPaymentMethod === 'momo') {
          data = await createMoMoPayment(bookingId, amount, `Thanh toán đặt tiện ích ${selectedFacility.name}`);
          payUrl = data.data?.payUrl || data.data?.payurl;
        } else if (selectedPaymentMethod === 'zalopay') {
          data = await createZaloPayPayment(bookingId, amount, `Thanh toán đặt tiện ích ${selectedFacility.name}`);
          payUrl = data.data?.payUrl || data.data?.payurl;
        } else if (selectedPaymentMethod === 'visa') {
          data = await createVisaPayment(bookingId, amount, `Thanh toán đặt tiện ích ${selectedFacility.name}`);
          payUrl = data.data?.payUrl || data.data?.payurl;
        } else {
          setPaymentError('Phương thức thanh toán không hợp lệ');
          setPaymentLoading(false);
          // Xóa booking nếu tạo booking thành công nhưng không chọn được phương thức thanh toán
          if (bookingRes && bookingRes.id) {
            await cancelFacilityBooking(bookingRes.id);
          }
          return;
        }
        if (payUrl) {
          if (selectedPaymentMethod === 'vnpay') {
            window.location.href = payUrl;
          } else {
            window.open(payUrl, '_blank');
          }
        } else {
          setPaymentError('Không nhận được đường dẫn thanh toán');
          // Xóa booking nếu không lấy được payUrl
          if (bookingRes && bookingRes.id) {
            await cancelFacilityBooking(bookingRes.id);
          }
        }
      } catch (err: any) {
        setPaymentError(err.message || 'Thanh toán thất bại');
        // Xóa booking nếu thanh toán lỗi
        if (bookingRes && bookingRes.id) {
          await cancelFacilityBooking(bookingRes.id);
        }
      } finally {
        setPaymentLoading(false);
      }
      // Sau khi xử lý xong, reload lại danh sách booking
      const data = await fetchMyFacilityBookings();
      setBookings(data);
      return;
    }
    // Nếu không thanh toán trước, chỉ tạo booking như cũ
    try {
      const bookingTime = `${newBooking.date}T${newBooking.startTime}:00`;
      const [startHour, startMinute] = newBooking.startTime.split(":").map(Number);
      const [endHour, endMinute] = newBooking.endTime.split(":").map(Number);
      let duration = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
      if (duration <= 0) duration += 24 * 60;
      const bookingData = {
        facilityId: selectedFacility.id,
        bookingTime,
        duration,
        numberOfPeople: newBooking.numberOfPeople,
        purpose: newBooking.purpose
      };
      await createFacilityBooking(bookingData);
      setSuccess('Đặt tiện ích thành công!');
      const data = await fetchMyFacilityBookings();
      setBookings(data);
    } catch (err: any) {
      setError(err.message || 'Đặt tiện ích thất bại');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    setError(null)
    setSuccess(null)
    try {
      await cancelFacilityBooking(bookingId)
      setSuccess('Hủy đặt tiện ích thành công!')
      // Refresh bookings
      const data = await fetchMyFacilityBookings()
      setBookings(data)
    } catch (err: any) {
      setError(err.message || 'Hủy đặt tiện ích thất bại')
    }
  }

  const getPendingBookings = () => {
    return bookings.filter(booking => booking.status === 'PENDING').length
  }

  const getConfirmedBookings = () => {
    return bookings.filter(booking => booking.status === 'CONFIRMED').length
  }

  const getTotalSpent = () => {
    return bookings
      .filter(booking => booking.status === 'COMPLETED')
      .reduce((total, booking) => total + booking.totalCost, 0)
  }

  // Định dạng ngày giờ dd/MM/yyyy HH:mm:ss
  const formatDateTime = (dateString: string) => {
    if (!dateString) return '---';
    const d = new Date(dateString);
    return d.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const isFacilityBooked = (facilityId: string) => {
    return bookings.some(
      (b) => b.facilityId === facilityId && ['PENDING', 'CONFIRMED', 'COMPLETED'].includes(b.status)
    );
  };

  // Hàm kiểm tra realtime số lượng
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setNewBooking(prev => ({ ...prev, numberOfPeople: value }));
    if (value > 10) {
      setNumberError('Số lượng người đặt tối đa là 10!');
    } else {
      setNumberError(null);
    }
  };

  // Hàm kiểm tra realtime thời gian
  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    setNewBooking(prev => ({ ...prev, [field]: value }));
    // Kiểm tra overlap nếu đã có đủ thông tin
    const date = newBooking.date;
    const start = field === 'startTime' ? value : newBooking.startTime;
    const end = field === 'endTime' ? value : newBooking.endTime;
    if (date && start && end) {
      const bookingTime = `${date}T${start}:00`;
      const endTime = `${date}T${end}:00`;
      if (isFacilityTimeOverlap(selectedFacility?.id || '', bookingTime, endTime)) {
        setTimeError('Bạn đã có lịch đặt trùng thời gian với tiện ích này!');
      } else {
        setTimeError(null);
      }
    } else {
      setTimeError(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Đặt tiện ích</h1>
              <p className="text-gray-600">Đặt và quản lý các tiện ích của chung cư</p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng đặt chỗ</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.length}</div>
              <p className="text-xs text-muted-foreground">
                Tổng số lần đặt
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chờ xác nhận</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getPendingBookings()}</div>
              <p className="text-xs text-muted-foreground">
                Đặt chỗ chờ xác nhận
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đã xác nhận</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getConfirmedBookings()}</div>
              <p className="text-xs text-muted-foreground">
                Đặt chỗ đã xác nhận
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng chi tiêu</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(getTotalSpent())}</div>
              <p className="text-xs text-muted-foreground">
                Tổng chi phí đã sử dụng
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Facilities Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Tiện ích có sẵn</CardTitle>
            <CardDescription>
              Các tiện ích có thể đặt trong chung cư
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {facilities.map((facility) => (
                <Card key={facility.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      {getFacilityStatusBadge(facility.status)}
                    </div>
                    <CardTitle className="text-lg">{facility.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {facility.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {facility.location}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        Sức chứa: {facility.capacity} người
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2" />
                        {formatCurrency(facility.usageFee)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        {facility.openingHours ?? '---'}
                      </div>
                      
                      <div className="pt-3">
                        <Button 
                          className="w-full"
                          onClick={() => handleBookFacility(facility)}
                          disabled={facility.status !== 'AVAILABLE' || isFacilityBooked(facility.id)}
                        >
                          {facility.status !== 'AVAILABLE' ? 'Không khả dụng' : isFacilityBooked(facility.id) ? 'Đã đặt' : 'Đặt ngay'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Booking Form */}
        {showBookingForm && selectedFacility && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Đặt {selectedFacility.name}</CardTitle>
              <CardDescription>
                Điền thông tin đặt chỗ
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày đặt
                    </label>
                    <Input
                      type="date"
                      value={newBooking.date}
                      onChange={(e) => setNewBooking(prev => ({ ...prev, date: e.target.value }))}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số người
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max={selectedFacility.capacity}
                      value={newBooking.numberOfPeople}
                      onChange={handleNumberChange}
                    />
                    {numberError && <div className="text-red-500 text-xs mt-1">{numberError}</div>}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giờ bắt đầu
                    </label>
                    <Input
                      type="time"
                      min={selectedFacility.openingHours ?? ''}
                      max={selectedFacility.openingHours ?? ''}
                      value={newBooking.startTime}
                      onChange={e => handleTimeChange('startTime', e.target.value)}
                    />
                    {timeError && <div className="text-red-500 text-xs mt-1">{timeError}</div>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giờ kết thúc
                    </label>
                    <Input
                      type="time"
                      min={selectedFacility.openingHours ?? ''}
                      max={selectedFacility.openingHours ?? ''}
                      value={newBooking.endTime}
                      onChange={e => handleTimeChange('endTime', e.target.value)}
                    />
                    {timeError && <div className="text-red-500 text-xs mt-1">{timeError}</div>}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mục đích sử dụng
                  </label>
                  <Input
                    placeholder="Nhập mục đích sử dụng..."
                    value={newBooking.purpose}
                    onChange={(e) => setNewBooking(prev => ({ ...prev, purpose: e.target.value }))}
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="payBefore" checked={payBefore} onChange={e => setPayBefore(e.target.checked)} />
                  <label htmlFor="payBefore">Thanh toán trước khi đặt chỗ</label>
                </div>
                {payBefore && (
                  <div className="space-y-2">
                    <div>Chọn cổng thanh toán:</div>
                    <div className="flex gap-2">
                      {paymentMethods.map(method => (
                        <Button
                          key={method.id}
                          variant={selectedPaymentMethod === method.id ? 'default' : 'outline'}
                          onClick={() => setSelectedPaymentMethod(method.id)}
                        >
                          {method.name}
                        </Button>
                      ))}
                    </div>
                    {paymentError && <div className="text-red-500 text-sm">{paymentError}</div>}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button 
                    onClick={handleCreateBooking}
                    disabled={!newBooking.date || !newBooking.startTime || !newBooking.endTime || !newBooking.purpose || (payBefore && !selectedPaymentMethod) || paymentLoading || !!numberError || !!timeError}
                  >
                    {paymentLoading ? 'Đang xử lý...' : 'Đặt chỗ'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowBookingForm(false)}>
                    Hủy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Tìm kiếm đặt chỗ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterStatus === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('all')}
                >
                  Tất cả
                </Button>
                <Button
                  variant={filterStatus === 'PENDING' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('PENDING')}
                >
                  Chờ xác nhận
                </Button>
                <Button
                  variant={filterStatus === 'CONFIRMED' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('CONFIRMED')}
                >
                  Đã xác nhận
                </Button>
                <Button
                  variant={filterStatus === 'COMPLETED' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('COMPLETED')}
                >
                  Hoàn thành
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <Card>
          <CardHeader>
            <CardTitle>Lịch sử đặt chỗ ({filteredBookings.length})</CardTitle>
            <CardDescription>
              Các lần đặt tiện ích của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredBookings.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Không có lịch sử đặt chỗ nào</p>
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
                          </div>
                          
                          <h3 className="text-lg font-semibold mb-2">{booking.facilityName}</h3>
                          <p className="text-gray-600 mb-3">{booking.purpose}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500 mb-3">
                            <div>
                              <span className="font-medium">Bắt đầu:</span> {formatDateTime(booking.startTime)}
                            </div>
                            <div>
                              <span className="font-medium">Kết thúc:</span> {formatDateTime(booking.endTime)}
                            </div>
                            <div>
                              <span className="font-medium">Thời gian sử dụng:</span> {booking.startTime && booking.endTime ? `${Math.round((new Date(booking.endTime).getTime() - new Date(booking.startTime).getTime()) / 60000)} phút` : '---'}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="text-lg font-semibold text-green-600">
                              {formatCurrency(booking.totalCost)}
                            </div>
                            <div className="text-sm text-gray-500">
                              Đặt lúc: {formatDate(booking.createdAt)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          
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
    </div>
  )
}

export default FacilityBookingsPage 