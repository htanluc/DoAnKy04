# Hướng dẫn test API tạo hóa đơn cho một căn hộ cụ thể

## API Endpoint
```
POST /api/admin/invoices/generate?apartmentId={id}&billingPeriod={yyyy-MM}
```

## Cách sử dụng

### 1. Test nhanh (Windows)
```bash
# Chạy file test đơn giản
test-quick-single-invoice.bat

# Hoặc chạy file test đầy đủ
test-single-apartment-invoice.bat
```

### 2. Test bằng curl trực tiếp

#### Tạo hóa đơn cho căn hộ 55, tháng 1/2024:
```bash
curl -X POST "http://localhost:8080/api/admin/invoices/generate?apartmentId=55&billingPeriod=2024-01" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Kiểm tra hóa đơn đã tạo:
```bash
curl -X GET "http://localhost:8080/api/admin/invoices/by-apartments?aptIds=55" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

#### Xem chi tiết hóa đơn:
```bash
curl -X GET "http://localhost:8080/api/admin/invoices/55/items" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Test bằng Postman

#### Request:
- **Method**: POST
- **URL**: `http://localhost:8080/api/admin/invoices/generate?apartmentId=55&billingPeriod=2024-01`
- **Headers**:
  ```
  Authorization: Bearer YOUR_TOKEN_HERE
  Content-Type: application/json
  ```

## Các trường hợp test

### ✅ Trường hợp thành công:
1. **Tạo hóa đơn mới**: `apartmentId=55&billingPeriod=2024-01`
2. **Tạo hóa đơn cho tháng khác**: `apartmentId=55&billingPeriod=2024-02`
3. **Tạo hóa đơn cho căn hộ khác**: `apartmentId=57&billingPeriod=2024-01`

### ❌ Trường hợp thất bại:
1. **Hóa đơn đã tồn tại**: Tạo lại hóa đơn cho cùng căn hộ và tháng
2. **Căn hộ không tồn tại**: `apartmentId=999&billingPeriod=2024-01`
3. **Định dạng tháng sai**: `apartmentId=55&billingPeriod=2024-13`

## Kết quả mong đợi

### Response thành công:
```json
{
  "success": true,
  "message": "Đã tạo hóa đơn cho căn hộ 55 tháng 2024-01",
  "apartmentId": 55,
  "billingPeriod": "2024-01",
  "note": "Hóa đơn đã được tạo với đầy đủ chi tiết các khoản phí"
}
```

### Response thất bại (hóa đơn đã tồn tại):
```json
{
  "success": false,
  "message": "Hóa đơn cho căn hộ 55 tháng 2024-01 đã tồn tại"
}
```

## Các loại phí được tính

Khi tạo hóa đơn, hệ thống sẽ tự động tính:
1. **Phí dịch vụ**: Dựa trên diện tích căn hộ
2. **Phí nước**: Dựa trên chỉ số nước (nếu có)
3. **Phí gửi xe**: Dựa trên xe của cư dân (nếu có)

## Files test có sẵn

1. **`test-quick-single-invoice.bat`**: Test nhanh, đơn giản
2. **`test-single-apartment-invoice.bat`**: Test đầy đủ các trường hợp
3. **`test-invoice-single-apartment.bat`**: Test cũ (đã có sẵn)

## Lưu ý quan trọng

1. **Chỉ tạo hóa đơn cho căn hộ được chỉ định**
2. **Chỉ tạo hóa đơn cho tháng được chỉ định**
3. **Không ảnh hưởng đến các căn hộ khác**
4. **Không ảnh hưởng đến các tháng khác**
5. **Tự động tính tất cả loại phí**

## So sánh với API khác

| API | Mục đích | Phạm vi |
|-----|----------|---------|
| `POST /api/admin/invoices/generate` | Tạo hóa đơn cho **một căn hộ** | 1 căn hộ + 1 tháng |
| `POST /api/admin/invoices/generate-all` | Tạo hóa đơn cho **tất cả căn hộ** | Tất cả căn hộ + 1 tháng |
| `POST /api/admin/yearly-billing/generate-once` | Tạo hóa đơn cho **cả năm** | Tất cả căn hộ + 12 tháng | 