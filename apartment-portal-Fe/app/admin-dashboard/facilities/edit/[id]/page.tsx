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
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Save, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Trash2, 
  Building2, 
  MapPin, 
  Users, 
  Clock, 
  DollarSign, 
  FileText,
  Settings,
  Loader2,
  CheckCircle2,
  XCircle
} from 'lucide-react';
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
    location: '',
    capacity: 0,
    capacityType: 'INDIVIDUAL',
    groupSize: undefined,
    otherDetails: '',
    usageFee: 0,
    openingHours: '',
    isVisible: true,
  });

  const fetchFacility = async () => {
    try {
      setLoading(true);
      const data = await facilitiesApi.getById(facilityId);
      setFacility(data);
      setFormData({
        name: data.name,
        description: data.description,
        location: data.location || '',
        capacity: data.capacity,
        capacityType: data.capacityType || 'INDIVIDUAL',
        groupSize: data.groupSize || undefined,
        otherDetails: data.otherDetails || '',
        usageFee: data.usageFee || 0,
        openingHours: data.openingHours || '',
        isVisible: data.isVisible !== undefined ? data.isVisible : true,
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

  const handleDelete = async () => {
    if (!confirm(t('admin.facilities.deleteConfirm', 'Bạn có chắc chắn muốn xóa tiện ích này?'))) {
      return;
    }

    try {
      setSaving(true);
      await facilitiesApi.delete(facilityId);
      toast({
        title: t('admin.success.delete', 'Thành công'),
        description: t('admin.facilities.deleteSuccess', 'Đã xóa tiện ích'),
      });
      router.push('/admin-dashboard/facilities');
    } catch (error) {
      toast({
        title: t('admin.error.delete', 'Lỗi'),
        description: t('admin.facilities.deleteError', 'Không thể xóa tiện ích'),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };



  useEffect(() => {
    if (facilityId) {
      fetchFacility();
    }
  }, [facilityId]);

  if (loading) {
    return (
      <AdminLayout title={t('admin.facilities.edit', 'Chỉnh sửa tiện ích')}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
              <Building2 className="h-6 w-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-gray-900">{t('admin.facilities.editLoading', 'Đang tải...')}</p>
              <p className="text-sm text-gray-500">Đang tải thông tin tiện ích</p>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!facility) {
    return (
      <AdminLayout title={t('admin.facilities.notFound', 'Không tìm thấy cơ sở vật chất')}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-6 max-w-md">
            <div className="relative">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="h-10 w-10 text-red-500" />
              </div>
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-gray-900">{t('admin.facilities.notFoundTitle', 'Không tìm thấy cơ sở vật chất')}</h2>
              <p className="text-gray-600 leading-relaxed">{t('admin.facilities.notFoundDescription', 'Cơ sở vật chất bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.')}</p>
            </div>
            <Link href="/admin-dashboard/facilities">
              <Button variant="outline" size="lg" className="px-6">
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('admin.action.back', 'Quay lại')}
              </Button>
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={t('admin.facilities.edit', 'Chỉnh sửa tiện ích')}>
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/admin-dashboard/facilities/${facility.id}`}>
                <Button variant="outline" size="sm" className="hover:bg-white/80">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  {t('admin.action.back', 'Quay lại')}
                </Button>
              </Link>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {t('admin.facilities.edit', 'Chỉnh sửa tiện ích')}
                  </h1>
                  <p className="text-gray-600">
                    {t('admin.facilities.editDesc', 'Cập nhật thông tin tiện ích')}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={facility.isVisible ? "default" : "secondary"} className="px-3 py-1">
                {facility.isVisible ? (
                  <>
                    <Eye className="h-3 w-3 mr-1" />
                    {t('admin.facilities.visible', 'Hiển thị')}
                  </>
                ) : (
                  <>
                    <EyeOff className="h-3 w-3 mr-1" />
                    {t('admin.facilities.hidden', 'Ẩn')}
                  </>
                )}
              </Badge>
            </div>
          </div>
        </div>

        {/* Form */}
        <Card className="shadow-lg border-0 bg-white">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Settings className="h-4 w-4 text-blue-600" />
              </div>
              <CardTitle className="text-xl font-semibold text-gray-900">
                {t('admin.facilities.info', 'Thông tin tiện ích')}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Thông tin cơ bản</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <span>{t('admin.facilities.name', 'Tên tiện ích')} *</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder={t('admin.facilities.name.placeholder', 'Nhập tên tiện ích')}
                      className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>{t('admin.facilities.location', 'Vị trí')}</span>
                    </Label>
                    <Input
                      id="location"
                      value={formData.location || ''}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder={t('admin.facilities.location.placeholder', 'Nhập vị trí tiện ích (ví dụ: Tầng 1, Khu A)')}
                      className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span>{t('admin.facilities.description', 'Mô tả')} *</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder={t('admin.facilities.description.placeholder', 'Nhập mô tả tiện ích')}
                    rows={4}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                    required
                  />
                </div>
              </div>

              {/* Capacity & Schedule Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Users className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Sức chứa & Lịch trình</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Capacity Type */}
                  <div className="space-y-2">
                    <Label htmlFor="capacityType" className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>{t('admin.facilities.capacityType', 'Loại sức chứa')} *</span>
                    </Label>
                    <select
                      id="capacityType"
                      value={formData.capacityType || 'INDIVIDUAL'}
                      onChange={(e) => handleInputChange('capacityType', e.target.value)}
                      className="h-11 w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      required
                      aria-label="Loại sức chứa"
                      title="Loại sức chứa"
                    >
                      <option value="INDIVIDUAL">{t('admin.facilities.capacityType.individual', 'Cá nhân')}</option>
                      <option value="GROUP">{t('admin.facilities.capacityType.group', 'Nhóm')}</option>
                    </select>
                  </div>

                  {/* Capacity */}
                  <div className="space-y-2">
                    <Label htmlFor="capacity" className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>{t('admin.facilities.capacity', 'Sức chứa')} *</span>
                    </Label>
                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      value={formData.capacity}
                      onChange={(e) => handleInputChange('capacity', parseInt(e.target.value))}
                      placeholder={formData.capacityType === 'INDIVIDUAL' 
                        ? t('admin.facilities.capacity.placeholder', 'Nhập số người tối đa') 
                        : t('admin.facilities.capacity.group.placeholder', 'Nhập số nhóm tối đa')}
                      className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Group Size - chỉ hiển thị khi chọn GROUP */}
                {formData.capacityType === 'GROUP' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="groupSize" className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>{t('admin.facilities.groupSize', 'Số người trong nhóm')} *</span>
                      </Label>
                      <Input
                        id="groupSize"
                        type="number"
                        min="1"
                        value={formData.groupSize || ''}
                        onChange={(e) => handleInputChange('groupSize', parseInt(e.target.value) || undefined)}
                        placeholder={t('admin.facilities.groupSize.placeholder', 'Nhập số người trong mỗi nhóm')}
                        className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div></div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Opening Hours */}
                  <div className="space-y-2">
                    <Label htmlFor="openingHours" className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{t('admin.facilities.openingHours', 'Giờ mở cửa')}</span>
                    </Label>
                    <Input
                      id="openingHours"
                      value={formData.openingHours || ''}
                      onChange={(e) => handleInputChange('openingHours', e.target.value)}
                      placeholder={t('admin.facilities.openingHours.placeholder', 'Nhập giờ mở cửa (ví dụ: 06:00-22:00)')}
                      className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div></div>
                </div>
              </div>

              <Separator className="my-8" />

              {/* Pricing & Details Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2 mb-4">
                  <DollarSign className="h-5 w-5 text-yellow-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Phí sử dụng & Chi tiết</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Usage Fee */}
                  <div className="space-y-2">
                    <Label htmlFor="usageFee" className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span>{t('admin.facilities.usageFee', 'Phí sử dụng')}</span>
                    </Label>
                    <Input
                      id="usageFee"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.usageFee || 0}
                      onChange={(e) => handleInputChange('usageFee', parseFloat(e.target.value) || 0)}
                      placeholder={t('admin.facilities.usageFee.placeholder', 'Nhập phí sử dụng (nếu có)')}
                      className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Other Details */}
                <div className="space-y-2">
                  <Label htmlFor="otherDetails" className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <span>{t('admin.facilities.otherDetails', 'Chi tiết khác')}</span>
                  </Label>
                  <Textarea
                    id="otherDetails"
                    value={formData.otherDetails}
                    onChange={(e) => handleInputChange('otherDetails', e.target.value)}
                    placeholder={t('admin.facilities.otherDetails.placeholder', 'Nhập thông tin bổ sung (quy định sử dụng, v.v.)')}
                    rows={3}
                    className="border-gray-200 focus:border-blue-500 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>

              <Separator className="my-8" />

              {/* Visibility Settings Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Eye className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Cài đặt hiển thị</h3>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="space-y-4">
                    <Label className="text-sm font-medium text-gray-700 flex items-center space-x-1">
                      <Settings className="h-4 w-4 text-gray-500" />
                      <span>{t('admin.facilities.visibility', 'Trạng thái hiển thị')}</span>
                    </Label>
                    
                    <div className="flex items-center space-x-6">
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          id="visible"
                          name="visibility"
                          checked={formData.isVisible === true}
                          onChange={() => handleInputChange('isVisible', true)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          aria-label="Hiển thị tiện ích"
                          title="Hiển thị tiện ích"
                        />
                        <Label htmlFor="visible" className="flex items-center space-x-2 cursor-pointer">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <Eye className="h-4 w-4 text-green-600" />
                          </div>
                          <span className="font-medium text-gray-900">{t('admin.facilities.visible', 'Hiển thị')}</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          id="hidden"
                          name="visibility"
                          checked={formData.isVisible === false}
                          onChange={() => handleInputChange('isVisible', false)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          aria-label="Ẩn tiện ích"
                          title="Ẩn tiện ích"
                        />
                        <Label htmlFor="hidden" className="flex items-center space-x-2 cursor-pointer">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <EyeOff className="h-4 w-4 text-gray-600" />
                          </div>
                          <span className="font-medium text-gray-900">{t('admin.facilities.hidden', 'Ẩn')}</span>
                        </Label>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-800 flex items-start space-x-2">
                        <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <span>{t('admin.facilities.visibilityDesc', 'Tiện ích bị ẩn sẽ không hiển thị cho cư dân khi họ xem danh sách tiện ích')}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-8" />

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-6">
                <Button 
                  variant="destructive" 
                  type="button" 
                  onClick={handleDelete}
                  disabled={saving}
                  className="flex items-center space-x-2 px-6 py-2.5 hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>{t('admin.action.delete', 'Xóa')}</span>
                </Button>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Link href={`/admin-dashboard/facilities/${facility.id}`} className="w-full sm:w-auto">
                    <Button variant="outline" type="button" className="w-full sm:w-auto px-6 py-2.5 border-gray-300 hover:bg-gray-50">
                      <span>{t('admin.action.cancel', 'Hủy')}</span>
                    </Button>
                  </Link>
                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="w-full sm:w-auto px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        <span>{t('admin.action.saving', 'Đang lưu...')}</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        <span>{t('admin.action.save', 'Lưu')}</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
} 