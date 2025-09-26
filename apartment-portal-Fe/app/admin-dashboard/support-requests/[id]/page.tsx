"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supportRequestsApi } from "@/lib/api";
import { API_BASE_URL } from "@/lib/auth";
import ServiceRequestStatusProgress from "@/components/admin/ServiceRequestStatusProgress";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n";
import { Image, X, ChevronLeft, ChevronRight } from "lucide-react";

interface SupportRequestDetail {
  id: number;
  residentName: string;
  userPhone: string; // Thêm số điện thoại cư dân
  title?: string;
  description?: string;
  categoryCode?: string;
  categoryName?: string;
  priority?: string | number;
  status?: string;
  assignedTo?: string;
  staffPhone?: string; // Số điện thoại nhân viên được gán
  createdAt?: string;
  completedAt?: string;
  resolutionNotes?: string;
  assignedAt?: string; // Thêm trường assignedAt
  attachmentUrls?: string[]; // Thêm trường hình ảnh đính kèm
  beforeImages?: string[];
  afterImages?: string[];
}

function normalizeStatus(raw?: string) {
  return raw?.trim().toUpperCase().replace(" ", "_") || "";
}

function getStatusBadge(raw?: string, t?: any) {
  const s = normalizeStatus(raw);
  switch (s) {
    case "OPEN":
      return <Badge className="bg-blue-100 text-blue-800">{t('admin.support-requests.detail.status.open', 'Mở')}</Badge>;
    case "IN_PROGRESS":
      return <Badge className="bg-orange-100 text-orange-800">{t('admin.support-requests.detail.status.inProgress', 'Đang xử lý')}</Badge>;
    case "COMPLETED":
      return <Badge className="bg-green-100 text-green-800">{t('admin.support-requests.detail.status.completed', 'Hoàn thành')}</Badge>;
    case "CANCELLED":
      return <Badge className="bg-red-100 text-red-800">{t('admin.support-requests.detail.status.cancelled', 'Đã hủy')}</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800">{raw || "-"}</Badge>;
  }
}

// Tô màu theo trạng thái cho phần "Trạng thái & thời gian"
function getStatusPanelClasses(raw?: string) {
  const s = normalizeStatus(raw);
  if (s === "COMPLETED") return { panel: "bg-green-100 border-green-300", accent: "text-green-700" };
  if (s === "IN_PROGRESS") return { panel: "bg-amber-100 border-amber-300", accent: "text-amber-700" };
  if (s === "ASSIGNED") return { panel: "bg-indigo-100 border-indigo-300", accent: "text-indigo-700" };
  if (s === "OPEN") return { panel: "bg-blue-100 border-blue-300", accent: "text-blue-700" };
  if (s === "CANCELLED") return { panel: "bg-red-100 border-red-300", accent: "text-red-700" };
  return { panel: "bg-gray-100 border-gray-300", accent: "text-gray-700" };
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("vi-VN");
}

// Lightbox functions - sẽ được implement trong component

export default function SupportRequestDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<SupportRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useLanguage();

  // Chuẩn hoá URL ảnh (fix trường hợp BE trả về đường dẫn tương đối /api/files/...)
  const normalizeUrl = (u: string | undefined): string => {
    if (!u) return "";
    try {
      let cleaned = u.replace(/\\\\/g, "/").replace(/\\/g, "/").trim();
      if (cleaned.startsWith("/")) return `${API_BASE_URL}${cleaned}`;

      // Nếu là URL tuyệt đối, chuẩn hoá về cùng origin với API_BASE_URL cho các đường dẫn file
      if (/^https?:\/\//i.test(cleaned)) {
        const api = new URL(API_BASE_URL);
        const parsed = new URL(cleaned);
        // Chỉ force đổi origin khi là đường dẫn file do BE phục vụ
        if (parsed.pathname.startsWith("/api/files") || parsed.pathname.startsWith("/uploads")) {
          // Giữ nguyên pathname, đổi origin sang API_BASE_URL
          return `${api.origin}${parsed.pathname}`;
        }
        return cleaned;
      }

      return cleaned;
    } catch {
      return u as string;
    }
  };

  const [staffList, setStaffList] = useState<{ id: number; username: string; email: string; phoneNumber?: string }[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<number | "">("");
  const [selectedPriority, setSelectedPriority] = useState<number>(1);

  const [assignError, setAssignError] = useState<string>("");
  const [statusError, setStatusError] = useState<string>("");
  const [statusUpdating, setStatusUpdating] = useState<boolean>(false);
  
  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentImages, setCurrentImages] = useState<string[]>([]);

  // Lightbox functions
  const openLightbox = (images: string[], startIndex: number = 0) => {
    setCurrentImages(images);
    setCurrentImageIndex(startIndex);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setCurrentImages([]);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % currentImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + currentImages.length) % currentImages.length);
  };

  // Load detail
  useEffect(() => {
    setLoading(true);
    supportRequestsApi
      .getById(Number(id)) // Sửa: ép kiểu id sang number
      .then((item) => {
        console.log('Raw API data:', item); // Debug: xem dữ liệu thô từ API
        console.log('User object:', item.user); // Debug: xem object user
        console.log('Username:', item.user?.username); // Debug: xem username
        console.log('All possible user fields:', {
          user: item.user,
          userUsername: item.user?.username,
          userFullName: item.user?.fullName,
          userFirstName: item.user?.firstName,
          userLastName: item.user?.lastName,
          // Thêm các trường khác có thể có
          residentName: (item as any).residentName,
          userName: (item as any).userName,
          fullName: (item as any).fullName,
          firstName: (item as any).firstName,
          lastName: (item as any).lastName
        });
        
        // Debug: kiểm tra cấu trúc dữ liệu chi tiết
        console.log('Item structure:', {
          id: item.id,
          hasUser: !!item.user,
          userType: typeof item.user,
          userKeys: item.user ? Object.keys(item.user) : 'No user object',
          directFields: {
            residentName: (item as any).residentName,
            userName: (item as any).userName,
            fullName: (item as any).fullName,
            firstName: (item as any).firstName,
            lastName: (item as any).lastName
          }
        });
        
        // Debug: kiểm tra cấu trúc dữ liệu từ backend ServiceRequestDto
        console.log('Backend DTO fields:', {
          userName: (item as any).userName,
          userPhone: (item as any).userPhone,
          categoryId: (item as any).categoryId,
          categoryName: (item as any).categoryName,
          title: (item as any).title,
          description: (item as any).description,
          priority: (item as any).priority,
          status: (item as any).status,
          assignedTo: (item as any).assignedTo,
          assignedAt: (item as any).assignedAt,
          assignedDate: (item as any).assignedDate,
          createdAt: (item as any).createdAt,
          resolvedAt: (item as any).resolvedAt,
          resolution: (item as any).resolution
        });
        
        const pr = typeof item.priority === "number"
          ? item.priority
          : (typeof item.priority === "string" && !isNaN(Number(item.priority))
             ? Number(item.priority)
             : 1);

        // Cải thiện logic mapping tên cư dân
        let residentName = 'Không xác định';
        
        // Backend trả về ServiceRequestDto với userName trực tiếp
        if ((item as any).userName && (item as any).userName.trim()) {
          residentName = (item as any).userName;
        } else if (item.user) {
          // Fallback: nếu có user object, ưu tiên các trường này
          if (item.user.fullName && item.user.fullName.trim()) {
            residentName = item.user.fullName;
          } else if (item.user.firstName && item.user.lastName) {
            residentName = `${item.user.firstName} ${item.user.lastName}`;
          } else if (item.user.username && item.user.username.trim()) {
            residentName = item.user.username;
          }
        } else {
          // Fallback: kiểm tra các trường khác có thể có
          if ((item as any).residentName && (item as any).residentName.trim()) {
            residentName = (item as any).residentName;
          } else if ((item as any).fullName && (item as any).fullName.trim()) {
            residentName = (item as any).fullName;
          } else if ((item as any).firstName && (item as any).lastName) {
            residentName = `${(item as any).firstName} ${(item as any).lastName}`;
          }
        }
        
        // Debug: kiểm tra dữ liệu sau khi mapping
        console.log('Mapped data:', {
          id: item.id,
          residentName: residentName,
          userPhone: (item as any).userPhone,
          title: (item as any).title,
          description: (item as any).description,
          categoryCode: (item as any).categoryId,
          categoryName: (item as any).categoryName,
          priority: (item as any).priority,
          status: (item as any).status,
          assignedTo: (item as any).assignedTo,
          createdAt: (item as any).createdAt,
          completedAt: (item as any).resolvedAt,
          resolutionNotes: (item as any).resolution
        });

        const attachmentUrls: string[] = ((item as any).attachmentUrls || (item as any).imageUrls || (item as any).attachments || [])
          .map((u: string) => normalizeUrl(u));
        const beforeImages: string[] = (((item as any).beforeImages) || []).map((u: string) => normalizeUrl(u));
        const afterImages: string[] = (((item as any).afterImages) || []).map((u: string) => normalizeUrl(u));

        setData({
          id: item.id,
          residentName: residentName,
          userPhone: (item as any).userPhone || "", // Thêm số điện thoại cư dân
          title: (item as any).title || "", // Sử dụng title từ backend DTO
          description: (item as any).description || "",
          categoryCode: (item as any).categoryId || "", // Sử dụng categoryId từ backend DTO
          categoryName: (item as any).categoryName || "", // Sử dụng categoryName từ backend DTO
          priority: (item as any).priority || "",
          status: (item as any).status || "",
          assignedTo:
            (item as any).assignedTo && typeof (item as any).assignedTo === 'object'
              ? ((item as any).assignedTo.username || (item as any).assignedTo.fullName || (item as any).assignedTo.email || "")
              : ((item as any).assignedTo || ""),
          staffPhone:
            (item as any).assignedTo && typeof (item as any).assignedTo === 'object'
              ? (((item as any).assignedTo.phoneNumber || (item as any).assignedTo.phone) || "")
              : ((item as any).assignedPhone || ""),
          createdAt: (item as any).createdAt || "", // Sử dụng createdAt từ backend DTO
          completedAt: (item as any).resolvedAt || "", // Sử dụng resolvedAt từ backend DTO
          resolutionNotes: (item as any).resolution || "", // Sử dụng resolution từ backend DTO
          assignedAt: (item as any).assignedAt || (item as any).assignedDate || "", // Lấy assignedAt từ backend DTO
          attachmentUrls,
          beforeImages,
          afterImages,
        });
        setSelectedPriority(pr);
        const assignedId = (item as any).assignedTo && typeof (item as any).assignedTo === 'object'
          ? (item as any).assignedTo.id
          : "";
        setSelectedStaff(assignedId); // Lấy id từ assignedTo nếu có
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Load staff list
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/admin/users`, {
      headers: {
        Authorization: localStorage.getItem("token")
          ? `Bearer ${localStorage.getItem("token")}`
          : "",
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((users: any[]) => {
        const staffs = users.filter(
          (u) =>
            Array.isArray(u.roles) &&
            (u.roles.includes("STAFF") ||
              u.roles.some(
                (r: any) =>
                  (typeof r === "string" && r === "STAFF") ||
                  (typeof r === "object" && r.name === "STAFF")
              ))
        );
        setStaffList(
          staffs.map((u) => ({
            id: u.id,
            username: u.username,
            email: u.email,
            phoneNumber: u.phoneNumber || (u.profile?.phoneNumber) || u.phone,
          }))
        );
      });
  }, []);

  // Khi đã có danh sách nhân viên và dữ liệu chi tiết, điền số điện thoại nếu còn thiếu
  useEffect(() => {
    if (!data || data.staffPhone) return;
    try {
      const assigned = (data as any).assignedTo; // đã map thành string tên hiển thị
      if (!assigned) return;
      // Tìm theo username trước, nếu không có, thử theo email
      const hit = staffList.find(
        (s) => s.username === assigned || s.email === assigned
      );
      if (hit && hit.phoneNumber) {
        setData((d) => d ? { ...d, staffPhone: hit.phoneNumber } : d);
      }
    } catch {}
  }, [staffList, data]);

  const handleAssign = async () => {
    if (!data) {
      setAssignError(t('admin.support-requests.detail.error.load', 'Không thể tải chi tiết yêu cầu hỗ trợ'));
      return;
    }
    if (!selectedStaff) {
      setAssignError(t('admin.support-requests.detail.error.selectStaff', 'Vui lòng chọn nhân viên!'));
      return;
    }
    setAssigning(true);
    setAssignError("");
    try {
      const response = await supportRequestsApi.assign(Number(id), {
        assignedToUserId: Number(selectedStaff),
        serviceCategory: data.categoryCode!,
        priority: selectedPriority,
      });
      console.log('Assign response:', response); // Debug: xem response từ backend
      const u = staffList.find((s) => s.id === Number(selectedStaff));
      const currentTime = new Date().toISOString();
      const responseStatus = (response as any)?.status || "ASSIGNED";
      console.log('Response status:', responseStatus); // Debug: xem trạng thái từ backend
      setData((d) => ({ 
        ...d!, 
        status: responseStatus, // Sử dụng trạng thái từ backend thay vì hardcode
        assignedTo: u?.username || "", 
        assignedAt: (response as any)?.assignedAt || currentTime, // Ưu tiên thời gian từ backend
        staffPhone: u?.phoneNumber || d!.staffPhone || "",
        resolutionNotes: d!.resolutionNotes || ""
      }));
      toast({ title: t('admin.support-requests.detail.success.assign', 'Đã gán nhân viên thành công'), description: t('admin.support-requests.detail.success.assign', 'Đã gán nhân viên thành công') });
    } catch {
      setAssignError(t('admin.support-requests.detail.error.assign', 'Không thể gán nhân viên'));
      toast({ title: t('admin.support-requests.detail.error.assign', 'Không thể gán nhân viên'), description: t('admin.support-requests.detail.error.assign', 'Không thể gán nhân viên'), variant: "destructive" as any });
    } finally {
      setAssigning(false);
    }
  };

  const handleStatusChange = async (targetStatus: string) => {
    if (!data) {
      setStatusError(t('admin.support-requests.detail.error.load', 'Không thể tải chi tiết yêu cầu hỗ trợ'));
      return;
    }
    setStatusError("");
    setStatusUpdating(true);
    try {
      const normalized = normalizeStatus(targetStatus);
      // Dành cho Admin: dùng endpoint adminUpdateStatus để đảm bảo quyền
      await supportRequestsApi.adminUpdateStatus(Number(id), {
        status: normalized,
        isCompleted: normalized === 'COMPLETED',
      });
      setData((d) => ({ 
        ...d!, 
        status: normalized,
        completedAt: normalized === 'COMPLETED' ? (d!.completedAt || new Date().toISOString()) : d!.completedAt,
      }));
      toast({ title: t('admin.support-requests.detail.success.update', 'Đã cập nhật trạng thái thành công'), description: t('admin.support-requests.detail.success.update', 'Đã cập nhật trạng thái thành công') });
    } catch {
      setStatusError(t('admin.support-requests.detail.error.update', 'Không thể cập nhật trạng thái'));
      toast({ title: t('admin.support-requests.detail.error.update', 'Không thể cập nhật trạng thái'), description: t('admin.support-requests.detail.error.update', 'Không thể cập nhật trạng thái'), variant: "destructive" as any });
    } finally {
      setStatusUpdating(false);
    }
  };

  // Xác nhận trước khi hủy
  const handleCancelClick = async () => {
    if (!data) return;
    const confirmed = typeof window !== 'undefined'
      ? window.confirm('Bạn có chắc chắn muốn hủy yêu cầu này? Hành động này không thể hoàn tác.')
      : true;
    if (!confirmed) return;
    await handleStatusChange('CANCELLED');
  };

  if (loading) return <div className="p-8">{t('admin.support-requests.loading', 'Đang tải...')}</div>;
  if (!data) return <div className="p-8 text-red-500">{t('admin.support-requests.detail.error.load', 'Không thể tải chi tiết yêu cầu hỗ trợ')}</div>;

  return (
    <AdminLayout title={t('admin.support-requests.detail.title', 'Chi tiết yêu cầu hỗ trợ')}>
      <div className="max-w-5xl mx-auto mt-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Yêu cầu #{data.id}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ServiceRequestStatusProgress
              status={data.status || "OPEN"}
              assignedTo={data.assignedTo}
              assignedAt={data.assignedAt}
              completedAt={data.completedAt}
              staffPhone={data.staffPhone}
              className="mb-2"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border bg-emerald-100 border-emerald-300">
                <div className="mb-2 font-semibold text-emerald-800">{t('admin.support-requests.detail.residentInfo', 'Thông tin cư dân')}</div>
                <div className="space-y-2 text-sm">
                  <div><b>{t('admin.support-requests.detail.name', 'Tên')}:</b> {data.residentName}</div>
                  <div><b>{t('admin.support-requests.detail.phone', 'Số điện thoại')}:</b> {data.userPhone || t('admin.support-requests.detail.noData', 'Không có')}</div>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-purple-100 border-purple-300">
                <div className="mb-2 font-semibold text-purple-800">{t('admin.support-requests.detail.requestInfo', 'Thông tin yêu cầu')}</div>
                <div className="space-y-2 text-sm">
                  <div><b>{t('admin.support-requests.detail.requestTitle', 'Tiêu đề')} / {t('admin.support-requests.detail.description', 'Mô tả')}:</b> {data.title || data.description}</div>
                  <div><b>{t('admin.support-requests.detail.category', 'Danh mục')}:</b> {data.categoryName}</div>
                  <div className="flex items-center gap-2"><b>{t('admin.support-requests.detail.priority', 'Mức độ ưu tiên')} {t('admin.support-requests.detail.current', 'hiện tại')}:</b> {data.priority ?? "-"}</div>
                </div>
              </div>
              {(() => {
                const tone = getStatusPanelClasses(data.status);
                return (
                  <div className={`p-4 rounded-lg border ${tone.panel}`}>
                    <div className="mb-2 font-semibold text-gray-800">{t('admin.support-requests.detail.status', 'Trạng thái')} & {t('admin.support-requests.detail.time', 'thời gian')}</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2"><b>{t('admin.support-requests.detail.status', 'Trạng thái')}:</b>{getStatusBadge(data.status, t)}</div>
                      {data.assignedTo && (
                        <div className="flex items-center gap-2">
                          <b>{t('admin.support-requests.detail.staff', 'Nhân viên')}:</b>
                          <span>{data.assignedTo}</span>
                          {data.staffPhone && (
                            <span className={`${tone.accent}`}>• {data.staffPhone}</span>
                          )}
                        </div>
                      )}
                      <div><b>{t('admin.support-requests.detail.createdAt', 'Ngày tạo')}:</b> <span className={`${tone.accent}`}>{formatDate(data.createdAt)}</span></div>
                      {data.completedAt && (
                        <div><b>{t('admin.support-requests.detail.completedAt', 'Ngày hoàn thành')}:</b> <span className={`${tone.accent}`}>{formatDate(data.completedAt)}</span></div>
                      )}
                    </div>
                  </div>
                );
              })()}
              <div className="p-4 rounded-lg border bg-amber-100 border-amber-300">
                <div className="mb-2 font-semibold text-amber-800">{t('admin.support-requests.detail.staff', 'Nhân viên')} {t('admin.support-requests.detail.responsible', 'phụ trách')}</div>
                <div className="space-y-2 text-sm">
                  <div><b>{t('admin.support-requests.detail.assignedTo', 'Được giao cho')}:</b> {data.assignedTo || t('admin.support-requests.notAssigned', 'Chưa giao')}</div>
                </div>
              </div>
              
              {/* Display Attached Images */}
              {data.attachmentUrls && data.attachmentUrls.length > 0 && (
                <div className="p-4 rounded-lg border bg-green-50 border-green-200">
                  <div className="mb-3 font-semibold text-green-800 flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    {t('admin.support-requests.detail.images', 'Hình ảnh')} {t('admin.support-requests.detail.attachments', 'đính kèm')} ({data.attachmentUrls.length} {t('admin.support-requests.detail.imageCount', 'ảnh')})
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {data.attachmentUrls.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url}
                          alt={`${t('admin.support-requests.detail.imageAlt', 'Hình ảnh')} ${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:border-green-300 transition-colors"
                          onClick={() => openLightbox(data.attachmentUrls!, index)}
                          title={t('admin.support-requests.detail.clickToView', 'Click để xem ảnh đầy đủ')}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center pointer-events-none">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-white bg-opacity-90 rounded-full p-1">
                              <Image className="h-3 w-3 text-gray-700" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ảnh Trước/Sau nếu có */}
              {((data as any).beforeImages && (data as any).beforeImages.length > 0) || ((data as any).afterImages && (data as any).afterImages.length > 0) ? (
                <div className="p-4 rounded-lg border bg-white border-gray-200">
                  <div className="mb-3 font-semibold text-gray-800 flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Hình ảnh Trước / Sau
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-semibold mb-2">Trước</div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {(((data as any).beforeImages) || []).map((url: string, index: number) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Trước ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors"
                            onClick={() => openLightbox((((data as any).beforeImages) || []), index)}
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold mb-2">Sau</div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {(((data as any).afterImages) || []).map((url: string, index: number) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Sau ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors"
                            onClick={() => openLightbox((((data as any).afterImages) || []), index)}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {data.resolutionNotes && <div className="p-4 rounded-lg border bg-white"><b>Kết quả xử lý:</b> {data.resolutionNotes}</div>}


            <div className="mt-2 p-4 border rounded bg-gray-50">
              <div className="mb-2 font-semibold">Quản lý yêu cầu</div>
              <div className="space-y-3">
                {/* Hiển thị quy trình tự động */}
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-blue-800">
                    <strong>Quy trình tự động:</strong> Admin chỉ gán nhân viên, nhân viên tự cập nhật trạng thái
                  </div>
                  <div className="mt-2 text-xs text-blue-600">
                    • <strong>Nhận yêu cầu</strong> → <strong>Đã giao</strong> (khi admin gán nhân viên)<br/>
                    • <strong>Đang xử lý</strong> (nhân viên tự cập nhật khi bắt đầu)<br/>
                    • <strong>Hoàn thành</strong> (nhân viên tự cập nhật khi xong)
                  </div>
                </div>
                
                {/* Thông báo quy trình tự động */}
                {data.assignedTo && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-sm text-blue-800">
                      <strong>Quy trình tự động:</strong> Nhân viên sẽ tự cập nhật trạng thái
                    </div>
                    <div className="mt-2 text-xs text-blue-600">
                      • <strong>Đã giao</strong> → Nhân viên nhận nhiệm vụ<br/>
                      • <strong>Đang xử lý</strong> → Nhân viên bắt đầu xử lý<br/>
                      • <strong>Hoàn thành</strong> → Nhân viên hoàn thành và báo cáo
                    </div>
                  </div>
                )}

                {/* Nút Hủy: ẩn khi đã COMPLETED hoặc CANCELLED */}
                {normalizeStatus(data.status) !== 'COMPLETED' && normalizeStatus(data.status) !== 'CANCELLED' && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="destructive"
                      onClick={handleCancelClick}
                      disabled={statusUpdating || normalizeStatus(data.status) === 'CANCELLED'}
                      className="w-fit"
                    >
                      {statusUpdating ? "Đang hủy..." : "Hủy yêu cầu"}
                    </Button>
                    <span className="text-xs text-gray-500">
                      Chỉ có thể hủy yêu cầu khi cần thiết
                    </span>
                  </div>
                )}
                {statusError && <div className="text-red-500 mt-2">{statusError}</div>}
              </div>
            </div>

            {normalizeStatus(data.status) !== 'COMPLETED' && (
              <div className="mt-2 p-4 border rounded bg-gray-50">
                <div className="mb-2 font-semibold">{t('admin.support-requests.detail.assignStaff', 'Gán nhân viên')}</div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <select
                      className="border rounded px-2 py-1 flex-1"
                      value={selectedStaff}
                      onChange={(e) => setSelectedStaff(e.target.value === "" ? "" : Number(e.target.value))}
                    >
                      <option value="">{t('admin.support-requests.detail.selectStaff', 'Chọn nhân viên')}</option>
                      {staffList.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.username} ({s.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    className="w-fit"
                    onClick={handleAssign}
                    disabled={!selectedStaff || assigning}
                  >
                            {assigning ? t('admin.support-requests.detail.assigning', 'Đang gán...') : t('admin.support-requests.detail.assignStaff', 'Gán nhân viên')}
                  </Button>
                  {assignError && <div className="text-red-500">{assignError}</div>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
            >
              <X className="h-8 w-8" />
            </button>

            {/* Navigation buttons */}
            {currentImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-10"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              </>
            )}

            {/* Image */}
            <div className="p-4">
              <img
                src={currentImages[currentImageIndex]}
                alt={`Hình ảnh ${currentImageIndex + 1}`}
                className="max-w-[90vw] max-h-[85vh] w-auto h-auto object-contain rounded-lg"
              />
            </div>

            {/* Image counter */}
            {currentImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-3 py-1 rounded-full text-sm">
                {currentImageIndex + 1} / {currentImages.length}
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
