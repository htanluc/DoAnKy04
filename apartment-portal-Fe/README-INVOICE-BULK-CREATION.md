# Hướng dẫn tạo hóa đơn đồng loạt theo tháng

## 📍 Vị trí chức năng

Chức năng tạo hóa đơn đồng loạt theo tháng nằm trong trang **Quản lý hóa đơn** tại đường dẫn:
```
http://localhost:3000/admin-dashboard/invoices
```

## 🎯 Cách sử dụng

### Bước 1: Truy cập trang hóa đơn
- Đăng nhập vào hệ thống với tài khoản admin
- Truy cập: `http://localhost:3000/admin-dashboard/invoices`

### Bước 2: Chuyển đến tab "Tạo biểu phí"
- Trên trang hóa đơn, bạn sẽ thấy 4 tabs:
  - **Hóa đơn** (mặc định)
  - **Tạo biểu phí** ← Chọn tab này
  - **Cấu hình phí**
  - **Lịch sử**

### Bước 3: Chọn chức năng tạo hóa đơn
- Trong tab "Tạo biểu phí", chọn:
  - ✅ **"Tạo hóa đơn đồng loạt"** (thay vì "Tạo cấu hình phí dịch vụ")

### Bước 4: Chọn phạm vi tạo hóa đơn
- Chọn một trong 3 tùy chọn:
  - **Tạo cho một căn hộ**: Tạo hóa đơn cho một căn hộ cụ thể
  - **Tạo cho tất cả căn hộ**: Tạo hóa đơn đồng loạt cho tất cả căn hộ
  - **🎯 Tạo hóa đơn theo tháng**: ← **Đây chính là chức năng bạn cần!**

### Bước 5: Cấu hình thông tin
- **Năm**: Chọn năm cần tạo hóa đơn (ví dụ: 2024)
- **Tháng**: Chọn tháng cần tạo hóa đơn (từ 1-12)

### Bước 6: Tạo hóa đơn
- Nhấn nút **"Tạo hóa đơn tháng X/YYYY (X căn hộ)"**
- Hệ thống sẽ tự động tạo hóa đơn cho tất cả căn hộ trong tháng được chọn

## 📋 Thông tin chi tiết

### Chức năng bao gồm:
- ✅ Tạo hóa đơn cho **tất cả căn hộ** trong tháng được chọn
- ✅ Tự động tính toán các khoản phí:
  - Phí dịch vụ (theo m²)
  - Phí nước (theo m³)
  - Phí gửi xe (xe máy, xe 4 chỗ, xe 7 chỗ)
- ✅ Sử dụng cấu hình phí dịch vụ hiện tại
- ✅ Tạo hóa đơn đồng loạt một lần

### API Endpoint được sử dụng:
```
POST /api/admin/yearly-billing/generate-month/{year}/{month}
```

### Ví dụ:
- Tạo hóa đơn tháng 12/2024 cho tất cả căn hộ:
  - Năm: 2024
  - Tháng: 12
  - Kết quả: Tạo hóa đơn cho tất cả căn hộ trong tháng 12/2024

## ⚠️ Lưu ý quan trọng

1. **Giới hạn request**: Có giới hạn 100ms giữa các request để tránh spam
2. **Dữ liệu cần thiết**: Đảm bảo đã có cấu hình phí dịch vụ cho tháng/năm đó
3. **Số lượng căn hộ**: Hệ thống sẽ tạo hóa đơn cho tất cả căn hộ hiện có
4. **Thời gian xử lý**: Có thể mất vài giây để tạo hóa đơn cho tất cả căn hộ

## 🔧 Troubleshooting

### Nếu không thấy chức năng:
1. Đảm bảo đã chuyển sang tab **"Tạo biểu phí"**
2. Đảm bảo đã chọn **"Tạo hóa đơn đồng loạt"**
3. Đảm bảo đã chọn **"Tạo hóa đơn theo tháng"**

### Nếu gặp lỗi:
1. Kiểm tra kết nối mạng
2. Thử lại sau vài giây
3. Kiểm tra console để xem lỗi chi tiết
4. Liên hệ quản trị viên nếu cần

## 📊 Thống kê sau khi tạo

Sau khi tạo hóa đơn thành công, bạn có thể:
- Xem thống kê hóa đơn trong tab "Lịch sử"
- Kiểm tra danh sách hóa đơn trong tab "Hóa đơn"
- Xem chi tiết từng hóa đơn đã tạo

---

**Chức năng này đã được tích hợp đầy đủ và sẵn sàng sử dụng!** 🎉 