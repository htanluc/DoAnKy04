"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { useResidents, CreateResidentRequest } from '@/hooks/use-residents';

export default function CreateResidentPage() {
  const router = useRouter();
  const { loading, error, success, createResident, clearMessages } = useResidents();
  
  const [formData, setFormData] = useState<CreateResidentRequest>({
    fullName: '',
    phoneNumber: '',
    email: '',
    dateOfBirth: '',
    identityNumber: ''
  });
  
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});

  const handleInputChange = (field: keyof CreateResidentRequest, value: string) => {
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
    clearMessages();
    
    if (!validateForm()) {
      return;
    }

    const result = await createResident(formData);
    if (result?.success) {
      // Redirect to residents list after successful creation
      setTimeout(() => {
        router.push('/admin-dashboard/residents');
      }, 2000);
    }
  };

  return (
    <AdminLayout title="Tạo cư dân mới">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Tạo cư dân mới
            </h2>
            <p className="text-gray-600">
              Thêm thông tin cư dân mới vào hệ thống
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
              {success}. Đang chuyển hướng về danh sách cư dân...
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
                      <span>Đang tạo...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Save className="h-4 w-4" />
                      <span>Tạo cư dân</span>
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