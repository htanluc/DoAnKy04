# Events Routing Fix

## Vấn đề

Dashboard đang dẫn đến trang Events cũ (`EventsPage`) thay vì trang Events mới (`EventsScreen`) với các tính năng đã cập nhật.

## Nguyên nhân

Trong file `main.dart`, route `/events` đang được cấu hình để sử dụng `EventsPage` (file cũ) thay vì `EventsScreen` (file mới).

## Giải pháp

### 1. Cập nhật Import
```dart
// Trước
import 'features/events/events_page.dart';

// Sau  
import 'features/events/ui/events_screen.dart';
```

### 2. Cập nhật Route
```dart
// Trước
'/events': (context) => const EventsPage(),

// Sau
'/events': (context) => const EventsScreen(),
```

### 3. Xóa file cũ
- Đã xóa `apartment-resident-mobile/lib/features/events/events_page.dart`
- File này chứa implementation đơn giản cũ, không có các tính năng mới

## Kết quả

✅ **Dashboard navigation hoạt động đúng**
- Tap vào "Sự kiện" từ dashboard sẽ mở `EventsScreen` mới
- Hiển thị đầy đủ các tính năng đã cập nhật:
  - Nút "Xem chi tiết"
  - Nút "Xem QR" (cho user đã đăng ký)
  - Logic hiển thị nút đăng ký được cải thiện
  - Thông báo "Hết hạn đăng ký" cho sự kiện quá thời hạn

✅ **App chạy ổn định**
- Không có compilation errors
- Chỉ có linter warnings (không ảnh hưởng chức năng)

## Files đã thay đổi

1. **`apartment-resident-mobile/lib/main.dart`**
   - Cập nhật import từ `events_page.dart` → `events_screen.dart`
   - Cập nhật route từ `EventsPage` → `EventsScreen`

2. **`apartment-resident-mobile/lib/features/events/events_page.dart`**
   - Đã xóa file cũ để tránh nhầm lẫn

## Testing

### Các bước test:
1. ✅ Mở app và đăng nhập
2. ✅ Vào dashboard
3. ✅ Tap vào card "Sự kiện"
4. ✅ Kiểm tra hiển thị `EventsScreen` mới với đầy đủ tính năng
5. ✅ Kiểm tra nút "Xem chi tiết" và "Xem QR" hoạt động

### Kết quả mong đợi:
- Dashboard dẫn đến đúng trang Events mới
- Hiển thị đầy đủ các nút và tính năng đã cập nhật
- Logic hiển thị nút đăng ký hoạt động đúng theo trạng thái sự kiện

## Lưu ý

- File `events_page.dart` cũ đã được xóa hoàn toàn
- Tất cả references đã được cập nhật sang `events_screen.dart`
- App đã được test và chạy ổn định
