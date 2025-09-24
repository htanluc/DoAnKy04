# Test Frontend Water Validation

## Vấn đề đã sửa

Frontend đã được cập nhật để hiển thị thông báo lỗi chi tiết về chỉ số nước từ backend.

### Các thay đổi đã thực hiện:

1. **Cập nhật API Hook (`use-yearly-billing.ts`)**:
   - ✅ Chuyển sang endpoint mới `/api/admin/yearly-billing/generate-monthly-invoices`
   - ✅ Thêm parameter `skipWaterValidation`
   - ✅ Cải thiện xử lý lỗi để hiển thị thông báo chi tiết

2. **Cập nhật Trang Invoices (`page.tsx`)**:
   - ✅ Thêm `billingError` và `billingSuccess` từ hook
   - ✅ Ưu tiên hiển thị `billingError` từ hook
   - ✅ Cập nhật UI để hiển thị cả `genMessage` và `billingError`

3. **Cập nhật Component Form (`MonthlyInvoiceForm.tsx`)**:
   - ✅ Thêm checkbox "Bỏ qua kiểm tra chỉ số nước"
   - ✅ Thêm cảnh báo khi bỏ qua kiểm tra

## Cách test

### Test Case 1: Hiển thị lỗi chỉ số nước
1. Truy cập: `http://localhost:3000/admin-dashboard/invoices`
2. Chọn tháng/năm có căn hộ chưa ghi chỉ số nước
3. Nhấn "Tạo hóa đơn tháng X/YYYY"
4. **Kết quả mong đợi**: Hiển thị thông báo thành công:
   ```
   ✅ Đã tạo hóa đơn cho căn hộ đã có chỉ số nước tháng 10/2025
   
   Ghi chú: Hóa đơn đã được tạo cho căn hộ có chỉ số nước. Căn hộ chưa có chỉ số nước đã được bỏ qua.
   ```

### Test Case 2: Bỏ qua kiểm tra chỉ số nước
1. Sử dụng component `MonthlyInvoiceForm` (nếu có)
2. Tick checkbox "Bỏ qua kiểm tra chỉ số nước"
3. Nhấn "Tạo hóa đơn"
4. **Kết quả mong đợi**: Tạo hóa đơn thành công mà không kiểm tra chỉ số nước

## Lưu ý quan trọng

- Backend đã hoạt động đúng và báo lỗi chi tiết trong console
- Frontend bây giờ sẽ hiển thị thông báo lỗi chi tiết từ backend
- Thông báo lỗi sẽ hiển thị trong phần "Tạo hóa đơn theo tháng" với màu đỏ
- Người dùng có thể thấy chính xác có bao nhiêu căn hộ cần ghi chỉ số nước

## Debug nếu vẫn không hoạt động

1. Kiểm tra Network tab trong DevTools để xem API response
2. Kiểm tra Console để xem có lỗi JavaScript không
3. Kiểm tra xem `billingError` có được set đúng không
4. Kiểm tra xem UI có hiển thị `billingError` không
