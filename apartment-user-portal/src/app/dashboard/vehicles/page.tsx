"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Simple toast function
const showToast = (title: string, description: string, type: 'success' | 'error' = 'success') => {
  // Simple alert for now, can be replaced with proper toast library
  alert(`${title}: ${description}`);
};

const API_BASE_URL = 'http://localhost:8080';

interface VehicleType {
  value: string;
  displayName: string;
  monthlyFee: number;
}

interface Apartment {
  id: number;
  unitNumber: string;
  buildingId: number;
  floorNumber?: number;
  area?: number;
}

interface Vehicle {
  id: number;
  licensePlate: string;
  vehicleType: string;
  vehicleTypeDisplayName: string;
  brand: string;
  model: string;
  color: string;
  imageUrls?: string[];
  status: string;
  statusDisplayName: string;
  monthlyFee: number;
  apartmentId: number;
  apartmentUnitNumber: string;
  createdAt: string;
}

interface BuildingVehicle {
  id: number;
  licensePlate: string;
  vehicleType: string;
  vehicleTypeDisplayName: string;
  brand: string;
  model: string;
  color: string;
  imageUrls?: string[];
  status: string;
  statusDisplayName: string;
  monthlyFee: number;
  apartmentId: number;
  apartmentUnitNumber: string;
  userFullName: string;
  buildingId?: number;
  createdAt: string;
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [buildingVehicles, setBuildingVehicles] = useState<BuildingVehicle[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [buildingVehiclesLoading, setBuildingVehiclesLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    licensePlate: '',
    vehicleType: '',
    apartmentId: '',
    brand: '',
    model: '',
    color: '',
    imageUrls: [] as string[]
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Fetch vehicle types
  useEffect(() => {
    const fetchVehicleTypes = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/vehicles/types`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch vehicle types');
        }

        const data = await response.json();
        setVehicleTypes(data);
      } catch (error) {
        console.error('Error fetching vehicle types:', error);
        showToast("Lỗi", "Không thể tải danh sách loại phương tiện", "error");
      }
    };

    fetchVehicleTypes();
  }, []);

  // Fetch user's apartments
  useEffect(() => {
    const fetchApartments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/apartments/my`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch apartments');
        }

        const data = await response.json();
        setApartments(data);
      } catch (error) {
        console.error('Error fetching apartments:', error);
        showToast("Lỗi", "Không thể tải danh sách căn hộ", "error");
      }
    };

    fetchApartments();
  }, []);

  // Fetch user's vehicles
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/api/vehicles/my`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch vehicles');
        }

        const data = await response.json();
        setVehicles(data);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
        showToast("Lỗi", "Không thể tải danh sách xe", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
    
    // Create previews
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllImages = () => {
    setSelectedFiles([]);
    setImagePreviews([]);
  };

  const uploadImages = async (files: File[]): Promise<string[]> => {
    if (files.length === 0) return [];

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/vehicles/upload-images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload images');
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.licensePlate || !formData.vehicleType || !formData.apartmentId) {
      showToast("Lỗi", "Vui lòng điền đầy đủ thông tin bắt buộc", "error");
      return;
    }

    try {
      setSubmitting(true);
      
      // Upload images first
      let imageUrls: string[] = [];
      if (selectedFiles.length > 0) {
        imageUrls = await uploadImages(selectedFiles);
      }

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/vehicles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          imageUrls: imageUrls,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create vehicle');
      }

      const newVehicle = await response.json();
      setVehicles(prev => [...prev, newVehicle]);
      
      // Reset form
      setFormData({
        licensePlate: '',
        vehicleType: '',
        apartmentId: '',
        brand: '',
        model: '',
        color: '',
        imageUrls: []
      });
      clearAllImages();
      
      showToast("Thành công", "Đăng ký xe thành công", "success");
    } catch (error) {
      console.error('Error creating vehicle:', error);
      showToast("Lỗi", error instanceof Error ? error.message : "Không thể đăng ký xe", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Fetch building vehicles for transparency
  const fetchBuildingVehicles = async () => {
    try {
      setBuildingVehiclesLoading(true);
      const token = localStorage.getItem('token');
      
      // Thử sử dụng API admin để lấy tất cả xe đang chờ duyệt
      try {
        console.log('Trying admin API for pending vehicles...');
        const adminResponse = await fetch(`${API_BASE_URL}/api/admin/vehicles/pending`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (adminResponse.ok) {
          const adminVehicles = await adminResponse.json();
          console.log('Admin API response:', adminVehicles);
          
          // Lọc xe thuộc các căn hộ của user hiện tại
          const userApartmentIds = apartments.map(apt => apt.id);
          const filteredVehicles = adminVehicles.filter((vehicle: any) => 
            userApartmentIds.includes(vehicle.apartmentId)
          );
          
          // Thêm thông tin căn hộ
          const vehiclesWithApartmentInfo = filteredVehicles.map((vehicle: any) => {
            const apartment = apartments.find(apt => apt.id === vehicle.apartmentId);
            return {
              ...vehicle,
              apartmentUnitNumber: apartment?.unitNumber || vehicle.apartmentUnitNumber,
              buildingId: apartment?.buildingId || vehicle.buildingId,
              userFullName: vehicle.userFullName || 'Không rõ'
            };
          });
          
          // Sắp xếp theo thứ tự ưu tiên
          vehiclesWithApartmentInfo.sort((a, b) => {
            if (a.buildingId !== b.buildingId) {
              return (a.buildingId || 0) - (b.buildingId || 0);
            }
            if (a.apartmentUnitNumber !== b.apartmentUnitNumber) {
              return a.apartmentUnitNumber.localeCompare(b.apartmentUnitNumber);
            }
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          });
          
          setBuildingVehicles(vehiclesWithApartmentInfo);
          return;
        }
      } catch (adminError) {
        console.log('Admin API failed, trying apartment API...', adminError);
      }
      
      // Fallback: Lấy danh sách xe từ tất cả căn hộ của user
      const allBuildingVehicles: BuildingVehicle[] = [];
      
      for (const apartment of apartments) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/vehicles/apartment/${apartment.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const apartmentVehicles = await response.json();
            console.log(`Vehicles for apartment ${apartment.id}:`, apartmentVehicles);
            // Chỉ lấy xe có status PENDING và thêm thông tin căn hộ
            const pendingVehicles = apartmentVehicles
              .filter((vehicle: any) => vehicle.status === 'PENDING')
              .map((vehicle: any) => ({
                ...vehicle,
                apartmentUnitNumber: apartment.unitNumber,
                buildingId: apartment.buildingId,
                userFullName: vehicle.userFullName || 'Không rõ'
              }));
            allBuildingVehicles.push(...pendingVehicles);
          }
        } catch (error) {
          console.error(`Error fetching vehicles for apartment ${apartment.id}:`, error);
        }
      }
      
      // Sắp xếp theo thứ tự ưu tiên: Tòa nhà -> Căn hộ -> Ngày đăng ký (cũ nhất trước)
      const sortedVehicles = allBuildingVehicles.sort((a, b) => {
        // Sắp xếp theo tòa nhà trước
        const buildingA = a.buildingId || 0;
        const buildingB = b.buildingId || 0;
        if (buildingA !== buildingB) {
          return buildingA - buildingB;
        }
        
        // Nếu cùng tòa nhà, sắp xếp theo căn hộ
        const apartmentA = parseInt(a.apartmentUnitNumber.replace(/\D/g, ''));
        const apartmentB = parseInt(b.apartmentUnitNumber.replace(/\D/g, ''));
        if (apartmentA !== apartmentB) {
          return apartmentA - apartmentB;
        }
        
        // Nếu cùng căn hộ, sắp xếp theo ngày đăng ký (cũ nhất trước - FIFO)
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      });
      
      setBuildingVehicles(sortedVehicles);
    } catch (error) {
      console.error('Error fetching building vehicles:', error);
      showToast("Lỗi", "Không thể tải danh sách xe trong tòa nhà", "error");
    } finally {
      setBuildingVehiclesLoading(false);
    }
  };

  // Fetch building vehicles when apartments change
  useEffect(() => {
    if (apartments.length > 0) {
      fetchBuildingVehicles();
    }
  }, [apartments]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", text: string }> = {
      'PENDING': { variant: 'secondary', text: 'Chờ duyệt' },
      'APPROVED': { variant: 'default', text: 'Đã duyệt' },
      'REJECTED': { variant: 'destructive', text: 'Từ chối' },
      'ACTIVE': { variant: 'default', text: 'Đang hoạt động' },
      'INACTIVE': { variant: 'outline', text: 'Không hoạt động' },
      'EXPIRED': { variant: 'destructive', text: 'Hết hạn' },
    };

    const config = statusConfig[status] || { variant: 'outline', text: status };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getWaitingTime = (createdAt: string) => {
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - createdDate.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds} giây`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} phút`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} giờ`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ngày`;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Tabs defaultValue="register" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="register">Đăng ký xe</TabsTrigger>
          <TabsTrigger value="my-vehicles">Xe của tôi</TabsTrigger>
          <TabsTrigger value="building-vehicles">Xe chờ duyệt</TabsTrigger>
        </TabsList>

        <TabsContent value="register" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Đăng ký xe mới</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="licensePlate">Biển số xe *</Label>
                    <Input
                      id="licensePlate"
                      value={formData.licensePlate}
                      onChange={(e) => setFormData(prev => ({ ...prev, licensePlate: e.target.value }))}
                      placeholder="Ví dụ: 30A-12345"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="vehicleType">Loại phương tiện *</Label>
                    <Select
                      value={formData.vehicleType}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, vehicleType: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại phương tiện" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicleTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.displayName} - {formatCurrency(type.monthlyFee)}/tháng
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="apartmentId">Căn hộ *</Label>
                    <Select
                      value={formData.apartmentId}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, apartmentId: value }))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn căn hộ" />
                      </SelectTrigger>
                      <SelectContent>
                        {apartments.map((apartment) => (
                          <SelectItem key={apartment.id} value={apartment.id.toString()}>
                            {apartment.unitNumber} - Tòa {apartment.buildingId}
                            {apartment.floorNumber && ` - Tầng ${apartment.floorNumber}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="brand">Hãng xe</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                      placeholder="Ví dụ: Honda, Toyota"
                    />
                  </div>

                  <div>
                    <Label htmlFor="model">Dòng xe</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                      placeholder="Ví dụ: Wave Alpha, Vios"
                    />
                  </div>

                  <div>
                    <Label htmlFor="color">Màu sắc</Label>
                    <Input
                      id="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      placeholder="Ví dụ: Đen, Trắng"
                    />
                  </div>
                </div>

                <div>
                  <Label>Hình ảnh xe</Label>
                  <div className="mt-2">
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="mb-2"
                    />
                    {imagePreviews.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-20 h-20 object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={clearAllImages}
                          className="h-20"
                        >
                          Xóa tất cả
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? 'Đang đăng ký...' : 'Đăng ký xe'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-vehicles" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách xe của tôi</CardTitle>
            </CardHeader>
            <CardContent>
              {vehicles.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Bạn chưa có xe nào được đăng ký
                </div>
              ) : (
                <div className="space-y-4">
                  {vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{vehicle.licensePlate}</h3>
                          <p className="text-sm text-gray-600">
                            {vehicle.brand} {vehicle.model} - {vehicle.color}
                          </p>
                          <p className="text-sm text-gray-600">
                            Căn hộ: {vehicle.apartmentUnitNumber}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(vehicle.status)}
                          <span className="text-sm font-medium">
                            {formatCurrency(vehicle.monthlyFee)}/tháng
                          </span>
                        </div>
                      </div>
                      
                      {vehicle.imageUrls && vehicle.imageUrls.length > 0 && (
                        <div className="flex gap-2 mt-2 overflow-x-auto">
                          {vehicle.imageUrls.map((url, index) => (
                            <img
                              key={index}
                              src={url}
                              alt={`Vehicle ${index + 1}`}
                              className="w-16 h-16 object-cover rounded"
                            />
                          ))}
                        </div>
                      )}
                      
                      <div className="mt-2 text-xs text-gray-500">
                        Đăng ký: {new Date(vehicle.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="building-vehicles" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Danh sách xe chờ duyệt trong tòa nhà</CardTitle>
              <p className="text-sm text-gray-600">
                Xem tất cả xe đang chờ duyệt trong tòa nhà để minh bạch việc quản lý
              </p>
              <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Thứ tự ưu tiên:</strong> Xe được sắp xếp theo thứ tự: Tòa nhà → Căn hộ → Thời gian đăng ký (cũ nhất trước)
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Button 
                  onClick={fetchBuildingVehicles} 
                  disabled={buildingVehiclesLoading}
                  variant="outline"
                  size="sm"
                >
                  {buildingVehiclesLoading ? 'Đang tải...' : 'Làm mới danh sách'}
                </Button>
              </div>

              {buildingVehiclesLoading ? (
                <div className="text-center py-8">Đang tải danh sách xe...</div>
              ) : buildingVehicles.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Không có xe nào đang chờ duyệt trong tòa nhà
                </div>
              ) : (
                <div className="space-y-4">
                  {buildingVehicles.map((vehicle, index) => (
                    <div key={vehicle.id} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          {/* Số thứ tự ưu tiên và biển số xe */}
                          <div className="flex items-center gap-3 mb-2">
                            <div className="bg-blue-100 text-blue-800 text-sm font-bold px-3 py-1 rounded-full">
                              Ưu tiên #{index + 1}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">{vehicle.licensePlate}</h3>
                          </div>
                          
                          {/* Thông tin xe */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">
                                <span className="font-medium">Loại xe:</span> {vehicle.vehicleTypeDisplayName}
                              </p>
                              <p className="text-sm text-gray-600 mb-1">
                                <span className="font-medium">Hãng:</span> {vehicle.brand} {vehicle.model}
                              </p>
                              <p className="text-sm text-gray-600 mb-1">
                                <span className="font-medium">Màu sắc:</span> {vehicle.color}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600 mb-1">
                                <span className="font-medium">Căn hộ:</span> {vehicle.apartmentUnitNumber}
                                {vehicle.buildingId && ` - Tòa ${vehicle.buildingId}`}
                              </p>
                              <p className="text-sm text-gray-600 mb-1">
                                <span className="font-medium">Chủ xe:</span> {vehicle.userFullName || 'Không rõ'}
                              </p>
                              <p className="text-sm text-gray-600 mb-1">
                                <span className="font-medium">Thời gian chờ:</span> {getWaitingTime(vehicle.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-3">
                          {getStatusBadge(vehicle.status)}
                        </div>
                      </div>
                      
                      {/* Hình ảnh xe */}
                      {vehicle.imageUrls && vehicle.imageUrls.length > 0 && (
                        <div className="border-t pt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Hình ảnh xe:</p>
                          <div className="flex gap-2 overflow-x-auto">
                            {vehicle.imageUrls.map((url, imgIndex) => (
                              <img
                                key={imgIndex}
                                src={url}
                                alt={`Vehicle ${imgIndex + 1}`}
                                className="w-20 h-20 object-cover rounded border"
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Ngày đăng ký */}
                      <div className="border-t pt-4 mt-4">
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">Ngày đăng ký:</span> {new Date(vehicle.createdAt).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 