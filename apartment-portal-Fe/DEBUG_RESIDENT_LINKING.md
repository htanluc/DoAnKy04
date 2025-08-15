# 🔍 Debug Resident Linking Issue

## Vấn đề hiện tại
Khi gán cư dân vào căn hộ tại trang `http://localhost:3000/admin-dashboard/apartments/4`, hệ thống vẫn bị lỗi "đá ra" (kicking out).

## Các vấn đề đã được sửa

### 1. Frontend RelationType Mismatch ✅
- **Vấn đề**: Frontend gửi `relationType: "FAMILY"` nhưng backend chỉ chấp nhận `"FAMILY_MEMBER"`
- **Đã sửa**: Cập nhật tất cả frontend components để sử dụng `"FAMILY_MEMBER"`

### 2. Backend Security Configuration ✅
- **Vấn đề**: Endpoint `/api/apartments/**` chỉ cho phép role `RESIDENT`, admin không thể truy cập
- **Đã sửa**: Thay đổi thành `hasAnyRole("ADMIN", "RESIDENT")`

### 3. Backend Service Code ✅
- **Vấn đề**: Có code redundant trong `ApartmentService.linkResidentToApartment()`
- **Đã sửa**: Loại bỏ các setter calls không cần thiết

## Cách Debug

### Bước 1: Kiểm tra Backend Logs
1. Mở terminal chạy backend Spring Boot
2. Thử gán cư dân từ frontend
3. Xem logs để tìm lỗi cụ thể

### Bước 2: Sử dụng Debug HTML File
1. Mở file `debug-resident-linking.html` trong trình duyệt
2. Nhập thông tin cần thiết:
   - Apartment ID: `4`
   - User ID: ID của user muốn gán
   - Relation Type: Chọn loại quan hệ
   - JWT Token: Token admin (nếu cần)

### Bước 3: Test các API Endpoints
1. **Test Apartment Exists**: Kiểm tra căn hộ có tồn tại không
2. **Get All Users**: Lấy danh sách users để chọn
3. **Test Link Resident**: Thử liên kết cư dân
4. **Test With Auth**: Kiểm tra xác thực

### Bước 4: Kiểm tra Console Browser
1. Mở Developer Tools (F12)
2. Chuyển sang tab Console
3. Thử gán cư dân và xem có lỗi gì không

## Các API Endpoints cần kiểm tra

### POST `/api/apartments/{apartmentId}/residents`
- **Purpose**: Liên kết cư dân với căn hộ
- **Required**: `userId`, `relationType`
- **Optional**: `moveInDate`, `moveOutDate`

### GET `/api/apartments/{apartmentId}/residents`
- **Purpose**: Lấy danh sách cư dân của căn hộ
- **Auth**: ADMIN hoặc RESIDENT

### GET `/api/admin/users`
- **Purpose**: Lấy danh sách tất cả users (admin only)
- **Auth**: ADMIN

## Các giá trị RelationType hợp lệ
- `OWNER` - Chủ hộ
- `TENANT` - Người thuê  
- `FAMILY_MEMBER` - Thành viên gia đình
- `GUEST` - Khách
- `MANAGER` - Người quản lý
- `CO_OWNER` - Đồng sở hữu

## Troubleshooting

### Lỗi 401 Unauthorized
- Kiểm tra JWT token có hợp lệ không
- Kiểm tra user có role ADMIN không
- Kiểm tra token có hết hạn không

### Lỗi 400 Bad Request
- Kiểm tra `relationType` có đúng format không
- Kiểm tra `userId` có tồn tại không
- Kiểm tra `apartmentId` có tồn tại không

### Lỗi 500 Internal Server Error
- Kiểm tra backend logs
- Kiểm tra database connection
- Kiểm tra các entity relationships

## Các file đã được sửa

### Frontend
- `app/admin-dashboard/apartments/[id]/page.tsx`
- `components/admin/ApartmentResidentManager.tsx`
- `lib/i18n.ts`
- `app/admin-dashboard/residents/[id]/page.tsx`

### Backend
- `config/SecurityConfiguration.java`
- `services/ApartmentService.java`

## Bước tiếp theo
1. Restart backend server để áp dụng security changes
2. Test lại từ frontend
3. Nếu vẫn lỗi, sử dụng debug HTML file để test trực tiếp API
4. Kiểm tra logs backend để tìm nguyên nhân cụ thể

## Liên hệ hỗ trợ
Nếu vấn đề vẫn tiếp tục, vui lòng cung cấp:
- Backend logs chi tiết
- Frontend console errors
- Response từ debug HTML file
- Các bước để reproduce lỗi
