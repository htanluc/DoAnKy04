"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Lock } from 'lucide-react';
import { VehicleCapacityConfig } from '@/lib/api';

interface VehicleApprovalButtonProps {
  vehicleType: string;
  buildingId: number;
  config: VehicleCapacityConfig | null;
  onApprove: () => void;
  onReject: () => void;
  disabled?: boolean;
}

export default function VehicleApprovalButton({
  vehicleType,
  buildingId,
  config,
  onApprove,
  onReject,
  disabled = false
}: VehicleApprovalButtonProps) {
  if (!config || !config.isActive) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="flex items-center gap-1">
          <Lock className="h-3 w-3" />
          Không có cấu hình
        </Badge>
      </div>
    );
  }

  // Map vehicle type to config key
  const getVehicleConfig = (type: string) => {
    switch (type) {
      case 'CAR_4_SEATS':
      case 'CAR_7_SEATS':
      case 'ELECTRIC_CAR':
        return {
          max: config.maxCars,
          current: config.currentCars || 0,
          remaining: config.remainingCars || 0,
          label: 'Ô tô'
        };
      case 'MOTORCYCLE':
      case 'ELECTRIC_MOTORCYCLE':
        return {
          max: config.maxMotorcycles,
          current: config.currentMotorcycles || 0,
          remaining: config.remainingMotorcycles || 0,
          label: 'Xe máy'
        };
      default:
        return {
          max: 0,
          current: 0,
          remaining: 0,
          label: 'Không hỗ trợ'
        };
    }
  };

  const vehicleConfig = getVehicleConfig(vehicleType);
  const isFull = vehicleConfig.current >= vehicleConfig.max;
  const isNearFull = vehicleConfig.current >= vehicleConfig.max * 0.8;
  const canApprove = !isFull && !disabled;

  const getStatusInfo = () => {
    if (vehicleConfig.max === 0) {
      return {
        status: 'disabled',
        label: 'Không hỗ trợ',
        color: 'bg-gray-100 text-gray-600',
        icon: Lock
      };
    }
    if (isFull) {
      return {
        status: 'full',
        label: 'Đã đầy',
        color: 'bg-red-100 text-red-800',
        icon: XCircle
      };
    }
    if (isNearFull) {
      return {
        status: 'warning',
        label: 'Gần đầy',
        color: 'bg-yellow-100 text-yellow-800',
        icon: AlertTriangle
      };
    }
    return {
      status: 'available',
      label: 'Còn chỗ',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle
    };
  };

  const statusInfo = getStatusInfo();
  const Icon = statusInfo.icon;

  return (
    <div className="space-y-2">
      {/* Status Badge */}
      <div className="flex items-center gap-2">
        <Badge className={statusInfo.color}>
          <Icon className="h-3 w-3 mr-1" />
          {statusInfo.label}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {vehicleConfig.current}/{vehicleConfig.max} xe
        </span>
      </div>

      {/* Capacity Info */}
      <div className="text-xs text-muted-foreground">
        <div>Còn lại: {vehicleConfig.remaining} chỗ</div>
        <div>Loại: {vehicleConfig.label}</div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={onApprove}
          disabled={!canApprove}
          size="sm"
          className="flex-1"
          variant={canApprove ? "default" : "secondary"}
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          Duyệt
        </Button>
        <Button
          onClick={onReject}
          disabled={disabled}
          size="sm"
          variant="outline"
          className="flex-1"
        >
          <XCircle className="h-4 w-4 mr-1" />
          Từ chối
        </Button>
      </div>

      {/* Warning Message */}
      {isFull && (
        <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
          ⚠️ Không thể duyệt thêm xe {vehicleConfig.label} - Đã đạt giới hạn tối đa
        </div>
      )}
      {isNearFull && !isFull && (
        <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
          ⚠️ Còn {vehicleConfig.remaining} chỗ cho xe {vehicleConfig.label} - Gần đạt giới hạn
        </div>
      )}
    </div>
  );
}
