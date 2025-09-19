# Vehicles Module

Module quản lý xe cho ứng dụng apartment resident mobile.

## Cấu trúc

```
lib/features/vehicles/
├── data/
│   ├── vehicles_api.dart          # Dio client với JWT interceptor
│   └── vehicles_repository.dart   # Repository pattern
├── models/
│   ├── vehicle.dart              # VehicleModel (freezed)
│   └── vehicle_type.dart         # VehicleTypeModel (freezed)
├── providers/
│   └── vehicles_providers.dart   # Riverpod providers
└── ui/
    ├── vehicles_screen.dart      # Màn hình chính với 3 tabs
    └── widgets/
        ├── vehicle_card.dart     # Card hiển thị xe
        ├── vehicle_form.dart     # Form đăng ký xe
        └── images_picker.dart    # Picker ảnh xe
```

## Tính năng

### 1. Đăng ký xe mới
- Form validation đầy đủ
- Upload 1-5 ảnh xe (max 5MB mỗi ảnh)
- Chọn loại xe và căn hộ từ dropdown

### 2. Xem xe của tôi
- Danh sách xe đã đăng ký
- Status badges (PENDING/APPROVED/REJECTED)
- Pull-to-refresh

### 3. Xe chờ duyệt toàn tòa
- Sắp xếp theo: Tòa nhà → Căn hộ → Thời gian đăng ký (cũ nhất trước)
- Hiển thị thứ tự ưu tiên
- Pull-to-refresh

## API Endpoints

- `GET /api/vehicles/types` - Lấy danh sách loại xe
- `GET /api/apartments/my` - Lấy căn hộ của user
- `GET /api/vehicles/my` - Xe của tôi
- `GET /api/vehicles` - Xe toàn tòa (pending)
- `POST /api/vehicles` - Tạo xe mới
- `POST /api/vehicles/upload-images` - Upload ảnh

## Sử dụng

### 1. Thêm vào navigation
```dart
// Trong main.dart hoặc router
MaterialPageRoute(
  builder: (context) => const VehiclesScreen(),
)
```

### 2. Sử dụng providers
```dart
// Trong widget
final vehicles = ref.watch(myVehiclesProvider);
final types = ref.watch(vehicleTypesProvider);
```

### 3. Tạo xe mới
```dart
final repo = ref.read(vehiclesRepositoryProvider);
await repo.createVehicle(
  licensePlate: '30A-12345',
  vehicleType: 'MOTORCYCLE',
  apartmentId: 1,
  brand: 'Honda',
  model: 'Wave Alpha',
  color: 'Đen',
  imageUrls: ['url1', 'url2'],
);
```

## Màu sắc FPT

- Primary: `#0066CC`
- Accent: `#FF6600`
- Secondary: `#009966`
- Success: `#10B981`
- Warning: `#F59E0B`
- Error: `#EF4444`

## Dependencies

- `dio` - HTTP client
- `flutter_secure_storage` - Lưu JWT token
- `flutter_riverpod` - State management
- `freezed` + `json_serializable` - Models
- `image_picker` - Chọn ảnh

## Testing

```bash
# Chạy tests
flutter test test/features/vehicles/

# Chạy build_runner
dart run build_runner build
```

## Lưu ý

- JWT token được tự động gắn vào header qua interceptor
- Ảnh được validate: chỉ image/*, max 5MB
- Form validation: biển số, loại xe, căn hộ là bắt buộc
- UI responsive cho tablet
- Accessibility labels đầy đủ
