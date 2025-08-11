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
  Filter,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useResidents, Resident } from '@/hooks/use-residents';
import { getResidentIdCard, formatIdCard } from '@/lib/resident-utils';

export default function ResidentsPage() {
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
        return <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>;
      case 'INACTIVE':
        return <Badge className="bg-red-100 text-red-800">Không hoạt động</Badge>;
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
      <AdminLayout title="Quản Lý Cư Dân">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Quản Lý Cư Dân">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium">Lỗi tải dữ liệu</p>
            <p className="text-gray-600 mt-2">{error}</p>
            <Button 
              onClick={() => getAllResidents()} 
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
    <AdminLayout title="Quản Lý Cư Dân">
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Quản Lý Cư Dân
            </h2>
            <p className="text-gray-600 mt-1">
              Quản lý thông tin cư dân trong hệ thống
            </p>
          </div>
          <Link href="/admin-dashboard/residents/create">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Thêm Cư Dân
            </Button>
          </Link>
        </div>

        {/* Search and filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Tìm Kiếm & Lọc
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Tìm theo tên, CMND, SĐT, email..."
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
                  <option value="all">Tất cả trạng thái</option>
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="INACTIVE">Không hoạt động</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Residents table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Danh Sách Cư Dân ({filteredResidents.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredResidents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Không tìm thấy cư dân nào</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Họ Tên</TableHead>
                    <TableHead>Số Điện Thoại</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>CMND/CCCD</TableHead>
                    <TableHead>Trạng Thái</TableHead>
                    <TableHead>Thao Tác</TableHead>
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