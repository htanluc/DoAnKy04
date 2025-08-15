# Apartment Staff Mobile (Flutter)

Ứng dụng Flutter dành cho nhân viên xử lý yêu cầu cư dân:
- Đăng nhập bằng số điện thoại + mật khẩu
- Xem danh sách yêu cầu đã được gán cho mình
- Xem chi tiết yêu cầu, thông tin liên hệ cư dân (tên, số điện thoại)
- Chat theo từng yêu cầu (WebSocket STOMP). Khi đánh dấu hoàn thành, chat sẽ được khóa (không gửi thêm)

## Chuẩn bị
- Cài Flutter SDK (3.19+)
- Android Studio/Xcode (tuỳ HĐH)

## Khởi tạo và chạy
```bash
cd apartment-staff-mobile
flutter pub get
# Nếu backend chạy trên máy bạn: Android emulator dùng 10.0.2.2
flutter run --dart-define=API_BASE_URL=http://10.0.2.2:8080

# Nếu thiết bị thật: thay IP máy chủ
flutter run --dart-define=API_BASE_URL=http://192.168.1.10:8080
```

Mặc định API_BASE_URL là `http://10.0.2.2:8080` cho Android emulator (tương đương `localhost` trên máy). Nếu chạy thiết bị thật, đổi sang IP máy chủ (ví dụ `http://192.168.1.10:8080`).

## Cấu trúc chính
- `lib/services/api_service.dart`: gọi REST (login, danh sách được gán, cập nhật trạng thái)
- `lib/services/chat_service.dart`: kết nối STOMP WebSocket theo từng yêu cầu
- `lib/services/auth_service.dart`: lưu token + thông tin user bằng `shared_preferences`
- `lib/models/service_request.dart`: model dữ liệu yêu cầu
- `lib/pages/login_page.dart`: màn hình đăng nhập
- `lib/pages/requests_list_page.dart`: danh sách yêu cầu được gán
- `lib/pages/request_detail_page.dart`: chi tiết + chat + cập nhật trạng thái

## Ghi chú WebSocket
- Backend đã bật SockJS ở `/ws`. Trên mobile dùng STOMP qua WebSocket vào `ws://<BASE_HOST>:8080/ws/websocket`.
- Topic chat: subscribe `/topic/support-requests/{id}/chat`, publish `/app/support-requests/{id}/chat`.

## Bảo mật truy cập
- Ứng dụng chỉ tải danh sách thông qua endpoint `GET /api/staff/support-requests/assigned?staffId={id}` và trang chi tiết chỉ mở được khi yêu cầu thuộc về nhân viên hiện tại.
