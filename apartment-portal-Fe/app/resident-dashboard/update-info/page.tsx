"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UpdateResidentInfoPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    idCardNumber: "",
    dateOfBirth: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.idCardNumber || !form.dateOfBirth) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      // Gọi API cập nhật thông tin cư dân ở đây
      // Giả lập thành công:
      const userRaw = localStorage.getItem("user");
      if (userRaw) {
        const user = JSON.parse(userRaw);
        user.requireResidentInfo = false;
        localStorage.setItem("user", JSON.stringify(user));
      }
      router.push("/resident-dashboard");
    } catch (err) {
      setError("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-center">Cập nhật thông tin cư dân</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <div className="space-y-2">
              <Label htmlFor="fullName">Họ và tên</Label>
              <Input id="fullName" name="fullName" value={form.fullName} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="idCardNumber">Số CMND/CCCD</Label>
              <Input id="idCardNumber" name="idCardNumber" value={form.idCardNumber} onChange={handleChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Ngày sinh</Label>
              <Input id="dateOfBirth" name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange} required />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Đang lưu..." : "Cập nhật"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 