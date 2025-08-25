import { useState, useEffect, useCallback } from 'react';
import { vehicleCapacityApi, VehicleCapacityConfig, VehicleCapacityCheck } from '@/lib/api';
import { useToast } from './use-toast';

// Mock data để test trước khi có backend
const MOCK_CONFIGS: VehicleCapacityConfig[] = [
  {
    id: 1,
    buildingId: 1,
    buildingName: 'Tòa A - Golden Tower',
    maxCars: 50,
    maxMotorcycles: 100,
    maxTrucks: 0,
    maxVans: 0,
    maxElectricVehicles: 0,
    maxBicycles: 0,
    isActive: true,
    currentCars: 45,
    currentMotorcycles: 80,
    currentTrucks: 0,
    currentVans: 0,
    currentElectricVehicles: 0,
    currentBicycles: 0,
    remainingCars: 5,
    remainingMotorcycles: 20,
    remainingTrucks: 0,
    remainingVans: 0,
    remainingElectricVehicles: 0,
    remainingBicycles: 0,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    buildingId: 2,
    buildingName: 'Tòa B - Golden Tower',
    maxCars: 40,
    maxMotorcycles: 80,
    maxTrucks: 0,
    maxVans: 0,
    maxElectricVehicles: 0,
    maxBicycles: 0,
    isActive: true,
    currentCars: 35,
    currentMotorcycles: 65,
    currentTrucks: 0,
    currentVans: 0,
    currentElectricVehicles: 0,
    currentBicycles: 0,
    remainingCars: 5,
    remainingMotorcycles: 15,
    remainingTrucks: 0,
    remainingVans: 0,
    remainingElectricVehicles: 0,
    remainingBicycles: 0,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 3,
    buildingId: 3,
    buildingName: 'Tòa C - Golden Tower',
    maxCars: 30,
    maxMotorcycles: 60,
    maxTrucks: 0,
    maxVans: 0,
    maxElectricVehicles: 0,
    maxBicycles: 0,
    isActive: false, // Tòa C đã tắt giới hạn
    currentCars: 25,
    currentMotorcycles: 45,
    currentTrucks: 0,
    currentVans: 0,
    currentElectricVehicles: 0,
    currentBicycles: 0,
    remainingCars: 5,
    remainingMotorcycles: 15,
    remainingTrucks: 0,
    remainingVans: 0,
    remainingElectricVehicles: 0,
    remainingBicycles: 0,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

export function useVehicleCapacity() {
  const { toast } = useToast();
  const [configs, setConfigs] = useState<VehicleCapacityConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false); // Luôn sử dụng API thật

  // Load all configs with pagination
  const loadConfigs = useCallback(async (page: number = 0, size: number = 20) => {
    try {
      setLoading(true);
      setError(null);
      
      // Luôn gọi API thật
      const data = await vehicleCapacityApi.getAll(page, size);
      setConfigs(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải cấu hình giới hạn xe';
      setError(errorMessage);
      
      // Chỉ hiển thị lỗi, không fallback về mock data
      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [useMockData, toast]);

  // Load config by building
  const loadConfigByBuilding = useCallback(async (buildingId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // Luôn gọi API thật
      const config = await vehicleCapacityApi.getByBuilding(buildingId);
      return config;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể tải cấu hình giới hạn xe';
      setError(errorMessage);
      
      // Chỉ hiển thị lỗi, không fallback về mock data
      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [useMockData, toast]);

  // Create new config
  const createConfig = useCallback(async (config: Omit<VehicleCapacityConfig, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      
      // Luôn gọi API thật
      const newConfig = await vehicleCapacityApi.create(config);
      setConfigs(prev => [...prev, newConfig]);
      toast({
        title: 'Thành công',
        description: 'Tạo cấu hình giới hạn xe thành công',
      });
      return newConfig;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể tạo cấu hình giới hạn xe';
      setError(errorMessage);
      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [useMockData, toast]);

  // Update existing config
  const updateConfig = useCallback(async (id: number, config: Partial<VehicleCapacityConfig>) => {
    try {
      setLoading(true);
      setError(null);
      
      if (useMockData) {
        // Simulate cập nhật config
        await new Promise(resolve => setTimeout(resolve, 500));
        const updatedConfig = { ...config, id, updatedAt: new Date().toISOString() } as VehicleCapacityConfig;
        setConfigs(prev => prev.map(c => c.id === id ? updatedConfig : c));
        toast({
          title: 'Thành công',
          description: 'Cập nhật cấu hình giới hạn xe thành công (Mock)',
        });
        return updatedConfig;
      }
      
      // Gọi API thật
      const updatedConfig = await vehicleCapacityApi.update(id, config);
      setConfigs(prev => prev.map(c => c.id === id ? updatedConfig : c));
      toast({
        title: 'Thành công',
        description: 'Cập nhật cấu hình giới hạn xe thành công',
      });
      return updatedConfig;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể cập nhật cấu hình giới hạn xe';
      setError(errorMessage);
      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [useMockData, toast]);

  // Delete config
  const deleteConfig = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      // Luôn gọi API thật
      await vehicleCapacityApi.delete(id);
      setConfigs(prev => prev.filter(c => c.id !== id));
      toast({
        title: 'Thành công',
        description: 'Xóa cấu hình giới hạn xe thành công',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể xóa cấu hình giới hạn xe';
      setError(errorMessage);
      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [useMockData, toast]);

  // Toggle config active status
  const toggleConfigActive = useCallback(async (id: number, isActive: boolean) => {
    try {
      setLoading(true);
      setError(null);
      
      // Luôn gọi API thật
      const updatedConfig = await vehicleCapacityApi.toggleActive(id, isActive);
      setConfigs(prev => prev.map(c => c.id === id ? updatedConfig : c));
      toast({
        title: 'Thành công',
        description: `Đã ${isActive ? 'bật' : 'tắt'} cấu hình giới hạn xe`,
      });
      return updatedConfig;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể cập nhật trạng thái cấu hình';
      setError(errorMessage);
      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    } finally {
      setLoading(false);
    }
  }, [useMockData, configs, toast]);

  // Check capacity for specific vehicle type
  const checkCapacity = useCallback(async (buildingId: number, vehicleType: string): Promise<VehicleCapacityCheck | null> => {
    try {
      setError(null);
      
      // Luôn gọi API thật
      const result = await vehicleCapacityApi.checkCapacity(buildingId, vehicleType);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Không thể kiểm tra khả năng thêm xe';
      setError(errorMessage);
      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    }
  }, [useMockData, toast]);

  // Get config by building ID
  const getConfigByBuilding = useCallback((buildingId: number) => {
    return configs.find(c => c.buildingId === buildingId);
  }, [configs]);

  // Check if vehicle can be registered
  const canRegisterVehicle = useCallback((buildingId: number, vehicleType: string): boolean => {
    const config = getConfigByBuilding(buildingId);
    if (!config || !config.isActive) return true; // No restriction if no config or inactive

    const typeKey = getVehicleTypeKey(vehicleType);
    if (!typeKey) return true; // Unknown vehicle type, allow

    const maxKey = `max${typeKey.charAt(0).toUpperCase() + typeKey.slice(1)}` as keyof VehicleCapacityConfig;
    const currentKey = `current${typeKey.charAt(0).toUpperCase() + typeKey.slice(1)}` as keyof VehicleCapacityConfig;
    
    const max = config[maxKey] as number || 0;
    const current = config[currentKey] as number || 0;
    
    return max === 0 || current < max;
  }, [getConfigByBuilding]);

  // Helper function to get vehicle type key
  const getVehicleTypeKey = (vehicleType: string): string => {
    const type = vehicleType.toLowerCase();
    if (type.includes('car') || type.includes('ô tô')) return 'cars';
    if (type.includes('motorcycle') || type.includes('xe máy')) return 'motorcycles';
    if (type.includes('truck') || type.includes('xe tải')) return 'trucks';
    if (type.includes('van') || type.includes('xe van')) return 'vans';
    if (type.includes('electric') || type.includes('xe điện')) return 'electricVehicles';
    if (type.includes('bicycle') || type.includes('xe đạp')) return 'bicycles';
    return '';
  };

  // Get remaining capacity for vehicle type
  const getRemainingCapacity = useCallback((buildingId: number, vehicleType: string): number => {
    const config = getConfigByBuilding(buildingId);
    if (!config || !config.isActive) return -1; // No restriction

    const typeKey = getVehicleTypeKey(vehicleType);
    if (!typeKey) return -1; // Unknown vehicle type

    const maxKey = `max${typeKey.charAt(0).toUpperCase() + typeKey.slice(1)}` as keyof VehicleCapacityConfig;
    const currentKey = `current${typeKey.charAt(0).toUpperCase() + typeKey.slice(1)}` as keyof VehicleCapacityConfig;
    
    const max = config[maxKey] as number || 0;
    const current = config[currentKey] as number || 0;
    
    return Math.max(0, max - current);
  }, [getConfigByBuilding]);

  // Không còn cần toggle mock data

  useEffect(() => {
    loadConfigs();
  }, [loadConfigs]);

  return {
    configs,
    loading,
    error,
    useMockData,
    loadConfigs,
    loadConfigByBuilding,
    createConfig,
    updateConfig,
    deleteConfig,
    toggleConfigActive,
    checkCapacity,
    getConfigByBuilding,
    canRegisterVehicle,
    getRemainingCapacity,
  };
}
