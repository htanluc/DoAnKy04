"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Car, Bike, Truck, Van, Zap, Bicycle, Settings } from 'lucide-react';
import VehicleCapacityManager from '@/components/admin/VehicleCapacityManager';
import VehicleCapacityOverview from '@/components/admin/VehicleCapacityOverview';
import VehicleCapacityAlert from '@/components/admin/VehicleCapacityAlert';
import VehicleCapacityDebug from '@/components/admin/VehicleCapacityDebug';
import { useVehicleCapacity } from '@/hooks/use-vehicle-capacity';

const VEHICLE_TYPES = [
  { value: 'CAR_4_SEATS', label: 'Ô tô 4 chỗ', icon: Car },
  { value: 'CAR_7_SEATS', label: 'Ô tô 7 chỗ', icon: Car },
  { value: 'MOTORCYCLE', label: 'Xe máy', icon: Bike },
];

const BUILDINGS = [
  { id: 1, name: 'Tòa A - Golden Tower' },
  { id: 2, name: 'Tòa B - Golden Tower' },
  { id: 3, name: 'Tòa C - Golden Tower' },
];

export default function VehicleCapacityDemoPage() {
  const { canRegisterVehicle, getRemainingCapacity, getConfigByBuilding } = useVehicleCapacity();
  const [selectedBuilding, setSelectedBuilding] = useState<number>(1);
  const [selectedVehicleType, setSelectedVehicleType] = useState<string>('car');
  const [showAlert, setShowAlert] = useState(false);

  const handleCheckCapacity = () => {
    setShowAlert(true);
  };

  const config = getConfigByBuilding(selectedBuilding);
  const canRegister = canRegisterVehicle(selectedBuilding, selectedVehicleType);
  const remainingCapacity = getRemainingCapacity(selectedBuilding, selectedVehicleType);

  const getVehicleTypeDisplayName = (type: string) => {
    return VEHICLE_TYPES.find(vt => vt.value === type)?.label || type;
  };

  const getVehicleTypeIcon = (type: string) => {
    const vehicleType = VEHICLE_TYPES.find(vt => vt.value === type);
    if (!vehicleType) return null;
    
    const Icon = vehicleType.icon;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          🚗 Demo Tính Năng Giới Hạn Xe
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Trang demo để test tính năng quản lý giới hạn số lượng xe trong chung cư
        </p>
      </div>

      <Tabs defaultValue="demo" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="demo">Demo Kiểm Tra</TabsTrigger>
          <TabsTrigger value="overview">Tổng Quan</TabsTrigger>
          <TabsTrigger value="config">Cấu Hình</TabsTrigger>
          <TabsTrigger value="debug">Debug API</TabsTrigger>
          <TabsTrigger value="approval">Test Duyệt Xe</TabsTrigger>
          <TabsTrigger value="docs">Tài Liệu</TabsTrigger>
        </TabsList>

        <TabsContent value="demo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Kiểm tra khả năng đăng ký xe
              </CardTitle>
              <CardDescription>
                Chọn tòa nhà và loại xe để kiểm tra giới hạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="building">Tòa nhà</Label>
                  <Select
                    value={selectedBuilding.toString()}
                    onValueChange={(value) => setSelectedBuilding(parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tòa nhà" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUILDINGS.map(building => (
                        <SelectItem key={building.id} value={building.id.toString()}>
                          {building.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vehicleType">Loại xe</Label>
                  <Select
                    value={selectedVehicleType}
                    onValueChange={setSelectedVehicleType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại xe" />
                    </SelectTrigger>
                    <SelectContent>
                      {VEHICLE_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button onClick={handleCheckCapacity} className="flex-1">
                  Kiểm tra khả năng đăng ký
                </Button>
              </div>

              {showAlert && config && (
                <div className="mt-6">
                  <VehicleCapacityAlert 
                    config={config} 
                    vehicleType={getVehicleTypeDisplayName(selectedVehicleType)}
                    showDetails={true}
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-2">
                        {canRegister ? '✅ Có thể' : '❌ Không thể'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {canRegister ? 'Đăng ký xe' : 'Đăng ký xe'}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-2">
                        {remainingCapacity >= 0 ? remainingCapacity : '∞'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Chỗ còn lại
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <VehicleCapacityOverview />
        </TabsContent>

        <TabsContent value="config" className="space-y-6">
          <VehicleCapacityManager />
        </TabsContent>

        <TabsContent value="debug" className="space-y-6">
          <VehicleCapacityDebug />
        </TabsContent>

        <TabsContent value="approval" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>🚗 Test Chức Năng Khóa Duyệt Xe</CardTitle>
              <CardDescription>
                Test chức năng khóa duyệt xe khi danh sách loại xe đó đã đầy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  Sử dụng trang demo riêng để test chức năng khóa duyệt xe
                </p>
                                 <Button asChild>
                   <a href="/vehicle-approval-demo">
                     Demo Duyệt Xe
                   </a>
                 </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>📚 Tài liệu tính năng giới hạn xe</CardTitle>
              <CardDescription>
                Hướng dẫn sử dụng và API documentation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose max-w-none">
                <h3>🚀 Tính năng chính</h3>
                <ul>
                  <li><strong>Cấu hình giới hạn:</strong> Thiết lập số lượng xe tối đa cho từng loại xe trong từng tòa nhà</li>
                  <li><strong>Kiểm tra tự động:</strong> Tự động kiểm tra giới hạn khi đăng ký xe mới</li>
                  <li><strong>Quản lý linh hoạt:</strong> Admin có thể thay đổi giới hạn và bật/tắt tính năng</li>
                  <li><strong>Báo cáo real-time:</strong> Hiển thị số lượng xe hiện tại và còn lại</li>
                </ul>

                <h3>🔧 Cách sử dụng</h3>
                <ol>
                  <li>Vào tab "Cấu hình" để thiết lập giới hạn xe cho từng tòa nhà</li>
                  <li>Sử dụng tab "Tổng quan" để xem tình trạng sức chứa xe</li>
                  <li>Dùng tab "Demo" để test tính năng kiểm tra giới hạn</li>
                </ol>

                                 <h3>📊 Các loại xe được hỗ trợ</h3>
                 <ul>
                   <li>🚗 Ô tô (4-7 chỗ)</li>
                   <li>🏍️ Xe máy</li>
                 </ul>

                                 <h3>⚠️ Lưu ý quan trọng</h3>
                 <ul>
                   <li>Chỉ xe có trạng thái "APPROVED" mới được tính vào giới hạn</li>
                   <li>Xe có trạng thái "PENDING" không ảnh hưởng đến giới hạn</li>
                   <li>Giới hạn được kiểm tra ngay khi đăng ký xe</li>
                   <li>Có thể bật/tắt cấu hình cho từng tòa nhà</li>
                   <li><strong>Chức năng khóa duyệt:</strong> Nút duyệt xe sẽ bị khóa khi loại xe đó đã đầy</li>
                 </ul>

                 <h3>🔒 Chức năng khóa duyệt xe</h3>
                 <ul>
                   <li><strong>🟢 Còn chỗ:</strong> Có thể duyệt xe bình thường</li>
                   <li><strong>🟡 Gần đầy:</strong> Hiển thị cảnh báo nhưng vẫn có thể duyệt</li>
                   <li><strong>🔴 Đã đầy:</strong> Nút duyệt bị khóa hoàn toàn</li>
                 </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
