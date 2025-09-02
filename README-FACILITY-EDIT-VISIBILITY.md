# Tính năng Chỉnh sửa Trạng thái Ẩn/Hiện trong Edit Facility

## Tổng quan
Trang edit facility đã được cập nhật để cho phép admin chỉnh sửa trạng thái ẩn/hiện của tiện ích trực tiếp từ form chỉnh sửa.

## Các thay đổi đã thực hiện

### 1. Thêm trường isVisible vào form
- Thêm trường `isVisible` vào `formData` state
- Cập nhật `fetchFacility()` để load giá trị `isVisible` từ API
- Thêm validation cho trường mới

### 2. Thêm UI cho trạng thái hiển thị
- Sử dụng radio buttons thay vì checkbox để rõ ràng hơn
- Icon Eye (👁️) cho trạng thái "Hiển thị"
- Icon EyeOff (👁️‍🗨️) cho trạng thái "Ẩn"
- Mô tả chi tiết về ý nghĩa của từng trạng thái

### 3. Cập nhật các trường khác
- Thêm trường `location` (Vị trí)
- Thêm trường `openingHours` (Giờ mở cửa)
- Cải thiện validation và type safety

### 4. Thêm nút xóa tiện ích
- Thay thế dấu "..." bằng nút xóa rõ ràng
- Nút xóa có icon Trash2 và màu đỏ (destructive)
- Có confirm dialog trước khi xóa
- Sau khi xóa thành công sẽ chuyển về trang danh sách

### 5. Cải thiện cột "Thao tác" trong danh sách
- Thay thế dropdown menu "..." bằng 3 nút riêng biệt:
  - **Xem** (👁️): Màu xanh dương, chuyển đến trang chi tiết
  - **Edit** (✏️): Màu xanh lá, chuyển đến trang chỉnh sửa
  - **Toggle Visibility** (👁️‍🗨️): Màu xanh dương, ẩn/hiện tiện ích
  - **Xóa** (🗑️): Màu đỏ, xóa tiện ích
- Thay thế dropdown export bằng 2 nút riêng: "Xuất CSV" và "Xuất Excel"

## Cách sử dụng

### 1. Truy cập trang edit
```
/admin-dashboard/facilities/edit/{id}
```

### 2. Chỉnh sửa trạng thái hiển thị
1. Trong form, tìm phần "Trạng thái hiển thị"
2. Chọn một trong hai option:
   - **Hiển thị** (👁️): Tiện ích sẽ hiển thị cho cư dân
   - **Ẩn** (👁️‍🗨️): Tiện ích sẽ bị ẩn khỏi danh sách cư dân

### 3. Lưu thay đổi
- Click nút "Lưu" để cập nhật
- Hệ thống sẽ gửi request update với trường `isVisible` mới

### 4. Xóa tiện ích (nếu cần)
- Click nút "Xóa" (màu đỏ) ở bên trái
- Xác nhận trong dialog hiện ra
- Hệ thống sẽ xóa tiện ích và chuyển về trang danh sách

## Cấu trúc form mới

```typescript
interface FacilityUpdateRequest {
  name?: string;
  description?: string;
  location?: string;
  capacity?: number;
  otherDetails?: string;
  usageFee?: number;
  openingHours?: string;
  isVisible?: boolean; // Trường mới
}
```

## Các trường trong form

1. **Tên tiện ích** * (bắt buộc)
2. **Mô tả** * (bắt buộc)
3. **Vị trí** (tùy chọn)
4. **Sức chứa** * (bắt buộc)
5. **Giờ mở cửa** (tùy chọn)
6. **Chi tiết khác** (tùy chọn)
7. **Phí sử dụng** (tùy chọn)
8. **Trạng thái hiển thị** (tùy chọn)

## Lưu ý

1. **Bảo mật**: Chỉ admin mới có thể chỉnh sửa trạng thái hiển thị
2. **Mặc định**: Tiện ích mới tạo sẽ có `isVisible = true`
3. **Cư dân**: Chỉ thấy tiện ích có `isVisible = true`
4. **Admin**: Thấy tất cả tiện ích và có thể thay đổi trạng thái

## API Endpoint

```
PUT /api/admin/facilities/{id}
```

### Request Body
```json
{
  "name": "Phòng Gym",
  "description": "Phòng tập thể dục",
  "location": "Tầng 1",
  "capacity": 20,
  "openingHours": "06:00-22:00",
  "otherDetails": "Cần mang giày thể thao",
  "usageFee": 0,
  "isVisible": true
}
```

## Ví dụ sử dụng

### Ẩn tiện ích tạm thời
1. Vào edit facility
2. Chọn "Ẩn" trong trạng thái hiển thị
3. Lưu thay đổi
4. Tiện ích sẽ bị ẩn khỏi danh sách cư dân

### Hiển thị lại tiện ích
1. Vào edit facility
2. Chọn "Hiển thị" trong trạng thái hiển thị
3. Lưu thay đổi
4. Tiện ích sẽ hiển thị lại cho cư dân

## Troubleshooting

### Lỗi thường gặp:

1. **"Property 'isVisible' does not exist"**
   - Kiểm tra đã cập nhật interface `FacilityUpdateRequest` chưa
   - Restart frontend

2. **Form không lưu được trạng thái**
   - Kiểm tra API endpoint có xử lý trường `isVisible` chưa
   - Kiểm tra backend validation

3. **UI không hiển thị đúng trạng thái**
   - Kiểm tra đã load đúng giá trị từ API chưa
   - Kiểm tra radio button binding

### Kiểm tra trạng thái:
```sql
-- Kiểm tra dữ liệu trong database
SELECT id, name, is_visible FROM facilities WHERE id = {facility_id};
```

## Kết luận

Tính năng này giúp admin dễ dàng quản lý trạng thái hiển thị của tiện ích trực tiếp từ form chỉnh sửa, không cần phải vào dropdown menu trong danh sách. Ngoài ra, việc thay thế tất cả dropdown menu "..." bằng các nút riêng biệt làm cho giao diện trở nên trực quan và dễ sử dụng hơn. Admin có thể thực hiện tất cả các thao tác cần thiết (xem, sửa, ẩn/hiện, xóa) một cách nhanh chóng và trực quan. Điều này làm cho quy trình quản lý tiện ích trở nên thuận tiện và hiệu quả hơn.
