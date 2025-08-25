# Test Toggle Status API

## Kiểm tra Endpoint Toggle Status

### 1. Chuẩn bị
- Đảm bảo backend đang chạy
- Có JWT token với quyền ADMIN hoặc STAFF
- Có ít nhất một cấu hình giới hạn xe trong database

### 2. Test API

#### Bước 1: Lấy danh sách cấu hình
```bash
GET /api/vehicle-capacity-config
Authorization: Bearer {JWT_TOKEN}
```

#### Bước 2: Toggle status của cấu hình đầu tiên
```bash
PATCH /api/vehicle-capacity-config/{id}/toggle-status
Authorization: Bearer {JWT_TOKEN}
```

#### Bước 3: Kiểm tra kết quả
- Nếu `isActive` trước đó là `true` → sau khi toggle sẽ là `false`
- Nếu `isActive` trước đó là `false` → sau khi toggle sẽ là `true`

### 3. Test với Frontend

#### HTML Button
```html
<button onclick="toggleStatus(1)" class="btn btn-warning">
  Toggle Status
</button>
```

#### JavaScript Function
```javascript
function toggleStatus(configId) {
  fetch(`/api/vehicle-capacity-config/${configId}/toggle-status`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log('Status updated:', data);
    // Cập nhật UI
    updateStatusDisplay(data);
  })
  .catch(error => {
    console.error('Error:', error);
  });
}

function updateStatusDisplay(config) {
  const statusElement = document.getElementById(`status-${config.id}`);
  if (statusElement) {
    statusElement.textContent = config.isActive ? 'Đang hoạt động' : 'Đã tắt';
    statusElement.className = config.isActive ? 'badge badge-success' : 'badge badge-secondary';
  }
}
```

### 4. Expected Results

#### Success Response (200 OK)
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

#### Error Response (400 Bad Request)
```json
{
  "error": "Không tìm thấy cấu hình giới hạn xe"
}
```

### 5. Lưu ý

1. **Quyền truy cập**: Chỉ ADMIN hoặc STAFF mới có thể toggle status
2. **Trạng thái**: Khi `isActive = false`, cấu hình sẽ không được áp dụng khi đăng ký xe mới
3. **Audit trail**: Mỗi lần toggle sẽ cập nhật `updatedAt` timestamp
4. **Validation**: Hệ thống sẽ kiểm tra xem cấu hình có tồn tại không trước khi toggle

### 6. Troubleshooting

#### Lỗi 401 Unauthorized
- Kiểm tra JWT token có hợp lệ không
- Kiểm tra token có quyền ADMIN/STAFF không

#### Lỗi 400 Bad Request
- Kiểm tra config ID có tồn tại trong database không
- Kiểm tra logs của application

#### Lỗi 500 Internal Server Error
- Kiểm tra database connection
- Kiểm tra logs của application
