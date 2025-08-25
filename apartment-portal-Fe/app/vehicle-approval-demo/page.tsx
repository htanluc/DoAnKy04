"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Car, Bike, CheckCircle, XCircle, AlertTriangle, Lock, Settings } from 'lucide-react';
import { useVehicleCapacity } from '@/hooks/use-vehicle-capacity';
import { VehicleCapacityConfig } from '@/lib/api';

interface VehicleRequest {
  id: number;
  vehicleType: string;
  licensePlate: string;
  ownerName: string;
  buildingId: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

const VEHICLE_TYPES = [
  { value: 'CAR_4_SEATS', label: 'Ô tô 4 chỗ', icon: Car, color: 'bg-blue-100 text-blue-800' },
  { value: 'CAR_7_SEATS', label: 'Ô tô 7 chỗ', icon: Car, color: 'bg-blue-100 text-blue-800' },
  { value: 'MOTORCYCLE', label: 'Xe máy', icon: Bike, color: 'bg-green-100 text-green-800' },
];

const BUILDINGS = [
  { id: 1, name: 'Tòa A - Golden Tower' },
  { id: 2, name: 'Tòa B - Golden Tower' },
  { id: 3, name: 'Tòa C - Golden Tower' },
];

// Mock data cho yêu cầu đăng ký xe
const MOCK_VEHICLE_REQUESTS: VehicleRequest[] = [
  {
    id: 1,
    vehicleType: 'CAR_4_SEATS',
    licensePlate: '30A-12345',
    ownerName: 'Nguyễn Văn A',
    buildingId: 1,
    status: 'PENDING',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    vehicleType: 'MOTORCYCLE',
    licensePlate: '30A-67890',
    ownerName: 'Trần Thị B',
    buildingId: 1,
    status: 'PENDING',
    createdAt: '2024-01-15T11:00:00Z'
  },
  {
    id: 3,
    vehicleType: 'CAR_7_SEATS',
    licensePlate: '30A-11111',
    ownerName: 'Lê Văn C',
    buildingId: 2,
    status: 'PENDING',
    createdAt: '2024-01-15T12:00:00Z'
  },
  {
    id: 4,
    vehicleType: 'MOTORCYCLE',
    licensePlate: '30A-22222',
    ownerName: 'Phạm Thị D',
    buildingId: 2,
    status: 'PENDING',
    createdAt: '2024-01-15T13:00:00Z'
  },
];

export default function VehicleApprovalDemoPage() {
  const { configs, getConfigByBuilding } = useVehicleCapacity();
  const [selectedBuilding, setSelectedBuilding] = useState<number>(1);
  const [vehicleRequests, setVehicleRequests] = useState<VehicleRequest[]>(MOCK_VEHICLE_REQUESTS);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRequest, setNewRequest] = useState({
    vehicleType: 'CAR_4_SEATS',
    licensePlate: '',
    ownerName: '',
    buildingId: 1
  });

  const currentConfig = getConfigByBuilding(selectedBuilding);

  // Kiểm tra khả năng duyệt xe
  const canApproveVehicle = (vehicleType: string, buildingId: number) => {
    const config = getConfigByBuilding(buildingId);
    if (!config || !config.isActive) return false;

    switch (vehicleType) {
      case 'CAR_4_SEATS':
      case 'CAR_7_SEATS':
        return (config.currentCars || 0) < config.maxCars;
      case 'MOTORCYCLE':
        return (config.currentMotorcycles || 0) < config.maxMotorcycles;
      default:
        return false;
    }
  };

  // Lấy thông tin xe
  const getVehicleInfo = (vehicleType: string, buildingId: number) => {
    const config = getConfigByBuilding(buildingId);
    if (!config) return null;

    switch (vehicleType) {
      case 'CAR_4_SEATS':
      case 'CAR_7_SEATS':
        return {
          max: config.maxCars,
          current: config.currentCars || 0,
          remaining: config.remainingCars || 0,
          label: 'Ô tô',
          icon: Car,
          color: 'bg-blue-100 text-blue-800'
        };
      case 'MOTORCYCLE':
        return {
          max: config.maxMotorcycles,
          current: config.currentMotorcycles || 0,
          remaining: config.remainingMotorcycles || 0,
          label: 'Xe máy',
          icon: Bike,
          color: 'bg-green-100 text-green-800'
        };
      default:
        return null;
    }
  };

  // Xử lý duyệt xe
  const handleApprove = (requestId: number) => {
    setVehicleRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'APPROVED' as const }
          : req
      )
    );
  };

  // Xử lý từ chối xe
  const handleReject = (requestId: number) => {
    setVehicleRequests(prev => 
      prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'REJECTED' as const }
          : req
      )
    );
  };

  // Tạo yêu cầu mới
  const handleCreateRequest = () => {
    if (!newRequest.licensePlate || !newRequest.ownerName) return;

    const request: VehicleRequest = {
      id: Date.now(),
      ...newRequest,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    setVehicleRequests(prev => [request, ...prev]);
    setNewRequest({
      vehicleType: 'CAR_4_SEATS',
      licensePlate: '',
      ownerName: '',
      buildingId: selectedBuilding
    });
    setShowCreateForm(false);
  };

  // Lọc yêu cầu theo tòa nhà
  const filteredRequests = vehicleRequests.filter(req => req.buildingId === selectedBuilding);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          🚗 Demo Duyệt Đăng Ký Xe
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Test chức năng duyệt xe với kiểm tra giới hạn số lượng tự động
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Tổng Quan</TabsTrigger>
          <TabsTrigger value="requests">Yêu Cầu Duyệt</TabsTrigger>
          <TabsTrigger value="create">Tạo Yêu Cầu</TabsTrigger>
          <TabsTrigger value="config">Cấu Hình</TabsTrigger>
        </TabsList>

        {/* Tab Tổng Quan */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chọn tòa nhà */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Chọn Tòa Nhà
                </CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>

            {/* Thống kê tòa nhà */}
            <Card>
              <CardHeader>
                <CardTitle>📊 Thống Kê Tòa Nhà</CardTitle>
                <CardDescription>
                  {BUILDINGS.find(b => b.id === selectedBuilding)?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {VEHICLE_TYPES.map((type) => {
                    const vehicleInfo = getVehicleInfo(type.value, selectedBuilding);
                    if (!vehicleInfo) return null;

                    const isFull = vehicleInfo.current >= vehicleInfo.max;
                    const isNearFull = vehicleInfo.current >= vehicleInfo.max * 0.8;

                    return (
                      <div key={type.value} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${type.color}`}>
                            <type.icon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium">{type.label}</div>
                            <div className="text-sm text-muted-foreground">
                              {vehicleInfo.current}/{vehicleInfo.max} xe
                            </div>
                          </div>
                        </div>
                        <Badge 
                          variant={isFull ? 'destructive' : isNearFull ? 'secondary' : 'default'}
                          className="flex items-center gap-1"
                        >
                          {isFull ? (
                            <>
                              <Lock className="h-3 w-3" />
                              Đã đầy
                            </>
                          ) : isNearFull ? (
                            <>
                              <AlertTriangle className="h-3 w-3" />
                              Gần đầy
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-3 w-3" />
                              Còn chỗ
                            </>
                          )}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Yêu Cầu Duyệt */}
        <TabsContent value="requests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>📋 Danh Sách Yêu Cầu Duyệt</CardTitle>
              <CardDescription>
                Quản lý các yêu cầu đăng ký xe mới
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Chưa có yêu cầu nào cho tòa nhà này
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRequests.map((request) => {
                    const vehicleInfo = getVehicleInfo(request.vehicleType, request.buildingId);
                    const canApprove = canApproveVehicle(request.vehicleType, request.buildingId);
                    const isFull = vehicleInfo ? vehicleInfo.current >= vehicleInfo.max : false;

                    return (
                      <div key={request.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${vehicleInfo?.color || 'bg-gray-100'}`}>
                              {vehicleInfo?.icon && <vehicleInfo.icon className="h-4 w-4" />}
                            </div>
                            <div>
                              <div className="font-medium">{request.ownerName}</div>
                              <div className="text-sm text-muted-foreground">
                                {request.licensePlate} • {VEHICLE_TYPES.find(t => t.value === request.vehicleType)?.label}
                              </div>
                            </div>
                          </div>
                          <Badge 
                            variant={
                              request.status === 'APPROVED' ? 'default' : 
                              request.status === 'REJECTED' ? 'destructive' : 'secondary'
                            }
                          >
                            {request.status === 'APPROVED' ? 'Đã duyệt' : 
                             request.status === 'REJECTED' ? 'Đã từ chối' : 'Chờ duyệt'}
                          </Badge>
                        </div>

                        {request.status === 'PENDING' && (
                          <div className="space-y-3">
                            {/* Thông tin giới hạn */}
                            {vehicleInfo && (
                              <div className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-center justify-between text-sm">
                                  <span>Trạng thái giới hạn:</span>
                                  <div className="flex items-center gap-2">
                                    <span>{vehicleInfo.current}/{vehicleInfo.max} xe</span>
                                    <Badge 
                                      variant={isFull ? 'destructive' : 'default'}
                                      className="text-xs"
                                    >
                                      {isFull ? 'Đã đầy' : `Còn ${vehicleInfo.remaining} chỗ`}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Cảnh báo khi đầy */}
                            {isFull && (
                              <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                                <div className="flex items-center gap-2 text-red-700">
                                  <Lock className="h-4 w-4" />
                                  <span className="text-sm font-medium">
                                    ⚠️ Không thể duyệt thêm xe {vehicleInfo?.label} - Đã đạt giới hạn tối đa
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Nút duyệt/từ chối */}
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleApprove(request.id)}
                                disabled={!canApprove}
                                className="flex-1"
                                variant={canApprove ? "default" : "secondary"}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                {canApprove ? 'Duyệt' : 'Không thể duyệt'}
                              </Button>
                              <Button
                                onClick={() => handleReject(request.id)}
                                variant="outline"
                                className="flex-1"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Từ chối
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Tạo Yêu Cầu */}
        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>➕ Tạo Yêu Cầu Đăng Ký Xe Mới</CardTitle>
              <CardDescription>
                Tạo yêu cầu đăng ký xe để test chức năng duyệt
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicleType">Loại xe</Label>
                  <Select
                    value={newRequest.vehicleType}
                    onValueChange={(value) => setNewRequest(prev => ({ ...prev, vehicleType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
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

                <div className="space-y-2">
                  <Label htmlFor="buildingId">Tòa nhà</Label>
                  <Select
                    value={newRequest.buildingId.toString()}
                    onValueChange={(value) => setNewRequest(prev => ({ ...prev, buildingId: parseInt(value) }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
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
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="licensePlate">Biển số xe</Label>
                  <Input
                    id="licensePlate"
                    value={newRequest.licensePlate}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, licensePlate: e.target.value }))}
                    placeholder="30A-12345"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownerName">Tên chủ xe</Label>
                  <Input
                    id="ownerName"
                    value={newRequest.ownerName}
                    onChange={(e) => setNewRequest(prev => ({ ...prev, ownerName: e.target.value }))}
                    placeholder="Nguyễn Văn A"
                  />
                </div>
              </div>

              <div className="mt-6">
                <Button 
                  onClick={handleCreateRequest}
                  disabled={!newRequest.licensePlate || !newRequest.ownerName}
                  className="w-full"
                >
                  Tạo Yêu Cầu
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Cấu Hình */}
        <TabsContent value="config" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>⚙️ Cấu Hình Giới Hạn Xe</CardTitle>
              <CardDescription>
                Xem cấu hình giới hạn xe hiện tại
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentConfig ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-blue-100">
                        <Car className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">Ô tô (4-7 chỗ)</div>
                        <div className="text-sm text-muted-foreground">
                          {currentConfig.currentCars || 0}/{currentConfig.maxCars} xe
                        </div>
                      </div>
                    </div>
                    <Badge variant={currentConfig.currentCars >= currentConfig.maxCars ? 'destructive' : 'default'}>
                      {currentConfig.currentCars >= currentConfig.maxCars ? 'Đã đầy' : 'Còn chỗ'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-green-100">
                        <Bike className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">Xe máy</div>
                        <div className="text-sm text-muted-foreground">
                          {currentConfig.currentMotorcycles || 0}/{currentConfig.maxMotorcycles} xe
                        </div>
                      </div>
                    </div>
                    <Badge variant={currentConfig.currentMotorcycles >= currentConfig.maxMotorcycles ? 'destructive' : 'default'}>
                      {currentConfig.currentMotorcycles >= currentConfig.maxMotorcycles ? 'Đã đầy' : 'Còn chỗ'}
                    </Badge>
                  </div>

                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-muted-foreground">
                      <strong>Lưu ý:</strong> Chỉ xe có trạng thái "APPROVED" mới được tính vào giới hạn. 
                      Xe có trạng thái "PENDING" không ảnh hưởng đến giới hạn.
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Chưa có cấu hình giới hạn xe cho tòa nhà này
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
