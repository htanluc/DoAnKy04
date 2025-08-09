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

    if (billingMode === 'yearly') {
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
        // Kiểm tra lại năm sau khi tạo thành công
        await checkYearExists(selectedYear);
      }
    } else {
      // Tạo hóa đơn cho tất cả căn hộ theo tháng cụ thể
      const result = await generateMonthlyInvoices(selectedYear, selectedMonth);
      if (result?.success) {
        // Reset form sau khi tạo thành công
        setSelectedMonth(currentMonth);
        // Lấy thống kê sau khi tạo thành công
        await loadInvoiceStats(selectedYear);
      }
    }
  };

  // Lấy thống kê hóa đơn
  const loadInvoiceStats = async (year: number) => {
    const stats = await getInvoiceStats(year);
    if (stats?.success) {
      setInvoiceStats(stats);
      setShowStats(true);
    }
  };

  const handleFormChange = (field: keyof YearlyBillingRequest, value: any) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatNumber = (value: number | undefined | null) => {
    if (value === undefined || value === null) return '0';
    return value.toLocaleString('vi-VN');
  };

  const handleInputChange = (field: keyof YearlyBillingRequest, value: string) => {
    // Loại bỏ tất cả ký tự không phải số
    const cleanValue = value.replace(/[^\d]/g, '');
    // Chuyển thành số, cho phép số lớn
    const numericValue = cleanValue ? parseInt(cleanValue) : 0;
    handleFormChange(field, numericValue);
  };

  const getYearStatus = () => {
    if (checkingYear) return 'Đang kiểm tra...';
    if (yearExists) return 'Đã có cấu hình (không thể tạo lại)';
    return 'Chưa có cấu hình (có thể tạo)';
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
          Tạo biểu phí & Hóa đơn
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              {billingMode === 'yearly' 
                ? `Tạo biểu phí cấu hình cho tất cả căn hộ trong năm ${selectedYear}. Hệ thống sẽ tạo cấu hình phí dịch vụ cho toàn bộ tòa nhà.`
                : `Tạo hóa đơn cho tất cả ${apartments.length} căn hộ trong tháng ${selectedMonth}/${selectedYear}. Hệ thống sẽ tạo hóa đơn cho toàn bộ căn hộ trong tháng cụ thể.`
              }
            </AlertDescription>
          </Alert>

          {/* Chọn mode */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Chọn chức năng
            </Label>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  title="Tạo biểu phí cấu hình cho năm"
                  type="radio"
                  id="modeYearly"
                  name="billingMode"
                  checked={billingMode === 'yearly'}
                  onChange={() => setBillingMode('yearly')}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                />
                <Label htmlFor="modeYearly">Tạo biểu phí cấu hình cho năm</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  title="Tạo hóa đơn theo tháng"
                  type="radio"
                  id="modeMonthly"
                  name="billingMode"
                  checked={billingMode === 'monthly'}
                  onChange={() => setBillingMode('monthly')}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                />
                <Label htmlFor="modeMonthly">Tạo hóa đơn theo tháng</Label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {billingMode === 'yearly' ? (
              // Form tạo biểu phí cho năm
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Thông tin tạo biểu phí cho năm
                  </Label>
                  <div className="space-y-4">
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
                      <div className={`text-sm font-medium ${getYearStatusColor()}`}>
                        {getYearStatus()}
                      </div>
                      {yearExists && (
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Năm {selectedYear} đã có cấu hình phí dịch vụ. <strong>Không thể tạo lại</strong>. Vui lòng chọn năm khác hoặc sử dụng tab "Cấu hình phí" để chỉnh sửa cấu hình hiện tại.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    {/* Đơn giá phí dịch vụ */}
                    <div className="space-y-4">
                      <Label className="flex items-center gap-2">
                        <Calculator className="h-4 w-4" />
                        Đơn giá phí dịch vụ cho tất cả căn hộ
                      </Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="serviceFeePerM2">Phí dịch vụ (đ/m²)</Label>
                          <input
                            id="serviceFeePerM2"
                            type="text"
                            value={formatNumber(form.serviceFeePerM2)}
                            onChange={(e) => handleInputChange('serviceFeePerM2', e.target.value)}
                            placeholder="5,000"
                            maxLength={15}
                            pattern="[0-9,]*"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="waterFeePerM3">Phí nước (đ/m³)</Label>
                          <input
                            id="waterFeePerM3"
                            type="text"
                            value={formatNumber(form.waterFeePerM3)}
                            onChange={(e) => handleInputChange('waterFeePerM3', e.target.value)}
                            placeholder="15,000"
                            maxLength={15}
                            pattern="[0-9,]*"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="motorcycleFee">Phí xe máy (đ/xe/tháng)</Label>
                          <input
                            id="motorcycleFee"
                            type="text"
                            value={formatNumber(form.motorcycleFee)}
                            onChange={(e) => handleInputChange('motorcycleFee', e.target.value)}
                            placeholder="50,000"
                            maxLength={15}
                            pattern="[0-9,]*"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="car4SeatsFee">Phí xe 4 chỗ (đ/xe/tháng)</Label>
                          <input
                            id="car4SeatsFee"
                            type="text"
                            value={formatNumber(form.car4SeatsFee)}
                            onChange={(e) => handleInputChange('car4SeatsFee', e.target.value)}
                            placeholder="200,000"
                            maxLength={15}
                            pattern="[0-9,]*"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="car7SeatsFee">Phí xe 7 chỗ (đ/xe/tháng)</Label>
                          <input
                            id="car7SeatsFee"
                            type="text"
                            value={formatNumber(form.car7SeatsFee)}
                            onChange={(e) => handleInputChange('car7SeatsFee', e.target.value)}
                            placeholder="250,000"
                            maxLength={15}
                            pattern="[0-9,]*"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                          />
                        </div>
                      </div>

                      {/* Tóm tắt đơn giá */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-3">Tóm tắt đơn giá:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Phí dịch vụ:</span>
                            <span className="text-blue-600 font-semibold">
                              {formatNumber(form.serviceFeePerM2)} đ/m²
                              <span className="text-xs text-gray-500 ml-2">({form.serviceFeePerM2})</span>
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Phí nước:</span>
                            <span className="text-blue-600 font-semibold">
                              {formatNumber(form.waterFeePerM3)} đ/m³
                              <span className="text-xs text-gray-500 ml-2">({form.waterFeePerM3})</span>
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Phí xe máy:</span>
                            <span className="text-green-600 font-semibold">
                              {formatNumber(form.motorcycleFee)} đ/xe/tháng
                              <span className="text-xs text-gray-500 ml-2">({form.motorcycleFee})</span>
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Phí xe 4 chỗ:</span>
                            <span className="text-green-600 font-semibold">
                              {formatNumber(form.car4SeatsFee)} đ/xe/tháng
                              <span className="text-xs text-gray-500 ml-2">({form.car4SeatsFee})</span>
                            </span>
                          </div>
                          <div className="flex justify-between items-center md:col-span-2">
                            <span className="font-medium">Phí xe 7 chỗ:</span>
                            <span className="text-green-600 font-semibold">
                              {formatNumber(form.car7SeatsFee)} đ/xe/tháng
                              <span className="text-xs text-gray-500 ml-2">({form.car7SeatsFee})</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Form tạo hóa đơn theo tháng
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calculator className="h-4 w-4" />
                  Thông tin tạo hóa đơn
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
                <div className="text-sm text-gray-600">
                  <p>• Hệ thống sẽ tự động tính toán các khoản phí dựa trên cấu hình và dữ liệu thực tế</p>
                  <p>• Bao gồm: Phí dịch vụ, phí nước, phí gửi xe</p>
                  <p>• <strong>Lưu ý:</strong> Có giới hạn 100ms giữa các request để tránh spam</p>
                  <p>• <strong>Tạo hóa đơn tháng:</strong> Tạo hóa đơn cho toàn bộ căn hộ trong một tháng cụ thể</p>
                </div>

                {/* Thông báo đặc biệt cho tạo hóa đơn theo tháng */}
                <Alert className="bg-blue-50 border-blue-200">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>🎯 Tạo hóa đơn theo tháng:</strong> Chức năng này sẽ tạo hóa đơn cho toàn bộ căn hộ trong tháng <span className="font-bold text-blue-600">{selectedMonth}/{selectedYear}</span>. 
                    Sử dụng endpoint <code>/api/admin/yearly-billing/generate-month/{selectedYear}/{selectedMonth}</code> để tạo hóa đơn cho tháng cụ thể.
                    <br />
                    <span className="text-sm text-blue-700 mt-1 block">
                      • Sẽ tạo hóa đơn cho toàn bộ căn hộ trong tháng {selectedMonth}/{selectedYear}
                      <br />
                      • Bao gồm: Phí dịch vụ, phí nước, phí gửi xe (xe máy, xe 4 chỗ, xe 7 chỗ)
                      <br />
                      • Hóa đơn sẽ được tạo cho {apartments.length} căn hộ hiện có
                      <br />
                      • <strong>Đây chính là chức năng tạo hóa đơn cho toàn bộ căn hộ trong tháng cụ thể!</strong>
                    </span>
                  </AlertDescription>
                </Alert>

                {/* Thống kê hóa đơn */}
                {showStats && invoiceStats && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-3 text-blue-800">Thống kê hóa đơn năm {invoiceStats.year}:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{invoiceStats.totalInvoices || 0}</div>
                        <div className="text-gray-600">Tổng hóa đơn</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{invoiceStats.paidInvoices || 0}</div>
                        <div className="text-gray-600">Đã thanh toán</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">{invoiceStats.unpaidInvoices || 0}</div>
                        <div className="text-gray-600">Chưa thanh toán</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">{invoiceStats.overdueInvoices || 0}</div>
                        <div className="text-gray-600">Quá hạn</div>
                      </div>
                    </div>
                    {invoiceStats.totalAmount && (
                      <div className="mt-3 text-center">
                        <div className="text-lg font-semibold text-green-700">
                          Tổng tiền: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(invoiceStats.totalAmount)}
                        </div>
                      </div>
                    )}
                    <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                      <strong>Endpoint sử dụng:</strong> /api/admin/yearly-billing/generate-month/{selectedYear}/{selectedMonth} (tạo hóa đơn cho tháng cụ thể)
                    </div>
                  </div>
                )}

                {/* Nút chức năng */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => loadInvoiceStats(selectedYear)}
                    disabled={loading}
                  >
                    Xem thống kê
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearCache}
                    disabled={loading}
                  >
                    Xóa cache
                  </Button>
                </div>
              </div>
            )}

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
                disabled={loading || (billingMode === 'yearly' && yearExists) || (billingMode === 'monthly' && (!selectedYear || !selectedMonth))}
                className="min-w-[200px]"
              >
                {loading ? 'Đang xử lý...' : 
                  billingMode === 'yearly' ? `Tạo biểu phí năm ${selectedYear}` :
                  `Tạo hóa đơn tháng ${selectedMonth}/${selectedYear} (${apartments.length} căn hộ)`
                }
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 