# Quản lý Thông báo, Sự kiện và Tiện ích - Apartment Portal

## Tổng quan

Đây là phần triển khai đầy đủ các chức năng quản lý thông báo, sự kiện và tiện ích cho hệ thống quản lý chung cư, dựa trên API documentation đã cung cấp.

## Các tính năng đã triển khai

### 1. Quản lý Thông báo (Announcements)

#### Admin Dashboard
- **Danh sách thông báo** (`/admin-dashboard/announcements`)
  - Hiển thị tất cả thông báo với thông tin chi tiết
  - Tìm kiếm theo tiêu đề và nội dung
  - Lọc theo loại thông báo (Tin tức, Thường, Khẩn cấp)
  - Xem, chỉnh sửa, xóa thông báo

- **Tạo thông báo mới** (`/admin-dashboard/announcements/create`)
  - Form tạo thông báo với đầy đủ thông tin
  - Chọn loại thông báo và đối tượng nhận
  - Bật/tắt trạng thái hoạt động

#### Cấu trúc dữ liệu
```typescript
interface Announcement {
  id: number;
  title: string;
  content: string;
  type: 'NEWS' | 'REGULAR' | 'URGENT';
  targetAudience: 'ALL_RESIDENTS' | 'TOWER_A_RESIDENTS' | 'TOWER_B_RESIDENTS' | 'SPECIFIC_APARTMENTS';
  createdBy: number;
  isActive: boolean;
  createdAt: string;
}
```

### 2. Quản lý Sự kiện (Events)

#### Admin Dashboard
- **Danh sách sự kiện** (`/admin-dashboard/events`)
  - Hiển thị tất cả sự kiện với thông tin chi tiết
  - Tìm kiếm theo tên, mô tả, địa điểm
  - Lọc theo trạng thái (Sắp diễn ra, Đang diễn ra, Đã kết thúc)
  - Xem, chỉnh sửa, xóa sự kiện
  - Xem danh sách đăng ký tham gia

- **Tạo sự kiện mới** (`/admin-dashboard/events/create`)
  - Form tạo sự kiện với thông tin đầy đủ
  - Chọn thời gian bắt đầu và kết thúc
  - Validation thời gian hợp lệ

#### Resident Dashboard
- **Xem sự kiện** (`/resident-dashboard/events`)
  - Hiển thị danh sách sự kiện cho cư dân
  - Đăng ký tham gia sự kiện
  - Lọc theo trạng thái sự kiện

#### Cấu trúc dữ liệu
```typescript
interface Event {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  createdAt: string;
}
```

### 3. Quản lý Tiện ích (Facilities)

#### Admin Dashboard
- **Danh sách tiện ích** (`/admin-dashboard/facilities`)
  - Hiển thị tất cả tiện ích với thông tin chi tiết
  - Tìm kiếm theo tên và mô tả
  - Lọc theo sức chứa (Nhỏ, Trung bình, Lớn)
  - Xem, chỉnh sửa, xóa tiện ích

- **Tạo tiện ích mới** (`/admin-dashboard/facilities/create`)
  - Form tạo tiện ích với thông tin đầy đủ
  - Nhập sức chứa và chi tiết khác

#### Resident Dashboard
- **Đặt tiện ích** (`/resident-dashboard/facility-bookings`)
  - Xem danh sách tiện ích có sẵn
  - Đặt tiện ích với thời gian và mục đích sử dụng
  - Modal form đặt tiện ích

#### Cấu trúc dữ liệu
```typescript
interface Facility {
  id: number;
  name: string;
  description: string;
  capacity: number;
  otherDetails: string;
}
```

### 4. Quản lý Đặt Tiện ích (Facility Bookings)

#### Admin Dashboard
- **Danh sách đặt tiện ích** (`/admin-dashboard/facility-bookings`)
  - Hiển thị tất cả đặt tiện ích từ cư dân
  - Tìm kiếm theo cư dân, tiện ích, mục đích
  - Lọc theo trạng thái (Chờ xác nhận, Đã xác nhận, Từ chối, Đã hủy)
  - Xem chi tiết đặt tiện ích

#### Cấu trúc dữ liệu
```typescript
interface FacilityBooking {
  id: number;
  facilityId: number;
  facilityName: string;
  residentId: number;
  residentName: string;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  purpose: string;
  createdAt: string;
}
```

## API Integration

### Cấu hình API
- Base URL: `http://localhost:8080`
- Authentication: JWT Bearer Token
- Error handling: Tự động refresh token khi 401

### API Services
Tất cả API calls được tổ chức trong `lib/api.ts`:

```typescript
// Announcements API
export const announcementsApi = {
  getAll: () => Promise<Announcement[]>,
  getById: (id: number) => Promise<Announcement>,
  create: (data: AnnouncementCreateRequest) => Promise<Announcement>,
  update: (id: number, data: AnnouncementUpdateRequest) => Promise<void>,
  delete: (id: number) => Promise<void>,
};

// Events API
export const eventsApi = {
  getAll: () => Promise<Event[]>,
  getById: (id: number) => Promise<Event>,
  create: (data: EventCreateRequest) => Promise<Event>,
  update: (id: number, data: EventUpdateRequest) => Promise<void>,
  delete: (id: number) => Promise<void>,
  getRegistrations: (eventId: number) => Promise<EventRegistration[]>,
};

// Facilities API
export const facilitiesApi = {
  getAll: () => Promise<Facility[]>,
  getById: (id: number) => Promise<Facility>,
  create: (data: FacilityCreateRequest) => Promise<Facility>,
  update: (id: number, data: FacilityUpdateRequest) => Promise<void>,
  delete: (id: number) => Promise<void>,
};

// Facility Bookings API
export const facilityBookingsApi = {
  getAll: () => Promise<FacilityBooking[]>,
  getById: (id: number) => Promise<FacilityBooking>,
  create: (data: FacilityBookingCreateRequest) => Promise<FacilityBooking>,
  update: (id: number, data: FacilityBookingCreateRequest) => Promise<void>,
  cancel: (id: number) => Promise<void>,
};
```

## Custom Hooks

### useAnnouncements
```typescript
const { announcements, loading, error, createAnnouncement, updateAnnouncement, deleteAnnouncement } = useAnnouncements();
```

### useEvents
```typescript
const { events, loading, error, createEvent, updateEvent, deleteEvent } = useEvents();
```

### useFacilities
```typescript
const { facilities, loading, error, createFacility, updateFacility, deleteFacility } = useFacilities();
```

### useFacilityBookings
```typescript
const { bookings, loading, error, createBooking, updateBooking, cancelBooking } = useFacilityBookings();
```

## UI Components

### Admin Layout
- Sử dụng `AdminLayout` component cho tất cả trang admin
- Responsive design với sidebar navigation
- Consistent styling với Tailwind CSS

### Form Components
- Sử dụng shadcn/ui components
- Validation và error handling
- Loading states và success feedback

### Data Tables
- Responsive tables với sorting và filtering
- Action buttons (View, Edit, Delete)
- Status badges với màu sắc phân biệt

## Authentication & Authorization

### Role-based Access
- **Admin**: Truy cập đầy đủ tất cả chức năng quản lý
- **Resident**: Chỉ xem sự kiện và đặt tiện ích
- **Staff**: Có thể có quyền hạn chế (tùy theo cấu hình)

### AuthGuard Component
```typescript
<AuthGuard requiredRoles={["ADMIN"]}>
  {/* Admin only content */}
</AuthGuard>
```

## Error Handling

### Toast Notifications
- Success messages cho các thao tác thành công
- Error messages với chi tiết lỗi
- Loading states cho các thao tác async

### API Error Handling
- Tự động retry với refresh token
- Graceful degradation khi API không khả dụng
- User-friendly error messages

## Responsive Design

### Mobile-first Approach
- Tất cả components đều responsive
- Touch-friendly interfaces
- Optimized cho mobile devices

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Performance Optimizations

### State Management
- Local state với React hooks
- Optimistic updates cho better UX
- Efficient re-renders

### Data Fetching
- Lazy loading cho large datasets
- Caching với custom hooks
- Debounced search inputs

## Security Considerations

### Input Validation
- Client-side validation cho tất cả forms
- Server-side validation (API level)
- XSS protection với proper escaping

### Authentication
- JWT token management
- Automatic token refresh
- Secure logout

## Testing Strategy

### Unit Tests
- Custom hooks testing
- Component testing
- Utility functions testing

### Integration Tests
- API integration testing
- Form submission testing
- Error handling testing

## Deployment

### Environment Variables
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_APP_NAME=Apartment Portal
```

### Build Process
```bash
npm run build
npm start
```

## Future Enhancements

### Planned Features
1. **Real-time notifications** với WebSocket
2. **Calendar integration** cho events
3. **File upload** cho announcements
4. **Advanced filtering** và search
5. **Bulk operations** cho admin
6. **Email notifications** cho residents
7. **Mobile app** với React Native

### Performance Improvements
1. **Virtual scrolling** cho large lists
2. **Image optimization** cho facility photos
3. **Service worker** cho offline support
4. **CDN integration** cho static assets

## Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Kiểm tra API server có đang chạy không
   - Verify API base URL configuration
   - Check network connectivity

2. **Authentication Issues**
   - Clear localStorage và login lại
   - Check JWT token expiration
   - Verify user roles và permissions

3. **Form Validation Errors**
   - Check required fields
   - Verify data format (dates, numbers)
   - Ensure proper validation rules

### Debug Mode
```typescript
// Enable debug logging
localStorage.setItem('debug', 'true');
```

## Support

### Documentation
- API documentation: `/api/docs`
- Component library: Storybook
- Code examples: JSDoc comments

### Contact
- Technical issues: tech-support@apartment-portal.com
- Feature requests: product@apartment-portal.com
- Bug reports: bugs@apartment-portal.com 