# API Tạo Biểu Phí - Tài liệu đầy đủ

## Tổng quan

Hệ thống tạo biểu phí cho phép admin tạo cấu hình phí dịch vụ cho từng tháng trong năm. **Lưu ý quan trọng**: Hệ thống chỉ tạo cấu hình phí dịch vụ, không tạo hóa đơn.

## Base URL
```
http://localhost:8080/api/admin/yearly-billing
```

## 1. Tạo biểu phí cho năm cụ thể

### Endpoint
```
POST /api/admin/yearly-billing/generate
```

### Mô tả
Tạo cấu hình phí dịch vụ cho tất cả tháng trong năm được chỉ định.

### Request Body
```json
{
  "year": 2024,
  "apartmentId": null,
  "serviceFeePerM2": 5000.0,
  "waterFeePerM3": 15000.0,
  "motorcycleFee": 50000.0,
  "car4SeatsFee": 200000.0,
  "car7SeatsFee": 250000.0
}
```

### Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| year | int | Yes | Current year | Năm cần tạo biểu phí |
| apartmentId | Long | No | null | ID căn hộ (null = tất cả căn hộ) |
| serviceFeePerM2 | double | No | 5000.0 | Phí dịch vụ/m² |
| waterFeePerM3 | double | No | 15000.0 | Phí nước/m³ |
| motorcycleFee | double | No | 50000.0 | Phí gửi xe máy/tháng |
| car4SeatsFee | double | No | 200000.0 | Phí gửi ô tô 4 chỗ/tháng |
| car7SeatsFee | double | No | 250000.0 | Phí gửi ô tô 7 chỗ/tháng |

### Response Success
```json
{
  "success": true,
  "message": "Đã tạo biểu phí cấu hình năm 2024 cho tất cả căn hộ",
  "year": 2024
}
```

### Response Error
```json
{
  "success": false,
  "message": "Lỗi khi tạo biểu phí: [chi tiết lỗi]"
}
```

---

## 2. Tạo biểu phí cho năm hiện tại

### Endpoint
```
POST /api/admin/yearly-billing/generate-current-year
```

### Mô tả
Tạo cấu hình phí dịch vụ cho tất cả tháng trong năm hiện tại.

### Request Body
```json
{
  "apartmentId": null,
  "serviceFeePerM2": 5000.0,
  "waterFeePerM3": 15000.0,
  "motorcycleFee": 50000.0,
  "car4SeatsFee": 200000.0,
  "car7SeatsFee": 250000.0
}
```

### Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| apartmentId | Long | No | null | ID căn hộ (null = tất cả căn hộ) |
| serviceFeePerM2 | double | No | 5000.0 | Phí dịch vụ/m² |
| waterFeePerM3 | double | No | 15000.0 | Phí nước/m³ |
| motorcycleFee | double | No | 50000.0 | Phí gửi xe máy/tháng |
| car4SeatsFee | double | No | 200000.0 | Phí gửi ô tô 4 chỗ/tháng |
| car7SeatsFee | double | No | 250000.0 | Phí gửi ô tô 7 chỗ/tháng |

### Response Success
```json
{
  "success": true,
  "message": "Đã tạo biểu phí cấu hình năm 2024 cho tất cả căn hộ",
  "year": 2024
}
```

### Response Error
```json
{
  "success": false,
  "message": "Lỗi khi tạo biểu phí: [chi tiết lỗi]"
}
```

---

## 3. Tạo cấu hình phí dịch vụ cho năm

### Endpoint
```
POST /api/admin/yearly-billing/fee-config
```

### Mô tả
Chỉ tạo cấu hình phí dịch vụ cho năm, không tạo hóa đơn.

### Request Body
```json
{
  "year": 2024,
  "serviceFeePerM2": 5000.0,
  "waterFeePerM3": 15000.0,
  "motorcycleFee": 50000.0,
  "car4SeatsFee": 200000.0,
  "car7SeatsFee": 250000.0
}
```

### Response Success
```json
{
  "success": true,
  "message": "Đã tạo biểu phí cấu hình cho năm 2024",
  "year": 2024,
  "serviceFeePerM2": 5000.0,
  "waterFeePerM3": 15000.0,
  "motorcycleFee": 50000.0,
  "car4SeatsFee": 200000.0,
  "car7SeatsFee": 250000.0
}
```

---

## 4. Cập nhật cấu hình phí cho một tháng

### Endpoint
```
PUT /api/admin/yearly-billing/config/{year}/{month}
```

### Mô tả
Cập nhật cấu hình phí dịch vụ cho một tháng cụ thể.

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| year | int | Yes | Năm |
| month | int | Yes | Tháng (1-12) |

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| serviceFeePerM2 | double | Yes | Phí dịch vụ/m² |
| waterFeePerM3 | double | Yes | Phí nước/m³ |
| motorcycleFee | double | Yes | Phí gửi xe máy/tháng |
| car4SeatsFee | double | Yes | Phí gửi ô tô 4 chỗ/tháng |
| car7SeatsFee | double | Yes | Phí gửi ô tô 7 chỗ/tháng |

### Example Request
```
PUT /api/admin/yearly-billing/config/2024/1?serviceFeePerM2=6000&waterFeePerM3=16000&motorcycleFee=55000&car4SeatsFee=220000&car7SeatsFee=270000
```

### Response Success
```json
{
  "success": true,
  "message": "Đã cập nhật cấu hình phí tháng 1/2024",
  "year": 2024,
  "month": 1,
  "serviceFeePerM2": 6000.0,
  "waterFeePerM3": 16000.0,
  "motorcycleFee": 55000.0,
  "car4SeatsFee": 220000.0,
  "car7SeatsFee": 270000.0
}
```

---

## 5. Lấy cấu hình phí cho một tháng

### Endpoint
```
GET /api/admin/yearly-billing/config/{year}/{month}
```

### Mô tả
Lấy cấu hình phí dịch vụ cho một tháng cụ thể.

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| year | int | Yes | Năm |
| month | int | Yes | Tháng (1-12) |

### Example Request
```
GET /api/admin/yearly-billing/config/2024/1
```

### Response Success
```json
{
  "success": true,
  "config": {
    "id": 1,
    "month": 1,
    "year": 2024,
    "serviceFeePerM2": 5000.0,
    "waterFeePerM3": 15000.0,
    "motorcycleFee": 50000.0,
    "car4SeatsFee": 200000.0,
    "car7SeatsFee": 250000.0,
    "createdAt": "2024-01-01T00:00:00",
    "updatedAt": "2024-01-01T00:00:00"
  }
}
```

### Response Error (Not Found)
```json
{
  "success": false,
  "message": "Không tìm thấy cấu hình phí tháng 1/2024"
}
```

---

## 6. Lấy tất cả cấu hình phí cho một năm

### Endpoint
```
GET /api/admin/yearly-billing/config/{year}
```

### Mô tả
Lấy tất cả cấu hình phí dịch vụ cho một năm.

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| year | int | Yes | Năm |

### Example Request
```
GET /api/admin/yearly-billing/config/2024
```

### Response Success
```json
{
  "success": true,
  "configs": [
    {
      "id": 1,
      "month": 1,
      "year": 2024,
      "serviceFeePerM2": 5000.0,
      "waterFeePerM3": 15000.0,
      "motorcycleFee": 50000.0,
      "car4SeatsFee": 200000.0,
      "car7SeatsFee": 250000.0,
      "createdAt": "2024-01-01T00:00:00",
      "updatedAt": "2024-01-01T00:00:00"
    },
    {
      "id": 2,
      "month": 2,
      "year": 2024,
      "serviceFeePerM2": 5000.0,
      "waterFeePerM3": 15000.0,
      "motorcycleFee": 50000.0,
      "car4SeatsFee": 200000.0,
      "car7SeatsFee": 250000.0,
      "createdAt": "2024-01-01T00:00:00",
      "updatedAt": "2024-01-01T00:00:00"
    }
  ],
  "year": 2024,
  "count": 2
}
```

---

## Cấu trúc dữ liệu

### ServiceFeeConfig Model
```java
{
  "id": Long,                    // ID tự động tăng
  "month": Integer,              // Tháng (1-12)
  "year": Integer,               // Năm
  "serviceFeePerM2": Double,     // Phí dịch vụ/m²
  "waterFeePerM3": Double,       // Phí nước/m³
  "motorcycleFee": Double,       // Phí gửi xe máy/tháng
  "car4SeatsFee": Double,        // Phí gửi ô tô 4 chỗ/tháng
  "car7SeatsFee": Double,        // Phí gửi ô tô 7 chỗ/tháng
  "createdAt": LocalDateTime,    // Thời gian tạo
  "updatedAt": LocalDateTime     // Thời gian cập nhật
}
```

### YearlyBillingRequest DTO
```java
{
  "year": int,                   // Năm (mặc định: năm hiện tại)
  "apartmentId": Long,           // ID căn hộ (optional)
  "serviceFeePerM2": double,     // Phí dịch vụ/m² (mặc định: 5000.0)
  "waterFeePerM3": double,       // Phí nước/m³ (mặc định: 15000.0)
  "motorcycleFee": double,       // Phí gửi xe máy/tháng (mặc định: 50000.0)
  "car4SeatsFee": double,        // Phí gửi ô tô 4 chỗ/tháng (mặc định: 200000.0)
  "car7SeatsFee": double         // Phí gửi ô tô 7 chỗ/tháng (mặc định: 250000.0)
}
```

---

## Lưu ý quan trọng

### 1. Không tạo hóa đơn
- Hệ thống chỉ tạo cấu hình phí dịch vụ
- Không tạo hóa đơn cho từng căn hộ
- Cấu hình được sử dụng để tính toán phí khi cần

### 2. Tự động bỏ qua nếu đã tồn tại
- Nếu cấu hình phí cho tháng/năm đã tồn tại, sẽ bỏ qua
- Tránh tạo duplicate data

### 3. Năm mặc định
- Nếu không cung cấp năm, sẽ sử dụng năm hiện tại
- `YearlyBillingRequest.year` có giá trị mặc định là `LocalDate.now().getYear()`

### 4. Giá mặc định
- Sử dụng giá mặc định nếu không có cấu hình cụ thể
- Có thể cập nhật giá cho từng tháng riêng biệt

### 5. Validation
- Tháng phải trong khoảng 1-12
- Năm phải hợp lệ
- Các giá phí phải là số dương

---

## Error Codes

| HTTP Status | Error Message | Description |
|-------------|---------------|-------------|
| 400 | "Lỗi khi tạo biểu phí: [chi tiết]" | Lỗi validation hoặc business logic |
| 404 | "Không tìm thấy cấu hình phí tháng X/Y" | Cấu hình không tồn tại |
| 500 | "Internal Server Error" | Lỗi hệ thống |

---

## Ví dụ sử dụng

### 1. Tạo biểu phí cho năm hiện tại
```bash
curl -X POST http://localhost:8080/api/admin/yearly-billing/generate-current-year \
  -H "Content-Type: application/json" \
  -d '{
    "serviceFeePerM2": 5500.0,
    "waterFeePerM3": 16000.0,
    "motorcycleFee": 55000.0,
    "car4SeatsFee": 220000.0,
    "car7SeatsFee": 270000.0
  }'
```

### 2. Cập nhật phí tháng 1/2024
```bash
curl -X PUT "http://localhost:8080/api/admin/yearly-billing/config/2024/1?serviceFeePerM2=6000&waterFeePerM3=17000&motorcycleFee=60000&car4SeatsFee=230000&car7SeatsFee=280000"
```

### 3. Lấy cấu hình tháng 1/2024
```bash
curl -X GET http://localhost:8080/api/admin/yearly-billing/config/2024/1
```

### 4. Lấy tất cả cấu hình năm 2024
```bash
curl -X GET http://localhost:8080/api/admin/yearly-billing/config/2024
``` 