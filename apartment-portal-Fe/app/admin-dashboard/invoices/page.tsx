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
         const apartmentInfo = apartment ? `${t('admin.apartments.building')} ${apartment.buildingId} - ${t('admin.apartments.floor')} ${apartment.floorNumber} - ${t('admin.apartments.unitNumber')}` : `${t('admin.apartments.apartment')} ${invoice.apartmentId}`;
    
    const matchesSearch = invoice.id.toString().includes(searchTerm.toLowerCase()) ||
                         invoice.apartmentId.toString().includes(searchTerm.toLowerCase()) ||
                         apartmentInfo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
      setGenMessage(t('admin.error.save'));
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
                   <span className="text-green-600">{genMessage}</span>
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
              </div>

                                                           {/* Statistics Cards - Số lượng */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{t('admin.invoices.stats.totalInvoices')}</p>
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
                          <p className="text-sm font-medium text-gray-600">{t('admin.invoices.stats.paidInvoices')}</p>
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
                          <p className="text-sm font-medium text-gray-600">{t('admin.invoices.stats.pendingInvoices')}</p>
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
                          <p className="text-sm font-medium text-gray-600">{t('admin.invoices.stats.overdueInvoices')}</p>
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

                                                               {/* Statistics Cards - Tổng tiền */}
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                   <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                     <CardContent className="p-4">
                       <div className="text-center">
                         <p className="text-sm font-medium text-blue-600 mb-1">{t('admin.invoices.stats.totalAmount')}</p>
                         <p className="text-xl font-bold text-blue-800">
                           {formatCurrency(invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0))}
                         </p>
                                                    <p className="text-xs text-blue-600 mt-1">
                           {invoices.length} {t('admin.invoices.stats.invoices')}
                         </p>
                       </div>
                     </CardContent>
                   </Card>

                   <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                     <CardContent className="p-4">
                       <div className="text-center">
                         <p className="text-sm font-medium text-green-600 mb-1">{t('admin.invoices.stats.paidAmount')}</p>
                         <p className="text-xl font-bold text-green-800">
                           {formatCurrency(invoices
                             .filter(inv => inv.status === 'PAID')
                             .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
                           )}
                         </p>
                                                    <p className="text-xs text-green-600 mt-1">
                           {invoices.filter(inv => inv.status === 'PAID').length} {t('admin.invoices.stats.invoices')}
                         </p>
                       </div>
                     </CardContent>
                   </Card>

                   <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                     <CardContent className="p-4">
                       <div className="text-center">
                         <p className="text-sm font-medium text-yellow-600 mb-1">{t('admin.invoices.stats.unpaidAmount')}</p>
                         <p className="text-xl font-bold text-yellow-800">
                           {formatCurrency(invoices
                             .filter(inv => inv.status === 'PENDING')
                             .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
                           )}
                         </p>
                                                    <p className="text-xs text-yellow-600 mt-1">
                           {invoices.filter(inv => inv.status === 'PENDING').length} {t('admin.invoices.stats.invoices')}
                         </p>
                       </div>
                     </CardContent>
                   </Card>

                   <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                     <CardContent className="p-4">
                       <div className="text-center">
                         <p className="text-sm font-medium text-red-600 mb-1">{t('admin.invoices.stats.overdueAmount')}</p>
                         <p className="text-xl font-bold text-red-800">
                           {formatCurrency(invoices
                             .filter(inv => inv.status === 'OVERDUE')
                             .reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
                           )}
                         </p>
                                                    <p className="text-xs text-red-600 mt-1">
                           {invoices.filter(inv => inv.status === 'OVERDUE').length} {t('admin.invoices.stats.invoices')}
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
                         {formatCurrency(invoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0))}
                       </p>
                       <p className="text-sm text-indigo-200 mt-1">
                         {t('admin.invoices.stats.grandTotalDesc')}
                       </p>
                     </div>
                   </CardContent>
                 </Card>

              {/* Search and Filter */}
              <Card>
                <CardContent className="p-4">
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
                          {filteredInvoices.map((invoice) => {
                            const apartment = apartments.find(apt => apt.id === invoice.apartmentId) as ApiApartment | undefined;
                            const apartmentInfo = apartment ? `${t('admin.apartments.building')} ${apartment.buildingId} - ${t('admin.apartments.floor')} ${apartment.floorNumber} - ${t('admin.apartments.unitNumber')}` : `${t('admin.apartments.apartment')} ${invoice.apartmentId}`;
                            
                            return (
                              <TableRow key={invoice.id}>
                                <TableCell className="font-medium">
                                  #{invoice.id}
                                </TableCell>
                                <TableCell>
                                  <div>
                                    <div className="font-medium">{apartmentInfo}</div>
                                    <div className="text-sm text-gray-500">{t('admin.invoices.period')}: {invoice.billingPeriod}</div>
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