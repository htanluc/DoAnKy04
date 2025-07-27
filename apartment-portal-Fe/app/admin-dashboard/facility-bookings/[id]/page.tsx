"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { facilityBookingsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function FacilityBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = Number(params?.id);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchData = () => {
    setLoading(true);
    facilityBookingsApi.getById(id)
      .then(setData)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleUpdateStatus = async (status: string) => {
    setUpdating(true);
    try {
      await facilityBookingsApi.updateStatus(id, status); // Cần có API này ở backend
      toast({ title: "Thành công", description: `Đã cập nhật trạng thái: ${status}` });
      fetchData();
    } catch (e) {
      toast({ title: "Lỗi", description: "Không thể cập nhật trạng thái", variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-8">Đang tải...</div>;
  if (!data) return <div className="p-8 text-red-500">Không tìm thấy yêu cầu đặt dịch vụ!</div>;

  return (
    <AdminLayout title="Chi tiết yêu cầu đặt dịch vụ">
      <div className="max-w-2xl mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết đặt tiện ích #{data.id}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div><b>Cư dân:</b> {data.residentName || data.user?.username || data.user?.email || data.user?.phoneNumber || 'Ẩn danh'}</div>
            <div><b>Tiện ích:</b> {data.facilityName || data.facility?.name}</div>
            <div><b>Thời gian đặt:</b> {(data.startTime ? new Date(data.startTime).toLocaleString('vi-VN') : (data.bookingTime ? new Date(data.bookingTime).toLocaleString('vi-VN') : '-')) + (data.endTime ? ' - ' + new Date(data.endTime).toLocaleString('vi-VN') : '')}</div>
            <div><b>Số người:</b> {data.numberOfPeople}</div>
            <div><b>Trạng thái:</b> {data.status}</div>
            <div><b>Ngày tạo:</b> {data.createdAt ? new Date(data.createdAt).toLocaleString('vi-VN') : '-'}</div>
            <div className="flex gap-4 mt-6">
              <Button disabled={updating || data.status === 'APPROVED' || data.status === 'CONFIRMED'} onClick={() => handleUpdateStatus('CONFIRMED')}>
                Phê duyệt
              </Button>
              <Button variant="destructive" disabled={updating || data.status === 'REJECTED'} onClick={() => handleUpdateStatus('REJECTED')}>
                Từ chối
              </Button>
              <Button variant="outline" onClick={() => router.back()}>Quay lại</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
} 