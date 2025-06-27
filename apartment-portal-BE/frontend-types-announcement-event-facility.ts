// TypeScript Interfaces cho Apartment Portal Frontend - Announcement, Event, Facility

// ===== ANNOUNCEMENT TYPES =====

export type AnnouncementType = 'NEWS' | 'REGULAR' | 'URGENT';

export type TargetAudience = 'ALL_RESIDENTS' | 'TOWER_A_RESIDENTS' | 'TOWER_B_RESIDENTS' | 'SPECIFIC_APARTMENTS';

export interface Announcement {
  id: number;
  title: string;
  content: string;
  type: AnnouncementType;
  targetAudience: TargetAudience;
  createdBy: number;
  isActive: boolean;
  createdAt: string; // ISO 8601 format
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

// ===== EVENT TYPES =====

export interface Event {
  id: number;
  title: string;
  description: string;
  startTime: string; // ISO 8601 format
  endTime: string; // ISO 8601 format
  location: string;
  createdAt: string; // ISO 8601 format
}

export interface EventCreateRequest {
  title: string;
  description: string;
  startTime: string; // ISO 8601 format
  endTime: string; // ISO 8601 format
  location: string;
}

export interface EventUpdateRequest {
  title?: string;
  description?: string;
  startTime?: string; // ISO 8601 format
  endTime?: string; // ISO 8601 format
  location?: string;
}

// ===== EVENT REGISTRATION TYPES =====

export type RegistrationStatus = 'REGISTERED' | 'CANCELLED';

export interface EventRegistration {
  id: number;
  eventId: number;
  residentId: number;
  registeredAt: string; // ISO 8601 format
  status: RegistrationStatus;
}

export interface EventRegistrationRequest {
  eventId: number;
  residentId: number;
}

// ===== FACILITY TYPES =====

export interface Facility {
  id: number;
  name: string;
  description: string;
  capacity: number;
  otherDetails: string;
  usageFee?: number; // Phí sử dụng (VND)
}

export interface FacilityCreateRequest {
  name: string;
  description: string;
  capacity: number;
  otherDetails: string;
  usageFee?: number; // Phí sử dụng (VND)
}

export interface FacilityUpdateRequest {
  name?: string;
  description?: string;
  capacity?: number;
  otherDetails?: string;
  usageFee?: number; // Phí sử dụng (VND)
}

// ===== FACILITY BOOKING TYPES =====

export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface FacilityBooking {
  id: number;
  facilityId: number;
  facilityName: string;
  residentId: number;
  residentName: string;
  startTime: string; // ISO 8601 format
  endTime: string; // ISO 8601 format
  status: BookingStatus;
  purpose: string;
  createdAt: string; // ISO 8601 format
}

export interface FacilityBookingCreateRequest {
  facilityId: number;
  residentId: number;
  startTime: string; // ISO 8601 format
  endTime: string; // ISO 8601 format
  purpose: string;
}

// ===== API RESPONSE TYPES =====

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface ApiError {
  success: false;
  message: string;
  data: null;
}

export interface ValidationError {
  field: string;
  message: string;
}

// ===== API ENDPOINTS =====

export const API_ENDPOINTS = {
  // Announcements
  ANNOUNCEMENTS: '/api/admin/announcements',
  ANNOUNCEMENT_BY_ID: (id: number) => `/api/admin/announcements/${id}`,
  
  // Events
  EVENTS: '/api/admin/events',
  EVENT_BY_ID: (id: number) => `/api/admin/events/${id}`,
  
  // Event Registrations
  EVENT_REGISTRATIONS_REGISTER: '/api/event-registrations/register',
  EVENT_REGISTRATIONS_CANCEL: (id: number) => `/api/event-registrations/${id}/cancel`,
  EVENT_REGISTRATIONS_BY_EVENT: (eventId: number) => `/api/admin/events/${eventId}/registrations`,
  
  // Facilities
  FACILITIES: '/api/admin/facilities',
  FACILITY_BY_ID: (id: number) => `/api/admin/facilities/${id}`,
  
  // Facility Bookings
  FACILITY_BOOKINGS: '/api/facility-bookings',
  FACILITY_BOOKING_BY_ID: (id: number) => `/api/facility-bookings/${id}`,
  ADMIN_FACILITY_BOOKINGS: '/api/admin/facility-bookings',
  ADMIN_FACILITY_BOOKING_BY_ID: (id: number) => `/api/admin/facility-bookings/${id}`,
} as const;

// ===== REACT HOOKS TYPES =====

export interface UseAnnouncementsReturn {
  announcements: Announcement[];
  loading: boolean;
  error: string | null;
  fetchAnnouncements: () => Promise<void>;
  createAnnouncement: (data: AnnouncementCreateRequest) => Promise<void>;
  updateAnnouncement: (id: number, data: AnnouncementUpdateRequest) => Promise<void>;
  deleteAnnouncement: (id: number) => Promise<void>;
}

export interface UseEventsReturn {
  events: Event[];
  loading: boolean;
  error: string | null;
  fetchEvents: () => Promise<void>;
  createEvent: (data: EventCreateRequest) => Promise<void>;
  updateEvent: (id: number, data: EventUpdateRequest) => Promise<void>;
  deleteEvent: (id: number) => Promise<void>;
}

export interface UseEventRegistrationsReturn {
  registrations: EventRegistration[];
  loading: boolean;
  error: string | null;
  registerForEvent: (data: EventRegistrationRequest) => Promise<void>;
  cancelRegistration: (registrationId: number) => Promise<void>;
  getRegistrationsForEvent: (eventId: number) => Promise<void>;
}

export interface UseFacilitiesReturn {
  facilities: Facility[];
  loading: boolean;
  error: string | null;
  fetchFacilities: () => Promise<void>;
  createFacility: (data: FacilityCreateRequest) => Promise<void>;
  updateFacility: (id: number, data: FacilityUpdateRequest) => Promise<void>;
  deleteFacility: (id: number) => Promise<void>;
}

export interface UseFacilityBookingsReturn {
  bookings: FacilityBooking[];
  loading: boolean;
  error: string | null;
  fetchBookings: () => Promise<void>;
  createBooking: (data: FacilityBookingCreateRequest) => Promise<void>;
  updateBooking: (id: number, data: FacilityBookingCreateRequest) => Promise<void>;
  deleteBooking: (id: number) => Promise<void>;
}

// ===== COMPONENT PROPS TYPES =====

export interface AnnouncementFormProps {
  announcement?: Announcement;
  onSubmit: (data: AnnouncementCreateRequest | AnnouncementUpdateRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string;
}

export interface EventFormProps {
  event?: Event;
  onSubmit: (data: EventCreateRequest | EventUpdateRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string;
}

export interface FacilityFormProps {
  facility?: Facility;
  onSubmit: (data: FacilityCreateRequest | FacilityUpdateRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string;
}

export interface FacilityBookingFormProps {
  facilities: Facility[];
  onSubmit: (data: FacilityBookingCreateRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string;
}

export interface EventRegistrationFormProps {
  events: Event[];
  onSubmit: (data: EventRegistrationRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string;
}

// ===== UTILITY TYPES =====

export interface PaginationParams {
  page: number;
  size: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface FilterParams {
  search?: string;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

// ===== CONSTANTS =====

export const ANNOUNCEMENT_TYPES = {
  NEWS: 'NEWS',
  REGULAR: 'REGULAR',
  URGENT: 'URGENT'
} as const;

export const TARGET_AUDIENCES = {
  ALL_RESIDENTS: 'ALL_RESIDENTS',
  TOWER_A_RESIDENTS: 'TOWER_A_RESIDENTS',
  TOWER_B_RESIDENTS: 'TOWER_B_RESIDENTS',
  SPECIFIC_APARTMENTS: 'SPECIFIC_APARTMENTS'
} as const;

export const REGISTRATION_STATUSES = {
  REGISTERED: 'REGISTERED',
  CANCELLED: 'CANCELLED'
} as const;

export const BOOKING_STATUSES = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED'
} as const;

// ===== HELPER FUNCTIONS =====

export const formatDateTime = (dateTime: string): string => {
  return new Date(dateTime).toLocaleString('vi-VN');
};

export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('vi-VN');
};

export const formatTime = (time: string): string => {
  return new Date(time).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const isEventUpcoming = (event: Event): boolean => {
  return new Date(event.startTime) > new Date();
};

export const isEventOngoing = (event: Event): boolean => {
  const now = new Date();
  const startTime = new Date(event.startTime);
  const endTime = new Date(event.endTime);
  return now >= startTime && now <= endTime;
};

export const isEventPast = (event: Event): boolean => {
  return new Date(event.endTime) < new Date();
};

export const getEventStatus = (event: Event): 'upcoming' | 'ongoing' | 'past' => {
  if (isEventOngoing(event)) return 'ongoing';
  if (isEventUpcoming(event)) return 'upcoming';
  return 'past';
};

export const getBookingStatusColor = (status: BookingStatus): string => {
  switch (status) {
    case 'PENDING': return 'warning';
    case 'APPROVED': return 'success';
    case 'REJECTED': return 'danger';
    case 'CANCELLED': return 'secondary';
    default: return 'primary';
  }
};

export const getAnnouncementTypeColor = (type: AnnouncementType): string => {
  switch (type) {
    case 'URGENT': return 'danger';
    case 'NEWS': return 'info';
    case 'REGULAR': return 'primary';
    default: return 'secondary';
  }
};

// ===== API SERVICE TYPES =====

export interface AnnouncementService {
  getAllAnnouncements(): Promise<Announcement[]>;
  getAnnouncementById(id: number): Promise<Announcement>;
  createAnnouncement(data: AnnouncementCreateRequest): Promise<Announcement>;
  updateAnnouncement(id: number, data: AnnouncementUpdateRequest): Promise<Announcement>;
  deleteAnnouncement(id: number): Promise<void>;
}

export interface EventService {
  getAllEvents(): Promise<Event[]>;
  getEventById(id: number): Promise<Event>;
  createEvent(data: EventCreateRequest): Promise<Event>;
  updateEvent(id: number, data: EventUpdateRequest): Promise<Event>;
  deleteEvent(id: number): Promise<void>;
}

export interface EventRegistrationService {
  registerForEvent(data: EventRegistrationRequest): Promise<EventRegistration>;
  cancelRegistration(registrationId: number): Promise<void>;
  getRegistrationsForEvent(eventId: number): Promise<EventRegistration[]>;
}

export interface FacilityService {
  getAllFacilities(): Promise<Facility[]>;
  getFacilityById(id: number): Promise<Facility>;
  createFacility(data: FacilityCreateRequest): Promise<Facility>;
  updateFacility(id: number, data: FacilityUpdateRequest): Promise<Facility>;
  deleteFacility(id: number): Promise<void>;
}

export interface FacilityBookingService {
  getAllBookings(): Promise<FacilityBooking[]>;
  getBookingById(id: number): Promise<FacilityBooking>;
  createBooking(data: FacilityBookingCreateRequest): Promise<FacilityBooking>;
  updateBooking(id: number, data: FacilityBookingCreateRequest): Promise<FacilityBooking>;
  deleteBooking(id: number): Promise<void>;
} 