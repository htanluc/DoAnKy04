# Service Requests Integration Guide

## Đã tích hợp vào Dashboard

Service Requests module đã được tích hợp vào dashboard chính của ứng dụng:

### 1. Navigation từ Dashboard
- Dashboard đã có navigation card "Yêu cầu dịch vụ" 
- Khi tap vào sẽ chuyển đến `/service-requests` route
- Route này đã được cập nhật để sử dụng `ServiceRequestsScreen` mới

### 2. Cấu hình Routes
File `main.dart` đã được cập nhật:
```dart
import 'features/service_requests/ui/requests_screen.dart';

// Routes
'/service-requests': (context) => const ServiceRequestsScreen(),
```

### 3. Dashboard Navigation Card
File `dashboard_page.dart` đã có sẵn:
```dart
_NavCard(
  title: 'Yêu cầu dịch vụ',
  route: '/service-requests',
  icon: Icons.build,
),
```

## Cách sử dụng

### 1. Từ Dashboard
1. Mở ứng dụng
2. Đăng nhập vào dashboard
3. Tap vào card "Yêu cầu dịch vụ"
4. Sẽ chuyển đến màn hình Service Requests với đầy đủ tính năng

### 2. Trực tiếp
```dart
Navigator.of(context).pushNamed('/service-requests');
```

### 3. Demo riêng module
```dart
import 'package:apartment_resident_mobile/features/service_requests/demo_service_requests.dart';

// Chạy demo
runApp(const DemoServiceRequestsScreen());
```

## Tính năng có sẵn

✅ **Tạo yêu cầu mới**
- Form đầy đủ với validation
- Upload hình ảnh (tối đa 5 ảnh)
- Chọn danh mục và mức độ ưu tiên

✅ **Danh sách yêu cầu**
- Hiển thị tất cả yêu cầu của user
- Lọc theo trạng thái và danh mục
- Tìm kiếm theo tiêu đề/mô tả
- Pull-to-refresh

✅ **Chi tiết yêu cầu**
- Thông tin đầy đủ
- Tiến trình 4 bước
- Thông tin nhân viên phụ trách
- Số điện thoại liên hệ
- Bình luận và ghi chú

✅ **Quản lý hình ảnh**
- Upload và preview
- Gallery view với zoom
- Xóa hình ảnh

## API Integration

Module sử dụng các API endpoints:
- `GET /api/support-requests/my` - Lấy danh sách
- `POST /api/support-requests` - Tạo mới
- `GET /api/support-requests/{id}` - Chi tiết
- `POST /api/upload/service-request` - Upload ảnh
- `GET /api/service-categories` - Danh mục

## State Management

Sử dụng Riverpod cho state management:
- `serviceRequestsProvider` - Danh sách requests
- `createRequestProvider` - Tạo request mới
- `serviceRequestProvider` - Chi tiết request
- `serviceCategoriesProvider` - Danh mục dịch vụ

## UI Components

- `ServiceRequestsScreen` - Màn hình chính
- `CreateRequestScreen` - Tạo request mới
- `RequestDetailScreen` - Chi tiết request
- `StatusProgressWidget` - Tiến trình 4 bước
- `ImageGalleryWidget` - Quản lý hình ảnh

## Lưu ý

1. **Authentication**: Cần token từ auth provider
2. **Error Handling**: Tất cả API calls đều có error handling
3. **Loading States**: Hiển thị loading và error states
4. **Validation**: Form validation đầy đủ
5. **Responsive**: UI responsive cho mobile

## Troubleshooting

### Lỗi import
- Kiểm tra đường dẫn import trong `main.dart`
- Chạy `flutter pub get`

### Lỗi build
- Chạy `flutter pub run build_runner build --delete-conflicting-outputs`
- Kiểm tra dependencies trong `pubspec.yaml`

### Lỗi API
- Kiểm tra base URL trong API clients
- Kiểm tra authentication token
- Kiểm tra network connectivity
