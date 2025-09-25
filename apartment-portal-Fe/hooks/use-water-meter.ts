import { useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/auth';

export interface WaterMeterReading {
  readingId?: number;
  apartmentId: number;
  readingMonth: string; // YYYY-MM
  previousReading: number;
  currentReading: number;
  consumption?: number;
  createdAt?: string;
}

const WATER_API_BASE = `${API_BASE_URL.replace(/\/$/, '')}/api/admin/water-readings`;

function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

export function useWaterMeter() {
  const [readings, setReadings] = useState<WaterMeterReading[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReadings();
  }, []);

  async function fetchReadings() {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const res = await fetch(`${WATER_API_BASE}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) throw new Error('Không thể tải dữ liệu');
      const data = await res.json();
      console.log('fetchReadings result:', data);
      setReadings(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchReadingsByMonth(month: string) {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const res = await fetch(`${WATER_API_BASE}/by-month?month=${month}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      if (!res.ok) throw new Error('Không thể tải dữ liệu theo tháng');
      const data = await res.json();
      console.log('fetchReadingsByMonth result:', data);
      setReadings(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function addReading(reading: Omit<WaterMeterReading, 'readingId' | 'consumption' | 'createdAt'>) {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      // Backend yêu cầu readingDate (YYYY-MM-01) thay vì readingMonth
      const readingDate = `${reading.readingMonth}-01`;
      const payload = {
        apartmentId: reading.apartmentId,
        readingDate,
        previousReading: reading.previousReading ?? 0,
        currentReading: reading.currentReading,
        recordedBy: 0,
      };
      const res = await fetch(`${WATER_API_BASE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Thêm/sửa chỉ số thất bại');
      const created = await res.json();
      setReadings(prev => prev.map(r => (
        r.apartmentId === reading.apartmentId && r.readingMonth === reading.readingMonth
          ? { ...r, ...created }
          : r
      )));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateReading(id: number, reading: Omit<WaterMeterReading, 'readingId' | 'consumption' | 'createdAt'>) {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const res = await fetch(`${WATER_API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(reading),
      });
      if (!res.ok) throw new Error('Cập nhật chỉ số thất bại');
      await fetchReadings();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function patchReading(id: number, patch: Partial<WaterMeterReading>) {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const res = await fetch(`${WATER_API_BASE}/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error('Cập nhật nhanh chỉ số thất bại');
      // Cập nhật tại chỗ để tránh reset toàn bộ và làm chớp row khác
      const updated = await res.json();
      setReadings(prev => prev.map(r => (r.readingId === id ? { ...r, ...updated } : r)));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function deleteReading(id: number) {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
      });
      if (!res.ok) throw new Error('Xóa chỉ số thất bại');
      await fetchReadings();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function bulkGenerate(startMonth: string) {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      const res = await fetch(`${WATER_API_BASE}/generate?startMonth=${startMonth}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
      });
      if (!res.ok) throw new Error('Tạo lịch sử chỉ số nước thất bại');
      await fetchReadings();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { readings, loading, error, fetchReadings, fetchReadingsByMonth, addReading, updateReading, deleteReading, patchReading, bulkGenerate };
}
