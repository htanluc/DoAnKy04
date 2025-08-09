import { useEffect, useState } from "react";
import { api, apiFetch } from "@/lib/api";

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
  // Thêm fields khác nếu cần
}

export interface Vehicle {
  id: number;
  vehicleType: 'MOTORCYCLE' | 'CAR_4_SEATS' | 'CAR_7_SEATS' | 'TRUCK' | 'VAN' | 'ELECTRIC_MOTORCYCLE' | 'ELECTRIC_CAR' | 'BICYCLE' | 'ELECTRIC_BICYCLE';
  type?: 'MOTORCYCLE' | 'CAR_4_SEATS' | 'CAR_7_SEATS' | 'TRUCK' | 'VAN' | 'ELECTRIC_MOTORCYCLE' | 'ELECTRIC_CAR' | 'BICYCLE' | 'ELECTRIC_BICYCLE'; // Deprecated, use vehicleType
  licensePlate: string;
  color: string;
  model: string;
  registrationDate: string;
  ownerName?: string; // Thêm thông tin tên chủ xe
  userId?: number; // Thêm userId để track
  brand?: string; // Thêm thương hiệu xe
}

// Vehicle type mapping for display
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

// Vehicle type colors for badges
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

export function useApartments() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApartments = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Đảm bảo gửi token trong header
        const response = await apiFetch("/api/apartments");
        
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

  // Get apartment by ID
  const getApartmentById = async (id: number): Promise<ApartmentDetails | null> => {
    try {
      const response = await apiFetch(`/api/apartments/${id}`);
      if (response.ok) {
        return await response.json();
      }
      console.error('Failed to fetch apartment:', response.status, response.statusText);
      return null;
    } catch (err) {
      console.error('Error fetching apartment:', err);
      return null;
    }
  };

  // Get linked residents for apartment with full user details
  const getLinkedResidents = async (apartmentId: number): Promise<any[] | null> => {
    try {
      // Lấy danh sách liên kết apartment-residents
      const response = await apiFetch(`/api/apartments/${apartmentId}/residents`);
      if (!response.ok) {
        console.error('Failed to fetch resident links:', response.status, response.statusText);
        return null;
      }

      const apartmentResidents = await response.json();
      const residentsArray = Array.isArray(apartmentResidents) ? apartmentResidents : apartmentResidents.data || [];
      
      console.log('Raw apartment-residents data:', residentsArray);

      if (residentsArray.length === 0) {
        return [];
      }

      // Lấy thông tin chi tiết users
      const usersResponse = await apiFetch('/api/admin/users');
      if (!usersResponse.ok) {
        console.error('Failed to fetch users:', usersResponse.status, usersResponse.statusText);
        return residentsArray; // Trả về dữ liệu có sẵn nếu không lấy được users
      }

      const allUsers = await usersResponse.json();
      const usersArray = Array.isArray(allUsers) ? allUsers : allUsers.data || [];

      // Kết hợp dữ liệu apartment-residents với user details
      const enrichedResidents = residentsArray.map((resident: any) => {
        const userDetail = usersArray.find((user: any) => user.id === resident.userId);
        
        return {
          ...resident,
          fullName: userDetail?.fullName || userDetail?.username || 'Không rõ',
          email: userDetail?.email,
          phoneNumber: userDetail?.phoneNumber,
          id: resident.residentId || userDetail?.id, // Dùng residentId hoặc userId
        };
      });

      console.log('Enriched residents with user details:', enrichedResidents);
      return enrichedResidents;

    } catch (err) {
      console.error('Error fetching residents:', err);
      return null;
    }
  };

  // Get vehicles for apartment through residents' userId
  const getApartmentVehicles = async (apartmentId: number): Promise<Vehicle[] | null> => {
    try {
      // Debug token info
      const token = localStorage.getItem('token');
      console.log('Fetching vehicles with token:', token ? 'Token present' : 'No token');
      
      // Đầu tiên lấy danh sách residents của căn hộ
      const residents = await getLinkedResidents(apartmentId);
      if (!residents || residents.length === 0) {
        console.log('No residents found for apartment:', apartmentId);
        return [];
      }
      
      console.log('Found residents:', residents);
      
      // Lấy tất cả vehicles của các residents
      const allVehicles: Vehicle[] = [];
      
      for (const resident of residents) {
        if (resident.userId) {
          try {
            console.log(`🚗 Trying to get vehicles for user ${resident.userId} (${resident.fullName})`);
            
            // Thử lấy vehicles theo userId của resident
            const userVehiclesResponse = await apiFetch(`/api/users/${resident.userId}/vehicles`);
            
            console.log(`📡 API Response for user ${resident.userId}:`, {
              status: userVehiclesResponse.status,
              ok: userVehiclesResponse.ok,
              url: `/api/users/${resident.userId}/vehicles`
            });
            
            if (userVehiclesResponse.ok) {
              const userVehicles = await userVehiclesResponse.json();
              console.log(`✅ Raw vehicles data for user ${resident.userId}:`, userVehicles);
              
              if (Array.isArray(userVehicles)) {
                // Thêm thông tin chủ xe vào mỗi vehicle và đảm bảo vehicleType được map đúng
                const vehiclesWithOwner = userVehicles.map(vehicle => ({
                  ...vehicle,
                  ownerName: resident.fullName,
                  userId: resident.userId,
                  // Đảm bảo backward compatibility: nếu chỉ có vehicleType thì copy sang type
                  type: vehicle.type || vehicle.vehicleType,
                  vehicleType: vehicle.vehicleType || vehicle.type
                }));
                allVehicles.push(...vehiclesWithOwner);
                console.log(`✅ Added ${userVehicles.length} vehicles for user ${resident.userId} (${resident.fullName})`);
              } else {
                console.log(`⚠️ Vehicles data is not an array for user ${resident.userId}:`, typeof userVehicles);
              }
            } else {
              const errorText = await userVehiclesResponse.text();
              console.log(`❌ Failed to get vehicles for user ${resident.userId} (${resident.fullName}):`, {
                status: userVehiclesResponse.status,
                statusText: userVehiclesResponse.statusText,
                error: errorText
              });
              
              // Try alternative endpoints
              console.log(`🔄 Trying alternative endpoint: /api/admin/vehicles/user/${resident.userId}`);
              try {
                const altResponse = await apiFetch(`/api/admin/vehicles/user/${resident.userId}`);
                if (altResponse.ok) {
                  const altVehicles = await altResponse.json();
                  console.log(`✅ Alternative endpoint worked for user ${resident.userId}:`, altVehicles);
                  if (Array.isArray(altVehicles)) {
                    const vehiclesWithOwner = altVehicles.map(vehicle => ({
                      ...vehicle,
                      ownerName: resident.fullName,
                      userId: resident.userId,
                      // Đảm bảo backward compatibility: nếu chỉ có vehicleType thì copy sang type
                      type: vehicle.type || vehicle.vehicleType,
                      vehicleType: vehicle.vehicleType || vehicle.type
                    }));
                    allVehicles.push(...vehiclesWithOwner);
                  }
                } else {
                  console.log(`❌ Alternative endpoint also failed for user ${resident.userId}:`, altResponse.status);
                }
              } catch (altErr) {
                console.log(`❌ Alternative endpoint error for user ${resident.userId}:`, altErr);
              }
            }
          } catch (err) {
            console.error(`💥 Exception when fetching vehicles for user ${resident.userId} (${resident.fullName}):`, err);
          }
        } else {
          console.log(`⚠️ Resident missing userId:`, resident);
        }
      }
      
      console.log('Total vehicles found:', allVehicles.length);
      return allVehicles;
      
    } catch (err) {
      console.error('Error fetching vehicles:', err);
      return null;
    }
  };

  // Get water meters for apartment
  const getApartmentWaterMeters = async (apartmentId: number): Promise<WaterMeter[] | null> => {
    try {
      // Sử dụng endpoint của căn hộ
      const response = await apiFetch(`/api/apartments/${apartmentId}/water-readings`);
      if (response.ok) {
        return await response.json();
      }
      console.error('Failed to fetch water meters:', response.status, response.statusText);
      return null;
    } catch (err) {
      console.error('Error fetching water meters:', err);
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