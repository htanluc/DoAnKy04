"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Edit, 
  Trash2,
  Calendar,
  MapPin,
  Clock,
  Users,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { eventsApi, Event, EventRegistration } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

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
        title: "Lỗi",
        description: "Không thể tải thông tin sự kiện",
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
    
    if (window.confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) {
      try {
        await eventsApi.delete(event.id);
        toast({
          title: "Thành công",
          description: "Đã xóa sự kiện",
        });
        router.push('/admin-dashboard/events');
      } catch (error) {
        toast({
          title: "Lỗi",
          description: "Không thể xóa sự kiện",
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
        return <Badge className="bg-blue-100 text-blue-800">Sắp diễn ra</Badge>;
      case 'ONGOING':
        return <Badge className="bg-green-100 text-green-800">Đang diễn ra</Badge>;
      case 'COMPLETED':
        return <Badge className="bg-gray-100 text-gray-800">Đã kết thúc</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
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
      <AdminLayout title="Chi tiết sự kiện">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!event) {
    return (
      <AdminLayout title="Không tìm thấy sự kiện">
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy sự kiện</h2>
          <p className="text-gray-600 mb-4">Sự kiện bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <Link href="/admin-dashboard/events">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại danh sách
            </Button>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Chi tiết sự kiện">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/admin-dashboard/events">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại
              </Button>
            </Link>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Chi tiết sự kiện
              </h2>
              <p className="text-gray-600">
                Xem thông tin chi tiết của sự kiện
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link href={`/admin-dashboard/events/edit/${event.id}`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </Button>
            </Link>
            <Link href={`/admin-dashboard/events/${event.id}/registrations`}>
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Xem đăng ký
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa
            </Button>
          </div>
        </div>

        {/* Event Details */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Content */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      {getStatusBadge(getEventStatus(event))}
                      <Badge className="bg-purple-100 text-purple-800">
                        {loadingRegistrations ? 'Đang tải...' : `${registrations.length} người đã đăng ký`}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {event.description}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Event Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Thông tin sự kiện</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Bắt đầu: {formatDateTime(event.startTime)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Kết thúc: {formatDateTime(event.endTime)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Địa điểm: {event.location}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    Tạo lúc: {formatDateTime(event.createdAt)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Status Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Trạng thái</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Trạng thái:</span>
                    {getStatusBadge(getEventStatus(event))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 