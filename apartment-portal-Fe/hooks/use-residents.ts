import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export interface Resident {
  id: number;
  fullName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  identityNumber?: string;
  idCardNumber?: string;
  address?: string;
  status: 'ACTIVE' | 'INACTIVE';
  roles?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// Align with the Create Resident form
export interface CreateResidentRequest {
  fullName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  identityNumber?: string;
  idCardNumber?: string;
  address?: string;
}

// Backward compatibility alias if needed elsewhere
export type ResidentCreateRequest = CreateResidentRequest;

export interface ResidentUpdateRequest {
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  identityNumber?: string;
  address?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export const useResidents = () => {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const getAllResidents = async (): Promise<Resident[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch('/api/admin/residents');
      if (response.ok) {
        const data = await response.json();
        setResidents(data);
        return data;
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch residents');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch residents';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getResidentById = async (id: number): Promise<Resident | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch(`/api/admin/residents/${id}`);
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch resident');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch resident';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createResident = async (data: CreateResidentRequest): Promise<{ success: boolean; message: string } | null> => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // Map identityNumber (form) -> idCardNumber (backend)
      const requestBody = {
        username: data.phoneNumber,
        phoneNumber: data.phoneNumber,
        email: data.email,
        fullName: data.fullName,
        idCardNumber: data.idCardNumber ?? data.identityNumber,
        dateOfBirth: data.dateOfBirth,
      };

      const response = await apiFetch('/api/admin/residents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      if (response.ok) {
        const newResident = await response.json();
        setResidents(prev => [...prev, newResident]);
        const message = 'Tạo cư dân thành công';
        setSuccess(message);
        return { success: true, message };
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || 'Failed to create resident';
        setError(errorMessage);
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create resident';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateResident = async (id: number, data: ResidentUpdateRequest): Promise<Resident | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch(`/api/admin/residents/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        const updatedResident = await response.json();
        setResidents(prev => prev.map(resident => 
          resident.id === id ? updatedResident : resident
        ));
        return updatedResident;
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update resident');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update resident';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteResident = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch(`/api/admin/residents/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setResidents(prev => prev.filter(resident => resident.id !== id));
        return true;
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete resident');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete resident';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getApartmentsByResidentId = async (id: number): Promise<any[]> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFetch(`/api/apartment-residents/user/${id}`);
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch resident apartments');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch resident apartments';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Load residents on mount
  useEffect(() => {
    getAllResidents();
  }, []);

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return {
    residents,
    loading,
    error,
    success,
    getAllResidents,
    getResidentById,
    createResident,
    updateResident,
    deleteResident,
    getApartmentsByResidentId,
    clearMessages,
  };
};
