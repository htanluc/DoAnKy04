# Hướng dẫn Debug Tính năng Hóa đơn Quá hạn

## Vấn đề: Không thấy nút chọn và nút gửi quá hạn

### Nguyên nhân có thể:
1. **Không có hóa đơn quá hạn** trong dữ liệu hiện tại
2. **Logic kiểm tra hóa đơn quá hạn** chưa đúng
3. **Dữ liệu hóa đơn** chưa được load đúng cách

## Cách kiểm tra và debug:

### 1. Kiểm tra dữ liệu hóa đơn
Truy cập: `http://localhost:3000/admin-dashboard/invoices`

- Nhấn nút **"Debug (X)"** (màu xanh) để xem thông tin trong console
- Mở Developer Tools (F12) → Console để xem log
- Kiểm tra:
  - `Overdue invoices`: Danh sách hóa đơn quá hạn
  - `Selected IDs`: ID các hóa đơn đã chọn
  - `All invoices`: Tất cả hóa đơn

### 2. Tạo dữ liệu test
Sử dụng file: `test-create-overdue-invoices.html`

1. Mở file trong browser
2. Nhấn "Tạo hóa đơn quá hạn" để tạo dữ liệu test
3. Nhấn "Lấy danh sách hóa đơn" để xem kết quả

### 3. Kiểm tra logic hóa đơn quá hạn
Hóa đơn được coi là quá hạn khi:
- `due_date < ngày hiện tại`
- `status = 'UNPAID'` hoặc `status = 'PENDING'`

### 4. Các nút thao tác
- **"Cập nhật trạng thái quá hạn"**: Cập nhật hóa đơn quá hạn thành status OVERDUE
- **"Gửi nhắc nhở quá hạn (X)"**: Gửi email cho hóa đơn đã chọn (chỉ hiện khi có hóa đơn được chọn)
- **"Debug (X)"**: Hiển thị thông tin debug

### 5. Cột "Chọn" trong bảng
- **Checkbox**: Chỉ hiện cho hóa đơn quá hạn
- **Dấu "-"**: Hiện cho hóa đơn không quá hạn
- **Background đỏ**: Hóa đơn quá hạn có nền đỏ nhạt

## Cách tạo hóa đơn quá hạn để test:

### Phương pháp 1: Sử dụng file test
1. Mở `test-create-overdue-invoices.html`
2. Chọn ngày quá hạn (ví dụ: 30 ngày trước)
3. Chọn status "UNPAID" hoặc "PENDING"
4. Nhấn "Tạo hóa đơn quá hạn"

### Phương pháp 2: Sử dụng API trực tiếp
```bash
# Tạo hóa đơn cho tháng trước
curl -X POST "http://localhost:8080/api/admin/invoices/generate-all?billingPeriod=2024-01"

# Cập nhật due_date thành ngày quá hạn
# (Cần truy cập database để update)
```

### Phương pháp 3: Sử dụng database
```sql
-- Tạo hóa đơn quá hạn
INSERT INTO invoices (apartment_id, billing_period, issue_date, due_date, total_amount, status) 
VALUES (1, '2024-01', '2024-01-01', '2024-01-01', 1000000, 'UNPAID');
```

## Kiểm tra kết quả:

### 1. Trong giao diện
- Cột "Chọn" có checkbox cho hóa đơn quá hạn
- Hóa đơn quá hạn có background đỏ
- Nút "Gửi nhắc nhở quá hạn" hiển thị số lượng đã chọn
- Thông tin "Quá hạn X ngày" hiển thị dưới status

### 2. Trong console
- Log thông tin debug khi nhấn nút "Debug"
- Kiểm tra logic kiểm tra hóa đơn quá hạn

### 3. Test chức năng
- Chọn hóa đơn quá hạn bằng checkbox
- Nhấn "Gửi nhắc nhở quá hạn"
- Kiểm tra thông báo kết quả

## Troubleshooting:

### Nếu vẫn không thấy checkbox:
1. Kiểm tra có hóa đơn nào có `due_date < today` không
2. Kiểm tra status có phải 'UNPAID' hoặc 'PENDING' không
3. Kiểm tra console có lỗi JavaScript không

### Nếu nút "Gửi nhắc nhở" bị disable:
1. Kiểm tra có hóa đơn nào được chọn không
2. Kiểm tra `selectedOverdueIds` array có rỗng không

### Nếu không có hóa đơn quá hạn:
1. Tạo dữ liệu test bằng file HTML
2. Hoặc cập nhật due_date trong database
3. Hoặc tạo hóa đơn mới với ngày quá hạn
