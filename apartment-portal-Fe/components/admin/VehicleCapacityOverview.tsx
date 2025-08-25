"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Car, Bike, Truck, Van, Zap, Bicycle, AlertTriangle, CheckCircle } from 'lucide-react';
import { VehicleCapacityConfig } from '@/lib/api';
import { useVehicleCapacity } from '@/hooks/use-vehicle-capacity';

interface VehicleCapacityOverviewProps {
  buildingId?: number;
  showAllBuildings?: boolean;
}

const VEHICLE_TYPES = [
  { key: 'maxCars', label: 'Ô tô (4-7 chỗ)', icon: Car, color: 'bg-blue-100 text-blue-800', apiType: 'CAR_4_SEATS' },
  { key: 'maxMotorcycles', label: 'Xe máy', icon: Bike, color: 'bg-green-100 text-green-800', apiType: 'MOTORCYCLE' },
];

export default function VehicleCapacityOverview({ buildingId, showAllBuildings = false }: VehicleCapacityOverviewProps) {
  const {
    configs,
    loading,
    error,
    loadConfigByBuilding,
  } = useVehicleCapacity();

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const [displayConfigs, setDisplayConfigs] = useState<VehicleCapacityConfig[]>([]);

  useEffect(() => {
    if (buildingId) {
      // Load specific building config
      loadConfigByBuilding(buildingId).then(config => {
        setDisplayConfigs(config ? [config] : []);
      });
    } else {
      // Use all configs from hook
      setDisplayConfigs(configs);
    }
  }, [buildingId, configs, loadConfigByBuilding]);



  const getCapacityStatus = (current: number, max: number) => {
    if (max === 0) return { status: 'disabled', label: 'Không hỗ trợ', color: 'bg-gray-100 text-gray-600' };
    if (current >= max) return { status: 'full', label: 'Đã đầy', color: 'bg-red-100 text-red-800' };
    if (current >= max * 0.8) return { status: 'warning', label: 'Gần đầy', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'available', label: 'Còn chỗ', color: 'bg-green-100 text-green-800' };
  };

  const getBuildingName = (buildingId: number) => {
    // Trong thực tế sẽ lấy từ API buildings
    return `Tòa ${buildingId}`;
  };

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="text-red-600 mb-4">Lỗi: {error}</div>
          <Button onClick={() => window.location.reload()}>
            Thử lại
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="text-gray-500">Đang tải thông tin giới hạn xe...</div>
        </CardContent>
      </Card>
    );
  }

  if (displayConfigs.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="text-gray-500">Chưa có cấu hình giới hạn xe</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {displayConfigs.map((config) => (
        <Card key={config.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Giới hạn xe - {getBuildingName(config.buildingId)}
            </CardTitle>
            <CardDescription>
              Tình trạng sức chứa xe hiện tại
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {VEHICLE_TYPES.map((type) => {
                const currentKey = type.key.replace('max', 'current') as keyof VehicleCapacityConfig;
                const maxValue = config[type.key as keyof VehicleCapacityConfig] as number;
                const currentValue = config[currentKey] as number || 0;
                const capacityStatus = getCapacityStatus(currentValue, maxValue);
                
                return (
                  <div key={type.key} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      {type.icon && <type.icon className="h-4 w-4" />}
                      <span className="font-medium">{type.label}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Hiện tại:</span>
                        <span className="font-semibold">{currentValue}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Tối đa:</span>
                        <span className="font-semibold">{maxValue}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Trạng thái:</span>
                        <Badge className={capacityStatus.color}>
                          {capacityStatus.label}
                        </Badge>
                      </div>
                      
                      {maxValue > 0 && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              capacityStatus.status === 'full' ? 'bg-red-500' :
                              capacityStatus.status === 'warning' ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`}
                            style={{ width: `${Math.min((currentValue / maxValue) * 100, 100)}%` }}
                          />
                        </div>
                      )}
                      
                      {capacityStatus.status === 'full' && (
                        <div className="flex items-center gap-1 text-red-600 text-xs">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Không thể đăng ký thêm</span>
                        </div>
                      )}
                      
                      {capacityStatus.status === 'warning' && (
                        <div className="flex items-center gap-1 text-yellow-600 text-xs">
                          <AlertTriangle className="h-3 w-3" />
                          <span>Chỉ còn {maxValue - currentValue} chỗ</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={config.isActive ? 'default' : 'secondary'}>
                    {config.isActive ? 'Hoạt động' : 'Không hoạt động'}
                  </Badge>
                  {config.isActive && (
                    <span className="text-sm text-gray-600">
                      Cấu hình đang được áp dụng
                    </span>
                  )}
                </div>
                
                {!config.isActive && (
                  <div className="text-sm text-gray-500">
                    Cấu hình đã bị tắt, không áp dụng giới hạn
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
