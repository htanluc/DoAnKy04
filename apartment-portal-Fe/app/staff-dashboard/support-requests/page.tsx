"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, RefreshCw } from "lucide-react";
import { getCurrentUser, getRoleNames } from "@/lib/auth";
import { ServiceRequest, supportRequestsApi } from "@/lib/api";

function StatusBadge({ status }: { status?: string }) {
  const s = (status || "").toUpperCase();
  switch (s) {
    case "OPEN":
      return <Badge className="bg-blue-100 text-blue-800">Mở</Badge>;
    case "ASSIGNED":
      return <Badge className="bg-indigo-100 text-indigo-800">Đã giao</Badge>;
    case "IN_PROGRESS":
      return <Badge className="bg-orange-100 text-orange-800">Đang xử lý</Badge>;
    case "COMPLETED":
      return <Badge className="bg-green-100 text-green-800">Hoàn thành</Badge>;
    case "CANCELLED":
      return <Badge className="bg-red-100 text-red-800">Đã hủy</Badge>;
    default:
      return <Badge className="bg-gray-100 text-gray-800">{status || "-"}</Badge>;
  }
}

export default function StaffSupportRequestsPage() {
  const user = getCurrentUser();
  const roleNames = useMemo(() => getRoleNames(user), [user]);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ServiceRequest[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  async function load() {
    if (!user) return;
    setLoading(true);
    try {
      const requests = await supportRequestsApi.getAssignedTo(user.id);
      const list = Array.isArray(requests) ? requests : [];
      // Thêm lớp bảo vệ FE: chỉ giữ các yêu cầu có assignedTo.id === user.id
      const onlyMine = list.filter((item) => {
        const assigneeId = (item as any)?.assignedTo?.id;
        return typeof assigneeId === 'number' ? assigneeId === user.id : true;
      });
      setData(onlyMine);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return data.filter((item) => {
      const q = search.toLowerCase();
      const matches =
        (item.user?.username || "").toLowerCase().includes(q) ||
        (item.description || "").toLowerCase().includes(q) ||
        (item.category?.categoryName || "").toLowerCase().includes(q);
      const statusOk = statusFilter === "all" || (item.status || "").toUpperCase() === statusFilter;
      return matches && statusOk;
    });
  }, [data, search, statusFilter]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
          <div>
            <h1 className="text-2xl font-bold">Yêu cầu hỗ trợ</h1>
            <p className="text-sm text-muted-foreground">Khu vực nhân viên xử lý yêu cầu cư dân</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Làm mới
            </Button>
          </div>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">Chỉ hiển thị các yêu cầu đã được gán cho bạn.</div>

        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input placeholder="Tìm kiếm theo cư dân, mô tả, danh mục..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Trạng thái</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">Tất cả</option>
                  <option value="OPEN">Mở</option>
                  <option value="ASSIGNED">Đã giao</option>
                  <option value="IN_PROGRESS">Đang xử lý</option>
                  <option value="COMPLETED">Hoàn thành</option>
                  <option value="CANCELLED">Đã hủy</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Danh sách yêu cầu ({filtered.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-10 text-center text-sm text-muted-foreground">Đang tải...</div>
            ) : filtered.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">Không có dữ liệu</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cư dân</TableHead>
                      <TableHead>Danh mục</TableHead>
                      <TableHead>Mô tả</TableHead>
                      <TableHead>Ưu tiên</TableHead>
                      <TableHead>Liên hệ</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead>Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.user?.username || "-"}</TableCell>
                        <TableCell>{item.category?.categoryName || item.category?.categoryCode || "-"}</TableCell>
                        <TableCell className="max-w-xs truncate">{item.description || "-"}</TableCell>
                        <TableCell>{item.priority || "-"}</TableCell>
                        <TableCell>{(item as any).userPhone || item.user?.phoneNumber || "-"}</TableCell>
                        <TableCell><StatusBadge status={item.status} /></TableCell>
                        <TableCell>{item.submittedAt ? new Date(item.submittedAt).toLocaleString("vi-VN") : "-"}</TableCell>
                        <TableCell>
                          <Link href={`/staff-dashboard/support-requests/${item.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
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
    </div>
  );
}


