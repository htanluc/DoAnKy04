# QR Code Check-in Feature

## Tổng quan

Tính năng QR Code Check-in cho phép người dùng đăng ký sự kiện và sử dụng mã QR để check-in khi tham gia sự kiện.

## Tính năng chính

### 1. **Đăng ký sự kiện với QR Code**
- Sau khi đăng ký thành công, hệ thống tự động tạo mã QR cho người dùng
- QR code có thời hạn 24 giờ
- QR code chỉ có hiệu lực trong thời gian sự kiện diễn ra

### 2. **Kiểm soát thời gian đăng ký**
- Không thể đăng ký sau khi sự kiện đã bắt đầu
- Thời hạn đăng ký mặc định: 1 giờ trước khi sự kiện bắt đầu
- Có thể tùy chỉnh thời hạn đăng ký cho từng sự kiện

### 3. **Check-in với QR Code**
- Quét QR code để check-in tự động
- Check-in thủ công (cho nhân viên)
- Hiển thị trạng thái check-in và thời gian

### 4. **Giao diện người dùng**
- Hiển thị QR code trong màn hình chi tiết sự kiện
- Nút check-in khi sự kiện đang diễn ra
- Trạng thái check-in với thời gian cụ thể
- Màn hình quét QR code chuyên dụng

## Cấu trúc code

### Models
- **Event Model**: Thêm các trường mới:
  - `qrCode`: Mã QR cho check-in
  - `qrCodeExpiresAt`: Thời gian hết hạn QR code
  - `checkedIn`: Trạng thái check-in
  - `checkedInAt`: Thời gian check-in
  - `registrationDeadline`: Thời hạn đăng ký
  - `canRegister`: Có thể đăng ký hay không

### Extensions
- **EventStatusExtension**: Thêm các methods:
  - `canStillRegister`: Kiểm tra có thể đăng ký
  - `isQrCodeValid`: Kiểm tra QR code còn hiệu lực
  - `timeUntilRegistrationDeadline`: Thời gian còn lại để đăng ký

### API Endpoints
- `POST /api/event-registrations/{eventId}/qr-code`: Tạo QR code
- `POST /api/event-registrations/check-in`: Check-in bằng QR code
- `POST /api/event-registrations/{eventId}/check-in`: Check-in thủ công
- `GET /api/event-registrations/{eventId}/check-in-status`: Lấy trạng thái check-in

### UI Components
- **EventsScreen**: Hiển thị trạng thái check-in và nút hành động
- **EventDetailScreen**: Hiển thị QR code và thông tin check-in
- **QrScannerScreen**: Màn hình quét QR code

## Quy trình hoạt động

### 1. Đăng ký sự kiện
```
User đăng ký → API tạo registration → Tự động tạo QR code → Lưu vào database
```

### 2. Check-in sự kiện
```
Quét QR code → Validate QR code → Cập nhật trạng thái check-in → Hiển thị kết quả
```

### 3. Validation
- Kiểm tra thời gian đăng ký
- Kiểm tra hiệu lực QR code
- Kiểm tra trạng thái sự kiện

## Lưu ý kỹ thuật

### Dependencies
- `mobile_scanner: ^5.0.2`: Để quét QR code
- `qr_flutter: ^4.1.0`: Để tạo QR code (đã có sẵn)

### Permissions
- Camera permission để quét QR code
- Cần cấu hình trong `android/app/src/main/AndroidManifest.xml`:
  ```xml
  <uses-permission android:name="android.permission.CAMERA" />
  ```

### Error Handling
- Xử lý lỗi khi quét QR code không hợp lệ
- Xử lý lỗi khi QR code đã hết hạn
- Xử lý lỗi khi sự kiện đã kết thúc

## Tương lai

### Tính năng có thể mở rộng
- Push notification khi sự kiện sắp bắt đầu
- Lịch sử check-in
- Thống kê tham gia sự kiện
- Export danh sách người tham gia
- Check-in offline với sync sau

### Cải tiến UI/UX
- Animation khi quét QR code thành công
- Haptic feedback
- Dark mode support
- Accessibility improvements
