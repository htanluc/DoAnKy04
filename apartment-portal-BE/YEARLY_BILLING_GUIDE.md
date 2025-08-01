# HƯỚNG DẪN TẠO HÓA ĐƠN THEO THÁNG

## Tổng quan
Tính năng tạo hóa đơn theo tháng cho phép admin tạo hóa đơn cho tất cả căn hộ hiện có trong một tháng cụ thể mà admin chọn.

## Các API Endpoints

### 1. Tạo hóa đơn cho tất cả căn hộ trong một tháng cụ thể
```http
POST /api/admin/yearly-billing/generate-month/{year}/{month}
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "year": 2025,
  "serviceFeePerM2": 5000.0,
  "waterFeePerM3": 15000.0,
  "motorcycleFee": 50000.0,
  "car4SeatsFee": 200000.0,
  "car7SeatsFee": 250000.0
}
```

**Ví dụ**: 
- `POST /api/admin/yearly-billing/generate-month/2025/7` để tạo hóa đơn cho tháng 7/2025
- `POST /api/admin/yearly-billing/generate-month/2025/8` để tạo hóa đơn cho tháng 8/2025

### 2. Tạo cấu hình phí cho năm
```http
POST /api/admin/yearly-billing/fee-config
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "year": 2025,
  "serviceFeePerM2": 5000.0,
  "waterFeePerM3": 15000.0,
  "motorcycleFee": 50000.0,
  "car4SeatsFee": 200000.0,
  "car7SeatsFee": 250000.0
}
```

### 3. Tạo hóa đơn đồng loạt cho cả năm (tất cả 12 tháng)
```http
POST /api/admin/yearly-billing/generate-once
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "year": 2025,
  "serviceFeePerM2": 5000.0,
  "waterFeePerM3": 15000.0,
  "motorcycleFee": 50000.0,
  "car4SeatsFee": 200000.0,
  "car7SeatsFee": 250000.0
}
```

### 4. Xem thống kê hóa đơn đã tạo
```http
GET /api/admin/yearly-billing/invoice-stats/{year}
Authorization: Bearer YOUR_JWT_TOKEN
```

### 5. Xem cấu hình phí cho một tháng
```http
GET /api/admin/yearly-billing/config/{year}/{month}
Authorization: Bearer YOUR_JWT_TOKEN
```

## Cách sử dụng

### Bước 1: Tạo hóa đơn theo tháng (Khuyến nghị)
Sử dụng endpoint `generate-month` để tạo hóa đơn cho tất cả căn hộ trong một tháng cụ thể:

```bash
# Tạo hóa đơn cho tháng 7/2025
curl -X POST "http://localhost:8080/api/admin/yearly-billing/generate-month/2025/7" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "year": 2025,
       "serviceFeePerM2": 5000.0,
       "waterFeePerM3": 15000.0,
       "motorcycleFee": 50000.0,
       "car4SeatsFee": 200000.0,
       "car7SeatsFee": 250000.0
     }'

# Tạo hóa đơn cho tháng 8/2025
curl -X POST "http://localhost:8080/api/admin/yearly-billing/generate-month/2025/8" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "year": 2025,
       "serviceFeePerM2": 5000.0,
       "waterFeePerM3": 15000.0,
       "motorcycleFee": 50000.0,
       "car4SeatsFee": 200000.0,
       "car7SeatsFee": 250000.0
     }'
```

**Lưu ý**: 
- Endpoint này sẽ tự động tạo cấu hình phí cho tháng được chọn
- Chỉ tạo hóa đơn cho tháng cụ thể, không tạo cho cả năm
- Có thể tạo hóa đơn cho từng tháng riêng biệt
- **30 căn hộ × 1 tháng = 30 hóa đơn** được tạo mỗi lần gọi

### Bước 2: Kiểm tra kết quả
Xem thống kê hóa đơn đã tạo:

```bash
curl -X GET "http://localhost:8080/api/admin/yearly-billing/invoice-stats/2025" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Cách tính phí

### 1. Phí dịch vụ
```
Phí dịch vụ = Diện tích căn hộ × Giá dịch vụ/m²
```

### 2. Phí gửi xe
```
Phí gửi xe = Σ(Phí từng xe của cư dân trong căn hộ)
```

### 3. Phí nước
```
Phí nước = Lượng tiêu thụ nước × Giá nước/m³
```

### 4. Tổng tiền
```
Tổng tiền = Phí dịch vụ + Phí gửi xe + Phí nước
```

## Ví dụ thực tế

### Kịch bản 1: Tạo hóa đơn theo tháng
```bash
# Tháng 7/2025: 30 căn hộ → 30 hóa đơn
curl -X POST "http://localhost:8080/api/admin/yearly-billing/generate-month/2025/7" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"year": 2025, "serviceFeePerM2": 5000.0, "waterFeePerM3": 15000.0, "motorcycleFee": 50000.0, "car4SeatsFee": 200000.0, "car7SeatsFee": 250000.0}'

# Tháng 8/2025: 30 căn hộ → 30 hóa đơn  
curl -X POST "http://localhost:8080/api/admin/yearly-billing/generate-month/2025/8" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"year": 2025, "serviceFeePerM2": 5000.0, "waterFeePerM3": 15000.0, "motorcycleFee": 50000.0, "car4SeatsFee": 200000.0, "car7SeatsFee": 250000.0}'
```

### Kịch bản 2: Tạo hóa đơn cho cả năm
```bash
# Cả năm 2025: 30 căn hộ × 12 tháng = 360 hóa đơn
curl -X POST "http://localhost:8080/api/admin/yearly-billing/generate-once" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"year": 2025, "serviceFeePerM2": 5000.0, "waterFeePerM3": 15000.0, "motorcycleFee": 50000.0, "car4SeatsFee": 200000.0, "car7SeatsFee": 250000.0}'
```

## Lưu ý quan trọng

1. **Không tạo trùng lặp**: Hệ thống sẽ kiểm tra và không tạo hóa đơn nếu đã tồn tại cho cùng kỳ thanh toán.

2. **Rate Limiting**: Có giới hạn 500ms giữa các request để tránh spam.

3. **Caching**: Kết quả query được cache trong 30 giây để tăng hiệu suất.

4. **Logging**: Tất cả hoạt động được log chi tiết để debug.

## Debug và Troubleshooting

### Xem cache status
```bash
curl -X GET "http://localhost:8080/api/admin/yearly-billing/cache-status" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Clear cache
```bash
curl -X POST "http://localhost:8080/api/admin/yearly-billing/clear-cache" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Test script
Chạy script test để kiểm tra:
```bash
# Test tạo hóa đơn theo tháng
test-monthly-billing.bat

# Test tạo hóa đơn một lần cho cả năm
test-yearly-billing-once.bat
```

## Response Examples

### Thành công tạo hóa đơn theo tháng
```json
{
  "success": true,
  "message": "Đã tạo hóa đơn cho tất cả căn hộ tháng 7/2025",
  "year": 2025,
  "month": 7,
  "note": "Hóa đơn đã được tạo cho tất cả căn hộ trong tháng này"
}
```

### Thành công tạo hóa đơn cho cả năm
```json
{
  "success": true,
  "message": "Đã tạo hóa đơn đồng loạt cho tất cả căn hộ năm 2025",
  "year": 2025,
  "note": "Hóa đơn đã được tạo cho 12 tháng trong năm"
}
```

### Thống kê hóa đơn
```json
{
  "success": true,
  "year": 2025,
  "totalInvoices": 60,
  "unpaidInvoices": 50,
  "paidInvoices": 8,
  "overdueInvoices": 2,
  "totalAmount": 25000000.0
}
```

### Lỗi rate limiting
```json
{
  "success": false,
  "message": "Quá nhiều request. Vui lòng thử lại sau 500ms."
}
```

### Không tìm thấy cấu hình phí
```json
{
  "success": false,
  "message": "Không tìm thấy cấu hình phí tháng 7/2025"
}
``` 