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
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Filter
} from 'lucide-react';
import Link from 'next/link';
import { Invoice } from '@/lib/api';
import { fetchServiceFeeConfig, ServiceFeeConfig, api } from '@/lib/api';

export default function InvoicesPage() {
  const { t } = useLanguage();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [serviceFeeConfig, setServiceFeeConfig] = useState<ServiceFeeConfig | null>(null);
  const [feeLoading, setFeeLoading] = useState(true);
  const [form, setForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    parkingFee: '',
    serviceFeePerM2: '',
    waterFeePerM3: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateFeeConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    setFormSuccess('');
    try {
      const payload = {
        month: Number(form.month),
        year: Number(form.year),
        parkingFee: Number(form.parkingFee),
        serviceFeePerM2: Number(form.serviceFeePerM2),
        waterFeePerM3: Number(form.waterFeePerM3),
      };
      const res = await api.post('/api/admin/service-fee-config', payload);
      if (res.ok) {
        setFormSuccess('Lưu đơn giá thành công!');
        // Reload lại đơn giá
        fetchServiceFeeConfig(payload.month, payload.year).then(cfg => setServiceFeeConfig(cfg));
      } else {
        setFormError('Lưu đơn giá thất bại!');
      }
    } catch (err) {
      setFormError('Có lỗi xảy ra!');
    } finally {
      setFormLoading(false);
    }
  };

  // Mock data - replace with actual API call
  useEffect(() => {
    const mockInvoices: Invoice[] = [
      {
        id: 1,
        apartmentId: 101,
        billingPeriod: '2024-01',
        issueDate: '2024-01-01',
        dueDate: '2024-02-15',
        totalAmount: 2500000,
        status: 'PAID',
        createdAt: '2024-01-15',
        updatedAt: '2024-01-20',
        items: [],
        payments: [],
      },
      {
        id: 2,
        apartmentId: 205,
        billingPeriod: '2024-01',
        issueDate: '2024-01-01',
        dueDate: '2024-02-20',
        totalAmount: 1800000,
        status: 'PENDING',
        createdAt: '2024-01-20',
        updatedAt: '2024-01-25',
        items: [],
        payments: [],
      },
      {
        id: 3,
        apartmentId: 301,
        billingPeriod: '2024-01',
        issueDate: '2024-01-01',
        dueDate: '2024-02-25',
        totalAmount: 3200000,
        status: 'OVERDUE',
        createdAt: '2024-01-25',
        updatedAt: '2024-01-30',
        items: [],
        payments: [],
      }
    ];

    setTimeout(() => {
      setInvoices(mockInvoices);
      setLoading(false);
    }, 1000);

    // Lấy đơn giá phí dịch vụ tháng/năm hiện tại
    const now = new Date();
    fetchServiceFeeConfig(now.getMonth() + 1, now.getFullYear()).then(cfg => {
      setServiceFeeConfig(cfg);
      setFeeLoading(false);
    });
  }, []);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.id.toString().includes(searchTerm.toLowerCase()) ||
                         invoice.apartmentId.toString().includes(searchTerm.toLowerCase());
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

  if (loading) {
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

  return (
    <AdminLayout title={t('admin.invoices.title')}>
      <div className="mb-4">
        <Card>
          <CardHeader>
            <CardTitle>Đơn giá phí dịch vụ tháng {new Date().getMonth() + 1}/{new Date().getFullYear()}</CardTitle>
          </CardHeader>
          <CardContent>
            {feeLoading ? (
              <span>Đang tải...</span>
            ) : serviceFeeConfig ? (
              <div className="space-y-2 mb-4">
                <div>Phí gửi xe: <b>{serviceFeeConfig.parkingFee.toLocaleString('vi-VN')} đ/xe/tháng</b></div>
                <div>Phí dịch vụ: <b>{serviceFeeConfig.serviceFeePerM2.toLocaleString('vi-VN')} đ/m²</b></div>
                <div>Phí nước: <b>{serviceFeeConfig.waterFeePerM3.toLocaleString('vi-VN')} đ/m³</b></div>
              </div>
            ) : (
              <span className="text-red-600 mb-4 block">Chưa cấu hình đơn giá tháng này</span>
            )}
            <form className="space-y-2" onSubmit={handleCreateFeeConfig}>
              <div className="flex gap-2">
                <Input type="number" name="month" min={1} max={12} value={form.month} onChange={handleFormChange} placeholder="Tháng" className="w-24" required />
                <Input type="number" name="year" min={2020} value={form.year} onChange={handleFormChange} placeholder="Năm" className="w-32" required />
                <Input type="number" name="parkingFee" value={form.parkingFee} onChange={handleFormChange} placeholder="Phí gửi xe" className="w-40" required />
                <Input type="number" name="serviceFeePerM2" value={form.serviceFeePerM2} onChange={handleFormChange} placeholder="Phí dịch vụ/m²" className="w-40" required />
                <Input type="number" name="waterFeePerM3" value={form.waterFeePerM3} onChange={handleFormChange} placeholder="Phí nước/m³" className="w-40" required />
                <Button type="submit" disabled={formLoading}>{formLoading ? 'Đang lưu...' : 'Lưu đơn giá'}</Button>
              </div>
              {formError && <div className="text-red-600">{formError}</div>}
              {formSuccess && <div className="text-green-600">{formSuccess}</div>}
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {t('admin.invoices.list', 'Danh sách hóa đơn')}
            </h2>
            <p className="text-gray-600">
              {t('admin.invoices.listDesc', 'Quản lý tất cả hóa đơn của cư dân')}
            </p>
          </div>
          <Link href="/admin-dashboard/invoices/create">
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>{t('admin.action.create', 'Tạo mới')}</span>
            </Button>
          </Link>
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
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">
                          {invoice.id}
                        </TableCell>
                        <TableCell>{invoice.apartmentId}</TableCell>
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
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
} 