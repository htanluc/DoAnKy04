"use client"

// Hướng dẫn lấy số điện thoại trực tiếp từ table user - phone_number:
// 1. Đảm bảo API backend trả về trường "phoneNumber" (hoặc "phone_number") từ bảng user khi gọi fetchCurrentResident.
// 2. Ở FE, chỉ lấy giá trị từ data.phoneNumber (không lấy từ resident, không lấy từ các bảng khác).

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Save, 
  Camera,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { fetchCurrentResident, updateCurrentResident } from '@/lib/api'
import type { JSX } from 'react'

// 1. Cập nhật interface/type:
interface User {
  id: number;
  username: string;
  phoneNumber: string;
  status: string;
  email: string;
  roles: string[];
  lockReason?: string | null;
  avatar?: string; // Added avatar to User interface
}
interface Resident {
  id: number;
  userId: number;
  fullName: string;
  dateOfBirth: string;
  idCardNumber: string;
  familyRelation: string;
  status: number | null;
}
interface Apartment {
  id: number;
  buildingId: number;
  floorNumber: number;
  unitNumber: string;
  area: number;
  status: string;
}
interface ApartmentResident {
  apartmentId: number;
  userId: number;
  relationType: string;
  moveInDate: string;
  moveOutDate?: string;
}

export default function UpdateInfoPage() {
  // Thay vì chỉ dùng userInfo, tách thành các state riêng:
  const [user, setUser] = useState<User | null>(null);
  const [resident, setResident] = useState<Resident | null>(null);
  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [apartmentResident, setApartmentResident] = useState<ApartmentResident | null>(null);
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '', // Sửa lại: dùng phoneNumber
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  })

  useEffect(() => {
    const fetchUserInfo = async () => {
      setLoading(true)
      try {
        const data = await fetchCurrentResident()
        if (!data) throw new Error('Không thể tải thông tin người dùng')
        // Khi fetch dữ liệu:
        setUser(data.user);
        setResident(data.resident);
        setApartment(data.apartment);
        setApartmentResident(data.apartmentResident);
        setFormData({
          fullName: data.resident?.fullName || data.user?.username || '',
          phoneNumber: data.user?.phoneNumber || '',
          emergencyContact: { name: '', phone: '', relationship: '' }
        });
      } catch (error) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    fetchUserInfo()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await updateCurrentResident({
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber, // Gửi phoneNumber trực tiếp
        emergencyContact: formData.emergencyContact
      })
      setUser(updated)
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      setShowError(true)
      setTimeout(() => setShowError(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-500">Không thể tải thông tin người dùng</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-gray-50 flex flex-col flex-grow">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Cập nhật thông tin cá nhân</h1>
          <p className="text-gray-600">Quản lý thông tin cá nhân và liên hệ khẩn cấp</p>
        </div>

        {/* Success/Error Messages */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
              <p className="text-green-800">Cập nhật thông tin thành công!</p>
            </div>
          </div>
        )}

        {showError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
              <p className="text-red-800">Có lỗi xảy ra khi cập nhật thông tin</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Overview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cơ bản</CardTitle>
                <CardDescription>
                  Thông tin không thể thay đổi
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={user?.avatar || undefined} alt={resident?.fullName || user?.username || ''} />
                      <AvatarFallback>
                        {(resident?.fullName || user?.username || '').split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Nhấn để thay đổi ảnh</p>
                </div>

                {/* Read-only Info */}
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-700">Email</Label>
                    <div className="flex items-center mt-1">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">{user?.email}</span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Căn hộ</Label>
                    <div className="flex items-center mt-1">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-gray-900">
                        {apartment ? `Tòa ${apartment.buildingId} - Tầng ${apartment.floorNumber} - ${apartment.unitNumber}` : 'Chưa liên kết căn hộ'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Ngày vào ở</Label>
                    <span className="text-gray-900 block mt-1">
                      {apartmentResident?.moveInDate ? formatDate(apartmentResident.moveInDate) : '---'}
                    </span>
                  </div>

                  {resident?.dateOfBirth && (
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Ngày sinh</Label>
                      <span className="text-gray-900 block mt-1">
                        {formatDate(resident.dateOfBirth)}
                      </span>
                    </div>
                  )}

                  <div>
                    <Label className="text-sm font-medium text-gray-700">Trạng thái</Label>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${user?.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user?.status === 'ACTIVE' ? 'Đang hoạt động' : 'Không hoạt động'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Editable Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin có thể cập nhật</CardTitle>
                <CardDescription>
                  Cập nhật thông tin cá nhân và liên hệ
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin cá nhân</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                          Họ và tên
                        </Label>
                        <div className="mt-1">
                          <Input
                            id="fullName"
                            value={formData.fullName}
                            onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                            placeholder="Nhập họ và tên"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                          Số điện thoại
                        </Label>
                        <div className="mt-1">
                          <Input
                            id="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                            placeholder="Nhập số điện thoại"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Liên hệ khẩn cấp</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="emergencyName" className="text-sm font-medium text-gray-700">
                          Họ và tên
                        </Label>
                        <div className="mt-1">
                          <Input
                            id="emergencyName"
                            value={formData.emergencyContact.name}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                            }))}
                            placeholder="Nhập họ và tên"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="emergencyPhone" className="text-sm font-medium text-gray-700">
                          Số điện thoại
                        </Label>
                        <div className="mt-1">
                          <Input
                            id="emergencyPhone"
                            value={formData.emergencyContact.phone}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                            }))}
                            placeholder="Nhập số điện thoại"
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="relationship" className="text-sm font-medium text-gray-700">
                          Mối quan hệ
                        </Label>
                        <div className="mt-1">
                          <Input
                            id="relationship"
                            value={formData.emergencyContact.relationship}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              emergencyContact: { ...prev.emergencyContact, relationship: e.target.value }
                            }))}
                            placeholder="Ví dụ: Vợ, chồng, con..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-6 border-t">
                    <Button 
                      onClick={handleSave} 
                      disabled={saving}
                      className="min-w-[120px]"
                    >
                      {saving ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Đang lưu...
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Save className="h-4 w-4 mr-2" />
                          Lưu thay đổi
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 