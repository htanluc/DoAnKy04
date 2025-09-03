"use client";

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminGuard from '@/components/auth/admin-guard';
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
import { exportInvoicesToExcel } from '@/lib/excel-export';

export default function InvoicesPage() {
  return (
    <AdminGuard>
      <InvoicesPageContent />
    </AdminGuard>
  );
}

function InvoicesPageContent() {
  const { t, language } = useLanguage();
  const { apartments, loading: apartmentsLoading, error: apartmentsError } = useApartments();
  const { invoices, loading: invoicesLoading, error: invoicesError, fetchInvoices } = useInvoices();
  const { generateMonthlyInvoices, clearMessages } = useYearlyBilling();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;
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
         const apartmentInfo = apartment ? (apartment.unitNumber || `${t('admin.apartments.apartment')} ${apartment.id}`) : `${t('admin.apartments.apartment')} ${invoice.apartmentId}`;
    
    const matchesSearch = invoice.id.toString().includes(searchTerm.toLowerCase()) ||
                         invoice.apartmentId.toString().includes(searchTerm.toLowerCase()) ||
                         apartmentInfo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    
    // Filter by month and year using billingPeriod
    const billingPeriod = invoice.billingPeriod || '';
    const expectedPeriod = `${filterYear}-${String(filterMonth).padStart(2, '0')}`;
    const matchesMonth = billingPeriod === expectedPeriod;
    
    // Debug: Log first few invoices to check billingPeriod format
    if (invoice.id <= 3) {
      console.log(`Invoice ${invoice.id}: billingPeriod="${billingPeriod}", expected="${expectedPeriod}", matches=${matchesMonth}`);
    }
    
    return matchesSearch && matchesStatus && matchesMonth;
  });

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const pagedInvoices = filteredInvoices.slice(startIndex, startIndex + pageSize);
  // All-time aggregates (not filtered by month/year)
  const allInvoices = invoices;
  const allTotalAmount = allInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const allPaidInvoices = allInvoices.filter(inv => inv.status === 'PAID');
  const allPaidAmount = allPaidInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const allPendingInvoices = allInvoices.filter(inv => inv.status === 'PENDING');
  const allPendingAmount = allPendingInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  const allOverdueInvoices = allInvoices.filter(inv => inv.status === 'OVERDUE');
  const allOverdueAmount = allOverdueInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);
  useEffect(() => {
    // Reset to first page when filters/search change
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterYear, filterMonth]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge className="bg-green-100 text-green-800">{t('admin.invoices.status.PAID')}</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">{t('admin.invoices.status.PENDING')}</Badge>;
      case 'OVERDUE':
        return <Badge className="bg-red-100 text-red-800">{t('admin.invoices.status.OVERDUE')}</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-gray-100 text-gray-800">{t('admin.invoices.status.CANCELLED')}</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'vi' ? 'vi-VN' : 'en-US', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatNumber = (value: number | undefined | null) => {
    if (value === undefined || value === null) return '0';
    return value.toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US');
  };

  const handleGenerateMonthly = async () => {
    clearMessages();
    setGenMessage(null);
    setGenLoading(true);
    if (blockBatchCreate) {
             setGenMessage(`${t('admin.invoices.generateMonthly.existsWarning').replace('{month}', String(genMonth)).replace('{year}', String(genYear)).replace('{count}', String(invoicesInSelectedPeriod.length))} ${t('admin.invoices.generateMonthly.cannotBatch')}`);
      setGenLoading(false);
      return;
    }
    const res = await generateMonthlyInvoices(genYear, genMonth);
    if (res?.success) {
      setGenMessage(res.message || t('admin.success.save'));
      await fetchInvoices();
    } else {
      // Hiển thị thông báo lỗi chi tiết hơn
      let errorMessage = t('admin.error.save');
      if (res?.message) {
        if (res.message.includes('chk_invoice_amount') || res.message.includes('constraint')) {
          errorMessage = `Không thể tạo hóa đơn cho tháng ${genMonth}/${genYear}. Lý do: Chưa có biểu phí dịch vụ cho tháng này. Vui lòng tạo cấu hình phí dịch vụ trước khi tạo hóa đơn.`;
        } else if (res.message.includes('Service fee config not found') || res.message.includes('Chưa có cấu hình phí dịch vụ')) {
          errorMessage = `Không thể tạo hóa đơn cho tháng ${genMonth}/${genYear}. Lý do: Chưa có cấu hình phí dịch vụ. Vui lòng tạo biểu phí trước.`;
        } else {
          errorMessage = res.message;
        }
      }
      setGenMessage(errorMessage);
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
               {apartmentsError ? t('admin.error.loadApartments') : t('admin.error.loadInvoices')}
             </p>
                         <p className="text-gray-600 mt-2">{apartmentsError || invoicesError || t('admin.error.unknown')}</p>
                          <Button 
                onClick={() => {
                  if (apartmentsError) window.location.reload();
                  if (invoicesError) fetchInvoices();
                }} 
                className="mt-4"
                variant="outline"
              >
                             {t('admin.action.retry')}
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
                             {t('admin.invoices.title')}
            </h2>
            <p className="text-gray-600">
              {t('admin.invoices.subtitle')}
            </p>
          </div>
        </div>

        {/* Generate monthly invoices */}
        <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              {t('admin.invoices.generateMonthly.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-end">
              <div>
                <label className="text-sm text-gray-600">{t('admin.invoices.generateMonthly.year')}</label>
                <select value={genYear} onChange={e=>setGenYear(parseInt(e.target.value))} className="border rounded px-3 py-2">
                  {Array.from({length:11},(_,i)=>new Date().getFullYear()-5+i).map(y=> (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600">{t('admin.invoices.generateMonthly.month')}</label>
                <select value={genMonth} onChange={e=>setGenMonth(parseInt(e.target.value))} className="border rounded px-3 py-2">

                  {Array.from({length:12},(_,i)=>i+1).map(m=> (
                    <option key={m} value={m}>{t('admin.invoices.generateMonthly.monthLabel')} {m}</option>
                  ))}
                </select>
              </div>
                             <Button onClick={handleGenerateMonthly} disabled={genLoading || blockBatchCreate}>
                 {genLoading ? t('admin.invoices.generateMonthly.generating') : blockBatchCreate ? t('admin.invoices.generateMonthly.alreadyExists') : `${t('admin.invoices.generateMonthly.generateFor')} ${genMonth}/${genYear}`}
               </Button>
              <div className="text-sm text-gray-700">
                {blockBatchCreate && (
                  <span className="text-red-600">{t('admin.invoices.generateMonthly.existsWarning').replace('{month}', String(genMonth)).replace('{year}', String(genYear)).replace('{count}', String(invoicesInSelectedPeriod.length))} {t('admin.invoices.generateMonthly.cannotBatch')}</span>
                )}
                {genMessage && !blockBatchCreate && (
                  <div className={`p-3 rounded-md ${genMessage.includes('Không thể tạo hóa đơn') ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                    <div className={`${genMessage.includes('Không thể tạo hóa đơn') ? 'text-red-800' : 'text-green-800'}`}>
                      {genMessage}
                    </div>
                    {genMessage.includes('Chưa có biểu phí') && (
                      <div className="mt-2 text-sm text-red-700">
                        <strong>Hướng dẫn:</strong>
                        <ol className="list-decimal list-inside mt-1 space-y-1">
                          <li>Vào tab "Tạo biểu phí"</li>
                          <li>Chọn "Tạo cấu hình phí dịch vụ"</li>
                          <li>Chọn năm {genYear} và tháng {genMonth}</li>
                          <li>Nhập các mức phí và nhấn "Tạo cấu hình"</li>
                          <li>Quay lại tab này để tạo hóa đơn</li>
                        </ol>
                      </div>
                    )}
                  </div>
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
                    {t('admin.invoices.list')}
                  </h3>
                  <p className="text-gray-600">
                    {t('admin.invoices.listDesc')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => exportInvoicesToExcel(filteredInvoices, apartments, language)}
                    variant="outline"
                    size="sm"
                  >
                    {t('admin.export.excel', 'Xuất Excel')}
                  </Button>
                </div>
              </div>

                                                           {/* Statistics Cards - Số lượng */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{t('admin.invoices.stats.totalInvoices')}</p>
                          <p className="text-2xl font-bold text-gray-900">{filteredInvoices.length}</p>
                          <p className="text-xs text-gray-500">Tháng {filterMonth}/{filterYear}</p>
                        </div>
                        <Calculator className="h-8 w-8 text-blue-600" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{t('admin.invoices.stats.paidInvoices')}</p>
                          <p className="text-2xl font-bold text-green-600">
                            {filteredInvoices.filter(inv => inv.status === 'PAID').length}
                          </p>
                          <p className="text-xs text-gray-500">Tháng {filterMonth}/{filterYear}</p>
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
                          <p className="text-sm font-medium text-gray-600">{t('admin.invoices.stats.pendingInvoices')}</p>
                          <p className="text-2xl font-bold text-yellow-600">
                            {filteredInvoices.filter(inv => inv.status === 'PENDING').length}
                          </p>
                          <p className="text-xs text-gray-500">Tháng {filterMonth}/{filterYear}</p>
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
                          <p className="text-sm font-medium text-gray-600">{t('admin.invoices.stats.overdueInvoices')}</p>
                          <p className="text-2xl font-bold text-red-600">
                            {filteredInvoices.filter(inv => inv.status === 'OVERDUE').length}
                          </p>
                          <p className="text-xs text-gray-500">Tháng {filterMonth}/{filterYear}</p>
                        </div>
                        <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                          <div className="h-4 w-4 bg-red-600 rounded-full"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                                                               {/* Statistics Cards - Tổng tiền */}
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                   <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                     <CardContent className="p-4">
                       <div className="text-center">
                         <p className="text-sm font-medium text-blue-600 mb-1">{t('admin.invoices.stats.totalAmount')}</p>
                         <p className="text-xl font-bold text-blue-800">
                           {formatCurrency(filteredInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0))}
                         </p>
                                                    <p className="text-xs text-blue-600 mt-1">
                           {filteredInvoices.length} {t('admin.invoices.stats.invoices')} - Tháng {filterMonth}/{filterYear}
                         </p>
                       </div>
                     </CardContent>
                   </Card>

                   <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                     <CardContent className="p-4">
                       <div className="text-center">
                         <p className="text-sm font-medium text-green-600 mb-1">{t('admin.invoices.stats.paidAmount')}</p>
                         <p className="text-xl font-bold text-green-800">
                           {formatCurrency(filteredInvoices
                             .filter(inv => inv.status === 'PAID')
                             .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
                           )}
                         </p>
                                                    <p className="text-xs text-green-600 mt-1">
                           {filteredInvoices.filter(inv => inv.status === 'PAID').length} {t('admin.invoices.stats.invoices')} - Tháng {filterMonth}/{filterYear}
                         </p>
                       </div>
                     </CardContent>
                   </Card>

                   <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                     <CardContent className="p-4">
                       <div className="text-center">
                         <p className="text-sm font-medium text-yellow-600 mb-1">{t('admin.invoices.stats.unpaidAmount')}</p>
                         <p className="text-xl font-bold text-yellow-800">
                           {formatCurrency(filteredInvoices
                             .filter(inv => inv.status === 'PENDING')
                             .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
                           )}
                         </p>
                                                    <p className="text-xs text-yellow-600 mt-1">
                           {filteredInvoices.filter(inv => inv.status === 'PENDING').length} {t('admin.invoices.stats.invoices')} - Tháng {filterMonth}/{filterYear}
                         </p>
                       </div>
                     </CardContent>
                   </Card>

                   <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                     <CardContent className="p-4">
                       <div className="text-center">
                         <p className="text-sm font-medium text-red-600 mb-1">{t('admin.invoices.stats.overdueAmount')}</p>
                         <p className="text-xl font-bold text-red-800">
                           {formatCurrency(filteredInvoices
                             .filter(inv => inv.status === 'OVERDUE')
                             .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
                           )}
                         </p>
                                                    <p className="text-xs text-red-600 mt-1">
                           {filteredInvoices.filter(inv => inv.status === 'OVERDUE').length} {t('admin.invoices.stats.invoices')} - Tháng {filterMonth}/{filterYear}
                         </p>
                       </div>
                     </CardContent>
                   </Card>
                 </div>

                                 {/* Tổng cộng tất cả */}
                 <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                   <CardContent className="p-4">
                     <div className="text-center">
                       <p className="text-lg font-medium text-indigo-100 mb-2">{t('admin.invoices.stats.grandTotal')}</p>
                       <p className="text-2xl font-bold">
                         {formatCurrency(filteredInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0))}
                       </p>
                       <p className="text-sm text-indigo-200 mt-1">
                         {filteredInvoices.length} hóa đơn - Tháng {filterMonth}/{filterYear}
                       </p>
                     </div>
                   </CardContent>
                 </Card>

                {/* Lũy kế từ trước tới nay */}
                <div className="space-y-4 mt-4">
                  <h4 className="text-lg font-semibold text-gray-900">Lũy kế từ trước tới nay</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-sm font-medium text-gray-600">Tổng tiền hóa đơn</p>
                          <p className="text-xl font-bold text-gray-900">{formatCurrency(allTotalAmount)}</p>
                          <p className="text-xs text-gray-500">{allInvoices.length} hóa đơn</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-sm font-medium text-green-600">Đã thanh toán</p>
                          <p className="text-xl font-bold text-green-700">{formatCurrency(allPaidAmount)}</p>
                          <p className="text-xs text-green-600">{allPaidInvoices.length} hóa đơn</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-sm font-medium text-yellow-600">Chưa thanh toán</p>
                          <p className="text-xl font-bold text-yellow-700">{formatCurrency(allPendingAmount)}</p>
                          <p className="text-xs text-yellow-600">{allPendingInvoices.length} hóa đơn</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-sm font-medium text-red-600">Quá hạn</p>
                          <p className="text-xl font-bold text-red-700">{formatCurrency(allOverdueAmount)}</p>
                          <p className="text-xs text-red-600">{allOverdueInvoices.length} hóa đơn</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

              {/* Search and Filter */}
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                         <Input
                           placeholder={t('admin.invoices.searchPlaceholder')}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Filter className="h-4 w-4 text-gray-400" />
                        <select
                          title={t('admin.invoices.filter.title')}
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                        >
                          <option value="all">{t('admin.invoices.filter.all')}</option>
                          <option value="PAID">{t('admin.invoices.status.PAID')}</option>
                          <option value="PENDING">{t('admin.invoices.status.PENDING')}</option>
                          <option value="OVERDUE">{t('admin.invoices.status.OVERDUE')}</option>
                          <option value="CANCELLED">{t('admin.invoices.status.CANCELLED')}</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Month and Year Filter */}
                    <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Lọc theo tháng:</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={filterYear}
                          onChange={(e) => setFilterYear(parseInt(e.target.value))}
                          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                        >
                          {Array.from({length: 11}, (_, i) => new Date().getFullYear() - 5 + i).map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                        <span className="text-gray-500">/</span>
                        <select
                          value={filterMonth}
                          onChange={(e) => setFilterMonth(parseInt(e.target.value))}
                          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                        >
                          {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                            <option key={month} value={month}>Tháng {month}</option>
                          ))}
                        </select>
                      </div>
                      <div className="text-sm text-gray-600">
                        Hiển thị: {filteredInvoices.length} hóa đơn
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Invoices Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{t('admin.invoices.list')} ({filteredInvoices.length})</span>
                    <Button 
                      onClick={fetchInvoices} 
                      variant="outline" 
                      size="sm"
                      disabled={invoicesLoading}
                    >
                                             {invoicesLoading ? t('admin.action.loading') : t('admin.action.refresh')}
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
                            <TableHead>{t('admin.invoices.hạnThanhToan')}</TableHead>
                            <TableHead>{t('admin.invoices.status')}</TableHead>
                            <TableHead>{t('admin.users.actions')}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {pagedInvoices.map((invoice) => {
                            const apartment = apartments.find(apt => apt.id === invoice.apartmentId) as ApiApartment | undefined;
                            const apartmentInfo = apartment ? (apartment.unitNumber || `${t('admin.apartments.apartment')} ${apartment.id}`) : `${t('admin.apartments.apartment')} ${invoice.apartmentId}`;
                            
                            return (
                              <TableRow key={invoice.id}>
                                <TableCell className="font-medium">
                                  #{invoice.id}
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{apartmentInfo}</div>
                                  </div>
                                </TableCell>
                                <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
                                <TableCell>
                                  {new Date(invoice.dueDate).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}
                                </TableCell>
                                <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <Link href={`/admin-dashboard/invoices/${invoice.id}`}>
                                      <Button variant="outline" size="sm">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </Link>
                                    {/* Edit and Delete actions removed as requested */}
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                      {/* Pagination Controls */}
                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          {t('pagination.display', 'Hiển thị {start}-{end} trong {total}')
                            .replace('{start}', String(Math.min(filteredInvoices.length, startIndex + 1)))
                            .replace('{end}', String(Math.min(filteredInvoices.length, startIndex + pagedInvoices.length)))
                            .replace('{total}', String(filteredInvoices.length))}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            className="border rounded px-3 py-1 text-sm disabled:opacity-50"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          >
                            {t('pagination.previous', 'Trước')}
                          </button>
                          <span className="text-sm">{currentPage}/{totalPages}</span>
                          <button
                            className="border rounded px-3 py-1 text-sm disabled:opacity-50"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          >
                            {t('pagination.next', 'Sau')}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
        </div>
      </div>
    </AdminLayout>
  );
} 