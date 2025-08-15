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
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Filter,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useResidents, Resident } from '@/hooks/use-residents';
import { getResidentIdCard, formatIdCard } from '@/lib/resident-utils';

export default function ResidentsPage() {
  return (
    <AdminGuard>
      <ResidentsPageContent />
    </AdminGuard>
  );
}

function ResidentsPageContent() {
  const { t } = useLanguage();
  const { residents, loading, error, getAllResidents, deleteResident } = useResidents();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredResidents = residents.filter(resident => {
    const idCard = getResidentIdCard(resident);
    const matchesSearch = resident.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (idCard && idCard.includes(searchTerm)) ||
                         resident.phoneNumber.includes(searchTerm) ||
                         resident.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || resident.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800">{t('admin.status.active','Hoạt động')}</Badge>;
      case 'INACTIVE':
        return <Badge className="bg-red-100 text-red-800">{t('admin.status.inactive','Không hoạt động')}</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const handleDeleteResident = async (id: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa cư dân này?')) {
      const success = await deleteResident(id);
      if (success) {
        // Refresh the list
        getAllResidents();
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout title={t('admin.residents.title')}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">{t('admin.loading')}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title={t('admin.residents.title')}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium">{t('admin.error.load')}</p>
            <p className="text-gray-600 mt-2">{error}</p>
            <Button 
              onClick={() => getAllResidents()} 
              className="mt-4"
              variant="outline"
            >
              {t('admin.action.retry','Thử lại')}
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={t('admin.residents.title')}>
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('admin.residents.title')}</h2>
            <p className="text-gray-600 mt-1">{t('admin.residents.listDesc')}</p>
          </div>
          <Link href="/admin-dashboard/residents/create">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {t('admin.residents.create')}
            </Button>
          </Link>
        </div>

        {/* Search and filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              {t('admin.action.search','Tìm kiếm')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder={t('admin.residents.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="sm:w-48">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Lọc theo trạng thái"
                >
                  <option value="all">{t('admin.residents.status.all')}</option>
                  <option value="ACTIVE">{t('admin.residents.status.ACTIVE')}</option>
                  <option value="INACTIVE">{t('admin.residents.status.INACTIVE')}</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Residents table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t('admin.residents.list')} ({filteredResidents.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredResidents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">{t('admin.residents.empty')}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin.residents.columns.fullName')}</TableHead>
                    <TableHead>{t('admin.residents.columns.phone')}</TableHead>
                    <TableHead>{t('admin.residents.columns.email')}</TableHead>
                    <TableHead>{t('admin.residents.columns.idCard')}</TableHead>
                    <TableHead>{t('admin.residents.columns.status')}</TableHead>
                    <TableHead>{t('admin.residents.columns.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResidents.map((resident) => (
                    <TableRow key={resident.id}>
                      <TableCell className="font-medium">{resident.fullName}</TableCell>
                      <TableCell>{resident.phoneNumber}</TableCell>
                      <TableCell>{resident.email}</TableCell>
                      <TableCell>{formatIdCard(getResidentIdCard(resident))}</TableCell>
                      <TableCell>{getStatusBadge(resident.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link href={`/admin-dashboard/residents/${resident.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
} 