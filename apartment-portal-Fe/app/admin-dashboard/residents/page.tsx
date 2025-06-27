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
import { residentsApi } from '@/lib/api';

interface Resident {
  id: string;
  fullName: string;
  idCard: string;
  dateOfBirth: string;
  gender: string;
  phoneNumber: string;
  email: string;
  apartmentNumber: string;
  relationType: string;
  status: string;
}

export default function ResidentsPage() {
  const { t } = useLanguage();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    setLoading(true);
    residentsApi.getAll()
      .then((data) => {
        setResidents(data);
      })
      .catch(() => setResidents([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredResidents = residents.filter(resident => {
    const matchesSearch = resident.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resident.idCard.includes(searchTerm) ||
                         resident.phoneNumber.includes(searchTerm) ||
                         resident.apartmentNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || resident.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>;
      case 'INACTIVE':
        return <Badge className="bg-red-100 text-red-800">Không hoạt động</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getRelationBadge = (relation: string) => {
    switch (relation) {
      case 'Chủ hộ':
        return <Badge className="bg-purple-100 text-purple-800">Chủ hộ</Badge>;
      case 'Vợ':
        return <Badge className="bg-blue-100 text-blue-800">Vợ</Badge>;
      case 'Chồng':
        return <Badge className="bg-blue-100 text-blue-800">Chồng</Badge>;
      case 'Con':
        return <Badge className="bg-green-100 text-green-800">Con</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{relation}</Badge>;
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

  return (
    <AdminLayout title={t('admin.residents.title')}>
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {t('admin.residents.list', 'Danh sách cư dân')}
            </h2>
            <p className="text-gray-600">
              {t('admin.residents.listDesc', 'Quản lý tất cả cư dân trong chung cư')}
            </p>
          </div>
          <Link href="/admin-dashboard/residents/create">
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
                  placeholder="Tìm kiếm theo tên, CMND, số điện thoại..."
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
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="INACTIVE">Không hoạt động</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Residents Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Danh sách cư dân ({filteredResidents.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredResidents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">{t('admin.noData')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('admin.residents.fullName')}</TableHead>
                      <TableHead>{t('admin.residents.idCard')}</TableHead>
                      <TableHead>{t('admin.residents.phone')}</TableHead>
                      <TableHead>{t('admin.residents.apartment')}</TableHead>
                      <TableHead>{t('admin.residents.relationType')}</TableHead>
                      <TableHead>{t('admin.residents.status')}</TableHead>
                      <TableHead>{t('admin.users.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResidents.map((resident) => (
                      <TableRow key={resident.id}>
                        <TableCell className="font-medium">{resident.fullName}</TableCell>
                        <TableCell>{resident.idCard}</TableCell>
                        <TableCell>{resident.phoneNumber}</TableCell>
                        <TableCell>{resident.apartmentNumber}</TableCell>
                        <TableCell>{getRelationBadge(resident.relationType)}</TableCell>
                        <TableCell>{getStatusBadge(resident.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Link href={`/admin-dashboard/residents/${resident.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin-dashboard/residents/edit/${resident.id}`}>
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