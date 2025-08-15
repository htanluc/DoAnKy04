"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useYearlyBilling, YearlyBillingConfig } from '@/hooks/use-yearly-billing';
import { History, Search, Calendar, AlertCircle, Info } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

export default function BillingHistoryComponent() {
  const { t, language } = useLanguage();
  const { 
    loading, 
    error, 
    getYearlyConfigs 
  } = useYearlyBilling();

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [configs, setConfigs] = useState<YearlyBillingConfig[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const loadYearlyConfigs = async (year: number) => {
    const result = await getYearlyConfigs(year);
    if (result?.success && result.configs) {
      setConfigs(result.configs);
    } else {
      setConfigs([]);
    }
    setHasSearched(true);
  };

  const handleSearch = () => {
    loadYearlyConfigs(selectedYear);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getMonthName = (month: number) => {
    if (language === 'vi') return `Tháng ${month}`;
    try {
      return new Date(2000, month - 1, 1).toLocaleString('en-US', { month: 'long' });
    } catch {
      return `Month ${month}`;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          {t('admin.billing-history.title', 'Lịch sử cấu hình phí dịch vụ')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Search Section */}
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="year" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {t('admin.billing-history.chooseYear', 'Chọn năm')}
              </Label>
              <Input
                id="year"
                type="number"
                min={2020}
                max={2030}
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                placeholder={t('admin.billing-history.inputYearPlaceholder', 'Nhập năm...')}
              />
            </div>
            <Button onClick={handleSearch} disabled={loading} className="min-w-[120px]">
              <Search className="h-4 w-4 mr-2" />
              {loading ? t('admin.loading', 'Đang tải...') : t('admin.action.search', 'Tìm kiếm')}
            </Button>
          </div>

          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {t('admin.billing-history.info', 'Xem lịch sử cấu hình phí dịch vụ theo năm. Hệ thống chỉ hiển thị cấu hình phí dịch vụ, không bao gồm hóa đơn.')}
            </AlertDescription>
          </Alert>

          {/* Results */}
          {hasSearched && (
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {configs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">{t('admin.billing-history.notFound', 'Không tìm thấy cấu hình phí dịch vụ cho năm')} {selectedYear}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">
                      {t('admin.billing-history.yearTitle', 'Cấu hình phí dịch vụ năm')} {selectedYear}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {t('admin.billing-history.totalMonths', 'Tổng cộng')}: {configs.length} {t('admin.yearly-billing.months','tháng')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {configs.map((config) => (
                      <Card key={config.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base flex items-center justify-between">
                            <span>{getMonthName(config.month || 0)}</span>
                            <span className="text-sm text-gray-500">#{config.id}</span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">{t('admin.invoices.feeType.SERVICE_FEE','Phí dịch vụ')}:</span>
                              <span className="font-medium">{formatCurrency(config.serviceFeePerM2)}/m²</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">{t('admin.invoices.feeType.WATER_FEE','Phí nước')}:</span>
                              <span className="font-medium">{formatCurrency(config.waterFeePerM3)}/m³</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">{t('admin.yearly-billing.parking.motorcycle.label','Phí xe máy')}:</span>
                              <span className="font-medium">{formatCurrency(config.motorcycleFee)}/{t('admin.units.perVehiclePerMonth','đ/xe/tháng')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">{t('admin.yearly-billing.parking.car4.label','Phí xe 4 chỗ')}:</span>
                              <span className="font-medium">{formatCurrency(config.car4SeatsFee)}/{t('admin.units.perVehiclePerMonth','đ/xe/tháng')}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">{t('admin.yearly-billing.parking.car7.label','Phí xe 7 chỗ')}:</span>
                              <span className="font-medium">{formatCurrency(config.car7SeatsFee)}/{t('admin.units.perVehiclePerMonth','đ/xe/tháng')}</span>
                            </div>
                          </div>

                          {config.createdAt && (
                            <div className="pt-2 border-t border-gray-100">
                              <p className="text-xs text-gray-500">{t('admin.common.createdAt','Tạo')}: {formatDate(config.createdAt)}</p>
                              {config.updatedAt && config.updatedAt !== config.createdAt && (
                                <p className="text-xs text-gray-500">{t('admin.common.updatedAt','Cập nhật')}: {formatDate(config.updatedAt)}</p>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3">{t('admin.billing-history.summaryTitle','Tóm tắt năm')} {selectedYear}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium">{t('admin.billing-history.monthsWithConfig','Số tháng có cấu hình')}:</span> {configs.length}/12
                      </div>
                      <div>
                        <span className="font-medium">{t('admin.billing-history.firstMonth','Tháng đầu tiên')}:</span> {configs.length > 0 ? getMonthName(configs[0].month || 0) : 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">{t('admin.billing-history.lastMonth','Tháng cuối cùng')}:</span> {configs.length > 0 ? getMonthName(configs[configs.length - 1].month || 0) : 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Initial State */}
          {!hasSearched && (
            <div className="text-center py-8">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">{t('admin.billing-history.initialHint','Chọn năm và nhấn "Tìm kiếm" để xem lịch sử cấu hình phí dịch vụ')}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 