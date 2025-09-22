# Cấu hình chạy app - Vehicles Module

## 🚀 Cách chạy app với cấu hình khác nhau

### 1. Android Emulator (mặc định)
```bash
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:8080
```

### 2. iOS Simulator
```bash
flutter run --dart-define=API_BASE_URL=http://localhost:8080
```

### 3. Thiết bị thật (Android/iOS)
```bash
# Thay YOUR_IP bằng IP LAN của máy chạy backend
flutter run --dart-define=API_BASE_URL=http://YOUR_IP:8080
```

### 4. Desktop (Windows/macOS/Linux)
```bash
flutter run --dart-define=API_BASE_URL=http://localhost:8080
```

## 🔧 Cấu hình auto-detect

App tự động phát hiện platform và sử dụng URL mặc định:
- **Android**: `http://10.0.3.2:8080`
- **iOS**: `http://localhost:8080`
- **Desktop**: `http://localhost:8080`

## 📱 Test Vehicles Module

### 1. Đăng ký xe mới
- Vào tab "Đăng ký"
- Điền biển số: `30A-12345`
- Chọn loại xe: "Xe ô tô 4 chỗ"
- Chọn căn hộ: "A01-01 - Tòa 1"
- Chọn 1-5 ảnh xe
- Bấm "Đăng ký xe"

### 2. Xem xe của mình
- Vào tab "Xe của tôi"
- Xem danh sách xe đã đăng ký
- Chạm vào ảnh để xem chi tiết
- Vuốt xuống để refresh

### 3. Xem xe chờ duyệt
- Vào tab "Xe chờ duyệt"
- Xem danh sách xe chờ duyệt
- Kiểm tra thứ tự ưu tiên
- Vuốt xuống để refresh

## 🐛 Debug

### Kiểm tra kết nối API
```bash
# Test từ terminal
curl -X GET http://10.0.2.2:8080/api/vehicles/types
```

### Xem logs
```bash
flutter logs
```

### Debug mode
```bash
flutter run --debug --dart-define=API_BASE_URL=http://10.0.2.2:8080
```

## 📋 Checklist test

- [ ] Đăng nhập thành công
- [ ] Vào Dashboard → bấm "Xe"
- [ ] Tab "Đăng ký" hiển thị form
- [ ] Tab "Xe của tôi" hiển thị danh sách (có thể rỗng)
- [ ] Tab "Xe chờ duyệt" hiển thị danh sách (có thể rỗng)
- [ ] Đăng ký xe mới thành công
- [ ] Xem ảnh xe chi tiết
- [ ] Pull-to-refresh hoạt động
- [ ] Error handling khi mất kết nối

## 🔄 Cập nhật

### Thay đổi API base URL
1. Sửa `lib/core/app_config.dart`
2. Hoặc dùng `--dart-define=API_BASE_URL=...`
3. Restart app

### Thay đổi UI/UX
1. Sửa `lib/features/vehicles/ui/`
2. Hot reload: `r` trong terminal
3. Hot restart: `R` trong terminal

### Thay đổi logic
1. Sửa `lib/features/vehicles/data/`
2. Restart app để áp dụng thay đổi