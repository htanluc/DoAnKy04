import { useState, useEffect } from 'react';
import { 
  facilitiesApi, 
  Facility, 
  FacilityCreateRequest, 
  FacilityUpdateRequest 
} from '@/lib/api';

interface UseFacilitiesReturn {
  facilities: Facility[];
  loading: boolean;
  error: string | null;
  createFacility: (data: FacilityCreateRequest) => Promise<void>;
  updateFacility: (id: number, data: FacilityUpdateRequest) => Promise<void>;
  deleteFacility: (id: number) => Promise<void>;
  fetchFacilities: () => Promise<void>;
}

export const useFacilities = (): UseFacilitiesReturn => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFacilities = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await facilitiesApi.getAll();
      setFacilities(data);
    } catch (err) {
      setError('Failed to fetch facilities');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createFacility = async (data: FacilityCreateRequest) => {
    setError(null);
    try {
      const newFacility = await facilitiesApi.create(data);
      setFacilities(prev => [...prev, newFacility]);
    } catch (err) {
      setError('Failed to create facility');
      throw err;
    }
  };

  const updateFacility = async (id: number, data: FacilityUpdateRequest) => {
    setError(null);
    try {
      await facilitiesApi.update(id, data);
      setFacilities(prev => 
        prev.map(facility => 
          facility.id === id 
            ? { ...facility, ...data }
            : facility
        )
      );
    } catch (err) {
      setError('Failed to update facility');
      throw err;
    }
  };

  const deleteFacility = async (id: number) => {
    setError(null);
    try {
      await facilitiesApi.delete(id);
      setFacilities(prev => prev.filter(facility => facility.id !== id));
    } catch (err) {
      setError('Failed to delete facility');
      throw err;
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  return {
    facilities,
    loading,
    error,
    createFacility,
    updateFacility,
    deleteFacility,
    fetchFacilities,
  };
}; 