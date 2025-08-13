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
  AlertCircle,
  Sparkles,
  TrendingUp,
  Star,
  Zap,
  Target,
  Shield,
  Heart,
  Users
} from 'lucide-react'
import { fetchCurrentResident, updateCurrentResident } from '@/lib/api'
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
  
  .profile-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    transform-origin: center;
  }
  
  .profile-card:hover {
    transform: translateY(-4px) scale(1.01);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }
  
  .avatar-container {
    transition: all 0.3s ease;
    position: relative;
  }
  
  .avatar-container:hover {
    transform: scale(1.05);
  }
  
  .avatar-container:hover .avatar-overlay {
    opacity: 1;
  }
  
  .avatar-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: all 0.3s ease;
  }
  
  .form-input {
    transition: all 0.3s ease;
  }
  
  .form-input:focus {
    transform: scale(1.02);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  .contact-card {
    transition: all 0.3s ease;
  }
  
  .contact-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  }
  
  .save-button {
    transition: all 0.3s ease;
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  }
  
  .save-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.4);
  }
  
  .save-button:active {
    transform: translateY(0);
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
  
  .success-animation {
    animation: bounce 0.6s ease-out;
  }
  
  .error-animation {
    animation: pulse 0.6s ease-out;
  }
`

// 1. Cập nhật interface/type:
interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}
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
  emergencyContacts: EmergencyContact[]; // Added emergencyContacts to Resident interface
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
    phoneNumber: '',
    emergencyContacts: [{ name: '', phone: '', relationship: '' }],
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      setLoading(true)
      try {
        const data = await fetchCurrentResident()
        if (!data) throw new Error('Không thể tải thông tin người dùng')
        setUser(data.user);
        setResident(data.resident);
        setApartment(data.apartment);
        setApartmentResident(data.apartmentResident);
        setFormData({
          fullName: data.user?.fullName || data.user?.username || '',
          phoneNumber: data.user?.phoneNumber || '',
          emergencyContacts: data.user?.emergencyContacts && data.user.emergencyContacts.length > 0
            ? data.user.emergencyContacts
            : [{ name: '', phone: '', relationship: '' }],
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
      const payload: any = {
        fullName: formData.fullName,
        emergencyContacts: formData.emergencyContacts.filter(ec => ec.name || ec.phone || ec.relationship),
      };
      const updated = await updateCurrentResident(payload);
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

  // Helper để lấy avatarUrl đầy đủ
  const getAvatarUrl = (user: any) => {
    if (!user?.avatarUrl) return undefined;
    if (user.avatarUrl.startsWith('/uploads/')) {
      return `http://localhost:8080${user.avatarUrl}`;
    }
    return user.avatarUrl;
  };

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
                      <AvatarImage src={getAvatarUrl(user)} alt={resident?.fullName || user?.username || ''} />
                      <AvatarFallback>
                        {(resident?.fullName || user?.username || '').split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {/* Input file ẩn */}
                    <input
                      type="file"
                      accept="image/*"
                      id="avatar-upload"
                      style={{ display: 'none' }}
                      aria-label="Tải ảnh đại diện lên"
                      title="Chọn ảnh đại diện"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const formData = new FormData();
                        formData.append('file', file);
                        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
                        try {
                          const res = await fetch('http://localhost:8080/api/auth/upload/avatar', {
                            method: 'POST',
                            body: formData,
                            headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                          });
                          if (res.ok) {
                            const result = await res.json();
                            if (result.success && result.data) {
                              // Cập nhật avatar URL trong user state
                              setUser(prev => prev ? { ...prev, avatar: result.data } : prev);
                              alert('Upload ảnh thành công!');
                            } else {
                              alert('Upload ảnh thất bại: ' + (result.message || 'Lỗi không xác định'));
                            }
                          } else {
                            const errorText = await res.text();
                            alert('Upload ảnh thất bại: ' + errorText);
                          }
                        } catch (error) {
                          alert('Đã xảy ra lỗi khi upload ảnh');
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                      onClick={() => document.getElementById('avatar-upload')?.click()}
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
                    {formData.emergencyContacts.map((contact, idx) => (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2" key={idx}>
                        <div>
                          <Label htmlFor={`emergencyName${idx}`} className="text-sm font-medium text-gray-700">
                            Họ và tên
                          </Label>
                          <div className="mt-1">
                            <Input
                              id={`emergencyName${idx}`}
                              value={contact.name}
                              onChange={e => {
                                const newContacts = [...formData.emergencyContacts];
                                newContacts[idx].name = e.target.value;
                                setFormData(prev => ({ ...prev, emergencyContacts: newContacts }));
                              }}
                              placeholder="Nhập họ và tên"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor={`emergencyPhone${idx}`} className="text-sm font-medium text-gray-700">
                            Số điện thoại
                          </Label>
                          <div className="mt-1">
                            <Input
                              id={`emergencyPhone${idx}`}
                              value={contact.phone}
                              onChange={e => {
                                const newContacts = [...formData.emergencyContacts];
                                newContacts[idx].phone = e.target.value;
                                setFormData(prev => ({ ...prev, emergencyContacts: newContacts }));
                              }}
                              placeholder="Nhập số điện thoại"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor={`relationship${idx}`} className="text-sm font-medium text-gray-700">
                            Mối quan hệ
                          </Label>
                          <div className="mt-1">
                            <Input
                              id={`relationship${idx}`}
                              value={contact.relationship}
                              onChange={e => {
                                const newContacts = [...formData.emergencyContacts];
                                newContacts[idx].relationship = e.target.value;
                                setFormData(prev => ({ ...prev, emergencyContacts: newContacts }));
                              }}
                              placeholder="Ví dụ: Vợ, chồng, con..."
                            />
                          </div>
                        </div>
                        {/* Xóa liên hệ nếu nhiều hơn 1 */}
                        {formData.emergencyContacts.length > 1 && (
                          <div className="flex items-end">
                            <Button type="button" variant="destructive" size="sm" onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                emergencyContacts: prev.emergencyContacts.filter((_, i) => i !== idx)
                              }))
                            }}>Xóa</Button>
                          </div>
                        )}
                      </div>
                    ))}
                    {/* Thêm liên hệ */}
                    {formData.emergencyContacts.length < 2 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          emergencyContacts: [...prev.emergencyContacts, { name: '', phone: '', relationship: '' }]
                        }))
                      }}>+ Thêm liên hệ</Button>
                    )}
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