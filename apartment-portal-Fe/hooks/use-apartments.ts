import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export interface Apartment {
  id: number | string;
  unitNumber: string;
  building?: string;
  floor?: number;
  roomNumber?: string;
  name?: string;
}

export function useApartments() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApartments = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await api.get("/api/apartments");
        
        if (response.ok) {
          const data = await response.json();
          setApartments(Array.isArray(data) ? data : data.data);
        } else {
          console.error('Failed to fetch apartments:', response.status, response.statusText);
          setError('Không thể tải danh sách căn hộ');
        }
      } catch (err) {
        console.error('Error fetching apartments:', err);
        setError('Có lỗi xảy ra khi tải danh sách căn hộ');
      } finally {
        setLoading(false);
      }
    };

    fetchApartments();
  }, []);

  return { apartments, loading, error };
} 