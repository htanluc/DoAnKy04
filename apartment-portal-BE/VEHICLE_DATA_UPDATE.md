# Cập Nhật Dữ Liệu Xe Trong DataInitializer

## Tổng Quan

Đã cập nhật `DataInitializer` để mỗi căn hộ có **1 xe máy** và **1 xe ô tô**, thay vì chỉ có 1 xe ô tô như trước đây.

## Thay Đổi Chính

### 🏍️ **Xe Máy (Motorcycle)**
- **Biển số**: `30A-50xxx` (bắt đầu từ 50000)
- **Loại**: `VehicleType.MOTORCYCLE` 
- **Phí**: `50,000 VND/tháng`
- **Thương hiệu**: Honda, Yamaha, Suzuki, SYM, Piaggio, Kawasaki
- **Model**: Wave, Sirius, Raider, Attila, Vespa, Z125, Winner, Exciter, Address, Elegant, Liberty, Ninja, Vision, NVX

### 🚗 **Xe Ô Tô (Car)**
- **Biển số**: `30A-10xxx` (bắt đầu từ 10000)
- **Loại**: Random giữa `CAR_4_SEATS` và `CAR_7_SEATS` (tỷ lệ 2:1)
- **Phí**: 
  - `200,000 VND/tháng` cho xe 4 chỗ
  - `250,000 VND/tháng` cho xe 7 chỗ
- **Thương hiệu**: Toyota, Honda, Ford, Hyundai, Mazda, Kia, Nissan, Mitsubishi, Suzuki, Daihatsu, Chevrolet, BMW, Mercedes, Audi
- **Model**: Vios, City, Ranger, Accent, CX-5, Cerato, Sunny, Lancer, Swift, Terios, Spark, X3, C-Class, A4

### 🎨 **Màu Sắc**
- **8 màu**: Trắng, Đen, Bạc, Xanh, Đỏ, Vàng, Xám, Nâu
- Xe máy và xe ô tô có màu khác nhau (offset index)

### 📸 **Hình Ảnh**
- Sử dụng Unsplash images với kích thước `400x300`
- Xe máy và xe ô tô có bộ hình ảnh riêng biệt

## Impact Đối Với Hóa Đơn

### 💰 **Tính Phí Gửi Xe**
Khi tạo hóa đơn đồng loạt, hệ thống sẽ tính phí dựa trên:

1. **Mỗi resident** sẽ có **2 xe** → phí gửi xe cao hơn
2. **Tổng phí gửi xe/căn hộ**: 50,000 + 200,000/250,000 = **250,000-300,000 VND/tháng**
3. **ServiceFeeConfig** sẽ áp dụng:
   - `motorcycleFee: 50,000`
   - `car4SeatsFee: 200,000` 
   - `car7SeatsFee: 250,000`

### 📋 **Chi Tiết Hóa Đơn**
Mỗi hóa đơn sẽ có:
- **Service Fee**: Phí dịch vụ (diện tích × rate)
- **Parking Fee**: Phí gửi xe (1 xe máy + 1 xe ô tô)
- **Water Fee**: Phí nước (nếu có chỉ số)

## Cách Test

### 1. **Test dữ liệu xe**:
```bash
./test-vehicle-data.bat
```

### 2. **Test tạo hóa đơn với phí xe mới**:
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

### 3. **Kiểm tra tổng tiền hóa đơn**:
- Mỗi căn hộ sẽ có tổng tiền cao hơn do có 2 xe
- Tổng tiền = Service Fee + Parking Fee (motorcycle + car) + Water Fee

## Lưu Ý

1. **Database Reset**: Để áp dụng dữ liệu mới, cần reset database hoặc xóa dữ liệu xe cũ
2. **Vehicle Status**: Tất cả xe được tạo với status `APPROVED`
3. **Biển Số**: Sử dụng 2 range khác nhau để tránh trùng lặp:
   - Xe máy: 30A-50000+
   - Xe ô tô: 30A-10000+
4. **Performance**: Với mỗi resident có 2 xe, số lượng records trong database tăng gấp đôi

## Code Changes

### File Modified:
- `src/main/java/com/mytech/apartment/portal/config/DataInitializer.java`

### Changes:
- Thêm arrays cho xe máy: `motoBrands`, `motoModels`, `motoImageUrls`
- Tạo 2 vòng lặp: 1 cho xe máy, 1 cho xe ô tô
- Random loại xe ô tô (4 chỗ/7 chỗ) với tỷ lệ 2:1
- Phí khác nhau cho từng loại xe

Cập nhật này đảm bảo dữ liệu xe phong phú và realistic hơn cho việc test hệ thống tính phí gửi xe.