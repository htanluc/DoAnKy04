import { useState } from 'react';
import { api } from '@/lib/api';

export interface YearlyBillingRequest {
  year?: number;
  apartmentId?: number | null;
  serviceFeePerM2: number;
  waterFeePerM3: number;
  motorcycleFee: number;
  car4SeatsFee: number;
  car7SeatsFee: number;
}

export interface YearlyBillingResponse {
  success: boolean;
  message: string;
  apartmentId?: number;
  billingPeriod?: string;
}

export interface YearlyBillingConfig {
  month: number;
  year: number;
  serviceFeePerM2: number;
  waterFeePerM3: number;
  motorcycleFee: number;
  car4SeatsFee: number;
  car7SeatsFee: number;
}

export interface FeeConfigResponse {
  success: boolean;
  config?: YearlyBillingConfig;
  configs?: YearlyBillingConfig[];
  message?: string;
}

// Invoice interfaces
export interface InvoiceItem {
  id: number;
  feeType: string;
  description: string;
  amount: number;
}

export interface Invoice {
  id: number;
  apartmentId: number;
  apartmentNumber?: string;
  residentName?: string;
  buildingId?: number;
  floorNumber?: number;
  unitNumber?: string;
  billingPeriod: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  status: string;
  items: InvoiceItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface GenerateInvoiceRequest {
  apartmentId?: number;
  billingPeriod: string;
}

export interface GenerateInvoiceResponse {
  success: boolean;
  message: string;
  apartmentId?: number;
  billingPeriod?: string;
}

export const useYearlyBilling = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();

  // Tạo biểu phí cho năm hiện tại (API mới)
  const generateCurrentYearBilling = async (data: Omit<YearlyBillingRequest, 'year'>): Promise<YearlyBillingResponse | null> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.post('/api/admin/yearly-billing/generate-current-year', data);
      
      if (response.ok) {
        const result = await response.json();
        setSuccess(result.message);
        return result;
      } else {
        const errorData = await response.json();
        let errorMessage = errorData.message || 'Có lỗi xảy ra khi tạo biểu phí';
        
        if (response.status === 400) {
          errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin nhập vào.';
        } else if (response.status === 500) {
          errorMessage = 'Lỗi server: Vui lòng thử lại sau hoặc liên hệ quản trị viên.';
        }
        
        setError(errorMessage);
        return null;
      }
    } catch (err) {
      console.error('Generate current year billing error:', err);
      setError('Có lỗi xảy ra khi kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Tạo biểu phí cho năm cụ thể (API cũ - giữ lại để tương thích)
  const generateYearlyBilling = async (data: YearlyBillingRequest): Promise<YearlyBillingResponse | null> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.post('/api/admin/yearly-billing/generate', data);
      
      if (response.ok) {
        const result = await response.json();
        setSuccess(result.message);
        return result;
      } else {
        const errorData = await response.json();
        let errorMessage = errorData.message || 'Có lỗi xảy ra khi tạo biểu phí';
        
        if (response.status === 400) {
          errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin nhập vào.';
        } else if (response.status === 500) {
          errorMessage = 'Lỗi server: Vui lòng thử lại sau hoặc liên hệ quản trị viên.';
        }
        
        setError(errorMessage);
        return null;
      }
    } catch (err) {
      console.error('Yearly billing error:', err);
      setError('Có lỗi xảy ra khi kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Tạo cấu hình phí dịch vụ cho năm
  const createFeeConfig = async (data: YearlyBillingRequest): Promise<FeeConfigResponse | null> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.post('/api/admin/yearly-billing/fee-config', data);
      
      if (response.ok) {
        const result = await response.json();
        setSuccess(result.message);
        return result;
      } else {
        const errorData = await response.json();
        let errorMessage = errorData.message || 'Có lỗi xảy ra khi tạo cấu hình phí';
        
        if (response.status === 400) {
          errorMessage = 'Dữ liệu cấu hình không hợp lệ. Vui lòng kiểm tra lại.';
        } else if (response.status === 409) {
          errorMessage = 'Cấu hình cho năm này đã tồn tại. Vui lòng cập nhật thay vì tạo mới.';
        }
        
        setError(errorMessage);
        return null;
      }
    } catch (err) {
      console.error('Create fee config error:', err);
      setError('Có lỗi xảy ra khi kết nối đến server');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật cấu hình phí cho một tháng
  const updateMonthlyBillingConfig = async (year: number, month: number, config: Omit<YearlyBillingConfig, 'year' | 'month'>): Promise<FeeConfigResponse | null> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const params = new URLSearchParams({
        serviceFeePerM2: config.serviceFeePerM2.toString(),
        waterFeePerM3: config.waterFeePerM3.toString(),
        motorcycleFee: config.motorcycleFee.toString(),
        car4SeatsFee: config.car4SeatsFee.toString(),
        car7SeatsFee: config.car7SeatsFee.toString(),
      });

      const response = await api.put(`/api/admin/yearly-billing/config/${year}/${month}?${params}`);
      
      if (response.ok) {
        const result = await response.json();
        setSuccess(result.message);
        return result;
      } else {
        const errorData = await response.json();
        let errorMessage = errorData.message || 'Có lỗi xảy ra khi cập nhật cấu hình phí';
        
        if (response.status === 404) {
          errorMessage = 'Không tìm thấy cấu hình phí cho tháng/năm này. Vui lòng tạo cấu hình mới.';
        } else if (response.status === 400) {
          errorMessage = 'Dữ liệu cấu hình không hợp lệ. Vui lòng kiểm tra lại.';
        }
        
        setError(errorMessage);
        return null;
      }
    } catch (err) {
      console.error('Update config error:', err);
      setError('Có lỗi xảy ra khi kết nối đến server');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Lấy cấu hình phí cho một tháng
  const getMonthlyConfig = async (year: number, month: number): Promise<FeeConfigResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/api/admin/yearly-billing/config/${year}/${month}`);
      
      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Không tìm thấy cấu hình phí');
        return null;
      }
    } catch (err) {
      console.error('Get monthly config error:', err);
      setError('Có lỗi xảy ra khi kết nối đến server');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Lấy tất cả cấu hình phí cho một năm
  const getYearlyConfigs = async (year: number): Promise<FeeConfigResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/api/admin/yearly-billing/config/${year}`);
      
      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Không tìm thấy cấu hình phí');
        return null;
      }
    } catch (err) {
      console.error('Get yearly configs error:', err);
      setError('Có lỗi xảy ra khi kết nối đến server');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Tạo hóa đơn cho một căn hộ
  const generateInvoice = async (data: GenerateInvoiceRequest): Promise<GenerateInvoiceResponse | null> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.post('/api/admin/yearly-billing/generate', {
        year: parseInt(data.billingPeriod.split('-')[0]),
        apartmentId: data.apartmentId,
        serviceFeePerM2: 5000.0,
        waterFeePerM3: 15000.0,
        motorcycleFee: 50000.0,
        car4SeatsFee: 200000.0,
        car7SeatsFee: 250000.0
      });
      
      if (response.ok) {
        const result = await response.json();
        setSuccess(result.message);
        return result;
      } else {
        const errorData = await response.json();
        let errorMessage = errorData.message || 'Có lỗi xảy ra khi tạo hóa đơn';
        
        if (response.status === 400) {
          errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin nhập vào.';
        } else if (response.status === 429) {
          errorMessage = 'Quá nhiều request. Vui lòng thử lại sau 100ms.';
        } else if (response.status === 500) {
          errorMessage = 'Lỗi server: Vui lòng thử lại sau hoặc liên hệ quản trị viên.';
        }
        
        setError(errorMessage);
        return null;
      }
    } catch (err) {
      console.error('Generate invoice error:', err);
      setError('Có lỗi xảy ra khi kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Tạo hóa đơn cho tất cả căn hộ
  const generateAllInvoices = async (billingPeriod: string): Promise<GenerateInvoiceResponse | null> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const year = parseInt(billingPeriod.split('-')[0]);
      const response = await api.post('/api/admin/yearly-billing/generate-once', {
        year: year,
        serviceFeePerM2: 5000.0,
        waterFeePerM3: 15000.0,
        motorcycleFee: 50000.0,
        car4SeatsFee: 200000.0,
        car7SeatsFee: 250000.0
      });
      
      if (response.ok) {
        const result = await response.json();
        setSuccess(result.message);
        return result;
      } else {
        const errorData = await response.json();
        let errorMessage = errorData.message || 'Có lỗi xảy ra khi tạo hóa đơn cho tất cả căn hộ';
        
        if (response.status === 400) {
          errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin nhập vào.';
        } else if (response.status === 429) {
          errorMessage = 'Quá nhiều request. Vui lòng thử lại sau 100ms.';
        } else if (response.status === 500) {
          errorMessage = 'Lỗi server: Vui lòng thử lại sau hoặc liên hệ quản trị viên.';
        }
        
        setError(errorMessage);
        return null;
      }
    } catch (err) {
      console.error('Generate all invoices error:', err);
      setError('Có lỗi xảy ra khi kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Tạo hóa đơn cho tất cả căn hộ theo tháng cụ thể
  const generateMonthlyInvoices = async (year: number, month: number, feeConfig?: Partial<YearlyBillingRequest>): Promise<GenerateInvoiceResponse | null> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Sử dụng API mới để tạo hóa đơn cho toàn bộ căn hộ ở tháng cụ thể
      const requestData = {
        serviceFeePerM2: feeConfig?.serviceFeePerM2 || 5000,
        waterFeePerM3: feeConfig?.waterFeePerM3 || 15000,
        motorcycleFee: feeConfig?.motorcycleFee || 50000,
        car4SeatsFee: feeConfig?.car4SeatsFee || 200000,
        car7SeatsFee: feeConfig?.car7SeatsFee || 250000,
      };
      
      // Sử dụng API đúng format: /api/admin/yearly-billing/generate-month/{year}/{month}
      const response = await api.post(`/api/admin/yearly-billing/generate-month/${year}/${month}`, requestData);
      
      if (response.ok) {
        const result = await response.json();
        setSuccess(result.message || `Đã tạo hóa đơn thành công cho tháng ${month}/${year} cho tất cả căn hộ`);
        return result;
      } else {
        const errorData = await response.json();
        let errorMessage = errorData.message || 'Có lỗi xảy ra khi tạo hóa đơn cho tháng này';
        
        if (response.status === 400) {
          errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin nhập vào.';
        } else if (response.status === 404) {
          errorMessage = 'Không tìm thấy cấu hình phí cho tháng/năm này. Vui lòng tạo cấu hình trước.';
        } else if (response.status === 409) {
          errorMessage = 'Hóa đơn cho tháng này đã tồn tại. Vui lòng kiểm tra lại.';
        } else if (response.status === 429) {
          errorMessage = 'Quá nhiều request. Vui lòng thử lại sau 100ms.';
        } else if (response.status === 500) {
          errorMessage = 'Lỗi server: Vui lòng thử lại sau hoặc liên hệ quản trị viên.';
        }
        
        setError(errorMessage);
        return null;
      }
    } catch (err) {
      console.error('Generate monthly invoices error:', err);
      setError('Có lỗi xảy ra khi kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Lấy thống kê hóa đơn
  const getInvoiceStats = async (year: number): Promise<any | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/api/admin/yearly-billing/invoice-stats/${year}`);
      
      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Không thể lấy thống kê hóa đơn');
        return null;
      }
    } catch (err) {
      console.error('Get invoice stats error:', err);
      setError('Có lỗi xảy ra khi kết nối đến server');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Clear cache
  const clearCache = async (): Promise<any | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/admin/yearly-billing/clear-cache');
      
      if (response.ok) {
        const result = await response.json();
        setSuccess('Đã xóa cache thành công');
        return result;
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Không thể xóa cache');
        return null;
      }
    } catch (err) {
      console.error('Clear cache error:', err);
      setError('Có lỗi xảy ra khi kết nối đến server');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Tính lại phí cho một tháng
  const recalculateFees = async (billingPeriod: string): Promise<GenerateInvoiceResponse | null> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.post(`/api/admin/invoices/recalculate-fees?billingPeriod=${billingPeriod}`);
      
      if (response.ok) {
        const result = await response.json();
        setSuccess(result.message);
        return result;
      } else {
        const errorData = await response.json();
        let errorMessage = errorData.message || 'Có lỗi xảy ra khi tính lại phí';
        
        if (response.status === 400) {
          errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin nhập vào.';
        } else if (response.status === 500) {
          errorMessage = 'Lỗi server: Vui lòng thử lại sau hoặc liên hệ quản trị viên.';
        }
        
        setError(errorMessage);
        return null;
      }
    } catch (err) {
      console.error('Recalculate fees error:', err);
      setError('Có lỗi xảy ra khi kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách hóa đơn theo căn hộ
  const getInvoicesByApartment = async (apartmentId: number): Promise<Invoice[] | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/api/admin/invoices/by-apartments?aptIds=${apartmentId}`);
      
      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Không tìm thấy hóa đơn cho căn hộ này');
        return null;
      }
    } catch (err) {
      console.error('Get invoices by apartment error:', err);
      setError('Có lỗi xảy ra khi kết nối đến server');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Lấy chi tiết hóa đơn
  const getInvoiceById = async (id: number): Promise<Invoice | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get(`/api/admin/invoices/${id}`);
      
      if (response.ok) {
        const result = await response.json();
        return result;
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Không tìm thấy hóa đơn');
        return null;
      }
    } catch (err) {
      console.error('Get invoice by id error:', err);
      setError('Có lỗi xảy ra khi kết nối đến server');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Tạo hóa đơn cho căn hộ cụ thể theo tháng (API mới)
  const generateInvoiceForApartment = async (apartmentId: number, billingPeriod: string, feeConfig?: Partial<YearlyBillingRequest>): Promise<GenerateInvoiceResponse | null> => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const requestData = {
        serviceFeePerM2: feeConfig?.serviceFeePerM2 || 5000,
        waterFeePerM3: feeConfig?.waterFeePerM3 || 15000,
        motorcycleFee: feeConfig?.motorcycleFee || 50000,
        car4SeatsFee: feeConfig?.car4SeatsFee || 200000,
        car7SeatsFee: feeConfig?.car7SeatsFee || 250000,
      };

      // Sử dụng API format mới: POST /api/admin/invoices/generate?apartmentId={id}&billingPeriod={yyyy-MM}
      const response = await api.post(`/api/admin/invoices/generate?apartmentId=${apartmentId}&billingPeriod=${billingPeriod}`, requestData);
      
      if (response.ok) {
        const result = await response.json();
        setSuccess(result.message);
        return result;
      } else {
        const errorData = await response.json();
        let errorMessage = errorData.message || 'Có lỗi xảy ra khi tạo hóa đơn cho căn hộ';
        
        if (response.status === 400) {
          errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin nhập vào.';
        } else if (response.status === 404) {
          errorMessage = 'Không tìm thấy căn hộ với ID này.';
        } else if (response.status === 409) {
          errorMessage = 'Hóa đơn cho căn hộ này trong tháng này đã tồn tại.';
        } else if (response.status === 500) {
          errorMessage = 'Lỗi server: Vui lòng thử lại sau hoặc liên hệ quản trị viên.';
        }
        
        setError(errorMessage);
        return null;
      }
    } catch (err) {
      console.error('Generate invoice for apartment error:', err);
      setError('Có lỗi xảy ra khi kết nối đến server. Vui lòng kiểm tra kết nối mạng và thử lại.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return {
    loading,
    error,
    success,
    generateCurrentYearBilling,
    generateYearlyBilling,
    createFeeConfig,
    updateMonthlyBillingConfig,
    getMonthlyConfig,
    getYearlyConfigs,
    generateInvoice,
    generateAllInvoices,
    generateMonthlyInvoices,
    generateInvoiceForApartment,
    recalculateFees,
    getInvoicesByApartment,
    getInvoiceById,
    clearMessages,
    getInvoiceStats,
    clearCache,
  };
}; 