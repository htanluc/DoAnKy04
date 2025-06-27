# Hướng dẫn sử dụng API Authentication

## Tổng quan
Hệ thống đã được bổ sung đầy đủ các chức năng authentication theo yêu cầu tài liệu:
- Đăng ký tài khoản với xác thực OTP
- Đăng nhập/Đăng xuất
- Đổi mật khẩu
- Khôi phục mật khẩu
- Xác thực OTP

## Các API Endpoints

### 1. Đăng ký tài khoản
```http
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "Nguyễn Văn A",
  "idCardNumber": "123456789012",
  "email": "nguyenvana@example.com",
  "phoneNumber": "0123456789",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đăng ký thành công! Vui lòng kiểm tra email/SMS để xác thực OTP.",
  "data": null
}
```

### 2. Xác thực OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "emailOrPhone": "nguyenvana@example.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Xác thực OTP thành công!",
  "data": null
}
```

### 3. Gửi lại OTP
```http
POST /api/auth/resend-otp
Content-Type: application/json

{
  "emailOrPhone": "nguyenvana@example.com"
}
```

### 4. Đăng nhập
```http
POST /api/auth/login
Content-Type: application/json

{
  "phoneNumber": "0123456789",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "token": "access_token_jwt",
    "refreshToken": "refresh_token_string",
    "type": "Bearer",
    "id": 1,
    "username": "admin",
    "email": "admin@apartment.com",
    "phoneNumber": "admin",
    "roles": ["ADMIN"]
  }
}
```

### 5. Đổi mật khẩu (cần đăng nhập)
```http
POST /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "oldPassword": "password123",
  "newPassword": "newpassword123",
  "confirmNewPassword": "newpassword123"
}
```

### 6. Quên mật khẩu
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "emailOrPhone": "nguyenvana@example.com"
}
```

### 7. Đặt lại mật khẩu
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "nguyenvana@example.com", // email hoặc phone đã gửi OTP
  "newPassword": "newpassword123",
  "confirmNewPassword": "newpassword123"
}
```

## Luồng hoạt động

### Đăng ký tài khoản:
1. User gửi thông tin đăng ký
2. Hệ thống kiểm tra email/phone chưa tồn tại
3. Tạo tài khoản với trạng thái INACTIVE
4. Gửi OTP qua email/SMS
5. User nhập OTP để kích hoạt tài khoản
6. Tài khoản chuyển sang trạng thái ACTIVE

### Khôi phục mật khẩu:
1. User nhập email/phone
2. Hệ thống gửi OTP
3. User nhập OTP và mật khẩu mới
4. Hệ thống cập nhật mật khẩu

## Lưu ý kỹ thuật

### OTP Storage:
- Hiện tại sử dụng in-memory storage (ConcurrentHashMap)
- Trong production nên sử dụng Redis hoặc database
- OTP có thời hạn 10 phút

### Bảo mật:
- Mật khẩu được hash bằng BCrypt
- JWT token có thời hạn
- CORS được cấu hình cho frontend

### Validation:
- Email format validation
- Phone number format validation (10-11 số)
- Password length validation (6-50 ký tự)
- CCCD/CCCD format validation (9-12 số)

## Test Endpoints

### Public endpoint (không cần đăng nhập):
```http
GET /api/test/public
```

### Protected endpoint (cần đăng nhập):
```http
GET /api/test/auth
Authorization: Bearer <token>
```

## Demo OTP
Trong môi trường development, OTP sẽ được in ra console:
```
OTP for nguyenvana@example.com: 123456 (Purpose: REGISTER)
```

Trong production, cần tích hợp với:
- Email service (SendGrid, AWS SES)
- SMS service (Twilio, Viettel SMS)

## Đăng nhập (Login)
- **Endpoint:** `POST /api/auth/login`
- **Response:**
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "token": "access_token_jwt",
    "refreshToken": "refresh_token_string",
    "type": "Bearer",
    "id": 1,
    "username": "admin",
    "email": "admin@apartment.com",
    "phoneNumber": "admin",
    "roles": ["ADMIN"]
  }
}
```
- **FE cần lưu cả `token` và `refreshToken` để sử dụng cho các request tiếp theo.**

---

## Làm mới access token (Refresh Token)
- **Endpoint:** `POST /api/auth/refresh-token`
- **Request body:**
```json
{
  "refreshToken": "refresh_token_string"
}
```
- **Response:**
```json
{
  "success": true,
  "message": "Cấp mới access token thành công",
  "data": {
    "token": "access_token_moi",
    "refreshToken": "refresh_token_string"
  }
}
```
- **FE sử dụng access token mới cho các request tiếp theo.**
- Nếu refresh token hết hạn hoặc không hợp lệ, FE cần chuyển về màn hình đăng nhập.

---

## Hướng dẫn FE tích hợp refresh token
1. Khi đăng nhập thành công, lưu cả `token` và `refreshToken` vào localStorage/sessionStorage.
2. Khi access token hết hạn (401 hoặc lỗi xác thực), tự động gọi `/api/auth/refresh-token` để lấy access token mới.
3. Nếu refresh token hợp lệ, cập nhật lại access token (và refresh token nếu BE trả về mới).
4. Nếu refresh token hết hạn hoặc không hợp lệ, chuyển về màn hình đăng nhập.
5. Khi logout, xóa cả access token và refresh token khỏi localStorage/sessionStorage.

---

## Ví dụ code FE (pseudo-code)
```js
// Lưu token khi login
localStorage.setItem('token', data.token);
localStorage.setItem('refreshToken', data.refreshToken);

// Khi gặp lỗi 401:
fetch('/api/auth/refresh-token', {
  method: 'POST',
  body: JSON.stringify({ refreshToken: localStorage.getItem('refreshToken') })
})
  .then(res => res.json())
  .then(data => {
    localStorage.setItem('token', data.token);
    // Gửi lại request cũ với token mới
  });
``` 