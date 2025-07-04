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

export interface Event {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  createdAt: string;
}

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

export interface EventRegistration {
  id: number;
  eventId: number;
  residentId: number;
  registeredAt: string;
  status: RegistrationStatus;
}

export interface EventRegistrationRequest {
  eventId: number;
  residentId: number;
}

export interface Facility {
  id: number;
  name: string;
  description: string;
  capacity: number;
  otherDetails: string;
  usageFee?: string | null;
}

export interface FacilityCreateRequest {
  name: string;
  description: string;
  capacity: number;
  otherDetails: string;
  usageFee?: string | null;
}

export interface FacilityUpdateRequest {
  name?: string;
  description?: string;
  capacity?: number;
  otherDetails?: string;
  usageFee?: string | null;
}

export interface FacilityBooking {
  id: number;
  facilityId: number;
  facilityName: string;
  residentId: number;
  residentName: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  purpose: string;
  createdAt: string;
}

export interface FacilityBookingCreateRequest {
  facilityId: number;
  residentId: number;
  startTime: string;
  endTime: string;
  purpose: string;
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