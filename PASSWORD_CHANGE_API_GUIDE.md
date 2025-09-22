# 🔐 Hướng Dẫn Sử Dụng API Đổi Mật Khẩu Cư Dân

## 📋 Tổng Quan

Tài liệu này hướng dẫn chi tiết cách sử dụng các API endpoints để đổi mật khẩu của cư dân trong hệ thống quản lý chung cư.

## 🌐 Base URL

```
http://localhost:8080/api/auth
```

## 📚 Danh Sách Endpoints

### 1. 🔄 Đổi Mật Khẩu (Yêu cầu xác thực)

**Endpoint:** `POST /change-password`

**Mô tả:** Cho phép cư dân đổi mật khẩu khi đã đăng nhập và biết mật khẩu cũ.

#### 📥 Request

**Headers:**
```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

**Body:**
```json
{
  "oldPassword": "matkhau_cu_123",
  "newPassword": "matkhau_moi_456",
  "confirmNewPassword": "matkhau_moi_456"
}
```

#### ✅ Response Thành Công (200)

```json
{
  "success": true,
  "message": "Đổi mật khẩu thành công!",
  "data": null
}
```

#### ❌ Response Lỗi (400)

```json
{
  "success": false,
  "message": "Mật khẩu cũ không đúng",
  "data": null
}
```

#### 🔧 Validation Rules

| Trường | Bắt buộc | Độ dài | Mô tả |
|--------|----------|--------|--------|
| `oldPassword` | ✅ | - | Mật khẩu hiện tại |
| `newPassword` | ✅ | 6-50 ký tự | Mật khẩu mới |
| `confirmNewPassword` | ✅ | - | Xác nhận mật khẩu mới |

---

### 2. 📧 Quên Mật Khẩu (Cũ)

**Endpoint:** `POST /forgot-password`

**Mô tả:** Gửi yêu cầu đặt lại mật khẩu qua email hoặc số điện thoại.

#### 📥 Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "emailOrPhone": "resident@example.com"
}
```

hoặc

```json
{
  "emailOrPhone": "0123456789"
}
```

#### ✅ Response Thành Công (200)

```json
{
  "success": true,
  "message": "Email đặt lại mật khẩu đã được gửi!",
  "data": null
}
```

#### ❌ Response Lỗi (400)

```json
{
  "success": false,
  "message": "Không tìm thấy tài khoản với email/số điện thoại này",
  "data": null
}
```

---

### 2.1. 🔐 Quên Mật Khẩu Mới (Với Số Điện Thoại + Email)

**Endpoint:** `POST /forgot-password-phone-email`

**Mô tả:** Đặt lại mật khẩu bằng cách nhập số điện thoại và email đã đăng ký. Hệ thống sẽ tạo mật khẩu ngẫu nhiên và gửi qua email.

#### 📥 Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "phoneNumber": "0123456789",
  "email": "resident@example.com"
}
```

#### ✅ Response Thành Công (200)

```json
{
  "success": true,
  "message": "Mật khẩu mới đã được gửi qua email!",
  "data": null
}
```

#### ❌ Response Lỗi (400)

```json
{
  "success": false,
  "message": "Không tìm thấy tài khoản với số điện thoại này",
  "data": null
}
```

hoặc

```json
{
  "success": false,
  "message": "Email không khớp với tài khoản đã đăng ký",
  "data": null
}
```

#### 🔧 Validation Rules

| Trường | Bắt buộc | Format | Mô tả |
|--------|----------|--------|--------|
| `phoneNumber` | ✅ | 10-11 chữ số | Số điện thoại đã đăng ký |
| `email` | ✅ | Email hợp lệ | Email đã đăng ký, phải khớp với tài khoản |

---

### 3. 🔄 Đặt Lại Mật Khẩu

**Endpoint:** `POST /reset-password`

**Mô tả:** Đặt lại mật khẩu mới sử dụng token xác thực.

#### 📥 Request

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "token": "reset_token_here",
  "newPassword": "matkhau_moi_789",
  "confirmNewPassword": "matkhau_moi_789"
}
```

#### ✅ Response Thành Công (200)

```json
{
  "success": true,
  "message": "Đặt lại mật khẩu thành công!",
  "data": null
}
```

#### ❌ Response Lỗi (400)

```json
{
  "success": false,
  "message": "Token không hợp lệ hoặc đã hết hạn",
  "data": null
}
```

---

## 💻 Ví Dụ Sử Dụng

### JavaScript/TypeScript (Frontend)

```typescript
// Đổi mật khẩu
async function changePassword(oldPassword: string, newPassword: string) {
  try {
    const response = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        oldPassword,
        newPassword,
        confirmNewPassword: newPassword
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Đổi mật khẩu thành công!');
      return true;
    } else {
      console.error('Lỗi:', result.message);
      return false;
    }
  } catch (error) {
    console.error('Lỗi kết nối:', error);
    return false;
  }
}

// Quên mật khẩu (cũ)
async function forgotPassword(emailOrPhone: string) {
  try {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        emailOrPhone
      })
    });
    
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error('Lỗi:', error);
    return false;
  }
}

// Quên mật khẩu mới (với số điện thoại và email)
async function forgotPasswordWithPhoneAndEmail(phoneNumber: string, email: string) {
  try {
    const response = await fetch('/api/auth/forgot-password-phone-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phoneNumber,
        email
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Mật khẩu mới đã được gửi qua email!');
      return true;
    } else {
      console.error('Lỗi:', result.message);
      return false;
    }
  } catch (error) {
    console.error('Lỗi kết nối:', error);
    return false;
  }
}
```

### cURL Examples

```bash
# Đổi mật khẩu
curl -X POST "http://localhost:8080/api/auth/change-password" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "oldPassword": "oldpass123",
    "newPassword": "newpass456",
    "confirmNewPassword": "newpass456"
  }'

# Quên mật khẩu (cũ)
curl -X POST "http://localhost:8080/api/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrPhone": "resident@example.com"
  }'

# Quên mật khẩu mới (với số điện thoại và email)
curl -X POST "http://localhost:8080/api/auth/forgot-password-phone-email" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "0123456789",
    "email": "resident@example.com"
  }'

# Đặt lại mật khẩu
curl -X POST "http://localhost:8080/api/auth/reset-password" \
  -H "Content-Type: application/json" \
  -d '{
    "token": "reset_token_here",
    "newPassword": "newpass789",
    "confirmNewPassword": "newpass789"
  }'
```

### React Hook Example

```typescript
import { useState } from 'react';

export const usePasswordChange = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const changePassword = async (oldPassword: string, newPassword: string) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword,
          newPassword,
          confirmNewPassword: newPassword
        })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Có lỗi xảy ra';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { changePassword, loading, error };
};
```

## 🛡️ Bảo Mật

### Yêu Cầu Bảo Mật

1. **Authentication**: Endpoint `/change-password` yêu cầu JWT token hợp lệ
2. **Password Encryption**: Mật khẩu được mã hóa bằng BCrypt trước khi lưu
3. **Rate Limiting**: Có giới hạn số lần thử đổi mật khẩu
4. **Logging**: Tất cả hoạt động đổi mật khẩu đều được ghi log

### Best Practices

1. **Frontend Validation**: Kiểm tra độ mạnh mật khẩu trước khi gửi request
2. **Error Handling**: Xử lý lỗi một cách graceful
3. **User Feedback**: Hiển thị thông báo rõ ràng cho người dùng
4. **Session Management**: Đăng xuất user sau khi đổi mật khẩu thành công

## 🚨 Xử Lý Lỗi

### Mã Lỗi Thường Gặp

| Mã | Mô tả | Giải pháp |
|----|-------|-----------|
| 400 | Bad Request | Kiểm tra format request body |
| 401 | Unauthorized | Kiểm tra JWT token |
| 404 | Not Found | Kiểm tra URL endpoint |
| 500 | Internal Server Error | Liên hệ admin |

### Thông Báo Lỗi Phổ Biến

```json
{
  "success": false,
  "message": "Mật khẩu cũ không đúng"
}

{
  "success": false,
  "message": "Mật khẩu xác nhận không khớp"
}

{
  "success": false,
  "message": "Mật khẩu phải từ 6 đến 50 ký tự"
}

{
  "success": false,
  "message": "Không tìm thấy tài khoản"
}
```

## 📱 Testing

### Postman Collection

```json
{
  "info": {
    "name": "Password Change API",
    "description": "Test collection for password change endpoints"
  },
  "item": [
    {
      "name": "Change Password",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"oldPassword\": \"oldpass123\",\n  \"newPassword\": \"newpass456\",\n  \"confirmNewPassword\": \"newpass456\"\n}"
        },
        "url": {
          "raw": "{{baseUrl}}/api/auth/change-password",
          "host": ["{{baseUrl}}"],
          "path": ["api", "auth", "change-password"]
        }
      }
    }
  ]
}
```

## 🔗 Liên Kết Liên Quan

- [API Documentation](./admin_api_doc.txt)
- [Authentication Guide](./README.md)
- [Error Codes Reference](./ERROR_CODES.md)

---

**📞 Hỗ Trợ:** Nếu gặp vấn đề, vui lòng liên hệ team phát triển hoặc tạo issue trên repository.
