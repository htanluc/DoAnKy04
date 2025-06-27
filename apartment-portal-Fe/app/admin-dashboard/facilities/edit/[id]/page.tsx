"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { facilitiesApi, Facility, FacilityUpdateRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function EditFacilityPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const facilityId = parseInt(params.id as string);
  
  const [facility, setFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<FacilityUpdateRequest>({
    name: '',
    description: '',
    capacity: 0,
    otherDetails: '',
    usageFee: '',
  });

  const fetchFacility = async () => {
    try {
      setLoading(true);
      const data = await facilitiesApi.getById(facilityId);
      setFacility(data);
      setFormData({
        name: data.name,
        description: data.description,
        capacity: data.capacity,
        otherDetails: data.otherDetails || '',
        usageFee: data.usageFee || '',
      });
    } catch (error) {
      toast({
        title: t('admin.error.load', 'Lỗi'),
        description: t('admin.facilities.editError', 'Không thể tải thông tin cơ sở vật chất'),
        variant: "destructive",
      });
      router.push('/admin-dashboard/facilities');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim() || !formData.description?.trim() || !formData.capacity || formData.capacity <= 0) {
      toast({
        title: t('admin.error.incomplete', 'Lỗi'),
        description: t('admin.facilities.editIncomplete', 'Vui lòng điền đầy đủ thông tin'),
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      await facilitiesApi.update(facilityId, formData);
      toast({
        title: t('admin.success.save', 'Thành công'),
        description: t('admin.facilities.editSuccess', 'Đã cập nhật cơ sở vật chất'),
      });
      router.push(`/admin-dashboard/facilities/${facilityId}`);
    } catch (error) {
      toast({
        title: t('admin.error.save', 'Lỗi'),
        description: t('admin.facilities.editError', 'Không thể cập nhật cơ sở vật chất'),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof FacilityUpdateRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    if (facilityId) {
      fetchFacility();
    }
  }, [facilityId]);

  if (loading) {
    return (
      <AdminLayout title={t('admin.facilities.edit', 'Chỉnh sửa tiện ích')}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">{t('admin.facilities.editLoading', 'Đang tải...')}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!facility) {
    return (
      <AdminLayout title={t('admin.facilities.notFound', 'Không tìm thấy cơ sở vật chất')}>
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('admin.facilities.notFoundTitle', 'Không tìm thấy cơ sở vật chất')}</h2>
          <p className="text-gray-600 mb-4">{t('admin.facilities.notFoundDescription', 'Cơ sở vật chất bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.')}</p>
          <Link href="/admin-dashboard/facilities">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('admin.action.back', 'Quay lại')}
            </Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={t('admin.facilities.edit', 'Chỉnh sửa tiện ích')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={`/admin-dashboard/facilities/${facility.id}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('admin.action.back', 'Quay lại')}
              </Button>
            </Link>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {t('admin.facilities.edit', 'Chỉnh sửa tiện ích')}
              </h2>
              <p className="text-gray-600">
                {t('admin.facilities.editDesc', 'Cập nhật thông tin tiện ích')}
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
                  onChange={(e) => handleInputChange('capacity', parseInt(e.target.value))}
                  placeholder={t('admin.facilities.capacity.placeholder', 'Nhập sức chứa tối đa')}
                  required
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

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Link href={`/admin-dashboard/facilities/${facility.id}`}>
                  <Button variant="outline" type="button">
                    {t('admin.action.cancel', 'Hủy')}
                  </Button>
                </Link>
                <Button type="submit" disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? t('admin.action.saving', 'Đang lưu...') : t('admin.action.save', 'Lưu')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
} 