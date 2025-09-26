"use client";

import React, { useState, useEffect } from 'react';
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
import { ArrowLeft, Save, Clock, Calendar } from 'lucide-react';
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
    openingHours: '',
    openingSchedule: JSON.stringify({
      mon: { open: true, from: '06:00', to: '22:00' },
      tue: { open: true, from: '06:00', to: '22:00' },
      wed: { open: true, from: '06:00', to: '22:00' },
      thu: { open: true, from: '06:00', to: '22:00' },
      fri: { open: true, from: '06:00', to: '22:00' },
      sat: { open: true, from: '06:00', to: '22:00' },
      sun: { open: true, from: '06:00', to: '22:00' }
    })
  });

  // State cho lịch tuần
  const [weeklySchedule, setWeeklySchedule] = useState({
    mon: { open: true, from: '06:00', to: '22:00' },
    tue: { open: true, from: '06:00', to: '22:00' },
    wed: { open: true, from: '06:00', to: '22:00' },
    thu: { open: true, from: '06:00', to: '22:00' },
    fri: { open: true, from: '06:00', to: '22:00' },
    sat: { open: true, from: '06:00', to: '22:00' },
    sun: { open: true, from: '06:00', to: '22:00' }
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
      // Cập nhật openingSchedule từ weeklySchedule
      const submitData = {
        ...formData,
        openingSchedule: JSON.stringify(weeklySchedule)
      };
      await facilitiesApi.create(submitData);
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

  // Hàm xử lý thay đổi lịch tuần
  const handleScheduleChange = (day: string, field: 'open' | 'from' | 'to', value: any) => {
    const newSchedule = {
      ...weeklySchedule,
      [day]: {
        ...weeklySchedule[day as keyof typeof weeklySchedule],
        [field]: value
      }
    };
    setWeeklySchedule(newSchedule);
    
    // Cập nhật openingHours khi thay đổi lịch
    const newOpeningHours = generateOpeningHoursFromSchedule(newSchedule);
    setFormData(prev => ({
      ...prev,
      openingHours: newOpeningHours
    }));
  };

  // Hàm tạo giờ mở cửa từ lịch tuần (cho hiển thị)
  const generateOpeningHours = () => {
    return generateOpeningHoursFromSchedule(weeklySchedule);
  };

  // Hàm tạo giờ mở cửa từ lịch tuần (có thể dùng với bất kỳ schedule nào)
  const generateOpeningHoursFromSchedule = (schedule: typeof weeklySchedule) => {
    const days = Object.keys(schedule);
    const openDays = days.filter(day => schedule[day as keyof typeof schedule].open);
    
    if (openDays.length === 0) return 'Đóng cửa';
    if (openDays.length === 7) {
      const firstDay = schedule.mon;
      return `${firstDay.from} - ${firstDay.to}`;
    }
    
    return openDays.map(day => {
      const daySchedule = schedule[day as keyof typeof schedule];
      const dayNames = { mon: 'T2', tue: 'T3', wed: 'T4', thu: 'T5', fri: 'T6', sat: 'T7', sun: 'CN' };
      return `${dayNames[day as keyof typeof dayNames]}: ${daySchedule.from}-${daySchedule.to}`;
    }).join(', ');
  };

  // Cập nhật openingHours khi component mount
  useEffect(() => {
    const initialOpeningHours = generateOpeningHoursFromSchedule(weeklySchedule);
    setFormData(prev => ({
      ...prev,
      openingHours: initialOpeningHours
    }));
  }, []);

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

              {/* Weekly Schedule */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <Label className="text-base font-semibold">{t('admin.facilities.weeklySchedule', 'Lịch hoạt động theo tuần')}</Label>
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(weeklySchedule).map(([day, schedule]) => {
                    const dayNames = { 
                      mon: 'Thứ 2', tue: 'Thứ 3', wed: 'Thứ 4', thu: 'Thứ 5', 
                      fri: 'Thứ 6', sat: 'Thứ 7', sun: 'Chủ nhật' 
                    };
                    
                    return (
                      <div key={day} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="w-20">
                          <Label className="text-sm font-medium">{dayNames[day as keyof typeof dayNames]}</Label>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={schedule.open}
                            onCheckedChange={(checked) => handleScheduleChange(day, 'open', checked)}
                          />
                          <span className="text-sm text-gray-600">
                            {schedule.open ? 'Mở cửa' : 'Đóng cửa'}
                          </span>
                        </div>
                        
                        {schedule.open && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <Label className="text-sm">Từ:</Label>
                              <Input
                                type="time"
                                value={schedule.from}
                                onChange={(e) => handleScheduleChange(day, 'from', e.target.value)}
                                className="w-24 h-8"
                              />
                            </div>
                            <div className="flex items-center gap-1">
                              <Label className="text-sm">Đến:</Label>
                              <Input
                                type="time"
                                value={schedule.to}
                                onChange={(e) => handleScheduleChange(day, 'to', e.target.value)}
                                className="w-24 h-8"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Xem trước:</strong> {generateOpeningHours()}
                  </p>
                </div>
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