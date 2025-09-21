# Event Status-Based UI Logic

## Tóm tắt thay đổi

Đã cập nhật logic hiển thị nút đăng ký và các action buttons trong Events module dựa theo trạng thái sự kiện (sắp diễn ra - đang diễn ra - đã kết thúc).

## Logic mới

### 1. Events Screen (`events_screen.dart`)

#### Khi user đã đăng ký:
- **Sắp diễn ra**: Hiển thị QR code status + nút "Hủy đăng ký"
- **Đang diễn ra**: Hiển thị nút "Check-in ngay" (nếu chưa check-in)
- **Đã kết thúc**: Hiển thị trạng thái check-in

#### Khi user chưa đăng ký:
- **Sắp diễn ra**: Hiển thị nút "Đăng ký tham gia"
- **Đang diễn ra**: Hiển thị thông báo "Sự kiện đang diễn ra"
- **Đã kết thúc**: Hiển thị thông báo "Sự kiện đã kết thúc"

### 2. Event Detail Screen (`event_detail_screen.dart`)

#### Khi sự kiện đã kết thúc:
- Hiển thị thông báo "Sự kiện đã kết thúc" với icon và mô tả

#### Khi user đã đăng ký:
- Hiển thị QR code section (nếu có)
- Hiển thị trạng thái check-in
- **Sắp diễn ra**: Nút "Hủy đăng ký"
- **Đang diễn ra**: Nút "Check-in ngay" (nếu chưa check-in)

#### Khi user chưa đăng ký:
- **Sắp diễn ra**: Nút "Đăng ký tham gia"
- **Đang diễn ra**: Thông báo "Sự kiện đang diễn ra"
- **Đã kết thúc**: Không hiển thị gì

## Trạng thái sự kiện

Sử dụng các getter từ `EventStatusExtension`:
- `event.isUpcoming`: Sự kiện sắp diễn ra
- `event.isOngoing`: Sự kiện đang diễn ra  
- `event.isCompleted`: Sự kiện đã kết thúc

## Lợi ích

1. **Logic đơn giản**: Chỉ dựa theo trạng thái sự kiện, không cần kiểm tra thời gian phức tạp
2. **UX rõ ràng**: User biết chính xác có thể làm gì với từng sự kiện
3. **Consistent**: Logic giống nhau giữa list view và detail view
4. **Maintainable**: Dễ bảo trì và mở rộng

## Files đã thay đổi

- `apartment-resident-mobile/lib/features/events/ui/events_screen.dart`
- `apartment-resident-mobile/lib/features/events/ui/event_detail_screen.dart`
