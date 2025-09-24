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
  const { generateMonthlyInvoices, clearMessages, error: billingError, success: billingSuccess } = useYearlyBilling();
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
  // Không khóa việc tạo hóa đơn nữa - cho phép tạo cho căn hộ chưa có hóa đơn
  const blockBatchCreate = false;
  

  const filteredInvoices = invoices.filter(invoice => {
    const statusUpper = (invoice.status || '').toUpperCase();
    const apartment = apartments.find(apt => apt.id === invoice.apartmentId) as ApiApartment | undefined;
         const apartmentInfo = apartment ? (apartment.unitNumber || `${t('admin.apartments.apartment')} ${apartment.id}`) : `${t('admin.apartments.apartment')} ${invoice.apartmentId}`;
    
    const matchesSearch = invoice.id.toString().includes(searchTerm.toLowerCase()) ||
                         invoice.apartmentId.toString().includes(searchTerm.toLowerCase()) ||
                         apartmentInfo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || statusUpper === filterStatus;
    
    // Filter by month and year using billingPeriod
    // Some records may store billingPeriod as "YYYY-MM" or "YYYY-MM-DD" or include extra suffixes
    // Use startsWith to match the selected month/year robustly
    const billingPeriod = invoice.billingPeriod || '';
    const expectedPeriod = `${filterYear}-${String(filterMonth).padStart(2, '0')}`;
    const matchesMonth = billingPeriod.startsWith(expectedPeriod);
    
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
  useEffect(() => {
    // Reset to first page when filters/search change
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterYear, filterMonth]);


  // Function to determine if invoice is overdue based on due date
  const isInvoiceOverdue = (dueDate: string, status: string): boolean => {
    if (status === 'PAID' || status === 'CANCELLED') {
      return false;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0); // Reset time to start of day
    
    return due < today;
  };

  // Function to get effective status (considering overdue)
  const getEffectiveStatus = (invoice: Invoice): string => {
    const currentStatus = (invoice.status || '').toUpperCase();
    
    // If already marked as OVERDUE in database, keep it
    if (currentStatus === 'OVERDUE') {
      return 'OVERDUE';
    }
    
    // If invoice is overdue based on due date, return OVERDUE
    if (isInvoiceOverdue(invoice.dueDate, currentStatus)) {
      return 'OVERDUE';
    }
    
    // Otherwise return the original status
    return currentStatus;
  };

  const getStatusBadge = (status: string, invoice?: Invoice) => {
    // Use effective status if invoice is provided
    const effectiveStatus = invoice ? getEffectiveStatus(invoice) : status.toUpperCase();
    
    switch (effectiveStatus) {
      case 'PAID':
        return <Badge className="bg-green-100 text-green-800">{t('admin.invoices.status.PAID')}</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">{t('admin.invoices.status.PENDING')}</Badge>;
      case 'OVERDUE':
        return <Badge className="bg-red-100 text-red-800">{t('admin.invoices.status.OVERDUE')}</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-gray-100 text-gray-800">{t('admin.invoices.status.CANCELLED')}</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{effectiveStatus || status}</Badge>;
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
    const res = await generateMonthlyInvoices(genYear, genMonth, false);
    if (res?.success) {
      setGenMessage(res.message || t('admin.success.save'));
      await fetchInvoices();
    } else {
      // Hiển thị thông báo lỗi chi tiết hơn
      let errorMessage = t('admin.error.save');
      
      // Ưu tiên sử dụng billingError từ hook
      if (billingError) {
        errorMessage = billingError;
      } else if (res?.message) {
        if (res.message.includes('chưa ghi chỉ số nước')) {
          // Hiển thị lỗi về chỉ số nước với format đẹp
          errorMessage = res.message;
        } else if (res.message.includes('chk_invoice_amount') || res.message.includes('constraint')) {
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

  // Function to update overdue status in database
  const handleUpdateOverdueStatus = async () => {
    try {
      // Find invoices that should be marked as overdue
      const overdueInvoices = filteredInvoices.filter(inv => {
        const currentStatus = (inv.status || '').toUpperCase();
        return currentStatus !== 'PAID' && 
               currentStatus !== 'CANCELLED' && 
               currentStatus !== 'OVERDUE' &&
               isInvoiceOverdue(inv.dueDate, currentStatus);
      });

      if (overdueInvoices.length === 0) {
        setGenMessage('Không có hóa đơn nào cần cập nhật trạng thái quá hạn.');
        return;
      }

      // Call API to update overdue status
      const response = await api.post('/api/admin/invoices/update-overdue-status');
      if (response.ok) {
        const result = await response.json();
        setGenMessage(`Đã cập nhật trạng thái quá hạn cho ${overdueInvoices.length} hóa đơn.`);
        await fetchInvoices(); // Refresh the invoices list
      } else {
        const error = await response.json();
        setGenMessage(error.message || 'Có lỗi xảy ra khi cập nhật trạng thái quá hạn.');
      }
    } catch (error) {
      console.error('Error updating overdue status:', error);
      setGenMessage('Có lỗi xảy ra khi cập nhật trạng thái quá hạn.');
    }
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
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8 rounded-2xl shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-3 mb-2">
                <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Calculator className="h-7 w-7" />
                </div>
                {t('admin.invoices.title')}
              </h2>
              <p className="text-blue-100 text-lg">
                {t('admin.invoices.subtitle')}
              </p>
            </div>
            <div className="text-right">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <p className="text-blue-100 text-sm">Tổng hóa đơn</p>
                <p className="text-2xl font-bold">{filteredInvoices.length}</p>
                <p className="text-blue-100 text-xs">Tháng {filterMonth}/{filterYear}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Generate monthly invoices */}
        <Card className="hover:shadow-md transition-shadow duration-200">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-200">
            <CardTitle className="flex items-center gap-2 text-green-800">
              <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Calculator className="h-5 w-5 text-green-600" />
              </div>
              {t('admin.invoices.generateMonthly.title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">{t('admin.invoices.generateMonthly.year')}</label>
                  <select 
                    value={genYear} 
                    onChange={e=>setGenYear(parseInt(e.target.value))} 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-green-500 focus:ring-green-500"
                  >
                    {Array.from({length:11},(_,i)=>new Date().getFullYear()-5+i).map(y=> (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">{t('admin.invoices.generateMonthly.month')}</label>
                  <select 
                    value={genMonth} 
                    onChange={e=>setGenMonth(parseInt(e.target.value))} 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:border-green-500 focus:ring-green-500"
                  >
                    {Array.from({length:12},(_,i)=>i+1).map(m=> (
                      <option key={m} value={m}>{t('admin.invoices.generateMonthly.monthLabel')} {m}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Button 
                    onClick={handleGenerateMonthly} 
                    disabled={genLoading}
                    className="w-full h-11 bg-green-600 hover:bg-green-700"
                  >
                    {genLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        {t('admin.invoices.generateMonthly.generating')}
                      </div>
                    ) : (
                      `${t('admin.invoices.generateMonthly.generateFor')} ${genMonth}/${genYear}`
                    )}
                  </Button>
                </div>
              </div>
              
              {invoicesInSelectedPeriod.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-blue-800 font-medium">
                        Tháng {genMonth}/{genYear} đã có {invoicesInSelectedPeriod.length} hóa đơn
                      </p>
                      <p className="text-blue-700 text-sm mt-1">
                        Hệ thống sẽ tạo hóa đơn cho căn hộ chưa có hóa đơn và bỏ qua căn hộ đã có hóa đơn
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {(genMessage || billingError) && (
                <div className={`p-4 rounded-lg border ${
                  (genMessage && genMessage.includes('Không thể tạo hóa đơn')) || billingError
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-green-50 border-green-200'
                }`}>
                  <div className={`${
                    (genMessage && genMessage.includes('Không thể tạo hóa đơn')) || billingError
                      ? 'text-red-800' 
                      : 'text-green-800'
                  }`}>
                    {billingError || genMessage}
                  </div>
                  {genMessage && genMessage.includes('Chưa có biểu phí') && (
                    <div className="mt-3 p-3 bg-white rounded-lg border border-red-200">
                      <p className="text-sm font-medium text-red-800 mb-2">Hướng dẫn:</p>
                      <ol className="list-decimal list-inside text-sm text-red-700 space-y-1">
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
          </CardContent>
        </Card>


        {/* Invoices List */}
        <div className="space-y-6">
              {/* Header with actions */}
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl border border-gray-200">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Calculator className="h-6 w-6 text-blue-600" />
                      </div>
                      {t('admin.invoices.list')}
                    </h3>
                    <p className="text-gray-600 mt-2">
                      {t('admin.invoices.listDesc')}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button
                      onClick={() => exportInvoicesToExcel(filteredInvoices, apartments, language)}
                      variant="outline"
                      size="sm"
                      className="bg-white hover:bg-gray-50 border-gray-300 text-gray-700 hover:text-gray-900"
                    >
                      {t('admin.export.excel', 'Xuất Excel')}
                    </Button>
                    <Button
                      onClick={handleUpdateOverdueStatus}
                      variant="outline"
                      size="sm"
                      className="bg-red-50 hover:bg-red-100 border-red-300 text-red-700 hover:text-red-900"
                    >
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Cập nhật trạng thái quá hạn
                    </Button>
                  </div>
                </div>
              </div>


                {/* Statistics Cards - Số lượng */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-600">{t('admin.invoices.stats.totalInvoices')}</p>
                          <p className="text-3xl font-bold text-gray-900">{filteredInvoices.length}</p>
                          <p className="text-xs text-gray-500">Tháng {filterMonth}/{filterYear}</p>
                        </div>
                        <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Calculator className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-600">{t('admin.invoices.stats.paidInvoices')}</p>
                          <p className="text-3xl font-bold text-green-600">
                            {filteredInvoices.filter(inv => (inv.status || '').toUpperCase() === 'PAID').length}
                          </p>
                          <p className="text-xs text-gray-500">Tháng {filterMonth}/{filterYear}</p>
                        </div>
                        <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                          <div className="h-6 w-6 bg-green-600 rounded-full flex items-center justify-center">
                            <div className="h-3 w-3 bg-white rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-600">{t('admin.invoices.stats.pendingInvoices')}</p>
                          <p className="text-3xl font-bold text-yellow-600">
                            {filteredInvoices.filter(inv => {
                              const effectiveStatus = getEffectiveStatus(inv);
                              return effectiveStatus === 'PENDING' || effectiveStatus === 'UNPAID';
                            }).length}
                          </p>
                          <p className="text-xs text-gray-500">Tháng {filterMonth}/{filterYear}</p>
                        </div>
                        <div className="h-12 w-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                          <div className="h-6 w-6 bg-yellow-600 rounded-full flex items-center justify-center">
                            <div className="h-3 w-3 bg-white rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-600">{t('admin.invoices.stats.overdueInvoices')}</p>
                          <p className="text-3xl font-bold text-red-600">
                            {filteredInvoices.filter(inv => getEffectiveStatus(inv) === 'OVERDUE').length}
                          </p>
                          <p className="text-xs text-gray-500">Tháng {filterMonth}/{filterYear}</p>
                        </div>
                        <div className="h-12 w-12 bg-red-100 rounded-xl flex items-center justify-center">
                          <AlertCircle className="h-6 w-6 text-red-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Statistics Cards - Tổng tiền */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="h-12 w-12 bg-blue-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <Calculator className="h-6 w-6 text-blue-700" />
                        </div>
                        <p className="text-sm font-medium text-blue-600 mb-2">{t('admin.invoices.stats.totalAmount')}</p>
                        <p className="text-2xl font-bold text-blue-800 mb-2">
                          {formatCurrency(filteredInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0))}
                        </p>
                        <p className="text-xs text-blue-600">
                          {filteredInvoices.length} {t('admin.invoices.stats.invoices')} - Tháng {filterMonth}/{filterYear}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="h-12 w-12 bg-green-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <div className="h-6 w-6 bg-green-700 rounded-full flex items-center justify-center">
                            <div className="h-3 w-3 bg-white rounded-full"></div>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-green-600 mb-2">{t('admin.invoices.stats.paidAmount')}</p>
                        <p className="text-2xl font-bold text-green-800 mb-2">
                          {formatCurrency(filteredInvoices
                            .filter(inv => (inv.status || '').toUpperCase() === 'PAID')
                            .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
                          )}
                        </p>
                        <p className="text-xs text-green-600">
                          {filteredInvoices.filter(inv => inv.status === 'PAID').length} {t('admin.invoices.stats.invoices')} - Tháng {filterMonth}/{filterYear}
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="h-12 w-12 bg-yellow-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                          <div className="h-6 w-6 bg-yellow-700 rounded-full flex items-center justify-center">
                            <div className="h-3 w-3 bg-white rounded-full"></div>
                          </div>
                        </div>
                        <p className="text-sm font-medium text-yellow-600 mb-2">{t('admin.invoices.stats.unpaidAmount')}</p>
                        <p className="text-2xl font-bold text-yellow-800 mb-2">
                          {formatCurrency(filteredInvoices
                            .filter(inv => {
                              const effectiveStatus = getEffectiveStatus(inv);
                              return effectiveStatus === 'PENDING' || effectiveStatus === 'UNPAID';
                            })
                            .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
                          )}
                        </p>
                        <p className="text-xs text-yellow-600">
                          {filteredInvoices.filter(inv => {
                            const effectiveStatus = getEffectiveStatus(inv);
                            return effectiveStatus === 'PENDING' || effectiveStatus === 'UNPAID';
                          }).length} {t('admin.invoices.stats.invoices')} - Tháng {filterMonth}/{filterYear}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Tổng cộng tất cả */}
                <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Calculator className="h-8 w-8 text-white" />
                      </div>
                      <p className="text-lg font-medium text-indigo-100 mb-2">{t('admin.invoices.stats.grandTotal')}</p>
                      <p className="text-3xl font-bold mb-2">
                        {formatCurrency(filteredInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0))}
                      </p>
                      <p className="text-sm text-indigo-200">
                        {filteredInvoices.length} hóa đơn - Tháng {filterMonth}/{filterYear}
                      </p>
                    </div>
                  </CardContent>
                </Card>


              {/* Search and Filter */}
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Filter className="h-5 w-5 text-blue-600" />
                    Tìm kiếm và Lọc
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Search Section */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700">Tìm kiếm hóa đơn</label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                          <Input
                            placeholder={t('admin.invoices.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      
                      {/* Status Filter */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700">Trạng thái</label>
                        <select
                          title={t('admin.invoices.filter.title')}
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
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
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                        <div className="space-y-3">
                          <label className="text-sm font-medium text-gray-700">Lọc theo tháng</label>
                          <div className="flex items-center gap-3">
                            <select
                              value={filterYear}
                              onChange={(e) => setFilterYear(parseInt(e.target.value))}
                              className="flex-1 border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                              {Array.from({length: 11}, (_, i) => new Date().getFullYear() - 5 + i).map(year => (
                                <option key={year} value={year}>{year}</option>
                              ))}
                            </select>
                            <span className="text-gray-500 font-medium">/</span>
                            <select
                              value={filterMonth}
                              onChange={(e) => setFilterMonth(parseInt(e.target.value))}
                              className="flex-1 border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:border-blue-500 focus:ring-blue-500"
                            >
                              {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                                <option key={month} value={month}>Tháng {month}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        
                        <div className="md:col-span-2">
                          <div className="bg-white p-4 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Calculator className="h-5 w-5 text-blue-600" />
                                <span className="text-sm font-medium text-gray-700">Kết quả tìm kiếm:</span>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-blue-600">{filteredInvoices.length}</p>
                                <p className="text-xs text-gray-500">hóa đơn được tìm thấy</p>
                              </div>
                            </div>
                          </div>
                        </div>
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
                    <div className="flex items-center gap-2">
                      <Button 
                        onClick={fetchInvoices} 
                        variant="outline" 
                        size="sm"
                        disabled={invoicesLoading}
                      >
                        {invoicesLoading ? t('admin.action.loading') : t('admin.action.refresh')}
                      </Button>
                    </div>
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
                                <TableCell>
                                  <div>
                                    {getStatusBadge(invoice.status, invoice)}
                                    {isInvoiceOverdue(invoice.dueDate, invoice.status) && (
                                      <div className="text-xs text-red-600 mt-1">
                                        Quá hạn {Math.ceil((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))} ngày
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
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