# 🚀 HƯỚNG DẪN TẠO HÓA ĐƠN ĐỒNG LOẠT ĐẦY ĐỦ

## 📋 Tổng quan

Logic tạo hóa đơn đồng loạt đã được cải tiến để tạo **lần lượt từng căn hộ** với **đầy đủ các loại phí**:
- ✅ Phí dịch vụ (dựa trên diện tích căn hộ)
- ✅ Phí nước (dựa trên chỉ số đồng hồ nước)
- ✅ Phí gửi xe (dựa trên loại xe của cư dân) - **CHI TIẾT TỪNG LOẠI XE**

## 🔧 Thay đổi chính

### 1. **Sử dụng MonthlyFeeService thay vì tự tính toán**

**Trước:**
```java
// Tự tính toán từng loại phí trong YearlyBillingService
double serviceFee = apartment.get().getArea() * feeConfig.get().getServiceFeePerM2();
double parkingFee = calculateParkingFee(apartmentId, month, year, feeConfig);
double waterFee = calculateWaterFee(apartmentId, month, year, feeConfig);
```

**Sau:**
```java
// Sử dụng các MonthlyFeeService chuyên biệt
feeServices.forEach(svc -> {
    svc.generateFeeForMonth(billingPeriod, apartmentId);
});
```

### 2. **Quy trình tạo hóa đơn mới**

```java
// 1. Tạo hóa đơn cơ bản
Invoice invoice = Invoice.builder()
    .apartmentId(apartmentId)
    .billingPeriod(billingPeriod)
    .status(InvoiceStatus.UNPAID)
    .totalAmount(0.01) // Tránh vi phạm constraint
    .build();
invoiceRepository.save(invoice);

// 2. Chạy các MonthlyFeeService để thêm chi tiết phí
feeServices.forEach(svc -> {
    svc.generateFeeForMonth(billingPeriod, apartmentId);
});

// 3. Cập nhật tổng tiền từ các items
updateInvoiceTotalFromItems(invoice.getId());
```

## 🎯 API Endpoints

### 1. **Tạo hóa đơn đồng loạt đầy đủ**
```
POST /api/admin/yearly-billing/generate-month-complete?year=2024&month=12
```

**Response:**
```json
{
  "success": true,
  "message": "Đã tạo hóa đơn đồng loạt đầy đủ cho tất cả căn hộ tháng 12/2024",
  "year": 2024,
  "month": 12,
  "note": "Hóa đơn đã được tạo với đầy đủ các loại phí: dịch vụ, nước, xe"
}
```

### 2. **Tạo hóa đơn cho một căn hộ cụ thể**
```
POST /api/admin/invoices/generate?apartmentId=1&billingPeriod=2024-12
```

### 3. **Tạo hóa đơn đồng loạt cũ (chỉ phí dịch vụ)**
```
POST /api/admin/yearly-billing/generate-month?year=2024&month=12
```

## 📊 Các loại phí được tính

### 1. **Phí dịch vụ (SERVICE_FEE)**
- **Tính toán:** Diện tích căn hộ × Giá/m²
- **Giá mặc định:** 5000 VND/m²
- **Service:** `ServiceFeeMonthlyFeeService`

### 2. **Phí nước (WATER_FEE)**
- **Tính toán:** Tiêu thụ nước × Giá/m³
- **Dữ liệu:** Từ `WaterMeterReading`
- **Giá mặc định:** 15000 VND/m³
- **Service:** `WaterMeterMonthlyFeeService`

### 3. **Phí gửi xe (VEHICLE_FEE) - CẢI TIẾN MỚI**
- **Tính toán:** Tổng phí xe của tất cả cư dân trong căn hộ
- **Dữ liệu:** Từ `Vehicle` của cư dân
- **Chi tiết từng loại xe:**
  - Xe máy: 50000 VND/tháng
  - Ô tô 4 chỗ: 200000 VND/tháng
  - Ô tô 7 chỗ: 250000 VND/tháng
- **Mô tả chi tiết:** "2 xe máy (100000 VND), 1 ô tô 4 chỗ (200000 VND)"
- **Service:** `VehicleMonthlyFeeService`

## 🔍 Debug và Monitoring

### 1. **Log chi tiết**
```
DEBUG: Bắt đầu tạo hóa đơn cho căn hộ 1 kỳ 2024-12
DEBUG: Đã tạo hóa đơn cơ bản cho căn hộ 1 kỳ 2024-12
DEBUG: Đang chạy ServiceFeeMonthlyFeeService cho căn hộ 1
DEBUG: Hoàn thành ServiceFeeMonthlyFeeService cho căn hộ 1
DEBUG: Đang chạy WaterMeterMonthlyFeeService cho căn hộ 1
DEBUG: Hoàn thành WaterMeterMonthlyFeeService cho căn hộ 1
DEBUG: Đang chạy VehicleMonthlyFeeService cho căn hộ 1
DEBUG: VehicleMonthlyFeeService - Xe Xe máy của cư dân 1 phí 50000 VND
DEBUG: VehicleMonthlyFeeService - Xe Ô tô 4 chỗ của cư dân 1 phí 200000 VND
DEBUG: VehicleMonthlyFeeService - Căn hộ 1 tổng phí xe 250000 VND
DEBUG: VehicleMonthlyFeeService - Chi tiết: 1 xe máy, 1 ô tô 4 chỗ, 0 ô tô 7 chỗ
DEBUG: Hoàn thành VehicleMonthlyFeeService cho căn hộ 1
DEBUG: Hoàn thành tạo hóa đơn cho căn hộ 1 kỳ 2024-12 với tổng tiền 1500000.0 và 3 chi tiết
DEBUG: Chi tiết - SERVICE_FEE: 500000.0 - Phí dịch vụ tháng 2024-12 (100.0 m² x 5000 VND/m²)
DEBUG: Chi tiết - WATER_FEE: 750000.0 - Phí nước tháng 2024-12 (50.0 m³ x 15000 VND/m³)
DEBUG: Chi tiết - VEHICLE_FEE: 250000.0 - Phí gửi xe tháng 2024-12: 1 xe máy (50000 VND), 1 ô tô 4 chỗ (200000 VND)
```

### 2. **Thống kê kết quả**
```
DEBUG: Thống kê - Thành công: 50, Bỏ qua: 0, Lỗi: 0
```

## 🧪 Test Scripts

### 1. **Test tạo hóa đơn đồng loạt đầy đủ**
```bash
# Chạy script test
test-monthly-billing-complete.bat
```

### 2. **Test tính phí gửi xe chi tiết**
```bash
# Chạy script test
test-vehicle-fee-detail.bat
```

### 3. **Test thủ công**
```bash
# Tạo hóa đơn cho tháng 12/2024
curl -X POST "http://localhost:8080/api/admin/yearly-billing/generate-month-complete?year=2024&month=12" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token"

# Kiểm tra kết quả
curl -X GET "http://localhost:8080/api/admin/invoices?billingPeriod=2024-12" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token"
```

## ⚠️ Lưu ý quan trọng

### 1. **Dữ liệu cần thiết**
- ✅ Căn hộ phải có trong database
- ✅ Cấu hình phí (`ServiceFeeConfig`) cho tháng/năm
- ✅ Chỉ số nước (`WaterMeterReading`) cho tháng
- ✅ Thông tin xe (`Vehicle`) của cư dân

### 2. **Xử lý lỗi**
- ✅ Kiểm tra hóa đơn đã tồn tại trước khi tạo
- ✅ Xử lý exception cho từng căn hộ riêng biệt
- ✅ Log chi tiết để debug

### 3. **Performance**
- ✅ Cache cấu hình phí để giảm database queries
- ✅ Tạo hóa đơn lần lượt từng căn hộ
- ✅ Cập nhật tổng tiền sau khi thêm tất cả items

## 🎉 Kết quả mong đợi

Sau khi chạy API tạo hóa đơn đồng loạt, mỗi căn hộ sẽ có:
- ✅ 1 hóa đơn với status `UNPAID`
- ✅ 3 chi tiết phí (dịch vụ, nước, xe)
- ✅ **Phí gửi xe hiển thị chi tiết từng loại xe:**
  - "1 xe máy (50000 VND), 1 ô tô 4 chỗ (200000 VND)"
  - "2 xe máy (100000 VND), 1 ô tô 7 chỗ (250000 VND)"
  - "Không có xe" (nếu không có xe)
- ✅ Tổng tiền được tính chính xác
- ✅ Thông tin chi tiết rõ ràng cho từng khoản phí 