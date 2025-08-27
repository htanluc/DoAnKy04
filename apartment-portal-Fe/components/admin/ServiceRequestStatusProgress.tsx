"use client";

import React from "react";
import { CheckCircle, Clock, User, Wrench, CheckSquare, Phone, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ServiceRequestStatusProgressProps {
  status: string;
  assignedTo?: string;
  assignedAt?: string;
  completedAt?: string;
  staffPhone?: string;
  className?: string;
}

/**
 * Hiển thị thanh tiến trình 4 bước cho Yêu cầu dịch vụ:
 * 1) Nhận Yêu Cầu -> 2) Đã giao -> 3) Đang xử lý -> 4) Hoàn thành
 * Hỗ trợ trạng thái: OPEN | ASSIGNED | IN_PROGRESS | COMPLETED | CANCELLED | PENDING
 */
export default function ServiceRequestStatusProgress({
  status,
  assignedTo,
  assignedAt,
  completedAt,
  staffPhone,
  className = "",
}: ServiceRequestStatusProgressProps) {
  const normalizeStatus = (raw?: string) => {
    const s = raw?.trim().toUpperCase().replace(" ", "_") || "";
    if (s === "OPEN" || s === "PENDING") return "RECEIVED"; // Bước 1
    return s;
  };

  const currentStatus = normalizeStatus(status);

  let currentStep = 1;
  let currentStepLabel = "Nhận Yêu Cầu";

  // Nếu đã gán nhân viên thì chuyển sang bước 2
  if (assignedTo) {
    currentStep = 2;
    currentStepLabel = "Đã giao";
  }

  if (currentStatus === "CANCELLED") {
    currentStep = 1;
    currentStepLabel = "Đã hủy";
  } else if (
    currentStatus === "ASSIGNED" ||
    currentStatus === "IN_PROGRESS" ||
    currentStatus === "COMPLETED"
  ) {
    currentStep = Math.max(currentStep, 2);
    currentStepLabel = "Đã giao";
  }

  if (currentStatus === "IN_PROGRESS" || currentStatus === "COMPLETED") {
    currentStep = Math.max(currentStep, 3);
    currentStepLabel = "Đang xử lý";
  }

  if (currentStatus === "COMPLETED") {
    currentStep = Math.max(currentStep, 4);
    currentStepLabel = "Hoàn thành";
  }

  const steps = [
    { id: 1, label: "Nhận Yêu Cầu", icon: <Clock className="h-5 w-5" />, description: "Yêu cầu đã được tiếp nhận" },
    {
      id: 2,
      label: "Đã giao",
      icon: <User className="h-5 w-5" />,
      description: assignedTo ? `Đã giao cho ${assignedTo}` : "Chờ gán nhân viên",
    },
    { id: 3, label: "Đang xử lý", icon: <Wrench className="h-5 w-5" />, description: "Nhân viên đang xử lý yêu cầu" },
    { id: 4, label: "Hoàn thành", icon: <CheckSquare className="h-5 w-5" />, description: "Yêu cầu đã hoàn thành" },
  ];

  const getStepCardClass = (active: boolean, completed: boolean, cancelled: boolean) => {
    if (cancelled) return "bg-red-50 border-red-200";
    if (completed) return "bg-green-50 border-green-200";
    if (active) return "bg-blue-50 border-blue-200";
    return "bg-gray-50 border-gray-200";
  };

  return (
    <div className={`rounded-xl border p-6 ${className}`} style={{background: 'linear-gradient(180deg,#ffffff, #f8fbff)'}}>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Theo dõi trạng thái xử lý</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge
              className={
                currentStatus === "COMPLETED"
                  ? "bg-green-100 text-green-800"
                  : currentStatus === "CANCELLED"
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
              }
            >
              Trạng thái hiện tại: {currentStepLabel}
            </Badge>
          </div>
          <div className="text-sm text-gray-500">Bước {currentStep}/4</div>
        </div>
      </div>

      <div className="relative mb-8">
        <div className="flex items-center justify-between gap-4">
          {steps.map((step, index) => {
            const isActive = step.id <= currentStep;
            const isCompleted = step.id < currentStep;
            const isCancelled = currentStatus === "CANCELLED";
            return (
              <div key={step.id} className="flex items-center flex-1 min-w-[160px]">
                <div className={`flex flex-col items-center justify-center w-40 h-40 rounded-xl border shadow-sm transition-all duration-300 ${getStepCardClass(isActive, isCompleted, isCancelled)}`}>
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ring-4 ring-offset-2 ${
                      isCancelled
                        ? "bg-red-500 text-white ring-red-100"
                        : isCompleted
                        ? "bg-green-500 text-white ring-green-100"
                        : isActive
                        ? "bg-blue-500 text-white ring-blue-100"
                        : "bg-gray-200 text-gray-400 ring-gray-100"
                    }`}
                  >
                    {isCancelled ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : isCompleted ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      step.icon
                    )}
                  </div>
                <div className="text-center px-2">
                  <div className={`text-sm font-medium ${isCancelled ? "text-red-900" : isActive ? "text-gray-900" : "text-gray-400"}`}>
                    {step.label}
                  </div>
                  <div className={`text-xs leading-4 ${isCancelled ? "text-red-600" : isActive ? "text-gray-600" : "text-gray-400"}`}>
                    {step.description}
                  </div>
                  {step.id === 2 && assignedTo && staffPhone && (
                    <div className="mt-1">
                      <div className="flex items-center justify-center space-x-1">
                        <Phone className="h-3 w-3 text-blue-600" />
                        <span className="text-xs text-blue-600 font-medium">{staffPhone}</span>
                      </div>
                    </div>
                  )}
                </div>
                {/* End of step card */}
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 flex items-center justify-center w-12">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shadow-sm ${
                      isCancelled ? "bg-red-100" : isCompleted ? "bg-green-100" : isActive ? "bg-blue-100" : "bg-gray-100"
                    }`}>
                      <ArrowRight
                        className={`h-4 w-4 ${
                          isCancelled ? "text-red-500" : isCompleted ? "text-green-600" : isActive ? "text-blue-600" : "text-gray-400"
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="absolute top-7 left-6 right-6 h-0.5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 -z-10">
          <div
            className={`h-full transition-all duration-500 ${currentStatus === "CANCELLED" ? "bg-red-500" : "bg-blue-500"}`}
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>

      {completedAt && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <h3 className="font-medium text-green-900">Hoàn thành</h3>
              <p className="text-sm text-green-700">Yêu cầu đã hoàn thành lúc: {new Date(completedAt).toLocaleString("vi-VN")}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


