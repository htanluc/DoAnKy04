# 🚗 Tính Năng Giới Hạn Số Lượng Xe - Vehicle Capacity Limit

## 📋 Mô Tả

Tính năng này cho phép quản lý giới hạn số lượng xe có thể đăng ký vào từng tòa nhà chung cư. Khi đã đạt giới hạn tối đa cho một loại xe cụ thể, hệ thống sẽ không cho phép đăng ký xe mới thuộc loại đó.

## ✨ Tính Năng Chính

### 1. **Cấu Hình Giới Hạn Xe**
- Thiết lập giới hạn số lượng xe cho từng loại xe trong từng tòa nhà
- Hỗ trợ các loại xe: Ô tô, Xe máy, Xe tải, Xe van, Xe điện, Xe đạp
- Có thể bật/tắt cấu hình cho từng tòa nhà

### 2. **Kiểm Tra Tự Động**
- Tự động kiểm tra giới hạn khi đăng ký xe mới
- Hiển thị thông báo lỗi nếu đã đạt giới hạn
- Ngăn chặn việc đăng ký xe vượt quá sức chứa

### 3. **Quản Lý Linh Hoạt**
- Admin/Staff có thể thay đổi giới hạn theo thời gian
- Theo dõi số lượng xe hiện tại và còn lại
- Báo cáo thống kê chi tiết

## 🏗️ Kiến Trúc Hệ Thống

### Database Schema
```sql
-- Bảng cấu hình giới hạn xe
CREATE TABLE vehicle_capacity_config (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    building_id BIGINT NOT NULL,
    max_cars INT NOT NULL DEFAULT 0,
    max_motorcycles INT NOT NULL DEFAULT 0,
    max_trucks INT NOT NULL DEFAULT 0,
    max_vans INT NOT NULL DEFAULT 0,
    max_electric_vehicles INT NOT NULL DEFAULT 0,
    max_bicycles INT NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(id) ON DELETE CASCADE,
    UNIQUE KEY uk_building_vehicle_capacity (building_id)
);
```

### Các Class Chính
- **VehicleCapacityConfig**: Model chính
- **VehicleCapacityConfigService**: Logic nghiệp vụ
- **VehicleCapacityConfigController**: API endpoints
- **VehicleCapacityConfigRepository**: Truy vấn database

## 🚀 API Endpoints

### 1. **Tạo Cấu Hình Mới**
```http
POST /api/vehicle-capacity-config
Authorization: Bearer {token}
Content-Type: application/json

{
    "buildingId": 1,
    "maxCars": 50,
    "maxMotorcycles": 100,
    "maxTrucks": 10,
    "maxVans": 15,
    "maxElectricVehicles": 20,
    "maxBicycles": 30,
    "isActive": true
}
```

### 2. **Cập Nhật Cấu Hình**
```http
PUT /api/vehicle-capacity-config/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
    "buildingId": 1,
    "maxCars": 60,
    "maxMotorcycles": 120,
    "maxTrucks": 12,
    "maxVans": 18,
    "maxElectricVehicles": 25,
    "maxBicycles": 35,
    "isActive": true
}
```

### 3. **Lấy Cấu Hình Theo Building**
```http
GET /api/vehicle-capacity-config/building/{buildingId}
```

### 4. **Kiểm Tra Khả Năng Thêm Xe**
```http
GET /api/vehicle-capacity-config/check-capacity?buildingId=1&vehicleType=CAR_4_SEATS
```

### 5. **Lấy Tất Cả Cấu Hình**
```http
GET /api/vehicle-capacity-config
```

## 📱 Cách Sử Dụng

### 1. **Thiết Lập Ban Đầu**
1. Admin/Staff đăng nhập vào hệ thống
2. Vào menu "Quản lý xe" → "Cấu hình giới hạn"
3. Chọn tòa nhà cần cấu hình
4. Nhập số lượng tối đa cho từng loại xe
5. Lưu cấu hình

### 2. **Đăng Ký Xe Mới**
1. Cư dân đăng nhập và chọn "Đăng ký xe"
2. Chọn căn hộ và loại xe
3. Hệ thống tự động kiểm tra giới hạn
4. Nếu đạt giới hạn: Hiển thị thông báo lỗi
5. Nếu chưa đạt giới hạn: Cho phép đăng ký

### 3. **Theo Dõi Và Cập Nhật**
1. Admin/Staff xem báo cáo số lượng xe hiện tại
2. Điều chỉnh giới hạn nếu cần thiết
3. Bật/tắt cấu hình cho từng tòa nhà

## 🔒 Bảo Mật

- **Admin/Staff**: Có quyền tạo, sửa, xóa cấu hình
- **Cư dân**: Chỉ có quyền xem và kiểm tra giới hạn
- Tất cả API đều yêu cầu xác thực JWT

## 📊 Báo Cáo Và Thống Kê

### Thông Tin Hiển Thị
- Số lượng xe hiện tại theo từng loại
- Số lượng còn lại có thể đăng ký
- Trạng thái cấu hình (Active/Inactive)
- Lịch sử thay đổi cấu hình

### Ví Dụ Response
```json
{
    "id": 1,
    "buildingId": 1,
    "buildingName": "Tòa A - Golden Tower",
    "maxCars": 50,
    "currentCars": 45,
    "remainingCars": 5,
    "maxMotorcycles": 100,
    "currentMotorcycles": 80,
    "remainingMotorcycles": 20,
    "isActive": true
}
```

## ⚠️ Lưu Ý Quan Trọng

1. **Xe Đã Phê Duyệt**: Chỉ xe có trạng thái "APPROVED" mới được tính vào giới hạn
2. **Xe Đang Chờ**: Xe có trạng thái "PENDING" không ảnh hưởng đến giới hạn
3. **Cập Nhật Real-time**: Giới hạn được kiểm tra ngay khi đăng ký xe
4. **Backup Dữ Liệu**: Nên backup cấu hình trước khi thay đổi lớn

## 🐛 Xử Lý Lỗi

### Lỗi Thường Gặp
1. **"Đã đạt giới hạn xe"**: Tòa nhà đã đầy xe loại này
2. **"Không tìm thấy cấu hình"**: Tòa nhà chưa có cấu hình giới hạn
3. **"Số lượng không hợp lệ"**: Giới hạn phải >= 0

### Giải Pháp
1. Kiểm tra cấu hình giới hạn của tòa nhà
2. Tăng giới hạn nếu cần thiết
3. Liên hệ ban quản lý để được hỗ trợ

## 🔄 Cập Nhật Tương Lai

- [ ] Thông báo email khi gần đạt giới hạn
- [ ] Lịch sử thay đổi cấu hình
- [ ] Báo cáo xuất Excel/PDF
- [ ] Dashboard thống kê trực quan
- [ ] API webhook cho hệ thống bên ngoài

## 📞 Hỗ Trợ

Nếu gặp vấn đề hoặc cần hỗ trợ, vui lòng liên hệ:
- **Email**: support@apartment-portal.com
- **Hotline**: 1900-xxxx
- **Documentation**: https://docs.apartment-portal.com

## 🧪 Testing

### Demo Page
Truy cập `/vehicle-capacity` để test tính năng:
- Tab "Demo Kiểm Tra": Test kiểm tra giới hạn xe
- Tab "Tổng Quan": Xem tổng quan giới hạn xe
- Tab "Cấu Hình": Quản lý cấu hình giới hạn
- Tab "Tài Liệu": Hướng dẫn sử dụng

### Test Cases
1. **Tạo cấu hình mới**: Thiết lập giới hạn xe cho tòa nhà
2. **Kiểm tra giới hạn**: Test với các loại xe khác nhau
3. **Cập nhật cấu hình**: Thay đổi giới hạn và kiểm tra
4. **Bật/tắt cấu hình**: Test trạng thái active/inactive
5. **Xóa cấu hình**: Test xóa và kiểm tra

## 📁 File Structure

```
components/admin/
├── VehicleCapacityManager.tsx    # Quản lý cấu hình giới hạn
├── VehicleCapacityOverview.tsx   # Tổng quan giới hạn xe
└── VehicleCapacityAlert.tsx      # Cảnh báo giới hạn xe

hooks/
└── use-vehicle-capacity.ts       # Hook quản lý vehicle capacity

lib/
└── api.ts                        # API endpoints

app/
├── admin-dashboard/vehicle-registrations/
│   └── page.tsx                  # Trang quản lý xe (đã tích hợp)
└── vehicle-capacity/
    └── page.tsx                  # Trang demo
```

## 🚀 Deployment

1. **Backend**: Đảm bảo API endpoints đã được implement
2. **Database**: Tạo bảng `vehicle_capacity_config`
3. **Frontend**: Build và deploy React app
4. **Testing**: Test tính năng trên môi trường staging
5. **Production**: Deploy lên production và monitor

## 📈 Performance

- **Caching**: Cache cấu hình giới hạn xe để giảm database queries
- **Indexing**: Index trên `building_id` để tối ưu truy vấn
- **Real-time**: Sử dụng WebSocket để cập nhật real-time
- **Optimization**: Lazy load components và optimize bundle size
