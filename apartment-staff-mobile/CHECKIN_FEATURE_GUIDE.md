# Hướng dẫn sử dụng chức năng Check-in cho Staff Mobile App

## Tổng quan
Chức năng check-in cho phép staff kiểm tra và xác nhận việc tham gia của cư dân vào các tiện ích và sự kiện trong tòa nhà.

## Các tính năng chính

### 1. Check-in qua QR Code
- Staff có thể quét QR code của cư dân để check-in nhanh
- Hỗ trợ cả facility booking và event registration
- Tự động nhận diện loại check-in từ QR code

### 2. Check-in thủ công
- Xem danh sách tất cả facility bookings và event registrations
- Lọc theo trạng thái (đã check-in, chưa check-in)
- Tìm kiếm theo tên cư dân hoặc tên tiện ích/sự kiện

### 3. Navigation tích hợp
- Main Dashboard với 3 tab: Requests, Check-in, Profile
- Dễ dàng chuyển đổi giữa các chức năng

## Cách sử dụng

### Bước 1: Truy cập Check-in
1. Mở ứng dụng Staff Mobile
2. Đăng nhập với tài khoản staff
3. Từ Main Dashboard, chọn tab "Check-in"

### Bước 2: Chọn phương thức check-in

#### Option A: QR Scanner
1. Chọn "Quét QR Code"
2. Cấp quyền camera nếu được yêu cầu
3. Quét QR code của cư dân
4. Xác nhận thông tin và thực hiện check-in

#### Option B: Danh sách thủ công
1. Chọn "Xem danh sách"
2. Chọn loại: "Tiện ích" hoặc "Sự kiện"
3. Xem danh sách và tìm booking/registration cần check-in
4. Tap vào item để xem chi tiết
5. Tap "Check-in" để xác nhận

### Bước 3: Xác nhận check-in
1. Kiểm tra thông tin cư dân và booking/registration
2. Tap "Xác nhận check-in"
3. Nhận thông báo thành công

## API Endpoints mới

### Backend Endpoints (StaffController)
- `GET /api/staff/facility-bookings/checkin` - Lấy danh sách facility bookings cho check-in
- `POST /api/staff/facility-bookings/{id}/checkin` - Check-in facility booking
- `GET /api/staff/event-registrations/checkin` - Lấy danh sách event registrations cho check-in
- `POST /api/staff/event-registrations/{id}/checkin` - Check-in event registration
- `POST /api/staff/qr/process` - Xử lý QR code và thực hiện check-in

### Frontend Services
- `ApiService.getFacilityBookingsForCheckIn()` - Lấy danh sách facility bookings
- `ApiService.checkInFacility(bookingId)` - Check-in facility
- `ApiService.getEventRegistrationsForCheckIn()` - Lấy danh sách event registrations
- `ApiService.checkInEvent(registrationId)` - Check-in event
- `ApiService.processQRCode(qrCode)` - Xử lý QR code

## Cấu trúc dữ liệu

### FacilityBooking Model
```dart
class FacilityBooking {
  final int id;
  final String facilityName;
  final String residentName;
  final String residentPhone;
  final DateTime startTime;
  final DateTime endTime;
  final String status;
  final int checkedInCount;
  final int maxCheckins;
  final int checkinWindowMinutes;
}
```

### EventRegistration Model
```dart
class EventRegistration {
  final int id;
  final String eventName;
  final String residentName;
  final String residentPhone;
  final DateTime eventStartTime;
  final DateTime eventEndTime;
  final bool checkedIn;
  final DateTime? checkedInAt;
  final String status;
}
```

## Lưu ý quan trọng

1. **Quyền truy cập**: Chỉ staff có quyền truy cập chức năng check-in
2. **QR Code**: QR code phải được tạo từ hệ thống và chứa thông tin hợp lệ
3. **Thời gian check-in**: Có thể có giới hạn thời gian cho việc check-in (checkinWindowMinutes)
4. **Số lần check-in**: Một booking có thể cho phép nhiều lần check-in (maxCheckins)
5. **Activity Logging**: Tất cả hoạt động check-in được ghi log tự động

## Troubleshooting

### Lỗi thường gặp
1. **Camera không hoạt động**: Kiểm tra quyền camera trong Settings
2. **QR code không nhận diện**: Đảm bảo QR code rõ nét và đủ ánh sáng
3. **Check-in thất bại**: Kiểm tra kết nối mạng và thông tin booking/registration
4. **Danh sách trống**: Kiểm tra xem có booking/registration nào trong hệ thống không

### Debug
- Kiểm tra logs trong console để xem chi tiết lỗi
- Sử dụng test endpoints để kiểm tra API
- Kiểm tra database để đảm bảo dữ liệu đúng

## Cập nhật tiếp theo
- Thêm thống kê check-in
- Hỗ trợ check-in offline
- Thêm notification cho cư dân khi check-in thành công
- Tối ưu UI/UX cho mobile
