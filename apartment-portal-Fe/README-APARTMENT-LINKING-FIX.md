# Sửa Logic Hiển Thị Căn Hộ Liên Kết với User

## Vấn đề đã phát hiện

Logic hiển thị căn hộ liên kết với user trong trang admin dashboard có các vấn đề sau:

1. **API endpoint sai**: Frontend đang gọi `/api/admin/apartment-residents/user/${userId}` nhưng backend có endpoint `/api/apartment-residents/user/{userId}` (không có `/admin/`)

2. **Thiếu thông tin building**: DTO `ApartmentResidentDto` không có trường `buildingName`, khiến frontend không thể hiển thị tên tòa nhà

3. **Mapping không đúng**: Frontend đang tìm các trường `unitNumber` và `buildingName` nhưng DTO có `apartmentUnitNumber`

## Các thay đổi đã thực hiện

### 1. Backend - Cập nhật DTO và Mapper

#### `ApartmentResidentDto.java`
- Thêm trường `buildingName` để lưu tên tòa nhà

#### `ApartmentResidentMapper.java`
- Cập nhật mapping để bao gồm thông tin building
- Thêm helper method để xử lý building name

#### `ApartmentResidentService.java`
- Thêm `BuildingRepository` để lấy thông tin building
- Cập nhật method `getApartmentsByUser()` để enrich dữ liệu với thông tin building

### 2. Frontend - Sửa Logic API Call và Hiển thị

#### `apartment-portal-Fe/app/admin-dashboard/users/[id]/page.tsx`
- Sửa API endpoint từ `/api/admin/apartment-residents/user/${userId}` thành `/api/apartment-residents/user/${userId}`
- Thêm fallback logic để gọi API với token admin nếu cần
- Cập nhật hiển thị để sử dụng đúng tên trường từ DTO:
  - `ap.apartmentUnitNumber` thay vì `ap.unitNumber`
  - `ap.buildingName` thay vì `ap.buildingName`
- Cải thiện UI khi không có căn hộ nào được liên kết
- Thêm debug info trong development mode

## Cách hoạt động mới

1. **API Call**: Frontend gọi `/api/apartment-residents/user/{userId}` trước
2. **Fallback**: Nếu không có quyền (401), thử gọi lại với token admin
3. **Data Enrichment**: Backend lấy thông tin apartment và building để tạo DTO hoàn chỉnh
4. **Display**: Frontend hiển thị thông tin căn hộ với tên tòa nhà đầy đủ

## Test

Sử dụng file `test-apartment-linking.html` để test:
- API endpoint `/api/apartment-residents/user/{id}`
- API endpoint `/api/admin/apartment-residents/user/{id}` (nếu có)
- Test với JWT token
- Test database connection

## Kết quả mong đợi

Sau khi áp dụng các thay đổi:
- ✅ Hiển thị đúng căn hộ đã liên kết với user
- ✅ Hiển thị đầy đủ thông tin: mã căn hộ, tên tòa nhà, loại quan hệ
- ✅ Xử lý trường hợp không có căn hộ nào được liên kết
- ✅ Debug info để dễ dàng troubleshoot

## Lưu ý

- Cần restart backend sau khi thay đổi DTO và Service
- Đảm bảo database có dữ liệu trong bảng `apartments`, `buildings`, và `apartment_residents`
- Kiểm tra quyền truy cập API endpoint
