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
  Users,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

interface Apartment {
  id: number;
  unitNumber: string;
  building: string;
  floor: number;
  area: number;
  status: string;
  type: string;
  price: number;
}

export default function ApartmentsPage() {
  const { t } = useLanguage();
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadApartments();
  }, []);

  const loadApartments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch('/api/admin/apartments');
      if (response.ok) {
        const data = await response.json();
        setApartments(data);
      } else {
        throw new Error('Failed to fetch apartments');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch apartments');
      setApartments([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredApartments = apartments.filter(apartment => {
    const matchesSearch = apartment.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         apartment.building.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || apartment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OCCUPIED':
        return <Badge className="bg-green-100 text-green-800">{t('admin.apartments.status.OCCUPIED')}</Badge>;
      case 'VACANT':
        return <Badge className="bg-yellow-100 text-yellow-800">{t('admin.apartments.status.VACANT')}</Badge>;
      case 'MAINTENANCE':
        return <Badge className="bg-red-100 text-red-800">{t('admin.apartments.status.MAINTENANCE')}</Badge>;
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

  if (error) {
    return (
      <AdminLayout title={t('admin.apartments.title')}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium">{t('admin.error.load')}</p>
            <p className="text-gray-600 mt-2">{error}</p>
            <Button 
              onClick={loadApartments} 
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
    <AdminLayout title={t('admin.apartments.title')}>
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{t('admin.apartments.title')}</h2>
            <p className="text-gray-600 mt-1">{t('admin.apartments.listDesc')}</p>
          </div>
          <Link href="/admin-dashboard/apartments/create">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {t('admin.apartments.addButton')}
            </Button>
          </Link>
        </div>

        {/* Search and filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              {t('admin.filters.searchAndFilter')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder={t('admin.apartments.searchPlaceholder')}
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
                  <option value="all">{t('admin.apartments.status.all')}</option>
                  <option value="OCCUPIED">{t('admin.apartments.status.OCCUPIED')}</option>
                  <option value="VACANT">{t('admin.apartments.status.VACANT')}</option>
                  <option value="MAINTENANCE">{t('admin.apartments.status.MAINTENANCE')}</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Apartments table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t('admin.apartments.list')} ({filteredApartments.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredApartments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">{t('admin.apartments.empty')}</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('admin.apartments.columns.id')}</TableHead>
                    <TableHead>{t('admin.apartments.columns.unitNumber')}</TableHead>
                    <TableHead>{t('admin.apartments.columns.building')}</TableHead>
                    <TableHead>{t('admin.apartments.columns.floor')}</TableHead>
                    <TableHead>{t('admin.apartments.columns.area')}</TableHead>
                    <TableHead>{t('admin.apartments.columns.status')}</TableHead>
                    <TableHead>{t('admin.apartments.columns.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApartments.map((apartment) => (
                    <TableRow key={apartment.id}>
                      <TableCell>{apartment.id}</TableCell>
                      <TableCell className="font-medium">{apartment.unitNumber}</TableCell>
                      <TableCell>{apartment.building}</TableCell>
                      <TableCell>{apartment.floor}</TableCell>
                      <TableCell>{apartment.area}</TableCell>
                      <TableCell>{getStatusBadge(apartment.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link href={`/admin-dashboard/apartments/${apartment.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin-dashboard/apartments/${apartment.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin-dashboard/apartments/${apartment.id}/residents`}>
                            <Button variant="outline" size="sm">
                              <Users className="h-4 w-4" />
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