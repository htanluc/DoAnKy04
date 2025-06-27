"use client";

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Users,
  Calendar,
  Clock,
  Plus,
  MapPin
} from 'lucide-react';
import { facilitiesApi, Facility, facilityBookingsApi, FacilityBookingCreateRequest } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import AuthGuard from '@/components/auth/auth-guard';
import { useRequireResidentInfo } from "@/hooks/use-require-resident-info";

export default function ResidentFacilityBookingsPage() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingData, setBookingData] = useState<FacilityBookingCreateRequest>({
    facilityId: 0,
    residentId: 1, // TODO: Get from auth context
    startTime: '',
    endTime: '',
    purpose: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useRequireResidentInfo();

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const data = await facilitiesApi.getAll();
      setFacilities(data);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách tiện ích",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleBookFacility = (facility: Facility) => {
    setSelectedFacility(facility);
    setBookingData(prev => ({
      ...prev,
      facilityId: facility.id,
    }));
    setShowBookingForm(true);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookingData.startTime || !bookingData.endTime || !bookingData.purpose.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      });
      return;
    }

    // Validate time
    const startTime = new Date(bookingData.startTime);
    const endTime = new Date(bookingData.endTime);
    
    if (startTime >= endTime) {
      toast({
        title: "Lỗi",
        description: "Thời gian kết thúc phải sau thời gian bắt đầu",
        variant: "destructive",
      });
      return;
    }

    if (startTime <= new Date()) {
      toast({
        title: "Lỗi",
        description: "Thời gian bắt đầu phải trong tương lai",
        variant: "destructive",
      });
      return;
    }

    try {
      setSubmitting(true);
      await facilityBookingsApi.create(bookingData);
      toast({
        title: "Thành công",
        description: "Đã đặt tiện ích thành công",
      });
      setShowBookingForm(false);
      setSelectedFacility(null);
      setBookingData({
        facilityId: 0,
        residentId: 1,
        startTime: '',
        endTime: '',
        purpose: '',
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể đặt tiện ích",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredFacilities = facilities.filter(facility => {
    return facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           facility.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getCapacityBadge = (capacity: number) => {
    if (capacity <= 20) {
      return <Badge className="bg-green-100 text-green-800">Nhỏ ({capacity})</Badge>;
    } else if (capacity <= 50) {
      return <Badge className="bg-yellow-100 text-yellow-800">Trung bình ({capacity})</Badge>;
    } else {
      return <Badge className="bg-blue-100 text-blue-800">Lớn ({capacity})</Badge>;
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Đặt tiện ích</h1>
            <p className="text-gray-600">
              Xem và đặt các tiện ích trong chung cư
            </p>
          </div>

          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm tiện ích..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Facilities Grid */}
          {filteredFacilities.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-gray-500">Không có tiện ích nào</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredFacilities.map((facility) => (
                <Card key={facility.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{facility.name}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {facility.description}
                        </p>
                      </div>
                      <div className="ml-2">
                        {getCapacityBadge(facility.capacity)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        <span>Sức chứa: {facility.capacity} người</span>
                      </div>
                      {facility.otherDetails && (
                        <div className="flex items-start text-sm text-gray-600">
                          <MapPin className="h-4 w-4 mr-2 mt-0.5" />
                          <span className="line-clamp-2">{facility.otherDetails}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="pt-4 border-t">
                      <Button 
                        className="w-full"
                        onClick={() => handleBookFacility(facility)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Đặt tiện ích
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Booking Modal */}
          {showBookingForm && selectedFacility && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <Card className="w-full max-w-md">
                <CardHeader>
                  <CardTitle>Đặt tiện ích: {selectedFacility.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitBooking} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Thời gian bắt đầu *</label>
                      <Input
                        type="datetime-local"
                        value={bookingData.startTime}
                        onChange={(e) => setBookingData(prev => ({ ...prev, startTime: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Thời gian kết thúc *</label>
                      <Input
                        type="datetime-local"
                        value={bookingData.endTime}
                        onChange={(e) => setBookingData(prev => ({ ...prev, endTime: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Mục đích sử dụng *</label>
                      <Textarea
                        value={bookingData.purpose}
                        onChange={(e) => setBookingData(prev => ({ ...prev, purpose: e.target.value }))}
                        placeholder="Mô tả mục đích sử dụng tiện ích"
                        rows={3}
                        required
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => {
                          setShowBookingForm(false);
                          setSelectedFacility(null);
                        }}
                      >
                        Hủy
                      </Button>
                      <Button type="submit" disabled={submitting}>
                        {submitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Đang đặt...
                          </>
                        ) : (
                          'Đặt tiện ích'
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
} 