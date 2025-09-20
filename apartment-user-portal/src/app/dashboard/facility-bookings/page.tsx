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
  DollarSign,
  Eye,
  CalendarDays,
  QrCode,
  Sparkles,
  TrendingUp,
  Star,
  Zap,
  Target,
  RefreshCw
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
import { apiClient } from '@/lib/api-client'
import type { FC, JSX } from 'react'

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
  
  @keyframes slideInFromRight {
    from {
      opacity: 0;
      transform: translateX(30px);
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
  
  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
      transform: translate3d(0,0,0);
    }
    40%, 43% {
      transform: translate3d(0, -30px, 0);
    }
    70% {
      transform: translate3d(0, -15px, 0);
    }
    90% {
      transform: translate3d(0, -4px, 0);
    }
  }
  
  .animate-fade-in-up {
    animation: fadeInUp 0.6s ease-out;
  }
  
  .animate-slide-in-left {
    animation: slideInFromLeft 0.5s ease-out;
  }
  
  .animate-slide-in-right {
    animation: slideInFromRight 0.5s ease-out;
  }
  
  .animate-pulse-slow {
    animation: pulse 2s infinite;
  }
  
  .animate-bounce-slow {
    animation: bounce 2s infinite;
  }
  
  .facility-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform-origin: center;
  }
  
  .facility-card:hover {
    transform: translateY(-8px) scale(1.02);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
  
  .facility-card.available {
    border: 2px solid #10b981;
    background: linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%);
  }
  
  .facility-card.maintenance {
    border: 2px solid #f59e0b;
    background: linear-gradient(135deg, #fffbeb 0%, #ffffff 100%);
  }
  
  .facility-card.closed {
    border: 2px solid #ef4444;
    background: linear-gradient(135deg, #fef2f2 0%, #ffffff 100%);
  }
  
  .booking-card {
    transition: all 0.3s ease;
  }
  
  .booking-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
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
  
  .time-slot {
    transition: all 0.2s ease;
  }
  
  .time-slot:hover {
    transform: scale(1.05);
  }
  
  .time-slot.available {
    background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  }
  
  .time-slot.booked {
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  }
  
  .time-slot.partial {
    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  }
  
  .time-slot.passed {
    background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  }
`

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
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED'
  purpose: string
  createdAt: string
  qrCode?: string
  qrExpiresAt?: string
  checkedInCount?: number
  maxCheckins?: number
  // Payment fields
  paymentStatus?: string
  paymentMethod?: string
  paymentDate?: string
  transactionId?: string
}

interface HourlyAvailability {
  hour: number
  usedCapacity: number
  availableCapacity: number
  isAvailable: boolean
  bookingCount: number
}

interface FacilityAvailability {
  facilityId: string
  facilityName: string
  totalCapacity: number
  date: string
  hourlyData: HourlyAvailability[]
}

const FacilityBookingsPage: FC = () => {
  const todayStr = (() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showBookingForm, setShowBookingForm] = useState(false)
  const [showAvailability, setShowAvailability] = useState(false)
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null)
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })
  const [availability, setAvailability] = useState<FacilityAvailability | null>(null)
  const [newBooking, setNewBooking] = useState({
    date: '',
    startTime: '',
    endTime: '',
    numberOfPeople: 1,
    purpose: '',
    duration: 60
  })
  // Range select state (multi-hour selection)
  const [rangeStartHour, setRangeStartHour] = useState<number | null>(null)
  const [rangeEndHour, setRangeEndHour] = useState<number | null>(null)
  const [rangeError, setRangeError] = useState<string | null>(null)
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
  const [showAddToSlotModal, setShowAddToSlotModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{hour: number, availableCapacity: number} | null>(null);
  const [dateError, setDateError] = useState<string | null>(null);
  const [userSelectedDate, setUserSelectedDate] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem('token');
        // Lấy danh sách tiện ích sử dụng API client
             try {
               const facilitiesData = await apiClient.getFacilities()
               console.log('Facilities Data:', facilitiesData) // Debug log
               console.log('First facility usageFee:', facilitiesData[0]?.usageFee) // Debug log
               console.log('First facility openingHours:', facilitiesData[0]?.openingHours) // Debug log
               setFacilities(facilitiesData)
             } catch (facilityError) {
          console.error('Error fetching facilities:', facilityError)
          // Fallback data từ database đã có
          const fallbackFacilities = [
            {
              id: '1',
              name: 'Phòng Gym Premium',
              description: 'Phòng tập thể dục với đầy đủ thiết bị hiện đại, có huấn luyện viên chuyên nghiệp',
              location: 'Tầng 1 - Tòa A',
              capacity: 30,
              usageFee: 80000,
              image: '',
              amenities: ['Máy chạy bộ', 'Tạ tay', 'Xe đạp tập'],
              openingHours: '06:00 - 22:00',
              status: 'AVAILABLE'
            },
            {
              id: '2',
              name: 'Hồ bơi Olympic',
              description: 'Hồ bơi ngoài trời với view đẹp, có cứu hộ chuyên nghiệp',
              location: 'Khu vực ngoài trời - Tầng trệt',
              capacity: 50,
              usageFee: 120000,
              image: '',
              amenities: ['Hồ bơi 25m', 'Khu vực trẻ em', 'Ghế nằm'],
              openingHours: '05:00 - 21:00',
              status: 'AVAILABLE'
            },
            {
              id: '3',
              name: 'Sân tennis chuyên nghiệp',
              description: 'Sân tennis ngoài trời chất lượng cao với đèn chiếu sáng',
              location: 'Khu vực ngoài trời - Tầng trệt',
              capacity: 8,
              usageFee: 100000,
              image: '',
              amenities: ['Sân tennis tiêu chuẩn', 'Đèn chiếu sáng', 'Ghế ngồi'],
              openingHours: '06:00 - 22:00',
              status: 'AVAILABLE'
            },
            {
              id: '4',
              name: 'Sân bóng rổ',
              description: 'Sân bóng rổ ngoài trời với đèn chiếu sáng',
              location: 'Khu vực ngoài trời - Tầng trệt',
              capacity: 20,
              usageFee: 60000,
              image: '',
              amenities: ['Sân bóng rổ tiêu chuẩn', 'Đèn chiếu sáng'],
              openingHours: '06:00 - 22:00',
              status: 'AVAILABLE'
            },
            {
              id: '5',
              name: 'Phòng sinh hoạt cộng đồng',
              description: 'Phòng đa năng cho các hoạt động cộng đồng, tiệc tùng',
              location: 'Tầng 1 - Tòa C',
              capacity: 100,
              usageFee: 30000,
              image: '',
              amenities: ['Sân khấu', 'Hệ thống âm thanh', 'Bàn ghế'],
              openingHours: '08:00 - 22:00',
              status: 'AVAILABLE'
            },
            {
              id: '6',
              name: 'Phòng họp đa năng',
              description: 'Phòng họp đa năng cho cư dân, có máy chiếu và âm thanh',
              location: 'Tầng 2 - Tòa B',
              capacity: 40,
              usageFee: 50000,
              image: '',
              amenities: ['Máy chiếu', 'Hệ thống âm thanh', 'Bàn ghế'],
              openingHours: '08:00 - 20:00',
              status: 'AVAILABLE'
            }
          ]
          setFacilities(fallbackFacilities)
        }

        // Lấy lịch sử đặt chỗ
        const data = await fetchMyFacilityBookings()
        console.log('Facility bookings data:', data) // Debug log
        setBookings(data)
      } catch (err: any) {
        setError(err.message || 'Lỗi khi lấy lịch sử đặt tiện ích')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Fetch availability khi chọn facility và date
  useEffect(() => {
    if (selectedFacility && selectedDate) {
      fetchAvailability(selectedFacility.id, selectedDate);
    }
  }, [selectedFacility, selectedDate]);

  // Khi chọn ngày ở form đặt lịch, cập nhật ngày xem lịch (chỉ khi đang trong form booking)
  useEffect(() => {
    if (showBookingForm && newBooking.date && newBooking.date !== selectedDate) {
      setSelectedDate(newBooking.date);
    }
  }, [newBooking.date, showBookingForm]);

  const fetchAvailability = async (facilityId: string, date: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/facilities/${facilityId}/availability?date=${date}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      });
      if (response.ok) {
        const data = await response.json();
        console.log('API Availability Response:', data); // Debug log để xem API trả về gì
        setAvailability(data);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const clearRange = () => {
    setRangeStartHour(null)
    setRangeEndHour(null)
    setRangeError(null)
  }

  const isHourSelectable = (hour: number) => {
    if (!availability) return false
    const slot = availability.hourlyData.find(h => h.hour === hour)
    if (!slot) return false
    if (isTimeSlotPassed(hour, selectedDate)) return false
    if (!isWithinOperatingHours(hour, selectedFacility!)) return false
    return getAvailableForBooking(slot) > 0
  }

  const handleSelectHour = (hour: number) => {
    if (!isHourSelectable(hour)) return
    setRangeError(null)
    setTimeError(null) // Clear error khi chọn slot mới
    // First selection
    if (rangeStartHour === null) {
      setRangeStartHour(hour)
      setRangeEndHour(null)
      return
    }
    // If selecting lại đúng mốc bắt đầu -> hiểu là đặt 1 giờ duy nhất
    if (rangeStartHour === hour) {
      setRangeEndHour(hour)
      return
    }
    // Second selection defines end (INCLUSIVE last slot).
    const start = Math.min(rangeStartHour, hour)
    const endExclusive = Math.max(rangeStartHour, hour) + 1
    // Opening hours hard-guard for same-day windows
    if (selectedFacility?.openingHours) {
      const [startStr, endStr] = selectedFacility.openingHours.split(' - ')
      if (startStr && endStr) {
        const [oh] = startStr.split(':').map(Number)
        const [ch] = endStr.split(':').map(Number)
        if (oh <= ch) {
          if (start < oh || endExclusive > ch) {
            setRangeError(`Khoảng giờ vượt quá khung phục vụ (${selectedFacility.openingHours}).`)
            return
          }
        }
      }
    }
    // Validate availability cho từng giờ trong [start, endExclusive) - sử dụng capacity cho booking mới
    const invalid = availability!.hourlyData.some(h => h.hour >= start && h.hour < endExclusive && (!h.isAvailable || getAvailableForBooking(h) <= 0 || isTimeSlotPassed(h.hour, selectedDate) || !isWithinOperatingHours(h.hour, selectedFacility!)))
    if (invalid) {
      setRangeError('Khoảng giờ đã chọn có giờ không khả dụng. Vui lòng chọn lại.')
      return
    }
    setRangeStartHour(start)
    setRangeEndHour(endExclusive - 1) // lưu giờ cuối (bắt đầu) để hiển thị, nhưng logic coi là inclusive
  }

  const confirmRangeBooking = () => {
    if (rangeStartHour === null || rangeEndHour === null || !selectedFacility) return
    const startTime = `${rangeStartHour.toString().padStart(2, '0')}:00`
    const endHourForTime = (rangeEndHour + 1)
    const endTime = `${endHourForTime.toString().padStart(2, '0')}:00`
    const duration = (endHourForTime - rangeStartHour) * 60
    setShowBookingForm(true)
    setNewBooking(prev => ({
      ...prev,
      date: selectedDate,
      startTime,
      endTime,
      duration,
    }))
    // Scroll to booking form
    setTimeout(() => {
      const form = document.getElementById('booking-form')
      if (form) form.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

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
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Bị từ chối
          </span>
        )
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <XCircle className="h-3 w-3 mr-1" />
            Đã hủy
          </span>
        )
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Hoàn thành
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        )
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
    setNewBooking(prev => ({ ...prev, date: selectedDate, duration: 60 }))
  }

  const handleViewAvailability = (facility: Facility) => {
    setSelectedFacility(facility);
    setShowAvailability(true);
    // Sử dụng ngày đã chọn (nếu người dùng đã chọn) hoặc ngày hiện tại
    const dateToUse = userSelectedDate ? selectedDate : todayStr;
    setSelectedDate(dateToUse);
    setNewBooking(prev => ({ ...prev, date: dateToUse, duration: 60 }));
    // Fetch availability cho ngày đã chọn
    fetchAvailability(facility.id, dateToUse);
    
    // Scroll đến phần lịch sau khi modal mở
    setTimeout(() => {
      const availabilitySection = document.getElementById('availability-section');
      if (availabilitySection) {
        availabilitySection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const isFacilityTimeOverlap = (facilityId: string, newStart: string, newEnd: string) => {
    return bookings.some(b => {
      if (b.facilityId !== facilityId) return false;
      // Chỉ kiểm tra conflict với booking PENDING (chờ xác nhận)
      // CONFIRMED booking cho phép đặt thêm trong cùng khung giờ
      if (b.status !== 'PENDING') return false;
      
      const bookedStart = new Date(b.startTime).getTime();
      const newStartTime = new Date(newStart).getTime();
      
      // Chỉ kiểm tra trùng slot bắt đầu
      // Không kiểm tra overlap duration để cho phép booking liên tiếp
      return Math.abs(newStartTime - bookedStart) < 60000; // Chênh lệch < 1 phút
    });
  };

  const isTimeSlotPassed = (hour: number, date: string) => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    
    // Tạo datetime cho slot cần kiểm tra
    const slotDateTime = new Date(`${date}T${hour.toString().padStart(2, '0')}:00:00`);
    
    // So sánh trực tiếp datetime
    return slotDateTime < now;
  };

  const isWithinOperatingHours = (hour: number, facility: Facility) => {
    if (!facility.openingHours) return true; // Nếu không có giờ hoạt động, cho phép tất cả
    
    const hours = facility.openingHours.split(' - ');
    if (hours.length !== 2) return true; // Format không đúng, cho phép tất cả
    
    const startHour = parseInt(hours[0].split(':')[0]);
    const endHour = parseInt(hours[1].split(':')[0]);
    
    // Xử lý trường hợp qua đêm (ví dụ: 22:00 - 06:00)
    if (startHour > endHour) {
      return hour >= startHour || hour < endHour;
    } else {
      return hour >= startHour && hour < endHour;
    }
  };

  const getSlotColor = (hour: HourlyAvailability, date: string) => {
    // Nếu thời gian đã qua, hiển thị xám
    if (isTimeSlotPassed(hour.hour, date)) {
      return 'bg-gray-300 text-gray-500 cursor-not-allowed';
    }
    
    // Nếu ngoài giờ hoạt động, ẩn slot
    if (!isWithinOperatingHours(hour.hour, selectedFacility!)) {
      return 'hidden';
    }
    
    // Logic màu sắc cho slot còn hiệu lực
    // Tính lại used/available để phản ánh các booking đang có và lựa chọn hiện tại
    const overlayUsed = getAdjustedUsedCapacity(hour.hour)
    const baseTotal = hour.usedCapacity + hour.availableCapacity
    const adjustedAvailable = Math.max(0, baseTotal - overlayUsed)

    if (adjustedAvailable === 0) {
      return 'bg-red-200 text-red-800 cursor-not-allowed';
    } else if (adjustedAvailable < (baseTotal / 2)) {
      return 'bg-yellow-200 text-yellow-800 cursor-pointer hover:bg-yellow-300';
    } else {
      return 'bg-green-200 text-green-800 cursor-pointer hover:bg-green-300';
    }
  };

  // Tính usedCapacity đã điều chỉnh: used từ API + các booking thực tế bao phủ giờ này + vùng chọn tạm
  const getAdjustedUsedCapacity = (hourValue: number) => {
    const hourStart = new Date(`${selectedDate}T${hourValue.toString().padStart(2, '0')}:00:00`).getTime()
    const hourEnd = new Date(`${selectedDate}T${(hourValue + 1).toString().padStart(2, '0')}:00:00`).getTime()
    let overlay = 0
    
    // Backend API đã tính đúng capacity cho tất cả slots, frontend không cần overlay thêm nữa
    // Chỉ giữ lại logic cho range selection tạm thời của user
    
    // Chỉ cộng vùng chọn tạm thời khi đã chọn đủ khoảng (bao gồm ô cuối)
    if (rangeStartHour !== null && rangeEndHour !== null) {
      const start = Math.min(rangeStartHour, rangeEndHour)
      const endEx = Math.max(rangeStartHour, rangeEndHour) + 1
      if (hourValue >= start && hourValue < endEx) {
        overlay += newBooking.numberOfPeople || 1
      }
    }
    // Nếu chỉ chọn 1 mốc bắt đầu, cộng overlay cho đúng ô đó
    else if (rangeStartHour !== null && rangeEndHour === null) {
      if (hourValue === rangeStartHour) overlay += newBooking.numberOfPeople || 1
    }
    
    // usedCapacity cơ bản từ API cho giờ này
    const baseUsed = availability?.hourlyData.find(h => h.hour === hourValue)?.usedCapacity || 0
    
    console.log(`Hour ${hourValue}: baseUsed=${baseUsed}, overlay=${overlay}, final=${baseUsed + overlay}`) // Debug log
    
    // Backend API đã tính đúng, frontend chỉ thêm overlay cho range selection tạm thời
    const finalUsed = baseUsed + overlay
    return finalUsed
  }

  // Tính số booking thực tế bao phủ giờ này
  const getHourlyBookingCount = (hourValue: number) => {
    const hourStart = new Date(`${selectedDate}T${hourValue.toString().padStart(2, '0')}:00:00`).getTime()
    let count = 0
    
    if (selectedFacility) {
      // Chỉ đếm booking PENDING để hiển thị số blocking
      const activeBookings = bookings.filter(booking => 
        booking.facilityId.toString() === selectedFacility.id.toString() && 
        booking.status === 'PENDING'
      )
      
      for (const booking of activeBookings) {
        if (booking.startTime && booking.endTime) {
          const bookingStart = new Date(booking.startTime).getTime()
          const bookingEnd = new Date(booking.endTime).getTime()
          
          // Kiểm tra nếu booking bao phủ giờ này
          if (bookingStart <= hourStart && bookingEnd > hourStart) {
            count++
          }
        }
      }
    }
    
    // Cộng thêm booking tạm thời nếu có
    if (rangeStartHour !== null && rangeEndHour !== null) {
      const start = Math.min(rangeStartHour, rangeEndHour)
      const endEx = Math.max(rangeStartHour, rangeEndHour) + 1
      if (hourValue >= start && hourValue < endEx) {
        count += 1
      }
    } else if (rangeStartHour !== null && rangeEndHour === null) {
      if (hourValue === rangeStartHour) count += 1
    }
    
    console.log(`Hour ${hourValue} booking count: ${count}`) // Debug log
    return count
  }

  // Tính capacity bị block bởi booking PENDING (cho validation booking mới)  
  const getBlockedCapacity = (hourValue: number) => {
    const hourStart = new Date(`${selectedDate}T${hourValue.toString().padStart(2, '0')}:00:00`).getTime()
    let blocked = 0
    
    if (selectedFacility) {
      const pendingBookings = bookings.filter(booking => 
        booking.facilityId.toString() === selectedFacility.id.toString() && 
        booking.status === 'PENDING'
      )
      
      for (const booking of pendingBookings) {
        if (booking.startTime && booking.endTime) {
          const bookingStart = new Date(booking.startTime).getTime()
          const bookingEnd = new Date(booking.endTime).getTime()
          const bookingStartHour = new Date(booking.startTime).getHours()
          
          // Kiểm tra nếu booking bao phủ giờ này
          if (bookingStart <= hourStart && bookingEnd > hourStart) {
            // Nếu đây KHÔNG phải slot bắt đầu, cộng vào blocked
            if (hourValue !== bookingStartHour) {
              blocked += booking.numberOfPeople || 1
            }
          }
        }
      }
    }
    
    // Cộng thêm blocked từ range selection
    if (rangeStartHour !== null && rangeEndHour !== null) {
      const start = Math.min(rangeStartHour, rangeEndHour)
      const endEx = Math.max(rangeStartHour, rangeEndHour) + 1
      if (hourValue >= start && hourValue < endEx) {
        blocked += newBooking.numberOfPeople || 1
      }
    } else if (rangeStartHour !== null && rangeEndHour === null) {
      if (hourValue === rangeStartHour) blocked += newBooking.numberOfPeople || 1
    }
    
    return blocked
  }

  // Tính availableCapacity cho booking mới (chỉ bị block bởi PENDING)
  const getAvailableForBooking = (hour: HourlyAvailability) => {
    const blockedCapacity = getBlockedCapacity(hour.hour)
    const baseUsed = hour.usedCapacity
    const baseTotal = hour.usedCapacity + hour.availableCapacity
    const adjustedAvailable = Math.max(0, baseTotal - baseUsed - blockedCapacity)
    return adjustedAvailable
  }

  // Tính availableCapacity đã điều chỉnh cho hiển thị (tất cả bookings)
  const getAdjustedAvailableCapacity = (hour: HourlyAvailability) => {
    const overlayUsed = getAdjustedUsedCapacity(hour.hour)
    const baseTotal = hour.usedCapacity + hour.availableCapacity
    const adjustedAvailable = Math.max(0, baseTotal - overlayUsed)
    return adjustedAvailable
  }

  const handleAddToSlot = (hour: number, availableCapacity: number) => {
    // Không cho phép đặt slot đã qua
    if (isTimeSlotPassed(hour, selectedDate)) {
      return;
    }
    
    // Sử dụng available capacity cho booking mới
    const hourData = availability?.hourlyData.find(h => h.hour === hour)
    const adjustedCapacity = hourData ? getAvailableForBooking(hourData) : 0
    
    setSelectedSlot({ hour, availableCapacity: adjustedCapacity });
    setShowAddToSlotModal(true);
    setNewBooking(prev => ({
      ...prev,
      date: selectedDate,
      startTime: `${hour.toString().padStart(2, '0')}:00`,
      endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
      numberOfPeople: 1
    }));
  };

  const handleCreateBooking = async () => {
    if (!selectedFacility) return;
    setError(null);
    setSuccess(null);
    setPaymentError('');
    
    // Kiểm tra số lượng người đặt
    if (newBooking.numberOfPeople > selectedFacility.capacity) {
      setNumberError(`Số lượng người đặt tối đa là ${selectedFacility.capacity}!`);
      return;
    }
    
    // Kiểm tra slot còn trống nếu đặt thêm
    if (selectedSlot && newBooking.numberOfPeople > selectedSlot.availableCapacity) {
      setNumberError(`Slot này chỉ còn ${selectedSlot.availableCapacity} chỗ trống!`);
      return;
    }
    
    // Kiểm tra thời gian đã qua - validation chính xác
    const bookingTime = `${newBooking.date}T${newBooking.startTime}:00`;
    const endTime = `${newBooking.date}T${newBooking.endTime}:00`;
    const now = new Date();
    const bookingStart = new Date(bookingTime);
    const bookingEnd = new Date(endTime);
    
    if (bookingStart < now) {
      setTimeError('Không thể đặt lịch cho thời gian đã qua!');
      return;
    }
    
    if (bookingEnd < now) {
      setTimeError('Thời gian kết thúc không thể trong quá khứ!');
      return;
    }
    
    // Kiểm tra overlap thời gian (chỉ kiểm tra slot bắt đầu)
    if (isFacilityTimeOverlap(selectedFacility.id, bookingTime, endTime)) {
      setTimeError('Bạn đã có lịch đặt chờ xác nhận trùng thời gian này!');
      return;
    }

    // Validate within operating hours ở bước submit (phòng trường hợp bypass)
    if (selectedFacility.openingHours) {
      const [startStr, endStr] = selectedFacility.openingHours.split(' - ')
      if (startStr && endStr) {
        const [oh, om] = startStr.split(':').map(Number)
        const [ch, cm] = endStr.split(':').map(Number)
        const openMin = oh * 60 + (om || 0)
        const closeMin = ch * 60 + (cm || 0)
        const [sh, sm] = newBooking.startTime.split(':').map(Number)
        const [eh, em] = newBooking.endTime.split(':').map(Number)
        const selStartMin = sh * 60 + (sm || 0)
        const selEndMin = eh * 60 + (em || 0)
        if (oh <= ch) {
          if (selStartMin < openMin || selEndMin > closeMin) {
            setTimeError(`Thời gian chọn vượt quá khung phục vụ (${selectedFacility.openingHours}).`)
            return
          }
        } else {
          const inWindow = (selStartMin >= openMin || selEndMin <= closeMin)
          if (!inWindow) {
            setTimeError(`Thời gian chọn vượt quá khung phục vụ (${selectedFacility.openingHours}).`)
            return
          }
        }
      }
    }
    
    // Tạo booking
    try {
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
      const successMessage = showAddToSlotModal 
        ? `Đặt thêm ${newBooking.numberOfPeople} người cho slot ${selectedSlot?.hour}:00 thành công!`
        : 'Đặt tiện ích thành công!';
      setSuccess(successMessage);
      const data = await fetchMyFacilityBookings();
      setBookings(data);
      // Refresh availability
      if (selectedFacility && newBooking.date) {
        fetchAvailability(selectedFacility.id, newBooking.date);
      }
      // Đóng modal nếu đang đặt thêm
      if (showAddToSlotModal) {
        setShowAddToSlotModal(false);
        setSelectedSlot(null);
      }
      // Reset form nếu đặt mới
      if (!showAddToSlotModal) {
        setShowBookingForm(false);
        setNewBooking({
          date: '',
          startTime: '',
          endTime: '',
          numberOfPeople: 1,
          purpose: '',
          duration: 0
        });
      }
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
      // Refresh availability nếu đang xem
      if (selectedFacility && selectedDate) {
        fetchAvailability(selectedFacility.id, selectedDate);
      }
    } catch (err: any) {
      setError(err.message || 'Hủy đặt tiện ích thất bại')
    }
  }
  
  // Xử lý thanh toán
  const handlePayment = async (bookingId: string, paymentMethod: string) => {
    setError(null)
    setSuccess(null)
    setPaymentLoading(true)
    
    try {
      // Bước 1: Khởi tạo thanh toán để lấy thông tin payment
      const initiateResponse = await fetch(`http://localhost:8080/api/facility-bookings/${bookingId}/initiate-payment?paymentMethod=${paymentMethod}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (!initiateResponse.ok) {
        const errorData = await initiateResponse.json()
        throw new Error(errorData.message || 'Khởi tạo thanh toán thất bại')
      }
      
      const paymentInfo = await initiateResponse.json()
      
      // Bước 2: Gọi payment gateway (VNPay) với return URL tùy chỉnh cho facility booking
      const gatewayResponse = await fetch(`http://localhost:8080/api/payments/vnpay/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: paymentInfo.orderId,
          amount: paymentInfo.amount,
          orderInfo: paymentInfo.orderInfo,
          invoiceId: null, // Không phải invoice
          returnUrl: paymentInfo.returnUrl // Sử dụng return URL tùy chỉnh
        })
      })
      
      if (!gatewayResponse.ok) {
        const errorData = await gatewayResponse.json()
        throw new Error(errorData.message || 'Tạo thanh toán gateway thất bại')
      }
      
      const gatewayData = await gatewayResponse.json()
      
      if (gatewayData.success && gatewayData.data && gatewayData.data.paymentUrl) {
        // Chuyển hướng đến trang thanh toán
        window.location.href = gatewayData.data.paymentUrl
      } else {
        throw new Error('Không thể tạo URL thanh toán')
      }
      
    } catch (err: any) {
      setError(err.message || 'Thanh toán thất bại')
    } finally {
      setPaymentLoading(false)
    }
  }

  const getPendingBookings = () => {
    return bookings.filter(booking => booking.status === 'PENDING').length
  }

  const getConfirmedBookings = () => {
    return bookings.filter(booking => booking.status === 'CONFIRMED').length
  }

  const getRejectedBookings = () => {
    return bookings.filter(booking => booking.status === 'REJECTED').length
  }

  const getTotalSpent = () => {
    return bookings
      .filter(booking => booking.status === 'COMPLETED')
      .reduce((total, booking) => total + booking.totalCost, 0)
  }

  // Định dạng ngày giờ dd/MM/yyyy HH:mm:ss
  const formatDateTime = (dateString: string) => {
    if (!dateString) return '---';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return '---';
      return d.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return '---';
    }
  };

  const isFacilityBooked = (facilityId: string) => {
    return bookings.some(
      (b) => b.facilityId === facilityId && ['PENDING', 'CONFIRMED'].includes(b.status) // Bỏ COMPLETED và REJECTED
    );
  };

  // Hàm kiểm tra realtime số lượng
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    // Clear error khi user thay đổi số người
    setNumberError(null);
    setTimeError(null);
    setNewBooking(prev => ({ ...prev, numberOfPeople: value }));
    if (selectedFacility && value > selectedFacility.capacity) {
      setNumberError(`Số lượng người đặt tối đa là ${selectedFacility.capacity}!`);
    } else {
      setNumberError(null);
    }
  };

  // Hàm kiểm tra realtime thời gian
  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    // Clear error ngay khi user bắt đầu thay đổi thời gian
    setTimeError(null);
    setNewBooking(prev => ({ ...prev, [field]: value }));
    const date = newBooking.date;
    const start = field === 'startTime' ? value : newBooking.startTime;
    const end = field === 'endTime' ? value : newBooking.endTime;
    if (date && start && end && selectedFacility) {
      const bookingTime = `${date}T${start}:00`;
      const endTime = `${date}T${end}:00`;
      
      // Kiểm tra thời gian đã qua - so sánh datetime chính xác
      const now = new Date();
      const bookingStart = new Date(bookingTime);
      if (bookingStart < now) {
        setTimeError('Không thể chọn thời gian quá khứ!');
        return;
      }
      
      // Kiểm tra thời gian kết thúc đã qua
      const bookingEnd = new Date(endTime);
      if (bookingEnd < now) {
        setTimeError('Thời gian kết thúc không thể trong quá khứ!');
        return;
      }
      
      // Check duration >= 30 minutes
      const [sh, sm] = start.split(":").map(Number);
      const [eh, em] = end.split(":").map(Number);
      let duration = (eh * 60 + em) - (sh * 60 + sm);
      if (duration <= 0) duration += 24 * 60; // Handle overnight bookings
      if (duration < 30) {
        setTimeError('Thời gian đặt tối thiểu là 30 phút!');
        return;
      }

      // Validate within operating hours
      if (selectedFacility.openingHours) {
        const [startStr, endStr] = selectedFacility.openingHours.split(' - ')
        if (startStr && endStr) {
          const [oh, om] = startStr.split(':').map(Number)
          const [ch, cm] = endStr.split(':').map(Number)
          const openMin = oh * 60 + (om || 0)
          const closeMin = ch * 60 + (cm || 0)
          const selStartMin = sh * 60 + (sm || 0)
          const selEndMin = eh * 60 + (em || 0)
          if (oh <= ch) {
            // same day window
            if (selStartMin < openMin || selEndMin > closeMin) {
              setTimeError(`Thời gian chọn vượt quá khung phục vụ (${selectedFacility.openingHours}).`)
              return
            }
          } else {
            // overnight window (e.g., 22:00 - 06:00) → đơn giản: từ open..24h hoặc 0..close
            const inWindow = (selStartMin >= openMin || selEndMin <= closeMin)
            if (!inWindow) {
              setTimeError(`Thời gian chọn vượt quá khung phục vụ (${selectedFacility.openingHours}).`)
              return
            }
          }
        }
      }
      
      if (isFacilityTimeOverlap(selectedFacility.id, bookingTime, endTime)) {
        setTimeError('Bạn đã có lịch đặt chờ xác nhận trùng thời gian này!');
      } else {
        setTimeError(null);
      }
    } else {
      setTimeError(null);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSelectedDate = e.target.value;
    // Clear error khi user thay đổi ngày
    setTimeError(null);
    setDateError(null);
    setSelectedDate(newSelectedDate);
    setNewBooking(prev => ({ ...prev, date: newSelectedDate, duration: 60 }));
    setUserSelectedDate(true); // Đánh dấu người dùng đã chọn ngày
    
    // Kiểm tra ngày đã qua
    if (newSelectedDate < todayStr) {
      setDateError('Không thể chọn ngày trong quá khứ!');
      return;
    }
    
    setDateError(null);
    
    // Fetch availability cho ngày mới
    if (selectedFacility) {
      fetchAvailability(selectedFacility.id, newSelectedDate);
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
            
            {/* Error Message */}
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Có lỗi xảy ra</h3>
                  <div className="mt-2 text-sm text-red-700">
                    {error}
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => window.location.reload()}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                      Thử lại
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
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
          
          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Thành công!</h3>
                  <div className="mt-1 text-sm text-green-700">
                    {success}
                  </div>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => setSuccess(null)}
                    className="inline-flex text-green-400 hover:text-green-500 transition-colors"
                    aria-label="Đóng thông báo thành công"
                    title="Đóng thông báo thành công"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Có lỗi xảy ra</h3>
                  <div className="mt-1 text-sm text-red-700">
                    {error}
                  </div>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => setError(null)}
                    className="inline-flex text-red-400 hover:text-red-500 transition-colors"
                    aria-label="Đóng thông báo lỗi"
                    title="Đóng thông báo lỗi"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
          {dateError && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center">
                <svg className="h-4 w-4 text-amber-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-amber-700">{dateError}</span>
              </div>
            </div>
          )}
          {timeError && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center">
                <svg className="h-4 w-4 text-amber-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-amber-700">{timeError}</span>
              </div>
            </div>
          )}
          {numberError && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center">
                <svg className="h-4 w-4 text-amber-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-amber-700">{numberError}</span>
              </div>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
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
              <CardTitle className="text-sm font-medium">Bị từ chối</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getRejectedBookings()}</div>
              <p className="text-xs text-muted-foreground">
                Đặt chỗ bị từ chối
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

        {/* Date Selector */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Chọn ngày:</label>
              <Input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                min={todayStr}
                className="w-48"
              />
              {dateError && <div className="text-red-500 text-xs mt-1">{dateError}</div>}
            </div>
          </CardContent>
        </Card>

        {/* Facilities Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Tiện ích có sẵn</CardTitle>
            <CardDescription>
              Các tiện ích có thể đặt trong chung cư
            </CardDescription>
          </CardHeader>
          <CardContent>
            {facilities.length === 0 ? (
              <div className="text-center py-12">
                <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Không có tiện ích nào</h3>
                <p className="text-gray-600 mb-4">Hiện tại chưa có tiện ích nào được cấu hình trong hệ thống.</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tải lại
                </Button>
              </div>
            ) : (
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
                          onClick={() => handleViewAvailability(facility)}
                          disabled={facility.status !== 'AVAILABLE'}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Xem lịch
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

        {/* Availability View */}
        {showAvailability && selectedFacility && availability && (
          <Card className="mb-6" id="availability-section">
            <CardHeader>
              <CardTitle>Lịch {selectedFacility.name} - {formatDate(selectedDate)}</CardTitle>
              <CardDescription>
                Sức chứa theo từng giờ trong ngày - Có thể đặt thêm người vào slot đã có booking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-6 md:grid-cols-12 gap-2">
                {availability.hourlyData.map((hour) => (
                  <div
                    key={hour.hour}
                    className={`p-3 rounded-lg text-center transition-colors ${getSlotColor(hour, selectedDate)} ${
                      rangeStartHour !== null && rangeEndHour !== null && hour.hour >= Math.min(rangeStartHour, rangeEndHour) && hour.hour <= Math.max(rangeStartHour, rangeEndHour) ? 'ring-2 ring-[color:#0066CC]' : ''
                    } ${rangeStartHour !== null && rangeEndHour === null && hour.hour === rangeStartHour ? 'ring-2 ring-[color:#0066CC]' : ''}`}
                    onClick={() => handleSelectHour(hour.hour)}
                    title={
                      isTimeSlotPassed(hour.hour, selectedDate)
                        ? 'Thời gian này đã qua, không thể đặt lịch'
                        : hour.isAvailable
                          ? `Chọn ${hour.hour}:00 làm mốc thời gian`
                          : 'Slot này đã hết chỗ'
                    }
                  >
                    <div className="font-semibold">{hour.hour}:00</div>
                     <div className="text-sm">
                       {getAdjustedUsedCapacity(hour.hour)}/{hour.usedCapacity + hour.availableCapacity}
                     </div>
                    <div className="text-xs">
                      {getHourlyBookingCount(hour.hour)} booking
                    </div>
                    {getAdjustedAvailableCapacity(hour) > 0 && !isTimeSlotPassed(hour.hour, selectedDate) && (
                      <div className="text-xs font-medium text-green-700">
                        +{getAdjustedAvailableCapacity(hour)}
                      </div>
                    )}
                    {isTimeSlotPassed(hour.hour, selectedDate) && (
                      <div className="text-xs font-medium text-gray-500">
                        Đã qua
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-col gap-2">
                {rangeError && <div className="text-red-600 text-sm">{rangeError}</div>}
                <div className="text-sm text-gray-700">
                  {rangeStartHour !== null && rangeEndHour !== null ? (
                    <>Khoảng đã chọn: <span className="font-semibold">{rangeStartHour}:00</span> - <span className="font-semibold">{(rangeEndHour + 1)}:00</span> ({(rangeEndHour + 1 - rangeStartHour) * 60} phút)</>
                  ) : rangeStartHour !== null ? (
                    <>Đã chọn mốc bắt đầu: <span className="font-semibold">{rangeStartHour}:00</span>. Chọn mốc kết thúc.</>
                  ) : (
                    <>Chọn 2 ô giờ để tạo khoảng thời gian cần đặt.</>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap items-center">
                  <Button
                    onClick={confirmRangeBooking}
                    disabled={rangeStartHour === null}
                  >
                    {rangeStartHour !== null && rangeEndHour === null ? 'Đặt 1 giờ đã chọn' : 'Đặt dải giờ đã chọn'}
                  </Button>
                  <Button variant="outline" onClick={clearRange}>Xóa lựa chọn</Button>
                  <div className="text-xs text-gray-500 mt-1">Tip: Chọn 1 ô để đặt 60 phút; chọn 2 ô để đặt theo dải giờ.</div>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-600">
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-200 rounded"></div>
                    <span>Còn nhiều chỗ (&gt;50%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-200 rounded"></div>
                    <span>Ít chỗ (&lt;50%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-200 rounded"></div>
                    <span>Hết chỗ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-300 rounded"></div>
                    <span>Đã qua</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  * Click vào slot có màu để đặt thêm người. Slot xám là thời gian đã qua.
                </p>
              </div>
              <div className="mt-4">
                <Button variant="outline" onClick={() => {
                  setShowAvailability(false);
                  setUserSelectedDate(false); // Reset khi đóng modal
                }}>
                  Đóng
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add to Slot Modal */}
        {showAddToSlotModal && selectedFacility && selectedSlot && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Đặt thêm cho slot {selectedSlot.hour}:00</CardTitle>
              <CardDescription>
                Slot còn {selectedSlot.availableCapacity} chỗ trống. Bạn có thể đặt thêm người vào slot này.
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
                      onChange={(e) => setNewBooking(prev => ({ ...prev, date: e.target.value, duration: 60 }))}
                      min={todayStr}
                      disabled
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số người thêm
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max={selectedSlot.availableCapacity}
                      value={newBooking.numberOfPeople}
                      onChange={handleNumberChange}
                    />
                    {numberError && <div className="text-red-500 text-xs mt-1">{numberError}</div>}
                    <div className="text-xs text-gray-500 mt-1">
                      Slot còn {selectedSlot.availableCapacity} chỗ trống
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giờ bắt đầu
                    </label>
                    <Input
                      type="time"
                      value={newBooking.startTime}
                      disabled
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giờ kết thúc
                    </label>
                    <Input
                      type="time"
                      value={newBooking.endTime}
                      disabled
                    />
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
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleCreateBooking}
                    disabled={!newBooking.purpose || !!numberError}
                  >
                    Đặt thêm
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setShowAddToSlotModal(false);
                    setSelectedSlot(null);
                  }}>
                    Hủy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Booking Form */}
        {showBookingForm && selectedFacility && (
          <Card className="mb-6" id="booking-form">
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
                      onChange={(e) => setNewBooking(prev => ({ ...prev, date: e.target.value, duration: 60 }))}
                      min={todayStr}
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
                      value={newBooking.startTime}
                      onChange={e => handleTimeChange('startTime', e.target.value)}
                    />
                    {timeError && <div className="text-red-500 text-xs mt-1">{timeError}</div>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giờ kết thúc
                    </label>
                    <Input type="time" value={newBooking.endTime} onChange={e => handleTimeChange('endTime', e.target.value)} />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giờ kết thúc (tự động tính)
                  </label>
                  <Input
                    type="time"
                    value={newBooking.endTime}
                    disabled
                    className="bg-gray-50"
                  />
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
                <Button
                  variant={filterStatus === 'REJECTED' ? 'default' : 'outline'}
                  onClick={() => setFilterStatus('REJECTED')}
                >
                  Bị từ chối
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
                              <span className="font-medium">Kết thúc:</span> {booking.endTime ? formatDateTime(booking.endTime) : '---'}
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
                           
                           {/* Payment Information - Only show for non-REJECTED bookings */}
                           {booking.status !== 'REJECTED' && (
                             <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                               <div className="flex items-center justify-between mb-2">
                                 <span className="text-sm font-medium text-gray-700">Trạng thái thanh toán:</span>
                                 <span className={`text-xs px-2 py-1 rounded-full ${
                                   booking.paymentStatus === 'PAID' 
                                     ? 'bg-green-100 text-green-800' 
                                     : 'bg-yellow-100 text-yellow-800'
                                 }`}>
                                   {booking.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chờ thanh toán'}
                                 </span>
                               </div>
                               
                               {booking.paymentStatus === 'PAID' ? (
                                 <div className="text-xs text-gray-600">
                                   <div>Phương thức: {booking.paymentMethod || '---'}</div>
                                   <div>Ngày thanh toán: {booking.paymentDate ? formatDateTime(booking.paymentDate) : '---'}</div>
                                   {booking.transactionId && <div>Mã giao dịch: {booking.transactionId}</div>}
                                 </div>
                               ) : (
                                 <div className="space-y-2">
                                   <div className="text-xs text-gray-600">
                                     Chọn phương thức thanh toán để xác nhận booking
                                   </div>
                                   <div className="flex gap-2 flex-wrap">
                                     {paymentMethods.map(method => (
                                       <button
                                         key={method.id}
                                         onClick={() => handlePayment(booking.id, method.id)}
                                         disabled={paymentLoading}
                                         className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                       >
                                         {paymentLoading ? 'Đang xử lý...' : method.name}
                                       </button>
                                     ))}
                                   </div>
                                 </div>
                               )}
                             </div>
                           )}
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          {booking.status === 'PENDING' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelBooking(booking.id)}
                            >
                              Hủy
                            </Button>
                          )}
                          {booking.status === 'CONFIRMED' && (
                            <div className="flex flex-col gap-2">
                              <span className="text-xs text-blue-600 font-medium">
                                Đã xác nhận - Không thể hủy
                              </span>
                              {booking.qrCode && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    // Tạo QR code popup
                                    const qrData = `FACILITY_${booking.id}_${Date.now()}`;
                                    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
                                    window.open(qrUrl, '_blank', 'width=300,height=300');
                                  }}
                                  className="text-xs"
                                >
                                  <QrCode className="h-3 w-3 mr-1" />
                                  Xem QR Code
                                </Button>
                              )}
                              {booking.checkedInCount !== undefined && booking.maxCheckins !== undefined && (
                                <span className="text-xs text-gray-500">
                                  Check-in: {booking.checkedInCount}/{booking.maxCheckins}
                                </span>
                              )}
                            </div>
                          )}
                          {booking.status === 'REJECTED' && (
                            <span className="text-xs text-red-600 font-medium">
                              Không thể huỷ booking đã bị từ chối
                            </span>
                          )}
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