"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  FileText, 
  Calendar, 
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  Building,
  Car,
  Droplets,
  Zap,
  Wrench,
  ParkingCircle,
  Lightbulb
} from 'lucide-react';
import { useYearlyBilling } from '@/hooks/use-yearly-billing';
import { useApartments } from '@/hooks/use-apartments';
import { useLanguage } from '@/lib/i18n';
import { api } from '@/lib/api';
import { useRef } from 'react';

interface InvoiceItem {
  id: number;
  feeType: string;
  description: string;
  amount: number;
}

interface Invoice {
  id: number;
  apartmentId: number;
  apartmentNumber?: string;
  residentName?: string;
  buildingId?: number;
  floorNumber?: number;
  unitNumber?: string;
  billingPeriod: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  status: string;
  items: InvoiceItem[];
  createdAt?: string;
  updatedAt?: string;
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t, language } = useLanguage();
  const invoiceId = parseInt(params.id as string);
  const printRef = useRef<HTMLDivElement | null>(null);
  
  const { getInvoiceById, loading, error } = useYearlyBilling();
  const { apartments, getApartmentById } = useApartments();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [debugInfo, setDebugInfo] = useState(false);
  const [apartmentCode, setApartmentCode] = useState<string>('');


  useEffect(() => {
    if (invoiceId) {
      loadInvoiceDetail();
    }
  }, [invoiceId]);

  const loadInvoiceDetail = async () => {
    try {
      const result = await getInvoiceById(invoiceId);
      if (result) {
        setInvoice(result);
        

        
        // If unit code is not present in invoice payload, try apartments list then fetch details
        if (!result.unitNumber && !(result as any).apartmentUnitNumber && !result.apartmentNumber) {
          const fromList = apartments.find((a: any) => Number(a.id) === Number(result.apartmentId));
          if (fromList?.unitNumber) {
            setApartmentCode(fromList.unitNumber);
          } else {
            const details = await getApartmentById(result.apartmentId);
            if ((details as any)?.unitNumber) setApartmentCode((details as any).unitNumber);
            else if (details?.number) setApartmentCode(details.number);
          }
        }
      }
    } catch (error) {
      console.error('Error loading invoice:', error);
    }
  };

  const handlePrint = () => {
    // In toàn trang; đơn giản và tương thích trình duyệt (người dùng có thể lưu PDF)
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleDownloadPdf = () => {
    // Dùng print dialog để lưu PDF (không cần lib ngoài)
    handlePrint();
  };

  const handleSendEmail = async () => {
    try {
      const res = await api.post(`/api/admin/invoices/${invoiceId}/send-email`);
      if (res.ok) {
        alert(t('admin.invoices.emailSent','Đã gửi email hóa đơn.'));
      } else {
        const err = await res.json();
        alert(err.message || t('admin.invoices.emailFailed','Gửi email thất bại'));
      }
    } catch (e) {
      alert(t('admin.invoices.emailFailed','Gửi email thất bại'));
    }
  };

  // Also react to apartments list becoming available
  useEffect(() => {
    if (invoice && !apartmentCode) {
      const fromList = apartments.find((a: any) => Number(a.id) === Number(invoice.apartmentId));
      if (fromList?.unitNumber) setApartmentCode(fromList.unitNumber);
    }
  }, [apartments, invoice]);

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'OVERDUE':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PAID':
        return <CheckCircle className="h-4 w-4" />;
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'OVERDUE':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getFeeIcon = (feeType: string) => {
    switch (feeType.toUpperCase()) {
      case 'SERVICE_FEE':
        return <Zap className="h-4 w-4 text-blue-600" />;
      case 'WATER_FEE':
        return <Droplets className="h-4 w-4 text-cyan-600" />;
      case 'VEHICLE_FEE':
        return <Car className="h-4 w-4 text-green-600" />;
      case 'MOTORCYCLE':
        return <Car className="h-4 w-4 text-green-600" />;
      case 'CAR_4_SEATS':
        return <Car className="h-4 w-4 text-purple-600" />;
      case 'CAR_7_SEATS':
        return <Car className="h-4 w-4 text-purple-600" />;
      case 'CAR':
        return <Car className="h-4 w-4 text-purple-600" />;
      case 'ELECTRICITY':
        return <Lightbulb className="h-4 w-4 text-yellow-600" />;
      case 'PARKING':
        return <ParkingCircle className="h-4 w-4 text-orange-600" />;
      case 'MAINTENANCE':
        return <Wrench className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <AdminLayout title={t('admin.invoices.details','Chi tiết hóa đơn')}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{t('admin.invoices.loadingDetail','Đang tải thông tin hóa đơn...')}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title={t('admin.invoices.details','Chi tiết hóa đơn')}>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </AdminLayout>
    );
  }

  if (!invoice) {
    return (
      <AdminLayout title={t('admin.invoices.details','Chi tiết hóa đơn')}>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{t('admin.invoices.notFound','Không tìm thấy hóa đơn')} #{invoiceId}</AlertDescription>
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`${t('admin.invoices.details','Chi tiết hóa đơn')} #${invoice.id}`}>
      <div className="container mx-auto p-6" ref={printRef}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('admin.action.back','Quay lại')}
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{t('admin.invoices.details','Chi tiết hóa đơn')} #{invoice.id}</h1>
              <p className="text-gray-600">{t('admin.invoices.period','Kỳ')}: {invoice.billingPeriod}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadInvoiceDetail}
              disabled={loading}
            >
              {loading ? t('admin.loading','Đang tải...') : t('admin.action.reload','Tải lại')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDebugInfo(!debugInfo)}
            >
              {t('admin.debug.title','Debug')}
            </Button>
            <Badge className={`flex items-center gap-2 ${getStatusColor(invoice.status)}`}>
              {getStatusIcon(invoice.status)}
              {t(`admin.invoices.status.${invoice.status}` as any, invoice.status)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Thông tin chính */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {t('admin.invoices.details','Chi tiết hóa đơn')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Thông tin căn hộ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Building className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">{t('admin.apartments.apartmentCode','Mã căn hộ')}</p>
                      <p className="font-semibold">
                        {apartmentCode 
                          || invoice.unitNumber 
                          || (invoice as any).apartmentUnitNumber 
                          || invoice.apartmentNumber 
                          || (invoice as any).unit 
                          || `${t('admin.apartments.apartment','Căn hộ')} ${invoice.apartmentId}`}
                      </p>
                      {invoice.buildingId && (
                        <p className="text-xs text-gray-500">
                          ID: {invoice.apartmentId}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Ngày tháng */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-600">{t('admin.invoices.issueDate','Ngày phát hành')}</p>
                      <p className="font-semibold">{formatDate(invoice.issueDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">{t('admin.invoices.dueDate','Ngày đến hạn')}</p>
                      <p className="font-semibold">{formatDate(invoice.dueDate)}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Chi tiết các khoản phí */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">{t('admin.invoices.items.title','Chi tiết các khoản phí')}</h3>
                  <div className="space-y-3">
                    {invoice.items.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>{t('admin.invoices.items.empty','Chưa có chi tiết phí')}</p>
                      </div>
                    ) : (
                      invoice.items.map((item, index) => {
                        // Xử lý hiển thị phí gửi xe - tách từng loại xe thành hàng riêng
                        if (item.feeType === 'VEHICLE_FEE' && item.description.includes('xe máy') && item.description.includes('ô tô')) {
                          // Tách phí gửi xe thành các loại xe riêng biệt
                          const vehicleItems = [];
                          
                          // Tách xe máy
                          if (item.description.includes('xe máy')) {
                            const motorcycleMatch = item.description.match(/(\d+)\s+xe máy\s*\(([^)]+)\)/);
                            if (motorcycleMatch) {
                              const count = parseInt(motorcycleMatch[1]);
                              const price = motorcycleMatch[2];
                              const amount = count * parseInt(price.replace(/[^\d]/g, ''));
                              vehicleItems.push({
                                ...item,
                                id: item.id + '_motorcycle',
                                description: `${count} xe máy (${price})`,
                                amount: amount,
                                feeType: 'MOTORCYCLE'
                              });
                            }
                          }
                          
                          // Tách xe 4 chỗ
                          if (item.description.includes('ô tô 4 chỗ')) {
                            const car4Match = item.description.match(/(\d+)\s+ô tô 4 chỗ\s*\(([^)]+)\)/);
                            if (car4Match) {
                              const count = parseInt(car4Match[1]);
                              const price = car4Match[2];
                              const amount = count * parseInt(price.replace(/[^\d]/g, ''));
                              vehicleItems.push({
                                ...item,
                                id: item.id + '_car4',
                                description: `${count} xe 4 chỗ (${price})`,
                                amount: amount,
                                feeType: 'CAR_4_SEATS'
                              });
                            }
                          }
                          
                          // Tách xe 7 chỗ
                          if (item.description.includes('ô tô 7 chỗ')) {
                            const car7Match = item.description.match(/(\d+)\s+ô tô 7 chỗ\s*\(([^)]+)\)/);
                            if (car7Match) {
                              const count = parseInt(car7Match[1]);
                              const price = car7Match[2];
                              const amount = count * parseInt(price.replace(/[^\d]/g, ''));
                              vehicleItems.push({
                                ...item,
                                id: item.id + '_car7',
                                description: `${count} xe 7 chỗ (${price})`,
                                amount: amount,
                                feeType: 'CAR_7_SEATS'
                              });
                            }
                          }
                          
                          // Hiển thị từng loại xe riêng biệt
                          return vehicleItems.map((vehicleItem, vehicleIndex) => (
                            <div key={vehicleItem.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                  {getFeeIcon(vehicleItem.feeType)}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{vehicleItem.description}</p>
                                  <p className="text-sm text-gray-600 capitalize">
                                    {vehicleItem.feeType === 'MOTORCYCLE' && 'Phí xe máy'}
                                    {vehicleItem.feeType === 'CAR_4_SEATS' && 'Phí xe 4 chỗ'}
                                    {vehicleItem.feeType === 'CAR_7_SEATS' && 'Phí xe 7 chỗ'}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-green-600 text-lg">
                                  {formatCurrency(vehicleItem.amount)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {t('admin.invoices.items.itemLabel','Khoản phí')} #{vehicleItem.id}
                                </p>
                              </div>
                            </div>
                          ));
                        }
                        
                        // Hiển thị các khoản phí khác bình thường
                        return (
                          <div key={item.id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-white rounded-lg shadow-sm">
                                {getFeeIcon(item.feeType)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{item.description}</p>
                                <p className="text-sm text-gray-600 capitalize">
                                  {item.feeType === 'SERVICE_FEE' && t('admin.invoices.feeType.SERVICE_FEE','Phí dịch vụ')}
                                  {item.feeType === 'WATER_FEE' && t('admin.invoices.feeType.WATER_FEE','Phí nước')}
                                  {item.feeType === 'VEHICLE_FEE' && t('admin.invoices.feeType.VEHICLE_FEE','Phí gửi xe')}
                                  {item.feeType === 'motorcycle' && 'Phí xe máy'}
                                  {item.feeType === 'car' && 'Phí xe ô tô'}
                                  {item.feeType === 'electricity' && 'Phí điện'}
                                  {item.feeType === 'parking' && 'Phí gửi xe'}
                                  {item.feeType === 'maintenance' && 'Phí bảo trì'}
                                  {!['SERVICE_FEE', 'WATER_FEE', 'VEHICLE_FEE', 'motorcycle', 'car', 'electricity', 'parking', 'maintenance'].includes(item.feeType) && item.feeType}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-600 text-lg">
                                {formatCurrency(item.amount)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {t('admin.invoices.items.itemLabel','Khoản phí')} #{item.id || index + 1}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <Separator />

                {/* Tổng tiền */}
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="text-lg font-semibold">{t('admin.invoices.total','Tổng cộng')}</p>
                      <p className="text-sm text-gray-600">{t('admin.invoices.totalDesc','Tất cả các khoản phí')}</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(invoice.totalAmount)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tóm tắt */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('admin.summary.title','Tóm tắt')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('admin.summary.invoiceId','Mã hóa đơn')}:</span>
                  <span className="font-semibold">#{invoice.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('admin.invoices.period','Kỳ')}:</span>
                  <span className="font-semibold">{invoice.billingPeriod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('admin.invoices.items.count','Số khoản phí')}:</span>
                  <span className="font-semibold">{invoice.items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('admin.invoices.status','Trạng thái')}:</span>
                  <Badge className={getStatusColor(invoice.status)}>
                    {t(`admin.invoices.status.${invoice.status}` as any, invoice.status)}
                  </Badge>
                </div>
                {invoice.createdAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('admin.createdAt','Ngày tạo')}:</span>
                    <span className="font-semibold text-sm">
                      {formatDate(invoice.createdAt)}
                    </span>
                  </div>
                )}
                {invoice.updatedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('admin.updatedAt','Cập nhật')}:</span>
                    <span className="font-semibold text-sm">
                      {formatDate(invoice.updatedAt)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Hành động */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{t('admin.actions.title','Hành động')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline" onClick={handleDownloadPdf}>
                  <FileText className="h-4 w-4 mr-2" />
                  {t('admin.actions.downloadPdf','Tải PDF')}
                </Button>
                <Button className="w-full" variant="outline" onClick={handleSendEmail}>
                  <FileText className="h-4 w-4 mr-2" />
                  {t('admin.actions.sendEmail','Gửi email')}
                </Button>
                <Button className="w-full" variant="outline" onClick={handlePrint}>
                  <FileText className="h-4 w-4 mr-2" />
                  {t('admin.actions.printInvoice','In hóa đơn')}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Debug Information */}
        {debugInfo && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg text-orange-600">{t('admin.debug.title','Debug')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 p-4 rounded-lg">
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(invoice, null, 2)}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
} 