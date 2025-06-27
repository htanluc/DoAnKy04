# Bảng Mô Tả API Đăng Nhập - Apartment Portal

## 1. Tổng quan
Chức năng đăng nhập cho phép người dùng xác thực và nhận JWT token để truy cập các API được bảo vệ.

## 2. API Endpoints

### 2.1. Đăng nhập
- **URL:** `POST /api/auth/login`
- **Method:** `POST`
- **Content-Type:** `application/json`
- **Authentication:** Không cần

#### Request Body:
```json
{
  "phoneNumber": "admin",
  "password": "admin123"
}
```

#### Response Success (200):
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "type": "Bearer",
    "id": 1,
    "username": "admin",
    "email": "admin@apartment.com",
    "phoneNumber": "admin",
    "roles": [
      {
        "id": 1,
        "name": "ADMIN"
      }
    ]
  }
}
```

#### Response Error (401):
```json
{
  "success": false,
  "message": "Invalid phone number or password",
  "data": null
}
```

#### Response Error (400):
```json
{
  "success": false,
  "message": "Phone number and password are required",
  "data": null
}
```

### 2.2. Đăng ký
- **URL:** `POST /api/auth/register`
- **Method:** `POST`
- **Content-Type:** `application/json`
- **Authentication:** Không cần

#### Request Body:
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "phoneNumber": "0123456789",
  "password": "password123"
}
```

#### Response Success (201):
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 2,
    "username": "newuser",
    "email": "newuser@example.com",
    "phoneNumber": "0123456789",
    "status": "ACTIVE"
  }
}
```

### 2.3. Kiểm tra token
- **URL:** `GET /api/auth/validate`
- **Method:** `GET`
- **Authentication:** Bearer Token

#### Response Success (200):
```json
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@apartment.com",
    "phoneNumber": "admin",
    "roles": [
      {
        "id": 1,
        "name": "ADMIN"
      }
    ]
  }
}
```

## 3. Bảng Mô Tả Chi Tiết

| Trường | Kiểu dữ liệu | Bắt buộc | Mô tả | Ví dụ |
|--------|-------------|----------|-------|-------|
| **Request Login** |
| phoneNumber | String | ✅ | Số điện thoại đăng nhập | "admin" |
| password | String | ✅ | Mật khẩu | "admin123" |
| **Response Login** |
| success | Boolean | ✅ | Trạng thái thành công | true |
| message | String | ✅ | Thông báo | "Login successful" |
| data.token | String | ✅ | JWT token | "eyJhbGciOiJIUzI1NiIs..." |
| data.type | String | ✅ | Loại token | "Bearer" |
| data.id | Long | ✅ | ID người dùng | 1 |
| data.username | String | ✅ | Tên đăng nhập | "admin" |
| data.email | String | ✅ | Email | "admin@apartment.com" |
| data.phoneNumber | String | ✅ | Số điện thoại | "admin" |
| data.roles | Array | ✅ | Danh sách vai trò | [{"id": 1, "name": "ADMIN"}] |

## 4. Các Trường Hợp Lỗi

| Mã lỗi | Mô tả | Nguyên nhân |
|--------|-------|-------------|
| 400 | Bad Request | Thiếu thông tin bắt buộc |
| 401 | Unauthorized | Sai thông tin đăng nhập |
| 500 | Internal Server Error | Lỗi server |

## 5. Cách Sử Dụng JWT Token

### 5.1. Lưu trữ token
```javascript
// Sau khi đăng nhập thành công
localStorage.setItem('token', response.data.token);
localStorage.setItem('user', JSON.stringify(response.data));
```

### 5.2. Gửi token trong header
```javascript
// Thêm vào header của mọi request
const token = localStorage.getItem('token');
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### 5.3. Kiểm tra token hết hạn
```javascript
// Token có thời hạn 1 giờ (3600000ms)
// Tự động logout khi token hết hạn
```

## 6. Các Vai Trò (Roles)

| Role | Mô tả | Quyền hạn |
|------|-------|-----------|
| ADMIN | Quản trị viên | Toàn quyền |
| RESIDENT | Cư dân | Xem thông tin cá nhân, đặt dịch vụ |
| STAFF | Nhân viên | Quản lý dịch vụ, xử lý yêu cầu |

## 7. Ví Dụ Code Frontend

### 7.1. React/JavaScript
```javascript
// Hàm đăng nhập
const login = async (phoneNumber, password) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber,
        password
      })
    });

    const data = await response.json();
    
    if (data.success) {
      // Lưu token và thông tin user
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data));
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Hàm kiểm tra token
const checkAuth = async () => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const response = await fetch('/api/auth/validate', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};
```

### 7.2. Axios
```javascript
import axios from 'axios';

// Cấu hình axios
axios.defaults.baseURL = 'http://localhost:8080';

// Interceptor để thêm token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Hàm đăng nhập
const login = async (phoneNumber, password) => {
  const response = await axios.post('/api/auth/login', {
    phoneNumber,
    password
  });
  return response.data;
};
```

## 8. Bảo Mật

### 8.1. Token Security
- Token có thời hạn 1 giờ
- Sử dụng HTTPS trong production
- Không lưu token trong URL

### 8.2. Password Security
- Mật khẩu được mã hóa bằng BCrypt
- Yêu cầu mật khẩu tối thiểu 6 ký tự

## 9. Testing

### 9.1. Test với Postman
1. Tạo request POST đến `http://localhost:8080/api/auth/login`
2. Body (raw JSON):
```json
{
  "phoneNumber": "admin",
  "password": "admin123"
}
```

### 9.2. Test với curl
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"admin","password":"admin123"}'
```

## 10. Lưu Ý Quan Trọng

1. **Base URL:** `http://localhost:8080` (development)
2. **Token Expiration:** 1 giờ (3600000ms)
3. **CORS:** Đã được cấu hình cho tất cả origins
4. **Error Handling:** Luôn kiểm tra `success` field trong response
5. **Logout:** Xóa token khỏi localStorage khi logout 