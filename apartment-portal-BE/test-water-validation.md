# Test Water Meter Validation

## Mô tả
Test logic kiểm tra chỉ số nước trước khi tạo hóa đơn.

## Các test case

### Test Case 1: Tạo hóa đơn khi có căn hộ chưa ghi chỉ số nước
1. Đảm bảo có ít nhất 1 căn hộ chưa có chỉ số nước cho tháng hiện tại
2. Gọi API tạo hóa đơn cho tháng hiện tại
3. **Kết quả mong đợi**: API thành công, tạo hóa đơn cho căn hộ có chỉ số nước, bỏ qua căn hộ chưa có

**API Call:**
```bash
POST /api/admin/yearly-billing/generate-monthly-invoices
Content-Type: application/json

{
  "year": 2024,
  "month": 12
}
```

**Response mong đợi:**
```json
{
  "success": true,
  "message": "Đã tạo hóa đơn cho căn hộ đã có chỉ số nước tháng 12/2024",
  "note": "Hóa đơn đã được tạo cho căn hộ có chỉ số nước. Căn hộ chưa có chỉ số nước đã được bỏ qua."
}
```

**Console logs mong đợi:**
```
WARNING: CẢNH BÁO: Có X căn hộ chưa ghi chỉ số nước cho tháng 12/2024. Hệ thống sẽ tạo hóa đơn cho Y căn hộ đã có chỉ số nước. Vui lòng ghi chỉ số nước cho các căn hộ còn lại sau.
DEBUG: Hoàn thành tạo hóa đơn base và thêm các items cho tháng 12/2024 - Đã tạo Y hóa đơn
```

### Test Case 2: Tạo hóa đơn khi bỏ qua kiểm tra chỉ số nước
1. Gọi API tạo hóa đơn với parameter `skipWaterValidation=true`
2. **Kết quả mong đợi**: API thành công bỏ qua kiểm tra chỉ số nước

**API Call:**
```bash
POST /api/admin/yearly-billing/generate-monthly-invoices?skipWaterValidation=true
Content-Type: application/json

{
  "year": 2024,
  "month": 12
}
```

**Response mong đợi:**
```json
{
  "success": true,
  "message": "Đã tạo hóa đơn đồng loạt cho tất cả căn hộ tháng 12/2024"
}
```

### Test Case 3: Tạo hóa đơn khi tất cả căn hộ đã có chỉ số nước
1. Đảm bảo tất cả căn hộ đã có chỉ số nước > 0 cho tháng hiện tại
2. Gọi API tạo hóa đơn cho tháng hiện tại
3. **Kết quả mong đợi**: API thành công tạo hóa đơn

## Cách chuẩn bị test data

### Để test case 1 pass:
- Tạo một số căn hộ với chỉ số nước = 0 hoặc null cho tháng hiện tại

### Để test case 3 pass:
- Đảm bảo tất cả căn hộ có chỉ số nước > 0 cho tháng hiện tại

## Logs cần kiểm tra
- `DEBUG: Kiểm tra chỉ số nước cho tháng X/Y`
- `DEBUG: Đã kiểm tra chỉ số nước - tất cả căn hộ đã có chỉ số > 0`
- `DEBUG: Bỏ qua kiểm tra chỉ số nước theo yêu cầu`
- `ERROR: Không thể tạo hóa đơn cho tháng X/Y...`
