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
  Eye,
  Filter,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { API_BASE_URL, getToken } from '@/lib/auth';
import ApartmentResidentManager from '@/components/admin/ApartmentResidentManager';
import ApartmentUserLinkModal from '@/components/admin/ApartmentUserLinkModal';
import { Apartment } from '@/lib/api';

export default function ApartmentsPage() {
  const { t } = useLanguage();
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    setLoading(true);
    const token = getToken();
    fetch(`${API_BASE_URL}/api/apartments`, {
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setApartments(data);
        } else if (data && Array.isArray(data.data)) {
          setApartments(data.data);
        } else {
          setApartments([]);
        }
      })
      .catch(() => {
        setApartments([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredApartments = apartments.filter(apartment => {
    const matchesSearch = apartment.unitNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || apartment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OCCUPIED':
        return <Badge className="bg-green-100 text-green-800">Có người ở</Badge>;
      case 'VACANT':
        return <Badge className="bg-yellow-100 text-yellow-800">Trống</Badge>;
      case 'MAINTENANCE':
        return <Badge className="bg-red-100 text-red-800">Bảo trì</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <AdminLayout title={t('admin.apartments.title')}>
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
    <AdminLayout title={t('admin.apartments.title')}>
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {t('admin.apartments.list', 'Danh sách căn hộ')}
            </h2>
            <p className="text-gray-600">
              {t('admin.apartments.listDesc', 'Quản lý tất cả căn hộ trong hệ thống')}
            </p>
          </div>
          <Link href="/admin-dashboard/apartments/create">
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
                  placeholder="Tìm kiếm theo số căn hộ, chủ hộ..."
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
                  <option value="OCCUPIED">Có người ở</option>
                  <option value="VACANT">Trống</option>
                  <option value="MAINTENANCE">Bảo trì</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Apartments Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Danh sách căn hộ ({filteredApartments.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredApartments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">{t('admin.noData')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã căn hộ</TableHead>
                      <TableHead>Tòa nhà</TableHead>
                      <TableHead>Tầng</TableHead>
                      <TableHead>Diện tích (m²)</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>{t('admin.users.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApartments.map((apartment) => (
                      <TableRow key={apartment.id}>
                        <TableCell>{apartment.unitNumber}</TableCell>
                        <TableCell>{apartment.buildingId}</TableCell>
                        <TableCell>{apartment.floorNumber}</TableCell>
                        <TableCell>{apartment.area}</TableCell>
                        <TableCell>{apartment.status}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Link href={`/admin-dashboard/apartments/${apartment.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin-dashboard/apartments/edit/${apartment.id}`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <ApartmentUserLinkModal apartmentId={apartment.id} />
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