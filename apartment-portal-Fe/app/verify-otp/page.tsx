"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/auth";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [emailOrPhone, setEmailOrPhone] = useState<string>("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  // Lấy emailOrPhone từ localStorage (ưu tiên), nếu không có thì báo lỗi
  useEffect(() => {
    let value = "";
    if (typeof window !== "undefined") {
      value = localStorage.getItem("emailOrPhone") || "";
      if (!value) {
        // Thử lấy từ sessionStorage
        value = sessionStorage.getItem("emailOrPhone") || "";
      }
      // Thử lấy từ URL nếu vẫn chưa có
      if (!value) {
        const params = new URLSearchParams(window.location.search);
        value = params.get("emailOrPhone") || "";
      }
    }
    setEmailOrPhone(value);
    if (!value) setError("Không tìm thấy thông tin số điện thoại hoặc email. Vui lòng đăng nhập lại.");
  }, []);

  // Đếm ngược gửi lại OTP
  useEffect(() => {
    if (resendCountdown > 0) {
      countdownRef.current = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    } else if (countdownRef.current) {
      clearTimeout(countdownRef.current);
    }
    return () => {
      if (countdownRef.current) clearTimeout(countdownRef.current);
    };
  }, [resendCountdown]);

  // Validate chỉ cho nhập số, đúng 6 ký tự
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 6) setOtp(value);
  };

  // Gửi xác thực OTP
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!otp || otp.length !== 6) {
      setError("Mã OTP phải gồm 6 số.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrPhone, otp }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(data.message || "Xác thực thành công!");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      } else {
        setError(data.message || "Mã OTP không đúng hoặc đã hết hạn");
      }
    } catch (err) {
      setError("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  // Gửi lại OTP
  const handleResend = async (e: React.MouseEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setResendLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrPhone }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(data.message || "Đã gửi lại mã OTP!");
        setResendCountdown(60);
      } else {
        setError(data.message || "Không thể gửi lại mã OTP, vui lòng thử lại sau");
      }
    } catch (err) {
      setError("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <h1 className="text-2xl font-bold mb-2">Xác thực OTP</h1>
      <p className="mb-2 text-center text-gray-700">
        Vui lòng nhập mã OTP đã gửi đến <span className="font-semibold text-blue-700">{emailOrPhone || 'email/số điện thoại của bạn'}</span>.
      </p>
      <form className="flex flex-col items-center w-full max-w-xs" onSubmit={handleSubmit}>
        <input
          type="text"
          maxLength={6}
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="Nhập mã OTP"
          className="mb-2 px-4 py-2 border rounded w-full text-center focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg tracking-widest"
          value={otp}
          onChange={handleOtpChange}
          disabled={loading || !emailOrPhone}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition w-full disabled:opacity-60 font-semibold text-base"
          disabled={loading || !emailOrPhone}
        >
          {loading ? "Đang xác thực..." : "Xác nhận"}
        </button>
      </form>
      <div className="h-6 mt-2 min-h-[1.5rem]">
        {error && <p className="text-red-600 text-sm text-center font-medium">{error}</p>}
        {success && <p className="text-green-600 text-sm text-center font-medium">{success}</p>}
      </div>
      <div className="mt-4 text-sm text-gray-700 flex flex-col items-center">
        {resendCountdown > 0 ? (
          <span>Gửi lại mã OTP sau <span className="font-semibold text-blue-700">{resendCountdown}</span> giây</span>
        ) : (
          <button
            onClick={handleResend}
            className="text-blue-600 font-semibold hover:underline disabled:opacity-60 border border-blue-600 rounded px-3 py-1 mt-1 transition"
            disabled={resendLoading || !emailOrPhone}
          >
            {resendLoading ? "Đang gửi lại..." : "Gửi lại mã OTP"}
          </button>
        )}
      </div>
    </div>
  );
} 