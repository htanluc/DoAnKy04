// API configuration with authentication
import { getToken, refreshToken, removeTokens } from './auth'
import { config } from './config'

const API_BASE_URL = config.API_BASE_URL

// Custom fetch wrapper with authentication
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const isProtected = endpoint.startsWith("/api/admin") || (endpoint.startsWith("/api/") && !endpoint.startsWith("/api/auth"));
  const headers = new Headers(options.headers || {});
  if (token && isProtected) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  // Thêm Content-Type: application/json nếu có body và chưa có header này
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const config = { ...options, headers };
  let response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  // Handle 401 Unauthorized
  if (response.status === 401) {
    // Thử refresh token
    const refreshed = await refreshToken()
    if (refreshed && refreshed.token) {
      // Gửi lại request với token mới
      headers.set("Authorization", `Bearer ${refreshed.token}`);
      response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      if (response.status !== 401) return response
    }
    // Nếu vẫn 401 hoặc refresh token hết hạn
    removeTokens()
    if (typeof window !== 'undefined') {
      // Redirect về login thay vì reload trang
      window.location.href = '/login'
    }
  }

  return response
}

// API methods
export const api = {
  // GET request
  get: (endpoint: string) => apiFetch(endpoint),

  // POST request
  post: (endpoint: string, data?: any) => apiFetch(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  }),

  // PUT request
  put: (endpoint: string, data?: any) => apiFetch(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  }),

  // DELETE request
  delete: (endpoint: string) => apiFetch(endpoint, {
    method: 'DELETE',
  }),

  // PATCH request
  patch: (endpoint: string, data?: any) => apiFetch(endpoint, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  }),
}

// Users API
export const usersApi = {
  // Get user by ID
  getById: async (id: number): Promise<any> => {
    const response = await api.get(`/api/admin/users/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    return response.json();
  },
};

// Error handling utility
export const handleApiError = (error: any): string => {
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.message || 'Có lỗi xảy ra'
    return message
  } else if (error.request) {
    // Network error
    return 'Không thể kết nối đến server'
  } else {
    // Other error
    return 'Có lỗi xảy ra'
  }
}

// Type definitions according to API documentation
export type AnnouncementType = 'NEWS' | 'REGULAR' | 'URGENT';
export type TargetAudience = 'ALL_RESIDENTS' | 'TOWER_A_RESIDENTS' | 'TOWER_B_RESIDENTS' | 'SPECIFIC_APARTMENTS';
export type RegistrationStatus = 'REGISTERED' | 'CANCELLED';
export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface Announcement {
  id: number;
  title: string;
  content: string;
  type: AnnouncementType;
  targetAudience: TargetAudience;
  createdBy: number;
  creatorName?: string; // Tên người tạo
  creatorEmail?: string; // Email người tạo
  isActive: boolean;
  createdAt: string;
}

export interface AnnouncementCreateRequest {
  title: string;
  content: string;
  type: AnnouncementType;
  targetAudience: TargetAudience;
  isActive: boolean;
}

export interface AnnouncementUpdateRequest {
  title?: string;
  content?: string;
  type?: AnnouncementType;
  targetAudience?: TargetAudience;
  isActive?: boolean;
}

// Resident
export interface Resident {
  id: number;
  userId: number;
  fullName: string;
  dateOfBirth: string; // ISO date
  idCardNumber: string;
  familyRelation: string;
  status: number;
}

// User
export interface User {
  id: number;
  username: string;
  email: string;
  phoneNumber: string;
  fullName?: string;  // Thêm trường fullName
  firstName?: string; // Thêm trường firstName
  lastName?: string;  // Thêm trường lastName
  status: string;
  lockReason?: string;
  createdAt?: string;
  updatedAt?: string;
  roles: Role[];
}

export interface Role {
  id: number;
  name: string;
  description?: string;
}

// Apartment
export interface Apartment {
  id: number;
  buildingId: number;
  floorNumber: number;
  unitNumber: string;
  area: number;
  status: string;
}

// Facility
export interface Facility {
  id: number;
  name: string;
  description: string;
  location: string;
  capacity: number;
  otherDetails: string;
  usageFee: number; // number thay vì string|null
  openingHours?: string;
  isVisible?: boolean; // Trường để ẩn/hiển thị tiện ích
}

// FacilityBooking
export interface FacilityBooking {
  id: number;
  facility: Facility; // object mapping
  user: User; // object mapping
  bookingTime: string;
  duration: number;
  status: string;
  numberOfPeople: number;
  purpose: string;
  approvedBy?: User;
  approvedAt?: string;
  createdAt: string;
}

export interface FacilityBookingCreateRequest {
  facilityId: number;
  userId: number;
  bookingTime: string;
  duration: number;
  numberOfPeople: number;
  purpose: string;
}

// Event
export interface Event {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  createdAt: string;
}

// EventRegistration
export interface EventRegistration {
  id: number;
  event: Event;
  residentId: number;
  registeredAt: string;
  status: string;
}

export interface EventRegistrationRequest {
  eventId: number;
  residentId: number;
}

// ServiceRequest
export interface ServiceRequest {
  id: number;
  user?: User;
  userName?: string; // Tên đầy đủ của cư dân từ backend
  userPhone?: string;
  title?: string;  // Thêm trường title
  category?: ServiceCategory;
  categoryName?: string; // Tên danh mục từ backend
  description: string;
  imageAttachment?: string;
  submittedAt?: string;
  createdAt?: string; // Ngày tạo từ backend
  assignedTo?: User | string; // Có thể là User object hoặc string từ backend
  assignedAt?: string;
  status: string;
  priority: string;
  resolutionNotes?: string;
  completedAt?: string;
  rating?: number;
}

export interface ServiceCategory {
  categoryCode: string;
  categoryName: string;
  assignedRole?: string;
  description?: string;
}

// Payment
export interface Payment {
  id: number;
  invoice: Invoice;
  paidByUserId: number;
  paymentDate: string;
  amount: number;
  method: string;
  status: string;
  referenceCode?: string;
}

// Invoice
export interface Invoice {
  id: number;
  apartmentId: number;
  billingPeriod: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  items?: InvoiceItem[];
  payments?: Payment[];
}

export interface InvoiceItem {
  id: number;
  invoiceId: number;
  description: string;
  amount: number;
}

// Announcements API
export const announcementsApi = {
  // Get all announcements
  getAll: async (): Promise<Announcement[]> => {
    const response = await api.get('/api/admin/announcements');
    if (!response.ok) {
      throw new Error('Failed to fetch announcements');
    }
    return response.json();
  },

  // Get announcement by ID
  getById: async (id: number): Promise<Announcement> => {
    const response = await api.get(`/api/admin/announcements/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch announcement');
    }
    return response.json();
  },

  // Create new announcement
  create: async (data: AnnouncementCreateRequest): Promise<Announcement> => {
    const response = await api.post('/api/admin/announcements', data);
    if (!response.ok) {
      throw new Error('Failed to create announcement');
    }
    return response.json();
  },

  // Update announcement
  update: async (id: number, data: AnnouncementUpdateRequest): Promise<void> => {
    const response = await api.put(`/api/admin/announcements/${id}`, data);
    if (!response.ok) {
      throw new Error('Failed to update announcement');
    }
  },

  // Delete announcement
  delete: async (id: number): Promise<void> => {
    const response = await api.delete(`/api/admin/announcements/${id}`);
    if (!response.ok) {
      throw new Error('Failed to delete announcement');
    }
  },
};

// Events API
export const eventsApi = {
  // Get all events
  getAll: async (): Promise<Event[]> => {
    const response = await api.get('/api/admin/events');
    if (!response.ok) {
      throw new Error('Failed to fetch events');
    }
    return response.json();
  },

  // Get event by ID
  getById: async (id: number): Promise<Event> => {
    const response = await api.get(`/api/admin/events/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch event');
    }
    return response.json();
  },

  // Create new event
  create: async (data: EventCreateRequest): Promise<Event> => {
    const response = await api.post('/api/admin/events', data);
    if (!response.ok) {
      throw new Error('Failed to create event');
    }
    return response.json();
  },

  // Update event
  update: async (id: number, data: EventUpdateRequest): Promise<void> => {
    const response = await api.put(`/api/admin/events/${id}`, data);
    if (!response.ok) {
      throw new Error('Failed to update event');
    }
  },

  // Delete event
  delete: async (id: number): Promise<void> => {
    const response = await api.delete(`/api/admin/events/${id}`);
    if (!response.ok) {
      throw new Error('Failed to delete event');
    }
  },

  // Get event registrations
  getRegistrations: async (eventId: number): Promise<EventRegistration[]> => {
    const response = await api.get(`/api/admin/events/${eventId}/registrations`);
    if (!response.ok) {
      throw new Error('Failed to fetch event registrations');
    }
    return response.json();
  },
};

// Event Registrations API (for residents)
export const eventRegistrationsApi = {
  // Register for event
  register: async (data: EventRegistrationRequest): Promise<EventRegistration> => {
    const response = await api.post('/api/event-registrations/register', data);
    if (!response.ok) {
      throw new Error('Failed to register for event');
    }
    return response.json();
  },

  // Cancel registration
  cancel: async (registrationId: number): Promise<void> => {
    const response = await api.delete(`/api/event-registrations/${registrationId}/cancel`);
    if (!response.ok) {
      throw new Error('Failed to cancel registration');
    }
  },
};

// Facilities API
export const facilitiesApi = {
  // Get all facilities
  getAll: async (): Promise<Facility[]> => {
    const response = await api.get('/api/admin/facilities');
    if (!response.ok) {
      throw new Error('Failed to fetch facilities');
    }
    return response.json();
  },

  // Get facility by ID
  getById: async (id: number): Promise<Facility> => {
    const response = await api.get(`/api/admin/facilities/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch facility');
    }
    return response.json();
  },

  // Create new facility
  create: async (data: FacilityCreateRequest): Promise<Facility> => {
    const response = await api.post('/api/admin/facilities', data);
    if (!response.ok) {
      throw new Error('Failed to create facility');
    }
    return response.json();
  },

  // Update facility
  update: async (id: number, data: FacilityUpdateRequest): Promise<void> => {
    const response = await api.put(`/api/admin/facilities/${id}`, data);
    if (!response.ok) {
      throw new Error('Failed to update facility');
    }
  },

  // Toggle facility visibility
  toggleVisibility: async (id: number): Promise<Facility> => {
    const response = await api.put(`/api/admin/facilities/${id}/toggle-visibility`);
    if (!response.ok) {
      throw new Error('Failed to toggle facility visibility');
    }
    return response.json();
  },

  // Delete facility
  delete: async (id: number): Promise<void> => {
    const response = await api.delete(`/api/admin/facilities/${id}`);
    if (!response.ok) {
      throw new Error('Failed to delete facility');
    }
  },
};

// Facility Bookings API
export const facilityBookingsApi = {
  // Get all facility bookings (admin)
  getAll: async (): Promise<FacilityBooking[]> => {
    const response = await api.get('/api/admin/facility-bookings');
    if (!response.ok) {
      throw new Error('Failed to fetch facility bookings');
    }
    return response.json();
  },

  // Get facility booking by ID (admin)
  getById: async (id: number): Promise<FacilityBooking> => {
    const response = await api.get(`/api/admin/facility-bookings/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch facility booking');
    }
    return response.json();
  },

  // Update status (admin)
  updateStatus: async (
    id: number,
    status: 'PENDING' | 'APPROVED' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED',
    rejectionReason?: string
  ): Promise<FacilityBooking> => {
    // Map APPROVED -> CONFIRMED để phù hợp BE
    const mapped = status === 'APPROVED' ? 'CONFIRMED' : status;
    const response = await api.patch(`/api/admin/facility-bookings/${id}`, {
      status: mapped,
      ...(mapped === 'REJECTED' && rejectionReason ? { rejectionReason } : {}),
    } as any);
    if (!response.ok) throw new Error('Failed to update booking status');
    return response.json();
  },

  // Create facility booking (resident)
  create: async (data: FacilityBookingCreateRequest): Promise<FacilityBooking> => {
    const response = await api.post('/api/facility-bookings', data);
    if (!response.ok) {
      throw new Error('Failed to create facility booking');
    }
    return response.json();
  },

  // Update facility booking (resident)
  update: async (id: number, data: FacilityBookingCreateRequest): Promise<void> => {
    const response = await api.put(`/api/facility-bookings/${id}`, data);
    if (!response.ok) {
      throw new Error('Failed to update facility booking');
    }
  },

  // Cancel facility booking (resident)
  cancel: async (id: number): Promise<void> => {
    const response = await api.delete(`/api/facility-bookings/${id}`);
    if (!response.ok) {
      throw new Error('Failed to cancel facility booking');
    }
  },
};

// Residents API
export const residentsApi = {
  // Lấy danh sách tất cả cư dân
  getAll: async (): Promise<any[]> => {
    const response = await api.get('/api/admin/residents');
    if (!response.ok) throw new Error('Failed to fetch residents');
    return response.json();
  },
  // Lấy thông tin cư dân theo ID
  getById: async (id: number): Promise<any> => {
    const response = await api.get(`/api/admin/residents/${id}`);
    if (!response.ok) throw new Error('Failed to fetch resident');
    return response.json();
  },
  // Tạo cư dân mới
  create: async (data: any): Promise<any> => {
    const response = await api.post('/api/admin/residents', data);
    if (!response.ok) throw new Error('Failed to create resident');
    return response.json();
  },
  // Cập nhật thông tin cư dân
  update: async (id: number, data: any): Promise<any> => {
    const response = await api.put(`/api/admin/residents/${id}`, data);
    if (!response.ok) throw new Error('Failed to update resident');
    return response.json();
  },
  // Xóa cư dân
  delete: async (id: number): Promise<void> => {
    const response = await api.delete(`/api/admin/residents/${id}`);
    if (!response.ok) throw new Error('Failed to delete resident');
  },
};

// EventCreateRequest & EventUpdateRequest
export interface EventCreateRequest {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
}

export interface EventUpdateRequest {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
}

// FacilityCreateRequest & FacilityUpdateRequest
export interface FacilityCreateRequest {
  name: string;
  description: string;
  location: string;
  capacity: number;
  otherDetails: string;
  usageFee: number;
  openingHours?: string;
  isVisible?: boolean;
}

export interface FacilityUpdateRequest {
  name?: string;
  description?: string;
  location?: string;
  capacity?: number;
  otherDetails?: string;
  usageFee?: number;
  openingHours?: string;
  isVisible?: boolean;
}

// FEEDBACK TYPES
export type FeedbackStatus = 'PENDING' | 'RESPONDED' | 'REJECTED';

export interface Feedback {
  id: number;
  userId: number;
  username: string;
  residentName: string; // Thêm dòng này để khớp với dữ liệu API
  categoryCode: string;
  categoryName: string;
  title?: string;
  content: string;
  rating?: number;
  status: FeedbackStatus;
  response?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}

export interface FeedbackCreateRequest {
  residentId: number;
  categoryId: string;
  title?: string;
  content: string;
  rating?: number;
}

// FEEDBACK API
export const feedbacksApi = {
  // Resident gửi phản hồi
  create: async (data: FeedbackCreateRequest): Promise<Feedback> => {
    const response = await api.post('/api/feedbacks', data);
    if (!response.ok) throw new Error('Gửi phản hồi thất bại');
    return response.json();
  },
  // Resident xem danh sách phản hồi của mình
  getMy: async (): Promise<Feedback[]> => {
    const response = await api.get('/api/feedbacks/my');
    if (!response.ok) throw new Error('Lấy danh sách phản hồi thất bại');
    return response.json();
  },
  // Admin xem tất cả phản hồi (có filter)
  getAll: async (params?: { status?: string; category?: string; userId?: number }): Promise<Feedback[]> => {
    let url = '/api/admin/feedbacks';
    const query = [];
    if (params?.status) query.push(`status=${params.status}`);
    if (params?.category) query.push(`category=${params.category}`);
    if (params?.userId) query.push(`userId=${params.userId}`);
    if (query.length) url += '?' + query.join('&');
    const response = await api.get(url);
    if (!response.ok) throw new Error('Lấy danh sách phản hồi thất bại');
    return response.json();
  },
  // Admin xem chi tiết phản hồi
  getById: async (id: number): Promise<Feedback> => {
    const response = await api.get(`/api/admin/feedbacks/${id}`);
    if (!response.ok) throw new Error('Lấy chi tiết phản hồi thất bại');
    return response.json();
  },
  // Admin cập nhật trạng thái phản hồi
  updateStatus: async (id: number, status: FeedbackStatus): Promise<Feedback> => {
    const response = await api.put(`/api/admin/feedbacks/${id}/status?status=${status}`);
    if (!response.ok) throw new Error('Cập nhật trạng thái thất bại');
    return response.json();
  },
  // Admin trả lời phản hồi
  response: async (id: number, responseText: string): Promise<Feedback> => {
    const response = await api.put(`/api/admin/feedbacks/${id}/response?response=${encodeURIComponent(responseText)}`);
    if (!response.ok) throw new Error('Trả lời phản hồi thất bại');
    return response.json();
  },
};

// SUPPORT REQUESTS API
export const supportRequestsApi = {
  // Lấy tất cả yêu cầu hỗ trợ (admin)
  getAll: async (): Promise<ServiceRequest[]> => {
    const response = await api.get('/api/admin/support-requests');
    if (!response.ok) throw new Error('Lấy danh sách yêu cầu hỗ trợ thất bại');
    return response.json();
  },
  // Lấy yêu cầu hỗ trợ theo ID (admin)
  getById: async (id: number): Promise<ServiceRequest> => {
    const response = await api.get(`/api/admin/support-requests/${id}`);
    if (!response.ok) throw new Error('Lấy chi tiết yêu cầu hỗ trợ thất bại');
    return response.json();
  },
  // Cập nhật yêu cầu hỗ trợ (admin)
  update: async (id: number, data: any): Promise<ServiceRequest> => {
    const response = await api.put(`/api/admin/support-requests/${id}`, data);
    if (!response.ok) throw new Error('Cập nhật yêu cầu hỗ trợ thất bại');
    return response.json();
  },
  // Cập nhật trạng thái (admin)
  adminUpdateStatus: async (
    id: number,
    data: { status: string; resolutionNotes?: string; isCompleted?: boolean; rating?: number }
  ) => {
    const payload = {
      status: data.status,
      resolution: data.resolutionNotes || ''
    };
    const response = await api.put(`/api/admin/support-requests/${id}`, payload);
    if (!response.ok) throw new Error('Cập nhật trạng thái (admin) thất bại');
    return response.json();
  },
  // Xóa yêu cầu hỗ trợ (admin)
  delete: async (id: number): Promise<void> => {
    const response = await api.delete(`/api/admin/support-requests/${id}`);
    if (!response.ok) throw new Error('Xóa yêu cầu hỗ trợ thất bại');
  },
  // Gán yêu cầu hỗ trợ cho nhân viên (admin)
  assign: async (id: number, data: any): Promise<ServiceRequest> => {
    // Map FE code sang enum backend
    const categoryMap: Record<string, string> = {
      DIEN: "ELECTRICITY",
      NUOC: "PLUMBING",
      VE_SINH: "CLEANING",
      BAO_VE: "SECURITY",
      KHAC: "OTHER"
    };
    if (data.serviceCategory && categoryMap[data.serviceCategory]) {
      data.serviceCategory = categoryMap[data.serviceCategory];
    }
    const response = await api.post(`/api/admin/support-requests/${id}/assign`, data);
    if (!response.ok) throw new Error('Gán nhân viên thất bại');
    return response.json();
  },
  // Lọc theo trạng thái (admin)
  getByStatus: async (status: string): Promise<ServiceRequest[]> => {
    const response = await api.get(`/api/admin/support-requests/status/${status}`);
    if (!response.ok) throw new Error('Lọc yêu cầu hỗ trợ theo trạng thái thất bại');
    return response.json();
  },
    // cập nhạt trạng thái (admin)
  updateStatus: async (
    id: number,
    data: { status: string; resolutionNotes?: string; isCompleted?: boolean; rating?: number }
  ) => {
    // Bổ sung trường isCompleted theo yêu cầu BE
    const payload = {
      ...data,
      isCompleted: typeof data.isCompleted === 'boolean' ? data.isCompleted : data.status === 'COMPLETED'
    };
    const response = await api.put(`/api/staff/support-requests/${id}/status`, payload);
  if (!response.ok) throw new Error('Cập nhật trạng thái thất bại');
  return response.json();
},
  // Lọc theo loại dịch vụ (admin)
  getByCategory: async (category: string): Promise<ServiceRequest[]> => {
    const response = await api.get(`/api/admin/support-requests/category/${category}`);
    if (!response.ok) throw new Error('Lọc yêu cầu hỗ trợ theo loại dịch vụ thất bại');
    return response.json();
  },
  // Dành cho nhân viên: lấy theo vai trò (role)
  getForStaffByRole: async (role: string): Promise<ServiceRequest[]> => {
    const response = await api.get(`/api/staff/support-requests?role=${encodeURIComponent(role)}`);
    if (!response.ok) throw new Error('Lấy yêu cầu theo vai trò thất bại');
    return response.json();
  },
  // Dành cho nhân viên: lấy các yêu cầu được gán cho chính mình
  getAssignedTo: async (staffId: number): Promise<ServiceRequest[]> => {
    const response = await api.get(`/api/staff/support-requests/assigned?staffId=${staffId}`);
    if (!response.ok) throw new Error('Lấy yêu cầu được gán thất bại');
    return response.json();
  },
};

// VEHICLES API (Admin)
export interface Vehicle {
  id: number;
  licensePlate: string;
  vehicleType: string;
  vehicleTypeDisplayName?: string;
  brand?: string;
  model?: string;
  color?: string;
  imageUrls?: string[];
  status: string;
  statusDisplayName?: string;
  monthlyFee?: number;
  userFullName?: string;
  apartmentId?: number;
  apartmentUnitNumber?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const vehiclesApi = {
  getAll: async (): Promise<Vehicle[]> => {
    const response = await api.get('/api/admin/vehicles');
    if (!response.ok) throw new Error('Lấy danh sách xe thất bại');
    return response.json();
  },
  getPending: async (): Promise<Vehicle[]> => {
    try {
      const response = await api.get('/api/admin/vehicles/pending');
      if (!response.ok) {
        console.error('API Error:', response.status, response.statusText);
        // Thử fallback: lấy tất cả xe và filter theo status
        console.log('Trying fallback: get all vehicles and filter by status...');
        const allVehiclesResponse = await api.get('/api/admin/vehicles');
        if (allVehiclesResponse.ok) {
          const allVehicles = await allVehiclesResponse.json();
          // Filter xe có status PENDING
          const pendingVehicles = allVehicles.filter((v: any) => 
            v.status === 'PENDING' || 
            v.status === 'pending' || 
            v.status === 'WAITING_APPROVAL' ||
            v.status === 'waiting_approval'
          );
          console.log('Fallback successful, found pending vehicles:', pendingVehicles.length);
          return pendingVehicles;
        }
        throw new Error(`Lấy xe chờ duyệt thất bại (${response.status}: ${response.statusText})`);
      }
      return response.json();
    } catch (error) {
      console.error('Error in getPending:', error);
      // Trả về array rỗng thay vì throw error để UI không bị crash
      return [];
    }
  },
  getByStatus: async (status: string): Promise<Vehicle[]> => {
    const response = await api.get(`/api/admin/vehicles/status/${status}`);
    if (!response.ok) throw new Error('Lấy xe theo trạng thái thất bại');
    return response.json();
  },
  getById: async (id: number): Promise<Vehicle> => {
    const response = await api.get(`/api/admin/vehicles/${id}`);
    if (!response.ok) throw new Error('Lấy chi tiết xe thất bại');
    return response.json();
  },
  updateStatus: async (id: number, status: string, rejectionReason?: string): Promise<Vehicle> => {
    const body: any = { status };
    if (rejectionReason && rejectionReason.trim()) {
      body.rejectionReason = rejectionReason.trim();
    }
    const response = await api.put(`/api/admin/vehicles/${id}/status`, body);
    if (!response.ok) throw new Error('Cập nhật trạng thái xe thất bại');
    return response.json();
  },
  // Gửi email thông báo cho người dùng khi hủy/gỡ đăng ký xe
  notifyCancellation: async (id: number, reason?: string): Promise<void> => {
    const response = await api.post(`/api/admin/vehicles/${id}/notify-cancel`, reason ? { reason } : {});
    if (!response.ok) throw new Error('Gửi email thông báo hủy đăng ký xe thất bại');
  },
  delete: async (id: number): Promise<void> => {
    const response = await api.delete(`/api/admin/vehicles/${id}`);
    if (!response.ok) throw new Error('Xóa xe thất bại');
  },
};

export interface ServiceFeeConfig {
  id: number;
  month: number;
  year: number;
  parkingFee: number;
  serviceFeePerM2: number;
  waterFeePerM3: number;
  createdAt: string;
  updatedAt: string;
}

export async function fetchServiceFeeConfig(month: number, year: number): Promise<ServiceFeeConfig | null> {
  const res = await api.get(`/api/admin/service-fee-config/${month}/${year}`);
  if (res.status === 404) {
    return null; // Không có dữ liệu, KHÔNG redirect
  }
  if (res.ok) {
    return res.json();
  }
  // Có thể xử lý các lỗi khác nếu muốn
  return null;
}

// VEHICLE CAPACITY CONFIG API
export interface VehicleCapacityConfig {
  id?: number;
  buildingId: number;
  buildingName?: string;
  maxCars: number;
  maxMotorcycles: number;
  maxTrucks: number;
  maxVans: number;
  maxElectricVehicles: number;
  maxBicycles: number;
  isActive: boolean;
  currentCars?: number;
  currentMotorcycles?: number;
  currentTrucks?: number;
  currentVans?: number;
  currentElectricVehicles?: number;
  currentBicycles?: number;
  remainingCars?: number;
  remainingMotorcycles?: number;
  remainingTrucks?: number;
  remainingVans?: number;
  remainingElectricVehicles?: number;
  remainingBicycles?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface VehicleCapacityCheck {
  canAdd: boolean; // API trả về 'canAdd' thay vì 'canRegister'
  buildingId: number;
  vehicleType: string;
  currentCount: number;
  maxCapacity: number; // API trả về 'maxCapacity' thay vì 'maxCount'
  remainingSlots: number; // API trả về 'remainingSlots' thay vì 'remainingCount'
  message: string;
}

export const vehicleCapacityApi = {
  // Tạo cấu hình mới
  create: async (config: Omit<VehicleCapacityConfig, 'id'>): Promise<VehicleCapacityConfig> => {
    try {
      const response = await api.post('/api/vehicle-capacity-config', config);
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {}
        throw new Error(`Tạo cấu hình giới hạn xe thất bại: ${errorMessage}`);
      }
      return response.json();
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error(`Tạo cấu hình giới hạn xe thất bại: ${error}`);
    }
  },

  // Cập nhật cấu hình
  update: async (id: number, config: Partial<VehicleCapacityConfig>): Promise<VehicleCapacityConfig> => {
    try {
      const response = await api.put(`/api/vehicle-capacity-config/${id}`, config);
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {}
        throw new Error(`Cập nhật cấu hình giới hạn xe thất bại: ${errorMessage}`);
      }
      return response.json();
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error(`Cập nhật cấu hình giới hạn xe thất bại: ${error}`);
    }
  },

  // Lấy cấu hình theo building
  getByBuilding: async (buildingId: number): Promise<VehicleCapacityConfig | null> => {
    try {
      const response = await api.get(`/api/vehicle-capacity-config/building/${buildingId}`);
      if (response.status === 404) return null;
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {}
        throw new Error(`Lấy cấu hình giới hạn xe thất bại: ${errorMessage}`);
      }
      return response.json();
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error(`Lấy cấu hình giới hạn xe thất bại: ${error}`);
    }
  },

  // Lấy tất cả cấu hình với pagination
  getAll: async (page: number = 0, size: number = 20): Promise<VehicleCapacityConfig[]> => {
    try {
      const response = await api.get(`/api/vehicle-capacity-config?page=${page}&size=${size}`);
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {}
        throw new Error(`Lấy danh sách cấu hình giới hạn xe thất bại: ${errorMessage}`);
      }
      const data = await response.json();
      // Trả về content array từ pagination response
      return data.content || data;
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error(`Lấy danh sách cấu hình giới hạn xe thất bại: ${error}`);
    }
  },

  // Kiểm tra khả năng thêm xe
  checkCapacity: async (buildingId: number, vehicleType: string): Promise<VehicleCapacityCheck> => {
    try {
      const response = await api.get(`/api/vehicle-capacity-config/check-capacity?buildingId=${buildingId}&vehicleType=${encodeURIComponent(vehicleType)}`);
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {}
        throw new Error(`Kiểm tra khả năng thêm xe thất bại: ${errorMessage}`);
      }
      return response.json();
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error(`Kiểm tra khả năng thêm xe thất bại: ${error}`);
    }
  },

  // Xóa cấu hình
  delete: async (id: number): Promise<void> => {
    try {
      const response = await api.delete(`/api/vehicle-capacity-config/${id}`);
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {}
        throw new Error(`Xóa cấu hình giới hạn xe thất bại: ${errorMessage}`);
      }
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error(`Xóa cấu hình giới hạn xe thất bại: ${error}`);
    }
  },

  // Bật/tắt cấu hình - sử dụng PATCH endpoint mới
  toggleActive: async (id: number, isActive: boolean): Promise<VehicleCapacityConfig> => {
    try {
      const response = await api.patch(`/api/vehicle-capacity-config/${id}/toggle-status`);
      
      if (!response.ok) {
        // Lấy thông tin lỗi chi tiết
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          // Không thể parse JSON error
        }
        throw new Error(`Cập nhật trạng thái cấu hình thất bại: ${errorMessage}`);
      }
      
      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Cập nhật trạng thái cấu hình thất bại: ${error}`);
    }
  }
}; 