# API DOCUMENTATION - QUẢN LÝ THÔNG BÁO, SỰ KIỆN VÀ TIỆN ÍCH

## 1. QUẢN LÝ THÔNG BÁO (ANNOUNCEMENTS)

### Base URL: `/api/admin/announcements`

#### 1.1 Lấy danh sách tất cả thông báo
```http
GET /api/admin/announcements
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "Thông báo bảo trì thang máy",
    "content": "Thang máy tòa A sẽ được bảo trì từ 8h-12h ngày mai",
    "type": "URGENT",
    "targetAudience": "ALL_RESIDENTS",
    "createdBy": 1,
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00"
  }
]
```

#### 1.2 Lấy thông báo theo ID
```http
GET /api/admin/announcements/{id}
```

**Response:**
```json
{
  "id": 1,
  "title": "Thông báo bảo trì thang máy",
  "content": "Thang máy tòa A sẽ được bảo trì từ 8h-12h ngày mai",
  "type": "URGENT",
  "targetAudience": "ALL_RESIDENTS",
  "createdBy": 1,
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00"
}
```

#### 1.3 Tạo mới thông báo
```http
POST /api/admin/announcements
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Thông báo bảo trì thang máy",
  "content": "Thang máy tòa A sẽ được bảo trì từ 8h-12h ngày mai",
  "type": "URGENT",
  "targetAudience": "ALL_RESIDENTS",
  "isActive": true
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Thông báo bảo trì thang máy",
  "content": "Thang máy tòa A sẽ được bảo trì từ 8h-12h ngày mai",
  "type": "URGENT",
  "targetAudience": "ALL_RESIDENTS",
  "createdBy": 1,
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00"
}
```

#### 1.4 Cập nhật thông báo
```http
PUT /api/admin/announcements/{id}
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Thông báo bảo trì thang máy (Cập nhật)",
  "content": "Thang máy tòa A sẽ được bảo trì từ 9h-13h ngày mai",
  "type": "REGULAR",
  "targetAudience": "TOWER_A_RESIDENTS",
  "isActive": true
}
```

#### 1.5 Xóa thông báo
```http
DELETE /api/admin/announcements/{id}
```

**Response:** `204 No Content`

---

## 2. QUẢN LÝ SỰ KIỆN (EVENTS)

### Base URL: `/api/admin/events`

#### 2.1 Lấy danh sách tất cả sự kiện
```http
GET /api/admin/events
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "Tiệc tân gia",
    "description": "Tiệc chào mừng cư dân mới",
    "startTime": "2024-01-20T18:00:00",
    "endTime": "2024-01-20T22:00:00",
    "location": "Sảnh chính tòa A",
    "createdAt": "2024-01-15T10:30:00"
  }
]
```

#### 2.2 Lấy sự kiện theo ID
```http
GET /api/admin/events/{id}
```

**Response:**
```json
{
  "id": 1,
  "title": "Tiệc tân gia",
  "description": "Tiệc chào mừng cư dân mới",
  "startTime": "2024-01-20T18:00:00",
  "endTime": "2024-01-20T22:00:00",
  "location": "Sảnh chính tòa A",
  "createdAt": "2024-01-15T10:30:00"
}
```

#### 2.3 Tạo mới sự kiện
```http
POST /api/admin/events
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Tiệc tân gia",
  "description": "Tiệc chào mừng cư dân mới",
  "startTime": "2024-01-20T18:00:00",
  "endTime": "2024-01-20T22:00:00",
  "location": "Sảnh chính tòa A"
}
```

#### 2.4 Cập nhật sự kiện
```http
PUT /api/admin/events/{id}
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Tiệc tân gia (Cập nhật)",
  "description": "Tiệc chào mừng cư dân mới với chương trình đặc biệt",
  "startTime": "2024-01-20T19:00:00",
  "endTime": "2024-01-20T23:00:00",
  "location": "Sảnh chính tòa A và B"
}
```

#### 2.5 Xóa sự kiện
```http
DELETE /api/admin/events/{id}
```

**Response:** `204 No Content`

---

## 3. QUẢN LÝ ĐĂNG KÝ SỰ KIỆN (EVENT REGISTRATIONS)

### Base URL: `/api`

#### 3.1 Đăng ký tham gia sự kiện (Cư dân)
```http
POST /api/event-registrations/register
Content-Type: application/json
```

**Request Body:**
```json
{
  "eventId": 1,
  "residentId": 123
}
```

**Response:**
```json
{
  "id": 1,
  "eventId": 1,
  "residentId": 123,
  "registeredAt": "2024-01-15T11:00:00",
  "status": "REGISTERED"
}
```

#### 3.2 Hủy đăng ký sự kiện (Cư dân)
```http
DELETE /api/event-registrations/{registrationId}/cancel
```

**Response:** `204 No Content`

#### 3.3 Lấy danh sách đăng ký cho sự kiện (Admin)
```http
GET /api/admin/events/{eventId}/registrations
```

**Response:**
```json
[
  {
    "id": 1,
    "eventId": 1,
    "residentId": 123,
    "registeredAt": "2024-01-15T11:00:00",
    "status": "REGISTERED"
  }
]
```

---

## 4. QUẢN LÝ TIỆN ÍCH (FACILITIES)

### Base URL: `/api/admin/facilities`

#### 4.1 Lấy danh sách tất cả tiện ích
```http
GET /api/admin/facilities
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Hồ Bơi",
    "description": "Hồ bơi có độ sâu 1m2 đến 1m8",
    "capacity": 200,
    "otherDetails": "mở cửa từ 8h-11h",
    "usageFee": 60000
  },
  {
    "id": 2,
    "name": "BBQ Sảnh A",
    "description": "BBQ nấu nướng cho gia đình",
    "capacity": 10,
    "otherDetails": "7 giờ sáng đến 11h đêm",
    "usageFee": 20000
  }
]
```

#### 4.2 Lấy tiện ích theo ID
```http
GET /api/admin/facilities/{id}
```

**Response:**
```json
{
  "id": 1,
  "name": "Hồ Bơi",
  "description": "Hồ bơi có độ sâu 1m2 đến 1m8",
  "capacity": 200,
  "otherDetails": "mở cửa từ 8h-11h",
  "usageFee": 60000
}
```

#### 4.3 Tạo mới tiện ích
```http
POST /api/admin/facilities
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "BBQ Sảnh A",
  "description": "BBQ nấu nướng cho gia đình",
  "capacity": 10,
  "otherDetails": "7 giờ sáng đến 11h đêm",
  "usageFee": 20000
}
```

**Response:**
```json
{
  "id": 2,
  "name": "BBQ Sảnh A",
  "description": "BBQ nấu nướng cho gia đình",
  "capacity": 10,
  "otherDetails": "7 giờ sáng đến 11h đêm",
  "usageFee": 20000
}
```

#### 4.4 Cập nhật tiện ích
```http
PUT /api/admin/facilities/{id}
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Hồ Bơi",
  "description": "Hồ bơi có độ sâu 1m2 đến 1m8",
  "capacity": 200,
  "otherDetails": "mở cửa từ 8h-11h",
  "usageFee": 60000
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Hồ Bơi",
  "description": "Hồ bơi có độ sâu 1m2 đến 1m8",
  "capacity": 200,
  "otherDetails": "mở cửa từ 8h-11h",
  "usageFee": 60000
}
```

#### 4.5 Xóa tiện ích
```http
DELETE /api/admin/facilities/{id}
```

**Response:** `204 No Content`

---

## 5. QUẢN LÝ ĐẶT TIỆN ÍCH (FACILITY BOOKINGS)

### Base URL: `/api`

#### 5.1 Lấy danh sách tất cả đặt tiện ích (Admin)
```http
GET /api/admin/facility-bookings
```

**Response:**
```json
[
  {
    "id": 1,
    "facilityId": 1,
    "facilityName": "Hồ bơi",
    "residentId": 123,
    "residentName": "Nguyễn Văn A",
    "startTime": "2024-01-20T14:00:00",
    "endTime": "2024-01-20T16:00:00",
    "status": "PENDING",
    "purpose": "Tập bơi",
    "createdAt": "2024-01-15T10:30:00"
  }
]
```

#### 5.2 Đặt tiện ích (Cư dân)
```http
POST /api/facility-bookings
Content-Type: application/json
```

**Request Body:**
```json
{
  "facilityId": 1,
  "residentId": 123,
  "startTime": "2024-01-20T14:00:00",
  "endTime": "2024-01-20T16:00:00",
  "purpose": "Tập bơi"
}
```

**Response:**
```json
{
  "id": 1,
  "facilityId": 1,
  "facilityName": "Hồ bơi",
  "residentId": 123,
  "residentName": "Nguyễn Văn A",
  "startTime": "2024-01-20T14:00:00",
  "endTime": "2024-01-20T16:00:00",
  "status": "PENDING",
  "purpose": "Tập bơi",
  "createdAt": "2024-01-15T10:30:00"
}
```

#### 5.3 Lấy thông tin đặt tiện ích theo ID (Admin)
```http
GET /api/admin/facility-bookings/{id}
```

#### 5.4 Cập nhật đặt tiện ích (Cư dân)
```http
PUT /api/facility-bookings/{id}
Content-Type: application/json
```

**Request Body:**
```json
{
  "facilityId": 1,
  "residentId": 123,
  "startTime": "2024-01-20T15:00:00",
  "endTime": "2024-01-20T17:00:00",
  "purpose": "Tập bơi và thư giãn"
}
```

#### 5.5 Hủy đặt tiện ích (Cư dân)
```http
DELETE /api/facility-bookings/{id}
```

**Response:** `204 No Content`

---

## 6. CÁC LOẠI DỮ LIỆU (DATA TYPES)

### 6.1 Announcement Types
```typescript
type AnnouncementType = 'NEWS' | 'REGULAR' | 'URGENT';

type TargetAudience = 'ALL_RESIDENTS' | 'TOWER_A_RESIDENTS' | 'TOWER_B_RESIDENTS' | 'SPECIFIC_APARTMENTS';

interface Announcement {
  id: number;
  title: string;
  content: string;
  type: AnnouncementType;
  targetAudience: TargetAudience;
  createdBy: number;
  isActive: boolean;
  createdAt: string; // ISO 8601 format
}

interface AnnouncementCreateRequest {
  title: string;
  content: string;
  type: AnnouncementType;
  targetAudience: TargetAudience;
  isActive: boolean;
}

interface AnnouncementUpdateRequest {
  title?: string;
  content?: string;
  type?: AnnouncementType;
  targetAudience?: TargetAudience;
  isActive?: boolean;
}
```

### 6.2 Event Types
```typescript
interface Event {
  id: number;
  title: string;
  description: string;
  startTime: string; // ISO 8601 format
  endTime: string; // ISO 8601 format
  location: string;
  createdAt: string; // ISO 8601 format
}

interface EventCreateRequest {
  title: string;
  description: string;
  startTime: string; // ISO 8601 format
  endTime: string; // ISO 8601 format
  location: string;
}

interface EventUpdateRequest {
  title?: string;
  description?: string;
  startTime?: string; // ISO 8601 format
  endTime?: string; // ISO 8601 format
  location?: string;
}
```

### 6.3 Event Registration Types
```typescript
type RegistrationStatus = 'REGISTERED' | 'CANCELLED';

interface EventRegistration {
  id: number;
  eventId: number;
  residentId: number;
  registeredAt: string; // ISO 8601 format
  status: RegistrationStatus;
}

interface EventRegistrationRequest {
  eventId: number;
  residentId: number;
}
```

### 6.4 Facility Types
```typescript
interface Facility {
  id: number;
  name: string;
  description: string;
  capacity: number;
  otherDetails: string;
}

interface FacilityCreateRequest {
  name: string;
  description: string;
  capacity: number;
  otherDetails: string;
}

interface FacilityUpdateRequest {
  name?: string;
  description?: string;
  capacity?: number;
  otherDetails?: string;
}
```

### 6.5 Facility Booking Types
```typescript
type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

interface FacilityBooking {
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

interface FacilityBookingCreateRequest {
  facilityId: number;
  residentId: number;
  startTime: string; // ISO 8601 format
  endTime: string; // ISO 8601 format
  purpose: string;
}
```

---

## 7. MÃ LỖI VÀ XỬ LÝ (ERROR CODES & HANDLING)

### 7.1 HTTP Status Codes
- `200 OK`: Thành công
- `201 Created`: Tạo mới thành công
- `204 No Content`: Xóa thành công
- `400 Bad Request`: Dữ liệu đầu vào không hợp lệ
- `401 Unauthorized`: Chưa đăng nhập
- `403 Forbidden`: Không có quyền truy cập
- `404 Not Found`: Không tìm thấy tài nguyên
- `500 Internal Server Error`: Lỗi server

### 7.2 Error Response Format
```json
{
  "success": false,
  "message": "Mô tả lỗi",
  "data": null
}
```

### 7.3 Validation Errors
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "errors": [
      {
        "field": "title",
        "message": "Title is required"
      }
    ]
  }
}
```

---

## 8. AUTHENTICATION & AUTHORIZATION

### 8.1 Headers Required
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### 8.2 Role Requirements
- **Admin APIs**: Chỉ admin mới có quyền truy cập
- **Resident APIs**: Cư dân có thể truy cập các API liên quan đến đăng ký sự kiện và đặt tiện ích
- **Public APIs**: Một số API có thể công khai (tùy theo cấu hình)

---

## 9. RATE LIMITING & THROTTLING

- **Default**: 100 requests per minute per IP
- **Admin APIs**: 200 requests per minute per user
- **Booking APIs**: 10 requests per minute per user (để tránh spam)

---

## 10. EXAMPLES SỬ DỤNG VỚI FRONTEND

### 10.1 React Hook cho Announcements
```typescript
import { useState, useEffect } from 'react';

interface UseAnnouncementsReturn {
  announcements: Announcement[];
  loading: boolean;
  error: string | null;
  createAnnouncement: (data: AnnouncementCreateRequest) => Promise<void>;
  updateAnnouncement: (id: number, data: AnnouncementUpdateRequest) => Promise<void>;
  deleteAnnouncement: (id: number) => Promise<void>;
}

export const useAnnouncements = (): UseAnnouncementsReturn => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/announcements', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setAnnouncements(data);
    } catch (err) {
      setError('Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  const createAnnouncement = async (data: AnnouncementCreateRequest) => {
    try {
      const response = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        await fetchAnnouncements();
      }
    } catch (err) {
      setError('Failed to create announcement');
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return {
    announcements,
    loading,
    error,
    createAnnouncement,
    updateAnnouncement: async (id, data) => {
      // Implementation
    },
    deleteAnnouncement: async (id) => {
      // Implementation
    }
  };
};
```

### 10.2 React Hook cho Events
```typescript
export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/events', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setEvents(data);
    } catch (err) {
      setError('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  // ... other methods

  return { events, loading, error, fetchEvents };
};
```

### 10.3 React Hook cho Facility Bookings
```typescript
export const useFacilityBookings = () => {
  const [bookings, setBookings] = useState<FacilityBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createBooking = async (data: FacilityBookingCreateRequest) => {
    setLoading(true);
    try {
      const response = await fetch('/api/facility-bookings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      if (response.ok) {
        const newBooking = await response.json();
        setBookings(prev => [...prev, newBooking]);
      }
    } catch (err) {
      setError('Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  return { bookings, loading, error, createBooking };
};
```

---

## 11. NOTES VÀ BEST PRACTICES

### 11.1 Security
- Luôn sử dụng HTTPS trong production
- Validate tất cả input từ client
- Implement proper CORS policy
- Sử dụng JWT tokens với expiration time hợp lý

### 11.2 Performance
- Implement pagination cho các API trả về danh sách dài
- Sử dụng caching cho dữ liệu ít thay đổi
- Optimize database queries

### 11.3 Error Handling
- Luôn trả về error messages có ý nghĩa
- Log errors để debug
- Implement retry mechanism cho các operation quan trọng

### 11.4 Testing
- Unit tests cho business logic
- Integration tests cho APIs
- E2E tests cho critical user flows
