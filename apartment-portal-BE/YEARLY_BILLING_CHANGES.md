# Thay đổi trong hệ thống tạo biểu phí

## Tổng quan thay đổi

Đã chỉnh sửa hệ thống tạo biểu phí để **chỉ tạo cấu hình phí dịch vụ** mà **không tạo hóa đơn**. Khi chọn tạo biểu phí, hệ thống sẽ tạo cấu hình cho từng tháng của năm hiện tại.

## Những thay đổi chính

### 1. YearlyBillingService.java
- **Bỏ hoàn toàn phần tạo hóa đơn** trong các method `generateYearlyInvoices()` và `generateYearlyInvoiceForApartment()`
- **Chỉ tạo cấu hình phí dịch vụ** cho 12 tháng trong năm
- Thêm các method mới:
  - `generateCurrentYearInvoices()`: Tạo biểu phí cho năm hiện tại
  - `generateCurrentYearInvoiceForApartment()`: Tạo biểu phí cho một căn hộ trong năm hiện tại
  - `getFeeConfig()`: Lấy cấu hình phí cho một tháng cụ thể
  - `getYearlyFeeConfig()`: Lấy tất cả cấu hình phí cho một năm

### 2. ServiceFeeConfigRepository.java
- Thêm method `findByYear(Integer year)` để lấy tất cả cấu hình phí cho một năm

### 3. YearlyBillingController.java
- Cập nhật message để phản ánh việc chỉ tạo cấu hình, không tạo hóa đơn
- Thêm endpoint mới:
  - `POST /api/admin/yearly-billing/generate-current-year`: Tạo biểu phí cho năm hiện tại
  - `GET /api/admin/yearly-billing/config/{year}/{month}`: Lấy cấu hình phí cho một tháng
  - `GET /api/admin/yearly-billing/config/{year}`: Lấy tất cả cấu hình phí cho một năm

### 4. YearlyBillingRequest.java
- Thay đổi `year` thành mặc định là năm hiện tại (`LocalDate.now().getYear()`)

## API Endpoints

### Tạo biểu phí cho năm cụ thể
```
POST /api/admin/yearly-billing/generate
{
  "year": 2024,
  "apartmentId": null, // null = tất cả căn hộ
  "serviceFeePerM2": 5000.0,
  "waterFeePerM3": 15000.0,
  "motorcycleFee": 50000.0,
  "car4SeatsFee": 200000.0,
  "car7SeatsFee": 250000.0
}
```

### Tạo biểu phí cho năm hiện tại
```
POST /api/admin/yearly-billing/generate-current-year
{
  "apartmentId": null, // null = tất cả căn hộ
  "serviceFeePerM2": 5000.0,
  "waterFeePerM3": 15000.0,
  "motorcycleFee": 50000.0,
  "car4SeatsFee": 200000.0,
  "car7SeatsFee": 250000.0
}
```

### Lấy cấu hình phí cho một tháng
```
GET /api/admin/yearly-billing/config/2024/1
```

### Lấy tất cả cấu hình phí cho một năm
```
GET /api/admin/yearly-billing/config/2024
```

## Lưu ý quan trọng

1. **Không tạo hóa đơn**: Hệ thống chỉ tạo cấu hình phí dịch vụ, không tạo hóa đơn
2. **Tự động bỏ qua nếu đã tồn tại**: Nếu cấu hình phí cho tháng/năm đã tồn tại, sẽ bỏ qua
3. **Năm mặc định**: Nếu không cung cấp năm, sẽ sử dụng năm hiện tại
4. **Giá mặc định**: Sử dụng giá mặc định nếu không có cấu hình cụ thể

## Cấu trúc dữ liệu

### ServiceFeeConfig
```java
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
}
```

## Response format

### Thành công
```json
{
  "success": true,
  "message": "Đã tạo biểu phí cấu hình năm 2024 cho tất cả căn hộ",
  "year": 2024
}
```

### Lỗi
```json
{
  "success": false,
  "message": "Lỗi khi tạo biểu phí: [chi tiết lỗi]"
}
``` 