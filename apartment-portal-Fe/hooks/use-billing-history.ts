import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export interface BillingHistory {
  id: number;
  year: number;
  apartmentId?: number;
  apartmentName?: string;
  serviceFeePerM2: number;
  waterFeePerM3: number;
  parkingFee: number;
  totalInvoices: number;
  totalAmount: number;
  status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
  message: string;
  createdAt: string;
}

export const useBillingHistory = (year?: number) => {
  const [history, setHistory] = useState<BillingHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async (targetYear?: number) => {
    setLoading(true);
    setError(null);

    try {
      const url = targetYear 
        ? `/api/admin/yearly-billing/history?year=${targetYear}`
        : '/api/admin/yearly-billing/history';
      
      const response = await api.get(url);
      
      if (response.ok) {
        const data = await response.json();
        setHistory(Array.isArray(data) ? data : data.data || []);
      } else {
        setError('Không thể tải lịch sử tạo biểu phí');
        setHistory([]);
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi kết nối đến server');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(year);
  }, [year]);

  return {
    history,
    loading,
    error,
    fetchHistory,
  };
}; 