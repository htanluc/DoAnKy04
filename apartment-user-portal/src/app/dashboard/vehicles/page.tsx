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
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';
import { Modal } from '@/components/ui/modal';

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
  const { toast } = useToast();
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Khách hàng yêu cầu hủy đăng ký');
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Helpers: normalize và kiểm tra trùng biển số
  const normalizePlate = (plate: string) => plate.replace(/[\s-]/g, '').toUpperCase();
  const isDuplicateLicensePlate = (plate: string) => {
    const target = normalizePlate(plate || '');
    if (!target) return false;
    const existsInMyVehicles = vehicles.some(v => normalizePlate(v.licensePlate) === target);
    const existsInBuildingPending = buildingVehicles.some(v => normalizePlate(v.licensePlate) === target);
    return existsInMyVehicles || existsInBuildingPending;
  };

  // Validation functions
  const validateField = (name: string, value: string) => {
    let error = '';
    
    switch (name) {
      case 'licensePlate':
        if (!value.trim()) {
          error = 'Biển số xe là bắt buộc';
        } else {
          const plate = value.trim().toUpperCase();
          // Hỗ trợ nhiều định dạng biển số Việt Nam
          const patterns = [
            /^[0-9]{2}[A-Z]{1,2}-[0-9]{4,5}$/, // 30A-12345
            /^[0-9]{2}[A-Z]{1,2}[0-9]{4,5}$/,  // 30A12345
            /^[0-9]{2}[A-Z]{1,2}\s[0-9]{4,5}$/, // 30A 12345
          ];
          
          if (!patterns.some(pattern => pattern.test(plate))) {
            error = 'Biển số xe không đúng định dạng (VD: 30A-12345, 30A12345, 30A 12345)';
          } else if (isDuplicateLicensePlate(plate)) {
            error = 'Biển số xe đã tồn tại trong hệ thống. Vui lòng kiểm tra lại.';
          }
        }
        break;
      case 'vehicleType':
        if (!value) {
          error = 'Vui lòng chọn loại phương tiện';
        }
        break;
      case 'apartmentId':
        if (!value) {
          error = 'Vui lòng chọn căn hộ';
        }
        break;
      case 'brand':
        if (value.trim() && value.trim().length < 2) {
          error = 'Hãng xe phải có ít nhất 2 ký tự';
        }
        break;
      case 'model':
        if (value.trim() && value.trim().length < 2) {
          error = 'Dòng xe phải có ít nhất 2 ký tự';
        }
        break;
      case 'color':
        if (value.trim() && value.trim().length < 2) {
          error = 'Màu sắc phải có ít nhất 2 ký tự';
        }
        break;
    }
    
    return error;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    Object.keys(formData).forEach(key => {
      if (key !== 'imageUrls') {
        const error = validateField(key, formData[key as keyof typeof formData] as string);
        if (error) {
          newErrors[key] = error;
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Validate field in real-time after user has touched it
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
    
    // Auto-format license plate
    if (name === 'licensePlate') {
      const formatted = value.trim().toUpperCase();
      if (formatted !== value) {
        setFormData(prev => ({ ...prev, [name]: formatted }));
      }
    }
  };

  const handleFieldBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name as keyof typeof formData] as string);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

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
        
        // Chỉ lấy 3 loại phương tiện chính: 4 chỗ, 7 chỗ, xe máy
        const allowedTypes = data.filter((type: VehicleType) => {
          const displayName = type.displayName.toLowerCase();
          return displayName.includes('4 chỗ') || 
                 displayName.includes('7 chỗ') || 
                 displayName.includes('xe máy') ||
                 displayName.includes('motorcycle') ||
                 displayName.includes('car 4') ||
                 displayName.includes('car 7');
        });
        
        setVehicleTypes(allowedTypes);
      } catch (error) {
        console.error('Error fetching vehicle types:', error);
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách loại phương tiện",
          variant: "destructive",
        });
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
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách căn hộ",
          variant: "destructive",
        });
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
        toast({
          title: "Lỗi",
          description: "Không thể tải danh sách xe",
          variant: "destructive",
        });
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

  const cancelVehicle = async (vehicleId: number, reason: string) => {
    try {
      setCancelling(true);
      const token = localStorage.getItem('token');

      // Thử endpoint chuẩn cư dân
      let response = await fetch(`${API_BASE_URL}/api/vehicles/${vehicleId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      // Fallback: thử cập nhật trạng thái trực tiếp
      if (!response.ok) {
        response = await fetch(`${API_BASE_URL}/api/vehicles/${vehicleId}/status`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'REJECTED', reason }),
        });
      }

      if (!response.ok) {
        throw new Error('Không thể hủy đăng ký xe. Vui lòng thử lại sau.');
      }

      // Cập nhật UI: đặt trạng thái REJECTED cho xe tương ứng
      setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, status: 'REJECTED', statusDisplayName: 'Từ chối' } as any : v));

      toast({
        title: 'Đã hủy đăng ký',
        description: 'Yêu cầu hủy đăng ký xe đã được xử lý.',
        variant: 'success',
      });
    } catch (error: any) {
      toast({
        title: 'Lỗi',
        description: error?.message || 'Không thể hủy đăng ký xe',
        variant: 'destructive',
      });
    } finally {
      setCancelling(false);
      setShowCancelModal(false);
      setCancellingId(null);
      setCancelReason('Khách hàng yêu cầu hủy đăng ký');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Kiểm tra trùng biển số trước khi submit
    if (isDuplicateLicensePlate(formData.licensePlate)) {
      setErrors(prev => ({ ...prev, licensePlate: 'Biển số xe đã tồn tại trong hệ thống. Vui lòng kiểm tra lại.' }));
      setTouched(prev => ({ ...prev, licensePlate: true }));
      toast({
        title: 'Trùng biển số',
        description: 'Biển số này đã được đăng ký hoặc đang chờ duyệt trong tòa nhà.',
        variant: 'destructive',
      });
      return;
    }

    // Mark all fields as touched to show validation errors
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      if (key !== 'imageUrls') {
        acc[key] = true;
      }
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allTouched);
    
    // Validate form
    if (!validateForm()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng kiểm tra lại thông tin đã nhập",
        variant: "destructive",
      });
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
      setErrors({});
      setTouched({});
      clearAllImages();
      
      toast({
        title: "Thành công",
        description: "Đăng ký xe thành công! Xe của bạn đang chờ duyệt.",
        variant: "success",
      });
    } catch (error) {
      console.error('Error creating vehicle:', error);
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể đăng ký xe",
        variant: "destructive",
      });
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
          vehiclesWithApartmentInfo.sort((a: BuildingVehicle, b: BuildingVehicle) => {
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
      const sortedVehicles = allBuildingVehicles.sort((a: BuildingVehicle, b: BuildingVehicle) => {
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
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách xe trong tòa nhà",
        variant: "destructive",
      });
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
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-500" />
                Đăng ký xe mới
              </CardTitle>
              <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Hướng dẫn đăng ký xe:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Các trường có dấu <span className="text-red-500 font-semibold">*</span> là bắt buộc</li>
                      <li>• Biển số xe phải đúng định dạng: 2 số + 1-2 chữ cái + 4-5 số (VD: 30A-12345, 30A12345, 30A 12345)</li>
                      <li>• Hình ảnh xe giúp quản lý dễ dàng xác minh thông tin</li>
                      <li>• Xe đăng ký sẽ được duyệt theo thứ tự ưu tiên trong tòa nhà</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="licensePlate">Biển số xe *</Label>
                    <Input
                      id="licensePlate"
                      value={formData.licensePlate}
                      onChange={(e) => handleFieldChange('licensePlate', e.target.value)}
                      onBlur={() => handleFieldBlur('licensePlate')}
                      placeholder="Ví dụ: 30A-12345, 30A12345, 30A 12345"
                      className={errors.licensePlate ? 'border-red-500 focus:border-red-500' : ''}
                      required
                    />
                    {errors.licensePlate && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <XCircle className="w-4 h-4" />
                        {errors.licensePlate}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="vehicleType">Loại phương tiện *</Label>
                    <Select
                      value={formData.vehicleType}
                      onValueChange={(value) => handleFieldChange('vehicleType', value)}
                      required
                    >
                      <SelectTrigger className={errors.vehicleType ? 'border-red-500 focus:border-red-500' : ''}>
                        <SelectValue placeholder="Chọn loại phương tiện" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicleTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.displayName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.vehicleType && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <XCircle className="w-4 h-4" />
                        {errors.vehicleType}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="apartmentId">Căn hộ *</Label>
                    <Select
                      value={formData.apartmentId}
                      onValueChange={(value) => handleFieldChange('apartmentId', value)}
                      required
                    >
                      <SelectTrigger className={errors.apartmentId ? 'border-red-500 focus:border-red-500' : ''}>
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
                    {errors.apartmentId && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <XCircle className="w-4 h-4" />
                        {errors.apartmentId}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="brand">Hãng xe</Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => handleFieldChange('brand', e.target.value)}
                      onBlur={() => handleFieldBlur('brand')}
                      placeholder="Ví dụ: Honda, Toyota"
                      className={errors.brand ? 'border-red-500 focus:border-red-500' : ''}
                    />
                    {errors.brand && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <XCircle className="w-4 h-4" />
                        {errors.brand}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="model">Dòng xe</Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) => handleFieldChange('model', e.target.value)}
                      onBlur={() => handleFieldBlur('model')}
                      placeholder="Ví dụ: Wave Alpha, Vios"
                      className={errors.model ? 'border-red-500 focus:border-red-500' : ''}
                    />
                    {errors.model && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <XCircle className="w-4 h-4" />
                        {errors.model}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="color">Màu sắc</Label>
                    <Input
                      id="color"
                      value={formData.color}
                      onChange={(e) => handleFieldChange('color', e.target.value)}
                      onBlur={() => handleFieldBlur('color')}
                      placeholder="Ví dụ: Đen, Trắng"
                      className={errors.color ? 'border-red-500 focus:border-red-500' : ''}
                    />
                    {errors.color && (
                      <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                        <XCircle className="w-4 h-4" />
                        {errors.color}
                      </p>
                    )}
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

                <Button 
                  type="submit" 
                  disabled={submitting} 
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang đăng ký...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Đăng ký xe
                    </div>
                  )}
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
                          <div className="flex gap-2">
                            {vehicle.status === 'PENDING' && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => { setCancellingId(vehicle.id); setShowCancelModal(true); }}
                              >
                                Hủy đăng ký
                              </Button>
                            )}
                          </div>
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

      {/* Cancel vehicle modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Hủy đăng ký xe"
        size="sm"
      >
        <div className="space-y-3">
          <p className="text-sm text-gray-600">Vui lòng nhập lý do hủy đăng ký:</p>
          <textarea
            className="w-full border rounded p-2 h-28"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Ví dụ: Khách hàng yêu cầu hủy đăng ký"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCancelModal(false)}>Đóng</Button>
            <Button
              variant="destructive"
              disabled={cancelling || !cancellingId}
              onClick={() => cancellingId && cancelVehicle(cancellingId, cancelReason)}
            >
              {cancelling ? 'Đang xử lý...' : 'Xác nhận hủy'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
} 