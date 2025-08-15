"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ServiceRequest, supportRequestsApi } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

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

export default function StaffSupportRequestDetailPage() {
  const { id } = useParams();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string>("OPEN");
  const [notes, setNotes] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ sender: string; content: string; timestamp: string }[]>([]);

  const requestId = useMemo(() => Number(id), [id]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const user = getCurrentUser();
        if (!user) {
          setForbidden(true);
          return;
        }
        const assigned = await supportRequestsApi.getAssignedTo(user.id);
        if (!mounted) return;
        const data = Array.isArray(assigned) ? assigned.find((x) => x.id === requestId) : null;
        if (!data) {
          setForbidden(true);
          return;
        }
        setRequest(data);
        setStatus((data.status || "OPEN").toUpperCase());
        setNotes(data.resolutionNotes || "");
      } finally {
        setLoading(false);
      }
    }
    if (!isNaN(requestId)) load();
    return () => {
      mounted = false;
    };
  }, [requestId]);

  // Simple STOMP-over-WebSocket chat scoped theo requestId
  useEffect(() => {
    if (!request) return;
    let client: any;
    let subscribed: any;
    (async () => {
      const SockJS = (await import('sockjs-client')).default;
      const { Client } = await import('@stomp/stompjs');
      const sock = new SockJS('http://localhost:8080/ws');
      client = new Client({
        webSocketFactory: () => sock as any,
        reconnectDelay: 5000,
      });
      client.onConnect = () => {
        subscribed = client.subscribe(`/topic/support-requests/${request.id}/chat`, (message: any) => {
          try {
            const body = JSON.parse(message.body);
            setChatMessages((prev) => [...prev, body]);
          } catch {}
        });
      };
      client.activate();
    })();
    return () => {
      try { subscribed?.unsubscribe(); } catch {}
      try { client?.deactivate(); } catch {}
    };
  }, [request]);

  async function sendChat() {
    if (!request || !chatInput.trim()) return;
    const { Client } = await import('@stomp/stompjs');
    // Quick one-off client for send (reuse would be better in real app)
    const SockJS = (await import('sockjs-client')).default;
    const sock = new SockJS('http://localhost:8080/ws');
    const client = new Client({ webSocketFactory: () => sock as any });
    client.onConnect = () => {
      const payload = {
        sender: 'STAFF',
        content: chatInput.trim(),
        timestamp: new Date().toISOString(),
      };
      client.publish({ destination: `/app/support-requests/${request.id}/chat`, body: JSON.stringify(payload) });
      setChatInput("");
      client.deactivate();
    };
    client.activate();
  }

  async function updateStatus() {
    if (!request) return;
    setSaving(true);
    try {
      await supportRequestsApi.updateStatus(request.id, {
        status,
        resolutionNotes: notes?.trim() ? notes.trim() : undefined,
        isCompleted: status === "COMPLETED",
      });
      setRequest((prev) => prev ? { ...prev, status, resolutionNotes: notes } : prev);
      alert("Cập nhật trạng thái thành công!");
    } catch (e) {
      alert("Cập nhật trạng thái thất bại");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (forbidden) return <div className="p-6 text-red-600">Bạn không có quyền truy cập yêu cầu này.</div>;
  if (!request) return <div className="p-6 text-red-600">Không tìm thấy yêu cầu</div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-3xl">
        <Card>
          <CardHeader>
            <CardTitle>Yêu cầu #{request.id}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div><b>Cư dân:</b> {request.user?.username || "-"}</div>
            <div><b>Danh mục:</b> {request.category?.categoryName || request.category?.categoryCode || "-"}</div>
            <div><b>Mô tả:</b> {request.description || "-"}</div>
            <div><b>Ưu tiên:</b> {String(request.priority || "-")}</div>
            <div className="flex items-center gap-2"><b>Trạng thái:</b> <StatusBadge status={request.status} /></div>
            <div><b>Ngày tạo:</b> {request.submittedAt ? new Date(request.submittedAt).toLocaleString("vi-VN") : "-"}</div>
            {request.completedAt && <div><b>Hoàn thành:</b> {new Date(request.completedAt).toLocaleString("vi-VN")}</div>}

            <div className="mt-4 p-4 border rounded bg-gray-50 space-y-3">
              <div className="font-semibold">Cập nhật trạng thái</div>
              <div className="flex items-center gap-2">
                <select className="border rounded px-2 py-1" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="OPEN">Mở</option>
                  <option value="IN_PROGRESS">Đang xử lý</option>
                  <option value="COMPLETED">Hoàn thành</option>
                  <option value="CANCELLED">Hủy</option>
                </select>
                <Button onClick={updateStatus} disabled={saving}>Lưu</Button>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Ghi chú xử lý (tuỳ chọn)</div>
                <textarea
                  className="w-full border rounded p-2 min-h-[100px]"
                  placeholder="Nhập ghi chú..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            {/* Chat theo yêu cầu */}
            <div className="mt-4 p-4 border rounded bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Trao đổi với cư dân</div>
                <button className="text-sm text-blue-600" onClick={() => setIsChatOpen(!isChatOpen)}>
                  {isChatOpen ? 'Ẩn chat' : 'Mở chat'}
                </button>
              </div>
              {isChatOpen && (
                <div className="mt-3 space-y-2">
                  <div className="h-56 overflow-y-auto border rounded p-2 bg-white">
                    {chatMessages.length === 0 ? (
                      <div className="text-sm text-muted-foreground text-center py-8">Chưa có tin nhắn</div>
                    ) : (
                      chatMessages.map((m, i) => (
                        <div key={i} className="text-sm">
                          <b>{m.sender}</b>: {m.content}
                          <span className="ml-2 text-xs text-muted-foreground">{new Date(m.timestamp).toLocaleTimeString('vi-VN')}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input className="flex-1 border rounded px-2 py-1" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Nhập tin nhắn..." />
                    <Button onClick={sendChat} disabled={!chatInput.trim()}>Gửi</Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


