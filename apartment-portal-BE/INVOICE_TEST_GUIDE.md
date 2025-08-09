# HƯỚNG DẪN TEST TẠO HÓA ĐƠN THÁNG VÀ CHI TIẾT

## Tổng quan

Bộ test này được tạo để kiểm tra việc tạo hóa đơn tháng và có các chi tiết hóa đơn (InvoiceItem) được tạo đúng cách.

## Các file test đã tạo

### 1. `InvoiceGenerationTest.java` - Unit Test với Mock
- **Vị trí**: `src/test/java/com/mytech/apartment/portal/services/InvoiceGenerationTest.java`
- **Mục đích**: Test các service riêng lẻ với mock data
- **Các test case**:
  - `testGenerateInvoicesForMonth()`: Test tạo hóa đơn cho tháng
  - `testGenerateInvoiceForSpecificApartment()`: Test tạo hóa đơn cho căn hộ cụ thể
  - `testInvoiceItemCreation()`: Test tạo InvoiceItem
  - `testMonthlyFeeServiceInjection()`: Test injection các MonthlyFeeService

### 2. `SimpleInvoiceTest.java` - Integration Test đơn giản
- **Vị trí**: `src/test/java/com/mytech/apartment/portal/apis/SimpleInvoiceTest.java`
- **Mục đích**: Test toàn bộ quá trình tạo hóa đơn với database thực
- **Test case chính**: `testGenerateInvoiceWithDetails()`

### 3. `InvoiceControllerIntegrationTest.java` - Integration Test đầy đủ
- **Vị trí**: `src/test/java/com/mytech/apartment/portal/apis/InvoiceControllerIntegrationTest.java`
- **Mục đích**: Test các API endpoint với MockMvc
- **Các test case**:
  - `testGenerateInvoicesForMonth()`: Test API tạo hóa đơn cho tháng
  - `testGenerateInvoiceForSpecificApartment()`: Test API tạo hóa đơn cho căn hộ cụ thể
  - `testRecalculateFeesForMonth()`: Test API tính lại phí
  - `testTestFeeGeneration()`: Test API kiểm tra hệ thống

## Cách chạy test

### 1. Chạy test đơn giản (khuyến nghị)
```bash
# Chạy test đơn giản
mvn test -Dtest=SimpleInvoiceTest#testGenerateInvoiceWithDetails
```

### 2. Chạy tất cả test
```bash
# Chạy tất cả test
mvn test
```

### 3. Chạy bằng script (Windows)
```bash
# Chạy script test
run-invoice-test.bat
```

## Cách kiểm tra kết quả

### 1. Kiểm tra log output
Test sẽ in ra thông tin chi tiết:
```
=== CHI TIẾT HÓA ĐƠN ===
Hóa đơn ID: 1
Căn hộ ID: 1
Kỳ thanh toán: 2024-01
Tổng tiền: 557500.0
Số lượng items: 2
- SERVICE_FEE: 400000.0 VND
  Mô tả: Phí dịch vụ tháng 2024-01 (80.0 m² x 5000 VND/m²)
- WATER_FEE: 157500.0 VND
  Mô tả: Phí nước tháng 2024-01 (10.5 m³ x 15000 VND/m³)
```

### 2. Kiểm tra database
Sau khi chạy test, kiểm tra các bảng:
- `invoices`: Hóa đơn được tạo
- `invoice_items`: Chi tiết hóa đơn được tạo
- `service_fee_config`: Cấu hình phí dịch vụ
- `water_meter_readings`: Chỉ số nước

## Các loại phí được test

### 1. Phí dịch vụ (SERVICE_FEE)
- **Công thức**: Diện tích căn hộ × Giá dịch vụ/m²
- **Ví dụ**: 80m² × 5000 VND/m² = 400,000 VND

### 2. Phí nước (WATER_FEE)
- **Công thức**: Tiêu thụ nước × Giá nước/m³
- **Ví dụ**: 10.5m³ × 15000 VND/m³ = 157,500 VND

### 3. Phí gửi xe (VEHICLE_FEE)
- **Công thức**: Tổng phí các loại xe
- **Ví dụ**: Xe máy (50,000) + Ô tô 4 chỗ (200,000) = 250,000 VND

## Troubleshooting

### 1. Lỗi "KHÔNG CÓ MonthlyFeeService nào được inject"
- **Nguyên nhân**: Các service không được inject đúng cách
- **Giải pháp**: Kiểm tra annotation `@Service` trên các MonthlyFeeService

### 2. Lỗi "Invoice not found"
- **Nguyên nhân**: Hóa đơn chưa được tạo trước khi thêm item
- **Giải pháp**: Đảm bảo gọi `invoiceService.generateInvoicesForMonth()` trước

### 3. Lỗi "ServiceFeeConfig not found"
- **Nguyên nhân**: Chưa có cấu hình phí dịch vụ cho tháng
- **Giải pháp**: Tạo ServiceFeeConfig trước khi chạy test

### 4. Lỗi "Apartment not found"
- **Nguyên nhân**: Chưa có dữ liệu căn hộ
- **Giải pháp**: Đảm bảo có dữ liệu căn hộ với diện tích > 0

## Cấu trúc dữ liệu test

### 1. Căn hộ test
```java
Apartment apartment = Apartment.builder()
    .buildingId(1L)
    .floorNumber(1)
    .unitNumber("A1-01")
    .area(80.0)  // Diện tích 80m²
    .status(ApartmentStatus.OCCUPIED)
    .build();
```

### 2. Chỉ số nước test
```java
WaterMeterReading waterReading = new WaterMeterReading();
waterReading.setApartmentId(apartmentId);
waterReading.setReadingMonth("2024-01");
waterReading.setPreviousReading(BigDecimal.valueOf(100.0));
waterReading.setCurrentReading(BigDecimal.valueOf(110.5));
waterReading.setConsumption(BigDecimal.valueOf(10.5));  // Tiêu thụ 10.5m³
```

### 3. Cấu hình phí dịch vụ test
```java
ServiceFeeConfig config = ServiceFeeConfig.builder()
    .month(1)
    .year(2024)
    .serviceFeePerM2(5000.0)    // 5000 VND/m²
    .waterFeePerM3(15000.0)     // 15000 VND/m³
    .motorcycleFee(50000.0)      // 50000 VND/tháng
    .car4SeatsFee(200000.0)     // 200000 VND/tháng
    .car7SeatsFee(250000.0)     // 250000 VND/tháng
    .build();
```

## Kết quả mong đợi

Sau khi chạy test thành công, bạn sẽ thấy:

1. **Hóa đơn được tạo** với `totalAmount > 0.01`
2. **Chi tiết hóa đơn được tạo** với ít nhất 2 items:
   - SERVICE_FEE: Phí dịch vụ
   - WATER_FEE: Phí nước
3. **Tổng tiền được tính đúng** dựa trên các khoản phí
4. **Log output chi tiết** hiển thị thông tin hóa đơn

## Lưu ý quan trọng

1. **Database**: Test sử dụng database test riêng biệt
2. **Transaction**: Test được wrap trong transaction để rollback sau khi hoàn thành
3. **Dữ liệu**: Test tự động tạo dữ liệu test cần thiết
4. **Cleanup**: Dữ liệu test sẽ được xóa sau khi test hoàn thành 