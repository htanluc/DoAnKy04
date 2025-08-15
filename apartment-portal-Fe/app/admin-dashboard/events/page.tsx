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
  Users
} from 'lucide-react';
import Link from 'next/link';
import { eventsApi, Event } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export default function EventsPage() {
  return (
    <AdminGuard>
      <EventsPageContent />
    </AdminGuard>
  );
}

function EventsPageContent() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsApi.getAll();
      setEvents(data);
    } catch (error) {
      toast({
        title: t('admin.error.load','Lỗi'),
        description: t('admin.error.load','Không thể tải danh sách sự kiện'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm(t('admin.confirm.delete','Bạn có chắc chắn muốn xóa?'))) {
      try {
        await eventsApi.delete(id);
        toast({
          title: t('admin.success.delete','Thành công'),
          description: t('admin.success.delete','Đã xóa'),
        });
        fetchEvents();
      } catch (error) {
        toast({
          title: t('admin.error.delete','Lỗi'),
          description: t('admin.error.delete','Không thể xóa'),
          variant: "destructive",
        });
      }
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || getEventStatus(event) === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getEventStatus = (event: Event) => {
    const now = new Date();
    const startTime = new Date(event.startTime);
    const endTime = new Date(event.endTime);
    
    if (now < startTime) {
      return 'UPCOMING';
    } else if (now >= startTime && now <= endTime) {
      return 'ONGOING';
    } else {
      return 'COMPLETED';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'UPCOMING':
        return <Badge className="bg-blue-100 text-blue-800">{t('admin.events.status.UPCOMING','Sắp diễn ra')}</Badge>;
      case 'ONGOING':
        return <Badge className="bg-green-100 text-green-800">{t('admin.events.status.ONGOING','Đang diễn ra')}</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-gray-100 text-gray-800">{t('admin.events.status.COMPLETED','Đã kết thúc')}</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-red-100 text-red-800">{t('admin.events.status.CANCELLED','Đã hủy')}</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <AdminLayout title={t('admin.events.title')}>
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
    <AdminLayout title={t('admin.events.title')}>
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {t('admin.events.list')}
            </h2>
            <p className="text-gray-600">
              {t('admin.events.listDesc','Quản lý tất cả sự kiện trong chung cư')}
            </p>
          </div>
          <Link href="/admin-dashboard/events/create">
            <Button className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>{t('admin.action.create')}</span>
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
                  placeholder={t('admin.events.searchPlaceholder','Tìm kiếm theo tên, mô tả, địa điểm...')}
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
                  aria-label="Lọc theo trạng thái sự kiện"
                >
                  <option value="all">{t('admin.status.all','Tất cả trạng thái')}</option>
                  <option value="UPCOMING">{t('admin.events.status.UPCOMING','Sắp diễn ra')}</option>
                  <option value="ONGOING">{t('admin.events.status.ONGOING','Đang diễn ra')}</option>
                  <option value="COMPLETED">{t('admin.events.status.COMPLETED','Đã kết thúc')}</option>
                  <option value="CANCELLED">{t('admin.events.status.CANCELLED','Đã hủy')}</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Events Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{t('admin.events.list','Danh sách sự kiện')} ({filteredEvents.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredEvents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">{t('admin.noData')}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('admin.events.name','Tên sự kiện')}</TableHead>
                      <TableHead>{t('admin.events.startDate','Thời gian bắt đầu')}</TableHead>
                      <TableHead>{t('admin.events.endDate','Thời gian kết thúc')}</TableHead>
                      <TableHead>{t('admin.events.location','Địa điểm')}</TableHead>
                      <TableHead>{t('admin.users.status','Trạng thái')}</TableHead>
                      <TableHead className="text-right">{t('admin.users.actions','Thao tác')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-semibold">{event.title}</div>
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {event.description}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDateTime(event.startTime)}
                        </TableCell>
                        <TableCell>
                          {formatDateTime(event.endTime)}
                        </TableCell>
                        <TableCell>
                          {event.location}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(getEventStatus(event))}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Link href={`/admin-dashboard/events/${event.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin-dashboard/events/edit/${event.id}`}>
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDelete(event.id)}
                              className="text-red-600 hover:text-red-700"
                            >
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