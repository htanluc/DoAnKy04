"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { facilitiesApi, FacilityCreateRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { FACILITY_LOCATIONS, CAPACITY_TYPES } from '@/lib/constants';

export default function CreateFacilityPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FacilityCreateRequest>({
    name: '',
    description: '',
    location: '',
    capacity: 0,
    capacityType: 'INDIVIDUAL',
    groupSize: undefined,
    otherDetails: '',
    usageFee: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim() || !formData.location.trim() || formData.capacity <= 0) {
      toast({
        title: t('admin.error.save', 'Lỗi'),
        description: t('admin.facilities.createError', 'Không thể tạo tiện ích'),
        variant: "destructive",
      });
      return;
    }

    // Kiểm tra groupSize khi capacityType là GROUP
    if (formData.capacityType === 'GROUP' && (!formData.groupSize || formData.groupSize <= 0)) {
      toast({
        title: t('admin.error.save', 'Lỗi'),
        description: t('admin.facilities.groupSizeError', 'Vui lòng nhập số người trong nhóm'),
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await facilitiesApi.create(formData);
      toast({
        title: t('admin.success.save', 'Thành công'),
        description: t('admin.facilities.createSuccess', 'Đã tạo tiện ích mới'),
      });
      router.push('/admin-dashboard/facilities');
    } catch (error) {
      toast({
        title: t('admin.error.save', 'Lỗi'),
        description: t('admin.facilities.createError', 'Không thể tạo tiện ích'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof FacilityCreateRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <AdminLayout title={t('admin.facilities.create', 'Tạo tiện ích mới')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin-dashboard/facilities">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('admin.action.back', 'Quay lại')}
              </Button>
            </Link>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {t('admin.facilities.create', 'Tạo tiện ích mới')}
              </h2>
              <p className="text-gray-600">
                {t('admin.facilities.createDesc', 'Thêm tiện ích mới vào hệ thống')}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.facilities.info', 'Thông tin tiện ích')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">{t('admin.facilities.name', 'Tên tiện ích')} *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder={t('admin.facilities.name.placeholder', 'Nhập tên tiện ích')}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">{t('admin.facilities.description', 'Mô tả')} *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={t('admin.facilities.description.placeholder', 'Nhập mô tả tiện ích')}
                  rows={4}
                  required
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">{t('admin.facilities.location', 'Vị trí diễn ra')} *</Label>
                <Select value={formData.location} onValueChange={(value) => handleInputChange('location', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('admin.facilities.location.placeholder', 'Chọn vị trí diễn ra')} />
                  </SelectTrigger>
                  <SelectContent>
                    {FACILITY_LOCATIONS.map((location) => (
                      <SelectItem key={location.value} value={location.value}>
                        {location.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Capacity Type */}
              <div className="space-y-2">
                <Label htmlFor="capacityType">{t('admin.facilities.capacityType', 'Loại sức chứa')} *</Label>
                <Select value={formData.capacityType} onValueChange={(value) => handleInputChange('capacityType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('admin.facilities.capacityType.placeholder', 'Chọn loại sức chứa')} />
                  </SelectTrigger>
                  <SelectContent>
                    {CAPACITY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Capacity */}
              <div className="space-y-2">
                <Label htmlFor="capacity">{t('admin.facilities.capacity', 'Sức chứa')} *</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 0)}
                  placeholder={formData.capacityType === 'INDIVIDUAL' 
                    ? t('admin.facilities.capacity.placeholder', 'Nhập số người tối đa') 
                    : t('admin.facilities.capacity.group.placeholder', 'Nhập số nhóm tối đa')}
                  required
                />
                <p className="text-sm text-gray-500">
                  {formData.capacityType === 'INDIVIDUAL' 
                    ? t('admin.facilities.capacity.desc', 'Số người tối đa có thể sử dụng tiện ích cùng lúc')
                    : t('admin.facilities.capacity.group.desc', 'Số nhóm tối đa có thể sử dụng tiện ích cùng lúc')}
                </p>
              </div>

              {/* Group Size - chỉ hiển thị khi chọn GROUP */}
              {formData.capacityType === 'GROUP' && (
                <div className="space-y-2">
                  <Label htmlFor="groupSize">{t('admin.facilities.groupSize', 'Số người trong nhóm')} *</Label>
                  <Input
                    id="groupSize"
                    type="number"
                    min="1"
                    value={formData.groupSize || ''}
                    onChange={(e) => handleInputChange('groupSize', parseInt(e.target.value) || undefined)}
                    placeholder={t('admin.facilities.groupSize.placeholder', 'Nhập số người trong mỗi nhóm')}
                    required
                  />
                  <p className="text-sm text-gray-500">
                    {t('admin.facilities.groupSize.desc', 'Số người tối đa trong mỗi nhóm')}
                  </p>
                </div>
              )}

              {/* Opening Hours */}
              <div className="space-y-2">
                <Label htmlFor="openingHours">{t('admin.facilities.openingHours', 'Giờ hoạt động')}</Label>
                <Input
                  id="openingHours"
                  value={formData.openingHours || ''}
                  onChange={(e) => handleInputChange('openingHours', e.target.value)}
                  placeholder={t('admin.facilities.openingHours.placeholder', 'Ví dụ: 06:00 - 22:00')}
                />
                <p className="text-sm text-gray-500">
                  {t('admin.facilities.openingHours.desc', 'Thời gian tiện ích hoạt động trong ngày')}
                </p>
              </div>

              {/* Usage Fee */}
              <div className="space-y-2">
                <Label htmlFor="usageFee">{t('admin.facilities.usageFee', 'Phí sử dụng')}</Label>
                <Input
                  id="usageFee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.usageFee || ''}
                  onChange={(e) => handleInputChange('usageFee', parseFloat(e.target.value) || 0)}
                  placeholder={t('admin.facilities.usageFee.placeholder', 'Nhập phí sử dụng (nếu có)')}
                />
              </div>

              {/* Other Details */}
              <div className="space-y-2">
                <Label htmlFor="otherDetails">{t('admin.facilities.otherDetails', 'Chi tiết khác')}</Label>
                <Textarea
                  id="otherDetails"
                  value={formData.otherDetails}
                  onChange={(e) => handleInputChange('otherDetails', e.target.value)}
                  placeholder={t('admin.facilities.otherDetails.placeholder', 'Nhập thông tin bổ sung (giờ mở cửa, quy định sử dụng, v.v.)')}
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Link href="/admin-dashboard/facilities">
                  <Button variant="outline" type="button">
                    {t('admin.action.cancel', 'Hủy')}
                  </Button>
                </Link>
                <Button type="submit" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? t('admin.action.saving', 'Đang lưu...') : t('admin.action.save', 'Lưu')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
} 