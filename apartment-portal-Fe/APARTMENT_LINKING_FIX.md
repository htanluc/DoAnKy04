# Khắc phục vấn đề "Bị đá ra" khi gán căn hộ cho cư dân

## Vấn đề đã được khắc phục:

### 1. **Không khớp tên field trong request**
- **Trước:** Frontend gửi `residentId` 
- **Sau:** Frontend gửi `userId` (khớp với backend)

### 2. **RelationType không khớp**
- **Trước:** Frontend gửi `"FAMILY"`
- **Sau:** Frontend gửi `"FAMILY_MEMBER"` (khớp với backend enum)

### 3. **Xử lý lỗi kém**
- **Trước:** Chỉ hiển thị "Có lỗi xảy ra"
- **Sau:** Hiển thị thông báo lỗi chi tiết từ backend

### 4. **Validation thiếu**
- **Trước:** Không kiểm tra dữ liệu đầu vào
- **Sau:** Kiểm tra đầy đủ trước khi gửi request

### 5. **Vấn đề Authentication (MỚI PHÁT HIỆN)**
- **Trước:** Trang `users/[id]` không sử dụng `AdminGuard` → không kiểm tra quyền
- **Trước:** Khi token hết hạn → 401 → bị đá ra trang admin
- **Sau:** Thêm `AdminGuard` + cơ chế refresh token + redirect mượt mà

## Các file đã được sửa:

### Frontend:
1. `components/admin/ApartmentResidentManager.tsx` - Sửa field names và validation
2. `components/admin/ApartmentUserLinkModal.tsx` - Sửa relation types
3. `app/admin-dashboard/users/[id]/page.tsx` - **THÊM AdminGuard + xử lý authentication**
4. `components/auth/admin-guard.tsx` - **Cải thiện xử lý token hết hạn**
5. `lib/api.ts` - **Cải thiện xử lý 401 error**
6. `app/test-apartment-link/page.tsx` - Trang test API mới
7. `app/test-auth/page.tsx` - **Trang test authentication mới**

### Backend:
1. `services/ApartmentService.java` - Cải thiện xử lý lỗi
2. `apis/ApartmentController.java` - Log lỗi và trả về message rõ ràng

## Cách sử dụng:

### 1. **Test API:**
Truy cập `/test-apartment-link` để test trực tiếp API gán căn hộ

### 2. **Test Authentication:**
Truy cập `/test-auth` để kiểm tra token, user roles và test API admin

### 3. **Gán căn hộ:**
```typescript
const response = await fetch(`/api/apartments/${apartmentId}/residents`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({
    userId: 123, // Phải là userId, không phải residentId
    relationType: 'OWNER' // Phải là một trong các giá trị hợp lệ
  }),
});
```

### 4. **Các RelationType hợp lệ:**
- `OWNER` - Chủ hộ
- `TENANT` - Người thuê  
- `FAMILY_MEMBER` - Thành viên gia đình
- `GUEST` - Khách
- `MANAGER` - Người quản lý
- `CO_OWNER` - Đồng sở hữu

## Kiểm tra lỗi:

### 1. **Console Browser:**
Xem log lỗi chi tiết trong Developer Tools

### 2. **Backend Logs:**
Kiểm tra console của Spring Boot để xem lỗi server

### 3. **Network Tab:**
Xem request/response trong Developer Tools > Network

### 4. **Authentication Test:**
Sử dụng `/test-auth` để kiểm tra token và quyền

## Lưu ý quan trọng:

1. **Luôn sử dụng `userId` thay vì `residentId`**
2. **RelationType phải khớp chính xác với enum backend**
3. **Kiểm tra token authentication trước khi gọi API**
4. **Validate dữ liệu đầu vào trước khi gửi request**
5. **Tất cả trang admin phải sử dụng `AdminGuard`**
6. **Có cơ chế refresh token khi token hết hạn**

## Vấn đề Authentication đã khắc phục:

### **Trước:**
- Trang `users/[id]` không có `AdminGuard`
- Khi gọi API gán căn hộ, nếu token hết hạn → 401 → bị đá ra
- Không có cơ chế refresh token
- Redirect về login không mượt mà

### **Sau:**
- Thêm `AdminGuard` cho tất cả trang admin
- Cơ chế refresh token tự động
- Xử lý 401 error mượt mà
- Redirect về login khi cần thiết
- Không bị "đá ra" nữa

## Nếu vẫn gặp lỗi:

1. Kiểm tra console browser và backend logs
2. Sử dụng trang test `/test-apartment-link` và `/test-auth`
3. Kiểm tra database có tồn tại apartment và user không
4. Kiểm tra quyền admin có đủ không
5. Kiểm tra token có hợp lệ không trong `/test-auth`
