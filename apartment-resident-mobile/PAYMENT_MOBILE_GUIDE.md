# Hướng dẫn xử lý thanh toán trên Mobile App

## Vấn đề đã được giải quyết

### ❌ Vấn đề cũ:
- Khi thanh toán VNPay trên mobile app, sau khi hoàn tất thanh toán, VNPay redirect về `localhost:3001` (web frontend)
- Mobile app không có web server chạy nên gặp lỗi `ERR_CONNECTION_REFUSED`

### ✅ Giải pháp:
- Sử dụng return URL trỏ về backend callback thay vì web frontend
- Backend sẽ xử lý callback và cập nhật trạng thái thanh toán
- Mobile app hiển thị thông báo chờ thanh toán

## Cấu hình Return URL

### 1. Invoices (Hóa đơn)
```dart
// Return URL: http://10.0.3.2:8080/api/payments/vnpay/return
final returnUrl = PaymentHelper.getReturnUrl('invoice');
```

### 2. Facility Bookings (Đặt tiện ích)
```dart
// Return URL: http://10.0.3.2:8080/api/facility-bookings/payment-callback
final returnUrl = PaymentHelper.getReturnUrl('facility_booking');
```

## Luồng thanh toán

1. **User chọn thanh toán** → Mobile app gọi API tạo payment
2. **Backend tạo payment URL** → Với return URL trỏ về backend callback
3. **Mobile app mở browser** → Chuyển hướng đến VNPay
4. **User thanh toán** → VNPay xử lý thanh toán
5. **VNPay redirect** → Về backend callback URL (không phải web frontend)
6. **Backend xử lý callback** → Cập nhật trạng thái thanh toán
7. **Mobile app hiển thị thông báo** → "Đang chuyển hướng đến cổng thanh toán..."

## Backend Callback Endpoints

### VNPay Return URL
- **Endpoint**: `/api/payments/vnpay/return`
- **Method**: GET
- **Purpose**: Xử lý kết quả thanh toán VNPay

### Facility Booking Callback
- **Endpoint**: `/api/facility-bookings/payment-callback`
- **Method**: GET
- **Purpose**: Xử lý kết quả thanh toán đặt tiện ích

## Cấu hình cho các môi trường khác nhau

### Android Emulator
```dart
// Sử dụng 10.0.3.2 để truy cập host machine
final returnUrl = 'http://10.0.3.2:8080/api/payments/vnpay/return';
```

### iOS Simulator
```dart
// Sử dụng localhost
final returnUrl = 'http://localhost:8080/api/payments/vnpay/return';
```

### Physical Device
```dart
// Sử dụng IP thực của máy host
final returnUrl = 'http://192.168.1.100:8080/api/payments/vnpay/return';
```

## Lưu ý quan trọng

1. **Backend phải chạy** để xử lý callback
2. **Return URL phải accessible** từ mobile device
3. **Backend callback endpoints** phải được cấu hình public (không cần auth)
4. **VNPay sandbox** chỉ hoạt động với localhost/127.0.0.1

## Testing

1. Đảm bảo backend đang chạy trên port 8080
2. Test thanh toán với VNPay sandbox
3. Kiểm tra callback được gọi đúng
4. Verify trạng thái thanh toán được cập nhật
