# API Tạo Hóa Đơn - Tài liệu đầy đủ

## Tổng quan

Hệ thống tạo hóa đơn cho phép admin tạo hóa đơn cho căn hộ với các khoản phí tự động tính toán dựa trên cấu hình và dữ liệu thực tế.

## Base URL
```
http://localhost:8080/api/admin/invoices
```

## 1. Tạo hóa đơn cho một căn hộ cụ thể

### Endpoint
```
POST /api/admin/invoices/generate
```

### Mô tả
Tạo hóa đơn cho một căn hộ cụ thể với tất cả các khoản phí được tính toán tự động.

### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| apartmentId | Long | Yes | ID căn hộ cần tạo hóa đơn |
| billingPeriod | String | Yes | Kỳ thanh toán (format: YYYY-MM) |

### Example Request
```
POST /api/admin/invoices/generate?apartmentId=1&billingPeriod=2024-01
```

### Response Success
```json
{
  "success": true,
  "message": "Đã tạo hóa đơn cho căn hộ 1 tháng 2024-01",
  "apartmentId": 1,
  "billingPeriod": "2024-01"
}
```

### Response Error
```json
{
  "success": false,
  "message": "Lỗi khi tạo hóa đơn: [chi tiết lỗi]"
}
```

---

## 2. Tạo hóa đơn cho tất cả căn hộ

### Endpoint
```
POST /api/admin/invoices/generate-all
```

### Mô tả
Tạo hóa đơn cho tất cả căn hộ với tất cả các khoản phí được tính toán tự động.

### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| billingPeriod | String | Yes | Kỳ thanh toán (format: YYYY-MM) |

### Example Request
```
POST /api/admin/invoices/generate-all?billingPeriod=2024-01
```

### Response Success
```json
{
  "success": true,
  "message": "Đã tạo hóa đơn cho tất cả căn hộ tháng 2024-01",
  "billingPeriod": "2024-01"
}
```

---

## 3. Tính lại phí cho một tháng

### Endpoint
```
POST /api/admin/invoices/recalculate-fees
```

### Mô tả
Tính lại các khoản phí cho một tháng cụ thể (không tạo hóa đơn mới, chỉ cập nhật phí).

### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| billingPeriod | String | Yes | Kỳ thanh toán (format: YYYY-MM) |

### Example Request
```
POST /api/admin/invoices/recalculate-fees?billingPeriod=2024-01
```

### Response Success
```json
{
  "success": true,
  "message": "Đã tính lại phí cho tháng 2024-01",
  "billingPeriod": "2024-01"
}
```

---

## 4. Lấy hóa đơn theo căn hộ

### Endpoint
```
GET /api/admin/invoices/by-apartments
```

### Mô tả
Lấy danh sách hóa đơn theo danh sách ID căn hộ.

### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| aptIds | List<Long> | Yes | Danh sách ID căn hộ |

### Example Request
```
GET /api/admin/invoices/by-apartments?aptIds=1&aptIds=2&aptIds=3
```

### Response Success
```json
[
  {
    "id": 1,
    "apartmentId": 1,
    "billingPeriod": "2024-01",
    "issueDate": "2024-01-01",
    "dueDate": "2024-01-16",
    "totalAmount": 1500000.0,
    "status": "UNPAID",
    "items": [
      {
        "id": 1,
        "feeType": "SERVICE_FEE",
        "description": "Phí dịch vụ tháng 2024-01 (80.0 m² x 5000 VND/m²)",
        "amount": 400000.0
      },
      {
        "id": 2,
        "feeType": "WATER_FEE",
        "description": "Phí nước tháng 2024-01 (10.50 m³ x 15000 VND/m³)",
        "amount": 157500.0
      },
      {
        "id": 3,
        "feeType": "VEHICLE_FEE",
        "description": "Phí gửi xe Xe máy tháng 2024-01",
        "amount": 50000.0
      }
    ]
  }
]
```

---

## 5. Lấy hóa đơn của resident hiện tại

### Endpoint
```
GET /api/invoices/my
```

### Mô tả
Lấy danh sách hóa đơn của resident đang đăng nhập.

### Authentication
Yêu cầu đăng nhập (JWT token)

### Response Success
```json
[
  {
    "id": 1,
    "apartmentId": 1,
    "billingPeriod": "2024-01",
    "issueDate": "2024-01-01",
    "dueDate": "2024-01-16",
    "totalAmount": 1500000.0,
    "status": "UNPAID",
    "items": [...]
  }
]
```

---

## Các loại phí được tính tự động

### 1. Phí dịch vụ (SERVICE_FEE)
- Tính dựa trên diện tích căn hộ × giá/m²
- Lấy giá từ `ServiceFeeConfig` theo tháng/năm
- Giá mặc định: 5000 VND/m²

### 2. Phí nước (WATER_FEE)
- Tính dựa trên tiêu thụ nước × giá/m³
- Lấy chỉ số từ `WaterMeterReading`
- Lấy giá từ `ServiceFeeConfig` theo tháng/năm
- Giá mặc định: 15000 VND/m³

### 3. Phí gửi xe (VEHICLE_FEE)
- Tính cho xe máy, ô tô 4 chỗ, ô tô 7 chỗ
- Lấy thông tin xe từ `Vehicle` của cư dân
- Lấy giá từ `ServiceFeeConfig` theo tháng/năm
- Giá mặc định:
  - Xe máy: 50000 VND/tháng
  - Ô tô 4 chỗ: 200000 VND/tháng
  - Ô tô 7 chỗ: 250000 VND/tháng

---

## Quy trình tạo hóa đơn

### 1. Tạo hóa đơn cơ bản
```java
invoiceService.generateInvoicesForMonth(billingPeriod);
```
- Tạo hóa đơn trống cho tất cả căn hộ
- Status: UNPAID
- TotalAmount: 0.0

### 2. Tính toán các khoản phí
```java
feeServices.forEach(svc -> svc.generateFeeForMonth(billingPeriod));
```
- **ServiceFeeMonthlyFeeService**: Tính phí dịch vụ
- **WaterMeterMonthlyFeeService**: Tính phí nước
- **VehicleMonthlyFeeService**: Tính phí gửi xe

### 3. Cập nhật tổng tiền
- Tự động cập nhật `totalAmount` khi thêm `InvoiceItem`
- Tính tổng tất cả các khoản phí

---

## Lưu ý quan trọng

### 1. Dữ liệu cần thiết
- **Căn hộ**: Phải có trong database
- **Cư dân**: Phải có liên kết với căn hộ
- **Chỉ số nước**: Phải có `WaterMeterReading` cho tháng
- **Xe**: Phải có thông tin xe của cư dân
- **Cấu hình phí**: Nên có `ServiceFeeConfig` cho tháng

### 2. Xử lý trùng lặp
- Nếu hóa đơn đã tồn tại, sẽ bỏ qua việc tạo mới
- Có thể chạy lại để cập nhật phí

### 3. Validation
- Kiểm tra định dạng `billingPeriod` (YYYY-MM)
- Kiểm tra căn hộ tồn tại
- Kiểm tra dữ liệu cần thiết

---

## Error Codes

| HTTP Status | Error Message | Description |
|-------------|---------------|-------------|
| 400 | "Lỗi khi tạo hóa đơn: [chi tiết]" | Lỗi validation hoặc business logic |
| 404 | "Căn hộ không tồn tại" | Căn hộ không tìm thấy |
| 500 | "Internal Server Error" | Lỗi hệ thống |

---

## Ví dụ sử dụng

### 1. Tạo hóa đơn cho căn hộ 1 tháng 1/2024
```bash
curl -X POST "http://localhost:8080/api/admin/invoices/generate?apartmentId=1&billingPeriod=2024-01"
```

### 2. Tạo hóa đơn cho tất cả căn hộ tháng 1/2024
```bash
curl -X POST "http://localhost:8080/api/admin/invoices/generate-all?billingPeriod=2024-01"
```

### 3. Tính lại phí tháng 1/2024
```bash
curl -X POST "http://localhost:8080/api/admin/invoices/recalculate-fees?billingPeriod=2024-01"
```

### 4. Lấy hóa đơn của căn hộ 1, 2, 3
```bash
curl -X GET "http://localhost:8080/api/admin/invoices/by-apartments?aptIds=1&aptIds=2&aptIds=3"
```

### 5. Lấy hóa đơn của resident hiện tại
```bash
curl -X GET "http://localhost:8080/api/invoices/my" \
  -H "Authorization: Bearer [JWT_TOKEN]"
``` 