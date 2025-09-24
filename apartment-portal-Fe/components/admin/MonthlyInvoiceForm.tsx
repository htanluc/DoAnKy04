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
import { useYearlyBilling } from '@/hooks/use-yearly-billing';

interface MonthlyInvoiceFormProps {
  apartments?: any[];
}

export default function MonthlyInvoiceForm({ apartments = [] }: MonthlyInvoiceFormProps) {
  const { 
    loading, 
    error, 
    success, 
    generateMonthlyInvoices,
    getInvoiceStats,
    clearMessages 
  } = useYearlyBilling();
  
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [invoiceStats, setInvoiceStats] = useState<any>(null);
  const [showStats, setShowStats] = useState(false);
  const [skipWaterValidation, setSkipWaterValidation] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    try {
      const result = await generateMonthlyInvoices(selectedYear, selectedMonth, skipWaterValidation);
      
      if (result?.success) {
        // Load stats after successful generation
        await loadInvoiceStats(selectedYear);
        setShowStats(true);
      }
    } catch (error) {
      console.error('Error generating monthly invoices:', error);
    }
  };

  const loadInvoiceStats = async (year: number) => {
    try {
      const stats = await getInvoiceStats(year);
      if (stats?.success) {
        setInvoiceStats(stats.data);
      }
    } catch (error) {
      console.error('Error loading invoice stats:', error);
    }
  };

  useEffect(() => {
    loadInvoiceStats(selectedYear);
  }, [selectedYear]);

  const formatNumber = (value: number | undefined | null) => {
    if (value === undefined || value === null) return '0';
    return value.toLocaleString('vi-VN');
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Tạo hóa đơn theo tháng
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Năm */}
              <div className="space-y-2">
                <Label htmlFor="year">Năm</Label>
                <Select 
                  value={selectedYear.toString()} 
                  onValueChange={(value) => setSelectedYear(Number(value))}
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

              {/* Tháng */}
              <div className="space-y-2">
                <Label htmlFor="month">Tháng</Label>
                <Select 
                  value={selectedMonth.toString()} 
                  onValueChange={(value) => setSelectedMonth(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tháng" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                      <SelectItem key={month} value={month.toString()}>
                        Tháng {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Thông tin */}
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Tạo hóa đơn cho tất cả căn hộ trong tháng {selectedMonth}/{selectedYear}. 
                Hệ thống sẽ sử dụng cấu hình phí đã được thiết lập cho tháng này.
              </AlertDescription>
            </Alert>

            {/* Tùy chọn bỏ qua kiểm tra chỉ số nước */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="skipWaterValidation"
                checked={skipWaterValidation}
                onChange={(e) => setSkipWaterValidation(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <Label htmlFor="skipWaterValidation" className="text-sm text-gray-700">
                Bỏ qua kiểm tra chỉ số nước (không khuyến nghị)
              </Label>
            </div>
            
            {skipWaterValidation && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  <strong>Cảnh báo:</strong> Bỏ qua kiểm tra chỉ số nước có thể tạo hóa đơn không chính xác. 
                  Chỉ sử dụng khi cần thiết và đã đảm bảo dữ liệu chỉ số nước chính xác.
                </AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? 'Đang tạo hóa đơn...' : 'Tạo hóa đơn'}
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

      {/* Invoice Stats */}
      {showStats && invoiceStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Thống kê hóa đơn năm {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(invoiceStats.totalInvoices)}
                </div>
                <div className="text-sm text-blue-600">Tổng hóa đơn</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(invoiceStats.totalAmount)}
                </div>
                <div className="text-sm text-green-600">Tổng tiền (VNĐ)</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {formatNumber(invoiceStats.pendingInvoices)}
                </div>
                <div className="text-sm text-yellow-600">Chờ thanh toán</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 