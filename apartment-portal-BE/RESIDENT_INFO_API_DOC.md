# Resident Information API Documentation

## 🎯 **Cải tiến: API lấy thông tin cư dân đầy đủ**

Đã cải tiến API để trả về thông tin cư dân đầy đủ hơn:

### 📍 **API Endpoints:**

#### 1. **GET /api/apartment-residents** - Lấy tất cả cư dân
```bash
GET /api/apartment-residents
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
[
  {
    "apartmentId": 1,
    "userId": 38,
    "relationType": "OWNER",
    "moveInDate": "2024-01-01",
    "moveOutDate": null,
    "unitNumber": "A1-01",
    "buildingName": "Tòa A",
    
    // Thông tin cư dân đầy đủ
    "userFullName": "Nguyễn Văn A",
    "userPhoneNumber": "0901234567",
    "userEmail": "nguyenvana@email.com",
    "userAvatarUrl": "https://example.com/avatar.jpg",
    "userStatus": "ACTIVE",
    
    // Thông tin căn hộ đầy đủ
    "apartmentStatus": "OCCUPIED",
    "apartmentArea": 75.5,
    "apartmentFloorNumber": 1
  }
]
```

#### 2. **GET /api/apartment-residents/user/{userId}** - Lấy căn hộ của user
```bash
GET /api/apartment-residents/user/38
```

#### 3. **GET /api/apartments/{apartmentId}/residents** - Lấy cư dân của căn hộ
```bash
GET /api/apartments/1/residents
```

#### 4. **GET /api/admin/apartments/{id}/residents** - Admin lấy cư dân của căn hộ
```bash
GET /api/admin/apartments/1/residents
```

### 🔧 **Thông tin mới được bổ sung:**

#### **Thông tin cư dân:**
- ✅ `userFullName` - Tên đầy đủ
- ✅ `userPhoneNumber` - Số điện thoại
- ✅ `userEmail` - Email
- ✅ `userAvatarUrl` - Avatar
- ✅ `userStatus` - Trạng thái tài khoản

#### **Thông tin căn hộ:**
- ✅ `apartmentStatus` - Trạng thái căn hộ (OCCUPIED/VACANT)
- ✅ `apartmentArea` - Diện tích (m²)
- ✅ `apartmentFloorNumber` - Số tầng
- ✅ `unitNumber` - Mã căn hộ
- ✅ `buildingName` - Tên tòa nhà

### 📋 **So sánh trước và sau:**

**Before (cũ):**
```json
{
  "apartmentId": 1,
  "userId": 38,
  "relationType": "OWNER",
  "moveInDate": "2024-01-01",
  "moveOutDate": null,
  "unitNumber": "A1-01",
  "buildingName": "Tòa A"
}
```

**After (mới):**
```json
{
  "apartmentId": 1,
  "userId": 38,
  "relationType": "OWNER",
  "moveInDate": "2024-01-01",
  "moveOutDate": null,
  "unitNumber": "A1-01",
  "buildingName": "Tòa A",
  
  // Thông tin cư dân đầy đủ
  "userFullName": "Nguyễn Văn A",
  "userPhoneNumber": "0901234567", 
  "userEmail": "nguyenvana@email.com",
  "userAvatarUrl": "https://example.com/avatar.jpg",
  "userStatus": "ACTIVE",
  
  // Thông tin căn hộ đầy đủ
  "apartmentStatus": "OCCUPIED",
  "apartmentArea": 75.5,
  "apartmentFloorNumber": 1
}
```

### 🎯 **Giải quyết vấn đề:**

**Before:**
```
❌ No static resource api/apartment-residents
```

**After:**
```
✅ GET /api/apartment-residents → Returns full resident information
```

### 🧪 **Test Commands:**

```bash
# Test basic endpoint
curl -X GET "http://localhost:8080/api/apartment-residents" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test user apartments
curl -X GET "http://localhost:8080/api/apartment-residents/user/38" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Test apartment residents
curl -X GET "http://localhost:8080/api/apartments/1/residents" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### ✅ **Features:**

1. **Complete resident information** - Thông tin cư dân đầy đủ
2. **Complete apartment information** - Thông tin căn hộ đầy đủ
3. **Enhanced DTOs** - DTO được cải tiến với thông tin chi tiết
4. **Multiple endpoints** - Nhiều endpoint để linh hoạt
5. **Error handling** - Xử lý lỗi tốt

### 🚀 **Ready for Frontend:**

Frontend giờ có thể hiển thị:
- ✅ **Tên cư dân** đầy đủ
- ✅ **Số điện thoại** và **email**
- ✅ **Avatar** cư dân
- ✅ **Trạng thái** tài khoản
- ✅ **Thông tin căn hộ** chi tiết
- ✅ **Tên tòa nhà** và **mã căn hộ**

**Bây giờ frontend sẽ có đủ thông tin để hiển thị danh sách cư dân đầy đủ!** 🎉 