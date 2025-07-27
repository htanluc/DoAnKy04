// API configuration with authentication
import { getToken, refreshToken, removeTokens } from './auth'

const API_BASE_URL = 'http://localhost:8080'

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
  capacity: number;
  otherDetails: string;
  usageFee: number; // number thay vì string|null
  openingHours?: string;
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
  user: User;
  category: ServiceCategory;
  description: string;
  imageAttachment?: string;
  submittedAt: string;
  assignedTo?: User;
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
  capacity: number;
  otherDetails: string;
  usageFee: number;
  openingHours?: string;
}

export interface FacilityUpdateRequest {
  name?: string;
  description?: string;
  capacity?: number;
  otherDetails?: string;
  usageFee?: number;
  openingHours?: string;
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
  updateStatus: async (id: number, data: { status: string; resolutionNotes?: string }) => {
  const response = await api.put(`/api/staff/support-requests/${id}/status`, data);
  if (!response.ok) throw new Error('Cập nhật trạng thái thất bại');
  return response.json();
},
  // Lọc theo loại dịch vụ (admin)
  getByCategory: async (category: string): Promise<ServiceRequest[]> => {
    const response = await api.get(`/api/admin/support-requests/category/${category}`);
    if (!response.ok) throw new Error('Lọc yêu cầu hỗ trợ theo loại dịch vụ thất bại');
    return response.json();
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