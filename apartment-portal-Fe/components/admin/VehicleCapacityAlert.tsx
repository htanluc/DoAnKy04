"use client";

import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Car, Bike, Truck, Van, Zap, Bicycle, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import { VehicleCapacityConfig } from '@/lib/api';

interface VehicleCapacityAlertProps {
  config: VehicleCapacityConfig;
  vehicleType: string;
  showDetails?: boolean;
}

const VEHICLE_TYPE_ICONS = {
  'car': Car,
  'ô tô': Car,
  'motorcycle': Bike,
  'xe máy': Bike,
  'truck': Truck,
  'xe tải': Truck,
  'van': Van,
  'xe van': Van,
  'electric': Zap,
  'xe điện': Zap,
  'bicycle': Bicycle,
  'xe đạp': Bicycle,
};

export default function VehicleCapacityAlert({ config, vehicleType, showDetails = false }: VehicleCapacityAlertProps) {
  const getVehicleTypeIcon = (type: string) => {
    const normalizedType = type.toLowerCase();
    for (const [key, Icon] of Object.entries(VEHICLE_TYPE_ICONS)) {
      if (normalizedType.includes(key)) {
        return <Icon className="h-4 w-4" />;
      }
    }
    return <Car className="h-4 w-4" />;
  };

  const getVehicleTypeKey = (type: string): string => {
    const normalizedType = type.toLowerCase();
    if (normalizedType.includes('car') || normalizedType.includes('ô tô')) return 'cars';
    if (normalizedType.includes('motorcycle') || normalizedType.includes('xe máy')) return 'motorcycles';
    if (normalizedType.includes('truck') || normalizedType.includes('xe tải')) return 'trucks';
    if (normalizedType.includes('van') || normalizedType.includes('xe van')) return 'vans';
    if (normalizedType.includes('electric') || normalizedType.includes('xe điện')) return 'electricVehicles';
    if (normalizedType.includes('bicycle') || normalizedType.includes('xe đạp')) return 'bicycles';
    return '';
  };

  const getCapacityInfo = () => {
    const typeKey = getVehicleTypeKey(vehicleType);
    if (!typeKey) return null;

    const maxKey = `max${typeKey.charAt(0).toUpperCase() + typeKey.slice(1)}` as keyof VehicleCapacityConfig;
    const currentKey = `current${typeKey.charAt(0).toUpperCase() + typeKey.slice(1)}` as keyof VehicleCapacityConfig;
    
    const max = config[maxKey] as number || 0;
    const current = config[currentKey] as number || 0;
    const remaining = Math.max(0, max - current);
    
    return { max, current, remaining };
  };

  const capacityInfo = getCapacityInfo();
  if (!capacityInfo) return null;

  const { max, current, remaining } = capacityInfo;
  const isFull = max > 0 && current >= max;
  const isWarning = max > 0 && current >= max * 0.8 && current < max;
  const isAvailable = max === 0 || current < max;

  if (!config.isActive) {
    return (
      <Alert className="border-blue-200 bg-blue-50">
        <CheckCircle className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Giới hạn xe đã tắt</AlertTitle>
        <AlertDescription className="text-blue-700">
          Cấu hình giới hạn xe cho tòa nhà này đã bị tắt. Bạn có thể đăng ký xe mà không bị giới hạn.
        </AlertDescription>
      </Alert>
    );
  }

  if (max === 0) {
    return (
      <Alert className="border-gray-200 bg-gray-50">
        <XCircle className="h-4 w-4 text-gray-600" />
        <AlertTitle className="text-gray-800">Loại xe không được hỗ trợ</AlertTitle>
        <AlertDescription className="text-gray-700">
          Tòa nhà này không hỗ trợ đăng ký {vehicleType.toLowerCase()}.
        </AlertDescription>
      </Alert>
    );
  }

  if (isFull) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-800">Đã đạt giới hạn xe</AlertTitle>
        <AlertDescription className="text-red-700">
          <div className="flex items-center gap-2 mb-2">
            {getVehicleTypeIcon(vehicleType)}
            <span className="font-medium">{vehicleType}</span>
          </div>
          <p>Tòa nhà này đã đạt giới hạn tối đa {max} xe {vehicleType.toLowerCase()}.</p>
          {showDetails && (
            <div className="mt-2 text-sm">
              <p>Hiện tại: <Badge variant="destructive">{current}</Badge></p>
              <p>Tối đa: <Badge variant="outline">{max}</Badge></p>
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (isWarning) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800">Gần đạt giới hạn xe</AlertTitle>
        <AlertDescription className="text-yellow-700">
          <div className="flex items-center gap-2 mb-2">
            {getVehicleTypeIcon(vehicleType)}
            <span className="font-medium">{vehicleType}</span>
          </div>
          <p>Chỉ còn {remaining} chỗ trống cho {vehicleType.toLowerCase()}.</p>
          {showDetails && (
            <div className="mt-2 text-sm">
              <p>Hiện tại: <Badge variant="secondary">{current}</Badge></p>
              <p>Tối đa: <Badge variant="outline">{max}</Badge></p>
              <p>Còn lại: <Badge variant="default">{remaining}</Badge></p>
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (isAvailable) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Có thể đăng ký xe</AlertTitle>
        <AlertDescription className="text-green-700">
          <div className="flex items-center gap-2 mb-2">
            {getVehicleTypeIcon(vehicleType)}
            <span className="font-medium">{vehicleType}</span>
          </div>
          <p>Bạn có thể đăng ký {vehicleType.toLowerCase()}. Còn {remaining} chỗ trống.</p>
          {showDetails && (
            <div className="mt-2 text-sm">
              <p>Hiện tại: <Badge variant="secondary">{current}</Badge></p>
              <p>Tối đa: <Badge variant="outline">{max}</Badge></p>
              <p>Còn lại: <Badge variant="default">{remaining}</Badge></p>
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return null;
}
