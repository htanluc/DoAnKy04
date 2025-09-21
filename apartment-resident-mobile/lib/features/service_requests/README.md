# Service Requests Module

Module quản lý yêu cầu dịch vụ cho ứng dụng apartment resident mobile.

## Cấu trúc thư mục

```
lib/features/service_requests/
├── data/
│   ├── requests_api.dart          # API client cho service requests
│   ├── upload_api.dart            # API client cho upload file
│   └── requests_repository.dart   # Repository layer
├── models/
│   ├── request.dart               # Models chính (ServiceRequest, Comment, etc.)
│   ├── request_status.dart        # Model cho trạng thái request
│   ├── request.freezed.dart       # Generated code
│   ├── request.g.dart             # Generated code
│   ├── request_status.freezed.dart # Generated code
│   └── request_status.g.dart      # Generated code
├── providers/
│   └── requests_providers.dart    # Riverpod providers
├── ui/
│   ├── requests_screen.dart       # Màn hình danh sách requests
│   ├── create_request_screen.dart # Màn hình tạo request mới
│   ├── request_detail_screen.dart # Màn hình chi tiết request
│   └── widgets/
│       ├── status_progress.dart   # Widget hiển thị tiến trình
│       └── image_gallery.dart     # Widget quản lý hình ảnh
└── README.md                      # File này
```

## Tính năng chính

### 1. Quản lý Service Requests
- **Tạo yêu cầu mới**: Người dùng có thể tạo yêu cầu dịch vụ với tiêu đề, mô tả, danh mục, mức độ ưu tiên
- **Upload hình ảnh**: Hỗ trợ upload tối đa 5 hình ảnh, validate kích thước và định dạng
- **Theo dõi trạng thái**: Hiển thị tiến trình 4 bước (Nhận yêu cầu → Đã giao → Đang xử lý → Hoàn thành)
- **Lọc và tìm kiếm**: Lọc theo trạng thái, danh mục, tìm kiếm theo tiêu đề/mô tả
- **Chi tiết request**: Xem thông tin chi tiết, bình luận, thông tin nhân viên phụ trách

### 2. Trạng thái Request
- **PENDING**: Chờ xử lý
- **ASSIGNED**: Đã giao cho nhân viên
- **IN_PROGRESS**: Đang xử lý
- **COMPLETED**: Hoàn thành
- **CANCELLED**: Đã hủy

### 3. Danh mục dịch vụ
- **MAINTENANCE**: Bảo trì
- **CLEANING**: Vệ sinh
- **SECURITY**: An ninh
- **UTILITY**: Tiện ích
- **OTHER**: Khác

### 4. Mức độ ưu tiên
- **LOW**: Thấp
- **MEDIUM**: Trung bình
- **HIGH**: Cao
- **URGENT**: Khẩn cấp

## Cách sử dụng

### 1. Thêm vào main app

```dart
import 'package:apartment_resident_mobile/features/service_requests/ui/requests_screen.dart';

// Trong main app
class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: ServiceRequestsScreen(), // Màn hình chính
    );
  }
}
```

### 2. Sử dụng providers

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:apartment_resident_mobile/features/service_requests/providers/requests_providers.dart';

class MyWidget extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final requestsAsync = ref.watch(serviceRequestsProvider);
    
    return requestsAsync.when(
      data: (requests) => ListView.builder(
        itemCount: requests.length,
        itemBuilder: (context, index) {
          final request = requests[index];
          return ListTile(
            title: Text(request.title),
            subtitle: Text(request.description),
          );
        },
      ),
      loading: () => CircularProgressIndicator(),
      error: (error, stack) => Text('Error: $error'),
    );
  }
}
```

### 3. Tạo request mới

```dart
// Sử dụng CreateRequestNotifier
final createNotifier = ref.read(createRequestProvider.notifier);

// Tạo request
await createNotifier.createRequest();

// Upload hình ảnh
await createNotifier.uploadImages();
```

## API Endpoints

Module sử dụng các API endpoints sau:

- `GET /api/support-requests/my` - Lấy danh sách requests của user
- `POST /api/support-requests` - Tạo request mới
- `GET /api/support-requests/{id}` - Lấy chi tiết request
- `PUT /api/support-requests/{id}/cancel` - Hủy request
- `POST /api/upload/service-request` - Upload hình ảnh
- `GET /api/service-categories` - Lấy danh mục dịch vụ

## Dependencies

Module sử dụng các dependencies sau:

```yaml
dependencies:
  flutter_riverpod: ^2.5.1
  freezed_annotation: ^2.4.4
  json_annotation: ^4.9.0
  image_picker: ^1.2.0
  cached_network_image: ^3.4.1
  photo_view: ^0.15.0
  pull_to_refresh: ^2.0.0
  url_launcher: ^6.3.2
  http: ^1.5.0

dev_dependencies:
  build_runner: ^2.5.4
  freezed: ^2.5.8
  json_serializable: ^6.9.5
```

## Code Generation

Sau khi thay đổi models, chạy lệnh sau để generate code:

```bash
flutter pub run build_runner build --delete-conflicting-outputs
```

## Lưu ý

1. **Authentication**: Module cần token authentication từ auth provider
2. **Image Upload**: Hỗ trợ upload tối đa 5 hình ảnh, mỗi file tối đa 5MB
3. **File Validation**: Chỉ hỗ trợ định dạng jpg, jpeg, png, gif, webp
4. **Error Handling**: Tất cả API calls đều có error handling
5. **State Management**: Sử dụng Riverpod cho state management
6. **UI Components**: Sử dụng Material Design components

## Troubleshooting

### Lỗi import không tìm thấy
- Kiểm tra đường dẫn import có đúng không
- Chạy `flutter pub get` để cập nhật dependencies

### Lỗi code generation
- Chạy `flutter pub run build_runner build --delete-conflicting-outputs`
- Kiểm tra syntax trong models có đúng không

### Lỗi upload hình ảnh
- Kiểm tra kích thước file (tối đa 5MB)
- Kiểm tra định dạng file (jpg, jpeg, png, gif, webp)
- Kiểm tra quyền truy cập file trên thiết bị