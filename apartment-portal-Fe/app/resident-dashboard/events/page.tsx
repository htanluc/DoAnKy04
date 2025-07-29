"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Calendar,
  MapPin,
  Users,
  Clock
} from 'lucide-react';
import { eventsApi, Event, eventRegistrationsApi, EventRegistrationRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import AuthGuard from '@/components/auth/auth-guard';
import { useRequireResidentInfo } from "@/hooks/use-require-resident-info";

export default function ResidentEventsPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [registeringEventId, setRegisteringEventId] = useState<number | null>(null);

  useRequireResidentInfo();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventsApi.getAll();
      setEvents(data);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách sự kiện",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRegister = async (eventId: number) => {
    try {
      setRegisteringEventId(eventId);
      // TODO: Get actual resident ID from auth context
      const residentId = 1; // This should come from user context
      
      await eventRegistrationsApi.register({
        eventId,
        residentId,
      });
      
      toast({
        title: "Thành công",
        description: "Đã đăng ký tham gia sự kiện",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể đăng ký sự kiện",
        variant: "destructive",
      });
    } finally {
      setRegisteringEventId(null);
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
      <AuthGuard requiredRoles={["RESIDENT"]}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requiredRoles={["RESIDENT"]}>
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Sự kiện</h1>
            <p className="text-gray-600">
              Xem và đăng ký tham gia các sự kiện trong chung cư
            </p>
          </div>

          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Tìm kiếm sự kiện..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                  aria-label="Lọc theo trạng thái sự kiện"
                >
                  <option value="all">Tất cả sự kiện</option>
                  <option value="UPCOMING">Sắp diễn ra</option>
                  <option value="ONGOING">Đang diễn ra</option>
                  <option value="COMPLETED">Đã kết thúc</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Events Grid */}
          {filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">Không có sự kiện nào</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{event.title}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {event.description}
                        </p>
                      </div>
                      <div className="ml-2">
                        {getStatusBadge(getEventStatus(event))}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Bắt đầu: {formatDateTime(event.startTime)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>Kết thúc: {formatDateTime(event.endTime)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{event.location}</span>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <Button 
                        className="w-full"
                        onClick={() => handleRegister(event.id)}
                        disabled={registeringEventId === event.id || getEventStatus(event) === 'COMPLETED'}
                      >
                        {registeringEventId === event.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Đang đăng ký...
                          </>
                        ) : getEventStatus(event) === 'COMPLETED' ? (
                          'Đã kết thúc'
                        ) : (
                          <>
                            <Users className="h-4 w-4 mr-2" />
                            Đăng ký tham gia
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
} 