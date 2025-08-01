# API Tài liệu - Quản lý Biểu phí và Hóa đơn Hàng năm

## Tổng quan
Hệ thống cung cấp 2 loại API chính:
1. **Tạo biểu phí cấu hình** - Chỉ tạo cấu hình phí cho 12 tháng
2. **Tạo hóa đơn hàng năm** - Tạo cả cấu hình phí và hóa đơn cho 12 tháng

## 1. Tạo Biểu phí Cấu hình (Chỉ cấu hình, không tạo hóa đơn)

### POST /api/admin/yearly-billing/fee-config
Tạo biểu phí cấu hình cho 12 tháng của một năm cụ thể.

**Request Body:**
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

**Response:**
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

**Chức năng:**
- Tạo 12 bản ghi trong bảng `service_fee_config` (1 cho mỗi tháng)
- Không tạo hóa đơn
- Chỉ thiết lập cấu hình phí để sử dụng sau này

## 2. Tạo Hóa đơn Hàng năm (Cả cấu hình và hóa đơn)

### POST /api/admin/yearly-billing/generate
Tạo biểu phí cấu hình VÀ hóa đơn cho 12 tháng của một năm.

**Request Body:**
```json
{
  "year": 2024,
  "apartmentId": null,  // null = tất cả căn hộ, hoặc ID cụ thể
  "serviceFeePerM2": 5000.0,
  "waterFeePerM3": 15000.0,
  "motorcycleFee": 50000.0,
  "car4SeatsFee": 200000.0,
  "car7SeatsFee": 250000.0
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đã tạo hóa đơn hàng năm cho tất cả căn hộ",
  "year": 2024,
  "totalApartments": 50,
  "totalInvoices": 600
}
```

**Chức năng:**
- Tạo 12 bản ghi cấu hình phí
- Tạo 12 hóa đơn cho mỗi căn hộ (hoặc căn hộ cụ thể)
- Tính toán và thêm các khoản phí vào hóa đơn

## 3. Cập nhật Cấu hình Phí

### PUT /api/admin/yearly-billing/config/{year}/{month}
Cập nhật cấu hình phí cho một tháng cụ thể.

**Path Parameters:**
- `year`: Năm (ví dụ: 2024)
- `month`: Tháng (1-12)

**Query Parameters:**
- `serviceFeePerM2`: Giá dịch vụ/m² (VND)
- `waterFeePerM3`: Giá nước/m³ (VND)
- `motorcycleFee`: Phí gửi xe máy/tháng (VND)
- `car4SeatsFee`: Phí gửi ô tô 4 chỗ/tháng (VND)
- `car7SeatsFee`: Phí gửi ô tô 7 chỗ/tháng (VND)

**Example Request:**
```bash
PUT /api/admin/yearly-billing/config/2024/6?serviceFeePerM2=5500&waterFeePerM3=16000&motorcycleFee=55000&car4SeatsFee=220000&car7SeatsFee=270000
```

**Response:**
```json
{
  "success": true,
  "message": "Đã cập nhật cấu hình phí tháng 6/2024",
  "year": 2024,
  "month": 6,
  "serviceFeePerM2": 5500.0,
  "waterFeePerM3": 16000.0,
  "motorcycleFee": 55000.0,
  "car4SeatsFee": 220000.0,
  "car7SeatsFee": 270000.0
}
```

## Cách tính phí

### 1. Phí dịch vụ theo m²
- **Công thức**: `Diện tích căn hộ × Giá dịch vụ/m²`
- **Ví dụ**: Căn hộ 80m² × 5,000 VND/m² = 400,000 VND/tháng

### 2. Phí nước theo m³
- **Công thức**: `Lượng nước tiêu thụ × Giá nước/m³`
- **Ví dụ**: 10m³ × 15,000 VND/m³ = 150,000 VND/tháng

### 3. Phí gửi xe
**Chỉ tính phí cho các loại xe sau:**
- **Xe máy**: 50,000 VND/tháng
- **Ô tô 4 chỗ**: 200,000 VND/tháng  
- **Ô tô 7 chỗ**: 250,000 VND/tháng

**Không tính phí cho:**
- Xe đạp, xe đạp điện
- Xe máy điện, ô tô điện
- Xe tải, xe van

## Loại xe và phí gửi xe

| Loại xe | Phí/tháng (VND) |
|---------|------------------|
| Xe máy | 50,000 |
| Ô tô 4 chỗ | 200,000 |
| Ô tô 7 chỗ | 250,000 |

**Lưu ý**: Chỉ tính phí cho xe máy và ô tô, các loại xe khác sẽ không được tính phí.

## Scheduler tự động

Hệ thống có 2 scheduler tự động:

### 1. Tạo biểu phí cho năm tiếp theo
- **Thời gian**: 00:00 ngày 1 tháng 12 hàng năm
- **Chức năng**: Tạo biểu phí 1 năm cho năm tiếp theo

### 2. Tạo biểu phí cho năm hiện tại
- **Thời gian**: 00:00 ngày 1 tháng 1 hàng năm
- **Chức năng**: Tạo biểu phí 1 năm cho năm hiện tại nếu chưa có

## Ví dụ sử dụng

### Tạo biểu phí cấu hình cho năm 2024
```bash
curl -X POST http://localhost:8080/api/admin/yearly-billing/fee-config \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2024,
    "serviceFeePerM2": 5000.0,
    "waterFeePerM3": 15000.0,
    "motorcycleFee": 50000.0,
    "car4SeatsFee": 200000.0,
    "car7SeatsFee": 250000.0
  }'
```

### Tạo hóa đơn cho tất cả căn hộ năm 2024
```bash
curl -X POST http://localhost:8080/api/admin/yearly-billing/generate \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2024,
    "serviceFeePerM2": 5000.0,
    "waterFeePerM3": 15000.0,
    "motorcycleFee": 50000.0,
    "car4SeatsFee": 200000.0,
    "car7SeatsFee": 250000.0
  }'
```

### Tạo hóa đơn cho căn hộ cụ thể
```bash
curl -X POST http://localhost:8080/api/admin/yearly-billing/generate \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2024,
    "apartmentId": 1,
    "serviceFeePerM2": 5000.0,
    "waterFeePerM3": 15000.0,
    "motorcycleFee": 50000.0,
    "car4SeatsFee": 200000.0,
    "car7SeatsFee": 250000.0
  }'
```

### Cập nhật cấu hình phí tháng 6/2024
```bash
curl -X PUT "http://localhost:8080/api/admin/yearly-billing/config/2024/6?serviceFeePerM2=5500&waterFeePerM3=16000&motorcycleFee=55000&car4SeatsFee=220000&car7SeatsFee=270000"
```

## Lưu ý

1. **Kiểm tra trùng lặp**: Hệ thống sẽ kiểm tra và bỏ qua nếu hóa đơn đã tồn tại cho tháng đó
2. **Cấu hình phí**: Cần tạo cấu hình phí dịch vụ trước khi tạo biểu phí
3. **Chỉ số nước**: Cần có chỉ số nước để tính phí nước chính xác
4. **Xe cộ**: Chỉ tính phí cho xe đã được đăng ký và approved
5. **Diện tích căn hộ**: Cần có thông tin diện tích căn hộ để tính phí dịch vụ 