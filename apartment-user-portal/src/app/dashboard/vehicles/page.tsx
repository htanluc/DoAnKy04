"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
  createdAt: string;
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    licensePlate: '',
    vehicleType: '',
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
    const newFiles = Array.from(e.target.files || []);
    if (newFiles.length > 0) {
      // Thêm file mới vào danh sách hiện có
      setSelectedFiles(prev => [...prev, ...newFiles]);
      
      // Tạo preview cho file mới và thêm vào danh sách preview hiện có
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviews(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
    
    // Reset input để có thể chọn lại file đã chọn
    e.target.value = '';
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
    const token = localStorage.getItem('token');
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('files', file);
    });

    // Thử upload với auth trước
    try {
      const response = await fetch(`${API_BASE_URL}/api/vehicles/upload-images`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Upload với auth thất bại`);
      }

      return await response.json();
    } catch (error) {
      // Nếu auth thất bại, thử endpoint test
      const testResponse = await fetch(`${API_BASE_URL}/api/test/upload-images`, {
        method: 'POST',
        body: formData,
      });

      if (!testResponse.ok) {
        throw new Error(`HTTP ${testResponse.status}: Upload hình ảnh thất bại`);
      }

      return await testResponse.json();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.licensePlate || !formData.vehicleType) {
      showToast("Lỗi", "Vui lòng điền đầy đủ thông tin bắt buộc", "error");
      return;
    }

    try {
      setSubmitting(true);
      
      // Upload images if selected
      let imageUrls: string[] = [];
      if (selectedFiles.length > 0) {
        imageUrls = await uploadImages(selectedFiles);
      }

      const token = localStorage.getItem('token');
      const requestData = {
        ...formData,
        imageUrls: imageUrls
      };

      const response = await fetch(`${API_BASE_URL}/api/vehicles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Đăng ký xe thất bại');
      }

      const newVehicle = await response.json();
      setVehicles(prev => [...prev, newVehicle]);
      
      // Reset form
      setFormData({
        licensePlate: '',
        vehicleType: '',
        brand: '',
        model: '',
        color: '',
        imageUrls: []
      });
      setSelectedFiles([]);
      setImagePreviews([]);

      showToast("Thành công", "Đăng ký xe thành công! Vui lòng chờ admin duyệt.", "success");
    } catch (error: any) {
      showToast("Lỗi", error.message || "Đăng ký xe thất bại", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="secondary">Chờ duyệt</Badge>;
      case 'APPROVED':
        return <Badge variant="default">Đã duyệt</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive">Từ chối</Badge>;
      case 'ACTIVE':
        return <Badge variant="default">Đang hoạt động</Badge>;
      case 'INACTIVE':
        return <Badge variant="secondary">Không hoạt động</Badge>;
      case 'EXPIRED':
        return <Badge variant="destructive">Hết hạn</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Đăng ký phương tiện</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form đăng ký */}
        <Card>
          <CardHeader>
            <CardTitle>Đăng ký xe mới</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="licensePlate">Biển số xe *</Label>
                <Input
                  id="licensePlate"
                  value={formData.licensePlate}
                  onChange={(e) => setFormData(prev => ({ ...prev, licensePlate: e.target.value }))}
                  placeholder="VD: 30A-12345"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleType">Loại phương tiện *</Label>
                <Select
                  value={formData.vehicleType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, vehicleType: value }))}
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Hãng xe</Label>
                  <Input
                    id="brand"
                    value={formData.brand}
                    onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                    placeholder="VD: Honda, Toyota"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Dòng xe</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                    placeholder="VD: Wave Alpha, Vios"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Màu sắc</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  placeholder="VD: Đen, Trắng, Đỏ"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Hình ảnh xe</Label>
                <div className="text-sm text-gray-600 mb-2">
                  Chọn ảnh để thêm vào danh sách (có thể chọn nhiều ảnh cùng lúc)
                </div>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                {imagePreviews.length > 0 && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm text-gray-600">
                        Đã chọn {imagePreviews.length} ảnh:
                      </div>
                      <button
                        type="button"
                        onClick={clearAllImages}
                        className="text-sm text-red-500 hover:text-red-700"
                      >
                        Xóa tất cả
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img 
                            src={preview} 
                            alt={`Preview ${index + 1}`} 
                            className="w-32 h-32 object-cover rounded-lg border"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Đang đăng ký..." : "Đăng ký xe"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Danh sách xe đã đăng ký */}
        <Card>
          <CardHeader>
            <CardTitle>Xe đã đăng ký</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : vehicles.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>Chưa có xe nào được đăng ký</p>
              </div>
            ) : (
              <div className="space-y-4">
                {vehicles.map((vehicle) => (
                  <div key={vehicle.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-start space-x-3">
                        {vehicle.imageUrls && vehicle.imageUrls.length > 0 && (
                          <div className="flex space-x-1">
                            {vehicle.imageUrls.slice(0, 2).map((imageUrl, index) => (
                              <img 
                                key={index}
                                src={`${API_BASE_URL}${imageUrl}`} 
                                alt={`${vehicle.licensePlate} ${index + 1}`}
                                className="w-16 h-16 object-cover rounded-lg border"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ))}
                            {vehicle.imageUrls.length > 2 && (
                              <div className="w-16 h-16 bg-gray-200 rounded-lg border flex items-center justify-center text-xs text-gray-500">
                                +{vehicle.imageUrls.length - 2}
                              </div>
                            )}
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold">{vehicle.licensePlate}</h3>
                          <p className="text-sm text-gray-600">{vehicle.vehicleTypeDisplayName}</p>
                        </div>
                      </div>
                      {getStatusBadge(vehicle.status)}
                    </div>
                    
                    {(vehicle.brand || vehicle.model || vehicle.color) && (
                      <div className="text-sm text-gray-600">
                        {vehicle.brand && <span>Hãng: {vehicle.brand}</span>}
                        {vehicle.model && <span className="ml-2">Dòng: {vehicle.model}</span>}
                        {vehicle.color && <span className="ml-2">Màu: {vehicle.color}</span>}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">
                        Phí: {formatCurrency(vehicle.monthlyFee)}/tháng
                      </span>
                      <span className="text-gray-500">
                        {new Date(vehicle.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 