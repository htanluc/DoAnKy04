"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Settings, Car, Bike, Database, Play } from 'lucide-react';
import { VehicleCapacityConfig } from '@/lib/api';
import { useVehicleCapacity } from '@/hooks/use-vehicle-capacity';

// Interface chỉ cho 2 loại xe
interface SimpleVehicleCapacityConfig {
  buildingId: number;
  maxCars: number;
  maxMotorcycles: number;
  isActive: boolean;
}

interface Building {
  id: number;
  name: string;
}

const VEHICLE_TYPES = [
  { key: 'maxCars', label: 'Ô tô (4-7 chỗ)', icon: Car, color: 'bg-blue-100 text-blue-800', apiType: 'CAR_4_SEATS' },
  { key: 'maxMotorcycles', label: 'Xe máy', icon: Bike, color: 'bg-green-100 text-green-800', apiType: 'MOTORCYCLE' },
];

// Mock buildings - trong thực tế sẽ lấy từ API
const MOCK_BUILDINGS: Building[] = [
  { id: 1, name: 'Tòa A - Golden Tower' },
  { id: 2, name: 'Tòa B - Golden Tower' },
  { id: 3, name: 'Tòa C - Golden Tower' },
];

export default function VehicleCapacityManager() {
  const {
    configs,
    loading,
    error,
    useMockData,
    createConfig,
    updateConfig,
    deleteConfig,
    toggleConfigActive,
  } = useVehicleCapacity();

  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<VehicleCapacityConfig | null>(null);
  const [formData, setFormData] = useState<SimpleVehicleCapacityConfig>({
    buildingId: 1,
    maxCars: 0,
    maxMotorcycles: 0,
    isActive: true,
  });

  const handleSubmit = async () => {
    try {
      // Map SimpleVehicleCapacityConfig sang VehicleCapacityConfig
      const fullConfig = {
        ...formData,
        maxTrucks: 0,
        maxVans: 0,
        maxElectricVehicles: 0,
        maxBicycles: 0,
      };
      
      if (editingConfig) {
        await updateConfig(editingConfig.id!, fullConfig);
      } else {
        await createConfig(fullConfig);
      }
      
      setShowCreateModal(false);
      setEditingConfig(null);
      resetForm();
    } catch (error) {
      // Error handling is done in the hook
      console.error('Error saving config:', error);
    }
  };

  const handleEdit = (config: VehicleCapacityConfig) => {
    setEditingConfig(config);
    setFormData({
      buildingId: config.buildingId,
      maxCars: config.maxCars,
      maxMotorcycles: config.maxMotorcycles,
      isActive: config.isActive,
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa cấu hình này?')) return;
    
    try {
      await deleteConfig(id);
    } catch (error) {
      // Error handling is done in the hook
      console.error('Error deleting config:', error);
    }
  };

  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      await toggleConfigActive(id, isActive);
    } catch (error) {
      // Error handling is done in the hook
      console.error('Error toggling config:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      buildingId: 1,
      maxCars: 0,
      maxMotorcycles: 0,
      isActive: true,
    });
  };

  const getBuildingName = (buildingId: number) => {
    return MOCK_BUILDINGS.find(b => b.id === buildingId)?.name || `Tòa ${buildingId}`;
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

  return (
    <div className="space-y-6">
      {/* Mock Data Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={useMockData ? 'secondary' : 'default'} className="flex items-center gap-2">
            {useMockData ? (
              <>
                <Play className="h-3 w-3" />
                Demo Mode (Mock Data)
              </>
            ) : (
              <>
                <Database className="h-3 w-3" />
                Production Mode (Real API)
              </>
            )}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {useMockData 
              ? 'Đang sử dụng dữ liệu mẫu để demo tính năng' 
              : 'Đang kết nối với backend API thật'
            }
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled
          className="flex items-center gap-2"
        >
          <Database className="h-4 w-4" />
          Luôn sử dụng API thật
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quản lý giới hạn xe</h2>
          <p className="text-muted-foreground">
            Cấu hình giới hạn số lượng xe cho từng tòa nhà
          </p>
        </div>
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingConfig(null);
              resetForm();
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Tạo cấu hình mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingConfig ? 'Chỉnh sửa cấu hình' : 'Tạo cấu hình mới'}
              </DialogTitle>
              <DialogDescription>
                Thiết lập giới hạn số lượng xe cho tòa nhà
                {useMockData && (
                  <span className="block text-blue-600 text-sm mt-1">
                    💡 Đang ở chế độ Demo - Dữ liệu sẽ không được lưu vào database
                  </span>
                )}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="building">Tòa nhà</Label>
                <Select
                  value={formData.buildingId.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, buildingId: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn tòa nhà" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_BUILDINGS.map(building => (
                      <SelectItem key={building.id} value={building.id.toString()}>
                        {building.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="isActive">Trạng thái</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <Label htmlFor="isActive">{formData.isActive ? 'Hoạt động' : 'Không hoạt động'}</Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {VEHICLE_TYPES.map((type) => (
                <div key={type.key} className="space-y-2">
                  <Label htmlFor={type.key} className="flex items-center gap-2">
                    {type.icon && <type.icon className="h-4 w-4" />}
                    {type.label}
                  </Label>
                  <Input
                    id={type.key}
                    type="number"
                    min="0"
                    value={formData[type.key as 'maxCars' | 'maxMotorcycles']}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      [type.key]: parseInt(e.target.value) || 0 
                    }))}
                    placeholder="0"
                  />
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Hủy
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Đang xử lý...' : (editingConfig ? 'Cập nhật' : 'Tạo mới')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Đang tải...</div>
      ) : configs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Settings className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500 mb-4">Chưa có cấu hình giới hạn xe nào</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Tạo cấu hình đầu tiên
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {configs.map((config) => (
            <Card key={config.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      {getBuildingName(config.buildingId)}
                    </CardTitle>
                    <CardDescription>
                      Cấu hình giới hạn xe cho tòa nhà
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={config.isActive}
                      onCheckedChange={(checked) => handleToggleActive(config.id!, checked)}
                      disabled={loading}
                    />
                    <Badge variant={config.isActive ? 'default' : 'secondary'}>
                      {config.isActive ? 'Hoạt động' : 'Không hoạt động'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  {VEHICLE_TYPES.map((type) => {
                    const currentKey = type.key.replace('max', 'current') as keyof VehicleCapacityConfig;
                    const remainingKey = type.key.replace('max', 'remaining') as keyof VehicleCapacityConfig;
                    const maxValue = config[type.key as keyof VehicleCapacityConfig] as number;
                    const currentValue = config[currentKey] as number || 0;
                    const remainingValue = config[remainingKey] as number || maxValue;
                    
                    return (
                      <div key={type.key} className="p-4 border rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          {type.icon && <type.icon className="h-4 w-4" />}
                          <span className="font-medium">{type.label}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Hiện tại:</span>
                            <span className="font-medium">{currentValue}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Tối đa:</span>
                            <span className="font-medium">{maxValue}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Còn lại:</span>
                            <Badge variant={remainingValue > 0 ? 'default' : 'destructive'}>
                              {remainingValue}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(config)}
                    disabled={loading}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Chỉnh sửa
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(config.id!)}
                    disabled={loading}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
