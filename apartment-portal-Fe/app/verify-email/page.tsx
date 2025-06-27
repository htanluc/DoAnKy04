"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/auth";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token xác thực không hợp lệ.");
      return;
    }
    fetch(`${API_BASE_URL}/api/auth/verify-email?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStatus("success");
          setMessage(data.message || "Kích hoạt tài khoản thành công!");
        } else {
          setStatus("error");
          setMessage(data.message || "Token xác thực không hợp lệ hoặc đã hết hạn");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Đã xảy ra lỗi. Vui lòng thử lại sau.");
      });
  }, [token]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      {status === "loading" && <p>Đang xác thực tài khoản...</p>}
      {status === "success" && (
        <div className="text-green-600 font-semibold">{message}</div>
      )}
      {status === "error" && (
        <div className="text-red-600 font-semibold">{message}</div>
      )}
    </div>
  );
} 