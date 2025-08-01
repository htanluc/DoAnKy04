# 📋 Hướng dẫn sử dụng tính năng Tạo biểu phí năm hiện tại

## 🎯 Tổng quan

Tính năng "Tạo biểu phí năm hiện tại" cho phép admin tạo biểu phí dịch vụ cho tất cả căn hộ hoặc một căn hộ cụ thể trong năm hiện tại với 3 loại phí chính:
- **Phí dịch vụ theo m²**: Tính theo diện tích căn hộ
- **Phí nước theo m³**: Tính theo chỉ số nước tiêu thụ  
- **Phí gửi xe**: Tính theo loại xe (xe máy, ô tô 4 chỗ, ô tô 7 chỗ)

**⚠️ Lưu ý quan trọng**: Có thể tạo biểu phí cấu hình cho năm hiện tại và các năm khác. Hệ thống sẽ kiểm tra và thông báo trạng thái của từng năm.

## 🚀 Cách truy cập

1. Đăng nhập vào hệ thống với tài khoản Admin
2. Vào menu **"Tạo biểu phí năm hiện tại"** trong sidebar
3. Hoặc truy cập trực tiếp: `/admin-dashboard/yearly-billing`

## 📊 Các tab chính

### 1. **Tab "Tạo biểu phí"**
- Form chính để tạo biểu phí cho năm hiện tại
- **2 loại hành động**:
  - ✅ **Tạo hóa đơn**: Tạo cấu hình phí + hóa đơn cho 12 tháng
  - ✅ **Chỉ tạo cấu hình**: Chỉ tạo cấu hình phí cho 12 tháng
- Chọn phạm vi (tất cả căn hộ hoặc căn hộ cụ thể)
- Cấu hình đơn giá cho 5 loại phí
- Xem tóm tắt đơn giá trước khi tạo

### 2. **Tab "Cấu hình phí"**
- Xem và chỉnh sửa cấu hình phí cho tháng hiện tại
- Tạo cấu hình mới nếu chưa có
- Cập nhật đơn giá theo từng tháng

### 3. **Tab "Lịch sử"**
- Xem lịch sử tạo biểu phí
- Lọc theo năm
- Thống kê tổng quan về các lần tạo biểu phí

### 4. **Tab "Thông tin"**
- Hướng dẫn cách hoạt động
- Cách tính phí chi tiết
- Lưu ý quan trọng

## 💰 Cách tính phí

### Phí dịch vụ
```
Phí dịch vụ = Diện tích căn hộ (m²) × Đơn giá (VND/m²)
```

### Phí nước
```
Phí nước = Lượng nước tiêu thụ (m³) × Đơn giá (VND/m³)
```

### Phí gửi xe
```
Phí gửi xe = Số xe × Đơn giá theo loại xe
```

**Các loại xe được tính phí:**
- **Xe máy**: 50,000 VND/tháng
- **Ô tô 4 chỗ**: 200,000 VND/tháng  
- **Ô tô 7 chỗ**: 250,000 VND/tháng

**Không tính phí:** Xe đạp, xe tải, xe van, xe điện

## 🎯 Các bước tạo biểu phí

### Bước 1: Chọn loại hành động
- **Tạo hóa đơn**: Tạo cấu hình phí VÀ hóa đơn cho 12 tháng
- **Chỉ tạo cấu hình**: Chỉ tạo cấu hình phí cho 12 tháng (không tạo hóa đơn)

### Bước 2: Chọn phạm vi
- **Phạm vi** (chỉ khi chọn "Tạo hóa đơn"): 
  - ✅ Tất cả căn hộ: Tạo biểu phí cho tất cả căn hộ
  - ✅ Căn hộ cụ thể: Chọn một căn hộ từ danh sách

### Bước 3: Cấu hình đơn giá
- **Phí dịch vụ**: Đơn giá/m² (VND) - Từ 1 đến 100,000 VND/m²
- **Phí nước**: Đơn giá/m³ (VND) - Từ 1 đến 50,000 VND/m³
- **Phí xe máy**: Đơn giá/tháng - Từ 1 đến 200,000 VND/tháng
- **Phí ô tô 4 chỗ**: Đơn giá/tháng - Từ 1 đến 1,000,000 VND/tháng
- **Phí ô tô 7 chỗ**: Đơn giá/tháng - Từ 1 đến 1,500,000 VND/tháng

### Bước 4: Xem tóm tắt và tạo
- Kiểm tra tóm tắt đơn giá
- Nhấn "Tạo hóa đơn năm hiện tại" hoặc "Tạo cấu hình phí"
- Hệ thống sẽ tạo cấu hình/hóa đơn cho 12 tháng

## ⚙️ Cấu hình phí

### Xem cấu hình hiện tại
1. Chuyển sang tab "Cấu hình phí"
2. Xem đơn giá của tháng hiện tại
3. Nhấn "Chỉnh sửa" để thay đổi

### Tạo cấu hình mới
1. Nếu chưa có cấu hình, nhấn "Tạo cấu hình mới"
2. Nhập đơn giá cho 5 loại phí
3. Nhấn "Lưu"

### Cập nhật cấu hình
1. Nhấn "Chỉnh sửa"
2. Thay đổi đơn giá
3. Nhấn "Lưu" để cập nhật

## 📈 Xem lịch sử

### Lọc theo năm
1. Chuyển sang tab "Lịch sử"
2. Chọn năm cần xem
3. Nhấn "Lọc"

### Thông tin hiển thị
- **Thời gian**: Ngày giờ tạo biểu phí
- **Năm**: Năm được tạo biểu phí
- **Phạm vi**: Tất cả căn hộ hoặc căn hộ cụ thể
- **Đơn giá**: 5 loại phí được áp dụng
- **Kết quả**: Thông báo kết quả tạo biểu phí
- **Hóa đơn**: Số lượng hóa đơn được tạo
- **Tổng tiền**: Tổng số tiền của tất cả hóa đơn
- **Trạng thái**: Thành công/Thất bại/Một phần

## ⚠️ Lưu ý quan trọng

### Giới hạn năm
- ✅ **Chọn năm linh hoạt**: Có thể tạo biểu phí cho năm hiện tại và các năm khác
- ❌ **Không cho phép**: Tạo biểu phí cho năm quá khứ hoặc tương lai
- 🚫 **Không tạo lại**: Năm đã có cấu hình phí dịch vụ không thể tạo lại
- 🔒 **Bảo mật**: Ngăn chặn việc tạo biểu phí không hợp lệ

### Dữ liệu cần thiết
- ✅ **Diện tích căn hộ**: Cần có trong bảng `apartments`
- ✅ **Chỉ số nước**: Cần có trong bảng `water_meter_readings`
- ✅ **Xe cộ**: Chỉ tính xe máy, ô tô 4 chỗ, ô tô 7 chỗ đã được approved
- ✅ **Cư dân**: Cần có thông tin cư dân liên kết với căn hộ

### Kiểm tra trùng lặp
- Hệ thống tự động kiểm tra và bỏ qua hóa đơn đã tồn tại
- Tránh tạo hóa đơn trùng lặp cho cùng tháng

### Xử lý lỗi
- Nếu không có chỉ số nước → Phí nước = 0
- Nếu không có xe máy/ô tô → Phí gửi xe = 0
- Nếu không có diện tích căn hộ → Phí dịch vụ = 0

## 🔧 Troubleshooting

### Lỗi "Chỉ được tạo biểu phí cho năm hiện tại"

**Nguyên nhân**: Hệ thống đã được cập nhật để cho phép tạo biểu phí cho các năm khác.

**Giải pháp**:
1. ✅ **Đã sửa**: Validation giới hạn năm đã được loại bỏ
2. ✅ **Tính năng mới**: Có thể chọn năm từ dropdown (từ currentYear - 5 đến currentYear + 5)
3. ✅ **Kiểm tra tự động**: Hệ thống sẽ kiểm tra và thông báo trạng thái của từng năm
4. ✅ **Thông báo thông minh**: Hiển thị "Đã có cấu hình" hoặc "Chưa có cấu hình" cho từng năm

### Lỗi "Năm X đã có cấu hình phí dịch vụ"

**Nguyên nhân**: Cố gắng tạo biểu phí cho năm đã có cấu hình.

**Giải pháp**:
1. ✅ **Chọn năm khác**: Chọn năm chưa có cấu hình từ dropdown
2. ✅ **Sử dụng tab "Cấu hình phí"**: Để chỉnh sửa cấu hình hiện tại
3. ✅ **Kiểm tra trạng thái**: Xem thông báo "Đã có cấu hình (không thể tạo lại)"
4. ✅ **Nút bị disable**: Nút submit sẽ bị vô hiệu hóa khi năm đã có cấu hình

### Lỗi "Invoice not found"
- Kiểm tra xem hóa đơn đã được tạo chưa
- Đảm bảo apartmentId tồn tại trong database

### Lỗi "Service fee config not found"
- Tạo cấu hình phí dịch vụ trước khi tạo biểu phí
- Sử dụng tab "Cấu hình phí" để tạo cấu hình

### Phí nước bằng 0
- Kiểm tra chỉ số nước trong bảng `water_meter_readings`
- Đảm bảo có dữ liệu cho tháng cần tính

### Phí gửi xe bằng 0
- Kiểm tra xe máy/ô tô đã được đăng ký chưa
- Đảm bảo xe có trạng thái APPROVED
- Kiểm tra thông tin cư dân liên kết với căn hộ

### 🚨 Lỗi "chk_invoice_amount constraint violation"

**Mô tả lỗi:**
```
Lỗi khi tạo biểu phí: could not execute statement [Check constraint 'chk_invoice_amount' is violated.] 
[insert into invoices (apartment_id,billing_period,created_at,due_date,issue_date,status,total_amount,updated_at) 
values (?,?,?,?,?,?,?,?)]
```

**Nguyên nhân có thể:**
1. **Dữ liệu căn hộ không hợp lệ**: Diện tích căn hộ = 0 hoặc NULL
2. **Chỉ số nước âm**: Lượng tiêu thụ nước âm do lỗi nhập liệu
3. **Thiếu dữ liệu xe cộ**: Không có thông tin xe đã đăng ký
4. **Lỗi tính toán**: Tổng tiền hóa đơn = 0 hoặc âm

**Cách khắc phục:**

#### Bước 1: Kiểm tra dữ liệu căn hộ
```sql
-- Kiểm tra căn hộ có diện tích hợp lệ
SELECT id, unit_number, area, building, floor
FROM apartments 
WHERE area IS NULL OR area <= 0;
```

#### Bước 2: Kiểm tra chỉ số nước
```sql
-- Kiểm tra chỉ số nước âm
SELECT apartment_id, reading_month, current_reading, previous_reading
FROM water_meter_readings 
WHERE current_reading < previous_reading;
```

#### Bước 3: Kiểm tra xe cộ
```sql
-- Kiểm tra xe đã đăng ký
SELECT apartment_id, vehicle_type, status, COUNT(*) as count
FROM vehicles 
WHERE apartment_id IS NOT NULL 
  AND status = 'APPROVED'
  AND vehicle_type IN ('MOTORBIKE', 'CAR_4_SEATS', 'CAR_7_SEATS')
GROUP BY apartment_id, vehicle_type, status;
```

#### Bước 4: Thử lại với dữ liệu hợp lệ
1. Cập nhật diện tích căn hộ nếu cần
2. Sửa chỉ số nước âm
3. Đăng ký xe cộ nếu cần
4. Thử tạo biểu phí lại

**Lưu ý:** Hệ thống đã được cải thiện để:
- ✅ Kiểm tra dữ liệu đầu vào trước khi gửi
- ✅ Hiển thị thông báo lỗi chi tiết hơn
- ✅ Ngăn chặn việc gửi dữ liệu không hợp lệ
- ✅ Chỉ cho phép tạo biểu phí cho năm hiện tại

## 🎯 Kết luận

Tính năng "Tạo biểu phí năm hiện tại" đã được tích hợp hoàn chỉnh với:
- ✅ Form tạo biểu phí với validation đầy đủ
- ✅ **Chọn năm linh hoạt**: Có thể tạo biểu phí cho năm hiện tại và các năm khác
- ✅ **Ngăn chặn tạo lại**: Không cho phép tạo biểu phí cho năm đã có cấu hình
- ✅ 2 loại hành động: Tạo hóa đơn hoặc chỉ tạo cấu hình
- ✅ Quản lý cấu hình phí theo tháng với 5 loại phí
- ✅ Xem lịch sử tạo biểu phí
- ✅ Hướng dẫn chi tiết và troubleshooting
- ✅ UI/UX thân thiện và dễ sử dụng
- ✅ Xử lý lỗi nâng cao với thông báo chi tiết

Admin có thể bắt đầu sử dụng ngay để tạo biểu phí cho cư dân trong năm hiện tại! 🚀 