# User Vehicles API Documentation

## 🎯 **Mới được thêm: API lấy danh sách xe theo User ID**

Đã thêm các API endpoints để lấy danh sách xe của người dùng theo ID:

### 📍 **Endpoints mới:**

#### 1. **GET /api/users/{id}/vehicles**
**Mô tả:** Lấy danh sách xe của người dùng theo ID (có thể cần authentication)

**Request:**
```bash
GET /api/users/38/vehicles
```

**Response:**
```json
[
  {
    "id": 1,
    "licensePlate": "30A-12345",
    "vehicleType": "MOTORCYCLE",
    "brand": "Honda",
    "model": "Wave",
    "color": "Đỏ",
    "userId": 38,
    "status": "APPROVED",
    "monthlyFee": 50000,
    "images": ["url1", "url2"]
  }
]
```

#### 2. **GET /api/admin/users/{id}/vehicles** 
**Mô tả:** Lấy danh sách xe của người dùng theo ID (admin endpoint)

**Request:**
```bash
GET /api/admin/users/38/vehicles
```

**Response:** Tương tự như endpoint trên

#### 3. **GET /api/admin/vehicles/user/{userId}**
**Mô tả:** Alternative admin endpoint (khớp với frontend call từ log)

**Request:**
```bash
GET /api/admin/vehicles/user/38
```

**Response:** Tương tự như các endpoint trên

### 🔧 **VehicleService Methods:**

Đã thêm method mới:
```java
public List<VehicleDto> getVehiclesByUserId(Long userId) {
    List<Vehicle> vehicles = vehicleRepository.findByUserId(userId);
    return vehicles.stream()
            .map(vehicleMapper::toDto)
            .collect(Collectors.toList());
}
```

### 📋 **So sánh với APIs hiện có:**

| Endpoint | Mô tả | Access Level |
|----------|-------|--------------|
| `GET /api/vehicles/my` | Xe của current user | User (authenticated) |
| `GET /api/users/{id}/vehicles` | **MỚI:** Xe của user theo ID | User/Admin |
| `GET /api/admin/users/{id}/vehicles` | **MỚI:** Xe của user theo ID | Admin only |
| `GET /api/admin/vehicles/user/{userId}` | **MỚI:** Alternative admin endpoint | Admin only |
| `GET /api/admin/apartments/{id}/vehicles` | Xe của căn hộ | Admin only |

### 🎯 **Giải quyết lỗi từ log:**

**Before:** 
```
❌ No static resource api/admin/vehicles/user/38
```

**After:**
```
✅ GET /api/admin/vehicles/user/38 → Returns user vehicles list
```

### 🧪 **Test Commands:**

```bash
# Test basic endpoint
curl -X GET "http://localhost:8080/api/users/38/vehicles" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test admin endpoint  
curl -X GET "http://localhost:8080/api/admin/vehicles/user/38" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Test alternative admin endpoint
curl -X GET "http://localhost:8080/api/admin/users/38/vehicles" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"
```

### ✅ **Features:**

1. **Multiple endpoint options** cho flexibility
2. **Proper error handling** với try-catch
3. **Debug logging** để troubleshoot  
4. **Consistent response format** như các APIs khác
5. **Uses existing VehicleRepository.findByUserId()** method

### 🚀 **Ready to Use:**

Frontend giờ có thể gọi bất kỳ endpoint nào trong số này để lấy danh sách xe của user!

**Endpoint phù hợp nhất cho frontend:**
```javascript
// ✅ RECOMMENDED
GET /api/admin/vehicles/user/{userId}
```

Endpoint này khớp với pattern mà frontend đang gọi từ log error! 🎉