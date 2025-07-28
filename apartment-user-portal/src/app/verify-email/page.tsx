"use client"

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Home, 
  Receipt, 
  Bell, 
  Calendar, 
  Coffee, 
  MessageSquare, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Clock,
  User
} from 'lucide-react'
import Link from 'next/link'
import { fetchCurrentUser } from '@/lib/api'
import { useSearchParams, useRouter } from "next/navigation";

interface DashboardStats {
  totalInvoices: number
  pendingInvoices: number
  overdueInvoices: number
  totalAmount: number
  unreadAnnouncements: number
  upcomingEvents: number
  activeBookings: number
  supportRequests: number
}

interface RecentActivity {
  id: string
  type: 'invoice' | 'announcement' | 'event' | 'booking' | 'payment'
  title: string
  description: string
  timestamp: string
  status?: string
}

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
  const [message, setMessage] = useState("");
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Thiếu mã xác thực.");
      return;
    }
    fetch(`http://localhost:8080/api/auth/verify-email?token=${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok && data.success) {
          setStatus("success");
          setMessage("Xác thực email thành công! Bạn có thể đăng nhập.");
        } else {
          setStatus("error");
          setMessage(data.message || "Xác thực thất bại hoặc link đã hết hạn.");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Không thể kết nối máy chủ.");
      });
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Xác thực email</h1>
        {status === "pending" && <p>Đang xác thực...</p>}
        {status === "success" && (
          <div>
            <p className="text-green-600 mb-4">{message}</p>
            <a href="/login" className="text-blue-600 underline">Đăng nhập</a>
          </div>
        )}
        {status === "error" && (
          <div>
            <p className="text-red-600 mb-4">{message}</p>
            <a href="/login" className="text-blue-600 underline">Quay lại đăng nhập</a>
          </div>
        )}
      </div>
    </div>
  );
} 