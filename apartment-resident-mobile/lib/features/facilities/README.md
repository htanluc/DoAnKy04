# Facility Bookings Module

Module quản lý đặt tiện ích cho ứng dụng mobile cư dân chung cư.

## Cấu trúc thư mục

```
lib/features/facilities/
├── data/
│   ├── facilities_api.dart          # API calls cho facilities
│   ├── bookings_api.dart           # API calls cho bookings và availability
│   ├── facilities_repository.dart   # Repository cho facilities
│   └── bookings_repository.dart     # Repository cho bookings
├── models/
│   ├── facility.dart               # Model Facility với freezed
│   ├── availability.dart           # Model Availability và TimeSlot
│   └── booking.dart                # Model FacilityBooking và User
├── providers/
│   ├── facilities_providers.dart   # Riverpod providers cho facilities
│   └── bookings_providers.dart     # Riverpod providers cho bookings
└── ui/
    ├── facilities_screen.dart       # Danh sách tiện ích
    ├── facility_detail_screen.dart  # Chi tiết tiện ích và đặt chỗ
    └── widgets/
        ├── facility_card.dart       # Card hiển thị tiện ích
        ├── facility_search_bar.dart # Thanh tìm kiếm
        ├── facility_filter_sheet.dart # Bộ lọc
        ├── time_slot_grid.dart      # Grid chọn khung giờ
        ├── booking_form.dart        # Form đặt chỗ
        ├── booking_qr.dart          # Hiển thị QR code
        └── booking_card.dart        # Card hiển thị đặt chỗ
```

## Tính năng chính

### 1. Danh sách tiện ích (FacilitiesScreen)
- Hiển thị danh sách tất cả tiện ích
- Tìm kiếm theo tên, mô tả, vị trí
- Bộ lọc theo sức chứa
- Pull-to-refresh
- Navigation đến chi tiết tiện ích

### 2. Chi tiết tiện ích (FacilityDetailScreen)
- Thông tin chi tiết tiện ích
- Tab thông tin và đặt chỗ
- Calendar chọn ngày
- Grid chọn khung giờ
- Real-time availability

### 3. Đặt chỗ (BookingForm)
- Form đặt chỗ với validation
- Chọn số người (kiểm tra sức chứa)
- Nhập mục đích sử dụng
- Kiểm tra xung đột thời gian
- Tạo booking và hiển thị QR

### 4. QR Code (BookingQRDialog)
- Hiển thị QR code cho đặt chỗ
- Thông tin chi tiết đặt chỗ
- Chia sẻ và copy mã đặt chỗ

### 5. Quản lý đặt chỗ (FacilityBookingsPage)
- Danh sách đặt chỗ của user
- Xem chi tiết đặt chỗ
- Hủy đặt chỗ (nếu status = PENDING)
- Pull-to-refresh

## API Endpoints

### Facilities
- `GET /api/admin/facilities` - Lấy danh sách tiện ích
- `GET /api/admin/facilities/{id}` - Lấy chi tiết tiện ích

### Availability
- `GET /api/facilities/{id}/availability?date=YYYY-MM-DD` - Lấy khả dụng theo ngày
- `POST /api/facilities/{id}/check-conflict` - Kiểm tra xung đột thời gian

### Bookings
- `GET /api/facility-bookings/my` - Lấy đặt chỗ của user
- `POST /api/facility-bookings` - Tạo đặt chỗ mới
- `PUT /api/facility-bookings/{id}` - Cập nhật đặt chỗ
- `DELETE /api/facility-bookings/{id}` - Hủy đặt chỗ
- `GET /api/facility-bookings/{id}` - Lấy chi tiết đặt chỗ

## Models

### Facility
```dart
@freezed
class Facility with _$Facility {
  const factory Facility({
    required int id,
    required String name,
    required String description,
    required String location,
    required int capacity,
    required String otherDetails,
    required double usageFee,
    String? openingHours,
    @Default(true) bool isVisible,
  }) = _Facility;
}
```

### FacilityBooking
```dart
@freezed
class FacilityBooking with _$FacilityBooking {
  const factory FacilityBooking({
    required int id,
    required Facility facility,
    required User user,
    required String bookingTime,
    required int duration,
    required String status,
    required int numberOfPeople,
    required String purpose,
    User? approvedBy,
    String? approvedAt,
    String? createdAt,
    String? rejectionReason,
    String? qrCode,
  }) = _FacilityBooking;
}
```

### TimeSlot
```dart
@freezed
class TimeSlot with _$TimeSlot {
  const factory TimeSlot({
    required String startTime,
    required String endTime,
    required bool isAvailable,
    @Default(false) bool isBooked,
    String? bookingId,
  }) = _TimeSlot;
}
```

## State Management

Sử dụng Riverpod cho state management:

- `facilitiesProvider` - Danh sách tiện ích
- `visibleFacilitiesProvider` - Tiện ích hiển thị
- `myBookingsProvider` - Đặt chỗ của user
- `availabilityProvider` - Thông tin khả dụng
- `facilitiesSearchProvider` - Tìm kiếm tiện ích
- `bookingsNotifierProvider` - Quản lý đặt chỗ
- `bookingFormNotifierProvider` - Form đặt chỗ

## UI/UX Features

### Design System
- FPT Brand colors (Blue: #1976D2)
- Material Design 3
- Consistent spacing và typography
- Loading states và error handling
- Pull-to-refresh

### Accessibility
- Semantic labels
- Proper contrast ratios
- Touch targets ≥ 44dp
- Screen reader support

### Performance
- Lazy loading
- Image caching
- Efficient state updates
- Memory management

## Dependencies

```yaml
dependencies:
  flutter_riverpod: ^2.5.1
  freezed_annotation: ^2.4.4
  json_annotation: ^4.9.0
  qr_flutter: ^4.1.0
  share_plus: ^10.1.2

dev_dependencies:
  freezed: ^2.5.7
  json_serializable: ^6.9.0
  build_runner: ^2.4.12
```

## Testing

### Unit Tests
- API layer testing
- Repository testing
- Provider testing
- Model validation

### Widget Tests
- Screen rendering
- User interactions
- Form validation
- Error states

### Integration Tests
- End-to-end booking flow
- API integration
- Navigation flow

## Deployment Notes

1. **API Configuration**: Đảm bảo backend API đã được deploy và accessible
2. **Environment Variables**: Cấu hình API base URL
3. **Permissions**: Camera permission cho QR code scanning
4. **Build Configuration**: Release build với proper signing

## Future Enhancements

1. **Push Notifications**: Thông báo khi đặt chỗ được xác nhận/hủy
2. **Calendar Integration**: Sync với calendar app
3. **Offline Support**: Cache data và offline booking
4. **Multi-language**: Internationalization
5. **Analytics**: User behavior tracking
6. **Payment Integration**: Thanh toán phí sử dụng
7. **Rating System**: Đánh giá tiện ích sau khi sử dụng

## Troubleshooting

### Common Issues

1. **API Connection**: Kiểm tra network và API endpoint
2. **Authentication**: Đảm bảo JWT token hợp lệ
3. **Date/Time**: Kiểm tra timezone và date format
4. **QR Code**: Đảm bảo camera permission
5. **State Management**: Kiểm tra provider dependencies

### Debug Tips

1. Enable debug logging
2. Check network requests in DevTools
3. Verify model serialization
4. Test API endpoints manually
5. Check provider state in Riverpod DevTools
