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
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { facilitiesApi, FacilityCreateRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function CreateFacilityPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FacilityCreateRequest>({
    name: '',
    description: '',
    capacity: 0,
    otherDetails: '',
    usageFee: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim() || formData.capacity <= 0) {
      toast({
        title: t('admin.error.save', 'Lỗi'),
        description: t('admin.facilities.createError', 'Không thể tạo tiện ích'),
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

              {/* Capacity */}
              <div className="space-y-2">
                <Label htmlFor="capacity">{t('admin.facilities.capacity', 'Sức chứa')} *</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => handleInputChange('capacity', parseInt(e.target.value) || 0)}
                  placeholder={t('admin.facilities.capacity.placeholder', 'Nhập sức chứa tối đa')}
                  required
                />
                <p className="text-sm text-gray-500">
                  {t('admin.facilities.capacity.desc', 'Số người tối đa có thể sử dụng tiện ích cùng lúc')}
                </p>
              </div>

              {/* Usage Fee */}
              <div className="space-y-2">
                <Label htmlFor="usageFee">{t('admin.facilities.usageFee', 'Phí sử dụng')}</Label>
                <Input
                  id="usageFee"
                  value={formData.usageFee || ''}
                  onChange={(e) => handleInputChange('usageFee', e.target.value)}
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