# 📋 Hướng dẫn tạo hóa đơn hàng loạt

## ✅ Vấn đề đã được giải quyết

**Vấn đề ban đầu:** Khi tạo hóa đơn cho một tháng cụ thể, hệ thống lại tạo hóa đơn cho cả năm.

**Nguyên nhân:** Backend schedulers tự động chạy và tạo hóa đơn cho cả 12 tháng.

**Giải pháp đã áp dụng:** 
- ✅ Comment tất cả schedulers tự động trong backend
- ✅ Cập nhật frontend sử dụng API endpoint được khuyến nghị
- ✅ Loại bỏ code debugging không cần thiết

## 🎯 Cách sử dụng hiện tại

### 1. Tạo hóa đơn theo tháng (Chức năng chính)

1. **Truy cập:** Admin Dashboard → Invoices → Tab "Hóa đơn"
2. **Chọn chức năng:** "🎯 Tạo hóa đơn theo tháng"
3. **Nhập thông tin:**
   - Năm: Chọn năm cần tạo hóa đơn
   - Tháng: Chọn tháng cần tạo hóa đơn
4. **Nhấn nút:** "🎯 Tạo hóa đơn tháng X/YYYY (N căn hộ)"

**API Endpoint được sử dụng:**
```
POST /api/admin/invoices/generate-all?billingPeriod=YYYY-MM
```

**Kết quả mong đợi:**
- ✅ Tạo hóa đơn cho tất cả căn hộ trong tháng cụ thể
- ✅ Chỉ tạo cho tháng được chọn, không tạo cho cả năm
- ✅ Bao gồm: Phí dịch vụ, phí nước, phí gửi xe

### 2. Tạo biểu phí cấu hình cho năm

1. **Chọn chức năng:** "Tạo biểu phí cấu hình cho năm"
2. **Nhập đơn giá phí dịch vụ**
3. **Nhấn nút:** "Tạo biểu phí năm XXXX"

**Lưu ý:** Chức năng này chỉ tạo cấu hình phí, không tạo hóa đơn.

## 🔧 Cải tiến đã thực hiện

### Frontend Updates
- ✅ **API Endpoint:** Chuyển từ `/api/admin/yearly-billing/generate-month/{year}/{month}` sang `/api/admin/invoices/generate-all?billingPeriod={year}-{month}`
- ✅ **UI/UX:** Cải thiện giao diện với hướng dẫn rõ ràng
- ✅ **Debugging:** Loại bỏ console.log statements không cần thiết
- ✅ **Documentation:** Cập nhật thông tin endpoint trong UI

### Backend Fixes (đã thực hiện)
- ✅ **YearlyBillingScheduler:** Comment schedulers tự động
- ✅ **WaterMeterScheduler:** Comment schedulers tự động  
- ✅ **BillingJob:** Comment schedulers tự động

## 📊 Kiểm tra kết quả

### 1. Xem thống kê hóa đơn
- Sử dụng nút "Xem thống kê" trong form
- Kiểm tra số lượng hóa đơn được tạo

### 2. Kiểm tra database
```sql
-- Xem hóa đơn theo tháng
SELECT billing_period, COUNT(*) as invoice_count, SUM(total_amount) as total_amount
FROM invoices 
WHERE billing_period LIKE '2025-%'
GROUP BY billing_period
ORDER BY billing_period;
```

### 3. Kiểm tra log
- Xem console log trong browser
- Kiểm tra network tab để verify API calls

## ⚠️ Lưu ý quan trọng

### ✅ Đã khắc phục
- **Vấn đề tạo hóa đơn cho cả năm:** Đã được giải quyết
- **Schedulers tự động:** Đã được comment
- **API endpoint:** Đã chuyển sang endpoint được khuyến nghị

### 🔄 Quy trình sử dụng
1. **Tạo cấu hình phí:** Sử dụng "Tạo biểu phí cấu hình cho năm" (nếu cần)
2. **Tạo hóa đơn:** Sử dụng "🎯 Tạo hóa đơn theo tháng"
3. **Kiểm tra:** Xem thống kê và verify kết quả

### 🚨 Lưu ý
- **Chọn đúng chức năng:** Đảm bảo chọn "Tạo hóa đơn theo tháng" thay vì "Tạo biểu phí cấu hình"
- **Kiểm tra trước khi tạo:** Verify năm/tháng được chọn
- **Backup dữ liệu:** Nên backup trước khi tạo hóa đơn hàng loạt

## 🆘 Troubleshooting

### Nếu vẫn gặp vấn đề:
1. **Kiểm tra console:** Xem có lỗi JavaScript không
2. **Kiểm tra network:** Verify API calls thành công
3. **Kiểm tra backend:** Đảm bảo schedulers đã được comment
4. **Liên hệ support:** Cung cấp log và thông tin chi tiết

---

**📞 Hỗ trợ:** Nếu có vấn đề, hãy kiểm tra log và cung cấp thông tin chi tiết. 