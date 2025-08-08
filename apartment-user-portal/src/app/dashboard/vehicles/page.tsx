"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
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

        {/* Vehicle List */}
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
      </div>
    </div>
  );
} 