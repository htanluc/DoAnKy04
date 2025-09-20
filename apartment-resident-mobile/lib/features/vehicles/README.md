# Vehicles Module - Hướng dẫn sử dụng

## 🚗 Tổng quan
Module Vehicles cho phép cư dân đăng ký và quản lý phương tiện của mình trong tòa nhà.

## ✨ Tính năng chính

### 1. Đăng ký xe mới
- **Form đăng ký** với các trường:
  - Biển số xe (bắt buộc)
  - Loại phương tiện (bắt buộc) - hiển thị phí tháng
  - Căn hộ (bắt buộc) - lấy từ danh sách căn hộ của cư dân
  - Hãng xe, dòng xe, màu sắc (tùy chọn)
  - Hình ảnh (1-5 ảnh, < 5MB mỗi ảnh)

### 2. Xem xe của mình
- **Danh sách xe đã đăng ký** với thông tin:
  - Biển số, loại xe, trạng thái
  - Căn hộ, phí tháng, ngày đăng ký
  - Hình ảnh xe (có thể xem chi tiết)
- **Pull-to-refresh** để cập nhật dữ liệu

### 3. Xem xe chờ duyệt
- **Danh sách xe chờ duyệt** trong tòa nhà
- **Sắp xếp theo ưu tiên**:
  1. Tòa nhà (building)
  2. Căn hộ (apartment)
  3. Thời gian đăng ký (FIFO - First In, First Out)
- **Hiển thị số thứ tự ưu tiên**

### 4. Xem ảnh chi tiết
- **Toàn màn hình** với nền đen
- **Vuốt trái/phải** để chuyển ảnh
- **Pinch to zoom** (phóng to/thu nhỏ)
- **Hiển thị số thứ tự** ảnh (1/3, 2/3, ...)

## 🎨 UI/UX

### Màu sắc (FPT Brand)
- **Primary**: `#0066CC` (FPT Blue)
- **Accent**: `#FF6600` (FPT Orange)
- **Status colors**:
  - Chờ duyệt: `#F59E0B` (Amber)
  - Đã duyệt/Hoạt động: `#10B981` (Green)
  - Từ chối/Hết hạn: `#EF4444` (Red)
  - Không hoạt động: `#6B7280` (Gray)

### Layout
- **Tab-based navigation** với 3 tab
- **Card-based design** cho danh sách xe
- **Form validation** với thông báo lỗi rõ ràng
- **Loading states** và error handling
- **Pull-to-refresh** cho danh sách

## 🔧 Cấu hình kỹ thuật

### API Endpoints
- `GET /api/vehicles/types` - Lấy danh sách loại xe
- `GET /api/apartments/my` - Lấy căn hộ của cư dân
- `GET /api/vehicles/my` - Lấy xe của cư dân
- `GET /api/vehicles/apartment/{id}` - Lấy xe trong căn hộ
- `POST /api/vehicles` - Đăng ký xe mới
- `POST /api/vehicles/upload-images` - Upload ảnh

### Dependencies
- `flutter_riverpod` - State management
- `dio` - HTTP client với JWT interceptor
- `freezed` + `json_serializable` - Data models
- `image_picker` - Chọn ảnh từ gallery
- `flutter_secure_storage` - Lưu trữ token

### File structure
```
lib/features/vehicles/
├── data/
│   ├── vehicles_api.dart          # API client
│   └── vehicles_repository.dart   # Repository layer
├── models/
│   ├── vehicle.dart              # Vehicle model
│   └── vehicle_type.dart         # Vehicle type model
├── providers/
│   └── vehicles_providers.dart   # Riverpod providers
└── ui/
    ├── vehicles_screen.dart      # Main screen
    └── widgets/
        ├── vehicle_card.dart     # Vehicle card widget
        ├── vehicle_form.dart     # Registration form
        ├── images_picker.dart    # Image picker widget
        └── vehicle_image_viewer.dart # Image viewer
```

## 🚀 Cách sử dụng

### 1. Đăng ký xe mới
1. Vào tab "Đăng ký"
2. Điền thông tin bắt buộc (biển số, loại xe, căn hộ)
3. Chọn 1-5 ảnh xe
4. Bấm "Đăng ký xe"
5. Chờ xử lý và nhận thông báo thành công

### 2. Xem xe của mình
1. Vào tab "Xe của tôi"
2. Xem danh sách xe đã đăng ký
3. Vuốt xuống để refresh
4. Chạm vào ảnh để xem chi tiết

### 3. Xem xe chờ duyệt
1. Vào tab "Xe chờ duyệt"
2. Xem danh sách xe chờ duyệt theo thứ tự ưu tiên
3. Vuốt xuống để refresh

## 🐛 Troubleshooting

### Lỗi không tải được dữ liệu
- Kiểm tra kết nối mạng
- Đảm bảo backend đang chạy
- Kiểm tra token authentication
- Bấm "Thử lại" để refresh

### Lỗi upload ảnh
- Kiểm tra kích thước ảnh (< 5MB)
- Đảm bảo ảnh là định dạng hợp lệ
- Kiểm tra quyền truy cập storage

### Lỗi hiển thị ảnh
- Ảnh có thể bị lỗi hoặc không tồn tại
- Kiểm tra URL ảnh từ backend
- Thử refresh danh sách

## 📱 Testing

### Test cases
1. **Đăng ký xe thành công** với đầy đủ thông tin
2. **Validation form** với các trường bắt buộc
3. **Upload ảnh** với các kích thước khác nhau
4. **Xem ảnh chi tiết** với zoom và swipe
5. **Pull-to-refresh** trên các tab
6. **Error handling** khi mất kết nối

### Test data
- Sử dụng tài khoản cư dân có căn hộ liên kết
- Đảm bảo có dữ liệu loại xe trong backend
- Test với các trạng thái xe khác nhau

## 🔄 Cập nhật

### Version 1.0.0
- ✅ Đăng ký xe với ảnh
- ✅ Xem xe của mình
- ✅ Xem xe chờ duyệt
- ✅ Xem ảnh chi tiết
- ✅ Validation đầy đủ
- ✅ UI theo FPT brand

### Planned features
- [ ] Chỉnh sửa thông tin xe
- [ ] Xóa xe
- [ ] Lịch sử phí
- [ ] Thông báo trạng thái xe