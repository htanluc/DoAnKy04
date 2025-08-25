# Vehicle Capacity Limit API Documentation

## Tổng quan
API này cung cấp các endpoint để quản lý giới hạn số lượng xe có thể đăng ký trong từng tòa nhà của chung cư. Hệ thống sẽ tự động kiểm tra giới hạn khi có xe mới đăng ký và ngăn chặn việc đăng ký nếu đã đạt giới hạn.

## Base URL
```
http://localhost:8080/api/vehicle-capacity-config
```

## Authentication
Tất cả các API endpoints đều yêu cầu quyền truy cập ADMIN:
- Header: `Authorization: Bearer {JWT_TOKEN}`
- Role: `ADMIN`

## API Endpoints

### 1. Tạo Cấu hình Giới hạn Xe

**POST** `/api/vehicle-capacity-config`

Tạo cấu hình giới hạn xe mới cho một tòa nhà.

#### Request Body
```json
{
  "buildingId": 1,
  "maxCars": 50,
  "maxMotorcycles": 100
}
```

#### Response
**Success (201 Created)**
```json
{
  "id": 1,
  "buildingId": 1,
  "maxCars": 50,
  "maxMotorcycles": 100,
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00",
  "currentCars": 0,
  "currentMotorcycles": 0,
  "remainingCars": 50,
  "remainingMotorcycles": 100
}
```

**Error (400 Bad Request)**
```json
{
  "error": "Validation failed",
  "details": "buildingId is required"
}
```

### 2. Cập nhật Cấu hình Giới hạn Xe

**PUT** `/api/vehicle-capacity-config/{id}`

Cập nhật cấu hình giới hạn xe theo ID.

#### Path Parameters
- `id`: ID của cấu hình cần cập nhật

#### Request Body
```json
{
  "buildingId": 1,
  "maxCars": 60,
  "maxMotorcycles": 120
}
```

#### Response
**Success (200 OK)**
```json
{
  "id": 1,
  "buildingId": 1,
  "maxCars": 60,
  "maxMotorcycles": 120,
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T11:45:00",
  "currentCars": 45,
  "currentMotorcycles": 85,
  "remainingCars": 15,
  "remainingMotorcycles": 35
}
```

**Error (404 Not Found)**
```json
{
  "error": "Cấu hình giới hạn xe không tồn tại"
}
```

### 3. Lấy Cấu hình theo ID

**GET** `/api/vehicle-capacity-config/{id}`

Lấy thông tin chi tiết cấu hình giới hạn xe theo ID.

#### Path Parameters
- `id`: ID của cấu hình cần lấy

#### Response
**Success (200 OK)**
```json
{
  "id": 1,
  "buildingId": 1,
  "maxCars": 50,
  "maxMotorcycles": 100,
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00",
  "currentCars": 45,
  "currentMotorcycles": 85,
  "remainingCars": 5,
  "remainingMotorcycles": 15
}
```

**Error (404 Not Found)**
```json
{
  "error": "Cấu hình giới hạn xe không tồn tại"
}
```

### 4. Lấy Cấu hình theo Tòa nhà

**GET** `/api/vehicle-capacity-config/building/{buildingId}`

Lấy cấu hình giới hạn xe cho một tòa nhà cụ thể.

#### Path Parameters
- `buildingId`: ID của tòa nhà

#### Response
**Success (200 OK)**
```json
{
  "id": 1,
  "buildingId": 1,
  "maxCars": 50,
  "maxMotorcycles": 100,
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00",
  "currentCars": 45,
  "currentMotorcycles": 85,
  "remainingCars": 5,
  "remainingMotorcycles": 15
}
```

**Error (404 Not Found)**
```json
{
  "error": "Không tìm thấy cấu hình giới hạn xe cho tòa nhà này"
}
```

### 5. Lấy Tất cả Cấu hình

**GET** `/api/vehicle-capacity-config`

Lấy danh sách tất cả cấu hình giới hạn xe.

#### Query Parameters
- `page`: Số trang (mặc định: 0)
- `size`: Kích thước trang (mặc định: 20)
- `sort`: Sắp xếp theo trường (mặc định: "id")

#### Response
**Success (200 OK)**
```json
{
  "content": [
    {
      "id": 1,
      "buildingId": 1,
      "maxCars": 50,
      "maxMotorcycles": 100,
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00",
      "updatedAt": "2024-01-15T10:30:00",
      "currentCars": 45,
      "currentMotorcycles": 85,
      "remainingCars": 5,
      "remainingMotorcycles": 15
    }
  ],
  "pageable": {
    "sort": {
      "sorted": true,
      "unsorted": false
    },
    "pageNumber": 0,
    "pageSize": 20,
    "offset": 0,
    "paged": true,
    "unpaged": false
  },
  "totalElements": 1,
  "totalPages": 1,
  "last": true,
  "first": true,
  "sort": {
    "sorted": true,
    "unsorted": false
  },
  "numberOfElements": 1,
  "size": 20,
  "number": 0
}
```

### 6. Xóa Cấu hình

**DELETE** `/api/vehicle-capacity-config/{id}`

Xóa cấu hình giới hạn xe theo ID.

#### Path Parameters
- `id`: ID của cấu hình cần xóa

#### Response
**Success (200 OK)**
```json
{
  "message": "Xóa cấu hình giới hạn xe thành công"
}
```

**Error (404 Not Found)**
```json
{
  "error": "Cấu hình giới hạn xe không tồn tại"
}
```

### 7. Kiểm tra Khả năng Đăng ký Xe

**GET** `/api/vehicle-capacity-config/check-capacity`

Kiểm tra xem có thể đăng ký thêm xe loại này vào tòa nhà không.

#### Query Parameters
- `buildingId`: ID của tòa nhà
- `vehicleType`: Loại xe (CAR_4_SEATS, CAR_7_SEATS, MOTORCYCLE, ELECTRIC_CAR, ELECTRIC_MOTORCYCLE)

#### Response
**Success (200 OK)**
```json
{
  "canAdd": true,
  "buildingId": 1,
  "vehicleType": "CAR_4_SEATS",
  "currentCount": 45,
  "maxCapacity": 50,
  "remainingSlots": 5,
  "message": "Có thể đăng ký thêm xe"
}
```

**Success (200 OK) - Đã đạt giới hạn**
```json
{
  "canAdd": false,
  "buildingId": 1,
  "vehicleType": "CAR_4_SEATS",
  "currentCount": 50,
  "maxCapacity": 50,
  "remainingSlots": 0,
  "message": "Đã đạt giới hạn xe cho loại xe này trong tòa nhà"
}
```

**Error (400 Bad Request)**
```json
{
  "error": "Thiếu thông tin buildingId hoặc vehicleType"
}
```

### 8. Toggle Trạng thái Kích hoạt

**PATCH** `/api/vehicle-capacity-config/{id}/toggle-status`

Bật/tắt trạng thái kích hoạt của cấu hình giới hạn xe.

#### Path Parameters
- `id`: ID của cấu hình cần toggle status

#### Response
**Success (200 OK)**
```json
{
  "id": 1,
  "buildingId": 1,
  "maxCars": 50,
  "maxMotorcycles": 100,
  "isActive": false,
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T12:00:00",
  "currentCars": 45,
  "currentMotorcycles": 85,
  "remainingCars": 5,
  "remainingMotorcycles": 15
}
```

**Error (400 Bad Request)**
```json
{
  "error": "Không tìm thấy cấu hình giới hạn xe"
}
```

## Vehicle Management APIs

### 9. Lấy Danh sách Xe Chờ Duyệt (FIFO)

**GET** `/api/vehicles/pending`

Lấy danh sách xe chờ duyệt, sắp xếp theo thứ tự đăng ký (FIFO - First In, First Out).

#### Response
**Success (200 OK)**
```json
[
  {
    "id": 12,
    "licensePlate": "30C-12356",
    "vehicleType": "BICYCLE",
    "vehicleTypeDisplayName": "Xe đạp",
    "brand": "Giant",
    "model": "Escape 3",
    "color": "Đen",
    "status": "PENDING",
    "statusDisplayName": "Chờ duyệt",
    "userFullName": "Hồ Văn Long",
    "apartmentId": 3,
    "apartmentUnitNumber": "A03-04",
    "createdAt": "2024-01-15T10:30:00",
    "updatedAt": "2024-01-15T10:30:00"
  }
]
```

### 10. Lấy Tất cả Xe (FIFO)

**GET** `/api/vehicles`

Lấy danh sách tất cả xe, sắp xếp theo thứ tự đăng ký (FIFO).

### 11. Lấy Xe theo Trạng thái (FIFO)

**GET** `/api/vehicles/status/{status}`

Lấy danh sách xe theo trạng thái, sắp xếp theo thứ tự đăng ký (FIFO).

## Data Models

### VehicleCapacityConfigDto
```json
{
  "id": "Long",
  "buildingId": "Long",
  "maxCars": "Integer",
  "maxMotorcycles": "Integer",
  "isActive": "Boolean",
  "createdAt": "LocalDateTime",
  "updatedAt": "LocalDateTime",
  "currentCars": "Integer",
  "currentMotorcycles": "Integer",
  "remainingCars": "Integer",
  "remainingMotorcycles": "Integer"
}
```

### VehicleCapacityConfigRequest
```json
{
  "buildingId": "Long",
  "maxCars": "Integer",
  "maxMotorcycles": "Integer"
}
```

### CapacityCheckResponse
```json
{
  "canAdd": "Boolean",
  "buildingId": "Long",
  "vehicleType": "String",
  "currentCount": "Integer",
  "maxCapacity": "Integer",
  "remainingSlots": "Integer",
  "message": "String"
}
```

## Vehicle Types

Hệ thống hỗ trợ các loại xe sau:

| Vehicle Type | Mô tả | Thuộc nhóm giới hạn |
|--------------|-------|---------------------|
| CAR_4_SEATS | Ô tô 4 chỗ | maxCars |
| CAR_7_SEATS | Ô tô 7 chỗ | maxCars |
| MOTORCYCLE | Xe máy | maxMotorcycles |
| ELECTRIC_CAR | Xe điện 4-7 chỗ | maxCars |
| ELECTRIC_MOTORCYCLE | Xe máy điện | maxMotorcycles |

## Error Codes

| HTTP Status | Error Code | Mô tả |
|-------------|------------|-------|
| 400 | BAD_REQUEST | Dữ liệu đầu vào không hợp lệ |
| 401 | UNAUTHORIZED | Chưa xác thực hoặc token hết hạn |
| 403 | FORBIDDEN | Không có quyền truy cập (không phải ADMIN) |
| 404 | NOT_FOUND | Không tìm thấy tài nguyên |
| 409 | CONFLICT | Xung đột dữ liệu (ví dụ: tòa nhà đã có cấu hình) |
| 500 | INTERNAL_SERVER_ERROR | Lỗi server |

## Usage Examples

### Frontend Integration

#### 1. Kiểm tra trước khi đăng ký xe
```javascript
const checkVehicleCapacity = async (buildingId, vehicleType) => {
  try {
    const response = await fetch(
      `/api/vehicle-capacity-config/check-capacity?buildingId=${buildingId}&vehicleType=${vehicleType}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const data = await response.json();
    
    if (!data.canAdd) {
      alert(`Không thể đăng ký xe: ${data.message}`);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Lỗi kiểm tra giới hạn:', error);
    return false;
  }
};
```

#### 2. Hiển thị thông tin giới hạn
```javascript
const displayCapacityInfo = async (buildingId) => {
  try {
    const response = await fetch(
      `/api/vehicle-capacity-config/building/${buildingId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const config = await response.json();
    
    // Hiển thị thông tin
    document.getElementById('maxCars').textContent = config.maxCars;
    document.getElementById('currentCars').textContent = config.currentCars;
    document.getElementById('remainingCars').textContent = config.remainingCars;
    
    // Tương tự cho các loại xe khác...
  } catch (error) {
    console.error('Lỗi lấy thông tin giới hạn:', error);
  }
};
```

#### 3. Quản lý cấu hình (Admin)
```javascript
const saveCapacityConfig = async (configData) => {
  try {
    const method = configData.id ? 'PUT' : 'POST';
    const url = configData.id 
      ? `/api/vehicle-capacity-config/${configData.id}`
      : '/api/vehicle-capacity-config';
    
    const response = await fetch(url, {
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(configData)
    });
    
    if (response.ok) {
      alert('Lưu cấu hình thành công!');
      // Refresh trang hoặc cập nhật UI
    } else {
      const error = await response.json();
      alert(`Lỗi: ${error.error}`);
    }
  } catch (error) {
    console.error('Lỗi lưu cấu hình:', error);
    alert('Có lỗi xảy ra khi lưu cấu hình');
  }
};
```

#### 4. Toggle trạng thái kích hoạt
```javascript
const toggleConfigStatus = async (configId) => {
  try {
    const response = await fetch(
      `/api/vehicle-capacity-config/${configId}/toggle-status`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.ok) {
      const updatedConfig = await response.json();
      const statusText = updatedConfig.isActive ? 'đã kích hoạt' : 'đã tắt';
      alert(`Cấu hình ${statusText} thành công!`);
      
      // Cập nhật UI
      updateConfigStatusInUI(configId, updatedConfig.isActive);
    } else {
      const error = await response.json();
      alert(`Lỗi: ${error.error}`);
    }
  } catch (error) {
    console.error('Lỗi toggle status:', error);
    alert('Có lỗi xảy ra khi thay đổi trạng thái');
  }
};

const updateConfigStatusInUI = (configId, isActive) => {
  // Cập nhật UI để hiển thị trạng thái mới
  const statusElement = document.querySelector(`[data-config-id="${configId}"] .status-indicator`);
  if (statusElement) {
    statusElement.textContent = isActive ? 'Đang hoạt động' : 'Đã tắt';
    statusElement.className = `status-indicator ${isActive ? 'active' : 'inactive'}`;
  }
};
```

## Security Notes

1. **Authentication Required**: Tất cả API endpoints đều yêu cầu JWT token
2. **Role-based Access**: Chỉ ADMIN mới có quyền truy cập
3. **Input Validation**: Tất cả input đều được validate
4. **SQL Injection Protection**: Sử dụng Spring Data JPA để bảo vệ
5. **XSS Protection**: Spring Boot tự động bảo vệ khỏi XSS

## Rate Limiting

Hiện tại không có giới hạn rate limiting, nhưng có thể được thêm vào trong tương lai.

## Monitoring & Logging

- Tất cả API calls đều được log
- Errors được log với stack trace
- Performance metrics được theo dõi
- Audit trail cho các thay đổi cấu hình

## Support

Nếu gặp vấn đề với API, vui lòng:
1. Kiểm tra logs của application
2. Xác nhận JWT token còn hiệu lực
3. Kiểm tra quyền truy cập (ADMIN role)
4. Liên hệ team backend để được hỗ trợ
