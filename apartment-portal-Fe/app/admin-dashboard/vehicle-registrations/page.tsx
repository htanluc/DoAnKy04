"use client";

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Car, Bike, Truck, Settings } from 'lucide-react';
import { vehiclesApi, Vehicle } from '@/lib/api';
import VehicleCapacityOverview from '@/components/admin/VehicleCapacityOverview';
import VehicleCapacityManager from '@/components/admin/VehicleCapacityManager';
import CapacityWarningCard from '@/components/admin/CapacityWarningCard';
import { useVehicleCapacity } from '@/hooks/use-vehicle-capacity';
import Link from 'next/link';

const getVehicleTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'motorcycle':
    case 'xe máy':
      return <Bike className="h-4 w-4" />;
    case 'bicycle':
    case 'xe đạp':
      return <Bike className="h-4 w-4" />;
    case 'car':
    case 'ô tô':
      return <Car className="h-4 w-4" />;
    case 'truck':
    case 'xe tải':
      return <Truck className="h-4 w-4" />;
    default:
      return <Car className="h-4 w-4" />;
  }
};

const getStatusBadge = (status: string, statusDisplayName?: string) => {
  const displayName = statusDisplayName || status;
  switch (status.toUpperCase()) {
    case 'PENDING':
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{displayName}</Badge>;
    case 'APPROVED':
      return <Badge variant="default" className="bg-green-100 text-green-800">{displayName}</Badge>;
    case 'REJECTED':
      return <Badge variant="destructive">{displayName}</Badge>;
    default:
      return <Badge variant="outline">{displayName}</Badge>;
  }
};

export default function VehicleRegistrationsPage() {
  const { t } = useLanguage();
  const { getConfigByBuilding, configs } = useVehicleCapacity();
  
  // Debug: Log tất cả cấu hình để kiểm tra
  useEffect(() => {
    console.log('=== VEHICLE CAPACITY CONFIGS ===');
    console.log('All configs:', configs);
    console.log('Configs length:', configs?.length);
    
    if (configs && configs.length > 0) {
      configs.forEach((config, index) => {
        console.log(`Config ${index + 1}:`, {
          id: config.id,
          buildingId: config.buildingId,
          maxCars: config.maxCars,
          maxMotorcycles: config.maxMotorcycles,
          currentCars: config.currentCars,
          currentMotorcycles: config.currentMotorcycles,
          isActive: config.isActive
        });
      });
    } else {
      console.log('❌ No configs found!');
    }
    console.log('=== END CONFIGS ===');
  }, [configs]);
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [allVehicles, setAllVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [allVehiclesLoading, setAllVehiclesLoading] = useState(false);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [filteredAllVehicles, setFilteredAllVehicles] = useState<Vehicle[]>([]);

  
  // Modal states
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [cancelId, setCancelId] = useState<number | null>(null);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [cancelling, setCancelling] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [cancelError, setCancelError] = useState<string>('');

  // Load pending vehicles
  useEffect(() => {
    const loadPendingVehicles = async () => {
      try {
        setLoading(true);
        const data = await vehiclesApi.getPending();
        console.log('Loaded pending vehicles:', data);
        setVehicles(data);
        setFilteredVehicles(data);
      } catch (error) {
        console.error('Error loading pending vehicles:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPendingVehicles();
  }, []);

  // Load all vehicles
  useEffect(() => {
    const loadAllVehicles = async () => {
      try {
        setAllVehiclesLoading(true);
        const data = await vehiclesApi.getAll();
        setAllVehicles(data);
        setFilteredAllVehicles(data);
      } catch (error) {
        console.error('Error loading all vehicles:', error);
      } finally {
        setAllVehiclesLoading(false);
      }
    };

    loadAllVehicles();
  }, []);



  // Filter pending vehicles
  useEffect(() => {
    const filtered = vehicles.filter(vehicle =>
      (vehicle.userFullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.licensePlate || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.apartmentUnitNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.vehicleTypeDisplayName || vehicle.vehicleType || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setFilteredVehicles(filtered);
  }, [searchTerm, vehicles]);

  // Filter all vehicles
  useEffect(() => {
    const filtered = allVehicles.filter(vehicle =>
      (vehicle.userFullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.licensePlate || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.apartmentUnitNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.vehicleTypeDisplayName || vehicle.vehicleType || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredAllVehicles(filtered);
  }, [searchTerm, allVehicles]);

  // Kiểm tra khả năng duyệt xe dựa trên giới hạn
  const canApproveVehicle = (vehicle: Vehicle) => {
    // Debug: Log thông tin để kiểm tra
    console.log('=== CHECKING VEHICLE APPROVAL ===');
    console.log('Vehicle:', {
      id: vehicle.id,
      apartmentUnitNumber: vehicle.apartmentUnitNumber,
      vehicleType: vehicle.vehicleType,
      vehicleTypeDisplayName: vehicle.vehicleTypeDisplayName
    });

    // Lấy building ID từ apartment unit number
    // Format có thể là: A03-04, A01-02, B-101, C-201, hoặc số trực tiếp như 26
    let buildingId: number | null = null;
    
    // Thử format A03-04 -> tòa A (1)
    const formatAMatch = vehicle.apartmentUnitNumber?.match(/^([A-Z])(\d+)-/);
    if (formatAMatch) {
      const buildingLetter = formatAMatch[1];
      buildingId = buildingLetter.charCodeAt(0) - 64; // A=1, B=2, C=3...
      console.log('✅ Detected building from format A:', buildingLetter, '->', buildingId);
    }
    
    // Thử format số trực tiếp như 26
    if (!buildingId) {
      const numberMatch = vehicle.apartmentUnitNumber?.match(/^(\d+)/);
      if (numberMatch) {
        buildingId = parseInt(numberMatch[1]);
        console.log('✅ Detected building from number:', buildingId);
      }
    }
    
    // Nếu không thể xác định tòa nhà, sử dụng tòa mặc định (26)
    if (!buildingId) {
      buildingId = 26; // Tòa mặc định từ dữ liệu
      console.log('⚠️ Using default building:', buildingId);
    }
    
    // Thử tìm cấu hình cho tòa nhà này
    let config = getConfigByBuilding(buildingId);
    
    // Nếu không tìm thấy, thử tìm tòa 26 (tòa mặc định)
    if (!config && buildingId !== 26) {
      console.log('🔍 Config not found for building', buildingId, ', trying building 26...');
      config = getConfigByBuilding(26);
      if (config) {
        console.log('✅ Found config for building 26, using it instead');
      }
    }

    // Fallback: dùng cấu hình hoạt động đầu tiên để không khóa hành động khi bãi còn chỗ
    if (!config) {
      const active = (configs || []).find(c => c.isActive);
      if (active) {
        console.log('ℹ️ Using first active config as fallback');
        config = active as any;
      }
    }
    
    console.log('🏢 Building config for ID', buildingId, ':', config);
    
    if (!config || !config.isActive) {
      console.log('❌ No config or inactive, disallow approval');
      return false; // Không có cấu hình hoặc cấu hình tắt: không cho duyệt/khôi phục
    }

    // Kiểm tra loại xe
    const vehicleType = vehicle.vehicleType?.toLowerCase();
    const vehicleTypeDisplay = vehicle.vehicleTypeDisplayName?.toLowerCase();
    
    console.log('🚗 Vehicle type check:', {
      vehicleType,
      vehicleTypeDisplay,
      isMotorcycle: vehicleType?.includes('motorcycle') || vehicleTypeDisplay?.includes('xe máy') || 
                   vehicleType?.includes('xe đạp') || vehicleTypeDisplay?.includes('xe đạp'),
      isCar: vehicleType?.includes('car') || vehicleTypeDisplay?.includes('ô tô')
    });
    
    let canApprove = true;
    
    if (vehicleType?.includes('motorcycle') || vehicleTypeDisplay?.includes('xe máy') || 
        vehicleType?.includes('xe đạp') || vehicleTypeDisplay?.includes('xe đạp')) {
      canApprove = (config.currentMotorcycles || 0) < config.maxMotorcycles;
      console.log('🏍️ Motorcycle check:', config.currentMotorcycles, '/', config.maxMotorcycles, '->', canApprove);
    } else if (vehicleType?.includes('car') || vehicleTypeDisplay?.includes('ô tô')) {
      canApprove = (config.currentCars || 0) < config.maxCars;
      console.log('🚙 Car check:', config.currentCars, '/', config.maxCars, '->', canApprove);
    } else {
      console.log('❓ Unknown vehicle type, allowing approval');
    }
    
    console.log('🎯 Final approval result:', canApprove);
    console.log('=== END CHECK ===');
    return canApprove;
  };

  // Lấy thông tin giới hạn xe
  const getVehicleCapacityInfo = (vehicle: Vehicle) => {
    // Debug: Log thông tin để kiểm tra
    console.log('=== GETTING VEHICLE CAPACITY INFO ===');
    console.log('Vehicle:', {
      id: vehicle.id,
      apartmentUnitNumber: vehicle.apartmentUnitNumber,
      vehicleType: vehicle.vehicleType,
      vehicleTypeDisplayName: vehicle.vehicleTypeDisplayName
    });

    // Lấy building ID từ apartment unit number
    let buildingId: number | null = null;
    
    // Thử format A03-04 -> tòa A (1)
    const formatAMatch = vehicle.apartmentUnitNumber?.match(/^([A-Z])(\d+)-/);
    if (formatAMatch) {
      const buildingLetter = formatAMatch[1];
      buildingId = buildingLetter.charCodeAt(0) - 64; // A=1, B=2, C=3...
      console.log('✅ Detected building from format A:', buildingLetter, '->', buildingId);
    }
    
    // Thử format số trực tiếp như 26
    if (!buildingId) {
      const numberMatch = vehicle.apartmentUnitNumber?.match(/^(\d+)/);
      if (numberMatch) {
        buildingId = parseInt(numberMatch[1]);
        console.log('✅ Detected building from number:', buildingId);
      }
    }
    
    // Nếu không thể xác định tòa nhà, sử dụng tòa mặc định (26)
    if (!buildingId) {
      buildingId = 26; // Tòa mặc định từ dữ liệu
      console.log('⚠️ Using default building:', buildingId);
    }
    
    // Thử tìm cấu hình cho tòa nhà này
    let config = getConfigByBuilding(buildingId);
    
    // Nếu không tìm thấy, thử tìm tòa 26 (tòa mặc định)
    if (!config && buildingId !== 26) {
      console.log('🔍 Config not found for building', buildingId, ', trying building 26...');
      config = getConfigByBuilding(26);
      if (config) {
        console.log('✅ Found config for building 26, using it instead');
      }
    }

    // Fallback: dùng cấu hình hoạt động đầu tiên để luôn hiển thị số liệu
    if (!config) {
      const active = (configs || []).find(c => c.isActive);
      if (active) {
        console.log('ℹ️ Using first active config as fallback for display');
        config = active as any;
      }
    }
    
    console.log('🏢 Building config for ID', buildingId, ':', config);
    
    if (!config) {
      console.log('❌ No config found, returning null');
      return null;
    }

    const vehicleType = vehicle.vehicleType?.toLowerCase();
    const vehicleTypeDisplay = vehicle.vehicleTypeDisplayName?.toLowerCase();
    
    console.log('🚗 Vehicle type check:', {
      vehicleType,
      vehicleTypeDisplay,
      isMotorcycle: vehicleType?.includes('motorcycle') || vehicleTypeDisplay?.includes('xe máy') || 
                   vehicleType?.includes('xe đạp') || vehicleTypeDisplay?.includes('xe đạp'),
      isCar: vehicleType?.includes('car') || vehicleTypeDisplay?.includes('ô tô')
    });
    
    if (vehicleType?.includes('motorcycle') || vehicleTypeDisplay?.includes('xe máy') || 
        vehicleType?.includes('xe đạp') || vehicleTypeDisplay?.includes('xe đạp')) {
      const result = {
        max: config.maxMotorcycles,
        current: config.currentMotorcycles || 0,
        remaining: config.remainingMotorcycles || 0,
        label: 'Xe máy/Xe đạp'
      };
      console.log('🏍️ Motorcycle capacity info:', result);
      return result;
    } else if (vehicleType?.includes('car') || vehicleTypeDisplay?.includes('ô tô')) {
      const result = {
        max: config.maxCars,
        current: config.currentCars || 0,
        remaining: config.remainingCars || 0,
        label: 'Ô tô'
      };
      console.log('🚙 Car capacity info:', result);
      return result;
    }
    
    console.log('❓ Unknown vehicle type, returning null');
    console.log('=== END CAPACITY INFO ===');
    return null;
  };

  const handleApprove = async (id: number) => {
    try {
      await vehiclesApi.updateStatus(id, 'APPROVED');
      // Remove from pending list
      setVehicles(prev => prev.filter(v => v.id !== id));
      setFilteredVehicles(prev => prev.filter(v => v.id !== id));
      // Refresh all vehicles list
      const allData = await vehiclesApi.getAll();
      setAllVehicles(allData);
      setFilteredAllVehicles(allData);
    } catch (error) {
      console.error('Error approving vehicle:', error);
    }
  };

  const handleReject = async () => {
    if (!rejectingId) return;
    try {
      await vehiclesApi.updateStatus(rejectingId, 'REJECTED', rejectionReason);
      // Gửi mail thông báo lý do từ chối
      try { await vehiclesApi.notifyCancellation(rejectingId, rejectionReason); } catch {}
      // Remove from pending list
      setVehicles(prev => prev.filter(v => v.id !== rejectingId));
      setFilteredVehicles(prev => prev.filter(v => v.id !== rejectingId));
      // Close modal
      setShowRejectModal(false);
      setRejectingId(null);
      setRejectionReason('');
      // Refresh all vehicles list
      const allData = await vehiclesApi.getAll();
      setAllVehicles(allData);
      setFilteredAllVehicles(allData);
    } catch (error) {
      console.error('Error rejecting vehicle:', error);
    }
  };

  const handleCancel = async () => {
    if (!cancelId) return;
    try {
      setCancelling(true);
      if (!cancelReason.trim()) {
        setCancelError('Vui lòng nhập lý do hủy.');
        setCancelling(false);
        return;
      }
      await vehiclesApi.updateStatus(cancelId, 'REJECTED', cancelReason);
      try { await vehiclesApi.notifyCancellation(cancelId, cancelReason); } catch {}
      // Cập nhật trạng thái về REJECTED để mục chuyển sang tab Từ chối
      setAllVehicles(prev => prev.map(v => v.id === cancelId ? { ...v, status: 'REJECTED', statusDisplayName: 'Từ chối' } : v));
      setFilteredAllVehicles(prev => prev.map(v => v.id === cancelId ? { ...v, status: 'REJECTED', statusDisplayName: 'Từ chối' } : v));
      // Close modal
      setShowCancelModal(false);
      setCancelId(null);
      setCancelReason('');
      setCancelError('');
    } catch (error) {
      console.error('Error cancelling vehicle:', error);
    } finally {
      setCancelling(false);
    }
  };

  const handleRestore = async (id: number) => {
    try {
      // Kiểm tra sức chứa trước khi khôi phục
      const vehicle = allVehicles.find(v => v.id === id);
      if (vehicle && !canApproveVehicle(vehicle)) {
        if (typeof window !== 'undefined') {
          window.alert('Bãi xe đã đầy hoặc cấu hình không cho phép. Không thể khôi phục.');
        }
        return;
      }
      // Khôi phục và cho vào bãi xe ngay: đặt trạng thái APPROVED
      await vehiclesApi.updateStatus(id, 'APPROVED');
      // Cập nhật danh sách tất cả xe
      setAllVehicles(prev => prev.map(v => v.id === id ? { ...v, status: 'APPROVED', statusDisplayName: 'Đã duyệt' } : v));
      setFilteredAllVehicles(prev => prev.map(v => v.id === id ? { ...v, status: 'APPROVED', statusDisplayName: 'Đã duyệt' } : v));
      // Bảo đảm không thêm vào danh sách pending
      setVehicles(prev => prev.filter(v => v.id !== id));
      setFilteredVehicles(prev => prev.filter(v => v.id !== id));
    } catch (error) {
      console.error('Error restoring vehicle:', error);
    }
  };

  const pendingCount = vehicles.length;
  const approvedCount = allVehicles.filter(v => v.status === 'APPROVED').length;
  const rejectedCount = allVehicles.filter(v => v.status === 'REJECTED').length;
  const totalCount = approvedCount; // Chỉ tính xe đã duyệt ở tab Tất cả

  return (
    <AdminLayout title={t('admin.vehicleRegistrations.title', 'Quản lý đăng ký xe')}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('admin.vehicleRegistrations.main.title', 'Quản lý đăng ký xe')}</h1>
            <p className="text-muted-foreground">
              {t('admin.vehicleRegistrations.main.subtitle', 'Quản lý tất cả đăng ký xe của cư dân')}
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t('admin.vehicleRegistrations.actions.createNew', 'Tạo mới')}
          </Button>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">{t('admin.vehicleRegistrations.tabs.pending', 'Chờ duyệt ({count})', { count: pendingCount })}</TabsTrigger>
            <TabsTrigger value="all">{t('admin.vehicleRegistrations.tabs.all', 'Tất cả xe ({count})', { count: totalCount })}</TabsTrigger>
            <TabsTrigger value="approved">{t('admin.vehicleRegistrations.tabs.approved', 'Đã duyệt ({count})', { count: approvedCount })}</TabsTrigger>
            <TabsTrigger value="rejected">{t('admin.vehicleRegistrations.tabs.rejected', 'Từ chối ({count})', { count: rejectedCount })}</TabsTrigger>
            <TabsTrigger value="capacity-overview">
              <Settings className="mr-2 h-4 w-4" />
              {t('admin.vehicleRegistrations.capacity.overview.title', 'Tổng quan giới hạn')}
            </TabsTrigger>
            <TabsTrigger value="capacity-config">
              <Settings className="mr-2 h-4 w-4" />
              {t('admin.vehicleRegistrations.capacity.config.title', 'Cấu hình giới hạn')}
            </TabsTrigger>
          </TabsList>

           <TabsContent value="pending" className="space-y-4">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
               {/* Card Ô tô */}
               <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                 <Link href="/admin-dashboard/vehicle-registrations/pending-cars">
                   <CardHeader>
                     <CardTitle className="flex items-center gap-2 text-blue-600">
                       <Car className="h-6 w-6" />
                       {t('admin.vehicleRegistrations.pending.cars.subtitle', 'Ô tô chờ duyệt ({count})', {
                         count: filteredVehicles.filter(v =>
                           (v.vehicleType?.toLowerCase().includes('car') ||
                            v.vehicleTypeDisplayName?.toLowerCase().includes('ô tô'))
                         ).length
                       })}
                     </CardTitle>
                     <CardDescription>
                       {t('admin.vehicleRegistrations.pending.cars.description', 'Danh sách ô tô đang chờ phê duyệt')}
                     </CardDescription>
                   </CardHeader>
                   <CardContent>
                     <div className="text-center py-8">
                       <div className="text-2xl font-bold text-blue-600 mb-2">
                         {filteredVehicles.filter(v => 
                           (v.vehicleType?.toLowerCase().includes('car') || 
                            v.vehicleTypeDisplayName?.toLowerCase().includes('ô tô'))
                         ).length}
                       </div>
                      <div className="text-sm text-gray-600">{t('admin.vehicleRegistrations.pending.cars.title', 'Ô tô chờ duyệt')}</div>
                       <Button className="mt-4" variant="outline">
                        {t('admin.vehicleRegistrations.actions.viewDetails', 'Xem chi tiết')} →
                       </Button>
                     </div>
                   </CardContent>
                 </Link>
               </Card>

               {/* Card Xe máy */}
               <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                 <Link href="/admin-dashboard/vehicle-registrations/pending-motorcycles">
                   <CardHeader>
                     <CardTitle className="flex items-center gap-2 text-green-600">
                       <Bike className="h-6 w-6" />
                       {t('admin.vehicleRegistrations.pending.motorcycles.subtitle', 'Xe máy chờ duyệt ({count})', {
                         count: filteredVehicles.filter(v =>
                           (v.vehicleType?.toLowerCase().includes('motorcycle') ||
                            v.vehicleTypeDisplayName?.toLowerCase().includes('xe máy') ||
                            v.vehicleType?.toLowerCase().includes('xe đạp') ||
                            v.vehicleTypeDisplayName?.toLowerCase().includes('xe đạp'))
                         ).length
                       })}
                     </CardTitle>
                     <CardDescription>
                       {t('admin.vehicleRegistrations.pending.motorcycles.description', 'Danh sách xe máy/xe đạp đang chờ phê duyệt')}
                     </CardDescription>
                   </CardHeader>
                   <CardContent>
                     <div className="text-center py-8">
                       <div className="text-2xl font-bold text-green-600 mb-2">
                         {filteredVehicles.filter(v => 
                           (v.vehicleType?.toLowerCase().includes('motorcycle') || 
                            v.vehicleTypeDisplayName?.toLowerCase().includes('xe máy') ||
                            v.vehicleType?.toLowerCase().includes('xe đạp') || 
                            v.vehicleTypeDisplayName?.toLowerCase().includes('xe đạp'))
                         ).length}
                       </div>
                      <div className="text-sm text-gray-600">{t('admin.vehicleRegistrations.pending.motorcycles.title', 'Xe máy chờ duyệt')}</div>
                       <Button className="mt-4" variant="outline">
                        {t('admin.vehicleRegistrations.actions.viewDetails', 'Xem chi tiết')} →
                       </Button>
                     </div>
                   </CardContent>
                 </Link>
               </Card>
             </div>
             
             <CapacityWarningCard
               vehicles={vehicles}
               canApproveVehicle={canApproveVehicle}
             />
           </TabsContent>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.vehicleRegistrations.tabs.all', 'Tất cả xe ({count})', { count: totalCount })}</CardTitle>
              </CardHeader>
              <CardContent>
                {allVehiclesLoading ? (
                  <div className="text-center py-8 text-gray-500">{t('admin.vehicleRegistrations.loading', 'Đang tải...')}</div>
                ) : filteredAllVehicles.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">{t('admin.vehicleRegistrations.noData', 'Không có dữ liệu')}</div>
                ) : (
                  <Table>
                     <TableHeader>
                       <TableRow>
                         <TableHead>{t('admin.vehicleRegistrations.table.owner', 'Chủ xe')}</TableHead>
                         <TableHead>{t('admin.vehicleRegistrations.table.type', 'Loại xe')}</TableHead>
                         <TableHead>{t('admin.vehicleRegistrations.table.licensePlate', 'Biển số')}</TableHead>
                         <TableHead>{t('admin.vehicleRegistrations.table.color', 'Màu sắc')}</TableHead>
                         <TableHead>{t('admin.vehicleRegistrations.table.apartment', 'Căn hộ')}</TableHead>
                         <TableHead>{t('admin.vehicleRegistrations.table.registrationDate', 'Thời gian đăng ký')}</TableHead>
                         <TableHead>{t('admin.vehicleRegistrations.table.status', 'Trạng thái')}</TableHead>
                         <TableHead>{t('admin.vehicleRegistrations.table.actions', 'Hành động')}</TableHead>
                       </TableRow>
                     </TableHeader>
                    <TableBody>
                      {filteredAllVehicles
                        .filter(v => v.status === 'APPROVED')
                        .map((vehicle) => (
                        <TableRow key={vehicle.id}>
                          <TableCell className="font-medium">{vehicle.userFullName || '-'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getVehicleTypeIcon(vehicle.vehicleType)}
                              {vehicle.vehicleTypeDisplayName || vehicle.vehicleType}
                            </div>
                          </TableCell>
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
                           <TableCell>{getStatusBadge(vehicle.status, vehicle.statusDisplayName)}</TableCell>
                           <TableCell>
                            <div className="flex gap-2">
                              {vehicle.status !== 'REJECTED' ? (
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setCancelId(vehicle.id);
                                    setShowCancelModal(true);
                                  }}
                                >
                                  {t('admin.vehicleRegistrations.actions.cancel', 'Hủy đăng ký')}
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRestore(vehicle.id)}
                                  disabled={!canApproveVehicle(vehicle)}
                                  title={canApproveVehicle(vehicle) ? 'Khôi phục' : 'Không thể khôi phục - Bãi xe đã đầy hoặc cấu hình không hoạt động'}
                                >
                                  {t('admin.vehicleRegistrations.actions.restore', 'Khôi phục')}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.vehicleRegistrations.tabs.approved', 'Đã duyệt ({count})', { count: approvedCount })}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('admin.vehicleRegistrations.table.owner', 'Chủ xe')}</TableHead>
                      <TableHead>{t('admin.vehicleRegistrations.table.type', 'Loại xe')}</TableHead>
                      <TableHead>{t('admin.vehicleRegistrations.table.licensePlate', 'Biển số')}</TableHead>
                      <TableHead>{t('admin.vehicleRegistrations.table.color', 'Màu sắc')}</TableHead>
                      <TableHead>{t('admin.vehicleRegistrations.table.apartment', 'Căn hộ')}</TableHead>
                      <TableHead>{t('admin.vehicleRegistrations.table.registrationDate', 'Thời gian đăng ký')}</TableHead>
                      <TableHead>{t('admin.vehicleRegistrations.table.status', 'Trạng thái')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allVehicles
                      .filter(v => v.status === 'APPROVED')
                      .map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell className="font-medium">{vehicle.userFullName || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getVehicleTypeIcon(vehicle.vehicleType)}
                            {vehicle.vehicleTypeDisplayName || vehicle.vehicleType}
                          </div>
                        </TableCell>
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
                        <TableCell>{getStatusBadge(vehicle.status, vehicle.statusDisplayName)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t('admin.vehicleRegistrations.tabs.rejected', 'Từ chối ({count})', { count: rejectedCount })}</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('admin.vehicleRegistrations.table.owner', 'Chủ xe')}</TableHead>
                      <TableHead>{t('admin.vehicleRegistrations.table.type', 'Loại xe')}</TableHead>
                      <TableHead>{t('admin.vehicleRegistrations.table.licensePlate', 'Biển số')}</TableHead>
                      <TableHead>{t('admin.vehicleRegistrations.table.color', 'Màu sắc')}</TableHead>
                      <TableHead>{t('admin.vehicleRegistrations.table.apartment', 'Căn hộ')}</TableHead>
                      <TableHead>{t('admin.vehicleRegistrations.table.registrationDate', 'Thời gian đăng ký')}</TableHead>
                      <TableHead>{t('admin.vehicleRegistrations.table.status', 'Trạng thái')}</TableHead>
                      <TableHead>{t('admin.vehicleRegistrations.table.actions', 'Hành động')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allVehicles
                      .filter(v => v.status === 'REJECTED')
                      .map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell className="font-medium">{vehicle.userFullName || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getVehicleTypeIcon(vehicle.vehicleType)}
                            {vehicle.vehicleTypeDisplayName || vehicle.vehicleType}
                          </div>
                        </TableCell>
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
                        <TableCell>{getStatusBadge(vehicle.status, vehicle.statusDisplayName)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleRestore(vehicle.id)}
                              disabled={!canApproveVehicle(vehicle)}
                              title={canApproveVehicle(vehicle) ? 'Khôi phục' : 'Không thể khôi phục - Bãi xe đã đầy hoặc không có cấu hình hoạt động'}
                            >
                              {t('admin.vehicleRegistrations.actions.restore', 'Khôi phục')}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="capacity-overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {t('admin.vehicleRegistrations.capacity.overview.title.full', 'Tổng quan giới hạn xe')}
                </CardTitle>
                <CardDescription>
                  {t('admin.vehicleRegistrations.capacity.overview.description', 'Xem tình trạng sức chứa xe của tất cả tòa nhà')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VehicleCapacityOverview />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="capacity-config" className="space-y-4">
            <VehicleCapacityManager />
          </TabsContent>
        </Tabs>

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-4">
              <h3 className="text-lg font-semibold mb-2">{t('admin.vehicleRegistrations.rejectModal.title', 'Chọn lý do từ chối')}</h3>
              <div className="space-y-2 mb-2">
                <div className="text-sm text-gray-600">{t('admin.vehicleRegistrations.rejectModal.quickReasons', 'Lý do nhanh:')}</div>
                <div className="flex flex-wrap gap-2">
                  {['Khách Hàng Yêu Cầu', 'Chậm thanh toán'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className="px-2 py-1 text-xs rounded border hover:bg-gray-50"
                      onClick={() => setRejectionReason(prev => prev ? `${prev}\n${preset}` : preset)}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                className="w-full border rounded p-2 h-28"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Lý do từ chối..."
              />
              <div className="mt-3 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowRejectModal(false)}>{t('admin.vehicleRegistrations.rejectModal.cancel', 'Hủy')}</Button>
                <Button
                  className="bg-red-600 text-white"
                  onClick={handleReject}
                >
                  {t('admin.vehicleRegistrations.rejectModal.confirm', 'Xác nhận từ chối')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Cancel vehicle modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-4">
              <h3 className="text-lg font-semibold mb-2">{t('admin.vehicleRegistrations.cancelModal.title', 'Xác nhận hủy đăng ký xe')}</h3>
              <p className="text-gray-600 mb-2">{t('admin.vehicleRegistrations.cancelModal.description', 'Bạn có chắc chắn muốn hủy đăng ký xe này không?')}</p>
              <div className="space-y-2 mb-2">
                <div className="text-sm text-gray-600">{t('admin.vehicleRegistrations.cancelModal.quickReasons', 'Chọn lý do nhanh:')}</div>
                <div className="flex flex-wrap gap-2">
                  {['Khách Hàng Yêu Cầu', 'Chậm thanh toán'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className="px-2 py-1 text-xs rounded border hover:bg-gray-50"
                      onClick={() => {
                        setCancelReason(prev => prev ? `${prev}\n${preset}` : preset);
                        setCancelError('');
                      }}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                className={`w-full border rounded p-2 h-28 ${cancelError ? 'border-red-500' : ''}`}
                value={cancelReason}
                onChange={(e) => { setCancelReason(e.target.value); setCancelError(''); }}
                placeholder={t('admin.vehicleRegistrations.cancelModal.placeholder', 'Nhập lý do hủy đăng ký...')}
              />
              {cancelError && <div className="text-sm text-red-600 mt-1">{cancelError}</div>}
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowCancelModal(false)}>{t('admin.vehicleRegistrations.cancelModal.cancel', 'Hủy')}</Button>
                <Button
                  variant="destructive"
                  onClick={handleCancel}
                  disabled={cancelling}
                >
                  {cancelling ? t('admin.vehicleRegistrations.cancelModal.processing', 'Đang xử lý...') : t('admin.vehicleRegistrations.cancelModal.confirm', 'Xác nhận hủy')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
