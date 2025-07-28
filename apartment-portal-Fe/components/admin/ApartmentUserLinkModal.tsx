import React, { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { isAdmin, getToken, API_BASE_URL } from "@/lib/auth";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Eye } from 'lucide-react';

const RELATION_TYPES = [
  { value: "OWNER", label: "Chủ hộ" },
  { value: "TENANT", label: "Người thuê" },
  { value: "FAMILY", label: "Thành viên gia đình" },
];

interface ApartmentUserLinkModalProps {
  apartmentId: number;
}

interface LinkedUser {
  apartmentId: number;
  userId: number;
  relationType: string;
  moveInDate?: string;
  moveOutDate?: string;
  userDetail?: any;
}

export default function ApartmentUserLinkModal({ apartmentId }: ApartmentUserLinkModalProps) {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [user, setUser] = useState<any>(null);
  const [relationType, setRelationType] = useState("OWNER");
  const [moveInDate, setMoveInDate] = useState("");
  const [moveOutDate, setMoveOutDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [linkedUsers, setLinkedUsers] = useState<LinkedUser[]>([]);
  const [usersMap, setUsersMap] = useState<Record<number, any>>({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingUnlink, setPendingUnlink] = useState<number | null>(null);

  // Lấy danh sách user đã liên kết với căn hộ
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`${API_BASE_URL}/api/apartments/${apartmentId}/residents`, {
      headers: { "Authorization": `Bearer ${getToken()}` },
    })
      .then((res) => res.json())
      .then(async (data) => {
        const arr = Array.isArray(data) ? data : data.data || [];
        setLinkedUsers(arr);
        // Lấy chi tiết user cho từng userId
        const userIds = arr.map((u: any) => u.userId);
        if (userIds.length > 0) {
          const resUsers = await fetch(`${API_BASE_URL}/api/admin/users`, {
            headers: { "Authorization": `Bearer ${getToken()}` },
          });
          const allUsers = await resUsers.json();
          const map: Record<number, any> = {};
          userIds.forEach((id: number) => {
            const found = Array.isArray(allUsers) ? allUsers.find((u: any) => u.id === id) : null;
            if (found) map[id] = found;
          });
          setUsersMap(map);
        } else {
          setUsersMap({});
        }
      })
      .catch(() => setLinkedUsers([]))
      .finally(() => setLoading(false));
  }, [apartmentId, open, success]);

  // Tìm user theo số điện thoại
  const handleFindUser = async () => {
    setError("");
    setSuccess("");
    setUser(null);
    if (!phone) {
      setError("Vui lòng nhập số điện thoại");
      return;
    }
    setLoading(true);
    const res = await fetch(`${API_BASE_URL}/api/admin/users`, {
      headers: {
        "Authorization": `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
    });
    const users = await res.json();
    const found = Array.isArray(users) ? users.find((u) => u.phoneNumber === phone) : null;
    if (!found) {
      setError("Không tìm thấy tài khoản với số điện thoại này");
      setLoading(false);
      return;
    }
    setUser(found);
    setLoading(false);
  };

  // Liên kết user với căn hộ
  const handleLink = async () => {
    setError("");
    setSuccess("");
    if (!user?.id) {
      setError("Không tìm thấy userId");
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
        userId: user.id,
        relationType
      }),
    });
    const data = await res.json();
    if (data.success || res.status === 200) {
      setSuccess(data.message || "Liên kết thành công!");
      setPhone("");
      setUser(null);
      setRelationType("OWNER");
    } else {
      setError(data.message || "Có lỗi xảy ra");
    }
    setLoading(false);
  };

  // Hủy liên kết user với căn hộ
  const handleUnlink = async (userId: number) => {
    setError("");
    setSuccess("");
    setLoading(true);
    const res = await fetch(`${API_BASE_URL}/api/apartments/${apartmentId}/residents`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ userId }),
    });
    const data = await res.json();
    if (data.success || res.status === 200) {
      setSuccess(data.message || "Hủy liên kết thành công!");
    } else {
      setError(data.message || "Có lỗi xảy ra");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Liên kết tài khoản với căn hộ</DialogTitle>
          <DialogDescription>
            Nhập số điện thoại để tìm tài khoản và liên kết với căn hộ này.
          </DialogDescription>
        </DialogHeader>
        {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
        {success && <div className="text-green-600 text-sm mb-2">{success}</div>}
        {/* Form liên kết mới - Đặt lên đầu modal */}
        <div className="mb-6 border-b pb-4">
          <div className="font-semibold mb-2">Liên kết tài khoản mới:</div>
          <div className="flex flex-col gap-2">
            <Input
              placeholder="Nhập số điện thoại"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              disabled={loading}
            />
            <Button onClick={handleFindUser} disabled={loading || !phone}>
              Tìm tài khoản
            </Button>
            {user && (
              <div className="border rounded p-2 mb-2 bg-gray-50">
                <div><b>Tài khoản:</b> {user.username} ({user.phoneNumber})</div>
                <div><b>Email:</b> {user.email}</div>
              </div>
            )}
            {user && (
              <>
                <select
                  className="border rounded px-2 py-1"
                  value={relationType}
                  onChange={e => setRelationType(e.target.value)}
                >
                  {RELATION_TYPES.map(rt => (
                    <option key={rt.value} value={rt.value}>{rt.label}</option>
                  ))}
                </select>
                <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                  <AlertDialogTrigger asChild>
                    <Button onClick={() => setConfirmOpen(true)} disabled={loading}>
                      Liên kết tài khoản
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Xác nhận liên kết</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bạn có chắc chắn muốn liên kết tài khoản <b>{user.username}</b> ({user.phoneNumber}) với căn hộ này không?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Hủy</AlertDialogCancel>
                      <AlertDialogAction onClick={() => { setConfirmOpen(false); handleLink(); }}>Đồng ý</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>
        {/* Danh sách user đã liên kết */}
        <div className="mb-4">
          <div className="font-semibold mb-2">Danh sách tài khoản đã liên kết:</div>
          <div className="overflow-x-auto w-full">
            <table className="min-w-[400px] w-full text-sm border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-1 px-2 whitespace-nowrap">Tài khoản</th>
                  <th className="py-1 px-2 whitespace-nowrap">SĐT</th>
                  <th className="py-1 px-2 whitespace-nowrap">Loại quan hệ</th>
                  <th className="py-1 px-2 whitespace-nowrap">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {linkedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-2 text-gray-500">Chưa có tài khoản liên kết</td>
                  </tr>
                ) : (
                  linkedUsers.map(u => (
                    <tr key={u.userId}>
                      <td className="py-1 px-2">{usersMap[u.userId]?.username || u.userId}</td>
                      <td className="py-1 px-2">{usersMap[u.userId]?.phoneNumber || ''}</td>
                      <td className="py-1 px-2">{u.relationType}</td>
                      <td className="py-1 px-2">
                        <AlertDialog open={pendingUnlink === u.userId} onOpenChange={open => !open && setPendingUnlink(null)}>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm" onClick={() => setPendingUnlink(u.userId)}>
                              Hủy liên kết
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xác nhận hủy liên kết</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bạn có chắc chắn muốn hủy liên kết tài khoản <b>{usersMap[u.userId]?.username || u.userId}</b> ({usersMap[u.userId]?.phoneNumber || ''}) với căn hộ này không?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction onClick={() => { setPendingUnlink(null); handleUnlink(u.userId); }}>Đồng ý</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Đóng</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 