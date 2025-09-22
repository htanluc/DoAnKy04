# Tính năng Quản lý Hóa đơn Quá hạn và Gửi Email Nhắc nhở

## Tổng quan
Tính năng này cho phép admin quản lý hóa đơn quá hạn và gửi email nhắc nhở tự động cho cư dân.

## Các API Backend mới

### 1. Lấy danh sách hóa đơn quá hạn
```
GET /api/admin/invoices/overdue
```
**Response:** Danh sách các hóa đơn có `due_date` trước ngày hiện tại và `status = UNPAID`

### 2. Cập nhật trạng thái hóa đơn thành quá hạn
```
POST /api/admin/invoices/update-overdue-status
```
**Response:** Số lượng hóa đơn đã được cập nhật thành trạng thái OVERDUE

### 3. Gửi email nhắc nhở cho hóa đơn quá hạn
```
POST /api/admin/invoices/send-overdue-reminders
Content-Type: application/json

[1, 2, 3] // Array of invoice IDs
```
**Response:** Kết quả gửi email với số lượng thành công/thất bại

## Giao diện Frontend

### Vị trí
Truy cập: `http://localhost:3000/admin-dashboard/invoices`

### Tính năng chính

#### 1. Section "Hóa đơn quá hạn và gửi nhắc nhở"
- Hiển thị danh sách tất cả hóa đơn quá hạn
- Checkbox để chọn hóa đơn cần gửi nhắc nhở
- Nút "Chọn tất cả" / "Bỏ chọn tất cả"
- Hiển thị số ngày quá hạn cho mỗi hóa đơn

#### 2. Các nút hành động
- **Tải lại danh sách**: Làm mới danh sách hóa đơn quá hạn
- **Cập nhật trạng thái quá hạn**: Tự động cập nhật hóa đơn quá hạn thành trạng thái OVERDUE
- **Gửi nhắc nhở**: Gửi email nhắc nhở cho các hóa đơn đã chọn

#### 3. Thông tin hiển thị
- Số hóa đơn
- Thông tin căn hộ
- Số tiền (màu đỏ để nhấn mạnh)
- Hạn thanh toán
- Số ngày quá hạn (badge màu đỏ)
- Trạng thái hóa đơn

## Email Nhắc nhở

### Nội dung email
- **Subject**: "NHẮC NHỞ THANH TOÁN - Hóa đơn căn hộ #[ID] - Kỳ [PERIOD]"
- **Nội dung**: HTML với thông tin chi tiết hóa đơn
- **Đính kèm**: File PDF hóa đơn

### Template email
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #d32f2f;">⚠️ NHẮC NHỞ THANH TOÁN HÓA ĐƠN</h2>
  <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <p style="margin: 0; color: #856404;"><strong>Hóa đơn của bạn đã quá hạn thanh toán!</strong></p>
  </div>
  <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px;">
    <h3>Thông tin hóa đơn:</h3>
    <p><strong>Căn hộ:</strong> #[APARTMENT_ID]</p>
    <p><strong>Kỳ thanh toán:</strong> [BILLING_PERIOD]</p>
    <p><strong>Ngày phát hành:</strong> [ISSUE_DATE]</p>
    <p><strong>Hạn thanh toán:</strong> [DUE_DATE]</p>
    <p><strong>Tổng tiền:</strong> <span style="color: #d32f2f; font-size: 18px; font-weight: bold;">[AMOUNT] VND</span></p>
  </div>
  <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <p style="margin: 0; color: #1565c0;"><strong>Vui lòng thanh toán sớm để tránh phí phạt và gián đoạn dịch vụ.</strong></p>
  </div>
  <p>Trân trọng,<br/>Ban quản lý tòa nhà</p>
</div>
```

## Cách sử dụng

### 1. Truy cập trang quản lý hóa đơn
- Đăng nhập với tài khoản admin
- Vào `http://localhost:3000/admin-dashboard/invoices`

### 2. Xem hóa đơn quá hạn
- Scroll xuống section "Hóa đơn quá hạn và gửi nhắc nhở"
- Danh sách sẽ tự động load khi vào trang

### 3. Cập nhật trạng thái quá hạn
- Nhấn nút "Cập nhật trạng thái quá hạn"
- Hệ thống sẽ tự động tìm và cập nhật các hóa đơn quá hạn

### 4. Gửi email nhắc nhở
- Chọn các hóa đơn cần gửi nhắc nhở bằng checkbox
- Hoặc nhấn "Chọn tất cả" để chọn tất cả hóa đơn
- Nhấn nút "Gửi nhắc nhở" (màu đỏ)
- Hệ thống sẽ gửi email cho tất cả cư dân của các căn hộ tương ứng

## Test API

Sử dụng file `test-overdue-invoices.html` để test các API:
1. Mở file trong browser
2. Test từng API một cách độc lập
3. Kiểm tra response và error handling

## Lưu ý kỹ thuật

### Backend
- Sử dụng `@Async` cho việc gửi email để không block request
- Email được gửi cho tất cả cư dân của căn hộ (không chỉ cư dân chính)
- Có logging cho tất cả hoạt động admin

### Frontend
- State management cho danh sách hóa đơn quá hạn
- Checkbox selection với select all functionality
- Loading states và error handling
- Responsive design với MUI components

### Database
- Sử dụng enum `InvoiceStatus.OVERDUE` có sẵn
- Query tối ưu với `findByDueDateBeforeAndStatus`
- Không cần migration vì đã có sẵn cấu trúc

## Troubleshooting

### Lỗi thường gặp
1. **Không có hóa đơn quá hạn**: Kiểm tra xem có hóa đơn nào có `due_date` trước ngày hiện tại không
2. **Email không gửi được**: Kiểm tra cấu hình SMTP trong `application.properties`
3. **Lỗi 500**: Kiểm tra log backend để xem chi tiết lỗi

### Debug
- Sử dụng file test HTML để debug API
- Kiểm tra Network tab trong browser DevTools
- Xem log backend trong console
