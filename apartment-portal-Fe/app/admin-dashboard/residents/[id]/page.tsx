"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  ArrowLeft,
  Edit,
  User,
  Phone,
  Mail,
  Calendar,
  CreditCard,
  MapPin,
  Building,
  AlertCircle,
  CheckCircle,
  Car,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useResidents, Resident, ApartmentResident } from '@/hooks/use-residents';
import { getResidentIdCard, formatIdCard } from '@/lib/resident-utils';
import { useApartments, Vehicle, VEHICLE_TYPE_DISPLAY, VEHICLE_TYPE_COLORS } from '@/hooks/use-apartments';
import { apiFetch } from '@/lib/api';

export default function ResidentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const residentId = parseInt(params.id as string);
  
  const { 
    loading, 
    error, 
    getResidentById, 
    getApartmentsByResidentId,
    clearMessages 
  } = useResidents();
  
  const [resident, setResident] = useState<Resident | null>(null);
  const [apartmentRelations, setApartmentRelations] = useState<ApartmentResident[]>([]);
  const [loadingApartments, setLoadingApartments] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);


  useEffect(() => {
    if (residentId) {
      loadResidentDetail();
      loadApartmentRelations();
    }
  }, [residentId]);

  // Load vehicles when resident data is available
  useEffect(() => {
    if (resident?.id) {
      loadResidentVehicles();
    }
  }, [resident]);

  const loadResidentDetail = async () => {
    try {
      const data = await getResidentById(residentId);
      if (data) {
        setResident(data);
      }
    } catch (err) {
      console.error('Error loading resident detail:', err);
    }
  };

  const loadApartmentRelations = async () => {
    setLoadingApartments(true);
    try {
      console.log(`🔍 Loading apartment relations for resident ID: ${residentId}`);
      const relations = await getApartmentsByResidentId(residentId);
      console.log('📋 Raw apartment relations data:', relations);
      
             if (relations) {
         setApartmentRelations(relations);
         console.log(`✅ Found ${relations.length} apartment relations`);
       } else {
        console.log('❌ No apartment relations found');
        setApartmentRelations([]);
      }
    } catch (err) {
      console.error('💥 Error loading apartment relations:', err);
      setApartmentRelations([]);
    } finally {
      setLoadingApartments(false);
    }
  };



  const loadResidentVehicles = async () => {
    if (!resident?.id) return;
    
    setLoadingVehicles(true);
    try {
      // Thử lấy vehicles theo user ID
      const response = await apiFetch(`/api/admin/vehicles/user/${resident.id}`);
      if (response.ok) {
        const vehicleData = await response.json();
        
        if (Array.isArray(vehicleData)) {
          const vehiclesWithMapping = vehicleData.map(vehicle => ({
            ...vehicle,
            ownerName: resident.fullName,
            // Đảm bảo backward compatibility với field mapping
            type: vehicle.type || vehicle.vehicleType,
            vehicleType: vehicle.vehicleType || vehicle.type
          }));
          setVehicles(vehiclesWithMapping);
        } else {
          setVehicles([]);
        }
      } else {
        setVehicles([]);
      }
    } catch (err) {
      console.error('Error loading resident vehicles:', err);
      setVehicles([]);
    } finally {
      setLoadingVehicles(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800">Hoạt động</Badge>;
      case 'INACTIVE':
        return <Badge className="bg-red-100 text-red-800">Không hoạt động</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getGenderBadge = (gender: string) => {
    switch (gender) {
      case 'MALE':
        return <Badge className="bg-blue-100 text-blue-800">Nam</Badge>;
      case 'FEMALE':
        return <Badge className="bg-pink-100 text-pink-800">Nữ</Badge>;
      case 'OTHER':
        return <Badge className="bg-gray-100 text-gray-800">Khác</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{gender}</Badge>;
    }
  };

  const getRelationTypeBadge = (relationType: string) => {
    switch (relationType?.toUpperCase()) {
      case 'OWNER':
        return <Badge className="bg-purple-100 text-purple-800">Chủ hộ</Badge>;
      case 'TENANT':
        return <Badge className="bg-blue-100 text-blue-800">Người thuê</Badge>;
      case 'FAMILY':
        return <Badge className="bg-green-100 text-green-800">Thành viên gia đình</Badge>;
      case 'CHỦ SỞ HỮU':
        return <Badge className="bg-purple-100 text-purple-800">Chủ hộ</Badge>;
      case 'NGƯỜI THUÊ':
        return <Badge className="bg-blue-100 text-blue-800">Người thuê</Badge>;
      case 'THÀNH VIÊN GIA ĐÌNH':
        return <Badge className="bg-green-100 text-green-800">Thành viên gia đình</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{relationType || 'Không rõ'}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Chưa cập nhật';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <AdminLayout title="Chi tiết cư dân">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải thông tin cư dân...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Chi tiết cư dân">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            <Button variant="outline" onClick={loadResidentDetail}>
              🔄 Thử lại
            </Button>
            <Button asChild variant="outline">
              <Link href="/debug-residents">🐛 Debug API</Link>
            </Button>
          </div>
          
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <div className="space-y-2">
                <div className="font-medium">Lỗi khi tải thông tin cư dân ID: {residentId}</div>
                <div>{error}</div>
                <div className="text-sm">
                  Có thể cư dân này không tồn tại hoặc không có quyền "RESIDENT". 
                  <Link href="/debug-residents" className="underline ml-1">
                    Kiểm tra danh sách cư dân có sẵn
                  </Link>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </AdminLayout>
    );
  }

  if (!resident) {
    return (
      <AdminLayout title="Chi tiết cư dân">
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            <Button variant="outline" onClick={loadResidentDetail}>
              🔄 Thử lại
            </Button>
            <Button asChild variant="outline">
              <Link href="/debug-residents">🐛 Debug API</Link>
            </Button>
          </div>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div>Không tìm thấy thông tin cư dân ID: {residentId}</div>
                <div className="text-sm text-gray-600">
                  Cư dân này có thể không tồn tại hoặc không có role "RESIDENT". 
                  <Link href="/debug-residents" className="underline ml-1">
                    Xem danh sách cư dân có sẵn
                  </Link>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={`Chi tiết cư dân: ${resident.fullName}`}>
      <div className="space-y-6">
        {/* Header with actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Chi tiết cư dân
              </h2>
              <p className="text-gray-600">
                Thông tin chi tiết về cư dân {resident.fullName}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link href={`/admin-dashboard/residents/edit/${resident.id}`}>
              <Button className="flex items-center space-x-2">
                <Edit className="h-4 w-4" />
                <span>Chỉnh sửa</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Thông tin cá nhân
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Họ tên</p>
                    <p className="font-medium">{resident.fullName}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <CreditCard className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">CMND/CCCD</p>
                    <p className="font-medium">{formatIdCard(getResidentIdCard(resident))}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Số điện thoại</p>
                    <p className="font-medium">{resident.phoneNumber}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{resident.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Ngày sinh</p>
                    <p className="font-medium">{formatDate(resident.dateOfBirth)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Trạng thái</p>
                    <div className="mt-1">{getStatusBadge(resident.status)}</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Apartment Relations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Căn hộ đã liên kết ({apartmentRelations.length})
            </CardTitle>
          </CardHeader>
                     <CardContent>
             {/* Debug Info */}
             {process.env.NODE_ENV === 'development' && (
               <div className="mb-4 p-3 bg-gray-100 rounded text-xs">
                 <div className="font-medium mb-2">🔍 Debug Info:</div>
                 <div>Resident ID: {residentId}</div>
                 <div>Relations found: {apartmentRelations.length}</div>
                 <div>Raw relations: {JSON.stringify(apartmentRelations, null, 2)}</div>
               </div>
             )}
             {loadingApartments ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Đang tải danh sách căn hộ...</p>
                </div>
              </div>
            ) : apartmentRelations.length === 0 ? (
              <div className="text-center py-8">
                <Building className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Cư dân này chưa được liên kết với căn hộ nào.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                                 <Table>
                   <TableHeader>
                     <TableRow>
                       <TableHead>Căn hộ</TableHead>
                       <TableHead>Loại quan hệ</TableHead>
                       <TableHead>Ngày vào ở</TableHead>
                       <TableHead>Ngày rời đi</TableHead>
                       <TableHead>Trạng thái</TableHead>
                     </TableRow>
                   </TableHeader>
                   <TableBody>
                                           {apartmentRelations.map((relation, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            <Link 
                              href={`/admin-dashboard/apartments/${relation.apartmentId}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {relation.apartmentUnitNumber || relation.unitNumber || relation.unit || `#${relation.apartmentId}`}
                            </Link>
                          </TableCell>
                          <TableCell>{getRelationTypeBadge(relation.relationType)}</TableCell>
                          <TableCell>{formatDate(relation.moveInDate)}</TableCell>
                          <TableCell>
                            {relation.moveOutDate ? formatDate(relation.moveOutDate) : (
                              <Badge className="bg-green-100 text-green-800">Đang ở</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {relation.moveOutDate ? (
                              <Badge className="bg-gray-100 text-gray-800">Đã rời đi</Badge>
                            ) : (
                              <Badge className="bg-green-100 text-green-800">Đang sinh sống</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                   </TableBody>
                 </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Registered Vehicles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Xe đăng ký ({vehicles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingVehicles ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Đang tải danh sách xe...</p>
                </div>
              </div>
            ) : vehicles.length === 0 ? (
              <div className="text-center py-8">
                <Car className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Cư dân này chưa đăng ký xe nào.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Loại xe</TableHead>
                      <TableHead>Thương hiệu & Model</TableHead>
                      <TableHead>Biển số</TableHead>
                      <TableHead>Màu sắc</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Phí hàng tháng</TableHead>
                      <TableHead>Ngày đăng ký</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicles.map((vehicle, index) => (
                      <TableRow key={vehicle.id || index}>
                        <TableCell>
                          <Badge 
                            className={`${VEHICLE_TYPE_COLORS[vehicle.vehicleType || vehicle.type] || 'bg-gray-100 text-gray-800'} border-0`}
                          >
                            {VEHICLE_TYPE_DISPLAY[vehicle.vehicleType || vehicle.type] || vehicle.vehicleType || vehicle.type || 'Không rõ loại'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {vehicle.brand || 'Không rõ hãng'} {vehicle.model && `- ${vehicle.model}`}
                            </div>
                            {vehicle.model && vehicle.brand && (
                              <div className="text-xs text-muted-foreground">
                                Model: {vehicle.model}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-mono font-bold text-lg bg-yellow-50 border border-yellow-200 rounded px-2 py-1 inline-block">
                            {vehicle.licensePlate}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full border border-gray-300" 
                              style={{ backgroundColor: vehicle.color?.toLowerCase() || '#gray' }}
                              title={vehicle.color}
                            ></div>
                            <span className="capitalize">{vehicle.color || 'Không rõ'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={vehicle.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                                      vehicle.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'}
                          >
                            {vehicle.status === 'APPROVED' ? 'Đã duyệt' : 
                             vehicle.status === 'PENDING' ? 'Chờ duyệt' : 
                             vehicle.status === 'REJECTED' ? 'Từ chối' : vehicle.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {vehicle.monthlyFee ? 
                            new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(vehicle.monthlyFee) 
                            : 'Chưa có'
                          }
                        </TableCell>
                        <TableCell>
                          {vehicle.registrationDate ? formatDate(vehicle.registrationDate) : 
                           vehicle.createdAt ? formatDate(vehicle.createdAt) : 'Chưa có'}
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
    </AdminLayout>
  );
}