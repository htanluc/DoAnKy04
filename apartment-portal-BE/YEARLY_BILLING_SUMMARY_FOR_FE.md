# Tóm tắt API - Quản lý Biểu phí và Hóa đơn Hàng năm

## Tổng quan
Hệ thống cung cấp 2 API chính:

### 1. Tạo Biểu phí Cấu hình (Chỉ cấu hình)
**Endpoint:** `POST /api/admin/yearly-billing/fee-config`

**Chức năng:** Tạo cấu hình phí cho 12 tháng, không tạo hóa đơn

**Request:**
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

### 2. Tạo Hóa đơn Hàng năm (Cả cấu hình và hóa đơn)
**Endpoint:** `POST /api/admin/yearly-billing/generate`

**Chức năng:** Tạo cấu hình phí VÀ hóa đơn cho 12 tháng

**Request:**
```json
{
  "year": 2024,
  "apartmentId": null,  // null = tất cả căn hộ
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

### 3. Cập nhật Cấu hình Phí
**Endpoint:** `PUT /api/admin/yearly-billing/config/{year}/{month}`

**Chức năng:** Cập nhật cấu hình phí cho một tháng cụ thể

**Example:**
```bash
PUT /api/admin/yearly-billing/config/2024/6?serviceFeePerM2=5500&waterFeePerM3=16000&motorcycleFee=55000&car4SeatsFee=220000&car7SeatsFee=270000
```

## Lưu ý quan trọng
- **Chỉ tính phí xe máy và ô tô**: 
  - Xe máy: 50,000 VND/tháng
  - Ô tô 4 chỗ: 200,000 VND/tháng
  - Ô tô 7 chỗ: 250,000 VND/tháng
- **Không tính phí**: Xe đạp, xe tải, xe van, xe điện
- **Cần có dữ liệu**: Diện tích căn hộ, chỉ số nước, thông tin xe cộ
- **Tự động tính toán**: Phí dịch vụ theo m², phí nước theo m³, phí gửi xe

## Các loại phí
1. **Phí dịch vụ**: Tính theo diện tích căn hộ × giá/m²
2. **Phí nước**: Tính theo lượng nước tiêu thụ × giá/m³
3. **Phí gửi xe**: Tính theo loại xe và số lượng xe

## Tính năng đã hoàn thành
- ✅ Tạo biểu phí cấu hình cho 12 tháng
- ✅ Tạo hóa đơn hàng năm cho tất cả căn hộ
- ✅ Cập nhật cấu hình phí theo tháng
- ✅ Tính phí riêng cho từng loại xe
- ✅ Scheduler tự động tạo biểu phí
- ✅ Có đầy đủ documentation và test

FE có thể bắt đầu tích hợp ngay! 🚀 