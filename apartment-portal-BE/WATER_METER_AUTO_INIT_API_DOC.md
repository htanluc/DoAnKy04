# Water Meter Auto-Initialization API Documentation

## Tổng quan
Hệ thống đã được cải tiến để đảm bảo **mọi căn hộ đều có chỉ số nước mặc định = 0** khi được tạo hoặc khi bắt đầu tháng mới.

## Các tính năng mới

### 1. Tự động khởi tạo chỉ số nước khi tạo căn hộ mới

#### API: `POST /api/apartments`
**Mô tả:** Tạo căn hộ mới với tự động khởi tạo chỉ số nước = 0 cho tháng hiện tại.

**Request:**
```json
{
  "buildingId": 1,
  "floorNumber": 5,
  "unitNumber": "A5-01",
  "area": 75.0,
  "status": "VACANT"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Tạo căn hộ mới thành công! Chỉ số nước đã được khởi tạo = 0.",
  "data": {
    "id": 123,
    "buildingId": 1,
    "floorNumber": 5,
    "unitNumber": "A5-01",
    "area": 75.0,
    "status": "VACANT"
  }
}
```

**Lưu ý:** Sau khi căn hộ được tạo, hệ thống tự động:
- Tạo bản ghi chỉ số nước cho tháng hiện tại
- `previousReading = 0`, `currentReading = 0`, `consumption = 0`

### 2. Khởi tạo chỉ số nước cho tất cả căn hộ

#### API: `POST /api/admin/water-readings/init-all-apartments`
**Mô tả:** Khởi tạo chỉ số nước = 0 cho tất cả căn hộ chưa có dữ liệu tháng hiện tại.

**Response:**
```json
{
  "success": "true",
  "message": "Đã khởi tạo chỉ số nước cho tất cả căn hộ"
}
```

#### API: `POST /api/apartments/admin/init-water-meters`
**Mô tả:** Alternative endpoint có cùng chức năng.

### 3. Tạo template chỉ số nước cho tháng mới

#### API: `POST /api/admin/water-readings/generate-current-month`
**Mô tả:** Tạo template chỉ số nước cho tháng hiện tại (trigger manual scheduler).

**Response:**
```json
{
  "success": "true", 
  "message": "Đã tạo template chỉ số nước cho tháng hiện tại"
}
```

#### API: `POST /api/admin/water-readings/generate?startMonth=2024-12`
**Mô tả:** Tạo chỉ số nước từ tháng được chỉ định đến tháng hiện tại.

**Response:**
```json
{
  "success": "true",
  "message": "Đã tạo chỉ số nước cho tháng 2024-12"
}
```

### 4. Scheduler tự động

**WaterMeterScheduler** đã được kích hoạt:
- **Cron:** `0 0 0 1 * *` (chạy vào 00:00:00 ngày 1 mỗi tháng)
- **Chức năng:** Tự động tạo template chỉ số nước cho tháng mới
- **Log:** Debug logs được in ra để theo dõi

## Kiểm tra dữ liệu

### Kiểm tra chỉ số nước theo tháng
```bash
GET /api/admin/water-readings/by-month?month=2024-12
```

### Kiểm tra chỉ số nước của căn hộ cụ thể
```bash
GET /api/admin/apartments/{apartmentId}/water-readings
```

## Test Script

Sử dụng file `test-apartment-creation-with-water-meter.bat` để test toàn bộ flow:

```bash
./test-apartment-creation-with-water-meter.bat
```

Script sẽ:
1. Tạo căn hộ mới
2. Kiểm tra chỉ số nước được tạo tự động
3. Test các utility endpoints

## Lưu ý quan trọng

1. **Dữ liệu mặc định:** Tất cả chỉ số nước mới được khởi tạo với giá trị 0
2. **Tháng hiện tại:** Hệ thống luôn sử dụng `YearMonth.now()` để xác định tháng hiện tại
3. **Không trùng lặp:** Hệ thống kiểm tra để không tạo trùng chỉ số nước cho cùng apartmentId + month
4. **Scheduler:** Chạy tự động vào đầu mỗi tháng để chuẩn bị template
5. **Error handling:** Tất cả API đều có xử lý lỗi và trả về message rõ ràng

## Tóm tắt quy trình

1. **Tạo căn hộ mới** → Tự động khởi tạo chỉ số nước = 0
2. **Đầu tháng mới** → Scheduler tự động tạo template cho tất cả căn hộ
3. **Căn hộ thiếu dữ liệu** → Dùng utility API để khởi tạo manual
4. **Kiểm tra dữ liệu** → Dùng các API GET để verify

Bây giờ **mọi căn hộ đều đảm bảo có chỉ số nước mặc định = 0** từ khi được tạo!