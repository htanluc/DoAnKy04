import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { isAdmin, getToken, API_BASE_URL } from "@/lib/auth";

interface Resident {
  id: string | number;
  fullName: string;
  phoneNumber: string;
  email?: string;
  relationType?: string;
  moveInDate?: string;
}

interface User {
  id: string | number;
  username: string;
  phoneNumber: string;
  email?: string;
}

interface ApartmentResidentManagerProps {
  apartmentId: number;
}

const RELATION_TYPES = [
  { value: "OWNER", label: "Chủ hộ" },
  { value: "TENANT", label: "Người thuê" },
  { value: "FAMILY", label: "Thành viên gia đình" },
];

export default function ApartmentResidentManager({ apartmentId }: ApartmentResidentManagerProps) {
  const [open, setOpen] = useState(false);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [allResidents, setAllResidents] = useState<Resident[]>([]);
  const [selectedResidentId, setSelectedResidentId] = useState<string | number>("");
  const [relationType, setRelationType] = useState("OWNER");
  const [moveInDate, setMoveInDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Lấy danh sách resident đã liên kết với căn hộ
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`${API_BASE_URL}/api/apartments/${apartmentId}/residents`, {
      headers: { "Authorization": `Bearer ${getToken()}` },
    })
      .then((res) => res.json())
      .then((data) => setResidents(Array.isArray(data) ? data : data.data || []))
      .catch(() => setResidents([]))
      .finally(() => setLoading(false));
  }, [apartmentId, open, success]);

  // Lấy toàn bộ resident để chọn liên kết
  useEffect(() => {
    if (!open) return;
    fetch(`${API_BASE_URL}/api/admin/residents`, {
      headers: { "Authorization": `Bearer ${getToken()}` },
    })
      .then((res) => res.json())
      .then((data) => setAllResidents(Array.isArray(data) ? data : data.data || []))
      .catch(() => setAllResidents([]));
  }, [open]);

  // Liên kết resident với căn hộ
  const handleLink = async () => {
    setError("");
    setSuccess("");
    if (!selectedResidentId) {
      setError("Vui lòng chọn cư dân");
      return;
    }
    setLoading(true);
    const res = await fetch(`${API_BASE_URL}/api/apartments/${apartmentId}/residents`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`,
      },
      body: JSON.stringify({
        residentId: selectedResidentId,
        relationType,
        ...(moveInDate ? { moveInDate } : {}),
      }),
    });
    const data = await res.json();
    if (data.success) {
      setSuccess(data.message || "Liên kết thành công!");
      setSelectedResidentId("");
      setRelationType("OWNER");
      setMoveInDate("");
    } else {
      setError(data.message || "Có lỗi xảy ra");
    }
    setLoading(false);
  };

  // Hủy liên kết resident với căn hộ
  const handleUnlink = async (residentId: string | number) => {
    setError("");
    setSuccess("");
    setLoading(true);
    const res = await fetch(`${API_BASE_URL}/api/apartments/${apartmentId}/residents`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ residentId }),
    });
    const data = await res.json();
    if (data.success) {
      setSuccess(data.message || "Hủy liên kết thành công!");
    } else {
      setError(data.message || "Có lỗi xảy ra");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isAdmin() && (
          <Button variant="outline" size="sm">Quản lý cư dân</Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quản lý cư dân căn hộ</DialogTitle>
          <DialogDescription>
            Xem, liên kết hoặc hủy liên kết cư dân với căn hộ này.
          </DialogDescription>
        </DialogHeader>
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        {success && <div className="text-green-600 text-sm mb-2">{success}</div>}
        <div className="mb-4">
          <div className="font-semibold mb-2">Danh sách cư dân đã liên kết:</div>
          <div className="max-h-40 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>SĐT</TableHead>
                  <TableHead>Loại quan hệ</TableHead>
                  <TableHead>Ngày chuyển vào</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {residents.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center">Chưa có cư dân liên kết</TableCell></TableRow>
                ) : (
                  residents.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>{r.fullName}</TableCell>
                      <TableCell>{r.phoneNumber}</TableCell>
                      <TableCell>{r.relationType}</TableCell>
                      <TableCell>{r.moveInDate || "-"}</TableCell>
                      <TableCell>
                        {isAdmin() && (
                          <Button variant="destructive" size="sm" onClick={() => handleUnlink(r.id)} disabled={loading}>
                            Hủy liên kết
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        {isAdmin() && (
          <div className="border-t pt-4 mt-4">
            <div className="font-semibold mb-2">Liên kết cư dân mới:</div>
            <div className="flex flex-col gap-2">
              <select
                className="border rounded px-2 py-1"
                value={selectedResidentId}
                onChange={e => setSelectedResidentId(e.target.value)}
                aria-label="Chọn cư dân"
              >
                <option value="">-- Chọn cư dân --</option>
                {allResidents.map(r => (
                  <option key={r.id} value={r.id}>{r.fullName} ({r.phoneNumber})</option>
                ))}
              </select>
              <select
                className="border rounded px-2 py-1"
                value={relationType}
                onChange={e => setRelationType(e.target.value)}
                aria-label="Chọn loại quan hệ"
              >
                {RELATION_TYPES.map(rt => (
                  <option key={rt.value} value={rt.value}>{rt.label}</option>
                ))}
              </select>
              <Input
                type="date"
                value={moveInDate}
                onChange={e => setMoveInDate(e.target.value)}
                placeholder="Ngày chuyển vào (tùy chọn)"
              />
              <Button onClick={handleLink} disabled={loading}>
                Liên kết cư dân
              </Button>
            </div>
          </div>
        )}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Đóng</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 