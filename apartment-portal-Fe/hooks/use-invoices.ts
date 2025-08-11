import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Invoice } from '@/lib/api';

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/api/admin/invoices');
      
      if (response.ok) {
        const data = await response.json();
        setInvoices(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Không thể tải danh sách hóa đơn');
      }
    } catch (err) {
      console.error('Fetch invoices error:', err);
      setError('Có lỗi xảy ra khi kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  const getInvoiceById = async (id: number): Promise<Invoice | null> => {
    try {
      const response = await api.get(`/api/admin/invoices/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Không tìm thấy hóa đơn');
        return null;
      }
    } catch (err) {
      console.error('Get invoice by id error:', err);
      setError('Có lỗi xảy ra khi kết nối đến server');
      return null;
    }
  };

  const getLatestInvoice = async (apartmentId: number): Promise<Invoice | null> => {
    try {
      const response = await api.get(`/api/admin/apartments/${apartmentId}/latest-invoice`);
      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        return null;
      }
    } catch (err) {
      console.error('Get latest invoice error:', err);
      return null;
    }
  };

  const updateInvoiceStatus = async (id: number, status: string): Promise<boolean> => {
    try {
      const response = await api.patch(`/api/admin/invoices/${id}/status`, { status });
      
      if (response.ok) {
        // Refresh the invoices list
        await fetchInvoices();
        return true;
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Không thể cập nhật trạng thái hóa đơn');
        return false;
      }
    } catch (err) {
      console.error('Update invoice status error:', err);
      setError('Có lỗi xảy ra khi kết nối đến server');
      return false;
    }
  };

  const deleteInvoice = async (id: number): Promise<boolean> => {
    try {
      const response = await api.delete(`/api/admin/invoices/${id}`);
      
      if (response.ok) {
        // Refresh the invoices list
        await fetchInvoices();
        return true;
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Không thể xóa hóa đơn');
        return false;
      }
    } catch (err) {
      console.error('Delete invoice error:', err);
      setError('Có lỗi xảy ra khi kết nối đến server');
      return false;
    }
  };

  // Fetch invoices on mount
  useEffect(() => {
    fetchInvoices();
  }, []);

  return {
    invoices,
    loading,
    error,
    fetchInvoices,
    getInvoiceById,
    getLatestInvoice,
    updateInvoiceStatus,
    deleteInvoice,
  };
}; 