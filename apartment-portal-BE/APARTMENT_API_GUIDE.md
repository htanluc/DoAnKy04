# Hướng dẫn sử dụng API Apartment

## Tổng quan
API Apartment đã được cập nhật theo yêu cầu tài liệu:
- **Loại bỏ CREATE/DELETE**: Không thể thêm/xóa căn hộ sau khi triển khai
- **Thêm liên kết cư dân-căn hộ**: Admin có thể gán cư dân vào căn hộ có sẵn
- **Quản lý trạng thái căn hộ**: Tự động cập nhật trạng thái VACANT/OCCUPIED

## Các API Endpoints

### 1. Lấy danh sách tất cả căn hộ
```http
GET /api/apartments
```

**Response:**
```json
[
  {
    "id": 1,
    "buildingId": 1,
    "floorNumber": 12,
    "unitNumber": "12A",
    "area": 85.5,
    "status": "OCCUPIED"
  }
]
```

### 2. Lấy thông tin căn hộ theo ID
```http
GET /api/apartments/{id}
```

### 3. Cập nhật thông tin căn hộ
```http
PUT /api/apartments/{id}
Content-Type: application/json

{
  "floorNumber": 12,
  "unitNumber": "12A",
  "area": 85.5,
  "status": "OCCUPIED"
}
```

### 4. Liên kết cư dân với căn hộ
```http
POST /api/apartments/{apartmentId}/residents
Content-Type: application/json

{
  "residentId": 1,
  "relationType": "Chủ sở hữu",
  "moveInDate": "2024-01-01",
  "moveOutDate": null
}
```

**Response:**
```json
{
  "success": true,
  "message": "Liên kết cư dân với căn hộ thành công!",
  "data": null
}
```

### 5. Hủy liên kết cư dân với căn hộ
```http
DELETE /api/apartments/{apartmentId}/residents
Content-Type: application/json

{
  "residentId": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Hủy liên kết cư dân với căn hộ thành công!",
  "data": null
}
```

### 6. Lấy danh sách cư dân của căn hộ
```http
GET /api/apartments/{apartmentId}/residents
```

**Response:**
```json
[
  {
    "apartmentId": 1,
    "residentId": 1,
    "relationType": "Chủ sở hữu",
    "moveInDate": "2024-01-01",
    "moveOutDate": null
  }
]
```

### 7. Lấy danh sách căn hộ theo tòa nhà
```http
GET /api/apartments/building/{buildingId}
```

### 8. Lấy danh sách căn hộ theo trạng thái
```http
GET /api/apartments/status/{status}
```

**Các trạng thái có thể:**
- `VACANT`: Trống
- `OCCUPIED`: Có người ở
- `MAINTENANCE`: Bảo trì
- `RESERVED`: Đã đặt trước

## Luồng hoạt động

### Liên kết cư dân-căn hộ:
1. Admin chọn căn hộ và cư dân
2. Hệ thống kiểm tra:
   - Căn hộ tồn tại
   - Cư dân tồn tại
   - Chưa có liên kết trước đó
3. Tạo liên kết với thông tin:
   - Loại quan hệ (Chủ sở hữu, Người thuê, Thành viên)
   - Ngày vào ở
   - Ngày rời đi (nếu có)
4. Tự động cập nhật trạng thái căn hộ thành OCCUPIED

### Hủy liên kết cư dân-căn hộ:
1. Admin chọn căn hộ và cư dân cần hủy liên kết
2. Hệ thống xóa liên kết
3. Kiểm tra nếu không còn cư dân nào thì chuyển trạng thái về VACANT

## Lưu ý quan trọng

### Không thể thêm/xóa căn hộ:
- Theo yêu cầu tài liệu, danh sách căn hộ được cấu hình cố định từ ban đầu
- Chỉ có thể cập nhật thông tin căn hộ, không thể tạo mới hoặc xóa
- Điều này đảm bảo tính ổn định của hệ thống

### Quản lý trạng thái tự động:
- Khi liên kết cư dân đầu tiên: VACANT → OCCUPIED
- Khi hủy liên kết cuối cùng: OCCUPIED → VACANT
- Trạng thái được cập nhật tự động, không cần can thiệp thủ công

### Loại quan hệ:
- **Chủ sở hữu**: Người sở hữu căn hộ
- **Người thuê**: Người thuê căn hộ
- **Thành viên**: Thành viên gia đình

### Validation:
- Kiểm tra căn hộ và cư dân tồn tại
- Kiểm tra liên kết chưa tồn tại (khi tạo mới)
- Kiểm tra liên kết đã tồn tại (khi hủy)

## Ví dụ sử dụng

### Liên kết cư dân mới:
```bash
curl -X POST "http://localhost:8080/api/apartments/1/residents" \
  -H "Content-Type: application/json" \
  -d '{
    "residentId": 1,
    "relationType": "Chủ sở hữu",
    "moveInDate": "2024-01-01"
  }'
```

### Xem cư dân của căn hộ:
```bash
curl -X GET "http://localhost:8080/api/apartments/1/residents"
```

### Xem căn hộ trống:
```bash
curl -X GET "http://localhost:8080/api/apartments/status/VACANT"
``` 