# Invoices Module - Hướng dẫn sử dụng

## 🧾 Tổng quan
Module Invoices cho phép cư dân xem và thanh toán hóa đơn của mình.

## ✨ Tính năng chính

### 1. Danh sách hóa đơn
- **Hiển thị danh sách** hóa đơn với thông tin:
  - Mã hóa đơn, kỳ thanh toán
  - Ngày phát hành, hạn thanh toán
  - Tổng tiền, trạng thái
  - Ghi chú (nếu có)
- **Filter theo trạng thái**: Tất cả, Chưa thanh toán, Đã thanh toán, Quá hạn
- **Pull-to-refresh** để cập nhật dữ liệu

### 2. Chi tiết hóa đơn
- **Thông tin hóa đơn** đầy đủ
- **Chi tiết các khoản phí** trong hóa đơn
- **Lịch sử thanh toán** (nếu có)
- **Thiết lập thanh toán tự động** (nếu có)

### 3. Thanh toán
- **4 phương thức thanh toán**:
  - MoMo
  - VNPay
  - ZaloPay
  - Visa/Mastercard
- **WebView integration** cho thanh toán
- **Callback handling** khi thanh toán thành công/thất bại

### 4. Thanh toán tự động
- **Thiết lập** thanh toán tự động
- **Hủy** thanh toán tự động
- **Xem cài đặt** hiện tại

## 🎨 UI/UX

### Màu sắc (FPT Brand)
- **Primary**: `#0066CC` (FPT Blue)
- **Accent**: `#FF6600` (FPT Orange)
- **Status colors**:
  - Chưa thanh toán: `#F59E0B` (Amber)
  - Đã thanh toán: `#10B981` (Green)
  - Quá hạn: `#EF4444` (Red)

### Layout
- **Card-based design** cho danh sách hóa đơn
- **Filter chips** để lọc theo trạng thái
- **Bottom sheet** cho chọn phương thức thanh toán
- **WebView** cho thanh toán
- **Loading states** và error handling

## 🔧 Cấu hình kỹ thuật

### API Endpoints
- `GET /api/invoices/my` - Lấy danh sách hóa đơn
- `GET /api/invoices/{id}` - Lấy chi tiết hóa đơn
- `GET /api/invoices/{id}/payments` - Lấy lịch sử thanh toán
- `POST /api/payments/momo` - Tạo thanh toán MoMo
- `POST /api/payments/vnpay` - Tạo thanh toán VNPay
- `POST /api/payments/zalopay` - Tạo thanh toán ZaloPay
- `POST /api/payments/visa` - Tạo thanh toán Visa/Mastercard
- `POST /api/payments/auto-payment` - Thiết lập thanh toán tự động
- `DELETE /api/payments/auto-payment/{id}` - Hủy thanh toán tự động
- `GET /api/payments/auto-payment/{id}` - Lấy cài đặt thanh toán tự động

### Dependencies
- `flutter_riverpod` - State management
- `dio` - HTTP client với JWT interceptor
- `freezed` + `json_serializable` - Data models
- `webview_flutter` - WebView cho thanh toán
- `uni_links` - Deep linking
- `intl` - Format tiền tệ và thời gian

### File structure
```
lib/features/invoices/
├── data/
│   ├── invoices_api.dart              # API client cho invoices
│   ├── payments_api.dart              # API client cho payments
│   └── invoices_repository.dart       # Repository layer
├── models/
│   ├── invoice.dart                   # Invoice model (freezed)
│   ├── invoice_item.dart              # Invoice item model (freezed)
│   └── payment.dart                   # Payment model (freezed)
├── providers/
│   └── invoices_providers.dart        # Riverpod providers
├── ui/
│   ├── invoices_screen.dart          # Main screen (list + filter)
│   ├── invoice_detail_screen.dart    # Detail screen
│   ├── payment_webview_screen.dart   # WebView cho thanh toán
│   └── widgets/
│       ├── invoice_card.dart         # Invoice card widget
│       ├── invoice_status_badge.dart # Status badge widget
│       └── payment_method_sheet.dart # Payment method bottom sheet
└── README.md                         # Documentation
```

## 🚀 Cách sử dụng

### 1. Xem danh sách hóa đơn
1. Vào tab "Hóa đơn" từ Dashboard
2. Xem danh sách hóa đơn
3. Sử dụng filter chips để lọc theo trạng thái
4. Vuốt xuống để refresh

### 2. Xem chi tiết hóa đơn
1. Chạm vào một hóa đơn trong danh sách
2. Xem thông tin chi tiết
3. Xem lịch sử thanh toán (nếu có)

### 3. Thanh toán hóa đơn
1. Trong chi tiết hóa đơn, bấm "Thanh toán"
2. Chọn phương thức thanh toán
3. Thanh toán qua WebView
4. Nhận kết quả thanh toán

### 4. Thiết lập thanh toán tự động
1. Trong chi tiết hóa đơn
2. Xem phần "Thanh toán tự động"
3. Thiết lập hoặc hủy (nếu có)

## 🐛 Troubleshooting

### Lỗi không tải được hóa đơn
- Kiểm tra kết nối mạng
- Đảm bảo backend đang chạy
- Kiểm tra token authentication
- Bấm "Thử lại" để refresh

### Lỗi thanh toán
- Kiểm tra URL thanh toán
- Đảm bảo WebView hoạt động
- Kiểm tra callback URLs
- Xem logs để debug

### Lỗi WebView
- Kiểm tra permissions
- Đảm bảo URL hợp lệ
- Kiểm tra JavaScript enabled
- Test trên device thật

## 📱 Testing

### Test cases
1. **Xem danh sách hóa đơn** với filter
2. **Xem chi tiết hóa đơn** với các trạng thái khác nhau
3. **Thanh toán qua 4 phương thức** khác nhau
4. **WebView payment flow** với callback
5. **Auto-payment setup** (nếu có)
6. **Error handling** khi mất kết nối

### Test data
- Sử dụng tài khoản cư dân có hóa đơn
- Test với các trạng thái hóa đơn khác nhau
- Test với các phương thức thanh toán khác nhau

## 🔄 Cập nhật

### Version 1.0.0
- ✅ Danh sách hóa đơn với filter
- ✅ Chi tiết hóa đơn
- ✅ Thanh toán qua 4 cổng
- ✅ WebView integration
- ✅ Payment callback handling
- ✅ Auto-payment (nếu có)
- ✅ UI theo FPT brand

### Planned features
- [ ] Push notifications cho hóa đơn mới
- [ ] Export hóa đơn PDF
- [ ] Lịch sử thanh toán chi tiết
- [ ] Báo cáo chi tiêu
- [ ] Thanh toán theo lô
