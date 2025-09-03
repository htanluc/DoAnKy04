# 🔧 Giải pháp: Redirect đúng dashboard khi có token

## 📋 Vấn đề

Khi user đã đăng nhập (có token), truy cập `http://localhost:3000/` sẽ hiển thị trang chủ thay vì redirect đến dashboard phù hợp với role của user.

**Mong muốn**: 
- Admin → `http://localhost:3000/admin-dashboard`
- Staff → `http://localhost:3000/staff-dashboard` 
- Resident → `http://localhost:3000/resident-dashboard`

## ✅ Giải pháp đã triển khai

### 1. **Cập nhật trang chủ (`app/page.tsx`)**

**Trước đây:**
```tsx
// Hiển thị nội dung admin dashboard trực tiếp
<AuthGuard>
  <AdminLayout title={"Tổng quan hệ thống"}>
    {/* Nội dung dashboard */}
  </AdminLayout>
</AuthGuard>
```

**Bây giờ:**
```tsx
// Sử dụng AuthRedirectGuard để redirect dựa trên role
<AuthRedirectGuard>
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-2 text-gray-600">Đang chuyển hướng...</p>
    </div>
  </div>
</AuthRedirectGuard>
```

### 2. **Cải thiện AuthRedirectGuard**

**Cập nhật fallback redirect:**
```tsx
// Trước: router.replace('/dashboard'); // fallback
// Sau: router.replace('/admin-dashboard'); // fallback to admin dashboard
```

## 🎯 Logic hoạt động

### **AuthRedirectGuard Logic:**
1. **Kiểm tra token**: Nếu có token trong localStorage
2. **Lấy thông tin user**: Parse user data từ localStorage
3. **Kiểm tra role**: Dựa trên role của user
4. **Redirect phù hợp**:
   - `ADMIN` → `/admin-dashboard`
   - `STAFF` → `/staff-dashboard`
   - `RESIDENT` → `/resident-dashboard`
   - Không có role → `/admin-dashboard` (fallback)
   - Không có token → Hiển thị nội dung trang chủ

### **Flow hoạt động:**
```
User truy cập http://localhost:3000/
    ↓
AuthRedirectGuard kiểm tra token
    ↓
Có token? → Lấy user info → Kiểm tra role → Redirect đến dashboard phù hợp
    ↓
Không có token? → Hiển thị nội dung trang chủ (login form)
```

## 🚀 Kết quả

### **Trước đây:**
- ❌ Admin truy cập `/` → Hiển thị trang chủ với nội dung admin
- ❌ Staff/Resident truy cập `/` → Hiển thị trang chủ với nội dung admin (không phù hợp)
- ❌ Không có logic redirect dựa trên role

### **Bây giờ:**
- ✅ Admin truy cập `/` → Redirect đến `/admin-dashboard`
- ✅ Staff truy cập `/` → Redirect đến `/staff-dashboard`
- ✅ Resident truy cập `/` → Redirect đến `/resident-dashboard`
- ✅ Không có token → Hiển thị trang login
- ✅ Hiển thị loading spinner trong quá trình redirect

## 🔍 Test Cases

### **Test Case 1: Admin user**
1. Đăng nhập với tài khoản admin
2. Truy cập `http://localhost:3000/`
3. **Kết quả**: Redirect đến `http://localhost:3000/admin-dashboard`

### **Test Case 2: Staff user**
1. Đăng nhập với tài khoản staff
2. Truy cập `http://localhost:3000/`
3. **Kết quả**: Redirect đến `http://localhost:3000/staff-dashboard`

### **Test Case 3: Resident user**
1. Đăng nhập với tài khoản resident
2. Truy cập `http://localhost:3000/`
3. **Kết quả**: Redirect đến `http://localhost:3000/resident-dashboard`

### **Test Case 4: Không có token**
1. Logout hoặc xóa token
2. Truy cập `http://localhost:3000/`
3. **Kết quả**: Hiển thị trang login

## 📝 Lưu ý quan trọng

1. **AuthRedirectGuard**: Chỉ redirect khi có token, không redirect khi không có token
2. **Fallback**: Nếu không xác định được role, mặc định redirect đến admin dashboard
3. **Loading state**: Hiển thị spinner trong quá trình redirect để UX tốt hơn
4. **Không ảnh hưởng**: Các trang dashboard riêng biệt vẫn hoạt động bình thường

## 🎉 Kết luận

Bây giờ khi user đã đăng nhập truy cập `http://localhost:3000/`, hệ thống sẽ tự động redirect đến dashboard phù hợp với role của họ, đảm bảo trải nghiệm người dùng tốt nhất!
