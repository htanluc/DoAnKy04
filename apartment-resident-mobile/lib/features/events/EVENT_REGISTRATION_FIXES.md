# Sửa Lỗi Đăng Ký Sự Kiện và QR Code

## Vấn Đề Đã Sửa

### 1. "Sự kiện đã kết thúc nhưng vẫn có thể đăng ký"
- **Nguyên nhân**: Logic kiểm tra thời gian sự kiện chưa đầy đủ
- **Giải pháp**: Thêm kiểm tra `endTime` và `startTime` trong backend và frontend

### 2. "Các sự kiện đã đăng ký vẫn chưa cấp mã QR"
- **Nguyên nhân**: Chưa có logic tạo QR code khi đăng ký sự kiện
- **Giải pháp**: Thêm API endpoint và logic tạo QR code

## Thay Đổi Backend

### 1. Cập nhật Database Schema
- **File**: `apartment-portal-BE/src/main/resources/complete-schema.sql`
- **Thay đổi**: Thêm các cột QR code vào bảng `event_registrations`:
  ```sql
  qr_code VARCHAR(255),
  qr_expires_at TIMESTAMP,
  checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMP,
  ```

### 2. Cập nhật EventRegistration Model
- **File**: `apartment-portal-BE/src/main/java/com/mytech/apartment/portal/models/EventRegistration.java`
- **Thay đổi**: Thêm các trường QR code và check-in

### 3. Cập nhật EventRegistrationDto
- **File**: `apartment-portal-BE/src/main/java/com/mytech/apartment/portal/dtos/EventRegistrationDto.java`
- **Thay đổi**: Thêm thông tin QR code và check-in

### 4. Cập nhật EventRegistrationMapper
- **File**: `apartment-portal-BE/src/main/java/com/mytech/apartment/portal/mappers/EventRegistrationMapper.java`
- **Thay đổi**: Mapping các trường QR code mới

### 5. Cập nhật EventRegistrationService
- **File**: `apartment-portal-BE/src/main/java/com/mytech/apartment/portal/services/EventRegistrationService.java`
- **Thay đổi**: 
  - Thêm logic kiểm tra thời gian sự kiện trước khi cho phép đăng ký
  - Tự động tạo QR code khi đăng ký thành công

### 6. Cập nhật EventService
- **File**: `apartment-portal-BE/src/main/java/com/mytech/apartment/portal/services/EventService.java`
- **Thay đổi**: Bao gồm thông tin QR code và check-in khi trả về events

### 7. Cập nhật EventDto
- **File**: `apartment-portal-BE/src/main/java/com/mytech/apartment/portal/dtos/EventDto.java`
- **Thay đổi**: Thêm các trường QR code và check-in

### 8. Thêm API Endpoint QR Code
- **File**: `apartment-portal-BE/src/main/java/com/mytech/apartment/portal/apis/EventRegistrationController.java`
- **Thay đổi**: Thêm endpoint `POST /api/event-registrations/{eventId}/qr-code`

## Thay Đổi Flutter Frontend

### 1. Cập nhật Event Model
- **File**: `apartment-resident-mobile/lib/features/events/models/event.dart`
- **Thay đổi**: 
  - Cập nhật logic `canStillRegister` để kiểm tra `registered` status
  - Thêm getter `hasEnded` để kiểm tra sự kiện đã kết thúc

### 2. Cập nhật EventsProvider
- **File**: `apartment-resident-mobile/lib/features/events/providers/events_providers.dart`
- **Thay đổi**: 
  - Đơn giản hóa logic đăng ký sự kiện
  - Refresh data sau khi đăng ký thành công

### 3. Cập nhật EventsAPI
- **File**: `apartment-resident-mobile/lib/features/events/data/events_api.dart`
- **Thay đổi**: Cải thiện error handling cho API QR code

### 4. Cập nhật UI
- **File**: `apartment-resident-mobile/lib/features/events/ui/events_screen.dart`
- **Thay đổi**: 
  - Hiển thị đúng trạng thái sự kiện đã kết thúc
  - Hiển thị trạng thái đã đăng ký
  - Ẩn nút đăng ký cho sự kiện đã kết thúc

- **File**: `apartment-resident-mobile/lib/features/events/ui/event_detail_screen.dart`
- **Thay đổi**: Tương tự như events_screen.dart

## Logic Mới

### 1. Kiểm Tra Thời Gian Đăng Ký
```java
// Backend - EventRegistrationService.java
LocalDateTime now = LocalDateTime.now();
if (event.getEndTime() != null && now.isAfter(event.getEndTime())) {
    throw new RuntimeException("Sự kiện đã kết thúc, không thể đăng ký");
}
if (event.getStartTime() != null && now.isAfter(event.getStartTime())) {
    throw new RuntimeException("Sự kiện đã bắt đầu, không thể đăng ký");
}
```

### 2. Tạo QR Code Tự Động
```java
// Backend - EventRegistrationService.java
String qrCode = "EVENT_" + event.getId() + "_" + request.getUserId() + "_" + System.currentTimeMillis();
LocalDateTime qrExpiresAt = event.getEndTime() != null ? 
    event.getEndTime().plusHours(1) : 
    LocalDateTime.now().plusDays(1);
```

### 3. Logic Frontend
```dart
// Flutter - Event model
bool get canStillRegister {
  final now = DateTime.now();
  
  // Can't register if event has ended
  if (now.isAfter(endTime)) return false;
  
  // Can't register if event has started  
  if (now.isAfter(startTime)) return false;
  
  // Can't register if already registered
  if (registered) return false;
  
  // ... other checks
}
```

## API Endpoints Mới

### 1. Tạo QR Code
- **Endpoint**: `POST /api/event-registrations/{eventId}/qr-code`
- **Mô tả**: Tạo hoặc cập nhật QR code cho sự kiện đã đăng ký
- **Response**:
  ```json
  {
    "qrCode": "EVENT_1_123_1640995200000",
    "qrExpiresAt": "2024-01-01T23:59:59",
    "eventId": 1,
    "userId": 123
  }
  ```

## Kết Quả

### ✅ Đã Sửa
1. **Sự kiện đã kết thúc không thể đăng ký** - Backend và frontend đều kiểm tra thời gian
2. **Sự kiện sắp diễn ra có thể đăng ký và cấp mã QR** - Tự động tạo QR code khi đăng ký
3. **Hiển thị đúng trạng thái** - UI hiển thị rõ ràng trạng thái sự kiện và đăng ký

### 🔄 Quy Trình Mới
1. **Đăng ký sự kiện** → Backend kiểm tra thời gian → Tạo QR code → Trả về thông tin đầy đủ
2. **Hiển thị sự kiện** → Frontend hiển thị đúng trạng thái dựa trên thời gian và trạng thái đăng ký
3. **QR Code** → Tự động có sẵn khi đăng ký thành công, có thể tái tạo khi cần

## Testing

### Các Trường Hợp Test
1. ✅ Đăng ký sự kiện sắp diễn ra → Thành công + có QR code
2. ✅ Đăng ký sự kiện đã kết thúc → Báo lỗi "Sự kiện đã kết thúc"
3. ✅ Đăng ký sự kiện đã bắt đầu → Báo lỗi "Sự kiện đã bắt đầu"
4. ✅ Đăng ký sự kiện đã đăng ký → Báo lỗi "Đã đăng ký"
5. ✅ Hiển thị UI đúng trạng thái cho từng loại sự kiện
