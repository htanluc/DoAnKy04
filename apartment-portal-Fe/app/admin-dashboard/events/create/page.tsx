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
import { eventsApi, EventCreateRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function CreateEventPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EventCreateRequest>({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    location: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim() || 
        !formData.startTime || !formData.endTime || !formData.location.trim()) {
      toast({
        title: t('admin.error.load','Lỗi'),
        description: t('validation.required','Vui lòng nhập đầy đủ thông tin'),
        variant: "destructive",
      });
      return;
    }

    // Validate time
    const startTime = new Date(formData.startTime);
    const endTime = new Date(formData.endTime);
    
    if (startTime >= endTime) {
      toast({
        title: t('admin.error.load','Lỗi'),
        description: t('admin.events.time.invalid','Thời gian kết thúc phải sau thời gian bắt đầu'),
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await eventsApi.create(formData);
      toast({
        title: t('admin.success.save','Lưu thành công'),
        description: t('admin.events.createSuccess','Đã tạo sự kiện mới'),
      });
      router.push('/admin-dashboard/events');
    } catch (error) {
      toast({
        title: t('admin.error.save','Không thể lưu dữ liệu'),
        description: t('admin.events.createError','Không thể tạo sự kiện'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof EventCreateRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <AdminLayout title={t('admin.events.create','Tạo sự kiện mới')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin-dashboard/events">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('admin.action.back', 'Quay lại')}
              </Button>
            </Link>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {t('admin.events.create','Tạo sự kiện mới')}
              </h2>
              <p className="text-gray-600">
                {t('admin.events.createDesc','Tổ chức sự kiện cho cư dân')}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.events.details','Chi tiết sự kiện')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">{t('admin.events.name','Tên sự kiện')} *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder={t('admin.events.name','Tên sự kiện')}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">{t('admin.events.description','Mô tả')} *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={t('admin.events.description','Mô tả')}
                  rows={4}
                  required
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">{t('admin.events.location','Địa điểm')} *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder={t('admin.events.location','Địa điểm')}
                  required
                />
              </div>

              {/* Start Time */}
              <div className="space-y-2">
                <Label htmlFor="startTime">{t('admin.events.startDate','Ngày bắt đầu')} *</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  required
                />
              </div>

              {/* End Time */}
              <div className="space-y-2">
                <Label htmlFor="endTime">{t('admin.events.endDate','Ngày kết thúc')} *</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Link href="/admin-dashboard/events">
                  <Button variant="outline" type="button">
                    {t('admin.action.cancel','Hủy')}
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