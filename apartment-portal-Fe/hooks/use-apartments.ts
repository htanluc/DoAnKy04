import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { getCurrentUser, isAdmin } from "@/lib/auth";

export interface Apartment {
  id: number | string;
  unitNumber: string;
  building?: string;
  floor?: number;
  roomNumber?: string;
  name?: string;
}

export interface ApartmentDetails {
  id: number;
  number: string;
  building: string;
  floor: number;
  area: number;
  status: string;
}

export interface Vehicle {
  id: number;
  vehicleType: 'MOTORCYCLE' | 'CAR_4_SEATS' | 'CAR_7_SEATS' | 'TRUCK' | 'VAN' | 'ELECTRIC_MOTORCYCLE' | 'ELECTRIC_CAR' | 'BICYCLE' | 'ELECTRIC_BICYCLE';
  type?: 'MOTORCYCLE' | 'CAR_4_SEATS' | 'CAR_7_SEATS' | 'TRUCK' | 'VAN' | 'ELECTRIC_MOTORCYCLE' | 'ELECTRIC_CAR' | 'BICYCLE' | 'ELECTRIC_BICYCLE';
  licensePlate: string;
  color: string;
  model: string;
  registrationDate: string;
  ownerName?: string;
  userId?: number;
  brand?: string;
  status?: 'APPROVED' | 'PENDING' | 'REJECTED' | string;
  monthlyFee?: number;
  createdAt?: string;
}

export const VEHICLE_TYPE_DISPLAY = {
  'MOTORCYCLE': '🏍️ Xe máy',
  'CAR_4_SEATS': '🚗 Ô tô 4 chỗ ngồi',
  'CAR_7_SEATS': '🚐 Ô tô 7 chỗ ngồi',
  'TRUCK': '🚛 Xe tải',
  'VAN': '🚐 Xe van',
  'ELECTRIC_MOTORCYCLE': '⚡ Xe máy điện',
  'ELECTRIC_CAR': '🔋 Ô tô điện',
  'BICYCLE': '🚲 Xe đạp',
  'ELECTRIC_BICYCLE': '🚴 Xe đạp điện'
} as const;

export const VEHICLE_TYPE_COLORS = {
  'MOTORCYCLE': 'bg-blue-100 text-blue-800',
  'CAR_4_SEATS': 'bg-green-100 text-green-800', 
  'CAR_7_SEATS': 'bg-purple-100 text-purple-800',
  'TRUCK': 'bg-orange-100 text-orange-800',
  'VAN': 'bg-indigo-100 text-indigo-800',
  'ELECTRIC_MOTORCYCLE': 'bg-emerald-100 text-emerald-800',
  'ELECTRIC_CAR': 'bg-cyan-100 text-cyan-800',
  'BICYCLE': 'bg-yellow-100 text-yellow-800',
  'ELECTRIC_BICYCLE': 'bg-lime-100 text-lime-800'
} as const;

export interface WaterMeter {
  id: number;
  previousReading: number;
  currentReading: number;
  consumption: number;
  readingDate: string;
}

function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
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
        const user = getCurrentUser();
        const endpoint = isAdmin(user) ? "/api/admin/apartments" : "/api/apartments";
        const response = await apiFetch(endpoint);
        if (response.ok) {
          const data = await response.json();
          setApartments(Array.isArray(data) ? data : data.data);
        } else {
          setError('Không thể tải danh sách căn hộ');
        }
      } catch (err) {
        setError('Có lỗi xảy ra khi tải danh sách căn hộ');
      } finally {
        setLoading(false);
      }
    };
    fetchApartments();
  }, []);

  const getApartmentById = async (id: number): Promise<ApartmentDetails | null> => {
    try {
      const user = getCurrentUser();
      const endpoint = isAdmin(user) ? `/api/admin/apartments/${id}` : `/api/apartments/${id}`;
      const response = await apiFetch(endpoint);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (err) {
      return null;
    }
  };

  const getLinkedResidents = async (apartmentId: number): Promise<any[] | null> => {
    try {
      const user = getCurrentUser();
      const endpoint = isAdmin(user) ? `/api/admin/apartments/${apartmentId}/residents` : `/api/apartments/${apartmentId}/residents`;
      const res = await apiFetch(endpoint);
      if (!res.ok) return null;
      const residents = await res.json();
      const residentsArray = Array.isArray(residents) ? residents : residents.data || [];

      // Enrich with user details (admin only)
      let usersArray: any[] = [];
      if (isAdmin(getCurrentUser())) {
        const usersResponse = await apiFetch('/api/admin/users');
        if (usersResponse.ok) {
          const allUsers = await usersResponse.json();
          usersArray = Array.isArray(allUsers) ? allUsers : allUsers.data || [];
        }
      }

      return residentsArray.map((resident: any) => {
        const userDetail = usersArray.find((user: any) => user.id === resident.userId);
        return {
          ...resident,
          fullName: userDetail?.fullName || userDetail?.username || 'Không rõ',
          email: userDetail?.email,
          phoneNumber: userDetail?.phoneNumber,
          id: resident.residentId || userDetail?.id,
        };
      });
    } catch (err) {
      return null;
    }
  };

  const getApartmentVehicles = async (apartmentId: number): Promise<Vehicle[] | null> => {
    try {
      // 1) Ưu tiên endpoint chuyên biệt cho admin để lấy xe theo căn hộ
      const current = getCurrentUser();
      if (isAdmin(current)) {
        try {
          const adminResp = await apiFetch(`/api/admin/apartments/${apartmentId}/vehicles`);
          if (adminResp.ok) {
            const data = await adminResp.json();
            if (Array.isArray(data)) {
              return data.map((v: any) => ({
                ...v,
                type: v.type || v.vehicleType,
                vehicleType: v.vehicleType || v.type,
              }));
            }
          }
        } catch (e) {
          // continue to fallback
        }
      }

      // 2) Fallback: gom theo cư dân -> gọi vehicles theo user
      const residents = await getLinkedResidents(apartmentId);
      if (!residents || residents.length === 0) {
        return [];
      }
      const allVehicles: Vehicle[] = [];
      for (const resident of residents) {
        if (resident.userId) {
          try {
            const resp = await apiFetch(`/api/users/${resident.userId}/vehicles`);
            if (resp.ok) {
              const userVehicles = await resp.json();
              if (Array.isArray(userVehicles)) {
                const vehiclesWithOwner = userVehicles.map((vehicle: any) => ({
                  ...vehicle,
                  ownerName: resident.fullName,
                  userId: resident.userId,
                  type: vehicle.type || vehicle.vehicleType,
                  vehicleType: vehicle.vehicleType || vehicle.type,
                }));
                allVehicles.push(...vehiclesWithOwner);
              }
            } else if (isAdmin(current)) {
              const alt = await apiFetch(`/api/admin/vehicles/user/${resident.userId}/apartment/${apartmentId}`);
              if (alt.ok) {
                const altVehicles = await alt.json();
                if (Array.isArray(altVehicles)) {
                  const vehiclesWithOwner = altVehicles.map((vehicle: any) => ({
                    ...vehicle,
                    ownerName: resident.fullName,
                    userId: resident.userId,
                    type: vehicle.type || vehicle.vehicleType,
                    vehicleType: vehicle.vehicleType || vehicle.type,
                  }));
                  allVehicles.push(...vehiclesWithOwner);
                }
              }
            }
          } catch (_) {
            // ignore per user error
          }
        }
      }
      return allVehicles;
    } catch (err) {
      return null;
    }
  };

  const getApartmentWaterMeters = async (apartmentId: number): Promise<WaterMeter[] | null> => {
    try {
      const user = getCurrentUser();
      const endpoint = isAdmin(user) ? `/api/admin/apartments/${apartmentId}/water-readings` : `/api/apartments/${apartmentId}/water-readings`;
      const response = await apiFetch(endpoint);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (err) {
      return null;
    }
  };

  return {
    apartments, loading, error,
    getApartmentById,
    getLinkedResidents,
    getApartmentVehicles,
    getApartmentWaterMeters,
  };
}