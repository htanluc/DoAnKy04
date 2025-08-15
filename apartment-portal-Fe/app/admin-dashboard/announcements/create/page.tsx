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
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { announcementsApi, AnnouncementCreateRequest, AnnouncementType, TargetAudience } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function CreateAnnouncementPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AnnouncementCreateRequest>({
    title: '',
    content: '',
    type: 'REGULAR',
    targetAudience: 'ALL_RESIDENTS',
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: t('admin.error.load','Lỗi'),
        description: t('validation.required','Vui lòng nhập đầy đủ thông tin'),
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await announcementsApi.create(formData);
      toast({
        title: t('admin.success.save','Lưu thành công'),
        description: t('admin.announcements.createSuccess','Đã tạo thông báo mới'),
      });
      router.push('/admin-dashboard/announcements');
    } catch (error) {
      toast({
        title: t('admin.error.save','Không thể lưu dữ liệu'),
        description: t('admin.announcements.createError','Không thể tạo thông báo'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof AnnouncementCreateRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <AdminLayout title={t('admin.announcements.create','Tạo thông báo mới')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin-dashboard/announcements">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('admin.action.back','Quay lại')}
              </Button>
            </Link>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {t('admin.announcements.create','Tạo thông báo mới')}
              </h2>
              <p className="text-gray-600">
                {t('admin.announcements.createDesc','Tạo một thông báo gửi đến cư dân')}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.announcements.info', 'Thông tin thông báo')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">{t('admin.announcements.titleLabel', 'Tiêu đề')} *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder={t('admin.announcements.title.placeholder', 'Nhập tiêu đề thông báo')}
                  required
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">{t('admin.announcements.contentLabel', 'Nội dung')} *</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => handleInputChange('content', e.target.value)}
                  placeholder={t('admin.announcements.content.placeholder', 'Nhập nội dung thông báo')}
                  rows={6}
                  required
                />
              </div>

              {/* Type */}
              <div className="space-y-2">
                <Label htmlFor="type">{t('admin.announcements.type', 'Loại thông báo')}</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: AnnouncementType) => handleInputChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('admin.announcements.type.placeholder', 'Chọn loại thông báo')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEWS">{t('admin.announcements.type.news', 'Tin tức')}</SelectItem>
                    <SelectItem value="REGULAR">{t('admin.announcements.type.regular', 'Thường')}</SelectItem>
                    <SelectItem value="URGENT">{t('admin.announcements.type.urgent', 'Khẩn cấp')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Target Audience */}
              <div className="space-y-2">
                <Label htmlFor="targetAudience">{t('admin.announcements.targetAudience', 'Đối tượng nhận')}</Label>
                <Select
                  value={formData.targetAudience}
                  onValueChange={(value: TargetAudience) => handleInputChange('targetAudience', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('admin.announcements.targetAudience.placeholder', 'Chọn đối tượng nhận')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL_RESIDENTS">{t('admin.announcements.targetAudience.all', 'Tất cả cư dân')}</SelectItem>
                    <SelectItem value="TOWER_A_RESIDENTS">{t('admin.announcements.targetAudience.towerA', 'Cư dân tòa A')}</SelectItem>
                    <SelectItem value="TOWER_B_RESIDENTS">{t('admin.announcements.targetAudience.towerB', 'Cư dân tòa B')}</SelectItem>
                    <SelectItem value="SPECIFIC_APARTMENTS">{t('admin.announcements.targetAudience.specific', 'Căn hộ cụ thể')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive">{t('admin.announcements.isActive', 'Trạng thái hoạt động')}</Label>
                  <p className="text-sm text-gray-500">
                    {t('admin.announcements.isActive.desc', 'Thông báo sẽ hiển thị cho cư dân khi được kích hoạt')}
                  </p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Link href="/admin-dashboard/announcements">
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