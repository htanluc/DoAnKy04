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
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Save, 
  Calendar,
  MapPin,
  FileText,
  Clock,
  AlertCircle
} from 'lucide-react';
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
        title: t('admin.error.validation', 'Lỗi xác thực'),
        description: t('validation.required', 'Vui lòng nhập đầy đủ thông tin'),
        variant: "destructive",
      });
      return;
    }

    // Validate time
    const startTime = new Date(formData.startTime);
    const endTime = new Date(formData.endTime);
    
    if (startTime >= endTime) {
      toast({
        title: t('admin.error.validation', 'Lỗi xác thực'),
        description: t('admin.events.time.invalid', 'Thời gian kết thúc phải sau thời gian bắt đầu'),
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      await eventsApi.create(formData);
      toast({
        title: t('admin.success.create', 'Thành công'),
        description: t('admin.events.createSuccess', 'Đã tạo sự kiện mới'),
      });
      router.push('/admin-dashboard/events');
    } catch (error) {
      toast({
        title: t('admin.error.create', 'Lỗi'),
        description: t('admin.events.createError', 'Không thể tạo sự kiện'),
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

  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getDefaultEndTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 2); // Default 2 hours later
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Set default times when component mounts
  React.useEffect(() => {
    if (!formData.startTime) {
      setFormData(prev => ({
        ...prev,
        startTime: getCurrentDateTime(),
        endTime: getDefaultEndTime()
      }));
    }
  }, []);

  return (
    <AdminLayout title={t('admin.events.create', 'Tạo sự kiện mới')}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center space-x-4">
              <Link href="/admin-dashboard/events">
                <Button variant="outline" size="sm" className="flex items-center gap-2 hover:bg-gray-50">
                  <ArrowLeft className="h-4 w-4" />
                  {t('admin.action.back', 'Quay lại')}
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  {t('admin.events.create', 'Tạo sự kiện mới')}
                </h1>
                <p className="text-gray-600 mt-2">
                  {t('admin.events.createDesc', 'Tổ chức sự kiện cho cư dân')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card className="shadow-sm border-0 bg-white">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl flex items-center gap-2 text-gray-800">
              <FileText className="h-6 w-6 text-blue-600" />
              {t('admin.events.details', 'Chi tiết sự kiện')}
            </CardTitle>
            <p className="text-sm text-gray-600 font-normal">
              {t('admin.events.fillDetails', 'Fill in complete information to create a new event')}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Title Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <Label htmlFor="title" className="text-base font-semibold text-gray-700">
                    {t('admin.events.name', 'Tên sự kiện')} *
                  </Label>
                </div>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder={t('admin.events.namePlaceholder', 'Enter event name...')}
                  className="h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Description Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  <Label htmlFor="description" className="text-base font-semibold text-gray-700">
                    {t('admin.events.description', 'Mô tả')} *
                  </Label>
                </div>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={t('admin.events.descriptionPlaceholder', 'Detailed description of the event...')}
                  rows={5}
                  className="border-gray-300 focus:border-green-500 focus:ring-green-500 resize-none"
                  required
                />
              </div>

              {/* Location Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-purple-600" />
                  <Label htmlFor="location" className="text-base font-semibold text-gray-700">
                    {t('admin.events.location', 'Địa điểm')} *
                  </Label>
                </div>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder={t('admin.events.locationPlaceholder', 'Enter event location...')}
                  className="h-12 text-base border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  required
                />
              </div>

              <Separator className="my-8" />

              {/* Time Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <Label className="text-base font-semibold text-gray-700">
                    {t('admin.events.timeSettings', 'Time Settings')}
                  </Label>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Start Time */}
                  <div className="space-y-3">
                    <Label htmlFor="startTime" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-green-600" />
                      {t('admin.events.startDate', 'Ngày bắt đầu')} *
                    </Label>
                    <Input
                      id="startTime"
                      type="datetime-local"
                      value={formData.startTime}
                      onChange={(e) => handleInputChange('startTime', e.target.value)}
                      className="h-12 border-gray-300 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>

                  {/* End Time */}
                  <div className="space-y-3">
                    <Label htmlFor="endTime" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-red-600" />
                      {t('admin.events.endDate', 'Ngày kết thúc')} *
                    </Label>
                    <Input
                      id="endTime"
                      type="datetime-local"
                      value={formData.endTime}
                      onChange={(e) => handleInputChange('endTime', e.target.value)}
                      className="h-12 border-gray-300 focus:border-red-500 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>

                {/* Time Validation Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                                             <p className="font-medium mb-1">{t('admin.events.timeValidation.title', 'Time Note')}</p>
                       <p>{t('admin.events.timeValidation.desc', 'End time must be at least 30 minutes after start time')}</p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-8" />

              {/* Submit Section */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                <Link href="/admin-dashboard/events" className="w-full sm:w-auto">
                  <Button variant="outline" type="button" className="w-full sm:w-auto h-12 px-8 hover:bg-gray-50">
                    {t('admin.action.cancel', 'Hủy')}
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full sm:w-auto h-12 px-8 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t('admin.action.saving', 'Đang lưu...')}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                                             {t('admin.action.saveEvent', 'Save Event')}
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