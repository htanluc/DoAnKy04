"use client";

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Calculator,
  Settings,
  History,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { Invoice } from '@/lib/api';
import { api } from '@/lib/api';
import YearlyBillingForm from '@/components/admin/YearlyBillingForm';
import CurrentBillingConfig from '@/components/admin/CurrentBillingConfig';
import BillingHistoryComponent from '@/components/admin/BillingHistory';
import { useApartments } from '@/hooks/use-apartments';
import { useYearlyBilling, YearlyBillingConfig } from '@/hooks/use-yearly-billing';
import { useInvoices } from '@/hooks/use-invoices';
import { Apartment as ApiApartment } from '@/lib/api';

export default function InvoicesPage() {
  const { t } = useLanguage();
  const { apartments, loading: apartmentsLoading, error: apartmentsError } = useApartments();
  const { invoices, loading: invoicesLoading, error: invoicesError, fetchInvoices } = useInvoices();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
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
  }, []); // Chỉ gọi một lần khi component mount

  const filteredInvoices = invoices.filter(invoice => {
    const apartment = apartments.find(apt => apt.id === invoice.apartmentId) as ApiApartment | undefined;
    const apartmentInfo = apartment ? `Tòa ${apartment.buildingId} - Tầng ${apartment.floorNumber} - ${apartment.unitNumber}` : `Căn hộ ${invoice.apartmentId}`;
    
    const matchesSearch = invoice.id.toString().includes(searchTerm.toLowerCase()) ||
                         invoice.apartmentId.toString().includes(searchTerm.toLowerCase()) ||
                         apartmentInfo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-green-100 text-green-800">Đã thanh toán</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ thanh toán</Badge>;
      case 'OVERDUE':
        return <Badge className="bg-red-100 text-red-800">Quá hạn</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-gray-100 text-gray-800">Đã hủy</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatNumber = (value: number | undefined | null) => {
    if (value === undefined || value === null) return '0';
    return value.toLocaleString('vi-VN');
  };

  if (invoicesLoading || apartmentsLoading) {
    return (
      <AdminLayout title={t('admin.invoices.title')}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">{t('admin.loading')}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (apartmentsError || invoicesError) {
    return (
      <AdminLayout title={t('admin.invoices.title')}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium">
              {apartmentsError ? 'Lỗi tải dữ liệu căn hộ' : 'Lỗi tải dữ liệu hóa đơn'}
            </p>
            <p className="text-gray-600 mt-2">{apartmentsError || invoicesError}</p>
            <Button 
              onClick={() => {
                if (apartmentsError) window.location.reload();
                if (invoicesError) fetchInvoices();
              }} 
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
    <AdminLayout title={t('admin.invoices.title')}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calculator className="h-6 w-6" />
              Quản lý hóa đơn & Biểu phí
            </h2>
            <p className="text-gray-600">
              Quản lý hóa đơn và tạo biểu phí cấu hình cho cư dân
            </p>
          </div>
        </div>

        {/* Main Content with Tabs */}
        <Tabs defaultValue="invoices" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="invoices">Hóa đơn</TabsTrigger>
            <TabsTrigger value="config">Cấu hình phí</TabsTrigger>
            <TabsTrigger value="history">Lịch sử</TabsTrigger>
          </TabsList>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-6">
            {/* Fee Config Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
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

            {/* Create Invoice Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Tạo hóa đơn theo tháng
                </CardTitle>
              </CardHeader>
              <CardContent>
                <YearlyBillingForm apartments={apartments} />
              </CardContent>
            </Card>

            {/* Invoices List */}
            <div className="space-y-4">
              {/* Header with actions */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {t('admin.invoices.list', 'Danh sách hóa đơn')}
                  </h3>
                  <p className="text-gray-600">
                    {t('admin.invoices.listDesc', 'Quản lý tất cả hóa đơn của cư dân')}
                  </p>
                </div>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Tổng hóa đơn</p>
                        <p className="text-2xl font-bold text-gray-900">{invoices.length}</p>
                      </div>
                      <Calculator className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Đã thanh toán</p>
                        <p className="text-2xl font-bold text-green-600">
                          {invoices.filter(inv => inv.status === 'PAID').length}
                        </p>
                      </div>
                      <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                        <div className="h-4 w-4 bg-green-600 rounded-full"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Chờ thanh toán</p>
                        <p className="text-2xl font-bold text-yellow-600">
                          {invoices.filter(inv => inv.status === 'PENDING').length}
                        </p>
                      </div>
                      <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <div className="h-4 w-4 bg-yellow-600 rounded-full"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Quá hạn</p>
                        <p className="text-2xl font-bold text-red-600">
                          {invoices.filter(inv => inv.status === 'OVERDUE').length}
                        </p>
                      </div>
                      <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                        <div className="h-4 w-4 bg-red-600 rounded-full"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Search and Filter */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Tìm kiếm theo số hóa đơn, căn hộ, cư dân..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Filter className="h-4 w-4 text-gray-400" />
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                      >
                        <option value="all">Tất cả trạng thái</option>
                        <option value="PAID">Đã thanh toán</option>
                        <option value="PENDING">Chờ thanh toán</option>
                        <option value="OVERDUE">Quá hạn</option>
                        <option value="CANCELLED">Đã hủy</option>
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Invoices Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Danh sách hóa đơn ({filteredInvoices.length})</span>
                    <Button 
                      onClick={fetchInvoices} 
                      variant="outline" 
                      size="sm"
                      disabled={invoicesLoading}
                    >
                      {invoicesLoading ? 'Đang tải...' : 'Làm mới'}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredInvoices.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">{t('admin.noData')}</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t('admin.invoices.invoiceNumber')}</TableHead>
                            <TableHead>{t('admin.invoices.apartment')}</TableHead>
                            <TableHead>{t('admin.invoices.amount')}</TableHead>
                            <TableHead>{t('admin.invoices.dueDate')}</TableHead>
                            <TableHead>{t('admin.invoices.status')}</TableHead>
                            <TableHead>{t('admin.users.actions')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredInvoices.map((invoice) => {
                            const apartment = apartments.find(apt => apt.id === invoice.apartmentId) as ApiApartment | undefined;
                            const apartmentInfo = apartment ? `Tòa ${apartment.buildingId} - Tầng ${apartment.floorNumber} - ${apartment.unitNumber}` : `Căn hộ ${invoice.apartmentId}`;
                            
                            return (
                              <TableRow key={invoice.id}>
                                <TableCell className="font-medium">
                                  #{invoice.id}
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{apartmentInfo}</div>
                                    <div className="text-sm text-gray-500">Kỳ: {invoice.billingPeriod}</div>
                                  </div>
                                </TableCell>
                                <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                                <TableCell>
                                  {new Date(invoice.dueDate).toLocaleDateString('vi-VN')}
                                </TableCell>
                                <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <Link href={`/admin-dashboard/invoices/${invoice.id}`}>
                                      <Button variant="outline" size="sm">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </Link>
                                    <Link href={`/admin-dashboard/invoices/edit/${invoice.id}`}>
                                      <Button variant="outline" size="sm">
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    </Link>
                                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
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