# Vehicle API Documentation

## Tổng quan
Tài liệu này mô tả các API liên quan đến quản lý xe trong hệ thống apartment portal.

## Cấu trúc dữ liệu VehicleDto

```json
{
  "id": "Long - ID của xe",
  "licensePlate": "String - Biển số xe",
  "vehicleType": "String - Loại xe (CAR, MOTORBIKE, BICYCLE)",
  "vehicleTypeDisplayName": "String - Tên hiển thị loại xe",
  "brand": "String - Hãng xe",
  "model": "String - Mẫu xe",
  "color": "String - Màu xe",
  "imageUrls": "String[] - Mảng URL hình ảnh xe",
  "status": "String - Trạng thái xe (PENDING, APPROVED, REJECTED)",
  "statusDisplayName": "String - Tên hiển thị trạng thái",
  "monthlyFee": "BigDecimal - Phí hàng tháng",
  "userFullName": "String - Tên đầy đủ của chủ xe", // <-- Trường này chứa tên chủ xe
  "apartmentId": "Long - ID căn hộ",
  "apartmentUnitNumber": "String - Số căn hộ",
  "createdAt": "LocalDateTime - Thời gian tạo",
  "updatedAt": "LocalDateTime - Thời gian cập nhật",
  "registrationDate": "LocalDateTime - Ngày đăng ký"
}
```

## API Endpoints

### 1. API cho User thường

#### Lấy danh sách xe của user hiện tại
```
GET /api/vehicles/my
Authorization: Bearer token
```

**Response:**
```json
[
  {
    "id": 1,
    "licensePlate": "29A-12345",
    "vehicleType": "CAR",
    "vehicleTypeDisplayName": "Ô tô",
    "brand": "Toyota",
    "model": "Camry",
    "color": "Đen",
    "imageUrls": ["url1.jpg", "url2.jpg"],
    "status": "APPROVED",
    "statusDisplayName": "Đã duyệt",
    "monthlyFee": 500000.00,
    "userFullName": "Nguyễn Văn A", // <-- Tên chủ xe
    "apartmentId": 123,
    "apartmentUnitNumber": "A101",
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00",
    "registrationDate": "2024-01-15T10:30:00"
  }
]
```

#### Lấy xe theo căn hộ
```
GET /api/vehicles/apartment/{apartmentId}
Authorization: Bearer token
```

#### Lấy xe theo user và căn hộ
```
GET /api/vehicles/user/{userId}/apartment/{apartmentId}
Authorization: Bearer token
```

### 2. API Admin

#### Lấy tất cả xe
```
GET /api/admin/vehicles
Authorization: Bearer admin_token
```

#### Lấy xe theo ID
```
GET /api/admin/vehicles/{id}
Authorization: Bearer admin_token
```

#### Lấy xe theo trạng thái
```
GET /api/admin/vehicles/status/{status}
Authorization: Bearer admin_token
```
**Status có thể là:** PENDING, APPROVED, REJECTED

#### Lấy xe đang chờ duyệt
```
GET /api/admin/vehicles/pending
Authorization: Bearer admin_token
```

#### Lấy xe đã duyệt
```
GET /api/admin/vehicles/approved
Authorization: Bearer admin_token
```

#### Cập nhật trạng thái xe
```
PUT /api/admin/vehicles/{id}/status
Authorization: Bearer admin_token
Content-Type: application/json

{
  "status": "APPROVED",
  "rejectionReason": "Lý do từ chối (chỉ cần khi status = REJECTED)"
}
```

## Lưu ý quan trọng

### Trường userFullName
- Trường `userFullName` trong response chứa **tên đầy đủ của chủ xe**
- Nếu user không có fullName, sẽ hiển thị "Không rõ"
- Trường này có trong tất cả API trả về VehicleDto

### Quyền truy cập
- User thường chỉ xem được xe của chính mình
- Admin có thể xem tất cả xe trong hệ thống
- Các API admin yêu cầu quyền admin

### Trạng thái xe
- `PENDING`: Đang chờ duyệt
- `APPROVED`: Đã duyệt
- `REJECTED`: Bị từ chối

## Ví dụ sử dụng

```javascript
// Lấy xe của user hiện tại
const response = await fetch('/api/vehicles/my', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const vehicles = await response.json();
console.log('Tên chủ xe:', vehicles[0].userFullName); // <-- Đây là tên chủ xe
```

## Cập nhật gần đây
- API đã được tối ưu với JOIN query để load thông tin user và apartment cùng lúc
- Thêm trường `userFullName` để hiển thị tên chủ xe
- Cải thiện performance cho các query danh sách xe
