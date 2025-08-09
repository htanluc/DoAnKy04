"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/admin/AdminLayout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { API_BASE_URL } from "@/lib/auth";
import { fetchRoles } from "@/lib/auth";

export default function CreateUserPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "",
  });
  const [roles, setRoles] = useState<{ value: string; label: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesError, setRolesError] = useState("");

  useEffect(() => {
    setRolesLoading(true);
    fetchRoles()
      .then((data) => {
        // Lọc bỏ ADMIN và RESIDENT, map sang label tiếng Việt
        const roleMap: Record<string, string> = {
          STAFF: "Nhân viên",
          TECHNICIAN: "Kỹ thuật viên",
          CLEANER: "Nhân viên vệ sinh",
          SECURITY: "Bảo vệ"
        };
        const filtered = data.filter((r) => r.name !== "ADMIN" && r.name !== "RESIDENT");
        setRoles(filtered.map((r) => ({ value: r.name, label: roleMap[r.name] || r.name })));
        setForm((f) => ({ ...f, role: filtered[0]?.name || "" }));
        setRolesError("");
      })
      .catch(() => setRolesError("Không lấy được danh sách vai trò!"))
      .finally(() => setRolesLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
        method: "POST",
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          phoneNumber: form.phoneNumber,
          password: form.password,
          roles: [form.role],
        }),
      });
      if (!res.ok) throw new Error("Tạo user thất bại");
      toast({ title: "Thành công", description: "Tạo user mới thành công!" });
      router.push("/admin-dashboard/users");
    } catch (err: any) {
      toast({ title: "Lỗi", description: err.message || "Tạo user thất bại!", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title="Tạo người dùng mới">
      <div className="max-w-lg mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Tạo người dùng mới</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="block mb-1 font-medium">Tên đăng nhập</label>
                <Input name="username" value={form.username} onChange={handleChange} required />
              </div>
              <div>
                <label className="block mb-1 font-medium">Email</label>
                <Input name="email" type="email" value={form.email} onChange={handleChange} required />
              </div>
              <div>
                <label className="block mb-1 font-medium">Số điện thoại</label>
                <Input name="phoneNumber" value={form.phoneNumber} onChange={handleChange} required />
              </div>
              <div>
                <label className="block mb-1 font-medium">Mật khẩu</label>
                <Input name="password" type="password" value={form.password} onChange={handleChange} required />
              </div>
              <div>
                <label className="block mb-1 font-medium" htmlFor="role-select">Vai trò</label>
                <select
                  id="role-select"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  disabled={rolesLoading || !!rolesError}
                  required
                  title="Chọn vai trò"
                  aria-label="Chọn vai trò"
                >
                  {roles.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                {rolesLoading && <div className="text-xs text-gray-500 mt-1">Đang tải vai trò...</div>}
                {rolesError && <div className="text-xs text-red-500 mt-1">{rolesError}</div>}
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                  Hủy
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Đang tạo..." : "Tạo mới"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
} 