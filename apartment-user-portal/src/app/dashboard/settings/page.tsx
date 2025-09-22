"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building2,
  Calendar,
  Shield,
  Sparkles,
  Star,
  Heart,
  Users,
  Home,
  Key,
  CreditCard,
  Bell,
  Settings as SettingsIcon,
  AlertCircle,
  ChevronDown
} from 'lucide-react'
import { fetchCurrentResident } from '@/lib/api'
import { getAvatarUrl } from '@/lib/utils'
import { ChangePasswordDialog } from '@/components/ui/change-password-dialog'

interface UserData {
  roles: string[]
  user: {
    id: number
    username: string
    phoneNumber: string
    status: string
    createdAt: string
    updatedAt: string
    roles: string[]
    lockReason?: string
    email: string
    avatarUrl?: string
    fullName: string
    dateOfBirth: string
    idCardNumber: string
    emergencyContacts?: any
  }
  apartmentResidents?: Array<{
    apartmentId: number
    userId: number
    apartmentUnitNumber: string
    buildingName: string
    userFullName: string
    userEmail: string
    userPhoneNumber: string
    relationType: string
    relationTypeDisplayName: string
    moveInDate: string
    moveOutDate?: string
    isPrimaryResident: boolean
    createdAt?: string
  }>
  apartmentResident?: {
    apartmentId: number
    userId: number
    apartmentUnitNumber: string
    buildingName: string
    userFullName: string
    userEmail: string
    userPhoneNumber: string
    relationType: string
    relationTypeDisplayName: string
    moveInDate: string
    moveOutDate?: string
    isPrimaryResident: boolean
    createdAt?: string
  }
  apartments?: Array<{
    id: number
    buildingId: number
    floorNumber: number
    unitNumber: string
    area: number
    status: string
  }>
  apartment?: {
    id: number
    buildingId: number
    floorNumber: number
    unitNumber: string
    area: number
    status: string
  }
  token?: string
}

export default function SettingsPage() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedApartmentId, setSelectedApartmentId] = useState<number | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchCurrentResident()
        console.log('=== DEBUG API Response ===')
        console.log('Full API Response:', data)
        console.log('Data type:', typeof data)
        console.log('Data keys:', data ? Object.keys(data) : 'No data')
        if (data?.apartment) {
          console.log('Apartment data:', data.apartment)
          console.log('Apartment keys:', Object.keys(data.apartment))
        }
        if (data?.resident) {
          console.log('Resident data:', data.resident)
          console.log('Resident keys:', Object.keys(data.resident))
        }
        console.log('=== END DEBUG ===')
        setUserData(data)
        
        // Tự động chọn căn hộ đầu tiên nếu có nhiều căn hộ
        if (data?.apartmentResidents && data.apartmentResidents.length > 0) {
          setSelectedApartmentId(data.apartmentResidents[0].apartmentId)
        } else if (data?.apartmentResident) {
          setSelectedApartmentId(data.apartmentResident.apartmentId)
        }
      } catch (err: any) {
        console.error('Error fetching user data:', err) // Debug log
        setError(err.message || 'Lỗi khi tải thông tin cư dân')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Helper functions để lấy dữ liệu của căn hộ được chọn
  const getSelectedApartmentResident = () => {
    if (!userData || !selectedApartmentId) return null
    
    if (userData.apartmentResidents) {
      return userData.apartmentResidents.find(ar => ar.apartmentId === selectedApartmentId)
    }
    return userData.apartmentResident
  }

  const getSelectedApartment = () => {
    if (!userData || !selectedApartmentId) return null
    
    if (userData.apartments) {
      return userData.apartments.find(apt => apt.id === selectedApartmentId)
    }
    return userData.apartment
  }

  const getAvailableApartments = () => {
    if (!userData) return []
    
    if (userData.apartmentResidents) {
      return userData.apartmentResidents.map(ar => ({
        id: ar.apartmentId,
        unitNumber: ar.apartmentUnitNumber,
        buildingName: ar.buildingName,
        relationType: ar.relationTypeDisplayName,
        isPrimary: ar.isPrimaryResident
      }))
    }
    
    if (userData.apartmentResident) {
      return [{
        id: userData.apartmentResident.apartmentId,
        unitNumber: userData.apartmentResident.apartmentUnitNumber,
        buildingName: userData.apartmentResident.buildingName,
        relationType: userData.apartmentResident.relationTypeDisplayName,
        isPrimary: userData.apartmentResident.isPrimaryResident
      }]
    }
    
    return []
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Không có'
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (error) {
      return 'Ngày không hợp lệ'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'ACTIVE': { color: 'bg-green-100 text-green-800', label: 'Đang hoạt động' },
      'INACTIVE': { color: 'bg-gray-100 text-gray-800', label: 'Không hoạt động' },
      'PENDING': { color: 'bg-yellow-100 text-yellow-800', label: 'Chờ xử lý' },
      'SUSPENDED': { color: 'bg-red-100 text-red-800', label: 'Tạm dừng' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['ACTIVE']
    
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Đã xảy ra lỗi</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Thử lại
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <SettingsIcon className="h-7 w-7 text-brand-primary" />
            Thông tin cư dân
          </h1>
          <p className="text-gray-600">Xem thông tin chi tiết về tài khoản và căn hộ của bạn</p>
          
          {/* Apartment Selector */}
          {getAvailableApartments().length > 1 && (
            <div className="mt-4">
              <Label className="text-sm font-medium text-gray-500 mb-2 block">
                Chọn căn hộ để xem thông tin:
              </Label>
              <Select 
                value={selectedApartmentId?.toString() || ''} 
                onValueChange={(value) => setSelectedApartmentId(Number(value))}
              >
                <SelectTrigger className="w-full sm:w-80">
                  <SelectValue placeholder="Chọn căn hộ" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableApartments().map((apt) => (
                    <SelectItem key={apt.id} value={apt.id.toString()}>
                      <div className="flex items-center justify-between w-full">
                        <span>{apt.unitNumber} - {apt.buildingName}</span>
                        <div className="flex items-center gap-2 ml-4">
                          <span className="text-xs text-gray-500">({apt.relationType})</span>
                          {apt.isPrimary && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              Chính
                            </span>
                          )}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <div className="flex-shrink-0 w-full lg:w-auto">
          <Button 
            onClick={() => window.location.href = '/dashboard/update-info'}
            className="flex items-center justify-center space-x-2 w-full lg:w-auto"
          >
            <User className="h-4 w-4" />
            <span>Cập nhật thông tin</span>
          </Button>
        </div>
      </div>

      {/* Profile Summary */}
      <Card className="hover-lift transition-smooth">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Avatar className="h-20 w-20 ring-4 ring-brand-primary/20">
              <AvatarImage src={userData?.user?.avatarUrl || getAvatarUrl(userData)} />
              <AvatarFallback className="bg-brand-gradient text-white text-xl">
                {userData?.user?.fullName?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h2 className="text-2xl font-bold text-gray-900">{userData?.user?.fullName || 'Chưa có tên'}</h2>
                {userData?.user?.status && getStatusBadge(userData.user.status)}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4" />
                  <span>Căn hộ {getSelectedApartmentResident()?.apartmentUnitNumber || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Home className="h-4 w-4" />
                  <span>{getSelectedApartmentResident()?.buildingName || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="hover-lift transition-smooth">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5 text-brand-primary" />
              <span>Thông tin cá nhân</span>
            </CardTitle>
            <CardDescription>Chi tiết thông tin cá nhân của bạn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-500">Họ và tên</Label>
                  <p className="text-sm text-gray-900">
                    {userData?.user?.fullName || 'Chưa có'}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-500">Tên đăng nhập</Label>
                  <p className="text-sm text-gray-900">
                    {userData?.user?.username || 'Chưa có'}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-500">Ngày sinh</Label>
                  <p className="text-sm text-gray-900">
                    {formatDate(userData?.user?.dateOfBirth || '')}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-500">CCCD/CMND</Label>
                  <p className="text-sm text-gray-900">
                    {userData?.user?.idCardNumber || 'Chưa có'}
                  </p>
                </div>
              </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="hover-lift transition-smooth">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="h-5 w-5 text-brand-primary" />
              <span>Thông tin liên hệ</span>
            </CardTitle>
            <CardDescription>Thông tin để liên hệ với bạn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-500">Email</Label>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-gray-900">
                    {userData?.user?.email || 'Chưa có'}
                  </p>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-500">Số điện thoại</Label>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <p className="text-sm text-gray-900">
                    {userData?.user?.phoneNumber || 'Chưa có'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Apartment Information */}
        <Card className="hover-lift transition-smooth">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Home className="h-5 w-5 text-brand-primary" />
              <span>Thông tin căn hộ</span>
            </CardTitle>
            <CardDescription>Chi tiết về căn hộ bạn đang ở</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-500">Số căn hộ</Label>
                <p className="text-sm text-gray-900">
                  {getSelectedApartment()?.unitNumber || 'N/A'}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-500">Tòa nhà</Label>
                <p className="text-sm text-gray-900">
                  {getSelectedApartment()?.buildingId ? `Tòa ${getSelectedApartment()?.buildingId}` : 'N/A'}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-500">Tầng</Label>
                <p className="text-sm text-gray-900">
                  {getSelectedApartment()?.floorNumber || 'N/A'}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-sm font-medium text-gray-500">Diện tích</Label>
                <p className="text-sm text-gray-900">
                  {getSelectedApartment()?.area ? `${getSelectedApartment()?.area} m²` : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contract Information */}
        <Card className="hover-lift transition-smooth">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="h-5 w-5 text-brand-primary" />
              <span>Thông tin hợp đồng</span>
            </CardTitle>
            <CardDescription>Chi tiết về hợp đồng thuê nhà</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-500">Ngày chuyển vào</Label>
                  <p className="text-sm text-gray-900">{formatDate(getSelectedApartmentResident()?.moveInDate || '')}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-500">Ngày chuyển ra</Label>
                  <p className="text-sm text-gray-900">{formatDate(getSelectedApartmentResident()?.moveOutDate || '')}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-500">Loại quan hệ</Label>
                  <p className="text-sm text-gray-900 font-semibold">
                    {getSelectedApartmentResident()?.relationTypeDisplayName || 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <Label className="text-sm font-medium text-gray-500">Cư dân chính</Label>
                  <p className="text-sm text-gray-900 font-semibold">
                    {getSelectedApartmentResident()?.isPrimaryResident ? 'Có' : 'Không'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Information */}
      <Card className="hover-lift transition-smooth">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-brand-primary" />
            <span>Thông tin tài khoản</span>
          </CardTitle>
          <CardDescription>Thông tin về tài khoản và quyền hạn của bạn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-500">Trạng thái tài khoản</Label>
              {userData?.user?.status && getStatusBadge(userData.user.status)}
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-500">Ngày tạo tài khoản</Label>
              <p className="text-sm text-gray-900">{formatDate(userData?.user?.createdAt || '')}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-500">Cập nhật lần cuối</Label>
              <p className="text-sm text-gray-900">{formatDate(userData?.user?.updatedAt || '')}</p>
            </div>
          </div>
          
          {userData?.user?.roles && userData.user.roles.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-500">Vai trò</Label>
              <div className="flex flex-wrap gap-2">
                {userData.user.roles.map((role, index) => (
                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {role}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Password Card */}
      <Card className="hover-lift transition-smooth">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5 text-brand-primary" />
            <span>Bảo mật tài khoản</span>
          </CardTitle>
          <CardDescription>Quản lý mật khẩu và bảo mật tài khoản của bạn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-gray-900">Đổi mật khẩu</h4>
              <p className="text-sm text-gray-600">
                Thay đổi mật khẩu để tăng cường bảo mật tài khoản
              </p>
            </div>
            <ChangePasswordDialog>
              <Button variant="outline" size="sm">
                <Key className="h-4 w-4 mr-2" />
                Đổi mật khẩu
              </Button>
            </ChangePasswordDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
