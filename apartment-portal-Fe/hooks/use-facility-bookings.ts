import { useState, useEffect } from 'react';
import { 
  facilityBookingsApi, 
  FacilityBooking, 
  FacilityBookingCreateRequest 
} from '@/lib/api';

interface UseFacilityBookingsReturn {
  bookings: FacilityBooking[];
  loading: boolean;
  error: string | null;
  createBooking: (data: FacilityBookingCreateRequest) => Promise<void>;
  updateBooking: (id: number, data: FacilityBookingCreateRequest) => Promise<void>;
  cancelBooking: (id: number) => Promise<void>;
  fetchBookings: () => Promise<void>;
}

export const useFacilityBookings = (): UseFacilityBookingsReturn => {
  const [bookings, setBookings] = useState<FacilityBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await facilityBookingsApi.getAll();
      setBookings(data);
    } catch (err) {
      setError('Failed to fetch facility bookings');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (data: FacilityBookingCreateRequest) => {
    setError(null);
    try {
      const newBooking = await facilityBookingsApi.create(data);
      setBookings(prev => [...prev, newBooking]);
    } catch (err) {
      setError('Failed to create facility booking');
      throw err;
    }
  };

  const updateBooking = async (id: number, data: FacilityBookingCreateRequest) => {
    setError(null);
    try {
      await facilityBookingsApi.update(id, data);
      setBookings(prev => 
        prev.map(booking => 
          booking.id === id 
            ? { ...booking, ...data }
            : booking
        )
      );
    } catch (err) {
      setError('Failed to update facility booking');
      throw err;
    }
  };

  const cancelBooking = async (id: number) => {
    setError(null);
    try {
      await facilityBookingsApi.cancel(id);
      setBookings(prev => 
        prev.map(booking => 
          booking.id === id 
            ? { ...booking, status: 'CANCELLED' as const }
            : booking
        )
      );
    } catch (err) {
      setError('Failed to cancel facility booking');
      throw err;
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  return {
    bookings,
    loading,
    error,
    createBooking,
    updateBooking,
    cancelBooking,
    fetchBookings,
  };
}; 