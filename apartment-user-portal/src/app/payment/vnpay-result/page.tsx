"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function VNPayResultPage() {
  const params = useSearchParams();
  const [message, setMessage] = useState("Đang chuyển đến trang xác nhận thanh toán...");

  useEffect(() => {
    // Chuyển hướng trực tiếp sang BE để hiển thị HTML và auto-redirect về dashboard sau 3s
    const search = params.toString();
    if (!search) {
      setMessage("Thiếu tham số thanh toán!");
      return;
    }
    const target = `http://localhost:8080/api/payments/vnpay/return?${search}`;
    // Điều hướng toàn trang để tránh CORS và nhận đúng HTML từ backend
    window.location.replace(target);
  }, [params]);

  return (
    <div style={{ textAlign: "center", marginTop: 40 }}>
      <h2>Kết quả thanh toán VNPay</h2>
      <p>{message}</p>
      <p>Nếu không được chuyển tự động, vui lòng bấm vào liên kết dưới:</p>
      <a
        href={`http://localhost:8080/api/payments/vnpay/return?${params.toString()}`}
        style={{ color: "#2563eb", textDecoration: "underline" }}
      >
        Mở trang xác nhận thanh toán
      </a>
    </div>
  );
} 