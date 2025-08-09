"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Settings, 
  Info, 
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useYearlyBilling, YearlyBillingRequest } from '@/hooks/use-yearly-billing';

interface YearlyBillingConfigFormProps {
  apartments?: any[];
}

export default function YearlyBillingConfigForm({ apartments = [] }: YearlyBillingConfigFormProps) {
  const { 
    loading, 
    error, 
    success, 
    generateCurrentYearBilling,
    generateYearlyBilling,
    clearMessages 
  } = useYearlyBilling();
  
  const currentYear = new Date().getFullYear();
  
  const [selectedYear, setSelectedYear] = useState(currentYear);
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
      // Reset form after successful creation
      setForm({
        year: selectedYear,
        apartmentId: null,
        serviceFeePerM2: 5000,
        waterFeePerM3: 15000,
        motorcycleFee: 50000,
        car4SeatsFee: 200000,
        car7SeatsFee: 250000,
      });
    }
  };

  const handleFormChange = (field: keyof YearlyBillingRequest, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const formatNumber = (value: number | undefined | null) => {
    if (value === undefined || value === null) return '0';
    return value.toLocaleString('vi-VN');
  };

  const handleInputChange = (field: keyof YearlyBillingRequest, value: string) => {
    const numValue = value === '' ? 0 : Number(value);
    handleFormChange(field, numValue);
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Tạo biểu phí cấu hình cho năm {selectedYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Năm */}
            <div className="space-y-2">
              <Label htmlFor="year">Năm</Label>
              <Select 
                value={selectedYear.toString()} 
                onValueChange={(value) => {
                  const year = Number(value);
                  setSelectedYear(year);
                  handleFormChange('year', year);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn năm" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Phí dịch vụ */}
            <div className="space-y-2">
              <Label htmlFor="serviceFeePerM2">Phí dịch vụ (VNĐ/m²)</Label>
              <Input
                id="serviceFeePerM2"
                type="number"
                placeholder="5000"
                value={form.serviceFeePerM2}
                onChange={(e) => handleInputChange('serviceFeePerM2', e.target.value)}
              />
              {formErrors.serviceFeePerM2 && (
                <p className="text-red-500 text-sm">{formErrors.serviceFeePerM2}</p>
              )}
            </div>

            {/* Phí nước */}
            <div className="space-y-2">
              <Label htmlFor="waterFeePerM3">Phí nước (VNĐ/m³)</Label>
              <Input
                id="waterFeePerM3"
                type="number"
                placeholder="15000"
                value={form.waterFeePerM3}
                onChange={(e) => handleInputChange('waterFeePerM3', e.target.value)}
              />
              {formErrors.waterFeePerM3 && (
                <p className="text-red-500 text-sm">{formErrors.waterFeePerM3}</p>
              )}
            </div>

            {/* Phí gửi xe */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="motorcycleFee">Phí xe máy (VNĐ/xe/tháng)</Label>
                <Input
                  id="motorcycleFee"
                  type="number"
                  placeholder="50000"
                  value={form.motorcycleFee}
                  onChange={(e) => handleInputChange('motorcycleFee', e.target.value)}
                />
                {formErrors.motorcycleFee && (
                  <p className="text-red-500 text-sm">{formErrors.motorcycleFee}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="car4SeatsFee">Phí xe 4 chỗ (VNĐ/xe/tháng)</Label>
                <Input
                  id="car4SeatsFee"
                  type="number"
                  placeholder="200000"
                  value={form.car4SeatsFee}
                  onChange={(e) => handleInputChange('car4SeatsFee', e.target.value)}
                />
                {formErrors.car4SeatsFee && (
                  <p className="text-red-500 text-sm">{formErrors.car4SeatsFee}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="car7SeatsFee">Phí xe 7 chỗ (VNĐ/xe/tháng)</Label>
                <Input
                  id="car7SeatsFee"
                  type="number"
                  placeholder="250000"
                  value={form.car7SeatsFee}
                  onChange={(e) => handleInputChange('car7SeatsFee', e.target.value)}
                />
                {formErrors.car7SeatsFee && (
                  <p className="text-red-500 text-sm">{formErrors.car7SeatsFee}</p>
                )}
              </div>
            </div>

            {/* Thông tin */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Tạo cấu hình phí dịch vụ cho tất cả tháng trong năm {selectedYear}. 
                Cấu hình này sẽ được sử dụng để tính toán hóa đơn cho cư dân.
              </AlertDescription>
            </Alert>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? 'Đang tạo cấu hình...' : 'Tạo cấu hình phí'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Success Message */}
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 