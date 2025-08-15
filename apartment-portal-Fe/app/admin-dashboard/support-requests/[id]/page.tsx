"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supportRequestsApi } from "@/lib/api";
import { API_BASE_URL } from "@/lib/auth";

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
  createdAt?: string;
  completedAt?: string;
  resolutionNotes?: string;
  assignedAt?: string; // Thêm trường assignedAt
}

function normalizeStatus(raw?: string) {
  return raw?.trim().toUpperCase().replace(" ", "_") || "";
}

function getStatusBadge(raw?: string) {
  const s = normalizeStatus(raw);
  switch (s) {
    case "OPEN":
      return <Badge className="bg-blue-100 text-blue-800">Mở</Badge>;
    case "IN_PROGRESS":
      return <Badge className="bg-orange-100 text-orange-800">Đang xử lý</Badge>;
    case "COMPLETED":
      return <Badge className="bg-green-100 text-green-800">Hoàn thành</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800">{raw || "-"}</Badge>;
  }
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("vi-VN");
}

export default function SupportRequestDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState<SupportRequestDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [staffList, setStaffList] = useState<{ id: number; username: string; email: string }[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<number | "">("");
  const [selectedPriority, setSelectedPriority] = useState<number>(1);
  const [adminNotes, setAdminNotes] = useState<string>("");

  const [assignError, setAssignError] = useState<string>("");
  const [statusError, setStatusError] = useState<string>("");

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
          assignedTo: (item as any).assignedTo || "", // Sử dụng assignedTo từ backend DTO
          createdAt: (item as any).createdAt || "", // Sử dụng createdAt từ backend DTO
          completedAt: (item as any).resolvedAt || "", // Sử dụng resolvedAt từ backend DTO
          resolutionNotes: (item as any).resolution || "", // Sử dụng resolution từ backend DTO
          assignedAt: (item as any).assignedAt || "", // Lấy assignedAt từ backend DTO
        });
        setSelectedPriority(pr);
        setSelectedStaff(item.assignedTo?.id ?? ""); // Lấy id từ assignedTo nếu có
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
          }))
        );
      });
  }, []);

  const handleAssign = async () => {
    if (!data) {
      setAssignError("Không có dữ liệu yêu cầu hỗ trợ!");
      return;
    }
    if (!selectedStaff) {
      setAssignError("Vui lòng chọn nhân viên!");
      return;
    }
    setAssigning(true);
    setAssignError("");
    try {
      await supportRequestsApi.assign(Number(id), {
        assignedToUserId: Number(selectedStaff),
        serviceCategory: data.categoryCode!,
        priority: selectedPriority,
        adminNotes: adminNotes,
      });
      const u = staffList.find((s) => s.id === Number(selectedStaff));
      setData((d) => ({ 
        ...d!, 
        assignedTo: u?.username || "", 
        assignedAt: new Date().toISOString(),
        resolutionNotes: adminNotes || d!.resolutionNotes || ""
      }));
      alert("Gán nhân viên thành công!");
    } catch {
      setAssignError("Gán nhân viên thất bại!");
    } finally {
      setAssigning(false);
    }
  };

  const handleStatusChange = async () => {
    if (!data) {
      setStatusError("Không có dữ liệu yêu cầu hỗ trợ!");
      return;
    }
    setStatusError("");
    try {
      await supportRequestsApi.updateStatus(Number(id), {
        status: normalizeStatus(data.status),
        isCompleted: normalizeStatus(data.status) === 'COMPLETED',
      });
      setData((d) => ({ ...d!, status: normalizeStatus(data.status) }));
      alert("Cập nhật trạng thái thành công!");
    } catch {
      setStatusError("Cập nhật trạng thái thất bại!");
    }
  };

  if (loading) return <div className="p-8">Đang tải...</div>;
  if (!data) return <div className="p-8 text-red-500">Không tìm thấy yêu cầu hỗ trợ!</div>;

  return (
    <AdminLayout title="Chi tiết yêu cầu hỗ trợ">
      <div className="max-w-2xl mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Yêu cầu #{data.id}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div><b>Cư dân:</b> {data.residentName}</div>
            <div><b>Số điện thoại:</b> {data.userPhone || "Không có"}</div>
            <div><b>Tiêu đề / Mô tả:</b> {data.title || data.description}</div>
            <div><b>Danh mục:</b> {data.categoryName}</div>

            <div className="flex items-center gap-2">
              <b>Ưu tiên hiện tại:</b> {data.priority ?? "-"}
            </div>

            <div className="flex items-center gap-2">
              <b>Trạng thái:</b>
              {getStatusBadge(data.status)}
            </div>

            <div><b>Được giao cho:</b> {data.assignedTo || "Chưa giao"}</div>
            <div><b>Ngày tạo:</b> {formatDate(data.createdAt)}</div>
            {data.completedAt && <div><b>Ngày hoàn thành:</b> {formatDate(data.completedAt)}</div>}
            {data.resolutionNotes && <div><b>Kết quả xử lý:</b> {data.resolutionNotes}</div>}

            {/* Phần hiển thị lịch sử gán nhân viên */}
            {data.assignedTo && (
              <div className="mt-4 p-4 border rounded bg-blue-50">
                <div className="mb-2 font-semibold text-blue-800">📋 Lịch sử gán nhân viên</div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Nhân viên được gán:</span>
                    <span className="text-blue-700">{data.assignedTo}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Thời gian gán:</span>
                    <span className="text-blue-700">
                      {data.assignedAt ? formatDate(data.assignedAt) : 'Không xác định'}
                    </span>
                  </div>
                  {data.resolutionNotes && (
                    <div className="flex items-start gap-2">
                      <span className="font-medium">Ghi chú khi gán:</span>
                      <span className="text-blue-700 bg-white p-2 rounded border flex-1">
                        {data.resolutionNotes}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Phần cập nhật trạng thái */}
            <div className="mt-4 flex items-center gap-2">
              <select
                className="border rounded px-2 py-1"
                value={data.status}
                onChange={(e) => setData((d) => ({ ...d!, status: e.target.value }))}
              >
                <option value="OPEN">Mở</option>
                <option value="IN_PROGRESS">Đang xử lý</option>
                <option value="COMPLETED">Hoàn thành</option>
              </select>
              <button
                className="bg-green-600 text-white px-3 py-1 rounded disabled:opacity-50"
                onClick={handleStatusChange}
              >
                Cập nhật trạng thái
              </button>
            </div>
            {statusError && <div className="text-red-500">{statusError}</div>}

            {/* Phần gán nhân viên */}
            <div className="mt-6 p-4 border rounded bg-gray-50">
              <div className="mb-2 font-semibold">Gán cho nhân viên</div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <select
                    className="border rounded px-2 py-1 flex-1"
                    value={selectedStaff}
                    onChange={(e) => setSelectedStaff(e.target.value === "" ? "" : Number(e.target.value))}
                  >
                    <option value="">Chọn nhân viên</option>
                    {staffList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.username} ({s.email})
                      </option>
                    ))}
                  </select>
                  {/* <select
                    className="border rounded px-2 py-1"
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(Number(e.target.value))}
                  >
                    <option value={1}>1 (Cao nhất)</option>
                    <option value={2}>2</option>
                    <option value={3}>3</option>
                    <option value={4}>4</option>
                    <option value={5}>5 (Thấp nhất)</option>
                  </select> */}
                </div>
                <textarea
                  className="border rounded px-2 py-1 w-full"
                  rows={3}
                  placeholder="Ghi chú của admin (tuỳ chọn)"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
                <button
                  className="bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
                  onClick={handleAssign}
                  disabled={!selectedStaff || assigning}
                >
                  {assigning ? "Đang gán..." : "Gán nhân viên"}
                </button>
                {assignError && <div className="text-red-500">{assignError}</div>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
