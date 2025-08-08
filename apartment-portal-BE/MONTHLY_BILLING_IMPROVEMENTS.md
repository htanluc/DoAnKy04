# Cải Tiến Tạo Hóa Đơn Đồng Loạt Theo Tháng

## Tổng Quan

Đã cập nhật hệ thống tạo hóa đơn đồng loạt để đảm bảo tính chính xác của tổng tiền hóa đơn bằng cách tính tổng từ các item hóa đơn thay vì tính trước.

## Các Cải Tiến Chính

### 1. Tính Toán Tổng Tiền Chính Xác

**Trước đây:**
- Tính tổng tiền trước khi tạo hóa đơn
- Có thể dẫn đến sai lệch do floating point hoặc logic tính toán

**Bây giờ:**
- Tạo hóa đơn với `totalAmount = 0`
- Thêm từng item hóa đơn (phí dịch vụ, phí gửi xe, phí nước)
- Tính tổng tiền bằng cách tổng các `amount` của tất cả items
- Cập nhật `totalAmount` của hóa đơn

### 2. Phương Thức Mới

#### `generateMonthlyInvoicesForAllApartments(int year, int month)`
- Tạo hóa đơn đồng loạt cho tất cả căn hộ trong một tháng
- Cải thiện logging và error handling
- Thống kê số lượng hóa đơn thành công/bỏ qua/lỗi

#### `recalculateInvoiceTotal(Invoice invoice)`
- Tính lại tổng tiền hóa đơn từ các items
- Hữu ích cho việc sửa lỗi hoặc kiểm tra

#### `updateInvoiceTotalFromItems(Long invoiceId)`
- Cập nhật tổng tiền cho một hóa đơn cụ thể

#### `updateAllInvoiceTotalsForPeriod(String billingPeriod)`
- Cập nhật tổng tiền cho tất cả hóa đơn trong một kỳ thanh toán

#### `validateAndFixInvoiceTotals(int year, int month)`
- Kiểm tra và sửa lỗi tổng tiền hóa đơn cho một tháng
- So sánh tổng tiền lưu trữ với tổng tiền tính từ items

### 3. API Endpoints Mới

#### POST `/api/admin/yearly-billing/generate-monthly-invoices`
```json
{
  "year": 2024,
  "month": 12,
  "serviceFeePerM2": 5000.0,
  "waterFeePerM3": 15000.0,
  "motorcycleFee": 50000.0,
  "car4SeatsFee": 200000.0,
  "car7SeatsFee": 250000.0
}
```

#### POST `/api/admin/yearly-billing/validate-fix-totals`
```json
{
  "year": 2024,
  "month": 12
}
```

#### POST `/api/admin/yearly-billing/update-invoice-totals`
```json
{
  "billingPeriod": "2024-12"
}
```

### 4. Cải Tiến Repository

Thêm phương thức `findByBillingPeriod(String billingPeriod)` vào `InvoiceRepository` để hỗ trợ các chức năng mới.

### 5. Cải Tiến DTO

Thêm trường `month` vào `YearlyBillingRequest` để hỗ trợ tạo hóa đơn theo tháng.

## Cách Sử Dụng

### 1. Tạo Hóa Đơn Đồng Loạt Cho Tháng

```bash
curl -X POST "http://localhost:8080/api/admin/yearly-billing/generate-monthly-invoices" \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2024,
    "month": 12,
    "serviceFeePerM2": 5000.0,
    "waterFeePerM3": 15000.0,
    "motorcycleFee": 50000.0,
    "car4SeatsFee": 200000.0,
    "car7SeatsFee": 250000.0
  }'
```

### 2. Kiểm Tra Và Sửa Lỗi Tổng Tiền

```bash
curl -X POST "http://localhost:8080/api/admin/yearly-billing/validate-fix-totals" \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2024,
    "month": 12
  }'
```

### 3. Cập Nhật Tổng Tiền Cho Kỳ Thanh Toán

```bash
curl -X POST "http://localhost:8080/api/admin/yearly-billing/update-invoice-totals" \
  -H "Content-Type: application/json" \
  -d '{
    "billingPeriod": "2024-12"
  }'
```

## Lợi Ích

1. **Tính Chính Xác**: Tổng tiền hóa đơn luôn chính xác vì được tính từ các items
2. **Dễ Kiểm Tra**: Có thể dễ dàng kiểm tra và sửa lỗi tổng tiền
3. **Linh Hoạt**: Có thể thêm/bớt items mà không ảnh hưởng đến logic tính tổng
4. **Transparency**: Rõ ràng về cách tính tổng tiền từ các khoản phí
5. **Error Handling**: Xử lý lỗi tốt hơn với thống kê chi tiết

## File Test

Sử dụng file `test-monthly-billing-improved.bat` để test các chức năng mới.

## Lưu Ý

- Đảm bảo database có đủ dữ liệu căn hộ và cấu hình phí trước khi test
- Các hóa đơn đã tồn tại sẽ được bỏ qua để tránh duplicate
- Cache được sử dụng để tối ưu hiệu suất truy vấn cấu hình phí 