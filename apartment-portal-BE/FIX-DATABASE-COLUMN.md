# Sửa lỗi cột opening_schedule

## Vấn đề
Cột `opening_schedule` trong bảng `facilities` vẫn là `JSON` thay vì `LONGTEXT`, gây ra lỗi "Data truncation: Data too long for column".

## Giải pháp

### Bước 1: Kết nối MySQL
```bash
mysql -u root -p
```

### Bước 2: Chọn database
```sql
USE apartment_portal;
```

### Bước 3: Kiểm tra cột hiện tại
```sql
DESCRIBE facilities;
```

### Bước 4: Cập nhật cột thành LONGTEXT
```sql
ALTER TABLE facilities MODIFY COLUMN opening_schedule LONGTEXT NULL COMMENT 'Lịch mở cửa theo tuần';
```

### Bước 5: Xác nhận thay đổi
```sql
DESCRIBE facilities;
```

### Bước 6: Khởi động lại backend
```bash
./gradlew bootRun
```

## Hoặc chạy file SQL
```bash
mysql -u root -p < fix-opening-schedule-column.sql
```

## Sau khi sửa xong
1. Backend sẽ chạy thành công
2. Có thể tạo/sửa tiện ích với lịch mở cửa theo tuần
3. Frontend sẽ hiển thị đúng giờ mở cửa
