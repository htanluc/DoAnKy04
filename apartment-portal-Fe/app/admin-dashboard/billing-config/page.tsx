"use client";

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings,
  DollarSign,
  AlertCircle
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
      <AdminLayout title={t('admin.billing-config.title')}>
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
      <AdminLayout title={t('admin.billing-config.title')}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium">
              {t('admin.error.load')}
            </p>
            <p className="text-gray-600 mt-2">{apartmentsError}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
              variant="outline"
            >
              {t('admin.action.retry')}
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={t('admin.billing-config.title')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('admin.billing-config.title')}</h1>
            <p className="text-gray-600 mt-1">
              {t('admin.billing-config.subtitle','Quản lý cấu hình phí dịch vụ cho từng tháng/năm')}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="current" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="current">{t('admin.billing-config.current','Cấu Hình Hiện Tại')}</TabsTrigger>
            <TabsTrigger value="config">{t('admin.billing-config.new','Cấu Hình Mới')}</TabsTrigger>
            <TabsTrigger value="history">{t('admin.billing-config.history','Lịch Sử')}</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {t('admin.billing-config.currentMonth','Cấu Hình Phí Tháng')} {currentMonth}/{currentYear}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {feeLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  </div>
                ) : serviceFeeConfig ? (
                  <CurrentBillingConfig year={serviceFeeConfig.year} month={serviceFeeConfig.month} />
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                    <p className="text-gray-600">{t('admin.noData')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="config" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  {t('admin.billing-config.create','Tạo Cấu Hình Phí Mới')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <YearlyBillingConfigForm />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {t('admin.billing-config.history','Lịch Sử Cấu Hình')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BillingHistoryComponent />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
