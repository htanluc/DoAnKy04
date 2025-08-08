# Hệ Thống Quản Lý Cư Dân (Resident Management System)

## Tổng quan

Hệ thống quản lý cư dân được xây dựng dựa trên API documentation đã cung cấp, bao gồm các chức năng CRUD đầy đủ cho việc quản lý thông tin cư dân và liên kết với căn hộ.

## API Endpoints

### Base URL: `/api/admin/residents`

1. **Lấy danh sách tất cả cư dân**
   ```
   GET /api/admin/residents
   ```

2. **Lấy thông tin cư dân theo ID**
   ```
   GET /api/admin/residents/{id}
   ```

3. **Tạo cư dân mới**
   ```
   POST /api/admin/residents
   ```

4. **Cập nhật thông tin cư dân**
   ```
   PUT /api/admin/residents/{id}
   ```

5. **Xóa cư dân**
   ```
   DELETE /api/admin/residents/{id}
   ```

6. **Lấy liên kết căn hộ-cư dân**
   ```
   GET /api/apartment-residents
   ```

## Cấu trúc dữ liệu

### Resident Interface
```typescript
interface Resident {
  id: number;
  fullName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  identityNumber: string;
  address: string;
  status: 'ACTIVE' | 'INACTIVE';
}
```

### ApartmentResident Interface
```typescript
interface ApartmentResident {
  apartmentId: number;
  residentId: number;
  relationType: string;
  moveInDate: string;
  moveOutDate?: string | null;
}
```

## Cấu trúc Frontend

### 1. Hook: `hooks/use-residents.ts`
- Quản lý tất cả các API calls liên quan đến cư dân
- Xử lý loading states, error handling, và success messages
- Cung cấp các functions:
  - `getAllResidents()`: Lấy danh sách tất cả cư dân
  - `getResidentById(id)`: Lấy thông tin cư dân theo ID
  - `createResident(data)`: Tạo cư dân mới
  - `updateResident(id, data)`: Cập nhật thông tin cư dân
  - `deleteResident(id)`: Xóa cư dân
  - `getApartmentsByResidentId(id)`: Lấy danh sách căn hộ theo cư dân

### 2. Trang danh sách: `app/admin-dashboard/residents/page.tsx`
- Hiển thị danh sách tất cả cư dân
- Tính năng tìm kiếm theo tên, CMND/CCCD, email, địa chỉ
- Lọc theo trạng thái (ACTIVE/INACTIVE)
- Các thao tác: Xem chi tiết, Chỉnh sửa, Xóa

### 3. Trang chi tiết: `app/admin-dashboard/residents/[id]/page.tsx`
- Hiển thị thông tin chi tiết của cư dân
- Hiển thị danh sách căn hộ mà cư dân đã liên kết
- Thông tin loại quan hệ, ngày vào ở, ngày rời đi

### 4. Trang tạo mới: `app/admin-dashboard/residents/create/page.tsx`
- Form tạo cư dân mới
- Validation đầy đủ cho tất cả các trường
- Xử lý success/error states

## Tính năng chính

### 1. Quản lý thông tin cư dân
- ✅ Hiển thị danh sách cư dân với phân trang
- ✅ Tìm kiếm đa tiêu chí (tên, CMND, email, địa chỉ)
- ✅ Lọc theo trạng thái
- ✅ Tạo cư dân mới với validation
- ✅ Xem chi tiết thông tin cư dân
- ✅ Chỉnh sửa thông tin cư dân
- ✅ Xóa cư dân (có confirm)

### 2. Liên kết căn hộ
- ✅ Hiển thị danh sách căn hộ mà cư dân đã liên kết
- ✅ Thông tin loại quan hệ (Chủ sở hữu, Người thuê, Thành viên gia đình)
- ✅ Ngày vào ở và ngày rời đi
- ✅ Trạng thái hiện tại (Đang sinh sống/Đã rời đi)

### 3. Validation & Error Handling
- ✅ Validation form đầy đủ
- ✅ Xử lý lỗi API
- ✅ Loading states
- ✅ Success messages
- ✅ Responsive design

## Cách sử dụng

### 1. Xem danh sách cư dân
- Truy cập `/admin-dashboard/residents`
- Sử dụng ô tìm kiếm để tìm cư dân
- Sử dụng dropdown để lọc theo trạng thái

### 2. Tạo cư dân mới
- Click nút "Tạo mới" trên trang danh sách
- Điền đầy đủ thông tin trong form
- Click "Tạo cư dân" để hoàn tất

### 3. Xem chi tiết cư dân
- Click icon "👁" trên hàng cư dân trong danh sách
- Xem thông tin cá nhân và danh sách căn hộ đã liên kết

### 4. Chỉnh sửa cư dân
- Click icon "✏️" trên hàng cư dân trong danh sách
- Hoặc click nút "Chỉnh sửa" trên trang chi tiết

### 5. Xóa cư dân
- Click icon "🗑️" trên hàng cư dân trong danh sách
- Xác nhận trong dialog popup

## Response Examples

### Successful Response
```json
{
  "id": 1,
  "fullName": "Nguyễn Văn A",
  "phoneNumber": "0901234567",
  "email": "vana@example.com",
  "dateOfBirth": "1990-01-01",
  "gender": "MALE",
  "identityNumber": "123456789",
  "address": "Căn hộ 101, Tòa A",
  "status": "ACTIVE"
}
```

### Apartment Relations Response
```json
[
  {
    "apartmentId": 1,
    "residentId": 1,
    "relationType": "Chủ sở hữu",
    "moveInDate": "2024-01-01",
    "moveOutDate": null
  },
  {
    "apartmentId": 2,
    "residentId": 1,
    "relationType": "Người thuê",
    "moveInDate": "2024-03-01",
    "moveOutDate": "2024-06-01"
  }
]
```

## Error Handling

### Common Error Codes
- **400**: Dữ liệu không hợp lệ
- **404**: Không tìm thấy cư dân
- **409**: Số CMND/CCCD hoặc email đã tồn tại
- **500**: Lỗi server

### Error Display
- Errors được hiển thị trong Alert components
- Validation errors được hiển thị dưới từng field
- Success messages có auto-dismiss sau 2 giây

## Lưu ý kỹ thuật

1. **Responsive Design**: Tất cả components đều responsive
2. **Loading States**: Hiển thị loading spinner khi đang xử lý
3. **Type Safety**: Sử dụng TypeScript interfaces đầy đủ
4. **Error Boundaries**: Xử lý lỗi ở mọi level
5. **Performance**: Lazy loading và efficient re-renders

## Tương lai

### Planned Features
- [ ] Import/Export cư dân từ Excel
- [ ] Gửi email thông báo cho cư dân
- [ ] Lịch sử thay đổi thông tin
- [ ] Báo cáo thống kê cư dân
- [ ] Tích hợp với hệ thống căn hộ advanced

### API Extensions
- [ ] Bulk operations
- [ ] Advanced filtering
- [ ] Sorting options
- [ ] Pagination metadata