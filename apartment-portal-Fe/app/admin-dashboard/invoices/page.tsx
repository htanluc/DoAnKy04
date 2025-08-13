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
import { 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  Calculator,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { Invoice } from '@/lib/api';
import { api } from '@/lib/api';
import { useApartments } from '@/hooks/use-apartments';
import { useInvoices } from '@/hooks/use-invoices';
import { useYearlyBilling } from '@/hooks/use-yearly-billing';
import { Apartment as ApiApartment } from '@/lib/api';

export default function InvoicesPage() {
  const { t } = useLanguage();
  const { apartments, loading: apartmentsLoading, error: apartmentsError } = useApartments();
  const { invoices, loading: invoicesLoading, error: invoicesError, fetchInvoices } = useInvoices();
  const { generateMonthlyInvoices, clearMessages } = useYearlyBilling();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [genYear, setGenYear] = useState(new Date().getFullYear());
  const [genMonth, setGenMonth] = useState(new Date().getMonth() + 1);
  const [genLoading, setGenLoading] = useState(false);
  const [genMessage, setGenMessage] = useState<string | null>(null);

  // Determine if invoices already exist for the selected period
  const selectedPeriodKey = `${genYear}-${String(genMonth).padStart(2, '0')}`;
  const invoicesInSelectedPeriod = invoices.filter(inv => (inv.billingPeriod || '').startsWith(selectedPeriodKey));
  const blockBatchCreate = invoicesInSelectedPeriod.length > 0;
  

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

  const handleGenerateMonthly = async () => {
    clearMessages();
    setGenMessage(null);
    setGenLoading(true);
    if (blockBatchCreate) {
      setGenMessage(`Đã phát hiện ${invoicesInSelectedPeriod.length} hóa đơn trong kỳ ${selectedPeriodKey}. Không cho phép tạo đồng loạt.`);
      setGenLoading(false);
      return;
    }
    const res = await generateMonthlyInvoices(genYear, genMonth);
    if (res?.success) {
      setGenMessage(res.message || 'Đã tạo hóa đơn tháng thành công');
      await fetchInvoices();
    } else {
      setGenMessage('Tạo hóa đơn thất bại');
    }
    setGenLoading(false);
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
              Quản lý hóa đơn
            </h2>
            <p className="text-gray-600">
              Danh sách và trạng thái hóa đơn của cư dân
            </p>
          </div>
        </div>

        {/* Generate monthly invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Tạo hóa đơn theo tháng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
              <div>
                <label className="text-sm text-gray-600">Năm</label>
                  <select value={genYear} onChange={e=>setGenYear(parseInt(e.target.value))} className="border rounded px-3 py-2" title="Năm tạo hóa đơn">
                    {Array.from({length:11},(_,i)=>new Date().getFullYear()-5+i).map(y=> (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Tháng</label>
                  <select value={genMonth} onChange={e=>setGenMonth(parseInt(e.target.value))} className="border rounded px-3 py-2" title="Tháng">
                  {Array.from({length:12},(_,i)=>i+1).map(m=> (
                    <option key={m} value={m}>Tháng {m}</option>
                  ))}
                </select>
              </div>
              <Button onClick={handleGenerateMonthly} disabled={genLoading || blockBatchCreate}>
                {genLoading ? 'Đang tạo...' : blockBatchCreate ? 'Đã có hóa đơn tháng này' : `Tạo hóa đơn tháng ${genMonth}/${genYear}`}
              </Button>
              <div className="text-sm text-gray-700">
                {blockBatchCreate && (
                  <span className="text-red-600">Tháng {genMonth}/{genYear} đã có {invoicesInSelectedPeriod.length} hóa đơn. Không thể tạo đồng loạt.</span>
                )}
                {genMessage && !blockBatchCreate && (
                  <span>{genMessage}</span>
                )}
              </div>
            </div>
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
                        title="Trạng thái hóa đơn"
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
      </div>
    </AdminLayout>
  );
} 