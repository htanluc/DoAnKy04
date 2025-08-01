"use client";

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n';
import YearlyBillingForm from '@/components/admin/YearlyBillingForm';
import CurrentBillingConfig from '@/components/admin/CurrentBillingConfig';
import BillingHistoryComponent from '@/components/admin/BillingHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useApartments, Apartment } from '@/hooks/use-apartments';
import { 
  Calculator, 
  Calendar, 
  Building, 
  DollarSign, 
  Info,
  CheckCircle,
  AlertCircle,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function YearlyBillingPage() {
  const { t } = useLanguage();
  const { apartments, loading, error } = useApartments();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading) {
    return (
      <AdminLayout title={`Tạo biểu phí năm ${currentYear}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title={`Tạo biểu phí năm ${currentYear}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium">Lỗi tải dữ liệu</p>
            <p className="text-gray-600 mt-2">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              variant="outline"
            >
              Thử lại
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Tạo biểu phí năm ${currentYear}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calculator className="h-6 w-6" />
              Tạo biểu phí năm {currentYear}
            </h2>
            <p className="text-gray-600">
              Tạo cấu hình phí dịch vụ cho tất cả căn hộ hoặc một căn hộ cụ thể trong năm {currentYear}
            </p>
          </div>
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Phạm vi thời gian
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">12 tháng</p>
              <p className="text-xs text-gray-500">Từ tháng 1 đến tháng 12 năm {currentYear}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Building className="h-4 w-4" />
                Số căn hộ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{apartments.length}</p>
              <p className="text-xs text-gray-500">Căn hộ có sẵn</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Loại phí
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">3 loại</p>
              <p className="text-xs text-gray-500">Dịch vụ, nước, gửi xe</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="create">Tạo biểu phí</TabsTrigger>
            <TabsTrigger value="config">Cấu hình phí</TabsTrigger>
            <TabsTrigger value="history">Lịch sử</TabsTrigger>
            <TabsTrigger value="info">Thông tin</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-4">
            <YearlyBillingForm apartments={apartments} />
          </TabsContent>

          <TabsContent value="config" className="space-y-4">
            <CurrentBillingConfig year={currentYear} month={currentMonth} />
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <BillingHistoryComponent />
          </TabsContent>

          <TabsContent value="info" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* How it works */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Cách hoạt động
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Badge variant="secondary" className="mt-1">1</Badge>
                      <div>
                        <p className="font-medium">Chọn phạm vi</p>
                        <p className="text-sm text-gray-600">Chọn tất cả căn hộ hoặc căn hộ cụ thể cho năm {currentYear}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge variant="secondary" className="mt-1">2</Badge>
                      <div>
                        <p className="font-medium">Cấu hình đơn giá</p>
                        <p className="text-sm text-gray-600">Nhập đơn giá cho 3 loại phí: dịch vụ, nước, gửi xe</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Badge variant="secondary" className="mt-1">3</Badge>
                      <div>
                        <p className="font-medium">Hệ thống tự động tạo cấu hình</p>
                        <p className="text-sm text-gray-600">Tạo cấu hình phí dịch vụ cho 12 tháng</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Fee calculation */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Cách tính phí
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="border-l-4 border-blue-500 pl-3">
                      <p className="font-medium text-sm">Phí dịch vụ</p>
                      <p className="text-xs text-gray-600">Diện tích (m²) × Đơn giá (VND/m²)</p>
                    </div>
                    <div className="border-l-4 border-green-500 pl-3">
                      <p className="font-medium text-sm">Phí nước</p>
                      <p className="text-xs text-gray-600">Lượng tiêu thụ (m³) × Đơn giá (VND/m³)</p>
                    </div>
                    <div className="border-l-4 border-orange-500 pl-3">
                      <p className="font-medium text-sm">Phí gửi xe</p>
                      <p className="text-xs text-gray-600">Số xe × Đơn giá theo loại xe</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Important notes */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Lưu ý quan trọng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Chỉ tạo cấu hình</p>
                          <p className="text-xs text-gray-600">Hệ thống chỉ tạo cấu hình phí dịch vụ, không tạo hóa đơn</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Chọn năm linh hoạt</p>
                          <p className="text-xs text-gray-600">Có thể tạo biểu phí cho năm hiện tại và các năm khác</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Tự động bỏ qua trùng lặp</p>
                          <p className="text-xs text-gray-600">Hệ thống tự động bỏ qua cấu hình đã tồn tại</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Cấu hình theo tháng</p>
                          <p className="text-xs text-gray-600">Có thể chỉnh sửa cấu hình cho từng tháng riêng biệt</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* API Information */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Thông tin API
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium text-sm">Endpoint chính:</p>
                      <code className="text-xs text-blue-600">POST /api/admin/yearly-billing/generate-current-year</code>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium text-sm">Cấu hình phí:</p>
                      <code className="text-xs text-blue-600">POST /api/admin/yearly-billing/fee-config</code>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium text-sm">Cập nhật tháng:</p>
                      <code className="text-xs text-blue-600">PUT /api/admin/yearly-billing/config/{'{year}'}/{'{month}'}</code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
} 