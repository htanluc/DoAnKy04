# Event UI Improvements

## Tóm tắt thay đổi

Đã cải thiện giao diện Events screen với các tính năng mới và logic hiển thị nút đăng ký được tối ưu hóa.

## Tính năng mới

### 1. **Nút "Xem chi tiết"**
- Thêm nút "Xem chi tiết" cho mọi sự kiện
- Cho phép user xem thông tin chi tiết của sự kiện
- Loại bỏ việc tap vào card để mở chi tiết (thay bằng nút riêng)

### 2. **Nút "Xem QR"**
- Hiển thị nút "Xem QR" chỉ cho user đã đăng ký và có QR code
- Mở dialog hiển thị QR code với thông tin hết hạn
- Có nút "Chia sẻ" QR code (TODO: implement)

### 3. **Logic hiển thị nút đăng ký được cải thiện**
- **Sự kiện sắp diễn ra**: 
  - Nếu `canStillRegister = true`: Hiển thị nút "Đăng ký tham gia"
  - Nếu `canStillRegister = false`: Hiển thị thông báo "Hết hạn đăng ký" (màu đỏ)
- **Sự kiện đang diễn ra**: Hiển thị thông báo "Sự kiện đang diễn ra" (màu cam)
- **Sự kiện đã kết thúc**: Hiển thị thông báo "Sự kiện đã kết thúc" (màu xám)

## Cấu trúc UI mới

### Event Card Layout
```
┌─────────────────────────────────────┐
│ [Status Badge] [Registered Badge]   │
│                                     │
│ Event Title                         │
│ Event Description                   │
│                                     │
│ 📅 Time Information                 │
│ 📍 Location                         │
│ 👥 Participant Count                │
│                                     │
│ [Action Button based on status]     │
│                                     │
│ [Xem chi tiết] [Xem QR]            │
└─────────────────────────────────────┘
```

### Action Buttons Logic

#### Khi user đã đăng ký:
- **Đã check-in**: Hiển thị trạng thái check-in với thời gian
- **Đang diễn ra**: Nút "Check-in ngay"
- **Sắp diễn ra**: Thông báo "QR code đã sẵn sàng" + nút "Hủy đăng ký"

#### Khi user chưa đăng ký:
- **Sắp diễn ra + có thể đăng ký**: Nút "Đăng ký tham gia"
- **Sắp diễn ra + hết hạn đăng ký**: Thông báo "Hết hạn đăng ký"
- **Đang diễn ra**: Thông báo "Sự kiện đang diễn ra"
- **Đã kết thúc**: Thông báo "Sự kiện đã kết thúc"

## QR Code Dialog

### Tính năng:
- Hiển thị QR code trong container 200x200
- Hiển thị thời gian hết hạn QR code
- Nút "Đóng" và "Chia sẻ"
- Responsive design

### Layout:
```
┌─────────────────────────┐
│ QR Code Check-in        │
│                         │
│ ┌─────────────────┐     │
│ │                 │     │
│ │   QR CODE       │     │
│ │                 │     │
│ └─────────────────┘     │
│                         │
│ Quét mã QR này để       │
│ check-in                │
│                         │
│ Hết hạn: dd/MM/yyyy     │
│                         │
│ [Đóng] [Chia sẻ]        │
└─────────────────────────┘
```

## Lợi ích

### 1. **UX cải thiện**
- Nút hành động rõ ràng và dễ hiểu
- Thông báo trạng thái chi tiết
- Không còn tap nhầm vào card

### 2. **Logic rõ ràng**
- Phân biệt rõ giữa "hết hạn đăng ký" và "sự kiện đã kết thúc"
- Hiển thị đúng trạng thái cho từng loại sự kiện
- QR code chỉ hiển thị khi cần thiết

### 3. **Tính năng mới**
- Xem QR code trực tiếp từ danh sách sự kiện
- Thông tin hết hạn QR code
- Chuẩn bị sẵn cho tính năng chia sẻ QR code

## Files đã thay đổi

- `apartment-resident-mobile/lib/features/events/ui/events_screen.dart`
  - Thêm nút "Xem chi tiết" và "Xem QR"
  - Cải thiện logic hiển thị nút đăng ký
  - Thêm method `_showQrCodeDialog`
  - Loại bỏ InkWell từ event card

## Testing

### Các trường hợp test:
1. ✅ Sự kiện sắp diễn ra - có thể đăng ký → Hiển thị nút "Đăng ký tham gia"
2. ✅ Sự kiện sắp diễn ra - hết hạn đăng ký → Hiển thị "Hết hạn đăng ký"
3. ✅ Sự kiện đang diễn ra → Hiển thị "Sự kiện đang diễn ra"
4. ✅ Sự kiện đã kết thúc → Hiển thị "Sự kiện đã kết thúc"
5. ✅ User đã đăng ký → Hiển thị nút "Xem QR" (nếu có QR code)
6. ✅ Mọi sự kiện → Hiển thị nút "Xem chi tiết"
7. ✅ QR code dialog → Hiển thị đúng QR code và thông tin hết hạn

## Tương lai

### Tính năng có thể thêm:
- Implement tính năng chia sẻ QR code
- Thêm animation cho các nút
- Thêm haptic feedback
- Dark mode support
- Accessibility improvements
