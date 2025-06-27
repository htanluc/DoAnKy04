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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { announcementsApi, Announcement, AnnouncementUpdateRequest, AnnouncementType, TargetAudience } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function EditAnnouncementPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const announcementId = parseInt(params.id as string);
  
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<AnnouncementUpdateRequest>({
    title: '',
    content: '',
    type: 'REGULAR',
    targetAudience: 'ALL_RESIDENTS',
    isActive: true,
  });

  const fetchAnnouncement = async () => {
    try {
      setLoading(true);
      const data = await announcementsApi.getById(announcementId);
      setAnnouncement(data);
      setFormData({
        title: data.title,
        content: data.content,
        type: data.type,
        targetAudience: data.targetAudience,
        isActive: data.isActive,
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải thông tin thông báo",
        variant: "destructive",
      });
      router.push('/admin-dashboard/announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title?.trim() || !formData.content?.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      await announcementsApi.update(announcementId, formData);
      toast({
        title: "Thành công",
        description: "Đã cập nhật thông báo",
      });
      router.push(`/admin-dashboard/announcements/${announcementId}`);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật thông báo",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof AnnouncementUpdateRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    if (announcementId) {
      fetchAnnouncement();
    }
  }, [announcementId]);

  if (loading) {
    return (
      <AdminLayout title="Chỉnh sửa thông báo">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!announcement) {
    return (
      <AdminLayout title="Không tìm thấy thông báo">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy thông báo</h2>
          <p className="text-gray-600 mb-4">Thông báo bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Link href="/admin-dashboard/announcements">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại danh sách
            </Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Chỉnh sửa thông báo">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href={`/admin-dashboard/announcements/${announcement.id}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            </Link>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Chỉnh sửa thông báo
              </h2>
              <p className="text-gray-600">
                Cập nhật thông tin thông báo
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
                <Link href={`/admin-dashboard/announcements/${announcement.id}`}>
                  <Button variant="outline" type="button">
                    Hủy
                  </Button>
                </Link>
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Lưu thay đổi
                    </>
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