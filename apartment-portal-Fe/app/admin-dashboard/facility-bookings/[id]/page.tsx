"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { facilityBookingsApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { BookingStatus } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useLanguage } from "@/lib/i18n";
import { Calendar, Clock, Users, Building2, CheckCircle2, XCircle, AlertCircle, ArrowLeft } from "lucide-react";

const REJECTION_REASONS = [
  "capacity_not_enough",
  "time_conflict",
  "invalid_information",
  "violates_policy",
];

// Hàm cập nhật trạng thái thay thế do facilityBookingsApi chưa có updateStatus
// Sửa lại để PATCH trực tiếp endpoint với body { status }
async function updateBookingStatus(id: number, status: BookingStatus) {
  // Gửi PATCH trực tiếp, không dùng facilityBookingsApi.update vì nó không nhận thuộc tính 'status'
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const res = await fetch(`http://localhost:8080/api/admin/facility-bookings/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    throw new Error("Cập nhật trạng thái thất bại");
  }
  return res.json();
}

export default function FacilityBookingDetailPage() {
  const { t } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const id = Number(params?.id);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchData = () => {
    setLoading(true);
    facilityBookingsApi
      .getById(id)
      .then(setData)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleUpdateStatus = async (status: string, rejectionReason?: string) => {
    setUpdating(true);
    try {
      await facilityBookingsApi.updateStatus(
        id,
        status as BookingStatus,
        status === "REJECTED" ? rejectionReason : undefined
      );
      toast({
        title: "Thành công",
        description: `Đã cập nhật trạng thái: ${status}`,
      });
      fetchData();
    } catch (e) {
      toast({
        title: "Lỗi",
        description: "Không thể cập nhật trạng thái",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const [rejectOpen, setRejectOpen] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>(REJECTION_REASONS[0]);

  const status: string = data?.status || '';
  const canApprove = !(
    status === "APPROVED" ||
    status === "CONFIRMED" ||
    status === "REJECTED" ||
    status === "COMPLETED"
  );
  const canReject = !(
    status === "REJECTED" ||
    status === "CONFIRMED" ||
    status === "APPROVED" ||
    status === "COMPLETED"
  );

  if (loading)
    return (
      <AdminLayout title={t('admin.facility-bookings.title','Facility Booking Management')}>
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center space-y-2">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600 mx-auto" />
            <p className="text-gray-600">{t('admin.loading','Loading...')}</p>
          </div>
        </div>
      </AdminLayout>
    );
  if (!data)
    return (
      <AdminLayout title={t('admin.facility-bookings.title','Facility Booking Management')}>
        <div className="flex items-center justify-center min-h-[300px]">
          <div className="text-center space-y-3">
            <XCircle className="h-10 w-10 text-red-500 mx-auto" />
            <p className="text-red-600">{t('admin.notFound','Không tìm thấy dữ liệu')}</p>
            <Button variant="outline" onClick={() => router.back()} className="mt-2">
              <ArrowLeft className="h-4 w-4 mr-2" />{t('admin.action.back','Quay lại')}
            </Button>
          </div>
        </div>
      </AdminLayout>
    );

  return (
    <AdminLayout title={t('admin.facility-bookings.title','Facility Booking Management')}>
      <div className="max-w-3xl mx-auto mt-8 space-y-6">
        <Card className="shadow-lg border-0">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="flex items-center justify-between">
              <span className="text-xl font-semibold text-gray-900">
                {t('admin.facility-bookings.columns.facility','Facility')} #{data.id}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm">
                <CheckCircle2 className="h-4 w-4 mr-1 text-green-600" /> {data.status}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <div className="text-sm text-gray-500 flex items-center"><Users className="h-4 w-4 mr-2 text-gray-400" />{t('admin.facility-bookings.columns.resident','Resident')}</div>
                <div className="font-medium text-gray-900">{data.residentName || data.user?.username || data.user?.email || data.user?.phoneNumber || t('admin.users.anonymous','Ẩn danh')}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-500 flex items-center"><Building2 className="h-4 w-4 mr-2 text-gray-400" />{t('admin.facility-bookings.columns.facility','Facility')}</div>
                <div className="font-medium text-gray-900">{data.facilityName || data.facility?.name}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-500 flex items-center"><Calendar className="h-4 w-4 mr-2 text-gray-400" />{t('admin.facility-bookings.columns.startTime','Start time')}</div>
                <div className="font-medium text-gray-900">{data.startTime ? new Date(data.startTime).toLocaleString('vi-VN') : data.bookingTime ? new Date(data.bookingTime).toLocaleString('vi-VN') : '-'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-500 flex items-center"><Clock className="h-4 w-4 mr-2 text-gray-400" />{t('admin.facility-bookings.columns.endTime','End time')}</div>
                <div className="font-medium text-gray-900">{data.endTime ? new Date(data.endTime).toLocaleString('vi-VN') : '-'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-500">{t('admin.facility-bookings.columns.purpose','Purpose')}</div>
                <div className="font-medium text-gray-900">{data.purpose || '-'}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-500">{t('admin.createdAt','Ngày tạo')}</div>
                <div className="font-medium text-gray-900">{data.createdAt ? new Date(data.createdAt).toLocaleString('vi-VN') : '-'}</div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              {canApprove && (
                <Button disabled={updating} onClick={() => handleUpdateStatus('CONFIRMED')} className="bg-blue-600 hover:bg-blue-700 text-white">
                  {t('admin.action.approve','Phê duyệt')}
                </Button>
              )}
              {canReject && (
                <Button variant="destructive" disabled={updating} onClick={() => setRejectOpen(true)}>
                  {t('admin.action.reject','Từ chối')}
                </Button>
              )}
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />{t('admin.action.back','Quay lại')}
              </Button>
            </div>

            {canReject && (
            <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Chọn lý do từ chối</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={selectedReason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                  >
                    {REJECTION_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setRejectOpen(false)}>
                    Hủy
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      await handleUpdateStatus("REJECTED", selectedReason);
                      setRejectOpen(false);
                    }}
                  >
                    Xác nhận từ chối
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}