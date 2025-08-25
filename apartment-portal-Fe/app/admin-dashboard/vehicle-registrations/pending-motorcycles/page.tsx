"use client";

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Bike, ArrowLeft } from 'lucide-react';
import { vehiclesApi, Vehicle } from '@/lib/api';
import { useVehicleCapacity } from '@/hooks/use-vehicle-capacity';
import Link from 'next/link';

export default function PendingMotorcyclesPage() {
  const { t } = useLanguage();
  const { getConfigByBuilding, configs } = useVehicleCapacity();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);

  // Danh sách lý do từ chối có sẵn
  const rejectionReasons = [
    'Thông tin xe không chính xác',
    'Biển số xe không rõ ràng',
    'Thiếu giấy tờ xe',
    'Xe không đủ tiêu chuẩn an toàn',
    'Thông tin chủ xe không hợp lệ',
    'Căn hộ không tồn tại',
    'Vượt quá giới hạn xe cho phép',
    'Lý do khác'
  ];

  // Load pending vehicles
  useEffect(() => {
    const loadPendingVehicles = async () => {
      try {
        setLoading(true);
        const data = await vehiclesApi.getPending();
        console.log('Loaded pending vehicles:', data);
        setVehicles(data);
      } catch (error) {
        console.error('Error loading pending vehicles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPendingVehicles();
  }, []);

  // Lọc chỉ lấy xe máy/xe đạp và sắp xếp theo thời gian đăng ký (FIFO)
  const motorcycleVehicles = vehicles
    .filter(v => 
      (v.vehicleType?.toLowerCase().includes('motorcycle') || 
       v.vehicleTypeDisplayName?.toLowerCase().includes('xe máy') ||
       v.vehicleType?.toLowerCase().includes('xe đạp') || 
       v.vehicleTypeDisplayName?.toLowerCase().includes('xe đạp'))
    )
    .sort((a, b) => {
      // Sắp xếp theo createdAt (xe đăng ký trước lên đầu)
      if (!a.createdAt || !b.createdAt) return 0;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  // Kiểm tra khả năng duyệt xe dựa trên giới hạn và thứ tự FIFO
  const canApproveVehicle = (vehicle: Vehicle) => {
    // Kiểm tra thứ tự FIFO - chỉ cho phép duyệt xe đầu tiên
    const vehicleIndex = motorcycleVehicles.findIndex(v => v.id === vehicle.id);
    if (vehicleIndex > 0) {
      // Nếu không phải xe đầu tiên, kiểm tra xem xe trước đó có thể duyệt không
      const previousVehicle = motorcycleVehicles[vehicleIndex - 1];
      if (previousVehicle && canApproveVehicleByCapacity(previousVehicle)) {
        return false; // Không cho phép duyệt xe sau nếu xe trước vẫn có thể duyệt
      }
    }

    // Kiểm tra giới hạn sức chứa
    return canApproveVehicleByCapacity(vehicle);
  };

  // Kiểm tra khả năng duyệt xe dựa trên giới hạn sức chứa
  const canApproveVehicleByCapacity = (vehicle: Vehicle) => {
    let buildingId: number | null = null;
    
    // Thử format A03-04 -> tòa A (1)
    const formatAMatch = vehicle.apartmentUnitNumber?.match(/^([A-Z])(\d+)-/);
    if (formatAMatch) {
      const buildingLetter = formatAMatch[1];
      buildingId = buildingLetter.charCodeAt(0) - 64; // A=1, B=2, C=3...
    }
    
    // Thử format số trực tiếp như 26
    if (!buildingId) {
      const numberMatch = vehicle.apartmentUnitNumber?.match(/^(\d+)/);
      if (numberMatch) {
        buildingId = parseInt(numberMatch[1]);
      }
    }
    
    // Nếu không thể xác định tòa nhà, sử dụng tòa mặc định (26)
    if (!buildingId) {
      buildingId = 26;
    }
    
    // Thử tìm cấu hình cho tòa nhà này
    let config = getConfigByBuilding(buildingId);
    
    // Nếu không tìm thấy, thử tìm tòa 26 (tòa mặc định)
    if (!config && buildingId !== 26) {
      config = getConfigByBuilding(26);
    }
    
    if (!config || !config.isActive) {
      return true; // Không có cấu hình thì cho phép duyệt
    }

    // Kiểm tra loại xe
    const vehicleType = vehicle.vehicleType?.toLowerCase();
    const vehicleTypeDisplay = vehicle.vehicleTypeDisplayName?.toLowerCase();
    
    if (vehicleType?.includes('motorcycle') || vehicleTypeDisplay?.includes('xe máy') || 
        vehicleType?.includes('xe đạp') || vehicleTypeDisplay?.includes('xe đạp')) {
      return (config.currentMotorcycles || 0) < config.maxMotorcycles;
    }
    
    return true;
  };

  // Lấy thông tin giới hạn xe
  const getVehicleCapacityInfo = (vehicle: Vehicle) => {
    let buildingId: number | null = null;
    
    const formatAMatch = vehicle.apartmentUnitNumber?.match(/^([A-Z])(\d+)-/);
    if (formatAMatch) {
      const buildingLetter = formatAMatch[1];
      buildingId = buildingLetter.charCodeAt(0) - 64;
    }
    
    if (!buildingId) {
      const numberMatch = vehicle.apartmentUnitNumber?.match(/^(\d+)/);
      if (numberMatch) {
        buildingId = parseInt(numberMatch[1]);
      }
    }
    
    if (!buildingId) {
      buildingId = 26;
    }
    
    let config = getConfigByBuilding(buildingId);
    
    if (!config && buildingId !== 26) {
      config = getConfigByBuilding(26);
    }
    
    if (!config) {
      return null;
    }

    const vehicleType = vehicle.vehicleType?.toLowerCase();
    const vehicleTypeDisplay = vehicle.vehicleTypeDisplayName?.toLowerCase();
    
    if (vehicleType?.includes('motorcycle') || vehicleTypeDisplay?.includes('xe máy') || 
        vehicleType?.includes('xe đạp') || vehicleTypeDisplay?.includes('xe đạp')) {
      return {
        max: config.maxMotorcycles,
        current: config.currentMotorcycles || 0,
        remaining: config.remainingMotorcycles || 0,
        label: 'Xe máy/Xe đạp'
      };
    }
    
    return null;
  };

  const handleApprove = async (id: number) => {
    try {
      await vehiclesApi.updateStatus(id, 'APPROVED');
      // Remove from list
      setVehicles(prev => prev.filter(v => v.id !== id));
    } catch (error) {
      console.error('Error approving vehicle:', error);
    }
  };

  const handleReject = async () => {
    if (!rejectingId) return;
    try {
      await vehiclesApi.updateStatus(rejectingId, 'REJECTED', rejectionReason);
      // Remove from list
      setVehicles(prev => prev.filter(v => v.id !== rejectingId));
      // Close modal
      setShowRejectModal(false);
      setRejectingId(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Error rejecting vehicle:', error);
    }
  };

  return (
    <AdminLayout title={t('admin.vehicleRegistrations.title', 'Quản lý đăng ký xe')}>
      <div className="space-y-6">
        {/* Header với nút quay lại */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin-dashboard/vehicle-registrations">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <Bike className="h-8 w-8 text-green-600" />
                Xe máy chờ duyệt ({motorcycleVehicles.length})
              </h1>
              <p className="text-muted-foreground">
                Danh sách xe máy/xe đạp đang chờ phê duyệt
              </p>
            </div>
          </div>
        </div>

        {/* Thông báo về nguyên tắc FIFO */}
        <Card className="border-green-200 bg-green-50 mb-4">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-700">
              <div className="text-lg">ℹ️</div>
              <div>
                <div className="font-medium">Nguyên tắc duyệt xe: FIFO (First In, First Out)</div>
                <div className="text-sm text-green-600">
                  Xe đăng ký trước sẽ được duyệt trước. Chỉ có thể duyệt xe sau khi xe trước đó đã được xử lý.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bảng xe máy chờ duyệt */}
        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Đang tải...</div>
            ) : motorcycleVehicles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Không có xe máy chờ duyệt</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Thứ tự</TableHead>
                    <TableHead>Chủ xe</TableHead>
                    <TableHead>Biển số</TableHead>
                    <TableHead>Màu sắc</TableHead>
                    <TableHead>Căn hộ</TableHead>
                    <TableHead>Thời gian đăng ký</TableHead>
                    <TableHead>Giới hạn xe</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {motorcycleVehicles.map((vehicle, index) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-bold text-green-600">#{index + 1}</span>
                          <span className="text-xs text-gray-500">ID: {vehicle.id}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{vehicle.userFullName || '-'}</TableCell>
                      <TableCell>{vehicle.licensePlate}</TableCell>
                      <TableCell>{vehicle.color || '-'}</TableCell>
                      <TableCell>{vehicle.apartmentUnitNumber || '-'}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">
                            {vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleDateString('vi-VN') : '-'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleTimeString('vi-VN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : '-'}
                          </div>
                          {vehicle.updatedAt && vehicle.updatedAt !== vehicle.createdAt && (
                            <div className="text-xs text-blue-600 mt-1">
                              Cập nhật: {new Date(vehicle.updatedAt).toLocaleDateString('vi-VN')} {new Date(vehicle.updatedAt).toLocaleTimeString('vi-VN', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const capacityInfo = getVehicleCapacityInfo(vehicle);
                          if (!capacityInfo) return <span className="text-muted-foreground">-</span>;
                         
                          const isFull = capacityInfo.current >= capacityInfo.max;
                          return (
                            <div className="text-sm">
                              <div className="flex items-center gap-2">
                                <span>{capacityInfo.current}/{capacityInfo.max}</span>
                                {isFull ? (
                                  <Badge variant="destructive" className="text-xs">
                                    Đã đầy
                                  </Badge>
                                ) : (
                                  <Badge variant="default" className="text-xs">
                                    Còn {capacityInfo.remaining} chỗ
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {capacityInfo.label}
                              </div>
                            </div>
                          );
                        })()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(vehicle.id)}
                            disabled={!canApproveVehicle(vehicle)}
                            className={canApproveVehicle(vehicle) ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"}
                                                                                         title={canApproveVehicle(vehicle) ? "Duyệt xe" : 
                                   motorcycleVehicles.findIndex(v => v.id === vehicle.id) > 0 ? "Không thể duyệt - Phải duyệt xe trước đó trước" : 
                                   "Không thể duyệt - Đã đạt giới hạn"}
                          >
                            {canApproveVehicle(vehicle) ? "Duyệt" : "Không thể duyệt"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setRejectingId(vehicle.id);
                              setRejectionReason('');
                              setShowRejectModal(true);
                            }}
                          >
                            Từ chối
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
              <h3 className="text-lg font-semibold mb-4">Chọn lý do từ chối</h3>
              
              <div className="space-y-3 mb-6">
                {rejectionReasons.map((reason, index) => (
                  <label key={index} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="radio"
                      name="rejectionReason"
                      value={reason}
                      checked={rejectionReason === reason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="h-4 w-4 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm">{reason}</span>
                  </label>
                ))}
              </div>

              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectionReason('');
                  }}
                >
                  Hủy
                </Button>
                <Button
                  className="bg-red-600 text-white"
                  onClick={handleReject}
                  disabled={!rejectionReason}
                >
                  Xác nhận từ chối
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
