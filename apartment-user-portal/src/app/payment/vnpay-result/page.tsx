"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function VNPayResultPage() {
  const params = useSearchParams();
  const [status, setStatus] = useState<"pending" | "success" | "failed">("pending");
  const [message, setMessage] = useState("Đang kiểm tra trạng thái giao dịch...");

  useEffect(() => {
    // VNPay sẽ redirect về với các query params, trong đó có vnp_TxnRef (transactionId)
    const transactionId = params.get("vnp_TxnRef");
    if (!transactionId) {
      setStatus("failed");
      setMessage("Không tìm thấy mã giao dịch!");
      return;
    }
    fetch(`http://localhost:8080/api/payments/gateway/status/${transactionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "SUCCESS") {
          setStatus("success");
          setMessage("Thanh toán thành công!");
        } else if (data.status === "PENDING") {
          setStatus("pending");
          setMessage("Giao dịch đang chờ xử lý...");
        } else {
          setStatus("failed");
          setMessage("Thanh toán thất bại!");
        }
      })
      .catch(() => {
        setStatus("failed");
        setMessage("Không kiểm tra được trạng thái giao dịch!");
      });
  }, [params]);

  return (
    <div style={{ textAlign: "center", marginTop: 40 }}>
      <h2>Kết quả thanh toán VNPay</h2>
      <p>{message}</p>
      {status === "success" && <span style={{ color: "green" }}>✔</span>}
      {status === "failed" && <span style={{ color: "red" }}>✖</span>}
    </div>
  );
} 