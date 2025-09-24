"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useLanguage } from '@/lib/i18n';
import { Vehicle } from '@/lib/api';

interface CapacityWarningCardProps {
  vehicles: Vehicle[];
  canApproveVehicle: (vehicle: Vehicle) => boolean;
}

export default function CapacityWarningCard({
  vehicles,
  canApproveVehicle
}: CapacityWarningCardProps) {
  const { t } = useLanguage();
  const hasUnapprovableVehicles = vehicles.some(vehicle => !canApproveVehicle(vehicle));

  if (!hasUnapprovableVehicles) {
    return null;
  }

  return (
    <Card className="border-red-200 bg-red-50">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 text-red-700">
          <div className="text-lg">⚠️</div>
          <div>
            <div className="font-medium">{t('admin.vehicleRegistrations.capacityWarning.title', 'Cảnh báo: Một số xe không thể duyệt')}</div>
            <div className="text-sm text-red-600">
              {t('admin.vehicleRegistrations.capacityWarning.description', 'Các xe này đã đạt giới hạn số lượng tối đa cho loại xe tương ứng trong tòa nhà')}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
