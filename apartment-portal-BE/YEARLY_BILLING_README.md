# Hướng dẫn sử dụng - Quản lý Biểu phí và Hóa đơn Hàng năm

## Tổng quan
Hệ thống cung cấp 2 chức năng chính:

### 1. Tạo Biểu phí Cấu hình (Chỉ cấu hình)
- **Mục đích**: Thiết lập giá phí cho 12 tháng của một năm
- **Kết quả**: Tạo 12 bản ghi trong bảng `service_fee_config`
- **Không tạo**: Hóa đơn, chỉ tạo cấu hình để sử dụng sau này

### 2. Tạo Hóa đơn Hàng năm (Cả cấu hình và hóa đơn)
- **Mục đích**: Tạo cả cấu hình phí và hóa đơn cho 12 tháng
- **Kết quả**: Tạo cấu hình phí + 12 hóa đơn cho mỗi căn hộ
- **Tính toán**: Tự động tính phí dịch vụ, nước, xe cộ

## API Endpoints

### 1. Tạo Biểu phí Cấu hình
```bash
POST /api/admin/yearly-billing/fee-config
```

**Request:**
```json
{
  "year": 2024,
  "serviceFeePerM2": 5000.0,
  "waterFeePerM3": 15000.0,
  "parkingFee": 200000.0
}
```

**Kết quả:**
- Tạo 12 bản ghi cấu hình phí (1 cho mỗi tháng)
- Không tạo hóa đơn
- Có thể sử dụng cấu hình này để tạo hóa đơn sau

### 2. Tạo Hóa đơn Hàng năm
```bash
POST /api/admin/yearly-billing/generate
```

**Request:**
```json
{
  "year": 2024,
  "apartmentId": null,  // null = tất cả căn hộ
  "serviceFeePerM2": 5000.0,
  "waterFeePerM3": 15000.0,
  "parkingFee": 200000.0
}
```

**Kết quả:**
- Tạo 12 bản ghi cấu hình phí
- Tạo 12 hóa đơn cho mỗi căn hộ
- Tính toán và thêm các khoản phí vào hóa đơn

## Các file đã tạo/cập nhật

### 1. Service Layer
- `YearlyBillingService.java`: Service chính để tạo biểu phí 1 năm
- `YearlyBillingScheduler.java`: Scheduler tự động tạo biểu phí

### 2. Controller Layer  
- `YearlyBillingController.java`: API endpoints để quản lý biểu phí 1 năm

### 3. DTO Layer
- `YearlyBillingRequest.java`: DTO cho request tạo biểu phí

### 4. Documentation
- `YEARLY_BILLING_API_DOC.md`: Tài liệu API chi tiết
- `YEARLY_BILLING_README.md`: Hướng dẫn sử dụng (file này)

### 5. Test
- `YearlyBillingServiceTest.java`: Unit tests cho service

## Cách sử dụng

### 1. Tạo biểu phí 1 năm cho tất cả căn hộ

```bash
curl -X POST http://localhost:8080/api/admin/yearly-billing/generate \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2024,
    "serviceFeePerM2": 5000.0,
    "waterFeePerM3": 15000.0,
    "parkingFee": 200000.0
  }'
```

### 2. Tạo biểu phí 1 năm cho một căn hộ cụ thể

```bash
curl -X POST http://localhost:8080/api/admin/yearly-billing/generate \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2024,
    "apartmentId": 1,
    "serviceFeePerM2": 5000.0,
    "waterFeePerM3": 15000.0,
    "parkingFee": 200000.0
  }'
```

### 3. Tạo cấu hình phí dịch vụ cho cả năm

```bash
curl -X POST "http://localhost:8080/api/admin/yearly-billing/config/2024?serviceFeePerM2=5000&waterFeePerM3=15000&parkingFee=200000"
```

### 4. Cập nhật cấu hình phí cho một tháng cụ thể

```bash
curl -X PUT "http://localhost:8080/api/admin/yearly-billing/config/2024/6?serviceFeePerM2=5500&waterFeePerM3=16000&parkingFee=220000"
```

## Cách tính phí

### 1. Phí dịch vụ theo m²
```
Phí dịch vụ = Diện tích căn hộ (m²) × Giá dịch vụ/m²
```

**Ví dụ**: Căn hộ 80m² với giá 5,000 VND/m²
```
Phí dịch vụ = 80 × 5,000 = 400,000 VND/tháng
```

### 2. Phí nước theo m³
```
Phí nước = Lượng nước tiêu thụ (m³) × Giá nước/m³
```

**Ví dụ**: Tiêu thụ 10.5m³ với giá 15,000 VND/m³
```
Phí nước = 10.5 × 15,000 = 157,500 VND/tháng
```

### 3. Phí gửi xe
```
Phí gửi xe = Số lượng xe × Giá gửi xe/tháng theo loại xe
```

**Ví dụ**: 1 ô tô + 2 xe máy
```
Phí gửi xe = 1 × 200,000 + 2 × 50,000 = 300,000 VND/tháng
```

## Loại xe và phí gửi xe

| Loại xe | Phí/tháng (VND) |
|---------|------------------|
| Xe máy | 50,000 |
| Ô tô | 200,000 |

**Lưu ý**: Chỉ tính phí cho xe máy và ô tô, các loại xe khác sẽ không được tính phí.

## Scheduler tự động

Hệ thống có 2 scheduler tự động:

### 1. Tạo biểu phí cho năm tiếp theo
- **Thời gian**: 00:00 ngày 1 tháng 12 hàng năm
- **Chức năng**: Tạo biểu phí 1 năm cho năm tiếp theo

### 2. Tạo biểu phí cho năm hiện tại
- **Thời gian**: 00:00 ngày 1 tháng 1 hàng năm  
- **Chức năng**: Tạo biểu phí 1 năm cho năm hiện tại nếu chưa có

## Lưu ý quan trọng

### 1. Dữ liệu cần thiết
- **Diện tích căn hộ**: Cần có thông tin diện tích trong bảng `apartments`
- **Chỉ số nước**: Cần có chỉ số nước trong bảng `water_meter_readings`
- **Xe cộ**: Chỉ tính phí cho xe đã được đăng ký và approved
- **Cư dân**: Cần có thông tin cư dân liên kết với căn hộ

### 2. Kiểm tra trùng lặp
- Hệ thống sẽ kiểm tra và bỏ qua nếu hóa đơn đã tồn tại cho tháng đó
- Điều này tránh tạo hóa đơn trùng lặp

### 3. Cấu hình phí
- Cần tạo cấu hình phí dịch vụ trước khi tạo biểu phí
- Có thể cập nhật cấu hình phí cho từng tháng riêng biệt

### 4. Xử lý lỗi
- Nếu không có chỉ số nước, phí nước sẽ bằng 0
- Nếu không có xe, phí gửi xe sẽ bằng 0
- Nếu không có diện tích căn hộ, phí dịch vụ sẽ bằng 0

## Ví dụ thực tế

### Tạo biểu phí cho căn hộ A1 năm 2024

**Thông tin căn hộ:**
- Diện tích: 85m²
- Cư dân: 2 người
- Xe: 1 ô tô, 1 xe máy
- Tiêu thụ nước trung bình: 12m³/tháng

**Cấu hình phí:**
- Phí dịch vụ: 5,000 VND/m²
- Phí nước: 15,000 VND/m³
- Phí gửi xe ô tô: 200,000 VND/tháng
- Phí gửi xe máy: 50,000 VND/tháng

**Tính toán phí hàng tháng:**
```
Phí dịch vụ = 85 × 5,000 = 425,000 VND
Phí nước = 12 × 15,000 = 180,000 VND  
Phí gửi xe = 200,000 + 50,000 = 250,000 VND
Tổng phí = 425,000 + 180,000 + 250,000 = 855,000 VND/tháng
```

**Tổng phí 1 năm:**
```
Tổng phí năm = 855,000 × 12 = 10,260,000 VND/năm
```

## Troubleshooting

### 1. Lỗi "Invoice not found"
- Kiểm tra xem hóa đơn đã được tạo chưa
- Đảm bảo apartmentId tồn tại trong database

### 2. Lỗi "Service fee config not found"
- Tạo cấu hình phí dịch vụ trước khi tạo biểu phí
- Sử dụng API `/api/admin/yearly-billing/config/{year}`

### 3. Phí nước bằng 0
- Kiểm tra chỉ số nước trong bảng `water_meter_readings`
- Đảm bảo có dữ liệu cho tháng cần tính

### 4. Phí gửi xe bằng 0
- Kiểm tra xe đã được đăng ký chưa
- Đảm bảo xe có trạng thái APPROVED
- Kiểm tra thông tin cư dân liên kết với căn hộ

## Liên hệ hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra logs trong console
2. Xem tài liệu API chi tiết trong `YEARLY_BILLING_API_DOC.md`
3. Chạy unit tests để kiểm tra functionality
4. Liên hệ team development để được hỗ trợ 