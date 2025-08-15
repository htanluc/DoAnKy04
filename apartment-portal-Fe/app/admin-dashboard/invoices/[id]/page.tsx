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
  const { t } = useLanguage();
  const invoiceId = parseInt(params.id as string);
  
  const { getInvoiceById, loading, error } = useYearlyBilling();
  const { apartments, getApartmentById } = useApartments();
  const { t } = useLanguage();
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

  // Also react to apartments list becoming available
  useEffect(() => {
    if (invoice && !apartmentCode) {
      const fromList = apartments.find((a: any) => Number(a.id) === Number(invoice.apartmentId));
      if (fromList?.unitNumber) setApartmentCode(fromList.unitNumber);
    }
  }, [apartments, invoice]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      case 'overdue':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return <CheckCircle className="h-4 w-4" />;
      case 'unpaid':
        return <Clock className="h-4 w-4" />;
      case 'overdue':
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
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <AdminLayout title="Chi tiết hóa đơn">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin hóa đơn...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Chi tiết hóa đơn">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </AdminLayout>
    );
  }

  if (!invoice) {
    return (
      <AdminLayout title="Chi tiết hóa đơn">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Không tìm thấy hóa đơn với ID {invoiceId}</AlertDescription>
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Chi tiết hóa đơn #${invoice.id}`}>
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Chi tiết hóa đơn #{invoice.id}</h1>
              <p className="text-gray-600">Kỳ thanh toán: {invoice.billingPeriod}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadInvoiceDetail}
              disabled={loading}
            >
              {loading ? 'Đang tải...' : 'Tải lại'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDebugInfo(!debugInfo)}
            >
              Debug
            </Button>
            <Badge className={`flex items-center gap-2 ${getStatusColor(invoice.status)}`}>
              {getStatusIcon(invoice.status)}
              {invoice.status}
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
                  Thông tin hóa đơn
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Thông tin căn hộ */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Building className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Mã căn hộ</p>
                      <p className="font-semibold">
                        {apartmentCode 
                          || invoice.unitNumber 
                          || (invoice as any).apartmentUnitNumber 
                          || invoice.apartmentNumber 
                          || (invoice as any).unit 
                          || `Căn hộ ${invoice.apartmentId}`}
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
                      <p className="text-sm text-gray-600">Ngày phát hành</p>
                      <p className="font-semibold">{formatDate(invoice.issueDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="text-sm text-gray-600">Hạn thanh toán</p>
                      <p className="font-semibold">{formatDate(invoice.dueDate)}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Chi tiết các khoản phí */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Chi tiết các khoản phí</h3>
                  <div className="space-y-3">
                    {invoice.items.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                        <p>Chưa có chi tiết phí</p>
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
                                  Khoản phí #{vehicleItem.id}
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
                                Khoản phí #{item.id || index + 1}
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
                      <p className="text-lg font-semibold">Tổng cộng</p>
                      <p className="text-sm text-gray-600">Tất cả các khoản phí</p>
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
                <CardTitle className="text-lg">Tóm tắt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mã hóa đơn:</span>
                  <span className="font-semibold">#{invoice.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Kỳ thanh toán:</span>
                  <span className="font-semibold">{invoice.billingPeriod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Số khoản phí:</span>
                  <span className="font-semibold">{invoice.items.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trạng thái:</span>
                  <Badge className={getStatusColor(invoice.status)}>
                    {invoice.status}
                  </Badge>
                </div>
                {invoice.createdAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngày tạo:</span>
                    <span className="font-semibold text-sm">
                      {formatDate(invoice.createdAt)}
                    </span>
                  </div>
                )}
                {invoice.updatedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cập nhật:</span>
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
                <CardTitle className="text-lg">Hành động</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Tải PDF
                </Button>
                <Button className="w-full" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Gửi email
                </Button>
                <Button className="w-full" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  In hóa đơn
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Debug Information */}
        {debugInfo && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg text-orange-600">Debug Information</CardTitle>
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