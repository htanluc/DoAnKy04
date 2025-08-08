# Hướng dẫn sử dụng API tạo hóa đơn

## ⚠️ QUAN TRỌNG: Phân biệt API tạo hóa đơn

### 🔴 API TẠO HÓA ĐƠN CHO CẢ NĂM (12 THÁNG) - ĐÃ BỊ XÓA
```
POST /api/admin/yearly-billing/generate-once
POST /api/admin/yearly-billing/generate
```
**Lý do**: Các API này đã bị xóa để tránh tạo hóa đơn cho tất cả các tháng cùng lúc

### ✅ API TẠO BIỂU PHÍ CẤU HÌNH CHO CẢ NĂM (CHỈ TẠO CẤU HÌNH, KHÔNG TẠO HÓA ĐƠN)
```
POST /api/admin/yearly-billing/fee-config
POST /api/admin/yearly-billing/generate-current-year
```
**Lưu ý**: Các API này chỉ tạo cấu hình phí cho 12 tháng, không tạo hóa đơn

### ✅ API TẠO HÓA ĐƠN CHO MỘT THÁNG CỤ THỂ - NÊN DÙNG

#### 1. Tạo hóa đơn cho một căn hộ cụ thể
```
POST /api/admin/invoices/generate?apartmentId={id}&billingPeriod={yyyy-MM}
```
**Ví dụ**: `POST /api/admin/invoices/generate?apartmentId=55&billingPeriod=2024-01`

#### 2. Tạo hóa đơn cho tất cả căn hộ trong một tháng (API MỚI)
```
POST /api/admin/invoices/generate-month?year={year}&month={month}
```
**Ví dụ**: `POST /api/admin/invoices/generate-month?year=2024&month=1`

**Lưu ý**: API này chỉ tạo hóa đơn cho tháng được chỉ định, không ảnh hưởng đến các tháng khác.

#### 3. Tạo hóa đơn cho tất cả căn hộ trong một tháng (cách khác)
```
POST /api/admin/yearly-billing/generate-month/{year}/{month}
```
**Ví dụ**: `POST /api/admin/yearly-billing/generate-month/2024/1`

## Các API khác

### Tạo biểu phí cấu hình cho cả năm (chỉ tạo cấu hình)
```
POST /api/admin/yearly-billing/fee-config
POST /api/admin/yearly-billing/generate-current-year
```

### Tính lại phí cho một tháng
```
POST /api/admin/invoices/recalculate-fees?billingPeriod={yyyy-MM}
```

### Xem thống kê hóa đơn
```
GET /api/admin/yearly-billing/invoice-stats/{year}
```

### Xem hóa đơn theo căn hộ
```
GET /api/admin/invoices/by-apartments?aptIds={id1,id2,...}
```

### Xem chi tiết phí của hóa đơn
```
GET /api/admin/invoices/{invoiceId}/items
```

## Test Files

### 1. Test tạo hóa đơn cho một tháng
```
test-monthly-invoice-generation.bat
```

### 2. Test tạo hóa đơn cho một căn hộ cụ thể
```
test-invoice-single-apartment.bat
```

### 3. Test tạo hóa đơn cho tháng chỉ định (API MỚI)
```
test-generate-month-invoice.bat
```

### 4. Test tạo hóa đơn với chi tiết phí (invoice_items)
```
test-invoice-with-items.bat
```

## Lưu ý quan trọng

1. **ĐÃ XÓA** các API tạo hóa đơn cho cả năm để tránh tạo hóa đơn cho tất cả các tháng cùng lúc
2. **SỬ DỤNG** `/api/admin/invoices/generate-month?year={year}&month={month}` để tạo hóa đơn cho một tháng cụ thể (API MỚI)
3. **SỬ DỤNG** `/api/admin/yearly-billing/generate-month/{year}/{month}` để tạo hóa đơn cho một tháng cụ thể
4. **API MỚI** `/api/admin/invoices/generate-month` có validation chặt chẽ và chỉ tạo hóa đơn cho tháng được chỉ định

## Ví dụ sử dụng

### Tạo hóa đơn cho tháng 1/2024 cho tất cả căn hộ (API MỚI):
```bash
curl -X POST "http://localhost:8080/api/admin/invoices/generate-month?year=2024&month=1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Tạo hóa đơn cho tháng 1/2024 cho tất cả căn hộ (cách khác):
```bash
curl -X POST "http://localhost:8080/api/admin/yearly-billing/generate-month/2024/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d "{\"serviceFeePerM2\": 5000.0, \"waterFeePerM3\": 15000.0, \"motorcycleFee\": 50000.0, \"car4SeatsFee\": 200000.0, \"car7SeatsFee\": 250000.0}"
```

### Tạo biểu phí cấu hình cho năm 2024:
```bash
curl -X POST "http://localhost:8080/api/admin/yearly-billing/fee-config" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d "{\"year\": 2024, \"serviceFeePerM2\": 5000.0, \"waterFeePerM3\": 15000.0, \"motorcycleFee\": 50000.0, \"car4SeatsFee\": 200000.0, \"car7SeatsFee\": 250000.0}"
```

### Tạo hóa đơn cho căn hộ 55 tháng 1/2024:
```bash
curl -X POST "http://localhost:8080/api/admin/invoices/generate?apartmentId=55&billingPeriod=2024-01" \
  -H "Authorization: Bearer YOUR_TOKEN"
``` 