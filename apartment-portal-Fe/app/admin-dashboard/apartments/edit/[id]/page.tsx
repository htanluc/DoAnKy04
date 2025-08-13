"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { API_BASE_URL } from "@/lib/auth";
import { ArrowLeft, Save } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

const STATUS_OPTIONS = [
  { value: "AVAILABLE", label: "Còn trống" },
  { value: "OCCUPIED", label: "Đã có người" },
  { value: "MAINTENANCE", label: "Bảo trì" },
  { value: "INACTIVE", label: "Không hoạt động" },
];

export default function EditApartmentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    unitNumber: "",
    buildingId: "",
    floorNumber: "",
    area: "",
    status: "AVAILABLE",
  });
  const { t } = useLanguage();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`${API_BASE_URL}/api/apartments/${id}`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` },
    })
      .then(res => res.json())
      .then(data => {
        setForm({
          unitNumber: data.unitNumber || "",
          buildingId: data.buildingId?.toString() || "",
          floorNumber: data.floorNumber?.toString() || "",
          area: data.area?.toString() || "",
          status: data.status || "AVAILABLE",
        });
        setError("");
      })
      .catch(() => setError("Không thể tải dữ liệu căn hộ"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    const res = await fetch(`${API_BASE_URL}/api/apartments/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({
        unitNumber: form.unitNumber,
        buildingId: Number(form.buildingId),
        floorNumber: Number(form.floorNumber),
        area: Number(form.area),
        status: form.status,
      }),
    });
    if (res.ok) {
      setSuccess("Cập nhật thành công!");
      setTimeout(() => router.push("/admin-dashboard/apartments"), 1200);
    } else {
      setError("Cập nhật thất bại!");
    }
    setSaving(false);
  };

  return (
    <div className="max-w-lg mx-auto mt-8 bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold mb-4">{t('admin.apartment.edit.title', 'Chỉnh sửa căn hộ')}</h1>
      {loading ? (
        <div>{t('admin.apartment.edit.loading', 'Đang tải dữ liệu...')}</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">{t('admin.apartment.edit.unitNumber', 'Mã căn hộ')}</label>
            <Input name="unitNumber" value={form.unitNumber} onChange={handleChange} required />
          </div>
          <div>
            <label className="block font-medium mb-1">{t('admin.apartment.edit.buildingId', 'Tòa')}</label>
            <Input name="buildingId" value={form.buildingId} onChange={handleChange} required />
          </div>
          <div>
            <label className="block font-medium mb-1">{t('admin.apartment.edit.floorNumber', 'Tầng')}</label>
            <Input name="floorNumber" value={form.floorNumber} onChange={handleChange} required />
          </div>
          <div>
            <label className="block font-medium mb-1">{t('admin.apartment.edit.area', 'Diện tích (m²)')}</label>
            <Input name="area" value={form.area} onChange={handleChange} required />
          </div>
          <div>
            <label className="block font-medium mb-1">{t('admin.apartment.edit.status', 'Trạng thái')}</label>
            <select name="status" value={form.status} onChange={handleChange} className="border rounded px-2 py-1 w-full">
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <div className="flex gap-2 mt-4">
            <Button type="submit" disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? t('admin.action.saving', 'Đang lưu...') : t('admin.action.save', 'Lưu')}
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('admin.action.back', 'Quay lại')}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
} 