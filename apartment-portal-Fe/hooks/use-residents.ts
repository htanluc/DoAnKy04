import { useState } from 'react';
import { api } from '@/lib/api';
import { normalizeResidentData } from '@/lib/resident-utils';

export interface Resident {
  id: number;
  fullName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth: string;
  identityNumber: string;
  idCardNumber?: string; // Để tương thích với database
  status: 'ACTIVE' | 'INACTIVE';
}

export interface CreateResidentRequest {
  fullName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth: string;
  identityNumber: string;
  idCardNumber?: string; // Để tương thích với database
}

export interface UpdateResidentRequest extends CreateResidentRequest {
  status: 'ACTIVE' | 'INACTIVE';
}

export interface ApartmentResident {
  apartmentId: number;
  residentId: number;
  relationType: string;
  moveInDate: string;
  moveOutDate?: string | null;
  unitNumber?: string;
  buildingName?: string;
  userFullName?: string;
  apartmentStatus?: string;
}

export interface ResidentResponse {
  success: boolean;
  message: string;
  data?: Resident;
}

export const useResidents = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Lấy danh sách tất cả cư dân
  const getAllResidents = async (): Promise<Resident[] | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/api/admin/residents');
      
      if (response.ok) {
        const result = await response.json();
        // Normalize data để đảm bảo tương thích với database schema
        if (Array.isArray(result)) {
          return result.map(normalizeResidentData);
        }
        return result;
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Có lỗi xảy ra khi lấy danh sách cư dân');
        return null;
      }
    } catch (err) {
      console.error('Get all residents error:', err);
      setError('Có lỗi xảy ra khi kết nối đến server');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Lấy thông tin cư dân theo ID
  const getResidentById = async (id: number): Promise<Resident | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/api/admin/residents/${id}`);
      
      if (response.ok) {
        const result = await response.json();
        // Normalize data để đảm bảo tương thích với database schema
        return normalizeResidentData(result);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Không tìm thấy cư dân');
        return null;
      }
    } catch (err) {
      console.error('Get resident by id error:', err);
      setError('Có lỗi xảy ra khi kết nối đến server');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Tạo cư dân mới
  const createResident = async (data: CreateResidentRequest): Promise<ResidentResponse | null> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.post('/api/admin/residents', data);
      
      if (response.ok) {
        const result = await response.json();
        setSuccess('Tạo cư dân mới thành công');
        return {
          success: true,
          message: 'Tạo cư dân mới thành công',
          data: result
        };
      } else {
        const errorData = await response.json();
        let errorMessage = errorData.message || 'Có lỗi xảy ra khi tạo cư dân';
        
        if (response.status === 400) {
          errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin nhập vào.';
        } else if (response.status === 409) {
          errorMessage = 'Cư dân với số CMND/CCCD hoặc email này đã tồn tại.';
        }
        
        setError(errorMessage);
        return {
          success: false,
          message: errorMessage
        };
      }
    } catch (err) {
      console.error('Create resident error:', err);
      const errorMessage = 'Có lỗi xảy ra khi kết nối đến server';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật thông tin cư dân
  const updateResident = async (id: number, data: UpdateResidentRequest): Promise<ResidentResponse | null> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.put(`/api/admin/residents/${id}`, data);
      
      if (response.ok) {
        const result = await response.json();
        setSuccess('Cập nhật thông tin cư dân thành công');
        return {
          success: true,
          message: 'Cập nhật thông tin cư dân thành công',
          data: result
        };
      } else {
        const errorData = await response.json();
        let errorMessage = errorData.message || 'Có lỗi xảy ra khi cập nhật thông tin cư dân';
        
        if (response.status === 400) {
          errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin nhập vào.';
        } else if (response.status === 404) {
          errorMessage = 'Không tìm thấy cư dân này.';
        } else if (response.status === 409) {
          errorMessage = 'Số CMND/CCCD hoặc email này đã được sử dụng bởi cư dân khác.';
        }
        
        setError(errorMessage);
        return {
          success: false,
          message: errorMessage
        };
      }
    } catch (err) {
      console.error('Update resident error:', err);
      const errorMessage = 'Có lỗi xảy ra khi kết nối đến server';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  // Xóa cư dân
  const deleteResident = async (id: number): Promise<ResidentResponse | null> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.delete(`/api/admin/residents/${id}`);
      
      if (response.ok) {
        setSuccess('Xóa cư dân thành công');
        return {
          success: true,
          message: 'Xóa cư dân thành công'
        };
      } else {
        const errorData = await response.json();
        let errorMessage = errorData.message || 'Có lỗi xảy ra khi xóa cư dân';
        
        if (response.status === 404) {
          errorMessage = 'Không tìm thấy cư dân này.';
        } else if (response.status === 409) {
          errorMessage = 'Không thể xóa cư dân này vì đang có liên kết với căn hộ.';
        }
        
        setError(errorMessage);
        return {
          success: false,
          message: errorMessage
        };
      }
    } catch (err) {
      console.error('Delete resident error:', err);
      const errorMessage = 'Có lỗi xảy ra khi kết nối đến server';
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách căn hộ mà cư dân đã liên kết
  const getApartmentResidents = async (): Promise<ApartmentResident[] | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/api/apartment-residents');
      
      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Có lỗi xảy ra khi lấy danh sách liên kết căn hộ');
        return null;
      }
    } catch (err) {
      console.error('Get apartment residents error:', err);
      setError('Có lỗi xảy ra khi kết nối đến server');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách căn hộ theo resident ID
  const getApartmentsByResidentId = async (residentId: number): Promise<ApartmentResident[] | null> => {
    setLoading(true);
    setError(null);

    try {
      // Thử API đúng endpoint: /api/apartment-residents/user/{userId}
      const response = await api.get(`/api/apartment-residents/user/${residentId}`);
      
      if (response.ok) {
        const result = await response.json();
        return Array.isArray(result) ? result : result.data || [];
      } else {
        // Fallback: lấy tất cả rồi filter
        const allRelations = await getApartmentResidents();
        if (!allRelations) return null;
        
        const filtered = allRelations.filter(relation => relation.residentId === residentId);
        return filtered;
      }
    } catch (err) {
      console.error('Error getting apartments by resident ID:', err);
      setError('Có lỗi xảy ra khi lấy danh sách căn hộ');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return {
    loading,
    error,
    success,
    getAllResidents,
    getResidentById,
    createResident,
    updateResident,
    deleteResident,
    getApartmentResidents,
    getApartmentsByResidentId,
    clearMessages
  };
};