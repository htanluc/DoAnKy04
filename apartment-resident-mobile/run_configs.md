# Cấu hình chạy ứng dụng

## 1. Android Emulator (Genymotion/AVD)
```bash
flutter run --dart-define=API_BASE_URL=http://10.0.3.2:8080
```

## 2. iOS Simulator
```bash
flutter run --dart-define=API_BASE_URL=http://localhost:8080
```

## 3. Thiết bị thật (Android/iOS)
Thay `192.168.1.100` bằng IP thực tế của máy chạy backend:
```bash
flutter run --dart-define=API_BASE_URL=http://192.168.1.100:8080
```

## 4. Mặc định (không cần dart-define)
Nếu không chỉ định API_BASE_URL, app sẽ dùng:
- Android: `http://10.0.3.2:8080`
- iOS: `http://localhost:8080`

## Lưu ý
- Đảm bảo backend đang chạy trên port 8080
- Kiểm tra firewall không chặn kết nối
- Với thiết bị thật, cần đảm bảo máy backend và thiết bị cùng mạng WiFi
