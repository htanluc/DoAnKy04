# Tính năng Ẩn/Hiển thị Tiện ích (Facility Visibility)

## Tổng quan
Tính năng này cho phép admin ẩn hoặc hiển thị các tiện ích trong hệ thống. Tiện ích bị ẩn sẽ không hiển thị cho cư dân khi họ xem danh sách tiện ích.

## Các thay đổi đã thực hiện

### Backend (Spring Boot)

#### 1. Cập nhật Entity Facility
- Thêm trường `isVisible` (Boolean) vào entity `Facility`
- Mặc định giá trị là `true` (hiển thị)

#### 2. Cập nhật DTOs
- `FacilityDto`: Thêm trường `isVisible`
- `FacilityCreateRequest`: Thêm trường `isVisible` (optional, default true)
- `FacilityUpdateRequest`: Thêm trường `isVisible` (optional)

#### 3. Cập nhật Repository
- Thêm method `findByIsVisibleTrue()` để lấy chỉ các tiện ích hiển thị

#### 4. Cập nhật Service
- Thêm method `getVisibleFacilities()` để lấy tiện ích hiển thị cho cư dân
- Thêm method `toggleFacilityVisibility()` để bật/tắt hiển thị
- Cập nhật logic create và update để xử lý trường `isVisible`

#### 5. Cập nhật Controller
- Endpoint `/api/facilities` (cho cư dân) chỉ trả về tiện ích hiển thị
- Thêm endpoint `/api/admin/facilities/{id}/toggle-visibility` để toggle visibility

#### 6. Database Migration
- Script SQL để thêm cột `is_visible` vào bảng `facilities`
- Cập nhật tất cả tiện ích hiện tại thành hiển thị

### Frontend (React/Next.js)

#### 1. Cập nhật API Interface
- Thêm trường `isVisible` vào interface `Facility`
- Thêm trường `isVisible` vào `FacilityCreateRequest` và `FacilityUpdateRequest`

#### 2. Cập nhật API Client
- Thêm method `toggleVisibility()` vào `facilitiesApi`

#### 3. Cập nhật Hook
- Thêm method `toggleFacilityVisibility()` vào `useFacilities` hook

#### 4. Cập nhật UI
- Thêm cột "Trạng thái" vào bảng facilities trong admin dashboard
- Hiển thị badge với icon Eye/EyeOff để thể hiện trạng thái
- Thêm nút toggle visibility trong dropdown menu
- Thêm trang test để kiểm tra chức năng

## Cách sử dụng

### 1. Chạy Migration Database
```sql
-- Chạy script này trong database
ALTER TABLE facilities ADD COLUMN is_visible BOOLEAN DEFAULT TRUE COMMENT 'Trạng thái hiển thị tiện ích';
UPDATE facilities SET is_visible = TRUE WHERE is_visible IS NULL;
```

### 2. Khởi động Backend
```bash
cd apartment-portal-BE
./gradlew bootRun
```

### 3. Khởi động Frontend
```bash
cd apartment-portal-Fe
npm run dev
```

### 4. Sử dụng tính năng

#### Trong Admin Dashboard:
1. Vào trang `/admin-dashboard/facilities`
2. Trong bảng tiện ích, cột "Trạng thái" sẽ hiển thị:
   - 🟢 "Hiển thị" với icon Eye cho tiện ích đang hiển thị
   - ⚫ "Ẩn" với icon EyeOff cho tiện ích đang ẩn
3. Click vào nút "..." (More) trong cột "Thao tác"
4. Chọn "Ẩn" hoặc "Hiện" để toggle trạng thái

#### Test tính năng:
1. Vào trang `/test-facility-visibility`
2. Xem danh sách tiện ích và trạng thái hiển thị
3. Click nút "Ẩn"/"Hiện" để test toggle

### 5. API Endpoints

#### Lấy tiện ích hiển thị (cho cư dân):
```
GET /api/facilities
```

#### Lấy tất cả tiện ích (cho admin):
```
GET /api/admin/facilities
```

#### Toggle visibility:
```
PUT /api/admin/facilities/{id}/toggle-visibility
```

#### Tạo tiện ích với visibility:
```json
POST /api/admin/facilities
{
  "name": "Phòng Gym",
  "description": "Phòng tập thể dục",
  "location": "Tầng 1",
  "capacity": 20,
  "usageFee": 0,
  "isVisible": true
}
```

## Lưu ý

1. **Bảo mật**: Chỉ admin mới có thể thay đổi trạng thái hiển thị
2. **Mặc định**: Tiện ích mới tạo sẽ có `isVisible = true`
3. **Cư dân**: Chỉ thấy tiện ích có `isVisible = true`
4. **Admin**: Thấy tất cả tiện ích và có thể thay đổi trạng thái

## Troubleshooting

### Lỗi thường gặp:

1. **"Property 'isVisible' does not exist"**
   - Kiểm tra đã chạy migration SQL chưa
   - Restart backend sau khi chạy migration

2. **"Method findByIsVisibleTrue() is undefined"**
   - Kiểm tra đã thêm method vào FacilityRepository chưa
   - Restart backend

3. **Frontend không hiển thị trạng thái**
   - Kiểm tra đã cập nhật interface Facility chưa
   - Restart frontend

### Kiểm tra trạng thái:
```sql
-- Kiểm tra cột is_visible đã được thêm chưa
DESCRIBE facilities;

-- Kiểm tra dữ liệu
SELECT id, name, is_visible FROM facilities LIMIT 5;
```
