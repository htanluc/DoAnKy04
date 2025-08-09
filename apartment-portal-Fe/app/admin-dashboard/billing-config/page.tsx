"use client";

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings,
  DollarSign
} from 'lucide-react';
import { useApartments } from '@/hooks/use-apartments';
import { useYearlyBilling, YearlyBillingConfig } from '@/hooks/use-yearly-billing';
import YearlyBillingConfigForm from '@/components/admin/YearlyBillingConfigForm';
import CurrentBillingConfig from '@/components/admin/CurrentBillingConfig';
import BillingHistoryComponent from '@/components/admin/BillingHistory';

export default function BillingConfigPage() {
  const { t } = useLanguage();
  const { apartments, loading: apartmentsLoading, error: apartmentsError } = useApartments();
  const [serviceFeeConfig, setServiceFeeConfig] = useState<YearlyBillingConfig | null>(null);
  const [feeLoading, setFeeLoading] = useState(true);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const { getMonthlyConfig } = useYearlyBilling();

  // Lấy đơn giá phí dịch vụ tháng/năm hiện tại
  useEffect(() => {
    const loadCurrentConfig = async () => {
      const now = new Date();
      const result = await getMonthlyConfig(now.getFullYear(), now.getMonth() + 1);
      if (result?.success && result.config) {
        setServiceFeeConfig(result.config);
      } else {
        // Sử dụng giá trị mặc định nếu không có config
        setServiceFeeConfig({
          month: now.getMonth() + 1,
          year: now.getFullYear(),
          serviceFeePerM2: 5000,
          waterFeePerM3: 15000,
          motorcycleFee: 50000,
          car4SeatsFee: 200000,
          car7SeatsFee: 250000,
        });
      }
      setFeeLoading(false);
    };
    loadCurrentConfig();
  }, []);

  const formatNumber = (value: number | undefined | null) => {
    if (value === undefined || value === null) return '0';
    return value.toLocaleString('vi-VN');
  };

  if (apartmentsLoading) {
    return (
      <AdminLayout title="Cấu Hình Phí">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">{t('admin.loading')}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (apartmentsError) {
    return (
      <AdminLayout title="Cấu Hình Phí">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium">
              Lỗi tải dữ liệu căn hộ
            </p>
            <p className="text-gray-600 mt-2">{apartmentsError}</p>
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
    <AdminLayout title="Cấu Hình Phí">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Settings className="h-6 w-6" />
              Cấu Hình Phí Dịch Vụ
            </h2>
            <p className="text-gray-600">
              Quản lý và tạo biểu phí cấu hình cho cư dân
            </p>
          </div>
        </div>

        {/* Main Content with Tabs */}
        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create">Tạo Biểu Phí</TabsTrigger>
            <TabsTrigger value="config">Cấu Hình Hiện Tại</TabsTrigger>
            <TabsTrigger value="history">Lịch Sử</TabsTrigger>
          </TabsList>

          {/* Create Billing Tab */}
          <TabsContent value="create" className="space-y-6">
            {/* Current Fee Config Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Đơn giá phí dịch vụ tháng {currentMonth}/{currentYear}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {feeLoading ? (
                  <span>Đang tải...</span>
                ) : serviceFeeConfig ? (
                  <div className="space-y-2 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="font-medium text-gray-700">Phí gửi xe:</div>
                        <div className="pl-4 space-y-1 text-sm">
                          <div>• Xe máy: <b className="text-green-600">{formatNumber(serviceFeeConfig.motorcycleFee)} đ/xe/tháng</b></div>
                          <div>• Xe 4 chỗ: <b className="text-blue-600">{formatNumber(serviceFeeConfig.car4SeatsFee)} đ/xe/tháng</b></div>
                          <div>• Xe 7 chỗ: <b className="text-purple-600">{formatNumber(serviceFeeConfig.car7SeatsFee)} đ/xe/tháng</b></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="font-medium text-gray-700">Phí dịch vụ khác:</div>
                        <div className="pl-4 space-y-1 text-sm">
                          <div>• Phí dịch vụ: <b className="text-blue-600">{formatNumber(serviceFeeConfig.serviceFeePerM2)} đ/m²</b></div>
                          <div>• Phí nước: <b className="text-blue-600">{formatNumber(serviceFeeConfig.waterFeePerM3)} đ/m³</b></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className="text-red-600 mb-4 block">Chưa cấu hình đơn giá tháng này</span>
                )}
              </CardContent>
            </Card>

            {/* Create Billing Form Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Tạo Biểu Phí Cấu Hình
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">📋 Hướng dẫn sử dụng:</h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      <p>• <strong>Tạo biểu phí cấu hình cho năm:</strong> Tạo cấu hình phí dịch vụ cho cả năm</p>
                      <p>• <strong>Lưu ý:</strong> Chỉ dùng chức năng này để thiết lập đơn giá cho từng tháng trong năm</p>
                    </div>
                  </div>
                  <YearlyBillingConfigForm apartments={apartments} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Config Tab */}
          <TabsContent value="config" className="space-y-4">
            <CurrentBillingConfig year={currentYear} month={currentMonth} />
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <BillingHistoryComponent />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
} 