"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Settings, 
  Info, 
  AlertCircle,
  CheckCircle,
  Edit,
  Save,
  X
} from 'lucide-react';
import { useYearlyBilling, YearlyBillingConfig } from '@/hooks/use-yearly-billing';

interface CurrentBillingConfigProps {
  year: number;
  month: number;
}

// Localized month label for summary and alerts
const formatMonthLabel = (month: number, language: 'vi' | 'en'): string => {
  if (language === 'vi') return `Tháng ${month}`;
  try {
    return new Date(2000, month - 1, 1).toLocaleString('en-US', { month: 'long' });
  } catch {
    return `Month ${month}`;
  }
};

export default function CurrentBillingConfig({ year, month }: CurrentBillingConfigProps) {
  const { t, language } = useLanguage();
  const { 
    loading, 
    error, 
    success, 
    getMonthlyConfig, 
    updateMonthlyBillingConfig, 
    clearMessages,
    hasInvoicesForMonth,
  } = useYearlyBilling();

  const [selectedYear, setSelectedYear] = useState(year);
  const [selectedMonth, setSelectedMonth] = useState(month);
  const [config, setConfig] = useState<YearlyBillingConfig>({
    year: selectedYear,
    month: selectedMonth,
    serviceFeePerM2: 5000,
    waterFeePerM3: 15000,
    motorcycleFee: 50000,
    car4SeatsFee: 200000,
    car7SeatsFee: 250000,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [originalConfig, setOriginalConfig] = useState<YearlyBillingConfig | null>(null);
  const [configExists, setConfigExists] = useState(false);
  const [isPastMonth, setIsPastMonth] = useState(false);
  const [currentMonthHasInvoices, setCurrentMonthHasInvoices] = useState(false);
  const [hasInvoicesForSelectedMonth, setHasInvoicesForSelectedMonth] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadConfig();
    }, 300); // Debounce 300ms

    return () => clearTimeout(timeoutId);
  }, [selectedYear, selectedMonth]);

  const loadConfig = async () => {
    // Tính toán trạng thái quá khứ/hiện tại
    const now = new Date();
    const target = new Date(selectedYear, selectedMonth - 1, 1);
    const current = new Date(now.getFullYear(), now.getMonth(), 1);
    setIsPastMonth(target < current);

    const result = await getMonthlyConfig(selectedYear, selectedMonth);
    if (result?.success && result.config) {
      console.log('Loaded config:', result.config); // Debug log
      setConfig(result.config);
      setOriginalConfig(result.config);
      setConfigExists(true);
    } else {
      console.log('No config found, using defaults'); // Debug log
      setConfig({
        year: selectedYear,
        month: selectedMonth,
        serviceFeePerM2: 5000,
        waterFeePerM3: 15000,
        motorcycleFee: 50000,
        car4SeatsFee: 200000,
        car7SeatsFee: 250000,
      });
      setConfigExists(false);
    }

    // Kiểm tra tháng đã có hóa đơn chưa để disable chỉnh sửa
    const check = await hasInvoicesForMonth(selectedYear, selectedMonth);
    const hasInvoices = !!check?.hasInvoices;
    setHasInvoicesForSelectedMonth(hasInvoices);
    
    // Nếu là tháng hiện tại, cập nhật trạng thái currentMonthHasInvoices
    if (target.getTime() === current.getTime()) {
      setCurrentMonthHasInvoices(hasInvoices);
    } else {
      setCurrentMonthHasInvoices(false);
    }
  };

  const handleEdit = async () => {
    // Chặn sửa nếu là tháng quá khứ
    if (isPastMonth) return;

    // Kiểm tra lại trước khi cho sửa
    const check = await hasInvoicesForMonth(selectedYear, selectedMonth);
    if (check?.hasInvoices) {
      setHasInvoicesForSelectedMonth(true);
      return; // Không cho bật edit
    }

    setOriginalConfig(config);
    setIsEditing(true);
    clearMessages();
  };

  const handleCancel = () => {
    if (originalConfig) {
      setConfig(originalConfig);
    }
    setIsEditing(false);
    clearMessages();
  };

  const handleSave = async () => {
    if (!originalConfig) return;

    const result = await updateMonthlyBillingConfig(selectedYear, selectedMonth, {
      serviceFeePerM2: config.serviceFeePerM2,
      waterFeePerM3: config.waterFeePerM3,
      motorcycleFee: config.motorcycleFee,
      car4SeatsFee: config.car4SeatsFee,
      car7SeatsFee: config.car7SeatsFee,
    });

    if (result?.success) {
      setIsEditing(false);
      setOriginalConfig(config);
      setConfigExists(true);
      await loadConfig(); // Reload to get updated data
    }
  };

  const handleInputChange = (field: keyof Omit<YearlyBillingConfig, 'year' | 'month' | 'id' | 'createdAt' | 'updatedAt'>, value: number) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatNumber = (value: number | undefined | null) => {
    if (value === undefined || value === null) return '0';
    return value.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US');
  };

  const handleTextInputChange = (field: keyof Omit<YearlyBillingConfig, 'year' | 'month' | 'id' | 'createdAt' | 'updatedAt'>, value: string) => {
    // Loại bỏ tất cả ký tự không phải số
    const cleanValue = value.replace(/[^\d]/g, '');
    // Chuyển thành số, cho phép số lớn
    const numericValue = cleanValue ? parseInt(cleanValue) : 0;
    handleInputChange(field, numericValue);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          {t('admin.yearly-billing.config')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* {t('admin.billing-config.selectYearMonth')} */}
          <div className="space-y-4">
            <Label className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              {t('admin.yearly-billing.scope')}
            </Label>
            <div className="flex items-center gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">{t('admin.yearly-billing.year')}</Label>
                <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i).map(year => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="month">{t('admin.yearly-billing.months')}</Label>
                <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <SelectItem key={month} value={month.toString()}>
                        {formatMonthLabel(month, language)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {configExists 
                ? t('admin.billing-config.existing').replace('{month}', formatMonthLabel(selectedMonth, language)).replace('{year}', String(selectedYear))
                : t('admin.billing-config.missing').replace('{month}', formatMonthLabel(selectedMonth, language)).replace('{year}', String(selectedYear))
              }
            </AlertDescription>
          </Alert>

          {/* Thông báo khi tháng đã có hóa đơn */}
          {hasInvoicesForSelectedMonth && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Không thể chỉnh sửa:</strong> Tháng {formatMonthLabel(selectedMonth, language)}/{selectedYear} đã có hóa đơn được tạo. 
                Để chỉnh sửa cấu hình phí, vui lòng xóa tất cả hóa đơn của tháng này trước.
              </AlertDescription>
            </Alert>
          )}

          {/* Thông báo khi là tháng quá khứ */}
          {isPastMonth && !hasInvoicesForSelectedMonth && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Không thể chỉnh sửa:</strong> Tháng {formatMonthLabel(selectedMonth, language)}/{selectedYear} đã qua. 
                Chỉ có thể chỉnh sửa cấu hình phí cho tháng hiện tại và tương lai.
              </AlertDescription>
            </Alert>
          )}

            <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{t('admin.yearly-billing.feeSummary')} - {formatMonthLabel(selectedMonth, language)}/{selectedYear}</h3>
              <div className="flex gap-2">
                {!isEditing ? (
                  <Button 
                    onClick={handleEdit} 
                    variant="outline" 
                    size="sm" 
                    disabled={isPastMonth || hasInvoicesForSelectedMonth}
                    title={
                      isPastMonth 
                        ? `Không thể chỉnh sửa tháng quá khứ ${formatMonthLabel(selectedMonth, language)}/${selectedYear}`
                        : hasInvoicesForSelectedMonth
                        ? `Không thể chỉnh sửa vì tháng ${formatMonthLabel(selectedMonth, language)}/${selectedYear} đã có hóa đơn`
                        : undefined
                    }
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {t('admin.action.edit')}
                  </Button>
                ) : (
                  <>
                    <Button onClick={handleSave} disabled={loading} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? t('admin.action.saving') : t('admin.action.save')}
                    </Button>
                    <Button onClick={handleCancel} variant="outline" size="sm">
                      <X className="h-4 w-4 mr-2" />
                      {t('admin.action.cancel')}
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serviceFeePerM2">{t('admin.yearly-billing.serviceFee')}</Label>
                <Input
                  id="serviceFeePerM2"
                  type="text"
                  value={formatNumber(config.serviceFeePerM2)}
                  onChange={(e) => handleTextInputChange('serviceFeePerM2', e.target.value)}
                  disabled={!isEditing}
                  placeholder="5,000"
                  maxLength={15}
                  pattern="[0-9,]*"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="waterFeePerM3">{t('admin.yearly-billing.waterFee')}</Label>
                <Input
                  id="waterFeePerM3"
                  type="text"
                  value={formatNumber(config.waterFeePerM3)}
                  onChange={(e) => handleTextInputChange('waterFeePerM3', e.target.value)}
                  disabled={!isEditing}
                  placeholder="15,000"
                  maxLength={15}
                  pattern="[0-9,]*"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motorcycleFee">{t('admin.yearly-billing.parking.motorcycle')}</Label>
                <Input
                  id="motorcycleFee"
                  type="text"
                  value={formatNumber(config.motorcycleFee)}
                  onChange={(e) => handleTextInputChange('motorcycleFee', e.target.value)}
                  disabled={!isEditing}
                  placeholder="50,000"
                  maxLength={15}
                  pattern="[0-9,]*"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="car4SeatsFee">{t('admin.yearly-billing.parking.car4')}</Label>
                <Input
                  id="car4SeatsFee"
                  type="text"
                  value={formatNumber(config.car4SeatsFee)}
                  onChange={(e) => handleTextInputChange('car4SeatsFee', e.target.value)}
                  disabled={!isEditing}
                  placeholder="200,000"
                  maxLength={15}
                  pattern="[0-9,]*"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="car7SeatsFee">{t('admin.yearly-billing.parking.car7')}</Label>
                <Input
                  id="car7SeatsFee"
                  type="text"
                  value={formatNumber(config.car7SeatsFee)}
                  onChange={(e) => handleTextInputChange('car7SeatsFee', e.target.value)}
                  disabled={!isEditing}
                  placeholder="250,000"
                  maxLength={15}
                  pattern="[0-9,]*"
                />
              </div>
            </div>

            {/* Tóm tắt phí */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">{t('admin.yearly-billing.feeSummary')}:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{t('admin.invoices.feeType.SERVICE_FEE')}:</span>
                  <span className="text-blue-600 font-semibold">
                    {formatNumber(config.serviceFeePerM2)} đ/m²
                    {!isEditing && <span className="text-xs text-gray-500 ml-2">({config.serviceFeePerM2})</span>}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">{t('admin.invoices.feeType.WATER_FEE')}:</span>
                  <span className="text-blue-600 font-semibold">
                    {formatNumber(config.waterFeePerM3)} đ/m³
                    {!isEditing && <span className="text-xs text-gray-500 ml-2">({config.waterFeePerM3})</span>}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">{t('admin.invoices.feeType.VEHICLE_FEE')}:</span>
                  <span className="text-green-600 font-semibold">
                    {formatNumber(config.motorcycleFee)} <span className="whitespace-nowrap">{t('admin.units.perVehiclePerMonth')}</span>
                    {!isEditing && <span className="text-xs text-gray-500 ml-2">({config.motorcycleFee})</span>}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium">{t('admin.yearly-billing.parking.car4.label')}:</span>
                  <span className="text-green-600 font-semibold">
                    {formatNumber(config.car4SeatsFee)} <span className="whitespace-nowrap">{t('admin.units.perVehiclePerMonth')}</span>
                    {!isEditing && <span className="text-xs text-gray-500 ml-2">({config.car4SeatsFee})</span>}
                  </span>
                </div>
                <div className="flex justify-between items-center md:col-span-2">
                  <span className="font-medium">{t('admin.yearly-billing.parking.car7.label')}:</span>
                  <span className="text-green-600 font-semibold">
                    {formatNumber(config.car7SeatsFee)} <span className="whitespace-nowrap">{t('admin.units.perVehiclePerMonth')}</span>
                    {!isEditing && <span className="text-xs text-gray-500 ml-2">({config.car7SeatsFee})</span>}
                  </span>
                </div>
              </div>
              {/* Debug info */}
              {!isEditing && (
                <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-gray-600">
                  <strong>Debug:</strong> Raw values - Service: {config.serviceFeePerM2}, Water: {config.waterFeePerM3}, 
                  Motorcycle: {config.motorcycleFee}, Car4: {config.car4SeatsFee}, Car7: {config.car7SeatsFee}
                </div>
              )}
            </div>

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
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 