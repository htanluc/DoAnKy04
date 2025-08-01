import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export interface BillingConfig {
  id?: number;
  year: number;
  month: number;
  serviceFeePerM2: number;
  waterFeePerM3: number;
  motorcycleFee: number;
  car4SeatsFee: number;
  car7SeatsFee: number;
  createdAt?: string;
  updatedAt?: string;
}

export const useBillingConfig = (year?: number, month?: number) => {
  const [config, setConfig] = useState<BillingConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfig = async (targetYear?: number, targetMonth?: number) => {
    if (!targetYear || !targetMonth) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/api/admin/yearly-billing/config/${targetYear}/${targetMonth}`);
      
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      } else {
        setError('Không tìm thấy cấu hình phí cho tháng này');
        setConfig(null);
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi tải cấu hình phí');
      setConfig(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (year && month) {
      fetchConfig(year, month);
    }
  }, [year, month]);

  const createConfig = async (configData: Omit<BillingConfig, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/admin/yearly-billing/config', configData);
      
      if (response.ok) {
        const newConfig = await response.json();
        setConfig(newConfig);
        return true;
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Có lỗi xảy ra khi tạo cấu hình phí');
        return false;
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi kết nối đến server');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = async (configData: Partial<BillingConfig>) => {
    if (!config?.id) return false;
    
    setLoading(true);
    setError(null);

    try {
      const response = await api.put(`/api/admin/yearly-billing/config/${config.id}`, configData);
      
      if (response.ok) {
        const updatedConfig = await response.json();
        setConfig(updatedConfig);
        return true;
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Có lỗi xảy ra khi cập nhật cấu hình phí');
        return false;
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi kết nối đến server');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    config,
    loading,
    error,
    fetchConfig,
    createConfig,
    updateConfig,
  };
}; 