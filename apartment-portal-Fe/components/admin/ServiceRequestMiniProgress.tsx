"use client";

import React from "react";

interface MiniProgressProps {
  status?: string;
  className?: string;
}

// Hiển thị tiến trình thu gọn: 4 chấm nhỏ và mũi tên giữa các bước
// Bước: Nhận → Giao → Xử lý → Xong. Hỗ trợ CANCELLED.
export default function ServiceRequestMiniProgress({ status, className = "" }: MiniProgressProps) {
  const normalizeStatus = (raw?: string) => {
    const s = raw?.trim().toUpperCase().replace(" ", "_") || "";
    if (s === "OPEN" || s === "PENDING") return "RECEIVED";
    return s;
  };
  const s = normalizeStatus(status);

  let step = 1;
  if (s === "CANCELLED") step = 1;
  else if (s === "ASSIGNED" || s === "IN_PROGRESS" || s === "COMPLETED") step = 2;
  if (s === "IN_PROGRESS" || s === "COMPLETED") step = 3;
  if (s === "COMPLETED") step = 4;

  const steps = [1, 2, 3, 4];

  const getDotClass = (i: number) => {
    if (s === "CANCELLED") return "bg-red-500";
    if (i < step) return "bg-green-500";
    if (i === step) return "bg-blue-500";
    return "bg-gray-300";
  };

  const getArrowClass = (i: number) => {
    if (s === "CANCELLED") return "text-red-400";
    if (i < step) return "text-green-500";
    if (i === step) return "text-blue-500";
    return "text-gray-300";
  };

  return (
    <div className={`flex items-center gap-1 ${className}`} aria-label="mini-progress">
      {steps.map((i) => (
        <React.Fragment key={i}>
          <div className={`w-2.5 h-2.5 rounded-full ${getDotClass(i)}`} />
          {i < 4 && (
            <svg className={`w-3 h-3 ${getArrowClass(i)}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path d="M7 5l5 5-5 5V5z" />
            </svg>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}



