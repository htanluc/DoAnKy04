"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { useLanguage } from '../../../../lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Edit, 
  Trash2,
  Calendar,
  MapPin,
  Clock,
  Users,
  AlertCircle,
  Info,
  Eye,
  Shield,
  Phone,
  FileText,
  Tag
} from 'lucide-react';
import Link from 'next/link';
import { eventsApi, Event, EventRegistration } from '../../../../lib/api';
import { useToast } from '../../../../hooks/use-toast';

export default function ViewEventPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const eventId = parseInt(params.id as string);
  
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(true);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const data = await eventsApi.getById(eventId);
      setEvent(data);
    } catch (error) {
      toast({
        title: t('admin.error.load', 'Lỗi'),
        description: t('admin.events.loadError', 'Không thể tải thông tin sự kiện'),
        variant: "destructive",
      });
      router.push('/admin-dashboard/events');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
      setLoadingRegistrations(true);
      const data = await eventsApi.getRegistrations(eventId);
      setRegistrations(data);
    } catch (error) {
      // Không cần toast lỗi nhỏ này
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;
    
    if (window.confirm(t('admin.events.confirmDelete', 'Bạn có chắc chắn muốn xóa sự kiện này?'))) {
      try {
        await eventsApi.delete(event.id);
        toast({
          title: t('admin.success.delete', 'Thành công'),
          description: t('admin.events.deleteSuccess', 'Đã xóa sự kiện'),
        });
        router.push('/admin-dashboard/events');
      } catch (error) {
        toast({
          title: t('admin.error.delete', 'Lỗi'),
          description: t('admin.events.deleteError', 'Không thể xóa sự kiện'),
          variant: "destructive",
        });
      }
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchEvent();
      fetchRegistrations();
    }
  }, [eventId]);

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
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1 px-3 py-1">
          <Clock className="h-3 w-3" />
          {t('admin.events.status.upcoming', 'Upcoming')}
        </Badge>;
      case 'ONGOING':
        return <Badge className="bg-green-100 text-blue-800 border-green-200 flex items-center gap-1 px-3 py-1">
          <Calendar className="h-3 w-3" />
          {t('admin.events.status.ongoing', 'Ongoing')}
        </Badge>;
      case 'COMPLETED':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200 flex items-center gap-1 px-3 py-1">
          <AlertCircle className="h-3 w-3" />
          {t('admin.events.status.completed', 'Completed')}
        </Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200 px-3 py-1">{status}</Badge>;
    }
  };

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <AdminLayout title={t('admin.events.viewTitle', 'Event Details')}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">{t('admin.loading', 'Loading...')}</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!event) {
    return (
      <AdminLayout title={t('admin.events.notFound', 'Event Not Found')}>
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            {t('admin.events.notFound', 'Event Not Found')}
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {t('admin.events.notFoundDesc', 'The event you are looking for does not exist or has been deleted.')}
          </p>
          <Link href="/admin-dashboard/events">
            <Button className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t('admin.backToList', 'Back to List')}
            </Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={t('admin.events.viewTitle', 'Event Details')}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center space-x-4">
              <Link href="/admin-dashboard/events">
                <Button variant="outline" size="sm" className="flex items-center gap-2 hover:bg-gray-50">
                  <ArrowLeft className="h-4 w-4" />
                  {t('admin.back', 'Quay lại')}
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <FileText className="h-8 w-8 text-blue-600" />
                  {t('admin.events.viewTitle', 'Event Details')}
                </h1>
                <p className="text-gray-600 mt-2">
                  {t('admin.events.viewDesc', 'View detailed information of the event')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link href={`/admin-dashboard/events/edit/${event.id}`}>
                <Button variant="outline" className="flex items-center gap-2 hover:bg-blue-50 hover:text-blue-700">
                  <Edit className="h-4 w-4" />
                  {t('admin.edit', 'Chỉnh sửa')}
                </Button>
              </Link>
              <Link href={`/admin-dashboard/events/${event.id}/registrations`}>
                <Button variant="outline" className="flex items-center gap-2 hover:bg-green-50 hover:text-green-700">
                  <Users className="h-4 w-4" />
                  {t('admin.events.viewRegistrations', 'View Registrations')}
                </Button>
              </Link>
              <Button 
                variant="outline" 
                onClick={handleDelete}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                {t('admin.delete', 'Xóa')}
              </Button>
            </div>
          </div>
        </div>

        {/* 3 Cards Info Row */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Basic Info - Màu xanh dương nhẹ */}
          <Card className="shadow-md border-0 bg-gradient-to-br from-blue-50 to-blue-100 text-blue-800 flex-1">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-blue-800">
                <Info className="h-5 w-5 text-blue-600" />
                {t('admin.events.basicInfo', 'Basic Info')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-blue-200/50 rounded-lg border border-blue-200">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-700">
                    {t('admin.events.startTime', 'Start')}
                  </p>
                  <p className="text-sm text-blue-800 font-semibold">
                    {formatDateTime(event.startTime)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-blue-200/50 rounded-lg border border-blue-200">
                <Clock className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-700">
                    {t('admin.events.endTime', 'End')}
                  </p>
                  <p className="text-sm text-blue-800 font-semibold">
                    {formatDateTime(event.endTime)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions - Màu cam nhẹ */}
          <Card className="shadow-md border-0 bg-gradient-to-br from-orange-50 to-orange-100 text-orange-800 flex-1">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-orange-800">
                <Eye className="h-5 w-5 text-orange-600" />
                {t('admin.quickActions', 'Quick Actions')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <Link href={`/admin-dashboard/events/edit/${event.id}`} className="w-full">
                  <Button variant="outline" className="w-full justify-start bg-orange-200/50 hover:bg-orange-300/50 text-orange-800 border-orange-300 hover:border-orange-400">
                    <Edit className="h-4 w-4 mr-2" />
                    {t('admin.edit', 'Chỉnh sửa')}
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  onClick={handleDelete}
                  className="w-full justify-start bg-red-200/50 hover:bg-red-300/50 text-red-700 border-red-300 hover:border-red-400"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('admin.delete', 'Xóa')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info - Màu xanh lá nhẹ */}
          <Card className="shadow-md border-0 bg-gradient-to-br from-green-50 to-green-100 text-green-800 flex-1">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2 text-green-800">
                <Shield className="h-5 w-5 text-green-600" />
                {t('admin.events.additionalInfo', 'Additional Info')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-green-200/50 rounded-lg border border-green-200">
                <MapPin className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-700">
                    {t('admin.events.location', 'Location')}
                  </p>
                  <p className="text-sm text-green-800 font-semibold">
                    {event.location}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-green-200/50 rounded-lg border border-green-200">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-700">
                    {t('admin.events.registrations', 'Registrations')}
                  </p>
                  <p className="text-sm text-green-800 font-semibold">
                    {loadingRegistrations ? t('admin.loading', 'Loading...') : `${registrations.length} ${t('admin.events.people', 'people')}`}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Nội dung sự kiện */}
        <Card className="shadow-sm border-0 bg-white">
          <CardHeader className="pb-6">
            <div className="space-y-6">
              {/* Title Section */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 leading-tight mb-4">
                  {event.title}
                </h2>
                
                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {t('admin.events.status', 'Status:')}
                    </span>
                    {getStatusBadge(getEventStatus(event))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {t('admin.events.createdAt', 'Created at:')}
                    </span>
                    <span className="text-sm text-gray-600">
                      {formatDateTime(event.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <Separator className="mb-8" />
            
            {/* Content Section */}
            <div className="prose max-w-none">
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed text-base">
                  {event.description}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
} 