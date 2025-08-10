"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft,
  Save,
  User,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useResidents, Resident, UpdateResidentRequest } from '@/hooks/use-residents';
import { getResidentIdCard } from '@/lib/resident-utils';

export default function EditResidentPage() {
  const params = useParams();
  const router = useRouter();
  const residentId = parseInt(params.id as string);
  
  const { 
    loading, 
    error, 
    getResidentById, 
    updateResident 
  } = useResidents();

  const [success, setSuccess] = useState<string>("");
  
  const [formData, setFormData] = useState<UpdateResidentRequest>({
    fullName: '',
    phoneNumber: '',
    email: '',
    dateOfBirth: '',
    identityNumber: '',
    status: 'ACTIVE'
  });
  
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (residentId) {
      loadResidentData();
    }
  }, [residentId]);

  const loadResidentData = async () => {
    setInitialLoading(true);
    const resident = await getResidentById(residentId);
    if (resident) {
      setFormData({
        fullName: resident.fullName,
        phoneNumber: resident.phoneNumber,
        email: resident.email,
        dateOfBirth: resident.dateOfBirth,
        identityNumber: getResidentIdCard(resident),
        status: resident.status
      });
    }
    setInitialLoading(false);
  };

  const handleInputChange = (field: keyof UpdateResidentRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.fullName.trim()) {
      errors.fullName = 'Họ tên là bắt buộc';
    }
    
    if (!formData.identityNumber.trim()) {
      errors.identityNumber = 'Số CMND/CCCD là bắt buộc';
    } else if (!/^\d{9}(\d{3})?$/.test(formData.identityNumber)) {
      errors.identityNumber = 'Số CMND/CCCD không hợp lệ (9 hoặc 12 số)';
    }
    
    if (!formData.phoneNumber.trim()) {
      errors.phoneNumber = 'Số điện thoại là bắt buộc';
    } else if (!/^(0|\+84)[0-9]{9,10}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = 'Số điện thoại không hợp lệ';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email là bắt buộc';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email không hợp lệ';
    }
    
    if (!formData.dateOfBirth) {
      errors.dateOfBirth = 'Ngày sinh là bắt buộc';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 0 || age > 120) {
        errors.dateOfBirth = 'Ngày sinh không hợp lệ';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("");
    
    if (!validateForm()) {
      return;
    }
    const result = await updateResident(residentId, formData);
    if (result) {
      setSuccess('Cập nhật thành công');
      // Redirect to resident detail page after successful update
      setTimeout(() => {
        router.push(`/admin-dashboard/residents/${residentId}`);
      }, 2000);
    }
  };

  if (initialLoading) {
    return (
      <AdminLayout title="Chỉnh sửa cư dân">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải thông tin cư dân...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Chỉnh sửa cư dân">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Chỉnh sửa cư dân
            </h2>
            <p className="text-gray-600">
              Cập nhật thông tin cư dân {formData.fullName}
            </p>
          </div>
        </div>

        {/* Success/Error Messages */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              {success}. Đang chuyển hướng về trang chi tiết...
            </AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Thông tin cư dân
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    Họ tên <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    placeholder="Nhập họ tên đầy đủ"
                    className={formErrors.fullName ? 'border-red-500' : ''}
                  />
                  {formErrors.fullName && (
                    <p className="text-sm text-red-600">{formErrors.fullName}</p>
                  )}
                </div>

                {/* Identity Number */}
                <div className="space-y-2">
                  <Label htmlFor="identityNumber">
                    Số CMND/CCCD <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="identityNumber"
                    type="text"
                    value={formData.identityNumber}
                    onChange={(e) => handleInputChange('identityNumber', e.target.value)}
                    placeholder="Nhập số CMND/CCCD"
                    className={formErrors.identityNumber ? 'border-red-500' : ''}
                  />
                  {formErrors.identityNumber && (
                    <p className="text-sm text-red-600">{formErrors.identityNumber}</p>
                  )}
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">
                    Số điện thoại <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder="Nhập số điện thoại"
                    className={formErrors.phoneNumber ? 'border-red-500' : ''}
                  />
                  {formErrors.phoneNumber && (
                    <p className="text-sm text-red-600">{formErrors.phoneNumber}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Nhập địa chỉ email"
                    className={formErrors.email ? 'border-red-500' : ''}
                  />
                  {formErrors.email && (
                    <p className="text-sm text-red-600">{formErrors.email}</p>
                  )}
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">
                    Ngày sinh <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className={formErrors.dateOfBirth ? 'border-red-500' : ''}
                  />
                  {formErrors.dateOfBirth && (
                    <p className="text-sm text-red-600">{formErrors.dateOfBirth}</p>
                  )}
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label>
                    Trạng thái <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                      <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Hủy
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="min-w-[120px]"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Đang cập nhật...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Save className="h-4 w-4" />
                      <span>Cập nhật</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}