"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calculator, 
  Info, 
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useYearlyBilling, YearlyBillingRequest } from '@/hooks/use-yearly-billing';

interface YearlyBillingFormProps {
  apartments?: any[];
}

export default function YearlyBillingForm({ apartments = [] }: YearlyBillingFormProps) {
  const { t, language } = useLanguage();
  const { 
    loading, 
    error, 
    success, 
    generateCurrentYearBilling,
    generateYearlyBilling,
    getYearlyConfigs,
    clearMessages 
  } = useYearlyBilling();
  
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  const [selectedYear, setSelectedYear] = useState(currentYear);
  
  const [yearConfigs, setYearConfigs] = useState<any[]>([]);
  const [checkingYear, setCheckingYear] = useState(false);
  const [yearExists, setYearExists] = useState(false);
  const [form, setForm] = useState<YearlyBillingRequest>({
    year: currentYear,
    apartmentId: null,
    serviceFeePerM2: 5000,
    waterFeePerM3: 15000,
    motorcycleFee: 50000,
    car4SeatsFee: 200000,
    car7SeatsFee: 250000,
  });

  // Kiểm tra xem năm đã được tạo chưa
  const checkYearExists = async (year: number) => {
    setCheckingYear(true);
    try {
      const result = await getYearlyConfigs(year);
      if (result?.success && result.configs) {
        setYearConfigs(result.configs);
        setYearExists(result.configs.length > 0);
      } else {
        setYearConfigs([]);
        setYearExists(false);
      }
    } catch (error) {
      setYearConfigs([]);
      setYearExists(false);
    } finally {
      setCheckingYear(false);
    }
  };

  // Kiểm tra năm khi thay đổi
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (selectedYear >= 2020 && selectedYear <= 2030) {
        checkYearExists(selectedYear);
      }
    }, 500); // Debounce 500ms

    return () => clearTimeout(timeoutId);
  }, [selectedYear]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    // Tạo biểu phí cấu hình cho năm (không tạo hóa đơn)
    const requestData: YearlyBillingRequest = {
      ...form,
      year: selectedYear,
      apartmentId: null
    };

    const result = selectedYear === currentYear
      ? await generateCurrentYearBilling(requestData)
      : await generateYearlyBilling(requestData);

    if (result?.success) {
      await checkYearExists(selectedYear);
    }
  };

  // Không còn chức năng thống kê hóa đơn tại đây

  const handleFormChange = (field: keyof YearlyBillingRequest, value: any) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatNumber = (value: number | undefined | null) => {
    if (value === undefined || value === null) return '0';
    return value.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US');
  };

  const handleInputChange = (field: keyof YearlyBillingRequest, value: string) => {
    // Loại bỏ tất cả ký tự không phải số
    const cleanValue = value.replace(/[^\d]/g, '');
    // Chuyển thành số, cho phép số lớn
    const numericValue = cleanValue ? parseInt(cleanValue) : 0;
    handleFormChange(field, numericValue);
  };

  const getYearStatus = () => {
    if (checkingYear) return t('admin.loading','Đang kiểm tra...');
    if (yearExists) return t('admin.yearly-billing.exists','Đã có cấu hình (không thể tạo lại)');
    return t('admin.yearly-billing.notExists','Chưa có cấu hình (có thể tạo)');
  };

  const getYearStatusColor = () => {
    if (checkingYear) return 'text-blue-600';
    if (yearExists) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          {t('admin.yearly-billing.create','Tạo biểu phí')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {t('admin.yearly-billing.description', 'Tạo biểu phí cấu hình cho tất cả căn hộ trong năm {year}. Hệ thống chỉ tạo cấu hình phí dịch vụ (không tạo hóa đơn).').replace('{year}', String(selectedYear))}
            </AlertDescription>
          </Alert>

          {/* Chức năng: chỉ tạo biểu phí */}

          <div className="space-y-4">
            {
              // Form tạo biểu phí cho năm
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    {t('admin.yearly-billing.info','Thông tin')}
                  </Label>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="year">{t('admin.yearly-billing.year','Năm')}</Label>
                      <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 11 }, (_, i) => currentYear - 5 + i).map(year => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className={`text-sm font-medium ${getYearStatusColor()}`}>
                        {getYearStatus()}
                      </div>
                      {yearExists && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            {t('admin.yearly-billing.existsDetail','Năm {year} đã có cấu hình phí dịch vụ. Không thể tạo lại. Vui lòng chọn năm khác hoặc dùng tab Cấu hình phí.').replace('{year}', String(selectedYear))}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    {/* Đơn giá phí dịch vụ */}
                    <div className="space-y-4">
                      <Label className="flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        {t('admin.yearly-billing.feeConfig','Cấu hình đơn giá')}
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="serviceFeePerM2">{t('admin.yearly-billing.serviceFee','Phí dịch vụ (VND/m²)')}</Label>
                          <input
                            id="serviceFeePerM2"
                            type="number"
                            inputMode="numeric"
                            value={form.serviceFeePerM2}
                            onChange={(e) => handleFormChange('serviceFeePerM2', Number(e.target.value || 0))}
                            placeholder="5000"
                            min={0}
                            step={1}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="waterFeePerM3">{t('admin.yearly-billing.waterFee','Phí nước (VND/m³)')}</Label>
                          <input
                            id="waterFeePerM3"
                            type="number"
                            inputMode="numeric"
                            value={form.waterFeePerM3}
                            onChange={(e) => handleFormChange('waterFeePerM3', Number(e.target.value || 0))}
                            placeholder="15000"
                            min={0}
                            step={1}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="motorcycleFee">{t('admin.yearly-billing.parkingFee','Phí gửi xe (VND/tháng)')}</Label>
                          <input
                            id="motorcycleFee"
                            type="number"
                            inputMode="numeric"
                            value={form.motorcycleFee}
                            onChange={(e) => handleFormChange('motorcycleFee', Number(e.target.value || 0))}
                            placeholder="50000"
                            min={0}
                            step={1}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="car4SeatsFee">{t('admin.yearly-billing.parkingFee','Phí gửi xe (VND/tháng)')}</Label>
                          <input
                            id="car4SeatsFee"
                            type="number"
                            inputMode="numeric"
                            value={form.car4SeatsFee}
                            onChange={(e) => handleFormChange('car4SeatsFee', Number(e.target.value || 0))}
                            placeholder="200000"
                            min={0}
                            step={1}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="car7SeatsFee">{t('admin.yearly-billing.parkingFee','Phí gửi xe (VND/tháng)')}</Label>
                          <input
                            id="car7SeatsFee"
                            type="number"
                            inputMode="numeric"
                            value={form.car7SeatsFee}
                            onChange={(e) => handleFormChange('car7SeatsFee', Number(e.target.value || 0))}
                            placeholder="250000"
                            min={0}
                            step={1}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                          />
                        </div>
                      </div>

                      {/* Tóm tắt đơn giá */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3">{t('admin.yearly-billing.feeSummary','Tóm tắt đơn giá')}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{t('admin.invoices.feeType.SERVICE_FEE','Phí dịch vụ')}:</span>
                            <span className="text-blue-600 font-semibold">
                              {formatNumber(form.serviceFeePerM2)} đ/m²
                              <span className="text-xs text-gray-500 ml-2">({form.serviceFeePerM2})</span>
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{t('admin.invoices.feeType.WATER_FEE','Phí nước')}:</span>
                            <span className="text-blue-600 font-semibold">
                              {formatNumber(form.waterFeePerM3)} đ/m³
                              <span className="text-xs text-gray-500 ml-2">({form.waterFeePerM3})</span>
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{t('admin.invoices.feeType.VEHICLE_FEE','Phí gửi xe')}:</span>
                            <span className="text-green-600 font-semibold">
                              {formatNumber(form.motorcycleFee)} <span className="whitespace-nowrap">{t('admin.units.perVehiclePerMonth','đ/xe/tháng')}</span>
                              <span className="text-xs text-gray-500 ml-2">({form.motorcycleFee})</span>
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{t('admin.yearly-billing.parking.car4.label','Phí xe 4 chỗ')}:</span>
                            <span className="text-green-600 font-semibold">
                              {formatNumber(form.car4SeatsFee)} <span className="whitespace-nowrap">{t('admin.units.perVehiclePerMonth','đ/xe/tháng')}</span>
                              <span className="text-xs text-gray-500 ml-2">({form.car4SeatsFee})</span>
                            </span>
                          </div>
                          <div className="flex justify-between items-center md:col-span-2">
                            <span className="font-medium">{t('admin.yearly-billing.parking.car7.label','Phí xe 7 chỗ')}:</span>
                            <span className="text-green-600 font-semibold">
                              {formatNumber(form.car7SeatsFee)} <span className="whitespace-nowrap">{t('admin.units.perVehiclePerMonth','đ/xe/tháng')}</span>
                              <span className="text-xs text-gray-500 ml-2">({form.car7SeatsFee})</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }

            {/* API Errors */}
            {error && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Success Message */}
            {success && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={loading || yearExists}
                className="min-w-[200px]"
              >
                {loading ? t('admin.yearly-billing.creating','Đang tạo biểu phí...') : t('admin.yearly-billing.createButton','Tạo biểu phí 1 năm')}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 