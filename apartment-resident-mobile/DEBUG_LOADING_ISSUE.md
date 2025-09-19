# Hướng dẫn Debug Vấn đề Loading

## Vấn đề đã được sửa

Ứng dụng Flutter bị kẹt ở màn hình loading (CircularProgressIndicator) và không thể vào màn hình chính.

## Nguyên nhân chính

1. **AuthGate không có timeout**: Khi kiểm tra token, nếu có lỗi xảy ra, ứng dụng sẽ bị kẹt vô hạn
2. **Dashboard API calls không có timeout**: Các API calls `/api/dashboard/stats` và `/api/activity-logs/my` có thể bị timeout hoặc lỗi
3. **Thiếu error handling**: Khi API lỗi, UI không hiển thị fallback

## Giải pháp đã áp dụng

### 1. Cải thiện AuthGate (`auth_gate.dart`)
- ✅ Thêm timeout 500ms để tránh bị kẹt
- ✅ Thêm error handling với UI thông báo lỗi
- ✅ Thêm nút "Thử lại" khi có lỗi
- ✅ Kiểm tra `mounted` trước khi gọi `setState`

### 2. Cải thiện Dashboard (`dashboard_page.dart`)
- ✅ Chuyển từ StatelessWidget sang StatefulWidget
- ✅ Thêm timeout cho API calls (10s cho stats, 8s cho activities)
- ✅ Hiển thị navigation cards ngay cả khi API lỗi
- ✅ Thêm nút refresh trong AppBar
- ✅ Thêm nút "Thử lại" trong error UI
- ✅ Cải thiện error messages

### 3. Cải thiện API calls
- ✅ Thêm timeout ngắn hơn cho từng API call
- ✅ Thêm logging để debug
- ✅ Fallback data khi API lỗi

## Cách kiểm tra

1. **Chạy ứng dụng**: Ứng dụng sẽ hiển thị màn hình chính ngay cả khi API lỗi
2. **Kiểm tra console logs**: Xem các log `[Dashboard] Stats API error:` và `[Dashboard] Activities API error:`
3. **Test retry**: Nhấn nút refresh hoặc "Thử lại" để test retry mechanism

## Debug thêm

Nếu vẫn gặp vấn đề, kiểm tra:

1. **Backend API có hoạt động không**:
   ```bash
   curl http://10.0.2.2:8080/api/dashboard/stats
   ```

2. **Token có hợp lệ không**:
   - Kiểm tra SharedPreferences
   - Xem log trong `TokenStorage.instance.getToken()`

3. **Network connectivity**:
   - Kiểm tra emulator có thể kết nối đến host machine
   - Kiểm tra firewall settings

## Cấu hình API

API base URL được cấu hình trong `app_config.dart`:
```dart
static String get apiBaseUrl => const String.fromEnvironment(
  'API_BASE_URL',
  defaultValue: 'http://10.0.2.2:8080',
);
```

Để thay đổi API URL, chạy:
```bash
flutter run --dart-define=API_BASE_URL=http://your-api-url:port
```
