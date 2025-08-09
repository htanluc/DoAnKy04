"use client";

import React, { useState, useEffect } from 'react';
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
  const { 
    loading, 
    error, 
    success, 
    generateCurrentYearBilling,
    generateYearlyBilling,
    generateMonthlyInvoices,
    getYearlyConfigs,
    getInvoiceStats,
    clearCache,
    clearMessages 
  } = useYearlyBilling();
  
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [invoiceStats, setInvoiceStats] = useState<any>(null);
  const [showStats, setShowStats] = useState(false);
  const [billingMode, setBillingMode] = useState<'yearly' | 'monthly'>('monthly');
  const [yearConfigs, setYearConfigs] = useState<any[]>([]);
  const [checkingYear, setCheckingYear] = useState(false);
  const [yearExists, setYearExists] = useState(false);
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [form, setForm] = useState<YearlyBillingRequest>({
    year: currentYear,
    apartmentId: null,
    serviceFeePerM2: 5000,
    waterFeePerM3: 15000,
    motorcycleFee: 50000,
    car4SeatsFee: 200000,
    car7SeatsFee: 250000,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setFormErrors({});

    // Validation cho form
    if (billingMode === 'yearly') {
      const errors: {[key: string]: string} = {};
      
      // Kiểm tra các giá trị bắt buộc
      if (!form.serviceFeePerM2 || form.serviceFeePerM2 <= 0) {
        errors.serviceFeePerM2 = 'Phí dịch vụ phải lớn hơn 0';
      }
      if (!form.waterFeePerM3 || form.waterFeePerM3 <= 0) {
        errors.waterFeePerM3 = 'Phí nước phải lớn hơn 0';
      }
      if (!form.motorcycleFee || form.motorcycleFee <= 0) {
        errors.motorcycleFee = 'Phí xe máy phải lớn hơn 0';
      }
      if (!form.car4SeatsFee || form.car4SeatsFee <= 0) {
        errors.car4SeatsFee = 'Phí xe 4 chỗ phải lớn hơn 0';
      }
      if (!form.car7SeatsFee || form.car7SeatsFee <= 0) {
        errors.car7SeatsFee = 'Phí xe 7 chỗ phải lớn hơn 0';
      }

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return; // Không submit nếu có lỗi
      }

      // Tạo biểu phí cấu hình cho năm
      const requestData: YearlyBillingRequest = {
        ...form,
        year: selectedYear,
        apartmentId: null // Always generate for all apartments
      };

      let result;
      if (selectedYear === currentYear) {
        result = await generateCurrentYearBilling(requestData);
      } else {
        result = await generateYearlyBilling(requestData);
      }
      
      if (result?.success) {
        // Reset form sau khi tạo thành công
        setForm({
          year: currentYear,
          apartmentId: null,
          serviceFeePerM2: 5000,
          waterFeePerM3: 15000,
          motorcycleFee: 50000,
          car4SeatsFee: 200000,
          car7SeatsFee: 250000,
        });
      }
    } else {
      // Validation cho chế độ tạo hóa đơn theo tháng
      const errors: {[key: string]: string} = {};
      
      // Kiểm tra các giá trị bắt buộc cho tạo hóa đơn
      if (!form.serviceFeePerM2 || form.serviceFeePerM2 <= 0) {
        errors.serviceFeePerM2 = 'Phí dịch vụ phải lớn hơn 0';
      }
      if (!form.waterFeePerM3 || form.waterFeePerM3 <= 0) {
        errors.waterFeePerM3 = 'Phí nước phải lớn hơn 0';
      }
      if (!form.motorcycleFee || form.motorcycleFee <= 0) {
        errors.motorcycleFee = 'Phí xe máy phải lớn hơn 0';
      }
      if (!form.car4SeatsFee || form.car4SeatsFee <= 0) {
        errors.car4SeatsFee = 'Phí xe 4 chỗ phải lớn hơn 0';
      }
      if (!form.car7SeatsFee || form.car7SeatsFee <= 0) {
        errors.car7SeatsFee = 'Phí xe 7 chỗ phải lớn hơn 0';
      }

      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return; // Không submit nếu có lỗi
      }

      // Tạo hóa đơn cho tất cả căn hộ theo tháng cụ thể
      const result = await generateMonthlyInvoices(selectedYear, selectedMonth, form);
      if (result?.success) {
        // Reset form sau khi tạo thành công
        setSelectedMonth(currentMonth);
        // Lấy thống kê sau khi tạo thành công
        await loadInvoiceStats(selectedYear);
      }
    }
  };

  const loadInvoiceStats = async (year: number) => {
    try {
      const stats = await getInvoiceStats(year);
      if (stats?.success) {
        setInvoiceStats(stats);
        setShowStats(true);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleFormChange = (field: keyof YearlyBillingRequest, value: any) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatNumber = (value: number | undefined | null) => {
    if (!value) return '';
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const handleInputChange = (field: keyof YearlyBillingRequest, value: string) => {
    const cleanValue = value.replace(/[^\d,]/g, '');
    const numericValue = cleanValue ? parseInt(cleanValue.replace(/,/g, '')) : 0;
    const validValue = Math.max(0, numericValue);
    handleFormChange(field, validValue);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Tạo biểu phí & Hóa đơn
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {billingMode === 'yearly' 
                ? `Tạo biểu phí cấu hình cho tất cả căn hộ trong năm ${selectedYear}.`
                : `🎯 Tạo hóa đơn cho tất cả ${apartments.length} căn hộ trong tháng ${selectedMonth}/${selectedYear} sử dụng API /api/admin/yearly-billing/generate-month/${selectedYear}/${selectedMonth}.`
              }
            </AlertDescription>
          </Alert>

          {/* Mode Selection */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Chọn chức năng
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                billingMode === 'yearly' 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="radio"
                    id="modeYearly"
                    name="billingMode"
                    checked={billingMode === 'yearly'}
                    onChange={() => setBillingMode('yearly')}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                  />
                  <Label htmlFor="modeYearly" className="font-semibold">Tạo biểu phí cấu hình cho năm</Label>
                </div>
                <div className="text-sm text-gray-600 ml-6">
                  <p>• Tạo cấu hình phí dịch vụ cho cả năm</p>
                  <p>• Thiết lập đơn giá cho tất cả tháng</p>
                </div>
              </div>
              
              <div className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                billingMode === 'monthly' 
                  ? 'border-green-500 bg-green-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  <input
                    type="radio"
                    id="modeMonthly"
                    name="billingMode"
                    checked={billingMode === 'monthly'}
                    onChange={() => setBillingMode('monthly')}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 focus:ring-green-500"
                  />
                  <Label htmlFor="modeMonthly" className="font-semibold text-green-700">🎯 Tạo hóa đơn theo tháng</Label>
                </div>
                <div className="text-sm text-gray-600 ml-6">
                  <p>• Tạo hóa đơn cho tất cả căn hộ</p>
                  <p>• Chỉ tạo cho tháng cụ thể</p>
                  <p>• Sử dụng API: /api/admin/yearly-billing/generate-month/{"{year}"}/{"{month}"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Year Selection */}
          <div className="space-y-2">
            <Label htmlFor="year">Năm</Label>
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
          </div>

          {/* Month Selection - chỉ hiển thị khi chọn tạo hóa đơn theo tháng */}
          {billingMode === 'monthly' && (
            <div className="space-y-2">
              <Label htmlFor="month">Tháng</Label>
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <SelectItem key={month} value={month.toString()}>
                      Tháng {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Service Fee Input */}
          <div className="space-y-2">
            <Label htmlFor="serviceFeePerM2">Phí dịch vụ (đ/m²)</Label>
            <input
              id="serviceFeePerM2"
              type="text"
              value={formatNumber(form.serviceFeePerM2)}
              onChange={(e) => handleInputChange('serviceFeePerM2', e.target.value)}
              placeholder="5,000"
              maxLength={15}
              className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${
                formErrors.serviceFeePerM2 ? 'border-red-500' : 'border-input'
              }`}
            />
            {formErrors.serviceFeePerM2 && (
              <p className="text-sm text-red-600">{formErrors.serviceFeePerM2}</p>
            )}
          </div>

          {/* Water Fee Input */}
          <div className="space-y-2">
            <Label htmlFor="waterFeePerM3">Phí nước (đ/m³)</Label>
            <input
              id="waterFeePerM3"
              type="text"
              value={formatNumber(form.waterFeePerM3)}
              onChange={(e) => handleInputChange('waterFeePerM3', e.target.value)}
              placeholder="15,000"
              maxLength={15}
              className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${
                formErrors.waterFeePerM3 ? 'border-red-500' : 'border-input'
              }`}
            />
            {formErrors.waterFeePerM3 && (
              <p className="text-sm text-red-600">{formErrors.waterFeePerM3}</p>
            )}
          </div>

          {/* Motorcycle Fee Input */}
          <div className="space-y-2">
            <Label htmlFor="motorcycleFee">Phí xe máy (đ/xe/tháng)</Label>
            <input
              id="motorcycleFee"
              type="text"
              value={formatNumber(form.motorcycleFee)}
              onChange={(e) => handleInputChange('motorcycleFee', e.target.value)}
              placeholder="50,000"
              maxLength={15}
              className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${
                formErrors.motorcycleFee ? 'border-red-500' : 'border-input'
              }`}
            />
            {formErrors.motorcycleFee && (
              <p className="text-sm text-red-600">{formErrors.motorcycleFee}</p>
            )}
          </div>

          {/* Car 4 Seats Fee Input */}
          <div className="space-y-2">
            <Label htmlFor="car4SeatsFee">Phí xe 4 chỗ (đ/xe/tháng)</Label>
            <input
              id="car4SeatsFee"
              type="text"
              value={formatNumber(form.car4SeatsFee)}
              onChange={(e) => handleInputChange('car4SeatsFee', e.target.value)}
              placeholder="200,000"
              maxLength={15}
              className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${
                formErrors.car4SeatsFee ? 'border-red-500' : 'border-input'
              }`}
            />
            {formErrors.car4SeatsFee && (
              <p className="text-sm text-red-600">{formErrors.car4SeatsFee}</p>
            )}
          </div>

          {/* Car 7 Seats Fee Input */}
          <div className="space-y-2">
            <Label htmlFor="car7SeatsFee">Phí xe 7 chỗ (đ/xe/tháng)</Label>
            <input
              id="car7SeatsFee"
              type="text"
              value={formatNumber(form.car7SeatsFee)}
              onChange={(e) => handleInputChange('car7SeatsFee', e.target.value)}
              placeholder="250,000"
              maxLength={15}
              className={`flex h-10 w-full rounded-md border bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${
                formErrors.car7SeatsFee ? 'border-red-500' : 'border-input'
              }`}
            />
            {formErrors.car7SeatsFee && (
              <p className="text-sm text-red-600">{formErrors.car7SeatsFee}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={loading || Object.keys(formErrors).length > 0}
              className={`min-w-[250px] ${
                billingMode === 'monthly' 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading ? 'Đang xử lý...' : 
                billingMode === 'yearly' ? `Tạo biểu phí năm ${selectedYear}` :
                `🎯 Tạo hóa đơn tháng ${selectedMonth}/${selectedYear} (${apartments.length} căn hộ)`
              }
            </Button>
          </div>

          {/* Error Message */}
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
        </form>
      </CardContent>
    </Card>
  );
} 