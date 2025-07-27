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
        const pr = typeof item.priority === "number"
          ? item.priority
          : (typeof item.priority === "string" && !isNaN(Number(item.priority))
             ? Number(item.priority)
             : 1);

        setData({
          id: item.id,
          residentName: item.user?.username || "", // Lấy tên từ user object
          title: "", // Không có title trong ServiceRequest, để rỗng hoặc bỏ nếu không dùng
          description: item.description || "",
          categoryCode: item.category?.categoryCode || "",
          categoryName: item.category?.categoryName || "",
          priority: item.priority,
          status: item.status,
          assignedTo: item.assignedTo?.username || "",
          createdAt: item.submittedAt || "",
          completedAt: item.completedAt || "",
          resolutionNotes: item.resolutionNotes || "",
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
      setData((d) => ({ ...d!, assignedTo: u?.username || "" }));
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
      await supportRequestsApi.updateStatus(Number(id), { status: normalizeStatus(data.status) });
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
