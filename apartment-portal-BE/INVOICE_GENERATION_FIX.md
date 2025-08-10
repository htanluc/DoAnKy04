# Sửa lỗi tạo hóa đơn cho căn hộ cụ thể

## Vấn đề
Khi sử dụng API `/api/admin/invoices/generate` để tạo hóa đơn cho một căn hộ cụ thể, hệ thống vẫn tạo hóa đơn cho **tất cả căn hộ** trong tháng đó thay vì chỉ căn hộ được chỉ định.

## Nguyên nhân
Các `MonthlyFeeService` (ServiceFeeMonthlyFeeService, WaterMeterMonthlyFeeService, VehicleMonthlyFeeService) đều có method `generateFeeForMonth(String billingPeriod)` chỉ nhận tham số tháng, nên chúng sẽ tạo phí cho tất cả căn hộ trong tháng đó.

## Giải pháp

### 1. Thêm method overload trong MonthlyFeeService interface
```java
void generateFeeForMonth(String billingPeriod, Long apartmentId);
```

### 2. Cập nhật các implementation
- **ServiceFeeMonthlyFeeService**: Chỉ tính phí dịch vụ cho căn hộ được chỉ định
- **WaterMeterMonthlyFeeService**: Chỉ tính phí nước cho căn hộ được chỉ định  
- **VehicleMonthlyFeeService**: Chỉ tính phí xe cho căn hộ được chỉ định

### 3. Cập nhật InvoiceController
API `/api/admin/invoices/generate` giờ sẽ gọi:
```java
svc.generateFeeForMonth(billingPeriod, apartmentId);
```
thay vì:
```java
svc.generateFeeForMonth(billingPeriod);
```

## Các API hiện có

### 1. Tạo hóa đơn cho một căn hộ cụ thể
```
POST /api/admin/invoices/generate?apartmentId={id}&billingPeriod={yyyy-MM}
```
- Chỉ tạo hóa đơn cho căn hộ được chỉ định
- Tính tất cả loại phí (dịch vụ, nước, xe) cho căn hộ đó

### 2. Tạo hóa đơn cho tất cả căn hộ
```
POST /api/admin/invoices/generate-all?billingPeriod={yyyy-MM}
```
- Tạo hóa đơn cho tất cả căn hộ trong tháng
- Tính tất cả loại phí cho tất cả căn hộ

### 3. Tính lại phí cho một tháng
```
POST /api/admin/invoices/recalculate-fees?billingPeriod={yyyy-MM}
```
- Chỉ tính lại phí, không tạo hóa đơn mới
- Áp dụng cho tất cả căn hộ có hóa đơn trong tháng

## Test
Sử dụng file `test-invoice-single-apartment.bat` để kiểm tra:
1. Tạo hóa đơn cho căn hộ 55
2. Kiểm tra chỉ căn hộ 55 có hóa đơn
3. Tạo hóa đơn cho căn hộ 57
4. Kiểm tra cả hai căn hộ đều có hóa đơn riêng biệt

## Kết quả
- ✅ API `/api/admin/invoices/generate` giờ chỉ tạo hóa đơn cho căn hộ được chỉ định
- ✅ Không ảnh hưởng đến các căn hộ khác
- ✅ Tất cả loại phí được tính đúng cho căn hộ cụ thể
- ✅ API `/api/admin/invoices/generate-all` vẫn hoạt động bình thường 