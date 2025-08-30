"use client";

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Car, ArrowLeft, Eye, Check, X, Calendar, User, Hash, Palette, Home, Clock, Car as CarIcon } from 'lucide-react';
import { vehiclesApi, Vehicle } from '@/lib/api';
import { getToken } from '@/lib/auth';
import { useVehicleCapacity } from '@/hooks/use-vehicle-capacity';
import Link from 'next/link';

export default function PendingCarsPage() {
  const { t } = useLanguage();
  const { getConfigByBuilding, configs } = useVehicleCapacity();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [thumbIndexByVehicle, setThumbIndexByVehicle] = useState<Record<number, number>>({});
  const [validUrlsByVehicle, setValidUrlsByVehicle] = useState<Record<number, string[]>>({});

  const buildImageUrl = (rawUrl: string): string => {
    try {
      const token = getToken() || '';
      const encoded = encodeURIComponent(rawUrl);
      return `/api/image-proxy?url=${encoded}${token ? `&token=${encodeURIComponent(token)}` : ''}`;
    } catch {
      return rawUrl;
    }
  };

  const getImageSrc = (rawUrl: string, useProxyFirst = true, cacheBust?: string | number): string => {
    const cacheParam = cacheBust ? `&v=${cacheBust}` : '';
    if (useProxyFirst) {
      const proxy = buildImageUrl(rawUrl) + cacheParam;
      return proxy;
    }
    const url = new URL(rawUrl, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    if (cacheBust) {
      url.searchParams.set('v', String(cacheBust));
    }
    return url.toString();
  };

  const validateImageUrl = async (rawUrl: string): Promise<string | null> => {
    const tryList = [getImageSrc(rawUrl, true, Date.now()), getImageSrc(rawUrl, false, Date.now())];
    for (const url of tryList) {
      try {
        const res = await fetch(url, { method: 'GET', cache: 'no-store' });
        // Some backends return application/octet-stream; accept any OK response
        if (res.ok) {
          return url; // valid reachable URL
        }
      } catch (err) {
        console.warn('Validate image failed:', url, err);
        // ignore and try next
      }
    }
    return null;
  };

  const validateImagesForVehicle = async (vehicle: Vehicle) => {
    const urls = (vehicle.imageUrls || []).map(u => (u || '').trim()).filter(Boolean);
    const results: string[] = [];
    for (const u of urls) {
      const valid = await validateImageUrl(u);
      if (valid) results.push(valid);
    }
    setValidUrlsByVehicle(prev => ({ ...prev, [vehicle.id]: results }));
    // reset thumbnail index if needed
    if ((thumbIndexByVehicle[vehicle.id] ?? 0) >= results.length) {
      setThumbIndexByVehicle(prev => ({ ...prev, [vehicle.id]: 0 }));
    }
  };

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

  // Lọc chỉ lấy ô tô và sắp xếp theo thời gian đăng ký (FIFO)
  const carVehicles = vehicles
    .filter(v => 
      (v.vehicleType?.toLowerCase().includes('car') || 
       v.vehicleTypeDisplayName?.toLowerCase().includes('ô tô'))
    )
    .sort((a, b) => {
      // Sắp xếp theo createdAt (xe đăng ký trước lên đầu)
      if (!a.createdAt || !b.createdAt) return 0;
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

  // Kiểm tra khả năng duyệt xe dựa trên giới hạn và thứ tự FIFO
  const canApproveVehicle = (vehicle: Vehicle) => {
    // Kiểm tra thứ tự FIFO - chỉ cho phép duyệt xe đầu tiên
    const vehicleIndex = carVehicles.findIndex(v => v.id === vehicle.id);
    if (vehicleIndex > 0) {
      // Nếu không phải xe đầu tiên, kiểm tra xem xe trước đó có thể duyệt không
      const previousVehicle = carVehicles[vehicleIndex - 1];
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
    
    if (vehicleType?.includes('car') || vehicleTypeDisplay?.includes('ô tô')) {
      return (config.currentCars || 0) < config.maxCars;
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
    
    if (vehicleType?.includes('car') || vehicleTypeDisplay?.includes('ô tô')) {
      return {
        max: config.maxCars,
        current: config.currentCars || 0,
        remaining: config.remainingCars || 0,
        label: 'Ô tô'
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

  const handleViewImages = (vehicle: Vehicle) => {
    console.log('Opening images for vehicle:', vehicle);
    console.log('Image URLs:', vehicle.imageUrls);
    setSelectedVehicle(vehicle);
    setShowImageModal(true);
    // kick off validation when opening
    validateImagesForVehicle(vehicle);
  };

  const getThumbnailUrl = (vehicle: Vehicle): string | null => {
    const validated = validUrlsByVehicle[vehicle.id];
    const fallback = vehicle.imageUrls || [];
    const source = (validated && validated.length > 0) ? validated : fallback;
    if (source.length === 0) return null;
    const idx = thumbIndexByVehicle[vehicle.id] ?? 0;
    const chosen = source[idx] || source[0];
    // chosen may already be proxied; if raw, wrap via proxy for consistency
    return chosen.includes('/api/image-proxy') ? chosen : getImageSrc(chosen, true, Date.now());
  };

  // Mobile Card Component
  const VehicleCard = ({ vehicle, index }: { vehicle: Vehicle; index: number }) => {
    const capacityInfo = getVehicleCapacityInfo(vehicle);
    const isFull = capacityInfo ? capacityInfo.current >= capacityInfo.max : false;
    
    return (
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-lg font-bold text-blue-600">#{index + 1}</span>
              </div>
              <div>
                <div className="font-semibold text-lg">{vehicle.licensePlate}</div>
                <div className="text-sm text-gray-500">ID: {vehicle.id}</div>
              </div>
            </div>
            <Badge variant={canApproveVehicle(vehicle) ? "default" : "secondary"}>
              {canApproveVehicle(vehicle) ? "Có thể duyệt" : "Không thể duyệt"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Hình ảnh xe */}
          <div className="flex justify-center">
            {(vehicle.imageUrls && vehicle.imageUrls.length > 0) || (validUrlsByVehicle[vehicle.id]?.length ?? 0) > 0 ? (
              <div 
                className="cursor-pointer group relative"
                onClick={() => handleViewImages(vehicle)}
                title="Click để xem tất cả hình ảnh"
              >
                <img
                  src={getThumbnailUrl(vehicle) || ''}
                  alt={`Hình ảnh xe ${vehicle.licensePlate}`}
                  className="w-24 h-24 object-cover rounded-lg border border-gray-200 shadow-sm transition-transform group-hover:scale-105"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    const validated = validUrlsByVehicle[vehicle.id];
                    const urls = (validated && validated.length > 0) ? validated : (vehicle.imageUrls || []);
                    const current = thumbIndexByVehicle[vehicle.id] ?? 0;
                    const nextIdx = current + 1;

                    if (nextIdx < urls.length) {
                      setThumbIndexByVehicle(prev => ({ ...prev, [vehicle.id]: nextIdx }));
                      const nextUrl = urls[nextIdx];
                      img.src = nextUrl.includes('/api/image-proxy') ? nextUrl : getImageSrc(nextUrl, true, Date.now());
                      return;
                    }

                    img.style.display = 'none';
                    img.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden w-24 h-24 bg-red-50 rounded-lg border border-red-200 flex items-center justify-center text-[10px] text-red-600">
                  Lỗi tải ảnh
                </div>
                {((validUrlsByVehicle[vehicle.id]?.length ?? vehicle.imageUrls?.length ?? 0) > 1) && (
                  <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                    {validUrlsByVehicle[vehicle.id]?.length ?? vehicle.imageUrls?.length}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-24 h-24 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-xs text-gray-500">
                Không có ảnh
              </div>
            )}
          </div>

          {/* Thông tin xe */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-medium">{vehicle.userFullName || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-gray-500" />
                <span>{vehicle.licensePlate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-gray-500" />
                <span>{vehicle.color || '-'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Home className="w-4 h-4 text-gray-500" />
                <span>{vehicle.apartmentUnitNumber || '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>{vehicle.createdAt ? new Date(vehicle.createdAt).toLocaleDateString('vi-VN') : '-'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CarIcon className="w-4 h-4 text-gray-500" />
                <span>{capacityInfo ? `${capacityInfo.current}/${capacityInfo.max}` : '-'}</span>
              </div>
            </div>
          </div>

          {/* Giới hạn xe */}
          {capacityInfo && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Giới hạn xe:</span>
                <Badge variant={isFull ? "destructive" : "default"}>
                  {isFull ? "Đã đầy" : `Còn ${capacityInfo.remaining} chỗ`}
                </Badge>
              </div>
            </div>
          )}

          {/* Hành động */}
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              onClick={() => handleApprove(vehicle.id)}
              disabled={!canApproveVehicle(vehicle)}
              className={`flex-1 ${canApproveVehicle(vehicle) ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"}`}
              title={canApproveVehicle(vehicle) ? "Duyệt xe" : 
                     carVehicles.findIndex(v => v.id === vehicle.id) > 0 ? "Không thể duyệt - Phải duyệt xe trước đó trước" : 
                     "Không thể duyệt - Đã đạt giới hạn"}
            >
              <Check className="w-4 h-4 mr-1" />
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
              <X className="w-4 h-4 mr-1" />
              Từ chối
            </Button>
          </div>
        </CardContent>
      </Card>
    );
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
                <Car className="h-8 w-8 text-blue-600" />
                Ô tô chờ duyệt ({carVehicles.length})
              </h1>
              <p className="text-muted-foreground">
                Danh sách ô tô đang chờ phê duyệt
              </p>
            </div>
          </div>
        </div>

        {/* Thông báo về nguyên tắc FIFO */}
        <Card className="border-blue-200 bg-blue-50 mb-4">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-blue-700">
              <div className="text-lg">ℹ️</div>
              <div>
                <div className="font-medium">Nguyên tắc duyệt xe: FIFO (First In, First Out)</div>
                <div className="text-sm text-blue-600">
                  Xe đăng ký trước sẽ được duyệt trước. Chỉ có thể duyệt xe sau khi xe trước đó đã được xử lý.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile View - Card Layout */}
        <div className="block lg:hidden">
          {loading ? (
            <div className="text-center py-8 text-gray-500">Đang tải...</div>
          ) : carVehicles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Không có ô tô chờ duyệt</div>
          ) : (
            <div className="space-y-4">
              {carVehicles.map((vehicle, index) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} index={index} />
              ))}
            </div>
          )}
        </div>

        {/* Desktop View - Table Layout */}
        <div className="hidden lg:block">
          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Đang tải...</div>
              ) : carVehicles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Không có ô tô chờ duyệt</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-20">Thứ tự</TableHead>
                        <TableHead className="w-24">Hình ảnh</TableHead>
                        <TableHead className="w-32">Chủ xe</TableHead>
                        <TableHead className="w-28">Biển số</TableHead>
                        <TableHead className="w-24">Màu sắc</TableHead>
                        <TableHead className="w-28">Căn hộ</TableHead>
                        <TableHead className="w-32">Thời gian đăng ký</TableHead>
                        <TableHead className="w-32">Giới hạn xe</TableHead>
                        <TableHead className="w-40">Hành động</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {carVehicles.map((vehicle, index) => (
                        <TableRow key={vehicle.id}>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-lg font-bold text-blue-600">#{index + 1}</span>
                              <span className="text-xs text-gray-500">ID: {vehicle.id}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {(vehicle.imageUrls && vehicle.imageUrls.length > 0) || (validUrlsByVehicle[vehicle.id]?.length ?? 0) > 0 ? (
                              <div className="flex justify-center">
                                <div 
                                  className="cursor-pointer group relative"
                                  onClick={() => handleViewImages(vehicle)}
                                  title="Click để xem tất cả hình ảnh"
                                >
                                  <img
                                    src={getThumbnailUrl(vehicle) || ''}
                                    alt={`Hình ảnh xe ${vehicle.licensePlate}`}
                                    className="w-16 h-16 object-cover rounded-lg border border-gray-200 shadow-sm transition-transform group-hover:scale-105 group-hover:shadow-md"
                                    onError={(e) => {
                                      const img = e.target as HTMLImageElement;
                                      const validated = validUrlsByVehicle[vehicle.id];
                                      const urls = (validated && validated.length > 0) ? validated : (vehicle.imageUrls || []);
                                      const current = thumbIndexByVehicle[vehicle.id] ?? 0;
                                      const nextIdx = current + 1;

                                      if (nextIdx < urls.length) {
                                        setThumbIndexByVehicle(prev => ({ ...prev, [vehicle.id]: nextIdx }));
                                        const nextUrl = urls[nextIdx];
                                        img.src = nextUrl.includes('/api/image-proxy') ? nextUrl : getImageSrc(nextUrl, true, Date.now());
                                        return;
                                      }

                                      img.style.display = 'none';
                                      img.nextElementSibling?.classList.remove('hidden');
                                    }}
                                    onLoad={() => {
                                      // no-op
                                    }}
                                  />
                                  {/* Error placeholder, shown when image fails */}
                                  <div className="hidden w-16 h-16 bg-red-50 rounded-lg border border-red-200 flex items-center justify-center text-[10px] text-red-600 px-1 text-center">
                                    Lỗi tải ảnh
                                  </div>
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                                    <div className="text-white opacity-0 group-hover:opacity-100 text-xs font-medium">
                                      Xem tất cả
                                    </div>
                                  </div>
                                  {((validUrlsByVehicle[vehicle.id]?.length ?? vehicle.imageUrls?.length ?? 0) > 1) && (
                                    <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                      {validUrlsByVehicle[vehicle.id]?.length ?? vehicle.imageUrls?.length}
                                    </div>
                                  )}
                                </div>
                                
                              </div>
                            ) : (
                              <div className="w-16 h-16 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center text-xs text-gray-500">
                                Không có ảnh
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="font-medium max-w-[120px] truncate" title={vehicle.userFullName || '-'}>
                            {vehicle.userFullName || '-'}
                          </TableCell>
                          <TableCell className="font-mono text-sm">{vehicle.licensePlate}</TableCell>
                          <TableCell className="max-w-[100px] truncate" title={vehicle.color || '-'}>
                            {vehicle.color || '-'}
                          </TableCell>
                          <TableCell className="font-mono text-sm">{vehicle.apartmentUnitNumber || '-'}</TableCell>
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
                                       carVehicles.findIndex(v => v.id === vehicle.id) > 0 ? "Không thể duyệt - Phải duyệt xe trước đó trước" : 
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
                </div>
              )}
            </CardContent>
          </Card>
        </div>

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

        {/* Image Gallery Modal */}
        {showImageModal && selectedVehicle && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Hình ảnh xe {selectedVehicle.licensePlate}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedVehicle.userFullName} - {selectedVehicle.apartmentUnitNumber}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowImageModal(false);
                    setSelectedVehicle(null);
                  }}
                  className="hover:bg-gray-100"
                >
                  ✕
                </Button>
              </div>

              {/* Image Gallery */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {(() => {
                  const urls = validUrlsByVehicle[selectedVehicle.id] && validUrlsByVehicle[selectedVehicle.id]!.length > 0
                    ? validUrlsByVehicle[selectedVehicle.id]!
                    : (selectedVehicle.imageUrls || []);
                  return urls && urls.length > 0 ? (
                   <div>
                     {/* Debug Info */}
                     <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                       <p className="text-sm text-blue-800">
                        <strong>Debug:</strong> Tìm thấy {urls.length} URL hình ảnh
                       </p>
                      {urls.map((url, idx) => (
                        <p key={idx} className="text-xs text-blue-600 mt-1 break-all">
                          {idx + 1}: {url || '(URL rỗng)'}
                          {url && (
                            <>
                              <br />
                              {!url.includes('/api/image-proxy') && (
                                <>
                                  <span className="text-[11px] text-blue-700">proxy:</span> {getImageSrc(url.trim(), true)}
                                </>
                              )}
                            </>
                          )}
                        </p>
                      ))}
                    </div>
                    
                    {/* Image Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {urls.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          {imageUrl && imageUrl.trim() ? (
                            <img
                              src={imageUrl.includes('/api/image-proxy') ? imageUrl : getImageSrc(imageUrl.trim(), true, `${index}-${Date.now()}`)}
                              alt={`Hình ảnh xe ${selectedVehicle.licensePlate} - ${index + 1}`}
                              className="w-full h-48 object-cover rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
                              onClick={() => {
                                // Mở hình ảnh full size qua proxy để đảm bảo kèm token
                                window.open(imageUrl.includes('/api/image-proxy') ? imageUrl : getImageSrc(imageUrl.trim(), true, Date.now()), '_blank');
                              }}
                              title="Click để xem full size"
                              onError={(e) => {
                                const img = e.target as HTMLImageElement;
                                const isProxy = img.src.includes('/api/image-proxy');
                                const attempt = parseInt(img.getAttribute('data-attempt') || '0', 10);
                                // Thử tối đa 2 lần: chuyển qua lại proxy/raw, sau đó hiện placeholder lỗi
                                if (attempt < 2) {
                                  img.setAttribute('data-attempt', String(attempt + 1));
                                  img.src = getImageSrc(imageUrl.trim(), !isProxy, Date.now());
                                  return;
                                }
                                // Hết cách: ẩn ảnh và hiện placeholder lỗi
                                img.style.display = 'none';
                                img.nextElementSibling?.classList.remove('hidden');
                              }}
                              onLoad={() => {
                                // loaded
                              }}
                            />
                          ) : null}
                          
                          {/* Placeholder cho hình ảnh lỗi */}
                          <div className="hidden w-full h-48 bg-red-50 border-2 border-red-200 rounded-lg flex flex-col items-center justify-center text-red-600">
                            <div className="text-4xl mb-2">❌</div>
                            <div className="text-sm font-medium">Lỗi tải hình ảnh</div>
                            <div className="text-xs text-center mt-1 break-all">
                              {imageUrl || 'URL rỗng'}
                            </div>
                          </div>
                          
                          {/* Placeholder cho URL rỗng */}
                          {(!imageUrl || !imageUrl.trim()) && (
                            <div className="w-full h-48 bg-gray-100 border-2 border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500">
                              <div className="text-4xl mb-2">📷</div>
                              <div className="text-sm font-medium">Không có URL</div>
                              <div className="text-xs text-center mt-1">
                                Hình ảnh {index + 1}
                              </div>
                            </div>
                          )}
                          
                          {/* Action links */}
                          {imageUrl && imageUrl.trim() && (
                            <div className="mt-1 text-[11px] text-blue-600 flex gap-2">
                              <a
                                className="underline"
                                href={imageUrl.includes('/api/image-proxy') ? imageUrl : getImageSrc(imageUrl.trim(), true, Date.now())}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Mở qua proxy
                              </a>
                              <a
                                className="underline"
                                href={imageUrl.includes('/api/image-proxy') ? imageUrl : getImageSrc(imageUrl.trim(), false, Date.now())}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Mở raw
                              </a>
                            </div>
                          )}

                          <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                            {index + 1}/{urls.length}
                          </div>
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all rounded-lg flex items-center justify-center">
                            <div className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">
                              Click để xem full size
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📷</div>
                    <p className="text-gray-600">Không có hình ảnh nào</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Vehicle.imageUrls: {JSON.stringify(selectedVehicle.imageUrls)}
                    </p>
                  </div>
                ); })()}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-600">
                  Tổng cộng: {selectedVehicle.imageUrls?.length || 0} hình ảnh
                </div>
                <div className="text-sm text-gray-500">
                  Click vào hình ảnh để xem full size
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
